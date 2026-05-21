import { useState, useEffect, useRef, FormEvent } from "react";
import { Pokemon, POKEMON_LIST, POKEMON_TYPES_PL, getPokemonImageUrl, isCorrectPokemonName, getTypeName } from "../pokemonData";
import { Trainer, TRAINERS } from "../trainers";
import { getTrainerShortName } from "./FloorGrid";
import { Mic, MicOff, AlertCircle, ArrowRight, CornerDownLeft, Volume2, ShieldAlert } from "lucide-react";

interface DuelAreaProps {
  opponent: Trainer;
  categoryType: string;
  onDuelFinish: (winnerId: string, stats: { userCorrect: number; userPassed: number; timerRemaining: number }) => void;
  onUnlockPokemon: (id: number) => void;
  onSeePokemon?: (id: number) => void;
  language: "pl" | "en";
  t: any;
}

export default function DuelArea({ opponent, categoryType, onDuelFinish, onUnlockPokemon, onSeePokemon, language, t }: DuelAreaProps) {
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
  const [heardText, setHeardText] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);

  // --- Opponent AI Thinking state ---
  const [opponentGuessText, setOpponentGuessText] = useState("");
  const opponentThinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- References for visual timers ---
  const intervalRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Cache to track and prevent duplicate pokemon shown in this duel session
  const shownPokemonIdsRef = useRef<number[]>([]);
  const instanceEndedRef = useRef<boolean>(false);

  // Filter Kanto Pokémons matching category type
  const filterTypePool = () => {
    let pool = POKEMON_LIST.filter((p) => p.types.includes(categoryType));
    // Fallback if pool is depleted or has too few items to have plenty of items
    if (pool.length < 8) {
      pool = POKEMON_LIST;
    }
    return pool;
  };

  const getNextPokemonFromPool = () => {
    const pool = filterTypePool();
    
    // Choose only from pokemon that haven't been shown in this duel yet!
    let unused = pool.filter((p) => !shownPokemonIdsRef.current.includes(p.id));
    
    // If all possible pokemon in this pool were shown, reset the history
    // (but keep the very last shown ID to prevent immediate repetition on boundary)
    if (unused.length === 0) {
      const lastShownId = shownPokemonIdsRef.current[shownPokemonIdsRef.current.length - 1];
      shownPokemonIdsRef.current = lastShownId !== undefined ? [lastShownId] : [];
      unused = pool.filter((p) => !shownPokemonIdsRef.current.includes(p.id));
    }
    
    // Safest fallback if still empty
    if (unused.length === 0) {
      unused = pool;
    }

    const randomIndex = Math.floor(Math.random() * unused.length);
    const chosen = unused[randomIndex];
    if (chosen) {
      shownPokemonIdsRef.current.push(chosen.id);
    }
    return chosen;
  };

  // Initialize first Pokemon
  useEffect(() => {
    setCurrentPokemon(getNextPokemonFromPool());
    if (inputRef.current) {
      inputRef.current.focus();
    }
    return () => {
      if (opponentThinkingTimerRef.current) clearTimeout(opponentThinkingTimerRef.current);
    };
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
  }, [activePlayer, duelEnded]);

  // --- Handle Speech Recognition (Web Speech API) ---
  const startSpeechRecognition = () => {
    setIsManualMode(false);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(t.speechNotAvailable);
      return;
    }

    setSpeechError(null);
    setHeardText("");
    const recognition = new SpeechRecognition();
    recognition.lang = "pl-PL"; // Recognize as Polish pronunciation
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setHeardText(result);
      setIsListening(false);
      handleVoiceTranscript(result);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setSpeechError(t.speechNotHeard);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (!currentPokemon || duelEnded) return;
    
    // Check if the transcript matches
    if (isCorrectPokemonName(transcript, currentPokemon.name)) {
      // Correct!
      onUnlockPokemon(currentPokemon.id);
      setPokedexStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setTypedAnswer("");
      setHeardText("");
      // Transition turn
      switchToOpponent();
    } else {
      // Insert what was heard into input field so they can correct it
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
      setPokedexStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setTypedAnswer("");
      setHeardText("");
      setSpeechError(null);
      switchToOpponent();
    } else {
      // Wrong answer - no time penalty, just visual flash or feedback
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
    // Give player a fresh Pokémon, their turn continues!
    setCurrentPokemon(getNextPokemonFromPool());
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // --- State changes between active participants ---
  const switchToOpponent = () => {
    if (duelEnded) return;
    setActivePlayer("opponent");
    setTypedAnswer("");
    
    // Start drawing Pokémon for Opponent and queue their AI decision
    const nextPoke = getNextPokemonFromPool();
    setCurrentPokemon(nextPoke);
    triggerOpponentThinking(nextPoke);
  };

  const switchToPlayer = () => {
    if (duelEnded) return;
    setActivePlayer("player");
    setOpponentGuessText("");
    setCurrentPokemon(getNextPokemonFromPool());
    
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  // --- Opponent AI Decision Core ---
  const triggerOpponentThinking = (pokemonToGuess: Pokemon) => {
    if (opponentThinkingTimerRef.current) clearTimeout(opponentThinkingTimerRef.current);
    
    // Determine thinking duration based on trainer difficulty
    let selectDelayMs = 4000;
    let passChance = 0.15; // 15% chance to pass

    if (opponent.difficulty === "easy") {
      selectDelayMs = 4000 + Math.random() * 2500; // 4 - 6.5s
      passChance = 0.18;
    } else if (opponent.difficulty === "medium") {
      selectDelayMs = 2500 + Math.random() * 2000; // 2.5 - 4.5s
      passChance = 0.10;
    } else {
      selectDelayMs = 1500 + Math.random() * 1200; // 1.5 - 2.7s
      passChance = 0.05;
    }

    opponentThinkingTimerRef.current = setTimeout(() => {
      if (duelEnded) return;

      const randomRoll = Math.random();
      if (randomRoll < passChance) {
        // Opponent PASSED!
        setOpponentTime((prev) => {
          const afterPenalty = prev - 5.0;
          if (afterPenalty <= 0) {
            handleWinner("player");
            return 0;
          }
          return Math.round(afterPenalty * 10) / 10;
        });
        
        // Show pass notification
        setOpponentGuessText(t.passNotification);
        
        // Take another pokemon, opponent continues thinking
        const nextPoke = getNextPokemonFromPool();
        setCurrentPokemon(nextPoke);
        triggerOpponentThinking(nextPoke);
      } else {
        // Opponent guessed correctly!
        setOpponentGuessText(pokemonToGuess.name);
        
        setTimeout(() => {
          if (duelEnded) return;
          // Switch back to player
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

    // Call callback back to game core
    setTimeout(() => {
      onDuelFinish(winner, {
        userCorrect: pokedexStats.correct,
        userPassed: pokedexStats.passed,
        timerRemaining: Math.max(0, playerTime)
      });
    }, 1500);
  };

  const opponentDetail = POKEMON_TYPES_PL[opponent.primaryType];
  const activeDetail = POKEMON_TYPES_PL[categoryType];

  return (
    <div className="w-full h-full max-h-full min-h-0 mx-auto max-w-sm flex flex-col justify-between bg-cream-base border-2 border-[#5A3A2A] rounded-[24px] shadow-[0_6px_0_#5A3A2A] overflow-hidden relative font-sans text-cocoa">
      
      {/* Background soft cafe glow */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-cafe-beige/35 to-transparent pointer-events-none" />

      {/* Arena Title / Category badge - Styled like design header */}
      <div className="relative pt-4 px-5 pb-2 flex justify-between items-center z-10 select-none">
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-widest text-[#24456B] font-display font-black">{t.categoryLabel}</span>
          <h2 className="text-sm font-display font-black tracking-tight text-[#5A3A2A] uppercase">
            {t.challengeType} {getTypeName(categoryType, language)}
          </h2>
        </div>
        <div className="bg-white-frost px-3 py-1 rounded-full border-2 border-[#5A3A2A] shadow-[0_2px_0_#5A3A2A]">
          <span className="text-[10px] font-black text-cocoa">vs {getTrainerShortName(opponent, language)}</span>
        </div>
      </div>

      {/* --- TIMERS PANEL (VIBRANT SPLIT HORIZONTAL STYLE) --- */}
      <div className="flex border-y-2 border-[#5A3A2A] h-16 bg-[#F2D5A7] overflow-hidden relative z-10 select-none">
        {/* PLAYER TIME BLOCK */}
        <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${
          activePlayer === "player"
            ? "bg-[#FFFFFF] border-r-2 border-[#5A3A2A]"
            : "border-r-2 border-[#5A3A2A] bg-[#FFF4DF]"
        }`}
        style={{ opacity: 1.0 }}>
          <span className={`text-[9.5px] font-black uppercase tracking-wider ${
            activePlayer === "player" ? "text-[#24456B]" : "text-[#8C6D58]"
          }`}>{language === "pl" ? "TWÓJ CZAS" : "YOUR TIME"}</span>
          <div className={`text-2xl font-mono font-black tracking-tighter ${
            playerTime < 10 
              ? "text-[#E95050] animate-pulse" 
              : activePlayer === "player" 
              ? "text-[#24456B]" 
              : "text-[#5A3A2A]"
          }`}>
            {playerTime.toFixed(1)}s
          </div>
          {activePlayer === "player" && (
            <div className="h-1 w-full bg-[#24456B] mt-0.5 animate-pulse" />
          )}
        </div>

        {/* OPPONENT TIME BLOCK */}
        <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${
          activePlayer === "opponent"
            ? "bg-[#FFFFFF]"
            : "bg-[#FFF4DF]"
        }`}
        style={{ opacity: 1.0 }}>
          <span className={`text-[9.5px] font-black uppercase tracking-wider ${
            activePlayer === "opponent" ? "text-[#24456B]" : "text-[#8C6D58]"
          }`}>{language === "pl" ? "PRZECIWNIK" : "OPPONENT"} ({opponent.avatar})</span>
          <div className={`text-2xl font-mono font-black tracking-tighter ${
            opponentTime < 10 && activePlayer === "opponent"
              ? "text-[#E95050] animate-pulse"
              : activePlayer === "opponent" 
              ? "text-[#24456B]" 
              : "text-[#5A3A2A]"
          }`}>
            {opponentTime.toFixed(1)}s
          </div>
          {activePlayer === "opponent" && (
            <div className="h-1 w-full bg-[#24456B] mt-0.5 animate-pulse" />
          )}
        </div>
      </div>

      {/* --- ACTIVE POKÉMON IMAGE PANEL (VIBRANT ARTWORK CANVAS) --- */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 px-3 bg-white border-2 border-[#5A3A2A] rounded-[20px] mx-4 my-3 relative min-h-0 select-none shadow-[0_3px_0_#5A3A2A]">
        {/* Circular canvas container - Dynamic fluid scaling using core tokens */}
        <div 
          className="rounded-full bg-cream-base/15 flex items-center justify-center relative border-2 border-[#5A3A2A] shadow-[0_3px_0_#5A3A2A] shrink-1 object-contain fluid-badge-container"
          style={{ 
            aspectRatio: "1/1" 
          }}
        >
          <div className="absolute inset-0 rounded-full bg-cafe-beige/10" />
          
          {currentPokemon ? (
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
              <img
                src={getPokemonImageUrl(currentPokemon.id)}
                alt="Pokemon"
                referrerPolicy="no-referrer"
                className={`h-4/5 w-4/5 object-contain select-none transition-all duration-500 ${
                  activePlayer === "opponent" && !opponentGuessText
                    ? "brightness-0 opacity-40 grayscale" // physical sticker silhouette
                    : ""
                }`}
                style={{ 
                  filter: activePlayer === "opponent" && !opponentGuessText ? "none" : "drop-shadow(0 4px 6px rgba(90,58,42,0.15))",
                }}
              />
              {activePlayer === "opponent" && opponentGuessText && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-lemon-yellow text-pokemon-navy border-2 border-pokemon-navy px-4 py-1.5 rounded-full font-display font-black text-xs uppercase tracking-wider z-20 animate-bounce shadow-[0_4px_0_#24456B]">
                    {opponentGuessText === t.passNotification || opponentGuessText === "PASUJĘ!" ? t.passNotification : `${opponentGuessText}!`}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-cafe-beige border-t-[#5A3A2A]" />
          )}
        </div>

        {/* Status indicator pill from mockup */}
        <div className="mt-2.5 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white-frost px-3 py-1 rounded-full border-2 border-[#5A3A2A] shadow-[0_2px_0_#5A3A2A]">
            <div className={`w-2.5 h-2.5 rounded-full ${activePlayer === "player" ? "bg-soft-mint animate-pulse border border-[#5A3A2A]" : "bg-lemon-yellow animate-pulse border border-[#5A3A2A]"}`} />
            <span className="text-[10px] font-black uppercase tracking-wider text-cocoa">
              {activePlayer === "player" ? t.voiceReport : t.thinkingReport}
            </span>
          </div>
        </div>

        {/* Time Alert banner */}
        {activePlayer === "player" && playerTime < 10 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] bg-[#FF7A62] text-[#5A3A2A] border-2 border-[#5A3A2A] px-3 py-1 rounded-full font-black tracking-wider animate-pulse shadow-sm">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{t.quickSpurt}</span>
          </div>
        )}
      </div>

      {/* --- INSTRUCTIONS & ERRORS FEEDBACK --- */}
      <div className="h-7 text-center flex items-center justify-center px-4 relative z-10 select-none">
        {speechError ? (
          <p className="text-[11px] text-cocoa font-bold flex items-center justify-center gap-1.5 bg-[#FF7A62]/15 border-2 border-[#5A3A2A] py-1 px-3.5 rounded-full">
            <AlertCircle className="h-3.5 w-3.5 text-coral shrink-0" />
            <span className="truncate max-w-[280px]">{speechError}</span>
          </p>
        ) : activePlayer === "player" ? (
          <p className="text-[11px] text-cocoa/70 font-bold">
            {t.speechPrompt} <span className="text-[#24456B] underline font-mono">Pikachu</span>
          </p>
        ) : (
          null
        )}
      </div>

      {/* --- PLAYER ACTIONS PANEL --- */}
      <div className="p-3 sm:p-4 bg-cafe-beige border-t-2 border-[#5A3A2A] z-10">
        {activePlayer === "player" ? (
          <form onSubmit={handlePlayerSubmit} className="space-y-3">
            {/* Input Row - compressed padding */}
            <div>
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
                className="w-full bg-white-frost border-2 border-[#5A3A2A] focus:border-[#24456B] rounded-2xl py-2.5 px-4 text-xs sm:text-sm font-extrabold text-cocoa placeholder:text-cocoa/40 transition-all outline-none shadow-[0_3px_0_#5A3A2A] text-center"
              />
            </div>

            {/* Ergonomic symmetrical thumb area */}
            <div className="grid grid-cols-3 gap-2 items-center">
              {/* PAS BUTTON */}
              <button
                type="button"
                onClick={handlePlayerPass}
                className="h-14 rounded-2xl bg-white-frost text-cocoa border-2 border-[#5A3A2A] shadow-[0_4px_0_#5A3A2A] active:translate-y-1 active:shadow-none hover:bg-[#FFF4DF]/40 font-black uppercase text-[10px] flex flex-col items-center justify-center leading-tight transition shrink-0 cursor-pointer"
              >
                <span>{t.passBtn}</span>
                <span className="text-[9px] text-coral font-black mt-0.5">{t.passPenalty}</span>
              </button>

              {/* GIANT FLOATING THUMB MICROPHONE ACTION BUTTON */}
              <button
                type="button"
                onClick={startSpeechRecognition}
                className={`h-14 w-14 mx-auto rounded-full flex flex-col items-center justify-center transition duration-200 active:scale-95 relative cursor-pointer border-2 border-[#5A3A2A] ${
                  isListening
                    ? "bg-[#FF7A62] text-white scale-105 shadow-[0_4px_0_#5A3A2A]"
                    : "bg-[#24456B] text-white hover:bg-blue-800 shadow-[0_4px_0_#24456B]"
                }`}
                title={t.voiceReport}
              >
                {isListening ? (
                  <>
                    <div className="absolute inset-x-0 bottom-1.5 text-[7px] font-black tracking-widest text-white/95 uppercase animate-pulse">
                      {t.speechListening}
                    </div>
                    <span className="flex h-2 w-2 relative -top-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 text-white" />
                    <span className="text-[7px] font-black tracking-widest text-[#FFD84D] uppercase mt-0.5">
                      {t.speakBtn}
                    </span>
                  </>
                )}
              </button>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="h-14 bg-[#FFD84D] text-[#24456B] hover:bg-[#FFE26D] border-2 border-[#24456B] transition font-black rounded-2xl shadow-[0_4px_0_#24456B] active:translate-y-1 active:shadow-none uppercase tracking-tight text-[10px] flex flex-col items-center justify-center gap-0.5 shrink-0 cursor-pointer text-center"
              >
                <span>{t.sendBtn}</span>
                <CornerDownLeft className="h-3.5 w-3.5 stroke-[3] text-pokemon-navy" />
              </button>
            </div>
          </form>
        ) : (
          /* Opponent Ticking UI block from design */
          <div className="rounded-2xl border-2 border-[#5A3A2A] bg-[#FFF4DF] py-4 text-center text-cocoa text-xs flex flex-col items-center justify-center gap-1.5 min-h-[90px] shadow-[0_2px_0_#5A3A2A]">
            <div className="h-5 w-5 rounded-full border-2 border-cafe-beige border-t-[#24456B] animate-spin" />
            <span className="font-extrabold text-[#5A3A2A] text-[11px]">{t.opponentTurnReport}</span>
            <span className="text-[9px] text-[#24456B] opacity-90 uppercase font-black tracking-widest">{t.restTimeReport}</span>
          </div>
        )}
      </div>
      
    </div>
  );
}
