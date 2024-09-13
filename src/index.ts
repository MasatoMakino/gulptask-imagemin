import fse from "fs-extra";
import { clearBuffer } from "./ClearBuffer.js";
import { getScalingTask, getWatchImages } from "./MinimizeTask.js";
import { initOption, Option } from "./Option.js";

export const bufferImgPath = "./.imgBuffer/";

/**
 * @deprecated use generateTasks()
 * @param srcImageDir
 * @param distDir
 * @param option
 */
export function get(srcImageDir: string, distDir: string, option: Option) {
  return generateTasks(srcImageDir, distDir, option);
}

/**
 * @deprecated use generateTasks()
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
        const task = getScalingTask(srcImageDir, option.colours, scaleOption);
        tasks.push(task);
      });
      await Promise.all(tasks);
      fse.copySync(bufferImgPath, distDir);
      console.log("done : image optimize task");
    },
    watchImages: getWatchImages(srcImageDir, distDir, option.colours, option.scaleOptions),
  };
}
