/** 通用协议常量，定义了跨不同工具和框架交互的协议类型。*/
const globalProtocol = {
  ENTRY_FILE: "ENTRY_FILE", // 入口文件配置，如：入口文件引入全局 less、scss
} as const;

/** 插件对框架的协议。 */
const pluginToTemplateProtocol = {
  ...globalProtocol,
  /** 处理样式协议，如：less、scss。 */
  PROCESS_STYLE_PLUGIN: "PROCESS_STYLE_PLUGIN",
} as const;

/** 插件对构建工具的协议 */
const pluginToBuildToolProtocol = {
  ...globalProtocol,
} as const;

// 框架对构建工具的协议
const templateToBuildToolProtocol = {
  ...globalProtocol,
  ADD_CONFIG: "ADD_CONFIG", //根据框架，不同的打包工具需要不同的插件，有些是都需要用的，有些是框架独有的
} as const;

export { pluginToTemplateProtocol, pluginToBuildToolProtocol, templateToBuildToolProtocol };
