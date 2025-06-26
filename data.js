class Buffer {
    constructor(byteLength) {
        this.buffer = new Uint8Array(byteLength);
        this.idx = 0;
    }

    writeValue(x, bits) {
        while (bits > 0) {
            let k = 8 - (this.idx & 7);
            if (bits < k) { // x 長度不足到整個空間
                this.buffer[this.idx >>> 3] |= x << k - bits;
                this.idx += bits;
                bits = x = 0;
            } else { // x 長度夠整個空間
                this.buffer[this.idx >>> 3] |= x >>> bits - k;
                this.idx += k;
                x &= (1 << bits - k) - 1;
                bits -= k;
            }
        }
        return this;
    }

    finish() {
        this._addTerminator();
        this._addPadding();
        return this;
    }

    _addTerminator() {
        let r = this.buffer.byteLength * 8 - this.idx;
        if (r >= 4) {
            this.writeValue(0, 4);
        } else if (r >= 2) {
            this.writeValue(0, 2);
        }
    }

    _addPadding() {
        let len = this.buffer.byteLength * 8;
        while (this.idx < len) {
            let k = this.idx + 16 > len ? len - this.idx : 16;
            this.writeValue(0xec88 >>> 16 - k, k);
        }
    }

    toString() {
        let r = '';
        for (let i = 0; i < this.idx; ++i) {
            r += this.buffer[i >>> 3] >>> 7 - (i & 7) & 1;
        }
        return r;
    }
}
