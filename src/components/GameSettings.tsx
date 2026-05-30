import React, { useState, useEffect, useRef } from "react";
import { audio } from "../lib/audio";
import { getPokemonImageUrl } from "../pokemonData";
import { 
  Volume2, 
  VolumeX, 
  Music, 
  X, 
  Volume1, 
  User, 
  Globe, 
  Copy, 
  Check, 
  Edit3,
  History,
  RefreshCw,
  ChevronDown
} from "lucide-react";

// The same rosters from App.tsx
const PLAYER_ROSTER = [
  { id: 25, name: "Pikachu", bg: "#FFD84D" },
  { id: 1, name: "Bulbasaur", bg: "#A9E6CF" },
  { id: 4, name: "Charmander", bg: "#FF7A62" },
  { id: 7, name: "Squirtle", bg: "#BDEBFF" },
  { id: 133, name: "Eevee", bg: "#F2D5A7" },
  { id: 39, name: "Jigglypuff", bg: "#FFC7DA" },
];

interface GameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  language: "pl" | "en";
  onChangeLanguage: (lang: "pl" | "en") => void;
  playerName: string;
  onSavePlayerName: (name: string) => void;
  playerAvatarId: number;
  onSavePlayerAvatar: (id: number) => void;
  onShowBattleLogs: () => void;
  onTriggerReset: () => void;
}

export default function GameSettings({
  isOpen,
  onClose,
  language,
  onChangeLanguage,
  playerName,
  onSavePlayerName,
  playerAvatarId,
  onSavePlayerAvatar,
  onShowBattleLogs,
  onTriggerReset,
}: GameSettingsProps) {
  // Local active states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(playerName || "TY");
  const [selectedAvatarId, setSelectedAvatarId] = useState(playerAvatarId);
  const [copiedId, setCopiedId] = useState(false);

  // Audio Manager values
  const [mutedAll, setMutedAll] = useState(audio.getMuted());
  const [musicMuted, setMusicMuted] = useState(audio.getMusicMuted());
  const [sfxMuted, setSfxMuted] = useState(audio.getSfxMuted());
  const [musicVol, setMusicVol] = useState(audio.getMusicVolume());
  const [sfxVol, setSfxVol] = useState(audio.getSfxVolume());
  const [silenceDuel, setSilenceDuel] = useState(audio.getSilenceDuelMusic());

  // Support ID generated once based on name
  const [supportId] = useState(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let seed = "";
    for (let i = 0; i < 10; i++) {
      if (i === 4) seed += "-";
      seed += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return seed;
  });

  // Keep internal states synced when settings open up
  useEffect(() => {
    if (isOpen) {
      setProfileName(playerName || "TY");
      setSelectedAvatarId(playerAvatarId);
      setIsEditingProfile(false);

      setMutedAll(audio.getMuted());
      setMusicMuted(audio.getMusicMuted());
      setSfxMuted(audio.getSfxMuted());
      setMusicVol(audio.getMusicVolume());
      setSfxVol(audio.getSfxVolume());
      setSilenceDuel(audio.getSilenceDuelMusic());
    }
  }, [isOpen, playerName, playerAvatarId]);

  if (!isOpen) return null;

  // Sound Handler triggers
  const handleToggleMuteAll = () => {
    audio.playSFX("click");
    const nextVal = !mutedAll;
    setMutedAll(nextVal);
    audio.setMute(nextVal);
  };

  const handleToggleMusicMute = () => {
    audio.playSFX("click");
    const nextVal = !musicMuted;
    setMusicMuted(nextVal);
    audio.setMusicMuted(nextVal);
  };

  const handleToggleSfxMute = () => {
    const nextVal = !sfxMuted;
    setSfxMuted(nextVal);
    audio.setSfxMuted(nextVal);
    // Play a buzzer or click feedback upon turning it back on!
    if (!nextVal) {
      audio.playSFX("click");
    }
  };

  const handleMusicSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVol(vol);
    audio.setMusicVolume(vol);
  };

  const handleSfxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSfxVol(vol);
    audio.setSfxVolume(vol);
  };

  const handleSfxRelease = () => {
    audio.playSFX("click");
  };

  const handleToggleSilenceDuel = () => {
    audio.playSFX("click");
    const nextVal = !silenceDuel;
    setSilenceDuel(nextVal);
    audio.setSilenceDuelMusic(nextVal);
  };

  // Support ID Clipboard Copy
  const handleCopySupportId = () => {
    audio.playSFX("click");
    navigator.clipboard.writeText(supportId).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  };

  // Profile Save
  const handleSaveProfile = () => {
    audio.playSFX("click");
    if (profileName.trim()) {
      onSavePlayerName(profileName.trim());
    }
    onSavePlayerAvatar(selectedAvatarId);
    setIsEditingProfile(false);
  };

  // Translation sets for fully localized interface
  const t = {
    settingsTitle: language === "pl" ? "USTAWIENIA GRY" : "GAME SETTINGS",
    supportIdLabel: language === "pl" ? "ID Wsparcia" : "Support ID",
    copied: language === "pl" ? "Skopiowano!" : "Copied!",
    trainerCardLabel: language === "pl" ? "KARTA TRENERA" : "TRAINER CARD",
    editBtn: language === "pl" ? "Edytuj profil" : "Edit Profile",
    saveBtn: language === "pl" ? "Zapisz profil" : "Save Profile",
    nameLabel: language === "pl" ? "Imię Trenera" : "Trainer Name",
    avatarPickLabel: language === "pl" ? "Wybierz Pokémona-partnera" : "Select Partner Pokémon",
    audioTitle: language === "pl" ? "DŹWIĘK & MUZYKA" : "AUDIO & SOUNDS",
    masterMuteToggle: language === "pl" ? "Wycisz całkowicie" : "Global Mute",
    musicQuickMute: language === "pl" ? "Muzyka w tle" : "Background Music",
    sfxQuickMute: language === "pl" ? "Efekty dźwiękowe" : "Sound Effects",
    mutedText: language === "pl" ? "WYCISZONA" : "MUTED",
    onText: language === "pl" ? "WŁĄCZONA" : "ACTIVE",
    silenceDuelLabel: language === "pl" ? "Wycisz muzykę w pojedynkach" : "Silence music during duels",
    silenceDuelDesc: language === "pl" ? "Przydatne, gdy grasz ze sterowaniem głosowym." : "Helps with smooth voice speech recognition.",
    generalTitle: language === "pl" ? "OPCJE OGÓLNE" : "GENERAL OPTIONS",
    langLabel: language === "pl" ? "Język gry" : "Game Language",
    logsLabel: language === "pl" ? "Historia i Statystyki" : "Battle Logs & Stats",
    logsBtn: language === "pl" ? "ZOBACZ LOGI WALKI" : "VIEW BATTLE LOGS",
    resetLabel: language === "pl" ? "Reset postępów" : "Reset Progress",
    resetBtn: language === "pl" ? "RESETUJ ROZGRYWKĘ" : "RESET GAME",
    returnBtn: language === "pl" ? "POWRÓT DO GRY" : "RETURN TO GAME",
  };

  const partnerPoke = PLAYER_ROSTER.find(p => p.id === selectedAvatarId) || PLAYER_ROSTER[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred overlay background */}
      <div 
        className="absolute inset-0 bg-black/55 backdrop-blur-[3.5px]"
        onClick={onClose}
      />

      {/* Settings Dialog Drawer Frame - fits inside mobile container perfectly */}
      <div className="relative w-full max-w-[420px] max-h-[90vh] bg-[#FFFBF4] border-4 border-[#5A3A2A] rounded-[32px] shadow-[0_8px_0_#5A3A2A] z-10 flex flex-col overflow-hidden text-[#5A3A2A] font-sans">
        
        {/* Rounded Top Ribbon */}
        <div className="shrink-0 bg-[#FFD84D] border-b-4 border-[#5A3A2A] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-sm uppercase italic tracking-wider">
              {t.settingsTitle}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white hover:bg-red-50 border-2 border-[#5A3A2A] transition active:scale-95 flex items-center justify-center cursor-pointer shadow-[0_2px_0_#5A3A2A]"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable central sections body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 select-none" style={{ scrollbarWidth: "none" }}>
          
          {/* Support ID strip */}
          <div className="bg-white/80 border-2 border-[#5A3A2A]/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-[10px] font-bold">
            <span className="opacity-70">{t.supportIdLabel}: <strong className="font-mono">{supportId}</strong></span>
            <button 
              onClick={handleCopySupportId}
              className="flex items-center gap-1.5 text-[#5A3A2A] bg-white hover:bg-[#FFEED4] border-2 border-[#5A3A2A] px-2.5 py-0.5 rounded-lg active:scale-95 text-[9px] font-black cursor-pointer shadow-[0_2px_0_#5A3A2A]"
            >
              {copiedId ? <Check size={10} strokeWidth={3} /> : <Copy size={10} strokeWidth={2.5} />}
              <span>{copiedId ? t.copied : (language === "pl" ? "KOPIUJ" : "COPY")}</span>
            </button>
          </div>

          {/* 1. TRAINER PROFILE CONTAINER (TCG POCKET STYLE) */}
          <div className="bg-white border-3 border-[#5A3A2A] rounded-2xl p-3.5 shadow-[0_3px_0_#5A3A2A] space-y-3 relative overflow-hidden">
            <span className="absolute right-3 top-2 bg-[#2D4E72]/10 text-[#24456B] text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full">
              {t.trainerCardLabel}
            </span>

            {!isEditingProfile ? (
              // Saved Profile View
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl border-3 border-[#5A3A2A] flex items-center justify-center relative shadow-[0_3px_0_#5A3A2A] flex-shrink-0"
                  style={{ backgroundColor: partnerPoke.bg }}
                >
                  <img 
                    src={getPokemonImageUrl(partnerPoke.id)} 
                    alt={partnerPoke.name} 
                    className="w-12 h-12 object-contain filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black uppercase tracking-tight text-[#5A3A2A]/90 leading-tight">
                    {playerName || "TY"}
                  </h3>
                  <button
                    onClick={() => {
                      audio.playSFX("click");
                      setIsEditingProfile(true);
                    }}
                    className="mt-2.5 flex items-center gap-1 text-xs font-black text-[#5A3A2A] hover:text-[#24456B] transition cursor-pointer"
                  >
                    <Edit3 size={12} strokeWidth={2.5} />
                    <span className="border-b border-[#5A3A2A] leading-none">{t.editBtn}</span>
                  </button>
                </div>
              </div>
            ) : (
              // Edytuj profil view
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest block text-[#5A3A2A]/60">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value.slice(0, 12))}
                    placeholder="E.g. Ash"
                    className="w-full bg-[#FFEED4] border-2 border-[#5A3A2A] rounded-xl px-3 py-2 text-xs font-bold text-[#5A3A2A] outline-none shadow-[inner_0_2px_4px_rgba(0,0,0,0.06)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest block text-[#5A3A2A]/60">
                    {t.avatarPickLabel}
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {PLAYER_ROSTER.map((p) => {
                      const isSelected = p.id === selectedAvatarId;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            audio.playSFX("click");
                            setSelectedAvatarId(p.id);
                          }}
                          className={`aspect-square rounded-xl border-2 flex items-center justify-center relative cursor-pointer transition ${
                            isSelected 
                              ? "bg-amber-100 border-[#5A3A2A] shadow-[0_2px_0_#5A3A2A] scale-105 z-10" 
                              : "bg-white/60 border-transparent opacity-60 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: isSelected ? p.bg : undefined }}
                        >
                          <img 
                            src={getPokemonImageUrl(p.id)} 
                            alt={p.name} 
                            className="w-8 h-8 object-contain"
                            referrerPolicy="no-referrer"
                          />
                          {isSelected && (
                            <span className="absolute -bottom-1 -right-1 bg-[#A9E6CF] border border-[#5A3A2A] rounded-full p-0.5 flex items-center justify-center">
                              <Check size={8} strokeWidth={4} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 rounded-xl bg-[#FFD84D] hover:bg-[#FFE26A] text-[#1B2840] border-2 border-[#5A3A2A] py-1.5 text-xs font-black uppercase cursor-pointer transition shadow-[0_2px_0_#5A3A2A] active:translate-y-0.5 active:shadow-none"
                  >
                    {t.saveBtn}
                  </button>
                  <button
                    onClick={() => {
                      audio.playSFX("click");
                      setIsEditingProfile(false);
                      setProfileName(playerName || "TY");
                      setSelectedAvatarId(playerAvatarId);
                    }}
                    className="px-4 rounded-xl bg-white hover:bg-[#FFF4DF] text-[#5A3A2A] border-2 border-[#5A3A2A] py-1.5 text-xs font-black uppercase cursor-pointer transition shadow-[0_2px_0_#5A3A2A] active:translate-y-0.5 active:shadow-none"
                  >
                    {language === "pl" ? "ANULUJ" : "CANCEL"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. AUDIO & CONSOLE GROUP */}
          <div className="bg-white border-3 border-[#5A3A2A] rounded-2xl p-3.5 shadow-[0_3px_0_#5A3A2A] space-y-3.5">
            <div className="flex items-center gap-1.5 border-b border-[#5A3A2A]/10 pb-1.5">
              <span className="text-xs font-black uppercase tracking-wider">{t.audioTitle}</span>
            </div>

            {/* A. Global Master Switch */}
            <div className="flex items-center justify-between bg-cream-base/35 p-2 rounded-xl border border-[#5A3A2A]/10">
              <div className="flex items-center gap-2">
                {mutedAll ? <VolumeX size={15} color="#E95050" /> : <Volume2 size={15} color="#5A3A2A" />}
                <span className="text-xs font-bold">{t.masterMuteToggle}</span>
              </div>
              <button
                onClick={handleToggleMuteAll}
                className={`relative w-12 h-6 flex items-center rounded-full border-2 border-[#5A3A2A] transition duration-200 cursor-pointer ${
                  mutedAll ? "bg-[#FFE3DE]" : "bg-[#FFD84D]"
                }`}
              >
                <span 
                  className={`absolute w-4.5 h-4.5 bg-white border border-[#5A3A2A] rounded-full transition transform ${
                    mutedAll ? "translate-x-1" : "translate-x-6"
                  }`}
                />
              </button>
            </div>

            <div className={`space-y-3 transition-opacity duration-200 ${mutedAll ? "opacity-35 pointer-events-none" : "opacity-100"}`}>
              {/* B. Discrete Music Switch & Slider (Requested Mute discrete option!) */}
              <div className="bg-amber-50/20 border-2 border-[#5A3A2A]/20 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <Music size={13} />
                    <span>{t.musicQuickMute}</span>
                  </div>
                  <button
                    onClick={handleToggleMusicMute}
                    className={`px-2 py-0.5 rounded border border-[#5A3A2A] text-[9px] font-black tracking-wider uppercase cursor-pointer transition ${
                      musicMuted 
                        ? "bg-[#FFE3DE] text-[#E95050]" 
                        : "bg-white text-[#5A3A2A] hover:bg-[#FFF4DF]"
                    }`}
                  >
                    {musicMuted ? t.mutedText : t.onText}
                  </button>
                </div>
                {!musicMuted && (
                  <div className="flex items-center gap-2">
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={musicVol}
                      onChange={handleMusicSliderChange}
                      className="w-full h-2 rounded-lg bg-[#FFEED4] accent-[#5A3A2A] cursor-pointer"
                    />
                    <span className="font-mono text-[9px] font-bold w-7 text-right">
                      {Math.round(musicVol * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* C. Discrete SFX Switch & Slider (Requested Mute discrete option!) */}
              <div className="bg-amber-50/20 border-2 border-[#5A3A2A]/20 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <Volume1 size={13} />
                    <span>{t.sfxQuickMute}</span>
                  </div>
                  <button
                    onClick={handleToggleSfxMute}
                    className={`px-2 py-0.5 rounded border border-[#5A3A2A] text-[9px] font-black tracking-wider uppercase cursor-pointer transition ${
                      sfxMuted 
                        ? "bg-[#FFE3DE] text-[#E95050]" 
                        : "bg-white text-[#5A3A2A] hover:bg-[#FFF4DF]"
                    }`}
                  >
                    {sfxMuted ? t.mutedText : t.onText}
                  </button>
                </div>
                {!sfxMuted && (
                  <div className="flex items-center gap-2">
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={sfxVol}
                      onChange={handleSfxSliderChange}
                      onMouseUp={handleSfxRelease}
                      onTouchEnd={handleSfxRelease}
                      className="w-full h-2 rounded-lg bg-[#FFEED4] accent-[#5A3A2A] cursor-pointer"
                    />
                    <span className="font-mono text-[9px] font-bold w-7 text-right">
                      {Math.round(sfxVol * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* D. Duel Silence Toggle */}
              <div 
                onClick={handleToggleSilenceDuel}
                className="flex items-center gap-2.5 cursor-pointer p-1.5 hover:bg-gray-50/50 rounded-lg active:scale-[0.98] transition border border-dashed border-[#5A3A2A]/10 text-left"
              >
                <input 
                  type="checkbox" 
                  checked={silenceDuel} 
                  onChange={() => {}} // Swapped via div click
                  className="w-3.5 h-3.5 accent-[#5A3A2A] cursor-pointer shrink-0"
                />
                <div className="leading-tight">
                  <div className="text-[11px] font-bold">{t.silenceDuelLabel}</div>
                  <div className="text-[8px] opacity-60 mt-0.5 font-bold">{t.silenceDuelDesc}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. GENERAL SETTINGS */}
          <div className="bg-white border-3 border-[#5A3A2A] rounded-2xl p-3.5 shadow-[0_3px_0_#5A3A2A] space-y-3">
            <div className="flex items-center gap-1.5 border-b border-[#5A3A2A]/10 pb-1.5">
              <span className="text-xs font-black uppercase tracking-wider">{t.generalTitle}</span>
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between text-xs font-bold py-1">
              <div className="flex items-center gap-2">
                <Globe size={14} />
                <span>{t.langLabel}</span>
              </div>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => {
                    audio.playSFX("click");
                    onChangeLanguage(e.target.value as "pl" | "en");
                  }}
                  aria-label={t.langLabel}
                  className="appearance-none h-8 pl-3 pr-7 rounded-xl bg-white border-2 border-[#5A3A2A] hover:bg-[#FFF4DF] text-[11px] font-black tracking-wider transition cursor-pointer text-[#5A3A2A] shadow-[0_2px_0_#5A3A2A] outline-none"
                >
                  <option value="pl">Polski (PL)</option>
                  <option value="en">English (EN)</option>
                </select>
                <ChevronDown
                  size={13}
                  strokeWidth={2.5}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#5A3A2A]"
                />
              </div>
            </div>

            {/* Reset progressive game */}
            <div className="flex items-center justify-between text-xs font-bold py-1 border-t border-[#5A3A2A]/10 pt-3">
              <div className="flex flex-col">
                <span>{t.resetLabel}</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onTriggerReset();
                }}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#FFE1E1] hover:bg-[#FFC0C0] text-[9.5px] font-black transition cursor-pointer text-red-700 border-2 border-[#5A3A2A] shadow-[0_2px_0_#5A3A2A] active:translate-y-0.5 active:shadow-none"
              >
                <RefreshCw size={11} strokeWidth={2.5} />
                <span>{language === "pl" ? "RESET GRY" : "RESET GAME"}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom footer bar - hovering solid block back to game */}
        <div className="shrink-0 bg-[#FFFBF4] border-t-2 border-[#5A3A2A] px-5 py-4">
          <button 
            onClick={onClose}
            className="w-full btn-core-yellow py-3.5 text-xs font-sans tracking-widest font-black uppercase text-[#1B2840]"
          >
            {t.returnBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
