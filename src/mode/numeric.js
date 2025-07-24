import BitBuffer from "../bit-buffer.js";

function NumericMode(data, version) {
    this.data = data;
    this.countIndicatorLength = NumericMode.getCharCountIndicatorLength(version);
}

/**
 * 取得 Mode 物件
 * @param {string} data 
 * @param {number} version 版本
 * @returns {?NumericMode} 若為合理資料回傳 Mode 物件，否則回傳 null
 */
NumericMode.create = function (data, version) {
    if (data.search(/^\d+$/) > -1) {
        return new NumericMode(data, version);
    } else {
        return null;
    }
}

/**
 * 取得在某版本時 character count indicator 所需要的位元數
 * @param {number} version 版本
 * @returns {number}
 */
NumericMode.getCharCountIndicatorLength = function (version) {
    return version < 10 ? 10 : (version < 27 ? 12 : 14);
}

NumericMode.prototype = {

    /** 
     * 取得此寫入資料需要幾位元
     * @returns {number}
     */
    getLength() {
        let r = this.data.length % 3;
        let q = (this.data.length - r) / 3;
        return 4 + this.countIndicatorLength + q * 10 + (r ? (r === 1 ? 4 : 7) : 0);
    },

    /**
     * 寫入到 Binary 物件
     * @param {BitBuffer} bin
     */
    write(bin) {
        // mode indicator
        bin.appendBits(1, 4);

        // character count indicator
        bin.appendBits(this.data.length, this.countIndicatorLength);

        // value
        let str = this.data;
        let x = 0;
        for (let i = 0; i < str.length; ++i) {
            let k = str.codePointAt(i) - 48;
            x = x * 10 + k;
            if (i % 3 === 2) {
                bin.appendBits(x, 10);
                x = 0;
            }
        }
        switch (str.length % 3) {
            case 1:
                bin.appendBits(x, 4);
                break;
            case 2:
                bin.appendBits(x, 7);
                break;
        }
    },

    /**
     * 取得此 Mode 名稱
     * @returns {string}
     */
    getName() {
        return 'Numeric';
    },
}

export default NumericMode;