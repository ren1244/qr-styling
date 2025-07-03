import NumericMode from './mode/numeric.js';
import Binary from './binary.js';
import { GenericGF, ReedSolomonEncoder } from './reedsolomon.js';
import { groupIterator } from './utils.js';

const modes = [NumericMode];

const dict = {
    "L": [
        null,
        [19, 7, [1, 19]],
        [34, 10, [1, 34]],
        [55, 15, [1, 55]],
        [80, 20, [1, 80]],
        [108, 26, [1, 108]],
        [136, 18, [2, 68]],
        [156, 20, [2, 78]],
        [194, 24, [2, 97]],
        [232, 30, [2, 116]],
        [274, 18, [2, 68, 2, 69]],
        [324, 20, [4, 81]],
        [370, 24, [2, 92, 2, 93]],
        [428, 26, [4, 107]],
        [461, 30, [3, 115, 1, 116]],
        [523, 22, [5, 87, 1, 88]],
        [589, 24, [5, 98, 1, 99]],
        [647, 28, [1, 107, 5, 108]],
        [721, 30, [5, 120, 1, 121]],
        [795, 28, [3, 113, 4, 114]],
        [861, 28, [3, 107, 5, 108]],
        [932, 28, [4, 116, 4, 117]],
        [1006, 28, [2, 111, 7, 112]],
        [1094, 30, [4, 121, 5, 122]],
        [1174, 30, [6, 117, 4, 118]],
        [1276, 26, [8, 106, 4, 107]],
        [1370, 28, [10, 114, 2, 115]],
        [1468, 30, [8, 122, 4, 123]],
        [1531, 30, [3, 117, 10, 118]],
        [1631, 30, [7, 116, 7, 117]],
        [1735, 30, [5, 115, 10, 116]],
        [1843, 30, [13, 115, 3, 116]],
        [1955, 30, [17, 115]],
        [2071, 30, [17, 115, 1, 116]],
        [2191, 30, [13, 115, 6, 116]],
        [2306, 30, [12, 121, 7, 122]],
        [2434, 30, [6, 121, 14, 122]],
        [2566, 30, [17, 122, 4, 123]],
        [2702, 30, [4, 122, 18, 123]],
        [2812, 30, [20, 117, 4, 118]],
        [2956, 30, [19, 118, 6, 119]]
    ],
    "M": [
        null,
        [16, 10, [1, 16]],
        [28, 16, [1, 28]],
        [44, 26, [1, 44]],
        [64, 18, [2, 32]],
        [86, 24, [2, 43]],
        [108, 16, [4, 27]],
        [124, 18, [4, 31]],
        [154, 22, [2, 38, 2, 39]],
        [182, 22, [3, 36, 2, 37]],
        [216, 26, [4, 43, 1, 44]],
        [254, 30, [1, 50, 4, 51]],
        [290, 22, [6, 36, 2, 37]],
        [334, 22, [8, 37, 1, 38]],
        [365, 24, [4, 40, 5, 41]],
        [415, 24, [5, 41, 5, 42]],
        [453, 28, [7, 45, 3, 46]],
        [507, 28, [10, 46, 1, 47]],
        [563, 26, [9, 43, 4, 44]],
        [627, 26, [3, 44, 11, 45]],
        [669, 26, [3, 41, 13, 42]],
        [714, 26, [17, 42]],
        [782, 28, [17, 46]],
        [860, 28, [4, 47, 14, 48]],
        [914, 28, [6, 45, 14, 46]],
        [1000, 28, [8, 47, 13, 48]],
        [1062, 28, [19, 46, 4, 47]],
        [1128, 28, [22, 45, 3, 46]],
        [1193, 28, [3, 45, 23, 46]],
        [1267, 28, [21, 45, 7, 46]],
        [1373, 28, [19, 47, 10, 48]],
        [1455, 28, [2, 46, 29, 47]],
        [1541, 28, [10, 46, 23, 47]],
        [1631, 28, [14, 46, 21, 47]],
        [1725, 28, [14, 46, 23, 47]],
        [1812, 28, [12, 47, 26, 48]],
        [1914, 28, [6, 47, 34, 48]],
        [1992, 28, [29, 46, 14, 47]],
        [2102, 28, [13, 46, 32, 47]],
        [2216, 28, [40, 47, 7, 48]],
        [2334, 28, [18, 47, 31, 48]]
    ],
    "Q": [
        null,
        [13, 13, [1, 13]],
        [22, 22, [1, 22]],
        [34, 18, [2, 17]],
        [48, 26, [2, 24]],
        [62, 18, [2, 15, 2, 16]],
        [76, 24, [4, 19]],
        [88, 18, [2, 14, 4, 15]],
        [110, 22, [4, 18, 2, 19]],
        [132, 20, [4, 16, 4, 17]],
        [154, 24, [6, 19, 2, 20]],
        [180, 28, [4, 22, 4, 23]],
        [206, 26, [4, 20, 6, 21]],
        [244, 24, [8, 20, 4, 21]],
        [261, 20, [11, 16, 5, 17]],
        [295, 30, [5, 24, 7, 25]],
        [325, 24, [15, 19, 2, 20]],
        [367, 28, [1, 22, 15, 23]],
        [397, 28, [17, 22, 1, 23]],
        [445, 26, [17, 21, 4, 22]],
        [485, 30, [15, 24, 5, 25]],
        [512, 28, [17, 22, 6, 23]],
        [568, 30, [7, 24, 16, 25]],
        [614, 30, [11, 24, 14, 25]],
        [664, 30, [11, 24, 16, 25]],
        [718, 30, [7, 24, 22, 25]],
        [754, 28, [28, 22, 6, 23]],
        [808, 30, [8, 23, 26, 24]],
        [871, 30, [4, 24, 31, 25]],
        [911, 30, [1, 23, 37, 24]],
        [985, 30, [15, 24, 25, 25]],
        [1033, 30, [42, 24, 1, 25]],
        [1115, 30, [10, 24, 35, 25]],
        [1171, 30, [29, 24, 19, 25]],
        [1231, 30, [44, 24, 7, 25]],
        [1286, 30, [39, 24, 14, 25]],
        [1354, 30, [46, 24, 10, 25]],
        [1426, 30, [49, 24, 10, 25]],
        [1502, 30, [48, 24, 14, 25]],
        [1582, 30, [43, 24, 22, 25]],
        [1666, 30, [34, 24, 34, 25]]
    ],
    "H": [
        null,
        [9, 17, [1, 9]],
        [16, 28, [1, 16]],
        [26, 22, [2, 13]],
        [36, 16, [4, 9]],
        [46, 22, [2, 11, 2, 12]],
        [60, 28, [4, 15]],
        [66, 26, [4, 13, 1, 14]],
        [86, 26, [4, 14, 2, 15]],
        [100, 24, [4, 12, 4, 13]],
        [122, 28, [6, 15, 2, 16]],
        [140, 24, [3, 12, 8, 13]],
        [158, 28, [7, 14, 4, 15]],
        [180, 22, [12, 11, 4, 12]],
        [197, 24, [11, 12, 5, 13]],
        [223, 24, [11, 12, 7, 13]],
        [253, 30, [3, 15, 13, 16]],
        [283, 28, [2, 14, 17, 15]],
        [313, 28, [2, 14, 19, 15]],
        [341, 26, [9, 13, 16, 14]],
        [385, 28, [15, 15, 10, 16]],
        [406, 30, [19, 16, 6, 17]],
        [442, 24, [34, 13]],
        [464, 30, [16, 15, 14, 16]],
        [514, 30, [30, 16, 2, 17]],
        [538, 30, [22, 15, 13, 16]],
        [596, 30, [33, 16, 4, 17]],
        [628, 30, [12, 15, 28, 16]],
        [661, 30, [11, 15, 31, 16]],
        [701, 30, [19, 15, 26, 16]],
        [745, 30, [23, 15, 25, 16]],
        [793, 30, [23, 15, 28, 16]],
        [845, 30, [19, 15, 35, 16]],
        [901, 30, [11, 15, 46, 16]],
        [961, 30, [59, 16, 1, 17]],
        [986, 30, [22, 15, 41, 16]],
        [1054, 30, [2, 15, 64, 16]],
        [1096, 30, [24, 15, 46, 16]],
        [1142, 30, [42, 15, 32, 16]],
        [1222, 30, [10, 15, 67, 16]],
        [1276, 30, [20, 15, 61, 16]]
    ],
};

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

const formatPat = [0, 311, 622, 857, 491, 220, 901, 690, 982, 737, 440, 143, 573, 778, 83, 356, 667, 940, 245, 450, 880, 583, 286, 41, 333, 122, 803, 532, 166, 401, 712, 1023];

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

    if (version) {
        if (!this.validVersion(version)) {
            throw `版本 ${version} 容量不夠`;
        }
        this.version = version;
    } else {
        this.version = this.autoSelectVersion();
    }
    this.mode = this.minLenMode(this.version);

    let [dataLen, ecLen, group] = dict[this.errorCorrection][this.version];

    this.dataLen = dataLen;
    this.ecLen = ecLen;
    this.group = group;
    this.nRows = group[0] + (group[2] !== undefined ? group[2] : 0);
    this.remainBits = getRemainderBits(this.version);
    this.bitSize = (dataLen + ecLen * this.nRows) * 8 + this.remainBits;
    this.byteSize = this.bitSize + 7 >>> 3;
    this.binary = new Binary(this.byteSize);
}

/**
 * 取得某版本下，能產生最短長度的 mode 實例
 * @param {number} version 版本
 * @returns {NumericMode|AlphanumericMode|ByteMode|KanjiMode|null}
 */
QrCode.prototype.minLenMode = function (version) {
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
}

/**
 * 驗證某版本是否可使用
 * @param {number} version 版本
 * @returns {boolean}
 */
QrCode.prototype.validVersion = function (version) {
    let mode = this.minLenMode(version);
    let info = dict[this.errorCorrection][version];
    let size = info[0] * 8;
    return mode !== null && mode.getLength() <= size;
}

/**
 * 自動選擇最低版本
 * @returns {number}
 */
QrCode.prototype.autoSelectVersion = function () {
    for (let version = 1; version <= 40; ++version) {
        if (this.validVersion(version)) {
            return version;
        }
    }
    throw '無法找到合適的版本';
}

/**
 * data code word 加入 padding（0000 與 0xec11）
 */
QrCode.prototype.padding = function () {
    const dataBits = this.dataLen * 8;
    // 補 0000
    let n = dataBits - this.binary.getLength();
    this.binary.write(0, n < 4 ? n : 4);

    // 補 0 到整個 byte
    n = 8 - (this.binary.getLength() & 7) & 7;
    this.binary.write(0, n);

    // 補 0xec11
    n = this.dataLen - (this.binary.getLength() >>> 3);
    for (let i = 0; i < n; ++i) {
        this.binary.write(((i & 1) ? 0x11 : 0xec), 8);
    }
}

/**
 * 加入 error correction 資料（依據群組）
 */
QrCode.prototype.writeErrorCorrection = function () {
    let enc = new ReedSolomonEncoder(GenericGF.QR_CODE_FIELD_256());
    let pos = 0;
    for (let i = 1; i < this.group.length; i += 2) {
        let nBlocks = this.group[i - 1];
        let nWords = this.group[i];
        for (let j = 0; j < nBlocks; ++j) {
            // 讀取 [pos, pos + nWords) 的資料，寫入
            let msg = new Uint32Array(nWords + this.ecLen);
            for (let k = 0; k < nWords; ++k) {
                msg[k] = this.binary.uint8(pos++);
            }
            enc.encode(msg, this.ecLen);
            for (let k = 0; k < this.ecLen; ++k) {
                this.binary.write(msg[nWords + k], 8);
            }
        }
    }
}

/**
 * 依據群組重新排列
 */
QrCode.prototype.rerange = function () {
    let newBinary = new Binary(this.byteSize);

    // 寫入 data code words
    let it = groupIterator(this.group);
    for (let pos of it) {
        newBinary.write(this.binary.uint8(pos), 8);
    }

    // 寫入 ec code words
    it = groupIterator([this.nRows, this.ecLen]);
    for (let pos of it) {
        newBinary.write(this.binary.uint8(pos + this.dataLen), 8);
    }

    if (this.remainBits > 0) {
        newBinary.write(0, this.remainBits);
    }
    this.binary = newBinary;
}

QrCode.prototype.end = function () {
    this.mode.write(this.binary);
    this.padding();
    this.writeErrorCorrection();
    this.rerange();
}

QrCode.prototype.render = function (canvas) {
    let size = 21 + 4 * (this.version - 1);
    canvas.setSize(size);

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
                canvas.setPoint(r, c, val);
            }
        }
    });

    // 黑色碼元
    canvas.setPoint(4 * this.version + 9, 8, 1);

    // 定時圖案
    for (let i = 8; i < size - 8; ++i) {
        canvas.setPoint(6, i, i & 1 ^ 1);
        canvas.setPoint(i, 6, i & 1 ^ 1);
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
                            canvas.setPoint(r + dr, c + dc, val);
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
            canvas.setPoint(r0 + dr, c0 + dc, val);
            canvas.setPoint(r1 + dc, c1 + dr, val);
        }
    }

    // 格式資訊
    let mask = 0;
    let maskFunction = (r, c) => r + c + 1 & 1;
    let formatMask = ['M', 'L', 'H', 'Q'].indexOf(this.errorCorrection) << 3 | mask;
    let fmtmsk = (formatMask << 10 | formatPat[formatMask]) ^ 21522;
    for (let i = 0; i < 15; ++i) {
        let r = i < 8 ? 8 : (i === 8 ? 7 : 14 - i);
        let c = i < 6 ? i : (i === 6 ? 7 : 8);
        let val = fmtmsk >>> 14 - i & 1;
        canvas.setPoint(r, c, val);

        r = i < 7 ? size - 1 - i : 8;
        c = i < 7 ? 8 : size - 8 + i - 7;
        canvas.setPoint(r, c, val);
    }

    // 填入資料
    let six = (size - 1) * size - size * 6;
    let i = 0;
    let k = 0;
    let v = this.binary.bit(k);
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
        if (canvas.getPoint(r, c) === null) {
            //console.log(r, c, v);
            canvas.setPoint(r, c, v ^ maskFunction(r, c));
            v = this.binary.bit(++k);
        }

        ++i;
    }
    console.log(this.binary.toString());
}

export default QrCode;
