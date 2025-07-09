import { get_division, p_mod2 } from './rs.js';

function BitBuffer(nRow1, nCol1, nRow2, nCol2, nColEC, remainderBits) {
    this.nRow1 = nRow1;
    this.nCol1 = nCol1;
    this.nRow2 = nRow2;
    this.nCol2 = nCol2;
    this.nColEC = nColEC;
    this.nRemainderBits = remainderBits;

    this.nRowTotal = nRow1 + nRow2;
    this.n1 = nRow1 * nCol1; // num of group 1
    this.n2 = this.n1 + nRow2 * nCol2; // num of group 1 + group2 ( = data code words length)
    this.n3 = this.n2 + this.nRowTotal * nColEC;
    this.n4 = this.n3 + (remainderBits + 7 >>> 3);

    this.arr = new Uint8Array(this.n4);
    this.bitIdx = 0;
}

BitBuffer.prototype = {
    writeIndex(k) {
        if (k < 0 || k >= this.n4) {
            throw new RangeError();
        } else if (k < this.n1) {
            let c = k % this.nCol1;
            let r = (k - c) / this.nCol1;
            if (c < this.nCol2) {
                return r + this.nRowTotal * c;
            } else {
                return r + this.nRowTotal * this.nCol2 + this.nRow1 * (c - this.nCol2);
            }
        } else if (k < this.n2) {
            let c = (k - this.n1) % this.nCol2;
            let r = (k - this.n1 - c) / this.nCol2;
            if (c < this.nCol1) {
                return r + this.nRowTotal * c + this.nRow1;
            } else {
                return r + this.nRowTotal * this.nCol1 + this.nRow2 * (c - this.nCol1);
            }
        } else if(k < this.n3) {
            let c = (k - this.n2) % this.nColEC;
            let r = (k - this.n2 - c) / this.nColEC;
            return this.n2 + r + this.nRowTotal * c;
        } else {
            return k;
        }
    },

    appendBits(x, nBits) {
        while (nBits > 0) {
            let k = 8 - (this.bitIdx & 7); // 目前最前面有空位的 byte 可以寫入幾 bit
            if (nBits < k) { // x 長度不足到整個空間
                this.arr[this.writeIndex(this.bitIdx >>> 3)] |= x << k - nBits;
                this.bitIdx += nBits;
                nBits = x = 0;
            } else { // x 長度夠整個空間
                this.arr[this.writeIndex(this.bitIdx >>> 3)] |= x >>> nBits - k;
                this.bitIdx += k;
                x &= (1 << nBits - k) - 1;
                nBits -= k;
            }
        }
    },

    terminator() {
        let n = (this.n2 << 3) - this.bitIdx;
        this.appendBits(0, n > 4 ? 4 : n);
    },

    padding() {
        // 補 0 到整個 byte
        this.appendBits(0, 8 - (this.bitIdx & 7) & 7);

        // 補 0xec11
        let n = this.n2 - (this.bitIdx >>> 3);
        for (let i = 0; i < n; ++i) {
            this.appendBits(((i & 1) ? 0x11 : 0xec), 8);
        }
    },

    errorCorrection() {
        // 除式
        let division = get_division(this.nColEC);

        let ecIdx = this.n2;

        let r = new Uint8Array(this.nCol1 + this.nColEC);
        for (let i = 0; i < this.n1; ++i) {
            let k = i % this.nCol1;
            r[k] = this.arr[this.writeIndex(i)];
            if (k === this.nCol1 - 1) {
                r.fill(0, this.nCol1);
                p_mod2(r, division);
                for (let j = 0; j < this.nColEC; ++j) {
                    this.arr[this.writeIndex(ecIdx++)] = r[this.nCol1 + j];
                    this.bitIdx += 8;
                }
            }
        }
        r = new Uint8Array(this.nCol2 + this.nColEC);
        for (let i = this.n1; i < this.n2; ++i) {
            let k = (i - this.n1) % this.nCol2;
            r[k] = this.arr[this.writeIndex(i)];
            if (k === this.nCol2 - 1) {
                r.fill(0, this.nCol2);
                p_mod2(r, division);
                for (let j = 0; j < this.nColEC; ++j) {
                    this.arr[this.writeIndex(ecIdx++)] = r[this.nCol2 + j];
                    this.bitIdx += 8;
                }
            }
        }
    },

    remainderBits() {
        this.appendBits(0, this.nRemainderBits);
    },

    getBit(k) {
        return 0 <= k && k < this.bitIdx ? (this.arr[k >>> 3] >>> 7 - (k & 7) & 1) : null;
    },

    bitLen() {
        return this.bitIdx;
    },
};

export default BitBuffer;
