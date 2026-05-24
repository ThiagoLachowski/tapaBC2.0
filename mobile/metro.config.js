const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Shims para módulos Node.js que não existem no React Native
config.resolver.extraNodeModules = {
  stream:  path.resolve(__dirname, 'empty.js'),
  crypto:  path.resolve(__dirname, 'empty.js'),
  http:    path.resolve(__dirname, 'empty.js'),
  https:   path.resolve(__dirname, 'empty.js'),
  net:     path.resolve(__dirname, 'empty.js'),
  tls:     path.resolve(__dirname, 'empty.js'),
  fs:      path.resolve(__dirname, 'empty.js'),
  zlib:    path.resolve(__dirname, 'empty.js'),
  path:    path.resolve(__dirname, 'empty.js'),
  os:      path.resolve(__dirname, 'empty.js'),
  ws:      path.resolve(__dirname, 'empty.js'),
};

// Bloqueia OpenTelemetry — incompatível com Hermes
config.resolver.blockList = [
  /node_modules\/@opentelemetry\/.*/,
];

// Redireciona imports problemáticos para módulo vazio
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.includes('@opentelemetry') ||
    moduleName === 'OTEL_PKG' ||
    moduleName === 'ws' ||
    moduleName === 'stream'
  ) {
    return {
      filePath: path.resolve(__dirname, 'empty.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;