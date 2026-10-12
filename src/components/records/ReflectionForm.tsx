"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";

/** 補寫「後來怎麼樣了」 */
export function ReflectionForm({
  initial = "",
  onSave,
  onCancel,
}: {
  initial?: string;
  onSave: (text: string) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial);
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (text.trim()) await onSave(text.trim());
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm tracking-widest text-gold">後來怎麼樣了</span>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="事情後來的發展、自己的心情，寫給以後的自己看。"
          autoFocus
        />
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={!text.trim()}>
          儲存
        </Button>
      </div>
    </form>
  );
}
