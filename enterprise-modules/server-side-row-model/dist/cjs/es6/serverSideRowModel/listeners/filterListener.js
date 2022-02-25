"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
let FilterListener = class FilterListener extends core_1.BeanStub {
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) {
            return;
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    }
    onFilterChanged() {
        const storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        const newModel = this.filterManager.getFilterModel();
        const oldModel = storeParams ? storeParams.filterModel : {};
        const changedColumns = this.findChangedColumns(newModel, oldModel);
        const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        const alwaysReset = this.gridOptionsWrapper.isServerSideFilteringAlwaysResets();
        const params = {
            valueColChanged,
            secondaryColChanged,
            alwaysReset,
            changedColumns
        };
        this.serverSideRowModel.refreshAfterFilter(newModel, params);
    }
    findChangedColumns(oldModel, newModel) {
        const allColKeysMap = {};
        Object.keys(oldModel).forEach(key => allColKeysMap[key] = true);
        Object.keys(newModel).forEach(key => allColKeysMap[key] = true);
        const res = [];
        Object.keys(allColKeysMap).forEach(key => {
            const oldJson = JSON.stringify(oldModel[key]);
            const newJson = JSON.stringify(newModel[key]);
            const filterChanged = oldJson != newJson;
            if (filterChanged) {
                res.push(key);
            }
        });
        return res;
    }
};
__decorate([
    core_1.Autowired('rowModel')
], FilterListener.prototype, "serverSideRowModel", void 0);
__decorate([
    core_1.Autowired('filterManager')
], FilterListener.prototype, "filterManager", void 0);
__decorate([
    core_1.Autowired('ssrmListenerUtils')
], FilterListener.prototype, "listenerUtils", void 0);
__decorate([
    core_1.PostConstruct
], FilterListener.prototype, "postConstruct", null);
FilterListener = __decorate([
    core_1.Bean('ssrmFilterListener')
], FilterListener);
exports.FilterListener = FilterListener;
//# sourceMappingURL=filterListener.js.map