import type { Outcome, ThrowResult } from "@/lib/types";

/** 一般的事一個聖筊就算應允；重大的事要連續三個聖筊 */
export const requiredSheng = (important?: boolean) => (important ? 3 : 1);

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

export const isGranted = (throws: ThrowResult[], required: number) => consecutiveSheng(throws) >= required;

/** 存成紀錄時的結果：聖筊數達標為應允；最後是陰筊為不認同；有擲但未定論為不明；沒擲為略過 */
export function outcomeOf(throws: ThrowResult[], required: number): Outcome {
  if (throws.length === 0) return "skipped";
  if (isGranted(throws, required)) return "granted";
  if (throws[throws.length - 1] === "yin") return "declined";
  return "unclear";
}

export type Hint = "start" | "sheng" | "granted" | "xiao" | "yin";

export function hintOf(throws: ThrowResult[], required: number): Hint {
  const last = throws[throws.length - 1];
  if (!last) return "start";
  if (last === "sheng") return isGranted(throws, required) ? "granted" : "sheng";
  return last;
}

export function hintText(hint: Hint, required: number): string {
  if (hint === "granted") return required > 1 ? "連續三個聖筊，神明應允了。" : "聖筊，神明應允了。";
  return HINT_TEXT[hint];
}

const HINT_TEXT: Record<Exclude<Hint, "granted">, string> = {
  start: "擲筊之後，點下方對應的結果。",
  sheng: "聖筊！重大的事，再擲一次確認。",
  xiao: "笑筊：神明笑而不答，可以換個方式再問。",
  yin: "陰筊：神明不認同，或時機未到。",
};

/** 紀錄上的結果標籤；舊紀錄沒有 requiredSheng，當時都是三聖筊 */
export const outcomeLabel = (outcome: Outcome, required = 3) =>
  outcome === "granted" ? (required > 1 ? "三聖筊" : "聖筊") : OUTCOME_LABEL[outcome];

const OUTCOME_LABEL: Record<Outcome, string> = {
  granted: "三聖筊",
  unclear: "未有定論",
  declined: "陰筊",
  skipped: "未請示",
};
