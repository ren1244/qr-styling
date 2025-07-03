import Canvas from "./interface.js";

const P_TRUE = 3;
const P_FALSE = 2;
const P_FIXED_TRUE = 0xffff;
const P_FIXED_FALSE = 0xaaaa;
const P_OFFSET = [0, 2, 4, 6, 8, 10, 12, 14];
const P_MASK = 3;

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
        this.arr = new Uint16Array(size * size);
    },

    setPoint(row, col, val, maskVersion) {
        if (maskVersion === undefined) {
            val = val ? P_FIXED_TRUE : P_FIXED_FALSE;
        } else {
            val = (val ? P_TRUE : P_FALSE) << P_OFFSET[maskVersion];
        }
        this.arr[row * this.sz + col] |= val;
    },

    getPoint(row, col, maskVersion) {
        let val = this.arr[row * this.sz + col];
        if (maskVersion === undefined) {
            return val === P_FIXED_TRUE ? 1 : (val === P_FIXED_FALSE ? 0 : null);
        } else {
            val = val >>> P_OFFSET[maskVersion] & P_MASK;
            return val === P_TRUE ? 1 : (val === P_FALSE ? 0 : null);
        }
    },

    dump(canvas, maskVersion) {
        canvas.setSize(this.sz);
        for (let r = 0; r < this.sz; ++r) {
            for (let c = 0; c < this.sz; ++c) {
                let val = this.getPoint(r, c, maskVersion);
                if (val !== null) {
                    canvas.setPoint(r, c, val);
                }
            }
        }
    }
};

export default ArrayCanvas;