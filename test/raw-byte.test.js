import { QrCode } from '../src/index.js';
import { Buffer } from 'node:buffer';

// input
const version = 2;
const ecLevel = 'L';
const mask = 3;
const bytes = 'gCkPowkBum7g+m4nYA4IS4mDsIEj25GKkBjmopUKAOwR7A==';

// expected output
const size = 25;
// 經過 compressUint8Array 壓縮後的結果
const data = 'f7H8g5wKdp3W7bqo2xVIN4ih4F9VfwAmAE+Vci3JcXV5CnI4Kkjtc0FWlKCR6fTe7pxsRb8AuiL9QVYJsovepfih65ZgV5S0oDMcfxV9AA==';

/**
 * @param {Uint8Array} arr
 */
function compressUint8Array(arr) {
    const tmp = new Uint8Array(arr.length + 7 >>> 3);
    for (let i = 0; i < arr.length; ++i) {
        if (arr[i]) {
            tmp[i >>> 3] |= 1 << (i & 7);
        }
    }
    return Buffer.from(tmp.buffer).toString('base64');
}

describe('確認 raw-bytes 功能', () => {
    const buf = Buffer.from(bytes, 'base64');
    const rawBytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.length / buf.BYTES_PER_ELEMENT);

    test('正常運作', () => {
        const qr = new QrCode(rawBytes, {
            version,
            errorCorrection: ecLevel,
            mask,
        });
        expect(qr.size).toBe(size);
        expect(compressUint8Array(qr.data)).toBe(data);
    });

    test('遮罩錯誤', () => {
        const qr = new QrCode(rawBytes, {
            version,
            errorCorrection: ecLevel,
            mask: (mask + 1) % 8,
        });
        expect(qr.size).toBe(size);
        expect(compressUint8Array(qr.data)).not.toBe(data);
    });

    test('缺少 version', () => {
        expect(() => {
            const qr = new QrCode(rawBytes, {
                errorCorrection: ecLevel,
                mask,
            });
        }).toThrow();
    });

    test('缺少 ecLevel', () => {
        expect(() => {
            const qr = new QrCode(rawBytes, {
                version,
                mask,
            });
        }).toThrow();
    });

    test('缺少 mask', () => {
        expect(() => {
            const qr = new QrCode(rawBytes, {
                version,
                errorCorrection: ecLevel,
            });
        }).toThrow();
    });
});