import { CSSProperties } from "react";
import { GridCell, Trainer, TRAINERS } from "../trainers";
import { POKEMON_TYPES_PL, getTypeName } from "../pokemonData";
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

export function getTrainerShortName(trainer: Trainer, language: "pl" | "en" = "pl"): string {
  if (language === "pl") {
    const fullName = trainer.name;
    if (fullName === "Łapacz Robaków") return "Łapacz";
    if (fullName.includes("Ty") || fullName.toLowerCase().includes("ash")) return "Ty";
    const parts = fullName.split(" ");
    if (parts.length > 1) {
      const titles = ["Obozowicz", "Piknikowiczka", "Naukowiec", "Rybak", "Oficer", "Pielęgniarka", "Czerwony"];
      if (titles.includes(parts[0])) {
        return parts[parts.length - 1];
      }
      if (parts[0].endsWith(".")) {
        return parts[parts.length - 1];
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
  justConqueredCellId?: number | null;
  language: "pl" | "en";
  t: any;
}

interface GridItem {
  key: string;
  gridRowStart: number;
  gridColStart: number;
  rowSpan: number;
  colSpan: number;
  isPlayer: boolean;
  cells: GridCell[];
  isAdjacent: boolean;
  isJustConquered: boolean;
  primaryType: string;
}

export default function FloorGrid({ grid, onSelectCell, playerTerritorySize, justConqueredCellId, language, t }: FloorGridProps) {
  
  // O(1) Wykorzystanie zestawu struktur współrzędnych dla błyskawicznego mapowania
  const playerFieldsSet = new Set(
    grid
      .filter(c => c.currentOwnerId === "player" && c.id !== justConqueredCellId)
      .map(c => `${c.row}-${c.col}`)
  );

  const isCellAdjacentToPlayer = (cell: GridCell) => {
    if (cell.currentOwnerId === "player") return false;
    const { row, col } = cell;
    return (
      playerFieldsSet.has(`${row - 1}-${col}`) ||
      playerFieldsSet.has(`${row + 1}-${col}`) ||
      playerFieldsSet.has(`${row}-${col - 1}`) ||
      playerFieldsSet.has(`${row}-${col + 1}`)
    );
  };

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

  // Precyzyjne pozycjonowanie plakietki przy użyciu odległości Manhattan
  const playerCells = grid.filter((c) => c.currentOwnerId === "player" && c.id !== justConqueredCellId);
  let playerBadgeStyle: CSSProperties | null = null;
  
  if (playerCells.length > 0) {
    const rows = playerCells.map((c) => c.row);
    const cols = playerCells.map((c) => c.col);
    const targetRow = (Math.min(...rows) + Math.max(...rows)) / 2;
    const targetCol = (Math.min(...cols) + Math.max(...cols)) / 2;

    const closestCell = playerCells.reduce((closest, current) => {
      const currentDist = Math.abs(current.row - targetRow) + Math.abs(current.col - targetCol);
      const closestDist = Math.abs(closest.row - targetRow) + Math.abs(closest.col - targetCol);
      return currentDist < closestDist ? current : closest;
    });

    const rowCount = 5;
    const cellSizePct = 100 / rowCount;

    playerBadgeStyle = {
      position: "absolute",
      top: `${closestCell.row * cellSizePct + (cellSizePct / 2)}%`,
      left: `${closestCell.col * cellSizePct + (cellSizePct / 2)}%`,
      transform: "translate(-50%, -50%)",
      zIndex: 15, // Bezpieczna warstwa wewnątrz Map Grid
    };
  }

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
          <span className="w-3 h-3 rounded-full bg-[#BDEBFF] border-2 border-[#5A3A2A] flex-shrink-0 shadow-[0_1px_0_#5A3A2A]" />
          <span className="uppercase tracking-wider font-extrabold">{t.legendMy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-white border-2 border-[#5A3A2A] flex-shrink-0 shadow-[0_1px_0_#5A3A2A]" />
          <span className="uppercase tracking-wider font-extrabold">{t.legendGridTarget || "Aktywne"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#F2D5A7] border-2 border-[#5A3A2A] flex-shrink-0 flex items-center justify-center text-[8px] font-black text-white shadow-[0_1px_0_#5A3A2A] leading-none">✕</span>
          <span className="text-[#5A3A2A] uppercase tracking-wider font-extrabold">{t.legendLocked}</span>
        </div>
      </div>

      {/* Kontener Główny Planszy - Wyraźny kontrast od tła cream-base aplikacji */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#F2D5A7] p-2 sm:p-3 shadow-md border-2 border-[#5A3A2A]">
        {/* Usunięcie gap-1.5 i wdrożenie gap-0 umożliwia perfekcyjne zlanie kafelków gracza */}
        <div 
          className="grid gap-0 aspect-square relative bg-[#F2D5A7]"
          style={{
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gridTemplateRows: "repeat(5, minmax(0, 1fr))",
          }}
        >
          {gridItems.map((item) => {
            const representativeCell = item.cells[0];
            const owner = TRAINERS[representativeCell.currentOwnerId] || TRAINERS.player;
            const originalTrainer = TRAINERS[representativeCell.initialTrainerId] || TRAINERS.player;

            const r = item.gridRowStart - 1;
            const c = item.gridColStart - 1;

            // Wyznaczanie sąsiadów zoptymalizowanym Setem
            const hasLeftNeighbor = item.isPlayer && playerFieldsSet.has(`${r}-${c - 1}`);
            const hasRightNeighbor = item.isPlayer && playerFieldsSet.has(`${r}-${c + 1}`);
            const hasTopNeighbor = item.isPlayer && playerFieldsSet.has(`${r - 1}-${c}`);
            const hasBottomNeighbor = item.isPlayer && playerFieldsSet.has(`${r + 1}-${c}`);

            // Dynamiczne wygaszanie krawędzi WEWNĘTRZNYCH terytorium
            const borderStyle = item.isPlayer ? {
              borderTop: hasTopNeighbor ? "none" : "2px solid #5A3A2A",
              borderBottom: hasBottomNeighbor ? "none" : "2px solid #5A3A2A",
              borderLeft: hasLeftNeighbor ? "none" : "2px solid #5A3A2A",
              borderRight: hasRightNeighbor ? "none" : "2px solid #5A3A2A",
            } : {
              border: "2px solid #5A3A2A"
            };

            // Dynamiczne zaokrąglanie rogów wyłącznie na skrajach terytorium
            const roundStyle = item.isPlayer ? {
              borderTopLeftRadius: hasTopNeighbor || hasLeftNeighbor ? "0px" : "14px",
              borderTopRightRadius: hasTopNeighbor || hasRightNeighbor ? "0px" : "14px",
              borderBottomLeftRadius: hasBottomNeighbor || hasLeftNeighbor ? "0px" : "14px",
              borderBottomRightRadius: hasBottomNeighbor || hasRightNeighbor ? "0px" : "14px",
            } : {
              borderRadius: "14px"
            };

            // Stark Contrast - Nowe definicje tła eliminujące pastelowy zlew
            const bgClass = item.isJustConquered
              ? "animate-lava-takeover text-[#5A3A2A]"
              : item.isPlayer
              ? "bg-[#BDEBFF] cursor-default text-[#5A3A2A]"
              : item.isAdjacent
              ? "bg-white hover:bg-lemon-yellow/20 cursor-pointer transition-all duration-150 text-[#5A3A2A]"
              : "bg-[#F2D5A7] cursor-not-allowed text-[#5A3A2A]/60";

            const tooltipText = item.isPlayer
              ? (language === "pl" ? `Twoje terytorium (${item.cells.length} regionów)` : `Your territory (${item.cells.length} regions)`)
              : (language === "pl" 
                  ? `Region: ${getTrainerName(originalTrainer, language)} (${getTypeName(item.primaryType, language)}), Lider: ${getTrainerName(owner, language)}`
                  : `Region: ${getTrainerName(originalTrainer, language)} (${getTypeName(item.primaryType, language)}), Leader: ${getTrainerName(owner, language)}`);

            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.isAdjacent) onSelectCell(representativeCell, owner);
                }}
                disabled={!item.isAdjacent}
                className={`relative flex flex-col items-center justify-between p-1 pt-1.5 pb-1 transition-all outline-none ${bgClass}`}
                style={{
                  gridRow: `${item.gridRowStart} / span ${item.rowSpan}`,
                  gridColumn: `${item.gridColStart} / span ${item.colSpan}`,
                  ...borderStyle,
                  ...roundStyle
                }}
                title={tooltipText}
              >
                {/* Avatar lidera */}
                {!item.isPlayer && (
                  <span className={`text-base sm:text-xl z-10 select-none transition-all leading-none ${(!item.isPlayer && !item.isAdjacent) ? "grayscale opacity-40" : ""}`}>
                    {owner.avatar}
                  </span>
                )}

                {/* Czytelne imię bez ucinania */}
                {!item.isPlayer && (
                  <span 
                    className="z-10 select-none block text-center antialiased whitespace-nowrap leading-none px-0.5 w-full uppercase tracking-tight my-auto font-black"
                    style={{
                      fontSize: "clamp(9px, 1.1vh, 11px)",
                      color: item.isAdjacent ? "#24456B" : "#5A3A2A",
                      WebkitFontSmoothing: "antialiased"
                    }}
                  >
                    {getTrainerShortName(owner, language)}
                  </span>
                )}

                {/* Pasek typów zintegrowany z układem */}
                {!item.isPlayer && (
                  <div className="w-full h-1 flex gap-0.5 z-10 overflow-hidden rounded-full border border-cocoa/40 mt-auto shrink-0">
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

                {/* Nakładka walki */}
                {item.isAdjacent && (
                  <div className="absolute inset-0 bg-lemon-yellow/10 opacity-0 hover:opacity-100 flex items-center justify-center transition-all rounded-xl z-20">
                    <Swords className="h-4 w-4 text-pokemon-navy" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Unikalny, wycentrowany geometrycznie znacznik gracza */}
          {playerBadgeStyle && (
            <div 
              style={playerBadgeStyle}
              className="bg-white border-2 border-[#24456B] shadow-[0_4px_0_#24456B] px-3.5 py-1.5 rounded-[20px] flex items-center justify-center gap-1.5 pointer-events-none z-20 animate-pulse"
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
