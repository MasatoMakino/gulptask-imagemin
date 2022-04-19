import { Option } from "./Option";
export declare const bufferImgPath = "./.imgBuffer/";
/**
 * @deprecated
 * @param srcImageDir
 * @param distDir
 * @param option
 */
export declare function get(srcImageDir: string, distDir: string, option: Option): () => Promise<void>;
/**
 * @deprecated
 * @param srcImageDir
 * @param distDir
 * @param option
 */
export declare function generateTask(srcImageDir: string, distDir: string, option: Option): () => Promise<void>;
/**
 * 画像を複数のスケールにリサイズし、最適化するタスクを生成する
 * @param srcImageDir
 * @param distDir
 * @param option
 */
export declare function generateTasks(srcImageDir: string, distDir: string, option: Option): {
    optimize: () => Promise<void>;
    watchImages: () => void;
};
//# sourceMappingURL=index.d.ts.map