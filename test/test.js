import { describe, expect, test } from '@jest/globals';
import Binary from '../src/binary.js';
import NumericMode from '../src/mode/numeric.js';
import QrCode from '../src/qrcode.js';

describe('測試 Binary 的顯示功能', () => {
    test('顯示 6 bit 數值', () => {
        let bin = new Binary(10);
        bin.arr = new Uint8Array([0x9c]);
        bin.buffer = bin.arr.buffer;
        bin.len = 6;
        expect(bin.toString()).toBe('100111');
    });

    test('顯示 10 bit 數值', () => {
        let bin = new Binary(10);
        bin.arr = new Uint8Array([0x9c, 0x40]);
        bin.buffer = bin.arr.buffer;
        bin.len = 10;
        expect(bin.toString()).toBe('1001110001');
    });
});

describe('測試 Binary 的寫入功能', () => {

    test('寫入1', () => {
        let bin = new Binary(10);
        bin.write(1, 1);
        expect(bin.toString()).toBe('1');
    });

    test('寫入 111001', () => {
        let bin = new Binary(10);
        bin.write(0x39, 6);
        expect(bin.toString()).toBe('111001');
    });

    test('分段寫入 11101100', () => {
        let bin = new Binary(10);
        bin.write(0x1d, 5);
        bin.write(0x4, 3);
        expect(bin.toString()).toBe('11101100');
    });

    test('分段寫入 10101010 11101100', () => {
        let bin = new Binary(10);
        bin.write(0xaa, 8);
        bin.write(0x1d, 5);
        bin.write(0x4, 3);
        expect(bin.toString()).toBe('1010101011101100');
    });

    test('分段寫入 010 11101100', () => {
        let bin = new Binary(10);
        bin.write(0xa, 4);
        bin.write(0x1d, 5);
        bin.write(0x4, 3);
        expect(bin.toString()).toBe('101011101100');
    });
});

describe('NumericMode 靜態方法測試', () => {
    test('測試 create 方法', () => {
        expect(NumericMode.create('1234')).toBeInstanceOf(NumericMode);
        expect(NumericMode.create(' 1234')).toBeNull();
        expect(NumericMode.create('1234 ')).toBeNull();
        expect(NumericMode.create('12 34')).toBeNull();
        expect(NumericMode.create('A234')).toBeNull();
    });

    test('測試 getCharCountIndicatorLength 方法', () => {
        for (let i = 1; i <= 9; ++i) {
            expect(NumericMode.getCharCountIndicatorLength(i)).toBe(10);
        }
        for (let i = 10; i <= 26; ++i) {
            expect(NumericMode.getCharCountIndicatorLength(i)).toBe(12);
        }
        for (let i = 27; i <= 40; ++i) {
            ``
            expect(NumericMode.getCharCountIndicatorLength(i)).toBe(14);
        }
    });
});

describe('NumericMode 類別測試', () => {
    test('測試 getLength 方法', () => {
        expect(NumericMode.create('1', 1).getLength()).toBe(18);
        expect(NumericMode.create('1', 10).getLength()).toBe(20);
        expect(NumericMode.create('1', 27).getLength()).toBe(22);

        expect(NumericMode.create('12', 1).getLength()).toBe(21);
        expect(NumericMode.create('12', 10).getLength()).toBe(23);
        expect(NumericMode.create('12', 27).getLength()).toBe(25);

        expect(NumericMode.create('123', 1).getLength()).toBe(24);
        expect(NumericMode.create('123', 10).getLength()).toBe(26);
        expect(NumericMode.create('123', 27).getLength()).toBe(28);

        expect(NumericMode.create('1234', 1).getLength()).toBe(28);
        expect(NumericMode.create('1234', 10).getLength()).toBe(30);
        expect(NumericMode.create('1234', 27).getLength()).toBe(32);

        expect(NumericMode.create('12345', 1).getLength()).toBe(31);
        expect(NumericMode.create('12345', 10).getLength()).toBe(33);
        expect(NumericMode.create('12345', 27).getLength()).toBe(35);
    });

    test('測試 write 方法', () => {
        let mode, bin;

        mode = NumericMode.create('5', 8);
        bin = new Binary(mode.getLength() + 7 >>> 3);
        mode.write(bin);
        expect(bin.toString()).toBe('0001 0000000001 0101'.replaceAll(' ', ''));

        mode = NumericMode.create('56', 26);
        bin = new Binary(mode.getLength() + 7 >>> 3);
        mode.write(bin);
        expect(bin.toString()).toBe('0001 000000000010 0111000'.replaceAll(' ', ''));

        mode = NumericMode.create('567', 40);
        bin = new Binary(mode.getLength() + 7 >>> 3);
        mode.write(bin);
        expect(bin.toString()).toBe('0001 00000000000011 1000110111'.replaceAll(' ', ''));

        mode = NumericMode.create('5678', 25);
        bin = new Binary(mode.getLength() + 7 >>> 3);
        mode.write(bin);
        expect(bin.toString()).toBe('0001 000000000100 1000110111 1000'.replaceAll(' ', ''));

        mode = NumericMode.create('56789', 25);
        bin = new Binary(mode.getLength() + 7 >>> 3);
        mode.write(bin);
        expect(bin.toString()).toBe('0001 000000000101 1000110111 1011001'.replaceAll(' ', ''));
    });
});

describe('測試 padding', () => {

    function QrCodeMock(size) {
        this.len = size;
        this.binary = new Binary(this.len);
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