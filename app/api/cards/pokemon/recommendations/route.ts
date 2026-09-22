import {
  NextRequest,
  NextResponse,
} from "next/server";

type TCGdexCardBrief = {
  id: string;
  localId: string | number;
  name: string;
  image?: string;
};

type TCGdexSet = {
  id: string;
  name: string;
  cards: TCGdexCardBrief[];
};

type TCGdexCard = TCGdexCardBrief & {
  rarity?: string;
  illustrator?: string;

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

const MAX_RECOMMENDATIONS = 8;

export async function GET(
  request: NextRequest,
) {
  const searchParams =
    request.nextUrl.searchParams;

  const cardId =
    searchParams.get("cardId")?.trim();

  if (!cardId) {
    return NextResponse.json({
      cards: [],
    });
  }

  try {
    /*
     * Primero obtenemos la carta completa.
     * Necesitamos conocer su set.
     */
    const cardResponse = await fetch(
      `${TCGDEX_API_URL}/cards/${encodeURIComponent(
        cardId,
      )}`,
      {
        next: {
          revalidate: 60 * 60,
        },
      },
    );

    if (!cardResponse.ok) {
      throw new Error(
        `Unable to fetch card ${cardId}`,
      );
    }

    const sourceCard =
      (await cardResponse.json()) as TCGdexCard;

    if (!sourceCard.set?.id) {
      return NextResponse.json({
        cards: [],
      });
    }

    /*
     * Después obtenemos el set completo.
     */
    const setResponse = await fetch(
      `${TCGDEX_API_URL}/sets/${encodeURIComponent(
        sourceCard.set.id,
      )}`,
      {
        next: {
          revalidate: 60 * 60,
        },
      },
    );

    if (!setResponse.ok) {
      throw new Error(
        `Unable to fetch set ${sourceCard.set.id}`,
      );
    }

    const set =
      (await setResponse.json()) as TCGdexSet;

    /*
     * Quitamos:
     * - la propia carta
     * - cartas sin imagen
     *
     * Para el MVP elegimos las primeras
     * cartas válidas del mismo set.
     */
    const candidates = set.cards
      .filter(
        (card) =>
          card.id !== sourceCard.id &&
          Boolean(card.image),
      )
      .slice(0, MAX_RECOMMENDATIONS);

    /*
     * Obtenemos el detalle de las pocas
     * candidatas para mantener BinderCard
     * consistente con el resto de la app.
     */
    const detailedCards =
      await Promise.all(
        candidates.map(async (card) => {
          try {
            const response = await fetch(
              `${TCGDEX_API_URL}/cards/${encodeURIComponent(
                card.id,
              )}`,
              {
                next: {
                  revalidate:
                    60 * 60,
                },
              },
            );

            if (!response.ok) {
              return null;
            }

            return (await response.json()) as TCGdexCard;
          } catch {
            return null;
          }
        }),
      );

    const cards: PokemonCard[] =
      detailedCards
        .filter(
          (
            card,
          ): card is TCGdexCard =>
            Boolean(card?.image),
        )
        .map((card) => ({
          id: card.id,
          game: "pokemon",
          name: card.name,

          number: String(
            card.localId,
          ),

          rarity: card.rarity,

          set: card.set
            ? {
                id: card.set.id,
                name: card.set.name,
              }
            : {
                id: set.id,
                name: set.name,
              },

          images: {
            small: `${card.image}/low.webp`,
            large: `${card.image}/high.webp`,
          },
        }));

    return NextResponse.json({
      cards,
      reason: "same-set",
    });
  } catch (error) {
    console.error(
      "Unable to load Pokémon recommendations:",
      error,
    );

    return NextResponse.json(
      {
        cards: [],
        error:
          "Unable to load recommendations.",
      },
      {
        status: 500,
      },
    );
  }
}