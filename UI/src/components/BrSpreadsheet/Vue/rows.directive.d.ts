import { DefineVueDirective } from '@syncfusion/ej2-vue-base';
import { RowModel } from '@syncfusion/ej2-spreadsheet';
export declare let RowsDirective: any;
export declare const RowsPlugin: {
    name: string;
    install(Vue: any): void;
};
/**
 * `e-row` directive represent a row of the VueJS Spreadsheet.
 * It must be contained in a `e-sheet` directive.
 * ```vue
 * <ejs-spreadsheet>
 *   <e-sheets>
 *    <e-sheet>
 *    <e-rows>
 *    <e-row></e-row>
 *    </e-rows>
 *    </e-sheet>
 *   </e-sheets>
 * </ejs-spreadsheet>
 * ```
 */
export declare let RowDirective: DefineVueDirective<RowModel>;
export declare const RowPlugin: {
    name: string;
    install(Vue: any): void;
};
