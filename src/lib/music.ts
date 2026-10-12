/**
 * 背景音樂：全站共用一個 Audio，換頁不中斷。
 *
 * - 預設關閉；使用者打開後記在 localStorage，下次來會在第一次點擊時自動續播
 *   （瀏覽器不允許沒有互動就自動播放有聲音的媒體）
 * - 參拜模式、切到背景分頁時暫停，回來再接著播
 */

const SRC = "/audio/bgm.mp3";
const PREF_KEY = "paipai-music";
const VOLUME = 0.5;

let audio: HTMLAudioElement | null = null;
let enabled = false;
let suspended = false;
let started = false;
let waitingForGesture = false;
const listeners = new Set<() => void>();

function readPref() {
  try {
    return localStorage.getItem(PREF_KEY) === "on";
  } catch {
    return false;
  }
}

function writePref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    // 無痕模式等情況存不了，只影響下次是否自動續播
  }
}

function getAudio() {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = VOLUME;
  }
  return audio;
}

/** 瀏覽器擋下自動播放時，等使用者第一次互動再播 */
function retryOnGesture() {
  if (waitingForGesture) return;
  waitingForGesture = true;
  const retry = () => {
    waitingForGesture = false;
    window.removeEventListener("pointerdown", retry);
    window.removeEventListener("keydown", retry);
    sync();
  };
  window.addEventListener("pointerdown", retry, { once: true });
  window.addEventListener("keydown", retry, { once: true });
}

function sync() {
  const shouldPlay = enabled && !suspended && document.visibilityState === "visible";
  if (shouldPlay) {
    const el = getAudio();
    if (el.paused) el.play().catch(retryOnGesture);
  } else {
    audio?.pause();
  }
}

function start() {
  if (started) return;
  started = true;
  enabled = readPref();
  document.addEventListener("visibilitychange", sync);
  sync();
}

export function subscribeMusic(listener: () => void) {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getMusicEnabled = () => enabled;
export const getMusicEnabledServer = () => false;

export function toggleMusic() {
  enabled = !enabled;
  writePref(enabled);
  sync();
  listeners.forEach((l) => l());
}

/** 參拜模式等需要安靜的地方暫停；離開後若使用者有開就續播 */
export function setMusicSuspended(value: boolean) {
  if (suspended === value) return;
  suspended = value;
  sync();
}
