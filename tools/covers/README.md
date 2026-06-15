# 封面產圖工具（covers）

產生作品集案例封面用的腳本。**與 Next.js 網站完全獨立**——網站不會 import 這裡，
放進 repo 只是為了保存「配方」，不影響網站建置或部署。

目前包含：

- **鎧福旅行社** 封面：金棕色亞太地球 + 台灣為中心 + 航線 + 左側文字。

## 怎麼用

```bash
cd tools/covers
npm install        # 第一次才需要（會裝 d3-geo / playwright 等，約 8 個套件）
npm run cover      # 產出 output/preview.png（3200x1800）
```

`npm run cover` = `build-cover.mjs`（用 d3-geo 把真實世界地圖投影成地球、組成 HTML）
+ `shoot.mjs`（用系統 Chrome 把 HTML 截圖成 PNG）。

## 怎麼改封面

打開 `build-cover.mjs`，最上面「可調參數」區塊：

- `CENTER` / `CX` / `CY` / `R`：地球的中心經緯度、畫面位置、大小（`R` 越大越放大）。
- `C`：所有顏色（地、海、台灣、航線、背景…）。
- `ROUTES`：航線起訖（經緯度）。
- `TEXT`：左側標題、副標、技術標籤文字。

改完重跑 `npm run cover`，看 `output/preview.png`。

## ⚠️ 重要

- 這支腳本**只輸出到 `output/preview.png`**，**不會**覆蓋 `public/projects/.../cover.jpg`（正式封面）。
- 滿意 preview 後，要不要拿它取代正式封面，請**手動**複製 / 轉檔，例如：
  ```bash
  sips -s format jpeg output/preview.png --out ../../public/projects/kaifu-next/cover.jpg
  ```
  （這一步請自行確認後再做。）
- `node_modules/`、`output/`、`cover-kaifu.html` 都在 `.gitignore`，不會進 git。

## 資料來源

地圖為 [world-atlas](https://github.com/topojson/world-atlas)（Natural Earth，公眾領域）。
