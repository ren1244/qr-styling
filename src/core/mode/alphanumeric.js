import BitBuffer from "../bit-buffer.js";

const codeMap = (() => {
    let s = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
    let m = new Map();
    let n = s.length;
    for (let i = 0; i < n; ++i) {
        m.set(s.codePointAt(i), i);
    }
    return m;
})();

class AlphanumericMode {

    /**
     * 取得 Mode 物件
     * @param {string} data 
     * @param {number} version 版本
     * @param {boolean} enableEci 是否開啟 eci
     * @returns {?AlphanumericMode} 若為合理資料回傳 Mode 物件，否則回傳 null
     */
    static create = function (data, version, enableEci) {
        if (data.search(/^[0-9A-Z \$\%\*\+\-\.\/\:]+$/) > -1) {
            return new AlphanumericMode(data, version);
        } else {
            return null;
        }
    }

    /**
     * 判斷某字是否能使用此模式
     * @param {number} unicode
     * @returns {boolean}
     */
    static hasUnicode = function (unicode) {
        return codeMap.has(unicode);
    }

    /**
     * 取得在某版本時 character count indicator 所需要的位元數
     * @param {number} version 版本
     * @returns {number}
     */
    static getCharCountIndicatorLength = function (version) {
        return version < 10 ? 9 : (version < 27 ? 11 : 13);
    }

    /**
     * 計算長度
     * @param {number} version 版本
     * @param {number} count 共幾個
     * @param {boolean} isConcat 是否接續前面（若為是，則不加 Indicator 長度）
     * @param {number} remainder 當接續前面時，前面長度的餘數
     * @returns {number} 總長度，單位為 bit
     */
    static getLength = function (version, count, isConcat, remainder) {
        if (isConcat) {
            switch (remainder) {
                case 0:
                    return (count >>> 1) * 11 + (count & 1) * 6;
                case 1:
                    return 5 + (count - 1 >>> 1) * 11 + (count - 1 & 1) * 6;
                default:
                    throw 'bad remainder: ' + remainder;
            }
        } else {
            return (count >>> 1) * 11 + (count & 1) * 6 + 4 + AlphanumericMode.getCharCountIndicatorLength(version);
        }
    }

    constructor(data, version) {
        this.data = data;
        this.countIndicatorLength = AlphanumericMode.getCharCountIndicatorLength(version);
    }

    /** 
     * 取得此寫入資料需要幾位元
     * @returns {number}
     */
    getLength() {
        let len = this.data.length;
        return 4 + this.countIndicatorLength + (len >>> 1) * 11 + (len & 1) * 6;
    }

    /**
     * 寫入到 Binary 物件
     * @param {BitBuffer} bin
     */
    write(bin) {
        // mode indicator
        bin.appendBits(2, 4);

        // character count indicator
        bin.appendBits(this.data.length, this.countIndicatorLength);

        // value
        let str = this.data;
        for (let i = 1; i < str.length; i += 2) {
            let x = codeMap.get(str.codePointAt(i - 1)) * 45 + codeMap.get(str.codePointAt(i));
            bin.appendBits(x, 11);
        }
        if (str.length & 1) {
            let x = codeMap.get(str.codePointAt(str.length - 1));
            bin.appendBits(x, 6);
        }
    }

    /**
     * 取得此 Mode 名稱
     * @returns {string}
     */
    getName() {
        return 'Alphanumeric';
    }

    /**
     * 把 data 資訊寫入 segments
     * @param {array} segments 
     */
    dumpData(segments) {
        segments.push({ mode: 'alphanumeric', data: this.data });
    }
}

export default AlphanumericMode;