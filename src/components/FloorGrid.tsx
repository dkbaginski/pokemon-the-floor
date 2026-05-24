import { GridCell, Bot, BOTS, PLAYER_PROFILE } from "../bots";
import { Shield, Swords, Compass } from "lucide-react";

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

interface GridItem {
  key: string;
  cell: GridCell;
  gridRowStart: number;
  gridColStart: number;
  isPlayer: boolean;
  isAdjacent: boolean;
  isJustConquered: boolean;
  // Polygon merge flags — true when neighbour is also owned by the player
  // (recently-conquered cells count as player; they sit inside playerFieldsSet).
  mergeTop: boolean;
  mergeRight: boolean;
  mergeBottom: boolean;
  mergeLeft: boolean;
}

const DIFFICULTY_HEX: Record<"easy" | "medium" | "hard", string> = {
  easy: "#A9E6CF",   // Soft Mint
  medium: "#FFD84D", // Lemon Yellow
  hard: "#FF7A62"    // Coral
};

export default function FloorGrid({ grid, onSelectCell, playerTerritorySize, recentlyConqueredCellIds = [], language, t }: FloorGridProps) {

  // Player owns this position — used for both adjacency and polygon merging.
  // Just-conquered cells stay inside the set so neighbours light up immediately and
  // the lava-takeover animation merges seamlessly with the rest of the player polygon.
  const playerFieldsSet = new Set(
    grid
      .filter(c => c.currentOwnerId === "player")
      .map(c => `${c.row}-${c.col}`)
  );

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

  const gridItems: GridItem[] = grid.map((cell) => {
    const isPlayer = cell.currentOwnerId === "player";
    const isJustConquered = justConqueredSet.has(cell.id);
    return {
      key: `cell-${cell.id}`,
      cell,
      gridRowStart: cell.row + 1,
      gridColStart: cell.col + 1,
      isPlayer,
      isJustConquered,
      isAdjacent: isCellAdjacentToPlayer(cell),
      mergeTop:    isPlayer && isPlayerAt(cell.row - 1, cell.col),
      mergeRight:  isPlayer && isPlayerAt(cell.row,     cell.col + 1),
      mergeBottom: isPlayer && isPlayerAt(cell.row + 1, cell.col),
      mergeLeft:   isPlayer && isPlayerAt(cell.row,     cell.col - 1)
    };
  });

  return (
    <div className="w-full font-sans text-cocoa select-none">
      {/* Statystyki górne */}
      <div className="mb-3 flex items-stretch gap-3 w-full">
        <div className="w-1/2 flex items-center gap-2 text-xs text-cocoa font-bold bg-[#F2D5A7] px-3 py-2 rounded-[20px] border-2 border-[#5A3A2A] justify-center shadow-[0_3px_0_#5A3A2A]">
          <Compass className="h-3.5 w-3.5 text-pokemon-navy shrink-0" />
          <div className="text-left leading-tight">
            <span className="block text-[9px] uppercase tracking-wider text-[#5A3A2A]/80 whitespace-nowrap font-semibold">{t.statsBoard}</span>
            <span className="block text-xs font-black text-[#24456B] whitespace-nowrap">{t.statsRegions}</span>
          </div>
        </div>

        <div className="w-1/2 flex items-center gap-2 text-xs text-pokemon-navy bg-[#FFD84D] border-2 border-pokemon-navy px-3 py-2 rounded-[20px] font-black justify-center shadow-[0_3px_0_#24456B]">
          <Shield className="h-3.5 w-3.5 text-pokemon-navy shrink-0" />
          <div className="text-left leading-tight">
            <span className="block text-[9px] uppercase tracking-wider text-pokemon-navy/80 whitespace-nowrap font-semibold">{t.statsOwnFields}</span>
            <span className="block text-xs font-mono font-black text-pokemon-navy">{playerTerritorySize}/25</span>
          </div>
        </div>
      </div>

      {/* Legenda wyspowa */}
      <div className="mb-3 flex items-center justify-center gap-4 text-[10px] font-black text-[#5A3A2A] bg-white border-2 border-[#5A3A2A] py-1.5 px-4 rounded-[16px] leading-none w-full shadow-[0_3px_0_#5A3A2A] antialiased">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#FFD84D] border-2 border-[#5A3A2A] flex-shrink-0 shadow-[0_1px_0_#5A3A2A]" />
          <span className="uppercase tracking-wider font-extrabold">{t.legendMy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border-2 border-[#5A3A2A] flex-shrink-0 shadow-[0_1px_0_#5A3A2A]" />
          <span className="uppercase tracking-wider font-extrabold">{t.legendAvailable}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#EADFC9] border-2 border-[#5A3A2A] flex-shrink-0 shadow-[0_1px_0_#5A3A2A]" />
          <span className="text-[#5A3A2A] uppercase tracking-wider font-extrabold">{t.legendLocked}</span>
        </div>
      </div>

      {/* Kontener Główny Planszy */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#F2D5A7] p-2.5 sm:p-3.5 shadow-[0_6px_0_#5A3A2A] border-2 border-[#5A3A2A]">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 aspect-square relative bg-[#F2D5A7]">
          {gridItems.map((item) => {
            const cell = item.cell;
            const ownerBot = BOTS[cell.currentOwnerId];
            const isPlayerTile = item.isPlayer; // recently-conquered cells already in here
            const isLocked = !isPlayerTile && !item.isAdjacent;

            // Background / interaction class
            const bgClass = item.isJustConquered
              ? "animate-lava-takeover bg-[#FFD84D] text-[#24456B]"
              : isPlayerTile
              ? "bg-[#FFD84D] cursor-default text-[#24456B]"
              : item.isAdjacent
              ? "bg-white hover:bg-[#FFF4DF] cursor-pointer transition-all duration-150 text-[#5A3A2A]"
              : "bg-[#EADFC9] cursor-not-allowed text-[#5A3A2A]";

            // --- Polygon merging classes (player tiles only) ----------------
            // Border, corner-radius, negative-margin (to swallow the grid gap),
            // and drop-shadow toggles depending on whether each side touches
            // another player-owned tile.
            const playerBorderClass = isPlayerTile
              ? `border-[#5A3A2A] ${item.mergeTop ? "border-t-0" : "border-t-2"} ${item.mergeRight ? "border-r-0" : "border-r-2"} ${item.mergeBottom ? "border-b-0" : "border-b-2"} ${item.mergeLeft ? "border-l-0" : "border-l-2"}`
              : "border-2 border-[#5A3A2A]";

            const playerCornerClass = isPlayerTile
              ? `${(!item.mergeTop && !item.mergeLeft) ? "rounded-tl-xl sm:rounded-tl-2xl" : "rounded-tl-none"} ${(!item.mergeTop && !item.mergeRight) ? "rounded-tr-xl sm:rounded-tr-2xl" : "rounded-tr-none"} ${(!item.mergeBottom && !item.mergeLeft) ? "rounded-bl-xl sm:rounded-bl-2xl" : "rounded-bl-none"} ${(!item.mergeBottom && !item.mergeRight) ? "rounded-br-xl sm:rounded-br-2xl" : "rounded-br-none"}`
              : "rounded-xl sm:rounded-2xl";

            // gap-1.5 = 6px / sm:gap-2.5 = 10px → half on each side eats the gap when merged.
            const playerMarginClass = isPlayerTile
              ? `${item.mergeTop ? "-mt-[3px] sm:-mt-[5px]" : ""} ${item.mergeRight ? "-mr-[3px] sm:-mr-[5px]" : ""} ${item.mergeBottom ? "-mb-[3px] sm:-mb-[5px]" : ""} ${item.mergeLeft ? "-ml-[3px] sm:-ml-[5px]" : ""}`
              : "";

            const playerShadowClass = isPlayerTile
              ? (item.mergeBottom ? "" : "shadow-[0_3px_0_#5A3A2A]")
              : "shadow-[0_3px_0_#5A3A2A]";

            // Player tile sits above neighbouring rivals so the negative margins overlap cleanly.
            const playerZClass = isPlayerTile ? "z-10" : "";

            const tooltipText = isPlayerTile
              ? `${t.botTooltipYourTerritory} (${playerFieldsSet.size})`
              : ownerBot
                ? `${t.botTooltipRegion}: ${t.botLabel} ${ownerBot.number} · ${t[ownerBot.difficulty]}`
                : "";

            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.isAdjacent && ownerBot) onSelectCell(cell, ownerBot);
                }}
                disabled={!item.isAdjacent}
                className={`relative flex flex-col items-center justify-between p-1 pt-1.5 pb-1 transition-all outline-none active:shadow-none active:translate-y-0.5 ${playerBorderClass} ${playerCornerClass} ${playerMarginClass} ${playerShadowClass} ${playerZClass} ${bgClass}`}
                style={{
                  gridRow: `${item.gridRowStart} / span 1`,
                  gridColumn: `${item.gridColStart} / span 1`,
                }}
                title={tooltipText}
              >
                {/* Player tile */}
                {isPlayerTile && (
                  <div className="flex flex-col items-center justify-center my-auto h-full w-full select-none gap-0.5 sm:gap-1">
                    <span className="text-base sm:text-xl lg:text-2xl animate-pulse">⚡</span>
                    <span className="font-display font-black text-[9px] sm:text-[10px] text-[#24456B] uppercase tracking-wider leading-none">
                      {t.playerTileLabel}
                    </span>
                  </div>
                )}

                {/* Bot tile */}
                {!isPlayerTile && ownerBot && (
                  <>
                    {/* Bot avatar */}
                    <span className={`text-base sm:text-xl z-10 select-none transition-all leading-none ${isLocked ? "grayscale opacity-40" : ""}`}>
                      {ownerBot.avatar}
                    </span>

                    {/* Bot label */}
                    <span
                      className="z-10 select-none block text-center antialiased whitespace-nowrap leading-none px-0.5 w-full uppercase tracking-tight my-auto font-black"
                      style={{
                        fontSize: "clamp(8.5px, 1.1vh, 10.5px)",
                        color: item.isAdjacent ? "#24456B" : "#5A3A2A",
                        WebkitFontSmoothing: "antialiased"
                      }}
                    >
                      {t.botLabel} {ownerBot.number}
                    </span>

                    {/* Difficulty bar */}
                    <div
                      className="w-full h-1 mt-auto shrink-0 rounded-full border border-cocoa/30"
                      style={{
                        backgroundColor: DIFFICULTY_HEX[ownerBot.difficulty],
                        opacity: isLocked ? 0.4 : 1
                      }}
                    />
                  </>
                )}

                {/* Hover combat overlay */}
                {item.isAdjacent && (
                  <div className="absolute inset-0 bg-lemon-yellow/10 opacity-0 hover:opacity-100 flex items-center justify-center transition-all rounded-xl sm:rounded-2xl z-20">
                    <Swords className="h-4 w-4 text-pokemon-navy" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
