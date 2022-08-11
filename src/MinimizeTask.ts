import newer from "@masatomakino/newer-files";
import { watch } from "chokidar";
import fs from "fs";
import path from "path";
import Sharp from "sharp";
import { clearBuffer } from "./ClearBuffer";
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
  colours:number,
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
 * @param resizeOption
 */
const optimizeFiles = async (
  files: string[],
  imageSrcDir: string,
  distImgPath: string,
  colours:number,
  resizeOption?: ScaleOption
) => {
  const promises = [];
  files.forEach((file) => {
    promises.push(optimizeFile(file, imageSrcDir, distImgPath,colours, resizeOption));
  });

  return Promise.all(promises);
};

/**
 * 指定されたファイルを最適化する
 * @param file ファイルパス。imageSrcDirからの相対パス
 * @param imageSrcDir 画像ファイルのソースディレクトリ
 * @param distImgDir 画像ファイルの出力ディレクトリ bufferImgPathにスケーリング修飾子を追加したもの
 * @param resizeOption スケーリング修飾子とスケール値のセット
 * @param option
 * @param [option.useFsReadFile=false]  fs.readFileを利用するか否か。new Sharp(filePath)はディスクキャッシュが効くため、watchするとファイルが更新されない。
 */
const optimizeFile = async (
  file: string,
  imageSrcDir: string,
  distImgDir: string,
  colours:number,
  resizeOption: ScaleOption | undefined,
  option?: {
    useFsReadFile?: boolean;
  }
) => {
  const outputPath = path.resolve(distImgDir, file);
  const dir = path.dirname(outputPath);
  await fs.promises.mkdir(dir, { recursive: true });

  option ??= {};
  option.useFsReadFile ??= false;
  const filePath = path.resolve(imageSrcDir, file);
  const constructorOption = option.useFsReadFile
    ? await fs.promises.readFile(filePath)
    : filePath;
  const sharpObj = await new Sharp(constructorOption, {animated:true});

  const metadata = await sharpObj.metadata();
  if (resizeOption) {
    await sharpObj.resize(Math.ceil(metadata.width * resizeOption.scale));
  }
  if (metadata.format === "jpeg") {
    await sharpObj.toFormat(metadata.format, {
      mozjpeg: true,
      quality: 75,
    });
  }

  if (metadata.format === "png") {
    await sharpObj.toFormat(metadata.format, {
      compressionLevel: 8,
      palette: true,
    });
  }
  if( metadata.format === "gif"){
    await sharpObj.toFormat(metadata.format,{
      colours
    })
  }

  return {
    sharp: await sharpObj.toFile(outputPath),
    outputPath,
    distImgDir,
  };
};

export async function getScalingTask(
  imageDir: string,
  colours:number,
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
  colours:number,
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
