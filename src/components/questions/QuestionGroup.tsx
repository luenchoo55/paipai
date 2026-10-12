"use client";

import { Plus } from "lucide-react";
import { Frame } from "@/components/ui/Frame";
import { IconButton } from "@/components/ui/IconButton";
import type { Deity, Question } from "@/lib/types";
import { QuestionItem } from "./QuestionItem";

/** 同一位神明底下的問題 */
export function QuestionGroup({
  deity,
  questions,
  onAdd,
  onEdit,
}: {
  deity: Deity;
  questions: Question[];
  onAdd: () => void;
  onEdit: (q: Question) => void;
}) {
  const selectedCount = questions.filter((q) => q.selected).length;
  const headingId = `deity-${deity.id}`;

  return (
    <Frame as="section" aria-labelledby={headingId} className="px-4 pb-2 pt-3 sm:px-5">
      <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2">
        <h3 id={headingId} className="font-serif text-lg font-semibold tracking-widest">
          {deity.name}
          <span className="ml-1 font-sans text-sm font-normal tracking-wider text-muted">・{deity.domain}</span>
        </h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted">
            帶 {selectedCount} / {questions.length}
          </span>
          <IconButton label={`新增問題給${deity.name}`} onClick={onAdd} className="border-transparent">
            <Plus size={20} strokeWidth={1.5} aria-hidden />
          </IconButton>
        </div>
      </div>
      <ul className="divide-y divide-line/40">
        {questions.map((q) => (
          <QuestionItem
            key={q.id}
            question={q}
            step={q.groupId ? q.order : undefined}
            onEdit={() => onEdit(q)}
          />
        ))}
      </ul>
    </Frame>
  );
}
