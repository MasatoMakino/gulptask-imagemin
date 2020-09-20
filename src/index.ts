import { src, dest, series, parallel } from "gulp";

import { initOption } from "./Option";
import { getImageTask } from "./MinimizeTask";
export const bufferImgPath = "./.imgBuffer/";

/**
 * @deprecated Use generateTask
 * @param imageDir
 * @param distDir
 * @param option
 */
export function get(imageDir, distDir, option) {
  return generateTask(imageDir, distDir, option);
}
/**
 * 画像を複数のスケールにリサイズし、最適化するタスクを生成する
 * @param imageDir
 * @param distDir
 * @param option
 */
export function generateTask(imageDir, distDir, option) {
  option = initOption(option);

  const tasks = [];
  option.scaleOptions.forEach((scaleOption) => {
    tasks.push(getImageTask(imageDir, scaleOption));
  });

  const copy = () => {
    return src([bufferImgPath + "**/*"], { base: bufferImgPath }).pipe(
      dest(distDir)
    );
  };

  return series(parallel.apply(null, tasks), copy);
}
