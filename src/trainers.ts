export interface Trainer {
  id: string;
  name: string;
  avatar: string; // Emoji or visual representation
  primaryType: string; // Pokemon type category
  difficulty: "easy" | "medium" | "hard";
  description: string;
  avatarColor: string; // styling
}

export const TRAINERS: Record<string, Trainer> = {
  gary: {
    id: "gary",
    name: "Gary Oak",
    avatar: "👑",
    primaryType: "normal",
    difficulty: "hard",
    description: "Twój odwieczny rywal. Jest niesamowicie pewny siebie i nie wybacza błędów.",
    avatarColor: "bg-indigo-500"
  },
  brock: {
    id: "brock",
    name: "Brock",
    avatar: "🪨",
    primaryType: "rock",
    difficulty: "easy",
    description: "Lider sali w Pewter City. Specjalista od twardorękich, kamiennych Pokemonów.",
    avatarColor: "bg-stone-600"
  },
  misty: {
    id: "misty",
    name: "Misty",
    avatar: "💧",
    primaryType: "water",
    difficulty: "medium",
    description: "Liderka sali w Cerulean City. Kocha Pokemony wodne i walki w deszczu.",
    avatarColor: "bg-blue-500"
  },
  lt_surge: {
    id: "lt_surge",
    name: "Lt. Surge",
    avatar: "⚡",
    primaryType: "electric",
    difficulty: "medium",
    description: "Wojskowy twardziel z Vermilion City. Porazi Cię elektryczną taktyką.",
    avatarColor: "bg-yellow-500"
  },
  erika: {
    id: "erika",
    name: "Erika",
    avatar: "🌿",
    primaryType: "grass",
    difficulty: "easy",
    description: "Elegancka liderka sali z Celadon City. Zna każdy liść i kwiat w Kanto.",
    avatarColor: "bg-emerald-500"
  },
  koga: {
    id: "koga",
    name: "Koga",
    avatar: "🥷",
    primaryType: "poison",
    difficulty: "medium",
    description: "Mistrz ninja z Fuchsia City. Jego trucizny powoli wysysają czas na zegarze.",
    avatarColor: "bg-purple-600"
  },
  sabrina: {
    id: "sabrina",
    name: "Sabrina",
    avatar: "🔮",
    primaryType: "psychic",
    difficulty: "hard",
    description: "Tajemnicza liderka z Saffron City. Czyta w Twoich myślach i przewiduje ruchy.",
    avatarColor: "bg-violet-600"
  },
  blaine: {
    id: "blaine",
    name: "Blaine",
    avatar: "🔥",
    primaryType: "fire",
    difficulty: "hard",
    description: "Szalony naukowiec z Cinnabar Island. Rozpali ogień pod Twoim zegarem.",
    avatarColor: "bg-orange-600"
  },
  giovanni: {
    id: "giovanni",
    name: "Giovanni",
    avatar: "🕴️",
    primaryType: "ground",
    difficulty: "hard",
    description: "Szef Zespołu R. Potężny trener ziemnych Pokemonów o bezwzględnych zamiarach.",
    avatarColor: "bg-amber-700"
  },
  jessie: {
    id: "jessie",
    name: "Jessie",
    avatar: "💄",
    primaryType: "poison",
    difficulty: "easy",
    description: "Członkini Zespołu R. Zawsze gotowa, by sprawić kłopoty Kanto.",
    avatarColor: "bg-pink-600"
  },
  james: {
    id: "james",
    name: "James",
    avatar: "🌹",
    primaryType: "grass",
    difficulty: "easy",
    description: "Wrażliwsza połówka duetu Zespołu R. Często panikuje pod presją czasu.",
    avatarColor: "bg-teal-500"
  },
  nurse_joy: {
    id: "nurse_joy",
    name: "Pielęgniarka Joy",
    avatar: "🏥",
    primaryType: "normal",
    difficulty: "easy",
    description: "Pomocna dłoń z Centrum Pokemon. Zna wszystkie Pokemony z podręczników.",
    avatarColor: "bg-rose-400"
  },
  officer_jenny: {
    id: "officer_jenny",
    name: "Oficer Jenny",
    avatar: "👮‍♀️",
    primaryType: "normal",
    difficulty: "medium",
    description: "Stróż prawa w Kanto. Ściga przestępców i szybko kojarzy fakty.",
    avatarColor: "bg-cyan-700"
  },
  bug_catcher: {
    id: "bug_catcher",
    name: "Łapacz Robaków",
    avatar: "🕸️",
    primaryType: "bug",
    difficulty: "easy",
    description: "Młody entuzjasta z lasu Viridian. Szybki, ale łatwo go zaskoczyć.",
    avatarColor: "bg-lime-600"
  },
  lass_carrie: {
    id: "lass_carrie",
    name: "Karolina",
    avatar: "🎀",
    primaryType: "fairy",
    difficulty: "easy",
    description: "Urocza trenerka z drogi numer 3. Uwielbia słodkie Pokemony.",
    avatarColor: "bg-rose-300"
  },
  fisherman: {
    id: "fisherman",
    name: "Rybak Ralph",
    avatar: "🎣",
    primaryType: "water",
    difficulty: "easy",
    description: "Spędził życie na mostach Kanto, łowiąc i trenując Pokemony wodne.",
    avatarColor: "bg-blue-400"
  },
  lorelei: {
    id: "lorelei",
    name: "Lorelei",
    avatar: "❄️",
    primaryType: "ice",
    difficulty: "hard",
    description: "Członkini Elitarnej Czwórki. Jej lodowy spokój pod presją czasu przeraża.",
    avatarColor: "bg-sky-400"
  },
  bruno: {
    id: "bruno",
    name: "Bruno",
    avatar: "👊",
    primaryType: "fighting",
    difficulty: "medium",
    description: "Członek Elitarnej Czwórki. Trenuje swoje ciało i Pokemony walczące.",
    avatarColor: "bg-red-600"
  },
  agatha: {
    id: "agatha",
    name: "Agatha",
    avatar: "👵",
    primaryType: "ghost",
    difficulty: "hard",
    description: "Najstarsza członkini Elitarnej Czwórki. Straszy duchami z jaskiń Kanto.",
    avatarColor: "bg-indigo-700"
  },
  lance: {
    id: "lance",
    name: "Lance",
    avatar: "🐉",
    primaryType: "dragon",
    difficulty: "hard",
    description: "Smoczy mistrz Elitarnej Czwórki. Jeden z najpotężniejszych trenerów.",
    avatarColor: "bg-violet-700"
  },
  camper: {
    id: "camper",
    name: "Obozowicz Liam",
    avatar: "⛺",
    primaryType: "ground",
    difficulty: "easy",
    description: "Lubi spędzać czas na łonie natury i badać jaskinie Kanto.",
    avatarColor: "bg-amber-600"
  },
  picnicker: {
    id: "picnicker",
    name: "Piknikowiczka Diana",
    avatar: "🧺",
    primaryType: "grass",
    difficulty: "easy",
    description: "Wędruje skrajami łąk zbierając zioła i jagody dla swoich Pokemonów.",
    avatarColor: "bg-green-500"
  },
  scientist: {
    id: "scientist",
    name: "Naukowiec Taylor",
    avatar: "🥼",
    primaryType: "electric",
    difficulty: "medium",
    description: "Badacz z elektrowni Kanto. Doskonale zna teorie i klasyfikacje Pokemonów.",
    avatarColor: "bg-slate-500"
  },
  red: {
    id: "red",
    name: "Red",
    avatar: "🧢",
    primaryType: "normal",
    difficulty: "hard",
    description: "Legendarny cichy mistrz z Góry Srebrnej. Prawdziwa legenda ligi.",
    avatarColor: "bg-red-500"
  },
  player: {
    id: "player",
    name: "Ty (Ash)",
    avatar: "⚡",
    primaryType: "electric",
    difficulty: "medium",
    description: "Nastoletni pretendent z Alabastii. Twoim marzeniem jest zostać Mistrzem Pokémon!",
    avatarColor: "bg-cyan-500"
  }
};

export interface GridCell {
  id: number; // 0..24
  row: number;
  col: number;
  initialTrainerId: string;
  currentOwnerId: string; // "player" or other trainer ID
  primaryType: string; // "water", "fire", etc.
}

export const INITIAL_GRID: GridCell[] = [
  // Row 0
  { id: 0, row: 0, col: 0, initialTrainerId: "gary", currentOwnerId: "gary", primaryType: "normal" },
  { id: 1, row: 0, col: 1, initialTrainerId: "bug_catcher", currentOwnerId: "bug_catcher", primaryType: "bug" },
  { id: 2, row: 0, col: 2, initialTrainerId: "misty", currentOwnerId: "misty", primaryType: "water" },
  { id: 3, row: 0, col: 3, initialTrainerId: "brock", currentOwnerId: "brock", primaryType: "rock" },
  { id: 4, row: 0, col: 4, initialTrainerId: "nurse_joy", currentOwnerId: "nurse_joy", primaryType: "normal" },

  // Row 1
  { id: 5, row: 1, col: 0, initialTrainerId: "lt_surge", currentOwnerId: "lt_surge", primaryType: "electric" },
  { id: 6, row: 1, col: 1, initialTrainerId: "erika", currentOwnerId: "erika", primaryType: "grass" },
  { id: 7, row: 1, col: 2, initialTrainerId: "koga", currentOwnerId: "koga", primaryType: "poison" },
  { id: 8, row: 1, col: 3, initialTrainerId: "sabrina", currentOwnerId: "sabrina", primaryType: "psychic" },
  { id: 9, row: 1, col: 4, initialTrainerId: "blaine", currentOwnerId: "blaine", primaryType: "fire" },

  // Row 2
  { id: 10, row: 2, col: 0, initialTrainerId: "giovanni", currentOwnerId: "giovanni", primaryType: "ground" },
  { id: 11, row: 2, col: 1, initialTrainerId: "jessie", currentOwnerId: "jessie", primaryType: "poison" },
  { id: 12, row: 2, col: 2, initialTrainerId: "james", currentOwnerId: "james", primaryType: "grass" },
  { id: 13, row: 2, col: 3, initialTrainerId: "lorelei", currentOwnerId: "lorelei", primaryType: "ice" },
  { id: 14, row: 2, col: 4, initialTrainerId: "bruno", currentOwnerId: "bruno", primaryType: "fighting" },

  // Row 3
  { id: 15, row: 3, col: 0, initialTrainerId: "agatha", currentOwnerId: "agatha", primaryType: "ghost" },
  { id: 16, row: 3, col: 1, initialTrainerId: "lance", currentOwnerId: "lance", primaryType: "dragon" },
  { id: 17, row: 3, col: 2, initialTrainerId: "officer_jenny", currentOwnerId: "officer_jenny", primaryType: "normal" },
  { id: 18, row: 3, col: 3, initialTrainerId: "lass_carrie", currentOwnerId: "lass_carrie", primaryType: "fairy" },
  { id: 19, row: 3, col: 4, initialTrainerId: "fisherman", currentOwnerId: "fisherman", primaryType: "water" },

  // Row 4
  { id: 20, row: 4, col: 0, initialTrainerId: "player", currentOwnerId: "player", primaryType: "electric" }, // Alabastia
  { id: 21, row: 4, col: 1, initialTrainerId: "camper", currentOwnerId: "camper", primaryType: "ground" },
  { id: 22, row: 4, col: 2, initialTrainerId: "picnicker", currentOwnerId: "picnicker", primaryType: "grass" },
  { id: 23, row: 4, col: 3, initialTrainerId: "scientist", currentOwnerId: "scientist", primaryType: "electric" },
  { id: 24, row: 4, col: 4, initialTrainerId: "red", currentOwnerId: "red", primaryType: "normal" }
];
