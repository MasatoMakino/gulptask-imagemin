import { rmSync } from "fs";
import { readdir, mkdir } from "fs/promises";
import path from "path";
import { bufferImgPath } from "./index";
import { getBufferOutputPath } from "./MinimizeTask";
import { ScaleOption } from "./Option";

/**
 * スケール値が設定されていない画像バッファディレクトリをクリアする
 * @param srcImageDir
 * @param scaleOptions
 */
export const clearBuffer = async (
  srcImageDir: string,
  scaleOptions: ScaleOption[]
) => {
  await mkdir(bufferImgPath, { recursive: true });
  const bufferDirDirent = await readdir(bufferImgPath, {
    withFileTypes: true,
  });
  const bufferDirList = bufferDirDirent.filter((dirent) => {
    return dirent.isDirectory();
  });

  bufferDirList.forEach((dir) => {
    const bufferDirPath = path.resolve(bufferImgPath, dir.name);

    const find = scaleOptions.find((scale) => {
      const distImgPath = getBufferOutputPath(srcImageDir, scale);
      return bufferDirPath === distImgPath;
    });
    if (find == null) {
      rmSync(bufferDirPath, { recursive: true, force: true });
    }
  });
};
