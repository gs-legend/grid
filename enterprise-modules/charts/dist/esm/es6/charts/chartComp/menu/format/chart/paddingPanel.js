var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
export class PaddingPanel extends Component {
    constructor(chartOptionsService) {
        super();
        this.chartOptionsService = chartOptionsService;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(PaddingPanel.TEMPLATE, { chartPaddingGroup: groupParams });
        this.initGroup();
        this.initChartPaddingItems();
    }
    initGroup() {
        this.chartPaddingGroup
            .setTitle(this.chartTranslationService.translate("padding"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
    }
    initChartPaddingItems() {
        const initInput = (property, input) => {
            const currentValue = this.chartOptionsService.getChartOption('padding.' + property);
            input.setLabel(this.chartTranslationService.translate(property))
                .setMaxValue(getMaxValue(currentValue, 200))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartOptionsService.setChartOption('padding.' + property, newValue));
        };
        initInput('top', this.paddingTopSlider);
        initInput('right', this.paddingRightSlider);
        initInput('bottom', this.paddingBottomSlider);
        initInput('left', this.paddingLeftSlider);
    }
}
PaddingPanel.TEMPLATE = `<div>
            <ag-group-component ref="chartPaddingGroup">
                <ag-slider ref="paddingTopSlider"></ag-slider>
                <ag-slider ref="paddingRightSlider"></ag-slider>
                <ag-slider ref="paddingBottomSlider"></ag-slider>
                <ag-slider ref="paddingLeftSlider"></ag-slider>
            </ag-group-component>
        <div>`;
__decorate([
    RefSelector('chartPaddingGroup')
], PaddingPanel.prototype, "chartPaddingGroup", void 0);
__decorate([
    RefSelector('paddingTopSlider')
], PaddingPanel.prototype, "paddingTopSlider", void 0);
__decorate([
    RefSelector('paddingRightSlider')
], PaddingPanel.prototype, "paddingRightSlider", void 0);
__decorate([
    RefSelector('paddingBottomSlider')
], PaddingPanel.prototype, "paddingBottomSlider", void 0);
__decorate([
    RefSelector('paddingLeftSlider')
], PaddingPanel.prototype, "paddingLeftSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], PaddingPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], PaddingPanel.prototype, "init", null);
//# sourceMappingURL=paddingPanel.js.map