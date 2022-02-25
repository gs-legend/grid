"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const partialStore_1 = require("./partialStore");
const fullStore_1 = require("./fullStore");
let StoreFactory = class StoreFactory {
    createStore(ssrmParams, parentNode) {
        const storeParams = this.getStoreParams(ssrmParams, parentNode);
        const CacheClass = storeParams.storeType === 'partial' ? partialStore_1.PartialStore : fullStore_1.FullStore;
        return new CacheClass(ssrmParams, storeParams, parentNode);
    }
    getStoreParams(ssrmParams, parentNode) {
        const userStoreParams = this.getLevelSpecificParams(parentNode);
        // if user provided overrideParams, we take storeType from there if it exists
        const storeType = this.getStoreType(userStoreParams);
        const cacheBlockSize = this.getBlockSize(storeType, userStoreParams);
        const maxBlocksInCache = this.getMaxBlocksInCache(storeType, ssrmParams, userStoreParams);
        const storeParams = {
            storeType,
            cacheBlockSize,
            maxBlocksInCache
        };
        return storeParams;
    }
    getMaxBlocksInCache(storeType, ssrmParams, userStoreParams) {
        if (storeType == 'full') {
            return undefined;
        }
        const maxBlocksInCache = (userStoreParams && userStoreParams.maxBlocksInCache != null)
            ? userStoreParams.maxBlocksInCache
            : this.gridOptionsWrapper.getMaxBlocksInCache();
        const maxBlocksActive = maxBlocksInCache != null && maxBlocksInCache >= 0;
        if (!maxBlocksActive) {
            return undefined;
        }
        if (ssrmParams.dynamicRowHeight) {
            const message = 'AG Grid: Server Side Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.';
            core_1._.doOnce(() => console.warn(message), 'storeFactory.maxBlocksInCache.dynamicRowHeight');
            return undefined;
        }
        if (this.columnModel.isAutoRowHeightActive()) {
            const message = 'AG Grid: Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.';
            core_1._.doOnce(() => console.warn(message), 'storeFactory.maxBlocksInCache.autoRowHeightActive');
            return undefined;
        }
        return maxBlocksInCache;
    }
    getBlockSize(storeType, userStoreParams) {
        if (storeType == 'full') {
            return undefined;
        }
        const blockSize = (userStoreParams && userStoreParams.cacheBlockSize != null)
            ? userStoreParams.cacheBlockSize
            : this.gridOptionsWrapper.getCacheBlockSize();
        if (blockSize != null && blockSize > 0) {
            return blockSize;
        }
        else {
            return 100;
        }
    }
    getLevelSpecificParams(parentNode) {
        const callback = this.gridOptionsWrapper.getServerSideStoreParamsFunc();
        if (!callback) {
            return undefined;
        }
        const params = {
            level: parentNode.level + 1,
            parentRowNode: parentNode.level >= 0 ? parentNode : undefined,
            rowGroupColumns: this.columnModel.getRowGroupColumns(),
            pivotColumns: this.columnModel.getPivotColumns(),
            pivotMode: this.columnModel.isPivotMode()
        };
        return callback(params);
    }
    getStoreType(storeParams) {
        const storeType = (storeParams && storeParams.storeType != null)
            ? storeParams.storeType
            : this.gridOptionsWrapper.getServerSideStoreType();
        switch (storeType) {
            case 'partial':
            case 'full':
                return storeType;
            case null:
            case undefined:
                return 'full';
            default:
                const serverTypes = ['full', 'partial'];
                const types = serverTypes.join(', ');
                console.warn(`AG Grid: invalid Server Side Store Type ${storeType}, valid types are [${types}]`);
                return 'partial';
        }
    }
};
__decorate([
    core_1.Autowired('gridOptionsWrapper')
], StoreFactory.prototype, "gridOptionsWrapper", void 0);
__decorate([
    core_1.Autowired('columnModel')
], StoreFactory.prototype, "columnModel", void 0);
StoreFactory = __decorate([
    core_1.Bean('ssrmStoreFactory')
], StoreFactory);
exports.StoreFactory = StoreFactory;
//# sourceMappingURL=storeFactory.js.map