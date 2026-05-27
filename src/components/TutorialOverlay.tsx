import { ChevronRight } from "lucide-react";

interface TutorialOverlayProps {
  t: any;
  onDismiss: () => void;
}

/**
 * First-run tutorial overlay (design 11).
 *
 * Renders a darkened backdrop with three positional callouts pointing to the
 * key board UI: progress banner (top), an attackable tile (middle), and the
 * bottom 3-tab nav. Coordinates are approximate — they reference roughly
 * where the real elements sit on the viewport so the user can correlate.
 *
 * Persistence (the `the_floor_tutorial_seen` flag) is owned by the caller
 * — both CTAs simply invoke `onDismiss`, which writes the flag and unmounts.
 */
export default function TutorialOverlay({ t, onDismiss }: TutorialOverlayProps) {
  return (
    <div className="fixed inset-0 z-[80] bg-[#1B2840]/75 backdrop-blur-[2px] flex flex-col font-sans select-none text-cocoa">

      {/* Top "first time?" pill */}
      <div className="shrink-0 mt-20 px-4 flex justify-center">
        <div className="bg-[#FFD84D] border-2 border-[#5A3A2A] rounded-2xl px-3 py-1.5 shadow-[0_3px_0_#5A3A2A]">
          <span className="font-display font-black text-[11px] uppercase tracking-wider text-[#5A3A2A] italic">
            ✦ {t.tutFirstTimePill}
          </span>
        </div>
      </div>

      {/* Callout 1 — progress banner */}
      <div className="absolute top-[140px] left-3 right-3 max-w-[280px]">
        <div className="rounded-2xl border-2 border-[#5A3A2A] bg-white p-2.5 shadow-[0_3px_0_#5A3A2A] flex items-start gap-2">
          <div className="w-6 h-6 shrink-0 rounded-full bg-[#FFD84D] border-2 border-[#5A3A2A] text-[#5A3A2A] font-display font-black text-xs flex items-center justify-center">
            1
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-black text-[10px] uppercase tracking-tight text-[#5A3A2A]">{t.tutStep1Title}</div>
            <div className="text-[9px] text-[#5A3A2A]/85 font-bold leading-snug mt-0.5">{t.tutStep1Body}</div>
          </div>
        </div>
      </div>

      {/* Callout 2 — attackable tile (positioned mid-screen) */}
      <div className="absolute top-[330px] right-3 max-w-[260px]">
        <div className="rounded-2xl border-2 border-[#5A3A2A] bg-white p-2.5 shadow-[0_3px_0_#5A3A2A] flex items-start gap-2">
          <div className="w-6 h-6 shrink-0 rounded-full bg-[#FFD84D] border-2 border-[#5A3A2A] text-[#5A3A2A] font-display font-black text-xs flex items-center justify-center">
            2
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-black text-[10px] uppercase tracking-tight text-[#5A3A2A]">{t.tutStep2Title}</div>
            <div className="text-[9px] text-[#5A3A2A]/85 font-bold leading-snug mt-0.5">{t.tutStep2Body}</div>
          </div>
        </div>
      </div>

      {/* Spacer pushing bottom CTA above the bottom nav */}
      <div className="flex-1" />

      {/* Callout 3 — bottom nav */}
      <div className="shrink-0 bg-[#FFD84D] border-t-2 border-[#5A3A2A] px-3 py-3 flex items-center gap-3">
        <div className="w-7 h-7 shrink-0 rounded-full bg-[#1B2840] text-[#FFD84D] font-display font-black text-xs flex items-center justify-center border-2 border-[#5A3A2A]">
          3
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-black text-[11px] uppercase tracking-tight text-[#5A3A2A]">{t.tutStep3Title}</div>
          <div className="text-[9px] text-[#5A3A2A]/85 font-bold leading-snug mt-0.5">{t.tutStep3Body}</div>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 btn-core-berry py-2 px-3 flex items-center gap-1 text-[10px]"
        >
          <span>{t.tutStartBtn}</span>
          <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />
        </button>
      </div>

      {/* Skip link top-right */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-white/85 hover:text-white underline cursor-pointer"
      >
        {t.tutSkipLink}
      </button>
    </div>
  );
}
