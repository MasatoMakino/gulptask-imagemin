# gulptask-imagemin

> imagemin task for gulp.js

[GitHub リポジトリ](https://github.com/MasatoMakino/gulptask-imagemin.git)

[gulp4](https://gulpjs.com/) 用のタスクをモジュール化したものです。
[Sharp](https://sharp.pixelplumbing.com/)を利用して、画像ファイルの最適化を行います。

## Getting Started

### Install

モジュールは

```bash
$ npm install @masatomakino/gulptask-imagemin -D
```

でインストールします

## CLI

このモジュールは、コマンドラインから実行できます。

```bash
$ npx @masatomakino/gulptask-imagemin --src 画像ソースのディレクトリ --dest 出力先ディレクトリ
```

拡大率はオプションで指定します。

```bash
--scales 'postfix1',1.0/'postfix2',0.5
```

オプションは文字列と数値を組み合わせた配列です。1つのスケールオプションが`'postfix',1.0`のように`,`で区切られています。各オプションは`/`で区切られています。

## Option

第三引数のオプションは省略可能です。デフォルトでは以下のように指定されています。

```js
{
  scaleOptions: [
    {
      postfix: "",
      scale: 1.0,
    },
    {
      postfix: "_xs",
      scale: 0.5,
    },
  ];
}
```

- `option.scaleOptions` スケーリングに関する設定が格納された配列です。
- `ScaleOption.postfix` 拡大縮小された画像を格納するディレクトリ名の接尾名です。たとえばオリジナルの画像ディレクトリが`img`、postfixが`_xs`なら、出力ディレクトリは`img_xs`になります。
- `ScaleOption.scale` 拡大縮小率です。1.0ならオリジナルと同じサイズが、0.5なら一辺が半分のサイズの画像が出力されます。

## License

[MIT licensed](LICENSE).
