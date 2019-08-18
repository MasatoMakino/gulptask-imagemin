/**
 * 画像圧縮に関するオプション。
 */
export interface Option {
  scaleOptions?: ScaleOption[];
}

/**
 * 画像のスケーリングに関するオプション。
 */
export interface ScaleOption {
  /**
   * e.g. "_xs" -> "./[imageDir]_xs/img.jpg"
   **/
  postfix: string;
  /**
   * e.g. 1.0, 0.5 ....
   */
  scale: number;
}

export function initOption(option: Option): Option {
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
}
