// Inline SVG icons lifted verbatim from the design HTMLs in
// `pokemon the floor-new-design/`. Kept as React components so we can tint
// them at call sites via the `color` prop (mapped to `stroke`).
//
// When adding a new icon: open the design HTML, locate the original <svg>,
// strip its `style="..."` and `data-om-id="..."` attributes, and paste the
// inner content here. Don't redraw — match the design's geometry exactly.

import { SVGProps, ReactNode } from "react";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// 02 board — bottom-nav "GRAJ". Stylised floor / parallelogram board with
// stripes and a single token dot in the bottom-left.
export function NavBoardIcon({ size = 22, color = "currentColor", strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      {...rest}
    >
      <path d="M4 6 L20 4.4 L20 18 L4 19.6 Z" />
      <path d="M4 10.5 L20 8.9 M4 15 L20 13.4" strokeWidth={1.3} opacity={0.55} />
      <path d="M9.3 5.5 L9.3 19.1 M14.7 4.9 L14.7 18.5" strokeWidth={1.3} opacity={0.55} />
      <circle cx="6.8" cy="17.2" r="1.2" fill={color} stroke="none" opacity={0.9} />
    </svg>
  );
}

// 02 bottom-nav "POKÉDEX" — handheld device with lens, three indicator dots,
// and a screen showing two text lines.
export function NavPokedexIcon({ size = 22, color = "currentColor", strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      {...rest}
    >
      <path d="M5 3 H18 a2 2 0 0 1 2 2 V19 a2 2 0 0 1-2 2 H5 a2 2 0 0 1-2-2 V14 l1.4 -.8 L3 12.4 V5 a2 2 0 0 1 2-2 Z" />
      <circle cx="8.4" cy="8" r="2.6" />
      <circle cx="8.4" cy="8" r="0.8" fill={color} stroke="none" />
      <circle cx="13.2" cy="6.3" r="0.8" fill={color} stroke="none" />
      <circle cx="15.4" cy="6.3" r="0.8" />
      <circle cx="17.6" cy="6.3" r="0.8" />
      <rect x="6" y="13" width="12" height="5.6" rx="1" />
      <path d="M8 15.3 H14" strokeWidth={1.3} opacity={0.75} />
      <path d="M8 17 H12" strokeWidth={1.3} opacity={0.55} />
    </svg>
  );
}

// 02 bottom-nav "POMOC" — speech-bubble with tail and a question mark inside.
export function NavHelpIcon({ size = 20, color = "currentColor", strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M5 4 H19 a2 2 0 0 1 2 2 V15 a2 2 0 0 1-2 2 H13 L8.5 20.5 V17 H5 a2 2 0 0 1-2-2 V6 a2 2 0 0 1 2-2 Z" />
      <path d="M9.6 9 a2.4 2.4 0 1 1 4.2 1.6 c-.85 .85 -1.8 1.3 -1.8 2.2" />
      <circle cx="12" cy="14.8" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

// 02 header — POKÉ-brand poké ball used inside the logo pill. Multi-colour
// (fixed red/white/ink) so it ignores `color` and just respects `size`.
export function PokeBallLogoIcon({ size = 14, ink = "#0F1024", red = "#DC2630", ...rest }: { size?: number; ink?: string; red?: string } & Omit<SVGProps<SVGSVGElement>, "color">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      {...rest}
    >
      <circle cx="8" cy="8" r="7" fill="#fff" stroke={ink} strokeWidth={1.5} />
      <path d="M1 8a7 7 0 0 1 14 0h-4.5a2.5 2.5 0 0 0-5 0H1Z" fill={red} stroke={ink} strokeWidth={1.5} />
      <circle cx="8" cy="8" r="2" fill="#fff" stroke={ink} strokeWidth={1.5} />
    </svg>
  );
}

// 02 header — globe used by the PL/EN language switch.
export function GlobeIcon({ size = 14, color = "currentColor", strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
    </svg>
  );
}

// 02 header — LOGI / battle-history. Clock with rewind arrow.
export function ClockRewindIcon({ size = 14, color = "currentColor", strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// 02 header — RESET / replay arrow (same circle+arrow head as LOGI, no clock hands).
export function ResetIcon({ size = 14, color = "currentColor", strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

// 02 banner — atlas/map-spread icon used next to "PODBÓJ KANTO".
export function MapAtlasIcon({ size = 14, color = "currentColor", strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      {...rest}
    >
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

// 02 banner — crossed swords with rivet caps. Used inside the "× N ATAKI"
// pill and (smaller) on the red attack badge sitting on adjacent tiles.
export function SwordsCrossedIcon({ size = 14, color = "currentColor", strokeWidth = 2.2, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <line x1="5" y1="4" x2="20" y2="19" />
      <line x1="19" y1="4" x2="4" y2="19" />
      <line x1="2.5" y1="17" x2="6.5" y2="21" />
      <line x1="21.5" y1="17" x2="17.5" y2="21" />
      <circle cx="3" cy="21" r="1.2" fill={color} stroke="none" />
      <circle cx="21" cy="21" r="1.2" fill={color} stroke="none" />
    </svg>
  );
}

// 02 tile — padlock used on tiles that are out of attack range.
export function PadlockIcon({ size = 10, color = "currentColor", strokeWidth = 2.5, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

// 04 Pokédex — eye outline used on cards that are only "seen" (sighted but
// not yet caught).
export function EyeIcon({ size = 12, color = "currentColor", strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// 04 Pokédex — circular progress ring. Renders the design's stamped-paper
// ring with a track + yellow arc + inner white disc that holds whatever
// children the caller passes (typically a number + label). Geometry matches
// the 36-unit viewBox in the design (`r=15` track, `r=11` inner hole) so the
// visual weight stays consistent regardless of `size`.
//
// `value` and `max` express the arc fill (e.g. value=18, max=151 → ~12% arc).
// Clamped to [0, max] to avoid the arc wrapping around past 100%.
interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  trackColor?: string;
  arcColor?: string;
  faceColor?: string;
  borderColor?: string;
  className?: string;
  children?: ReactNode;
}

export function ProgressRing({
  value,
  max,
  size = 64,
  trackColor = "rgba(15,16,36,0.20)",
  arcColor = "#FFD84D",
  faceColor = "#FFFFFF",
  borderColor = "#1B2840",
  className,
  children,
}: ProgressRingProps) {
  const r = 15;
  const circumference = 2 * Math.PI * r;
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const dashLen = pct * circumference;
  // Pattern "dashLen 100" mirrors the design HTML — only the first segment
  // is rendered, with a large gap that effectively hides the rest.
  return (
    <div className={`relative inline-flex items-center justify-center ${className ?? ""}`} style={{ width: size, height: size }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 36 36"
        width={size}
        height={size}
        aria-hidden
      >
        <circle cx="18" cy="18" r={r} fill="none" stroke={trackColor} strokeWidth={4} />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={arcColor}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${dashLen} ${circumference}`}
          transform="rotate(-90 18 18)"
        />
        <circle cx="18" cy="18" r={11} fill={faceColor} stroke={borderColor} strokeWidth={1.5} />
      </svg>
      {/* Children render centred inside the inner disc */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {children}
      </div>
    </div>
  );
}

// 04 Pokédex — search magnifier used in the search input.
export function SearchIcon({ size = 14, color = "currentColor", strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
