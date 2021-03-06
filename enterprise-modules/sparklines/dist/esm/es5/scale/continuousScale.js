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
import interpolateValue from "../interpolate/value";
import interpolateNumber from "../interpolate/number";
export var constant = function (x) { return function () { return x; }; };
export var identity = function (x) { return x; };
function clamper(domain) {
    var _a;
    var a = domain[0];
    var b = domain[domain.length - 1];
    if (a > b) {
        _a = __read([b, a], 2), a = _a[0], b = _a[1];
    }
    return function (x) { return Math.max(a, Math.min(b, x)); };
}
var ContinuousScale = /** @class */ (function () {
    function ContinuousScale() {
        /**
         * The output value of the scale for `undefined` or `NaN` input values.
         */
        this.unknown = undefined;
        this._clamp = identity;
        this._domain = [0, 1];
        this._range = [0, 1];
        this.transform = identity; // transforms domain value
        this.untransform = identity; // untransforms domain value
        this._interpolate = interpolateValue;
        this.rescale();
    }
    Object.defineProperty(ContinuousScale.prototype, "clamp", {
        get: function () {
            return this._clamp !== identity;
        },
        set: function (value) {
            this._clamp = value ? clamper(this.domain) : identity;
        },
        enumerable: true,
        configurable: true
    });
    ContinuousScale.prototype.setDomain = function (values) {
        this._domain = Array.prototype.map.call(values, function (v) { return +v; });
        if (this._clamp !== identity) {
            this._clamp = clamper(this.domain);
        }
        this.rescale();
    };
    ContinuousScale.prototype.getDomain = function () {
        return this._domain.slice();
    };
    Object.defineProperty(ContinuousScale.prototype, "domain", {
        get: function () {
            return this.getDomain();
        },
        set: function (values) {
            this.setDomain(values);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContinuousScale.prototype, "range", {
        get: function () {
            return this._range.slice();
        },
        set: function (values) {
            this._range = Array.prototype.slice.call(values);
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContinuousScale.prototype, "interpolate", {
        get: function () {
            return this._interpolate;
        },
        set: function (value) {
            this._interpolate = value;
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    ContinuousScale.prototype.rescale = function () {
        this.piecewise = this.bimap;
        this.output = undefined;
        this.input = undefined;
    };
    /**
     * Returns a function that converts `x` in `[a, b]` to `t` in `[0, 1]`. Non-clamping.
     * @param a
     * @param b
     */
    ContinuousScale.prototype.normalize = function (a, b) {
        return (b -= (a = +a))
            ? function (x) { return (x - a) / b; }
            : constant(isNaN(b) ? NaN : 0.5);
    };
    ContinuousScale.prototype.bimap = function (domain, range, interpolate) {
        var x0 = domain[0];
        var x1 = domain[1];
        var y0 = range[0];
        var y1 = range[1];
        var xt;
        var ty;
        if (x1 < x0) {
            xt = this.normalize(x1, x0);
            ty = interpolate(y1, y0);
        }
        else {
            xt = this.normalize(x0, x1);
            ty = interpolate(y0, y1);
        }
        return function (x) { return ty(xt(x)); }; // domain value x --> t in [0, 1] --> range value y
    };
    ContinuousScale.prototype.convert = function (x) {
        x = +x;
        if (isNaN(x)) {
            return this.unknown;
        }
        else {
            if (!this.output) {
                this.output = this.piecewise(this.domain.map(this.transform), this.range, this.interpolate);
            }
            return this.output(this.transform(this._clamp(x)));
        }
    };
    ContinuousScale.prototype.invert = function (y) {
        if (!this.input) {
            this.input = this.piecewise(this.range, this.domain.map(this.transform), interpolateNumber);
        }
        return this._clamp(this.untransform(this.input(y)));
    };
    return ContinuousScale;
}());
export default ContinuousScale;
//# sourceMappingURL=continuousScale.js.map