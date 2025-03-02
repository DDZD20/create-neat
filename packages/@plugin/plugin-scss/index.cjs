const PluginConfig = require("./generator/index.cjs");

const pluginScss = (buildTool) => {
  return PluginConfig[buildTool] ?? console.warn(`Unsupported build tool: ${buildTool}`);
};

module.exports = {
  pluginScss,
};
