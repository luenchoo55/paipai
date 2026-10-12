import type { Profile } from "@/lib/types";

const blank = (label: string) => `[${label}]`;

/** 稟報詞；稟報資料沒填的部分以 [方括號] 留空 */
export function reportText(deityName: string, profile: Profile): string {
  const name = profile.name.trim() || blank("姓名");
  const b = profile.birthday;
  const birth = b
    ? `民國 ${b.year} 年${b.calendar === "lunar" ? "農曆" : ""} ${b.month} 月 ${b.day} 日生`
    : `民國 ${blank("年")} 年 ${blank("月")} 月 ${blank("日")} 日生`;
  const address = profile.address.trim() || blank("地址");
  return `${deityName}在上，弟子${name}，${birth}，住在${address}，今天誠心來向您請示。`;
}

export const isProfileComplete = (p: Profile) => Boolean(p.name.trim() && p.birthday && p.address.trim());
