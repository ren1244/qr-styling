import { QrCode } from '../src/index.js';
import { Canvas } from 'skia-canvas';

describe('檢查 qr-path 產生的路徑是否能正確畫出 QR Code', () => {
    const testStr = [
        '0123456789',
        'ABCDE123',
        '兩個黃鸝鳴翠柳，一行白鷺上青天',
        'QR碼（英語：quick-response code，縮寫：QR code；全稱為快速回應圖碼，簡稱圖碼）是一種二維條碼',
    ];

    test.each(testStr)('QR code rendering for string: %s', (str) => {
        const qr = new QrCode(str, {
            errorCorrection: 'H'
        });

        // 畫到 canvas
        const sz = qr.size;
        const cvs = new Canvas(sz * 10, sz * 10);
        const ctx = cvs.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        ctx.fillStyle = '#000000';
        qr.styling('square').draw(cvs, 0, 0, cvs.width);

        // 檢查每個點
        const imgdata = ctx.getImageData(0, 0, cvs.width, cvs.height).data;

        for (let r = 0; r < sz; ++r) {
            for (let c = 0; c < sz; ++c) {
                const expectedVal = qr.data[r * sz + c] ? 1 : 0;
                const offset = ((r * 10 + 5) * cvs.width + c * 10 + 5) * 4;

                const color = imgdata[offset] << 16 | imgdata[offset + 1] << 8 | imgdata[offset + 2];
                let currentVal = 0;
                if (color === 0) {
                    currentVal = 1;
                } else if (color !== 0xffffff) {
                    throw new Error(`Bad color at (${r}, ${c}): ${color.toString(16).padStart(6, '0')}`);
                }

                expect(currentVal).toBe(expectedVal);
            }
        }
    });
});