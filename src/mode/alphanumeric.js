import Binary from "../binary.js";

const codeMap = (() => {
    let s = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
    let m = new Map();
    let n = s.length;
    for (let i = 0; i < n; ++i) {
        m.set(s.codePointAt(i), i);
    }
    return m;
})();

function AlphanumericMode(data, version) {
    this.data = data;
    this.countIndicatorLength = AlphanumericMode.getCharCountIndicatorLength(version);
}

/**
 * 取得 Mode 物件
 * @param {string} data 
 * @param {number} version 版本
 * @returns {?AlphanumericMode} 若為合理資料回傳 Mode 物件，否則回傳 null
 */
AlphanumericMode.create = function (data, version) {
    if (data.search(/^[0-9A-Z \$\%\*\+\-\.\/\:]+$/) > -1) {
        return new AlphanumericMode(data, version);
    } else {
        return null;
    }
}

/**
 * 取得在某版本時 character count indicator 所需要的位元數
 * @param {number} version 版本
 * @returns {number}
 */
AlphanumericMode.getCharCountIndicatorLength = function (version) {
    return version < 10 ? 9 : (version < 27 ? 11 : 13);
}

/** 
 * 取得此寫入資料需要幾位元
 * @returns {number}
 */
AlphanumericMode.prototype.getLength = function () {
    let len = this.data.length;
    return 4 + this.countIndicatorLength + (len >>> 1) * 11 + (len & 1) * 6;
}

/**
 * 寫入到 Binary 物件
 * @param {Binary} bin
 */
AlphanumericMode.prototype.write = function (bin) {
    // mode indicator
    bin.write(2, 4);

    // character count indicator
    bin.write(this.data.length, this.countIndicatorLength);

    // value
    let str = this.data;
    for (let i = 1; i < str.length; i += 2) {
        let x = codeMap.get(str.codePointAt(i - 1)) * 45 + codeMap.get(str.codePointAt(i));
        bin.write(x, 11);
    }
    if(str.length & 1) {
        let x = codeMap.get(str.codePointAt(str.length - 1));
        bin.write(x, 6);
    }
}

export default AlphanumericMode;