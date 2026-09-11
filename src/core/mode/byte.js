import BitBuffer from "../bit-buffer.js";

/**
 * 基本的 Byte 模式
 * 
 * 做 encoding 時繼承此類別並複寫:
 * 1. static ECI
 * 2. static create
 */
class ByteMode {
    /** @type {?number} */
    static ECI = null;

    /**
     * 取得 Mode 物件
     * @param {Uint8Array} data 
     * @param {number} version 版本
     * @param {boolean} enableEci 是否開啟 eci
     * @returns {?ByteMode} 若為合理資料回傳 Mode 物件，否則回傳 null
     */
    static create = function (data, version, enableEci) {
        return new ByteMode(data, version, enableEci);
    }

    /**
     * 判斷某字是否能使用此模式
     * @param {number} unicode
     * @returns {boolean}
     */
    static hasUnicode = function (unicode) {
        return true;
    }

    /**
     * 取得在某版本時 character count indicator 所需要的位元數
     * @param {number} version 版本
     * @returns {number}
     */
    static getCharCountIndicatorLength = function (version) {
        return version < 10 ? 8 : (version < 27 ? 16 : 16);
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
        return count * 8 + (isConcat ? 0 : 4 + ByteMode.getCharCountIndicatorLength(version));
    }

    constructor(data, version, enableEci) {
        this.data = data;
        this.countIndicatorLength = ByteMode.getCharCountIndicatorLength(version);
        this.enableEci = enableEci;
    }

    /** 
     * 取得此寫入資料需要幾位元
     * @returns {number}
     */
    getLength() {
        return (this.enableEci ? 12 : 0) + 4 + this.countIndicatorLength + this.data.length * 8;
    }

    /**
     * 寫入到 Binary 物件
     * @param {BitBuffer} bin
     */
    write(bin) {
        // eci 26
        if (this.enableEci && this.constructor.ECI !== null) {
            const eci = this.constructor.ECI;
            bin.appendBits(7, 4);
            if (eci < 0x80) {
                bin.appendBits(eci, 8);
            } else if (eci < 0x4000) {
                bin.appendBits(eci, 16);
            } else if (eci < 1000000) {
                bin.appendBits(eci, 24);
            } else {
                throw 'bad eci: ' + eci;
            }
        }

        // mode indicator
        bin.appendBits(4, 4);

        // character count indicator
        bin.appendBits(this.data.length, this.countIndicatorLength);

        // value
        for (let i = 0; i < this.data.length; ++i) {
            bin.appendBits(this.data[i], 8);
        }
    }

    /**
     * 取得此 Mode 名稱
     * @returns {string}
     */
    getName() {
        return 'Byte';
    }

    /**
     * 把 data 資訊寫入 segments
     * @param {array} segments 
     */
    dumpData(segments) {
        if (this.enableEci && this.constructor.ECI) {
            segments.push({ mode: 'eci', data: this.constructor.ECI });
        }
        segments.push({ mode: 'byte', data: this.data });
    }
}

export default ByteMode;