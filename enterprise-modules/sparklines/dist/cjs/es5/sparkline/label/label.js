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
var text_1 = require("../../scene/shape/text");
var observable_1 = require("../../util/observable");
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label() {
        var _this = _super.call(this) || this;
        _this.enabled = true;
        _this.fontSize = 8;
        _this.fontFamily = 'Verdana, sans-serif';
        _this.color = 'rgba(70, 70, 70, 1)';
        return _this;
    }
    Label.prototype.getFont = function () {
        return text_1.getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    };
    __decorate([
        observable_1.reactive('change', 'dataChange')
    ], Label.prototype, "enabled", void 0);
    __decorate([
        observable_1.reactive('change')
    ], Label.prototype, "fontSize", void 0);
    __decorate([
        observable_1.reactive('change')
    ], Label.prototype, "fontFamily", void 0);
    __decorate([
        observable_1.reactive('change')
    ], Label.prototype, "fontStyle", void 0);
    __decorate([
        observable_1.reactive('change')
    ], Label.prototype, "fontWeight", void 0);
    __decorate([
        observable_1.reactive('change')
    ], Label.prototype, "color", void 0);
    return Label;
}(observable_1.Observable));
exports.Label = Label;
//# sourceMappingURL=label.js.map