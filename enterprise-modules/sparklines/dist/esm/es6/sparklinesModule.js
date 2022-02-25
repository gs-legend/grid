import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { SparklineCellRenderer } from './sparklineCellRenderer';
import { SparklineTooltipSingleton } from './tooltip/sparklineTooltipSingleton';
export const SparklinesModule = {
    moduleName: ModuleNames.SparklinesModule,
    beans: [SparklineTooltipSingleton],
    userComponents: [{ componentName: 'agSparklineCellRenderer', componentClass: SparklineCellRenderer }],
    dependantModules: [EnterpriseCoreModule],
};
//# sourceMappingURL=sparklinesModule.js.map