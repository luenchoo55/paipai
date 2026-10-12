import Dexie, { type EntityTable } from "dexie";
import type { Deity, Question, Visit, Vow } from "@/lib/types";
import { BUILT_IN_DEITIES } from "./seed";

/** 稟報資料、偏好設定等單筆資料，以 key 存取 */
export type KeyValue = { key: string; value: unknown };

// IndexedDB 不能用布林值建索引，selected、done 不放進索引，查詢時在記憶體中篩選
export class PaipaiDB extends Dexie {
  deities!: EntityTable<Deity, "id">;
  questions!: EntityTable<Question, "id">;
  visits!: EntityTable<Visit, "id">;
  vows!: EntityTable<Vow, "id">;
  kv!: EntityTable<KeyValue, "key">;

  constructor() {
    super("paipai");
    this.version(1).stores({
      deities: "id, order",
      questions: "id, deityId, groupId, createdAt",
      visits: "id, date",
      vows: "id, deityId, createdAt",
      kv: "key",
    });
    this.on("populate", (tx) => tx.table("deities").bulkAdd(BUILT_IN_DEITIES));
  }
}

export const db = new PaipaiDB();
