module.exports = function (api) {
  api.cache(true);
  const presets = [
    ['@babel/env',
      {
        useBuiltIns: false,
        modules: false,
      }
    ],
    '@babel/react',
  ];
  return {
    presets,
  };
};