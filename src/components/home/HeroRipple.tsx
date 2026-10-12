"use client";

import { useEffect, useRef, useState } from "react";

const MAX_DROPS = 24;
const DROP_LIFE = 2.6; // 秒

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // 左上為原點，與 CSS 座標一致
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// 每個水滴是一圈往外擴散的波包；位移沿半徑方向，亮度隨波峰微微提高
const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uPos;
uniform float uTime;
uniform vec4 uDrops[${MAX_DROPS}];
varying vec2 vUv;

vec2 coverUv(vec2 uv) {
  float rs = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 scale = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  return uv * scale + (1.0 - scale) * uPos;
}

void main() {
  vec2 p = vUv * uRes;
  vec2 disp = vec2(0.0);
  float light = 0.0;
  for (int i = 0; i < ${MAX_DROPS}; i++) {
    vec4 d = uDrops[i];
    float age = uTime - d.z;
    if (d.w <= 0.0 || age < 0.0 || age > ${DROP_LIFE.toFixed(1)}) continue;
    vec2 dir = p - d.xy;
    float dist = length(dir);
    float x = dist - age * 210.0;
    float fade = 1.0 - age / ${DROP_LIFE.toFixed(1)};
    float a = sin(x * 0.07) * exp(-x * x / 4500.0) * fade * fade * d.w / (1.0 + dist * 0.006);
    disp += (dir / max(dist, 0.001)) * a * 7.0;
    light += a;
  }
  vec3 col = texture2D(uTex, coverUv((p + disp) / uRes)).rgb;
  gl_FragColor = vec4(col * (1.0 + light * 0.15), 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

/**
 * 在主視覺圖片上疊一層 WebGL 水波：指標劃過時產生漣漪。
 * 圖片裁切方式需與底下的 next/image（object-cover + object-position）一致，載入完成才淡入。
 * 不支援 WebGL 或使用者偏好減少動態時，不做任何事，保留原本的靜態圖片。
 */
export function HeroRipple({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
    } catch (err) {
      console.warn("水波效果停用：", err);
      return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u("uRes");
    const uPos = u("uPos");
    const uTime = u("uTime");
    const uDrops = u("uDrops");
    gl.uniform2f(u("uImg"), width, height);
    gl.uniform1i(u("uTex"), 0);

    const drops = new Float32Array(MAX_DROPS * 4);
    let next = 0;
    let lastDrop = { x: -1e4, y: -1e4, t: 0 };
    const t0 = performance.now();
    const now = () => (performance.now() - t0) / 1000;

    let raf = 0;
    let loaded = false;
    let cssW = 0;
    let cssH = 0;

    const draw = () => {
      raf = 0;
      if (!loaded) return;
      const t = now();
      gl.uniform1f(uTime, t);
      gl.uniform4fv(uDrops, drops);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // 還有水波在動就繼續，全部消失後停下，不白白耗電
      let active = false;
      for (let i = 0; i < MAX_DROPS; i++) if (drops[i * 4 + 3] > 0 && t - drops[i * 4 + 2] < DROP_LIFE) active = true;
      if (active) raf = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    // 與 page.tsx 的 object-[47%_center] lg:object-[center_35%] 對應
    const lg = matchMedia("(min-width: 1024px)");
    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cssW = r.width;
      cssH = r.height;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, cssW, cssH);
      gl.uniform2f(uPos, lg.matches ? 0.5 : 0.47, lg.matches ? 0.35 : 0.5);
      schedule();
    };

    const addDrop = (x: number, y: number, strength: number) => {
      drops.set([x, y, now(), strength], next * 4);
      next = (next + 1) % MAX_DROPS;
      schedule();
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const t = now();
      // 依移動距離與時間節流，劃得快就多幾圈
      if (Math.hypot(x - lastDrop.x, y - lastDrop.y) < 28 && t - lastDrop.t < 0.12) return;
      lastDrop = { x, y, t };
      addDrop(x, y, 1);
    };
    const onDown = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      addDrop(e.clientX - r.left, e.clientY - r.top, 1.8);
    };

    const tex = gl.createTexture();
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      // 非 2 的次方尺寸：只能用 CLAMP 與 LINEAR
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      loaded = true;
      resize();
      setReady(true);
    };
    img.src = src;

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    lg.addEventListener("change", resize);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerdown", onDown);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      lg.removeEventListener("change", resize);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      img.onload = null;
      // 不呼叫 loseContext：同一個 canvas 重新掛載（例如開發模式 StrictMode）時會拿到失效的 context
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, [src, width, height]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 size-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
}
