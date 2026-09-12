const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = process.cwd();
const config = getDefaultConfig(projectRoot);
const reactRoot = path.resolve(projectRoot, 'node_modules/react');
const reactEntry = path.join(reactRoot, 'index.js');

// The Android release is built through a short-path junction on Windows.
// Without this alias Metro can bundle React twice, leaving hook dispatchers null.
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...(config.resolver.extraNodeModules || {}),
    react: reactRoot,
  },
  resolveRequest(context, moduleName, platform) {
    if (moduleName === 'react') {
      return { type: 'sourceFile', filePath: reactEntry };
    }
    if (moduleName === 'react/jsx-runtime') {
      return { type: 'sourceFile', filePath: path.join(reactRoot, 'jsx-runtime.js') };
    }
    if (moduleName === 'react/jsx-dev-runtime') {
      return { type: 'sourceFile', filePath: path.join(reactRoot, 'jsx-dev-runtime.js') };
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
