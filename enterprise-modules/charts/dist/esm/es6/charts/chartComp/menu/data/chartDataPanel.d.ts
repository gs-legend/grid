import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ChartOptionsService } from "../../services/chartOptionsService";
export declare class ChartDataPanel extends Component {
    private readonly chartController;
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private dragAndDropService;
    private chartTranslationService;
    private autoScrollService;
    private categoriesGroupComp?;
    private seriesGroupComp?;
    private seriesChartTypeGroupComp?;
    private columnComps;
    private chartType?;
    private lastHoveredItem?;
    private lastDraggedColumn?;
    constructor(chartController: ChartController, chartOptionsService: ChartOptionsService);
    init(): void;
    protected destroy(): void;
    private updatePanels;
    private getGroupExpandedState;
    private restoreGroupExpandedState;
    private createAutoScrollService;
    private addComponent;
    private addChangeListener;
    private createCategoriesGroup;
    private createSeriesGroup;
    private createSeriesChartTypeGroup;
    private addDragHandle;
    private generateGetSeriesLabel;
    private getCategoryGroupTitle;
    private getSeriesGroupTitle;
    private isInPairedMode;
    private clearComponents;
    private onDragging;
    private checkHoveredItem;
    private onDragLeave;
    private onDragStop;
    private clearHoveredItems;
    private isInterestedIn;
}
