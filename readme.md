## 使用方式

這個函式庫並不包含 QR Code 核心，也不預裝 node 環境的 canvas，需手動安裝。

### 以下以 qrcode-generator + skia-canvas 為例子：

先安裝所需函式庫

```
npm i qrcode-generator skia-canvas
```

範例

```javascript
import qrcode from "qrcode-generator";
import { Canvas } from 'skia-canvas';
import { QrBase } from "@ren1244/qr-styling";
import fs from 'node:fs';

// convert string to utf-8
qrcode.stringToBytes = (() => {
    let enc = new TextEncoder();
    return function (s) {
        return enc.encode(s);
    }
})();

// 使用第三方 QR Code 核心：繼承 QrBase 並覆寫 create 靜態方法
class QrCode extends QrBase {
    static create(data, errorCorrectionLevel, version) {
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

// 準備白色背景的畫布
const cvs = new Canvas(600, 400);
const ctx = cvs.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, cvs.width, cvs.height);
ctx.fillStyle = '#000000';

// 建立 QR Code
const qr = new QrCode('兩個黃鸝鳴翠柳');

// 選擇 styling 並畫到畫布上
qr.styling('classy').draw(cvs, 10, 10, 180);
qr.styling('classy-rounded').draw(cvs, 210, 10, 180);
qr.styling('dots').draw(cvs, 410, 10, 180);
qr.styling('extra-rounded').draw(cvs, 10, 210, 180);
qr.styling('rounded').draw(cvs, 210, 210, 180);
qr.styling('square').draw(cvs, 410, 210, 180);

// 輸出為 png 檔案
cvs.toFileSync('img.png', { format: 'png' });

// 直接取得 svg 內容並輸出
const svgCode = qr.styling('square').toSvg(400, 40);
fs.writeFileSync('qrcode.svg', svgCode);
```
