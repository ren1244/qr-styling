import Canvas from "./interface.js";

const P_TRUE = 3;
const P_FALSE = 2;
const P_FIXED_TRUE = 0xffff;
const P_FIXED_FALSE = 0xaaaa;
const P_OFFSET = [0, 2, 4, 6, 8, 10, 12, 14];
const P_MASK = 3;

/**
 * @class
 * @implements {Canvas}
 */
function ArrayCanvas() {
    this.sz = null;
    this.arr = null;
}

ArrayCanvas.prototype = {

    setSize(size) {
        this.sz = size;
        this.arr = new Uint16Array(size * size);
    },

    setPoint(row, col, val, maskVersion) {
        if (maskVersion === undefined) {
            val = val ? P_FIXED_TRUE : P_FIXED_FALSE;
        } else {
            val = (val ? P_TRUE : P_FALSE) << P_OFFSET[maskVersion];
        }
        this.arr[row * this.sz + col] |= val;
    },

    getPoint(row, col, maskVersion) {
        let val = this.arr[row * this.sz + col];
        if (maskVersion === undefined) {
            return val === P_FIXED_TRUE ? 1 : (val === P_FIXED_FALSE ? 0 : null);
        } else {
            val = val >>> P_OFFSET[maskVersion] & P_MASK;
            return val === P_TRUE ? 1 : (val === P_FALSE ? 0 : null);
        }
    },

    dump(canvas, maskVersion) {
        canvas.setSize(this.sz);
        for (let r = 0; r < this.sz; ++r) {
            for (let c = 0; c < this.sz; ++c) {
                let val = this.getPoint(r, c, maskVersion);
                if (val !== null) {
                    canvas.setPoint(r, c, val);
                }
            }
        }
    },

    score1(maskVersion) {
        // 水平掃描 5 個連續
        let score = 0;
        for (let r = 0; r < this.sz; ++r) {
            let lastVal = null;
            let count = 0;
            for (let c = 0; c < this.sz; ++c) {
                let v = this.getPoint(r, c, maskVersion);
                if (v === null) {
                    throw '還有沒填入的格子';
                }
                if (v === lastVal) {
                    ++count;
                } else {
                    lastVal = v;
                    if (count > 4) {
                        score += count - 2;
                    }
                    count = 1;
                }
            }
            if (count > 4) {
                score += count - 2;
            }
        }
        for (let c = 0; c < this.sz; ++c) {
            let lastVal = null;
            let count = 0;
            for (let r = 0; r < this.sz; ++r) {
                let v = this.getPoint(r, c, maskVersion);
                if (v === null) {
                    throw '還有沒填入的格子';
                }
                if (v === lastVal) {
                    ++count;
                } else {
                    lastVal = v;
                    if (count > 4) {
                        score += count - 2;
                    }
                    count = 1;
                }
            }
            if (count > 4) {
                score += count - 2;
            }
        }

        return score;
    },

    score2(maskVersion) {
        let score = 0;
        for (let r = 0; r < this.sz - 1; ++r) {
            for (let c = 0; c < this.sz - 1; ++c) {
                let v = this.getPoint(r, c, maskVersion);
                if (v === null) {
                    throw '還有沒填入的格子';
                }
                if (
                    v === this.getPoint(r, c + 1, maskVersion) &&
                    v === this.getPoint(r + 1, c + 1, maskVersion) &&
                    v === this.getPoint(r + 1, c, maskVersion)
                ) {
                    score += 3;
                }
            }
        }
        return score;
    },

    score3(maskVersion) {
        let score = 0;
        let v0 = 93;   // 00001011101
        let v1 = 1488; // 10111010000
        for (let i = 0; i < this.sz; ++i) {
            let j;
            let v;
            let t0 = 0;
            let t1 = 0;
            for (j = 0; j < 10; ++j) {
                v = this.getPoint(i, j, maskVersion);
                t0 = (t0 << 1 | v) & 0x7ff;
                v = this.getPoint(j, i, maskVersion);
                t1 = (t1 << 1 | v) & 0x7ff;
            }
            for (; j < this.sz; ++j) {
                v = this.getPoint(i, j, maskVersion);
                t0 = (t0 << 1 | v) & 0x7ff;
                v = this.getPoint(j, i, maskVersion);
                t1 = (t1 << 1 | v) & 0x7ff;
                if (t0 === v0 || t0 === v1) {
                    score += 40;
                }
                if (t1 === v0 || t1 === v1) {
                    score += 40;
                }
            }
        }
        return score;
    },

    score4(maskVersion) {
        let blackCount = 0;
        let total = this.sz * this.sz;
        for (let r = 0; r < this.sz; ++r) {
            for (let c = 0; c < this.sz; ++c) {
                blackCount += this.getPoint(r, c, maskVersion);
            }
        }
        return (Math.abs(blackCount * 20 - 10 * total) / total | 0) * 10;
    }
};

export default ArrayCanvas;