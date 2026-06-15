// 產生「鎧福旅行社」封面：金棕色亞太地球 + 台灣為中心 + 航線 + 左側文字。
// 用 d3-geo 把真實世界地圖（world-atlas / Natural Earth）投影成正交（地球）視角，
// 輸出成自包含的 cover-kaifu.html，再由 shoot.mjs 截圖成 output/preview.png。
//
// 要改封面：調整下方「可調參數」即可，改完跑 `npm run cover`。
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  geoOrthographic,
  geoPath,
  geoGraticule10,
  geoInterpolate,
  geoDistance,
} from "d3-geo";
import { feature } from "topojson-client";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ───────────────────────── 可調參數 ───────────────────────── */
const W = 1600;
const H = 900;

// 地球：以台灣（約 121°E, 23.7°N）為中心
const CENTER = [121.0, 23.7];
const CX = 1265; // 地球在畫面上的水平中心（偏右，左側留給文字）
const CY = 472; // 垂直中心
const R = 510; // 地球半徑（越大越「放大」）

const TAIWAN_ID = "158"; // world-atlas 裡台灣的編號

// 顏色（金棕色調）
const C = {
  bgTop: "#2a1d12",
  bgBottom: "#160f0a",
  ocean: "#241910",
  oceanEdge: "#0e0a06",
  land: "#c8a25c",
  landStroke: "#7c5f30",
  graticule: "rgba(200,162,92,0.16)",
  taiwan: "#e8822e",
  taiwanStroke: "#ffb066",
  arc: "rgba(255,248,236,0.85)",
  marker: "#fdf6e9",
  rim: "rgba(255,228,170,0.55)", // 右上角的受光高光
};

// 航線：新加坡 → 台灣 → 東京（虛線），端點放標記
const TPE = [121.0, 23.7];
const ROUTES = [
  { from: [103.82, 1.35], to: TPE, fromLabel: "SIN" }, // 新加坡 → 台灣
  { from: TPE, to: [139.7, 35.68], toLabel: "TYO" }, // 台灣 → 東京
];

// 左側文字內容
const TEXT = {
  pill: "旅遊報名系統 · Next.js",
  titleGold: "鎧福旅行社",
  titleCream: "旅遊報名管理系統",
  sub1: "前台線上報名 + 9 大後台模組",
  sub2: "CRM · 財務 · 報表 · 完整權限與安全",
  badges: ["Next.js 16", "React 19", "Supabase", "PostgreSQL", "Chart.js"],
};
/* ──────────────────────── 參數結束 ──────────────────────── */

const world = JSON.parse(
  readFileSync(join(__dirname, "node_modules/world-atlas/countries-50m.json")),
);
const countries = feature(world, world.objects.countries).features;
const taiwan = countries.find((f) => String(f.id) === TAIWAN_ID);
const others = countries.filter((f) => String(f.id) !== TAIWAN_ID);

const projection = geoOrthographic()
  .rotate([-CENTER[0], -CENTER[1]])
  .scale(R)
  .translate([CX, CY])
  .clipAngle(90);
const path = geoPath(projection);

// 某經緯點是否在可見半球
const visible = ([lon, lat]) => geoDistance([lon, lat], CENTER) < Math.PI / 2;
const project = ([lon, lat]) => projection([lon, lat]);

// 大圓弧（取樣成多點，讓 geoPath 畫成弧線並自動裁切到半球）
function arcPath(a, b, n = 72) {
  const interp = geoInterpolate(a, b);
  const coords = Array.from({ length: n + 1 }, (_, i) => interp(i / n));
  return path({ type: "LineString", coordinates: coords });
}

// 小飛機字形（朝右），會被 translate/rotate/scale
const PLANE =
  "M2.5 0 L-1.5 -1.4 L-0.6 -0.3 L-2.6 -0.3 L-3.2 -0.9 L-3.6 -0.9 " +
  "L-3.2 0 L-3.6 0.9 L-3.2 0.9 L-2.6 0.3 L-0.6 0.3 L-1.5 1.4 Z";

function planeAlong(a, b, t = 0.5, scale = 9) {
  const interp = geoInterpolate(a, b);
  const p0 = project(interp(t));
  const p1 = project(interp(Math.min(1, t + 0.02)));
  if (!p0 || !p1) return "";
  const angle = (Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180) / Math.PI;
  return `<path d="${PLANE}" fill="${C.marker}" transform="translate(${p0[0].toFixed(1)} ${p0[1].toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${scale})"/>`;
}

function marker([lon, lat], { star = false, r = 6, fill = C.marker } = {}) {
  if (!visible([lon, lat])) return "";
  const [x, y] = project([lon, lat]);
  if (star) {
    // 四角星
    const s = r * 1.7;
    const d = `M0 ${-s} L${s * 0.28} ${-s * 0.28} L${s} 0 L${s * 0.28} ${s * 0.28} L0 ${s} L${-s * 0.28} ${s * 0.28} L${-s} 0 L${-s * 0.28} ${-s * 0.28} Z`;
    return `<path d="${d}" fill="${fill}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}"/>`;
}

// 台灣標籤（橘色小框 + 引線）
function taiwanLabel() {
  if (!visible(TPE)) return "";
  const [x, y] = project(TPE);
  const lx = x + 70;
  const ly = y + 8;
  return `
    <line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(lx - 6).toFixed(1)}" y2="${ly.toFixed(1)}" stroke="${C.taiwan}" stroke-width="2"/>
    <g transform="translate(${lx.toFixed(1)} ${(ly - 20).toFixed(1)})">
      <rect width="76" height="40" rx="8" fill="${C.taiwan}"/>
      <text x="38" y="26" text-anchor="middle" font-size="22" font-weight="700" fill="#2a1404" font-family="'Noto Sans TC', sans-serif">台灣</text>
    </g>`;
}

const landPaths = others
  .map((f) => path(f))
  .filter(Boolean)
  .map((d) => `<path d="${d}"/>`) // 共用 .land 樣式
  .join("");

const graticule = path(geoGraticule10());

const arcs = ROUTES.map((r) => arcPath(r.from, r.to)).filter(Boolean);
const arcSvg = arcs
  .map(
    (d) =>
      `<path d="${d}" fill="none" stroke="${C.arc}" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>`,
  )
  .join("");

const markers = [
  marker(ROUTES[0].from, { r: 7 }), // 新加坡
  marker(ROUTES[1].to, { star: true, r: 9 }), // 東京（星）
  marker(TPE, { r: 9, fill: C.taiwan }), // 台灣（橘點）
  planeAlong(TPE, ROUTES[1].to, 0.55, 8), // 台→日 航線上的小飛機
].join("");

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ocean" cx="38%" cy="32%" r="75%">
      <stop offset="0%" stop-color="${C.ocean}"/>
      <stop offset="100%" stop-color="${C.oceanEdge}"/>
    </radialGradient>
    <radialGradient id="rim" cx="72%" cy="22%" r="60%">
      <stop offset="0%" stop-color="${C.rim}"/>
      <stop offset="55%" stop-color="rgba(255,228,170,0)"/>
    </radialGradient>
    <clipPath id="globe"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath>
  </defs>

  <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#ocean)"/>
  <g clip-path="url(#globe)">
    <path d="${graticule}" fill="none" stroke="${C.graticule}" stroke-width="1"/>
    <g class="land" fill="${C.land}" stroke="${C.landStroke}" stroke-width="0.5">${landPaths}</g>
    ${taiwan ? `<path d="${path(taiwan)}" fill="${C.taiwan}" stroke="${C.taiwanStroke}" stroke-width="1"/>` : ""}
    ${graticuleOnTop()}
    ${arcSvg}
    ${markers}
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#rim)"/>
  </g>
  ${taiwanLabel()}
</svg>`;

function graticuleOnTop() {
  return "";
}

const badgesHtml = TEXT.badges
  .map((b) => `<span class="badge">${b}</span>`)
  .join("");

const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    position: relative;
    font-family: 'Noto Sans TC', sans-serif;
    background: linear-gradient(135deg, ${C.bgTop}, ${C.bgBottom});
  }
  .globe { position: absolute; inset: 0; }
  .copy { position: absolute; left: 96px; top: 150px; width: 620px; color: #efe7d8; }
  .pill {
    display: inline-flex; align-items: center; gap: 10px;
    border: 1px solid rgba(200,162,92,0.45); border-radius: 999px;
    padding: 8px 18px; font-size: 20px; color: #d8b878; font-weight: 500;
  }
  .pill::before { content:""; width: 9px; height: 9px; border-radius: 50%; background: ${C.taiwan}; }
  h1 { font-weight: 900; font-size: 64px; line-height: 1.18; margin-top: 26px; letter-spacing: 1px; }
  h1 .gold { color: #e0b063; }
  h1 .cream { color: #f3ecdd; }
  .sub { margin-top: 24px; font-size: 26px; line-height: 1.5; color: #cfc4ad; font-weight: 400; }
  .badges { margin-top: 34px; display: flex; flex-wrap: wrap; gap: 14px; max-width: 540px; }
  .badge {
    border: 1px solid rgba(200,162,92,0.4); border-radius: 12px;
    padding: 10px 20px; font-size: 22px; color: #e7dcc4;
    background: rgba(255,255,255,0.03);
  }
</style>
</head>
<body>
  <div class="globe">${svg}</div>
  <div class="copy">
    <span class="pill">${TEXT.pill}</span>
    <h1><span class="gold">${TEXT.titleGold}</span><br><span class="cream">${TEXT.titleCream}</span></h1>
    <div class="sub">${TEXT.sub1}<br>${TEXT.sub2}</div>
    <div class="badges">${badgesHtml}</div>
  </div>
</body>
</html>`;

writeFileSync(join(__dirname, "cover-kaifu.html"), html);
console.log("✓ 已產生 cover-kaifu.html（", W, "x", H, "）");
