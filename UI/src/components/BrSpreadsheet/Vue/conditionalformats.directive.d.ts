import { DefineVueDirective } from '@syncfusion/ej2-vue-base';
import { ConditionalFormatModel } from '@syncfusion/ej2-spreadsheet';
export declare let ConditionalFormatsDirective: any;
export declare const ConditionalFormatsPlugin: {
    name: string;
    install(Vue: any): void;
};
/**
 * `e-conditionalformat` directive represent a conditionalformat of the VueJS Spreadsheet.
 * It must be contained in a `e-sheet` directive.
 * ```vue
 * <ejs-spreadsheet>
 *   <e-sheets>
 *    <e-sheet>
 *    <e-conditionalformats>
 *    <e-conditionalformat></e-conditionalformat>
 *    </e-conditionalformats>
 *    </e-sheet>
 *   </e-sheets>
 * </ejs-spreadsheet>
 * ```
 */
export declare let ConditionalFormatDirective: DefineVueDirective<ConditionalFormatModel>;
export declare const ConditionalFormatPlugin: {
    name: string;
    install(Vue: any): void;
};
