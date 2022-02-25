"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const excelXmlFactory_1 = require("./excelXmlFactory");
const baseExcelSerializingSession_1 = require("./baseExcelSerializingSession");
class ExcelXmlSerializingSession extends baseExcelSerializingSession_1.BaseExcelSerializingSession {
    createExcel(data) {
        return excelXmlFactory_1.ExcelXmlFactory.createExcel(this.excelStyles, data);
    }
    getDataTypeForValue(valueForCell) {
        return core_1._.isNumeric(valueForCell) ? 'Number' : 'String';
    }
    getType(type, style, value) {
        if (this.isFormula(value)) {
            return 'Formula';
        }
        if (style && style.dataType) {
            switch (style.dataType.toLocaleLowerCase()) {
                case 'string':
                    return 'Formula';
                case 'number':
                    return 'Number';
                case 'datetime':
                    return 'DateTime';
                case 'error':
                    return 'Error';
                case 'boolean':
                    return 'Boolean';
                default:
                    console.warn(`AG Grid: Unrecognized data type for excel export [${style.id}.dataType=${style.dataType}]`);
            }
        }
        return type;
    }
    addImage() {
        return;
    }
    createCell(styleId, type, value) {
        const actualStyle = this.getStyleById(styleId);
        const typeTransformed = (this.getType(type, actualStyle, value) || type);
        return {
            styleId: !!actualStyle ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: this.getValueTransformed(typeTransformed, value)
            }
        };
    }
    getValueTransformed(typeTransformed, value) {
        const wrapText = (val) => {
            if (this.config.suppressTextAsCDATA) {
                return core_1._.escapeString(val);
            }
            const cdataStart = '<![CDATA[';
            const cdataEnd = ']]>';
            const cdataEndRegex = new RegExp(cdataEnd, "g");
            return cdataStart
                // CDATA sections are closed by the character sequence ']]>' and there is no
                // way of escaping this, so if the text contains the offending sequence, emit
                // multiple CDATA sections and split the characters between them.
                + String(val).replace(cdataEndRegex, ']]' + cdataEnd + cdataStart + '>')
                + cdataEnd;
        };
        const convertBoolean = (val) => {
            if (!val || val === '0' || val === 'false') {
                return '0';
            }
            return '1';
        };
        switch (typeTransformed) {
            case 'String':
                return wrapText(value);
            case 'Number':
                return Number(value).valueOf() + '';
            case 'Boolean':
                return convertBoolean(value);
            default:
                return value;
        }
    }
    createMergedCell(styleId, type, value, numOfCells) {
        return {
            styleId: !!this.getStyleById(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    }
}
exports.ExcelXmlSerializingSession = ExcelXmlSerializingSession;
//# sourceMappingURL=excelXmlSerializingSession.js.map