const PluginConfig = require("./generator/index.cjs");

const pluginPinia = (buildTool) => {
  return PluginConfig[buildTool] ?? console.warn(`Unsupported build tool: ${buildTool}`);
};

module.exports = {
  pluginPinia,
};
