"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const miniChartWithAxes_1 = require("../miniChartWithAxes");
const ag_charts_community_1 = require("ag-charts-community");
class MiniScatter extends miniChartWithAxes_1.MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, "scatterTooltip");
        const size = this.size;
        const padding = this.padding;
        // [x, y] pairs
        const data = [
            [[0.3, 3], [1.1, 0.9], [2, 0.4], [3.4, 2.4]],
            [[0, 0.3], [1, 2], [2.4, 1.4], [3, 0]]
        ];
        const xScale = new ag_charts_community_1.LinearScale();
        xScale.domain = [-0.5, 4];
        xScale.range = [padding * 2, size - padding];
        const yScale = new ag_charts_community_1.LinearScale();
        yScale.domain = [-0.5, 3.5];
        yScale.range = [size - padding, padding];
        const points = [];
        data.forEach(series => {
            series.forEach(([x, y]) => {
                const arc = new ag_charts_community_1.Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(x);
                arc.centerY = yScale.convert(y);
                arc.radiusX = arc.radiusY = 2.5;
                points.push(arc);
            });
        });
        this.points = points;
        this.updateColors(fills, strokes);
        const clipRect = new ag_charts_community_1.ClipRect();
        clipRect.x = clipRect.y = padding;
        clipRect.width = clipRect.height = size - padding * 2;
        clipRect.append(this.points);
        this.root.append(clipRect);
    }
    updateColors(fills, strokes) {
        this.points.forEach((line, i) => {
            line.stroke = strokes[i % strokes.length];
            line.fill = fills[i % fills.length];
        });
    }
}
exports.MiniScatter = MiniScatter;
MiniScatter.chartType = 'scatter';
//# sourceMappingURL=miniScatter.js.map