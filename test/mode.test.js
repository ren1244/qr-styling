import AlphanumericMode from '../src/core/mode/alphanumeric.js';
import ByteMode from '../src/core/mode/byte.js';
import KanjiMode from '../src/core/mode/kanji.js';
import NumericMode from '../src/core/mode/numeric.js';

describe('AlphanumericMode.getLength', () => {
    const arr = [
        [9, 6, false, 0, 4 + 9 + 11 * 3],
        [26, 6, false, 0, 4 + 11 + 11 * 3],
        [40, 6, false, 0, 4 + 13 + 11 * 3],
        [9, 7, false, 0, 4 + 9 + 11 * 3 + 6],
        [26, 7, false, 0, 4 + 11 + 11 * 3 + 6],
        [40, 7, false, 0, 4 + 13 + 11 * 3 + 6],
        [9, 6, true, 0, 11 * 3],
        [9, 7, true, 0, 11 * 3 + 6],
        [9, 6, true, 1, -6 + 11 * 3 + 6],
        [9, 7, true, 1, -6 + 11 * 4],
    ];
    arr.forEach(a => {
        const desc = `version ${a[0]}, count ${a[1]}, ${a[2] ? 'concatenated' : 'not concatenated'}, remainder ${a[3]}`;
        test(desc, () => {
            expect(AlphanumericMode.getLength.apply(null, a.slice(0, 4))).toBe(a[4]);
        });
    });
});

describe('NumericMode.getLength', () => {
    const arr = [
        [9, 6, false, 0, 4 + 10 + 10 * 2],
        [26, 6, false, 0, 4 + 12 + 10 * 2],
        [40, 6, false, 0, 4 + 14 + 10 * 2],
        [9, 7, false, 0, 4 + 10 + 10 * 2 + 4],
        [26, 7, false, 0, 4 + 12 + 10 * 2 + 4],
        [40, 7, false, 0, 4 + 14 + 10 * 2 + 4],
        [9, 8, false, 0, 4 + 10 + 10 * 2 + 7],
        [26, 8, false, 0, 4 + 12 + 10 * 2 + 7],
        [40, 8, false, 0, 4 + 14 + 10 * 2 + 7],

        [9, 6, true, 0, 10 * 2],
        [9, 6, true, 1, -4 + 10 * 2 + 4],
        [9, 6, true, 2, -7 + 10 * 2 + 7],

        [9, 7, true, 0, 10 * 2 + 4],
        [9, 7, true, 1, -4 + 10 * 2 + 7],
        [9, 7, true, 2, -7 + 10 * 3],

        [9, 8, true, 0, 10 * 2 + 7],
        [9, 8, true, 1, -4 + 10 * 3],
        [9, 8, true, 2, -7 + 10 * 3 + 4],
    ];
    arr.forEach(a => {
        const desc = `version ${a[0]}, count ${a[1]}, ${a[2] ? 'concatenated' : 'not concatenated'}, remainder ${a[3]}`;
        test(desc, () => {
            expect(NumericMode.getLength.apply(null, a.slice(0, 4))).toBe(a[4]);
        });
    });
});

describe('ByteMode.getLength', () => {
    const arr = [
        [9, 6, false, 0, 4 + 8 + 8 * 6],
        [26, 6, false, 0, 4 + 16 + 8 * 6],
        [40, 6, false, 0, 4 + 16 + 8 * 6],

        [9, 6, true, 0, 8 * 6],
        [26, 6, true, 0, 8 * 6],
        [40, 6, true, 0, 8 * 6],
    ];
    arr.forEach(a => {
        const desc = `version ${a[0]}, count ${a[1]}, ${a[2] ? 'concatenated' : 'not concatenated'}, remainder ${a[3]}`;
        test(desc, () => {
            expect(ByteMode.getLength.apply(null, a.slice(0, 4))).toBe(a[4]);
        });
    });
});

describe('KanjiMode.getLength', () => {
    const arr = [
        [9, 6, false, 0, 4 + 8 + 13 * 6],
        [26, 6, false, 0, 4 + 10 + 13 * 6],
        [40, 6, false, 0, 4 + 12 + 13 * 6],

        [9, 6, true, 0, 13 * 6],
        [26, 6, true, 0, 13 * 6],
        [40, 6, true, 0, 13 * 6],
    ];
    arr.forEach(a => {
        const desc = `version ${a[0]}, count ${a[1]}, ${a[2] ? 'concatenated' : 'not concatenated'}, remainder ${a[3]}`;
        test(desc, () => {
            expect(KanjiMode.getLength.apply(null, a.slice(0, 4))).toBe(a[4]);
        });
    });
});
