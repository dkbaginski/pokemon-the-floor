import { GridCell, Bot, BOTS, PLAYER_PROFILE } from "../bots";
import { Swords } from "lucide-react";
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

export default function FloorGrid({ grid, onSelectCell, playerTerritorySize, recentlyConqueredCellIds = [], language: _language, t }: FloorGridProps) {

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
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 aspect-square relative bg-[#1B2840]">
          {gridItems.map((item) => {
            const cell = item.cell;
            const ownerBot = BOTS[cell.currentOwnerId];
            const isPlayerTile = item.isPlayer;
            // Polygon-level adjacency drives interaction state across the
            // whole territory: if ANY cell of a multi-cell bot polygon is
            // adjacent to the player, every cell of that polygon paints with
            // the "attackable" treatment (white bg, red swords badge, click
            // handler enabled). Without this, the non-touching half of the
            // polygon renders as a locked beige tile next to the attackable
            // anchor — visually splitting the territory in two.
            const polygonAdjacent = item.component.isAdjacent;
            const isLocked = !isPlayerTile && !polygonAdjacent;

            // Background / interaction class
            const bgClass = item.isJustConquered
              ? "animate-lava-takeover bg-[#FFD84D] text-[#24456B]"
              : isPlayerTile
              ? "bg-[#FFD84D] cursor-default text-[#24456B]"
              : polygonAdjacent
              ? "bg-white hover:bg-[#FFF4DF] cursor-pointer transition-all duration-150 text-[#5A3A2A]"
              : "bg-[#EADFC9] cursor-not-allowed text-[#5A3A2A]";

            // --- Polygon merging (player + same-bot polygons) ---------------
            const borderClass = `border-[#5A3A2A] ${item.mergeTop ? "border-t-0" : "border-t-2"} ${item.mergeRight ? "border-r-0" : "border-r-2"} ${item.mergeBottom ? "border-b-0" : "border-b-2"} ${item.mergeLeft ? "border-l-0" : "border-l-2"}`;

            const cornerClass = `${(!item.mergeTop && !item.mergeLeft) ? "rounded-tl-xl sm:rounded-tl-2xl" : "rounded-tl-none"} ${(!item.mergeTop && !item.mergeRight) ? "rounded-tr-xl sm:rounded-tr-2xl" : "rounded-tr-none"} ${(!item.mergeBottom && !item.mergeLeft) ? "rounded-bl-xl sm:rounded-bl-2xl" : "rounded-bl-none"} ${(!item.mergeBottom && !item.mergeRight) ? "rounded-br-xl sm:rounded-br-2xl" : "rounded-br-none"}`;

            // No negative margins on cells — keep them at their grid track
            // positions. Polygon merge is achieved via an absolute-positioned
            // bg overlay (below) that extends into the gap on merge sides,
            // plus per-corner fillers at L-bend concave intersections.
            // This avoids the previous "two perpendicular margins extend the
            // box in two directions and paint into the diagonal corner outside
            // the polygon" issue.
            const shadowClass = cell.row === 4 ? "shadow-[0_3px_0_#5A3A2A]" : "";
            const zClass = isPlayerTile ? "z-10" : "";

            // Fill colour used by overlay + corner fillers. Matches the cell's
            // own bg so the merged polygon paints as one continuous colour.
            const fillColor = item.isJustConquered || isPlayerTile
              ? "#FFD84D"
              : polygonAdjacent
                ? "#FFFFFF"
                : "#EADFC9";

            // Helper: is the diagonal neighbour part of the same polygon?
            // Used to decide whether a corner filler needs L-bend borders
            // (when the diagonal is a DIFFERENT owner) or is fully interior.
            const diagSameOwner = (dr: number, dc: number) => {
              const d = grid.find(g => g.row === cell.row + dr && g.col === cell.col + dc);
              return d?.currentOwnerId === cell.currentOwnerId;
            };
            const cornerTR = item.mergeTop && item.mergeRight;
            const cornerTL = item.mergeTop && item.mergeLeft;
            const cornerBR = item.mergeBottom && item.mergeRight;
            const cornerBL = item.mergeBottom && item.mergeLeft;
            const trInterior = cornerTR && diagSameOwner(-1, 1);
            const tlInterior = cornerTL && diagSameOwner(-1, -1);
            const brInterior = cornerBR && diagSameOwner(1, 1);
            const blInterior = cornerBL && diagSameOwner(1, -1);

            const hasAnyMerge = item.mergeTop || item.mergeRight || item.mergeBottom || item.mergeLeft;

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
                disabled={!polygonAdjacent}
                className={`relative flex flex-col items-center justify-end p-1 transition-all outline-none active:shadow-none active:translate-y-0.5 ${borderClass} ${cornerClass} ${shadowClass} ${zClass} ${bgClass}`}
                style={{
                  gridRow: `${item.gridRowStart} / span 1`,
                  gridColumn: `${item.gridColStart} / span 1`,
                }}
                title={tooltipText}
              >
                {/* Polygon-merge overlay — extends the cell's fill colour into
                    the adjacent gap on every merged side. Sits in the gap
                    area only (no overlap with neighbouring polygons because
                    only merge sides extend). Behind all other content.
                    At polygon's outer corners (where the cell itself has a
                    rounded corner via cornerClass), match the cell's INNER
                    border-radius (outer radius minus 2px border) so the
                    overlay's L-shape doesn't paint a sharp square over the
                    cell's rounded bg curve. */}
                {hasAnyMerge && (
                  <div
                    className={`absolute pointer-events-none ${
                      item.mergeTop ? "-top-[6px] sm:-top-[10px]" : "top-0"
                    } ${
                      item.mergeRight ? "-right-[6px] sm:-right-[10px]" : "right-0"
                    } ${
                      item.mergeBottom ? "-bottom-[6px] sm:-bottom-[10px]" : "bottom-0"
                    } ${
                      item.mergeLeft ? "-left-[6px] sm:-left-[10px]" : "left-0"
                    } ${
                      (!item.mergeTop && !item.mergeLeft) ? "rounded-tl-[10px] sm:rounded-tl-[14px]" : ""
                    } ${
                      (!item.mergeTop && !item.mergeRight) ? "rounded-tr-[10px] sm:rounded-tr-[14px]" : ""
                    } ${
                      (!item.mergeBottom && !item.mergeLeft) ? "rounded-bl-[10px] sm:rounded-bl-[14px]" : ""
                    } ${
                      (!item.mergeBottom && !item.mergeRight) ? "rounded-br-[10px] sm:rounded-br-[14px]" : ""
                    }`}
                    style={{ backgroundColor: fillColor }}
                  />
                )}

                {/* Corner fillers — bridge the gap intersection at each corner
                    where BOTH adjacent merges are true. Paint the fill colour;
                    when the diagonal neighbour is a DIFFERENT polygon (L-bend),
                    also draw the two perpendicular border segments that form
                    the L outline at the concave corner. */}
                {cornerTR && (
                  <div
                    className={`absolute -top-[6px] sm:-top-[10px] -right-[6px] sm:-right-[10px] w-[6px] sm:w-[10px] h-[6px] sm:h-[10px] pointer-events-none ${trInterior ? "" : "border-t-2 border-r-2 border-[#5A3A2A]"}`}
                    style={{ backgroundColor: fillColor }}
                  />
                )}
                {cornerTL && (
                  <div
                    className={`absolute -top-[6px] sm:-top-[10px] -left-[6px] sm:-left-[10px] w-[6px] sm:w-[10px] h-[6px] sm:h-[10px] pointer-events-none ${tlInterior ? "" : "border-t-2 border-l-2 border-[#5A3A2A]"}`}
                    style={{ backgroundColor: fillColor }}
                  />
                )}
                {cornerBR && (
                  <div
                    className={`absolute -bottom-[6px] sm:-bottom-[10px] -right-[6px] sm:-right-[10px] w-[6px] sm:w-[10px] h-[6px] sm:h-[10px] pointer-events-none ${brInterior ? "" : "border-b-2 border-r-2 border-[#5A3A2A]"}`}
                    style={{ backgroundColor: fillColor }}
                  />
                )}
                {cornerBL && (
                  <div
                    className={`absolute -bottom-[6px] sm:-bottom-[10px] -left-[6px] sm:-left-[10px] w-[6px] sm:w-[10px] h-[6px] sm:h-[10px] pointer-events-none ${blInterior ? "" : "border-b-2 border-l-2 border-[#5A3A2A]"}`}
                    style={{ backgroundColor: fillColor }}
                  />
                )}

                {/* Edge stitches — bridge the cocoa border across the gap on
                    each merge side, but only at perpendicular edges that
                    don't themselves merge (i.e. polygon outline crossing the
                    merge gap). Owned solely by the cell that has mergeRight /
                    mergeBottom to avoid double-painting from both neighbours. */}
                {item.mergeRight && !item.mergeTop && (
                  <div className="absolute -top-[2px] -right-[6px] sm:-right-[10px] w-[6px] sm:w-[10px] h-[2px] bg-[#5A3A2A] pointer-events-none" />
                )}
                {item.mergeRight && !item.mergeBottom && (
                  <div className="absolute -bottom-[2px] -right-[6px] sm:-right-[10px] w-[6px] sm:w-[10px] h-[2px] bg-[#5A3A2A] pointer-events-none" />
                )}
                {item.mergeBottom && !item.mergeLeft && (
                  <div className="absolute -bottom-[6px] sm:-bottom-[10px] -left-[2px] w-[2px] h-[6px] sm:h-[10px] bg-[#5A3A2A] pointer-events-none" />
                )}
                {item.mergeBottom && !item.mergeRight && (
                  <div className="absolute -bottom-[6px] sm:-bottom-[10px] -right-[2px] w-[2px] h-[6px] sm:h-[10px] bg-[#5A3A2A] pointer-events-none" />
                )}

                {/* Drop-shadow stitch — the per-cell shadow-[0_3px_0_#5A3A2A]
                    on row-4 cells terminates at each cell's right edge, so a
                    horizontal polygon along the bottom row showed the shadow
                    as three separate strips with gaps. This bridges the col
                    gap below mergeRight cells at the shadow's exact y-range
                    (cell.bottom .. cell.bottom + 3px). */}
                {cell.row === 4 && item.mergeRight && (
                  <div className="absolute -bottom-[5px] -right-[6px] sm:-right-[10px] w-[6px] sm:w-[10px] h-[3px] bg-[#5A3A2A] pointer-events-none" />
                )}

                {/* Owner labels (player ⚡+nick, bot sprite+name) are rendered in
                    a separate polygon-spanning layer after the cells — see the
                    label layer below the grid map. This keeps the label centred
                    over the whole merged shape instead of a single anchor cell. */}

                {/* ID-pill (design 02) — small white pill with the tile number
                    in the top-left of the anchor cell. Rendered once per
                    polygon so multi-cell bot territories don't duplicate the
                    label. Player tiles intentionally don't render it — the
                    centred ⚡ + nickname is enough. */}
                {item.isAnchor && !isPlayerTile && ownerBot && (
                  <span className="absolute top-1 left-1 z-20 font-mono font-black text-[8px] bg-white border border-[#5A3A2A] rounded px-1 text-[#5A3A2A] pointer-events-none leading-none py-0.5">
                    {String(ownerBot.number).padStart(2, "0")}
                  </span>
                )}

                {/* (No echo label on non-anchor cells — polygon-level adjacency
                    plus the merged border + single corner badge + continuous
                    difficulty bar already read as one territory, so duplicating
                    the "GRACZ N" text would be noise.) */}

                {/* Corner badges — render from the polygon's visual top-right
                    cell (not the label centroid) so that on a 2-wide merged
                    polygon the badge sits on the outer edge instead of the
                    seam between cells. Lock for out-of-range tiles, red
                    crossed-swords for adjacent (attackable) tiles. Mutually
                    exclusive: a polygon is either reachable or it isn't. */}
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

                {/* Difficulty bar — only on the bottom edge of a bot polygon.
                    Solid fill, no cocoa-alpha borders, so when two bars
                    overlap in the gap between merged cells the colour stays
                    consistent (previously the half-opacity cocoa borders
                    stacked and produced a darker stitch). */}
                {!isPlayerTile && ownerBot && !item.mergeBottom && (
                  <div
                    className={`absolute bottom-1 h-1 ${item.mergeLeft ? "-left-[6px] sm:-left-[10px] rounded-l-none" : "left-1 rounded-l-full"} ${item.mergeRight ? "-right-[6px] sm:-right-[10px] rounded-r-none" : "right-1 rounded-r-full"}`}
                    style={{
                      backgroundColor: DIFFICULTY_HEX[ownerBot.difficulty],
                      opacity: isLocked ? 0.4 : 1
                    }}
                  />
                )}

                {/* Hover combat overlay */}
                {polygonAdjacent && (
                  <div className="absolute inset-0 bg-lemon-yellow/10 opacity-0 hover:opacity-100 flex items-center justify-center transition-all rounded-xl sm:rounded-2xl z-30">
                    <Swords className="h-4 w-4 text-pokemon-navy" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Owner-label layer — one label per polygon, placed on the grid so it
              spans the whole merged shape. For a solid rectangle it spans the
              bounding box (perfectly centred even on 2-wide / 2-tall merges);
              for irregular shapes it falls back to the centroid anchor cell so
              the label never floats outside the territory. pointer-events-none
              lets clicks fall through to the tile buttons beneath; z-[15] keeps
              labels above player tiles (z-10) but below badges (z-20)/hover. */}
          {Array.from(
            new Map(gridItems.map((it) => [it.component.anchorCellId, it.component])).values()
          ).map((comp) => {
            const isPlayer = comp.ownerId === "player";
            const ownerBot = BOTS[comp.ownerId];
            if (!isPlayer && !ownerBot) return null;
            const isAdjacent = comp.isAdjacent;
            const isLocked = !isPlayer && !isAdjacent;
            const spanRect = comp.isRect && comp.size > 1;
            const anchor = grid.find((g) => g.id === comp.anchorCellId)!;
            const placement = spanRect
              ? {
                  gridRow: `${comp.minRow + 1} / ${comp.maxRow + 2}`,
                  gridColumn: `${comp.minCol + 1} / ${comp.maxCol + 2}`,
                }
              : {
                  gridRow: `${anchor.row + 1} / span 1`,
                  gridColumn: `${anchor.col + 1} / span 1`,
                };

            return (
              <div
                key={`label-${comp.anchorCellId}`}
                className="z-[15] pointer-events-none flex flex-col items-center justify-center gap-0.5 px-1"
                style={placement}
              >
                {isPlayer ? (
                  <>
                    <span className="text-base sm:text-xl lg:text-2xl animate-pulse leading-none">⚡</span>
                    <span className="font-display font-black text-[8px] sm:text-[9px] text-[#24456B] uppercase tracking-wider leading-none whitespace-nowrap">
                      {t.boardPlayerNick || t.playerTileLabel}
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      src={getPokemonImageUrl(ownerBot.avatarPokemonId)}
                      alt=""
                      referrerPolicy="no-referrer"
                      className={`h-7 w-7 sm:h-9 sm:w-9 object-contain select-none transition-all ${isLocked ? "grayscale opacity-30" : "grayscale opacity-70"}`}
                      style={{ filter: "drop-shadow(0 1px 1px rgba(90,58,42,0.2))" }}
                    />
                    <span
                      className="block text-center antialiased whitespace-nowrap leading-none uppercase tracking-tight font-black"
                      style={{
                        fontSize: "clamp(8px, 1vh, 10px)",
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
