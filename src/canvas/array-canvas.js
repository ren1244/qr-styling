import Canvas from "./interface.js";

/**
 * @class
 * @implements {Canvas}
 */
function ArrayCanvas() {
    this.sz = null;
    this.arr = null;
}

ArrayCanvas.prototype = {

    setSize(size) {
        this.sz = size;
        this.arr = Array.from({ length: size }, x => Array.from({ length: size }, x => null));
    },

    setPoint(row, col, val) {
        this.arr[row][col] = val;
    },

    getPoint(row, col) {
        return this.arr[row][col];
    }
};

export default ArrayCanvas;