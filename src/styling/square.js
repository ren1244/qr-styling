import StylingBase from "./styling-base.js";
import { qrPath } from './lib/qr-path.js';

function num2str(num) {
    return num.toFixed(3).replace(/\.?0+$/, '');
}

export default class Square extends StylingBase {
    constructor(data, size) {
        super(data, size);
        this.pathArray = null;
    }

    getPathArray() {
        if (!this.pathArray) {
            this.pathArray = qrPath(this.data, this.size, this.size, true);
        }
        return this.pathArray;
    }

    getD() {
        const pathArray = this.getPathArray();
        const result = [];
        const divisor = this.size + 1;
        for (let path of pathArray) {
            result.push(`M ${path[0] % divisor} ${path[0] / divisor >>> 0}`);
            for (let i = 1, len = path.length; i < len; ++i) {
                result.push(`L ${path[i] % divisor} ${path[i] / divisor >>> 0}`);
            }
            result.push('Z');
        }
        return result.join(' ');
    }

    toSvg(edge, padding, quietFlag) {
        const size = this.size;
        const d = this.getD();
        if (quietFlag) {
            padding *= edge / (size + padding * 2);
        }
        const innerEdge = edge - padding * 2;
        if (innerEdge < 0) {
            throw 'padding is too large';
        }
        padding *= size / innerEdge;
        const offset = num2str(-padding);
        const viewSize = num2str(size + padding * 2);

        return `<svg xmlns="http://www.w3.org/2000/svg" width="${num2str(edge)}" height="${num2str(edge)}" viewBox="${offset} ${offset} ${viewSize} ${viewSize}">`
            + `<path d="${d}" fill="#000000"/>`
            + '</svg>';
    }

    draw(canvas, x, y, edgeSize) {
        /** @type {CanvasRenderingContext2D} */
        const ctx = canvas.getContext('2d');
        const scale = edgeSize / this.size;
        const pathArray = this.getPathArray();
        const divisor = this.size + 1;
        ctx.save();
        ctx.transform(scale, 0, 0, scale, x, y);
        ctx.beginPath();
        for (let path of pathArray) {
            ctx.moveTo(path[0] % divisor, path[0] / divisor >>> 0);
            for (let i = 1, len = path.length; i < len; ++i) {
                ctx.lineTo(path[i] % divisor, path[i] / divisor >>> 0);
            }
            ctx.closePath();
        }
        ctx.fill();
        ctx.restore();
    }
}
