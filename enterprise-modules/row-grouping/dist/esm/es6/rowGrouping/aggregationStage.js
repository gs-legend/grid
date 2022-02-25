var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, BeanStub, Autowired, _ } from "@ag-grid-community/core";
let AggregationStage = class AggregationStage extends BeanStub {
    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    execute(params) {
        // if changed path is active, it means we came from a) change detection or b) transaction update.
        // for both of these, if no value columns are present, it means there is nothing to aggregate now
        // and there is no cleanup to be done (as value columns don't change between transactions or change
        // detections). if no value columns and no changed path, means we have to go through all nodes in
        // case we need to clean up agg data from before.
        const noValueColumns = _.missingOrEmpty(this.columnModel.getValueColumns());
        const noUserAgg = !this.gridOptionsWrapper.getGroupRowAggNodesFunc();
        const changedPathActive = params.changedPath && params.changedPath.isActive();
        if (noValueColumns && noUserAgg && changedPathActive) {
            return;
        }
        const aggDetails = this.createAggDetails(params);
        this.recursivelyCreateAggData(aggDetails);
    }
    createAggDetails(params) {
        const pivotActive = this.columnModel.isPivotActive();
        const measureColumns = this.columnModel.getValueColumns();
        const pivotColumns = pivotActive ? this.columnModel.getPivotColumns() : [];
        const aggDetails = {
            changedPath: params.changedPath,
            valueColumns: measureColumns,
            pivotColumns: pivotColumns
        };
        return aggDetails;
    }
    recursivelyCreateAggData(aggDetails) {
        // update prop, in case changed since last time
        this.filteredOnly = !this.gridOptionsWrapper.isSuppressAggFilteredOnly();
        const callback = (rowNode) => {
            const hasNoChildren = !rowNode.hasChildren();
            if (hasNoChildren) {
                // this check is needed for TreeData, in case the node is no longer a child,
                // but it was a child previously.
                if (rowNode.aggData) {
                    rowNode.setAggData(null);
                }
                // never agg data for leaf nodes
                return;
            }
            //Optionally prevent the aggregation at the root Node
            //https://ag-grid.atlassian.net/browse/AG-388
            const isRootNode = rowNode.level === -1;
            if (isRootNode) {
                const notPivoting = !this.columnModel.isPivotMode();
                const suppressAggAtRootLevel = this.gridOptionsWrapper.isSuppressAggAtRootLevel();
                if (suppressAggAtRootLevel && notPivoting) {
                    return;
                }
            }
            this.aggregateRowNode(rowNode, aggDetails);
        };
        aggDetails.changedPath.forEachChangedNodeDepthFirst(callback, true);
    }
    aggregateRowNode(rowNode, aggDetails) {
        const measureColumnsMissing = aggDetails.valueColumns.length === 0;
        const pivotColumnsMissing = aggDetails.pivotColumns.length === 0;
        const userFunc = this.gridOptionsWrapper.getGroupRowAggNodesFunc();
        let aggResult;
        if (userFunc) {
            aggResult = userFunc(rowNode.childrenAfterFilter);
        }
        else if (measureColumnsMissing) {
            aggResult = null;
        }
        else if (pivotColumnsMissing) {
            aggResult = this.aggregateRowNodeUsingValuesOnly(rowNode, aggDetails);
        }
        else {
            aggResult = this.aggregateRowNodeUsingValuesAndPivot(rowNode);
        }
        rowNode.setAggData(aggResult);
        // if we are grouping, then it's possible there is a sibling footer
        // to the group, so update the data here also if there is one
        if (rowNode.sibling) {
            rowNode.sibling.setAggData(aggResult);
        }
    }
    aggregateRowNodeUsingValuesAndPivot(rowNode) {
        const result = {};
        const pivotColumnDefs = this.pivotStage.getPivotColumnDefs();
        // Step 1: process value columns
        pivotColumnDefs
            .filter(v => !_.exists(v.pivotTotalColumnIds)) // only process pivot value columns
            .forEach(valueColDef => {
            const keys = valueColDef.pivotKeys || [];
            let values;
            const valueColumn = valueColDef.pivotValueColumn;
            const colId = valueColDef.colId;
            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                values = this.getValuesFromMappedSet(rowNode.childrenMapped, keys, valueColumn);
            }
            else {
                // value columns and pivot columns, non-leaf group
                values = this.getValuesPivotNonLeaf(rowNode, colId);
            }
            result[colId] = this.aggregateValues(values, valueColumn.getAggFunc(), valueColumn, rowNode);
        });
        // Step 2: process total columns
        pivotColumnDefs
            .filter(v => _.exists(v.pivotTotalColumnIds)) // only process pivot total columns
            .forEach(totalColDef => {
            const aggResults = [];
            const { pivotValueColumn, pivotTotalColumnIds, colId } = totalColDef;
            //retrieve results for colIds associated with this pivot total column
            if (!pivotTotalColumnIds || !pivotTotalColumnIds.length) {
                return;
            }
            pivotTotalColumnIds.forEach((currentColId) => {
                aggResults.push(result[currentColId]);
            });
            result[colId] = this.aggregateValues(aggResults, pivotValueColumn.getAggFunc(), pivotValueColumn, rowNode);
        });
        return result;
    }
    aggregateRowNodeUsingValuesOnly(rowNode, aggDetails) {
        const result = {};
        const changedValueColumns = aggDetails.changedPath.isActive() ?
            aggDetails.changedPath.getValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : aggDetails.valueColumns;
        const notChangedValueColumns = aggDetails.changedPath.isActive() ?
            aggDetails.changedPath.getNotValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : null;
        const values2d = this.getValuesNormal(rowNode, changedValueColumns);
        const oldValues = rowNode.aggData;
        changedValueColumns.forEach((valueColumn, index) => {
            result[valueColumn.getId()] = this.aggregateValues(values2d[index], valueColumn.getAggFunc(), valueColumn, rowNode);
        });
        if (notChangedValueColumns && oldValues) {
            notChangedValueColumns.forEach((valueColumn) => {
                result[valueColumn.getId()] = oldValues[valueColumn.getId()];
            });
        }
        return result;
    }
    getValuesPivotNonLeaf(rowNode, colId) {
        const values = [];
        rowNode.childrenAfterFilter.forEach((node) => {
            const value = node.aggData[colId];
            values.push(value);
        });
        return values;
    }
    getValuesFromMappedSet(mappedSet, keys, valueColumn) {
        let mapPointer = mappedSet;
        keys.forEach(key => (mapPointer = mapPointer ? mapPointer[key] : null));
        if (!mapPointer) {
            return [];
        }
        const values = [];
        mapPointer.forEach((rowNode) => {
            const value = this.valueService.getValue(valueColumn, rowNode);
            values.push(value);
        });
        return values;
    }
    getValuesNormal(rowNode, valueColumns) {
        // create 2d array, of all values for all valueColumns
        const values = [];
        valueColumns.forEach(() => values.push([]));
        const valueColumnCount = valueColumns.length;
        const nodeList = this.filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup;
        const rowCount = nodeList.length;
        for (let i = 0; i < rowCount; i++) {
            const childNode = nodeList[i];
            for (let j = 0; j < valueColumnCount; j++) {
                const valueColumn = valueColumns[j];
                // if the row is a group, then it will only have an agg result value,
                // which means valueGetter is never used.
                const value = this.valueService.getValue(valueColumn, childNode);
                values[j].push(value);
            }
        }
        return values;
    }
    aggregateValues(values, aggFuncOrString, column, rowNode) {
        const aggFunc = typeof aggFuncOrString === 'string' ?
            this.aggFuncService.getAggFunc(aggFuncOrString) :
            aggFuncOrString;
        if (typeof aggFunc !== 'function') {
            console.error(`AG Grid: unrecognised aggregation function ${aggFuncOrString}`);
            return null;
        }
        const deprecationWarning = () => {
            _.doOnce(() => {
                console.warn('AG Grid: since v24.0, custom aggregation functions take a params object. Please alter your aggregation function to use params.values');
            }, 'aggregationStage.aggregateValues Deprecation');
        };
        const aggFuncAny = aggFunc;
        const params = {
            values: values,
            column: column,
            colDef: column ? column.getColDef() : undefined,
            rowNode: rowNode,
            data: rowNode ? rowNode.data : undefined,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext(),
            // the three things below are for logging warning messages in case anyone is treating
            // the params object as an array. in previous grid versions, we didn't pass params object,
            // but passed values array instead.
            forEach: (callback, thisArg) => {
                deprecationWarning();
                return values.forEach(callback, thisArg);
            },
            get length() {
                deprecationWarning();
                return values.length;
            },
            set length(val) {
                deprecationWarning();
                values.length = val;
            }
        }; // the "as any" is needed to allow the deprecation warning messages
        return aggFuncAny(params);
    }
};
__decorate([
    Autowired('columnModel')
], AggregationStage.prototype, "columnModel", void 0);
__decorate([
    Autowired('valueService')
], AggregationStage.prototype, "valueService", void 0);
__decorate([
    Autowired('pivotStage')
], AggregationStage.prototype, "pivotStage", void 0);
__decorate([
    Autowired('aggFuncService')
], AggregationStage.prototype, "aggFuncService", void 0);
__decorate([
    Autowired('gridApi')
], AggregationStage.prototype, "gridApi", void 0);
__decorate([
    Autowired('columnApi')
], AggregationStage.prototype, "columnApi", void 0);
AggregationStage = __decorate([
    Bean('aggregationStage')
], AggregationStage);
export { AggregationStage };
//# sourceMappingURL=aggregationStage.js.map