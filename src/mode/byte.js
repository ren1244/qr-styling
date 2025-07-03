import Binary from "../binary.js";

function ByteMode(data, version) {
    this.data = new TextEncoder().encode(data);
    this.countIndicatorLength = ByteMode.getCharCountIndicatorLength(version);
}

/**
 * 取得 Mode 物件
 * @param {string} data 
 * @param {number} version 版本
 * @returns {?ByteMode} 若為合理資料回傳 Mode 物件，否則回傳 null
 */
ByteMode.create = function(data, version) {
    return new ByteMode(data, version);
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
 * 取得此寫入資料需要幾位元
 * @returns {number}
 */
ByteMode.prototype.getLength = function() {
    return 4 + this.countIndicatorLength + this.data.length * 8;
}

/**
 * 寫入到 Binary 物件
 * @param {Binary} bin
 */
ByteMode.prototype.write = function(bin) {
    // mode indicator
    bin.write(4, 4);

    // character count indicator
    bin.write(this.data.length, this.countIndicatorLength);

    // value
    for (let i = 0; i < this.data.length; ++i) {
        bin.write(this.data[i], 8);
    }
}

export default ByteMode;