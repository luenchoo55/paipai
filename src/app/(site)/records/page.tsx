import { RecordsView } from "@/components/records/RecordsView";
import { PageHeader } from "@/components/ui/PageHeader";

export default function RecordsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pt-10 sm:px-6">
      <PageHeader eyebrow="回家後" title="參拜紀錄" subtitle="每一次請示，都值得回頭看看。" />
      <RecordsView />
    </div>
  );
}
