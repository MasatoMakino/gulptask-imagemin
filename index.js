"use strict";

const { src, dest, series, parallel } = require("gulp");
const through2 = require("through2");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const sharp = require("sharp");
const mozjpeg = require("imagemin-mozjpeg");
const path = require("path");

const bufferImgPath = "./.imgBuffer/";
const imgExtension = "+(jpg|jpeg|png|gif|svg)";
const imgExtension_responsive = "+(jpg|jpeg|png|gif)";

const imageminOption = [
  imagemin.gifsicle(),
  mozjpeg(),
  imagemin.optipng(),
  imagemin.svgo()
];

/**
 * @typedef Option
 * @type {Object}
 * @property {Array.<ScaleOption>} [scaleOptions]
 *
 * 画像圧縮に関するオプション。
 */

/**
 * @typedef ScaleOption
 * @type {Object}
 * @property {string} postfix e.g. "_xs" -> "./[imageDir]_xs/img.jpg"
 * @property {number} scale e.g. 1.0, 0.5 ....
 *
 * 画像のスケーリングに関するオプション。
 */

const initOption = option => {
  if (option == null) {
    option = {};
  }
  if (option.scaleOptions == null) {
    option.scaleOptions = [
      {
        postfix: "",
        scale: 1.0
      },
      {
        postfix: "_xs",
        scale: 0.5
      }
    ];
  }
  return option;
};

const minimize = (srcImages, distImgPath, resizeOptions) => {
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

  let stream = src(srcImages).pipe(newer(distImgPath));
  if (hasResizeOption) {
    stream = stream.pipe(through2.obj(resize));
  }
  return stream.pipe(imagemin(imageminOption)).pipe(dest(distImgPath));
};

/**
 * 画像を複数のスケールにリサイズし、最適化するタスク
 * @param {string} imageDir
 * @param {string} distDir
 * @param {Option} [option]
 * @return {Function} gulpタスク
 */
module.exports = (imageDir, distDir, option) => {
  const baseName = path.basename(imageDir);
  const srcImages = path.resolve(imageDir, "**/*." + imgExtension);
  const srcResponsiveImages = path.resolve(
    imageDir,
    "**/*." + imgExtension_responsive
  );

  option = initOption(option);

  /**
   * オプションを参照する画像圧縮タスクを取得する。
   * @param scaleOption
   * @return {function(): *}
   */
  const getImageTask = scaleOption => {
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
      return minimize(imgGlob, distImgPath, resizeOption);
    };
  };

  const tasks = [];
  option.scaleOptions.forEach(scaleOption => {
    tasks.push(getImageTask(scaleOption));
  });

  const copy = () => {
    return src([bufferImgPath + "**/*"], { base: bufferImgPath }).pipe(
      dest(distDir)
    );
  };

  return series(parallel.apply(null, tasks), copy);
};
