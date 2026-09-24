"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import BinderCanvas from "@/components/editor/BinderCanvas";
import CardLibrary from "@/components/editor/CardLibrary";
import EditorSidebar from "@/components/editor/EditorSidebar";

import { createClient } from "@/lib/supabase/client";

import type {
  BinderCard,
  BinderLayout,
  BinderPocket,
  BinderSpread,
  TcgGame,
} from "@/types/binder";

const layouts: BinderLayout[] = [
  {
    id: "2x2",
    label: "2 × 2",
    columns: 2,
    rows: 2,
  },
  {
    id: "3x3",
    label: "3 × 3",
    columns: 3,
    rows: 3,
  },
  {
    id: "4x3",
    label: "4 × 3",
    columns: 4,
    rows: 3,
  },
];

type SaveStatus =
  | "idle"
  | "unsaved"
  | "saving"
  | "saved"
  | "error";

function getPocketCount(
  layout: BinderLayout,
  spread: BinderSpread,
) {
  return (
    layout.columns *
    layout.rows *
    (spread === "double" ? 2 : 1)
  );
}

function createPockets(
  layout: BinderLayout,
  spread: BinderSpread,
): BinderPocket[] {
  return Array.from(
    {
      length: getPocketCount(
        layout,
        spread,
      ),
    },
    (_, index) => ({
      id: `pocket-${index + 1}`,
      content: null,
    }),
  );
}

function resizePockets(
  currentPockets: BinderPocket[],
  layout: BinderLayout,
  spread: BinderSpread,
): BinderPocket[] {
  const newPocketCount =
    getPocketCount(layout, spread);

  return Array.from(
    {
      length: newPocketCount,
    },
    (_, index) => {
      const existingPocket =
        currentPockets[index];

      if (existingPocket) {
        return {
          ...existingPocket,
          id: `pocket-${index + 1}`,
        };
      }

      return {
        id: `pocket-${index + 1}`,
        content: null,
      };
    },
  );
}

export default function EditorPage() {
  const [game, setGame] =
    useState<TcgGame>("pokemon");

  const [
    selectedLayout,
    setSelectedLayout,
  ] = useState<BinderLayout>(
    layouts[1],
  );

  const [spread, setSpread] =
    useState<BinderSpread>("single");

  const [pageColor, setPageColor] =
    useState("#ffffff");

  const [pockets, setPockets] =
    useState<BinderPocket[]>(() =>
      createPockets(
        layouts[1],
        "single",
      ),
    );

  const [
    selectedCard,
    setSelectedCard,
  ] = useState<BinderCard | null>(
    null,
  );

  const [
    selectedPocketId,
    setSelectedPocketId,
  ] = useState<string | null>(
    null,
  );

  const [
    recentCards,
    setRecentCards,
  ] = useState<BinderCard[]>([]);

  const [
    designId,
    setDesignId,
  ] = useState<string | null>(null);

  const [
    designName,
    setDesignName,
  ] = useState("Untitled design");

  const [
    isPublic,
    setIsPublic,
  ] = useState(false);

  const [
    saveStatus,
    setSaveStatus,
  ] = useState<SaveStatus>("idle");

  const [
    saveError,
    setSaveError,
  ] = useState<string | null>(null);

  const focusedCard = useMemo(() => {
    if (!selectedPocketId) {
      return null;
    }

    const pocket = pockets.find(
      (currentPocket) =>
        currentPocket.id ===
        selectedPocketId,
    );

    if (
      !pocket ||
      pocket.content?.type !== "card"
    ) {
      return null;
    }

    return pocket.content.card;
  }, [pockets, selectedPocketId]);

  const handleClearSelectedCard =
    useCallback(() => {
      setSelectedCard(null);
    }, []);

  function markUnsaved() {
    setSaveStatus("unsaved");
    setSaveError(null);
  }

  function handleDesignNameChange(
    value: string,
  ) {
    setDesignName(value);
    markUnsaved();
  }

  function handleVisibilityChange(
    value: boolean,
  ) {
    if (value === isPublic) {
      return;
    }

    setIsPublic(value);
    markUnsaved();
  }

  function handlePageColorChange(
    color: string,
  ) {
    setPageColor(color);
    markUnsaved();
  }

  function handleGameChange(
    newGame: TcgGame,
  ) {
    if (newGame === game) {
      return;
    }

    setGame(newGame);
    setSelectedCard(null);
    setSelectedPocketId(null);
    setRecentCards([]);

    setPockets(
      createPockets(
        selectedLayout,
        spread,
      ),
    );

    markUnsaved();
  }

  function handleLayoutChange(
    newLayout: BinderLayout,
  ) {
    if (
      newLayout.id ===
      selectedLayout.id
    ) {
      return;
    }

    setSelectedLayout(newLayout);
    setSelectedCard(null);
    setSelectedPocketId(null);

    setPockets((currentPockets) =>
      resizePockets(
        currentPockets,
        newLayout,
        spread,
      ),
    );

    markUnsaved();
  }

  function handleSpreadChange(
    newSpread: BinderSpread,
  ) {
    if (newSpread === spread) {
      return;
    }

    setSpread(newSpread);
    setSelectedCard(null);
    setSelectedPocketId(null);

    setPockets((currentPockets) =>
      resizePockets(
        currentPockets,
        selectedLayout,
        newSpread,
      ),
    );

    markUnsaved();
  }

  function handleSelectCard(
    card: BinderCard,
  ) {
    setSelectedCard(
      (currentCard) =>
        currentCard?.id === card.id
          ? null
          : card,
    );

    setSelectedPocketId(null);
  }

  function handlePocketClick(
    pocketId: string,
  ) {
    const pocket = pockets.find(
      (currentPocket) =>
        currentPocket.id === pocketId,
    );

    if (!pocket) {
      return;
    }

    if (pocket.content) {
      setSelectedPocketId(
        (current) =>
          current === pocketId
            ? null
            : pocketId,
      );

      return;
    }

    if (selectedCard) {
      placeCard(
        selectedCard,
        pocketId,
      );

      return;
    }

    setSelectedPocketId(
      (current) =>
        current === pocketId
          ? null
          : pocketId,
    );
  }

  function handleCardDrop(
    card: BinderCard,
    pocketId: string,
  ) {
    placeCard(card, pocketId);
  }

  function placeCard(
    card: BinderCard,
    pocketId: string,
  ) {
    if (card.game !== game) {
      return;
    }

    setPockets(
      (currentPockets) =>
        currentPockets.map(
          (pocket) => {
            if (
              pocket.id !== pocketId
            ) {
              return pocket;
            }

            return {
              ...pocket,
              content: {
                type: "card",
                card,
              },
            };
          },
        ),
    );

    addRecentCard(card);

    setSelectedCard(card);
    setSelectedPocketId(null);

    markUnsaved();
  }

  function handlePocketMove(
    sourcePocketId: string,
    targetPocketId: string,
  ) {
    if (
      sourcePocketId ===
      targetPocketId
    ) {
      return;
    }

    setPockets(
      (currentPockets) => {
        const sourcePocket =
          currentPockets.find(
            (pocket) =>
              pocket.id ===
              sourcePocketId,
          );

        const targetPocket =
          currentPockets.find(
            (pocket) =>
              pocket.id ===
              targetPocketId,
          );

        if (
          !sourcePocket ||
          !targetPocket ||
          !sourcePocket.content
        ) {
          return currentPockets;
        }

        const sourceContent =
          sourcePocket.content;

        const targetContent =
          targetPocket.content;

        return currentPockets.map(
          (pocket) => {
            if (
              pocket.id ===
              sourcePocketId
            ) {
              return {
                ...pocket,
                content:
                  targetContent,
              };
            }

            if (
              pocket.id ===
              targetPocketId
            ) {
              return {
                ...pocket,
                content:
                  sourceContent,
              };
            }

            return pocket;
          },
        );
      },
    );

    setSelectedCard(null);
    setSelectedPocketId(
      targetPocketId,
    );

    markUnsaved();
  }

  function handleDuplicateCard(
    sourcePocketId: string,
  ) {
    const sourcePocket =
      pockets.find(
        (pocket) =>
          pocket.id ===
          sourcePocketId,
      );

    if (
      !sourcePocket ||
      sourcePocket.content?.type !==
        "card"
    ) {
      return;
    }

    const emptyPocket =
      pockets.find(
        (pocket) =>
          pocket.content === null,
      );

    if (!emptyPocket) {
      return;
    }

    const card =
      sourcePocket.content.card;

    setPockets(
      (currentPockets) =>
        currentPockets.map(
          (pocket) => {
            if (
              pocket.id !==
              emptyPocket.id
            ) {
              return pocket;
            }

            return {
              ...pocket,
              content: {
                type: "card",
                card,
              },
            };
          },
        ),
    );

    addRecentCard(card);

    setSelectedCard(null);
    setSelectedPocketId(
      emptyPocket.id,
    );

    markUnsaved();
  }

  function handleRemoveCard(
    pocketId: string,
  ) {
    setPockets(
      (currentPockets) =>
        currentPockets.map(
          (pocket) => {
            if (
              pocket.id !== pocketId
            ) {
              return pocket;
            }

            return {
              ...pocket,
              content: null,
            };
          },
        ),
    );

    setSelectedPocketId(null);

    markUnsaved();
  }

  function addRecentCard(
    card: BinderCard,
  ) {
    setRecentCards(
      (currentCards) => {
        const withoutCurrentCard =
          currentCards.filter(
            (currentCard) =>
              currentCard.id !==
              card.id,
          );

        return [
          card,
          ...withoutCurrentCard,
        ].slice(0, 4);
      },
    );
  }

  async function handleSave() {
    if (saveStatus === "saving") {
      return;
    }

    const trimmedName =
      designName.trim();

    if (!trimmedName) {
      setSaveStatus("error");
      setSaveError(
        "Give your design a name before saving.",
      );
      return;
    }

    setSaveStatus("saving");
    setSaveError(null);

    const supabase =
      createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaveStatus("error");
      setSaveError(
        "You need to sign in before saving a design.",
      );
      return;
    }

    const now =
      new Date().toISOString();

    const content = pockets.map(
      (pocket) => pocket.content,
    );

    const designData = {
      user_id: user.id,
      name: trimmedName,
      game,
      rows: selectedLayout.rows,
      columns:
        selectedLayout.columns,
      spread,
      page_color: pageColor,
      content,
      is_public: isPublic,
      updated_at: now,
    };

    if (designId) {
      const { error } =
        await supabase
          .from("designs")
          .update(designData)
          .eq("id", designId)
          .eq("user_id", user.id);

      if (error) {
        console.error(
          "Error updating design:",
          error,
        );

        setSaveStatus("error");
        setSaveError(
          "We couldn't save your changes. Please try again.",
        );
        return;
      }

      setDesignName(trimmedName);
      setSaveStatus("saved");
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("designs")
      .insert(designData)
      .select("id")
      .single();

    if (error || !data) {
      console.error(
        "Error creating design:",
        error,
      );

      setSaveStatus("error");
      setSaveError(
        "We couldn't save your design. Please try again.",
      );
      return;
    }

    setDesignId(data.id);
    setDesignName(trimmedName);
    setSaveStatus("saved");
  }

  function getSaveStatusLabel() {
    switch (saveStatus) {
      case "saving":
        return "Saving…";

      case "saved":
        return "Saved";

      case "unsaved":
        return "Unsaved changes";

      case "error":
        return "Save failed";

      default:
        return "Not saved yet";
    }
  }

  return (
    <main className="h-[calc(100dvh-56px)] overflow-hidden bg-[var(--background)]">
      <div className="mx-auto flex h-full max-w-[1800px] flex-col p-3 sm:p-4">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="group relative w-full max-w-[360px]">
            <input
              type="text"
              value={designName}
              onChange={(event) =>
                handleDesignNameChange(
                  event.target.value,
                )
              }
              maxLength={80}
              aria-label="Design name"
              className="w-full truncate rounded-lg border border-transparent bg-transparent py-1.5 pl-2 pr-9 text-sm font-semibold tracking-[-0.01em] text-[var(--text-primary)] outline-none transition hover:bg-[var(--control-hover)] focus:border-[var(--border)] focus:bg-[var(--surface)]"
            />

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)] opacity-60 transition group-hover:opacity-100 group-focus-within:opacity-100"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </svg>
          </div>

            {saveError && (
              <p className="mt-1 px-2 text-xs text-[#ff3b30]">
                {saveError}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div
              className="flex h-9 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
              aria-label="Design visibility"
            >
              <button
                type="button"
                onClick={() =>
                  handleVisibilityChange(
                    false,
                  )
                }
                aria-pressed={!isPublic}
                title="Only you can see this design"
                className={`flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition ${
                  !isPublic
                    ? "bg-[var(--text-primary)] text-[var(--background)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--control-hover)]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="text-[11px]"
                >
                  ●
                </span>
                <span className="hidden sm:inline">
                  Private
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleVisibilityChange(
                    true,
                  )
                }
                aria-pressed={isPublic}
                title="Anyone can view this design"
                className={`flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition ${
                  isPublic
                    ? "bg-[var(--text-primary)] text-[var(--background)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--control-hover)]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="text-[11px]"
                >
                  ◉
                </span>
                <span className="hidden sm:inline">
                  Public
                </span>
              </button>
            </div>

            <span
              className={`hidden text-xs md:inline ${
                saveStatus === "error"
                  ? "text-[#ff3b30]"
                  : saveStatus ===
                      "saved"
                    ? "text-[var(--text-secondary)]"
                    : "text-[var(--text-tertiary)]"
              }`}
            >
              {getSaveStatusLabel()}
            </span>

            <button
              type="button"
              onClick={() => {
                void handleSave();
              }}
              disabled={
                saveStatus === "saving"
              }
              className="h-9 rounded-full bg-[var(--text-primary)] px-4 text-sm font-medium text-[var(--background)] transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveStatus === "saving"
                ? "Saving…"
                : "Save"}
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[220px_minmax(0,1fr)_260px] xl:grid-cols-[240px_minmax(0,1fr)_290px] 2xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <div className="min-h-0">
            <EditorSidebar
              game={game}
              onGameChange={
                handleGameChange
              }
              layouts={layouts}
              selectedLayout={
                selectedLayout
              }
              onLayoutChange={
                handleLayoutChange
              }
              spread={spread}
              onSpreadChange={
                handleSpreadChange
              }
              pageColor={pageColor}
              onPageColorChange={
                handlePageColorChange
              }
            />
          </div>

          <div className="min-h-0 min-w-0">
            <BinderCanvas
              layout={selectedLayout}
              spread={spread}
              pageColor={pageColor}
              pockets={pockets}
              selectedCard={
                selectedCard
              }
              selectedPocketId={
                selectedPocketId
              }
              focusedCard={
                focusedCard
              }
              onPocketClick={
                handlePocketClick
              }
              onCardDrop={
                handleCardDrop
              }
              onPocketMove={
                handlePocketMove
              }
              onDuplicateCard={
                handleDuplicateCard
              }
              onRemoveCard={
                handleRemoveCard
              }
              onClearSelectedCard={
                handleClearSelectedCard
              }
            />
          </div>

          <div className="min-h-0">
            <CardLibrary
              game={game}
              selectedCard={
                selectedCard
              }
              focusedCard={
                focusedCard
              }
              recentCards={
                recentCards
              }
              onSelectCard={
                handleSelectCard
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}