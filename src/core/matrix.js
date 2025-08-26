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
                let t = Date.now();
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
                let t2 = Date.now();
                let oldScore1 = this.score1(maskVersion);
                let oldScore2 = this.score2(maskVersion);
                let oldScore3 = this.score3(maskVersion);
                let oldScore4 = this.score4(maskVersion);
                let t3 = Date.now();
                console.log(t2 - t, t3 - t2);
                if(score1 !== oldScore1) {
                    throw `score1: ${score1} !== ${oldScore1}`;
                }
                if(score2 !== oldScore2) {
                    throw `score2: ${score2} !== ${oldScore2}`;
                }
                if(score3 !== oldScore3) {
                    throw `score3: ${score3} !== ${oldScore3}`;
                }
                if(score4 !== oldScore4) {
                    throw `score4: ${score4} !== ${oldScore4}`;
                }
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