import { DefineVueDirective } from '@syncfusion/ej2-vue-base';
import { RangeModel } from '@syncfusion/ej2-spreadsheet';
export declare let RangesDirective: any;
export declare const RangesPlugin: {
    name: string;
    install(Vue: any): void;
};
/**
 * `e-range` directive represent a range of the VueJS Spreadsheet.
 * It must be contained in a `e-sheet` directive.
 * ```vue
 * <ejs-spreadsheet>
 *   <e-sheets>
 *    <e-sheet>
 *    <e-ranges>
 *    <e-range :dataSource='data'></e-range>
 *    </e-ranges>
 *    </e-sheet>
 *   </e-sheets>
 * </ejs-spreadsheet>
 * ```
 */
export declare let RangeDirective: DefineVueDirective<RangeModel>;
export declare const RangePlugin: {
    name: string;
    install(Vue: any): void;
};
