"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, TextArea, chipClass } from "@/components/ui/Field";
import { addVow } from "@/lib/db/repo";
import type { Deity } from "@/lib/types";

/** 記下還願承諾；父層用 key 讓每次開啟重新掛載 */
export function VowDialog({
  open,
  onClose,
  deities,
  defaultDeityId,
  defaultText = "",
}: {
  open: boolean;
  onClose: () => void;
  deities: Deity[];
  defaultDeityId?: string;
  defaultText?: string;
}) {
  const [deityId, setDeityId] = useState(defaultDeityId ?? deities[0]?.id ?? "");
  const [text, setText] = useState(defaultText);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return setError("請寫下要怎麼還願");
    await addVow(deityId, text);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="記下還願承諾">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-medium tracking-wider text-gold">向哪位神明許願</legend>
          <div className="flex flex-wrap gap-2">
            {deities.map((d) => (
              <label key={d.id} className={chipClass}>
                <input
                  type="radio"
                  name="vow-deity"
                  checked={deityId === d.id}
                  onChange={() => setDeityId(d.id)}
                  className="sr-only"
                />
                {d.name}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="承諾的內容">
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如：如願錄取後，帶水果回來答謝"
            autoFocus
          />
        </Field>
        {error && (
          <p role="alert" className="text-sm text-gold-bright">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">記下來</Button>
        </div>
      </form>
    </Dialog>
  );
}
