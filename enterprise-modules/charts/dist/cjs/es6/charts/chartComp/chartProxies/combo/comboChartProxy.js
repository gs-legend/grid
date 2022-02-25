"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ag_charts_community_1 = require("ag-charts-community");
const core_1 = require("@ag-grid-community/core");
const cartesianChartProxy_1 = require("../cartesian/cartesianChartProxy");
const object_1 = require("../../utils/object");
const seriesTypeMapper_1 = require("../../utils/seriesTypeMapper");
class ComboChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
        this.xAxisType = 'category';
        this.yAxisType = 'number';
        this.recreateChart();
    }
    createChart() {
        return ag_charts_community_1.AgChart.create({
            type: 'cartesian',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    }
    update(params) {
        const { category, data } = params;
        let options = {
            data: this.transformData(data, category.id)
        };
        if (this.seriesChanged(params)) {
            options.series = this.getSeriesOptions(params);
            options.axes = this.getAxes(params);
        }
        ag_charts_community_1.AgChart.update(this.chart, options);
    }
    seriesChanged(params) {
        const { seriesChartTypes } = params;
        const seriesChartTypesChanged = !core_1._.areEqual(this.prevSeriesChartTypes, seriesChartTypes, (s1, s2) => s1.colId === s2.colId && s1.chartType === s2.chartType && s1.secondaryAxis === s2.secondaryAxis);
        // cache a cloned copy of `seriesChartTypes` for subsequent comparisons
        this.prevSeriesChartTypes = seriesChartTypes.map(s => (Object.assign({}, s)));
        const fields = params.fields.map(f => f.colId).join();
        const fieldsChanged = this.prevFields !== fields;
        this.prevFields = fields;
        return seriesChartTypesChanged || fieldsChanged;
    }
    getAxes(updateParams) {
        const axisOptions = this.getAxesOptions('cartesian');
        const bottomOptions = object_1.deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom);
        const leftOptions = object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left);
        const rightOptions = object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].right);
        const primaryYKeys = [];
        const secondaryYKeys = [];
        const fields = updateParams ? updateParams.fields : [];
        const fieldsMap = new Map(fields.map(f => [f.colId, f]));
        fields.forEach(field => {
            const colId = field.colId;
            const seriesChartType = this.chartProxyParams.seriesChartTypes.find(s => s.colId === colId);
            if (seriesChartType) {
                seriesChartType.secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
            }
        });
        const axes = [
            Object.assign(Object.assign({}, bottomOptions), { type: this.xAxisType, position: ag_charts_community_1.ChartAxisPosition.Bottom, gridStyle: [
                    { strokeWidth: 0 },
                ] }),
        ];
        if (primaryYKeys.length > 0) {
            axes.push(Object.assign(Object.assign({}, leftOptions), { type: this.yAxisType, keys: primaryYKeys, position: ag_charts_community_1.ChartAxisPosition.Left, title: Object.assign({}, object_1.deepMerge(leftOptions.title, {
                    enabled: true,
                    text: primaryYKeys.map(key => {
                        const field = fieldsMap.get(key);
                        return field ? field.displayName : key;
                    }).join(' / '),
                })) }));
        }
        if (secondaryYKeys.length > 0) {
            secondaryYKeys.forEach((secondaryYKey, i) => {
                const field = fieldsMap.get(secondaryYKey);
                const secondaryAxisIsVisible = field && field.colId === secondaryYKey;
                if (!secondaryAxisIsVisible) {
                    return;
                }
                const secondaryAxisOptions = Object.assign(Object.assign({}, rightOptions), { type: this.yAxisType, keys: [secondaryYKey], position: ag_charts_community_1.ChartAxisPosition.Right, title: Object.assign({}, object_1.deepMerge(rightOptions.title, {
                        enabled: true,
                        text: field ? field.displayName : secondaryYKey,
                    })) });
                const primaryYAxis = primaryYKeys.some(primaryYKey => !!fieldsMap.get(primaryYKey));
                const lastSecondaryAxis = i === secondaryYKeys.length - 1;
                if (!primaryYAxis && lastSecondaryAxis) {
                    // don't remove grid lines from the secondary axis closest to the chart, i.e. last supplied
                }
                else {
                    secondaryAxisOptions.gridStyle = [
                        { strokeWidth: 0 },
                    ];
                }
                axes.push(secondaryAxisOptions);
            });
        }
        return axes;
    }
    getSeriesOptions(params) {
        const { fields, category, seriesChartTypes } = params;
        return fields.map(field => {
            const seriesChartType = seriesChartTypes.find(s => s.colId === field.colId);
            if (seriesChartType) {
                const chartType = seriesChartType.chartType;
                return {
                    type: seriesTypeMapper_1.getSeriesType(chartType),
                    xKey: category.id,
                    yKey: field.colId,
                    yName: field.displayName,
                    grouped: ['groupedColumn' || 'groupedBar' || 'groupedArea'].includes(chartType),
                    stacked: ['stackedArea'].includes(chartType),
                };
            }
        });
    }
}
exports.ComboChartProxy = ComboChartProxy;
//# sourceMappingURL=comboChartProxy.js.map