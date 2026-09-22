"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  BinderCard,
  BinderLayout,
  BinderPocket,
} from "@/types/binder";

type BinderCanvasProps = {
  layout: BinderLayout;
  pageColor: string;
  pockets: BinderPocket[];

  selectedCard: BinderCard | null;
  selectedPocketId: string | null;
  focusedCard: BinderCard | null;

  onPocketClick: (
    pocketId: string,
  ) => void;

  onCardDrop: (
    card: BinderCard,
    pocketId: string,
  ) => void;

  onPocketMove: (
    sourcePocketId: string,
    targetPocketId: string,
  ) => void;

  onDuplicateCard: (
    pocketId: string,
  ) => void;

  onRemoveCard: (
    pocketId: string,
  ) => void;

  onClearSelectedCard: () => void;
};

const CARD_DRAG_TYPE =
  "application/x-bindermuse-card";

const POCKET_DRAG_TYPE =
  "application/x-bindermuse-pocket";

export default function BinderCanvas({
  layout,
  pageColor,
  pockets,
  selectedCard,
  selectedPocketId,
  focusedCard,
  onPocketClick,
  onCardDrop,
  onPocketMove,
  onDuplicateCard,
  onRemoveCard,
  onClearSelectedCard,
}: BinderCanvasProps) {
  const [
    dragOverPocketId,
    setDragOverPocketId,
  ] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClearSelectedCard();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onClearSelectedCard]);

  const hasEmptyPocket =
    pockets.some(
      (pocket) =>
        pocket.content === null,
    );

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>,
    pocketId: string,
  ) {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      event.dataTransfer.types.includes(
        POCKET_DRAG_TYPE,
      )
        ? "move"
        : "copy";

    setDragOverPocketId(pocketId);
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
    targetPocketId: string,
  ) {
    event.preventDefault();

    setDragOverPocketId(null);

    const sourcePocketId =
      event.dataTransfer.getData(
        POCKET_DRAG_TYPE,
      );

    if (sourcePocketId) {
      onPocketMove(
        sourcePocketId,
        targetPocketId,
      );

      return;
    }

    const cardData =
      event.dataTransfer.getData(
        CARD_DRAG_TYPE,
      );

    if (!cardData) {
      return;
    }

    try {
      const card = JSON.parse(
        cardData,
      ) as BinderCard;

      onCardDrop(
        card,
        targetPocketId,
      );
    } catch {
      return;
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-104px)] min-w-0 items-center justify-center rounded-[28px] border border-[var(--border)] bg-[var(--workspace)] p-5 sm:p-8 xl:p-10">
      <div className="w-full max-w-[720px]">
        <div
          className="rounded-[32px] border border-black/[0.08] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.14)] transition-colors duration-300 sm:p-6"
          style={{
            backgroundColor:
              pageColor,
          }}
        >
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
            }}
          >
            {pockets.map(
              (pocket) => {
                const selected =
                  selectedPocketId ===
                  pocket.id;

                const dragOver =
                  dragOverPocketId ===
                  pocket.id;

                const card =
                  pocket.content
                    ?.type === "card"
                    ? pocket.content
                        .card
                    : null;

                const availableForClick =
                  Boolean(
                    selectedCard,
                  ) && !card;

                return (
                  <div
                    key={pocket.id}
                    onDragOver={(
                      event,
                    ) =>
                      handleDragOver(
                        event,
                        pocket.id,
                      )
                    }
                    onDragEnter={() =>
                      setDragOverPocketId(
                        pocket.id,
                      )
                    }
                    onDragLeave={(
                      event,
                    ) => {
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node,
                        )
                      ) {
                        setDragOverPocketId(
                          null,
                        );
                      }
                    }}
                    onDrop={(
                      event,
                    ) =>
                      handleDrop(
                        event,
                        pocket.id,
                      )
                    }
                    className={`relative aspect-[63/88] rounded-[15px] transition duration-150 ${
                      dragOver
                        ? "scale-[1.025]"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      draggable={Boolean(
                        card,
                      )}
                      onDragStart={(
                        event,
                      ) => {
                        if (!card) {
                          event.preventDefault();
                          return;
                        }

                        event.dataTransfer.effectAllowed =
                          "move";

                        event.dataTransfer.setData(
                          POCKET_DRAG_TYPE,
                          pocket.id,
                        );
                      }}
                      onDragEnd={() =>
                        setDragOverPocketId(
                          null,
                        )
                      }
                      onClick={() =>
                        onPocketClick(
                          pocket.id,
                        )
                      }
                      className={`group relative h-full w-full overflow-hidden rounded-[14px] transition duration-200 ease-out ${
                        card
                          ? "cursor-grab bg-black shadow-[0_3px_12px_rgba(0,0,0,0.16)] active:cursor-grabbing"
                          : "border border-dashed bg-[#f7f7f8]"
                      } ${
                        availableForClick
                          ? "border-[#0071e3]/35 hover:border-[#0071e3]/70 hover:bg-white"
                          : !card
                            ? "border-black/15 hover:border-black/25"
                            : ""
                      } ${
                        selected
                          ? "ring-2 ring-[#0071e3] ring-offset-2"
                          : ""
                      } ${
                        dragOver
                          ? "ring-2 ring-[#0071e3] ring-offset-2 shadow-[0_12px_32px_rgba(0,113,227,0.22)]"
                          : ""
                      }`}
                    >
                      {card ? (
                        <>
                          <img
                            src={
                              card
                                .images
                                .large
                            }
                            alt={
                              card.name
                            }
                            draggable={
                              false
                            }
                            className="h-full w-full object-cover"
                          />

                          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

                          <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-200 group-hover:bg-black/[0.05]" />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xl font-light transition duration-200 ${
                              dragOver
                                ? "scale-110 bg-[#0071e3] text-white shadow-md"
                                : availableForClick
                                  ? "bg-[#0071e3]/10 text-[#0071e3] group-hover:scale-105 group-hover:bg-[#0071e3]/15"
                                  : "bg-black/[0.04] text-black/25 group-hover:bg-black/[0.07]"
                            }`}
                          >
                            +
                          </span>
                        </div>
                      )}

                      {dragOver &&
                        card && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0071e3]/15 backdrop-blur-[1px]">
                            <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0071e3] shadow-lg">
                              Drop here
                            </span>
                          </div>
                        )}
                    </button>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div className="mt-5 flex min-h-[72px] items-center justify-center">
          {focusedCard &&
          selectedPocketId ? (
            <FocusedCardToolbar
              card={focusedCard}
              canDuplicate={
                hasEmptyPocket
              }
              onDuplicate={() =>
                onDuplicateCard(
                  selectedPocketId,
                )
              }
              onRemove={() =>
                onRemoveCard(
                  selectedPocketId,
                )
              }
            />
          ) : selectedCard ? (
            <button
              type="button"
              onClick={
                onClearSelectedCard
              }
              className="group flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-2 pr-3 text-xs text-[var(--text-secondary)] shadow-sm transition hover:border-[var(--border-strong)]"
            >
              <img
                src={
                  selectedCard.images
                    .small
                }
                alt=""
                className="h-7 w-5 rounded-[4px] object-cover"
              />

              <span>
                <strong className="font-medium text-[var(--text-primary)]">
                  {selectedCard.name}
                </strong>{" "}
                selected
              </span>

              <span className="ml-1 text-base leading-none text-[var(--text-tertiary)] transition group-hover:text-[var(--text-primary)]">
                ×
              </span>
            </button>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">
              Drag a card onto the
              page
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function FocusedCardToolbar({
  card,
  canDuplicate,
  onDuplicate,
  onRemove,
}: {
  card: BinderCard;
  canDuplicate: boolean;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex max-w-full items-center gap-2 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <div className="flex min-w-0 items-center gap-2 pr-2">
        <img
          src={card.images.small}
          alt=""
          className="h-10 w-7 shrink-0 rounded-[5px] object-cover shadow-sm"
        />

        <div className="min-w-0">
          <p className="max-w-[160px] truncate text-xs font-semibold text-[var(--text-primary)]">
            {card.name}
          </p>

          <p className="mt-0.5 max-w-[160px] truncate text-[11px] text-[var(--text-tertiary)]">
            {card.set?.name ??
              "Selected card"}
          </p>
        </div>
      </div>

      <div className="h-7 w-px shrink-0 bg-[var(--border)]" />

      <button
        type="button"
        onClick={onDuplicate}
        disabled={!canDuplicate}
        className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-35"
        title={
          canDuplicate
            ? "Duplicate"
            : "No empty pockets"
        }
      >
        <DuplicateIcon />
        <span className="hidden xl:inline">
          Duplicate
        </span>
      </button>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-[#ff3b30] transition hover:bg-[#ff3b30]/10"
        title="Remove"
      >
        <TrashIcon />

        <span className="hidden xl:inline">
          Remove
        </span>
      </button>
    </div>
  );
}

function DuplicateIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M16 8V6C16 4.9 15.1 4 14 4H6C4.9 4 4 4.9 4 6V14C4 15.1 4.9 16 6 16H8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7H20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M9 3H15L16 7H8L9 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <path
        d="M7 7L8 20H16L17 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <path
        d="M10 11V16M14 11V16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}