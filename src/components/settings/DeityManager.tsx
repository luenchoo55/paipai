"use client";

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { TextInput } from "@/components/ui/Field";
import { DeityInUseError, addDeity, removeDeity, updateDeity } from "@/lib/db/repo";
import type { Deity } from "@/lib/types";

function DeityRow({ deity }: { deity: Deity }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(deity.name);
  const [domain, setDomain] = useState(deity.domain);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("請輸入神明名稱");
    await updateDeity(deity.id, { name: name.trim(), domain: domain.trim() || "自訂" });
    setEditing(false);
    setError("");
  }

  async function remove() {
    if (!confirmDelete) return setConfirmDelete(true);
    try {
      await removeDeity(deity.id);
    } catch (err) {
      setConfirmDelete(false);
      setError(err instanceof DeityInUseError ? `${err.message}，請先移到別的神明或刪除` : "刪除失敗");
    }
  }

  if (editing) {
    return (
      <li className="py-3">
        <form onSubmit={save} className="flex flex-wrap items-center gap-2">
          <TextInput aria-label="神明名稱" value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-[1_1_8rem]" />
          <TextInput aria-label="主掌" value={domain} onChange={(e) => setDomain(e.target.value)} className="min-w-0 flex-[1_1_8rem]" />
          <IconButton label="儲存" type="submit">
            <Check size={18} strokeWidth={2} aria-hidden />
          </IconButton>
          <IconButton label="取消編輯" onClick={() => setEditing(false)} className="border-transparent">
            <X size={18} strokeWidth={1.5} aria-hidden />
          </IconButton>
        </form>
        {error && <p role="alert" className="mt-1 text-sm text-gold-bright">{error}</p>}
      </li>
    );
  }

  return (
    <li className="py-2">
      <div className="flex items-center gap-2">
        <p className="flex-1">
          <span className="font-serif font-semibold tracking-wider">{deity.name}</span>
          <span className="ml-2 text-sm text-muted">{deity.domain}</span>
        </p>
        {deity.builtIn ? (
          <span className="px-3 text-xs tracking-widest text-muted">內建</span>
        ) : (
          <>
            <IconButton label={`編輯${deity.name}`} onClick={() => setEditing(true)} className="border-transparent text-muted">
              <Pencil size={16} strokeWidth={1.5} aria-hidden />
            </IconButton>
            <button
              type="button"
              onClick={remove}
              onBlur={() => setConfirmDelete(false)}
              aria-label={confirmDelete ? `確定刪除${deity.name}？再按一次` : `刪除${deity.name}`}
              className={`inline-flex min-h-11 items-center gap-1 px-2 text-sm ${confirmDelete ? "text-gold-bright" : "text-muted hover:text-ink"}`}
            >
              <Trash2 size={16} strokeWidth={1.5} aria-hidden />
              {confirmDelete && "確定刪除？"}
            </button>
          </>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-gold-bright">{error}</p>}
    </li>
  );
}

/** 常用神明：內建的不能改，自訂的可以新增、編輯、刪除 */
export function DeityManager({ deities }: { deities: Deity[] }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await addDeity(name, domain || "自訂");
    setName("");
    setDomain("");
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-line/50">
        {deities.map((d) => (
          <DeityRow key={d.id} deity={d} />
        ))}
      </ul>
      <form onSubmit={add} className="flex flex-wrap items-end gap-2 border-t border-line/70 pt-4">
        <TextInput aria-label="新神明名稱" placeholder="神明名稱，例如：清水祖師" value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-[2_1_10rem]" />
        <TextInput aria-label="新神明主掌" placeholder="主掌（選填）" value={domain} onChange={(e) => setDomain(e.target.value)} className="min-w-0 flex-[1_1_7rem]" />
        <Button type="submit" variant="outline" disabled={!name.trim()}>
          <Plus size={18} strokeWidth={1.5} aria-hidden />
          新增神明
        </Button>
      </form>
    </div>
  );
}
