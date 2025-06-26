const alphaNumMap = Array.from('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:').reduce((m, c, i) => {
    m.set(c.codePointAt(), i);
    return m;
}, new Map());

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

    addNumber(charLenbits, str) {
        // mode indicator
        this.writeValue(1, 4);

        // character count indicator
        this.writeValue(str.length, charLenbits);

        // write value
        let x = 0;
        for (let i = 0; i < str.length; ++i) {
            let k = str.codePointAt(i) - 48;
            if (k < 0 || k > 9) {
                throw '錯誤的數字: ' + str;
            }
            x = x * 10 + k;
            if (i % 3 === 2) {
                this.writeValue(x, 10);
                x = 0;
            }
        }
        switch (str.length % 3) {
            case 1:
                this.writeValue(x, 4);
                break;
            case 2:
                this.writeValue(x, 7);
                break;
        }
        return this;
    }

    addAlphaNum(charLenbits, str) {
        // mode indicator
        this.writeValue(2, 4);

        // character count indicator
        this.writeValue(str.length, charLenbits);

        // write value
        let x = 0;
        for (let i = 0; i < str.length; ++i) {
            let k = str.codePointAt(i);
            if(!alphaNumMap.has(k)) {
                throw '錯誤的英數字串: ' + str;
            }
            k = alphaNumMap.get(k);
            x = x * 45 + k;
            if (i & 1) {
                this.writeValue(x, 11);
                x = 0;
            }
        }
        if (str.length & 1) {
            this.writeValue(x, 6);
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
        this.writeValue(0, 8 - (this.idx & 7) & 7);
        while (this.idx < len) {
            let k = this.idx + 16 > len ? len - this.idx : 16;
            this.writeValue(0xec11 >>> 16 - k, k);
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
