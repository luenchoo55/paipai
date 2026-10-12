/**
 * 背景音樂：全站共用一個 Audio，換頁不中斷。
 *
 * - 預設關閉；開關與音量記在 localStorage，下次來會在第一次點擊時自動續播
 *   （瀏覽器不允許沒有互動就自動播放有聲音的媒體）
 * - 切到背景分頁時暫停，回來再接著播
 * - 音量用 Web Audio 的 GainNode 控制：iPhone 上 audio.volume 是唯讀的，只有這樣才調得動
 */

const SRC = "/audio/bgm.mp3";
const PREF_KEY = "paipai-music";
const VOLUME_KEY = "paipai-music-volume";
const DEFAULT_VOLUME = 0.5;

export type MusicState = { enabled: boolean; volume: number };

let audio: HTMLAudioElement | null = null;
let context: AudioContext | null = null;
let gain: GainNode | null = null;
let state: MusicState = { enabled: false, volume: DEFAULT_VOLUME };
let started = false;
let waitingForGesture = false;
const listeners = new Set<() => void>();
const serverState: MusicState = { enabled: false, volume: DEFAULT_VOLUME };

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 無痕模式等情況存不了，只影響下次的預設值
  }
}

function setState(changes: Partial<MusicState>) {
  state = { ...state, ...changes };
  listeners.forEach((l) => l());
}

/** 第一次播放時才建立（需在使用者互動中建立 AudioContext） */
function getAudio() {
  if (audio) return audio;
  audio = new Audio(SRC);
  audio.loop = true;
  audio.preload = "none";
  audio.volume = state.volume;
  try {
    // Safari：讓 Web Audio 跟一般媒體一樣，不受靜音鍵影響
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = "playback";
    context = new AudioContext();
    gain = context.createGain();
    gain.gain.value = state.volume;
    context.createMediaElementSource(audio).connect(gain).connect(context.destination);
    audio.volume = 1;
  } catch {
    // 不支援 Web Audio 時退回 audio.volume
    context = null;
    gain = null;
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
  const shouldPlay = state.enabled && document.visibilityState === "visible";
  if (!shouldPlay) {
    audio?.pause();
    return;
  }
  const el = getAudio();
  if (context && context.state !== "running") {
    // 不在使用者互動中時 resume 可能一直等不到，先登記下一次點擊再試
    context.resume().catch(() => undefined);
    retryOnGesture();
  }
  if (el.paused) el.play().catch(retryOnGesture);
}

function start() {
  if (started) return;
  started = true;
  const volume = Number(read(VOLUME_KEY));
  state = {
    enabled: read(PREF_KEY) === "on",
    volume: read(VOLUME_KEY) !== null && volume >= 0 && volume <= 1 ? volume : DEFAULT_VOLUME,
  };
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

export const getMusicState = () => state;
export const getMusicServerState = () => serverState;

export function toggleMusic() {
  setState({ enabled: !state.enabled });
  write(PREF_KEY, state.enabled ? "on" : "off");
  sync();
}

/** 0–1 */
export function setMusicVolume(volume: number) {
  setState({ volume });
  write(VOLUME_KEY, String(volume));
  if (gain) gain.gain.value = volume;
  else if (audio) audio.volume = volume;
}
