import { rmSync } from "fs";
import { readdir } from "fs/promises";
import path from "path";
import { bufferImgPath } from "./index";
import { getBufferOutputPath } from "./MinimizeTask";
import { ScaleOption } from "./Option";

export const clearBuffer = async (
  srcImageDir: string,
  scaleOptions: ScaleOption[]
) => {
  const bufferDirDirents = await readdir(bufferImgPath, {
    withFileTypes: true,
  });
  const bufferDirList = bufferDirDirents.filter((dirent) => {
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
