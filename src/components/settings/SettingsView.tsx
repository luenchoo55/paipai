"use client";

import { useState } from "react";
import { useDeities, usePreferences, useProfile } from "@/lib/db/hooks";
import { DataTransfer } from "./DataTransfer";
import { DeityManager } from "./DeityManager";
import { ProfileForm } from "./ProfileForm";
import { ReminderToggles } from "./ReminderToggles";
import { SettingsSection } from "./SettingsSection";

export function SettingsView() {
  const profile = useProfile();
  const deities = useDeities();
  const prefs = usePreferences();
  const [profileSaved, setProfileSaved] = useState(false);

  if (!profile || !deities || !prefs) {
    return <div aria-busy className="h-60 animate-pulse rounded-frame bg-surface" />;
  }

  return (
    <div className="space-y-6">
      <SettingsSection id="profile-heading" title="稟報資料" description="參拜模式的稟報內容會自動帶入；沒填的地方會以 [方括號] 留空。">
        <ProfileForm
          key={JSON.stringify(profile)}
          initial={profile}
          saved={profileSaved}
          onSavedChange={setProfileSaved}
        />
      </SettingsSection>

      <SettingsSection id="deity-heading" title="常用神明" description="新增問題時可以選的神明。內建神明不能刪除。">
        <DeityManager deities={deities} />
      </SettingsSection>

      <SettingsSection id="reminder-heading" title="提醒">
        <ReminderToggles prefs={prefs} />
      </SettingsSection>

      <SettingsSection id="data-heading" title="資料備份" description="匯出成 JSON 檔，或從備份檔還原。">
        <DataTransfer />
      </SettingsSection>
    </div>
  );
}
