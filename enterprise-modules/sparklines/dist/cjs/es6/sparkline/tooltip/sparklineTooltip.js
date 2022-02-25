"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("../../util/color");
const observable_1 = require("../../util/observable");
function toTooltipHtml(input, defaults) {
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults || {};
    const { content = defaults.content || '', title = defaults.title || undefined, color = defaults.color, backgroundColor = defaults.backgroundColor, opacity = defaults.opacity || 1, } = input;
    let titleHtml;
    let contentHtml;
    if (color) {
        titleHtml = title
            ? `<span class="${SparklineTooltip.class}-title"; style="color: ${color}">${title}</span>`
            : '';
        contentHtml = `<span class="${SparklineTooltip.class}-content" style="color: ${color}">${content}</span>`;
    }
    else {
        titleHtml = title ? `<span class="${SparklineTooltip.class}-title">${title}</span>` : '';
        contentHtml = `<span class="${SparklineTooltip.class}-content">${content}</span>`;
    }
    if (backgroundColor) {
        const bgColor = color_1.Color.fromString(backgroundColor.toLowerCase());
        const { r, g, b, a } = bgColor;
        // TODO: combine a and opacity for alpha?
        const alpha = opacity;
        const bgColorWithAlpha = color_1.Color.fromArray([r, g, b, alpha]);
        const bgColorRgbaString = bgColorWithAlpha.toRgbaString();
        return `<div class="${SparklineTooltip.class}" style="background-color: ${bgColorRgbaString}">
                    ${titleHtml}
                    ${contentHtml}
                </div>`;
    }
    else {
        return `<div class="${SparklineTooltip.class}">
                    ${titleHtml}
                    ${contentHtml}
                </div>`;
    }
}
exports.toTooltipHtml = toTooltipHtml;
class SparklineTooltip extends observable_1.Observable {
    constructor() {
        super();
        this.element = document.createElement('div');
        this.enabled = true;
        this.container = undefined;
        this.xOffset = 10;
        this.yOffset = 0;
        this.renderer = undefined;
        const tooltipRoot = document.body;
        tooltipRoot.appendChild(this.element);
    }
    isVisible() {
        const { element } = this;
        if (element.classList) {
            return !element.classList.contains(`${SparklineTooltip.class}-wrapper-hidden`);
        }
        // IE11
        const classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf(`${SparklineTooltip.class}-wrapper-hidden`) < 0;
        }
        return false;
    }
    updateClass(visible) {
        const classList = [`${SparklineTooltip.class}-wrapper`];
        if (visible !== true) {
            classList.push(`${SparklineTooltip.class}-wrapper-hidden`);
        }
        this.element.setAttribute('class', classList.join(' '));
    }
    show(meta, html) {
        this.toggle(false);
        const { element } = this;
        if (html !== undefined) {
            element.innerHTML = html;
        }
        else if (!element.innerHTML) {
            return;
        }
        let left = meta.pageX + this.xOffset;
        const top = meta.pageY + this.yOffset;
        const tooltipRect = element.getBoundingClientRect();
        let maxLeft = window.innerWidth - tooltipRect.width;
        if (this.container) {
            const containerRect = this.container.getBoundingClientRect();
            maxLeft = containerRect.left + (containerRect.width - tooltipRect.width);
        }
        if (left > maxLeft) {
            left = meta.pageX - element.clientWidth - this.xOffset;
        }
        element.style.left = `${Math.round(left)}px`;
        element.style.top = `${Math.round(top)}px`;
        this.toggle(true);
    }
    toggle(visible) {
        this.updateClass(visible);
    }
    destroy() {
        const { parentNode } = this.element;
        if (parentNode) {
            parentNode.removeChild(this.element);
        }
    }
}
exports.SparklineTooltip = SparklineTooltip;
SparklineTooltip.class = 'ag-sparkline-tooltip';
//# sourceMappingURL=sparklineTooltip.js.map