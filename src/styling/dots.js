import StylingBase from "./styling-base.js";

const r = 0.5;
const ctrl = r * 0.552;

export default class Dots extends StylingBase {
    constructor(data, size) {
        super(data, size);
    }

    getCommands() {
        const { size, data } = this;
        let cmds = [];
        for (let y = 0; y < size; ++y) {
            for (let x = 0; x < size; ++x) {
                if (data[y * size + x]) {
                    cmds.push(['M', { x: x + r, y }]);
                    cmds.push(['C', { x: x + r + ctrl, y }, { x: x + 1, y: y + r - ctrl }, { x: x + 1, y: y + r }]);
                    cmds.push(['C', { x: x + 1, y: y + r + ctrl }, { x: x + r + ctrl, y: y + 1 }, { x: x + r, y: y + 1 }]);
                    cmds.push(['C', { x: x + r - ctrl, y: y + 1 }, { x: x, y: y + r + ctrl }, { x: x, y: y + r }]);
                    cmds.push(['C', { x: x, y: y + r - ctrl }, { x: x + r - ctrl, y }, { x: x + r, y }]);
                    cmds.push(['Z']);
                }
            }
        }
        return cmds;
    }
}
