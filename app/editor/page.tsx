"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import BinderCanvas from "@/components/editor/BinderCanvas";
import CardLibrary from "@/components/editor/CardLibrary";
import EditorSidebar from "@/components/editor/EditorSidebar";

import type {
  BinderCard,
  BinderLayout,
  BinderPocket,
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

function createPockets(
  layout: BinderLayout,
): BinderPocket[] {
  return Array.from(
    {
      length:
        layout.columns * layout.rows,
    },
    (_, index) => ({
      id: `pocket-${index + 1}`,
      content: null,
    }),
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

  const [pageColor, setPageColor] =
    useState("#ffffff");

  const [pockets, setPockets] =
    useState<BinderPocket[]>(() =>
      createPockets(layouts[1]),
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
      createPockets(selectedLayout),
    );
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

    setPockets((currentPockets) => {
      const newPocketCount =
        newLayout.columns *
        newLayout.rows;

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
    });
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

    /*
     * Un pocket ocupado siempre se selecciona.
     * Nunca sustituimos una carta existente
     * mediante un simple clic.
     */
    if (pocket.content) {
      setSelectedPocketId(
        (current) =>
          current === pocketId
            ? null
            : pocketId,
      );

      return;
    }

    /*
     * Si está vacío y tenemos una carta
     * seleccionada en la biblioteca,
     * la colocamos.
     */
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

    /*
     * Mantenemos la carta seleccionada.
     * Así el usuario puede colocar varias
     * copias rápidamente.
     */
    setSelectedCard(card);

    /*
     * No enfocamos automáticamente el pocket
     * al colocar una carta. El modo actual
     * sigue siendo "colocar esta carta".
     */
    setSelectedPocketId(null);
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

    /*
     * Dejamos enfocada la nueva copia,
     * para que el usuario vea claramente
     * dónde ha aparecido.
     */
    setSelectedCard(null);
    setSelectedPocketId(
      emptyPocket.id,
    );
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

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[var(--background)]">
      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[250px_minmax(0,1fr)_300px] xl:grid-cols-[270px_minmax(0,1fr)_340px]">
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
          pageColor={pageColor}
          onPageColorChange={
            setPageColor
          }
        />

        <BinderCanvas
          layout={selectedLayout}
          pageColor={pageColor}
          pockets={pockets}
          selectedCard={selectedCard}
          selectedPocketId={
            selectedPocketId
          }
          focusedCard={focusedCard}
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
        <CardLibrary
          game={game}
          selectedCard={selectedCard}
          focusedCard={focusedCard}
          recentCards={recentCards}
          onSelectCard={
            handleSelectCard
          }
        />
      </div>
    </main>
  );
}