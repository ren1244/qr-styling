import { QrCode, QrCore, AlphanumericMode, KanjiMode, NumericMode, MixedMode, Utf8ByteMode, RawByteMode } from '../src/index.js';
import { generate, correction, mode } from 'lean-qr';

const testDatas = [
    {
        label: "無參數",
        tests: [
            {
                input: ["abcdefabcdefabcdefabcdef"],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "M",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": [97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102] }
                    ]
                }
            }
        ]
    },
    {
        label: "errorCorrection 測試",
        tests: [
            {
                input: ["abcdefabcdefabcdefabcdef", {
                    version: 0,
                    errorCorrection: "L",
                    autoECLevel: false,
                    enableEci: false,
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "L",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": [97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102] }
                    ]
                }
            },
            {
                input: ["abcdefabcdefabcdefabcdef", {
                    version: 0,
                    errorCorrection: "M",
                    autoECLevel: false,
                    enableEci: false,
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "M",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": [97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102] }
                    ]
                }
            },
            {
                input: ["abcdefabcdefabcdefabcdef", {
                    version: 0,
                    errorCorrection: "Q",
                    autoECLevel: false,
                    enableEci: false,
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "Q",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": [97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102] }
                    ]
                }
            },
            {
                input: ["abcdefabcdefabcdefabcdef", {
                    version: 0,
                    errorCorrection: "H",
                    autoECLevel: false,
                    enableEci: false,
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "H",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": [97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102] }
                    ]
                }
            },
        ]
    },
    {
        label: "autoECLevel 測試",
        tests: [
            {
                input: ["abcdefabcdefabcdefabcdef", {
                    version: 0,
                    errorCorrection: "L",
                    autoECLevel: true,
                    enableEci: false,
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "L",
                    "autoECLevel": true,
                    "segments": [
                        { "mode": "Byte", "data": [97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102, 97, 98, 99, 100, 101, 102] }
                    ]
                }
            }
        ]
    },
    {
        label: "指定版本測試",
        tests: [
            {
                input: ["abcdefabcdefabcdefabcdef", {
                    version: 1,
                    errorCorrection: "M",
                    autoECLevel: false,
                    enableEci: false,
                }],
                error: true
            },
            {
                input: ["123456", {
                    version: 3,
                    errorCorrection: "M",
                    autoECLevel: false,
                    enableEci: false,
                }],
                leanQr: {
                    "version": 3,
                    "errorCorrectionLevel": "M",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Numeric", "data": "123456" }
                    ]
                }
            }
        ],
    },
    {
        label: "Eci 測試",
        tests: [
            {
                input: ["黃鸝", {
                    version: 0,
                    errorCorrection: "M",
                    autoECLevel: false,
                    enableEci: true,
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "M",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "ECI", "data": 26 },
                        { "mode": "Byte", "data": [233, 187, 131, 233, 184, 157] }
                    ]
                }
            },
            {
                input: ["黃鸝", {
                    version: 0,
                    errorCorrection: "M",
                    autoECLevel: false,
                    enableEci: false,
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "M",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": [233, 187, 131, 233, 184, 157] }
                    ]
                }
            }
        ],
    },
    {
        label: "Mode 測試",
        tests: [
            {
                input: ["1234", {
                    version: 0,
                    errorCorrection: "L",
                    autoECLevel: false,
                    enableEci: false,
                    modes: [AlphanumericMode],
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "L",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Alphanumeric", "data": "1234" }
                    ]
                }
            },
            {
                input: ["1234", {
                    version: 0,
                    errorCorrection: "L",
                    autoECLevel: false,
                    enableEci: false,
                    modes: [NumericMode],
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "L",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Numeric", "data": "1234" }
                    ]
                }
            },
            {
                // 選擇 NumericMode
                input: ["1234", {
                    version: 0,
                    errorCorrection: "L",
                    autoECLevel: false,
                    enableEci: false,
                    modes: [AlphanumericMode, NumericMode, Utf8ByteMode, KanjiMode],
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "L",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Numeric", "data": "1234" }
                    ]
                }
            },
            {
                // 選擇 AlphanumericMode
                input: ["A1234567890", {
                    version: 0,
                    errorCorrection: "L",
                    autoECLevel: false,
                    enableEci: false,
                    modes: [AlphanumericMode, NumericMode, Utf8ByteMode, KanjiMode],
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "L",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Alphanumeric", "data": "A1234567890" }
                    ]
                }
            },
            {
                // 選擇 Utf8ByteMode
                input: ["A1234567890a", {
                    version: 0,
                    errorCorrection: "L",
                    autoECLevel: false,
                    enableEci: false,
                    modes: [AlphanumericMode, NumericMode, Utf8ByteMode, KanjiMode],
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "L",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": [65, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 97] }
                    ]
                }
            },
            {
                // 選擇 MixedMode
                input: ["A1234567890a", {
                    version: 0,
                    errorCorrection: "L",
                    autoECLevel: false,
                    enableEci: false,
                    modes: [AlphanumericMode, NumericMode, Utf8ByteMode, KanjiMode, MixedMode],
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "L",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Alphanumeric", "data": "A" },
                        { "mode": "Numeric", "data": "1234567890" },
                        { "mode": "Byte", "data": [97] }
                    ]
                }
            },
            {
                input: ["中文", {
                    version: 0,
                    errorCorrection: "L",
                    autoECLevel: false,
                    enableEci: false,
                    modes: [AlphanumericMode, NumericMode, Utf8ByteMode, KanjiMode],
                }],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "L",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Kanji", "data": "中文" }
                    ]
                }
            },
            {
                input: ["A123", {
                    modes: [NumericMode],
                }],
                error: true
            },
            {
                input: ["A123a", {
                    modes: [NumericMode, AlphanumericMode],
                }],
                error: true
            },
            {
                input: ["黃鸝", {
                    modes: [KanjiMode],
                }],
                error: true
            }
        ]
    },
    {
        label: "手動產生",
        tests: [
            { // 1-9 區間
                input: [
                    [
                        { mode: Utf8ByteMode, data: 'A12345' },
                        { mode: AlphanumericMode, data: 'A12345' }
                    ], {
                        version: 2,
                        errorCorrection: "H",
                        autoECLevel: false,
                        enableEci: false,
                    }
                ],
                leanQr: {
                    "version": 2,
                    "errorCorrectionLevel": "H",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": [65, 49, 50, 51, 52, 53] },
                        { "mode": "Alphanumeric", "data": "A12345" }
                    ]
                }
            },
            { // 10-26 區間
                input: [
                    [
                        { mode: Utf8ByteMode, data: '0'.repeat(119) },
                        { mode: AlphanumericMode, data: '1' },
                    ], {
                        version: 0,
                        errorCorrection: "H",
                        autoECLevel: false,
                        enableEci: false,
                    }
                ],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "H",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": new TextEncoder().encode('0'.repeat(119)) },
                        { "mode": "Alphanumeric", "data": "1" }
                    ]
                }
            },
            { // 27-40 區間
                input: [
                    [
                        { mode: Utf8ByteMode, data: '0'.repeat(593) },
                        { mode: AlphanumericMode, data: '1' },
                    ], {
                        version: 0,
                        errorCorrection: "H",
                        autoECLevel: false,
                        enableEci: false,
                    }
                ],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "H",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": new TextEncoder().encode('0'.repeat(593)) },
                        { "mode": "Alphanumeric", "data": "1" }
                    ]
                }
            },
            { // 純 Byte 寫入
                input: [
                    [
                        { mode: RawByteMode, data: new Uint8Array([3, 1, 4, 1, 5, 9]) },
                    ], {
                        version: 0,
                        errorCorrection: "H",
                        autoECLevel: false,
                        enableEci: false,
                    }
                ],
                leanQr: {
                    "version": 0,
                    "errorCorrectionLevel": "H",
                    "autoECLevel": false,
                    "segments": [
                        { "mode": "Byte", "data": [3, 1, 4, 1, 5, 9] }
                    ]
                }
            }
        ]
    }
];

const modeMap = {
    ECI: data => mode.eci(data),
    Kanji: data => mode.shift_jis(data),
    Byte: data => mode.bytes(data),
    Alphanumeric: data => mode.alphaNumeric(data),
    Numeric: data => mode.numeric(data),
};

function getLeanQr(expected) {
    const leanQrOpt = {};

    // 版本
    if (expected.version === 0) {
        leanQrOpt.minVersion = 1;
        leanQrOpt.maxVersion = 40;
    } else {
        leanQrOpt.minVersion = leanQrOpt.maxVersion = expected.version;
    }

    // 容錯率
    if (expected.autoECLevel) {
        leanQrOpt.minCorrectionLevel = correction[expected.errorCorrectionLevel];
        leanQrOpt.maxCorrectionLevel = correction['H'];
    } else {
        leanQrOpt.minCorrectionLevel = correction[expected.errorCorrectionLevel];
        leanQrOpt.maxCorrectionLevel = correction[expected.errorCorrectionLevel];
    }

    // 製造內容
    const leanInput = expected.segments.map(o => modeMap[o.mode](o.data));

    // 回傳 lean-qr 物件
    return generate(mode.multi(...leanInput), leanQrOpt);
}

function compareQr(qr, leanQr) {
    const sz = qr.getSize();
    if (sz !== leanQr.size) {
        return false;
    }
    for (let y = sz - 1; y >= 0; --y) {
        for (let x = sz - 1; x >= 0; --x) {
            if ((!!qr.getPoint(y, x)) !== (!!leanQr.get(x, y))) {
                return false;
            }
        }
    }
    return true;
}

describe('QrCode 測試', () => {
    for (let t of testDatas) {
        const { label, tests } = t;
        for (let i = 0; i < tests.length; ++i) {
            const o = tests[i];
            test(`${label}[${i}]`, () => {
                if (!o.error) {
                    const qr = new QrCore(...o.input);
                    const leanQr = getLeanQr(o.leanQr);
                    expect(compareQr(qr, leanQr)).toBe(true);
                } else {
                    expect(() => {
                        const qr = new QrCore(...o.input);
                    }).toThrow();
                }
            });
        }
    }

    test('測試 detail - MixedMode', () => {
        const qr = new QrCode('兩個黃鸝鳴翠柳AAAA12345678', {
            enableEci: true
        });
        const detail = qr.detail.getDetail();
        expect(detail).toEqual({
            "version": 3,
            "errorCorrectionLevel": "M",
            "mask": 6,
            "segments": [
                { "mode": "eci", "data": 26 },
                { "mode": "kanji", "data": "兩個" },
                { "mode": "byte", "data": new TextEncoder().encode('黃鸝') },
                { "mode": "kanji", "data": "鳴翠柳" },
                { "mode": "alphanumeric", "data": "AAAA" },
                { "mode": "numeric", "data": "12345678" },
            ]
        });
    });

    test('測試 detail - Utf8ByteMode', () => {
        const qr = new QrCode([
            { mode: Utf8ByteMode, data: 'ABC' }
        ], {
            enableEci: true
        });
        const detail = qr.detail.getDetail();
        expect(detail).toEqual({
            "version": 1,
            "errorCorrectionLevel": "M",
            "mask": 2,
            "segments": [
                { "mode": "eci", "data": 26 },
                { "mode": "byte", "data": new TextEncoder().encode('ABC') }
            ]
        });
    });
});
