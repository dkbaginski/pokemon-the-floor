import { CSSProperties } from "react";
import { GridCell, Trainer, TRAINERS } from "../trainers";
import { POKEMON_TYPES_PL, TypeDetail, getTypeName } from "../pokemonData";
import { Shield, Swords, Compass } from "lucide-react";

export function getTrainerName(trainer: Trainer, language: "pl" | "en"): string {
  if (language === "pl") return trainer.name;
  
  const mapping: Record<string, string> = {
    gary: "Gary Oak",
    brock: "Brock",
    misty: "Misty",
    lt_surge: "Lt. Surge",
    erika: "Erika",
    koga: "Koga",
    sabrina: "Sabrina",
    blaine: "Blaine",
    giovanni: "Giovanni",
    jessie: "Jessie",
    james: "James",
    nurse_joy: "Nurse Joy",
    officer_jenny: "Officer Jenny",
    bug_catcher: "Bug Catcher",
    lass_carrie: "Lass Carrie",
    fisherman: "Fisherman Ralph",
    lorelei: "Lorelei",
    bruno: "Bruno",
    agatha: "Agatha",
    lance: "Lance",
    camper: "Camper Liam",
    picnicker: "Picnicker Diana",
    scientist: "Scientist Taylor",
    red: "Red",
    player: "You (Ash)"
  };
  return mapping[trainer.id] || trainer.name;
}

// Helper function to extract the real, compact name under mobile grid view constraint
export function getTrainerShortName(trainer: Trainer, language: "pl" | "en" = "pl"): string {
  if (language === "pl") {
    const fullName = trainer.name;
    if (fullName === "Łapacz Robaków") return "Łapacz";
    if (fullName.includes("Ty") || fullName.toLowerCase().includes("ash")) return "Ty";
    const parts = fullName.split(" ");
    if (parts.length > 1) {
      // If the first word is a long polish profession title, return the actual name (the last word)
      const titles = ["Obozowicz", "Piknikowiczka", "Naukowiec", "Rybak", "Oficer", "Pielęgniarka", "Czerwony"];
      if (titles.includes(parts[0])) {
        return parts[parts.length - 1]; // e.g. "Obozowicz Liam" -> "Liam", "Oficer Jenny" -> "Jenny"
      }
      // If it is Lt. Surge
      if (parts[0].endsWith(".")) {
        return parts[parts.length - 1]; // e.g. "Lt. Surge" -> "Surge"
      }
      return parts[0];
    }
    return fullName;
  } else {
    const mapping: Record<string, string> = {
      gary: "Gary",
      brock: "Brock",
      misty: "Misty",
      lt_surge: "Surge",
      erika: "Erika",
      koga: "Koga",
      sabrina: "Sabrina",
      blaine: "Blaine",
      giovanni: "Giovanni",
      jessie: "Jessie",
      james: "James",
      nurse_joy: "Joy",
      officer_jenny: "Jenny",
      bug_catcher: "Catcher",
      lass_carrie: "Carrie",
      fisherman: "Ralph",
      lorelei: "Lorelei",
      bruno: "Bruno",
      agatha: "Agatha",
      lance: "Lance",
      camper: "Liam",
      picnicker: "Diana",
      scientist: "Taylor",
      red: "Red",
      player: "You"
    };
    return mapping[trainer.id] || trainer.name;
  }
}

interface FloorGridProps {
  grid: GridCell[];
  onSelectCell: (cell: GridCell, trainer: Trainer) => void;
  playerTerritorySize: number;
  justConqueredCellId?: number | null; // Lava flow takeover trigger prop
  language: "pl" | "en";
  t: any;
}

interface GridItem {
  key: string;
  gridRowStart: number; // 1-indexed (1..5)
  gridColStart: number; // 1-indexed (1..5)
  rowSpan: number;
  colSpan: number;
  isPlayer: boolean;
  cells: GridCell[];
  isAdjacent: boolean;
  isJustConquered: boolean;
  primaryType: string;
}

export default function FloorGrid({ grid, onSelectCell, playerTerritorySize, justConqueredCellId, language, t }: FloorGridProps) {
  // Check if a cell is adjacent to the player's territory
  const isCellAdjacentToPlayer = (cell: GridCell) => {
    if (cell.currentOwnerId === "player") return false;

    // Check neighbors: up, down, left, right
    for (const pCell of grid) {
      if (pCell.currentOwnerId === "player") {
        const isNeighbor =
          Math.abs(pCell.row - cell.row) + Math.abs(pCell.col - cell.col) === 1;
        if (isNeighbor) return true;
      }
    }
    return false;
  };

  // Keep ALL grid items strictly 1x1 to maintain pristine orthogonal structure
  const gridItems: GridItem[] = grid.map((cell) => {
    const isPCell = cell.currentOwnerId === "player" && cell.id !== justConqueredCellId;
    return {
      key: `cell-${cell.id}`,
      gridRowStart: cell.row + 1,
      gridColStart: cell.col + 1,
      rowSpan: 1,
      colSpan: 1,
      isPlayer: isPCell,
      cells: [cell],
      isAdjacent: isCellAdjacentToPlayer(cell),
      isJustConquered: cell.id === justConqueredCellId,
      primaryType: cell.primaryType
    };
  });

  // Calculate bounding box of player owned cells to center the single high-contrast "TY" indicator
  const playerCells = grid.filter((c) => c.currentOwnerId === "player" && c.id !== justConqueredCellId);
  let playerBadgeStyle: CSSProperties | null = null;
  
  if (playerCells.length > 0) {
    const rows = playerCells.map((c) => c.row);
    const cols = playerCells.map((c) => c.col);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    
    // Compute geometric center of the conquered cluster bounding box
    const centerRow = (minRow + maxRow) / 2;
    const centerCol = (minCol + maxCol) / 2;
    
    // Translate directly to centered relative percentages inside the grid container
    const topPct = centerRow * 20 + 10;
    const leftPct = centerCol * 20 + 10;
    
    playerBadgeStyle = {
      position: "absolute",
      top: `${topPct}%`,
      left: `${leftPct}%`,
      transform: "translate(-50%, -50%)",
      zIndex: 20,
    };
  }

  return (
    <div className="w-full font-sans text-cocoa">
      {/* Symmetrical Top-Bar Metric Containers */}
      <div className="mb-3 flex items-stretch gap-3 w-full">
        {/* Plansza Metric */}
        <div className="w-1/2 flex items-center gap-2 text-xs text-cocoa font-bold bg-[#F2D5A7] px-3 py-2 rounded-[20px] border-2 border-[#5A3A2A] justify-center shadow-[0_3px_0_#5A3A2A]">
          <Compass className="h-3.5 w-3.5 text-pokemon-navy shrink-0" />
          <div className="text-left leading-tight">
            <span className="block text-[9px] uppercase tracking-wider text-[#5A3A2A]/80 whitespace-nowrap font-semibold">{t.statsBoard}</span>
            <span className="block text-xs font-black text-[#24456B] whitespace-nowrap">{t.statsRegions}</span>
          </div>
        </div>
        
        {/* Twoje pola Metric */}
        <div className="w-1/2 flex items-center gap-2 text-xs text-pokemon-navy bg-[#FFD84D] border-2 border-pokemon-navy px-3 py-2 rounded-[20px] font-black justify-center shadow-[0_3px_0_#24456B]">
          <Shield className="h-3.5 w-3.5 text-pokemon-navy shrink-0" />
          <div className="text-left leading-tight">
            <span className="block text-[9px] uppercase tracking-wider text-pokemon-navy/80 whitespace-nowrap font-semibold">{t.statsOwnFields}</span>
            <span className="block text-xs font-mono font-black text-pokemon-navy">{playerTerritorySize}/25</span>
          </div>
        </div>
      </div>

      {/* Inline Micro-Legend (Option A) to fully eliminate scrolling, keeping focus on the 5x5 Grid only */}
      <div className="mb-3 flex items-center justify-center gap-4 text-[10px] font-black text-[#5A3A2A] bg-white-frost border-2 border-[#5A3A2A] py-1.5 px-4 rounded-[16px] leading-none w-full select-none shadow-[0_3px_0_#5A3A2A] antialiased" style={{ WebkitFontSmoothing: "antialiased" }}>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#BDEBFF] border-2 border-[#5A3A2A] flex-shrink-0 shadow-[0_1px_0_#5A3A2A]" />
          <span className="uppercase tracking-wider font-extrabold">{t.legendMy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#F2D5A7] border-2 border-[#5A3A2A] flex-shrink-0 shadow-[0_1px_0_#5A3A2A]" />
          <span className="uppercase tracking-wider font-extrabold">{t.legendOpponent}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#B5A591] border-2 border-[#5A3A2A] flex-shrink-0 flex items-center justify-center text-[7px] font-black text-white shadow-[0_1px_0_#5A3A2A] select-none">✕</span>
          <span className="text-[#5A3A2A] uppercase tracking-wider font-extrabold">{t.legendLocked}</span>
        </div>
      </div>

      {/* Grid container setting explicit row and column template spans to hold the layout rigidly */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#FFF4DF] p-2 sm:p-3.5 shadow-md border-2 border-[#5A3A2A]">
        <div 
          className="grid gap-1.5 sm:gap-2 aspect-square"
          style={{
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gridTemplateRows: "repeat(5, minmax(0, 1fr))",
          }}
        >
          {gridItems.map((item) => {
            const representativeCell = item.cells[0];
            const owner = TRAINERS[representativeCell.currentOwnerId] || TRAINERS.player;
            const originalTrainer = TRAINERS[representativeCell.initialTrainerId] || TRAINERS.player;

            // COORDINATE MATH FOR NEIGHBORLY DISSOLUTION OUTSIDE RECTANGLE
            const r = item.gridRowStart - 1;
            const c = item.gridColStart - 1;
            const rowSpan = item.rowSpan;
            const colSpan = item.colSpan;

            const hasLeftNeighbor = item.isPlayer && grid.some(g => g.currentOwnerId === "player" && g.id !== justConqueredCellId && g.row >= r && g.row < r + rowSpan && g.col === c - 1);
            const hasRightNeighbor = item.isPlayer && grid.some(g => g.currentOwnerId === "player" && g.id !== justConqueredCellId && g.row >= r && g.row < r + rowSpan && g.col === c + colSpan);
            const hasTopNeighbor = item.isPlayer && grid.some(g => g.currentOwnerId === "player" && g.id !== justConqueredCellId && g.col >= c && g.col < c + colSpan && g.row === r - 1);
            const hasBottomNeighbor = item.isPlayer && grid.some(g => g.currentOwnerId === "player" && g.id !== justConqueredCellId && g.col >= c && g.col < c + colSpan && g.row === r + rowSpan);

            // Dissolve borders for adjacent player rect blocks
            const dyBorders = item.isPlayer ? {
              borderTop: hasTopNeighbor ? "none" : "2px solid #5A3A2A",
              borderBottom: hasBottomNeighbor ? "none" : "2px solid #5A3A2A",
              borderLeft: hasLeftNeighbor ? "none" : "2px solid #5A3A2A",
              borderRight: hasRightNeighbor ? "none" : "2px solid #5A3A2A",
            } : {};

            // Render border radii only on ultimate outer boundaries to form a seamless organic zone
            const dyRound = item.isPlayer ? {
              borderTopLeftRadius: hasTopNeighbor || hasLeftNeighbor ? "0px" : "16px",
              borderTopRightRadius: hasTopNeighbor || hasRightNeighbor ? "0px" : "16px",
              borderBottomLeftRadius: hasBottomNeighbor || hasLeftNeighbor ? "0px" : "16px",
              borderBottomRightRadius: hasBottomNeighbor || hasRightNeighbor ? "0px" : "16px",
            } : {};

            const bgClass = item.isJustConquered
              ? "animate-lava-takeover"
              : item.isPlayer
              ? "bg-[#BDEBFF] cursor-default text-[#5A3A2A]"
              : item.isAdjacent
              ? "bg-white border-2 border-dashed border-[#24456B] hover:bg-lemon-yellow/30 cursor-pointer transition-all duration-150 text-[#5A3A2A]"
              : "bg-[#F2D5A7] border-2 border-[#5A3A2A]/30 cursor-not-allowed text-[#5A3A2A]";

            const tooltipText = item.isPlayer
              ? (language === "pl" ? `Twoje terytorium podbitych terytoriów (Liczba regionów: ${item.cells.length})` : `Your conquered territory (Regions count: ${item.cells.length})`)
              : (language === "pl" 
                  ? `Region: ${getTrainerName(originalTrainer, language)} (${getTypeName(item.primaryType, language)}), Obecny Właściciel: ${getTrainerName(owner, language)}`
                  : `Region: ${getTrainerName(originalTrainer, language)} (${getTypeName(item.primaryType, language)}), Current Owner: ${getTrainerName(owner, language)}`);

            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.isAdjacent) {
                    onSelectCell(representativeCell, owner);
                  }
                }}
                disabled={!item.isAdjacent}
                className={`relative flex flex-col items-center justify-center p-1 sm:p-2 transition-all outline-none ${
                  (!item.isPlayer || item.isJustConquered) ? "rounded-2xl overflow-hidden border-2 border-[#5A3A2A]" : ""
                } ${bgClass}`}
                style={{
                  gridRow: `${item.gridRowStart} / span ${item.rowSpan}`,
                  gridColumn: `${item.gridColStart} / span ${item.colSpan}`,
                  ...dyBorders,
                  ...dyRound
                }}
                title={tooltipText}
              >
                {/* Visual indicator of type colors: segmented lines at bottom - Removed for TY to create clean unified map layout */}
                {!item.isPlayer && (
                  <div className="absolute bottom-1 left-1 right-1 h-1.5 flex gap-0.5 z-10 overflow-hidden rounded-full border border-cocoa">
                    {item.cells.map((cl) => {
                      const cellBg = POKEMON_TYPES_PL[cl.primaryType]?.bgHex || "#94a3b8";
                      return (
                        <span 
                          key={cl.id}
                          className="flex-1 h-full first:rounded-l-full last:rounded-r-full"
                          style={{ backgroundColor: cellBg }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Trainer Avatar - Render exactly once inside the entire merged button zone (Hidden for user cells to keep clean) */}
                {!item.isPlayer && (
                  <span className={`text-base sm:text-2xl z-10 select-none transition-all ${(!item.isPlayer && !item.isAdjacent) ? "grayscale contrast-75 brightness-95 opacity-60" : ""}`}>
                    {owner.avatar}
                  </span>
                )}

                {/* Label centered within the entire block (Hidden for user cells to preserve flat visual blocks) */}
                {!item.isPlayer && (
                  <span 
                    className="z-10 mt-1 select-none text-center block font-black text-[#5A3A2A] uppercase antialiased tracking-tight leading-none"
                    style={{
                      fontSize: "clamp(9px, 1.2vh, 12px)",
                      whiteSpace: "nowrap",
                      WebkitFontSmoothing: "antialiased"
                    }}
                  >
                    {getTrainerShortName(owner, language)}
                  </span>
                )}

                {/* Adjacent action hover overlay */}
                {item.isAdjacent && (
                  <div className="absolute inset-0 bg-lemon-yellow/10 opacity-0 hover:opacity-100 flex items-center justify-center transition-all bg-[#FFF4DF]/20 rounded-xl sm:rounded-2xl">
                    <Swords className="h-4 w-4 text-pokemon-navy" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Absolute-centered single Player Badge over the bounding box */}
          {playerBadgeStyle && (
            <div 
              style={playerBadgeStyle}
              className="bg-white-frost border-2 border-[#24456B] shadow-[0_4px_0_#24456B] px-3.5 py-1.5 rounded-[20px] flex items-center justify-center gap-1.5 pointer-events-none z-20 animate-pulse"
            >
              <span className="text-xs select-none bg-lemon-yellow border border-cocoa rounded-full w-5 h-5 flex items-center justify-center text-cocoa font-black leading-none">⚡</span>
              <span className="text-[10px] sm:text-xs font-black text-pokemon-navy tracking-widest uppercase font-display">{t.playerTileLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
