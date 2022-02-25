"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sparkline_1 = require("../sparkline");
const group_1 = require("../../scene/group");
const line_1 = require("../../scene/shape/line");
const selection_1 = require("../../scene/selection");
const sparklineTooltip_1 = require("../tooltip/sparklineTooltip");
const rectangle_1 = require("./rectangle");
const array_1 = require("../../util/array");
const value_1 = require("../../util/value");
const label_1 = require("../label/label");
const text_1 = require("../label/text");
const node_1 = require("../../scene/node");
var BarColumnNodeTag;
(function (BarColumnNodeTag) {
    BarColumnNodeTag[BarColumnNodeTag["Rect"] = 0] = "Rect";
    BarColumnNodeTag[BarColumnNodeTag["Label"] = 1] = "Label";
})(BarColumnNodeTag || (BarColumnNodeTag = {}));
var BarColumnLabelPlacement;
(function (BarColumnLabelPlacement) {
    BarColumnLabelPlacement["InsideBase"] = "insideBase";
    BarColumnLabelPlacement["InsideEnd"] = "insideEnd";
    BarColumnLabelPlacement["Center"] = "center";
    BarColumnLabelPlacement["OutsideEnd"] = "outsideEnd";
})(BarColumnLabelPlacement = exports.BarColumnLabelPlacement || (exports.BarColumnLabelPlacement = {}));
class BarColumnLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
        this.placement = BarColumnLabelPlacement.InsideEnd;
    }
}
exports.BarColumnLabel = BarColumnLabel;
class BarColumnSparkline extends sparkline_1.Sparkline {
    constructor() {
        super();
        this.fill = 'rgb(124, 181, 236)';
        this.stroke = 'silver';
        this.strokeWidth = 0;
        this.paddingInner = 0.1;
        this.paddingOuter = 0.2;
        this.valueAxisDomain = undefined;
        this.formatter = undefined;
        this.axisLine = new line_1.Line();
        this.sparklineGroup = new group_1.Group();
        this.rectGroup = new group_1.Group();
        this.labelGroup = new group_1.Group();
        this.rectSelection = selection_1.Selection.select(this.rectGroup).selectAll();
        this.labelSelection = selection_1.Selection.select(this.labelGroup).selectAll();
        this.nodeSelectionData = [];
        this.label = new BarColumnLabel();
        this.rootGroup.append(this.sparklineGroup);
        this.sparklineGroup.append([this.rectGroup, this.axisLine, this.labelGroup]);
        this.axisLine.lineCap = 'round';
        this.label.enabled = false;
    }
    getNodeData() {
        return this.nodeSelectionData;
    }
    update() {
        this.updateSelections();
        this.updateNodes();
    }
    updateSelections() {
        const nodeData = this.generateNodeData();
        if (!nodeData) {
            return;
        }
        this.nodeSelectionData = nodeData;
        this.updateRectSelection(nodeData);
        this.updateLabelSelection(nodeData);
    }
    updateNodes() {
        this.updateRectNodes();
        this.updateLabelNodes();
    }
    updateYScaleDomain() {
        const { yScale, yData, valueAxisDomain } = this;
        const yMinMax = array_1.extent(yData, value_1.isNumber);
        let yMin = 0;
        let yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        // if yMin is positive, set yMin to 0
        yMin = yMin < 0 ? yMin : 0;
        // if yMax is negative, set yMax to 0
        yMax = yMax < 0 ? 0 : yMax;
        if (valueAxisDomain) {
            if (valueAxisDomain[1] < yMax) {
                valueAxisDomain[1] = yMax;
            }
            if (valueAxisDomain[0] > yMin) {
                valueAxisDomain[0] = yMin;
            }
        }
        yScale.domain = valueAxisDomain ? valueAxisDomain : [yMin, yMax];
    }
    updateRectSelection(selectionData) {
        const updateRectSelection = this.rectSelection.setData(selectionData);
        const enterRectSelection = updateRectSelection.enter.append(rectangle_1.Rectangle);
        updateRectSelection.exit.remove();
        this.rectSelection = updateRectSelection.merge(enterRectSelection);
    }
    updateRectNodes() {
        const { highlightedDatum, formatter: nodeFormatter, fill, stroke, strokeWidth } = this;
        const { fill: highlightFill, stroke: highlightStroke, strokeWidth: highlightStrokeWidth } = this.highlightStyle;
        this.rectSelection.each((node, datum, index) => {
            const highlighted = datum === highlightedDatum;
            const nodeFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            const nodeStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            const nodeStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;
            let nodeFormat;
            const { x, y, width, height, seriesDatum } = datum;
            if (nodeFormatter) {
                const first = index === 0;
                const last = index === this.nodeSelectionData.length - 1;
                const min = seriesDatum.y === this.min;
                const max = seriesDatum.y === this.max;
                nodeFormat = nodeFormatter({
                    datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    width: width,
                    height: height,
                    min,
                    max,
                    first,
                    last,
                    fill: nodeFill,
                    stroke: nodeStroke,
                    strokeWidth: nodeStrokeWidth,
                    highlighted,
                });
            }
            node.fill = (nodeFormat && nodeFormat.fill) || nodeFill;
            node.stroke = (nodeFormat && nodeFormat.stroke) || nodeStroke;
            node.strokeWidth = (nodeFormat && nodeFormat.strokeWidth) || nodeStrokeWidth;
            node.x = node.y = 0;
            node.width = width;
            node.height = height;
            node.visible = node.height > 0;
            node.translationX = x;
            node.translationY = y;
            // shifts bars upwards?
            // node.crisp = true;
        });
    }
    updateLabelSelection(selectionData) {
        const updateLabels = this.labelSelection.setData(selectionData);
        const enterLabels = updateLabels.enter.append(text_1.Text).each((text) => {
            (text.tag = BarColumnNodeTag.Label), (text.pointerEvents = node_1.PointerEvents.None);
        });
        updateLabels.exit.remove();
        this.labelSelection = updateLabels.merge(enterLabels);
    }
    updateLabelNodes() {
        const { label: { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color }, } = this;
        this.labelSelection.each((text, datum) => {
            const label = datum.label;
            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = color;
                text.visible = true;
            }
            else {
                text.visible = false;
            }
        });
    }
    getTooltipHtml(datum) {
        const { dataType } = this;
        const { seriesDatum } = datum;
        const yValue = seriesDatum.y;
        const xValue = seriesDatum.x;
        const content = this.formatNumericDatum(yValue);
        const title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;
        const defaults = {
            content,
            title,
        };
        if (this.tooltip.renderer) {
            return sparklineTooltip_1.toTooltipHtml(this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue,
                xValue,
            }), defaults);
        }
        return sparklineTooltip_1.toTooltipHtml(defaults);
    }
    formatLabelValue(value) {
        return value % 1 !== 0 ? value.toFixed(1) : value.toFixed(0);
    }
}
exports.BarColumnSparkline = BarColumnSparkline;
//# sourceMappingURL=barColumnSparkline.js.map