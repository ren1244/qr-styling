import NumericMode from './numeric.js';
import AlphanumericMode from './alphanumeric.js';
import KanjiMode from './kanji.js';
import ByteMode from './byte.js';
import dijkstra from 'dijkstrajs';

// for start and end node
function NullMode() { }

/**
 * @typedef {typeof NumericMode|typeof AlphanumericMode|typeof KanjiMode|typeof ByteMode|typeof NullMode} Mode
 */

class Node {

    /**
     * @param {number} pos 
     * @param {Mode} mode 
     * @param {number} remainder 
     * @param {boolean} eciFlag 
     */
    static getId(pos, mode, remainder, eciFlag) {
        return `p${pos}-${mode.name}-${remainder}-${eciFlag ? 'T' : 'F'}`;
    }

    /**
     * @param {number} pos 
     * @param {Mode} mode 
     * @param {number} remainder 
     * @param {boolean} eciFlag 
     */
    constructor(pos, mode, remainder, eciFlag) {
        this.id = Node.getId(pos, mode, remainder, eciFlag);
        this.pos = pos;
        this.mode = mode;
        this.remainder = remainder;
        this.eciFlag = eciFlag
    }
}

class NodeCollection {

    constructor() {
        /** @type {Map<id: string, Node>} */
        this.dict = new Map();

        /** @type {Map<pos: number, Node[]>} */
        this.groups = new Map();
    }

    /**
     * @param {number} pos 
     * @param {Mode} mode 
     * @param {number} remainder 
     * @param {boolean} eciFlag 
     * @returns {Node}
     */
    getNode(pos, mode, remainder, eciFlag) {
        const id = Node.getId(pos, mode, remainder, eciFlag);
        if (!this.dict.has(id)) {
            const node = new Node(pos, mode, remainder, eciFlag);
            this.dict.set(id, node);
            if (!this.groups.has(pos)) {
                this.groups.set(pos, []);
            }
            this.groups.get(pos).push(node);
        }
        return this.dict.get(id);
    }

    /**
     * @param {number} pos 
     * @returns {Node[]}
     */
    getGroup(pos) {
        return this.groups.get(pos);
    }

    /**
     * @param {string} id 
     * @returns {Node}
     */
    getNodeById(id) {
        return this.dict.get(id);
    }
}

function getBestPath(str, version, enableEci) {
    const nodeCollection = new NodeCollection();
    const startNode = nodeCollection.getNode(0, NullMode, 0, false);
    startNode.id = 'start';
    const graph = {};

    function link(srcId, destId, len) {
        if (graph[srcId] === undefined) {
            graph[srcId] = {};
        }
        graph[srcId][destId] = len;
    }

    /**
     * @param {Mode} mode 
     * @param {number} pos 
     * @param {number} count 
     */
    function pathTo(mode, pos, count) {
        const grp = nodeCollection.getGroup(pos - 1);
        for (let prevNode of grp) {
            const eciFlag = enableEci && (prevNode.eciFlag || mode === ByteMode);
            let remainder = 0;
            if (mode === AlphanumericMode) {
                remainder = ((mode === prevNode.mode ? prevNode.remainder : 0) + count) % 2;
            } else if (mode === NumericMode) {
                remainder = ((mode === prevNode.mode ? prevNode.remainder : 0) + count) % 3;
            }
            const node = nodeCollection.getNode(pos, mode, remainder, eciFlag);
            const len = mode.getLength(version, count, prevNode.mode === mode, remainder);
            link(prevNode.id, node.id, len);
        }
    }

    // 掃描字串建立 graph
    let pos = 0;
    for (let i = 0; i < str.length; ++i) {
        const unicode = str.codePointAt(i);
        const nBytes = unicode < 0x800 ? (unicode < 0x80 ? 1 : 2) : (unicode < 0x10000 ? 3 : 4);
        if (unicode > 0xffff) {
            ++i;
        }
        ++pos;
        if (NumericMode.hasUnicode(unicode)) {
            pathTo(NumericMode, pos, 1);
            pathTo(AlphanumericMode, pos, 1);
            pathTo(ByteMode, pos, nBytes);
        } else if (AlphanumericMode.hasUnicode(unicode)) {
            pathTo(AlphanumericMode, pos, 1);
            pathTo(ByteMode, pos, nBytes);
        } else if (KanjiMode.hasUnicode(unicode)) {
            pathTo(KanjiMode, pos, 1);
            pathTo(ByteMode, pos, nBytes);
        } else {
            pathTo(ByteMode, pos, nBytes);
        }
    }

    // 結尾
    for (let prevNode of nodeCollection.getGroup(pos)) {
        if (prevNode.eciFlag) {
            link(prevNode.id, 'eci', 12);
            link('eci', 'end', 0);
        } else {
            link(prevNode.id, 'end', 0);
        }
    }

    // 取得路徑
    const path = dijkstra.find_path(graph, 'start', 'end');

    const eci = path[path.length - 2] === 'eci';
    const result = [];
    pos = 0;
    let startIdx = 0;
    /** @type {?Mode} */
    let prevMode = null;
    let i;
    for (i = 0; i < str.length; ++i) {
        const unicode = str.codePointAt(i);
        const nBytes = unicode < 0x800 ? (unicode < 0x80 ? 1 : 2) : (unicode < 0x10000 ? 3 : 4);
        ++pos;
        const node = nodeCollection.getNodeById(path[pos]);
        if (node.mode !== prevMode) {
            if (i > startIdx) {
                result.push(prevMode.create(str.slice(startIdx, i), version));
            }
            prevMode = node.mode;
            startIdx = i;
        }
        if (unicode > 0xffff) {
            ++i;
        }
    }
    if (i > startIdx) {
        result.push(prevMode.create(str.slice(startIdx, i), version));
    }
    return [eci, result];
}

export default getBestPath;