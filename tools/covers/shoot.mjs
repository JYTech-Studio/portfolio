// 把指定的 cover-*.html 截成 output/<名稱>.png（高解析）。
// 用法：node shoot.mjs cover-portfolio.html   （省略則用 cover-kaifu.html）
// 用系統安裝的 Chrome（channel: "chrome"），不需另外下載瀏覽器。
//
// ⚠️ 只輸出到 output/preview.png，「不會」覆蓋 public/ 裡的正式封面。
// 滿意 preview 後要不要取代正式封面，由你手動決定。
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const W = 1600;
const H = 900;

const src = process.argv[2] || "cover-kaifu.html";
const outDir = join(__dirname, "output");
mkdirSync(outDir, { recursive: true });
const out = join(outDir, src.replace(/^cover-/, "").replace(/\.html$/, "") + ".png");

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2, // 2x → 實際輸出 3200x1800
});
await page.goto("file://" + join(__dirname, src));
await page.waitForTimeout(900); // 等字體載入
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
await browser.close();

console.log("✓ 已輸出", out, "（未動到正式封面）");
