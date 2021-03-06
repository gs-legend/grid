import { BeanStub, Column, MenuItemDef } from '@ag-grid-community/core';
export declare class MenuItemMapper extends BeanStub {
    private columnModel;
    private gridApi;
    private clipboardService;
    private aggFuncService;
    private chartService;
    mapWithStockItems(originalList: (MenuItemDef | string)[], column: Column | null): (MenuItemDef | string)[];
    private getStockMenuItem;
    private getChartItems;
    private createAggregationSubMenu;
}
