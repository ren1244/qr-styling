import { describe, expect, test } from '@jest/globals';
import QrCode from '../src/qrcode.js';
import NumericMode from '../src/mode/numeric.js';
import Binary from '../src/binary.js';

describe('constructor', () => {
    test('', () => {
        let qr = new QrCode('01234', 'L');
        expect(qr.version).toBe(1);
        expect(qr.mode).toBeInstanceOf(NumericMode);
        expect(qr.dataLen).toBe(19);
        expect(qr.ecLen).toBe(7);
        expect(qr.group).toEqual([1, 19]);
        expect(qr.nRows).toBe(1);
        expect(qr.remainBits).toBe(0);
        expect(qr.bitSize).toBe(208);
        expect(qr.byteSize).toBe(26);
    });

    test('', () => {
        let qr = new QrCode('01234', 'Q', 30);
        expect(qr.version).toBe(30);
        expect(qr.mode).toBeInstanceOf(NumericMode);
        expect(qr.dataLen).toBe(985);
        expect(qr.ecLen).toBe(30);
        expect(qr.group).toEqual([15, 24, 25, 25]);
        expect(qr.nRows).toBe(40);
        expect(qr.remainBits).toBe(3);
        expect(qr.bitSize).toBe(17483);
        expect(qr.byteSize).toBe(2186);
    });

    test('', () => {
        let qr = new QrCode('6'.repeat(18), 'H');
        expect(qr.version).toBe(2);
        expect(qr.mode).toBeInstanceOf(NumericMode);
        expect(qr.dataLen).toBe(16);
        expect(qr.ecLen).toBe(28);
        expect(qr.group).toEqual([1, 16]);
        expect(qr.nRows).toBe(1);
        expect(qr.remainBits).toBe(7);
        expect(qr.bitSize).toBe(44 * 8 + 7);
        expect(qr.byteSize).toBe(45);
    });

});

describe('測試 padding', () => {

    function QrCodeMock(size) {
        this.dataLen = size;
        this.binary = new Binary(this.dataLen);
    }

    Object.assign(QrCodeMock.prototype, QrCode.prototype);
    QrCodeMock.prototype.constructor = QrCodeMock;

    test('填0測試', () => {
        let ans = [
            '1111111111111111',
            '1111111111111110',
            '1111111111111100',
            '1111111111111000',
            '1111111111110000',
            '1111111111100000',
            '1111111111000000',
            '1111111110000000',
            '1111111100000000',
            '1111111000000000',
            '1111110000000000',
            '1111100000000000',
            '1111000011101100',
            '1110000011101100',
            '1100000011101100',
        ];
        for (let i = 0; i < 15; ++i) {
            let qr = new QrCodeMock(2);
            qr.binary.write(0xffff >>> i, 16 - i);
            qr.padding();
            expect(qr.binary.toString()).toBe(ans[i]);
        }

    });

    test('0xec11 填充測試', () => {
        let qr = new QrCodeMock(4);
        qr.binary.write(0xffff >>> 14, 16 - 14);
        qr.padding();
        expect(qr.binary.toString()).toBe('11000000111011000001000111101100');
    })
});

describe('錯誤校正、群組重排', () => {
    function Mock(msg, ecBytes, group, remainBits) {
        let rowCount = 0
        for (let i = 0; i < group.length; i += 2) {
            rowCount += group[i];
        }
        this.nRows = rowCount;

        this.binary = new Binary(msg.length + ecBytes * rowCount);
        msg.forEach(m => {
            this.binary.write(m, 8);
        });
        this.bitSize = (msg.length + ecBytes * rowCount) * 8 + remainBits;
        this.byteSize = this.bitSize + 7 >>> 3;
        this.group = group;
        this.ecLen = ecBytes;
        this.dataLen = msg.length;
        this.remainBits = remainBits;
    }

    Object.assign(Mock.prototype, QrCode.prototype);
    Mock.prototype.constructor = Mock;

    let msg = Array.from({ length: 22 }, (x, i) => i + 1);
    let m = new Mock(msg, 2, [2, 3, 4, 4], 3);
    m.writeErrorCorrection();
    let ecRes = m.binary.toString();
    let ecAns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 4, 4, 45, 42, 4, 8, 172, 168, 20, 8, 81, 85];
    ecAns = ecAns.map(x => x.toString(2).padStart(8, '0')).join('');
    m.rerange();
    let reangeRes = m.binary.toString();
    let reangeAns = [1, 4, 7, 11, 15, 19, 2, 5, 8, 12, 16, 20, 3, 6, 9, 13, 17, 21, 10, 14, 18, 22, 4, 45, 4, 172, 20, 81, 4, 42, 8, 168, 8, 85];
    reangeAns = reangeAns.map(x => x.toString(2).padStart(8, '0')).join('') + '0'.repeat(m.remainBits);
    test('測試 1~22 @ group(2,3,4,4), ecLen = 2', () => {
        expect(ecRes).toBe(ecAns);
    });
    test('轉置後', () => {
        expect(reangeRes).toBe(reangeAns);
    });
});