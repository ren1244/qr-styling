import StylingBase from "./styling-base.js";
import { pathCommands } from "./lib/path-cmds.js";

export default class SuperRound extends StylingBase {
    constructor(data, size) {
        super(data, size);
    }

    getCommands() {
        const pathArray = this.getPaths();
        return pathCommands(pathArray, 1, 1, 1, 1);
    }
}
