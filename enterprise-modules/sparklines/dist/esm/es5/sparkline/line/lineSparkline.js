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
import { BandScale } from '../../scale/bandScale';
import { Group } from '../../scene/group';
import { Path } from '../../scene/shape/path';
import { Selection } from '../../scene/selection';
import { Sparkline } from '../sparkline';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { getMarker } from '../marker/markerFactory';
import { extent } from '../../util/array';
import { isNumber } from '../../util/value';
import { Line } from '../../scene/shape/line';
import { getLineDash } from '../../util/lineDash';
var SparklineMarker = /** @class */ (function () {
    function SparklineMarker() {
        this.enabled = true;
        this.shape = 'circle';
        this.size = 0;
        this.fill = 'rgb(124, 181, 236)';
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
        this.formatter = undefined;
    }
    return SparklineMarker;
}());
var SparklineLine = /** @class */ (function () {
    function SparklineLine() {
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
    }
    return SparklineLine;
}());
var SparklineCrosshairs = /** @class */ (function () {
    function SparklineCrosshairs() {
        this.xLine = {
            enabled: true,
            stroke: 'rgba(0,0,0, 0.54)',
            strokeWidth: 1,
            lineDash: 'solid',
            lineCap: undefined,
        };
        this.yLine = {
            enabled: false,
            stroke: 'rgba(0,0,0, 0.54)',
            strokeWidth: 1,
            lineDash: 'solid',
            lineCap: undefined,
        };
    }
    return SparklineCrosshairs;
}());
var LineSparkline = /** @class */ (function (_super) {
    __extends(LineSparkline, _super);
    function LineSparkline() {
        var _this = _super.call(this) || this;
        _this.linePath = new Path();
        _this.xCrosshairLine = new Line();
        _this.yCrosshairLine = new Line();
        _this.lineSparklineGroup = new Group();
        _this.markers = new Group();
        _this.markerSelection = Selection.select(_this.markers).selectAll();
        _this.markerSelectionData = [];
        _this.marker = new SparklineMarker();
        _this.line = new SparklineLine();
        _this.crosshairs = new SparklineCrosshairs();
        _this.rootGroup.append(_this.lineSparklineGroup);
        _this.lineSparklineGroup.append([_this.linePath, _this.xCrosshairLine, _this.yCrosshairLine, _this.markers]);
        return _this;
    }
    LineSparkline.prototype.getNodeData = function () {
        return this.markerSelectionData;
    };
    /**
     * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
     */
    LineSparkline.prototype.onMarkerShapeChange = function () {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.scheduleLayout();
    };
    LineSparkline.prototype.update = function () {
        var nodeData = this.generateNodeData();
        if (!nodeData) {
            return;
        }
        this.markerSelectionData = nodeData;
        this.updateSelection(nodeData);
        this.updateNodes();
        this.updateLine();
    };
    LineSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yData = _a.yData, yScale = _a.yScale;
        var yMinMax = extent(yData, isNumber);
        var yMin = 0;
        var yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        if (yMin === yMax) {
            // if all values in the data are the same, yMin and yMax will be equal, need to adjust the domain with some padding
            var padding = Math.abs(yMin * 0.01);
            yMin -= padding;
            yMax += padding;
        }
        yScale.domain = [yMin, yMax];
    };
    LineSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale;
        if (!data) {
            return;
        }
        var offsetX = xScale instanceof BandScale ? xScale.bandwidth / 2 : 0;
        var nodeData = [];
        for (var i = 0; i < yData.length; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            if (yDatum == undefined) {
                continue;
            }
            var x = xScale.convert(xDatum) + offsetX;
            var y = yScale.convert(yDatum);
            nodeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x: x, y: y },
            });
        }
        return nodeData;
    };
    LineSparkline.prototype.updateSelection = function (selectionData) {
        var marker = this.marker;
        var shape = getMarker(marker.shape);
        var updateMarkerSelection = this.markerSelection.setData(selectionData);
        var enterMarkerSelection = updateMarkerSelection.enter.append(shape);
        updateMarkerSelection.exit.remove();
        this.markerSelection = updateMarkerSelection.merge(enterMarkerSelection);
    };
    LineSparkline.prototype.updateNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, highlightStyle = _a.highlightStyle, marker = _a.marker;
        var highlightSize = highlightStyle.size, highlightFill = highlightStyle.fill, highlightStroke = highlightStyle.stroke, highlightStrokeWidth = highlightStyle.strokeWidth;
        var markerFormatter = marker.formatter;
        this.markerSelection.each(function (node, datum, index) {
            var highlighted = datum === highlightedDatum;
            var markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            var markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            var markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            var markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;
            var markerFormat;
            var seriesDatum = datum.seriesDatum, point = datum.point;
            if (markerFormatter) {
                var first = index === 0;
                var last = index === _this.markerSelectionData.length - 1;
                var min = seriesDatum.y === _this.min;
                var max = seriesDatum.y === _this.max;
                markerFormat = markerFormatter({
                    datum: datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    min: min,
                    max: max,
                    first: first,
                    last: last,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted: highlighted,
                });
            }
            node.size = markerFormat && markerFormat.size != undefined ? markerFormat.size : markerSize;
            node.fill = markerFormat && markerFormat.fill != undefined ? markerFormat.fill : markerFill;
            node.stroke = markerFormat && markerFormat.stroke != undefined ? markerFormat.stroke : markerStroke;
            node.strokeWidth =
                markerFormat && markerFormat.strokeWidth != undefined ? markerFormat.strokeWidth : markerStrokeWidth;
            node.translationX = point.x;
            node.translationY = point.y;
            node.visible =
                markerFormat && markerFormat.enabled != undefined
                    ? markerFormat.enabled
                    : marker.enabled && node.size > 0;
        });
    };
    LineSparkline.prototype.updateLine = function () {
        var _a = this, linePath = _a.linePath, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale, line = _a.line;
        if (yData.length < 2) {
            return;
        }
        var path = linePath.path;
        var n = yData.length;
        var offsetX = xScale instanceof BandScale ? xScale.bandwidth / 2 : 0;
        var moveTo = true;
        path.clear();
        for (var i = 0; i < n; i++) {
            var xDatum = xData[i];
            var yDatum = yData[i];
            var x = xScale.convert(xDatum) + offsetX;
            var y = yScale.convert(yDatum);
            if (yDatum == undefined) {
                moveTo = true;
            }
            else {
                if (moveTo) {
                    path.moveTo(x, y);
                    moveTo = false;
                }
                else {
                    path.lineTo(x, y);
                }
            }
        }
        linePath.fill = undefined;
        linePath.stroke = line.stroke;
        linePath.strokeWidth = line.strokeWidth;
    };
    LineSparkline.prototype.updateXCrosshairLine = function () {
        var _a = this, yScale = _a.yScale, xCrosshairLine = _a.xCrosshairLine, highlightedDatum = _a.highlightedDatum, xLine = _a.crosshairs.xLine;
        if (!xLine.enabled || highlightedDatum == undefined) {
            xCrosshairLine.strokeWidth = 0;
            return;
        }
        xCrosshairLine.y1 = yScale.range[0];
        xCrosshairLine.y2 = yScale.range[1];
        xCrosshairLine.x1 = xCrosshairLine.x2 = 0;
        xCrosshairLine.stroke = xLine.stroke;
        xCrosshairLine.strokeWidth = xLine.strokeWidth || 1;
        xCrosshairLine.lineCap = xLine.lineCap === 'round' || xLine.lineCap === 'square' ? xLine.lineCap : undefined;
        var lineDash = xLine.lineDash;
        xCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(xCrosshairLine.lineCap, xLine.lineDash);
        xCrosshairLine.translationX = highlightedDatum.point.x;
    };
    LineSparkline.prototype.updateYCrosshairLine = function () {
        var _a = this, xScale = _a.xScale, yCrosshairLine = _a.yCrosshairLine, highlightedDatum = _a.highlightedDatum, yLine = _a.crosshairs.yLine;
        if (!yLine.enabled || highlightedDatum == undefined) {
            yCrosshairLine.strokeWidth = 0;
            return;
        }
        yCrosshairLine.x1 = xScale.range[0];
        yCrosshairLine.x2 = xScale.range[1];
        yCrosshairLine.y1 = yCrosshairLine.y2 = 0;
        yCrosshairLine.stroke = yLine.stroke;
        yCrosshairLine.strokeWidth = yLine.strokeWidth || 1;
        yCrosshairLine.lineCap = yLine.lineCap === 'round' || yLine.lineCap === 'square' ? yLine.lineCap : undefined;
        var lineDash = yLine.lineDash;
        yCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(yCrosshairLine.lineCap, yLine.lineDash);
        yCrosshairLine.translationY = highlightedDatum.point.y;
    };
    LineSparkline.prototype.getTooltipHtml = function (datum) {
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
    LineSparkline.className = 'LineSparkline';
    return LineSparkline;
}(Sparkline));
export { LineSparkline };
//# sourceMappingURL=lineSparkline.js.map