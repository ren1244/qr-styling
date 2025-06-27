import { describe, expect, test } from '@jest/globals';
import { Buffer } from '../data.js';
import { getVersionInfo } from '../info.js';

describe('資料測試', ()=>{
    test('Alphanum: YEECY @ 1-Q', ()=>{
        let info = getVersionInfo(1, 'Q');
        let buf = new Buffer(info.totalDataWords);
        buf.addAlphaNum(info.charLenBits.a, 'YEECY');
        buf.finish();
        expect(buf.toString()).toBe('00100000001011100000100001010000010100010000000011101100000100011110110000010001111011000001000111101100');
    });
});
