const { withGradleProperties } = require('expo/config-plugins');

module.exports = function withAbiFilter(config, { abiFilters = ['arm64-v8a'] } = {}) {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !item.key || item.key !== 'reactNativeArchitectures',
    );
    config.modResults.push({
      type: 'property',
      key: 'reactNativeArchitectures',
      value: abiFilters.join(','),
    });
    return config;
  });
};
