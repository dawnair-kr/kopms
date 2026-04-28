import { DefineVueDirective } from '@syncfusion/ej2-vue-base';
import { SheetModel } from '@syncfusion/ej2-spreadsheet';
export declare let SheetsDirective: any;
export declare const SheetsPlugin: {
    name: string;
    install(Vue: any): void;
};
/**
 * `e-sheet` directive represent a sheet of the VueJS Spreadsheet.
 * It must be contained in a Spreadsheet component(`ejs-spreadsheet`).
 * ```vue
 * <ejs-spreadsheet>
 *   <e-sheets>
 *    <e-sheet></e-sheet>
 *    <e-sheet></e-sheet>
 *   </e-sheets>
 * </ejs-spreadsheet>
 * ```
 */
export declare let SheetDirective: DefineVueDirective<SheetModel>;
export declare const SheetPlugin: {
    name: string;
    install(Vue: any): void;
};
