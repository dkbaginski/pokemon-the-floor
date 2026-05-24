import { useState, useEffect } from "react";
import { INITIAL_GRID, BOTS, Bot, GridCell } from "./bots";
import { getPokemonImageUrl } from "./pokemonData";
import FloorGrid from "./components/FloorGrid";
import DuelArea from "./components/DuelArea";
import PokedexView from "./components/PokedexView";
import { translations } from "./translations";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  HelpCircle,
  BookOpen,
  Swords,
  Play,
  ShieldCheck,
  Activity,
  ChevronRight,
  History,
  X
} from "lucide-react";

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
    setLogs([
      { key: "logReset1" },
      { key: "logReset2" }
    ]);
    setShowResetConfirm(false);
  };

  // --- Compute player stats ---
  const playerControlledCells = grid.filter((c) => c.currentOwnerId === "player");
  const playerTerritorySize = playerControlledCells.length;

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
    stats: { userCorrect: number; userPassed: number; timerRemaining: number }
  ) => {
    setDuelStats({
      winnerId: winnerId === "player" ? "player" : selectedOpponent?.id || "unknown",
      userCorrect: stats.userCorrect,
      userPassed: stats.userPassed,
      timerRemaining: stats.timerRemaining
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
      setLogs((prev) => [
        { key: "logDefeat", params: { name: botName(selectedOpponent) } },
        ...prev
      ].slice(0, 10));
      setScreen("duel_lose");
    }
  };

  // --- Return to board safely + simulating board turn ---
  const handleReturnToBoardWithSimulation = () => {
    setSelectedCell(null);
    setSelectedOpponent(null);
    setScreen("board");

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
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 active:scale-95 transition-all text-cocoa"
          title={language === "pl" ? "Powrót do menu głównego" : "Back to main menu"}
        >
          <div className="bg-[#FFD84D] text-[#24456B] font-black text-[11px] px-2.5 py-1 rounded-[12px] tracking-tight uppercase border border-cocoa shadow-sm">
            POKÉ
          </div>
          <span className="font-display font-black tracking-tight text-xs text-[#5A3A2A] uppercase italic">THE FLOOR</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeLanguage(language === "pl" ? "en" : "pl")}
            className="flex items-center justify-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white-frost border-2 border-cocoa/30 hover:bg-cafe-beige text-[10px] sm:text-xs font-black tracking-wider uppercase transition cursor-pointer text-cocoa"
            title={language === "pl" ? "Zmień na angielski" : "Switch to Polish"}
          >
            <span>🌐</span>
            <span className="font-mono text-[9px] sm:text-[10px]">{language === "pl" ? "PL" : "EN"}</span>
          </button>

          {showHeaderActions && (
            <button
              onClick={() => setShowBattleLog(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white-frost border-2 border-cocoa/30 px-3 py-1.5 text-xs font-bold text-cocoa hover:bg-cafe-beige transition cursor-pointer"
              title={language === "pl" ? "Historia walk" : "Battle history"}
            >
              <History className="h-3.5 w-3.5 text-[#24456B]" />
              <span className="text-cocoa text-[10px] uppercase tracking-widest font-black">{t.logiBtn}</span>
            </button>
          )}

          {showHeaderActions && (
            <button
              onClick={handleFullReset}
              className="p-1.5 rounded-xl bg-white-frost border-2 border-cocoa/30 hover:bg-cafe-beige text-cocoa hover:text-red-500 transition cursor-pointer"
              title={language === "pl" ? "Resetuj grę" : "Reset game"}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* --- CORE CONTENT PANELS ROUTER --- */}
      <main className={`flex-1 px-4 pt-4 pb-20 ${screen === "start" || screen === "board" || screen === "challenge" || screen === "duel" ? "overflow-hidden" : "overflow-y-auto"}`}>

        {/* SCREEN 1: START SCREEN */}
        {screen === "start" && (
          <div className="w-full h-full flex flex-col justify-between items-center fluid-py-container px-2 text-center font-sans select-none max-w-sm mx-auto">

            <div className="flex-1 flex flex-col justify-center items-center fluid-gap-medium w-full min-h-0">

              <div
                className="relative rounded-full bg-white-frost flex items-center justify-center border-2 border-[#5A3A2A] shadow-[0_4px_8px_rgba(90,58,42,0.18)] shrink mb-1 fluid-badge-container sticker-hover"
              >
                <div className="absolute inset-0 rounded-full bg-cafe-beige/20 animate-pulse" />
                <img
                  src={getPokemonImageUrl(25)}
                  alt="Logo Game"
                  referrerPolicy="no-referrer"
                  className="object-contain z-10 animate-hover fluid-img-pikachu"
                  style={{ objectFit: 'contain', filter: "drop-shadow(0 4px 6px rgba(90,58,42,0.15))" }}
                />
              </div>

              <div className="space-y-1 shrink-0">
                <span className="text-[11px] uppercase tracking-widest text-[#24456B] font-display font-black">{language === "pl" ? "Region Kanto" : "Kanto Region"}</span>
                <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight leading-none italic uppercase text-[#5A3A2A]">
                  THE FLOOR<br />
                  <span className="text-[#24456B]">POKÉMON</span>
                </h1>
                <p className="text-[11px] sm:text-xs text-[#5A3A2A]/80 max-w-[280px] mx-auto leading-relaxed font-sans font-semibold">
                  {t.subTitle}
                </p>
              </div>

              <div className="w-full text-left rounded-3xl bg-cafe-beige border-2 border-[#5A3A2A] p-4.5 space-y-1.5 shadow-[0_4px_0_#5A3A2A] shrink max-h-[22vh] overflow-y-auto">
                <span className="text-[10px] font-black text-[#5A3A2A] tracking-widest uppercase flex items-center gap-1.5 border-b border-cocoa/20 pb-1.5 shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-[#24456B] shrink-0" /> {t.rulesTitle}
                </span>
                <ul className="text-xs space-y-1.5 text-[#5A3A2A] font-bold font-sans">
                  <li className="flex gap-1.5 items-start">
                    <span className="text-[#24456B] shrink-0 font-black">✦</span>
                    <span>{t.rule1}</span>
                  </li>
                  <li className="flex gap-1.5 items-start">
                    <span className="text-[#24456B] shrink-0 font-black">✦</span>
                    <span>{t.rule2}</span>
                  </li>
                  <li className="flex gap-1.5 items-start">
                    <span className="text-[#24456B] shrink-0 font-black">✦</span>
                    <span>{t.rule3}</span>
                  </li>
                  <li className="flex gap-1.5 items-start">
                    <span className="text-[#24456B] shrink-0 font-black">✦</span>
                    <span>{t.rule4}</span>
                  </li>
                  <li className="flex gap-1.5 items-start">
                    <span className="text-[#24456B] shrink-0 font-black">✦</span>
                    <span>{t.rule5}</span>
                  </li>
                </ul>
              </div>

            </div>

            <div className="w-full flex flex-col items-center gap-2 mt-4 shrink-0">
              <button
                 onClick={() => setScreen("board")}
                 className="w-full btn-core-yellow py-4 flex items-center justify-center gap-2"
              >
                <span>{t.startBtn}</span>
                <Play className="h-4 w-4 fill-cocoa text-cocoa" />
              </button>

              <button
                onClick={() => {
                  setShowHelp(true);
                }}
                className="text-[11px] sm:text-xs font-black uppercase text-[#24456B] hover:underline tracking-wider flex items-center gap-1.5 transition py-1 cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 text-pokemon-navy" />
                <span>{t.navHelp}</span>
              </button>
            </div>

          </div>
        )}

        {/* SCREEN 2: THE MAIN BOARD VIEW */}
        {screen === "board" && (
          <div className="h-full flex flex-col justify-between pb-2">

            <div className="rounded-2xl border-2 border-cocoa/40 bg-white-frost px-3.5 py-2 flex flex-col items-center justify-center text-center shadow-md select-none">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#24456B] leading-tight mb-0.5">{t.boardBannerTitle}</h4>
              <p className="text-[11px] sm:text-xs font-bold text-[#5A3A2A]/80 leading-normal">
                {t.boardBannerSub}
              </p>
            </div>

            {/* Defense alert */}
            {selectedCell && defenseMode && selectedOpponent && (
              <div className="rounded-[24px] border-2 border-[#5A3A2A] bg-white-frost p-5 space-y-4 shadow-xl animate-pulse relative overflow-hidden shrink-0 mt-3">
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-coral" />
                <div className="flex items-center gap-2 text-coral font-black text-[10px] uppercase tracking-widest pl-2">
                  <ShieldCheck className="h-4 w-4 text-coral" />
                  <span>{t.defenseModeTitle}</span>
                </div>

                <h3 className="text-sm font-black text-[#5A3A2A] leading-tight pl-2 uppercase">
                  <span className="text-[#24456B] font-black">{botName(selectedOpponent)}</span> ({selectedOpponent.avatar}) {t.defenseModeSubtitle}
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
              <div className="flex-1 flex flex-col justify-center min-h-0 fluid-map-scale">
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
              </div>
            )}

          </div>
        )}

        {/* SCREEN 3: PRE-CHALLENGE INTENT EXPANSION */}
        {screen === "challenge" && selectedCell && selectedOpponent && (
          <div className="w-full h-full max-h-full flex flex-col justify-between items-center overflow-hidden py-1 px-2 text-center font-sans select-none">
            <div className="rounded-3xl border-2 border-cocoa bg-[#FFF4DF] p-5 text-center flex-1 flex flex-col justify-between w-full max-w-md shadow-xl relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{
                  backgroundColor:
                    selectedOpponent.difficulty === "easy"
                      ? "#A9E6CF"
                      : selectedOpponent.difficulty === "medium"
                      ? "#FFD84D"
                      : "#FF7A62"
                }}
              />

              <div className="space-y-1 shrink-0 mt-1">
                <span className="text-[10px] font-black tracking-widest text-[#24456B] uppercase bg-white-frost px-3.5 py-1 rounded-full border-2 border-cocoa shadow-sm font-display">
                  {t.areaControl}
                </span>
                <p className="text-[10px] sm:text-[11px] text-[#5A3A2A]/85 mt-1.5 font-bold">{t.fieldOpponent}</p>
              </div>

              {/* Opponent profile */}
              <div className="flex flex-col items-center justify-center flex-1 py-1 shrink-1 min-h-0">
                <div
                  className={`rounded-3xl flex items-center justify-center shadow-md border-2 border-cocoa flex-shrink-1 fluid-img-avatar ${selectedOpponent.avatarColor || "bg-indigo-600"}`}
                  style={{
                    aspectRatio: '1 / 1',
                    objectFit: 'contain',
                    flexShrink: 1
                  }}
                >
                  <span className="text-5xl md:text-6xl select-none leading-none">{selectedOpponent.avatar}</span>
                </div>
                <h3 className="font-display text-base sm:text-lg font-black text-cocoa tracking-tight leading-none mt-2">
                  {botName(selectedOpponent)}
                </h3>

                <div className="mt-1 flex gap-2 items-center text-xs justify-center shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border-2 border-cocoa ${
                    selectedOpponent.difficulty === "easy"
                      ? "text-cocoa bg-soft-mint"
                      : selectedOpponent.difficulty === "medium"
                      ? "text-cocoa bg-[#FFD84D]"
                      : "text-cocoa bg-coral"
                  }`}>
                    {t.difficultyLabel} {t[selectedOpponent.difficulty]}
                  </span>
                </div>
              </div>

              {/* Battle category — pool info */}
              <div className="rounded-2xl bg-white-frost p-3 border-2 border-cocoa text-left space-y-1.5 shrink-0 my-1 min-h-0 shadow-sm">
                <div className="flex items-center gap-2 justify-between border-b border-cocoa/20 pb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#5A3A2A]/85 font-black">{t.challengeCategory}</span>
                  <span className="text-[10px] font-black font-display text-[#24456B] uppercase bg-cafe-beige/40 px-2 py-0.5 rounded border border-cocoa/40">
                    {selectedOpponent.pokemonPool.length} {t.botPoolSizeLabel}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#5A3A2A] leading-relaxed font-bold text-center pt-1">
                  {t.difficultyLabel} <strong className="text-pokemon-navy uppercase">{t[selectedOpponent.difficulty]}</strong>
                </p>
              </div>

              {/* Start Duel CTA */}
              <div className="space-y-2 pt-1 shrink-0 w-full">
                <button
                  onClick={handleLaunchDuel}
                  className="w-full btn-core-yellow py-3.5 flex items-center justify-center gap-1.5"
                >
                  <span>{t.challengeFightBtn}</span>
                  <Swords className="h-4 w-4 text-[#24456B]" />
                </button>

                <button
                  onClick={() => {
                    setSelectedCell(null);
                    setSelectedOpponent(null);
                    setScreen("board");
                  }}
                  className="w-full btn-core-dark py-2.5"
                >
                  {t.challengeCancelBtn}
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* SCREEN 5: DUEL WIN CELEBRATION */}
        {screen === "duel_win" && (
          <div className="space-y-6 pt-2 text-center select-none max-w-sm mx-auto">
            <div className="h-28 w-28 rounded-full bg-[#FFD84D] border-2 border-cocoa shadow-[0_4px_0_#5A3A2A] flex items-center justify-center mx-auto my-2 relative">
              <Trophy className="h-12 w-12 text-[#24456B] drop-shadow-sm animate-bounce" />
              <div className="absolute -top-1.5 right-0 rounded-full bg-soft-mint text-cocoa text-[9px] px-2.5 py-0.5 font-black uppercase tracking-wider border border-cocoa shadow-sm">
                {t.winLandBadge}
              </div>
            </div>

            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-black text-pokemon-navy tracking-tight italic uppercase">
                {t.winTitle}
              </h1>
              <p className="text-xs text-cocoa font-bold">
                {t.winDesc} {botName(selectedOpponent)}!
              </p>
            </div>

            <div className="rounded-[24px] bg-white border-2 border-cocoa p-5 space-y-4 text-left shadow-md">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#5A3A2A] border-b border-cocoa/20 pb-2.5 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#24456B]" /> {t.statsTitle}
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-cocoa">
                <div>
                  <span className="text-[#5A3A2A]/80 text-[10px] uppercase font-black">{t.statsPokemons}</span>
                  <p className="text-sm font-black text-[#24456B] mt-0.5">
                    {duelStats.userCorrect} {t.statsCorrect}
                  </p>
                </div>

                <div>
                  <span className="text-[#5A3A2A]/80 text-[10px] uppercase font-black">{t.statsPassed}</span>
                  <p className="text-sm font-black text-coral mt-0.5">
                    {duelStats.userPassed} {t.statsPassedTimes}
                  </p>
                </div>

                <div>
                  <span className="text-[#5A3A2A]/80 text-[10px] uppercase font-black">{t.statsRemainingTime}</span>
                  <p className="text-sm font-black text-[#24456B] font-mono mt-0.5">
                    {duelStats.timerRemaining.toFixed(1)}s
                  </p>
                </div>

                <div>
                  <span className="text-[#5A3A2A]/80 text-[10px] uppercase font-black">{t.statsBotConquered}</span>
                  <p className="text-sm font-black text-coral uppercase mt-0.5">
                    {botName(selectedOpponent)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleReturnToBoardWithSimulation}
                className="w-full btn-core-yellow py-4 flex items-center justify-center gap-1.5"
              >
                <span>{t.returnToBoardBtn}</span>
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </button>

              <p className="text-[10px] text-[#5A3A2A]/80 px-3 tracking-wide leading-relaxed uppercase font-black">
                {t.nextStepWarning}
              </p>
            </div>
          </div>
        )}

        {/* SCREEN 6: DUEL LOSE OVERLAY GAME OVER */}
        {screen === "duel_lose" && (
          <div className="space-y-6 pt-2 text-center max-w-sm mx-auto select-none font-sans text-cocoa">
            <div className="h-28 w-28 rounded-full bg-coral/25 border-2 border-dashed border-[#5A3A2A] flex items-center justify-center shadow-md mx-auto my-2">
              <span className="text-5xl">👻</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-black text-coral tracking-tight uppercase italic">
                {t.gameOverTitle}
              </h1>
              <p className="text-xs text-cocoa font-bold leading-relaxed px-4">
                {t.gameOverDesc}{selectedOpponent ? ` — ${botName(selectedOpponent)}.` : "."}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF4DF] border border-cocoa p-5 text-left space-y-2.5 shadow-md">
              <h4 className="text-[10px] uppercase tracking-widest font-black text-pokemon-navy">💡 {t.quickTipTitle}</h4>
              <p className="leading-relaxed text-xs text-cocoa font-bold">
                {t.quickTipDesc}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleLaunchDuel}
                  className="w-full btn-core-yellow py-3.5"
                >
                  {t.tryAgainBtn}
                </button>

                <button
                  onClick={handleFullReset}
                  className="w-full btn-core-red py-3.5"
                >
                  {t.restartGameBtn}
                </button>
              </div>

              <button
                onClick={() => {
                  setScreen("board");
                  setSelectedCell(null);
                  setSelectedOpponent(null);
                  setDefenseMode(false);
                }}
                className="w-full btn-core-dark py-3.5"
              >
                {t.returnToMapBtn}
              </button>
            </div>
          </div>
        )}

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

      {showBattleLog && (
        <div className="fixed inset-0 z-[60] bg-cocoa/55 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-cream-base border-2 border-cocoa rounded-[24px] flex flex-col h-[75dvh] max-h-[550px] shadow-lg overflow-hidden relative font-sans text-cocoa">

            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-cafe-beige/20 to-transparent pointer-events-none" />

            <header className="h-16 w-full bg-cream-base border-b-2 border-cocoa px-6 flex items-center justify-between sticky top-0 z-50 select-none font-sans shrink-0">
              <h2 className="font-display font-black tracking-tight text-xs sm:text-sm text-pokemon-navy uppercase italic flex items-center gap-1.5 shrink-0">
                <Activity className="h-4 w-4 text-pokemon-navy" />
                <span>{t.logHeader}</span>
              </h2>
              <button
                onClick={() => setShowBattleLog(false)}
                className="rounded-full bg-white-frost border-2 border-cocoa text-cocoa hover:bg-cafe-beige p-1 flex items-center justify-center transition cursor-pointer outline-none"
                title={t.guideClose}
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5 bg-[#FFF4DF]">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-cocoa/50 text-xs font-black uppercase tracking-widest leading-normal">
                  {t.emptyLogs}
                </div>
              ) : (
                logs.map((log, index) => {
                  const messageText = renderLogMessage(log);
                  const isWin = log.key === "logVictory" || log.key === "logInit1" || log.key === "logInit2" || log.key === "logReset1" || log.key === "logReset2";
                  const isLose = log.key === "logDefeat" || log.key === "logWarnAttack";

                  let borderColor = "border-[#24456B]";
                  let bgTint = "bg-[#BDEBFF]/20";
                  if (isWin) {
                    borderColor = "border-soft-mint";
                    bgTint = "bg-[#A9E6CF]/15";
                  } else if (isLose) {
                    borderColor = "border-coral";
                    bgTint = "bg-coral/10";
                  }

                  const iconEmoji = isLose ? "💀" : (log.key === "logWarnAttack" ? "🔥" : "⚔️");

                  return (
                    <div
                      key={index}
                      className={`flex gap-3 items-start p-3 bg-gradient-to-r ${borderColor} border-l-4 border-y border-r border-[#5A3A2A]/40 rounded-r-2xl transition duration-150 hover:bg-white-frost/30 shadow-sm`}
                      style={{ background: bgTint }}
                    >
                      <span className="text-sm shrink-0 select-none mt-0.5">
                        {iconEmoji}
                      </span>
                      <p className="text-xs text-cocoa font-bold leading-relaxed text-left font-sans">
                        {messageText}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-cafe-beige border-t-2 border-cocoa shrink-0">
              <button
                onClick={() => setShowBattleLog(false)}
                className="w-full btn-core-yellow py-3"
              >
                {t.logReturnBtn}
              </button>
            </div>

          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-x-0 top-0 bottom-[68px] z-20 bg-cream-base flex flex-col justify-start font-sans select-none overflow-hidden text-cocoa">
          <header className="h-16 w-full bg-cream-base border-b-2 border-cocoa px-4 flex items-center justify-between sticky top-0 z-50 select-none font-sans shrink-0">
            <h2 className="font-display font-black tracking-tight text-sm sm:text-base text-pokemon-navy uppercase italic flex items-center gap-1.5 shrink-0">
              <HelpCircle className="h-4 w-4 text-pokemon-navy" />
              <span>{t.guideTitle}</span>
            </h2>
            <button
              onClick={() => setShowHelp(false)}
              className="rounded-xl bg-white-frost hover:bg-cafe-beige border-2 border-cocoa text-cocoa px-3.5 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer shadow-[0_3px_0_#5A3A2A]"
            >
              {t.guideClose}
            </button>
          </header>

          <div className="mx-auto max-w-lg px-4 py-4 w-full flex-1 flex flex-col overflow-hidden justify-between">
            <div className="space-y-4 text-xs text-cocoa leading-relaxed text-left flex-1 overflow-y-auto pr-1 pb-4 font-bold">
              <p className="font-sans leading-normal">
                {t.guideDesc1}
              </p>

              <h4 className="font-black text-pokemon-navy uppercase tracking-wide text-xs">{t.guideTipsTitle}</h4>
              <ul className="list-disc pl-5 space-y-2 text-cocoa/90 font-sans">
                <li>
                  {t.guideTip1}
                </li>
                <li>
                  {t.guideTip2}
                </li>
                <li>
                  {t.guideTip3}
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t-2 border-cocoa/25 shrink-0 pb-2">
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

      {screen !== "duel" && (
        <footer
          className="fixed bottom-0 left-0 w-full bg-cafe-beige border-t-2 border-[#5A3A2A] py-2.5 px-6 grid grid-cols-3 justify-items-center items-center shadow-[0_-4px_8px_rgba(90,58,42,0.18)]"
          style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 50 }}
        >
          <button
            onClick={() => {
              setScreen("board");
              setDefenseMode(false);
              setShowPokedex(false);
              setShowHelp(false);
            }}
            className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider uppercase transition cursor-pointer select-none py-1.5 px-4 rounded-xl border-2 ${
              (screen === "board" || screen === "start") && !showPokedex && !showHelp
                ? "bg-[#FFD84D] text-[#24456B] border-[#24456B] shadow-[0_2px_0_#24456B]"
                : "bg-transparent border-transparent text-[#5A3A2A]/70 hover:text-cocoa"
            }`}
          >
            <Swords className="h-[18px] w-[18px]" />
            <span>{t.navPlay}</span>
          </button>

          <button
            onClick={() => {
              setShowPokedex(true);
              setShowHelp(false);
            }}
            className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider uppercase transition cursor-pointer select-none py-1.5 px-4 rounded-xl border-2 ${
              showPokedex
                ? "bg-[#FFD84D] text-[#24456B] border-[#24456B] shadow-[0_2px_0_#24456B]"
                : "bg-transparent border-transparent text-[#5A3A2A]/70 hover:text-cocoa"
            }`}
          >
            <BookOpen className="h-[18px] w-[18px]" />
            <span>{t.navPokedex}</span>
          </button>

          <button
            onClick={() => {
              setShowHelp(true);
              setShowPokedex(false);
            }}
            className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider uppercase transition cursor-pointer select-none py-1.5 px-4 rounded-xl border-2 ${
              showHelp
                ? "bg-[#FFD84D] text-[#24456B] border-[#24456B] shadow-[0_2px_0_#24456B]"
                : "bg-transparent border-transparent text-[#5A3A2A]/70 hover:text-cocoa"
            }`}
          >
            <HelpCircle className="h-[18px] w-[18px]" />
            <span>{t.navHelp}</span>
          </button>
        </footer>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] bg-cocoa/55 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-cream-base border-2 border-cocoa rounded-[24px] p-6 text-center space-y-4 shadow-lg">
            <div className="h-14 w-14 bg-coral/20 border-2 border-cocoa text-coral text-2xl flex items-center justify-center rounded-full mx-auto animate-pulse select-none">
              ⚠️
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-black text-base text-[#5A3A2A] uppercase italic tracking-tight">
                {t.resetTitle}
              </h3>
              <p className="text-xs text-cocoa/80 leading-relaxed px-1 font-sans font-bold">
                {t.resetDesc}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={executeFullReset}
                className="w-full btn-core-red py-3 text-cocoa"
              >
                {t.resetConfirmBtn}
              </button>

              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-full btn-core-dark py-3"
              >
                {t.cancelBtn}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
