# gulptask-imagemin

imagemin task for gulp.js

[GitHub リポジトリ](https://github.com/MasatoMakino/gulptask-imagemin.git)

[gulp4](https://gulpjs.com/) 用のタスクをモジュール化したものです。
[gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)を利用して、画像ファイルの最適化を行います。

## Getting Started

### Install

タスクモジュールは

```bash
$ npm install https://github.com/MasatoMakino/gulptask-imagemin.git -D
```

でインストールします

### Import

gulpfile.js の中で

```gulpfile.js
const images = require("gulptask-imagemin")("画像ソースのディレクトリ", "出力先ディレクトリ", {オプション / 省略可});
```

のように宣言してタスクモジュールをインポートします。
この状態で`images`がプライベートタスクになっています。

[watch](https://gulpjs.com/docs/en/api/watch)のタスクとしても動作します。

## Option

第三引数のオプションは省略可能です。デフォルトでは以下のように指定されています。

```js
{
  scaleOptions: [
    {
      postfix: "",
      scale: 1.0
    },
    {
      postfix: "_xs",
      scale: 0.5
    }
  ]
}
```

* option.scaleOptions スケーリングに関する設定が格納された配列です。
* ScaleOption.postfix 拡大縮小された画像を格納するディレクトリ名の接尾名です。たとえばオリジナルの画像ディレクトリが``img``、postfixが``_xs``なら、出力ディレクトリは``img_xs``になります。
* ScaleOption.scale 拡大縮小率です。1.0ならオリジナルと同じサイズが、0.5なら一辺が半分のサイズの画像が出力されます。

## License

[MIT licensed](LICENSE).