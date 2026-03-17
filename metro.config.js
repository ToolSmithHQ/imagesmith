const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// imagecore packages live outside the project root (local file: deps)
const imagecoreRoot = path.resolve(__dirname, '../imagecore/packages');

// Tell Metro to watch the imagecore source directories
config.watchFolders = [
  path.join(imagecoreRoot, 'native'),
  path.join(imagecoreRoot, 'types'),
];

// Tell Metro's resolver where to find node_modules for imagecore packages
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  // imagecore packages may import from their own node_modules
  path.resolve(__dirname, '../imagecore/node_modules'),
];

module.exports = config;
