"use client";

import type {
  BinderLayout,
  BinderSpread,
  TcgGame,
} from "@/types/binder";

type EditorSidebarProps = {
  game: TcgGame;
  onGameChange: (game: TcgGame) => void;

  layouts: BinderLayout[];
  selectedLayout: BinderLayout;
  onLayoutChange: (
    layout: BinderLayout,
  ) => void;

  spread: BinderSpread;
  onSpreadChange: (
    spread: BinderSpread,
  ) => void;

  pageColor: string;
  onPageColorChange: (
    color: string,
  ) => void;
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

const spreads: {
  id: BinderSpread;
  label: string;
  description: string;
}[] = [
  {
    id: "single",
    label: "Single",
    description: "One binder page",
  },
  {
    id: "double",
    label: "Double",
    description: "Two-page spread",
  },
];

export default function EditorSidebar({
  game,
  onGameChange,
  layouts,
  selectedLayout,
  onLayoutChange,
  spread,
  onSpreadChange,
  pageColor,
  onPageColorChange,
}: EditorSidebarProps) {
  return (
    <aside className="surface h-full min-h-0 overflow-y-auto rounded-[24px] p-4 xl:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Trading card game
        </p>

        <div className="mt-3">
          <select
            value={game}
            onChange={(event) =>
              onGameChange(
                event.target
                  .value as TcgGame,
              )
            }
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-strong)]"
          >
            <option value="pokemon">
              Pokémon
            </option>

            <option value="cyberpunk">
              Cyberpunk
            </option>
          </select>
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Page layout
        </p>

        <h1 className="mt-2 text-lg font-semibold tracking-[-0.025em] xl:text-xl">
          Choose your binder
        </h1>

        <p className="mt-1.5 text-sm leading-5 text-[var(--text-secondary)]">
          Select the number of pockets
          on each binder page.
        </p>

        <div className="mt-4 space-y-1">
          {layouts.map((layout) => {
            const selected =
              selectedLayout.id ===
              layout.id;

            return (
              <button
                key={layout.id}
                type="button"
                onClick={() =>
                  onLayoutChange(layout)
                }
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                  selected
                    ? "border-[var(--border-strong)] bg-[var(--control-hover)]"
                    : "border-transparent hover:bg-[var(--control-hover)]"
                }`}
              >
                <span className="text-sm font-medium">
                  {layout.label}
                </span>

                <MiniGrid
                  layout={layout}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Page spread
        </p>

        <p className="mt-1.5 text-sm leading-5 text-[var(--text-secondary)]">
          Design a single page or a
          continuous two-page spread.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {spreads.map((option) => {
            const selected =
              spread === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onSpreadChange(
                    option.id,
                  )
                }
                aria-pressed={selected}
                className={`min-w-0 rounded-xl border p-2.5 text-left transition ${
                  selected
                    ? "border-[var(--border-strong)] bg-[var(--control-hover)]"
                    : "border-transparent hover:bg-[var(--control-hover)]"
                }`}
              >
                <SpreadPreview
                  spread={option.id}
                />

                <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {option.label}
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-[var(--text-tertiary)]">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Page color
        </p>

        <p className="mt-1.5 text-sm leading-5 text-[var(--text-secondary)]">
          Match the color of your
          physical binder page.
        </p>

        <div className="mt-3 flex items-center gap-2.5">
          {pageColors.map((preset) => {
            const selected =
              pageColor ===
              preset.color;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  onPageColorChange(
                    preset.color,
                  )
                }
                title={preset.id}
                aria-label={preset.id}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  selected
                    ? "ring-2 ring-[#0071e3] ring-offset-2 ring-offset-[var(--surface)]"
                    : "hover:scale-105"
                }`}
              >
                <span
                  className="h-7 w-7 rounded-full border border-black/10 shadow-sm"
                  style={{
                    backgroundColor:
                      preset.color,
                  }}
                />
              </button>
            );
          })}

          <label
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[var(--border-strong)] shadow-sm transition hover:scale-105"
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
                backgroundColor:
                  pageColor,
              }}
            />

            <input
              type="color"
              value={pageColor}
              onChange={(event) =>
                onPageColorChange(
                  event.target.value,
                )
              }
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Custom page color"
            />
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-[var(--control-hover)] px-3 py-2">
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
      className="grid h-6 w-6 gap-[2px]"
      style={{
        gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({
        length:
          layout.columns *
          layout.rows,
      }).map((_, index) => (
        <span
          key={index}
          className="rounded-[1px] bg-[var(--text-tertiary)]"
        />
      ))}
    </div>
  );
}

function SpreadPreview({
  spread,
}: {
  spread: BinderSpread;
}) {
  return (
    <div
      className={`flex h-8 items-center ${
        spread === "double"
          ? "gap-1"
          : ""
      }`}
    >
      <PagePreview />

      {spread === "double" && (
        <PagePreview />
      )}
    </div>
  );
}

function PagePreview() {
  return (
    <div className="grid h-7 w-5 grid-cols-2 gap-[1px] rounded-[3px] border border-[var(--border-strong)] bg-[var(--surface)] p-[2px]">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <span
          key={index}
          className="rounded-[1px] bg-[var(--text-tertiary)] opacity-60"
        />
      ))}
    </div>
  );
}