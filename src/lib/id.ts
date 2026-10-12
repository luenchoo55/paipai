/**
 * 產生唯一 id。crypto.randomUUID 只在 HTTPS 或 localhost 可用，
 * 用手機從區網 IP 連線開發伺服器時會不存在，因此改用 getRandomValues 自行組出 UUID v4。
 */
export function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
