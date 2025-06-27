import { describe, expect, test } from '@jest/globals';
import { RS } from '../utils.js';

const tests = [
    {
        massage: [16, 32, 202, 2, 11, 0, 236, 17, 236, 17, 236, 17, 236, 17, 236, 17, 236, 17, 236],
        ecLength: 7,
        expect: [149, 41, 100, 238, 142, 10, 173]
    },
    {
        massage: [32, 83, 11, 120, 217, 210, 41, 187, 224, 236, 17, 236, 17, 236, 17, 236],
        ecLength: 10,
        expect: [112, 250, 156, 210, 72, 24, 190, 74, 251, 243],
    },
    {
        massage: [65, 114, 134, 226, 194, 6, 178, 146, 2, 2, 2, 2, 2, 2, 3, 162, 2, 131, 35, 98, 194, 3, 19, 146, 144, 236, 17, 236],
        ecLength: 16,
        expect: [168, 128, 121, 206, 206, 96, 203, 237, 131, 207, 135, 229, 26, 110, 48, 110],
    },
];

describe('錯誤校正測試', () => {
    tests.forEach((o,i) => {
        test(`第 ${i} 組`, () => {
            let { massage, ecLength} = o;
            let ec = RS(new Int32Array(massage), ecLength);
            let a = Array.from(ec).join(', ');
            let b = Array.from(o['expect']).join(', ');
            expect(a).toBe(b);
        });
    });
});
