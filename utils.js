import { ReedSolomonEncoder, GenericGF } from './readmon.js';

/**
 * @param {Int32Array} massage
 * @param {number} errorCorrectionLength
 * @returns {Int32Array} 
 */
const RS = (() => {
    const encoder = new ReedSolomonEncoder(GenericGF.QR_CODE_FIELD_256());
    return function (massage, errorCorrectionLength) {
        let buf = new Int32Array(massage.length + errorCorrectionLength);
        buf.set(massage);
        encoder.encode(buf, errorCorrectionLength)
        return new Int32Array(buf.buffer, massage.length * 4);
    }
})();

export { RS };
