import fse from "fs-extra";
import { clearBuffer } from "./ClearBuffer";
import { getScalingTask, getWatchImages } from "./MinimizeTask";
import { initOption, Option } from "./Option";

export const bufferImgPath = "./.imgBuffer/";

/**
 * @deprecated
 * @param srcImageDir
 * @param distDir
 * @param option
 */
export function get(srcImageDir: string, distDir: string, option: Option) {
  return generateTasks(srcImageDir, distDir, option);
}

/**
 * @deprecated
 * @param srcImageDir
 * @param distDir
 * @param option
 */
export function generateTask(
  srcImageDir: string,
  distDir: string,
  option: Option
) {
  console.warn(
    "This function is deprecated. Please use 'generateTasks'. この関数は廃止予定です。'generateTasks'関数を使用してください。"
  );
  return generateTasks(srcImageDir, distDir, option).optimize;
}
/**
 * 画像を複数のスケールにリサイズし、最適化するタスクを生成する
 * @param srcImageDir
 * @param distDir
 * @param option
 */
export function generateTasks(
  srcImageDir: string,
  distDir: string,
  option: Option
) {
  option = initOption(option);

  return {
    optimize: async () => {
      await clearBuffer(srcImageDir, option.scaleOptions);
      const tasks = [];
      option.scaleOptions.forEach((scaleOption) => {
        const task = getScalingTask(srcImageDir, scaleOption);
        tasks.push(task);
      });
      await Promise.all(tasks);
      fse.copySync(bufferImgPath, distDir);
      console.log("done : image optimize task");
    },
    watchImages: getWatchImages(srcImageDir, distDir, option.scaleOptions),
  };
}
