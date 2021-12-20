/* eslint-disable @typescript-eslint/no-var-requires */
const postcssIsPseudoClass = require("postcss-pseudo-is");
const postcssPxToRem = require("postcss-pxtorem");

module.exports = {
  plugins: [
    postcssIsPseudoClass,
    postcssPxToRem({
      propList: [
        "font-size",
        "margin*",
        "padding*",
        "*width*",
        "*height*",
        "gap",
        "--*",
      ],
    }),
  ],
};
