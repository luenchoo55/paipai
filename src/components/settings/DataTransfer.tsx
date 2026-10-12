"use client";

import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { type Backup, InvalidBackupError, backupFileName, exportBackup, importBackup, parseBackup } from "@/lib/backup";

type ImportState =
  | { step: "idle" }
  | { step: "confirm"; backup: Backup; fileName: string }
  | { step: "done"; summary: string };

/** JSON 匯出匯入；匯入會取代目前所有資料，先顯示檔案內容讓使用者確認 */
export function DataTransfer() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ImportState>({ step: "idle" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    setError("");
    try {
      const backup = await exportBackup();
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = backupFileName();
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("匯出失敗，請再試一次");
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file: File) {
    setError("");
    setState({ step: "idle" });
    try {
      setState({ step: "confirm", backup: parseBackup(await file.text()), fileName: file.name });
    } catch (err) {
      setError(err instanceof InvalidBackupError ? err.message : "讀取檔案失敗");
    }
  }

  async function confirmImport(backup: Backup) {
    setBusy(true);
    try {
      await importBackup(backup);
      setState({
        step: "done",
        summary: `已匯入 ${backup.questions.length} 個問題、${backup.visits.length} 次參拜紀錄、${backup.vows.length} 個還願承諾。`,
      });
    } catch {
      setError("匯入失敗，目前的資料沒有變動");
      setState({ step: "idle" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleExport} disabled={busy}>
          <Download size={18} strokeWidth={1.5} aria-hidden />
          匯出備份
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Upload size={18} strokeWidth={1.5} aria-hidden />
          從備份匯入
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleFile(file);
          }}
        />
      </div>

      {state.step === "confirm" && (
        <div role="alertdialog" aria-labelledby="import-confirm" className="rounded-frame border border-gold/60 bg-vermilion-soft/40 p-4">
          <p id="import-confirm" className="font-medium">
            匯入「{state.fileName}」會<strong className="text-gold-bright">取代目前所有資料</strong>。
          </p>
          <p className="mt-1 text-sm text-muted">
            檔案內有 {state.backup.questions.length} 個問題、{state.backup.visits.length} 次參拜紀錄、
            {state.backup.vows.length} 個還願承諾（備份於 {new Date(state.backup.exportedAt).toLocaleDateString("zh-TW")}）。
            建議先匯出一份目前的資料。
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setState({ step: "idle" })}>
              取消
            </Button>
            <Button onClick={() => confirmImport(state.backup)} disabled={busy}>
              確定取代並匯入
            </Button>
          </div>
        </div>
      )}

      {state.step === "done" && (
        <p role="status" className="text-sm text-gold">
          {state.summary}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-gold-bright">
          {error}
        </p>
      )}
      <p className="text-sm leading-relaxed text-muted">
        資料只存在這個瀏覽器裡。換手機、清除瀏覽器資料之前，記得先匯出備份；籤詩照片也會一起存進檔案。
      </p>
    </div>
  );
}
