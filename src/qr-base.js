import ClassicRound from "./styling/classic-round.js";
import Classic from './styling/classic.js';
import Dots from './styling/dots.js';
import Rounded from "./styling/rounded.js";
import Square from "./styling/square.js";
import SuperRound from "./styling/super-round.js";
import StylingBase from "./styling/styling-base.js";

class QrBase {

    static create(...args) {
        throw '(...args) => {data: array, size: number}'
    }

    static stylings = {
        'classy': Classic,
        'classy-rounded': ClassicRound,
        'dots': Dots,
        'extra-rounded': SuperRound,
        'rounded': Rounded,
        'square': Square,
    }

    static registryStyling(styling, stylingClass) {
        if (QrBase.stylings[styling]) {
            throw 'Duplicate styling key';
        }
        if (!(stylingClass.prototype instanceof StylingBase)) {
            throw 'StylingClass must extend StylingBase';
        }
        QrBase.stylings[styling] = stylingClass;
    }

    constructor(...args) {
        const qr = this.constructor.create(...args);
        this.data = qr.data;
        this.size = qr.size;
    }

    styling(styling) {
        if (!QrBase.stylings[styling]) {
            throw 'Style Not Found';
        }
        return new QrBase.stylings[styling](this.data, this.size);
    }
}

export default QrBase;
