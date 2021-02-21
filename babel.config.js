module.exports = function (api) {
  api.cache(true);
  const presets = [
    ['@babel/env',
      {
        useBuiltIns: false,
        modules: 'commonjs',
      }
    ],
    '@babel/react',
  ];
  return {
    presets,
  };
};