// test/test.js
import assert from "assert";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import sharp from "sharp"; // 画像のメタデータを取得するためのライブラリ
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// テスト用の画像ファイルが出力されるディレクトリのパス
const distImgDirPath = path.join(__dirname, "../dist/img");
const distImgXsDirPath = path.join(__dirname, "../dist/img_xs");
// テスト用の画像ファイル名
const testImageNames = [
  "000_fff.png",
  "001.jpg",
  "002.jpg",
  "003.jpg",
  "33x33.png",
];
const svgImageName = "300x300.svg";

// オリジナルの画像ファイルが格納されているディレクトリのパス
const srcImgDirPath = path.join(__dirname, "../srcImg/img");

// CLIツールを実行
exec(
  "node bin/CLI.js --srcDir ./srcImg/img --distDir ./dist",
  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      process.exit(1); // エラーが発生した場合は不正終了
    }

    // dist/imgおよびdist/img_xsディレクトリにファイルが存在することを確認
    [distImgDirPath, distImgXsDirPath].forEach((dirPath) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          console.error(`read dir error: ${err}`);
          return;
        }

        // 各ファイルが存在し、かつファイル名がマッチしていることを確認
        testImageNames.forEach((imageName) => {
          assert(files.includes(imageName));

          // オリジナルの画像のサイズを取得
          const originalImagePath = path.join(srcImgDirPath, imageName);
          sharp(originalImagePath)
            .metadata()
            .then((originalMetadata) => {
              // 画像のサイズを確認
              const imagePath = path.join(dirPath, imageName);
              sharp(imagePath)
                .metadata()
                .then((metadata) => {
                  if (dirPath === distImgDirPath) {
                    // imgディレクトリの場合、オリジナルと同じ画素数であることを確認
                    assert(metadata.width === originalMetadata.width);
                    assert(metadata.height === originalMetadata.height);
                  } else {
                    // img_xsディレクトリの場合、オリジナルの半分の画素数（端数切り上げ）であることを確認
                    assert(
                      metadata.width === Math.ceil(originalMetadata.width / 2),
                    );
                    assert(
                      metadata.height ===
                        Math.ceil(originalMetadata.height / 2),
                    );
                  }
                });
            });
        });

        // SVGファイルがimgディレクトリにのみ存在することを確認
        if (dirPath === distImgDirPath) {
          assert(files.includes(svgImageName));
        } else {
          assert(!files.includes(svgImageName));
        }
      });
    });
  },
);
