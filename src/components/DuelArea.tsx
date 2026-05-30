import { useState, useEffect, useRef, FormEvent } from "react";
import { Pokemon, POKEMON_LIST, getPokemonImageUrl, isCorrectPokemonName } from "../pokemonData";
import { Bot } from "../bots";
import { Mic, AlertCircle, ArrowRight, AlertTriangle } from "lucide-react";

interface DuelAreaProps {
  opponent: Bot;
  pokemonPool: number[];                       // Pokédex IDs assignable in this duel
  recentlyShownIds: number[];                  // Persistent rolling-window log from App
  onPokemonShown: (id: number) => void;        // Callback to extend the persistent log
  onDuelFinish: (winnerId: string, stats: { userCorrect: number; userPassed: number; timerRemaining: number; lastPokemonId: number | null; newlyUnlocked: number[] }) => void;
  onUnlockPokemon: (id: number) => void;
  onSeePokemon?: (id: number) => void;
  language: "pl" | "en";
  playerName?: string;
  t: any;
}

export default function DuelArea({
  opponent,
  pokemonPool,
  recentlyShownIds,
  onPokemonShown,
  onDuelFinish,
  onUnlockPokemon,
  onSeePokemon,
  language,
  playerName,
  t
}: DuelAreaProps) {
  // --- Timers State ---
  const [playerTime, setPlayerTime] = useState(45.0);
  const [opponentTime, setOpponentTime] = useState(45.0);
  const [activePlayer, setActivePlayer] = useState<"player" | "opponent">("player");
  const [duelEnded, setDuelEnded] = useState(false);

  // --- Pokémon Pools ---
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [pokedexStats, setPokedexStats] = useState({ correct: 0, passed: 0 });

  // --- Voice Search / Speech Recognition ---
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [stillListening, setStillListening] = useState(false);
  const [, setHeardText] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  // Live handle to the active SpeechRecognition instance so a second tap (or an
  // inactivity timer) can stop it. Lifted out of startSpeechRecognition's scope.
  const recognitionRef = useRef<any>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const reassureTimerRef = useRef<number | null>(null);
  // True once a transcript came back, so onend can tell "user/timer stopped it"
  // (no error banner) apart from a genuine recognition error.
  const gotResultRef = useRef(false);

  // Clears both voice timers. Called on stop, result, error and unmount.
  const clearVoiceTimers = () => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (reassureTimerRef.current !== null) {
      window.clearTimeout(reassureTimerRef.current);
      reassureTimerRef.current = null;
    }
  };

  // Stop listening on unmount so a dangling recognition/timer can't fire.
  useEffect(() => {
    return () => {
      clearVoiceTimers();
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  // --- Opponent AI Thinking state ---
  const [opponentGuessText, setOpponentGuessText] = useState("");
  const opponentThinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- PAS flash (design 07c) — brief red-mode after player passes ---
  const [passFlashUntil, setPassFlashUntil] = useState<number>(0);
  const isPassFlash = passFlashUntil > Date.now();
  // `passPenaltyKey` increments on every pass so the floating "−5s" tag near
  // the player timer remounts and replays its CSS animation each time.
  const [passPenaltyKey, setPassPenaltyKey] = useState<number>(0);

  // --- Opponent PAS flash — mirrors the player's pass treatment but ONLY on
  // the opponent timer card, so it's clearly visible when the AI passes. ---
  const [opponentPassFlashUntil, setOpponentPassFlashUntil] = useState<number>(0);
  const isOpponentPassFlash = opponentPassFlashUntil > Date.now();
  const [opponentPassPenaltyKey, setOpponentPassPenaltyKey] = useState<number>(0);

  // --- References for visual timers ---
  const intervalRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cache to track and prevent duplicate pokemon shown in this duel session.
  // Seeded from App-level rolling window so back-to-back duels don't repeat.
  const shownPokemonIdsRef = useRef<number[]>([...recentlyShownIds]);
  const instanceEndedRef = useRef<boolean>(false);

  // Track Pokémon IDs the player correctly named during this duel — surfaced on the win screen.
  const newlyUnlockedRef = useRef<number[]>([]);

  // Resolve the bot's pool into actual Pokémon records.
  const getPoolPokemon = (): Pokemon[] => {
    const pokeById = new Map(POKEMON_LIST.map((p) => [p.id, p]));
    const resolved = pokemonPool.map((id) => pokeById.get(id)).filter(Boolean) as Pokemon[];
    return resolved.length > 0 ? resolved : POKEMON_LIST;
  };

  const getNextPokemonFromPool = (): Pokemon => {
    const pool = getPoolPokemon();

    // Prefer pool entries that haven't been shown recently (this duel + App log).
    let unused = pool.filter((p) => !shownPokemonIdsRef.current.includes(p.id));

    // If everything from this pool has been shown, soft-reset but keep the most recent id
    // so we don't show the same Pokémon twice in a row at the boundary.
    if (unused.length === 0) {
      const lastShownId = shownPokemonIdsRef.current[shownPokemonIdsRef.current.length - 1];
      shownPokemonIdsRef.current = lastShownId !== undefined ? [lastShownId] : [];
      unused = pool.filter((p) => !shownPokemonIdsRef.current.includes(p.id));
    }

    // Safety net.
    if (unused.length === 0) unused = pool;

    const chosen = unused[Math.floor(Math.random() * unused.length)];
    if (chosen) {
      shownPokemonIdsRef.current.push(chosen.id);
      onPokemonShown(chosen.id);
    }
    return chosen;
  };

  // Initialize first Pokemon
  useEffect(() => {
    setCurrentPokemon(getNextPokemonFromPool());
    setIsManualMode(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    return () => {
      if (opponentThinkingTimerRef.current) clearTimeout(opponentThinkingTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track seen pokemons automatically whenever currentPokemon changes
  useEffect(() => {
    if (currentPokemon && onSeePokemon) {
      onSeePokemon(currentPokemon.id);
    }
  }, [currentPokemon, onSeePokemon]);

  // --- Global ticking clock (100ms interval for precision) ---
  useEffect(() => {
    if (duelEnded) return;

    intervalRef.current = window.setInterval(() => {
      if (activePlayer === "player") {
        setPlayerTime((prev) => {
          if (prev <= 0.1) {
            handleWinner("opponent");
            return 0;
          }
          return Math.round((prev - 0.1) * 10) / 10;
        });
      } else {
        setOpponentTime((prev) => {
          if (prev <= 0.1) {
            handleWinner("player");
            return 0;
          }
          return Math.round((prev - 0.1) * 10) / 10;
        });
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlayer, duelEnded]);

  // --- Handle Speech Recognition (Web Speech API) ---
  // Single tap toggles listening: start when idle, stop when already listening.
  const toggleSpeech = () => {
    if (isListening) {
      clearVoiceTimers();
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      return;
    }
    startSpeechRecognition();
  };

  const startSpeechRecognition = () => {
    setIsManualMode(false);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(t.speechNotAvailable);
      return;
    }

    setSpeechError(null);
    setStillListening(false);
    setHeardText("");
    gotResultRef.current = false;
    const recognition = new SpeechRecognition();
    recognition.lang = "pl-PL"; // Recognize as Polish pronunciation
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      // Mid-timeout reassurance: at ~half the inactivity window, reassure the
      // player we're still listening (shown in place of the error banner).
      reassureTimerRef.current = window.setTimeout(() => setStillListening(true), 2500);
      // Inactivity auto-stop: if nothing is recognised within 5s, stop cleanly.
      inactivityTimerRef.current = window.setTimeout(() => {
        try {
          recognitionRef.current?.stop();
        } catch {
          /* ignore */
        }
      }, 5000);
    };

    recognition.onresult = (event: any) => {
      gotResultRef.current = true;
      clearVoiceTimers();
      const result = event.results[0][0].transcript;
      setHeardText(result);
      setStillListening(false);
      setIsListening(false);
      handleVoiceTranscript(result);
    };

    recognition.onerror = (event: any) => {
      clearVoiceTimers();
      setIsListening(false);
      setStillListening(false);
      // "aborted" / "no-speech" after a manual or timer stop is not a real error
      // — only surface the "speak louder" hint for genuine recognition failures.
      if (!gotResultRef.current && event?.error !== "aborted" && event?.error !== "no-speech") {
        setSpeechError(t.speechNotHeard);
      }
    };

    recognition.onend = () => {
      clearVoiceTimers();
      setIsListening(false);
      setStillListening(false);
    };

    recognition.start();
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (!currentPokemon || duelEnded) return;

    if (isCorrectPokemonName(transcript, currentPokemon.name)) {
      onUnlockPokemon(currentPokemon.id);
      if (!newlyUnlockedRef.current.includes(currentPokemon.id)) {
        newlyUnlockedRef.current.push(currentPokemon.id);
      }
      setPokedexStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setTypedAnswer("");
      setHeardText("");
      switchToOpponent();
    } else {
      setTypedAnswer(transcript);
      setSpeechError(`${t.speechHeard}: "${transcript}". ${t.speechCorrect}`);
    }
  };

  // --- When the Player submits an answer ---
  const handlePlayerSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!currentPokemon || duelEnded || activePlayer !== "player") return;

    if (isCorrectPokemonName(typedAnswer, currentPokemon.name)) {
      onUnlockPokemon(currentPokemon.id);
      if (!newlyUnlockedRef.current.includes(currentPokemon.id)) {
        newlyUnlockedRef.current.push(currentPokemon.id);
      }
      setPokedexStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setTypedAnswer("");
      setHeardText("");
      setSpeechError(null);
      switchToOpponent();
    } else {
      setSpeechError(t.speechWrong);
    }
  };

  // --- Player click "PASUJ" (Pass) with -5s penalty ---
  const handlePlayerPass = () => {
    if (duelEnded || activePlayer !== "player") return;

    setPlayerTime((prev) => {
      const afterPenalty = prev - 5.0;
      if (afterPenalty <= 0) {
        handleWinner("opponent");
        return 0;
      }
      return Math.round(afterPenalty * 10) / 10;
    });

    setPokedexStats((prev) => ({ ...prev, passed: prev.passed + 1 }));
    setSpeechError(null);
    setTypedAnswer("");
    setIsManualMode(false);
    setCurrentPokemon(getNextPokemonFromPool());
    setPassFlashUntil(Date.now() + 450); // brief mignięcie, nie utrzymujący się czerwony stan
    setPassPenaltyKey((k) => k + 1);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Tick re-render every 250ms so isPassFlash flips off without user input.
  useEffect(() => {
    if (passFlashUntil === 0) return;
    if (passFlashUntil <= Date.now()) return;
    const t = setTimeout(() => setPassFlashUntil((v) => (v <= Date.now() ? 0 : v)), passFlashUntil - Date.now() + 50);
    return () => clearTimeout(t);
  }, [passFlashUntil]);

  // Same flip-off tick for the opponent pass flash.
  useEffect(() => {
    if (opponentPassFlashUntil === 0) return;
    if (opponentPassFlashUntil <= Date.now()) return;
    const t = setTimeout(() => setOpponentPassFlashUntil((v) => (v <= Date.now() ? 0 : v)), opponentPassFlashUntil - Date.now() + 50);
    return () => clearTimeout(t);
  }, [opponentPassFlashUntil]);

  // --- State changes between active participants ---
  const switchToOpponent = () => {
    if (duelEnded) return;
    setActivePlayer("opponent");
    setTypedAnswer("");

    const nextPoke = getNextPokemonFromPool();
    setCurrentPokemon(nextPoke);
    triggerOpponentThinking(nextPoke);
  };

  const switchToPlayer = () => {
    if (duelEnded) return;
    setActivePlayer("player");
    setOpponentGuessText("");
    setIsManualMode(false);
    setCurrentPokemon(getNextPokemonFromPool());

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  // --- Opponent AI Decision Core ---
  const triggerOpponentThinking = (pokemonToGuess: Pokemon) => {
    if (opponentThinkingTimerRef.current) clearTimeout(opponentThinkingTimerRef.current);

    let selectDelayMs = 4000;
    let passChance = 0.15;

    if (opponent.difficulty === "easy") {
      selectDelayMs = 4000 + Math.random() * 2500;
      passChance = 0.18;
    } else if (opponent.difficulty === "medium") {
      selectDelayMs = 2500 + Math.random() * 2000;
      passChance = 0.10;
    } else {
      selectDelayMs = 1500 + Math.random() * 1200;
      passChance = 0.05;
    }

    opponentThinkingTimerRef.current = setTimeout(() => {
      if (duelEnded) return;

      const randomRoll = Math.random();
      if (randomRoll < passChance) {
        setOpponentTime((prev) => {
          const afterPenalty = prev - 5.0;
          if (afterPenalty <= 0) {
            handleWinner("player");
            return 0;
          }
          return Math.round(afterPenalty * 10) / 10;
        });

        // Surface the pass on the opponent timer (red flash + "PAS" pill +
        // floating −5s), the same way the player's pass reads. No image
        // bubble for passes — the timer is the single, clear signal.
        setOpponentPassFlashUntil(Date.now() + 450);
        setOpponentPassPenaltyKey((k) => k + 1);
        setOpponentGuessText("");

        const nextPoke = getNextPokemonFromPool();
        setCurrentPokemon(nextPoke);
        triggerOpponentThinking(nextPoke);
      } else {
        setOpponentGuessText(pokemonToGuess.name);

        setTimeout(() => {
          if (duelEnded) return;
          switchToPlayer();
        }, 1200);
      }
    }, selectDelayMs);
  };

  // --- Handle End of Duel ---
  const handleWinner = (winner: "player" | "opponent") => {
    if (instanceEndedRef.current) return;
    instanceEndedRef.current = true;
    setDuelEnded(true);
    if (opponentThinkingTimerRef.current) clearTimeout(opponentThinkingTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setTimeout(() => {
      onDuelFinish(winner, {
        userCorrect: pokedexStats.correct,
        userPassed: pokedexStats.passed,
        timerRemaining: Math.max(0, playerTime),
        lastPokemonId: currentPokemon?.id ?? null,
        newlyUnlocked: [...newlyUnlockedRef.current]
      });
    }, 1500);
  };

  const opponentLabel = `${t.botLabel} ${opponent.number}`;
  const playerLabel = playerName || t.playerTileLabel;
  const lowTime = playerTime < 10 && activePlayer === "player";
  const dangerMode = lowTime || isPassFlash;

  return (
    <div
      className={`w-full h-full max-h-full min-h-0 mx-auto max-w-sm flex flex-col justify-between border-2 border-[#5A3A2A] rounded-[24px] shadow-[0_6px_0_#5A3A2A] overflow-hidden relative z-60 font-sans text-cocoa transition-colors duration-300 ${
        dangerMode ? "bg-[#FFE3DE]" : "bg-[#FFF4DF]"
      }`}
    >

      {/* --- TIMERS ROW (two cards side-by-side, design 07) --- */}
      <div className="grid grid-cols-2 gap-2 px-3 pt-3 z-10 select-none">
        {/* Player timer */}
        <div
          className={`relative rounded-2xl border-2 border-[#5A3A2A] px-2 py-1.5 shadow-[0_2px_0_#5A3A2A] transition-colors duration-300 ${
            dangerMode ? "bg-[#FFD0CA]" : activePlayer === "player" ? "bg-[#FFD84D]" : "bg-white-frost"
          }`}
        >
          {/* Pass penalty — floats up + fades out on every PAS tap.
              Keyed by `passPenaltyKey` so each pass remounts the node and
              replays the CSS animation. */}
          {passPenaltyKey > 0 && (
            <span
              key={passPenaltyKey}
              className="pointer-events-none absolute -top-3 right-2 z-30 animate-penalty-float font-mono font-black text-[13px] text-[#E95050] drop-shadow-[0_1px_0_#5A3A2A]"
              aria-hidden="true"
            >
              −5s
            </span>
          )}
          <div className="flex items-center justify-between">
            <span
              className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border truncate max-w-[100px] ${
                isPassFlash
                  ? "bg-[#E95050] text-white border-[#5A3A2A]"
                  : lowTime
                  ? "bg-[#E95050] text-white border-[#5A3A2A] animate-pulse"
                  : "bg-[#24456B] text-white border-[#5A3A2A]"
              }`}
            >
              {isPassFlash ? `× ${t.duelPasFlashPill}` : lowTime ? `⚠ ${t.duelHurryPill}` : playerLabel}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#5A3A2A]/80">{t.yourTimeLabel}</span>
            <span
              className={`font-mono font-black ml-auto text-lg tracking-tighter ${
                lowTime ? "text-[#E95050]" : "text-[#24456B]"
              }`}
            >
              {playerTime.toFixed(1)}<span className="text-[10px] opacity-70">s</span>
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white border border-[#5A3A2A] mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                lowTime ? "bg-[#E95050]" : "bg-[#24456B]"
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (playerTime / 45) * 100))}%` }}
            />
          </div>
        </div>

        {/* Opponent timer */}
        <div
          className={`relative rounded-2xl border-2 border-[#5A3A2A] px-2 py-1.5 shadow-[0_2px_0_#5A3A2A] transition-colors duration-300 ${
            isOpponentPassFlash ? "bg-[#FFD0CA]" : activePlayer === "opponent" ? "bg-[#FFD84D]" : "bg-white-frost"
          }`}
        >
          {/* Floating −5s on the opponent's pass — mirrors the player timer. */}
          {opponentPassPenaltyKey > 0 && (
            <span
              key={opponentPassPenaltyKey}
              className="pointer-events-none absolute -top-3 right-2 z-30 animate-penalty-float font-mono font-black text-[13px] text-[#E95050] drop-shadow-[0_1px_0_#5A3A2A]"
              aria-hidden="true"
            >
              −5s
            </span>
          )}
          <div className="flex items-center justify-between">
            <span
              className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border truncate max-w-[100px] ${
                isOpponentPassFlash
                  ? "bg-[#E95050] text-white border-[#5A3A2A]"
                  : "bg-[#5A3A2A] text-[#FFD84D] border-[#5A3A2A]"
              }`}
            >
              {isOpponentPassFlash ? `× ${t.duelPasFlashPill}` : opponentLabel}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono font-black ml-auto text-lg tracking-tighter text-[#5A3A2A]">
              {opponentTime.toFixed(1)}<span className="text-[10px] opacity-70">s</span>
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white border border-[#5A3A2A] mt-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#5A3A2A]/40 transition-all duration-150"
              style={{ width: `${Math.max(0, Math.min(100, (opponentTime / 45) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* --- RECOGNIZE-POKÉMON CARD --- */}
      <div className="flex-1 flex flex-col px-3 pt-3 min-h-0 relative z-10">
        <div className="flex-1 flex flex-col rounded-3xl border-2 border-[#5A3A2A] bg-white shadow-[0_4px_0_#5A3A2A] p-3 min-h-0">
          {/* Header pill row */}
          <div className="flex items-center justify-between shrink-0">
            <span className="font-display font-black text-[10px] uppercase tracking-wider text-white bg-[#1B2840] border-2 border-[#5A3A2A] px-2.5 py-0.5 rounded-full">
              ● {t.duelRecognizeTitle}
            </span>
            <span className="font-mono font-black text-[10px] text-[#5A3A2A] bg-[#FFD84D] border-2 border-[#5A3A2A] px-2 py-0.5 rounded-md">
              #{currentPokemon ? String(currentPokemon.id).padStart(3, "0") : "???"} ?
            </span>
          </div>

          {/* Subtitle hint — static examples so the current pokemon name is never spoiled.
              Each Pokémon name is its own highlighted span; the comma between them
              stays in body cocoa colour for visual separation. The hint wraps onto
              two lines on narrow screens via the explicit <br/>. */}
          <p className="shrink-0 text-[10px] text-center text-[#5A3A2A]/70 font-bold mt-1.5 leading-snug">
            {t.duelRecognizeHintPrefix}
            <br />
            <span className="text-[#24456B] underline font-mono">Pikachu</span>
            <span>, </span>
            <span className="text-[#24456B] underline font-mono">Charizard</span>
          </p>

          {/* Image circle */}
          <div className="flex-1 flex items-center justify-center min-h-0 my-2">
            <div className="relative rounded-full border-2 border-dashed border-[#5A3A2A]/50 bg-[#FFF4DF]/50 flex items-center justify-center"
              style={{ width: "min(60%, 200px)", aspectRatio: "1/1" }}
            >
              {currentPokemon ? (
                <img
                  src={getPokemonImageUrl(currentPokemon.id)}
                  alt="Pokemon"
                  referrerPolicy="no-referrer"
                  className={`h-4/5 w-4/5 object-contain select-none transition-all duration-500 ${
                    activePlayer === "opponent" && !opponentGuessText ? "brightness-0 opacity-40 grayscale" : ""
                  }`}
                  style={{ filter: activePlayer === "opponent" && !opponentGuessText ? "none" : "drop-shadow(0 4px 6px rgba(90,58,42,0.18))" }}
                />
              ) : (
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-cafe-beige border-t-[#5A3A2A]" />
              )}
              {activePlayer === "opponent" && opponentGuessText && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-[#FFD84D] text-[#24456B] border-2 border-[#24456B] px-3 py-1 rounded-full font-display font-black text-xs uppercase tracking-wider z-20 animate-bounce shadow-[0_3px_0_#24456B]">
                    {`${opponentGuessText}!`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Speech banner: calm "still listening" reassurance while active,
              or the coral "speak louder" hint after a genuine failure. */}
          {isListening && stillListening ? (
            <div className="shrink-0 text-center">
              <p className="text-[10px] text-[#24456B] font-bold inline-flex items-center justify-center gap-1.5 bg-[#BDEBFF] border-2 border-[#24456B] py-1 px-3 rounded-full">
                <Mic className="h-3 w-3 text-[#24456B] shrink-0" />
                <span className="truncate max-w-[230px]">{t.speechStillListening}</span>
              </p>
            </div>
          ) : speechError ? (
            <div className="shrink-0 text-center">
              <p className="text-[10px] text-[#5A3A2A] font-bold inline-flex items-center justify-center gap-1.5 bg-[#FF7A62]/15 border-2 border-[#5A3A2A] py-1 px-3 rounded-full">
                <AlertCircle className="h-3 w-3 text-coral shrink-0" />
                <span className="truncate max-w-[230px]">{speechError}</span>
              </p>
            </div>
          ) : null}
        </div>

        {/* Mic is no longer pinned to the bottom of the image card — it lives
            as the primary CTA in the dolny dock below (reachable by the thumb). */}
      </div>

      {/* --- INPUT ROW + MÓW (primary) + PASUJ (secondary) --- */}
      <div className="shrink-0 mt-3 z-10">
        {activePlayer === "player" ? (
          <form onSubmit={handlePlayerSubmit} className="px-3">
            {/* Autocomplete suggestions (design 07b) — only on easy/medium bots, after 2+ chars */}
            {(() => {
              if (opponent.difficulty === "hard") return null;
              if (typedAnswer.trim().length < 2) return null;
              const term = typedAnswer.trim().toLowerCase();
              const matches = POKEMON_LIST.filter((p) => p.name.toLowerCase().startsWith(term)).slice(0, 3);
              if (matches.length === 0) return null;
              return (
                <div className="flex items-center gap-1.5 mb-1.5 overflow-x-auto scrollbar-none">
                  {matches.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setTypedAnswer(p.name);
                        if (inputRef.current) inputRef.current.focus();
                      }}
                      className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full border-2 border-[#5A3A2A] shadow-[0_2px_0_#5A3A2A] cursor-pointer transition ${
                        i === 0 ? "bg-[#FFD84D] hover:bg-[#FFE26D]" : "bg-white hover:bg-[#FFF4DF]"
                      }`}
                    >
                      <img
                        src={getPokemonImageUrl(p.id)}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-4 w-4 object-contain"
                      />
                      <span className="text-[10px] font-display font-black tracking-tight uppercase text-[#5A3A2A]">
                        <span className="underline decoration-[#E95050]">{p.name.slice(0, term.length).toUpperCase()}</span>
                        <span>{p.name.slice(term.length).toUpperCase()}</span>
                      </span>
                      {i === 0 && (
                        <span className="bg-[#1B2840] text-[#FFD84D] text-[7px] font-black tracking-widest px-1 py-0.5 rounded-sm uppercase">
                          TAB
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })()}

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                autoFocus
                placeholder={t.inputPlaceholder}
                value={typedAnswer}
                onChange={(e) => {
                  setTypedAnswer(e.target.value);
                  if (speechError) setSpeechError(null);
                }}
                onKeyDown={(e) => {
                  // TAB selects first autocomplete suggestion (easy/medium only)
                  if (e.key !== "Tab") return;
                  if (opponent.difficulty === "hard") return;
                  const term = typedAnswer.trim().toLowerCase();
                  if (term.length < 2) return;
                  const first = POKEMON_LIST.find((p) => p.name.toLowerCase().startsWith(term));
                  if (!first) return;
                  e.preventDefault();
                  setTypedAnswer(first.name);
                }}
                inputMode={isManualMode ? "text" : "none"}
                readOnly={!isManualMode}
                onClick={() => {
                  if (!isManualMode) {
                    setIsManualMode(true);
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 50);
                  }
                }}
                className="flex-1 bg-white border-2 border-[#5A3A2A] focus:border-[#24456B] rounded-2xl py-2.5 px-3 text-xs font-extrabold text-cocoa placeholder:text-cocoa/40 outline-none shadow-[0_2px_0_#5A3A2A]"
              />
              <button
                type="submit"
                className="h-10 w-10 shrink-0 bg-[#FFD84D] text-[#24456B] border-2 border-[#5A3A2A] rounded-2xl shadow-[0_2px_0_#5A3A2A] active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer"
                title={t.sendBtn}
              >
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </button>
            </div>
          </form>
        ) : (
          <div className="px-3">
            <div className="rounded-2xl border-2 border-[#5A3A2A] bg-white py-3 text-center text-cocoa text-xs flex flex-col items-center justify-center gap-1 shadow-[0_2px_0_#5A3A2A]">
              <div className="h-4 w-4 rounded-full border-2 border-cafe-beige border-t-[#24456B] animate-spin" />
              <span className="font-extrabold text-[#5A3A2A] text-[10px]">{t.opponentTurnReport}</span>
            </div>
          </div>
        )}

        {/* MÓW — primary thumb-reach CTA (largest, closest to the bottom).
            Triggers Web Speech recognition. Rendered only on player's turn so
            the opponent spinner is the only thing visible during AI guesses. */}
        {activePlayer === "player" && (
          <div className="px-3 mt-2">
            <button
              type="button"
              onClick={toggleSpeech}
              className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 border-2 border-[#5A3A2A] shadow-[0_4px_0_#5A3A2A] active:translate-y-0.5 active:shadow-[0_1px_0_#5A3A2A] transition cursor-pointer ${
                isListening ? "bg-[#E95050] scale-[1.01]" : "bg-[#24456B] hover:bg-[#2B5180]"
              }`}
              title={t.voiceReport}
            >
              {isListening ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </span>
                  <span className="font-display font-black text-sm uppercase tracking-widest text-white">
                    {t.speechListening}
                  </span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 text-white" strokeWidth={2.5} />
                  <span className="font-display font-black text-sm uppercase tracking-widest text-white">
                    {t.speakBtn}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* PASUJ — secondary, outlined, deliberately smaller and further from
            the thumb so accidental taps are rare. Keeps the −5s penalty pill
            so the consequence is still visible. */}
        <div className="px-3 mt-2 pb-1">
          <button
            type="button"
            onClick={handlePlayerPass}
            disabled={activePlayer !== "player"}
            className={`w-full h-9 rounded-xl border-2 px-3 font-display font-black text-[11px] uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
              dangerMode
                ? "bg-[#E95050] text-white border-[#5A3A2A]"
                : "bg-transparent text-[#5A3A2A] border-[#5A3A2A] hover:bg-[#5A3A2A]/5"
            }`}
          >
            {dangerMode && <AlertTriangle className="h-3 w-3" />}
            <span>{t.passBtn}</span>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${
              dangerMode
                ? "bg-[#FFD84D] text-[#5A3A2A] border-[#5A3A2A]"
                : "bg-[#FFD84D] text-[#5A3A2A] border-[#5A3A2A]"
            }`}>
              {t.passPenalty}
            </span>
          </button>
        </div>
      </div>

    </div>
  );
}
