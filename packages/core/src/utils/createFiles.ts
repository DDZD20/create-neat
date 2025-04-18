import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

import { readTemplateFileContent } from "./fileController";

/**
 * 生成一系列指定的文件
 * @param dir 生成目录
 * @param files 文件名
 * @example await createFiles(dir, {'.tsconfig': tsConfig })
 */

async function createFiles(dir: string, files: Record<string, string>): Promise<void> {
  try {
    const directories = new Set<string>();

    // 先收集所有需要创建的目录
    for (const name of Object.keys(files)) {
      const filePath = path.join(dir, name);
      directories.add(path.dirname(filePath));
    }

    // 异步创建所有目录，确保目录存在
    await Promise.all(
      Array.from(directories).map(async (directory) => {
        await fs.mkdir(directory, { recursive: true });
      }),
    );

    // 使用Promise.all并行写入所有文件
    await Promise.all(
      Object.entries(files).map(async ([name, content]) => {
        const filePath = path.join(dir, name);
        fs.writeFileSync(filePath, content);
      }),
    );

    // 获取项目名称并截取对应项目名称的相对路径
    const projectName = process.env.PROJECT_NAME;
    const filesName = dir.slice(dir.indexOf(projectName)) + path.sep + Object.keys(files);
    console.log(chalk`✅ {green ${filesName}} created successfully!`);
  } catch (error) {
    console.error(chalk.red("❌  Failed to create files:", error));
    throw error; // 重新抛出错误以允许调用者处理
  }
}

/**
 * 生成 readme 文件
 * @param packageManager 包管理器
 * @param template 框架名称
 * @returns 返回 readme.md 字符串
 */

function createReadmeString(packageManager: string, template: string, fileName: string) {
  try {
    const readmeInfo = readTemplateFileContent(fileName);

    // 框架首字母大写 Vue React
    const newTemplate = template.charAt(0).toUpperCase() + template.slice(1);
    if (!readmeInfo) throw new Error("README info is undefined.");
    const newReadmeInfo = readmeInfo
      .replace(/\${packageManager}/g, packageManager)
      .replace(/\${template}/g, newTemplate);

    return newReadmeInfo;
  } catch (error) {
    console.error(`Error creating readme.md :`, error);
    process.exit(1);
  }
}

export { createFiles, createReadmeString };
