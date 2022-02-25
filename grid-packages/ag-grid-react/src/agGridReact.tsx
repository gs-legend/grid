import React, { Component } from 'react';
import { AgGridReactLegacy } from './legacy/agGridReactLegacy';
import { AgGridReactUi } from './reactUi/agGridReactUi';
import { AgGridReactProps, AgReactUiProps } from './shared/interfaces';
import { ColumnApi, GridApi, GridOptions } from 'ag-grid-community';


export class AgGridReact extends Component<AgGridReactProps | AgReactUiProps | GridOptions, {}> {
    public api!: GridApi;
    public columnApi!: ColumnApi;

    private setGridApi = (api: GridApi, columnApi: ColumnApi) => {
        this.api = api;
        this.columnApi = columnApi
    }

    render() {
        const ReactComponentToUse = this.props.suppressReactUi ? AgGridReactLegacy : AgGridReactUi;
        return <ReactComponentToUse { ...this.props } setGridApi={ this.setGridApi } />;
    }
}
