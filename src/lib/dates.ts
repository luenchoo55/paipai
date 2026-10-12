import { Solar } from "lunar-javascript";

// lunar-javascript 輸出簡體字，轉成台灣慣用寫法
const toTraditional = (s: string) => s.replace(/闰/g, "閏").replace(/腊/g, "臘");

/** 例如「農曆丙午年九月初三」 */
export function lunarLabel(date: Date): string {
  const l = Solar.fromDate(date).getLunar();
  return `農曆${l.getYearInGanZhi()}年${toTraditional(l.getMonthInChinese())}月${l.getDayInChinese()}`;
}

const solarFormat = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

/** 例如「2026年10月12日 週一」 */
export const solarLabel = (date: Date) => solarFormat.format(date);

export const shortDate = (date: Date) => `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

/** 加 N 個月；遇到月底（例如 1/31 + 1 個月）停在該月最後一天 */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}
