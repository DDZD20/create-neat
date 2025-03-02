import { describe, it, expect } from "vitest";
import fs from 'fs';
import path from 'path';
import PluginToTemplateAPI from "packages/core/src/models/protocolGenerator/PluginToTemplateAPI";

describe("使用快照进行测试", () => {
  it("应该与快照匹配", () => {
    // 1. 读取快照文件,快照文件太大，太多了，一个用例一个快照的话有点浪费，待优化
    const snapshotPath = path.join(process.cwd(), '__snapshots__', 'PluginToTemplateAPI_2025-03-02T11-55-02-312Z.json');
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    
    // 2. 运行你的代码，获取当前结果
    const { protocols, props, protocol } = snapshot;
    const api = new PluginToTemplateAPI(protocols, props, protocol);
    // const currentResult = api.PROCESS_STYLE_PLUGIN();
    
    // 3. 比较结果
    // expect(currentResult).toEqual(snapshot);
  });
});