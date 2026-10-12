/** 連續聖筊計數：需要幾個就顯示幾格，聖筊時依序點亮 */
export function ShengCounter({ count, required }: { count: number; required: number }) {
  const lit = Math.min(count, required);
  return (
    <div className="flex items-center justify-center gap-4" role="img" aria-label={`連續聖筊 ${lit} / ${required}`}>
      {Array.from({ length: required }, (_, i) => (
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
