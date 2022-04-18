import Sharp from "sharp";
import path from "path";
import fs from "fs";
import newer from "node-newer-files";
import { ScaleOption } from "./Option";
import { bufferImgPath } from "./index";

const imgExtensionArrayResponsive = ["jpg", "jpeg", "png", "gif"];
const imgExtensionArray = [...imgExtensionArrayResponsive, "svg"];

const imgExtension = `+(${imgExtensionArray.join("|")})`;
const imgExtension_responsive = `+(${imgExtensionArray.join("|")})`;

/**
 * SharpライブラリをラップしたStreamを作成する。
 */
export async function getSharpStream(
  imageDir: string,
  srcImageGlob: string,
  distImgPath: string,
  extensions: string[],
  resizeOption?: ScaleOption
) {
  const newFiles = newer.getFiles(extensions, imageDir, distImgPath);
  return optimize(newFiles, imageDir, distImgPath, resizeOption);
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

export async function getScalingTask(imageDir: string, scaleOption: ScaleOption) {
  const baseName = path.basename(imageDir);
  const distImgPath = path.resolve(
    bufferImgPath,
    baseName + scaleOption.postfix
  );

  const isScale = scaleOption.scale !== 1.0;
  const extensionGlob = isScale ? imgExtension_responsive : imgExtension;
  const imgGlob = path.join("**/*." + extensionGlob);
  const resizeOption = isScale ? scaleOption : null;
  const extensions = isScale ? imgExtensionArrayResponsive : imgExtensionArray;

  return getSharpStream(
    imageDir,
    imgGlob,
    distImgPath,
    extensions,
    resizeOption
  );
}
