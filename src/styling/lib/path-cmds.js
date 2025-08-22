class PathInfo {
    static TL = 1;
    static TR = 4;
    static BL = 2;
    static BR = 8;
    constructor(closePath) {
        this.closePath = closePath;
        this.len = closePath.length;
    }

    isConvex(idx) {
        let prev = this.closePath[(idx + this.len - 1) % this.len];
        let curr = this.closePath[(idx + this.len) % this.len];
        let next = this.closePath[(idx + this.len + 1) % this.len];
        return (curr.x - prev.x) * (next.y - curr.y) - (curr.y - prev.y) * (next.x - curr.x) > 0;
    }

    squareDistance(idx, offset) {
        let p0 = this.closePath[(idx + this.len) % this.len];
        let p1 = this.closePath[(idx + offset + this.len) % this.len];
        return (p0.x - p1.x) * (p0.x - p1.x) + (p0.y - p1.y) * (p0.y - p1.y);
    }

    corner(idx) {
        let prev = this.closePath[(idx + this.len - 1) % this.len];
        let curr = this.closePath[(idx + this.len) % this.len];
        let next = this.closePath[(idx + this.len + 1) % this.len];
        return 1 << ((curr.x * 2 > prev.x + next.x ? 2 : 0) | (curr.y * 2 > prev.y + next.y ? 1 : 0));
    }

    getRoundPoints(idx, r) {
        let p = this.closePath[(idx + this.len) % this.len];
        let ctrl = r * 0.448;
        let result;
        switch (this.corner(idx)) {
            case PathInfo.TL:
                result = [{ x: p.x, y: p.y + r }, { x: p.x, y: p.y + ctrl }, { x: p.x + ctrl, y: p.y }, { x: p.x + r, y: p.y }];
                break;
            case PathInfo.TR:
                result = [{ x: p.x - r, y: p.y }, { x: p.x - ctrl, y: p.y }, { x: p.x, y: p.y + ctrl }, { x: p.x, y: p.y + r }];
                break;
            case PathInfo.BL:
                result = [{ x: p.x + r, y: p.y }, { x: p.x + ctrl, y: p.y }, { x: p.x, y: p.y - ctrl }, { x: p.x, y: p.y - r }];
                break;
            case PathInfo.BR:
                result = [{ x: p.x, y: p.y - r }, { x: p.x, y: p.y - ctrl }, { x: p.x - ctrl, y: p.y }, { x: p.x - r, y: p.y }];
                break;
            default:
                throw 'error';
        }
        return result;
    }
}

/**
 * @typedef {(string|number)[]} Command 第一個元素為字串，其他為數值，代表：[命令, x0, y0, x1, y1, ...]，命令可能是 'M', 'L', 'C', 'Z'
 */

/**
 * 把 closePathArray 轉為 svg 命令
 * @param {import('./qr-path.js').closePath} closePathArray
 * @param {number} topLeftRadius 左上角半徑，數值應為 [0, 1] 區間
 * @param {number} topRightRadius 右上角半徑，數值應為 [0, 1] 區間
 * @param {number} bottomLeftRadius 左下角半徑，數值應為 [0, 1] 區間
 * @param {number} bottomRightRadius 右下角半徑，數值應為 [0, 1] 區間
 * @returns {Command[]}
 */
function pathCommands(closePathArray, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
    topLeftRadius = Math.max(Math.min(topLeftRadius, 1), 0);
    topRightRadius = Math.max(Math.min(topRightRadius, 1), 0);
    bottomLeftRadius = Math.max(Math.min(bottomLeftRadius, 1), 0);
    bottomRightRadius = Math.max(Math.min(bottomRightRadius, 1), 0);
    let cmds = [];
    closePathArray.forEach(closePath => {
        let info = new PathInfo(closePath);
        let pen = { x: null, y: null };
        for (let i = 0; i < closePath.length; ++i) {
            if (info.isConvex(i)) {
                let thisCorner = info.corner(i);
                let corner = thisCorner;
                let radiusDenominator = 1;
                if (info.squareDistance(i, -1) === 1 && info.isConvex(i - 1)) {
                    corner |= info.corner(i - 1);
                }
                if (info.squareDistance(i, 1) === 1 && info.isConvex(i + 1)) {
                    corner |= info.corner(i + 1);
                }
                if (info.squareDistance(i, 2) === 2 && info.isConvex(i + 2)) {
                    corner |= info.corner(i + 2);
                }
                let mask = PathInfo.TL | PathInfo.TR;
                if ((corner & mask) === mask) {
                    radiusDenominator = Math.max(topLeftRadius + topRightRadius, radiusDenominator);
                }
                mask = PathInfo.BL | PathInfo.BR;
                if ((corner & mask) === mask) {
                    radiusDenominator = Math.max(bottomLeftRadius + bottomRightRadius, radiusDenominator);
                }
                mask = PathInfo.TL | PathInfo.BL;
                if ((corner & mask) === mask) {
                    radiusDenominator = Math.max(topLeftRadius + bottomLeftRadius, radiusDenominator);
                }
                mask = PathInfo.TR | PathInfo.BR;
                if ((corner & mask) === mask) {
                    radiusDenominator = Math.max(topRightRadius + bottomRightRadius, radiusDenominator);
                }
                mask = PathInfo.TL | PathInfo.BR;
                if ((corner & mask) === mask) {
                    radiusDenominator = Math.max(topLeftRadius + bottomRightRadius, radiusDenominator);
                }
                mask = PathInfo.TR | PathInfo.BL;
                if ((corner & mask) === mask) {
                    radiusDenominator = Math.max(topRightRadius + bottomLeftRadius, radiusDenominator);
                }
                let p = closePath[i], points;
                if (thisCorner === PathInfo.TL) {
                    let r = topLeftRadius / radiusDenominator;
                    let c = r * 0.448;
                    points = [
                        { x: p.x, y: p.y + r },
                        { x: p.x, y: p.y + c },
                        { x: p.x + c, y: p.y },
                        { x: p.x + r, y: p.y },
                    ];
                } else if (thisCorner === PathInfo.TR) {
                    let r = topRightRadius / radiusDenominator;
                    let c = r * 0.448;
                    points = [
                        { x: p.x - r, y: p.y },
                        { x: p.x - c, y: p.y },
                        { x: p.x, y: p.y + c },
                        { x: p.x, y: p.y + r },
                    ];
                } else if (thisCorner === PathInfo.BL) {
                    let r = bottomLeftRadius / radiusDenominator;
                    let c = r * 0.448;
                    points = [
                        { x: p.x + r, y: p.y },
                        { x: p.x + c, y: p.y },
                        { x: p.x, y: p.y - c },
                        { x: p.x, y: p.y - r },
                    ];
                } else if (thisCorner === PathInfo.BR) {
                    let r = bottomRightRadius / radiusDenominator;
                    let c = r * 0.448;
                    points = [
                        { x: p.x, y: p.y - r },
                        { x: p.x, y: p.y - c },
                        { x: p.x - c, y: p.y },
                        { x: p.x - r, y: p.y },
                    ];
                }
                points = points.map(p => {
                    return { x: p.x, y: p.y };
                });
                if (pen.x !== points[0].x || pen.y !== points[0].y) {
                    cmds.push([i === 0 ? 'M' : 'L', points[0]]);
                    pen = points[0];
                }
                let endPoint = points[points.length - 1];
                if (endPoint.x !== points[0].x && endPoint.y !== points[0].y) {
                    points[0] = 'C';
                    cmds.push(points);
                    pen = endPoint;
                }
            } else {
                let p = { x: closePath[i].x, y: closePath[i].y };
                if (pen.x !== p.x || pen.y !== p.y) {
                    cmds.push([i === 0 ? 'M' : 'L', p]);
                    pen = p;
                }
            }
        }
        cmds.push(['Z']);
    });
    return cmds;
}

export { pathCommands };
