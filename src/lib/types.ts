export type Deity = {
  id: string;
  name: string;
  domain: string;
  builtIn: boolean;
  order: number;
};

export type Question = {
  id: string;
  deityId: string;
  text: string;
  note?: string;
  background?: string; // 稟報背景
  followUps?: { onXiao?: string; onYin?: string };
  selected: boolean; // 這次要帶去問
  createdAt: string;
  groupId?: string; // AI 產生的同一組問題
  order?: number;
  important?: boolean; // 重大的事：需連續三個聖筊（一般一個聖筊即可）
  parentId?: string; // 參拜時當場追加的衍生問題：從哪一題延伸
};

export type ThrowResult = "sheng" | "xiao" | "yin";

export type Outcome = "granted" | "unclear" | "declined" | "skipped";

export type VisitEntry = {
  questionId: string;
  questionText: string;
  followUpOf?: string; // 衍生問題：原本那一題的內容
  deityId: string;
  throws: ThrowResult[];
  requiredSheng?: number; // 應允需要的連續聖筊數；舊紀錄沒有，視為 3
  outcome: Outcome;
  fortuneNumber?: number; // 籤號
  fortunePhoto?: Blob;
  reviewAt?: string;
  reflection?: string; // 後來怎麼樣了
};

export type Visit = {
  id: string;
  date: string; // ISO
  templeName?: string;
  entries: VisitEntry[];
};

/** 參拜進行中的暫存；問題在開始時拍下快照，途中清單變動不影響 */
export type VisitDraft = {
  startedAt: string;
  questions: Question[];
  index: number;
  entries: Record<string, Pick<VisitEntry, "throws" | "fortuneNumber" | "fortunePhoto"> & { important?: boolean }>;
  finishing: boolean;
};

export type Vow = {
  id: string;
  deityId: string;
  text: string;
  done: boolean;
  createdAt: string;
};

export type Birthday = {
  calendar: "lunar" | "solar";
  year: number; // 民國年
  month: number;
  day: number;
};

/** 稟報資料，參拜模式自動帶入 */
export type Profile = {
  name: string;
  birthday?: Birthday;
  address: string;
};

export type Preferences = {
  reviewReminders: boolean;
  vowReminders: boolean;
};
