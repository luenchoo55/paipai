"use client";

import { Flame, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Frame";
import { useDeities, useQuestions } from "@/lib/db/hooks";
import type { Question } from "@/lib/types";
import { QuestionDialog } from "./QuestionDialog";
import { QuestionGroup } from "./QuestionGroup";

type DialogState = { open: false } | { open: true; key: number; question?: Question; deityId?: string };

export function QuestionList() {
  const deities = useDeities();
  const questions = useQuestions();
  const [dialog, setDialog] = useState<DialogState>({ open: false });

  const openDialog = (opts: { question?: Question; deityId?: string } = {}) =>
    setDialog({ open: true, key: Date.now(), ...opts });

  if (!deities || !questions) {
    return (
      <div aria-busy className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-frame bg-surface" />
        <div className="h-36 animate-pulse rounded-frame bg-surface" />
      </div>
    );
  }

  // 依神明排序分組；神明被刪掉的問題（理論上不會發生）歸到「其他」
  const known = new Set(deities.map((d) => d.id));
  const groups = [
    ...deities.map((deity) => ({ deity, questions: questions.filter((q) => q.deityId === deity.id) })),
    {
      deity: { id: "__other", name: "其他", domain: "未指定神明", builtIn: true, order: Infinity },
      questions: questions.filter((q) => !known.has(q.deityId)),
    },
  ].filter((g) => g.questions.length > 0);

  const selectedCount = questions.filter((q) => q.selected).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-bold tracking-widest">
          我的問題
          <span className="ml-2 font-sans text-sm font-normal text-muted">共 {questions.length} 題</span>
        </h2>
        <Button variant="outline" onClick={() => openDialog()}>
          <Plus size={18} strokeWidth={1.5} aria-hidden />
          新增問題
        </Button>
      </div>

      {groups.length === 0 ? (
        <Frame className="px-6 py-10 text-center">
          <p className="font-serif text-lg tracking-widest">清單還是空的</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            把最近放在心上的事寫下來，例如工作、感情、考試或家人平安。
          </p>
          <Button className="mt-5" onClick={() => openDialog()}>
            <Plus size={18} strokeWidth={2} aria-hidden />
            寫下第一個問題
          </Button>
        </Frame>
      ) : (
        groups.map(({ deity, questions }) => (
          <QuestionGroup
            key={deity.id}
            deity={deity}
            questions={questions}
            onAdd={() => openDialog({ deityId: known.has(deity.id) ? deity.id : undefined })}
            onEdit={(question) => openDialog({ question })}
          />
        ))
      )}

      {questions.length > 0 && (
        <div className="sticky bottom-4 z-10 pt-2">
          {selectedCount > 0 ? (
            <Link href="/visit" className={buttonClass("primary", "w-full shadow-[0_8px_24px_rgb(0_0_0/0.5)]")}>
              <Flame size={20} strokeWidth={2} aria-hidden />
              帶 {selectedCount} 個問題去參拜
            </Link>
          ) : (
            <p className="rounded-frame border border-line bg-surface/95 px-4 py-3 text-center text-sm text-muted">
              勾選這次要帶去問的問題
            </p>
          )}
        </div>
      )}

      {dialog.open && (
        <QuestionDialog
          key={dialog.key}
          open
          onClose={() => setDialog({ open: false })}
          deities={deities}
          question={dialog.question}
          defaultDeityId={dialog.deityId}
        />
      )}
    </div>
  );
}
