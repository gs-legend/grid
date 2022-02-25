var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { getExcelColumnName } from '../../assets/excelUtils';
import cellFactory from './cell';
var addEmptyCells = function (cells, rowIdx) {
    var mergeMap = [];
    var posCounter = 0;
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (cell.mergeAcross) {
            mergeMap.push({
                pos: i,
                excelPos: posCounter
            });
            posCounter += cell.mergeAcross;
        }
        posCounter++;
    }
    if (mergeMap.length) {
        for (var i = mergeMap.length - 1; i >= 0; i--) {
            var mergedCells = [];
            var cell = cells[mergeMap[i].pos];
            for (var j = 1; j <= cell.mergeAcross; j++) {
                mergedCells.push({
                    ref: "" + getExcelColumnName(mergeMap[i].excelPos + 1 + j) + (rowIdx + 1),
                    styleId: cell.styleId,
                    data: { type: 'empty', value: null }
                });
            }
            if (mergedCells.length) {
                cells.splice.apply(cells, __spread([mergeMap[i].pos + 1, 0], mergedCells));
            }
        }
    }
};
var shouldDisplayCell = function (cell) { return cell.data.value !== '' || cell.styleId !== undefined; };
var rowFactory = {
    getTemplate: function (config, idx, currentSheet) {
        var index = config.index, collapsed = config.collapsed, hidden = config.hidden, height = config.height, s = config.s, _a = config.cells, cells = _a === void 0 ? [] : _a;
        addEmptyCells(cells, idx);
        var children = cells.filter(shouldDisplayCell).map(function (cell, idx) { return cellFactory.getTemplate(cell, idx, currentSheet); });
        return {
            name: "row",
            properties: {
                rawMap: {
                    r: index,
                    collapsed: collapsed,
                    hidden: hidden ? '1' : '0',
                    ht: height,
                    customHeight: height != null ? '1' : '0',
                    s: s,
                    customFormat: s != null ? '1' : '0'
                }
            },
            children: children
        };
    }
};
export default rowFactory;
//# sourceMappingURL=row.js.map