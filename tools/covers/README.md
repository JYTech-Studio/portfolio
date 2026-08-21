# 封面產圖工具（covers）

產生作品集案例封面用的腳本。**與 Next.js 網站完全獨立**——網站不會 import 這裡，
放進 repo 只是為了保存「配方」，不影響網站建置或部署。

每張封面都留著自己的 `cover-*.html`，之後要微調直接改 HTML 再截一次即可。

| 檔案 | 案例 | 設計 |
|---|---|---|
| `cover-kaifu.html` | 鎧福旅行社 | 金棕色亞太地球 + 台灣為中心 + 航線（由 `build-cover.mjs` 產生，未進 git） |
| `cover-rag.html` | RAG 問答助手 | 墨綠 + 擬真問答視窗（含引用來源） |
| `cover-yems.html` | 補習班系統 | 深綠 + MacBook / iPhone 裝置圖 |
| `cover-portfolio.html` | 作品集網站 | 玫瑰色 + 帶模型切換鈕的聊天視窗 + 花費帳本卡 |

共用的視覺語言：1600×900（2x 輸出 3200×1800）、左文案（pill → serif 標題 → 副標 → 技術標籤）
+ 右擬真 UI + 深色漸層背景。

## 怎麼用

```bash
cd tools/covers
npm install                              # 第一次才需要
node shoot.mjs cover-portfolio.html      # 產出 output/portfolio.png（3200x1800）
npm run cover                            # 鎧福那張專用（build-cover.mjs + shoot.mjs）
```

`shoot.mjs <檔名>` 用系統 Chrome 把 HTML 截圖成 PNG，輸出到 `output/<名稱>.png`；
省略檔名則沿用 `cover-kaifu.html`。鎧福那張的地球是程式產生的，所以多一支
`build-cover.mjs`（用 d3-geo 把真實世界地圖投影成地球、組成 HTML）。

## 怎麼改封面

**一般封面**（rag / yems / portfolio）：直接編輯對應的 `cover-*.html`——都是純 HTML + CSS，
改文字、顏色、版面都在裡面，改完重跑 `node shoot.mjs cover-xxx.html`。

**鎧福那張**（地球是程式產生的）：打開 `build-cover.mjs`，最上面「可調參數」區塊：

- `CENTER` / `CX` / `CY` / `R`：地球的中心經緯度、畫面位置、大小（`R` 越大越放大）。
- `C`：所有顏色（地、海、台灣、航線、背景…）。
- `ROUTES`：航線起訖（經緯度）。
- `TEXT`：左側標題、副標、技術標籤文字。

改完重跑 `npm run cover`，看 `output/preview.png`。

## ⚠️ 重要

- 這支腳本**只輸出到 `output/`**，**不會**覆蓋 `public/projects/.../cover.jpg`（正式封面）。
- 滿意 preview 後，要不要拿它取代正式封面，請**手動**複製 / 轉檔，例如：
  ```bash
  sips -s format jpeg -s formatOptions 82 output/portfolio.png \
    --out ../../public/projects/portfolio/cover.jpg
  ```
  （這一步請自行確認後再做。）
- `node_modules/`、`output/`、`cover-kaifu.html` 都在 `.gitignore`，不會進 git。

## 資料來源

地圖為 [world-atlas](https://github.com/topojson/world-atlas)（Natural Earth，公眾領域）。
