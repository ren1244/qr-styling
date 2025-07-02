import ArrayCanvas from "./array-canvas.js";

function SvgCanvas() {

}

// 繼承 ArrayCanvas
Object.assign(SvgCanvas.prototype, ArrayCanvas.prototype);
SvgCanvas.prototype.constructor = SvgCanvas;

SvgCanvas.prototype.render = function (parentElement, size, border) {
    border = border || 0;
    size = size || 300;
    let sz = this.sz;
    let arr = this.arr;
    const xmlns = 'http://www.w3.org/2000/svg';


    let svg = document.createElementNS(xmlns, 'svg');
    svg.setAttributeNS(null, 'width', size);
    svg.setAttributeNS(null, 'height', size);
    svg.setAttributeNS(null, 'viewBox', `${-border} ${-border} ${sz + border * 2} ${sz + border * 2}`);

    let rect = document.createElementNS(xmlns, 'rect');
    rect.setAttributeNS(null, 'x', -border);
    rect.setAttributeNS(null, 'y', -border);
    rect.setAttributeNS(null, 'width', sz + border * 2);
    rect.setAttributeNS(null, 'height', sz + border * 2);
    rect.setAttributeNS(null, 'stroke', 'none');
    rect.setAttributeNS(null, 'fill', '#ccc');
    rect.setAttributeNS(null, 'shape-rendering', 'crispEdges');
    svg.appendChild(rect);
    for (let r = 0; r < arr.length; ++r) {
        let row = arr[r];
        for (let c = 0; c < row.length; ++c) {
            let val = this.getPoint(r, c);
            if (val !== null) {
                let rect = document.createElementNS(xmlns, 'rect');
                rect.setAttributeNS(null, 'x', c);
                rect.setAttributeNS(null, 'y', r);
                rect.setAttributeNS(null, 'width', 1);
                rect.setAttributeNS(null, 'height', 1);
                rect.setAttributeNS(null, 'stroke', 'none');
                rect.setAttributeNS(null, 'fill', val ? 'balck' : 'white');
                rect.setAttributeNS(null, 'shape-rendering', 'crispEdges');
                svg.appendChild(rect);
            }
        }
    }
    parentElement.appendChild(svg);
};

export default SvgCanvas;