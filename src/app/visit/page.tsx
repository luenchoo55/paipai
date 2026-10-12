import { VisitSession } from "@/components/visit/VisitSession";

/** 參拜模式：比其他頁更暗，不加光暈與導覽列，在廟裡使用不刺眼 */
export default function VisitPage() {
  return (
    <div className="min-h-svh bg-night text-night-text">
      <div className="mx-auto max-w-lg px-4 pt-[env(safe-area-inset-top)]">
        <VisitSession />
      </div>
    </div>
  );
}
