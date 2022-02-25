"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hdpiCanvas_1 = require("../canvas/hdpiCanvas");
const id_1 = require("../util/id");
class Scene {
    // As a rule of thumb, constructors with no parameters are preferred.
    // A few exceptions are:
    // - we absolutely need to know something at construction time (document)
    // - knowing something at construction time meaningfully improves performance (width, height)
    constructor(document = window.document, width, height) {
        this.id = id_1.createId(this);
        this._dirty = false;
        this.animationFrameId = 0;
        this._root = null;
        this.debug = {
            renderFrameIndex: false,
            renderBoundingBoxes: false
        };
        this._frameIndex = 0;
        this.render = () => {
            const { ctx, root, pendingSize } = this;
            this.animationFrameId = 0;
            if (pendingSize) {
                this.canvas.resize(...pendingSize);
                this.pendingSize = undefined;
            }
            if (root && !root.visible) {
                this.dirty = false;
                return;
            }
            // start with a blank canvas, clear previous drawing
            ctx.clearRect(0, 0, this.width, this.height);
            if (root) {
                ctx.save();
                if (root.visible) {
                    root.render(ctx);
                }
                ctx.restore();
            }
            this._frameIndex++;
            if (this.debug.renderFrameIndex) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, 40, 15);
                ctx.fillStyle = 'black';
                ctx.fillText(this.frameIndex.toString(), 2, 10);
            }
            this.dirty = false;
        };
        this.canvas = new hdpiCanvas_1.HdpiCanvas(document, width, height);
        this.ctx = this.canvas.context;
    }
    set container(value) {
        this.canvas.container = value;
    }
    get container() {
        return this.canvas.container;
    }
    download(fileName) {
        this.canvas.download(fileName);
    }
    getDataURL(type) {
        return this.canvas.getDataURL(type);
    }
    get width() {
        return this.pendingSize ? this.pendingSize[0] : this.canvas.width;
    }
    get height() {
        return this.pendingSize ? this.pendingSize[1] : this.canvas.height;
    }
    resize(width, height) {
        width = Math.round(width);
        height = Math.round(height);
        if (width === this.width && height === this.height) {
            return;
        }
        this.pendingSize = [width, height];
        this.dirty = true;
    }
    set dirty(dirty) {
        if (dirty && !this._dirty) {
            this.animationFrameId = requestAnimationFrame(this.render);
        }
        this._dirty = dirty;
    }
    get dirty() {
        return this._dirty;
    }
    cancelRender() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = 0;
            this._dirty = false;
        }
    }
    set root(node) {
        if (node === this._root) {
            return;
        }
        if (this._root) {
            this._root._setScene();
        }
        this._root = node;
        if (node) {
            // If `node` is the root node of another scene ...
            if (node.parent === null && node.scene && node.scene !== this) {
                node.scene.root = null;
            }
            node._setScene(this);
        }
        this.dirty = true;
    }
    get root() {
        return this._root;
    }
    appendPath(path) {
        const ctx = this.ctx;
        const commands = path.commands;
        const params = path.params;
        const n = commands.length;
        let j = 0;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            switch (commands[i]) {
                case 'M':
                    ctx.moveTo(params[j++], params[j++]);
                    break;
                case 'L':
                    ctx.lineTo(params[j++], params[j++]);
                    break;
                case 'C':
                    ctx.bezierCurveTo(params[j++], params[j++], params[j++], params[j++], params[j++], params[j++]);
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
            }
        }
    }
    get frameIndex() {
        return this._frameIndex;
    }
}
exports.Scene = Scene;
Scene.className = 'Scene';
//# sourceMappingURL=scene.js.map