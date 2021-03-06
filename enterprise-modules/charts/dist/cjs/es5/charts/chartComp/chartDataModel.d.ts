import { BeanStub, CellRange, ChartType, Column, IAggFunc, SeriesChartType } from "@ag-grid-community/core";
export interface ColState {
    column?: Column;
    colId: string;
    displayName: string | null;
    selected?: boolean;
    order: number;
}
export interface ChartModelParams {
    chartId: string;
    pivotChart: boolean;
    chartType: ChartType;
    chartThemeName: string;
    aggFunc?: string | IAggFunc;
    cellRange: CellRange;
    suppressChartRanges: boolean;
    unlinkChart?: boolean;
    crossFiltering?: boolean;
    seriesChartTypes?: SeriesChartType[];
}
export declare class ChartDataModel extends BeanStub {
    static DEFAULT_CATEGORY: string;
    private readonly columnModel;
    private readonly valueService;
    private readonly rangeService;
    private readonly rowRenderer;
    private readonly chartTranslationService;
    readonly chartId: string;
    readonly suppressChartRanges: boolean;
    readonly aggFunc?: string | IAggFunc;
    readonly pivotChart: boolean;
    chartType: ChartType;
    chartThemeName: string;
    unlinked: boolean;
    chartData: any[];
    valueColState: ColState[];
    dimensionColState: ColState[];
    columnNames: {
        [p: string]: string[];
    };
    seriesChartTypes: SeriesChartType[];
    savedCustomSeriesChartTypes: SeriesChartType[];
    valueCellRange?: CellRange;
    dimensionCellRange?: CellRange;
    private referenceCellRange;
    private suppliedCellRange;
    private datasource;
    private grouping;
    private crossFiltering;
    private suppressComboChartWarnings;
    constructor(params: ChartModelParams);
    private initComboCharts;
    private init;
    updateCellRanges(updatedColState?: ColState): void;
    updateSeriesChartTypes(): void;
    updateSeriesChartTypesForCustomCombo(): void;
    updateChartSeriesTypesForBuiltInCombos(): void;
    updateData(): void;
    isGrouping(): boolean;
    getSelectedValueCols(): Column[];
    getSelectedDimension(): ColState;
    getColDisplayName(col: Column): string | null;
    isPivotMode(): boolean;
    private isPivotActive;
    private createCellRange;
    private getAllColumnsFromRanges;
    private getRowIndexes;
    private getAllChartColumns;
    private isNumberCol;
    private extractLeafData;
    private resetColumnState;
    private updateColumnState;
    private reorderColState;
    private setDimensionCellRange;
    private setValueCellRange;
    private syncDimensionCellRange;
    isComboChart(): boolean;
}
