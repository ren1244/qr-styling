/** @type {Map.<number,number>} unicode to kanji mapping */
const u2k = (() => {
    let dec = new TextDecoder('shift-jis', { fatal: true });
    let m = new Map();
    let buf = new ArrayBuffer(2);
    let dv = new DataView(buf);
    [[0x8140, 0x9ffc], [0xe040, 0xebbf]].forEach(a => {
        const [s, e] = a;
        for (let k = s; k < e; ++k) {
            dv.setUint16(0, k, false);
            try {
                let u = dec.decode(buf).codePointAt(0);
                m.set(u, k);
            } catch (e) { }
        }
    });
    return m;
})();

function KanjiMode(data, version) {
    /** @type {number[]} shift-jis codes */
    this.data = data;
    this.countIndicatorLength = KanjiMode.getCharCountIndicatorLength(version);
}

/**
 * 取得 Mode 物件
 * @param {string} data 
 * @param {number} version 版本
 * @returns {?KanjiMode} 若為合理資料回傳 Mode 物件，否則回傳 null
 */
KanjiMode.create = function (data, version) {
    let kanjiArray = [];
    for (let i = 0; i < data.length; ++i) {
        let u = data.codePointAt(i);
        let k = u2k.get(u);
        if (k === undefined) {
            return null;
        }
        kanjiArray.push(k);
        if (u > 0xffff) {
            ++i;
        }
    }
    return new KanjiMode(kanjiArray, version);
}

/**
 * 取得在某版本時 character count indicator 所需要的位元數
 * @param {number} version 版本
 * @returns {number}
 */
KanjiMode.getCharCountIndicatorLength = function (version) {
    return version < 10 ? 8 : (version < 27 ? 10 : 12);
}

KanjiMode.prototype = {

    /** 
     * 取得此寫入資料需要幾位元
     * @returns {number}
     */
    getLength() {
        return 4 + this.countIndicatorLength + this.data.length * 13;
    },

    /**
     * 寫入到 Binary 物件
     * @param {BitBuffer} bin
     */
    write(bin) {
        // mode indicator
        bin.appendBits(8, 4);

        // character count indicator
        bin.appendBits(this.data.length, this.countIndicatorLength);

        // value
        for (let i = 0; i < this.data.length; ++i) {
            let x = this.data[i];
            if (0xe040 <= x && x <= 0xebbf) {
                x -= 0xc140;
            } else {
                x -= 0x8140;
            }
            bin.appendBits((x >>> 8 & 0xff) * 192 + (x & 0xff), 13);
        }
    },

    /**
     * 取得此 Mode 名稱
     * @returns {string}
     */
    getName() {
        return 'Kanji';
    },
};

export default KanjiMode;