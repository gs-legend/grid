var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct } from "@ag-grid-community/core";
export class TitleEdit extends Component {
    constructor(chartMenu) {
        super(TitleEdit.TEMPLATE);
        this.chartMenu = chartMenu;
    }
    init() {
        this.addManagedListener(this.getGui(), 'keypress', (e) => {
            if (e.key === 'Enter') {
                this.endEditing();
            }
        });
        this.addManagedListener(this.getGui(), 'blur', this.endEditing.bind(this));
    }
    /* should be called when the containing component changes to a new chart proxy */
    refreshTitle(chartController, chartOptionsService) {
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        const chartProxy = this.chartController.getChartProxy();
        if (chartProxy) {
            for (let i = 0; i++; i < this.destroyableChartListeners.length) {
                this.destroyableChartListeners[i]();
            }
            this.destroyableChartListeners = [];
        }
        const chart = chartProxy.getChart();
        const canvas = chart.scene.canvas.element;
        const destroyDbleClickListener = this.addManagedListener(canvas, 'dblclick', event => {
            const { title } = chart;
            if (title && title.node.containsPoint(event.offsetX, event.offsetY)) {
                const bbox = title.node.computeBBox();
                const xy = title.node.inverseTransformPoint(bbox.x, bbox.y);
                this.startEditing(Object.assign(Object.assign({}, bbox), xy));
            }
        });
        const destroyMouseMoveListener = this.addManagedListener(canvas, 'mousemove', event => {
            const { title } = chart;
            const inTitle = title && title.enabled && title.node.containsPoint(event.offsetX, event.offsetY);
            canvas.style.cursor = inTitle ? 'pointer' : '';
        });
        this.destroyableChartListeners = [
            destroyDbleClickListener,
            destroyMouseMoveListener
        ];
    }
    startEditing(titleBBox) {
        if (this.chartMenu && this.chartMenu.isVisible()) {
            // currently we ignore requests to edit the chart title while the chart menu is showing
            // because the click to edit the chart will also close the chart menu, making the position
            // of the title change.
            return;
        }
        const minimumTargetInputWidth = 300;
        const maximumInputWidth = this.chartController.getChartProxy().getChart().width;
        const inputWidth = Math.max(Math.min(titleBBox.width + 20, maximumInputWidth), minimumTargetInputWidth);
        const inputElement = this.getGui();
        inputElement.classList.add('currently-editing');
        const inputStyle = inputElement.style;
        // match style of input to title that we're editing
        inputStyle.fontFamily = this.chartOptionsService.getChartOption('title.fontFamily');
        inputStyle.fontWeight = this.chartOptionsService.getChartOption('title.fontWeight');
        inputStyle.fontStyle = this.chartOptionsService.getChartOption('title.fontStyle');
        inputStyle.fontSize = this.chartOptionsService.getChartOption('title.fontSize') + 'px';
        inputStyle.color = this.chartOptionsService.getChartOption('title.color');
        // populate the input with the title, unless the title is the placeholder:
        const oldTitle = this.chartOptionsService.getChartOption('title.text');
        const inputValue = oldTitle === this.chartTranslationService.translate('titlePlaceholder') ? '' : oldTitle;
        inputElement.value = inputValue;
        const inputRect = inputElement.getBoundingClientRect();
        inputStyle.left = Math.round(titleBBox.x + titleBBox.width / 2 - inputWidth / 2) + 'px';
        inputStyle.top = Math.round(titleBBox.y + titleBBox.height / 2 - inputRect.height / 2) + 'px';
        inputStyle.width = Math.round(inputWidth) + 'px';
        inputElement.focus();
    }
    endEditing() {
        const value = this.getGui().value;
        this.chartOptionsService.setChartOption('title.text', value);
        this.eventService.dispatchEvent({ type: 'chartTitleEdit' });
        this.removeCssClass('currently-editing');
    }
}
TitleEdit.TEMPLATE = `<input
            class="ag-chart-title-edit"
            style="padding:0; border:none; border-radius: 0; min-height: 0; text-align: center;" />
        `;
__decorate([
    Autowired('chartTranslationService')
], TitleEdit.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], TitleEdit.prototype, "init", null);
//# sourceMappingURL=titleEdit.js.map