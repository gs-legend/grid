"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FpsCounter {
    constructor(parent, document = window.document) {
        this.fps = 0;
        this.minFps = Infinity;
        this.maxFps = 0;
        this.pastFps = []; // A queue of recent FPS values.
        // Number of recent FPS values to keep for average FPS calculation.
        this.maxPastFps = 10;
        this.lastSecond = performance.now();
        if (parent) {
            const el = document.createElement('div');
            el.style.opacity = '0.8';
            el.style.padding = '5px';
            el.style.color = 'black';
            el.style.backgroundColor = 'white';
            parent.appendChild(el);
            this.fpsElement = el;
        }
    }
    countFrame() {
        const now = performance.now();
        const fps = this.fps++;
        const pastFps = this.pastFps;
        if (now - this.lastSecond >= 1000) {
            if (fps > this.maxFps) {
                this.maxFps = fps;
            }
            if (fps < this.minFps) {
                this.minFps = fps;
            }
            pastFps.push(this.fps);
            const n = pastFps.length;
            let totalFrames = 0;
            for (let i = 0; i < n; i++) {
                totalFrames += pastFps[i];
            }
            const avgFps = totalFrames / n;
            if (n >= this.maxPastFps) {
                pastFps.shift();
            }
            if (this.fpsElement) {
                this.fpsElement.innerText = `FPS: ${fps}\nAvg: ${avgFps.toFixed(1)} (${n} seconds)\nMin: ${this.minFps}\nMax: ${this.maxFps}`;
            }
            else {
                console.log(`FPS: ${fps}, Avg: ${avgFps}, Min: ${this.minFps}, Max: ${this.maxFps}`);
            }
            this.fps = 0;
            this.lastSecond = now;
        }
    }
}
exports.FpsCounter = FpsCounter;
//# sourceMappingURL=fpsCounter.js.map