import fs from "fs";
import path from "path";
const parser = require('@babel/parser');
import astUtils from "ast"  //假引用

/**
 * 框架对构建工具协议
 * @param protocols 协议内容
 */
class TemplateToBuildToolAPI {
  protected protocols: Record<string, object>; // todo 类型考虑优化

  constructor(protocols) {
    this.protocols = protocols;
  }

  generator() {
    // todo: 加入优先级调度
    for (let protocol in this.protocols) {
      this[protocol](this.protocols[protocol]);
    }
  }
//   ENTRY_FILE_OVERRIDE:"", //入口文件配置，比如根据不同框架引入不同方法
//   ADD_CONFIG_OVERRIDE: "",  //根据框架，不同的打包工具需要不同的插件，有些是都需要用的，有些是框架独有的
//   ADD_DEPENDENCIES:"",  //框架所需要的依赖，已有现成方法，可以直接调用

  ENTRY_FILE_OVERRIDE(params) {
    const srcDir = path.resolve(__dirname, "src"); // src 目录路径
    const content = params.content;
    
    if (content) {
      //对入口文件进行一些调制，这里具体细节还待讨论。
      const entryFilePath = path.join(srcDir, "index.js"); // 假设入口文件为 index.js
      let entryContent = fs.readFileSync(entryFilePath, "utf-8");
      fs.writeFileSync(entryFilePath, entryContent, "utf-8");
    }

  }
  ADD_CONFIG_OVERRIDE(params) {
    const srcDir = path.resolve(__dirname, "src"); // src 目录路径
    const content = params.content;
    let buildToolName = 'webpack';  //以webpack为例，这里以后要写一个方法获取用户选中的构建工具
    if (content) {
      const configFilePath = path.join(srcDir,buildToolName + "config.js");
      if (buildToolName === 'webpack') {
        let configFileContent = fs.readFileSync(configFilePath, "utf-8");
        //  是直接将文件内容传进ast的方法呢？还是这里也要有一些ast的操作？
        const ast = parser.parse(configFileContent, {
          sourceType: 'module', // 如果是 ES6 模块，设置为 'module'
          plugins: [
              // 可以根据需要添加其他插件
          ],
        });// 然后再进行一些其它ast操作
        
        //或者是这样
        configFileContent = astUtils.webpackNewOpt(configFileContent);
        fs.writeFileSync(configFilePath, configFileContent, "utf-8");
      }
    }

  }
  ADD_DEPENDENCIES(params) {
    const srcDir = path.resolve(__dirname, "src"); // src 目录路径
    const content = params.content;
    //已有写好的extendPka协议，可以直接引用也可以二开。

  }
}

export default TemplateToBuildToolAPI;
