import { DefineVueDirective } from '@syncfusion/ej2-vue-base';
import { DefineNameModel } from '@syncfusion/ej2-spreadsheet';
export declare let DefinedNamesDirective: any;
export declare const DefinedNamesPlugin: {
    name: string;
    install(Vue: any): void;
};
/**
 * `e-definedname` directive represent a defined name of the VueJS Spreadsheet.
 * It must be contained in a Spreadsheet component(`ejs-spreadsheet`).
 * ```vue
 * <ejs-spreadsheet>
 *   <e-definednames>
 *    <e-definedname></e-definedname>
 *    <e-definedname></e-definedname>
 *   </e-definednames>
 * </ejs-spreadsheet>
 * ```
 */
export declare let DefinedNameDirective: DefineVueDirective<DefineNameModel>;
export declare const DefinedNamePlugin: {
    name: string;
    install(Vue: any): void;
};
