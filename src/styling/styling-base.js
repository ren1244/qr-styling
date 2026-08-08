import { qrPath } from './lib/qr-path.js';

function num2str(num) {
    return num.toFixed(3).replace(/\.?0+$/, '');
}

class StylingBase {
    constructor(data, size) {
        this.data = data;
        this.size = size;
    }

    getPaths() {
        const { size, data } = this;
        return qrPath(data, size, size);
    }

    getCommands() {
        throw 'Must Be Implemented';
    }

    getBBox() {
        const { size } = this;
        return { x: 0, y: 0, width: size, height: size };
    }

    getD() {
        const cmds = this.getCommands();
        return cmds.map(cmd => {
            let result = [cmd[0]];
            for (let i = 1; i < cmd.length; ++i) {
                result.push(num2str(cmd[i].x), num2str(cmd[i].y));
            }
            return result.join(' ');
        }).join(' ');
    }

    toSvg(edge, padding, quietFlag) {
        const cmds = this.getCommands();
        const size = this.size;
        const d = this.getD(cmds);
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
        const cmds = this.getCommands();
        ctx.save();
        ctx.transform(scale, 0, 0, scale, x, y);
        ctx.beginPath();
        cmds.forEach(cmd => {
            switch (cmd[0]) {
                case 'M':
                    ctx.moveTo(cmd[1].x, cmd[1].y);
                    break;
                case 'L':
                    ctx.lineTo(cmd[1].x, cmd[1].y);
                    break;
                case 'C':
                    ctx.bezierCurveTo(cmd[1].x, cmd[1].y, cmd[2].x, cmd[2].y, cmd[3].x, cmd[3].y);
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
                default:
                    throw 'Unknow Path Command: ' + cmd[0];
            }
        });
        ctx.fill();
        ctx.restore();
    }
}

export default StylingBase;
