const { describe, it, expect, vi } = require("vitest");
const TemplateToBuildToolAPI = require("../../../models/protocolGenerator/TemplateToBuildToolAPI").default;
const { templateToBuildToolProtocol } = require("../../../configs/protocol");

/**
 * @vitest-environment node
 */

describe("ADD_CONFIG 协议测试", () => {
  let api;

  beforeEach(() => {
    // 每个测试前创建新实例
    api = new TemplateToBuildToolAPI({}, {}, templateToBuildToolProtocol.ADD_CONFIG);
  });

  it("应该能处理手动配置", async () => {
    const config = {
      content: {
        test: 'value'
      }
    };
    
    const result = await api.ADD_CONFIG(config);
    // 根据实际预期添加断言
    expect(result).toBeDefined();
  });

  it("应该能处理插件配置", async () => {
    const config = {
      plugin: 'test-plugin'
    };
    
    const result = await api.ADD_CONFIG(config);
    // 根据实际预期添加断言
    expect(result).toBeDefined();
  });
});