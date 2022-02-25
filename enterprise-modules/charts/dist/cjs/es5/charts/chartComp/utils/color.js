"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
function hexToRGBA(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return alpha ? "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")" : "rgba(" + r + ", " + g + ", " + b + ")";
}
exports.hexToRGBA = hexToRGBA;
function changeOpacity(fills, alpha) {
    return fills.map(function (fill) {
        var c = core_1.Color.fromString(fill);
        return new core_1.Color(c.r, c.g, c.b, alpha).toHexString();
    });
}
exports.changeOpacity = changeOpacity;
//# sourceMappingURL=color.js.map