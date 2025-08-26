import QrCore from './core/qrcode.js';
import QrBase from "./qr-base.js";
import StylingBase from "./styling/styling-base.js";

class QrCode extends QrBase {
    static create(data, errorCorrectionLevel, version) {
        const qr = new QrCore(data, errorCorrectionLevel, version);
        const size = qr.getSize();
        const arr = new Uint8Array(size * size);
        for (let r = 0; r < size; ++r) {
            for (let c = 0; c < size; ++c) {
                arr[r * size + c] = qr.getPoint(r, c);
            }
        }
        return { size, data: arr };
    }
}

export { QrCode, QrBase, StylingBase, QrCore };
