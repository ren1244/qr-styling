import BitBuffer from "../bit-buffer.js";

function ByteMode(data, version, enableEci) {
    this.data = new TextEncoder().encode(data);
    this.countIndicatorLength = ByteMode.getCharCountIndicatorLength(version);
    this.enableEci = enableEci;
}

/**
 * 取得 Mode 物件
 * @param {string} data 
 * @param {number} version 版本
 * @param {boolean} enableEci 是否開啟 eci
 * @returns {?ByteMode} 若為合理資料回傳 Mode 物件，否則回傳 null
 */
ByteMode.create = function (data, version, enableEci) {
    return new ByteMode(data, version, enableEci);
}

/**
 * 判斷某字是否能使用此模式
 * @param {number} unicode
 * @returns {boolean}
 */
ByteMode.hasUnicode = function (unicode) {
    return true;
}

/**
 * 取得在某版本時 character count indicator 所需要的位元數
 * @param {number} version 版本
 * @returns {number}
 */
ByteMode.getCharCountIndicatorLength = function (version) {
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
ByteMode.getLength = function (version, count, isConcat, remainder) {
    return count * 8 + (isConcat ? 0 : 4 + ByteMode.getCharCountIndicatorLength(version));
}

ByteMode.prototype = {

    /** 
     * 取得此寫入資料需要幾位元
     * @returns {number}
     */
    getLength() {
        return (this.enableEci ? 12 : 0) + 4 + this.countIndicatorLength + this.data.length * 8;
    },

    /**
     * 寫入到 Binary 物件
     * @param {BitBuffer} bin
     */
    write(bin) {
        // eci 26
        if(this.enableEci) {
            bin.appendBits(0x71a, 12);
        }

        // mode indicator
        bin.appendBits(4, 4);

        // character count indicator
        bin.appendBits(this.data.length, this.countIndicatorLength);

        // value
        for (let i = 0; i < this.data.length; ++i) {
            bin.appendBits(this.data[i], 8);
        }
    },

    /**
     * 取得此 Mode 名稱
     * @returns {string}
     */
    getName() {
        return 'Byte';
    },
};

export default ByteMode;