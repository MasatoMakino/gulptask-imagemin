import newer from "@masatomakino/newer-files";
import { watch } from "chokidar";
import fs from "fs";
import path from "path";

import { clearBuffer } from "./ClearBuffer";
import { optimizeFile } from "./OptimizeFile";
import { bufferImgPath } from "./index";
import { ScaleOption } from "./Option";

const imgExtensionArrayResponsive = ["jpg", "jpeg", "png", "gif"];
const imgExtensionArray = [...imgExtensionArrayResponsive, "svg"];

const imgExtension = `+(${imgExtensionArray.join("|")})`;
const imgExtension_responsive = `+(${imgExtensionArray.join("|")})`;

/**
 * .imgBufferディレクトリの更新差分を抽出して画像を最適化する
 */
export async function getNewerFileOptimizeTask(
  imageDir: string,
  srcImageGlob: string,
  distImgPath: string,
  extensions: string[],
  colours: number,
  resizeOption?: ScaleOption
) {
  const newFiles = newer.getFiles(extensions, imageDir, distImgPath);
  return optimizeFiles(newFiles, imageDir, distImgPath, colours, resizeOption);
}

/**
 * ファイルリストを最適化する
 * @param files
 * @param imageSrcDir
 * @param distImgPath
 * @param colours gif画像のパレット色数
 * @param resizeOption
 */
const optimizeFiles = async (
  files: string[],
  imageSrcDir: string,
  distImgPath: string,
  colours: number,
  resizeOption?: ScaleOption
) => {
  const promises = [];
  files.forEach((file) => {
    promises.push(
      optimizeFile(file, imageSrcDir, distImgPath, colours, resizeOption)
    );
  });

  return Promise.all(promises);
};

export async function getScalingTask(
  imageDir: string,
  colours: number,
  scaleOption: ScaleOption
) {
  const distImgPath = getBufferOutputPath(imageDir, scaleOption);

  const isScale = scaleOption.scale !== 1.0;
  const extensionGlob = isScale ? imgExtension_responsive : imgExtension;
  const imgGlob = path.join("**/*." + extensionGlob);
  const resizeOption = isScale ? scaleOption : null;
  const extensions = isScale ? imgExtensionArrayResponsive : imgExtensionArray;

  return getNewerFileOptimizeTask(
    imageDir,
    imgGlob,
    distImgPath,
    extensions,
    colours,
    resizeOption
  );
}

export const getBufferOutputPath = (
  imageDir: string,
  scaleOption: ScaleOption
): string => {
  const baseName = path.basename(imageDir);
  return path.resolve(bufferImgPath, baseName + scaleOption.postfix);
};

export function getWatchImages(
  imageDir: string,
  distDir: string,
  colours: number,
  scaleOptions: ScaleOption[]
) {
  return () => {
    clearBuffer(imageDir, scaleOptions);

    const imgGlob = path.join(imageDir, "**/*." + imgExtension);
    console.log("[gulptask-imagemin] " + imgGlob + " : start watching...");

    const onWatch = (filePath: string) => {
      const relativePath = path.relative(imageDir, filePath);
      scaleOptions.forEach(async (scaleOption) => {
        const bufferDir = getBufferOutputPath(imageDir, scaleOption);
        const result = await optimizeFile(
          relativePath,
          imageDir,
          bufferDir,
          colours,
          scaleOption,
          { useFsReadFile: true }
        );

        const bufferFilePath = path.relative(bufferImgPath, result.outputPath);
        const distFilePath = path.join(distDir, bufferFilePath);
        const copyDir = path.dirname(distFilePath);
        await fs.promises.mkdir(copyDir, {
          recursive: true,
        });

        await fs.promises.copyFile(result.outputPath, distFilePath);
        console.log("[gulptask-imagemin] optimize image -> " + distFilePath);
      });
    };

    watch(imgGlob, { ignoreInitial: true }).on("add", onWatch);
    watch(imgGlob).on("change", onWatch);
  };
}
