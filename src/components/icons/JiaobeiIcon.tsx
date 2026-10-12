import type { ThrowResult } from "@/lib/types";

// 單片筊杯側面：平面朝上畫成上平下圓，凸面朝上畫成上圓下平（實心）
const flat = (x: number) => `M${x} 8 H${x + 18} A9 9 0 0 1 ${x} 8 Z`;
const convex = (x: number) => `M${x} 17 H${x + 18} A9 9 0 0 0 ${x} 17 Z`;

const faces: Record<ThrowResult, ["flat" | "convex", "flat" | "convex"]> = {
  sheng: ["flat", "convex"], // 一平一凸
  xiao: ["flat", "flat"], // 兩平
  yin: ["convex", "convex"], // 兩凸
};

export function JiaobeiIcon({ result, className = "" }: { result: ThrowResult; className?: string }) {
  return (
    <svg viewBox="0 0 44 22" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      {faces[result].map((face, i) => {
        const x = i === 0 ? 2 : 24;
        return face === "flat" ? (
          <path key={i} d={flat(x)} />
        ) : (
          <path key={i} d={convex(x)} fill="currentColor" fillOpacity="0.35" />
        );
      })}
    </svg>
  );
}
