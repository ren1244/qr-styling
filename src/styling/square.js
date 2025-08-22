import StylingBase from "./styling-base.js";

export default class Square extends StylingBase {
    constructor(data, size) {
        super(data, size);
    }

    getCommands() {
        const pathArray = this.getPaths();
        let cmds = [];
        pathArray.forEach(closePath => {
            closePath.forEach((p, i) => {
                cmds.push([i === 0 ? 'M' : 'L', p]);
            });
            cmds.push(['Z']);
        });
        return cmds;
    }
}
