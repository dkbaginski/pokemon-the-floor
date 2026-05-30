import { ChevronRight } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface TutorialOverlayProps {
  t: any;
  onDismiss: () => void;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Arrow {
  // SVG cubic-bezier path string + the endpoint to render the highlight ring at.
  path: string;
  ring: Rect | null;
}

const rectOf = (sel: string): Rect | null => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

// Smooth single-control quadratic from S→E. The control point is the midpoint
// pushed perpendicular to the S→E line by `bow` px, producing a gentle arc that
// lands cleanly on the target (no kink). The arrowhead at E auto-orients to the
// C→E tangent, so it always points into the target.
const curvePath = (sx: number, sy: number, ex: number, ey: number, bow: number): string => {
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
};

/**
 * First-run tutorial overlay (design 11).
 *
 * Renders a darkened backdrop with three positional callouts pointing to the
 * key board UI: progress banner (top), an attackable tile (middle), and the
 * bottom 3-tab nav. Two curved SVG arrows physically connect callout 1 → the
 * progress banner and callout 2 → an attackable tile (located at runtime via
 * `[data-tutorial-target]` + getBoundingClientRect), and a pulsing ring marks
 * the attackable tile. Callout 3 sits directly above the nav, so it needs no
 * arrow.
 *
 * Single exit: the bottom CTA (or the Esc key). The previous redundant
 * top-right "skip" link was removed — both did the same `onDismiss`.
 *
 * Persistence (the `the_floor_tutorial_seen` flag) is owned by the caller.
 */
export default function TutorialOverlay({ t, onDismiss }: TutorialOverlayProps) {
  const callout1Ref = useRef<HTMLDivElement>(null);
  const callout2Ref = useRef<HTMLDivElement>(null);
  const [arrow1, setArrow1] = useState<Arrow | null>(null);
  const [arrow2, setArrow2] = useState<Arrow | null>(null);

  // Esc also dismisses the tutorial.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  // Compute arrow paths from each callout to its real target. Recomputed on
  // resize so the arrows stay anchored if the viewport changes.
  useLayoutEffect(() => {
    const compute = () => {
      const progress = rectOf('[data-tutorial-target="progress"]');
      const attackable = rectOf('[data-tutorial-target="attackable"]');
      const c1 = callout1Ref.current?.getBoundingClientRect();
      const c2 = callout2Ref.current?.getBoundingClientRect();

      // Arrow 1: from callout 1's top edge (centre) up to the progress banner's
      // bottom-edge centre. Banner sits above the callout, arrowhead points up.
      if (progress && c1) {
        const sx = c1.left + c1.width * 0.5;
        const sy = c1.top - 2;
        const ex = progress.x + progress.w * 0.5;
        const ey = progress.y + progress.h + 4;
        setArrow1({ path: curvePath(sx, sy, ex, ey, 18), ring: progress });
      } else {
        setArrow1(null);
      }

      // Arrow 2: from callout 2's left edge (centre) down-left to the attackable
      // tile's top-edge centre. Tile sits below-left, arrowhead points down.
      if (attackable && c2) {
        const sx = c2.left - 2;
        const sy = c2.top + c2.height * 0.5;
        const ex = attackable.x + attackable.w * 0.5;
        const ey = attackable.y - 4;
        setArrow2({ path: curvePath(sx, sy, ex, ey, 22), ring: attackable });
      } else {
        setArrow2(null);
      }
    };

    // Defer one frame so the board behind the overlay has laid out.
    const raf = requestAnimationFrame(compute);
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[80] bg-[#1B2840]/75 backdrop-blur-[2px] flex flex-col font-sans select-none text-cocoa">

      {/* SVG arrow layer — sits above the dim backdrop, below the callouts.
          Pointer-events disabled so taps pass through to the bottom CTA. */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" aria-hidden="true">
        <defs>
          <marker id="tut-arrowhead" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="7" refY="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 L3 5 Z" fill="#FFD84D" stroke="#5A3A2A" strokeWidth="1" />
          </marker>
        </defs>
        {arrow1 && (
          <path d={arrow1.path} stroke="#FFD84D" strokeWidth="3" strokeDasharray="6 4" fill="none" strokeLinecap="round" markerEnd="url(#tut-arrowhead)" />
        )}
        {arrow2 && (
          <path d={arrow2.path} stroke="#FFD84D" strokeWidth="3" strokeDasharray="6 4" fill="none" strokeLinecap="round" markerEnd="url(#tut-arrowhead)" />
        )}
      </svg>

      {/* Pulsing rings around each highlighted target (design 11). */}
      {[arrow1?.ring, arrow2?.ring].map((ring, i) =>
        ring ? (
          <div
            key={i}
            className="absolute z-[1] rounded-xl border-2 border-[#FFD84D] animate-pulse pointer-events-none"
            style={{
              left: ring.x - 3,
              top: ring.y - 3,
              width: ring.w + 6,
              height: ring.h + 6
            }}
          />
        ) : null
      )}

      {/* Top "first time?" pill */}
      <div className="shrink-0 mt-20 px-4 flex justify-center relative z-[2]">
        <div className="bg-[#FFD84D] border-2 border-[#5A3A2A] rounded-2xl px-3 py-1.5 shadow-[0_3px_0_#5A3A2A]">
          <span className="font-display font-black text-[11px] uppercase tracking-wider text-[#5A3A2A] italic">
            ✦ {t.tutFirstTimePill}
          </span>
        </div>
      </div>

      {/* Callout 1 — progress banner. Sits in the gap below the banner so its
          arrow has room to point up at the banner without overlapping it. */}
      <div ref={callout1Ref} className="absolute top-[200px] left-3 right-3 max-w-[280px] z-[2]">
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
      <div ref={callout2Ref} className="absolute top-[330px] right-3 max-w-[260px] z-[2]">
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

      {/* Callout 3 — bottom nav. Sits directly above the nav, so no arrow. */}
      <div className="shrink-0 bg-[#FFD84D] border-t-2 border-[#5A3A2A] px-3 py-3 flex items-center gap-3 relative z-[2]">
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
    </div>
  );
}
