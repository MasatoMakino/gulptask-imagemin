import { src, dest, series, parallel } from "gulp";

import { initOption } from "./Option";
import { getImageTask } from "./MinimizeTask";
export const bufferImgPath = "./.imgBuffer/";

/**
 * 画像を複数のスケールにリサイズし、最適化するタスク
 * @param {string} imageDir
 * @param {string} distDir
 * @param {Option} [option]
 * @return {Function} gulpタスク
 */
export function get(imageDir, distDir, option) {
  option = initOption(option);

  const tasks = [];
  option.scaleOptions.forEach(scaleOption => {
    tasks.push(getImageTask(imageDir, scaleOption));
  });

  const copy = () => {
    return src([bufferImgPath + "**/*"], { base: bufferImgPath }).pipe(
      dest(distDir)
    );
  };

  return series(parallel.apply(null, tasks), copy);
}
