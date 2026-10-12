"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, TextArea, TextInput, chipClass } from "@/components/ui/Field";
import { addDeity, addQuestion, removeQuestion, updateQuestion } from "@/lib/db/repo";
import type { Deity, Question } from "@/lib/types";

/**
 * 新增或編輯問題。父層用 key 讓每次開啟都重新掛載，表單狀態自然歸零。
 */
export function QuestionDialog({
  open,
  onClose,
  deities,
  question,
  defaultDeityId,
}: {
  open: boolean;
  onClose: () => void;
  deities: Deity[];
  question?: Question;
  defaultDeityId?: string;
}) {
  const editing = Boolean(question);
  const [deityId, setDeityId] = useState(question?.deityId ?? defaultDeityId ?? deities[0]?.id ?? "");
  const [text, setText] = useState(question?.text ?? "");
  const [note, setNote] = useState(question?.note ?? "");
  const [customName, setCustomName] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const custom = deityId === "__custom";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (custom && !customName.trim()) return setError("請輸入神明名稱");
    if (!text.trim()) return setError("請輸入想問的事");

    setSaving(true);
    try {
      const targetDeityId = custom ? (await addDeity(customName, customDomain || "自訂")).id : deityId;
      const fields = { deityId: targetDeityId, text: text.trim(), note: note.trim() || undefined };
      if (question) await updateQuestion(question.id, fields);
      else await addQuestion(fields);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!question) return;
    if (!confirmDelete) return setConfirmDelete(true);
    await removeQuestion(question.id);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={editing ? "編輯問題" : "新增問題"}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-medium tracking-wider text-gold">向哪位神明請示</legend>
          <div className="flex flex-wrap gap-2">
            {deities.map((d) => (
              <label key={d.id} className={chipClass}>
                <input
                  type="radio"
                  name="deity"
                  value={d.id}
                  checked={deityId === d.id}
                  onChange={() => setDeityId(d.id)}
                  className="sr-only"
                />
                {d.name}
              </label>
            ))}
            <label className={chipClass}>
              <input
                type="radio"
                name="deity"
                value="__custom"
                checked={custom}
                onChange={() => setDeityId("__custom")}
                className="sr-only"
              />
              <Plus size={16} strokeWidth={1.5} className="mr-1" aria-hidden />
              其他神明
            </label>
          </div>
        </fieldset>

        {custom && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="神明名稱">
              <TextInput value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="例如：清水祖師" />
            </Field>
            <Field label="主掌" hint="選填">
              <TextInput value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="例如：平安" />
            </Field>
          </div>
        )}

        <Field label="想問的事">
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如：弟子今年下半年換工作，是否順利？"
            autoFocus={!editing}
          />
        </Field>

        <Field label="備註" hint="選填，自己看的提醒">
          <TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：記得先說公司名稱" />
        </Field>

        {error && (
          <p role="alert" className="text-sm text-gold-bright">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {editing ? (
            <Button variant="ghost" onClick={handleDelete} className={confirmDelete ? "text-gold-bright" : ""}>
              <Trash2 size={18} strokeWidth={1.5} aria-hidden />
              {confirmDelete ? "確定刪除？再按一次" : "刪除"}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={saving}>
              {editing ? "儲存" : "加入清單"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
