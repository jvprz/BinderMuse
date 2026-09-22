import { NextRequest, NextResponse } from "next/server";

type TCGdexCardBrief = {
  id: string;
  localId: string;
  name: string;
  image?: string;
};

type TCGdexCard = TCGdexCardBrief & {
  rarity?: string;
  set?: {
    id: string;
    name: string;
  };
};

type PokemonCard = {
  id: string;
  game: "pokemon";
  name: string;
  number?: string;
  rarity?: string;
  set?: {
    id: string;
    name: string;
  };
  images: {
    small: string;
    large: string;
  };
};

const TCGDEX_API_URL =
  "https://api.tcgdex.net/v2/en";

const MAX_RESULTS = 24;

export async function GET(request: NextRequest) {
  const searchParams =
    request.nextUrl.searchParams;

  const query =
    searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({
      cards: [],
    });
  }

  try {
    const url = new URL(
      `${TCGDEX_API_URL}/cards`,
    );

    url.searchParams.set("name", query);
    url.searchParams.set(
      "pagination:page",
      "1",
    );
    url.searchParams.set(
      "pagination:itemsPerPage",
      String(MAX_RESULTS),
    );

    const response = await fetch(url, {
      next: {
        revalidate: 60 * 60,
      },
    });

    if (!response.ok) {
      throw new Error(
        `TCGdex responded with status ${response.status}`,
      );
    }

    const cardBriefs =
      (await response.json()) as TCGdexCardBrief[];

    const cardsWithImages =
      cardBriefs
        .filter((card) => card.image)
        .slice(0, MAX_RESULTS);

    const detailedCards =
      await Promise.all(
        cardsWithImages.map(
          async (cardBrief) => {
            try {
              const cardResponse =
                await fetch(
                  `${TCGDEX_API_URL}/cards/${encodeURIComponent(
                    cardBrief.id,
                  )}`,
                  {
                    next: {
                      revalidate: 60 * 60,
                    },
                  },
                );

              if (!cardResponse.ok) {
                return cardBrief;
              }

              return (await cardResponse.json()) as TCGdexCard;
            } catch {
              return cardBrief;
            }
          },
        ),
      );

    const cards: PokemonCard[] =
      detailedCards
        .filter(
          (
            card,
          ): card is TCGdexCard &
            Required<
              Pick<TCGdexCard, "image">
            > => Boolean(card.image),
        )
        .map((card) => ({
          id: card.id,
          game: "pokemon",
          name: card.name,
          number: String(card.localId),

          rarity: card.rarity,

          set: card.set
            ? {
                id: card.set.id,
                name: card.set.name,
              }
            : undefined,

          images: {
            small: `${card.image}/low.webp`,
            large: `${card.image}/high.webp`,
          },
        }));

    return NextResponse.json({
      cards,
    });
  } catch (error) {
    console.error(
      "Unable to fetch Pokémon cards:",
      error,
    );

    return NextResponse.json(
      {
        cards: [],
        error:
          "Unable to fetch Pokémon cards.",
      },
      {
        status: 500,
      },
    );
  }
}