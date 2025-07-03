import ArrayCanvas from "./array-canvas.js";

const xmlns = 'http://www.w3.org/2000/svg';

function SvgCanvas(parentElement, size, border) {
    this.border = border || 0;
    this.size = size || 300;
    this.parentElement = parentElement;
}

SvgCanvas.prototype.setSize = function(size) {
    this.qrSize = size;

    this.svg = document.createElementNS(xmlns, 'svg');
    this.svg.setAttributeNS(null, 'width', this.size);
    this.svg.setAttributeNS(null, 'height', this.size);
    this.svg.setAttributeNS(null, 'viewBox', `${-this.border} ${-this.border} ${this.qrSize + this.border * 2} ${this.qrSize + this.border * 2}`);

    let rect = document.createElementNS(xmlns, 'rect');
    rect.setAttributeNS(null, 'x', -this.border);
    rect.setAttributeNS(null, 'y', -this.border);
    rect.setAttributeNS(null, 'width', this.qrSize + this.border * 2);
    rect.setAttributeNS(null, 'height', this.qrSize + this.border * 2);
    rect.setAttributeNS(null, 'stroke', 'none');
    rect.setAttributeNS(null, 'fill', '#ccc');
    rect.setAttributeNS(null, 'shape-rendering', 'crispEdges');

    this.svg.appendChild(rect);
}

SvgCanvas.prototype.setPoint = function(row, col, val) {
    let rect = document.createElementNS(xmlns, 'rect');
    rect.setAttributeNS(null, 'x', col);
    rect.setAttributeNS(null, 'y', row);
    rect.setAttributeNS(null, 'width', 1);
    rect.setAttributeNS(null, 'height', 1);
    rect.setAttributeNS(null, 'stroke', 'none');
    rect.setAttributeNS(null, 'fill', val ? 'balck' : 'white');
    rect.setAttributeNS(null, 'shape-rendering', 'crispEdges');
    this.svg.appendChild(rect);
}

SvgCanvas.prototype.render = function () {
    this.parentElement.appendChild(this.svg);
};

export default SvgCanvas;