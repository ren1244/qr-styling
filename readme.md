# @ren1244/qr-styling

一個現代化、模組化且高度可自訂樣式的 JavaScript QR Code 產生與渲染工具。支援瀏覽器與 Node.js 環境。

## 特點

1. **三階段管線化設計**：將 QR Code 的產生拆分為三個步驟，並提供獨立 API 存取：
   * 原始資料轉為 QR Code 矩陣（0 與 1 組成的陣列）。
   * 將矩陣轉換為標準繪圖命令。
   * 依據繪圖命令輸出為 SVG 或 Canvas 圖片。
2. **自動編碼切換**：自動切換編碼模式，用最少的格子表達相同的資料。
3. **完美解決 SVG 間隙與鋸齒問題**：
   * 傳統作法使用 `shape-rendering="crispEdges"` 會導致圓角產生鋸齒。
   * 本函式庫採用獨特的繪圖路徑建立方式，**在不使用 `crispEdges` 的情況下，既能消除格子間隙，又能保持圓角平滑**。
4. **靈活的版面配置**：提供 API 將 QR Code 「畫」到 Canvas 上的任意位置（例如：可在同一張 Canvas 上自由排版多個 QR Code）。
5. **高度可擴充**：可擴充自訂樣式（Styling）或替換底層 QR Code 核心函式庫。
6. **跨環境支援**：原生支援瀏覽器，在 Node.js 環境下也能自由搭配任何相容 Canvas API 的第三方函式庫（如 `skia-canvas`）。

---

## 安裝

```bash
npm install @ren1244/qr-styling
```

## 使用方式

### 瀏覽器

```javascript
import { QrCode, MixedMode } from "@ren1244/qr-styling/build/browser.esm.js";

// 建立 QR Code
const qr = new QrCode('Some Input Data', {
    errorCorrection: 'H', // 錯誤修正等級 ('L', 'M', 'Q', 'H')，預設為 'M'
    version: 0,           // QR Code 版本 (0 表示自動，或 1-40)，預設為 0
    enableEci: false,     // 是否啟用 ECI，預設為 false
    modes: [MixedMode],   // 允許的編碼模式陣列，預設為 [MixedMode]
});

// 選擇 styling 並渲染
// 內建樣式："classy"、"classy-rounded"、"dots"、"extra-rounded"、"rounded"、"square"
const styling = qr.styling('extra-rounded');

// 產生 SVG（邊長 400 px，padding 40px）
const svgCode = styling.toSvg(400, 40);

// 準備 Canvas
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;

// 畫到 Canvas，左上角座標：(50, 50)，邊長 300
styling.draw(canvas, 50, 50, 300);

```

### Node.js (搭配 skia-canvas)

```javascript
import { Canvas } from 'skia-canvas';
import { QrCode } from "@ren1244/qr-styling";
import fs from 'node:fs';

// 建立 QR Code
const qr = new QrCode('Some Input Data');

// 直接取得 SVG 內容並輸出
const svgCode = qr.styling('square').toSvg(400, 40);
fs.writeFileSync('qrcode.svg', svgCode);

// 準備白色背景的畫布
const cvs = new Canvas(600, 400);
const ctx = cvs.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, cvs.width, cvs.height);
ctx.fillStyle = '#000000';

// 渲染多種內建樣式
qr.styling('classy').draw(cvs, 10, 10, 180);
qr.styling('classy-rounded').draw(cvs, 210, 10, 180);
qr.styling('dots').draw(cvs, 410, 10, 180);
qr.styling('extra-rounded').draw(cvs, 10, 210, 180);
qr.styling('rounded').draw(cvs, 210, 210, 180);
qr.styling('square').draw(cvs, 410, 210, 180);

// 輸出為 PNG 檔案
cvs.toFileSync('img.png', { format: 'png' });
```

## 進階使用

### 新增自訂樣式設計

透過繼承 `StylingBase` 來建立自己的樣式，並用 `QrCode.registryStyling` 進行註冊：

```javascript
import { QrCode, StylingBase } from "@ren1244/qr-styling";

class OldSquare extends StylingBase {
    constructor(data, size) {
        super(data, size);
    }

    getCommands() {
        let commandArray = [];
        for (let r = 0; r < this.size; ++r) {
            for (let c = 0; c < this.size; ++c) {
                if (this.data[r * this.size + c]) {
                    // 目前支援 'M', 'L', 'C', 'Z' 繪製路徑
                    commandArray.push(['M', { x: c, y: r }]);
                    commandArray.push(['L', { x: c + 1, y: r }]);
                    commandArray.push(['L', { x: c + 1, y: r + 1 }]);
                    commandArray.push(['L', { x: c, y: r + 1 }]);
                    commandArray.push('Z');
                }
            }
        }
        return commandArray;
    }
}

// 註冊樣式
QrCode.registryStyling('old-square', OldSquare);

// 使用自訂樣式
const svgCode = new QrCode('test string').styling('old-square').toSvg(400, 40);
```

### 替換核心

如果想改用第三方 QR Code 核心，只需繼承 `QrBase` 並覆寫 `create` 靜態方法：

```javascript
import qrcode from "qrcode-generator";
import { QrBase } from "@ren1244/qr-styling";

// 設定 UTF-8 編碼轉換
qrcode.stringToBytes = (() => {
    let enc = new TextEncoder();
    return function (s) {
        return enc.encode(s);
    }
})();

class CustomQrCode extends QrBase {
    static create(data, typeNumber = 0, errorCorrectionLevel = 'M') {
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(data, 'Byte');
        qr.make();
        const size = qr.getModuleCount();
        const arr = new Uint8Array(size * size);
        for (let y = 0; y < size; ++y) {
            for (let x = 0; x < size; ++x) {
                arr[y * size + x] = qr.isDark(y, x);
            }
        }
        return { size, data: arr };
    }
}

// 使用方式相同
const qr = new CustomQrCode('Some Input Data');
const svgCode = qr.styling('square').toSvg(400, 40);
```
