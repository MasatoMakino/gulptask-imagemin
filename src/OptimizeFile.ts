import fs from "fs";
import path from "path";
import { ScaleOption } from "./Option";
import sharp from "sharp";

/**
 * 指定されたファイルを最適化して、ファイルに出力する
 *
 * @param file ファイルパス。imageSrcDirからの相対パス
 * @param imageSrcDir 画像ファイルのソースディレクトリ
 * @param distImgDir 画像ファイルの出力ディレクトリ bufferImgPathにスケーリング修飾子を追加したもの
 * @param colours gif画像のカラーパレット数
 * @param resizeOption スケーリング修飾子とスケール値のセット
 * @param option
 * @param [option.useFsReadFile=false]  fs.readFileを利用するか否か。new Sharp(filePath)はディスクキャッシュが効くため、watchするとファイルが更新されない。
 */
export const optimizeFile = async (
  file: string,
  imageSrcDir: string,
  distImgDir: string,
  colours: number,
  resizeOption: ScaleOption | undefined,
  option?: {
    useFsReadFile?: boolean;
  }
): Promise<{
  sharp: sharp.OutputInfo | void;
  outputPath: string;
  distImgDir: string;
}> => {
  const outputPath = await getOutputPath(file, distImgDir);
  const sharpObj: sharp.Sharp = await getSharpObj(file, imageSrcDir, option);
  const metadata = await sharpObj.metadata();

  if (metadata.format === "svg") {
    // @ts-ignore
    const inputPath = sharpObj.options.input.file;
    return {
      sharp: await fs.promises.copyFile(inputPath, outputPath),
      outputPath,
      distImgDir,
    };
  }

  await setFormat(sharpObj, metadata, resizeOption, colours);
  return {
    sharp: await sharpObj.toFile(outputPath),
    outputPath,
    distImgDir,
  };
};

/**
 * Sharpを経由してファイルを読み込む
 *
 * @param file
 * @param imageSrcDir
 * @param option
 */
const getSharpObj = async (
  file: string,
  imageSrcDir: string,
  option?: {
    useFsReadFile?: boolean;
  }
): Promise<sharp.Sharp> => {
  option ??= {};
  option.useFsReadFile ??= false;
  const filePath = path.resolve(imageSrcDir, file);
  const constructorOption = option.useFsReadFile
    ? await fs.promises.readFile(filePath)
    : filePath;
  return sharp(constructorOption, { animated: true });
};

/**
 * ファイル出力パスを生成する。ディレクトリが存在しない場合は先に生成する。
 * @param file
 * @param distImgDir
 */
const getOutputPath = async (file: string, distImgDir: string) => {
  const outputPath = path.resolve(distImgDir, file);
  const dir = path.dirname(outputPath);
  await fs.promises.mkdir(dir, { recursive: true });
  return outputPath;
};

/**
 * 画像フォーマットごとの最適化設定を行う。
 *
 * @param sharpObj
 * @param metadata
 * @param resizeOption
 * @param colours
 */
const setFormat = async (
  sharpObj: sharp.Sharp,
  metadata: sharp.Metadata,
  resizeOption: ScaleOption | undefined,
  colours: number
) => {
  if (resizeOption) {
    await sharpObj.resize(Math.ceil(metadata.width * resizeOption.scale));
  }

  switch (metadata.format) {
    case "jpeg":
      await sharpObj.toFormat(metadata.format, {
        mozjpeg: true,
        quality: 75,
      });
      break;
    case "png":
      await sharpObj.toFormat(metadata.format, {
        compressionLevel: 8,
        palette: true,
      });
      break;
    case "gif":
      await sharpObj.toFormat(metadata.format, {
        colours,
      });
      break;
  }
};
