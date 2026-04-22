const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
];

// Block Node-only packages from the RN bundle.
// @garden/memory ships a better-sqlite3 adapter for Node tests; on device we
// use the pure-JS repository in src/core/query/repository.ts.
config.resolver.blockList = [/\/node_modules\/better-sqlite3\/.*/];

// Provide empty shims for Node built-ins that transitively leak through deps.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "better-sqlite3": path.resolve(__dirname, "src/core/query/better-sqlite3-shim.js")
};

module.exports = config;
