import QrCore from './core/qrcode.js';
import QrBase from "./qr-base.js";
import StylingBase from "./styling/styling-base.js";
import AlphanumericMode from './core/mode/alphanumeric.js';
import ByteMode from './core/mode/byte.js';
import Utf8ByteMode from './core/mode/utf8.js';
import KanjiMode from './core/mode/kanji.js';
import NumericMode from './core/mode/numeric.js';
import MixedMode from './core/mode/mixed.js';

class QrCode extends QrBase {
    static create(...args) {
        const qr = new QrCore(...args);
        const size = qr.getSize();
        const arr = new Uint8Array(size * size);
        for (let r = 0; r < size; ++r) {
            for (let c = 0; c < size; ++c) {
                arr[r * size + c] = qr.getPoint(r, c);
            }
        }
        return {
            size,
            data: arr,
            detail: {
                getDetail() {
                    return qr.getDetail();
                }
            }
        };
    }
}

// v1.x.x: ByteMode was an alias for Utf8ByteMode, RawByteMode was supported.
// v2.0.0+: RawByteMode removed; ByteMode is now its own type.
export { QrCode, QrBase, StylingBase, QrCore, AlphanumericMode, Utf8ByteMode, Utf8ByteMode as ByteMode, ByteMode as RawByteMode, KanjiMode, NumericMode, MixedMode };
