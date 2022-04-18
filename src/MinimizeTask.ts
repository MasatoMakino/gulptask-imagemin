import Sharp from "sharp";
import path from "path";
import fs from "fs";
import glob from "glob";

import { ScaleOption } from "./Option";
import { bufferImgPath } from "./index";
const imgExtension = "+(jpg|jpeg|png|gif|svg)";
const imgExtension_responsive = "+(jpg|jpeg|png|gif)";

/**
 * SharpライブラリをラップしたStreamを作成する。
 */
export async function getSharpStream(
  imageDir: string,
  srcImageGlob: string,
  distImgPath: string,
  resizeOption?: ScaleOption
) {
  const files = glob.sync(srcImageGlob, { cwd: imageDir });
  return optimize(files, imageDir, distImgPath, resizeOption);
}

const optimize = async (
  files: string[],
  imageSrcDir: string,
  distImgPath: string,
  resizeOption?: ScaleOption
) => {
  const promises = [];
  files.forEach((file) => {
    const promise = async () => {
      const outputPath = path.resolve(distImgPath, file);
      const dir = path.dirname(outputPath);
      await fs.promises.mkdir(dir, { recursive: true });
      const sharpObj = await new Sharp(path.resolve(imageSrcDir, file));

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
      await sharpObj.toFile(outputPath);
    };

    promises.push(promise());
  });

  return Promise.all(promises);
};

export async function getImageTask(imageDir: string, scaleOption: ScaleOption) {
  const baseName = path.basename(imageDir);
  const srcImages = path.join("**/*." + imgExtension);
  const srcResponsiveImages = path.join("**/*." + imgExtension_responsive);

  const distImgPath = path.resolve(
    bufferImgPath,
    baseName + scaleOption.postfix
  );

  let imgGlob = srcImages;
  let resizeOption;
  if (scaleOption.scale !== 1.0) {
    imgGlob = srcResponsiveImages;
    resizeOption = {
      scale: scaleOption.scale,
    };
  }

  return getSharpStream(imageDir, imgGlob, distImgPath, resizeOption);
}
