function iterFunc(nCols, s1, offset1, r1, s2, offset2, r2) {
    let nRows = r1 + r2;
    let n = nCols * nRows;
    let idx = 0;
    return function () {
        if (idx >= n) {
            return null;
        }
        let r = idx % nRows;
        let c = (idx - r) / nRows;
        let v = r < r1 ? s1 + r * offset1 + c : s2 + (r - r1) * offset2 + c;
        ++idx;
        return v;
    }
}

function groupIterator(group) {
    let queue = [];
    if (group.length === 2) {
        let [r1, c1] = group;
        queue.push(iterFunc(c1, 0, c1, r1, 0, 0, 0));
    } else if (group.length === 4) {
        let [r1, c1, r2, c2] = group;
        let minCol = c1 < c2 ? c1 : c2;
        queue.push(iterFunc(minCol, 0, c1, r1, r1 * c1, c2, r2));
        if (c1 < c2) {
            queue.push(iterFunc(c2 - minCol, 0, 0, 0, r1 * c1 + minCol, c2, r2));
        } else if (c1 > c2) {
            queue.push(iterFunc(c1 - minCol, minCol, c1, r1, 0, 0, 0));
        }
    } else {
        throw '錯誤的 group';
    }
    return {
        queue,
        idx: 0,
        next() {
            if (this.idx >= this.queue.length) {
                return { done: true };
            }
            let val = queue[this.idx]();
            while (val === null) {
                ++this.idx;
                if (this.idx >= this.queue.length) {
                    return { done: true };
                }
                val = queue[this.idx]();
            }
            return val === null ? { done: true } : { done: false, value: val };
        },
        [Symbol.iterator]: function () {
            return this;
        },
    };
}

export { groupIterator };