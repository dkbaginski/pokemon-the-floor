import { useState, memo } from "react";
import { POKEMON_LIST, getPokemonImageUrl, POKEMON_TYPES_PL, Pokemon, getTypeName } from "../pokemonData";
import { POKEMON_DESCRIPTIONS } from "../pokemonDescriptions";
import { Search, Lock, X, ChevronLeft } from "lucide-react";
import { EyeIcon, ProgressRing, PokeBallLogoIcon } from "./icons";

interface PokedexViewProps {
  unlockedIds: number[]; // represents CAUGHT
  seenIds?: number[];    // represents SEEN
  caughtAt?: Record<number, number>; // id → epoch ms first caught (may be absent for legacy saves)
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
  
  // Card background: neutral cream for sighted-only Pokémon, white for caught.
  // The "seen" state used to dye the whole card blue (#BDEBFF) which read as a
  // blue overlay over the silhouette — design 04 keeps the card neutral and
  // surfaces the sighted state via a small blue eye badge (see below).
  let cardBg = "bg-[#F2D5A7]/30 border-2 border-[#5A3A2A]/45 cursor-not-allowed";
  if (isCaught) {
    cardBg = "bg-white border-2 border-[#5A3A2A] shadow-[0_3px_0_#5A3A2A] hover:bg-[#FFF4DF]/15 cursor-pointer active:scale-95 duration-100";
  } else if (isSeen) {
    cardBg = "bg-[#FFF4DF] border-2 border-[#5A3A2A] shadow-[0_3px_0_#5A3A2A] hover:bg-white cursor-pointer active:scale-95 duration-100";
  }

  // 3. Pobranie i utrwalenie nazw typów
  const type1Name = poke.types[0] ? getTypeName(poke.types[0], language) : null;
  const type2Name = poke.types[1] ? getTypeName(poke.types[1], language) : null;

  // Primary type drives the top accent stripe on the card. For locked
  // ("???") entries we fall back to a neutral cocoa stripe so we don't leak
  // the Pokémon's type before the player has seen it.
  const primaryType = poke.types[0];
  const topStripeColor = isUnlocked
    ? POKEMON_TYPES_PL[primaryType]?.bgHex || "#A9E6CF"
    : "rgba(90,58,42,0.2)";

  return (
    <button
      onClick={() => { if (isUnlocked) onSelect(poke); }}
      disabled={!isUnlocked}
      className={`relative overflow-hidden rounded-2xl flex flex-col items-center justify-between text-center transition-all min-h-[155px] p-2.5 shrink-0 ${cardBg}`}
    >
      {/* Top accent stripe (design 04) — full-width 4px stripe in the primary
          type colour. For locked entries falls back to a cocoa tint so the
          type isn't leaked before the player has seen the Pokémon. */}
      <div
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{ backgroundColor: topStripeColor }}
      />

      {/* ID-pill (design 04) — navy capsule with cream text in the LEFT-top
          corner. Replaces the earlier right-side text-only ID. */}
      <div className="absolute top-1.5 left-1.5 z-10 bg-[#1B2840] text-white font-mono font-black text-[8px] px-1.5 py-0.5 rounded-md tracking-wider leading-none">
        {formattedId}
      </div>

      {/* Status badges — moved to the RIGHT-top corner to make room for the
          ID-pill. Sighted = light-blue eye; caught = white Pokéball. */}
      {isSeen && !isCaught && (
        <div
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#BDEBFF] border-2 border-[#5A3A2A] shadow-[0_1px_0_#5A3A2A] flex items-center justify-center z-10"
          title={t.statusSeen}
        >
          <EyeIcon size={10} color="#24456B" strokeWidth={2.4} />
        </div>
      )}
      {isCaught && (
        <div
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white border-2 border-[#5A3A2A] shadow-[0_1px_0_#5A3A2A] flex items-center justify-center overflow-hidden z-10"
          title={t.statusCaught}
        >
          <PokeBallLogoIcon size={14} ink="#5A3A2A" red="#DC2630" />
        </div>
      )}

      {/* Picture Container */}
      <div className="my-2 h-14 w-14 flex items-center justify-center relative">
        {isUnlocked ? (
          <img
            src={pokemonImgUrl}
            alt={poke.name}
            referrerPolicy="no-referrer"
            className={`h-12 w-12 object-contain ${!isCaught && isSeen ? "brightness-0 opacity-60 grayscale" : ""}`}
            style={{ filter: isCaught ? "drop-shadow(0 2px 4px rgba(90,58,42,0.15))" : "none" }}
          />
        ) : (
          <div className="relative flex items-center justify-center text-[#5A3A2A]/40">
            <img
              src={pokemonImgUrl}
              alt={t.lockedAlt}
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
          {isCaught || isSeen ? poke.name : "???"}
        </div>
        
        {/* Stable High-Contrast Types Footprint Box — full-card-width pills
            so longer Polish names ("TRAWIASTY", "PSYCHICZNY", "ELEKTRYCZNY")
            fit without truncation. Empty slot keeps a 14px placeholder so
            single-type Pokémon stay vertically aligned with dual-type ones. */}
        <div className="mt-1 flex flex-col gap-1.5 items-stretch justify-center w-full min-h-[34px] select-none pb-1.5">
          <div className="flex items-center justify-center h-3.5 w-full">
            {type1Name ? (
              <span
                className="px-2 py-0.5 text-[8px] tracking-wider uppercase rounded-full border border-[#5A3A2A] w-full text-center font-black"
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
              <span className="px-2 py-0.5 text-[8px] text-transparent bg-transparent rounded select-none pointer-events-none w-full text-center">
                EMPTY
              </span>
            )}
          </div>

          <div className="flex items-center justify-center h-3.5 w-full">
            {type2Name ? (
              <span
                className="px-2 py-0.5 text-[8px] tracking-wider uppercase rounded-full border border-[#5A3A2A] w-full text-center font-black"
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
              <span className="px-2 py-0.5 text-[8px] text-transparent bg-transparent rounded select-none pointer-events-none w-full text-center">
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
// Flavour text for all 151 Kanto species lives in pokemonDescriptions.ts.
// The technical fallback below only fires if an id is ever missing from that
// complete map (it should not happen for the canonical 1–151 set).
function getPokemonDescription(id: number, name: string, _types: string[], language: "pl" | "en"): string {
  const entry = POKEMON_DESCRIPTIONS[id];
  if (entry) return entry[language];
  return language === "pl"
    ? `Brak opisu dla ${name}.`
    : `No description available for ${name}.`;
}

// --- GŁÓWNY KOMPONENT WIDOKU POKÉDEXU ---
export default function PokedexView({ unlockedIds, seenIds = [], caughtAt = {}, onClose, playerActiveTypes = [], language, t }: PokedexViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [selectedPokeDetail, setSelectedPokeDetail] = useState<Pokemon | null>(null);
  // Status filter — driven by tapping the green CAUGHT / blue SEEN tiles in
  // the stats row. `null` means "no status filter" (show everything that
  // matches the search + type filters).
  const [selectedStatus, setSelectedStatus] = useState<"caught" | "seen" | null>(null);

  const unlockedSet = new Set(unlockedIds);
  const seenSet = new Set([...unlockedIds, ...seenIds]);
  const totalCount = POKEMON_LIST.length;
  const unlockedCount = unlockedSet.size;
  const seenCount = seenSet.size;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  const filteredPokemon = POKEMON_LIST.filter((poke) => {
    const isCaught = unlockedSet.has(poke.id);
    const isSeenOnly = seenSet.has(poke.id) && !isCaught;
    if (selectedStatus === "caught" && !isCaught) return false;
    if (selectedStatus === "seen" && !isSeenOnly) return false;
    const matchesSearch = poke.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          poke.id.toString() === searchTerm;
    const matchesType = selectedTypes.length === 0 || poke.types.some((ty) => selectedTypes.includes(ty));
    return matchesSearch && matchesType;
  });

  return (
    <div className="absolute inset-x-0 top-0 bottom-[68px] z-60 bg-[#FFF4DF] flex flex-col justify-start font-sans select-none overflow-hidden text-cocoa">

      {/* Red gradient header bar (design 04) — only on list view, hidden in detail */}
      {!selectedPokeDetail && (
        <div className="shrink-0 bg-gradient-to-b from-[#E95050] to-[#C53636] border-b-2 border-[#5A3A2A] pl-3 pr-16 pt-3 pb-3 relative">
          <div className="flex items-center gap-2">
            <div className="shrink-0 flex items-center gap-2">
              {/* Pokéball — classic red top, white bottom (design 04). */}
              <div className="h-10 w-10 rounded-full border-2 border-[#5A3A2A] shadow-[0_2px_0_#5A3A2A] flex items-center justify-center bg-white">
                <PokeBallLogoIcon size={32} ink="#5A3A2A" red="#DC2630" />
              </div>
              {/* Dots */}
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5A3A2A]/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFD84D]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#A9E6CF]" />
              </div>
            </div>
            <div className="flex-1 min-w-0 text-right pr-0.5">
              <div className="font-display font-black text-base italic uppercase text-white leading-none whitespace-nowrap">
                {t.pokedexTitle}
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/80 mt-0.5 whitespace-nowrap">
                KANTO · NAT.
              </div>
            </div>
          </div>

          {/* Stats row — progress ring + 3 metric pills (design 04). The ring
              visualises % caught out of 151 and holds the caught count in its
              centre disc; the side pills surface the rest of the numbers. */}
          <div className="mt-2.5 flex items-stretch gap-2">
            <div className="shrink-0">
              <ProgressRing
                value={unlockedCount}
                max={totalCount}
                size={64}
                arcColor="#FFD84D"
                trackColor="rgba(0,0,0,0.22)"
                faceColor="#FFFFFF"
                borderColor="#1B2840"
              >
                <div className="flex flex-col items-center leading-none">
                  <span className="font-mono font-black text-base text-[#1B2840]">{percentage}%</span>
                </div>
              </ProgressRing>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-1.5">
              {/* Tap to toggle the corresponding status filter. The active
                  tile gets a navy outline + cocoa shadow lift so it reads as
                  a pressed button without changing colour. */}
              <button
                type="button"
                onClick={() => setSelectedStatus((s) => (s === "caught" ? null : "caught"))}
                className={`bg-[#A9E6CF] border-2 rounded-xl px-1.5 py-1 text-center flex flex-col justify-center cursor-pointer transition active:translate-y-0.5 ${
                  selectedStatus === "caught"
                    ? "border-[#1B2840] shadow-[0_2px_0_#1B2840] ring-2 ring-[#1B2840]"
                    : "border-[#5A3A2A]"
                }`}
                title={t.metricCaught}
              >
                <div className="font-mono font-black text-base text-[#5A3A2A] leading-none">{String(unlockedCount).padStart(2, "0")}</div>
                <div className="text-[7px] font-black uppercase tracking-wider text-[#5A3A2A] mt-0.5">{t.metricCaught}</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus((s) => (s === "seen" ? null : "seen"))}
                className={`bg-[#BDEBFF] border-2 rounded-xl px-1.5 py-1 text-center flex flex-col justify-center cursor-pointer transition active:translate-y-0.5 ${
                  selectedStatus === "seen"
                    ? "border-[#1B2840] shadow-[0_2px_0_#1B2840] ring-2 ring-[#1B2840]"
                    : "border-[#5A3A2A]"
                }`}
                title={t.metricSeen}
              >
                <div className="font-mono font-black text-base text-[#5A3A2A] leading-none">{String(seenCount).padStart(2, "0")}</div>
                <div className="text-[7px] font-black uppercase tracking-wider text-[#5A3A2A] mt-0.5">{t.metricSeen}</div>
              </button>
              {/* TOTAL tile clears the status filter (acts as "show all"). */}
              <button
                type="button"
                onClick={() => setSelectedStatus(null)}
                className={`bg-[#FFD84D] border-2 rounded-xl px-1.5 py-1 text-center flex flex-col justify-center cursor-pointer transition active:translate-y-0.5 ${
                  selectedStatus === null
                    ? "border-[#1B2840] shadow-[0_2px_0_#1B2840]"
                    : "border-[#5A3A2A]"
                }`}
                title="TOTAL"
              >
                <div className="font-mono font-black text-base text-[#5A3A2A] leading-none">{totalCount}</div>
                <div className="text-[7px] font-black uppercase tracking-wider text-[#5A3A2A] mt-0.5">TOTAL</div>
              </button>
            </div>
          </div>

          {/* Close button — corner X */}
          <button
            onClick={onClose}
            className="absolute top-2 right-3 rounded-full bg-white border-2 border-[#5A3A2A] text-[#5A3A2A] hover:bg-cafe-beige w-7 h-7 flex items-center justify-center transition cursor-pointer shadow-[0_2px_0_#5A3A2A]"
            aria-label={t.pokedexClose}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mx-auto w-full px-4 pt-3 pb-2 flex-1 flex flex-col overflow-hidden">

        {/* Filters Panel with Premium Sub-controls */}
        <div className="space-y-3 mb-5 shrink-0 relative">
          <div className="flex gap-2 items-center">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cocoa/50" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 rounded-2xl bg-white border-2 border-[#5A3A2A] pl-10 pr-4 text-sm text-cocoa placeholder-cocoa/40 focus:border-[#24456B] focus:outline-none shadow-[0_2.5px_0_#5A3A2A] font-semibold"
              />
            </div>

            {/* Type Filter Select Trigger */}
            <div className="relative flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
                className={`flex items-center justify-center gap-1.5 px-3.5 h-11 rounded-2xl border-2 border-[#5A3A2A] text-xs font-black uppercase transition shrink-0 select-none shadow-[0_2.5px_0_#5A3A2A] hover:bg-[#F2D5A7]/20 cursor-pointer active:translate-y-[1px] active:shadow-[0_1px_0_#5A3A2A] ${
                  selectedTypes.length > 0
                    ? "bg-[#FFD84D] text-[#24456B]"
                    : "bg-white text-cocoa"
                }`}
              >
                <span>
                  {language === "pl" ? "Typy" : "Types"}
                  {selectedTypes.length > 0 ? ` (${selectedTypes.length})` : ""}
                </span>
                <span className="text-[9px] opacity-80">▼</span>
              </button>

              {/* Clear button - instantly clears without opening the popover */}
              {selectedTypes.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedTypes([]);
                  }}
                  className="w-11 h-11 rounded-2xl bg-[#E95050] text-white hover:bg-[#D43D3D] flex items-center justify-center border-2 border-[#5A3A2A] shadow-[0_2.5px_0_#5A3A2A] cursor-pointer active:translate-y-[1px] active:shadow-[0_1px_0_#5A3A2A] transition-all"
                  title={language === "pl" ? "Wyczyść" : "Clear"}
                >
                  <span className="text-sm font-black">✕</span>
                </button>
              )}
            </div>
          </div>

          {/* Floating Dropdown Selector Panel */}
          {isTypeMenuOpen && (
            <>
              {/* Invisible full-bleed backdrop overlay to allow dismissing by clicking anywhere else */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsTypeMenuOpen(false)}
              />

              {/* Interactive Modal-Card */}
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#FFFDF9] border-2 border-[#5A3A2A] rounded-2xl p-3.5 shadow-[0_6px_0_#5A3A2A] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-black uppercase text-[#5A3A2A]/60 tracking-wider mb-2 pb-1 border-b border-[#5A3A2A]/15 flex justify-between items-center">
                  <span>{language === "pl" ? "Filtruj według typu" : "Filter by type"}</span>
                  <span className="font-mono text-[9px] lowercase text-[#5A3A2A]/40">({Object.keys(POKEMON_TYPES_PL).length})</span>
                </div>

                {/* Reset Option is styled nicely with high contrast */}
                <button
                  onClick={() => {
                    setSelectedTypes([]);
                  }}
                  className={`w-full mb-3 rounded-xl py-2 text-[10px] font-black uppercase transition border-2 border-[#5A3A2A] text-center cursor-pointer ${
                    selectedTypes.length === 0
                      ? "bg-white text-cocoa/40 border-[#5A3A2A]/40 cursor-not-allowed"
                      : "bg-[#E95050] text-white hover:bg-[#D43D3D] shadow-[0_2px_0_#5A3A2A]"
                  }`}
                  disabled={selectedTypes.length === 0}
                >
                  {language === "pl" ? "Wyczyść wszystkie" : "Clear all"}
                </button>

                {/* Highly structured 2-column scrollable grid of beautiful, color-coded badges */}
                <div className="grid grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-cocoa/30 scrollbar-track-transparent">
                  {Object.entries(POKEMON_TYPES_PL).map(([typeKey]) => {
                    const typeName = getTypeName(typeKey, language);
                    const typeBg = POKEMON_TYPES_PL[typeKey]?.bgHex || "#A9E6CF";
                    const isSelected = selectedTypes.includes(typeKey);

                    return (
                      <button
                        key={typeKey}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTypes(selectedTypes.filter((t) => t !== typeKey));
                          } else {
                            setSelectedTypes([...selectedTypes, typeKey]);
                          }
                        }}
                        className={`rounded-xl py-2 px-2.5 text-[10px] font-black uppercase transition border-2 border-[#5A3A2A] text-left flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#24456B] text-white shadow-[0_2px_0_#24456B]"
                            : "bg-white hover:bg-[#F2D5A7]/10 text-cocoa shadow-[0_2px_0_#5A3A2A]"
                        }`}
                      >
                        <span className="truncate">{typeName}</span>
                        <div className="flex items-center gap-1.5">
                          {isSelected && <span className="text-[#FFD84D] font-sans text-[10px] font-black">✓</span>}
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-[#5A3A2A]/20 shrink-0 shadow-sm"
                            style={{ backgroundColor: typeBg }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Confirm/Apply button */}
                <button
                  onClick={() => {
                    setIsTypeMenuOpen(false);
                  }}
                  className="w-full mt-3 rounded-xl py-2.5 text-[10px] font-black uppercase transition border-2 border-[#5A3A2A] bg-[#FFD84D] text-[#24456B] shadow-[0_2.5px_0_#24456B] text-center cursor-pointer hover:brightness-105 active:translate-y-[1px] active:shadow-[0_1.5px_0_#24456B]"
                >
                  {language === "pl" ? "Zatwierdź" : "Confirm"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Pokemon Grid Scrollable Wrapper */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-4">
          {/* Empty state (design 04a) — only when truly nothing collected and no filter active */}
          {seenSet.size === 0 && !searchTerm && selectedTypes.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#5A3A2A] bg-white p-5 text-center flex flex-col items-center gap-2 mt-2 shadow-[0_3px_0_#5A3A2A]">
              <div className="h-16 w-16 rounded-full bg-[#E95050]/15 border-2 border-dashed border-[#5A3A2A] flex items-center justify-center">
                <div className="font-mono font-black text-[10px] text-[#5A3A2A]/70">
                  0<span className="text-[#5A3A2A]/40">/151</span>
                </div>
              </div>
              <h3 className="font-display font-black text-base italic uppercase text-[#5A3A2A] leading-none mt-1">
                {t.dexEmptyTitle}
              </h3>
              <p className="text-[11px] text-[#5A3A2A]/85 font-bold leading-snug max-w-xs">
                {t.dexEmptyBody}
              </p>
              <button
                onClick={onClose}
                className="mt-2 w-full max-w-[300px] btn-core-berry py-3 flex items-center justify-center gap-1.5"
              >
                <span>📖</span>
                <span>{t.dexEmptyCta}</span>
              </button>
              <p className="text-[8px] font-black uppercase tracking-widest text-[#5A3A2A]/60 mt-1">
                {t.dexEmptyHint}
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* --- POKÉMON DETAIL CARD (design 09) --- */}
      {selectedPokeDetail && (() => {
        const primaryType = selectedPokeDetail.types[0] || "normal";
        const typeBgHex = POKEMON_TYPES_PL[primaryType]?.bgHex || "#FFD84D";
        const isPokeCaught = unlockedSet.has(selectedPokeDetail.id);
        const caughtTs = caughtAt[selectedPokeDetail.id];
        const caughtDate = caughtTs
          ? new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(caughtTs))
          : null;

        return (
          <div
            id="pokedex-detail-fullbleed"
            className="absolute inset-x-0 top-0 bottom-[68px] z-60 bg-[#FFF4DF] flex flex-col font-sans select-none overflow-hidden text-cocoa"
          >
            {/* Top bar — POKÉ THE FLOOR brand acting as the "home" affordance,
                mirroring the main app top bar (which the detail overlay covers).
                Back-to-list nav lives in the persistent yellow CTA at the bottom. */}
            <div className="shrink-0 h-12 border-b-2 border-[#5A3A2A] bg-[#FFF4DF] px-3 flex items-center z-10">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 active:scale-95 transition-all"
                title={t.cardBackToPokedex}
              >
                <div className="bg-[#1B2840] text-white font-black text-[11px] pl-1 pr-2.5 py-1 rounded-full tracking-tight uppercase italic border-2 border-[#1B2840] shadow-[0_2px_0_#5A3A2A] flex items-center gap-1.5">
                  <PokeBallLogoIcon size={16} ink="#1B2840" red="#DC2630" />
                  <span>POKÉ</span>
                </div>
                <span className="font-display font-black tracking-tight text-xs text-[#5A3A2A] uppercase italic">
                  THE FLOOR
                </span>
              </button>
            </div>

            {/* Main card */}
            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 z-10">
              <div className="rounded-3xl border-2 border-[#5A3A2A] bg-white shadow-[0_4px_0_#5A3A2A] overflow-hidden">

                {/* Card header — type-tinted gradient */}
                <div
                  className="px-4 py-3 border-b-2 border-[#5A3A2A] relative"
                  style={{
                    background: `linear-gradient(135deg, ${typeBgHex}E0 0%, ${typeBgHex} 100%)`
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-widest text-[#5A3A2A]/80">
                        #{String(selectedPokeDetail.id).padStart(3, "0")} · {t.cardCategoryPlaceholder}
                      </div>
                      <h2 className="font-display font-black text-2xl text-white tracking-tight uppercase italic leading-none mt-0.5 drop-shadow-[0_2px_0_rgba(90,58,42,0.5)]">
                        {selectedPokeDetail.name}
                      </h2>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {selectedPokeDetail.types.map((typeKey) => (
                        <span
                          key={typeKey}
                          className="px-2.5 py-0.5 text-[9px] font-black tracking-wider text-[#5A3A2A] uppercase rounded-full shadow-sm border-2 border-[#5A3A2A] text-center bg-white"
                        >
                          {getTypeName(typeKey, language)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image panel — sandy/cream background */}
                <div className="relative bg-[#FFF4DF] flex items-center justify-center py-4">
                  <img
                    src={getPokemonImageUrl(selectedPokeDetail.id)}
                    alt={selectedPokeDetail.name}
                    referrerPolicy="no-referrer"
                    className="object-contain"
                    style={{ height: "clamp(120px, 22vh, 180px)", filter: "drop-shadow(0 4px 8px rgba(90,58,42,0.25))" }}
                  />
                </div>

                {/* Stats row (design 09) — WZROST / WAGA / GEN. Height & weight
                    come from PokéAPI Gen 1 data merged into POKEMON_LIST. */}
                <div className="bg-white px-4 py-2 border-t-2 border-[#5A3A2A] grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/70">{t.cardHeight}</div>
                    <div className="font-mono font-black text-sm text-[#24456B]">{selectedPokeDetail.height.toFixed(1)} m</div>
                  </div>
                  <div className="border-x-2 border-[#5A3A2A]/20">
                    <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/70">{t.cardWeight}</div>
                    <div className="font-mono font-black text-sm text-[#24456B]">{selectedPokeDetail.weight.toFixed(1)} kg</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-wider text-[#5A3A2A]/70">{t.cardGen}</div>
                    <div className="font-mono font-black text-sm text-[#24456B]">{t.cardGenI}</div>
                  </div>
                </div>

                {/* Lore panel — dark navy */}
                <div className="bg-[#1B2840] text-white px-4 py-3 border-t-2 border-[#5A3A2A]">
                  <div className="text-[9px] font-black uppercase tracking-widest text-[#FFD84D] mb-1.5 flex items-center gap-1">
                    ● {t.pokedexDatabaseTitle}
                  </div>
                  <div className="text-[11px] leading-relaxed text-white/90 font-bold">
                    {getPokemonDescription(selectedPokeDetail.id, selectedPokeDetail.name, selectedPokeDetail.types, language)}
                  </div>
                </div>

                {/* Status pill row — matches the grid badge iconography:
                    caught = white pill with red Pokéball, seen = sky-blue
                    pill with eye. Different icons keep the catch/sight
                    states distinct, the white pill colour pairs with the
                    Pokéball canon without overloading the mint green that
                    we use elsewhere for success states. */}
                <div className="px-4 py-3 flex justify-center">
                  {isPokeCaught ? (
                    <span className="text-[#5A3A2A] font-black tracking-wider uppercase text-[10px] flex items-center gap-1.5 bg-white border-2 border-[#5A3A2A] px-3 py-1 rounded-full shadow-[0_2px_0_#5A3A2A]">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full overflow-hidden">
                        <PokeBallLogoIcon size={16} ink="#5A3A2A" red="#DC2630" />
                      </span>
                      {t.statusCaught}
                      {caughtDate && <> · {caughtDate}</>}
                    </span>
                  ) : (
                    <span className="text-[#5A3A2A] font-black tracking-wider uppercase text-[10px] flex items-center gap-1.5 bg-[#BDEBFF] border-2 border-[#5A3A2A] px-3 py-1 rounded-full shadow-[0_2px_0_#5A3A2A]">
                      <EyeIcon size={14} color="#24456B" strokeWidth={2.2} /> {t.statusSeen}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Persistent yellow CTA — only exit from the detail card per design. */}
            <div className="shrink-0 px-3 pt-2 pb-3 border-t-2 border-[#5A3A2A] bg-[#FFF4DF]">
              <button
                onClick={() => setSelectedPokeDetail(null)}
                className="w-full btn-core-yellow py-3 flex items-center justify-center gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                {t.cardBackToPokedex}
              </button>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
