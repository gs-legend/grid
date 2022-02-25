"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const toolPanelContextMenu_1 = require("./toolPanelContextMenu");
class ToolPanelColumnComp extends core_1.Component {
    constructor(column, columnDept, allowDragging, groupsExist, focusWrapper) {
        super();
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
        this.groupsExist = groupsExist;
        this.focusWrapper = focusWrapper;
        this.processingColumnStateChange = false;
    }
    init() {
        this.setTemplate(ToolPanelColumnComp.TEMPLATE);
        this.eDragHandle = core_1._.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        this.eDragHandle.classList.add('ag-drag-handle', 'ag-column-select-column-drag-handle');
        const checkboxGui = this.cbSelect.getGui();
        const checkboxInput = this.cbSelect.getInputElement();
        checkboxGui.insertAdjacentElement('afterend', this.eDragHandle);
        checkboxInput.setAttribute('tabindex', '-1');
        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnToolPanel');
        const displayNameSanitised = core_1._.escapeString(this.displayName);
        this.eLabel.innerHTML = displayNameSanitised;
        // if grouping, we add an extra level of indent, to cater for expand/contract icons we need to indent for
        const indent = this.columnDept;
        if (this.groupsExist) {
            this.addCssClass('ag-column-select-add-group-indent');
        }
        this.addCssClass(`ag-column-select-indent-${indent}`);
        this.setupDragging();
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, core_1.Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, core_1.Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, core_1.Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, core_1.Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.focusWrapper, 'keydown', this.handleKeyDown.bind(this));
        this.addManagedListener(this.focusWrapper, 'contextmenu', this.onContextMenu.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, 'functionsReadOnly', this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.cbSelect, core_1.AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.onColumnStateChanged();
        this.refreshAriaLabel();
        this.setupTooltip();
        const classes = core_1.CssClassApplier.getToolPanelClassesFromColDef(this.column.getColDef(), this.gridOptionsWrapper, this.column, null);
        classes.forEach(c => this.addOrRemoveCssClass(c, true));
    }
    getColumn() {
        return this.column;
    }
    setupTooltip() {
        const refresh = () => {
            const newTooltipText = this.column.getColDef().headerTooltip;
            this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'columnToolPanelColumn';
        res.colDef = this.column.getColDef();
        return res;
    }
    onContextMenu(e) {
        const { column, gridOptionsWrapper } = this;
        if (gridOptionsWrapper.isFunctionsReadOnly()) {
            return;
        }
        const contextMenu = this.createBean(new toolPanelContextMenu_1.ToolPanelContextMenu(column, e, this.focusWrapper));
        this.addDestroyFunc(() => {
            if (contextMenu.isAlive()) {
                this.destroyBean(contextMenu);
            }
        });
    }
    handleKeyDown(e) {
        if (e.key === core_1.KeyCode.SPACE) {
            e.preventDefault();
            if (this.isSelectable()) {
                this.onSelectAllChanged(!this.isSelected());
            }
        }
    }
    onLabelClicked() {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) {
            return;
        }
        const nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    }
    onCheckboxChanged(event) {
        this.onChangeCommon(event.selected);
    }
    onChangeCommon(nextState) {
        // ignore lock visible columns
        if (this.cbSelect.isReadOnly()) {
            return;
        }
        this.refreshAriaLabel();
        // only want to action if the user clicked the checkbox, not if we are setting the checkbox because
        // of a change in the model
        if (this.processingColumnStateChange) {
            return;
        }
        this.modelItemUtils.setColumn(this.column, nextState, 'toolPanelUi');
    }
    refreshAriaLabel() {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const columnLabel = translate('ariaColumn', 'Column');
        const state = this.cbSelect.getValue() ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden');
        const visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        core_1._.setAriaLabel(this.focusWrapper, `${this.displayName} ${columnLabel}`);
        this.cbSelect.setInputAriaLabel(`${visibilityLabel} (${state})`);
        core_1._.setAriaDescribedBy(this.focusWrapper, this.cbSelect.getInputElement().id);
    }
    setupDragging() {
        if (!this.allowDragging) {
            core_1._.setDisplayed(this.eDragHandle, false);
            return;
        }
        const dragSource = {
            type: core_1.DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            dragItemName: this.displayName,
            getDragItem: () => this.createDragItem(),
            onDragStarted: () => {
                const event = {
                    type: core_1.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
                    column: this.column
                };
                this.eventService.dispatchEvent(event);
            },
            onDragStopped: () => {
                const event = {
                    type: core_1.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END
                };
                this.eventService.dispatchEvent(event);
            }
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }
    createDragItem() {
        const visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }
    onColumnStateChanged() {
        this.processingColumnStateChange = true;
        const isPivotMode = this.columnModel.isPivotMode();
        if (isPivotMode) {
            // if reducing, checkbox means column is one of pivot, value or group
            const anyFunctionActive = this.column.isAnyFunctionActive();
            this.cbSelect.setValue(anyFunctionActive);
        }
        else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setValue(this.column.isVisible());
        }
        let canBeToggled = true;
        let canBeDragged = true;
        if (isPivotMode) {
            // when in pivot mode, the item should be read only if:
            //  a) gui is not allowed make any changes
            const functionsReadOnly = this.gridOptionsWrapper.isFunctionsReadOnly();
            //  b) column is not allow any functions on it
            const noFunctionsAllowed = !this.column.isAnyFunctionAllowed();
            canBeToggled = !functionsReadOnly && !noFunctionsAllowed;
            canBeDragged = canBeToggled;
        }
        else {
            const { enableRowGroup, enableValue, lockPosition, suppressMovable, lockVisible } = this.column.getColDef();
            const forceDraggable = !!enableRowGroup || !!enableValue;
            const disableDraggable = !!lockPosition || !!suppressMovable;
            canBeToggled = !lockVisible;
            canBeDragged = forceDraggable || !disableDraggable;
        }
        this.cbSelect.setReadOnly(!canBeToggled);
        this.eDragHandle.classList.toggle('ag-column-select-column-readonly', !canBeDragged);
        this.addOrRemoveCssClass('ag-column-select-column-readonly', !canBeDragged && !canBeToggled);
        const checkboxPassive = isPivotMode && this.gridOptionsWrapper.isFunctionsPassive();
        this.cbSelect.setPassive(checkboxPassive);
        this.processingColumnStateChange = false;
    }
    getDisplayName() {
        return this.displayName;
    }
    onSelectAllChanged(value) {
        if (value !== this.cbSelect.getValue()) {
            if (!this.cbSelect.isReadOnly()) {
                this.cbSelect.toggle();
            }
        }
    }
    isSelected() {
        return this.cbSelect.getValue();
    }
    isSelectable() {
        return !this.cbSelect.isReadOnly();
    }
    isExpandable() {
        return false;
    }
    setExpanded(value) {
        console.warn('AG Grid: can not expand a column item that does not represent a column group header');
    }
}
ToolPanelColumnComp.TEMPLATE = `<div class="ag-column-select-column" aria-hidden="true">
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-select-column-label" ref="eLabel"></span>
        </div>`;
__decorate([
    core_1.Autowired('columnModel')
], ToolPanelColumnComp.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('dragAndDropService')
], ToolPanelColumnComp.prototype, "dragAndDropService", void 0);
__decorate([
    core_1.Autowired('modelItemUtils')
], ToolPanelColumnComp.prototype, "modelItemUtils", void 0);
__decorate([
    core_1.RefSelector('eLabel')
], ToolPanelColumnComp.prototype, "eLabel", void 0);
__decorate([
    core_1.RefSelector('cbSelect')
], ToolPanelColumnComp.prototype, "cbSelect", void 0);
__decorate([
    core_1.PostConstruct
], ToolPanelColumnComp.prototype, "init", null);
exports.ToolPanelColumnComp = ToolPanelColumnComp;
//# sourceMappingURL=toolPanelColumnComp.js.map