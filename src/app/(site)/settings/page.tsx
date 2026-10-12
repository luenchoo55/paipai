import { SettingsView } from "@/components/settings/SettingsView";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pt-10 sm:px-6">
      <PageHeader eyebrow="個人" title="設定" subtitle="稟報資料、常用神明、提醒與資料備份。" />
      <SettingsView />
    </div>
  );
}
