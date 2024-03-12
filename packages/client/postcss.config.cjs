module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano'),
    require('postcss-scrollbar'),
    require('postcss-nesting')({ noIsPseudoSelector: false }),
    require('postcss-custom-media')({ preserve: false }),
    require('@unocss/postcss')({})
  ]
};
