import { useState } from "react";
import { GridCell, Bot, BOTS, PLAYER_PROFILE } from "../bots";
import { SwordsCrossedIcon, PadlockIcon } from "./icons";
import { getPokemonImageUrl } from "../pokemonData";

// Short label for a tile — used inside grid cells and in the duel header.
// Player → "TY" / "YOU"; bots → "Gracz N" / "Player N".
export function getOwnerShortLabel(owner: Bot | typeof PLAYER_PROFILE, t: any): string {
  if (owner.id === "player") return t.playerTileLabel;
  return `${t.botLabel} ${(owner as Bot).number}`;
}

interface FloorGridProps {
  grid: GridCell[];
  onSelectCell: (cell: GridCell, bot: Bot) => void;
  playerTerritorySize: number;
  recentlyConqueredCellIds?: number[];
  language: "pl" | "en";
  playerName?: string;
  playerAvatarId?: number;
  t: any;
}

interface ComponentInfo {
  ownerId: string;
  // Centroid cell — where the polygon's "GRACZ N" / "TY · ASH" label renders.
  anchorCellId: number;
  // Visual top-right corner cell — where corner badges (lock / red attack)
  // render. For a 2-wide horizontal polygon the centroid would be the LEFT
  // cell, which would put a `-top-1 -right-1` badge on the seam between the
  // two cells; using the actual top-right corner keeps badges on the outer
  // edge of the merged shape.
  cornerCellId: number;
  size: number;
  // True when ANY cell of the polygon is orthogonally adjacent to a player
  // tile. The whole polygon is attackable when this is true (we don't require
  // the corner cell itself to be adjacent — for a multi-cell bot territory
  // sitting next to the player, only the touching cell satisfies the
  // per-cell adjacency check, but the territory as a whole is reachable).
  isAdjacent: boolean;
  // Bounding box (inclusive) of the polygon — used to centre the owner label
  // across the whole merged shape when it forms a solid rectangle.
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
  // True when the polygon fully fills its bounding box (a solid rectangle).
  // For rectangles we centre the label on the bbox; otherwise (L-shapes etc.)
  // we fall back to the centroid anchor cell so the label stays inside.
  isRect: boolean;
}

interface GridItem {
  key: string;
  cell: GridCell;
  gridRowStart: number;
  gridColStart: number;
  isPlayer: boolean;
  isAdjacent: boolean;
  isJustConquered: boolean;
  // Polygon merge flags — true when neighbour is owned by the SAME entity.
  mergeTop: boolean;
  mergeRight: boolean;
  mergeBottom: boolean;
  mergeLeft: boolean;
  // Connected-component metadata
  component: ComponentInfo;
  isAnchor: boolean;
}

const DIFFICULTY_HEX: Record<"easy" | "medium" | "hard", string> = {
  easy: "#A9E6CF",   // Soft Mint
  medium: "#FFD84D", // Lemon Yellow
  hard: "#FF7A62"    // Coral
};

// BFS connected components on the 5×5 grid, grouping cells by currentOwnerId.
// Each component returns: anchor cell (top-left = min row, min col), bounding-box
// dimensions, and total size. Anchor renders the single owner label/emoji that
// spans the polygon; siblings render only the background + (for bots) difficulty
// stripe.
function buildComponents(grid: GridCell[]): Map<number, ComponentInfo> {
  const byPos = new Map<string, GridCell>();
  for (const c of grid) byPos.set(`${c.row}-${c.col}`, c);

  const visited = new Set<number>();
  const result = new Map<number, ComponentInfo>();

  // Polygon adjacency depends on whether ANY cell in the component is
  // orthogonally adjacent to a player-owned tile. We pre-compute a set of
  // player cell positions once and reuse it in the BFS pass.
  const playerPositions = new Set<string>();
  for (const c of grid) {
    if (c.currentOwnerId === "player") playerPositions.add(`${c.row}-${c.col}`);
  }
  const cellTouchesPlayer = (c: GridCell): boolean => {
    if (c.currentOwnerId === "player") return false;
    return (
      playerPositions.has(`${c.row - 1}-${c.col}`) ||
      playerPositions.has(`${c.row + 1}-${c.col}`) ||
      playerPositions.has(`${c.row}-${c.col - 1}`) ||
      playerPositions.has(`${c.row}-${c.col + 1}`)
    );
  };

  for (const start of grid) {
    if (visited.has(start.id)) continue;
    const queue: GridCell[] = [start];
    visited.add(start.id);
    const cells: GridCell[] = [];
    let isAdjacent = false;
    while (queue.length > 0) {
      const c = queue.shift()!;
      cells.push(c);
      if (cellTouchesPlayer(c)) isAdjacent = true;
      const neighbours = [
        byPos.get(`${c.row - 1}-${c.col}`),
        byPos.get(`${c.row + 1}-${c.col}`),
        byPos.get(`${c.row}-${c.col - 1}`),
        byPos.get(`${c.row}-${c.col + 1}`),
      ];
      for (const n of neighbours) {
        if (!n || visited.has(n.id)) continue;
        if (n.currentOwnerId === start.currentOwnerId) {
          visited.add(n.id);
          queue.push(n);
        }
      }
    }
    // Pick the cell closest to the polygon's centroid as the label anchor.
    // For non-rectangular shapes (e.g. L-shapes) this keeps the label visually
    // inside the territory instead of floating off in a bounding-box corner.
    const avgRow = cells.reduce((s, c) => s + c.row, 0) / cells.length;
    const avgCol = cells.reduce((s, c) => s + c.col, 0) / cells.length;
    const anchor = cells.reduce((best, c) => {
      const dC = Math.abs(c.row - avgRow) + Math.abs(c.col - avgCol);
      const dB = Math.abs(best.row - avgRow) + Math.abs(best.col - avgCol);
      return dC < dB ? c : best;
    }, cells[0]);
    // Top-right corner cell: minimise row first (topmost), then maximise col
    // (rightmost among the topmost). For an L-shape that flares right at the
    // top, this picks the cell at the far-right tip of the top run.
    const corner = cells.reduce((best, c) => {
      if (c.row < best.row) return c;
      if (c.row > best.row) return best;
      return c.col > best.col ? c : best;
    }, cells[0]);
    const minRow = Math.min(...cells.map((c) => c.row));
    const maxRow = Math.max(...cells.map((c) => c.row));
    const minCol = Math.min(...cells.map((c) => c.col));
    const maxCol = Math.max(...cells.map((c) => c.col));
    const isRect = cells.length === (maxRow - minRow + 1) * (maxCol - minCol + 1);
    const info: ComponentInfo = {
      ownerId: start.currentOwnerId,
      anchorCellId: anchor.id,
      cornerCellId: corner.id,
      size: cells.length,
      isAdjacent,
      minRow,
      maxRow,
      minCol,
      maxCol,
      isRect
    };
    for (const c of cells) result.set(c.id, info);
  }
  return result;
}

export default function FloorGrid({ grid, onSelectCell, playerTerritorySize, recentlyConqueredCellIds = [], language: _language, playerName, playerAvatarId = 25, t }: FloorGridProps) {

  // Which attackable territory is hovered — keyed by its component anchor cell
  // so hovering ANY cell of a merged bot territory highlights the WHOLE shape as
  // one challenge target (not the single cell under the cursor).
  const [hoveredAnchor, setHoveredAnchor] = useState<number | null>(null);

  // Player owns this position — used for adjacency tests AND treated as "same
  // owner" for polygon merge. Just-conquered cells stay inside the set so their
  // neighbours light up immediately and the lava-takeover meshes seamlessly.
  const playerFieldsSet = new Set(
    grid
      .filter(c => c.currentOwnerId === "player")
      .map(c => `${c.row}-${c.col}`)
  );

  const ownerAt = (row: number, col: number): string | null => {
    const c = grid.find((g) => g.row === row && g.col === col);
    return c ? c.currentOwnerId : null;
  };

  const isPlayerAt = (row: number, col: number) => playerFieldsSet.has(`${row}-${col}`);

  const isCellAdjacentToPlayer = (cell: GridCell) => {
    if (cell.currentOwnerId === "player") return false;
    const { row, col } = cell;
    return (
      isPlayerAt(row - 1, col) ||
      isPlayerAt(row + 1, col) ||
      isPlayerAt(row, col - 1) ||
      isPlayerAt(row, col + 1)
    );
  };

  const justConqueredSet = new Set(recentlyConqueredCellIds);
  const components = buildComponents(grid);

  const gridItems: GridItem[] = grid.map((cell) => {
    const isPlayer = cell.currentOwnerId === "player";
    const isJustConquered = justConqueredSet.has(cell.id);
    const component = components.get(cell.id)!;
    const sameOwner = (r: number, c: number) => ownerAt(r, c) === cell.currentOwnerId;
    return {
      key: `cell-${cell.id}`,
      cell,
      gridRowStart: cell.row + 1,
      gridColStart: cell.col + 1,
      isPlayer,
      isJustConquered,
      isAdjacent: isCellAdjacentToPlayer(cell),
      mergeTop:    sameOwner(cell.row - 1, cell.col),
      mergeRight:  sameOwner(cell.row,     cell.col + 1),
      mergeBottom: sameOwner(cell.row + 1, cell.col),
      mergeLeft:   sameOwner(cell.row,     cell.col - 1),
      component,
      isAnchor: component.anchorCellId === cell.id
    };
  });

  void playerTerritorySize; // (statistics now rendered by the parent banner — kept in props for callers)

  return (
    <div className="w-full font-sans text-cocoa select-none">
      {/* Kontener Główny Planszy — navy stamp board (design 02) */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#1B2840] p-2.5 sm:p-3.5 shadow-[0_6px_0_#5A3A2A] border-2 border-[#5A3A2A]">
        <div className="grid grid-cols-5 gap-0 aspect-square relative bg-[#1B2840]">
          {gridItems.map((item) => {
            const cell = item.cell;
            const ownerBot = BOTS[cell.currentOwnerId];
            const isPlayerTile = item.isPlayer;
            // Polygon-level adjacency drives interaction state across the
            // whole territory: if ANY cell of a multi-cell bot polygon is
            // adjacent to the player, every cell of that polygon is attackable.
            const polygonAdjacent = item.component.isAdjacent;
            const isLocked = !isPlayerTile && !polygonAdjacent;

            const cursorClass = isPlayerTile
              ? "cursor-default"
              : polygonAdjacent
              ? "cursor-pointer"
              : "cursor-not-allowed";

            const zClass = isPlayerTile ? "z-10" : "";

            // Whole-territory hover: every cell of the hovered attackable
            // territory lights up together, so a merged bot region reads as ONE
            // challenge target rather than per-cell.
            const isHovered = polygonAdjacent && hoveredAnchor === item.component.anchorCellId;

            // --- Flat checkerboard fill ---------------------------------------
            // Square, flush tiles — no gap, no radius. Owner colour fills each
            // cell, so same-owner cells form one solid block automatically.
            const bgClass = item.isJustConquered
              ? "animate-lava-takeover bg-[#FFD84D] text-[#24456B]"
              : isPlayerTile
              ? "bg-[#FFD84D] text-[#24456B]"
              : polygonAdjacent
              ? `${isHovered ? "bg-[#FFF4DF]" : "bg-white"} transition-colors duration-150 text-[#5A3A2A]`
              : "bg-[#EADFC9] text-[#5A3A2A]";

            // --- Single-line cocoa borders ------------------------------------
            // Draw top/left whenever the neighbour differs (mergeTop/Left false
            // also covers the board's top/left edge). Right/bottom only on the
            // board's outer edge — every interior boundary between two owners is
            // then drawn exactly once (by the right/bottom cell's left/top
            // border), with NO border inside a single territory → a clean
            // checkerboard with solid merged blocks, no doubled lines.
            const borderClass = `border-[#5A3A2A] ${!item.mergeTop ? "border-t-2" : ""} ${!item.mergeLeft ? "border-l-2" : ""} ${cell.col === 4 ? "border-r-2" : ""} ${cell.row === 4 ? "border-b-2" : ""}`;

            const tooltipText = isPlayerTile
              ? `${t.botTooltipYourTerritory} (${playerFieldsSet.size})`
              : ownerBot
                ? `${t.botTooltipRegion}: ${t.botLabel} ${ownerBot.number} · ${t[ownerBot.difficulty]}`
                : "";

            return (
              <button
                key={item.key}
                data-tutorial-target={polygonAdjacent && cell.id === item.component.cornerCellId ? "attackable" : undefined}
                onClick={() => {
                  if (polygonAdjacent && ownerBot) onSelectCell(cell, ownerBot);
                }}
                onMouseEnter={() => { if (polygonAdjacent) setHoveredAnchor(item.component.anchorCellId); }}
                onMouseLeave={() => setHoveredAnchor((prev) => (prev === item.component.anchorCellId ? null : prev))}
                disabled={!polygonAdjacent}
                className={`relative flex flex-col items-center justify-end p-1 outline-none active:translate-y-0.5 ${cursorClass} ${zClass} ${borderClass} ${bgClass}`}
                style={{
                  gridRow: `${item.gridRowStart} / span 1`,
                  gridColumn: `${item.gridColStart} / span 1`,
                }}
                title={tooltipText}
              >
                {/* Corner-closing filler — the single-line border rule (top/left
                    on differ) leaves a 2px gap at exactly one configuration: a
                    cell whose top AND left neighbours share its owner but whose
                    top-left DIAGONAL is a different owner (the convex corner of
                    that diagonal territory, which no border closes). A 2px cocoa
                    square in this cell's top-left corner makes every merge
                    boundary continuous — bulletproof. */}
                {item.mergeTop && item.mergeLeft && ownerAt(cell.row - 1, cell.col - 1) !== cell.currentOwnerId && (
                  <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-[#5A3A2A] pointer-events-none z-10" />
                )}

                {/* ID-pill — once per polygon (anchor cell), bots only. */}
                {item.isAnchor && !isPlayerTile && ownerBot && (
                  <span className="absolute top-1 left-1 z-20 font-mono font-black text-[8px] bg-white border border-[#5A3A2A] rounded px-1 text-[#5A3A2A] pointer-events-none leading-none py-0.5">
                    {String(ownerBot.number).padStart(2, "0")}
                  </span>
                )}

                {/* Corner badges — from the polygon's visual top-right cell.
                    Lock for out-of-range tiles, red crossed-swords for
                    attackable tiles. Mutually exclusive. */}
                {cell.id === item.component.cornerCellId && !isPlayerTile && ownerBot && isLocked && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-[#5A3A2A] shadow-[0_1px_0_#5A3A2A] flex items-center justify-center pointer-events-none z-20">
                    <PadlockIcon size={10} color="#5A3A2A" strokeWidth={2.5} />
                  </div>
                )}
                {cell.id === item.component.cornerCellId && !isPlayerTile && ownerBot && polygonAdjacent && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E95050] border-2 border-[#5A3A2A] shadow-[0_1px_0_#5A3A2A] flex items-center justify-center pointer-events-none z-20">
                    <SwordsCrossedIcon size={10} color="#FFFFFF" strokeWidth={2.5} />
                  </div>
                )}

                {/* Difficulty bar — bottom edge of a bot polygon. Flush to the
                    cell edge on merged sides so adjacent bars join into one
                    continuous bar across the territory. */}
                {!isPlayerTile && ownerBot && !item.mergeBottom && (
                  <div
                    className={`absolute bottom-1 h-1 ${item.mergeLeft ? "left-0" : "left-1"} ${item.mergeRight ? "right-0" : "right-1"}`}
                    style={{
                      backgroundColor: DIFFICULTY_HEX[ownerBot.difficulty],
                      opacity: isLocked ? 0.4 : 1
                    }}
                  />
                )}
              </button>
            );
          })}

          {/* Owner-label layer — one label per territory, absolutely centred on
              the territory's centroid (average cell centre) so the avatar +
              name sit in the middle of the merged block every time, whatever the
              shape (rectangle / T / L / plus). pointer-events-none lets clicks
              fall through to the tile buttons beneath; z-[15] keeps labels above
              player tiles (z-10) but below badges (z-20)/hover. */}
          {Array.from(
            new Map(gridItems.map((it) => [it.component.anchorCellId, it.component])).values()
          ).map((comp) => {
            const isPlayer = comp.ownerId === "player";
            const ownerBot = BOTS[comp.ownerId];
            if (!isPlayer && !ownerBot) return null;
            const isAdjacent = comp.isAdjacent;
            const isLocked = !isPlayer && !isAdjacent;
            // Centroid of the territory's cells → percentage position over the
            // 5×5 grid (which the absolute layer is sized to, gap-0).
            const cells = grid.filter((g) => components.get(g.id) === comp);
            const avgRow = cells.reduce((s, g) => s + g.row, 0) / cells.length;
            const avgCol = cells.reduce((s, g) => s + g.col, 0) / cells.length;
            const placement = {
              position: "absolute" as const,
              left: `${((avgCol + 0.5) / 5) * 100}%`,
              top: `${((avgRow + 0.5) / 5) * 100}%`,
              transform: "translate(-50%, -50%)",
            };

            return (
              <div
                key={`label-${comp.anchorCellId}`}
                className="z-[15] pointer-events-none flex flex-col items-center justify-center gap-0.5 px-1"
                style={placement}
              >
                {isPlayer ? (
                  <>
                    <img
                      src={getPokemonImageUrl(playerAvatarId)}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-7 w-7 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain select-none leading-none"
                      style={{ filter: "drop-shadow(0 1px 1px rgba(90,58,42,0.25))" }}
                    />
                    <span
                      className="block text-center antialiased whitespace-nowrap leading-none uppercase tracking-tight font-black text-[8px] sm:text-[11px] md:text-xs"
                      style={{
                        color: "#24456B",
                        WebkitFontSmoothing: "antialiased",
                      }}
                    >
                      {playerName || t.playerTileLabel}
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      src={getPokemonImageUrl(ownerBot.avatarPokemonId)}
                      alt=""
                      referrerPolicy="no-referrer"
                      className={`h-7 w-7 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain select-none transition-all ${isLocked ? "grayscale opacity-30" : "grayscale opacity-70"}`}
                      style={{ filter: "drop-shadow(0 1px 1px rgba(90,58,42,0.2))" }}
                    />
                    <span
                      className="block text-center antialiased whitespace-nowrap leading-none uppercase tracking-tight font-black text-[8px] sm:text-[11px] md:text-xs"
                      style={{
                        color: isAdjacent ? "#24456B" : "#5A3A2A",
                        WebkitFontSmoothing: "antialiased",
                      }}
                    >
                      {t.botLabel} {ownerBot.number}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
