import MixedMode from './mode/mixed.js';
import BitBuffer from './bit-buffer.js';
import Matrix from './matrix.js';

const modes = [MixedMode];

/**
 * 依「容錯等級」與「版本」取得其相關資訊，內容如下：
 * [0] => EC Codewords Per Block
 * [1] => Number of Blocks in Group 1
 * [2] => Number of Data Codewords in Each of Group 1's Blocks
 * [3] => Number of Blocks in Group 2
 * [4] => Number of Data Codewords in Each of Group 2's Blocks
 */
const dict = {
    "L": [
        null,
        [7, 1, 19],
        [10, 1, 34],
        [15, 1, 55],
        [20, 1, 80],
        [26, 1, 108],
        [18, 2, 68],
        [20, 2, 78],
        [24, 2, 97],
        [30, 2, 116],
        [18, 2, 68, 2, 69],
        [20, 4, 81],
        [24, 2, 92, 2, 93],
        [26, 4, 107],
        [30, 3, 115, 1, 116],
        [22, 5, 87, 1, 88],
        [24, 5, 98, 1, 99],
        [28, 1, 107, 5, 108],
        [30, 5, 120, 1, 121],
        [28, 3, 113, 4, 114],
        [28, 3, 107, 5, 108],
        [28, 4, 116, 4, 117],
        [28, 2, 111, 7, 112],
        [30, 4, 121, 5, 122],
        [30, 6, 117, 4, 118],
        [26, 8, 106, 4, 107],
        [28, 10, 114, 2, 115],
        [30, 8, 122, 4, 123],
        [30, 3, 117, 10, 118],
        [30, 7, 116, 7, 117],
        [30, 5, 115, 10, 116],
        [30, 13, 115, 3, 116],
        [30, 17, 115],
        [30, 17, 115, 1, 116],
        [30, 13, 115, 6, 116],
        [30, 12, 121, 7, 122],
        [30, 6, 121, 14, 122],
        [30, 17, 122, 4, 123],
        [30, 4, 122, 18, 123],
        [30, 20, 117, 4, 118],
        [30, 19, 118, 6, 119]
    ],
    "M": [
        null,
        [10, 1, 16],
        [16, 1, 28],
        [26, 1, 44],
        [18, 2, 32],
        [24, 2, 43],
        [16, 4, 27],
        [18, 4, 31],
        [22, 2, 38, 2, 39],
        [22, 3, 36, 2, 37],
        [26, 4, 43, 1, 44],
        [30, 1, 50, 4, 51],
        [22, 6, 36, 2, 37],
        [22, 8, 37, 1, 38],
        [24, 4, 40, 5, 41],
        [24, 5, 41, 5, 42],
        [28, 7, 45, 3, 46],
        [28, 10, 46, 1, 47],
        [26, 9, 43, 4, 44],
        [26, 3, 44, 11, 45],
        [26, 3, 41, 13, 42],
        [26, 17, 42],
        [28, 17, 46],
        [28, 4, 47, 14, 48],
        [28, 6, 45, 14, 46],
        [28, 8, 47, 13, 48],
        [28, 19, 46, 4, 47],
        [28, 22, 45, 3, 46],
        [28, 3, 45, 23, 46],
        [28, 21, 45, 7, 46],
        [28, 19, 47, 10, 48],
        [28, 2, 46, 29, 47],
        [28, 10, 46, 23, 47],
        [28, 14, 46, 21, 47],
        [28, 14, 46, 23, 47],
        [28, 12, 47, 26, 48],
        [28, 6, 47, 34, 48],
        [28, 29, 46, 14, 47],
        [28, 13, 46, 32, 47],
        [28, 40, 47, 7, 48],
        [28, 18, 47, 31, 48]
    ],
    "Q": [
        null,
        [13, 1, 13],
        [22, 1, 22],
        [18, 2, 17],
        [26, 2, 24],
        [18, 2, 15, 2, 16],
        [24, 4, 19],
        [18, 2, 14, 4, 15],
        [22, 4, 18, 2, 19],
        [20, 4, 16, 4, 17],
        [24, 6, 19, 2, 20],
        [28, 4, 22, 4, 23],
        [26, 4, 20, 6, 21],
        [24, 8, 20, 4, 21],
        [20, 11, 16, 5, 17],
        [30, 5, 24, 7, 25],
        [24, 15, 19, 2, 20],
        [28, 1, 22, 15, 23],
        [28, 17, 22, 1, 23],
        [26, 17, 21, 4, 22],
        [30, 15, 24, 5, 25],
        [28, 17, 22, 6, 23],
        [30, 7, 24, 16, 25],
        [30, 11, 24, 14, 25],
        [30, 11, 24, 16, 25],
        [30, 7, 24, 22, 25],
        [28, 28, 22, 6, 23],
        [30, 8, 23, 26, 24],
        [30, 4, 24, 31, 25],
        [30, 1, 23, 37, 24],
        [30, 15, 24, 25, 25],
        [30, 42, 24, 1, 25],
        [30, 10, 24, 35, 25],
        [30, 29, 24, 19, 25],
        [30, 44, 24, 7, 25],
        [30, 39, 24, 14, 25],
        [30, 46, 24, 10, 25],
        [30, 49, 24, 10, 25],
        [30, 48, 24, 14, 25],
        [30, 43, 24, 22, 25],
        [30, 34, 24, 34, 25]
    ],
    "H": [
        null,
        [17, 1, 9],
        [28, 1, 16],
        [22, 2, 13],
        [16, 4, 9],
        [22, 2, 11, 2, 12],
        [28, 4, 15],
        [26, 4, 13, 1, 14],
        [26, 4, 14, 2, 15],
        [24, 4, 12, 4, 13],
        [28, 6, 15, 2, 16],
        [24, 3, 12, 8, 13],
        [28, 7, 14, 4, 15],
        [22, 12, 11, 4, 12],
        [24, 11, 12, 5, 13],
        [24, 11, 12, 7, 13],
        [30, 3, 15, 13, 16],
        [28, 2, 14, 17, 15],
        [28, 2, 14, 19, 15],
        [26, 9, 13, 16, 14],
        [28, 15, 15, 10, 16],
        [30, 19, 16, 6, 17],
        [24, 34, 13],
        [30, 16, 15, 14, 16],
        [30, 30, 16, 2, 17],
        [30, 22, 15, 13, 16],
        [30, 33, 16, 4, 17],
        [30, 12, 15, 28, 16],
        [30, 11, 15, 31, 16],
        [30, 19, 15, 26, 16],
        [30, 23, 15, 25, 16],
        [30, 23, 15, 28, 16],
        [30, 19, 15, 35, 16],
        [30, 11, 15, 46, 16],
        [30, 59, 16, 1, 17],
        [30, 22, 15, 41, 16],
        [30, 2, 15, 64, 16],
        [30, 24, 15, 46, 16],
        [30, 42, 15, 32, 16],
        [30, 10, 15, 67, 16],
        [30, 20, 15, 61, 16]
    ]
};

/**
 * 對齊圖案中心點的座標
 * 座標系統以左上角為 (row = 0, col = 0)，row 向下遞增，col 向右遞增
 */
const alignPatPos = [
    null,
    null,
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170],
];

/**
 * 格式資訊
 * index = ecLevel << 3 | mask
 * ecLevel 為 2 bit 的數值：01b(L), 00b(M), 11b(Q), 10b(H)
 * mask 為 3 bit 的數值，最小為 0 最大為 7
 * 取得的 value 需再 xor 21522，bit 0 ~ bit 14 即為需要填入的黑白色塊
 */
const formatPat = [0, 311, 622, 857, 491, 220, 901, 690, 982, 737, 440, 143, 573, 778, 83, 356, 667, 940, 245, 450, 880, 583, 286, 41, 333, 122, 803, 532, 166, 401, 712, 1023];

/**
 * 版本資訊
 * index = 版本
 * value 的 bit 0 ~ bit 17 即為需要填入的黑白色塊
 */
const versionPat = [null, null, null, null, null, null, null, 42232, 63108, 157028, 208020, 114548, 72588, 231532, 180636, 21116, 31554, 190626, 237906, 78514, 104010, 198058, 150618, 57274, 36294, 138790, 219094, 115766, 90318, 258862, 178910, 10558, 175681, 15777, 95313, 255921, 213833, 118953, 39257, 133817, 153797];

function getRemainderBits(version) {
    if (2 <= version && version <= 6) {
        return 7;
    } else if ((14 <= version && version <= 20) || (28 <= version && version <= 34)) {
        return 3;
    } else if (21 <= version && version <= 27) {
        return 4;
    } else {
        return 0;
    }
}

/**
 * @param {string} data 資料
 * @param {?string} errorCorrection 錯誤校正等級：'L', 'M', 'Q', 'H'
 * @param {?number} version 版本
 */
function QrCode(data, errorCorrection, version) {
    this.data = data;
    this.errorCorrection = errorCorrection || 'M';

    let minModeAndVersion = this.autoSelectVersion();
    this.mode = minModeAndVersion['mode'];
    if (version) {
        if (version < minModeAndVersion['version']) {
            throw `版本 ${version} 容量不夠`;
        }
        this.version = version;
    } else {
        this.version = minModeAndVersion['version'];
    }

    let blockInfo = dict[this.errorCorrection][this.version];
    this.buffer = new BitBuffer(
        blockInfo[1],
        blockInfo[2],
        blockInfo[3] || 0,
        blockInfo[4] || 0,
        blockInfo[0],
        getRemainderBits(this.version)
    );
    this.mode.write(this.buffer);
    this.buffer.terminator();
    this.buffer.padding();
    this.buffer.errorCorrection();
    this.buffer.remainderBits();
    this.matrix = this.buildMatrix();
}

QrCode.prototype = {

    /**
     * 取得某版本下，能產生最短長度的 mode 實例
     * @param {number} version 版本
     * @returns {NumericMode|AlphanumericMode|ByteMode|KanjiMode|null}
     */
    minLenMode(version) {
        let minLen = null;
        let minInst = null;
        for (let i = 0; i < modes.length; ++i) {
            let inst = modes[i].create(this.data, version);
            if (inst !== null) {
                let len = inst.getLength();
                if (minInst) {
                    if (len < minLen) {
                        minLen = len;
                        minInst = inst;
                    }
                } else {
                    minLen = len;
                    minInst = inst;
                }
            }
        }
        return minInst;
    },

    /**
     * 驗證某版本是否可使用
     * @param {number} version 版本
     * @param {NumericMode|AlphanumericMode|ByteMode|KanjiMode} mode mode 實例
     * @returns {boolean}
     */
    validVersion(version, mode) {
        let info = dict[this.errorCorrection][version];
        let size = info[2] * info[1];
        if (info.length >= 5) {
            size += info[4] * info[3];
        }
        return mode !== null && mode.getLength() <= size * 8;
    },

    /**
     * 自動選擇最低版本
     * @returns {{version: number, mode: NumericMode|AlphanumericMode|ByteMode|KanjiMode}}
     */
    autoSelectVersion() {
        // version 1 ~ 9, 10 ~ 26, 27 ~ 40 每段算出來的長度都是相同的
        let testVersion = [[1, 9], [10, 26], [27, 40]];
        let mode = null;
        for (let versionSegment of testVersion) {
            mode = this.minLenMode(versionSegment[1]);
            if (mode === null) {
                throw '無法找到合適的Mode';
            }
            // 二分搜尋法找最低版本
            let [minVer, maxVer] = versionSegment;
            // let version in (minVer, maxVer]
            if (!this.validVersion(maxVer, mode)) {
                continue;
            }
            if (this.validVersion(minVer, mode)) {
                return { version: minVer, mode };
            }
            while (minVer + 1 < maxVer) {
                let v = (minVer + maxVer) >>> 1;
                if (this.validVersion(v, mode)) {
                    maxVer = v;
                } else {
                    minVer = v;
                }
            }
            return { version: maxVer, mode };
        }
        throw '無法找到合適的版本';
    },

    /**
     * 把 qr code 「畫」到 Matrix 物件
     * （8 種遮罩都畫上去）
     * @returns {Matrix}
     */
    buildMatrix() {
        let size = this.getSize();
        let mtx = new Matrix(size);

        // 定位圖案與分隔圖案
        // 中心位於: (3,3), (3,size-4), (size-4, 3)
        const centerPoings = [{ r: 3, c: 3 }, { r: 3, c: size - 4 }, { r: size - 4, c: 3 }];
        centerPoings.forEach(p => {
            for (let r = p.r - 4; r <= p.r + 4; ++r) {
                for (let c = p.c - 4; c <= p.c + 4; ++c) {
                    if (r < 0 || c < 0 || r >= size || c >= size) {
                        continue;
                    }
                    let distance = Math.max(Math.abs(p.r - r), Math.abs(p.c - c));
                    let val = distance === 2 || distance === 4 ? 0 : 1;
                    mtx.setPoint(r, c, val);
                }
            }
        });

        // 黑色碼元
        mtx.setPoint(4 * this.version + 9, 8, 1);

        // 定時圖案
        for (let i = 8; i < size - 8; ++i) {
            mtx.setPoint(6, i, i & 1 ^ 1);
            mtx.setPoint(i, 6, i & 1 ^ 1);
        }

        // 對齊圖案
        let align = alignPatPos[this.version];
        if (align !== null) {
            align.forEach(r => {
                align.forEach(c => {
                    let i;
                    for (i = centerPoings.length - 1; i >= 0; --i) {
                        let p = centerPoings[i];
                        let distance = Math.max(Math.abs(p.r - r), Math.abs(p.c - c));
                        if (distance < 7) {
                            break;
                        }
                    }
                    if (i < 0) {
                        for (let dr = -2; dr <= 2; ++dr) {
                            for (let dc = -2; dc <= 2; ++dc) {
                                let distance = Math.max(Math.abs(dr), Math.abs(dc));
                                let val = distance === 1 ? 0 : 1;
                                mtx.setPoint(r + dr, c + dc, val);
                            }
                        }
                    }
                });
            });
        }

        // 版本資訊
        let ver = versionPat[this.version];
        if (ver !== null) {
            let c0 = size - 11;
            let r0 = 0;
            let c1 = 0;
            let r1 = size - 11;
            for (let i = 0; i < 18; ++i) {
                let val = ver >>> i & 1;
                let dc = 2 - i % 3;
                let dr = 5 - (i - i % 3) / 3;
                mtx.setPoint(r0 + dr, c0 + dc, val);
                mtx.setPoint(r1 + dc, c1 + dr, val);
            }
        }

        // 以下根據不同 mask 版本會不同
        for (let mask = 0; mask < 8; ++mask) {
            let formatMask = ['M', 'L', 'H', 'Q'].indexOf(this.errorCorrection) << 3 | mask;
            let fmtmsk = (formatMask << 10 | formatPat[formatMask]) ^ 21522;

            // 格式資訊
            for (let i = 0; i < 15; ++i) {
                let r = i < 8 ? 8 : (i === 8 ? 7 : 14 - i);
                let c = i < 6 ? i : (i === 6 ? 7 : 8);
                let val = fmtmsk >>> 14 - i & 1;
                mtx.setPoint(r, c, val, mask);

                r = i < 7 ? size - 1 - i : 8;
                c = i < 7 ? 8 : size - 8 + i - 7;
                mtx.setPoint(r, c, val, mask);
            }

            // 填入資料
            if (mask === 0) {
                let six = (size - 1) * size - size * 6;
                let i = 0;
                let k = 0;
                let v = this.buffer.getBit(k);
                let s2 = size * 2;
                while (v !== null) {
                    let j = (i - i % s2) / s2;
                    let up = (j & 1) ? false : true;
                    let r = i % s2 >>> 1;
                    r = up ? size - 1 - r : r;
                    let c = size - 2 - j * 2;
                    if ((up && (i + 1 & 1)) || (!up && (i + 1 & 1))) {
                        ++c;
                    }
                    if (i >= six) {
                        --c;
                    }
                    if (mtx.getPoint(r, c, mask) === null) {
                        mtx.setMaskPoint(r, c, v);
                        v = this.buffer.getBit(++k);
                    }
                    ++i;
                }
            }
        }
        return mtx;
    },

    getSize() {
        return 21 + 4 * (this.version - 1);
    },

    getPoint(row, col) {
        return this.matrix.getPoint(row, col, this.matrix.getBestMaskVersion());
    },

    getMaskVersion() {
        return this.matrix.getBestMaskVersion();
    },
}

export default QrCode;
