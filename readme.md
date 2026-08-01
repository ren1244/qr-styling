## 特點

1. 將 QR Code 的產生分為三個步驟，提供 API 可以存取任一步驟的資料
    1. 把資料轉成 QR Code（可能是一個 0 與 1 組成的陣列）
    2. 把 QR Code 轉換成繪圖命令
    3. 依據繪圖命令，輸出成圖片，例如 svg 或 canvas
2. 自動切換編碼，讓 QR Code 能以較少的格子表達同樣的資料
3. 解決 SVG 在部分檢視器中，格子間會有間隙，或是圓角會有鋸齒狀的問題：
    * 傳統的作法是用 `shape-rendering="crispEdges"` 解決間隙，但這會造成圓角部分產生鋸齒狀
    * 這個函式庫採用不同的繪圖路徑建立方式，可以在不使用 `shape-rendering="crispEdges"` 下，也不會產生間隙
4. 提供 API 把 QR Code 「畫」到 canvas 上的任一個位置，讓使用者自己設計想要的結果。
    * 例如：可以在同一張 canvas 上畫多個 QR Code
5. 可以自行擴充設計樣式
6. 在 node 環境，使用者可以自行選擇與瀏覽器的 canvas 有相同 API 的任一函式庫

## 使用方式

### 一般使用

#### 瀏覽器

```javascript
import { QrCode } from "@ren1244/qr-styling/build/browser.esm.js";

// 建立 QR Code
const qr = new QrCode('Some Input Data', 'H');

// 選擇 styling 並畫到畫布上
// 內建的 styling 有："classy"、"classy-rounded"、"dots"、"extra-rounded"、"rounded"、"square"
const styling = qr.styling('extra-rounded');

// 產生 svg（邊長 400 px，padding 40px）
const svgCode = styling.toSvg(400, 40);

// 準備 canvas
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;
// 畫到 canvas，左上角座標：(50, 50)，邊長 300
styling.draw(canvas, 50, 50, 300);

```

#### node

這個範例使用 [skia-canvas](https://www.npmjs.com/package/skia-canvas) 作為 canvas

```javascript
import { Canvas } from 'skia-canvas';
import { QrCode } from "@ren1244/qr-styling";
import fs from 'node:fs';

// 建立 QR Code
const qr = new QrCode('Some Input Data', 'H');

// 直接取得 svg 內容並輸出
const svgCode = qr.styling('square').toSvg(400, 40);
fs.writeFileSync('qrcode.svg', svgCode);

// 準備白色背景的畫布
const cvs = new Canvas(600, 400);
const ctx = cvs.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, cvs.width, cvs.height);
ctx.fillStyle = '#000000';

// 選擇 styling 並畫到畫布上
qr.styling('classy').draw(cvs, 10, 10, 180);
qr.styling('classy-rounded').draw(cvs, 210, 10, 180);
qr.styling('dots').draw(cvs, 410, 10, 180);
qr.styling('extra-rounded').draw(cvs, 10, 210, 180);
qr.styling('rounded').draw(cvs, 210, 210, 180);
qr.styling('square').draw(cvs, 410, 210, 180);

// 輸出為 png 檔案
cvs.toFileSync('img.png', { format: 'png' });
```

### 進階使用

#### 新增樣式設計

`QrCode.registryStyling` 用來註冊 styling
每個 styling 都是一個繼承 StylingBase 的類別

```javascript
import { QrCode, StylingBase } from "@ren1244/qr-styling";

// 先繼承 StylingBase
class OldSquare extends StylingBase {
    constructor(data, size) {
        // 這將會設定 this.data 與 this.size
        super(data, size);
    }

    getCommands() {
        let commandArray = [];
        for (let r = 0; r < this.size; ++r) {
            for (let c = 0; c < this.size; ++c) {
                if (this.data[r * this.size + c]) {
                    // 目前只支援用 'M', 'L', 'C', 'Z' 來畫路徑
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

// 再註冊到 QrCode
QrCode.registryStyling('old-square', OldSquare);

// styling 方法就可以使用 'old-square' 了
const svgCode = new QrCode('test string').styling('old-square').toSvg(400, 40);
```

#### 替換核心

如果想改用第三方函式庫作為 QR Code 核心
可以繼承 QrBase 並覆寫 create 靜態方法

```javascript
import qrcode from "qrcode-generator";
import { QrBase } from "@ren1244/qr-styling";

// convert string to utf-8
qrcode.stringToBytes = (() => {
    let enc = new TextEncoder();
    return function (s) {
        return enc.encode(s);
    }
})();

// 使用第三方 QR Code 核心：繼承 QrBase 並覆寫 create 靜態方法
class QrCode extends QrBase {
    static create(data, errorCorrectionLevel, version, enableEci) {
        version = version || 0;
        if (['L', 'M', 'Q', 'H'].indexOf(errorCorrectionLevel) < 0) {
            errorCorrectionLevel = 'M';
        }
        const qr = qrcode(version, errorCorrectionLevel);
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

// 後續即可使用 QrCode 如之前的範例
```
