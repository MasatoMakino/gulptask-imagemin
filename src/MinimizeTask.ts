import { src, dest } from "gulp";

import through2 from "through2";
import imagemin from "gulp-imagemin";
import newer from "gulp-newer";
import sharp from "sharp";
import mozjpeg from "imagemin-mozjpeg";
import path from "path";

import { ScaleOption } from "./Option";
import { bufferImgPath } from "./index";
const imgExtension = "+(jpg|jpeg|png|gif|svg)";
const imgExtension_responsive = "+(jpg|jpeg|png|gif)";

const imageminOption = [
  imagemin.gifsicle(),
  mozjpeg(),
  imagemin.optipng(),
  imagemin.svgo()
];

/**
 * SharpライブラリをラップしたStreamを作成する。
 * @param srcImageGlob
 * @param distImgPath
 * @param resizeOptions
 */
export function getSharpStream(
  srcImageGlob: string,
  distImgPath: string,
  resizeOptions?
): WritableStream {
  const hasResizeOption = resizeOptions !== undefined;
  const resize = (file, _, cb) => {
    const image = sharp(file.contents);
    image
      .metadata()
      .then(metadata => {
        const w = Math.ceil(metadata.width * resizeOptions.scale);
        return image.resize(w).toBuffer();
      })
      .then(data => {
        file.contents = data;
        cb(null, file);
      });
  };

  let stream = src(srcImageGlob).pipe(newer(distImgPath));
  if (hasResizeOption) {
    stream = stream.pipe(through2.obj(resize));
  }
  return stream.pipe(imagemin(imageminOption)).pipe(dest(distImgPath));
}

export function getImageTask(
  imageDir: string,
  scaleOption: ScaleOption
): Function {
  const baseName = path.basename(imageDir);
  const srcImages = path.resolve(imageDir, "**/*." + imgExtension);
  const srcResponsiveImages = path.resolve(
    imageDir,
    "**/*." + imgExtension_responsive
  );

  const distImgPath = path.resolve(
    bufferImgPath,
    baseName + scaleOption.postfix
  );

  let imgGlob = srcImages;
  let resizeOption;
  if (scaleOption.scale !== 1.0) {
    imgGlob = srcResponsiveImages;
    resizeOption = {
      scale: scaleOption.scale
    };
  }

  // タスクを実行する関数を返す。
  // 無名関数でラップしないとタスク定義時点で即時実行されてしまうため。
  return () => {
    return getSharpStream(imgGlob, distImgPath, resizeOption);
  };
}
