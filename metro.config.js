// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite charge un moteur SQLite compilé en WebAssembly pour le web ;
// sans ceci, Metro ne sait pas empaqueter le fichier .wasm qu'il importe.
config.resolver.assetExts.push("wasm");

// Le worker WASM d'expo-sqlite a besoin de SharedArrayBuffer, qui exige ces
// en-têtes d'isolation cross-origin sur le serveur de développement web.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
