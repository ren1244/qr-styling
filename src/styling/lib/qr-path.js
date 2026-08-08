function qrPath(mtx, width, height) {
    /**
     * bit 0-3: 儲存前往方向
     * bit 4 以上：群組 ID
     */
    const points = new Uint32Array((width + 1) * (height + 1));

    /**
     * key 為群組 ID
     * value 為 index of points
     */
    const startIndices = new Map();

    /**
     * 儲存起始點的 index
     */
    const counters = [];

    const DIR_UP = 1;
    const DIR_RIGHT = 2;
    const DIR_DOWN = 4;
    const DIR_LEFT = 8;

    const DIR_OFFSET = [];
    DIR_OFFSET[DIR_UP] = -(width + 1);
    DIR_OFFSET[DIR_RIGHT] = 1;
    DIR_OFFSET[DIR_DOWN] = (width + 1);
    DIR_OFFSET[DIR_LEFT] = -1;

    let groupId = 0;

    function saveCounter(startIdx) {
        let result = [startIdx];
        let d = 0, i;
        for (i = 0; i < 4; ++i) {
            if (points[startIdx] & (1 << i)) {
                d = 1 << i;
                break;
            }
        }
        if (i === 4) {
            throw 'd = 0';
        }
        let p = startIdx + DIR_OFFSET[d];
        result.push(p);
        while (1) {
            for (i = 0; i < 4; ++i) {
                if (points[p] & d) {
                    break;
                }
                d = d === 8 ? 1 : (d << 1);
            }
            if (i === 4) {
                throw '沒方向了';
            }
            p += DIR_OFFSET[d];
            if (p === startIdx) {
                break;
            }
            if (i === 0) {
                result[result.length - 1] = p;
            } else {
                result.push(p);
            }
        }

        result = result.map(v => {
            return {
                x: v % (width + 1),
                y: v / (width + 1) >>> 0
            };
        });

        const p0 = result[0];
        const p1 = result[1];
        const p2 = result[result.length - 1];
        const crossProduct = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
        if (crossProduct === 0) {
            result[0] = p2;
            --result.length;
        }
        counters.push(result);
    }

    function addPath(x0, y0, direction) {
        const p0 = x0 + y0 * (width + 1);
        const p1 = p0 + DIR_OFFSET[direction];
        const g0 = points[p0] >>> 4;
        const g1 = points[p1] >>> 4;
        points[p0] |= direction;

        if (g0 && g1) {
            if (g0 === g1) {
                // 找到封閉路徑
                points[p0] &= 0xf;
                points[p1] &= 0xf;
                saveCounter(startIndices.get(g0));
                startIndices.delete(g0);
            } else {
                // 合併
                const pHead = startIndices.get(g0);
                points[p0] &= 0xf;
                points[p1] &= 0xf;
                points[pHead] = g1 << 4 | points[pHead] & 0xf;
                startIndices.set(g1, pHead);
                startIndices.delete(g0);
            }
        } else if (!(g0 | g1)) {
            // 建立新的群組
            const gid = ++groupId;
            points[p0] = gid << 4 | points[p0] & 0xf;
            points[p1] = gid << 4 | points[p1] & 0xf;
            startIndices.set(gid, p0);
        } else if (g0) {
            points[p0] &= 0xf;
            points[p1] = g0 << 4 | points[p1] & 0xf;
        } else {
            points[p1] &= 0xf;
            points[p0] = g1 << 4 | points[p0] & 0xf;
            startIndices.set(g1, p0);
        }
    }

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (mtx[x + y * width]) {
                if (x - 1 < 0 || !mtx[(x - 1) + y * width]) {
                    addPath(x, y + 1, DIR_UP);
                }
                if (y - 1 < 0 || !mtx[x + (y - 1) * width]) {
                    addPath(x, y, DIR_RIGHT);
                }
                if (x + 1 >= width || !mtx[(x + 1) + y * width]) {
                    addPath(x + 1, y, DIR_DOWN);
                }
                if (y + 1 >= height || !mtx[x + (y + 1) * width]) {
                    addPath(x + 1, y + 1, DIR_LEFT);
                }
            }
        }
    }
    return counters;
}

export { qrPath };
