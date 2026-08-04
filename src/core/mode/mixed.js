import BitBuffer from "../bit-buffer.js";
import getBestPath from './graph.js';

class MixedMode {
    /**
     * 取得 Mode 物件
     * @param {string} data 
     * @param {number} version 版本
     * @param {boolean} enableEci 是否開啟 eci
     * @returns {?MixedMode} 若為合理資料回傳 Mode 物件，否則回傳 null
     */
    static create = function (data, version, enableEci) {
        return new MixedMode(getBestPath(data, version, enableEci), version);
    }

    constructor(data, version) {
        const [eci, path] = data;
        this.data = path;
        this.len = this.data.reduce((len, mode) => {
            return len + mode.getLength()
        }, 0) + (eci ? 12 : 0);
        this.eci = eci;
    }

    /** 
     * 取得此寫入資料需要幾位元
     * @returns {number}
     */
    getLength() {
        return this.len;
    }

    /**
     * 寫入到 Binary 物件
     * @param {BitBuffer} bin
     */
    write(bin) {
        if (this.eci) {
            bin.appendBits(0x71a, 12);
        }
        this.data.forEach(mode => {
            mode.write(bin);
        });
    }

    /**
     * 取得此 Mode 名稱
     * @returns {string}
     */
    getName() {
        return this.data.length === 1 ? this.data[0].getName() : 'Mixed: ' + this.data.map(m => m.getName()).join(' + ');
    }
}

export default MixedMode;