import { initOption, Option } from "./Option";
import { getScalingTask, getWatchImages } from "./MinimizeTask";
import fse from "fs-extra";
export const bufferImgPath = "./.imgBuffer/";

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
      const tasks = [];
      option.scaleOptions.forEach((scaleOption) => {
        const task = getScalingTask(srcImageDir, scaleOption);
        tasks.push(task);
      });
      await Promise.all(tasks);
      fse.copySync(bufferImgPath, distDir);
      console.log("done : image optimize task");
    },
    watchImages: getWatchImages(srcImageDir, option.scaleOptions),
  };
}
