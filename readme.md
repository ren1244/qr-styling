# @ren1244/qr-styling

一個模組化且可自訂樣式的 JavaScript QR Code 產生與渲染工具。支援瀏覽器與 Node.js 環境。

## 特點

1. **自動編碼切換**：自動切換編碼模式，用最少的格子表達相同的資料。
2. **解決 SVG 間隙與鋸齒問題**：利用 [fill-rule](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule) 產生表達整個 QR Code 的路徑。既能消除格子間隙，又能保持圓角平滑，同時產生的 svg 檔案也比較小。
3. **分段式處理流程**：將 QR Code 的生成拆成三個階段，使用起來更彈性：
   * **Qr Code 編碼**：原始資料轉為 QR Code 矩陣（0 與 1 組成的陣列）。
   * **產生繪圖命令**：將 QR Code 矩陣轉換為繪圖命令。
   * **渲染到目標**：依據繪圖命令輸出為 SVG、Canvas 圖片（甚至可擴充支援 PDF）。
4. **靈活的版面配置**：提供 API 將 QR Code 「畫」到 Canvas 上的任意位置（例如：可在同一張 Canvas 上自由排版多個 QR Code）。
5. **高度可擴充**：可擴充自訂樣式（Styling）或替換底層 QR Code 核心函式庫。
6. **跨環境支援**：原生支援瀏覽器，在 Node.js 環境下也能自由搭配任何相容 Canvas API 的第三方函式庫（如 `skia-canvas`）。

## 安裝

```bash
npm install @ren1244/qr-styling
```

## 快速開始

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

## API 參考

### <a name="qrcore-constructor"></a>`new QrCore(data, [option])`

產生 QrCore 實例，負責資料編碼與產生矩陣。

* **參數 (Parameters)**:

| 參數名稱 | 型別 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| `data` | `string` | **是** | 要被編碼進 QR Code 的內容（例如網址或文字）。 |
| `option` | `QrCodeOptions` | 否 | QR Code 選項。 |

* **QrCodeOptions 屬性說明**:

| 屬性名稱 | 型別 | 預設值 | 說明 |
| :--- | :--- | :--- | :--- |
| `errorCorrection` | `"L" \| "M" \| "Q" \| "H"` | `"M"` | 錯誤修正等級 (`L`: 7%, `M`: 15%, `Q`: 25%, `H`: 30%)。 |
| `version` | `number` | `0` | QR Code 版本（`0` 表示自動偵測，或指定 `1` 至 `40`）。 |
| `enableEci` | `boolean` | `false` | 是否啟用 ECI (Extended Channel Interpretation)。 |
| `modes` | `(AlphanumericMode \| ByteMode \| KanjiMode \| NumericMode \| MixedMode)[]` | `[MixedMode]` | 允許的編碼模式陣列。 |

* **範例 (Example)**

```javascript
import { QrCore, AlphanumericMode, NumericMode, ByteMode } from '@ren1244/qr-styling';

const core = new QrCore("https://example.com", {
    errorCorrection: "H",
    modes: [AlphanumericMode, NumericMode, ByteMode]
});
```

### `QrCore.prototype.getSize()`

取得此 QR Code 行(列)的格子數(不含靜默區域)

* **參數**: 無
* **回傳值**: `number` - 模組的尺寸大小（例如版本 1 為 21）

### `QrCore.prototype.getPoint(row, col)`

取得某座標點的格子是黑色還是白色。

* **參數**:

| 參數名稱 | 型別 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| `row` | `number` | **是** | 第幾列（從 `0` 開始）。 |
| `col` | `number` | **是** | 第幾行（從 `0` 開始）。 |

* **回傳值**: `0 \| 1 \| null` - 如果是黑色回傳 `1`，白色回傳 `0`，超出範圍則回傳 `null`。

### `QrCore.prototype.getMaskVersion()`

* **參數**: 無
* **回傳值**: `number|null` - 採用的 mask 版本

----

### `new QrCode(data, [option])`

產生 QrCode 實例（其核心為 QrCore）。

* **參數**: 參數與 `QrCore` 相同，請參考 [`new QrCore(data, [option])`](#qrcore-constructor)。
* **範例**:

```javascript
import { QrCode } from '@ren1244/qr-styling';
const qr = new QrCode("https://example.com", {
    errorCorrection: "H",
});
```

### `QrCode.registryStyling(styling, stylingClass)`

註冊一個自訂樣式（繼承自 `QrBase`）。

* **參數**:

| 參數名稱 | 型別 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| `styling` | `string` | **是** | 自訂樣式名稱。 |
| `stylingClass` | `StylingBase` | **是** | 繼承 `StylingBase` 並覆寫 `getCommands` 方法的類別。 |

### `QrCode.prototype.styling(styling)`

取得 QR Code 的樣式（繼承自 `QrBase`）。

* **參數**:

| 參數名稱 | 型別 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| `styling` | `"classy" \| "classy-rounded" \| "dots" \| "extra-rounded" \| "rounded" \| "square" \| string` | **是** | 內建或自訂的樣式名稱。 |

* **回傳值**: `StylingBase` - 回傳繼承自 StylingBase 的樣式實例

----

### `StylingBase.prototype.getD()`

取得 SVG 中 path 的 d 屬性所需的資料。

* **參數**: 無
* **回傳值**: `string`

### `StylingBase.prototype.toSvg(edge, padding, quietFlag)`

取得 SVG 內容（從 `<svg ...` 到 `</svg>`）。

* **參數**: 

| 參數名稱 | 型別 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| `edge` | `number` | **是** | SVG 圖片邊長（px）。 |
| `padding` | `number` | **是** | 白邊大小，單位為 **px** 或**格子數**，由 `quietFlag` 決定 |
| `quietFlag` | `boolean` | 否 | 若為 `true`，`padding` 為**格子數**，否則為 **px** |

* **回傳值**: `string`

### `StylingBase.prototype.draw(canvas, x, y, edgeSize)`

畫此樣式到 canvas 某處（其顏色與座標系統受呼叫前的設定影響）。

* **參數**: 

| 參數名稱 | 型別 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| `canvas` | `HtmlCanvasElement` | **是** | 與 `HtmlCanvasElement` 相容的 `Canvas` 物件 |
| `x` | `number` | **是** | x 座標 |
| `y` | `number` | **是** | y 座標 |
| `edgeSize` | `number` | **是** | QrCode 邊長（不含靜默區域） |

* **回傳值**: 無

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
