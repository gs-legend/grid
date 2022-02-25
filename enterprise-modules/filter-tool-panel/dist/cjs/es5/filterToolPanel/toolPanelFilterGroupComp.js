"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var toolPanelFilterComp_1 = require("./toolPanelFilterComp");
var ToolPanelFilterGroupComp = /** @class */ (function (_super) {
    __extends(ToolPanelFilterGroupComp, _super);
    function ToolPanelFilterGroupComp(columnGroup, childFilterComps, expandedCallback, depth, showingColumn) {
        var _this = _super.call(this) || this;
        _this.columnGroup = columnGroup;
        _this.childFilterComps = childFilterComps;
        _this.depth = depth;
        _this.expandedCallback = expandedCallback;
        _this.showingColumn = showingColumn;
        return _this;
    }
    ToolPanelFilterGroupComp.prototype.preConstruct = function () {
        var groupParams = {
            cssIdentifier: 'filter-toolpanel',
            direction: 'vertical'
        };
        this.setTemplate(ToolPanelFilterGroupComp.TEMPLATE, { filterGroupComp: groupParams });
    };
    ToolPanelFilterGroupComp.prototype.init = function () {
        var _this = this;
        this.setGroupTitle();
        this.filterGroupComp.setAlignItems('stretch');
        this.filterGroupComp.addCssClass("ag-filter-toolpanel-group-level-" + this.depth);
        this.filterGroupComp.addCssClassToTitleBar("ag-filter-toolpanel-group-level-" + this.depth + "-header");
        this.childFilterComps.forEach(function (filterComp) {
            _this.filterGroupComp.addItem(filterComp);
            filterComp.addCssClassToTitleBar("ag-filter-toolpanel-group-level-" + (_this.depth + 1) + "-header");
        });
        this.addExpandCollapseListeners();
        this.addFilterChangedListeners();
        this.setupTooltip();
    };
    ToolPanelFilterGroupComp.prototype.setupTooltip = function () {
        var _this = this;
        // we don't show tooltips for groups, as when the group expands, it's div contains the columns which also
        // have tooltips, so the tooltips would clash. Eg mouse over group, tooltip shows, mouse over column, another
        // tooltip shows but cos we didn't leave the group the group tooltip remains. this should be fixed in the future,
        // maybe the group shouldn't contain the children form a DOM perspective.
        if (!this.showingColumn) {
            return;
        }
        var refresh = function () {
            var newTooltipText = _this.columnGroup.getColDef().headerTooltip;
            _this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    };
    ToolPanelFilterGroupComp.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'filterToolPanelColumnGroup';
        return res;
    };
    ToolPanelFilterGroupComp.prototype.addCssClassToTitleBar = function (cssClass) {
        this.filterGroupComp.addCssClassToTitleBar(cssClass);
    };
    ToolPanelFilterGroupComp.prototype.refreshFilters = function () {
        this.childFilterComps.forEach(function (filterComp) {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                filterComp.refreshFilters();
            }
            else {
                filterComp.refreshFilter();
            }
        });
    };
    ToolPanelFilterGroupComp.prototype.isColumnGroup = function () {
        return this.columnGroup instanceof core_1.ProvidedColumnGroup;
    };
    ToolPanelFilterGroupComp.prototype.isExpanded = function () {
        return this.filterGroupComp.isExpanded();
    };
    ToolPanelFilterGroupComp.prototype.getChildren = function () {
        return this.childFilterComps;
    };
    ToolPanelFilterGroupComp.prototype.getFilterGroupName = function () {
        return this.filterGroupName ? this.filterGroupName : '';
    };
    ToolPanelFilterGroupComp.prototype.getFilterGroupId = function () {
        return this.columnGroup.getId();
    };
    ToolPanelFilterGroupComp.prototype.hideGroupItem = function (hide, index) {
        this.filterGroupComp.hideItem(hide, index);
    };
    ToolPanelFilterGroupComp.prototype.hideGroup = function (hide) {
        this.addOrRemoveCssClass('ag-hidden', hide);
    };
    ToolPanelFilterGroupComp.prototype.forEachToolPanelFilterChild = function (action) {
        this.childFilterComps.forEach(function (filterComp) {
            if (filterComp instanceof toolPanelFilterComp_1.ToolPanelFilterComp) {
                action(filterComp);
            }
        });
    };
    ToolPanelFilterGroupComp.prototype.addExpandCollapseListeners = function () {
        var _this = this;
        var expandListener = this.isColumnGroup() ?
            function () { return _this.expandedCallback(); } :
            function () { return _this.forEachToolPanelFilterChild(function (filterComp) { return filterComp.expand(); }); };
        var collapseListener = this.isColumnGroup() ?
            function () { return _this.expandedCallback(); } :
            function () { return _this.forEachToolPanelFilterChild(function (filterComp) { return filterComp.collapse(); }); };
        this.addManagedListener(this.filterGroupComp, core_1.AgGroupComponent.EVENT_EXPANDED, expandListener);
        this.addManagedListener(this.filterGroupComp, core_1.AgGroupComponent.EVENT_COLLAPSED, collapseListener);
    };
    ToolPanelFilterGroupComp.prototype.addFilterChangedListeners = function () {
        var _this = this;
        if (this.columnGroup instanceof core_1.ProvidedColumnGroup) {
            var group_1 = this.columnGroup;
            var anyChildFiltersActive_1 = function () { return group_1.getLeafColumns().some(function (col) { return col.isFilterActive(); }); };
            group_1.getLeafColumns().forEach(function (column) {
                _this.addManagedListener(column, core_1.Column.EVENT_FILTER_CHANGED, function () {
                    _this.filterGroupComp.addOrRemoveCssClass('ag-has-filter', anyChildFiltersActive_1());
                });
            });
        }
        else {
            var column_1 = this.columnGroup;
            this.addManagedListener(this.eventService, core_1.Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
            this.addManagedListener(column_1, core_1.Column.EVENT_FILTER_CHANGED, function () {
                _this.filterGroupComp.addOrRemoveCssClass('ag-has-filter', column_1.isFilterActive());
            });
        }
    };
    ToolPanelFilterGroupComp.prototype.onFilterOpened = function (event) {
        // when a filter is opened elsewhere, i.e. column menu we close the filter comp so we also need to collapse
        // the column group. This approach means we don't need to try and sync filter models on the same column.
        if (event.source !== 'COLUMN_MENU') {
            return;
        }
        if (event.column !== this.columnGroup) {
            return;
        }
        if (!this.isExpanded()) {
            return;
        }
        this.collapse();
    };
    ToolPanelFilterGroupComp.prototype.expand = function () {
        this.filterGroupComp.toggleGroupExpand(true);
    };
    ToolPanelFilterGroupComp.prototype.collapse = function () {
        this.filterGroupComp.toggleGroupExpand(false);
    };
    ToolPanelFilterGroupComp.prototype.setGroupTitle = function () {
        this.filterGroupName = (this.columnGroup instanceof core_1.ProvidedColumnGroup) ?
            this.getColumnGroupName(this.columnGroup) : this.getColumnName(this.columnGroup);
        this.filterGroupComp.setTitle(this.filterGroupName || '');
    };
    ToolPanelFilterGroupComp.prototype.getColumnGroupName = function (columnGroup) {
        return this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, 'filterToolPanel');
    };
    ToolPanelFilterGroupComp.prototype.getColumnName = function (column) {
        return this.columnModel.getDisplayNameForColumn(column, 'filterToolPanel', false);
    };
    ToolPanelFilterGroupComp.prototype.destroyFilters = function () {
        this.childFilterComps = this.destroyBeans(this.childFilterComps);
        core_1._.clearElement(this.getGui());
    };
    ToolPanelFilterGroupComp.prototype.destroy = function () {
        this.destroyFilters();
        _super.prototype.destroy.call(this);
    };
    ToolPanelFilterGroupComp.TEMPLATE = "<div class=\"ag-filter-toolpanel-group-wrapper\">\n            <ag-group-component ref=\"filterGroupComp\"></ag-group-component>\n        </div>";
    __decorate([
        core_1.RefSelector('filterGroupComp')
    ], ToolPanelFilterGroupComp.prototype, "filterGroupComp", void 0);
    __decorate([
        core_1.Autowired('columnModel')
    ], ToolPanelFilterGroupComp.prototype, "columnModel", void 0);
    __decorate([
        core_1.PreConstruct
    ], ToolPanelFilterGroupComp.prototype, "preConstruct", null);
    __decorate([
        core_1.PostConstruct
    ], ToolPanelFilterGroupComp.prototype, "init", null);
    return ToolPanelFilterGroupComp;
}(core_1.Component));
exports.ToolPanelFilterGroupComp = ToolPanelFilterGroupComp;
//# sourceMappingURL=toolPanelFilterGroupComp.js.map