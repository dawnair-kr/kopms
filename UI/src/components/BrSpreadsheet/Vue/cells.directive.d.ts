import { DefineVueDirective } from '@syncfusion/ej2-vue-base';
import { CellModel } from '@syncfusion/ej2-spreadsheet';
export declare let CellsDirective: any;
export declare const CellsPlugin: {
    name: string;
    install(Vue: any): void;
};
/**
 * `e-cell` directive represent a cell of the VueJS Spreadsheet.
 * It must be contained in a `e-row` directive.
 * ```vue
 * <ejs-spreadsheet>
 *   <e-sheets>
 *    <e-sheet>
 *    <e-rows>
 *    <e-row>
 *    <e-cells>
 *    <e-cell value='A1'></e-cell>
 *    </e-cells>
 *    </e-row>
 *    </e-rows>
 *    </e-sheet>
 *   </e-sheets>
 * </ejs-spreadsheet>
 * ```
 */
export declare let CellDirective: DefineVueDirective<CellModel>;
export declare const CellPlugin: {
    name: string;
    install(Vue: any): void;
};
