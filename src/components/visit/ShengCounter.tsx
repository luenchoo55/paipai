import { REQUIRED_SHENG } from "@/lib/visit/throwLogic";

/** 連續聖筊計數：三個圓格依序點亮 */
export function ShengCounter({ count }: { count: number }) {
  const lit = Math.min(count, REQUIRED_SHENG);
  return (
    <div className="flex items-center justify-center gap-4" role="img" aria-label={`連續聖筊 ${lit} / ${REQUIRED_SHENG}`}>
      {Array.from({ length: REQUIRED_SHENG }, (_, i) => (
        <span
          key={i}
          className={`size-9 rounded-full border transition-all duration-300 ${
            i < lit
              ? "border-vermilion bg-vermilion shadow-[0_0_16px_4px_rgb(184_57_46/0.55)]"
              : "border-night-text/25 bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}
