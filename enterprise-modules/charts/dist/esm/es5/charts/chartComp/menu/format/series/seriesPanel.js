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
import { _, AgSelect, AgSlider, AgToggleButton, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { ShadowPanel } from "./shadowPanel";
import { FontPanel } from "../fontPanel";
import { initFontPanelParams } from "./fontPanelParams";
import { getMaxValue } from "../formatPanel";
import { MarkersPanel } from "./markersPanel";
import { getSeriesType } from "../../../utils/seriesTypeMapper";
import { CalloutPanel } from "./calloutPanel";
var SeriesPanel = /** @class */ (function (_super) {
    __extends(SeriesPanel, _super);
    function SeriesPanel(chartController, chartOptionsService, seriesType) {
        var _this = _super.call(this) || this;
        _this.chartController = chartController;
        _this.chartOptionsService = chartOptionsService;
        _this.activePanels = [];
        _this.widgetFuncs = {
            'lineWidth': function () { return _this.initLineWidth(); },
            'strokeWidth': function () { return _this.initStrokeWidth(); },
            'lineDash': function () { return _this.initLineDash(); },
            'lineOpacity': function () { return _this.initLineOpacity(); },
            'fillOpacity': function () { return _this.initFillOpacity(); },
            'markers': function () { return _this.initMarkers(); },
            'labels': function () { return _this.initLabels(); },
            'shadow': function () { return _this.initShadow(); },
            'tooltips': function () { return _this.initTooltips(); },
            'bins': function () { return _this.initBins(); },
        };
        _this.seriesWidgetMappings = {
            'area': ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'markers', 'labels', 'shadow'],
            'bar': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'column': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'line': ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'markers', 'labels'],
            'histogram': ['tooltips', 'bins', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'scatter': ['tooltips', 'markers', 'labels'],
            'pie': ['tooltips', 'strokeWidth', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
        };
        _this.seriesType = seriesType || _this.getChartSeriesType();
        return _this;
    }
    SeriesPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(SeriesPanel.TEMPLATE, { seriesGroup: groupParams });
        this.seriesGroup
            .setTitle(this.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
        this.initSeriesSelect();
        this.refreshWidgets();
    };
    SeriesPanel.prototype.initSeriesSelect = function () {
        var _this = this;
        // only combo charts require series select
        if (!this.chartController.isComboChart()) {
            return;
        }
        var seriesSelect = this.seriesGroup.createManagedBean(new AgSelect());
        seriesSelect
            .setLabel(this.translate('seriesType'))
            .setLabelAlignment("left")
            .setLabelWidth('flex')
            .setInputWidth(100)
            .addOptions(this.getSeriesSelectOptions())
            .setValue("" + this.seriesType)
            .onValueChange(function (newValue) {
            _this.seriesType = newValue;
            _this.refreshWidgets();
        });
        this.seriesGroup.addItem(seriesSelect);
    };
    SeriesPanel.prototype.refreshWidgets = function () {
        var _this = this;
        this.destroyActivePanels();
        this.seriesWidgetMappings[this.seriesType].forEach(function (w) { return _this.widgetFuncs[w](); });
    };
    SeriesPanel.prototype.initTooltips = function () {
        var _this = this;
        var seriesTooltipsToggle = this.createBean(new AgToggleButton());
        seriesTooltipsToggle
            .setLabel(this.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(function (newValue) { return _this.setSeriesOption("tooltip.enabled", newValue); });
        this.addWidget(seriesTooltipsToggle);
    };
    SeriesPanel.prototype.initStrokeWidth = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("strokeWidth");
        var seriesStrokeWidthSlider = this.createBean(new AgSlider());
        seriesStrokeWidthSlider
            .setLabel(this.translate("strokeWidth"))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("strokeWidth", newValue); });
        this.addWidget(seriesStrokeWidthSlider);
    };
    SeriesPanel.prototype.initLineWidth = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("strokeWidth");
        var seriesLineWidthSlider = this.createBean(new AgSlider());
        seriesLineWidthSlider
            .setLabel(this.translate('lineWidth'))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("strokeWidth", newValue); });
        this.addWidget(seriesLineWidthSlider);
    };
    SeriesPanel.prototype.initLineDash = function () {
        var _this = this;
        var lineDash = this.getSeriesOption("lineDash");
        var currentValue = lineDash ? lineDash[0] : 0;
        var seriesLineDashSlider = this.createBean(new AgSlider());
        seriesLineDashSlider
            .setLabel(this.translate('lineDash'))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("lineDash", [newValue]); });
        this.addWidget(seriesLineDashSlider);
    };
    SeriesPanel.prototype.initLineOpacity = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("strokeOpacity");
        var seriesLineOpacitySlider = this.createBean(new AgSlider());
        seriesLineOpacitySlider
            .setLabel(this.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("strokeOpacity", newValue); });
        this.addWidget(seriesLineOpacitySlider);
    };
    SeriesPanel.prototype.initFillOpacity = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("fillOpacity");
        var seriesFillOpacitySlider = this.createBean(new AgSlider());
        seriesFillOpacitySlider
            .setLabel(this.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("fillOpacity", newValue); });
        this.addWidget(seriesFillOpacitySlider);
    };
    SeriesPanel.prototype.initLabels = function () {
        var _this = this;
        var params = initFontPanelParams(this.chartTranslationService, this.chartOptionsService, function () { return _this.seriesType; });
        var labelPanelComp = this.createBean(new FontPanel(params));
        if (this.seriesType === 'pie') {
            var calloutPanelComp = this.createBean(new CalloutPanel(this.chartOptionsService, function () { return _this.seriesType; }));
            labelPanelComp.addCompToPanel(calloutPanelComp);
            this.activePanels.push(calloutPanelComp);
        }
        this.addWidget(labelPanelComp);
    };
    SeriesPanel.prototype.initShadow = function () {
        var _this = this;
        var shadowPanelComp = this.createBean(new ShadowPanel(this.chartOptionsService, function () { return _this.seriesType; }));
        this.addWidget(shadowPanelComp);
    };
    SeriesPanel.prototype.initMarkers = function () {
        var _this = this;
        var markersPanelComp = this.createBean(new MarkersPanel(this.chartOptionsService, function () { return _this.seriesType; }));
        this.addWidget(markersPanelComp);
    };
    SeriesPanel.prototype.initBins = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("binCount");
        var seriesBinCountSlider = this.createBean(new AgSlider());
        seriesBinCountSlider
            .setLabel(this.translate("histogramBinCount"))
            .setMinValue(4)
            .setMaxValue(getMaxValue(currentValue, 100))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("binCount", newValue); });
        this.addWidget(seriesBinCountSlider);
    };
    SeriesPanel.prototype.addWidget = function (widget) {
        this.seriesGroup.addItem(widget);
        this.activePanels.push(widget);
    };
    SeriesPanel.prototype.getSeriesOption = function (expression) {
        return this.chartOptionsService.getSeriesOption(expression, this.seriesType);
    };
    SeriesPanel.prototype.setSeriesOption = function (expression, newValue) {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.seriesType);
    };
    SeriesPanel.prototype.getChartSeriesType = function () {
        var ct = this.chartController.getSeriesChartTypes()[0].chartType;
        return (ct === 'columnLineCombo') ? 'column' : (ct === 'areaColumnCombo') ? 'area' : getSeriesType(ct);
    };
    SeriesPanel.prototype.getSeriesSelectOptions = function () {
        var _this = this;
        if (!this.seriesSelectOptions) {
            // lazy init options as they are only required for combo charts
            this.seriesSelectOptions = new Map([
                ['area', { value: 'area', text: this.translate('area', 'Area') }],
                ['bar', { value: 'bar', text: this.translate('bar', 'Bar') }],
                ['column', { value: 'column', text: this.translate('column', 'Column') }],
                ['line', { value: 'line', text: this.translate('line', 'Line') }],
                ['scatter', { value: 'scatter', text: this.translate('scatter', 'Scatter') }],
                ['histogram', { value: 'histogram', text: this.translate('histogram', 'Histogram') }],
                ['pie', { value: 'pie', text: this.translate('pie', 'Pie') }],
            ]);
        }
        var options = new Set();
        this.chartController.getSeriesChartTypes().forEach(function (s) {
            var chartType = getSeriesType(s.chartType);
            options.add(_this.seriesSelectOptions.get(chartType));
        });
        return Array.from(options);
    };
    SeriesPanel.prototype.translate = function (key, defaultText) {
        return this.chartTranslationService.translate(key, defaultText);
    };
    SeriesPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    SeriesPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    SeriesPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesGroup\">                \n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('seriesGroup')
    ], SeriesPanel.prototype, "seriesGroup", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], SeriesPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], SeriesPanel.prototype, "init", null);
    return SeriesPanel;
}(Component));
export { SeriesPanel };
//# sourceMappingURL=seriesPanel.js.map