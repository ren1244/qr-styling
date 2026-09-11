import ByteMode from './byte.js';

class Utf8 extends ByteMode {
    /**
     * 取得 Mode 物件
     * @param {string} data 
     * @param {number} version 版本
     * @param {boolean} enableEci 是否開啟 eci
     * @returns {?ByteMode} 若為合理資料回傳 Mode 物件，否則回傳 null
     */
    static create = function (data, version, enableEci) {
        data = new TextEncoder().encode(data);
        return new Utf8(data, version, enableEci);
    }

    static ECI = 26;
}

export default Utf8;
