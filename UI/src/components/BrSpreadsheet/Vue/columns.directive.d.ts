import { DefineVueDirective } from '@syncfusion/ej2-vue-base';
import { ColumnModel } from '@syncfusion/ej2-spreadsheet';
export declare let ColumnsDirective: any;
export declare const ColumnsPlugin: {
    name: string;
    install(Vue: any): void;
};
/**
 * `e-column` directive represent a column of the VueJS Spreadsheet.
 * It must be contained in a `e-sheet` directive.
 * ```vue
 * <ejs-spreadsheet>
 *   <e-sheets>
 *    <e-sheet>
 *    <e-columns>
 *    <e-column></e-column>
 *    </e-columns>
 *    </e-sheet>
 *   </e-sheets>
 * </ejs-spreadsheet>
 * ```
 */
export declare let ColumnDirective: DefineVueDirective<ColumnModel>;
export declare const ColumnPlugin: {
    name: string;
    install(Vue: any): void;
};
