// test/test.js
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// テスト用の画像ファイルが出力されるディレクトリのパス
const distImgDirPath = path.join(__dirname, "../dist/img");
const distImgXsDirPath = path.join(__dirname, "../dist/img_xs");
// テスト用の画像ファイル名
const testImageNames = ["000_fff.png", "001.jpg", "002.jpg", "003.jpg"];
const svgImageName = "300x300.svg";

// CLIツールを実行
exec(
  "node bin/CLI.js --srcDir ./srcImg/img --distDir ./dist",
  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
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
        });

        // SVGファイルがimgディレクトリにのみ存在することを確認
        if (dirPath === distImgDirPath) {
          assert(files.includes(svgImageName));
        } else {
          assert(!files.includes(svgImageName));
        }
      });
    });
  }
);
