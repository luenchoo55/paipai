import type { Deity } from "@/lib/types";

/** 內建常見神明；id 固定，匯出匯入與 AI 建議都靠它對應 */
export const BUILT_IN_DEITIES: Deity[] = [
  { id: "mazu", name: "媽祖", domain: "平安・事業", builtIn: true, order: 0 },
  { id: "guanyin", name: "觀世音菩薩", domain: "平安・各類疑問", builtIn: true, order: 1 },
  { id: "yuelao", name: "月下老人", domain: "姻緣", builtIn: true, order: 2 },
  { id: "wenchang", name: "文昌帝君", domain: "考試・學業", builtIn: true, order: 3 },
  { id: "tudigong", name: "土地公", domain: "財運・地方平安", builtIn: true, order: 4 },
  { id: "caishen", name: "財神", domain: "財運", builtIn: true, order: 5 },
  { id: "guangong", name: "關聖帝君", domain: "事業・正義", builtIn: true, order: 6 },
  { id: "baosheng", name: "保生大帝", domain: "健康・醫藥", builtIn: true, order: 7 },
  { id: "zhusheng", name: "註生娘娘", domain: "求子・生育", builtIn: true, order: 8 },
  { id: "xuantian", name: "玄天上帝", domain: "平安・驅邪", builtIn: true, order: 9 },
  { id: "chenghuang", name: "城隍爺", domain: "公道・訴訟", builtIn: true, order: 10 },
];
