/**
 * 画像圧縮に関するオプション。
 */
export interface Option {
    scaleOptions?: ScaleOption[];
}
/**
 * 画像のスケーリングに関するオプション。
 */
export interface ScaleOption {
    /**
     * e.g. "_xs" -> "./[imageDir]_xs/img.jpg"
     **/
    postfix: string;
    /**
     * e.g. 1.0, 0.5 ....
     */
    scale: number;
}
export declare function initOption(option: Option): Option;
//# sourceMappingURL=Option.d.ts.map