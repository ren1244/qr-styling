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
            const { arr, sz } = this;
            for (let maskVersion = 0; maskVersion < 8; ++maskVersion) {
                const offset = P_OFFSET[maskVersion];
                // 計算分數
                let score1 = 0;
                let score2 = 0;
                let score3 = 0;
                let score4 = 0;
                let count4 = 0;
                for (let r = 0; r < sz; ++r) {
                    let count1h = 0;
                    let val1h = null;
                    let count1v = 0;
                    let val1v = null;
                    let val3h = 0;
                    let val3v = 0;
                    for (let c = 0; c < sz; ++c) {
                        let valH = ((arr[r * sz + c] >>> offset & P_MASK) === P_TRUE ? 1 : 0);
                        let valV = ((arr[c * sz + r] >>> offset & P_MASK) === P_TRUE ? 1 : 0);
                        // score1
                        if (valH === val1h) {
                            ++count1h;
                        } else {
                            if (count1h > 4) {
                                score1 += count1h - 2;
                            }
                            val1h = valH;
                            count1h = 1;
                        }
                        if (valV === val1v) {
                            ++count1v;
                        } else {
                            if (count1v > 4) {
                                score1 += count1v - 2;
                            }
                            val1v = valV;
                            count1v = 1;
                        }
                        // score2
                        if (r < sz - 1 && c < sz - 1) {
                            if (
                                ((arr[r * sz + c + 1] >>> offset & P_MASK) === P_TRUE ? 1 : 0) === valH &&
                                ((arr[(r + 1) * sz + c] >>> offset & P_MASK) === P_TRUE ? 1 : 0) === valH &&
                                ((arr[(r + 1) * sz + c + 1] >>> offset & P_MASK) === P_TRUE ? 1 : 0) === valH
                            ) {
                                score2 += 3;
                            }
                        }
                        // score3
                        val3h = (val3h << 1 | valH) & 0x7ff;
                        val3v = (val3v << 1 | valV) & 0x7ff;
                        if ((val3h === 93 || val3h === 1488) && c > 9) {
                            score3 += 40;
                        }
                        if ((val3v === 93 || val3v === 1488) && c > 9) {
                            score3 += 40;
                        }

                        // score4
                        if (valH) {
                            ++count4;
                        }
                    }
                    if (count1h > 4) {
                        score1 += count1h - 2;
                    }
                    if (count1v > 4) {
                        score1 += count1v - 2;
                    }
                }
                score4 = (Math.abs(count4 * 20 - 10 * sz * sz) / (sz * sz) | 0) * 10;
                const score = score1 + score2 + score3 + score4;
                if (selectMaskVersion === null || minScore > score) {
                    minScore = score;
                    selectMaskVersion = maskVersion;
                }
            }
            this.best = selectMaskVersion;
        }
        return this.best;
    },
};

export default Matrix;