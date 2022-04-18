import { initOption, Option } from "./Option";
import { getImageTask } from "./MinimizeTask";
import fse from "fs-extra";
export const bufferImgPath = "./.imgBuffer/";

/**
 * 画像を複数のスケールにリサイズし、最適化するタスクを生成する
 * @param srcImageDir
 * @param distDir
 * @param option
 */
export function generateTask(
  srcImageDir: string,
  distDir: string,
  option: Option
) {
  option = initOption(option);

  return async () => {
    const tasks = [];
    option.scaleOptions.forEach(async (scaleOption) => {
      const task = getImageTask(srcImageDir, scaleOption);
      tasks.push(task);
    });
    await Promise.all(tasks);
    fse.copySync(bufferImgPath, distDir);
    console.log( "done : image optimize task")
  };
}
