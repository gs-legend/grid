import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { EnterpriseMenuFactory } from "./menu/enterpriseMenu";
import { ContextMenuFactory } from "./menu/contextMenu";
import { MenuItemMapper } from "./menu/menuItemMapper";
export const MenuModule = {
    moduleName: ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=menuModule.js.map