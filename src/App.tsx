import { useState, useEffect } from "react";
import { INITIAL_GRID, BOTS, Bot, GridCell } from "./bots";
import { getPokemonImageUrl, POKEMON_LIST, POKEMON_TYPES_PL, getTypeName } from "./pokemonData";
import FloorGrid from "./components/FloorGrid";
import DuelArea from "./components/DuelArea";
import PokedexView from "./components/PokedexView";
import TutorialOverlay from "./components/TutorialOverlay";
import { translations } from "./translations";
import {
  Trophy,
  Sparkles,
  HelpCircle,
  BookOpen,
  Swords,
  Play,
  ShieldCheck,
  Activity,
  ChevronRight,
  X
} from "lucide-react";
import {
  NavBoardIcon,
  NavPokedexIcon,
  NavHelpIcon,
  PokeBallLogoIcon,
  GlobeIcon,
  ClockRewindIcon,
  ResetIcon,
  MapAtlasIcon,
  SwordsCrossedIcon
} from "./components/icons";

type ScreenState = "start" | "board" | "challenge" | "duel" | "duel_win" | "duel_lose" | "victory";

const SHOWN_LOG_MAX = 50;

export default function App() {
  // --- Language / Translation States ---
  const [language, setLanguage] = useState<"pl" | "en">(() => {
    const saved = localStorage.getItem("the_floor_language");
    if (saved === "pl" || saved === "en") return saved;
    const sysLang = navigator.language?.substring(0, 2).toLowerCase();
    return sysLang === "pl" ? "pl" : "en";
  });

  const changeLanguage = (lang: "pl" | "en") => {
    setLanguage(lang);
    localStorage.setItem("the_floor_language", lang);
  };

  const t = translations[language];

  // --- Game Core States ---
  const [screen, setScreen] = useState<ScreenState>("start");
  const [grid, setGrid] = useState<GridCell[]>(INITIAL_GRID);
  const [unlockedPokemonIds, setUnlockedPokemonIds] = useState<number[]>([]);
  const [seenPokemonIds, setSeenPokemonIds] = useState<number[]>([]);
  const [shownLog, setShownLog] = useState<number[]>([]);
  const [round, setRound] = useState<number>(1);
  const [gameStartTime, setGameStartTime] = useState<number>(() => Date.now());
  const [historyTab, setHistoryTab] = useState<"goals" | "duels">("goals");
  const [lossToast, setLossToast] = useState<{ botNumber: number; cellId: number } | null>(null);
  const [tutorialSeen, setTutorialSeen] = useState<boolean>(() => {
    return typeof window !== "undefined" && localStorage.getItem("the_floor_tutorial_seen") === "1";
  });
  const dismissTutorial = () => {
    setTutorialSeen(true);
    localStorage.setItem("the_floor_tutorial_seen", "1");
  };

  // --- Selected Battle states ---
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<Bot | null>(null);
  const [defenseMode, setDefenseMode] = useState(false);

  // --- Active Duel variables ---
  const [activeOpponent, setActiveOpponent] = useState<Bot | null>(null);
  const [activeBotPool, setActiveBotPool] = useState<number[]>([]);

  // --- Post-duel summary trackers ---
  const [duelStats, setDuelStats] = useState({
    winnerId: "",
    userCorrect: 0,
    userPassed: 0,
    timerRemaining: 0,
    lastPokemonId: null as number | null,
    newlyUnlocked: [] as number[],
  });

  // --- UI state helper ---
  const [showPokedex, setShowPokedex] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBattleLog, setShowBattleLog] = useState(false);
  const [recentlyConqueredCellIds, setRecentlyConqueredCellIds] = useState<number[]>([]);

  interface LogItem {
    key: string;
    params?: Record<string, string>;
  }

  const [logs, setLogs] = useState<LogItem[]>([
    { key: "logInit1" },
    { key: "logInit2" }
  ]);

  const renderLogMessage = (item: any) => {
    if (typeof item === "string") return item;
    let msg = (t as any)[item.key] || item.key;
    if (item.params) {
      Object.entries(item.params).forEach(([k, v]) => {
        msg = (msg as string).replace(`{${k}}`, v as string);
      });
    }
    return msg as string;
  };

  // Helper: localized bot name ("Gracz 7" / "Player 7").
  const botName = (b: Bot | null): string => (b ? `${t.botLabel} ${b.number}` : "");

  // --- Initialize Grid, Pokedex & Seen from LocalStorage (+ migrate legacy schema) ---
  useEffect(() => {
    const savedGrid = localStorage.getItem("the_floor_pokemon_grid");
    if (savedGrid) {
      try {
        const parsed = JSON.parse(savedGrid);
        const isLegacy =
          !Array.isArray(parsed) ||
          parsed.length !== 25 ||
          parsed.some(
            (c: any) =>
              c &&
              (typeof c.primaryType !== "undefined" ||
                typeof c.initialTrainerId !== "undefined" ||
                (typeof c.currentOwnerId === "string" &&
                  c.currentOwnerId !== "player" &&
                  !c.currentOwnerId.startsWith("bot_")))
          );
        if (isLegacy) {
          localStorage.removeItem("the_floor_pokemon_grid");
          setGrid(INITIAL_GRID);
        } else {
          setGrid(parsed);
        }
      } catch (e) {
        setGrid(INITIAL_GRID);
      }
    } else {
      setGrid(INITIAL_GRID);
    }

    const savedPokedex = localStorage.getItem("the_floor_pokemon_pokedex");
    if (savedPokedex) {
      try {
        setUnlockedPokemonIds(JSON.parse(savedPokedex));
      } catch (e) {
        setUnlockedPokemonIds([]);
      }
    } else {
      setUnlockedPokemonIds([]);
    }

    const savedSeen = localStorage.getItem("the_floor_pokemon_seen");
    if (savedSeen) {
      try {
        setSeenPokemonIds(JSON.parse(savedSeen));
      } catch (e) {
        setSeenPokemonIds([]);
      }
    } else {
      setSeenPokemonIds([]);
    }

    const savedShown = localStorage.getItem("the_floor_pokemon_shown_log");
    if (savedShown) {
      try {
        const parsed = JSON.parse(savedShown);
        if (Array.isArray(parsed)) setShownLog(parsed.slice(-SHOWN_LOG_MAX));
      } catch (e) {
        setShownLog([]);
      }
    }

    const savedRound = localStorage.getItem("the_floor_round");
    if (savedRound) {
      const n = parseInt(savedRound, 10);
      if (Number.isFinite(n) && n >= 1) setRound(n);
    }

    const savedStart = localStorage.getItem("the_floor_game_start");
    if (savedStart) {
      const n = parseInt(savedStart, 10);
      if (Number.isFinite(n) && n > 0) {
        setGameStartTime(n);
      } else {
        localStorage.setItem("the_floor_game_start", String(Date.now()));
      }
    } else {
      localStorage.setItem("the_floor_game_start", String(Date.now()));
    }
  }, []);

  const saveGridToStorage = (g: GridCell[]) => {
    localStorage.setItem("the_floor_pokemon_grid", JSON.stringify(g));
  };

  const handleSeePokemon = (id: number) => {
    setSeenPokemonIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem("the_floor_pokemon_seen", JSON.stringify(updated));
      return updated;
    });
  };

  const handleUnlockPokemon = (id: number) => {
    setUnlockedPokemonIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem("the_floor_pokemon_pokedex", JSON.stringify(updated));
      return updated;
    });
    handleSeePokemon(id);
  };

  // Clear the conquest-pulse highlight after the animation finishes (2.2s in CSS).
  useEffect(() => {
    if (recentlyConqueredCellIds.length === 0) return;
    const timer = setTimeout(() => setRecentlyConqueredCellIds([]), 2200);
    return () => clearTimeout(timer);
  }, [recentlyConqueredCellIds]);

  const handlePokemonShown = (id: number) => {
    setShownLog((prev) => {
      const next = [...prev, id].slice(-SHOWN_LOG_MAX);
      localStorage.setItem("the_floor_pokemon_shown_log", JSON.stringify(next));
      return next;
    });
  };

  // --- Main reset trigger ---
  const handleFullReset = () => {
    setShowResetConfirm(true);
  };

  const executeFullReset = () => {
    setGrid(INITIAL_GRID);
    saveGridToStorage(INITIAL_GRID);
    setScreen("start");
    setSelectedCell(null);
    setSelectedOpponent(null);
    setDefenseMode(false);
    setRecentlyConqueredCellIds([]);
    setRound(1);
    localStorage.setItem("the_floor_round", "1");
    const now = Date.now();
    setGameStartTime(now);
    localStorage.setItem("the_floor_game_start", String(now));
    setLogs([
      { key: "logReset1" },
      { key: "logReset2" }
    ]);
    setShowResetConfirm(false);
  };

  // --- Compute player stats ---
  const playerControlledCells = grid.filter((c) => c.currentOwnerId === "player");
  const playerTerritorySize = playerControlledCells.length;

  // Attackable (adjacent, non-player) tile count — shown as "× N ATAKI" pill in board banner.
  const attackableCount = (() => {
    const playerPositions = new Set(
      playerControlledCells.map((c) => `${c.row}-${c.col}`)
    );
    let count = 0;
    for (const c of grid) {
      if (c.currentOwnerId === "player") continue;
      const adj =
        playerPositions.has(`${c.row - 1}-${c.col}`) ||
        playerPositions.has(`${c.row + 1}-${c.col}`) ||
        playerPositions.has(`${c.row}-${c.col - 1}`) ||
        playerPositions.has(`${c.row}-${c.col + 1}`);
      if (adj) count++;
    }
    return count;
  })();

  // --- Game Loop: Start Duel ---
  const handleLaunchDuel = () => {
    if (!selectedCell || !selectedOpponent) return;

    setRecentlyConqueredCellIds([]);
    setDefenseMode(false); // ensure no stale defense state after retry
    setActiveOpponent(selectedOpponent);
    setActiveBotPool(selectedOpponent.pokemonPool);
    setScreen("duel");
  };

  // --- Duel Finished Core ---
  const handleDuelFinish = (
    winnerId: "player" | "opponent",
    stats: { userCorrect: number; userPassed: number; timerRemaining: number; lastPokemonId: number | null; newlyUnlocked: number[] }
  ) => {
    setDuelStats({
      winnerId: winnerId === "player" ? "player" : selectedOpponent?.id || "unknown",
      userCorrect: stats.userCorrect,
      userPassed: stats.userPassed,
      timerRemaining: stats.timerRemaining,
      lastPokemonId: stats.lastPokemonId,
      newlyUnlocked: stats.newlyUnlocked,
    });

    if (winnerId === "player") {
      const conqueredBotId = selectedOpponent?.id || "";

      const updatedGrid = grid.map((cell) => {
        if (cell.currentOwnerId === conqueredBotId) {
          return { ...cell, currentOwnerId: "player" };
        }
        return cell;
      });

      setGrid(updatedGrid);
      saveGridToStorage(updatedGrid);

      // Collect every cell that just flipped to the player (bot may own multiple tiles
      // after prior AI-vs-AI fusions). Each animates the lava-takeover in parallel.
      const flippedIds = updatedGrid
        .filter((c) => {
          const previous = grid.find((g) => g.id === c.id);
          return c.currentOwnerId === "player" && previous?.currentOwnerId !== "player";
        })
        .map((c) => c.id);
      setRecentlyConqueredCellIds(flippedIds);

      setLogs((prev) => [
        { key: "logVictory", params: { name: botName(selectedOpponent) } },
        ...prev
      ].slice(0, 10));

      const allPlayer = updatedGrid.every((c) => c.currentOwnerId === "player");
      if (allPlayer) {
        setScreen("victory");
      } else {
        setScreen("duel_win");
      }
    } else {
      // Defense duel lost — AI actually seizes selectedCell + we queue a toast for the board.
      if (defenseMode && selectedCell && selectedOpponent) {
        const conqueredById = selectedOpponent.id;
        const updatedGrid = grid.map((cell) =>
          cell.id === selectedCell.id ? { ...cell, currentOwnerId: conqueredById } : cell
        );
        setGrid(updatedGrid);
        saveGridToStorage(updatedGrid);
        setLossToast({ botNumber: selectedOpponent.number, cellId: selectedCell.id });
      }
      setLogs((prev) => [
        { key: "logDefeat", params: { name: botName(selectedOpponent) } },
        ...prev
      ].slice(0, 10));
      setScreen("duel_lose");
    }
  };

  // Auto-dismiss loss toast after 6s.
  useEffect(() => {
    if (!lossToast) return;
    const t = setTimeout(() => setLossToast(null), 6000);
    return () => clearTimeout(t);
  }, [lossToast]);

  // --- Return to board safely + simulating board turn ---
  const handleReturnToBoardWithSimulation = () => {
    setSelectedCell(null);
    setSelectedOpponent(null);
    setScreen("board");
    setRound((r) => {
      const next = r + 1;
      localStorage.setItem("the_floor_round", String(next));
      return next;
    });

    // Skip AI simulation when player already owns the whole board.
    const ownedNow = grid.filter((c) => c.currentOwnerId === "player").length;
    if (ownedNow >= 25) return;

    setTimeout(() => {
      simulateBoardEvent();
    }, 600);
  };

  // --- AI Territory Simulation Engine ---
  const simulateBoardEvent = () => {
    const aiOwners = Array.from(
      new Set(
        grid
          .filter((c) => c.currentOwnerId !== "player")
          .map((c) => c.currentOwnerId)
      )
    ) as string[];

    if (aiOwners.length === 0) return;

    if (Math.random() > 0.45) return;

    const randomAttackerId = aiOwners[Math.floor(Math.random() * aiOwners.length)];
    const attackerBot = BOTS[randomAttackerId];
    if (!attackerBot) return;

    const attackerCells = grid.filter((c) => c.currentOwnerId === randomAttackerId);

    const attackableCells: GridCell[] = [];
    for (const aCell of attackerCells) {
      for (const cell of grid) {
        if (cell.currentOwnerId === randomAttackerId) continue;
        const isNeighbor = Math.abs(aCell.row - cell.row) + Math.abs(aCell.col - cell.col) === 1;
        if (isNeighbor && !attackableCells.some((c) => c.id === cell.id)) {
          attackableCells.push(cell);
        }
      }
    }

    if (attackableCells.length === 0) return;

    const targetCell = attackableCells[Math.floor(Math.random() * attackableCells.length)];
    const defenderId = targetCell.currentOwnerId;

    if (defenderId === "player") {
      // AI attacks the player — trigger defense alert.
      setSelectedCell(targetCell);
      setSelectedOpponent(attackerBot);
      setDefenseMode(true);

      setLogs((prev) => [
        { key: "logWarnAttack", params: { name: botName(attackerBot) } },
        ...prev
      ].slice(0, 10));
    } else {
      // AI vs AI scuffle.
      const defenderBot = BOTS[defenderId];
      if (!defenderBot) return;

      let attackerWinProb = 0.5;
      if (attackerBot.difficulty === "hard" && defenderBot.difficulty === "easy") attackerWinProb = 0.75;
      if (attackerBot.difficulty === "easy" && defenderBot.difficulty === "hard") attackerWinProb = 0.25;

      const attackerWins = Math.random() < attackerWinProb;
      const loserId = attackerWins ? defenderId : randomAttackerId;
      const winnerId = attackerWins ? randomAttackerId : defenderId;
      const winnerBot = attackerWins ? attackerBot : defenderBot;

      const updatedGrid = grid.map((cell) => {
        if (cell.currentOwnerId === loserId) {
          return { ...cell, currentOwnerId: winnerId };
        }
        return cell;
      });

      setGrid(updatedGrid);
      saveGridToStorage(updatedGrid);

      setLogs((prev) => [
        {
          key: "logAiFight",
          params: {
            attacker: botName(attackerBot),
            defender: botName(defenderBot),
            winner: botName(winnerBot)
          }
        },
        ...prev
      ].slice(0, 10));
    }
  };

  const showHeaderActions = screen !== "start" && screen !== "duel" && !showPokedex && !showHelp;

  return (
    <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl mx-auto h-dvh max-h-dvh bg-cream-base text-cocoa flex flex-col justify-between shadow-[0_6px_12px_rgba(90,58,42,0.18)] relative border-x-2 border-[#5A3A2A]/40 overflow-hidden font-sans">

      {/* --- STANDARD TOP HEADER --- */}
      <header className="h-16 sticky top-0 z-30 bg-cream-base border-b-2 border-cocoa/30 px-4 flex items-center justify-between font-sans select-none shrink-0">
        <div
          onClick={() => {
            setScreen("start");
            setShowPokedex(false);
            setShowHelp(false);
          }}
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 active:scale-95 transition-all"
          title={language === "pl" ? "Powrót do menu głównego" : "Back to main menu"}
        >
          <div className="bg-[#1B2840] text-white font-black text-[11px] pl-1 pr-2.5 py-1 rounded-full tracking-tight uppercase italic border-2 border-[#1B2840] shadow-[0_2px_0_#5A3A2A] flex items-center gap-1.5">
            <PokeBallLogoIcon size={16} ink="#1B2840" red="#DC2630" />
            <span>POKÉ</span>
          </div>
          <span className="font-display font-black tracking-tight text-xs text-[#5A3A2A] uppercase italic">THE FLOOR</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => changeLanguage(language === "pl" ? "en" : "pl")}
            className="flex items-center justify-center gap-1 h-8 px-2.5 rounded-2xl bg-white border-2 border-[#5A3A2A] hover:bg-[#FFF4DF] text-[10px] sm:text-xs font-black tracking-wider uppercase transition cursor-pointer text-[#5A3A2A] shadow-[0_2px_0_#5A3A2A]"
            title={language === "pl" ? "Zmień na angielski" : "Switch to Polish"}
          >
            <GlobeIcon size={14} color="#24456B" strokeWidth={2.2} />
            <span className="font-mono text-[10px] tracking-wider">{language === "pl" ? "PL" : "EN"}</span>
          </button>

          {showHeaderActions && (
            <button
              onClick={() => setShowBattleLog(true)}
              className="flex items-center gap-1 h-8 px-2.5 rounded-2xl bg-white border-2 border-[#5A3A2A] hover:bg-[#FFF4DF] transition cursor-pointer shadow-[0_2px_0_#5A3A2A]"
              title={language === "pl" ? "Historia walk" : "Battle history"}
            >
              <ClockRewindIcon size={14} color="#24456B" strokeWidth={2.2} />
              <span className="text-[#5A3A2A] text-[10px] uppercase tracking-widest font-black">{t.logiBtn}</span>
            </button>
          )}

          {showHeaderActions && (
            <button
              onClick={handleFullReset}
              className="h-8 w-8 rounded-2xl bg-white border-2 border-[#5A3A2A] hover:bg-[#FFF4DF] hover:text-red-500 transition cursor-pointer flex items-center justify-center shadow-[0_2px_0_#5A3A2A]"
              title={language === "pl" ? "Resetuj grę" : "Reset game"}
            >
              <ResetIcon size={14} color="#5A3A2A" strokeWidth={2.2} />
            </button>
          )}
        </div>
      </header>

      {/* --- CORE CONTENT PANELS ROUTER --- */}
      <main className={`flex-1 px-4 pt-4 pb-20 ${screen === "start" || screen === "board" || screen === "challenge" || screen === "duel" ? "overflow-hidden" : "overflow-y-auto"}`}>

        {/* SCREEN 1: START SCREEN (design 01) */}
        {screen === "start" && (
          <div className="w-full h-full flex flex-col gap-2 sm:gap-3 px-1 pt-1 pb-2 text-left font-sans select-none max-w-sm mx-auto overflow-hidden">

            {/* Red region banner — "REGION KANTO · GEN I"  /  "1-151" */}
            <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-[#E95050] text-white px-3 py-1.5 flex items-center justify-between shadow-[0_3px_0_#5A3A2A]">
              <span className="font-display font-black text-[11px] uppercase tracking-wider italic">
                {t.introRegionLabel}
              </span>
              <span className="font-mono font-black text-[10px] tracking-wider opacity-90">
                {t.introRange}
              </span>
            </div>

            {/* Yellow hero card — Pikachu + type chip */}
            <div className="shrink-0 relative rounded-3xl border-2 border-[#5A3A2A] bg-[#FFD84D] shadow-[0_4px_0_#5A3A2A] overflow-hidden">
              <div className="absolute top-2 left-2 z-10 bg-[#1B2840] text-[#FFD84D] font-mono font-black text-[10px] px-2 py-0.5 rounded-md tracking-wider">
                #025
              </div>
              <div className="absolute top-2 right-2 z-10 bg-white border-2 border-[#5A3A2A] text-[#5A3A2A] font-black text-[9px] px-2 py-0.5 rounded-full tracking-wider uppercase shadow-[0_1px_0_#5A3A2A]">
                {t.typeElectric}
              </div>
              <div className="flex items-center justify-center" style={{ height: "clamp(110px, 19vh, 170px)" }}>
                <img
                  src={getPokemonImageUrl(25)}
                  alt="Pikachu"
                  referrerPolicy="no-referrer"
                  className="object-contain h-full w-auto max-h-full animate-hover sticker-hover"
                  style={{ filter: "drop-shadow(0 4px 6px rgba(90,58,42,0.2))" }}
                />
              </div>
            </div>

            {/* Headline block */}
            <div className="shrink-0 text-center space-y-0.5">
              <span className="text-[10px] uppercase tracking-widest text-[#24456B] font-display font-black">
                {t.introEyebrow}
              </span>
              <h1 className="font-display text-[26px] sm:text-3xl font-black tracking-tight leading-none italic uppercase text-[#5A3A2A]">
                THE FLOOR
              </h1>
              <div className="font-display text-base sm:text-lg font-black italic uppercase text-[#E95050] tracking-tight leading-none">
                {t.introTitleSecondary}
              </div>
              <p className="text-[11px] text-[#5A3A2A]/80 max-w-[300px] mx-auto leading-snug font-sans font-semibold pt-1">
                {t.subTitle}
              </p>
            </div>

            {/* "ZAPAMIĘTAJ TYLKO TO" card with 3 mini-cards */}
            <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-white px-3 py-2 shadow-[0_3px_0_#5A3A2A]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5A3A2A]">
                  {t.introCardsTitle}
                </span>
                <span className="text-[9px] font-mono font-black text-[#5A3A2A]/60">
                  {t.introCardsCount}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {/* Card 1 — Timer */}
                <div className="rounded-xl border-2 border-[#5A3A2A] bg-[#FFF4DF] px-1 py-1.5 text-center shadow-[0_2px_0_#5A3A2A]">
                  <div className="font-display font-black text-base text-[#5A3A2A] leading-none">
                    {t.introCardTimerValue}
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-[#24456B] mt-0.5">
                    {t.introCardTimerLabel}
                  </div>
                  <div className="text-[8px] text-[#5A3A2A]/75 leading-tight mt-1 font-bold">
                    {t.introCardTimerDesc}
                  </div>
                </div>
                {/* Card 2 — Language */}
                <div className="rounded-xl border-2 border-[#5A3A2A] bg-[#BDEBFF] px-1 py-1.5 text-center shadow-[0_2px_0_#5A3A2A]">
                  <div className="font-display font-black text-base text-[#24456B] leading-none">
                    {t.introCardLangValue}
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-[#24456B] mt-0.5">
                    {t.introCardLangLabel}
                  </div>
                  <div className="text-[8px] text-[#5A3A2A]/75 leading-tight mt-1 font-bold">
                    {t.introCardLangDesc}
                  </div>
                </div>
                {/* Card 3 — Penalty */}
                <div className="rounded-xl border-2 border-[#5A3A2A] bg-[#FFE0DA] px-1 py-1.5 text-center shadow-[0_2px_0_#5A3A2A]">
                  <div className="font-display font-black text-base text-[#E95050] leading-none">
                    {t.introCardPenaltyValue}
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A] mt-0.5">
                    {t.introCardPenaltyLabel}
                  </div>
                  <div className="text-[8px] text-[#5A3A2A]/75 leading-tight mt-1 font-bold">
                    {t.introCardPenaltyDesc}
                  </div>
                </div>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-[#5A3A2A]/15 flex items-center justify-between">
                <span className="text-[9px] text-[#5A3A2A]/60 font-bold">{t.introFullRulesLink}</span>
                <button
                  onClick={() => setShowHelp(true)}
                  className="text-[9px] font-black uppercase tracking-wider text-[#24456B] flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                  {t.introHelpInline}
                  <ChevronRight className="h-3 w-3 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="shrink-0 mt-auto space-y-1.5">
              <button
                onClick={() => setScreen("board")}
                className="w-full btn-core-berry py-3.5 flex items-center justify-center gap-2"
              >
                <span>{t.startBtn}</span>
                <Play className="h-4 w-4 fill-white text-white" />
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="w-full btn-core-dark py-2.5 flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="h-3.5 w-3.5 text-pokemon-navy" />
                <span>{t.introHelpBtnSecondary}</span>
              </button>
            </div>

          </div>
        )}

        {/* SCREEN 2: THE MAIN BOARD VIEW (design 02) */}
        {screen === "board" && (
          <div className="h-full flex flex-col justify-between pb-2 gap-3">

            {/* Conquest banner — navy frame + white inner card (design 02) */}
            <div className="rounded-2xl border-2 border-[#5A3A2A] bg-[#1B2840] p-2 shadow-[0_3px_0_#5A3A2A] select-none">
              {/* Top row — title + round (on navy) */}
              <div className="flex items-center justify-between px-1 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <MapAtlasIcon size={14} color="#FFD84D" strokeWidth={2} />
                  <span className="font-display font-black text-[11px] uppercase tracking-wider italic text-[#FFD84D]">
                    {t.boardConquestTitle}
                  </span>
                </div>
                <span className="font-mono font-black text-[10px] text-[#FFD84D]/80 tracking-wider">
                  {t.boardRoundLabel}{String(round).padStart(2, "0")}
                </span>
              </div>

              {/* Inner white card — counter + ATAKI pill + progress pips */}
              <div className="rounded-xl bg-white border-2 border-[#5A3A2A] px-2.5 py-1.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="font-mono font-black text-lg text-[#5A3A2A] leading-none">
                      {playerTerritorySize}<span className="text-[#5A3A2A]/50 text-sm">/25</span>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#24456B] leading-tight truncate">
                      {t.boardOwnFieldsCounterLabel}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 bg-[#FFD84D] text-[#1B2840] px-2 py-0.5 rounded-full border-2 border-[#1B2840] shadow-[0_2px_0_#1B2840]">
                    <SwordsCrossedIcon size={12} color="#1B2840" strokeWidth={2.2} />
                    <span className="font-display font-black text-[10px] tracking-wider">
                      {attackableCount} {t.boardTargetsLabel}
                    </span>
                  </div>
                </div>
                {/* 25 progress pips — yellow filled for owned, hollow for the rest */}
                <div className="flex items-center gap-[3px]">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <span
                      key={i}
                      className={`flex-1 h-2 rounded-[3px] border-[1.5px] border-[#5A3A2A] ${
                        i < playerTerritorySize ? "bg-[#FFD84D]" : "bg-white"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Field-loss toast (design 02a) */}
            {lossToast && (
              <div className="rounded-2xl border-2 border-[#5A3A2A] bg-[#E95050] text-white px-3 py-2 shadow-[0_3px_0_#5A3A2A] flex items-start gap-2 relative overflow-hidden shrink-0">
                <div className="w-8 h-8 shrink-0 rounded-xl bg-white border-2 border-[#5A3A2A] flex items-center justify-center">
                  <X className="h-4 w-4 text-[#E95050]" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/85">
                    {t.lossToastPill}
                  </div>
                  <div className="font-display font-black text-xs italic uppercase truncate">
                    {t.botLabel} {lossToast.botNumber} {t.lossToastSeized}
                  </div>
                  <div className="text-[9px] font-bold text-white/85 mt-0.5">
                    #{String(lossToast.cellId).padStart(3, "0")} · {t.lossToastRecover}
                  </div>
                </div>
                <button
                  onClick={() => setLossToast(null)}
                  className="w-6 h-6 shrink-0 rounded-full bg-white/15 hover:bg-white/30 border border-white/30 flex items-center justify-center cursor-pointer transition"
                  aria-label="close"
                >
                  <X className="h-3 w-3" />
                </button>
                {/* striped bottom accent */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{
                    backgroundImage: "repeating-linear-gradient(45deg, #FFFFFF 0 6px, #1B2840 6px 12px)"
                  }}
                />
              </div>
            )}

            {/* Defense alert */}
            {selectedCell && defenseMode && selectedOpponent && (
              <div className="rounded-[24px] border-2 border-[#5A3A2A] bg-white-frost p-5 space-y-4 shadow-xl animate-pulse relative overflow-hidden shrink-0 mt-3">
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-coral" />
                <div className="flex items-center gap-2 text-coral font-black text-[10px] uppercase tracking-widest pl-2">
                  <ShieldCheck className="h-4 w-4 text-coral" />
                  <span>{t.defenseModeTitle}</span>
                </div>

                <h3 className="text-sm font-black text-[#5A3A2A] leading-tight pl-2 uppercase">
                  <span className="text-[#24456B] font-black">{botName(selectedOpponent)}</span> {t.defenseModeSubtitle}
                </h3>

                <p className="text-xs text-[#5A3A2A]/80 pl-2 leading-relaxed font-sans font-bold">
                  {t.defenseDesc1} {t.defenseDesc2}
                </p>

                <div className="pt-1 pl-2">
                  <button
                    onClick={() => {
                      setActiveOpponent(selectedOpponent);
                      setActiveBotPool(selectedOpponent.pokemonPool);
                      setScreen("duel");
                    }}
                    className="w-full btn-core-red py-3.5 flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    <span>{t.defenseBtn}</span>
                    <Swords className="h-4 w-4 text-cocoa" />
                  </button>
                </div>
              </div>
            )}

            {/* The 5x5 Grid */}
            {!defenseMode && (
              <div className="flex-1 flex flex-col justify-center min-h-0 fluid-map-scale gap-2">
                <FloorGrid
                  grid={grid}
                  playerTerritorySize={playerTerritorySize}
                  recentlyConqueredCellIds={recentlyConqueredCellIds}
                  onSelectCell={(cell, bot) => {
                    setSelectedCell(cell);
                    setSelectedOpponent(bot);
                    setScreen("challenge");
                  }}
                  language={language}
                  t={t}
                />

                {/* Legend strip — under the board (design 02) */}
                <div className="flex items-center justify-center gap-3 text-[9px] font-black text-[#5A3A2A] bg-white border-2 border-[#5A3A2A] py-1 px-3 rounded-full leading-none w-full shadow-[0_2px_0_#5A3A2A] antialiased shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#FFD84D] border-2 border-[#5A3A2A]" />
                    <span className="uppercase tracking-wider">{t.boardLegendMy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-white border-2 border-[#5A3A2A]" />
                    <span className="uppercase tracking-wider">{t.boardLegendAvailable}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#EADFC9] border-2 border-[#5A3A2A]" />
                    <span className="uppercase tracking-wider">{t.boardLegendLocked}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* SCREEN 3: PRE-CHALLENGE / VS RIVAL (design 06) */}
        {screen === "challenge" && selectedCell && selectedOpponent && (() => {
          // Compute preferred types (top 3) from bot's pokemonPool.
          const typeCounts = new Map<string, number>();
          for (const pid of selectedOpponent.pokemonPool) {
            const p = POKEMON_LIST.find((x) => x.id === pid);
            if (!p) continue;
            for (const tp of p.types) typeCounts.set(tp, (typeCounts.get(tp) ?? 0) + 1);
          }
          const preferredTypes = [...typeCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k]) => k);

          const difficultyColor =
            selectedOpponent.difficulty === "easy" ? "#A9E6CF" :
            selectedOpponent.difficulty === "medium" ? "#FFD84D" : "#FF7A62";

          return (
            <div className="w-full h-full flex flex-col gap-2 px-1 pt-1 pb-2 font-sans select-none max-w-sm mx-auto overflow-hidden">

              {/* Header card — duel meta */}
              <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-[#FFD84D] px-3 py-2 shadow-[0_3px_0_#5A3A2A]">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-display font-black text-[10px] uppercase tracking-wider text-[#5A3A2A]">
                    {t.vsHeaderMetaLeft} #{selectedCell.id}
                  </span>
                  <span className="font-mono font-black text-[10px] text-[#5A3A2A]/70">
                    {t.boardRoundLabel}{String(round).padStart(2, "0")}
                  </span>
                </div>
                <div className="font-display font-black text-xs italic text-[#24456B] uppercase tracking-tight">
                  {t.vsHeaderMetaSub}
                </div>
              </div>

              {/* VS card with two avatars */}
              <div className="shrink-0 rounded-3xl border-2 border-[#5A3A2A] bg-white p-3 shadow-[0_4px_0_#5A3A2A] relative">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  {/* Player */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-full aspect-square rounded-2xl border-2 border-[#5A3A2A] bg-[#FFD84D] flex items-center justify-center shadow-[0_2px_0_#5A3A2A] overflow-hidden">
                      <img
                        src={getPokemonImageUrl(25)}
                        alt="Pikachu"
                        referrerPolicy="no-referrer"
                        className="h-4/5 w-4/5 object-contain"
                      />
                    </div>
                    <span className="font-display font-black text-sm text-[#5A3A2A] uppercase">
                      {t.vsPlayerLabel}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#5A3A2A]/70 bg-[#A9E6CF] border border-[#5A3A2A] rounded-full px-2 py-0.5">
                      ⌖ {t.vsPlayerLocation}
                    </span>
                  </div>

                  {/* VS pill */}
                  <div className="bg-[#1B2840] text-white font-display font-black text-xs italic px-3 py-1.5 rounded-full border-2 border-[#5A3A2A] shadow-[0_2px_0_#5A3A2A]">
                    {t.vsVsLabel}
                  </div>

                  {/* Opponent */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-full aspect-square rounded-2xl border-2 border-[#5A3A2A] flex items-center justify-center shadow-[0_2px_0_#5A3A2A] overflow-hidden ${selectedOpponent.avatarColor || "bg-indigo-500"}`}>
                      <img
                        src={getPokemonImageUrl(selectedOpponent.pokemonPool[0] || 1)}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-4/5 w-4/5 object-contain"
                        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                      />
                    </div>
                    <span className="font-display font-black text-sm text-[#5A3A2A] uppercase">
                      {botName(selectedOpponent)}
                    </span>
                    <span
                      className="text-[9px] font-black uppercase tracking-wider text-[#5A3A2A] border border-[#5A3A2A] rounded-full px-2 py-0.5"
                      style={{ backgroundColor: difficultyColor }}
                    >
                      {t[selectedOpponent.difficulty]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rival stats panel */}
              <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-white p-3 shadow-[0_3px_0_#5A3A2A] space-y-2">
                <div className="flex items-center gap-1.5 pb-1.5 border-b-2 border-[#5A3A2A]/20">
                  <span className="bg-[#1B2840] text-[#FFD84D] font-display font-black text-[9px] px-2 py-0.5 rounded-md tracking-wider uppercase">
                    {t.vsRivalStatsTitle}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/70">{t.vsPoolLabel}</div>
                    <div className="font-mono font-black text-sm text-[#24456B]">
                      {selectedOpponent.pokemonPool.length}<span className="text-[#5A3A2A]/50">/151</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/70">{t.vsLevelLabel}</div>
                    <div
                      className="font-display font-black text-sm uppercase italic"
                      style={{
                        color:
                          selectedOpponent.difficulty === "easy" ? "#10b981" :
                          selectedOpponent.difficulty === "medium" ? "#D97706" : "#E95050"
                      }}
                    >
                      {t[selectedOpponent.difficulty]}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/70 mb-1">{t.vsPreferredTypesLabel}</div>
                  <div className="flex flex-wrap gap-1">
                    {preferredTypes.map((tp) => (
                      <span
                        key={tp}
                        className="text-[9px] font-black uppercase tracking-wider text-[#5A3A2A] border border-[#5A3A2A] rounded-full px-2 py-0.5"
                        style={{ backgroundColor: POKEMON_TYPES_PL[tp]?.bgHex || "#A9E6CF" }}
                      >
                        {getTypeName(tp, language)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Yellow notice */}
              <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-[#FFF4DF] px-3 py-2 shadow-[0_2px_0_#5A3A2A]">
                <p className="text-[10px] text-[#5A3A2A] leading-snug font-bold">
                  ✦ {t.vsNotice}
                </p>
              </div>

              {/* CTAs */}
              <div className="shrink-0 mt-auto space-y-1.5">
                <button
                  onClick={handleLaunchDuel}
                  className="w-full btn-core-berry py-3.5 flex items-center justify-center gap-1.5"
                >
                  <span>{t.challengeFightBtn}</span>
                  <Swords className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={() => {
                    setSelectedCell(null);
                    setSelectedOpponent(null);
                    setScreen("board");
                  }}
                  className="w-full btn-core-dark py-2.5"
                >
                  ← {t.challengeCancelBtn}
                </button>
              </div>
            </div>
          );
        })()}

        {/* SCREEN 4: ACTIVE TIMER DUEL */}
        {screen === "duel" && activeOpponent && (
          <DuelArea
            opponent={activeOpponent}
            pokemonPool={activeBotPool}
            recentlyShownIds={shownLog}
            onPokemonShown={handlePokemonShown}
            onUnlockPokemon={handleUnlockPokemon}
            onSeePokemon={handleSeePokemon}
            onDuelFinish={handleDuelFinish}
            language={language}
            t={t}
          />
        )}

        {/* SCREEN 5: DUEL WIN CELEBRATION (design 10) */}
        {screen === "duel_win" && (
          <div className="w-full h-full flex flex-col gap-2.5 px-1 pt-1 pb-2 text-center font-sans select-none max-w-sm mx-auto overflow-hidden">

            {/* Trophy circle */}
            <div className="shrink-0 mx-auto relative mt-2">
              <div className="h-20 w-20 rounded-full bg-[#FFD84D] border-2 border-[#5A3A2A] shadow-[0_4px_0_#5A3A2A] flex items-center justify-center">
                <Trophy className="h-10 w-10 text-[#24456B] drop-shadow-sm animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 rounded-full bg-[#A9E6CF] text-[#5A3A2A] text-[9px] px-2 py-0.5 font-black uppercase tracking-wider border-2 border-[#5A3A2A] shadow-[0_1px_0_#5A3A2A]">
                {t.winFieldBadge}
              </div>
            </div>

            <h1 className="shrink-0 font-display text-2xl font-black text-[#24456B] tracking-tight italic uppercase">
              {t.winTitleBig}
            </h1>
            <p className="shrink-0 text-[11px] text-[#5A3A2A] font-bold leading-snug px-2">
              {language === "pl" ? "Pokonałeś" : "You defeated"} {botName(selectedOpponent)} {language === "pl" ? "i przejmujesz" : "and seize"} {t.winFieldNumber} #{selectedCell ? selectedCell.id : ""}. {language === "pl" ? "Twoje terytorium rośnie!" : "Your territory grows!"}
            </p>

            {/* Raport */}
            <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-white p-3 shadow-[0_3px_0_#5A3A2A] text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-black text-[9px] uppercase tracking-wider text-[#5A3A2A]">
                  {t.winReportTitle}
                </span>
                <span className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/60">
                  vs {botName(selectedOpponent)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-mono font-black text-2xl text-[#A9E6CF] leading-none drop-shadow-[0_1px_0_rgba(90,58,42,0.3)]">{String(duelStats.userCorrect).padStart(2, "0")}</div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/70 mt-1">{t.loseStatHit}</div>
                </div>
                <div>
                  <div className="font-mono font-black text-2xl text-[#FF7A62] leading-none">{String(duelStats.userPassed).padStart(2, "0")}</div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/70 mt-1">{t.loseStatPass}</div>
                </div>
                <div>
                  <div className="font-mono font-black text-2xl text-[#24456B] leading-none">{duelStats.timerRemaining.toFixed(1)}s</div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/70 mt-1">{t.winStatRemaining}</div>
                </div>
              </div>
            </div>

            {/* Nowe w Pokédexie */}
            {duelStats.newlyUnlocked.length > 0 && (
              <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-[#A9E6CF] p-2.5 shadow-[0_3px_0_#5A3A2A] relative">
                <div className="absolute -top-2 -right-2 bg-[#1B2840] text-[#FFD84D] font-display font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-[#5A3A2A]">
                  +{duelStats.newlyUnlocked.length}
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[#5A3A2A] text-left mb-1.5">
                  ✦ {t.winNewInDexTitle}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {duelStats.newlyUnlocked.slice(0, 8).map((pid) => (
                    <div
                      key={pid}
                      className="aspect-square rounded-lg bg-white border-2 border-[#5A3A2A] flex items-center justify-center p-1"
                    >
                      <img
                        src={getPokemonImageUrl(pid)}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="shrink-0 mt-auto space-y-1.5">
              <button
                onClick={handleReturnToBoardWithSimulation}
                className="w-full btn-core-yellow py-3.5 flex items-center justify-center gap-1.5"
              >
                <span>{t.winBackBtn}</span>
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </button>
              <button
                onClick={() => {
                  setShowPokedex(true);
                  setScreen("board");
                  setSelectedCell(null);
                  setSelectedOpponent(null);
                }}
                className="w-full btn-core-dark py-2.5"
              >
                {t.winSeeDexBtn}
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 6: TIME'S UP / DUEL LOSE (design 08) */}
        {screen === "duel_lose" && (() => {
          const accuracy = duelStats.userCorrect + duelStats.userPassed > 0
            ? Math.round((duelStats.userCorrect / (duelStats.userCorrect + duelStats.userPassed)) * 100)
            : 0;
          const lastPoke = duelStats.lastPokemonId ? POKEMON_LIST.find((p) => p.id === duelStats.lastPokemonId) : null;

          return (
            <div className="w-full h-full flex flex-col gap-2.5 px-1 pt-1 pb-2 text-center font-sans select-none max-w-sm mx-auto overflow-hidden">

              {/* Ghost avatar + K.O. */}
              <div className="shrink-0 mx-auto relative mt-2">
                <div className="h-20 w-20 rounded-full bg-coral/20 border-2 border-dashed border-[#5A3A2A] flex items-center justify-center shadow-md">
                  <span className="text-4xl">👻</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1B2840] text-[#FFD84D] font-display font-black text-[9px] px-2 py-0.5 rounded-md border-2 border-[#5A3A2A]">
                  {t.loseKoBadge}
                </div>
              </div>

              <h1 className="shrink-0 font-display text-2xl font-black text-[#E95050] tracking-tight uppercase italic">
                {t.gameOverTitle}
              </h1>
              <p className="shrink-0 text-[11px] text-[#5A3A2A] font-bold leading-snug px-2">
                {selectedOpponent ? `${language === "pl" ? "Wyzwanie rzucone przez" : "The challenge from"} ${botName(selectedOpponent)} ${language === "pl" ? "okazało się zbyt wymagające. Twoje terytoria zostają, ale to pole pozostaje wolne." : "proved too demanding. Your territories remain, but this field stays open."}` : t.gameOverDesc}
              </p>

              {/* Raport */}
              <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-[#1B2840] p-3 shadow-[0_3px_0_#5A3A2A] text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-black text-[9px] uppercase tracking-wider text-[#FFD84D]">
                    {t.loseReportTitle}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/70">
                    {t.loseReportVs} {selectedOpponent ? botName(selectedOpponent) : ""}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="font-mono font-black text-2xl text-[#A9E6CF] leading-none">{String(duelStats.userCorrect).padStart(2, "0")}</div>
                    <div className="text-[8px] font-black uppercase tracking-wider text-white/70 mt-1">{t.loseStatHit}</div>
                  </div>
                  <div>
                    <div className="font-mono font-black text-2xl text-[#FF7A62] leading-none">{String(duelStats.userPassed).padStart(2, "0")}</div>
                    <div className="text-[8px] font-black uppercase tracking-wider text-white/70 mt-1">{t.loseStatPass}</div>
                  </div>
                  <div>
                    <div className="font-mono font-black text-2xl text-[#FFD84D] leading-none">{accuracy}%</div>
                    <div className="text-[8px] font-black uppercase tracking-wider text-white/70 mt-1">{t.loseStatAccuracy}</div>
                  </div>
                </div>
                {lastPoke && (
                  <div className="mt-2.5 pt-2.5 border-t-2 border-white/10 flex items-center gap-2 bg-white/5 -mx-3 -mb-3 px-3 py-2 rounded-b-2xl">
                    <img
                      src={getPokemonImageUrl(lastPoke.id)}
                      alt={lastPoke.name}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 object-contain shrink-0"
                    />
                    <div className="flex-1 text-left">
                      <div className="text-[8px] font-black uppercase tracking-wider text-white/60">{t.loseStuckOnLabel}</div>
                      <div className="font-display font-black text-xs text-white uppercase">
                        {lastPoke.name} <span className="font-mono text-[10px] text-white/60">#{String(lastPoke.id).padStart(3, "0")}</span>
                      </div>
                    </div>
                    {lastPoke.types[0] && (
                      <span
                        className="text-[8px] font-black tracking-wider text-[#5A3A2A] uppercase rounded-full border border-[#5A3A2A] px-2 py-0.5"
                        style={{ backgroundColor: POKEMON_TYPES_PL[lastPoke.types[0]]?.bgHex || "#A9E6CF" }}
                      >
                        {getTypeName(lastPoke.types[0], language)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Coach tip */}
              <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-[#FFD84D] p-2.5 shadow-[0_2px_0_#5A3A2A] text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#5A3A2A]">{t.loseCoachTipPill}</span>
                <p className="text-[10px] text-[#5A3A2A] font-bold leading-snug mt-1">
                  {t.quickTipDesc}
                </p>
              </div>

              {/* CTAs */}
              <div className="shrink-0 mt-auto space-y-1.5">
                <button onClick={handleLaunchDuel} className="w-full btn-core-berry py-3.5">
                  {t.loseBackBtn}
                </button>
                <button
                  onClick={() => {
                    setScreen("board");
                    setSelectedCell(null);
                    setSelectedOpponent(null);
                    setDefenseMode(false);
                  }}
                  className="w-full btn-core-dark py-2.5"
                >
                  {t.loseRetryBtn}
                </button>
                <button
                  onClick={handleFullReset}
                  className="text-[9px] text-[#5A3A2A]/60 font-bold underline hover:text-[#E95050] transition cursor-pointer w-full py-0.5"
                >
                  {t.loseResetLink} ({t.loseResetLinkParen})
                </button>
              </div>
            </div>
          );
        })()}

        {/* SCREEN 7: ALL KANTO CONQUERED CHAMPION VICTORY */}
        {screen === "victory" && (
          <div className="space-y-6 pt-2 text-center select-none max-w-sm mx-auto text-cocoa">
            <div className="h-32 w-32 rounded-full bg-[#FFD84D] border-2 border-[#5A3A2A] shadow-[0_4px_0_rgba(90,58,42,0.18)] flex items-center justify-center mx-auto my-2 relative">
              <Trophy className="h-16 w-16 text-[#24456B] drop-shadow-md" />
              <div className="absolute inset-0 rounded-full animate-ping border-2 border-cocoa/30" />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-pokemon-navy tracking-widest font-black uppercase">{t.fullConquestLabel}</p>
              <h1 className="font-display text-3xl font-black text-pokemon-navy">
                {t.championSub}
              </h1>
              <p className="text-xs text-cocoa font-bold px-3">
                {t.championDesc}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF4DF] border-2 border-cocoa p-4 space-y-2 text-xs text-left shadow-sm">
              <div className="flex justify-between items-center text-cocoa font-bold py-1">
                <span>{t.allRegions}</span>
                <span className="font-black text-[#24456B] font-mono">{t.regionsConquered}</span>
              </div>
              <div className="flex justify-between items-center text-cocoa font-bold py-1 border-t border-cocoa/20">
                <span>{t.pokedexCollection}</span>
                <span className="font-black text-coral font-mono">{unlockedPokemonIds.length} / 151</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleFullReset}
                className="w-full btn-core-yellow py-4"
              >
                {t.conquestResetBtn}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* --- SIDE OVERLAYS / DRAWERS --- */}

      {showPokedex && (
        <PokedexView
          unlockedIds={unlockedPokemonIds}
          seenIds={seenPokemonIds}
          onClose={() => setShowPokedex(false)}
          playerActiveTypes={[]}
          language={language}
          t={t}
        />
      )}

      {showBattleLog && (() => {
        const duelLogs = logs.filter((l) => l.key === "logVictory" || l.key === "logDefeat" || l.key === "logAiFight");
        const elapsedMs = Date.now() - gameStartTime;
        const elapsedMin = Math.floor(elapsedMs / 60000);
        const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);
        const timeStr = `${String(elapsedMin).padStart(2, "0")}:${String(elapsedSec).padStart(2, "0")}`;
        const isGoal1Done = grid.some((c) => c.currentOwnerId === "player"); // always true (starts owning Alabastia)
        const isGoal2Done = playerTerritorySize >= 25;
        const isGoal3Done = unlockedPokemonIds.length >= 151;

        return (
          <div className="fixed inset-x-0 top-16 bottom-[68px] z-40 bg-[#1B2840] flex flex-col font-sans select-none overflow-hidden text-white">

            {/* Header card */}
            <div className="shrink-0 px-3 pt-3 pb-2">
              <div className="rounded-2xl border-2 border-[#5A3A2A] bg-[#1B2840] p-3 flex items-start gap-2">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-[#FFD84D] border-2 border-[#5A3A2A] flex items-center justify-center shadow-[0_2px_0_#5A3A2A]">
                  <Activity className="h-4 w-4 text-[#24456B]" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-black text-sm italic uppercase text-white leading-none">{t.histHeaderTitle}</h2>
                  <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest mt-1">{t.histHeaderSub}</p>
                </div>
                <button
                  onClick={() => setShowBattleLog(false)}
                  className="w-7 h-7 rounded-full bg-white border-2 border-[#5A3A2A] text-[#5A3A2A] hover:bg-cafe-beige flex items-center justify-center cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="shrink-0 px-3">
              <div className="grid grid-cols-2 rounded-xl border-2 border-[#5A3A2A] overflow-hidden">
                <button
                  onClick={() => setHistoryTab("goals")}
                  className={`py-2 text-[10px] font-black uppercase tracking-wider transition ${
                    historyTab === "goals" ? "bg-[#FFD84D] text-[#5A3A2A]" : "bg-[#1B2840] text-white/70 hover:text-white"
                  }`}
                >
                  {t.histTabGoals} · 3
                </button>
                <button
                  onClick={() => setHistoryTab("duels")}
                  className={`py-2 text-[10px] font-black uppercase tracking-wider transition border-l-2 border-[#5A3A2A] ${
                    historyTab === "duels" ? "bg-[#FFD84D] text-[#5A3A2A]" : "bg-[#1B2840] text-white/70 hover:text-white"
                  }`}
                >
                  {t.histTabDuels} · {duelLogs.length}
                </button>
              </div>
            </div>

            {/* Content scroll area */}
            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2 space-y-2.5">
              {historyTab === "goals" ? (
                <>
                  {/* Goal 1 */}
                  <div className="rounded-2xl border-2 border-[#5A3A2A] bg-[#A9E6CF] p-3 shadow-[0_2px_0_#5A3A2A] flex items-start gap-2.5">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-[#1B2840] text-[#A9E6CF] font-mono font-black text-xs flex items-center justify-center border-2 border-[#5A3A2A]">
                      1
                    </div>
                    <div className="flex-1">
                      <span className="inline-block bg-white text-[#24456B] font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#5A3A2A] mb-1">
                        {isGoal1Done ? t.histStatusCompleted : t.histStatusInProgress}
                      </span>
                      <div className="text-[11px] font-black text-[#5A3A2A] leading-tight">{t.histGoal1Title}</div>
                      <div className="text-[9px] text-[#5A3A2A]/80 font-bold mt-0.5">{t.histGoal1Sub}</div>
                    </div>
                  </div>

                  {/* Goal 2 */}
                  <div className="rounded-2xl border-2 border-[#5A3A2A] bg-[#FFD84D] p-3 shadow-[0_2px_0_#5A3A2A] flex items-start gap-2.5">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-[#1B2840] text-[#FFD84D] font-mono font-black text-xs flex items-center justify-center border-2 border-[#5A3A2A]">
                      {isGoal2Done ? "✓" : "2"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="inline-block bg-white text-[#5A3A2A] font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#5A3A2A] mb-1">
                          {isGoal2Done ? t.histStatusCompleted : t.histStatusInProgress}
                        </span>
                        <span className="text-[9px] font-mono font-black text-[#5A3A2A]">{playerTerritorySize}/25</span>
                      </div>
                      <div className="text-[11px] font-black text-[#5A3A2A] leading-tight">{t.histGoal2Title}</div>
                      <div className="text-[9px] text-[#5A3A2A]/80 font-bold mt-0.5">{t.histGoal2Sub}{attackableCount > 0 ? `${attackableCount} ${language === "pl" ? "dostępnych pól" : "available fields"}` : language === "pl" ? "—" : "—"}</div>
                    </div>
                  </div>

                  {/* Goal 3 */}
                  <div className={`rounded-2xl border-2 border-dashed border-[#5A3A2A] ${isGoal3Done ? "bg-[#A9E6CF]" : "bg-white/10"} p-3 flex items-start gap-2.5`}>
                    <div className="w-7 h-7 shrink-0 rounded-full bg-white/10 text-white/70 font-mono font-black text-xs flex items-center justify-center border-2 border-[#5A3A2A]">
                      🔒
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="inline-block bg-white/15 text-white/70 font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#5A3A2A] mb-1">
                          {isGoal3Done ? t.histStatusCompleted : t.histStatusLocked}
                        </span>
                        <span className="text-[9px] font-mono font-black text-white/60">{t.histStatusFinal}</span>
                      </div>
                      <div className="text-[11px] font-black text-white leading-tight">
                        {t.histGoal3Title.replace("151", "")}<span className="bg-[#E95050] text-white px-1 rounded mx-1">151</span>{language === "pl" ? "Pokémonów" : "Pokémon"}
                      </div>
                      <div className="text-[9px] text-white/70 font-bold mt-0.5">
                        {t.histGoal3Sub}{unlockedPokemonIds.length}/151 {t.histGoal3SubEntries} ({Math.round((unlockedPokemonIds.length / 151) * 100)}%)
                      </div>
                    </div>
                  </div>
                </>
              ) : duelLogs.length === 0 ? (
                <div className="text-center py-12 text-white/50 text-[10px] font-black uppercase tracking-widest leading-normal px-6">
                  {t.histEmptyDuels}
                </div>
              ) : (
                duelLogs.map((log, index) => {
                  const messageText = renderLogMessage(log);
                  const isWin = log.key === "logVictory";
                  const isLose = log.key === "logDefeat";
                  const iconEmoji = isLose ? "💀" : isWin ? "🏆" : "⚔️";
                  const accent = isWin ? "bg-[#A9E6CF]" : isLose ? "bg-[#FF7A62]" : "bg-[#BDEBFF]";

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border-2 border-[#5A3A2A] bg-white p-2.5 flex items-start gap-2 shadow-[0_2px_0_#5A3A2A]"
                    >
                      <div className={`w-7 h-7 shrink-0 rounded-full ${accent} border-2 border-[#5A3A2A] flex items-center justify-center text-sm`}>
                        {iconEmoji}
                      </div>
                      <p className="text-[11px] text-[#5A3A2A] font-bold leading-snug flex-1">{messageText}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom stat strip */}
            <div className="shrink-0 px-3 pb-3 pt-1">
              <div className="rounded-2xl border-2 border-[#5A3A2A] bg-[#0F1729] p-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-mono font-black text-base text-[#FFD84D] leading-none">{String(playerTerritorySize).padStart(2, "0")}</div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-white/60 mt-1">{t.histBottomConquered}</div>
                </div>
                <div className="border-x border-white/15">
                  <div className="font-mono font-black text-base text-[#A9E6CF] leading-none">{String(unlockedPokemonIds.length).padStart(2, "0")}</div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-white/60 mt-1">{t.histBottomCaught}</div>
                </div>
                <div>
                  <div className="font-mono font-black text-base text-[#BDEBFF] leading-none">{timeStr}</div>
                  <div className="text-[8px] font-black uppercase tracking-wider text-white/60 mt-1">{t.histBottomTime}</div>
                </div>
              </div>

              <button
                onClick={() => setShowBattleLog(false)}
                className="mt-2 w-full btn-core-berry py-3"
              >
                {t.histReturnBtn}
              </button>
            </div>
          </div>
        );
      })()}

      {showHelp && (
        <div className="fixed inset-x-0 top-16 bottom-[68px] z-20 bg-[#FFF4DF] flex flex-col font-sans select-none overflow-hidden text-cocoa">

          <div className="mx-auto max-w-lg w-full flex-1 flex flex-col min-h-0">

            {/* Scrollable body — chapters + tips. The "Rozumiem, grajmy!" CTA
                lives in a sticky footer below so it stays in the thumb zone
                without users having to scroll past three chapters first. */}
            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2 flex flex-col gap-2.5 min-h-0">

            {/* Header card "JAK GRAĆ?" */}
            <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-[#FFD84D] px-3 py-2.5 shadow-[0_3px_0_#5A3A2A]">
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-white border-2 border-[#5A3A2A] flex items-center justify-center shadow-[0_2px_0_#5A3A2A]">
                  <HelpCircle className="h-5 w-5 text-[#24456B]" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-black text-base italic uppercase text-[#5A3A2A] leading-none">
                    {t.helpCardTitle}
                  </h2>
                  <p className="text-[10px] text-[#5A3A2A]/80 font-bold mt-1">
                    {t.helpCardSubtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* About pill + body */}
            <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-white px-3 py-2.5 shadow-[0_2px_0_#5A3A2A]">
              <span className="inline-block bg-[#E95050] text-white font-display font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#5A3A2A]">
                ● {t.helpAboutPill}
              </span>
              <p className="text-[11px] text-[#5A3A2A] font-bold leading-relaxed mt-2">
                {t.helpAboutBody}
              </p>
            </div>

            {/* Chapter 1 — ENG */}
            <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-white px-3 py-2.5 shadow-[0_2px_0_#5A3A2A] relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FFD84D]" />
              <div className="flex items-center gap-2 pl-1.5">
                <div className="w-7 h-7 rounded-xl bg-[#FFD84D] border-2 border-[#5A3A2A] flex items-center justify-center font-display font-black text-sm text-[#5A3A2A] shadow-[0_1px_0_#5A3A2A]">1</div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-black text-[11px] uppercase tracking-tight text-[#5A3A2A] italic leading-tight">
                    {t.helpChapter1Title}
                  </div>
                  <span className="inline-block bg-[#BDEBFF] text-[#5A3A2A] font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-[#5A3A2A] mt-0.5">
                    {t.helpChapter1Chip}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[#5A3A2A] font-bold leading-relaxed mt-2 pl-1.5">
                {t.guideTip1}
              </p>
              <div className="mt-2 ml-1.5 inline-flex items-center gap-2 bg-[#FFE3DE] border-2 border-[#5A3A2A] rounded-lg px-2 py-1 text-[9px] font-bold text-[#5A3A2A]">
                <span className="line-through text-[#E95050]">{t.helpChapter1Demo.split("→")[0].trim()}</span>
                <span>→</span>
                <span className="font-mono font-black text-[#24456B]">{t.helpChapter1Demo.split("→")[1]?.trim()}</span>
              </div>
            </div>

            {/* Chapter 2 — SPEECH-TO-TEXT */}
            <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-white px-3 py-2.5 shadow-[0_2px_0_#5A3A2A] relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#A9E6CF]" />
              <div className="flex items-center gap-2 pl-1.5">
                <div className="w-7 h-7 rounded-xl bg-[#FFD84D] border-2 border-[#5A3A2A] flex items-center justify-center font-display font-black text-sm text-[#5A3A2A] shadow-[0_1px_0_#5A3A2A]">2</div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-black text-[11px] uppercase tracking-tight text-[#5A3A2A] italic leading-tight">
                    {t.helpChapter2Title}
                  </div>
                  <span className="inline-block bg-[#A9E6CF] text-[#5A3A2A] font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-[#5A3A2A] mt-0.5">
                    {t.helpChapter2Chip}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[#5A3A2A] font-bold leading-relaxed mt-2 pl-1.5">
                {t.guideTip2}
              </p>
              <div className="mt-2 ml-1.5 inline-flex items-center gap-2 bg-[#1B2840] text-white border-2 border-[#5A3A2A] rounded-lg px-2 py-1">
                <span className="w-2 h-2 rounded-full bg-[#E95050] animate-pulse" />
                <span className="text-[9px] font-black tracking-widest uppercase">{t.helpChapter2DemoLabel}</span>
                <span className="text-[9px] font-mono text-[#FFD84D]">{t.helpChapter2DemoText}</span>
              </div>
            </div>

            {/* Chapter 3 — LIMIT */}
            <div className="shrink-0 rounded-2xl border-2 border-[#5A3A2A] bg-white px-3 py-2.5 shadow-[0_2px_0_#5A3A2A] relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF7A62]" />
              <div className="flex items-center gap-2 pl-1.5">
                <div className="w-7 h-7 rounded-xl bg-[#FFD84D] border-2 border-[#5A3A2A] flex items-center justify-center font-display font-black text-sm text-[#5A3A2A] shadow-[0_1px_0_#5A3A2A]">3</div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-black text-[11px] uppercase tracking-tight text-[#5A3A2A] italic leading-tight">
                    {t.helpChapter3Title}
                  </div>
                  <span className="inline-block bg-[#FFE3DE] text-[#5A3A2A] font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-[#5A3A2A] mt-0.5">
                    {t.helpChapter3Chip}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[#5A3A2A] font-bold leading-relaxed mt-2 pl-1.5">
                {t.guideTip3}
              </p>
            </div>

            </div>

            {/* Sticky CTA footer — always visible above the bottom nav. */}
            <div className="shrink-0 px-3 pt-2 pb-3 border-t-2 border-[#5A3A2A] bg-[#FFF4DF]">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full btn-core-yellow py-3.5"
              >
                {t.guideOk}
              </button>
            </div>
          </div>
        </div>
      )}

      {screen !== "duel" && screen !== "start" && (() => {
        const navPlayActive = (screen === "board" || screen === "start") && !showPokedex && !showHelp;
        const navItemBase = "flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase transition cursor-pointer select-none h-10 rounded-2xl border-2";
        const navActive = "bg-[#FFD84D] text-[#1B2840] border-[#1B2840] shadow-[0_3px_0_#1B2840] px-3.5";
        const navInactive = "bg-transparent border-transparent text-[#5A3A2A]/55 hover:text-cocoa w-10 justify-center";
        const activeColor = "#1B2840";
        const inactiveColor = "rgba(90,58,42,0.55)";
        return (
          <footer
            className="fixed bottom-0 left-0 w-full bg-cafe-beige border-t-2 border-[#5A3A2A] py-2 px-6 flex justify-around items-center shadow-[0_-4px_8px_rgba(90,58,42,0.18)]"
            style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 50 }}
          >
            <button
              onClick={() => {
                setScreen("board");
                setDefenseMode(false);
                setShowPokedex(false);
                setShowHelp(false);
              }}
              className={`${navItemBase} ${navPlayActive ? navActive : navInactive}`}
              title={t.navPlay}
            >
              <NavBoardIcon size={22} color={navPlayActive ? activeColor : inactiveColor} />
              {navPlayActive && <span>{t.navPlay}</span>}
            </button>

            <button
              onClick={() => {
                setShowPokedex(true);
                setShowHelp(false);
              }}
              className={`${navItemBase} ${showPokedex ? navActive : navInactive}`}
              title={t.navPokedex}
            >
              <NavPokedexIcon size={22} color={showPokedex ? activeColor : inactiveColor} />
              {showPokedex && <span>{t.navPokedex}</span>}
            </button>

            <button
              onClick={() => {
                setShowHelp(true);
                setShowPokedex(false);
              }}
              className={`${navItemBase} ${showHelp ? navActive : navInactive}`}
              title={t.navHelp}
            >
              <NavHelpIcon size={20} color={showHelp ? activeColor : inactiveColor} />
              {showHelp && <span>{t.navHelp}</span>}
            </button>
          </footer>
        );
      })()}

      {/* First-run tutorial (design 11) — only on board, when flag unseen and grid is pristine */}
      {!tutorialSeen && screen === "board" && playerTerritorySize === 1 && !showPokedex && !showHelp && !showBattleLog && !showResetConfirm && (
        <TutorialOverlay t={t} onDismiss={dismissTutorial} />
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] bg-cocoa/55 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white border-2 border-[#5A3A2A] rounded-[24px] p-4 text-center space-y-3 shadow-[0_6px_0_#5A3A2A] relative overflow-hidden">
            {/* Striped top accent — irreversible signal */}
            <div
              className="absolute top-0 left-0 right-0 h-2"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, #E95050 0 8px, #FFFFFF 8px 16px)"
              }}
            />

            <div className="pt-2 flex items-center justify-center gap-2 mt-3">
              <div className="h-10 w-10 bg-[#E95050] border-2 border-[#5A3A2A] text-white text-xl font-black flex items-center justify-center rounded-xl shadow-[0_2px_0_#5A3A2A]">
                !
              </div>
              <span className="bg-[#FFE3DE] text-[#E95050] border-2 border-[#5A3A2A] font-display font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {t.resetIrreversiblePill}
              </span>
            </div>

            <h3 className="font-display font-black text-base text-[#5A3A2A] uppercase italic tracking-tight">
              {t.resetTitle2}
            </h3>
            <p className="text-[11px] text-[#5A3A2A]/85 leading-snug px-1 font-bold">
              {t.resetSubDesc}
            </p>

            {/* Current state row */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border-2 border-[#5A3A2A] bg-[#FFF4DF] py-1.5 px-2">
                <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/60">{t.resetStatusFields}</div>
                <div className="font-mono font-black text-sm text-[#24456B]">{playerTerritorySize}<span className="text-[#5A3A2A]/40">/25</span></div>
              </div>
              <div className="rounded-xl border-2 border-[#5A3A2A] bg-[#FFF4DF] py-1.5 px-2">
                <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/60">{t.resetStatusPokedex}</div>
                <div className="font-mono font-black text-sm text-[#24456B]">{unlockedPokemonIds.length}<span className="text-[#5A3A2A]/40">/151</span></div>
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <button
                onClick={executeFullReset}
                className="w-full btn-core-berry py-3"
              >
                {t.resetYesAll}
              </button>

              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-full btn-core-dark py-2.5"
              >
                {t.resetCancel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
