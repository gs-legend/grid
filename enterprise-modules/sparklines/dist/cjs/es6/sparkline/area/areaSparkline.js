"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const group_1 = require("../../scene/group");
const path_1 = require("../../scene/shape/path");
const line_1 = require("../../scene/shape/line");
const bandScale_1 = require("../../scale/bandScale");
const selection_1 = require("../../scene/selection");
const sparkline_1 = require("../sparkline");
const sparklineTooltip_1 = require("../tooltip/sparklineTooltip");
const markerFactory_1 = require("../marker/markerFactory");
const array_1 = require("../../util/array");
const value_1 = require("../../util/value");
const lineDash_1 = require("../../util/lineDash");
class SparklineMarker {
    constructor() {
        this.enabled = true;
        this.shape = 'circle';
        this.size = 0;
        this.fill = 'rgb(124, 181, 236)';
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
        this.formatter = undefined;
    }
}
class SparklineLine {
    constructor() {
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
    }
}
class SparklineCrosshairs {
    constructor() {
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
}
class AreaSparkline extends sparkline_1.Sparkline {
    constructor() {
        super();
        this.fill = 'rgba(124, 181, 236, 0.25)';
        this.strokePath = new path_1.Path();
        this.fillPath = new path_1.Path();
        this.xCrosshairLine = new line_1.Line();
        this.yCrosshairLine = new line_1.Line();
        this.areaSparklineGroup = new group_1.Group();
        this.fillPathData = [];
        this.strokePathData = [];
        this.xAxisLine = new line_1.Line();
        this.markers = new group_1.Group();
        this.markerSelection = selection_1.Selection.select(this.markers).selectAll();
        this.markerSelectionData = [];
        this.marker = new SparklineMarker();
        this.line = new SparklineLine();
        this.crosshairs = new SparklineCrosshairs();
        this.rootGroup.append(this.areaSparklineGroup);
        this.areaSparklineGroup.append([
            this.fillPath,
            this.xAxisLine,
            this.strokePath,
            this.xCrosshairLine,
            this.yCrosshairLine,
            this.markers,
        ]);
    }
    getNodeData() {
        return this.markerSelectionData;
    }
    /**
     * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
     */
    onMarkerShapeChange() {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.scheduleLayout();
    }
    update() {
        const data = this.generateNodeData();
        if (!data) {
            return;
        }
        const { nodeData, fillData, strokeData } = data;
        this.markerSelectionData = nodeData;
        this.fillPathData = fillData;
        this.strokePathData = strokeData;
        this.updateSelection(nodeData);
        this.updateNodes();
        this.updateStroke(strokeData);
        this.updateFill(fillData);
    }
    updateYScaleDomain() {
        const { yData, yScale } = this;
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
        yScale.domain = [yMin, yMax];
    }
    generateNodeData() {
        const { data, yData, xData, xScale, yScale } = this;
        if (!data) {
            return;
        }
        const offsetX = xScale instanceof bandScale_1.BandScale ? xScale.bandwidth / 2 : 0;
        const n = yData.length;
        const nodeData = [];
        const fillData = [];
        const strokeData = [];
        let firstValidX;
        let lastValidX;
        let previousX;
        let nextX;
        const yZero = yScale.convert(0);
        for (let i = 0; i < n; i++) {
            const yDatum = yData[i];
            const xDatum = xData[i];
            const x = xScale.convert(xDatum) + offsetX;
            const y = yScale.convert(yDatum);
            // if this iteration is not the last, set nextX using the next value in the data array
            if (i + 1 < n) {
                nextX = xScale.convert(xData[i + 1]) + offsetX;
            }
            // set stroke data regardless of missing/ undefined values. Undefined values will be handled in the updateStroke() method
            strokeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x, y },
            });
            if (yDatum === undefined && previousX !== undefined) {
                // if yDatum is undefined and there is a valid previous data point, add a phantom point at yZero
                // if a next data point exists, add a phantom point at yZero at the next X
                fillData.push({ seriesDatum: undefined, point: { x: previousX, y: yZero } });
                if (nextX !== undefined) {
                    fillData.push({ seriesDatum: undefined, point: { x: nextX, y: yZero } });
                }
            }
            else if (yDatum !== undefined) {
                fillData.push({
                    seriesDatum: { x: xDatum, y: yDatum },
                    point: { x, y },
                });
                // set node data only if yDatum is not not undefined. These values are used in the updateSelection() method to update markers
                nodeData.push({
                    seriesDatum: { x: xDatum, y: yDatum },
                    point: { x, y },
                });
                firstValidX = firstValidX !== undefined ? firstValidX : x;
                lastValidX = x;
            }
            previousX = x;
        }
        // phantom points for creating closed area
        fillData.push({ seriesDatum: undefined, point: { x: lastValidX, y: yZero } }, { seriesDatum: undefined, point: { x: firstValidX, y: yZero } });
        return { nodeData, fillData, strokeData };
    }
    updateAxisLine() {
        const { xScale, yScale, axis, xAxisLine } = this;
        xAxisLine.x1 = xScale.range[0];
        xAxisLine.x2 = xScale.range[1];
        xAxisLine.y1 = xAxisLine.y2 = 0;
        xAxisLine.stroke = axis.stroke;
        xAxisLine.strokeWidth = axis.strokeWidth;
        const yZero = yScale.convert(0);
        xAxisLine.translationY = yZero;
    }
    updateSelection(selectionData) {
        const { marker } = this;
        const shape = markerFactory_1.getMarker(marker.shape);
        const updateMarkerSelection = this.markerSelection.setData(selectionData);
        const enterMarkerSelection = updateMarkerSelection.enter.append(shape);
        updateMarkerSelection.exit.remove();
        this.markerSelection = updateMarkerSelection.merge(enterMarkerSelection);
    }
    updateNodes() {
        const { highlightedDatum, highlightStyle, marker } = this;
        const { size: highlightSize, fill: highlightFill, stroke: highlightStroke, strokeWidth: highlightStrokeWidth, } = highlightStyle;
        const markerFormatter = marker.formatter;
        this.markerSelection.each((node, datum, index) => {
            const { point, seriesDatum } = datum;
            if (!point) {
                return;
            }
            const highlighted = datum === highlightedDatum;
            const markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            const markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            const markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            const markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;
            let markerFormat;
            if (markerFormatter) {
                const first = index === 0;
                const last = index === this.markerSelectionData.length - 1;
                const min = seriesDatum.y === this.min;
                const max = seriesDatum.y === this.max;
                markerFormat = markerFormatter({
                    datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    min,
                    max,
                    first,
                    last,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted,
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
    }
    updateStroke(strokeData) {
        const { strokePath, yData, line } = this;
        if (yData.length < 2) {
            return;
        }
        const path = strokePath.path;
        const n = strokeData.length;
        let moveTo = true;
        path.clear();
        for (let i = 0; i < n; i++) {
            const { point, seriesDatum } = strokeData[i];
            const x = point.x;
            const y = point.y;
            if (seriesDatum.y == undefined) {
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
        strokePath.lineJoin = strokePath.lineCap = 'round';
        strokePath.fill = undefined;
        strokePath.stroke = line.stroke;
        strokePath.strokeWidth = line.strokeWidth;
    }
    updateFill(areaData) {
        const { fillPath, yData, fill } = this;
        const path = fillPath.path;
        const n = areaData.length;
        path.clear();
        if (yData.length < 2) {
            return;
        }
        for (let i = 0; i < n; i++) {
            const { point } = areaData[i];
            const x = point.x;
            const y = point.y;
            if (i > 0) {
                path.lineTo(x, y);
            }
            else {
                path.moveTo(x, y);
            }
        }
        path.closePath();
        fillPath.lineJoin = 'round';
        fillPath.stroke = undefined;
        fillPath.fill = fill;
    }
    updateXCrosshairLine() {
        const { yScale, xCrosshairLine, highlightedDatum, crosshairs: { xLine }, } = this;
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
        const { lineDash } = xLine;
        xCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : lineDash_1.getLineDash(xCrosshairLine.lineCap, xLine.lineDash);
        xCrosshairLine.translationX = highlightedDatum.point.x;
    }
    updateYCrosshairLine() {
        const { xScale, yCrosshairLine, highlightedDatum, crosshairs: { yLine }, } = this;
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
        const { lineDash } = yLine;
        yCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : lineDash_1.getLineDash(yCrosshairLine.lineCap, yLine.lineDash);
        yCrosshairLine.translationY = highlightedDatum.point.y;
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
}
exports.AreaSparkline = AreaSparkline;
AreaSparkline.className = 'AreaSparkline';
//# sourceMappingURL=areaSparkline.js.map