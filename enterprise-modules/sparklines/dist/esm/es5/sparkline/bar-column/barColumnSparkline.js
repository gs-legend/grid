var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Sparkline } from '../sparkline';
import { Group } from '../../scene/group';
import { Line } from '../../scene/shape/line';
import { Selection } from '../../scene/selection';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { Rectangle } from './rectangle';
import { extent } from '../../util/array';
import { isNumber } from '../../util/value';
import { Label } from '../label/label';
import { Text } from '../label/text';
import { PointerEvents } from '../../scene/node';
var BarColumnNodeTag;
(function (BarColumnNodeTag) {
    BarColumnNodeTag[BarColumnNodeTag["Rect"] = 0] = "Rect";
    BarColumnNodeTag[BarColumnNodeTag["Label"] = 1] = "Label";
})(BarColumnNodeTag || (BarColumnNodeTag = {}));
export var BarColumnLabelPlacement;
(function (BarColumnLabelPlacement) {
    BarColumnLabelPlacement["InsideBase"] = "insideBase";
    BarColumnLabelPlacement["InsideEnd"] = "insideEnd";
    BarColumnLabelPlacement["Center"] = "center";
    BarColumnLabelPlacement["OutsideEnd"] = "outsideEnd";
})(BarColumnLabelPlacement || (BarColumnLabelPlacement = {}));
var BarColumnLabel = /** @class */ (function (_super) {
    __extends(BarColumnLabel, _super);
    function BarColumnLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        _this.placement = BarColumnLabelPlacement.InsideEnd;
        return _this;
    }
    return BarColumnLabel;
}(Label));
export { BarColumnLabel };
var BarColumnSparkline = /** @class */ (function (_super) {
    __extends(BarColumnSparkline, _super);
    function BarColumnSparkline() {
        var _this = _super.call(this) || this;
        _this.fill = 'rgb(124, 181, 236)';
        _this.stroke = 'silver';
        _this.strokeWidth = 0;
        _this.paddingInner = 0.1;
        _this.paddingOuter = 0.2;
        _this.valueAxisDomain = undefined;
        _this.formatter = undefined;
        _this.axisLine = new Line();
        _this.sparklineGroup = new Group();
        _this.rectGroup = new Group();
        _this.labelGroup = new Group();
        _this.rectSelection = Selection.select(_this.rectGroup).selectAll();
        _this.labelSelection = Selection.select(_this.labelGroup).selectAll();
        _this.nodeSelectionData = [];
        _this.label = new BarColumnLabel();
        _this.rootGroup.append(_this.sparklineGroup);
        _this.sparklineGroup.append([_this.rectGroup, _this.axisLine, _this.labelGroup]);
        _this.axisLine.lineCap = 'round';
        _this.label.enabled = false;
        return _this;
    }
    BarColumnSparkline.prototype.getNodeData = function () {
        return this.nodeSelectionData;
    };
    BarColumnSparkline.prototype.update = function () {
        this.updateSelections();
        this.updateNodes();
    };
    BarColumnSparkline.prototype.updateSelections = function () {
        var nodeData = this.generateNodeData();
        if (!nodeData) {
            return;
        }
        this.nodeSelectionData = nodeData;
        this.updateRectSelection(nodeData);
        this.updateLabelSelection(nodeData);
    };
    BarColumnSparkline.prototype.updateNodes = function () {
        this.updateRectNodes();
        this.updateLabelNodes();
    };
    BarColumnSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yScale = _a.yScale, yData = _a.yData, valueAxisDomain = _a.valueAxisDomain;
        var yMinMax = extent(yData, isNumber);
        var yMin = 0;
        var yMax = 1;
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
    };
    BarColumnSparkline.prototype.updateRectSelection = function (selectionData) {
        var updateRectSelection = this.rectSelection.setData(selectionData);
        var enterRectSelection = updateRectSelection.enter.append(Rectangle);
        updateRectSelection.exit.remove();
        this.rectSelection = updateRectSelection.merge(enterRectSelection);
    };
    BarColumnSparkline.prototype.updateRectNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, nodeFormatter = _a.formatter, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        var _b = this.highlightStyle, highlightFill = _b.fill, highlightStroke = _b.stroke, highlightStrokeWidth = _b.strokeWidth;
        this.rectSelection.each(function (node, datum, index) {
            var highlighted = datum === highlightedDatum;
            var nodeFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            var nodeStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            var nodeStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;
            var nodeFormat;
            var x = datum.x, y = datum.y, width = datum.width, height = datum.height, seriesDatum = datum.seriesDatum;
            if (nodeFormatter) {
                var first = index === 0;
                var last = index === _this.nodeSelectionData.length - 1;
                var min = seriesDatum.y === _this.min;
                var max = seriesDatum.y === _this.max;
                nodeFormat = nodeFormatter({
                    datum: datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    width: width,
                    height: height,
                    min: min,
                    max: max,
                    first: first,
                    last: last,
                    fill: nodeFill,
                    stroke: nodeStroke,
                    strokeWidth: nodeStrokeWidth,
                    highlighted: highlighted,
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
    };
    BarColumnSparkline.prototype.updateLabelSelection = function (selectionData) {
        var updateLabels = this.labelSelection.setData(selectionData);
        var enterLabels = updateLabels.enter.append(Text).each(function (text) {
            (text.tag = BarColumnNodeTag.Label), (text.pointerEvents = PointerEvents.None);
        });
        updateLabels.exit.remove();
        this.labelSelection = updateLabels.merge(enterLabels);
    };
    BarColumnSparkline.prototype.updateLabelNodes = function () {
        var _a = this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
        this.labelSelection.each(function (text, datum) {
            var label = datum.label;
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
    };
    BarColumnSparkline.prototype.getTooltipHtml = function (datum) {
        var dataType = this.dataType;
        var seriesDatum = datum.seriesDatum;
        var yValue = seriesDatum.y;
        var xValue = seriesDatum.x;
        var content = this.formatNumericDatum(yValue);
        var title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;
        var defaults = {
            content: content,
            title: title,
        };
        if (this.tooltip.renderer) {
            return toTooltipHtml(this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue: yValue,
                xValue: xValue,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    BarColumnSparkline.prototype.formatLabelValue = function (value) {
        return value % 1 !== 0 ? value.toFixed(1) : value.toFixed(0);
    };
    return BarColumnSparkline;
}(Sparkline));
export { BarColumnSparkline };
//# sourceMappingURL=barColumnSparkline.js.map