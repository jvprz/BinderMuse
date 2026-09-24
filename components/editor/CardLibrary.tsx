"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  BinderCard,
  TcgGame,
} from "@/types/binder";

type CardLibraryProps = {
  game: TcgGame;

  selectedCard: BinderCard | null;
  focusedCard: BinderCard | null;

  recentCards: BinderCard[];

  onSelectCard: (
    card: BinderCard,
  ) => void;
};

type PokemonSearchResponse = {
  cards: BinderCard[];
  error?: string;
};

type RecommendationsResponse = {
  cards: BinderCard[];
  reason?: string;
  error?: string;
};

export const CARD_DRAG_TYPE =
  "application/x-bindermuse-card";

export default function CardLibrary({
  game,
  selectedCard,
  focusedCard,
  recentCards,
  onSelectCard,
}: CardLibraryProps) {
  const [query, setQuery] =
    useState("");

  const [cards, setCards] =
    useState<BinderCard[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    selectedSet,
    setSelectedSet,
  ] = useState("all");

  const [
    selectedRarity,
    setSelectedRarity,
  ] = useState("all");

  const [
    recommendations,
    setRecommendations,
  ] = useState<BinderCard[]>([]);

  const [
    recommendationsLoading,
    setRecommendationsLoading,
  ] = useState(false);

  /*
   * SEARCH
   */
  useEffect(() => {
    if (game !== "pokemon") {
      return;
    }

    const normalizedQuery =
      query.trim();

    if (
      normalizedQuery.length < 2
    ) {
      return;
    }

    const controller =
      new AbortController();

    const timeout =
      window.setTimeout(
        async () => {
          setLoading(true);
          setError(null);

          try {
            const response =
              await fetch(
                `/api/cards/pokemon?q=${encodeURIComponent(
                  normalizedQuery,
                )}`,
                {
                  signal:
                    controller.signal,
                },
              );

            if (!response.ok) {
              throw new Error(
                "Unable to search cards.",
              );
            }

            const data =
              (await response.json()) as PokemonSearchResponse;

            setCards(data.cards);

            setSelectedSet("all");
            setSelectedRarity(
              "all",
            );
          } catch (
            searchError
          ) {
            if (
              searchError instanceof
                DOMException &&
              searchError.name ===
                "AbortError"
            ) {
              return;
            }

            setCards([]);
            setError(
              "We couldn't load the cards.",
            );
          } finally {
            if (
              !controller.signal
                .aborted
            ) {
              setLoading(false);
            }
          }
        },
        350,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );

      controller.abort();
    };
  }, [game, query]);

  /*
   * RECOMMENDATIONS
   */
  useEffect(() => {
    if (
      game !== "pokemon" ||
      !focusedCard
    ) {
      return;
    }

    const controller =
      new AbortController();

    const timeout =
      window.setTimeout(
        async () => {
          setRecommendationsLoading(
            true,
          );

          try {
            const response =
              await fetch(
                `/api/cards/pokemon/recommendations?cardId=${encodeURIComponent(
                  focusedCard.id,
                )}`,
                {
                  signal:
                    controller.signal,
                },
              );

            if (!response.ok) {
              throw new Error(
                "Unable to load recommendations.",
              );
            }

            const data =
              (await response.json()) as RecommendationsResponse;

            if (
              !controller.signal
                .aborted
            ) {
              setRecommendations(
                data.cards,
              );
            }
          } catch (
            recommendationError
          ) {
            if (
              recommendationError instanceof
                DOMException &&
              recommendationError.name ===
                "AbortError"
            ) {
              return;
            }

            if (
              !controller.signal
                .aborted
            ) {
              setRecommendations(
                [],
              );
            }
          } finally {
            if (
              !controller.signal
                .aborted
            ) {
              setRecommendationsLoading(
                false,
              );
            }
          }
        },
        150,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );

      controller.abort();
    };
  }, [game, focusedCard]);

  const sets = useMemo(() => {
    const uniqueSets = new Map<
      string,
      string
    >();

    for (const card of cards) {
      if (card.set) {
        uniqueSets.set(
          card.set.id,
          card.set.name,
        );
      }
    }

    return Array.from(
      uniqueSets.entries(),
    )
      .map(([id, name]) => ({
        id,
        name,
      }))
      .sort((a, b) =>
        a.name.localeCompare(
          b.name,
        ),
      );
  }, [cards]);

  const rarities =
    useMemo(() => {
      return Array.from(
        new Set(
          cards
            .map(
              (card) =>
                card.rarity,
            )
            .filter(
              (
                rarity,
              ): rarity is string =>
                Boolean(rarity),
            ),
        ),
      ).sort((a, b) =>
        a.localeCompare(b),
      );
    }, [cards]);

  const filteredCards =
    useMemo(() => {
      return cards.filter(
        (card) => {
          const matchesSet =
            selectedSet ===
              "all" ||
            card.set?.id ===
              selectedSet;

          const matchesRarity =
            selectedRarity ===
              "all" ||
            card.rarity ===
              selectedRarity;

          return (
            matchesSet &&
            matchesRarity
          );
        },
      );
    }, [
      cards,
      selectedSet,
      selectedRarity,
    ]);

  const visibleRecentCards =
    useMemo(
      () =>
        recentCards.filter(
          (card) =>
            card.game === game,
        ),
      [game, recentCards],
    );

  const hasFilters =
    selectedSet !== "all" ||
    selectedRarity !== "all";

  function startCardDrag(
    event: React.DragEvent<HTMLElement>,
    card: BinderCard,
  ) {
    event.dataTransfer.effectAllowed =
      "copy";

    event.dataTransfer.setData(
      CARD_DRAG_TYPE,
      JSON.stringify(card),
    );

    event.dataTransfer.setData(
      "text/plain",
      card.id,
    );
  }

  function handleQueryChange(
    value: string,
  ) {
    setQuery(value);

    if (
      value.trim().length < 2
    ) {
      setCards([]);
      setError(null);
      setSelectedSet("all");
      setSelectedRarity("all");
    }
  }

  function clearFilters() {
    setSelectedSet("all");
    setSelectedRarity("all");
  }

  return (
    <aside className="surface h-full min-h-0 min-w-0 overflow-y-auto rounded-[24px] p-4 xl:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Cards
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
          {game === "pokemon"
            ? "Pokémon library"
            : "Cyberpunk library"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Find the perfect cards
          for your page.
        </p>
      </div>

      <div className="relative mt-5">
        <SearchIcon />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            handleQueryChange(
              event.target.value,
            )
          }
          disabled={
            game !== "pokemon"
          }
          placeholder={
            game === "pokemon"
              ? "Search cards"
              : "Coming soon"
          }
          className="h-11 w-full rounded-[14px] border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {game === "pokemon" &&
        cards.length > 0 && (
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              <FilterSelect
                value={selectedSet}
                onChange={
                  setSelectedSet
                }
                label="Set"
                options={sets.map(
                  (set) => ({
                    value: set.id,
                    label: set.name,
                  }),
                )}
              />

              <FilterSelect
                value={
                  selectedRarity
                }
                onChange={
                  setSelectedRarity
                }
                label="Rarity"
                options={rarities.map(
                  (rarity) => ({
                    value: rarity,
                    label: rarity,
                  }),
                )}
              />
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="mt-2 text-xs font-medium text-[#0071e3] transition hover:opacity-70"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

      {focusedCard &&
        game === "pokemon" && (
          <section className="mt-7">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#0071e3]">
                  Suggested
                </p>

                <h3 className="mt-1 truncate text-sm font-semibold tracking-[-0.01em]">
                  For{" "}
                  {
                    focusedCard.name
                  }
                </h3>
              </div>

              {focusedCard.set && (
                <span className="max-w-[120px] truncate text-[11px] text-[var(--text-tertiary)]">
                  {
                    focusedCard.set
                      .name
                  }
                </span>
              )}
            </div>

            {recommendationsLoading ? (
              <RecommendationSkeleton />
            ) : recommendations.length >
              0 ? (
              <>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {recommendations
                    .slice(0, 4)
                    .map((card) => (
                      <button
                        key={
                          card.id
                        }
                        type="button"
                        draggable
                        onDragStart={(
                          event,
                        ) =>
                          startCardDrag(
                            event,
                            card,
                          )
                        }
                        onClick={() =>
                          onSelectCard(
                            card,
                          )
                        }
                        title={
                          card.name
                        }
                        className={`group cursor-grab overflow-hidden rounded-lg transition duration-200 hover:-translate-y-1 hover:shadow-md active:cursor-grabbing ${
                          selectedCard?.id ===
                          card.id
                            ? "ring-2 ring-[#0071e3] ring-offset-2 ring-offset-[var(--surface)]"
                            : ""
                        }`}
                      >
                        <img
                          src={
                            card.images
                              .small
                          }
                          alt={
                            card.name
                          }
                          draggable={
                            false
                          }
                          className="aspect-[63/88] w-full object-cover"
                        />
                      </button>
                    ))}
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />

                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    Same set
                  </span>
                </div>
              </>
            ) : (
              <p className="mt-3 text-xs leading-5 text-[var(--text-tertiary)]">
                No suggestions
                available for this
                card yet.
              </p>
            )}
          </section>
        )}

      {visibleRecentCards.length >
        0 && (
        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-[-0.01em]">
              Recently used
            </h3>

            <span className="text-xs text-[var(--text-tertiary)]">
              {
                visibleRecentCards.length
              }
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {visibleRecentCards.map(
              (card) => (
                <button
                  key={card.id}
                  type="button"
                  draggable
                  onDragStart={(
                    event,
                  ) =>
                    startCardDrag(
                      event,
                      card,
                    )
                  }
                  onClick={() =>
                    onSelectCard(
                      card,
                    )
                  }
                  className={`group cursor-grab overflow-hidden rounded-lg transition duration-200 hover:-translate-y-1 hover:shadow-md active:cursor-grabbing ${
                    selectedCard?.id ===
                    card.id
                      ? "ring-2 ring-[#0071e3] ring-offset-2 ring-offset-[var(--surface)]"
                      : ""
                  }`}
                  title={
                    card.name
                  }
                >
                  <img
                    src={
                      card.images
                        .small
                    }
                    alt={
                      card.name
                    }
                    draggable={
                      false
                    }
                    className="aspect-[63/88] w-full object-cover"
                  />
                </button>
              ),
            )}
          </div>
        </section>
      )}

      <div className="mt-7 border-t border-[var(--border)] pt-5">
        {game ===
          "cyberpunk" && (
          <EmptyState
            title="Cyberpunk is coming next"
            description="The editor is ready for multiple TCGs."
          />
        )}

        {game === "pokemon" &&
          query.trim().length <
            2 && (
            <EmptyState
              title="Find a card"
              description="Search by Pokémon name to start designing."
            />
          )}

        {game === "pokemon" &&
          loading && (
            <CardSkeletonGrid />
          )}

        {game === "pokemon" &&
          !loading &&
          error && (
            <EmptyState
              title="Couldn't load cards"
              description={error}
            />
          )}

        {game === "pokemon" &&
          !loading &&
          !error &&
          query.trim().length >=
            2 &&
          cards.length === 0 && (
            <EmptyState
              title="No cards found"
              description="Try another Pokémon name."
            />
          )}

        {game === "pokemon" &&
          !loading &&
          cards.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-[-0.01em]">
                  Results
                </h3>

                <span className="text-xs text-[var(--text-tertiary)]">
                  {
                    filteredCards.length
                  }
                </span>
              </div>

              {filteredCards.length ===
              0 ? (
                <EmptyState
                  title="No matches"
                  description="Try changing your filters."
                />
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
                  {filteredCards.map(
                    (card) => (
                      <CardItem
                        key={
                          card.id
                        }
                        card={card}
                        selected={
                          selectedCard?.id ===
                          card.id
                        }
                        onClick={() =>
                          onSelectCard(
                            card,
                          )
                        }
                        onDragStart={(
                          event,
                        ) =>
                          startCardDrag(
                            event,
                            card,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </>
          )}
      </div>
    </aside>
  );
}

function CardItem({
  card,
  selected,
  onClick,
  onDragStart,
}: {
  card: BinderCard;
  selected: boolean;
  onClick: () => void;
  onDragStart: (
    event: React.DragEvent<HTMLButtonElement>,
  ) => void;
}) {
  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="group min-w-0 cursor-grab text-left active:cursor-grabbing"
    >
      <div
        className={`relative overflow-hidden rounded-[14px] bg-[var(--workspace)] shadow-sm transition duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.14)] ${
          selected
            ? "ring-2 ring-[#0071e3] ring-offset-2 ring-offset-[var(--surface)]"
            : ""
        }`}
      >
        <img
          src={card.images.small}
          alt={card.name}
          draggable={false}
          loading="lazy"
          className="aspect-[63/88] w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/[0.06]" />

        {selected && (
          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#0071e3] text-white shadow-md">
            <CheckIcon />
          </div>
        )}
      </div>

      <p className="mt-2 truncate text-sm font-medium tracking-[-0.01em]">
        {card.name}
      </p>

      <p className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
        {card.set?.name ??
          (card.number
            ? `#${card.number}`
            : "Pokémon")}
      </p>

      {card.rarity && (
        <p className="mt-0.5 truncate text-[11px] text-[var(--text-tertiary)]">
          {card.rarity}
        </p>
      )}
    </button>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        aria-label={label}
        className="h-9 w-full appearance-none truncate rounded-xl border border-[var(--border)] bg-[var(--background)] pl-3 pr-8 text-xs font-medium text-[var(--text-secondary)] outline-none transition hover:border-[var(--border-strong)] focus:border-[var(--border-strong)]"
      >
        <option value="all">
          {label}
        </option>

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          ),
        )}
      </select>

      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
      >
        <path
          d="M3 4.5L6 7.5L9 4.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--control-hover)] text-[var(--text-tertiary)]">
        <SearchIcon
          staticPosition
        />
      </div>

      <p className="mt-3 text-sm font-medium">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-[220px] text-xs leading-5 text-[var(--text-tertiary)]">
        {description}
      </p>
    </div>
  );
}

function CardSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div key={index}>
          <div className="aspect-[63/88] animate-pulse rounded-xl bg-[var(--control-hover)]" />

          <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-[var(--control-hover)]" />

          <div className="mt-2 h-2.5 w-1/3 animate-pulse rounded-full bg-[var(--control-hover)]" />
        </div>
      ))}
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="mt-3 grid grid-cols-4 gap-2">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="aspect-[63/88] animate-pulse rounded-lg bg-[var(--control-hover)]"
        />
      ))}
    </div>
  );
}

function SearchIcon({
  staticPosition = false,
}: {
  staticPosition?: boolean;
}) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={
        staticPosition
          ? ""
          : "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
      }
    >
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M16.5 16.5L21 21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 7.2L5.6 9.7L11 4.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}