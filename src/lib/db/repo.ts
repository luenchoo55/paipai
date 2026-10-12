import { newId } from "@/lib/id";
import type { Deity, Preferences, Profile, Question, Visit, VisitDraft, VisitEntry, Vow } from "@/lib/types";
import { outcomeOf } from "@/lib/visit/throwLogic";
import { db } from "./db";

const now = () => new Date().toISOString();

// ── 神明 ─────────────────────────────────────────────

export const listDeities = () => db.deities.orderBy("order").toArray();

export async function addDeity(name: string, domain: string): Promise<Deity> {
  const last = await db.deities.orderBy("order").last();
  const deity: Deity = { id: newId(), name: name.trim(), domain: domain.trim(), builtIn: false, order: (last?.order ?? -1) + 1 };
  await db.deities.add(deity);
  return deity;
}

export const updateDeity = (id: string, changes: Partial<Pick<Deity, "name" | "domain" | "order">>) =>
  db.deities.update(id, changes);

export class DeityInUseError extends Error {
  constructor(public count: number) {
    super(`還有 ${count} 個問題屬於這位神明`);
  }
}

/** 只能刪除自訂神明，且不能還有問題掛在祂底下 */
export async function removeDeity(id: string) {
  const deity = await db.deities.get(id);
  if (!deity || deity.builtIn) return;
  const count = await db.questions.where("deityId").equals(id).count();
  if (count > 0) throw new DeityInUseError(count);
  await db.deities.delete(id);
}

// ── 問題 ─────────────────────────────────────────────

export type NewQuestion = Omit<Question, "id" | "createdAt" | "selected"> & { selected?: boolean };

export async function addQuestion(input: NewQuestion): Promise<Question> {
  const question: Question = { selected: true, ...input, id: newId(), createdAt: now() };
  await db.questions.add(question);
  return question;
}

/** AI 產生的一組問題：共用 groupId，依陣列順序寫入 order */
export async function addQuestionGroup(inputs: Omit<NewQuestion, "groupId" | "order">[]) {
  const groupId = newId();
  const createdAt = now();
  const questions: Question[] = inputs.map((q, order) => ({
    selected: true,
    ...q,
    id: newId(),
    createdAt,
    groupId,
    order,
  }));
  await db.questions.bulkAdd(questions);
  return questions;
}

export const updateQuestion = (id: string, changes: Partial<Omit<Question, "id" | "createdAt">>) =>
  db.questions.update(id, changes);

export const setQuestionSelected = (id: string, selected: boolean) => db.questions.update(id, { selected });

export const removeQuestion = (id: string) => db.questions.delete(id);

/** 依建立時間排序；同一組 AI 問題維持原本的步驟順序 */
export function sortQuestions(questions: Question[]) {
  return [...questions].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || (a.order ?? 0) - (b.order ?? 0),
  );
}

export const listQuestions = async () => sortQuestions(await db.questions.toArray());

export const listSelectedQuestions = async () =>
  sortQuestions(await db.questions.filter((q) => q.selected).toArray());

// ── 參拜紀錄 ─────────────────────────────────────────

export async function saveVisit(input: Omit<Visit, "id">): Promise<Visit> {
  const visit: Visit = { ...input, id: newId() };
  await db.visits.add(visit);
  return visit;
}

export const listVisits = () => db.visits.orderBy("date").reverse().toArray();

/** 更新某次參拜中的某一題，例如補寫「後來怎麼樣了」或設定回顧時間 */
export async function updateVisitEntry(visitId: string, index: number, changes: Partial<VisitEntry>) {
  await db.transaction("rw", db.visits, async () => {
    const visit = await db.visits.get(visitId);
    if (!visit?.entries[index]) return;
    const entries = visit.entries.map((e, i) => (i === index ? { ...e, ...changes } : e));
    await db.visits.update(visitId, { entries });
  });
}

export const removeVisit = (id: string) => db.visits.delete(id);

// ── 參拜進行中的暫存 ─────────────────────────────────

export const getVisitDraft = async () => (await db.kv.get("visitDraft"))?.value as VisitDraft | undefined;
export const saveVisitDraft = (draft: VisitDraft) => db.kv.put({ key: "visitDraft", value: draft });
export const clearVisitDraft = () => db.kv.delete("visitDraft");

/** 把暫存寫成正式紀錄；問過的問題取消勾選，清單留著下次用 */
export async function finishVisit(draft: VisitDraft, templeName: string): Promise<Visit> {
  const entries: VisitEntry[] = draft.questions.map((q) => {
    const e = draft.entries[q.id] ?? { throws: [] };
    return {
      questionId: q.id,
      questionText: q.text,
      deityId: q.deityId,
      throws: e.throws,
      outcome: outcomeOf(e.throws),
      fortuneNumber: e.fortuneNumber,
      fortunePhoto: e.fortunePhoto,
    };
  });
  return db.transaction("rw", [db.visits, db.questions, db.kv], async () => {
    const visit = await saveVisit({ date: now(), templeName: templeName.trim() || undefined, entries });
    const asked = entries.filter((e) => e.outcome !== "skipped").map((e) => e.questionId);
    await db.questions.where("id").anyOf(asked).modify({ selected: false });
    await clearVisitDraft();
    return visit;
  });
}

// ── 還願 ─────────────────────────────────────────────

export async function addVow(deityId: string, text: string): Promise<Vow> {
  const vow: Vow = { id: newId(), deityId, text: text.trim(), done: false, createdAt: now() };
  await db.vows.add(vow);
  return vow;
}

export const setVowDone = (id: string, done: boolean) => db.vows.update(id, { done });

export const removeVow = (id: string) => db.vows.delete(id);

export const listVows = () => db.vows.orderBy("createdAt").toArray();

// ── 稟報資料與偏好 ───────────────────────────────────

export const EMPTY_PROFILE: Profile = { name: "", address: "" };
export const DEFAULT_PREFERENCES: Preferences = { reviewReminders: true, vowReminders: true };

async function getKV<T>(key: string, fallback: T): Promise<T> {
  const row = await db.kv.get(key);
  return row ? ({ ...fallback, ...(row.value as T) } as T) : fallback;
}

export const getProfile = () => getKV("profile", EMPTY_PROFILE);
export const saveProfile = (profile: Profile) => db.kv.put({ key: "profile", value: profile });

export const getPreferences = () => getKV("preferences", DEFAULT_PREFERENCES);
export const savePreferences = (prefs: Preferences) => db.kv.put({ key: "preferences", value: prefs });
