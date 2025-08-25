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
function Matrix(size) {
    this.sz = size;
    this.arr = new Uint16Array(size * size);
    this.best = null;
}

Matrix.prototype = {

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

    getBestMaskVersion() {
        if (this.best === null) {
            let selectMaskVersion = null;
            let minScore = null;
            for (let i = 0; i < 8; ++i) {
                // 計算分數
                let score = this.score1(i) + this.score2(i) + this.score3(i) + this.score4(i);
                if (selectMaskVersion === null || minScore > score) {
                    minScore = score;
                    selectMaskVersion = i;
                }
            }
            this.best = selectMaskVersion;
        }
        return this.best;
    },

    score1(maskVersion) {
        let score = 0;
        for (let i = 0; i < this.sz; ++i) {
            let arr = [
                { val: null, count: null, cur: null },
                { val: null, count: null, cur: null }
            ];
            for (let j = 0; j < this.sz; ++j) {
                arr[0].cur = this.getPoint(i, j, maskVersion);
                arr[1].cur = this.getPoint(j, i, maskVersion);
                arr.forEach(o => {
                    if (o.val === o.cur) {
                        ++o.count;
                    } else {
                        if (o.count > 4) {
                            score += o.count - 2;
                        }
                        o.val = o.cur;
                        o.count = 1;
                    }
                });
            }
            arr.forEach(o => {
                if (o.count > 4) {
                    score += o.count - 2;
                }
            });
        }
        return score;
    },

    score2(maskVersion) {
        let score = 0;
        for (let r = 0; r < this.sz - 1; ++r) {
            for (let c = 0; c < this.sz - 1; ++c) {
                let v = this.getPoint(r, c, maskVersion);
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

export default Matrix;