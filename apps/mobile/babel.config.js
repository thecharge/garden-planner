module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Reanimated plugin MUST be last. See
      // https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation
      "react-native-reanimated/plugin"
    ]
  };
};
