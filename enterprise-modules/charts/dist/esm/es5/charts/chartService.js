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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, Optional, PreDestroy } from "@ag-grid-community/core";
import { GridChartComp } from "./chartComp/gridChartComp";
var ChartService = /** @class */ (function (_super) {
    __extends(ChartService, _super);
    function ChartService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
        // those in developer provided containers.
        _this.activeCharts = new Set();
        _this.activeChartComps = new Set();
        // this shared (singleton) context is used by cross filtering in line and area charts
        _this.crossFilteringContext = {
            lastSelectedChartId: '',
        };
        return _this;
    }
    ChartService.prototype.getChartModels = function () {
        var models = [];
        this.activeChartComps.forEach(function (c) { return models.push(c.getChartModel()); });
        return models;
    };
    ChartService.prototype.getChartRef = function (chartId) {
        var chartRef;
        this.activeCharts.forEach(function (cr) {
            if (cr.chartId === chartId) {
                chartRef = cr;
            }
        });
        return chartRef;
    };
    ChartService.prototype.getChartImageDataURL = function (params) {
        var url;
        this.activeChartComps.forEach(function (c) {
            if (c.getChartId() === params.chartId) {
                url = c.getChartImageDataURL(params.fileFormat);
            }
        });
        return url;
    };
    ChartService.prototype.createChartFromCurrentRange = function (chartType) {
        if (chartType === void 0) { chartType = 'groupedColumn'; }
        var selectedRange = this.getSelectedRange();
        return this.createChart(selectedRange, chartType);
    };
    ChartService.prototype.restoreChart = function (model, chartContainer) {
        var _this = this;
        if (!model) {
            console.warn("AG Grid - unable to restore chart as no chart model is provided");
            return;
        }
        var params = {
            cellRange: model.cellRange,
            chartType: model.chartType,
            chartThemeName: model.chartThemeName,
            chartContainer: chartContainer,
            suppressChartRanges: model.suppressChartRanges,
            aggFunc: model.aggFunc,
            unlinkChart: model.unlinkChart,
            seriesChartTypes: model.seriesChartTypes
        };
        var getCellRange = function (cellRangeParams) {
            return _this.rangeService
                ? _this.rangeService.createCellRangeFromCellRangeParams(cellRangeParams)
                : undefined;
        };
        if (model.modelType === 'pivot') {
            // if required enter pivot mode
            if (!this.columnModel.isPivotMode()) {
                this.columnModel.setPivotMode(true, "pivotChart");
            }
            // pivot chart range contains all visible column without a row range to include all rows
            var columns = this.columnModel.getAllDisplayedColumns().map(function (col) { return col.getColId(); });
            var chartAllRangeParams = { rowStartIndex: null, rowEndIndex: null, columns: columns };
            var cellRange_1 = getCellRange(chartAllRangeParams);
            if (!cellRange_1) {
                console.warn("AG Grid - unable to create chart as there are no columns in the grid.");
                return;
            }
            return this.createChart(cellRange_1, params.chartType, params.chartThemeName, true, true, params.chartContainer, undefined, undefined, params.unlinkChart, false, model.chartOptions);
        }
        var cellRange = getCellRange(params.cellRange);
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }
        return this.createChart(cellRange, params.chartType, params.chartThemeName, false, params.suppressChartRanges, params.chartContainer, params.aggFunc, undefined, params.unlinkChart, false, model.chartOptions, params.seriesChartTypes);
    };
    ChartService.prototype.createRangeChart = function (params) {
        var cellRange = this.rangeService
            ? this.rangeService.createCellRangeFromCellRangeParams(params.cellRange)
            : undefined;
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }
        return this.createChart(cellRange, params.chartType, params.chartThemeName, false, params.suppressChartRanges, params.chartContainer, params.aggFunc, params.chartThemeOverrides, params.unlinkChart, undefined, undefined, params.seriesChartTypes);
    };
    ChartService.prototype.createPivotChart = function (params) {
        // if required enter pivot mode
        if (!this.columnModel.isPivotMode()) {
            this.columnModel.setPivotMode(true, "pivotChart");
        }
        // pivot chart range contains all visible column without a row range to include all rows
        var chartAllRangeParams = {
            rowStartIndex: null,
            rowEndIndex: null,
            columns: this.columnModel.getAllDisplayedColumns().map(function (col) { return col.getColId(); })
        };
        var cellRange = this.rangeService
            ? this.rangeService.createCellRangeFromCellRangeParams(chartAllRangeParams)
            : undefined;
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as there are no columns in the grid.");
            return;
        }
        return this.createChart(cellRange, params.chartType, params.chartThemeName, true, true, params.chartContainer, undefined, params.chartThemeOverrides, params.unlinkChart);
    };
    ChartService.prototype.createCrossFilterChart = function (params) {
        var cellRange = this.rangeService
            ? this.rangeService.createCellRangeFromCellRangeParams(params.cellRange)
            : undefined;
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }
        var crossFiltering = true;
        var suppressChartRangesSupplied = typeof params.suppressChartRanges !== 'undefined' && params.suppressChartRanges !== null;
        var suppressChartRanges = suppressChartRangesSupplied ? params.suppressChartRanges : true;
        return this.createChart(cellRange, params.chartType, params.chartThemeName, false, suppressChartRanges, params.chartContainer, params.aggFunc, params.chartThemeOverrides, params.unlinkChart, crossFiltering);
    };
    ChartService.prototype.createChart = function (cellRange, chartType, chartThemeName, pivotChart, suppressChartRanges, container, aggFunc, chartThemeOverrides, unlinkChart, crossFiltering, chartOptionsToRestore, seriesChartTypes) {
        var _this = this;
        if (pivotChart === void 0) { pivotChart = false; }
        if (suppressChartRanges === void 0) { suppressChartRanges = false; }
        if (unlinkChart === void 0) { unlinkChart = false; }
        if (crossFiltering === void 0) { crossFiltering = false; }
        var createChartContainerFunc = this.gridOptionsWrapper.getCreateChartContainerFunc();
        var params = {
            chartId: this.generateId(),
            pivotChart: pivotChart,
            cellRange: cellRange,
            chartType: chartType,
            chartThemeName: chartThemeName,
            insideDialog: !(container || createChartContainerFunc),
            suppressChartRanges: suppressChartRanges,
            aggFunc: aggFunc,
            chartThemeOverrides: chartThemeOverrides,
            unlinkChart: unlinkChart,
            crossFiltering: crossFiltering,
            crossFilteringContext: this.crossFilteringContext,
            chartOptionsToRestore: chartOptionsToRestore,
            seriesChartTypes: seriesChartTypes
        };
        var chartComp = new GridChartComp(params);
        this.context.createBean(chartComp);
        var chartRef = this.createChartRef(chartComp);
        if (container) {
            // if container exists, means developer initiated chart create via API, so place in provided container
            container.appendChild(chartComp.getGui());
            // if the chart container was placed outside of an element that
            // has the grid's theme, we manually add the current theme to
            // make sure all styles for the chartMenu are rendered correctly
            var theme = this.environment.getTheme();
            if (theme.el && !theme.el.contains(container)) {
                container.classList.add(theme.theme);
            }
        }
        else if (createChartContainerFunc) {
            // otherwise user created chart via grid UI, check if developer provides containers (eg if the application
            // is using its own dialogs rather than the grid provided dialogs)
            createChartContainerFunc(chartRef);
        }
        else {
            // add listener to remove from active charts list when charts are destroyed, e.g. closing chart dialog
            chartComp.addEventListener(GridChartComp.EVENT_DESTROYED, function () {
                _this.activeChartComps.delete(chartComp);
                _this.activeCharts.delete(chartRef);
            });
        }
        return chartRef;
    };
    ChartService.prototype.createChartRef = function (chartComp) {
        var _this = this;
        var chartRef = {
            destroyChart: function () {
                if (_this.activeCharts.has(chartRef)) {
                    _this.context.destroyBean(chartComp);
                    _this.activeChartComps.delete(chartComp);
                    _this.activeCharts.delete(chartRef);
                }
            },
            chartElement: chartComp.getGui(),
            chart: chartComp.getUnderlyingChart(),
            chartId: chartComp.getChartModel().chartId
        };
        this.activeCharts.add(chartRef);
        this.activeChartComps.add(chartComp);
        return chartRef;
    };
    ChartService.prototype.getSelectedRange = function () {
        var ranges = this.rangeService.getCellRanges();
        return ranges.length > 0 ? ranges[0] : {};
    };
    ChartService.prototype.generateId = function () {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    };
    ChartService.prototype.destroyAllActiveCharts = function () {
        this.activeCharts.forEach(function (chart) { return chart.destroyChart(); });
    };
    __decorate([
        Optional('rangeService')
    ], ChartService.prototype, "rangeService", void 0);
    __decorate([
        Autowired('columnModel')
    ], ChartService.prototype, "columnModel", void 0);
    __decorate([
        Autowired('environment')
    ], ChartService.prototype, "environment", void 0);
    __decorate([
        PreDestroy
    ], ChartService.prototype, "destroyAllActiveCharts", null);
    ChartService = __decorate([
        Bean('chartService')
    ], ChartService);
    return ChartService;
}(BeanStub));
export { ChartService };
//# sourceMappingURL=chartService.js.map