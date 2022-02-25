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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { _, Autowired, BeanStub, Events, NumberSequence, PostConstruct, PreDestroy, Qualifier, ServerSideTransactionResultStatus } from "@ag-grid-community/core";
import { PartialStoreBlock } from "../blocks/partialStoreBlock";
var FindResult;
(function (FindResult) {
    FindResult[FindResult["FOUND"] = 0] = "FOUND";
    FindResult[FindResult["CONTINUE_FIND"] = 1] = "CONTINUE_FIND";
    FindResult[FindResult["BREAK_FIND"] = 2] = "BREAK_FIND";
})(FindResult || (FindResult = {}));
var PartialStore = /** @class */ (function (_super) {
    __extends(PartialStore, _super);
    function PartialStore(ssrmParams, storeParams, parentRowNode) {
        var _this = _super.call(this) || this;
        _this.blocks = {};
        _this.blockHeights = {};
        _this.lastRowIndexKnown = false;
        // this will always be zero for the top level cache only,
        // all the other ones change as the groups open and close
        _this.displayIndexStart = 0;
        _this.displayIndexEnd = 0; // not sure if setting this one to zero is necessary
        _this.cacheTopPixel = 0;
        _this.info = {};
        _this.ssrmParams = ssrmParams;
        _this.storeParams = storeParams;
        _this.parentRowNode = parentRowNode;
        _this.rowCount = PartialStore.INITIAL_ROW_COUNT;
        return _this;
    }
    PartialStore.prototype.postConstruct = function () {
        this.defaultRowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
    };
    PartialStore.prototype.destroyAllBlocks = function () {
        var _this = this;
        this.getBlocksInOrder().forEach(function (block) { return _this.destroyBlock(block); });
    };
    PartialStore.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ServerSideCache');
    };
    PartialStore.prototype.getRowCount = function () {
        return this.rowCount;
    };
    PartialStore.prototype.isLastRowIndexKnown = function () {
        return this.lastRowIndexKnown;
    };
    PartialStore.prototype.retryLoads = function () {
        this.getBlocksInOrder().forEach(function (block) { return block.retryLoads(); });
    };
    PartialStore.prototype.onBlockLoadFailed = function (block) {
        block.setData([], true);
        this.fireCacheUpdatedEvent();
    };
    PartialStore.prototype.onBlockLoaded = function (block, params) {
        this.logger.log("onPageLoaded: page = " + block.getId() + ", lastRow = " + params.rowCount);
        if (params.storeInfo) {
            Object.assign(this.info, params.storeInfo);
        }
        if (!params.rowData) {
            var message_1 = 'AG Grid: "params.rowData" is missing from Server-Side Row Model success() callback. Please use the "rowData" attribute. If no data is returned, set an empty list.';
            _.doOnce(function () { return console.warn(message_1, params); }, 'InfiniteStore.noData');
        }
        var finalRowCount = params.rowCount != null && params.rowCount >= 0 ? params.rowCount : undefined;
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isAlive()) {
            return;
        }
        this.checkRowCount(block, finalRowCount);
        block.setData(params.rowData);
        // if the virtualRowCount is shortened, then it's possible blocks exist that are no longer
        // in the valid range. so we must remove these. this can happen if the datasource returns a
        // result and sets lastRow to something less than virtualRowCount (can happen if user scrolls
        // down, server reduces dataset size).
        this.destroyAllBlocksPastVirtualRowCount();
        this.fireCacheUpdatedEvent();
    };
    PartialStore.prototype.purgeBlocksIfNeeded = function (blockToExclude) {
        var _this = this;
        // we exclude checking for the page just created, as this has yet to be accessed and hence
        // the lastAccessed stamp will not be updated for the first time yet
        var blocksForPurging = this.getBlocksInOrder().filter(function (b) { return b != blockToExclude; });
        var lastAccessedComparator = function (a, b) { return b.getLastAccessed() - a.getLastAccessed(); };
        blocksForPurging.sort(lastAccessedComparator);
        // we remove (maxBlocksInCache - 1) as we already excluded the 'just created' page.
        // in other words, after the splice operation below, we have taken out the blocks
        // we want to keep, which means we are left with blocks that we can potentially purge
        var maxBlocksProvided = this.storeParams.maxBlocksInCache > 0;
        var blocksToKeep = maxBlocksProvided ? this.storeParams.maxBlocksInCache - 1 : null;
        var emptyBlocksToKeep = PartialStore.MAX_EMPTY_BLOCKS_TO_KEEP - 1;
        blocksForPurging.forEach(function (block, index) {
            var purgeBecauseBlockEmpty = block.getState() === PartialStoreBlock.STATE_WAITING_TO_LOAD && index >= emptyBlocksToKeep;
            var purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep : false;
            if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {
                // we never purge blocks if they are open, as purging them would mess up with
                // our indexes, it would be very messy to restore the purged block to it's
                // previous state if it had open children.
                if (block.isAnyNodeOpen()) {
                    return;
                }
                // if the block currently has rows been displayed, then don't remove it either.
                // this can happen if user has maxBlocks=2, and blockSize=5 (thus 10 max rows in cache)
                // but the screen is showing 20 rows, so at least 4 blocks are needed.
                if (_this.isBlockCurrentlyDisplayed(block)) {
                    return;
                }
                // don't want to loose keyboard focus, so keyboard navigation can continue. so keep focused blocks.
                if (_this.isBlockFocused(block)) {
                    return;
                }
                // at this point, block is not needed, and no open nodes, so burn baby burn
                _this.destroyBlock(block);
            }
        });
    };
    PartialStore.prototype.isBlockFocused = function (block) {
        var focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        var blockIndexStart = block.getDisplayIndexStart();
        var blockIndexEnd = block.getDisplayIndexEnd();
        if (blockIndexEnd == null || blockIndexStart == null) {
            return false;
        }
        var hasFocus = focusedCell.rowIndex >= blockIndexStart && focusedCell.rowIndex < blockIndexEnd;
        return hasFocus;
    };
    PartialStore.prototype.isBlockCurrentlyDisplayed = function (block) {
        var startIndex = block.getDisplayIndexStart();
        var endIndex = block.getDisplayIndexEnd() - 1;
        return this.rowRenderer.isRangeInRenderedViewport(startIndex, endIndex);
    };
    PartialStore.prototype.removeDuplicateNode = function (id) {
        this.getBlocksInOrder().forEach(function (block) { return block.removeDuplicateNode(id); });
    };
    PartialStore.prototype.checkRowCount = function (block, lastRow) {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.rowCount = lastRow;
            this.lastRowIndexKnown = true;
        }
        else if (!this.lastRowIndexKnown) {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (block.getId() + 1) * this.storeParams.cacheBlockSize;
            var lastRowIndexPlusOverflow = lastRowIndex + PartialStore.OVERFLOW_SIZE;
            if (this.rowCount < lastRowIndexPlusOverflow) {
                this.rowCount = lastRowIndexPlusOverflow;
            }
        }
    };
    PartialStore.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        this.getBlocksInOrder().forEach(function (block) { return block.forEachNodeDeep(callback, sequence); });
    };
    PartialStore.prototype.forEachNodeDeepAfterFilterAndSort = function (callback, sequence) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        this.getBlocksInOrder().forEach(function (block) { return block.forEachNodeAfterFilterAndSort(callback, sequence); });
    };
    PartialStore.prototype.getBlocksInOrder = function () {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        var blockComparator = function (a, b) { return a.getId() - b.getId(); };
        var blocks = _.getAllValuesInObject(this.blocks).sort(blockComparator);
        return blocks;
    };
    PartialStore.prototype.destroyBlock = function (block) {
        delete this.blocks[block.getId()];
        this.destroyBean(block);
        this.rowNodeBlockLoader.removeBlock(block);
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    PartialStore.prototype.fireCacheUpdatedEvent = function () {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        var event = {
            type: Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    };
    PartialStore.prototype.destroyAllBlocksPastVirtualRowCount = function () {
        var _this = this;
        var blocksToDestroy = [];
        this.getBlocksInOrder().forEach(function (block) {
            var startRow = block.getId() * _this.storeParams.cacheBlockSize;
            if (startRow >= _this.rowCount) {
                blocksToDestroy.push(block);
            }
        });
        if (blocksToDestroy.length > 0) {
            blocksToDestroy.forEach(function (block) { return _this.destroyBlock(block); });
        }
    };
    PartialStore.prototype.refreshStore = function (purge) {
        var noBlocksToRefresh = this.getRowCount() == 0;
        if (noBlocksToRefresh || purge) {
            this.resetStore();
        }
        else {
            this.refreshBlocks();
        }
        this.fireCacheUpdatedEvent();
    };
    PartialStore.prototype.refreshBlocks = function () {
        this.getBlocksInOrder().forEach(function (block) {
            block.refresh();
        });
        this.lastRowIndexKnown = false;
        this.rowNodeBlockLoader.checkBlockToLoad();
    };
    PartialStore.prototype.resetStore = function () {
        this.destroyAllBlocks();
        this.lastRowIndexKnown = false;
        // if zero rows in the cache, we need to get the SSRM to start asking for rows again.
        // otherwise if set to zero rows last time, and we don't update the row count, then after
        // the purge there will still be zero rows, meaning the SSRM won't request any rows.
        // to kick things off, at least one row needs to be asked for.
        if (this.columnModel.isAutoRowHeightActive || this.rowCount === 0) {
            this.rowCount = PartialStore.INITIAL_ROW_COUNT;
        }
    };
    PartialStore.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var result = [];
        var lastBlockId = -1;
        var inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
            inActiveRange = true;
        }
        var foundGapInSelection = false;
        this.getBlocksInOrder().forEach(function (block) {
            if (foundGapInSelection) {
                return;
            }
            if (inActiveRange && (lastBlockId + 1 !== block.getId())) {
                foundGapInSelection = true;
                return;
            }
            lastBlockId = block.getId();
            block.forEachNodeShallow(function (rowNode) {
                var hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
                if (inActiveRange || hitFirstOrLast) {
                    result.push(rowNode);
                }
                if (hitFirstOrLast) {
                    inActiveRange = !inActiveRange;
                }
            });
        });
        // inActiveRange will be still true if we never hit the second rowNode
        var invalidRange = foundGapInSelection || inActiveRange;
        return invalidRange ? [] : result;
    };
    PartialStore.prototype.findBlockAndExecute = function (matchBlockFunc, blockFoundFunc, blockNotFoundFunc) {
        var blockFound = false;
        var breakSearch = false;
        var lastBlock = null;
        var res;
        this.getBlocksInOrder().forEach(function (block) {
            if (blockFound || breakSearch) {
                return;
            }
            var comparatorResult = matchBlockFunc(block);
            if (comparatorResult == FindResult.FOUND) {
                res = blockFoundFunc(block);
                blockFound = true;
            }
            else if (comparatorResult == FindResult.CONTINUE_FIND) {
                lastBlock = block;
            }
            else if (comparatorResult == FindResult.BREAK_FIND) {
                breakSearch = true;
            }
        });
        if (!blockFound) {
            res = blockNotFoundFunc(lastBlock);
        }
        return res;
    };
    PartialStore.prototype.getRowBounds = function (index) {
        var _this = this;
        var matchBlockFunc = function (block) {
            if (block.isDisplayIndexInBlock(index)) {
                return FindResult.FOUND;
            }
            else {
                return block.isBlockBefore(index) ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
            }
        };
        var blockFoundFunc = function (foundBlock) {
            return foundBlock.getRowBounds(index);
        };
        var blockNotFoundFunc = function (previousBlock) {
            var nextRowTop;
            var nextRowIndex;
            if (previousBlock !== null) {
                nextRowTop = previousBlock.getBlockTopPx() + previousBlock.getBlockHeightPx();
                nextRowIndex = previousBlock.getDisplayIndexEnd();
            }
            else {
                nextRowTop = _this.cacheTopPixel;
                nextRowIndex = _this.displayIndexStart;
            }
            var rowsBetween = index - nextRowIndex;
            return {
                rowHeight: _this.defaultRowHeight,
                rowTop: nextRowTop + rowsBetween * _this.defaultRowHeight
            };
        };
        return this.findBlockAndExecute(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
    };
    PartialStore.prototype.getRowIndexAtPixel = function (pixel) {
        var _this = this;
        var matchBlockFunc = function (block) {
            if (block.isPixelInRange(pixel)) {
                return FindResult.FOUND;
            }
            else {
                return block.getBlockTopPx() < pixel ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
            }
        };
        var blockFoundFunc = function (foundBlock) {
            return foundBlock.getRowIndexAtPixel(pixel);
        };
        var blockNotFoundFunc = function (previousBlock) {
            var nextRowTop;
            var nextRowIndex;
            if (previousBlock) {
                nextRowTop = previousBlock.getBlockTopPx() + previousBlock.getBlockHeightPx();
                nextRowIndex = previousBlock.getDisplayIndexEnd();
            }
            else {
                nextRowTop = _this.cacheTopPixel;
                nextRowIndex = _this.displayIndexStart;
            }
            // we start at the last loaded block before this block, and go down
            // block by block, adding in the block sizes (using cached sizes if available)
            // until we get to a block that does should have the pixel
            var blockSize = _this.storeParams.cacheBlockSize;
            var defaultBlockHeight = _this.defaultRowHeight * blockSize;
            var nextBlockId = previousBlock ? (previousBlock.getId() + 1) : 0;
            var getBlockDetails = function (id) {
                var cachedBlockHeight = _this.getCachedBlockHeight(id);
                var blockHeight = cachedBlockHeight != null ? cachedBlockHeight : defaultBlockHeight;
                var pixelInBlock = pixel <= (blockHeight + nextRowTop);
                return {
                    height: blockHeight, pixelInBlock: pixelInBlock
                };
            };
            var blockDetails = getBlockDetails(nextBlockId);
            while (!blockDetails.pixelInBlock) {
                nextRowTop += blockDetails.height;
                nextRowIndex += blockSize;
                nextBlockId++;
                blockDetails = getBlockDetails(nextBlockId);
            }
            var pixelsBetween = pixel - nextRowTop;
            var rowHeight = blockDetails.height / blockSize;
            var rowsBetween = Math.floor(pixelsBetween / rowHeight) | 0;
            return nextRowIndex + rowsBetween;
        };
        var result = this.findBlockAndExecute(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
        var lastAllowedIndex = this.getDisplayIndexEnd() - 1;
        result = Math.min(result, lastAllowedIndex);
        return result;
    };
    PartialStore.prototype.clearDisplayIndexes = function () {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.getBlocksInOrder().forEach(function (block) { return block.clearDisplayIndexes(); });
    };
    PartialStore.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        this.displayIndexStart = displayIndexSeq.peek();
        this.cacheTopPixel = nextRowTop.value;
        var lastBlockId = -1;
        var blockSize = this.storeParams.cacheBlockSize;
        this.getBlocksInOrder().forEach(function (currentBlock) {
            // if we skipped blocks, then we need to skip the row indexes. we assume that all missing
            // blocks are made up of closed RowNodes only (if they were groups), as we never expire from
            // the cache if any row nodes are open.
            var blockId = currentBlock.getId();
            var blocksSkippedCount = blockId - lastBlockId - 1;
            var rowsSkippedCount = blocksSkippedCount * blockSize;
            if (rowsSkippedCount > 0) {
                displayIndexSeq.skip(rowsSkippedCount);
            }
            for (var i = 1; i <= blocksSkippedCount; i++) {
                var blockToAddId = blockId - i;
                if (_.exists(_this.blockHeights[blockToAddId])) {
                    nextRowTop.value += _this.blockHeights[blockToAddId];
                }
                else {
                    nextRowTop.value += blockSize * _this.defaultRowHeight;
                }
            }
            lastBlockId = blockId;
            currentBlock.setDisplayIndexes(displayIndexSeq, nextRowTop);
            _this.blockHeights[blockId] = currentBlock.getBlockHeightPx();
        });
        // if any blocks missing at the end, need to increase the row index for them also
        // eg if block size = 10, we have total rows of 25 (indexes 0 .. 24), but first 2 blocks loaded (because
        // last row was ejected from cache), then:
        // lastVisitedRow = 19, virtualRowCount = 25, rows not accounted for = 5 (24 - 19)
        var lastVisitedRow = ((lastBlockId + 1) * blockSize) - 1;
        var rowCount = this.getRowCount();
        var rowsNotAccountedFor = rowCount - lastVisitedRow - 1;
        if (rowsNotAccountedFor > 0) {
            displayIndexSeq.skip(rowsNotAccountedFor);
            nextRowTop.value += rowsNotAccountedFor * this.defaultRowHeight;
        }
        this.displayIndexEnd = displayIndexSeq.peek();
        this.cacheHeightPixels = nextRowTop.value - this.cacheTopPixel;
    };
    // gets called in a) init() above and b) by the grid
    PartialStore.prototype.getRowUsingDisplayIndex = function (displayRowIndex, dontCreateBlock) {
        var _this = this;
        if (dontCreateBlock === void 0) { dontCreateBlock = false; }
        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer exists
        if (!this.isDisplayIndexInStore(displayRowIndex)) {
            return undefined;
        }
        var matchBlockFunc = function (block) {
            if (block.isDisplayIndexInBlock(displayRowIndex)) {
                return FindResult.FOUND;
            }
            else {
                return block.isBlockBefore(displayRowIndex) ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
            }
        };
        var blockFoundFunc = function (foundBlock) {
            return foundBlock.getRowUsingDisplayIndex(displayRowIndex);
        };
        var blockNotFoundFunc = function (previousBlock) {
            if (dontCreateBlock) {
                return;
            }
            var blockNumber;
            var displayIndexStart;
            var nextRowTop;
            var blockSize = _this.storeParams.cacheBlockSize;
            // because missing blocks are always fully closed, we can work out
            // the start index of the block we want by hopping from the closest block,
            // as we know the row count in closed blocks is equal to the page size
            if (previousBlock) {
                blockNumber = previousBlock.getId() + 1;
                displayIndexStart = previousBlock.getDisplayIndexEnd();
                nextRowTop = previousBlock.getBlockHeightPx() + previousBlock.getBlockTopPx();
                var isInRange = function () {
                    return displayRowIndex >= displayIndexStart && displayRowIndex < (displayIndexStart + blockSize);
                };
                while (!isInRange()) {
                    displayIndexStart += blockSize;
                    var cachedBlockHeight = _this.blockHeights[blockNumber];
                    if (_.exists(cachedBlockHeight)) {
                        nextRowTop += cachedBlockHeight;
                    }
                    else {
                        nextRowTop += _this.defaultRowHeight * blockSize;
                    }
                    blockNumber++;
                }
            }
            else {
                var localIndex = displayRowIndex - _this.displayIndexStart;
                blockNumber = Math.floor(localIndex / blockSize);
                displayIndexStart = _this.displayIndexStart + (blockNumber * blockSize);
                nextRowTop = _this.cacheTopPixel + (blockNumber * blockSize * _this.defaultRowHeight);
            }
            _this.logger.log("block missing, rowIndex = " + displayRowIndex + ", creating #" + blockNumber + ", displayIndexStart = " + displayIndexStart);
            var newBlock = _this.createBlock(blockNumber, displayIndexStart, { value: nextRowTop });
            return newBlock.getRowUsingDisplayIndex(displayRowIndex);
        };
        return this.findBlockAndExecute(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
    };
    PartialStore.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var blockSize = this.storeParams.cacheBlockSize;
        var blockId = Math.floor(topLevelIndex / blockSize);
        var matchBlockFunc = function (block) {
            if (block.getId() === blockId) {
                return FindResult.FOUND;
            }
            return block.getId() < blockId ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
        };
        var blockFoundFunc = function (foundBlock) {
            var rowNode = foundBlock.getRowUsingLocalIndex(topLevelIndex);
            return rowNode.rowIndex;
        };
        var blockNotFoundFunc = function (previousBlock) {
            if (!previousBlock) {
                return topLevelIndex;
            }
            // note: the local index is the same as the top level index, two terms for same thing
            //
            // get index of the last row before this row
            // eg if blocksize = 100, then:
            //   last row of first block is 99 (100 * 1) -1;
            //   last row of second block is 199 (100 * 2) -1;
            var lastRowTopLevelIndex = (blockSize * (previousBlock.getId() + 1)) - 1;
            // get the last top level node in the block before the wanted block. this will be the last
            // loaded displayed top level node.
            var lastRowNode = previousBlock.getRowUsingLocalIndex(lastRowTopLevelIndex);
            // we want the index of the last displayed node, not just the top level node, so if the last top level node
            // is open, we get the index of the last displayed child node.
            var lastDisplayedNodeIndexInBlockBefore;
            if (lastRowNode.expanded && lastRowNode.childStore) {
                var serverSideCache = lastRowNode.childStore;
                lastDisplayedNodeIndexInBlockBefore = serverSideCache.getDisplayIndexEnd() - 1;
            }
            else if (lastRowNode.expanded && lastRowNode.detailNode) {
                lastDisplayedNodeIndexInBlockBefore = lastRowNode.detailNode.rowIndex;
            }
            else {
                lastDisplayedNodeIndexInBlockBefore = lastRowNode.rowIndex;
            }
            // we are guaranteed no rows are open. so the difference between the topTopIndex will be the
            // same as the difference between the displayed index
            var indexDiff = topLevelIndex - lastRowTopLevelIndex;
            return lastDisplayedNodeIndexInBlockBefore + indexDiff;
        };
        return this.findBlockAndExecute(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
    };
    PartialStore.prototype.addStoreStates = function (result) {
        result.push({
            type: 'partial',
            route: this.storeUtils.createGroupKeys(this.parentRowNode),
            rowCount: this.rowCount,
            lastRowIndexKnown: this.lastRowIndexKnown,
            info: this.info,
            maxBlocksInCache: this.storeParams.maxBlocksInCache,
            cacheBlockSize: this.storeParams.cacheBlockSize
        });
        this.forEachChildStoreShallow(function (childStore) { return childStore.addStoreStates(result); });
    };
    PartialStore.prototype.getCachedBlockHeight = function (blockNumber) {
        return this.blockHeights[blockNumber];
    };
    PartialStore.prototype.createBlock = function (blockNumber, displayIndex, nextRowTop) {
        var block = this.createBean(new PartialStoreBlock(blockNumber, this.parentRowNode, this.ssrmParams, this.storeParams, this));
        block.setDisplayIndexes(new NumberSequence(displayIndex), nextRowTop);
        this.blocks[block.getId()] = block;
        this.purgeBlocksIfNeeded(block);
        this.rowNodeBlockLoader.addBlock(block);
        return block;
    };
    PartialStore.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    PartialStore.prototype.isDisplayIndexInStore = function (displayIndex) {
        if (this.getRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    PartialStore.prototype.applyTransaction = function (transaction) {
        return { status: ServerSideTransactionResultStatus.StoreWrongType };
    };
    PartialStore.prototype.getChildStore = function (keys) {
        var _this = this;
        var findNodeCallback = function (key) {
            var nextNode = null;
            _this.getBlocksInOrder().forEach(function (block) {
                block.forEachNodeShallow(function (rowNode) {
                    if (rowNode.key === key) {
                        nextNode = rowNode;
                    }
                }, new NumberSequence());
            });
            return nextNode;
        };
        return this.storeUtils.getChildStore(keys, this, findNodeCallback);
    };
    PartialStore.prototype.isPixelInRange = function (pixel) {
        if (this.getRowCount() === 0) {
            return false;
        }
        return pixel >= this.cacheTopPixel && pixel < (this.cacheTopPixel + this.cacheHeightPixels);
    };
    PartialStore.prototype.refreshAfterFilter = function (params) {
        this.resetStore();
    };
    PartialStore.prototype.refreshAfterSort = function (params) {
        if (this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            this.resetStore();
            return;
        }
        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterSort(params); });
    };
    PartialStore.prototype.forEachChildStoreShallow = function (callback) {
        this.getBlocksInOrder().forEach(function (block) {
            if (block.isGroupLevel()) {
                var innerCallback = function (rowNode) {
                    var nextCache = rowNode.childStore;
                    if (nextCache) {
                        callback(nextCache);
                    }
                };
                block.forEachNodeShallow(innerCallback, new NumberSequence());
            }
        });
    };
    // this property says how many empty blocks should be in a cache, eg if scrolls down fast and creates 10
    // blocks all for loading, the grid will only load the last 2 - it will assume the blocks the user quickly
    // scrolled over are not needed to be loaded.
    PartialStore.MAX_EMPTY_BLOCKS_TO_KEEP = 2;
    PartialStore.INITIAL_ROW_COUNT = 1;
    PartialStore.OVERFLOW_SIZE = 1;
    __decorate([
        Autowired('rowRenderer')
    ], PartialStore.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('rowNodeBlockLoader')
    ], PartialStore.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        Autowired('ssrmCacheUtils')
    ], PartialStore.prototype, "storeUtils", void 0);
    __decorate([
        Autowired("focusService")
    ], PartialStore.prototype, "focusService", void 0);
    __decorate([
        Autowired("columnModel")
    ], PartialStore.prototype, "columnModel", void 0);
    __decorate([
        PostConstruct
    ], PartialStore.prototype, "postConstruct", null);
    __decorate([
        PreDestroy
    ], PartialStore.prototype, "destroyAllBlocks", null);
    __decorate([
        __param(0, Qualifier('loggerFactory'))
    ], PartialStore.prototype, "setBeans", null);
    return PartialStore;
}(BeanStub));
export { PartialStore };
//# sourceMappingURL=partialStore.js.map