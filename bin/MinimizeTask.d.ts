import { ScaleOption } from "./Option";
/**
 * .imgBufferディレクトリの更新差分を抽出して画像を最適化する
 */
export declare function getNewerFileOptimizeTask(imageDir: string, srcImageGlob: string, distImgPath: string, extensions: string[], resizeOption?: ScaleOption): Promise<any[]>;
export declare function getScalingTask(imageDir: string, scaleOption: ScaleOption): Promise<any[]>;
export declare function getWatchImages(imageDir: string, distDir: string, scaleOptions: ScaleOption[]): () => void;
//# sourceMappingURL=MinimizeTask.d.ts.map