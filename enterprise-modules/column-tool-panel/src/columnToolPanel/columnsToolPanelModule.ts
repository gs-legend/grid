import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { PrimaryColsHeaderPanel } from "./primaryColsHeaderPanel";
import { PrimaryColsListPanel } from "./primaryColsListPanel";
import { ColumnToolPanel } from "./columnToolPanel";
import { PrimaryColsPanel } from "./primaryColsPanel";

import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { SideBarModule } from "@ag-grid-enterprise/side-bar";
import { ModelItemUtils } from "./modelItemUtils";

export const ColumnsToolPanelModule: Module = {
    moduleName: ModuleNames.ColumnToolPanelModule,
    beans: [ModelItemUtils],
    agStackComponents: [
        { componentName: 'AgPrimaryColsHeader', componentClass: PrimaryColsHeaderPanel },
        { componentName: 'AgPrimaryColsList', componentClass: PrimaryColsListPanel },
        { componentName: 'AgPrimaryCols', componentClass: PrimaryColsPanel }
    ],
    userComponents: [
        { componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel },
    ],
    dependantModules: [
        EnterpriseCoreModule,
        RowGroupingModule,
        SideBarModule
    ]
};
