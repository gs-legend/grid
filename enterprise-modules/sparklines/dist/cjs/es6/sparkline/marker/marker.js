"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("../../scene/shape/shape");
class Marker extends shape_1.Shape {
    constructor() {
        super(...arguments);
        this._x = 0;
        this._y = 0;
        this._size = 3;
    }
    set x(value) {
        if (this._x !== value) {
            this._x = value;
            this.dirty = true;
        }
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y !== value) {
            this._y = value;
            this.dirty = true;
        }
    }
    get y() {
        return this._y;
    }
    set size(value) {
        if (this._size !== value) {
            this._size = value;
            this.dirty = true;
        }
    }
    get size() {
        return this._size;
    }
}
exports.Marker = Marker;
//# sourceMappingURL=marker.js.map