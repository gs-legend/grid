import { MiniDoughnut } from "./miniDoughnut";
import { ChartType } from "@ag-grid-community/core";
export declare class MiniPie extends MiniDoughnut {
    static chartType: ChartType;
    constructor(container: HTMLElement, fills: string[], strokes: string[]);
}
