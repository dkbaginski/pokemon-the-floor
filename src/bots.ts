// Generic bots that own tiles on the 5x5 Kanto board.
// Replaces the legacy "named trainers" model (Brock/Misty/Agatha/...).
// Each bot has its own curated Pokémon pool sourced from the full Gen-1 list.

export type Difficulty = "easy" | "medium" | "hard";

export interface Bot {
  id: string;            // "bot_02" .. "bot_25"
  number: number;        // 2..25 — UI label suffix
  avatarColor: string;   // Tailwind bg-* class
  difficulty: Difficulty;
  pokemonPool: number[]; // Pokédex IDs (10–18 entries, deterministic per bot.number)
  avatarPokemonId: number; // Representative sprite on the board — globally unique per bot
}

export interface PlayerProfile {
  id: "player";
  number: 1;
  avatarColor: string;
  difficulty: "medium";
}

export interface GridCell {
  id: number;            // 0..24
  row: number;           // 0..4 (top → bottom)
  col: number;           // 0..4 (left → right)
  currentOwnerId: string; // "player" or "bot_NN"
}

// --- Seeded RNG (Linear Congruential Generator) -----------------------------
// Same `seed` always produces the same sequence — keeps bot pools stable
// across sessions and between localStorage reloads.
function lcg(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// --- Difficulty by board position -------------------------------------------
// Player starts at (row=4, col=0), the bottom-left tile. Manhattan
// distance grows toward (0,4) = the top-right tile.
// Resulting distribution across the 24 non-player cells: ≈8 easy / 10 medium / 6 hard.
export function getDifficultyForCell(row: number, col: number): Difficulty {
  const distance = (4 - row) + col;
  if (distance <= 2) return "easy";
  if (distance <= 5) return "medium";
  return "hard";
}

// --- Bot Pokémon pool generator ---------------------------------------------
// easy:   15–18 IDs from #1..#80   (well-known starters & early route mons)
// medium: 13–16 IDs from #1..#151  (broad mix)
// hard:   10–13 IDs from #60..#151 (later-route & lesser-known mons)
export function generateBotPool(seed: number, difficulty: Difficulty): number[] {
  const rng = lcg(seed * 31 + (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3));

  let candidates: number[] = [];
  let size = 14;

  if (difficulty === "easy") {
    size = 15 + Math.floor(rng() * 4); // 15..18
    for (let i = 1; i <= 80; i++) candidates.push(i);
  } else if (difficulty === "medium") {
    size = 13 + Math.floor(rng() * 4); // 13..16
    for (let i = 1; i <= 151; i++) candidates.push(i);
  } else {
    size = 10 + Math.floor(rng() * 4); // 10..13
    for (let i = 60; i <= 151; i++) candidates.push(i);
  }

  // Fisher–Yates shuffle with seeded RNG.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, size).sort((a, b) => a - b);
}

// --- Visual identity pools (24 entries, indexed by bot.number - 2) ----------
const BOT_COLORS = [
  "bg-indigo-500", "bg-blue-500", "bg-teal-500", "bg-emerald-500",
  "bg-lime-600", "bg-amber-500", "bg-orange-500", "bg-red-500",
  "bg-rose-500", "bg-pink-500", "bg-fuchsia-500", "bg-purple-500",
  "bg-violet-500", "bg-sky-500", "bg-cyan-600", "bg-yellow-500",
  "bg-stone-500", "bg-slate-500", "bg-zinc-500", "bg-green-600",
  "bg-blue-600", "bg-red-600", "bg-violet-600", "bg-amber-700"
];

// --- Build BOTS map + INITIAL_GRID deterministically ------------------------
function buildInitial(): { grid: GridCell[]; bots: Record<string, Bot> } {
  const grid: GridCell[] = [];
  const bots: Record<string, Bot> = {};
  let cellId = 0;
  let botNumber = 2;

  // Track avatar sprites already handed out so every bot shows a distinct
  // Pokémon on the board. Greedy: pick the first entry of the bot's own pool
  // that hasn't been used yet (pools are 10–18 entries, so for 24 bots there
  // is always a free pick). Deterministic because pools + iteration order are.
  const usedAvatars = new Set<number>();

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      let ownerId: string;
      if (row === 4 && col === 0) {
        ownerId = "player";
      } else {
        const padded = String(botNumber).padStart(2, "0");
        const botId = `bot_${padded}`;
        const difficulty = getDifficultyForCell(row, col);
        const pool = generateBotPool(botNumber, difficulty);
        let avatar = pool.find((id) => !usedAvatars.has(id));
        if (avatar === undefined) avatar = pool[0];
        usedAvatars.add(avatar);
        bots[botId] = {
          id: botId,
          number: botNumber,
          avatarColor: BOT_COLORS[botNumber - 2],
          difficulty,
          pokemonPool: pool,
          avatarPokemonId: avatar
        };
        ownerId = botId;
        botNumber++;
      }
      grid.push({ id: cellId, row, col, currentOwnerId: ownerId });
      cellId++;
    }
  }

  return { grid, bots };
}

const built = buildInitial();
export const INITIAL_GRID: GridCell[] = built.grid;
export const BOTS: Record<string, Bot> = built.bots;

export const PLAYER_PROFILE: PlayerProfile = {
  id: "player",
  number: 1,
  avatarColor: "bg-cyan-500",
  difficulty: "medium"
};

// --- Helpers ----------------------------------------------------------------
export function getBotOrPlayer(ownerId: string): Bot | PlayerProfile {
  if (ownerId === "player") return PLAYER_PROFILE;
  return BOTS[ownerId] || PLAYER_PROFILE;
}

// Localised display label for a tile owner.
// `t` is the translations object (must contain `botLabel`, `playerTileLabel`).
export function getOwnerLabel(
  owner: Bot | PlayerProfile,
  t: { botLabel: string; playerTileLabel: string }
): string {
  if (owner.id === "player") return t.playerTileLabel;
  return `${t.botLabel} ${(owner as Bot).number}`;
}
