import BitBuffer from "../bit-buffer.js";
import NumericMode from './numeric.js';
import ByteMode from './byte.js';
import AlphanumericMode from './alphanumeric.js';
import KanjiMode from './kanji.js';

const modes = [NumericMode, AlphanumericMode, KanjiMode, ByteMode];

/**
 * @typedef {NumericMode|AlphanumericMode|KanjiMode|ByteMode} BasicMode
 */

/**
 * @typedef {Object} Segment
 * @property {number} flag 可用的 mode，bit 0 被設定代表 modes[0] 可以使用，以此類推
 * @property {string} str 此片段的內容
 * @property {number} len unicode 長度
 * @property {number} utf8Len 編碼為 utf8 時的 byte 數
 */

/**
 * 依據允許的 mode 把字串切割成片段
 * @param {string} str 
 * @returns {Segment[]}
 */
function getSegment(str) {
    let currentFlag = 0;
    let currentStart = null;
    let count = 0;
    let utf8Len = 0;
    let segments = [];
    for (let i = 0; i < str.length; ++i) {
        let c = str.codePointAt(i);
        let curUtf8Len = c < 0x800 ? (c < 0x80 ? 1 : 2) : (c < 0x10000 ? 3 : 4);
        ++count;
        utf8Len += curUtf8Len;
        let flag = 0;
        for (let j = 0; j < modes.length; ++j) {
            if (modes[j].hasUnicode(c)) {
                flag |= 1 << j;
            }
        }
        if (currentFlag !== flag) {
            if (currentStart !== null) {
                segments.push({
                    flag: currentFlag,
                    str: str.slice(currentStart, i),
                    len: count - 1,
                    utf8Len: utf8Len - curUtf8Len,
                });
                count = 1;
                utf8Len = curUtf8Len;
            }
            currentFlag = flag;
            currentStart = i;
        }
        if (c > 0xffff) {
            ++i;
        }
    }
    if (currentStart !== null) {
        segments.push({
            flag: currentFlag,
            str: str.slice(currentStart),
            len: count,
            utf8Len,
        });
    }
    return segments;
}

/**
 * 從片段陣列中取得最佳的路徑，並產生實例陣列
 * @param {number} version 版本
 * @param {Segment[]} segments 片段陣列
 * @returns {BasicMode[]}
 */
function getBestPath(version, segments) {
    if (segments.length === 0) {
        return [];
    }
    let stack = [{ idx: -1, len: 0 }];
    let totalLen = 0;
    let minLen = null;
    let minPath = null;
    while (stack.length > 0) {
        let top = stack.pop();
        totalLen -= top.len;
        let seg = segments[stack.length];

        do {
            ++top.idx;
        } while (top.idx < modes.length && (seg.flag >>> top.idx & 1) === 0);

        if (top.idx < modes.length) {
            let mode = modes[top.idx];
            top.len = mode.getLength(version, mode !== ByteMode ? seg.len : seg.utf8Len, stack.length > 0 && stack[stack.length - 1].idx === top.idx);
            totalLen += top.len;
            stack.push(top);
            if (stack.length === segments.length) {
                if (minLen === null || totalLen < minLen) {
                    minLen = totalLen;
                    minPath = stack.map(o => { return { idx: o.idx, len: o.len } });
                }
            } else {
                stack.push({ idx: -1, len: 0 });
            }
        }
    }
    let lastMode = null;
    let tmpStr = null;
    let instArr = [];
    minPath.forEach((o, k) => {
        let mode = modes[o.idx];
        let seg = segments[k];
        if (lastMode === mode) {
            tmpStr += seg.str;
        } else {
            if (lastMode !== null) {
                instArr.push(lastMode.create(tmpStr, version));
            }
            tmpStr = seg.str;
        }
        lastMode = mode;
    });
    if (lastMode !== null) {
        instArr.push(lastMode.create(tmpStr, version));
    }
    return instArr;
}

function MixedMode(data, version) {
    this.data = data;
    this.countIndicatorLength = MixedMode.getCharCountIndicatorLength(version);
}

/**
 * 取得 Mode 物件
 * @param {string} data 
 * @param {number} version 版本
 * @returns {?MixedMode} 若為合理資料回傳 Mode 物件，否則回傳 null
 */
MixedMode.create = function (data, version) {
    let segments = getSegment(data);
    let path = getBestPath(version, segments);
    return new MixedMode(path, version);
}

/**
 * 取得在某版本時 character count indicator 所需要的位元數
 * @param {number} version 版本
 * @returns {number}
 */
MixedMode.getCharCountIndicatorLength = function (version) {
    return null;
}

MixedMode.prototype = {

    /** 
     * 取得此寫入資料需要幾位元
     * @returns {number}
     */
    getLength() {
        return this.data.reduce((s, mode) => {
            return s + mode.getLength();
        }, 0);
    },

    /**
     * 寫入到 Binary 物件
     * @param {BitBuffer} bin
     */
    write(bin) {
        this.data.forEach(mode => {
            mode.write(bin);
        });
    },

    /**
     * 取得此 Mode 名稱
     * @returns {string}
     */
    getName() {
        return this.data.length === 1 ? this.data[0].getName() : 'Mixed: ' + this.data.map(m => m.getName()).join(' + ');
    },
};

export default MixedMode;