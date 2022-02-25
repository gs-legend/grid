import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ServerSideRowModel } from "./serverSideRowModel/serverSideRowModel";
import { StoreUtils } from "./serverSideRowModel/stores/storeUtils";
import { BlockUtils } from "./serverSideRowModel/blocks/blockUtils";
import { NodeManager } from "./serverSideRowModel/nodeManager";
import { TransactionManager } from "./serverSideRowModel/transactionManager";
import { ExpandListener } from "./serverSideRowModel/listeners/expandListener";
import { SortListener } from "./serverSideRowModel/listeners/sortListener";
import { FilterListener } from "./serverSideRowModel/listeners/filterListener";
import { StoreFactory } from "./serverSideRowModel/stores/storeFactory";
import { ListenerUtils } from "./serverSideRowModel/listeners/listenerUtils";

export const ServerSideRowModelModule: Module = {
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModels: { serverSide: ServerSideRowModel },
    beans: [ExpandListener, SortListener, StoreUtils, BlockUtils, NodeManager, TransactionManager,
        FilterListener, StoreFactory, ListenerUtils],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
