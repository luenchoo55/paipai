import { z } from "zod";
import { db } from "@/lib/db/db";
import { BUILT_IN_DEITIES } from "@/lib/db/seed";
import { DEFAULT_PREFERENCES, EMPTY_PROFILE } from "@/lib/db/repo";
import type { Visit } from "@/lib/types";

/**
 * 資料備份：匯出成一個 JSON 檔，籤詩照片轉成 data URL 一併存進去。
 * 匯入會「取代」目前所有資料（參拜進行中的暫存也會清掉）。
 */

const BACKUP_APP = "paipai";
const BACKUP_VERSION = 1;

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${blob.type || "application/octet-stream"};base64,${btoa(binary)}`;
}

const dataUrlToBlob = async (url: string) => (await fetch(url)).blob();

const Deity = z.object({ id: z.string(), name: z.string(), domain: z.string(), builtIn: z.boolean(), order: z.number() });
const Question = z.object({
  id: z.string(),
  deityId: z.string(),
  text: z.string(),
  note: z.string().optional(),
  background: z.string().optional(),
  followUps: z.object({ onXiao: z.string().optional(), onYin: z.string().optional() }).optional(),
  selected: z.boolean(),
  createdAt: z.string(),
  groupId: z.string().optional(),
  order: z.number().optional(),
});
const Throw = z.enum(["sheng", "xiao", "yin"]);
const Entry = z.object({
  questionId: z.string(),
  questionText: z.string(),
  deityId: z.string(),
  throws: z.array(Throw),
  outcome: z.enum(["granted", "unclear", "declined", "skipped"]),
  fortuneNumber: z.number().optional(),
  fortunePhoto: z.string().startsWith("data:").optional(),
  reviewAt: z.string().optional(),
  reflection: z.string().optional(),
});
const VisitJson = z.object({ id: z.string(), date: z.string(), templeName: z.string().optional(), entries: z.array(Entry) });
const Vow = z.object({ id: z.string(), deityId: z.string(), text: z.string(), done: z.boolean(), createdAt: z.string() });
const Birthday = z.object({
  calendar: z.enum(["lunar", "solar"]),
  year: z.number(),
  month: z.number(),
  day: z.number(),
});

export const Backup = z.object({
  app: z.literal(BACKUP_APP),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.string(),
  deities: z.array(Deity),
  questions: z.array(Question),
  visits: z.array(VisitJson),
  vows: z.array(Vow),
  profile: z.object({ name: z.string(), birthday: Birthday.optional(), address: z.string() }),
  preferences: z.object({ reviewReminders: z.boolean(), vowReminders: z.boolean() }),
});
export type Backup = z.infer<typeof Backup>;

export async function exportBackup(): Promise<Backup> {
  const [deities, questions, visits, vows, profileRow, prefsRow] = await Promise.all([
    db.deities.toArray(),
    db.questions.toArray(),
    db.visits.toArray(),
    db.vows.toArray(),
    db.kv.get("profile"),
    db.kv.get("preferences"),
  ]);
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    deities,
    questions,
    visits: await Promise.all(
      visits.map(async (v) => ({
        ...v,
        entries: await Promise.all(
          v.entries.map(async (e) => ({
            ...e,
            fortunePhoto: e.fortunePhoto ? await blobToDataUrl(e.fortunePhoto) : undefined,
          })),
        ),
      })),
    ),
    vows,
    profile: { ...EMPTY_PROFILE, ...(profileRow?.value as object) },
    preferences: { ...DEFAULT_PREFERENCES, ...(prefsRow?.value as object) },
  };
}

export class InvalidBackupError extends Error {}

/** 解析並驗證備份檔內容，格式不符時丟出 InvalidBackupError */
export function parseBackup(text: string): Backup {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new InvalidBackupError("這不是有效的 JSON 檔案");
  }
  const parsed = Backup.safeParse(json);
  if (!parsed.success) throw new InvalidBackupError("這不是 Paipai 的備份檔，或檔案已經損壞");
  return parsed.data;
}

export async function importBackup(backup: Backup) {
  const visits: Visit[] = await Promise.all(
    backup.visits.map(async (v) => ({
      ...v,
      entries: await Promise.all(
        v.entries.map(async (e) => ({
          ...e,
          fortunePhoto: e.fortunePhoto ? await dataUrlToBlob(e.fortunePhoto) : undefined,
        })),
      ),
    })),
  );
  // 內建神明一定要在，舊備份少了的補回來
  const ids = new Set(backup.deities.map((d) => d.id));
  const deities = [...backup.deities, ...BUILT_IN_DEITIES.filter((d) => !ids.has(d.id))];

  await db.transaction("rw", [db.deities, db.questions, db.visits, db.vows, db.kv], async () => {
    await Promise.all([db.deities.clear(), db.questions.clear(), db.visits.clear(), db.vows.clear(), db.kv.clear()]);
    await db.deities.bulkPut(deities);
    await db.questions.bulkPut(backup.questions);
    await db.visits.bulkPut(visits);
    await db.vows.bulkPut(backup.vows);
    await db.kv.bulkPut([
      { key: "profile", value: backup.profile },
      { key: "preferences", value: backup.preferences },
    ]);
  });
}

export const backupFileName = (date = new Date()) =>
  `paipai-備份-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}.json`;
