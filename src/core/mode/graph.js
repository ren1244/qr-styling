import NumericMode from './numeric.js';
import AlphanumericMode from './alphanumeric.js';
import KanjiMode from './kanji.js';
import ByteMode from './byte.js';
import dijkstra from 'dijkstrajs';

/**
 * @typedef {typeof NumericMode|typeof AlphanumericMode|typeof KanjiMode|typeof ByteMode} Mode
 */

/**
 * @typedef {{str: string, count: number, byteCount: number, mode: Mode}} Segment
 */


class Node {
    constructor(id, str, mode, count) {
        this.id = id;
        this.str = str;
        this.mode = mode;
        this.count = count;
        this.nextNodes = [];
        this.prevNodes = [];
    }

    linkTo(nextNode) {
        this.nextNodes.push(nextNode);
        nextNode.prevNodes.push(this);
    }

    toString() {
        const links = this.nextNodes.map(n => n.id).join(', ');
        return `[${this.id}] => ([${this.count}]${JSON.stringify(this.str)}, ${this.mode ? this.mode.name : null}) => ${links}`;
    }
}

class Graph {
    /**
     * @param {string} str
     * @returns {Segment[]}
     */
    static getSegments(str) {
        let result = [];
        let startIdx = 0;
        let count = 0;
        let byteCount = 0;
        let prevMode = null;

        for (let i = 0; i < str.length; ++i) {
            const unicode = str.codePointAt(i);

            let mode = null;
            if (NumericMode.hasUnicode(unicode)) {
                mode = NumericMode;
            } else if (AlphanumericMode.hasUnicode(unicode)) {
                mode = AlphanumericMode;
            } else if (KanjiMode.hasUnicode(unicode)) {
                mode = KanjiMode;
            } else {
                mode = ByteMode;
            }

            if (prevMode !== mode) {
                if (prevMode !== null) {
                    result.push({
                        str: str.slice(startIdx, i),
                        count,
                        byteCount,
                        mode: prevMode,
                    });
                    startIdx = i;
                    byteCount = count = 0;
                }
                prevMode = mode;
            }
            ++count;
            byteCount += unicode < 0x800 ? (unicode < 0x80 ? 1 : 2) : (unicode < 0x10000 ? 3 : 4);
            if (unicode > 0xffff) {
                ++i;
            }
        }
        if (startIdx < str.length) {
            result.push({
                str: str.slice(startIdx),
                count,
                byteCount,
                mode: prevMode,
            });
        }
        return result;
    }

    /**
     * @param {string} str 
     * @returns Node[]
     */
    static getNodeArray(str) {
        let idCount = 0;
        const segments = Graph.getSegments(str);
        const startNode = new Node(idCount++, '', null, 0);
        const nodeArray = [startNode];
        let startIdx = 0;
        segments.forEach(seg => {
            const endIdx = nodeArray.length;
            let modeBranch;
            if (seg.mode === NumericMode) {
                modeBranch = [NumericMode, AlphanumericMode, ByteMode];
            } else if (seg.mode === AlphanumericMode) {
                modeBranch = [AlphanumericMode, ByteMode];
            } else if (seg.mode === KanjiMode) {
                modeBranch = [KanjiMode, ByteMode];
            } else {
                modeBranch = [ByteMode];
            }
            modeBranch.forEach(nextMode => {
                let newNodeCache = {};
                for (let i = startIdx; i < endIdx; ++i) {
                    const node = nodeArray[i];
                    if (
                        node.mode === nextMode &&
                        (nextMode === NumericMode || nextMode === AlphanumericMode)
                    ) {
                        node.prevNodes.forEach(prevNode => {
                            const combineStr = node.str + seg.str;
                            if (!newNodeCache[combineStr]) {
                                newNodeCache[combineStr] = new Node(
                                    idCount++,
                                    combineStr,
                                    nextMode,
                                    node.count + seg.count
                                );
                                nodeArray.push(newNodeCache[combineStr]);
                            }
                            prevNode.linkTo(newNodeCache[combineStr]);
                        });
                    } else {
                        if (!newNodeCache[seg.str]) {
                            newNodeCache[seg.str] = new Node(
                                idCount++,
                                seg.str,
                                nextMode,
                                seg[nextMode !== ByteMode ? 'count' : 'byteCount'],
                            );
                            nodeArray.push(newNodeCache[seg.str]);
                        }
                        node.linkTo(newNodeCache[seg.str]);
                    }
                }
            });
            startIdx = endIdx;
        });
        const endNode = new Node(idCount++, '', null, 0);
        for (let i = startIdx; i < nodeArray.length; ++i) {
            nodeArray[i].linkTo(endNode);
        }
        nodeArray.push(endNode);
        return nodeArray;
    }

    constructor(str) {
        this.nodeArray = Graph.getNodeArray(str);
    }

    /**
     * @param {number} version 
     * @returns {{str: string, count: number, mode: Mode}[]}
     */
    getBestPath(version) {
        const graph = {};
        this.nodeArray.forEach(node => {
            if (node.nextNodes.length > 0) {
                let tmp = {};
                node.nextNodes.forEach(nextNode => {
                    tmp[nextNode.id] = nextNode.mode ? nextNode.mode.getLength(
                        version,
                        nextNode.count,
                        nextNode.mode === node.mode
                    ) : 0;
                });
                graph[node.id] = tmp;
            }
        });
        const startId = '' + this.nodeArray[0].id;
        const endId = '' + this.nodeArray[this.nodeArray.length - 1].id;
        const path = dijkstra.find_path(graph, startId, endId);
        const result = [];
        for (let i = 1; i < path.length - 1; ++i) {
            const node = this.nodeArray[parseInt(path[i], 10)];
            if(result.length > 0 && result[result.length - 1].mode === node.mode) {
                result[result.length - 1].str += node.str;
                result[result.length - 1].count += node.count;
            } else {
                result.push({
                    str: node.str,
                    mode: node.mode,
                    count: node.count,
                });
            }
        }
        return result;
    }
}

export default Graph;
