/**
 * @interface
 */
function Canvas() {}


Canvas.prototype = {
    /**
     * 設定尺寸
     * @param {number} size 尺寸
     */
    setSize(size) {},

    /**
     * 設定某個點為某數值
     * @param {number} row 0 ~ size - 1
     * @param {number} col 0 ~ size - 1
     * @param {number} val 0 or 1
     */
    setPoint(row, col, val) {},

    /**
     * 某點的值，0表白色，1表黑色，null 表尚未填值
     * @param {number} row 0 ~ size - 1
     * @param {number} col 0 ~ size - 1
     * @returns {number|null} 0 | 1 | null
     */
    getPoint(row, col) {},
}

export default Canvas;