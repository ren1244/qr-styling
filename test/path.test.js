import { QrCode, StylingBase } from '../src/index.js';
import { Canvas, Path2D } from 'skia-canvas';

class SimpleSquare extends StylingBase {
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

QrCode.registryStyling('simple-square', SimpleSquare);

const pixelPerGrid = 10;

function getCanvas(styling, size) {
    const edge = (size + 2) * pixelPerGrid;
    const cvs = new Canvas(edge, edge);
    const ctx = cvs.getContext('2d');

    ctx.save();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, edge, edge);

    ctx.transform(pixelPerGrid, 0, 0, pixelPerGrid, pixelPerGrid, pixelPerGrid);
    ctx.fillStyle = '#000000';
    ctx.fill(new Path2D(styling.getD()));

    ctx.restore();
    return cvs;
}

let idCount = 0;

function getScore(cvs1, cvs2, size) {
    const edge = cvs1.width;
    if (cvs1.height !== edge || cvs2.width !== edge || cvs2.height !== edge) {
        throw 'canvas 邊長不一致';
    }

    const data1 = cvs1.getContext('2d').getImageData(0, 0, edge, edge).data;
    const data2 = cvs2.getContext('2d').getImageData(0, 0, edge, edge).data;

    let score = 0;
    // 比對每個格子。為避免反鋸齒影響，只比較 padding 1px 內的方形區域
    for (let r = 0; r < size; ++r) {
        for (let c = 0; c < size; ++c) {
            for (let y = 1; y < pixelPerGrid - 1; ++y) {
                for (let x = 1; x < pixelPerGrid - 1; ++x) {
                    const offset = ((r + 1) * pixelPerGrid + y) * edge + (c + 1) * pixelPerGrid + x << 2;
                    if (
                        data1[offset] !== data2[offset] ||
                        data1[offset + 1] !== data2[offset + 1] ||
                        data1[offset + 2] !== data2[offset + 2] ||
                        data1[offset + 3] !== data2[offset + 3]
                    ) {
                        ++score;
                    }
                }
            }
        }
    }
    return score;
}

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

        const cvs1 = getCanvas(qr.styling('square'), qr.size);
        const cvs2 = getCanvas(qr.styling('simple-square'), qr.size);

        expect(getScore(cvs1, cvs2, qr.size)).toBe(0);
    });
});