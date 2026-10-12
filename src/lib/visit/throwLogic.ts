import type { Outcome, ThrowResult } from "@/lib/types";

export const REQUIRED_SHENG = 3;

export const THROW_LABEL: Record<ThrowResult, string> = {
  sheng: "聖筊",
  xiao: "笑筊",
  yin: "陰筊",
};

/** 結尾連續幾個聖筊；擲出笑筊或陰筊就歸零 */
export function consecutiveSheng(throws: ThrowResult[]): number {
  let n = 0;
  for (let i = throws.length - 1; i >= 0 && throws[i] === "sheng"; i--) n++;
  return n;
}

export const isGranted = (throws: ThrowResult[]) => consecutiveSheng(throws) >= REQUIRED_SHENG;

/** 存成紀錄時的結果：三聖筊為應允；最後是陰筊為不認同；有擲但未定論為不明；沒擲為略過 */
export function outcomeOf(throws: ThrowResult[]): Outcome {
  if (throws.length === 0) return "skipped";
  if (isGranted(throws)) return "granted";
  if (throws[throws.length - 1] === "yin") return "declined";
  return "unclear";
}

export type Hint = "start" | "sheng" | "granted" | "xiao" | "yin";

export function hintOf(throws: ThrowResult[]): Hint {
  const last = throws[throws.length - 1];
  if (!last) return "start";
  if (last === "sheng") return isGranted(throws) ? "granted" : "sheng";
  return last;
}

export const HINT_TEXT: Record<Hint, string> = {
  start: "擲筊之後，點下方對應的結果。",
  sheng: "聖筊！再擲一次確認。",
  granted: "連續三個聖筊，神明應允了。",
  xiao: "笑筊：神明笑而不答，可以換個方式再問。",
  yin: "陰筊：神明不認同，或時機未到。",
};

export const OUTCOME_LABEL: Record<Outcome, string> = {
  granted: "三聖筊",
  unclear: "未有定論",
  declined: "陰筊",
  skipped: "未請示",
};
