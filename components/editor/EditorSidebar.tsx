"use client";

import type {
  BinderLayout,
  TcgGame,
} from "@/types/binder";

type EditorSidebarProps = {
  game: TcgGame;
  onGameChange: (game: TcgGame) => void;

  layouts: BinderLayout[];
  selectedLayout: BinderLayout;
  onLayoutChange: (layout: BinderLayout) => void;

  pageColor: string;
  onPageColorChange: (color: string) => void;
};

const pageColors = [
  {
    id: "white",
    color: "#ffffff",
  },
  {
    id: "black",
    color: "#18181a",
  },
  {
    id: "gray",
    color: "#d1d1d6",
  },
] as const;

export default function EditorSidebar({
  game,
  onGameChange,
  layouts,
  selectedLayout,
  onLayoutChange,
  pageColor,
  onPageColorChange,
}: EditorSidebarProps) {
  return (
    <aside className="surface rounded-[24px] p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Trading card game
        </p>

        <div className="mt-3">
          <select
            value={game}
            onChange={(event) =>
              onGameChange(event.target.value as TcgGame)
            }
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-strong)]"
          >
            <option value="pokemon">Pokémon</option>
            <option value="cyberpunk">Cyberpunk</option>
          </select>
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Page layout
        </p>

        <h1 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
          Choose your binder
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Select the number of pockets on your binder page.
        </p>

        <div className="mt-5 space-y-2">
          {layouts.map((layout) => {
            const selected = selectedLayout.id === layout.id;

            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => onLayoutChange(layout)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-[var(--border-strong)] bg-[var(--control-hover)]"
                    : "border-transparent hover:bg-[var(--control-hover)]"
                }`}
              >
                <span className="text-sm font-medium">
                  {layout.label}
                </span>

                <MiniGrid layout={layout} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Page color
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Match the color of your physical binder page.
        </p>

        <div className="mt-4 flex items-center gap-3">
          {pageColors.map((preset) => {
            const selected = pageColor === preset.color;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  onPageColorChange(preset.color)
                }
                title={preset.id}
                aria-label={preset.id}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  selected
                    ? "ring-2 ring-[#0071e3] ring-offset-2 ring-offset-[var(--surface)]"
                    : "hover:scale-105"
                }`}
              >
                <span
                  className="h-8 w-8 rounded-full border border-black/10 shadow-sm"
                  style={{
                    backgroundColor: preset.color,
                  }}
                />
              </button>
            );
          })}

          <label
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[var(--border-strong)] shadow-sm transition hover:scale-105"
            title="Custom color"
          >
            <span
              className="absolute inset-0"
              style={{
                background:
                  "conic-gradient(#ff3b30, #ffcc00, #34c759, #00c7be, #007aff, #af52de, #ff2d55, #ff3b30)",
              }}
            />

            <span className="absolute inset-[4px] rounded-full bg-[var(--surface)]" />

            <span
              className="absolute inset-[7px] rounded-full"
              style={{
                backgroundColor: pageColor,
              }}
            />

            <input
              type="color"
              value={pageColor}
              onChange={(event) =>
                onPageColorChange(event.target.value)
              }
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Custom page color"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--control-hover)] px-3 py-2">
          <span className="text-xs font-medium text-[var(--text-tertiary)]">
            Color
          </span>

          <span className="font-mono text-xs uppercase text-[var(--text-secondary)]">
            {pageColor}
          </span>
        </div>
      </div>
    </aside>
  );
}

function MiniGrid({
  layout,
}: {
  layout: BinderLayout;
}) {
  return (
    <div
      className="grid h-7 w-7 gap-[2px]"
      style={{
        gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({
        length: layout.columns * layout.rows,
      }).map((_, index) => (
        <span
          key={index}
          className="rounded-[1px] bg-[var(--text-tertiary)]"
        />
      ))}
    </div>
  );
}