import { useState, memo } from "react";
import { POKEMON_LIST, getPokemonImageUrl, POKEMON_TYPES_PL, Pokemon, getTypeName } from "../pokemonData";
import { Search, Lock, Award, Eye, X, BookOpen } from "lucide-react";

interface PokedexViewProps {
  unlockedIds: number[]; // represents CAUGHT
  seenIds?: number[];    // represents SEEN
  onClose: () => void;
  playerActiveTypes?: string[];
  language: "pl" | "en";
  t: any;
}

// --- KOMPONENT ATOMOWY: KAFELEK POKÉMONA (ZOPTYMALIZOWANY PRZEZ REACT.MEMO) ---
interface PokemonCardProps {
  poke: Pokemon;
  isCaught: boolean;
  isSeen: boolean;
  isUnlocked: boolean;
  language: "pl" | "en";
  t: any;
  onSelect: (poke: Pokemon) => void;
}

const PokemonCard = memo(function PokemonCard({
  poke,
  isCaught,
  isSeen,
  isUnlocked,
  language,
  t,
  onSelect
}: PokemonCardProps) {
  
  // 1. Optymalizacja wydajności: Wyliczenie wartości raz na cykl życia renderu kafelka
  const formattedId = `#${poke.id.toString().padStart(3, "0")}`;
  const pokemonImgUrl = getPokemonImageUrl(poke.id);
  
  // 2. Nadanie bezpiecznych, czystych stylów tła (Koniec z brudnym bleedem pastelowym)
  let cardBg = "bg-[#F2D5A7]/30 border-2 border-[#5A3A2A]/45 cursor-not-allowed";
  if (isCaught) {
    cardBg = "bg-white border-2 border-[#5A3A2A] shadow-[0_3px_0_#5A3A2A] hover:bg-[#FFF4DF]/15 cursor-pointer active:scale-95 duration-100";
  } else if (isSeen) {
    cardBg = "bg-[#BDEBFF] border-2 border-[#5A3A2A] shadow-[0_3px_0_#5A3A2A] hover:bg-[#BDEBFF]/90 cursor-pointer active:scale-95 duration-100";
  }

  // 3. Pobranie i utrwalenie nazw typów
  const type1Name = poke.types[0] ? getTypeName(poke.types[0], language) : null;
  const type2Name = poke.types[1] ? getTypeName(poke.types[1], language) : null;

  return (
    <button
      onClick={() => { if (isUnlocked) onSelect(poke); }}
      disabled={!isUnlocked}
      className={`relative overflow-hidden rounded-2xl flex flex-col items-center justify-between text-center transition-all min-h-[155px] p-2.5 shrink-0 ${cardBg}`}
    >
      {/* ID Counter */}
      <div className="absolute top-1.5 right-2 text-[9px] font-mono font-black text-[#5A3A2A]/60">
        {formattedId}
      </div>

      {/* Picture Container */}
      <div className="my-2 h-14 w-14 flex items-center justify-center relative">
        {isUnlocked ? (
          <img
            src={pokemonImgUrl}
            alt={poke.name}
            referrerPolicy="no-referrer"
            className={`h-12 w-12 object-contain ${!isCaught && isSeen ? "brightness-0 opacity-30 grayscale" : ""}`}
            style={{ filter: isCaught ? "drop-shadow(0 2px 4px rgba(90,58,42,0.15))" : "none" }}
          />
        ) : (
          <div className="relative flex items-center justify-center text-[#5A3A2A]/40">
            <img
              src={pokemonImgUrl}
              alt={language === "pl" ? "Zablokowany" : "Locked"}
              referrerPolicy="no-referrer"
              className="h-12 w-12 object-contain brightness-0 opacity-10 select-none grayscale"
            />
            <Lock className="absolute h-3.5 w-3.5 text-[#5A3A2A]/70 animate-pulse" />
          </div>
        )}
      </div>

      {/* Name Label */}
      <div className="w-full">
        <div
          className="text-[11px] font-display font-black tracking-tight leading-none min-h-[22px] flex items-center justify-center text-center uppercase break-all px-0.5"
          style={{ color: "#5A3A2A" }}
        >
          {isUnlocked ? (isCaught ? poke.name : t.statusSeen) : "???"}
        </div>
        
        {/* Stable High-Contrast Types Footprint Box */}
        <div className="mt-1 flex flex-col gap-0.5 items-center justify-center w-full min-h-[30px] select-none pb-1.5">
          <div className="flex items-center justify-center h-3.5 w-full">
            {type1Name ? (
              <span
                className="px-1.5 py-0.5 text-[8px] tracking-wider uppercase rounded-full border border-[#5A3A2A] w-16 text-center truncate font-black"
                style={{ 
                  backgroundColor: POKEMON_TYPES_PL[poke.types[0]]?.bgHex || "#A9E6CF",
                  color: "#5A3A2A",
                  WebkitFontSmoothing: "antialiased"
                }}
                title={type1Name}
              >
                {type1Name}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 text-[8px] text-transparent bg-transparent rounded select-none pointer-events-none w-16 text-center">
                EMPTY
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-center h-3.5 w-full">
            {type2Name ? (
              <span
                className="px-1.5 py-0.5 text-[8px] tracking-wider uppercase rounded-full border border-[#5A3A2A] w-16 text-center truncate font-black"
                style={{ 
                  backgroundColor: POKEMON_TYPES_PL[poke.types[1]]?.bgHex || "#A9E6CF",
                  color: "#5A3A2A",
                  WebkitFontSmoothing: "antialiased"
                }}
                title={type2Name}
              >
                {type2Name}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 text-[8px] text-transparent bg-transparent rounded select-none pointer-events-none w-16 text-center">
                EMPTY
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}, (prevProps, nextProps) => {
  // Ręczna, rygorystyczna kontrola renderu: odśwież komórkę TYLKO przy fizycznej zmianie stanu gry lub języka
  return (
    prevProps.isCaught === nextProps.isCaught &&
    prevProps.isSeen === nextProps.isSeen &&
    prevProps.isUnlocked === nextProps.isUnlocked &&
    prevProps.language === nextProps.language &&
    prevProps.poke.id === nextProps.poke.id
  );
});

// --- POMOCNICZA FUNKCJA LORE OPISÓW BAZY DANYCH ---
function getPokemonDescription(id: number, name: string, types: string[], language: "pl" | "en"): string {
  const descriptionsPl: Record<number, string> = {
    1: "Bulbasaur spędza czas drzemiąc w słońcu. Na jego plecach rośnie tajemnicze nasiono, które rozszerza się i czerpie energię z promieni słonecznych.",
    2: "Gdy pąk na plecach Ivysaura zaczyna pęcznieć, Pokémon traci zdolność stania na tylnych łapach. Oznacza to, że wkrótce rozkwitnie w Venusaur.",
    3: "Venusaur posiada olbrzymi kwiat, którego zapach koi emocje ludzi i Pokémonów. Kwiat ten rozkwita najpełniej, gdy absorbuje światło słoneczne.",
    4: "Płomień na końcu ogona Charmandera wskazuje jego siłę życiową i emocje. Kiedy cieszy się, płomień faluje, a gdy jest wściekły - gwałtownie bucha.",
    5: "Charmeleon ma niezwykle wojowniczą naturę. W ferworze walki niszczy wrogów ostrymi pazurami, a z jego pyska buchają potężne płomienie.",
    6: "Charizard lata wysoko w poszukiwaniu silnych rywali. Ogień, którym dysponuje, jest tak gorący, że bez trudu topi najtwardsze odłamy skalne.",
    7: "Squirtle potrafi schować się w swojej skorupie, a następnie tryskać wodą pod ogromnym ciśnieniem. Skorupa chroni go przed wszelkimi atakami.",
    8: "Wartortle jest symbolem długowieczności. Puszysty ogon pokryty gęstym futrem staje się ciemniejszy i bardziej okazały wraz z upływem wieków.",
    9: "Blastoise posiada na skorupie dwa potężne działa wodne, które potrafią przebić stal. Używa ich do precyzyjnych strzałów na odległość kilkudziesięciu metrów.",
    10: "Caterpie pokryty jest zieloną skórą, która idealnie maskuje go w liściach. Wydziela silny zapach z czerwonego czułka, aby odstraszyć wrogów.",
    11: "Metapod tkwi nieruchomo w twardej jak stal kokonie, przygotowując się do ewolucji. Wewnątrz skorupy jego ciało jest podatne na zranienia i miękkie.",
    12: "Butterfree uwielbia nektar z najpiękniejszych kwiatów. Potrafi dostrzec je z ogromnych odległości, a jego skrzydła są pokryte mieniącym się pyłkiem.",
    25: "Pikachu magazynuje energię elektryczną w czerwonych policzkach. Kiedy uwalnia skumulowany prąd, potrafi porazić wroga potężnym wyładowaniem.",
    26: "Jeśli Raichu zgromadzi zbyt wiele prądu, staje się agresywny. Aby tego uniknąć, odprowadza nadmiar ładunków w ziemię za pomocą długiego ogona.",
    39: "Gdy rywal spojrzy w duże oczy Jigglypuffa, ten zaczyna śpiewać tajemniczą, kojącą kołysankę, która bez wyjątków usypia każdego przeciwnika.",
    52: "Meowth uwielbia wszystko, co się świeci, a zwłaszcza okrągłe monety. W nocy przemierza ulice miast w poszukiwaniu porzuconego bilonu.",
    54: "Psyduck jest wiecznie dręczony przez silne bóle głowy. Kiedy ból staje się ekstremalny, Pokémon zaczyna nieświadomie kontrolować moc psychiczną.",
    92: "Gastly składa się niemal całkowicie z gazu. Potrafi osaczyć nawet najsilniejszego przeciwnika, wprowadzając go w stan głębokiego snu.",
    94: "Gengar lubi ukrywać się w cieniu ludzi i kraść ich ciepło. Gdy poczujesz nagły dreszcz w ciemnym pokoju, to znak, że Gengar stoi tuż za Tobą.",
    133: "Eevee posiada bardzo niestabilny kod genetyczny, co pozwala mu na ewolucję w wiele różnych form w zależności od otoczenia i kamieni ewolucyjnych.",
    143: "Snorlax jest niezwykle łagodnym Pokémonem, którego dzień składa się wyłącznie z jedzenia i spania. Potrafi zjeść 400 kg pożywienia na raz.",
    150: "Mewtwo został stworzony w tajnym laboratorium z DNA Mew. Uważa się go za jednego z najbardziej bezwzględnych i potężnych Pokémonów na świecie."
  };

  const descriptionsEn: Record<number, string> = {
    1: "Bulbasaur can be seen napping in bright sunlight. There is a seed on its back. By soaking up the sun's rays, the seed grows progressively larger.",
    2: "When the bud on its back starts swelling, Ivysaur loses the ability to stand on its hind legs. This is a sign that it will soon bloom into Venusaur.",
    3: "Venusaur has a giant flower whose sweet aroma calms the emotions of people and Pokémon. The flower blooms most beautifully when it absorbs sunlight.",
    4: "The flame on the tip of Charmander's tail indicates its life force and emotions. When it is happy, the flame waves; when it is angry, it blazes fiercely.",
    5: "Charmeleon has an incredibly hot-headed nature. In the heat of battle, it shreds foes with sharp claws while exporting powerful tongues of flame.",
    6: "Charizard flies high in search of strong opponents. The fire it breathes is so hot that it easily melts the hardest rocks.",
    7: "Squirtle can hide inside its shell, then spray high-pressure water. The shell protects it from various attacks.",
    8: "Wartortle is a symbol of longevity. Its fluffy fur-covered tail grows darker and more magnificent as the centuries pass.",
    9: "Blastoise has two powerful water cannons on its shell that can pierce steel. It uses them for precise shots from great distances.",
    10: "Caterpie is covered in a green skin that perfectly camouflages it in leaves. It releases a strong odor from its red antenna to repel foes.",
    11: "Metapod stands completely still inside its hard steel-like cocoon as it prepares to evolve. Inside the shell, its body is vulnerable and soft.",
    12: "Butterfree loves the nectar of beautiful flowers. It can spot them from great distances, and its wings are covered in glittering powder.",
    25: "Pikachu stores electricity in its red cheeks. When it releases this energy, it can shock enemies with huge electrical discharges.",
    26: "If Raichu stores too much electricity, it becomes aggressive. To prevent this, it discharges excess power into the ground using its long tail.",
    39: "If an opponent looks into Jigglypuff's large eyes, it begins to sing a soothing bedtime lullaby that always puts everyone to sleep.",
    52: "Meowth loves shiny objects, especially round coins. It roams city streets at night in search of lost coins.",
    54: "Psyduck is constantly tormented by strong headaches. When the pain becomes extreme, it begins to use psychic powers unconsciously.",
    92: "Gastly consists almost entirely of gas. It can surround even the strongest opponents, putting them into a state of deep sleep.",
    94: "Gengar likes to hide in people's shadows and steal their warmth. If you feel a sudden chill in a dark room, it means Gengar is right behind you.",
    133: "Eevee has an extremely unstable genetic makeup, which allows it to evolve into many different forms depending on its surroundings and stones.",
    143: "Snorlax is an extremely peaceful Pokémon whose day consists entirely of eating and sleeping. It can eat up to 400 kg of food at once.",
    150: "Mewtwo was created in a secret laboratory from Mew's DNA. It is considered one of the most ruthless and powerful Pokémon in the world."
  };

  if (language === "pl") {
    if (descriptionsPl[id]) return descriptionsPl[id];
    const typesPl = types.map(t => POKEMON_TYPES_PL[t]?.namePl || t).join(" / ");
    return `${name} to klasyczny Pokémon z regionu Kanto, władający typem ${typesPl}. Posiada unikalne receptory sensoryczne oraz wysoce rozwinięte zmysły bojowe, przydatne podczas rywalizacji o terytorium. Służy swojemu trenerowi niezłomną lojalnością.`;
  } else {
    if (descriptionsEn[id]) return descriptionsEn[id];
    const typesEn = types.map(t => getTypeName(t, "en")).join(" / ");
    return `${name} is a classic Pokémon from the Kanto region, carrying the ${typesEn} type. It possesses unique sensory receptors and highly developed combat instincts, useful during territory rivalries. It serves its trainer with unwavering loyalty.`;
  }
}

// --- GŁÓWNY KOMPONENT WIDOKU POKÉDEXU ---
export default function PokedexView({ unlockedIds, seenIds = [], onClose, playerActiveTypes = [], language, t }: PokedexViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPokeDetail, setSelectedPokeDetail] = useState<Pokemon | null>(null);

  const unlockedSet = new Set(unlockedIds);
  const seenSet = new Set([...unlockedIds, ...seenIds]);
  const totalCount = POKEMON_LIST.length;
  const unlockedCount = unlockedSet.size;
  const seenCount = seenSet.size;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  const filteredPokemon = POKEMON_LIST.filter((poke) => {
    const matchesSearch = poke.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          poke.id.toString() === searchTerm;
    const matchesType = !selectedType || poke.types.includes(selectedType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-x-0 top-0 bottom-[68px] z-60 bg-[#FFF4DF] flex flex-col justify-start font-sans select-none overflow-hidden text-cocoa">
      {!selectedPokeDetail && (
        <header className="h-16 w-full bg-[#FFF4DF] border-b-2 border-[#5A3A2A] px-4 flex items-center justify-between sticky top-0 z-50 select-none font-sans shrink-0">
          <h2 className="font-display font-black tracking-tight text-sm sm:text-base text-pokemon-navy uppercase italic flex items-center gap-1.5 shrink-0">
            <BookOpen className="h-4 w-4 text-[#24456B]" />
            <span>{t.pokedexTitle}</span>
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl bg-white-frost hover:bg-cafe-beige transition text-cocoa px-3.5 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider border-2 border-cocoa shadow-[0_3px_0_#5A3A2A] cursor-pointer"
          >
            {t.pokedexClose}
          </button>
        </header>
      )}

      <div className="mx-auto max-w-lg px-4 pt-4 pb-2 w-full flex-1 flex flex-col overflow-hidden">
        {/* Stats Card */}
        <div className="mb-6 rounded-[24px] bg-cafe-beige border-2 border-[#5A3A2A] p-5 shadow-[0_4px_0_#5A3A2A]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-cocoa/80">{t.pokedexProgress}:</span>
            <span className="font-mono text-sm font-black text-pokemon-navy">
              {unlockedCount} / {totalCount} ({percentage}%)
            </span>
          </div>
          <div className="h-4 w-full rounded-full bg-white-frost overflow-hidden border-2 border-[#5A3A2A] p-0.5">
            <div
              className="h-full bg-lemon-yellow rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="mt-4 flex gap-2 justify-around text-center text-xs text-cocoa border-t-2 border-[#5A3A2A]/20 pt-4 font-bold">
            <div>
              <p className="font-mono font-black text-pokemon-navy text-sm">{unlockedCount}</p>
              <p className="text-[10px] text-cocoa/70 uppercase tracking-widest font-black mt-0.5">{t.metricCaught}</p>
            </div>
            <div className="border-l-2 border-[#5A3A2A]/20 h-6" />
            <div>
              <p className="font-mono font-black text-pokemon-navy text-sm">{seenCount}</p>
              <p className="text-[10px] text-cocoa/70 uppercase tracking-widest font-black mt-0.5">{t.metricSeen}</p>
            </div>
            <div className="border-l-2 border-[#5A3A2A]/20 h-6" />
            <div>
              <p className="font-mono font-black text-coral text-sm uppercase">Kanto</p>
              <p className="text-[10px] text-cocoa/70 uppercase tracking-widest font-black mt-0.5">Total: 151</p>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-cocoa/50" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-white-frost border-2 border-[#5A3A2A] py-3 pl-10 pr-4 text-sm text-cocoa placeholder-cocoa/40 focus:border-[#24456B] focus:ring-1 focus:ring-[#24456B] focus:outline-none shadow-sm"
            />
          </div>

          {/* Types pills selector */}
          <div className="flex flex-row flex-nowrap gap-1.5 overflow-x-auto pb-2 scrollbar-none select-none">
            <button
              onClick={() => setSelectedType(null)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[10px] font-black uppercase transition tracking-wider border-2 border-[#5A3A2A] ${
                selectedType === null
                  ? "bg-[#FFD84D] text-[#24456B] shadow-[0_2px_0_#24456B]"
                  : "bg-white hover:bg-cafe-beige text-cocoa shadow-[0_2px_0_#5A3A2A]"
              }`}
            >
              {t.filterAll}
            </button>
            {Object.entries(POKEMON_TYPES_PL).map(([typeKey]) => (
              <button
                key={typeKey}
                onClick={() => setSelectedType(typeKey)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[10px] font-black uppercase transition tracking-wider flex items-center gap-1 border-2 border-[#5A3A2A] ${
                  selectedType === typeKey
                    ? "bg-[#24456B] text-white-frost shadow-[0_2px_0_#24456B]"
                    : "bg-white hover:bg-cafe-beige text-cocoa shadow-[0_2px_0_#5A3A2A]"
                }`}
              >
                <span>{getTypeName(typeKey, language)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pokemon Grid Scrollable Wrapper */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-4">
          <div className="grid grid-cols-3 gap-2.5">
            {filteredPokemon.map((poke) => {
              const isCaught = unlockedSet.has(poke.id);
              const isSeen = seenSet.has(poke.id);
              const isUnlocked = isCaught || isSeen;
              return (
                <PokemonCard
                  key={poke.id}
                  poke={poke}
                  isCaught={isCaught}
                  isSeen={isSeen}
                  isUnlocked={isUnlocked}
                  language={language}
                  t={t}
                  onSelect={setSelectedPokeDetail}
                />
              );
            })}
          </div>

          {filteredPokemon.length === 0 && (
            <div className="text-center py-12 text-cocoa/65 text-sm font-bold">
              {t.pokedexSearchNone}
            </div>
          )}
        </div>
      </div>

      {/* --- RETRO CARD ZOOM DETAIL MODAL --- */}
      {selectedPokeDetail && (
        <div
          id="pokedex-detail-fullbleed"
          className="fixed inset-x-0 top-0 bottom-[68px] z-60 bg-[#FFF4DF] flex flex-col justify-between overflow-hidden p-5 select-none text-cocoa"
        >
          {/* Background soft glow based on primary type */}
          {(() => {
            const primaryType = selectedPokeDetail.types[0] || "normal";
            const typeDetail = POKEMON_TYPES_PL[primaryType];
            const hex = typeDetail?.bgHex || "#3b4cca";
            return (
              <div
                className="absolute inset-0 opacity-15 blur-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${hex} 0%, transparent 75%)` }}
              />
            );
          })()}

          {/* Retro Top bar */}
          <div className="flex items-center justify-between border-b-2 border-[#5A3A2A]/20 pb-3 z-10 shrink-0">
            <span className="font-mono text-xs font-black text-[#5A3A2A]">
              POKÉDEX #{selectedPokeDetail.id.toString().padStart(3, "0")}
            </span>
            <span className="text-[10px] text-pokemon-navy uppercase tracking-widest font-black">
              {t.pokedexPokemonCategory}
            </span>
          </div>

          {/* Full content layout - Flex column with fluid support to prevent any layout overflow */}
          <div className="flex-1 flex flex-col items-center justify-center px-2 fluid-gap-medium z-10 overflow-hidden">
            {/* Holographic Glowing Frame */}
            <div className="relative h-[22vh] w-[22vh] max-h-40 max-w-40 min-h-[110px] min-w-[110px] rounded-full bg-white-frost flex items-center justify-center border-2 border-[#5A3A2A] shadow-[0_4px_8px_rgba(90,58,42,0.18)] shrink-0">
              <div className="absolute inset-0 rounded-full bg-cafe-beige/10" />
              <img
                src={getPokemonImageUrl(selectedPokeDetail.id)}
                alt={selectedPokeDetail.name}
                referrerPolicy="no-referrer"
                className="h-4/5 w-4/5 object-contain z-10"
                style={{ filter: "drop-shadow(0 4px 6px rgba(90,58,42,0.2))" }}
              />
            </div>

            {/* Name titles */}
            <div className="text-center shrink-0">
              <h3 className="font-display font-black text-2xl sm:text-3xl text-[#5A3A2A] tracking-tight uppercase leading-none">
                {selectedPokeDetail.name}
              </h3>
            </div>

            {/* Types Row with custom hex badges */}
            <div className="flex justify-center gap-1.5 shrink-0">
              {selectedPokeDetail.types.map((typeKey) => {
                const detail = POKEMON_TYPES_PL[typeKey];
                return (
                  <span
                    key={typeKey}
                    className="px-3.5 py-1 text-[10px] font-black tracking-wider text-[#5A3A2A] uppercase rounded-full shadow-sm border-2 border-[#5A3A2A]"
                    style={{ backgroundColor: detail?.bgHex || "#FFF" }}
                  >
                    {getTypeName(typeKey, language)}
                  </span>
                );
              })}
            </div>

            {/* Collection Status */}
            {(() => {
              const isPokeCaught = unlockedSet.has(selectedPokeDetail.id);
              return (
                <div className="shrink-0">
                  {isPokeCaught ? (
                    <span className="text-[#24456B] font-black tracking-wider uppercase text-[10px] flex items-center gap-1.5 bg-[#A9E6CF] border-2 border-[#5A3A2A] px-3.5 py-1 rounded-full shadow-sm">
                      <Award className="h-4 w-4" /> {t.statusCaught}
                    </span>
                  ) : (
                    <span className="text-[#5A3A2A] font-black tracking-wider uppercase text-[10px] flex items-center gap-1.5 bg-[#BDEBFF] border-2 border-[#5A3A2A] px-3.5 py-1 rounded-full shadow-sm">
                      <Eye className="h-4 w-4 text-[#5A3A2A]" /> {t.statusSeen}
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Retro Lore text block */}
            <div className="w-full max-w-sm bg-white-frost border-2 border-[#5A3A2A] rounded-2xl p-4 shadow-md flex-1 min-h-[80px] overflow-hidden flex flex-col justify-start">
              <span className="text-[10px] font-black text-[#5A3A2A] uppercase tracking-widest border-b-2 border-[#5A3A2A]/25 pb-1.5 mb-2 block shrink-0">
                {t.pokedexDatabaseTitle}
              </span>
              <div className="text-xs text-[#5A3A2A] leading-relaxed font-bold overflow-y-auto pr-1 flex-1">
                {getPokemonDescription(selectedPokeDetail.id, selectedPokeDetail.name, selectedPokeDetail.types, language)}
              </div>
            </div>
          </div>

          {/* Primary Action Button Bar */}
          <div className="pt-2 z-10 shrink-0">
            <button
              onClick={() => setSelectedPokeDetail(null)}
              className="w-full btn-core-yellow py-4"
            >
              {t.backToPokedexBtn}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
