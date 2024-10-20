import { multiselect, select, intro, confirm, text } from "@clack/prompts";
import chalk from "chalk";
import { execSync } from "child_process";

import { buildToolType } from "../types";

import { getPreset, defaultPreset } from "./preset";
import { getNpmSource } from "./getnpmSource";
import { savePresetToRcPath, getRcPath, loadRcOptions } from "./options";

const registryInfo = execSync("npm config get registry").toString().trim();
const npmSource: any = getNpmSource();
const rcPath = getRcPath(".neatrc");
const skip = ">> skip";
/**
 * 表示用户对项目预设的回应。
 * @interface Responses
 * @property {string} template - 选择的模板名称。
 * @property {string} buildTool - 选择的构建工具名称。
 * @property {string[]} plugins - 选择的插件列表。
 * @property {string} packageManager - 选择的包管理器名称。
 * @property {string} npmSource - 选择的 npm 源名称。
 * @property {boolean} extraConfigFiles - 选择文件生成位置 'In dedicated config files' --> true 'In packagejson' --> false。
 */
interface Responses {
  template: string;
  buildTool?: buildToolType;
  plugins: string[];
  packageManager: string;
  npmSource: string;
  extraConfigFiles: boolean;
  language: string;
  transpilers: string;
}

/**
 *
 * @param plugins 预设的插件对象
 * @returns 返回默认预设的插件组合
 */
function getPluginsName(plugins: Record<string, any>) {
  const pluginsKey = Object.keys(plugins);
  const pluginsName = pluginsKey.reduce((pre, name, idx) => {
    return pre + name + (idx === pluginsKey.length - 1 ? "" : ", ");
  }, "");
  return pluginsName;
}

/**
 * @description 终端交互，获取用户的项目预设
 * @returns 返回用户的项目预设 Responses
 */
async function projectSelect() {
  const responses: Responses = {
    template: "",
    plugins: [],
    packageManager: "npm",
    npmSource: "https://registry.npmjs.org/",
    extraConfigFiles: true,
    language: "javascript",
    transpilers: "babel",
  };

  intro(chalk.green(" create-you-app "));

  // 从用户系统文件夹中获取用户保存的配置
  const rcOptions = loadRcOptions();
  // 将自定义预设与默认预设进行合并
  const allPresets = Object.assign({}, rcOptions.presets, defaultPreset);

  // 根据所有预设获取预设选项列表
  function getPresetListOptions() {
    return Object.keys(allPresets).map((key) => {
      const tem = allPresets[key].template;
      const pluginName = getPluginsName(allPresets[key].plugins);
      const buildTool = allPresets[key].buildTool;
      let label;
      if (key in defaultPreset) {
        label = `Default-${key}(${chalk.yellow("[" + tem + "] ")}${chalk.yellow(pluginName)}, ${chalk.yellow(buildTool)})`;
      } else {
        label = `${key}(${chalk.yellow("[" + tem + "] ")}${chalk.yellow(pluginName)}, ${chalk.yellow(buildTool)})`;
      }
      return {
        value: key,
        label,
      };
    });
  }

  const presetName = (await select({
    message: "Please pick a preset:",
    options: [...getPresetListOptions(), { value: "", label: "Manually select preset" }],
  })) as string;

  if (presetName) {
    if (!allPresets[presetName].npmSource) {
      allPresets[presetName].npmSource = registryInfo;
    }
    return allPresets[presetName];
  }

  // 选择模板预设
  responses.template = (await select({
    message: "Pick a template please",
    options: [
      { value: "common-lib", label: "common-lib" },
      { value: "vue", label: "vue" },
      { value: "react", label: "react" },
      { value: "test", label: "test" },
    ],
  })) as string;

  // 选择模板预设
  responses.language = (await select({
    message: "Please select a language.",
    options: [
      { value: "javascript", label: "javascript" },
      { value: "typescript", label: "typescript" },
    ],
  })) as string;

  // 选择构建工具
  responses.buildTool = (await select({
    message: "Pick a build tools for your project",
    options: [
      { value: "webpack", label: "webpack" },
      { value: "vite", label: "vite" },
      { value: "rollup", label: "rollup" },
    ],
  })) as buildToolType;

  responses.transpilers = (await select({
    message: "Please select a JavaScript/TypeScript compiler for your project:",
    options: [
      { value: "babel", label: "babel" },
      { value: "swc", label: "swc" },
    ],
  })) as string;

  // 选择普通插件
  const normalPlugins = (await multiselect({
    message: `Pick normal plugins for your project.(${chalk.greenBright(
      "<space>",
    )} select, ${chalk.greenBright("<a>")} toggle all, ${chalk.greenBright(
      "<i>",
    )} invert selection,${chalk.greenBright("<enter>")} next step)`,
    options: [
      { value: "eslint", label: "eslint" },
      { value: "prettier", label: "prettier" },
      { value: "husky", label: "husky" },
    ],
    required: false,
  })) as string[];

  // 根据不同框架加载对应的插件列表
  const specialPluginsMap = {
    react: [
      { key: "mobx", value: "mobx" },
      { key: "react-router", value: "react-router" },
      { key: "antd", value: "antd" },
      {
        key: "null",
        value: chalk.greenBright(skip),
        hint: "If you select this, none of the special plugins will be installed.",
      },
    ],
    vue: [
      { key: "vuex", value: "vuex" },
      { key: "vue-router", value: "vue-router" },
      { key: "element-plus", value: "element-plus" },
      { key: "pinia", value: "pinia" },
      {
        key: "null",
        value: chalk.greenBright(skip),
        hint: "If you select this, none of the special plugins will be installed.",
      },
    ],
  };

  // 选择特殊插件(框架专属插件)
  const specialPlugins = (await multiselect({
    message: `Pick special plugins for your project.(${chalk.greenBright(
      "<space>",
    )} select, ${chalk.greenBright("<a>")} toggle all, ${chalk.greenBright(
      "<i>",
    )} invert selection,${chalk.greenBright("<enter>")} next step)`,
    options: specialPluginsMap[responses.template],
    required: false,
  })) as string[];
  if (specialPlugins.includes(chalk.greenBright(skip))) {
    specialPlugins.length = 0;
  }

  responses.plugins = [...normalPlugins, ...specialPlugins];

  // 选择包管理器
  responses.packageManager = (await select({
    message: "Pick a packageManager for your project",
    options: [
      { value: "pnpm", label: "pnpm" },
      { value: "yarn", label: "yarn" },
      { value: "npm", label: "npm" },
    ],
  })) as string;

  const changeNpmSource = (await confirm({
    message: "Would you like to switch the npm registry?",
    initialValue: false, // 默认选项
  })) as boolean;

  if (changeNpmSource === true) {
    // 选择npm源
    responses.npmSource = (await select({
      message: "Pick a npm source for your project",
      initialValue: registryInfo,
      options: npmSource,
    })) as string;
  }

  // 选择插件配置文件生成位置
  responses.extraConfigFiles = (await select({
    message:
      "Where do you want to place the configurations, such as Babel, ESLint, and other plugins?",
    options: [
      { value: true, label: "In dedicated config files" },
      { value: false, label: "In package.json" },
    ],
  })) as boolean;

  // 语言插件、编译器插件、插件统一合并到allPlugins
  let allPlugin: string[];
  if (responses.language && responses.language === "typescript") {
    allPlugin = [...responses.plugins, responses.language, responses.transpilers];
  } else {
    allPlugin = [...responses.plugins, responses.transpilers];
  }
  const preset = getPreset(
    responses.template,
    responses.buildTool,
    allPlugin,
    responses.packageManager,
    responses.npmSource,
    responses.extraConfigFiles,
  );

  // 选择是否将此次预设保存到系统文件中
  const isSavePreset = await select({
    message: "Save this as a preset for future projects?",
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  });

  if (isSavePreset) {
    const saveName = (await text({
      message: "Save preset as:",
      placeholder: "Please input presets name:",
    })) as string;
    if (saveName && savePresetToRcPath(preset, saveName)) {
      console.log(`🎉  Preset ${chalk.yellow(saveName)} saved in ${chalk.yellow(rcPath)}`);
    }
  }

  return preset;
}

export { projectSelect };
