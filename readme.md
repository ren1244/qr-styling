# @ren1244/qr-styling

A modular and customizable JavaScript QR Code generation and rendering tool. Supports both browser and Node.js environments.

## Features

1. **Automatic Mode Switching**: Automatically switches encoding modes to represent the same data with the fewest modules possible.
2. **Eliminates SVG Gaps and Aliasing**: Utilizes SVG [fill-rule](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule) to generate a single path representing the entire QR Code. This eliminates grid gaps while keeping rounded corners smooth and producing a smaller SVG file size.
3. **Multi-Stage Processing Pipeline**: Splits QR Code generation into three flexible phases:
    * **QR Code Encoding**: Converts raw data into a QR Code matrix (an array of 0s and 1s).
    * **Command Generation**: Transforms the QR Code matrix into drawing commands.
    * **Target Rendering**: Outputs the drawing commands to SVG, Canvas images, or even expandable targets like PDF.
4. **Flexible Layout Configuration**: Provides an API to "draw" the QR Code at any arbitrary position on a Canvas (e.g., freely layout multiple QR Codes on the same Canvas).
5. **Highly Extensible**: Easily extend with custom styling or replace the underlying QR Code core library.
6. **Cross-Environment Support**: Native browser support, with out-of-the-box compatibility in Node.js when paired with any Canvas API-compatible third-party library (such as `skia-canvas`).

## Installation

```bash
npm install @ren1244/qr-styling
```

## Quick Start

### Browser

```javascript
import { QrCode, MixedMode } from "@ren1244/qr-styling/build/browser.esm.js";

// Create QR Code
const qr = new QrCode('Some Input Data', {
    errorCorrection: 'H', // Error correction level ('L', 'M', 'Q', 'H'), default is 'M'
    version: 0,           // QR Code version (0 for automatic, or 1-40), default is 0
    enableEci: false,     // Whether to enable ECI, default is false
    modes: [MixedMode],   // Array of allowed encoding modes, default is [MixedMode]
    autoECLevel: true,    // As long as the version remains unchanged, automatically upgrade the error correction level. Default is false
});

// Select styling and render
// Built-in styles: "classy", "classy-rounded", "dots", "extra-rounded", "rounded", "square"
const styling = qr.styling('extra-rounded');

// Generate SVG (400px side length, 40px padding)
const svgCode = styling.toSvg(400, 40);

// Prepare Canvas
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;

// Draw to Canvas at top-left coordinates: (50, 50), side length 300
styling.draw(canvas, 50, 50, 300);

```

### Node.js (with skia-canvas)

```javascript
import { Canvas } from 'skia-canvas';
import { QrCode } from "@ren1244/qr-styling";
import fs from 'node:fs';

// Create QR Code
const qr = new QrCode('Some Input Data');

// Directly get SVG content and write to file
const svgCode = qr.styling('square').toSvg(400, 40);
fs.writeFileSync('qrcode.svg', svgCode);

// Prepare canvas with a white background
const cvs = new Canvas(600, 400);
const ctx = cvs.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, cvs.width, cvs.height);
ctx.fillStyle = '#000000';

// Render various built-in styles
qr.styling('classy').draw(cvs, 10, 10, 180);
qr.styling('classy-rounded').draw(cvs, 210, 10, 180);
qr.styling('dots').draw(cvs, 410, 10, 180);
qr.styling('extra-rounded').draw(cvs, 10, 210, 180);
qr.styling('rounded').draw(cvs, 210, 210, 180);
qr.styling('square').draw(cvs, 410, 210, 180);

// Output as a PNG file
cvs.toFileSync('img.png', { format: 'png' });
```

## API Reference

### <a name="qrcore-constructor"></a>`new QrCore(data, [option])`

Creates a `QrCore` instance responsible for data encoding and matrix generation.

* **Parameters**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `data` | `string` \| `{mode, data}[]` | **Yes** | The content to be encoded. Accepts a `string` (auto-selected from configured `modes` option) or an array of segment objects (`{mode, data}`) for custom mode control. |
| `option` | `QrCodeOptions` | No | QR Code options. |

* **QrCodeOptions Properties**:

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `errorCorrection` | `"L" \| "M" \| "Q" \| "H"` | `"M"` | Error correction level (`L`: 7%, `M`: 15%, `Q`: 25%, `H`: 30%). |
| `version` | `number` | `0` | QR Code version (`0` for auto-detection, or specify `1` to `40`). |
| `enableEci` | `boolean` | `false` | Whether to enable ECI (Extended Channel Interpretation). |
| `modes` | `(AlphanumericMode \| Utf8ByteMode \| KanjiMode \| NumericMode \| MixedMode)[]` | `[MixedMode]` | Array of allowed encoding modes. |
| `autoECLevel` | `boolean` | `false` | As long as the version remains unchanged, automatically upgrade the error correction level. |

* **Example**

```javascript
import { QrCore, AlphanumericMode, NumericMode, Utf8ByteMode } from '@ren1244/qr-styling';

const core = new QrCore("https://example.com", {
    errorCorrection: "H",
    modes: [AlphanumericMode, NumericMode, Utf8ByteMode]
});
```

### `QrCore.prototype.getSize()`

Gets the number of modules per row/column for this QR Code (excluding quiet zones).

* **Parameters**: None
* **Returns**: `number` - The dimension size of the modules (e.g., 21 for Version 1).

### `QrCore.prototype.getPoint(row, col)`

Gets whether a specific coordinate point is a dark or light module.

* **Parameters**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `row` | `number` | **Yes** | The row index (starting from 0). |
| `col` | `number` | **Yes** | The column index (starting from 0). |

* **Returns**: `0 \| 1 \| null` - Returns `1` if dark, `0` if light, or `null` if out of bounds.

### `QrCore.prototype.getMaskVersion()`

* **Parameters**: None
* **Returns**: `number|null` - The applied mask version.

### `QrCore.prototype.getDetail()`

* **Parameters**: None
* **Returns**: `object` - An object containing the QR Code encoding configurations and raw byte segments.

#### Return Value Structure

| Field | Type | Description |
| :--- | :--- | :--- |
| `version` | `number` | QR Code version number (`1` – `40`). |
| `errorCorrectionLevel` | `string` | Error correction level (`'L'`, `'M'`, `'Q'`, `'H'`). |
| `mask` | `number` | The applied mask pattern reference (`0` – `7`). |
| `segments` | `{ mode: string, data: string \| Uint8Array  \| number }` | List of encoded data segments . Possible `mode` values: `'eci'`, `'alphanumeric'`, `'byte'`, `'kanji'`, `'numeric'`. |

----

### `new QrCode(data, [option])`

Creates a `QrCode` instance (whose core is powered by `QrCore`).

* **Parameters**: Same as `QrCore`, please refer to [`new QrCore(data, [option])`](#qrcore-constructor).
* **Example**:

```javascript
import { QrCode } from '@ren1244/qr-styling';
const qr = new QrCode("https://example.com", {
    errorCorrection: "H",
});
```

#### Instance Properties

##### `size`

* **Type**: `number`
* **Description**: The grid size (number of modules per side) of the QR Code.

##### `data`

* **Type**: `Uint8Array`
* **Description**: The module grid data, stored as a `Uint8Array` of length `size * size` where each element represents a black or white module.

##### `detail`

* **Type**: `{ getDetail: () => object }`
* **Description**: An object containing low-level encoding details. Call `qr.detail.getDetail()` to retrieve the breakdown (returns the same output as `QrCore.prototype.getDetail()` ).

### `QrCode.registryStyling(styling, stylingClass)` (inheriting from `QrBase`)

Registers a custom style.

* **Parameters**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `styling` | `string` | **Yes** | The custom style name. |
| `stylingClass` | `StylingBase` | **Yes** | A class inheriting from `StylingBase` that overrides the `getCommands` method. |

### `QrCode.prototype.styling(styling)` (inheriting from `QrBase`)

Gets the styling instance for the QR Code.

* **Parameters**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `styling` | `"classy" \| "classy-rounded" \| "dots" \| "extra-rounded" \| "rounded" \| "square" \| string` | **Yes** | Built-in or custom style name. |

* **Returns**: `StylingBase` - Returns a style instance extending `StylingBase`.

----

### `StylingBase.prototype.getD()`

Gets the data required for the `d` attribute of an SVG path element.

* **Parameters**: None
* **Returns**: `string`

### `StylingBase.prototype.toSvg(edge, padding, quietFlag)`

Gets the SVG content (from `<svg` ... to `</svg>`).

* **Parameters**: 

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `edge` | `number` | **Yes** | The side length of the SVG image in pixels (px). |
| `padding` | `number` | **Yes** | The padding size, in either **pixels (px)** or **number of modules**, determined by `quietFlag`. |
| `quietFlag` | `boolean` | No | If `true`, `padding` is measured in **number of modules**; otherwise, in **pixels (px)**. |

* **Returns**: `string`

### `StylingBase.prototype.draw(canvas, x, y, edgeSize)`

Draws this style onto a canvas at a given location (its color and coordinate system are affected by prior configurations).

* **Parameters**: 

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `canvas` | `HTMLCanvasElement` | **Yes** | A `Canvas` object compatible with `HTMLCanvasElement`. |
| `x` | `number` | **Yes** | The x-coordinate. |
| `y` | `number` | **Yes** | The y-coordinate. |
| `edgeSize` | `number` | **Yes** | The side length of the QR Code (excluding quiet zones). |

* **Returns**: None

## Advanced Usage

### Custom Input Data

When passing a plain string, the encoder automatically selects the optimal mode **from the available `modes` option** to yield the shortest data length.  
If you need manual control over mode selection, you can pass an array of `{ mode, data }` segments instead:

```javascript
import { QrCode, AlphanumericMode, Utf8ByteMode, RawByteMode } from "@ren1244/qr-styling";

// Create QR Code with custom segments
const qr = new QrCode([
    { mode: AlphanumericMode, data: "ABC123" },
    { mode: Utf8ByteMode, data: "https" },
    { mode: RawByteMode, data: new Uint8Array([65, 66, 67]) },
]);
```

| Mode | `data` Type | Description |
| :--- | :--- | :--- |
| `AlphanumericMode` | `string` | Uppercase letters, digits, and special characters |
| `NumericMode` | `string` | Digits (0-9) |
| `KanjiMode` | `string` | Shift JIS Kanji characters |
| `Utf8ByteMode` | `string` | UTF-8 encoded text |
| `RawByteMode` | `Uint8Array` | Binary data |
| `MixedMode` | `string` | Auto-segmented string (rarely used manually) |

### Creating Custom Styles

Create your own style by extending `StylingBase` and registering it via `QrCode.registryStyling`:

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
                    // Currently supports 'M', 'L', 'C', 'Z' for drawing paths
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

// Register the custom style
QrCode.registryStyling('old-square', OldSquare);

// Use the custom style
const svgCode = new QrCode('test string').styling('old-square').toSvg(400, 40);
```

### Replacing the Core Library

If you prefer to use a third-party QR Code core library, simply extend `QrBase` and override the `create` static method:

```javascript
import qrcode from "qrcode-generator";
import { QrBase } from "@ren1244/qr-styling";

// Setup UTF-8 encoding conversion
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

// Usage remains the same
const qr = new CustomQrCode('Some Input Data');
const svgCode = qr.styling('square').toSvg(400, 40);
```
