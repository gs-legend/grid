"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const enterpriseMenu_1 = require("./menu/enterpriseMenu");
const contextMenu_1 = require("./menu/contextMenu");
const menuItemMapper_1 = require("./menu/menuItemMapper");
exports.MenuModule = {
    moduleName: core_1.ModuleNames.MenuModule,
    beans: [enterpriseMenu_1.EnterpriseMenuFactory, contextMenu_1.ContextMenuFactory, menuItemMapper_1.MenuItemMapper],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
//# sourceMappingURL=menuModule.js.map