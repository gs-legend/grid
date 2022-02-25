"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const ag_charts_community_1 = require("ag-charts-community");
const seriesTypeMapper_1 = require("../utils/seriesTypeMapper");
class ChartOptionsService extends core_1.BeanStub {
    constructor(chartController) {
        super();
        this.chartController = chartController;
    }
    getChartType() {
        return this.chartController.getChartType();
    }
    getChartOption(expression) {
        return core_1._.get(this.getChart(), expression, undefined);
    }
    setChartOption(expression, value) {
        // update chart options
        const optionsType = seriesTypeMapper_1.getSeriesType(this.getChartType());
        const options = core_1._.get(this.getChartOptions(), `${optionsType}`, undefined);
        core_1._.set(options, expression, value);
        // update chart
        core_1._.set(this.getChart(), expression, value);
        this.raiseChartOptionsChangedEvent();
    }
    getAxisProperty(expression) {
        return core_1._.get(this.getChart().axes[0], expression, undefined);
    }
    setAxisProperty(expression, value) {
        const chart = this.getChart();
        chart.axes.forEach((axis) => {
            // update axis options
            this.updateAxisOptions(axis, expression, value);
            // update chart axis
            core_1._.set(axis, expression, value);
        });
        // chart axis properties are not reactive, need to schedule a layout
        chart.layoutPending = true;
        this.raiseChartOptionsChangedEvent();
    }
    getLabelRotation(axisType) {
        const axis = this.getAxis(axisType);
        return core_1._.get(axis, 'label.rotation', undefined);
    }
    setLabelRotation(axisType, value) {
        const expression = 'label.rotation';
        // update chart
        const chartAxis = this.getAxis(axisType);
        core_1._.set(chartAxis, expression, value);
        // chart axis properties are not reactive, need to schedule a layout
        this.getChart().layoutPending = true;
        // do not update axis options when the default category is selected
        if (chartAxis && !this.chartController.isDefaultCategorySelected()) {
            this.updateAxisOptions(chartAxis, expression, value);
            this.raiseChartOptionsChangedEvent();
        }
    }
    getSeriesOption(expression, seriesType) {
        const series = this.getChart().series.find((s) => ChartOptionsService.isMatchingSeries(seriesType, s));
        return core_1._.get(series, expression, undefined);
    }
    setSeriesOption(expression, value, seriesType) {
        // update series options
        const options = this.getChartOptions();
        if (!options[seriesType]) {
            options[seriesType] = {};
        }
        core_1._.set(options[seriesType].series, expression, value);
        // update chart series
        this.getChart().series.forEach((s) => {
            if (ChartOptionsService.isMatchingSeries(seriesType, s)) {
                core_1._.set(s, expression, value);
            }
        });
        this.raiseChartOptionsChangedEvent();
    }
    getPairedMode() {
        const optionsType = seriesTypeMapper_1.getSeriesType(this.getChartType());
        return core_1._.get(this.getChartOptions(), `${optionsType}.paired`, undefined);
    }
    setPairedMode(paired) {
        const optionsType = seriesTypeMapper_1.getSeriesType(this.getChartType());
        const options = core_1._.get(this.getChartOptions(), `${optionsType}`, undefined);
        core_1._.set(options, 'paired', paired);
    }
    getChart() {
        return this.chartController.getChartProxy().getChart();
    }
    getChartOptions() {
        return this.chartController.getChartProxy().getChartOptions();
    }
    getAxis(axisType) {
        const chart = this.getChart();
        if (!chart.axes || chart.axes.length < 1) {
            return undefined;
        }
        if (axisType === 'xAxis') {
            return (chart.axes && chart.axes[0].direction === 'x') ? chart.axes[0] : chart.axes[1];
        }
        return (chart.axes && chart.axes[1].direction === 'y') ? chart.axes[1] : chart.axes[0];
    }
    updateAxisOptions(chartAxis, expression, value) {
        const optionsType = seriesTypeMapper_1.getSeriesType(this.getChartType());
        const axisOptions = this.getChartOptions()[optionsType].axes;
        if (chartAxis instanceof ag_charts_community_1.NumberAxis) {
            core_1._.set(axisOptions.number, expression, value);
        }
        else if (chartAxis instanceof ag_charts_community_1.CategoryAxis) {
            core_1._.set(axisOptions.category, expression, value);
        }
        else if (chartAxis instanceof ag_charts_community_1.TimeAxis) {
            core_1._.set(axisOptions.time, expression, value);
        }
        else if (chartAxis instanceof ag_charts_community_1.GroupedCategoryAxis) {
            core_1._.set(axisOptions.groupedCategory, expression, value);
        }
    }
    raiseChartOptionsChangedEvent() {
        const chartModel = this.chartController.getChartModel();
        const event = Object.freeze({
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: chartModel.chartThemeName,
            chartOptions: chartModel.chartOptions,
            api: this.gridApi,
            columnApi: this.columnApi,
        });
        this.eventService.dispatchEvent(event);
    }
    static isMatchingSeries(seriesType, series) {
        return seriesType === 'area' && series instanceof ag_charts_community_1.AreaSeries ? true :
            seriesType === 'bar' && series instanceof ag_charts_community_1.BarSeries ? true :
                seriesType === 'column' && series instanceof ag_charts_community_1.BarSeries ? true :
                    seriesType === 'histogram' && series instanceof ag_charts_community_1.HistogramSeries ? true :
                        seriesType === 'line' && series instanceof ag_charts_community_1.LineSeries ? true :
                            seriesType === 'pie' && series instanceof ag_charts_community_1.PieSeries ? true :
                                seriesType === 'scatter' && series instanceof ag_charts_community_1.ScatterSeries;
    }
    destroy() {
        super.destroy();
    }
}
__decorate([
    core_1.Autowired('gridApi')
], ChartOptionsService.prototype, "gridApi", void 0);
__decorate([
    core_1.Autowired('columnApi')
], ChartOptionsService.prototype, "columnApi", void 0);
exports.ChartOptionsService = ChartOptionsService;
//# sourceMappingURL=chartOptionsService.js.map