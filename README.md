# gulptask-imagemin

> imagemin task for gulp.js

[GitHub リポジトリ](https://github.com/MasatoMakino/gulptask-imagemin.git)

[gulp4](https://gulpjs.com/) 用のタスクをモジュール化したものです。
[Sharp](https://sharp.pixelplumbing.com/)を利用して、画像ファイルの最適化を行います。

## Getting Started

### Install

タスクモジュールは

```bash
$ npm install https://github.com/MasatoMakino/gulptask-imagemin.git -D
```

でインストールします

### Import

gulpfile.js の中で

▼gulpfile.js
```js
const imageTasks = require("gulptask-imagemin").generateTasks("画像ソースのディレクトリ", "出力先ディレクトリ", {オプション: 省略可});
```

のように宣言してタスクモジュールをインポートします。
`imageTasks`には画像最適化を行う`optimize`タスクと、ファイル更新を監視する`watchImages`タスクの2つが格納されています。


▼gulpfile.js
```js
imageTasks.optimize; //画像最適化タスク
imageTasks.watchImages(); //watchタスク、gulpfileのwatch内で実行する
```

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
  ];
}
```

- `option.scaleOptions` スケーリングに関する設定が格納された配列です。
- `ScaleOption.postfix` 拡大縮小された画像を格納するディレクトリ名の接尾名です。たとえばオリジナルの画像ディレクトリが`img`、postfix が`_xs`なら、出力ディレクトリは`img_xs`になります。
- `ScaleOption.scale` 拡大縮小率です。1.0 ならオリジナルと同じサイズが、0.5 なら一辺が半分のサイズの画像が出力されます。

## License

[MIT licensed](LICENSE).
