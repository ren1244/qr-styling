import BitBuffer from "../bit-buffer.js";
import Graph from './graph.js';

let cacheStr = null;
let cacheGraph = null;

/**
 * @param {string} data 
 * @returns {Graph}
 */
function getGraph(data) {
    if (cacheStr !== data) {
        cacheStr = data;
        cacheGraph = new Graph(cacheStr);
    }
    return cacheGraph;
}

function MixedMode(data, version) {
    this.data = data;
    this.len = this.data.reduce((len, mode) => {
        return len + mode.getLength()
    }, 0);
}

/**
 * 取得 Mode 物件
 * @param {string} data 
 * @param {number} version 版本
 * @returns {?MixedMode} 若為合理資料回傳 Mode 物件，否則回傳 null
 */
MixedMode.create = function (data, version) {
    const graph = getGraph(data);
    const bestPath = graph.getBestPath(version).map(o => {
        return o.mode.create(o.str, version);
    });
    return new MixedMode(bestPath, version);
}

MixedMode.prototype = {

    /** 
     * 取得此寫入資料需要幾位元
     * @returns {number}
     */
    getLength() {
        return this.len;
    },

    /**
     * 寫入到 Binary 物件
     * @param {BitBuffer} bin
     */
    write(bin) {
        this.data.forEach(mode => {
            mode.write(bin);
        });
    },

    /**
     * 取得此 Mode 名稱
     * @returns {string}
     */
    getName() {
        return this.data.length === 1 ? this.data[0].getName() : 'Mixed: ' + this.data.map(m => m.getName()).join(' + ');
    },
};

export default MixedMode;