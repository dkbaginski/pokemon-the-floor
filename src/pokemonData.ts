export interface Pokemon {
  id: number;
  name: string;
  types: string[];
}

export const POKEMON_LIST: Pokemon[] = [
  { id: 1, name: "Bulbasaur", types: ["grass", "poison"] },
  { id: 2, name: "Ivysaur", types: ["grass", "poison"] },
  { id: 3, name: "Venusaur", types: ["grass", "poison"] },
  { id: 4, name: "Charmander", types: ["fire"] },
  { id: 5, name: "Charmeleon", types: ["fire"] },
  { id: 6, name: "Charizard", types: ["fire", "flying"] },
  { id: 7, name: "Squirtle", types: ["water"] },
  { id: 8, name: "Wartortle", types: ["water"] },
  { id: 9, name: "Blastoise", types: ["water"] },
  { id: 10, name: "Caterpie", types: ["bug"] },
  { id: 11, name: "Metapod", types: ["bug"] },
  { id: 12, name: "Butterfree", types: ["bug", "flying"] },
  { id: 13, name: "Weedle", types: ["bug", "poison"] },
  { id: 14, name: "Kakuna", types: ["bug", "poison"] },
  { id: 15, name: "Beedrill", types: ["bug", "poison"] },
  { id: 16, name: "Pidgey", types: ["normal", "flying"] },
  { id: 17, name: "Pidgeotto", types: ["normal", "flying"] },
  { id: 18, name: "Pidgeot", types: ["normal", "flying"] },
  { id: 19, name: "Rattata", types: ["normal"] },
  { id: 20, name: "Raticate", types: ["normal"] },
  { id: 21, name: "Spearow", types: ["normal", "flying"] },
  { id: 22, name: "Fearow", types: ["normal", "flying"] },
  { id: 23, name: "Ekans", types: ["poison"] },
  { id: 24, name: "Arbok", types: ["poison"] },
  { id: 25, name: "Pikachu", types: ["electric"] },
  { id: 26, name: "Raichu", types: ["electric"] },
  { id: 27, name: "Sandshrew", types: ["ground"] },
  { id: 28, name: "Sandslash", types: ["ground"] },
  { id: 29, name: "Nidoran♀", types: ["poison"] },
  { id: 30, name: "Nidorina", types: ["poison"] },
  { id: 31, name: "Nidoqueen", types: ["poison", "ground"] },
  { id: 32, name: "Nidoran♂", types: ["poison"] },
  { id: 33, name: "Nidorino", types: ["poison"] },
  { id: 34, name: "Nidoking", types: ["poison", "ground"] },
  { id: 35, name: "Clefairy", types: ["fairy"] },
  { id: 36, name: "Clefable", types: ["fairy"] },
  { id: 37, name: "Vulpix", types: ["fire"] },
  { id: 38, name: "Ninetales", types: ["fire"] },
  { id: 39, name: "Jigglypuff", types: ["normal", "fairy"] },
  { id: 40, name: "Wigglytuff", types: ["normal", "fairy"] },
  { id: 41, name: "Zubat", types: ["poison", "flying"] },
  { id: 42, name: "Golbat", types: ["poison", "flying"] },
  { id: 43, name: "Oddish", types: ["grass", "poison"] },
  { id: 44, name: "Gloom", types: ["grass", "poison"] },
  { id: 45, name: "Vileplume", types: ["grass", "poison"] },
  { id: 46, name: "Paras", types: ["bug", "grass"] },
  { id: 47, name: "Parasect", types: ["bug", "grass"] },
  { id: 48, name: "Venonat", types: ["bug", "poison"] },
  { id: 49, name: "Venomoth", types: ["bug", "poison"] },
  { id: 50, name: "Diglett", types: ["ground"] },
  { id: 51, name: "Dugtrio", types: ["ground"] },
  { id: 52, name: "Meowth", types: ["normal"] },
  { id: 53, name: "Persian", types: ["normal"] },
  { id: 54, name: "Psyduck", types: ["water"] },
  { id: 55, name: "Golduck", types: ["water"] },
  { id: 56, name: "Mankey", types: ["fighting"] },
  { id: 57, name: "Primeape", types: ["fighting"] },
  { id: 58, name: "Growlithe", types: ["fire"] },
  { id: 59, name: "Arcanine", types: ["fire"] },
  { id: 60, name: "Poliwag", types: ["water"] },
  { id: 61, name: "Poliwhirl", types: ["water"] },
  { id: 62, name: "Poliwrath", types: ["water", "fighting"] },
  { id: 63, name: "Abra", types: ["psychic"] },
  { id: 64, name: "Kadabra", types: ["psychic"] },
  { id: 65, name: "Alakazam", types: ["psychic"] },
  { id: 66, name: "Machop", types: ["fighting"] },
  { id: 67, name: "Machoke", types: ["fighting"] },
  { id: 68, name: "Machamp", types: ["fighting"] },
  { id: 69, name: "Bellsprout", types: ["grass", "poison"] },
  { id: 70, name: "Weepinbell", types: ["grass", "poison"] },
  { id: 71, name: "Victreebel", types: ["grass", "poison"] },
  { id: 72, name: "Tentacool", types: ["water", "poison"] },
  { id: 73, name: "Tentacruel", types: ["water", "poison"] },
  { id: 74, name: "Geodude", types: ["rock", "ground"] },
  { id: 75, name: "Graveler", types: ["rock", "ground"] },
  { id: 76, name: "Golem", types: ["rock", "ground"] },
  { id: 77, name: "Ponyta", types: ["fire"] },
  { id: 78, name: "Rapidash", types: ["fire"] },
  { id: 79, name: "Slowpoke", types: ["water", "psychic"] },
  { id: 80, name: "Slowbro", types: ["water", "psychic"] },
  { id: 81, name: "Magnemite", types: ["electric", "steel"] },
  { id: 82, name: "Magneton", types: ["electric", "steel"] },
  { id: 83, name: "Farfetch'd", types: ["normal", "flying"] },
  { id: 84, name: "Doduo", types: ["normal", "flying"] },
  { id: 85, name: "Dodrio", types: ["normal", "flying"] },
  { id: 86, name: "Seel", types: ["water"] },
  { id: 87, name: "Dewgong", types: ["water", "ice"] },
  { id: 88, name: "Grimer", types: ["poison"] },
  { id: 89, name: "Muk", types: ["poison"] },
  { id: 90, name: "Shellder", types: ["water"] },
  { id: 91, name: "Cloyster", types: ["water", "ice"] },
  { id: 92, name: "Gastly", types: ["ghost", "poison"] },
  { id: 93, name: "Haunter", types: ["ghost", "poison"] },
  { id: 94, name: "Gengar", types: ["ghost", "poison"] },
  { id: 95, name: "Onix", types: ["rock", "ground"] },
  { id: 96, name: "Drowzee", types: ["psychic"] },
  { id: 97, name: "Hypno", types: ["psychic"] },
  { id: 98, name: "Krabby", types: ["water"] },
  { id: 99, name: "Kingler", types: ["water"] },
  { id: 100, name: "Voltorb", types: ["electric"] },
  { id: 101, name: "Electrode", types: ["electric"] },
  { id: 102, name: "Exeggcute", types: ["grass", "psychic"] },
  { id: 103, name: "Exeggutor", types: ["grass", "psychic"] },
  { id: 104, name: "Cubone", types: ["ground"] },
  { id: 105, name: "Marowak", types: ["ground"] },
  { id: 106, name: "Hitmonlee", types: ["fighting"] },
  { id: 107, name: "Hitmonchan", types: ["fighting"] },
  { id: 108, name: "Lickitung", types: ["normal"] },
  { id: 109, name: "Koffing", types: ["poison"] },
  { id: 110, name: "Weezing", types: ["poison"] },
  { id: 111, name: "Rhyhorn", types: ["ground", "rock"] },
  { id: 112, name: "Rhydon", types: ["ground", "rock"] },
  { id: 113, name: "Chansey", types: ["normal"] },
  { id: 114, name: "Tangela", types: ["grass"] },
  { id: 115, name: "Kangaskhan", types: ["normal"] },
  { id: 116, name: "Horsea", types: ["water"] },
  { id: 117, name: "Seadra", types: ["water"] },
  { id: 118, name: "Goldeen", types: ["water"] },
  { id: 119, name: "Seaking", types: ["water"] },
  { id: 120, name: "Staryu", types: ["water"] },
  { id: 121, name: "Starmie", types: ["water", "psychic"] },
  { id: 122, name: "Mr. Mime", types: ["psychic", "fairy"] },
  { id: 123, name: "Scyther", types: ["bug", "flying"] },
  { id: 124, name: "Jynx", types: ["ice", "psychic"] },
  { id: 125, name: "Electabuzz", types: ["electric"] },
  { id: 126, name: "Magmar", types: ["fire"] },
  { id: 127, name: "Pinsir", types: ["bug"] },
  { id: 128, name: "Tauros", types: ["normal"] },
  { id: 129, name: "Magikarp", types: ["water"] },
  { id: 130, name: "Gyarados", types: ["water", "flying"] },
  { id: 131, name: "Lapras", types: ["water", "ice"] },
  { id: 132, name: "Ditto", types: ["normal"] },
  { id: 133, name: "Eevee", types: ["normal"] },
  { id: 134, name: "Vaporeon", types: ["water"] },
  { id: 135, name: "Jolteon", types: ["electric"] },
  { id: 136, name: "Flareon", types: ["fire"] },
  { id: 137, name: "Porygon", types: ["normal"] },
  { id: 138, name: "Omanyte", types: ["rock", "water"] },
  { id: 139, name: "Omastar", types: ["rock", "water"] },
  { id: 140, name: "Kabuto", types: ["rock", "water"] },
  { id: 141, name: "Kabutops", types: ["rock", "water"] },
  { id: 142, name: "Aerodactyl", types: ["rock", "flying"] },
  { id: 143, name: "Snorlax", types: ["normal"] },
  { id: 144, name: "Articuno", types: ["ice", "flying"] },
  { id: 145, name: "Zapdos", types: ["electric", "flying"] },
  { id: 146, name: "Moltres", types: ["fire", "flying"] },
  { id: 147, name: "Dratini", types: ["dragon"] },
  { id: 148, name: "Dragonair", types: ["dragon"] },
  { id: 149, name: "Dragonite", types: ["dragon", "flying"] },
  { id: 150, name: "Mewtwo", types: ["psychic"] },
  { id: 151, name: "Mew", types: ["psychic"] }
];

export interface TypeDetail {
  namePl: string;
  color: string;
  gradient: string;
  bgHex: string;
}

export const POKEMON_TYPES_PL: Record<string, TypeDetail> = {
  grass: { namePl: "Trawiasty", color: "text-emerald-400 bg-emerald-950/50 border-emerald-500", gradient: "from-emerald-500 to-green-600", bgHex: "#10b981" },
  fire: { namePl: "Ognisty", color: "text-orange-400 bg-orange-950/50 border-orange-500", gradient: "from-orange-500 to-red-600", bgHex: "#f97316" },
  water: { namePl: "Wodny", color: "text-blue-400 bg-blue-950/50 border-blue-500", gradient: "from-blue-500 to-cyan-600", bgHex: "#3b82f6" },
  bug: { namePl: "Robaczy", color: "text-lime-400 bg-lime-950/50 border-lime-500", gradient: "from-lime-500 to-emerald-600", bgHex: "#84cc16" },
  normal: { namePl: "Normalny", color: "text-slate-400 bg-slate-900/50 border-slate-500", gradient: "from-slate-400 to-zinc-500", bgHex: "#94a3b8" },
  poison: { namePl: "Trujący", color: "text-purple-400 bg-purple-950/50 border-purple-500", gradient: "from-purple-500 to-fuchsia-600", bgHex: "#a855f7" },
  electric: { namePl: "Elektryczny", color: "text-yellow-400 bg-yellow-950/50 border-yellow-500", gradient: "from-yellow-400 to-amber-500", bgHex: "#eab308" },
  ground: { namePl: "Ziemny", color: "text-amber-600 bg-amber-950/30 border-amber-700", gradient: "from-amber-600 to-yellow-800", bgHex: "#d97706" },
  fairy: { namePl: "Baśniowy", color: "text-pink-400 bg-pink-950/50 border-pink-500", gradient: "from-pink-400 to-rose-500", bgHex: "#f472b6" },
  fighting: { namePl: "Walczący", color: "text-red-500 bg-red-950/50 border-red-700", gradient: "from-red-600 to-orange-700", bgHex: "#dc2626" },
  psychic: { namePl: "Psychiczny", color: "text-violet-400 bg-violet-950/50 border-violet-500", gradient: "from-violet-500 to-purple-600", bgHex: "#8b5cf6" },
  rock: { namePl: "Kamienny", color: "text-stone-400 bg-stone-900/50 border-stone-500", gradient: "from-stone-500 to-amber-900", bgHex: "#78716c" },
  ghost: { namePl: "Duch", color: "text-indigo-400 bg-indigo-950/50 border-indigo-500", gradient: "from-indigo-600 to-purple-900", bgHex: "#4f46e5" },
  ice: { namePl: "Lodowy", color: "text-cyan-300 bg-cyan-950/50 border-cyan-500", gradient: "from-cyan-300 to-blue-500", bgHex: "#06b6d4" },
  dragon: { namePl: "Smoczy", color: "text-indigo-500 bg-indigo-950/50 border-indigo-700", gradient: "from-indigo-500 to-violet-700", bgHex: "#6366f1" },
  steel: { namePl: "Stalowy", color: "text-zinc-400 bg-zinc-800/50 border-zinc-500", gradient: "from-zinc-400 to-slate-500", bgHex: "#a1a1aa" },
  flying: { namePl: "Latający", color: "text-sky-400 bg-sky-950/50 border-sky-500", gradient: "from-sky-400 to-indigo-500", bgHex: "#38bdf8" }
};

export function getPokemonImageUrl(id: number): string {
  // PokeAPI official artwork is high quality, transparent, and public
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getTypeName(typeKey: string, lang: 'pl' | 'en'): string {
  const detail = POKEMON_TYPES_PL[typeKey];
  if (lang === 'pl') {
    return detail?.namePl || typeKey;
  } else {
    return typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
  }
}

// Levenshtein distance calculations helper
function levenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  let i: number, j: number;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

// Normalized matching helper
export function isCorrectPokemonName(userInput: string, targetName: string): boolean {
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/♀/g, "f")
      .replace(/♂/g, "m")
      .replace(/\./g, "")
      .replace(/'/g, "")
      .replace(/-/g, "")
      .replace(/\s+/g, "")
      // Treat typical Polish speech-to-text mistranscriptions or spelling variants of English names
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // strip accents
  };

  const normalizedTarget = normalize(targetName);

  const phoneticMap: Record<string, string> = {
    // Gen 1 Polish voice-to-text phonetics
    "pikaczu": "pikachu",
    "pikaczuu": "pikachu",
    "bylbasaur": "bulbasaur",
    "bylbazor": "bulbasaur",
    "bulbasor": "bulbasaur",
    "bulbazor": "bulbasaur",
    "bulbazaur": "bulbasaur",
    "gardos": "gyarados",
    "gajrados": "gyarados",
    "gijarados": "gyarados",
    "gyrados": "gyarados",
    "czarizard": "charizard",
    "szarizard": "charizard",
    "ciarizard": "charizard",
    "czarmander": "charmander",
    "szarmander": "charmander",
    "ciarmander": "charmander",
    "czarmeleon": "charmeleon",
    "szarmeleon": "charmeleon",
    "ciarmeleon": "charmeleon",
    "skortel": "squirtle",
    "skłortel": "squirtle",
    "skłortl": "squirtle",
    "skłortyl": "squirtle",
    "pydak": "psyduck",
    "psajdak": "psyduck",
    "psajdok": "psyduck",
    "miaut": "meowth",
    "miaus": "meowth",
    "miau": "meowth",
    "miał": "meowth",
    "dżiglipaf": "jigglypuff",
    "dziglipaf": "jigglypuff",
    "jiglipaf": "jigglypuff",
    "mitu": "mewtwo",
    "miutwo": "mewtwo",
    "mewtu": "mewtwo",
    "miutu": "mewtwo",
    "mjutu": "mewtwo",
    "miu": "mew",
    "snortex": "snorlax",
    "snorlaks": "snorlax",
    "snorlax": "snorlax",
    "gengar": "gengar",
    "ardżenajn": "arcanine",
    "arkasajn": "arcanine",
    "arcanajn": "arcanine",
    "arkanajn": "arcanine",
    "oniks": "onix",
    "onix": "onix",
    "wileplum": "vileplume" ,
    "wileplon": "vileplume",
    "wajlplum": "vileplume",
    "wajlplon": "vileplume",
    "vajlplum": "vileplume",
    "vailplum": "vileplume",
    "wilplum": "vileplume",
    "grawler": "graveler",
    "graweler": "graveler",
    "greveler": "graveler",
    "pidżiot": "pidgeot",
    "pidget": "pidgeot",
    "pidzior": "pidgeot",
    "pidżioto": "pidgeotto",
    "pidżi": "pidgey",
    "pidzi": "pidgey",
    "pindor": "pinsir",
    "pincer": "pinsir",
    "pincir": "pinsir",
    "parasek": "parasect",
    "parasect": "parasect",
    "iwizaur": "ivysaur",
    "iwisaur": "ivysaur",
    "wenuzaur": "venusaur",
    "wenusaur": "venusaur",
    "blastojz": "blastoise",
    "blastois": "blastoise",
    "katerpi": "caterpie" ,
    "baterfri": "butterfree",
    "widl": "weedle" ,
    "bidril": "beedrill",
    "ratata": "rattata",
    "ratikejt": "raticate",
    "ratiket": "raticate",
    "spirow": "spearow" ,
    "firow": "fearow" ,
    "rajczu": "raichu",
    "sendszru": "sandshrew",
    "sendszlaf": "sandslash",
    "sendszlas": "sandslash",
    "klefejri": "clefairy",
    "klefejbl": "clefable",
    "klefabl": "clefable",
    "walpiks": "vulpix",
    "wolpiks": "vulpix",
    "najntejls": "ninetales",
    "najntels": "ninetales",
    "wiglitaf": "wigglytuff",
    "golbat": "golbat",
    "odisz": "oddish",
    "glum": "gloom",
    "wenonat": "venonat",
    "wenomot": "venomoth",
    "diglet": "diglett",
    "dagtrio": "dugtrio",
    "perzjan": "persian",
    "persjan": "persian",
    "goldak": "golduck",
    "manki": "mankey",
    "prajmejp": "primeape",
    "prajmep": "primeape",
    "growlit": "growlithe",
    "growlajt": "growlithe" ,
    "poliwag": "poliwag",
    "poliwerl": "poliwhirl",
    "poliirat": "poliwrath",
    "poliwrath": "poliwrath",
    "maczop": "machop",
    "maczok": "machoke",
    "maczamp": "machamp",
    "belspraut": "bellsprout",
    "wipinbel": "weepinbell",
    "wiktribel": "victreebel",
    "tentakul": "tentacool",
    "tentakrul": "tentacruel",
    "dżiodud": "geodude",
    "geodud": "geodude",
    "ponita": "ponyta",
    "rapidasz": "rapidash",
    "słoupok": "slowpoke",
    "sloupok": "slowpoke",
    "sloubro": "slowbro",
    "słoubro": "slowbro",
    "magnemajt": "magnemite",
    "farfecz": "farfetch'd",
    "farfec": "farfetch'd",
    "diugong": "dewgong",
    "mak": "muk",
    "szelder": "shellder",
    "klojster": "cloyster",
    "gastli": "gastly",
    "honter": "haunter",
    "drauzi": "drowzee",
    "hipno": "hypno",
    "krabi": "krabby",
    "kingler": "kingler",
    "woltorb": "voltorb",
    "elektrod": "electrode",
    "egzekjut": "exeggcute",
    "egzekjutor": "exeggutor",
    "kjubon": "cubone",
    "marowak": "marowak",
    "hitmonli": "hitmonlee",
    "hitmonczan": "hitmonchan",
    "likitung": "lickitung",
    "kofing": "koffing",
    "wizing": "weezing",
    "rajhorn": "rhyhorn",
    "rajdon": "rhydon",
    "czansi": "chansey",
    "tangela": "tangela",
    "kangaskan": "kangaskhan",
    "horsi": "horsea",
    "sidra": "seadra",
    "golds": "goldeen",
    "goldin": "goldeen",
    "siking": "seaking",
    "sterju": "staryu",
    "stermi": "starmie",
    "mistermajm": "mr. mime",
    "mistermaj": "mr. mime",
    "panmajm": "mr. mime",
    "sajter": "scyther",
    "jynks": "jynx",
    "dżynks": "jynx",
    "elektabaz": "electabuzz",
    "magmar": "magmar",
    "taurus": "tauros",
    "magikarp": "magikarp",
    "lapras": "lapras",
    "dito": "ditto",
    "ivi": "eevee",
    "wiportem": "vaporeon",
    "waporeon": "vaporeon",
    "dżolteon": "jolteon",
    "jolteon": "jolteon",
    "flareon": "flareon",
    "porigon": "porygon",
    "omanajt": "omanyte",
    "omastar": "omastar",
    "kabuto": "kabuto",
    "kabutops": "kabutops",
    "aerodaktyl": "aerodactyl",
    "artikuno": "articuno",
    "zapdos": "zapdos",
    "moltres": "moltres",
    "dratini": "dratini",
    "dragoner": "dragonair",
    "dragonajt": "dragonite"
  };

  // 1. Direct whole-string match
  const nInputWhole = normalize(userInput);
  if (nInputWhole === normalizedTarget) return true;
  if (phoneticMap[nInputWhole] === normalizedTarget) return true;

  const wholeDist = levenshteinDistance(nInputWhole, normalizedTarget);
  if (normalizedTarget.length >= 7 && wholeDist <= 2) return true;
  if (normalizedTarget.length >= 4 && wholeDist <= 1) return true;

  // 2. Fragment word-by-word matching (highly useful for speech recognition reporting e.g. "To jest Pikachu" or "Charmander.")
  // Split using any non-word characters including spaces & commas
  const words = userInput.split(/[\s,.\-?!_]+/);
  for (const rawWord of words) {
    if (!rawWord) continue;
    const nWord = normalize(rawWord);
    if (!nWord) continue;

    // Check exact word
    if (nWord === normalizedTarget) return true;
    // Check phonetic map
    if (phoneticMap[nWord] === normalizedTarget) return true;

    // Check Levenshtein distance on individual words
    const dist = levenshteinDistance(nWord, normalizedTarget);

    // If target has >= 7 letters, allow up to 2 substitutions / edits
    if (normalizedTarget.length >= 7 && dist <= 2) return true;
    // If target has >= 4 letters, allow up to 1 substitution / edit
    if (normalizedTarget.length >= 4 && dist <= 1) return true;
  }

  // Check if they are highly similar
  return false;
}
