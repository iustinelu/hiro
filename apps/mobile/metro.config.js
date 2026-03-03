const path = require("path");
const fs = require("fs");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const appNodeModules = path.resolve(projectRoot, "node_modules");
const workspaceNodeModules = path.resolve(workspaceRoot, "node_modules");

const config = getDefaultConfig(projectRoot);
const preferredNodeModules = fs.existsSync(path.join(appNodeModules, "react", "package.json"))
  ? appNodeModules
  : workspaceNodeModules;

config.watchFolders = Array.from(new Set([...(config.watchFolders || []), workspaceRoot]));
config.resolver.nodeModulesPaths = Array.from(
  new Set([...(config.resolver.nodeModulesPaths || []), appNodeModules, workspaceNodeModules])
);
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  react: path.resolve(preferredNodeModules, "react"),
  "react/jsx-runtime": path.resolve(preferredNodeModules, "react/jsx-runtime"),
  "react/jsx-dev-runtime": path.resolve(preferredNodeModules, "react/jsx-dev-runtime"),
  "react-dom": path.resolve(preferredNodeModules, "react-dom"),
  "react-native": path.resolve(preferredNodeModules, "react-native")
};

module.exports = config;
