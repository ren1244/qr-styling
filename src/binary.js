class Binary {
    constructor(nBytes) {
        this.arr = new Uint8Array(nBytes);
        this.len = 0;
    }

    /**
     * 寫入數值
     * @param {number} value 數值
     * @param {number} nBits 位元數
     */
    write(value, nBits) {
        while (nBits > 0) {
            let k = 8 - (this.len & 7); // 目前最前面有空位的 byte 可以寫入幾 bit
            if (nBits < k) { // value 長度不足到整個空間
                this.arr[this.len >>> 3] |= value << k - nBits;
                this.len += nBits;
                nBits = value = 0;
            } else { // value 長度夠整個空間
                this.arr[this.len >>> 3] |= value >>> nBits - k;
                this.len += k;
                value &= (1 << nBits - k) - 1;
                nBits -= k;
            }
        }
    }

    /**
     * 取得目前已寫入幾 bit
     * @returns {number}
     */
    getLength() {
        return this.len;
    }

    /**
     * 取得特定位置的 uint8 數值
     * @param {number} pos
     * @returns {number}
     */
    uint8(pos) {
        return this.arr[pos];
    }

    /**
     * 取得 bit k 是 0 或 1
     * @param {?number} k 0, 1, null
     */
    bit(k) {
        if(0 <= k && k < this.len) {
            return this.arr[k >>> 3] >>> 7 - (k & 7) & 1;
        }
        return null;
    }

    /**
     * 顯示數值為二進位字串
     */
    toString() {
        let result = '';
        for (let i = 0; i < this.len; ++i) {
            result += this.arr[i >>> 3] >>> 7 - (i & 7) & 1;
        }
        return result;
    }
}

export default Binary;