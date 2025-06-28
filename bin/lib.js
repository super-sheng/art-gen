#!/usr/bin/env node

import { program } from 'commander';
import path from 'path';
import fs from 'fs';
import Printer from '@darkobits/lolcatjs';
import { quicktype, InputData, jsonInputForTargetLanguage } from 'quicktype-core';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import inquirer from 'inquirer';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = packageJson.version;

const airplaneArt = `_
              -=\\\`\\
          |\\ ____\\_\\__
        -=\\c\`""""""" "\`)
     art   \`~~~~~/ /~~\`
             -==/ /
               '-'`;

console.log(Printer.fromString(
  ` \n  ${airplaneArt} \n `
));

console.log(Printer.fromString(
  ` \n  ✨ 使用 art-gen ${version} 批量生成接口类型定义 ✨ \n `
));

async function generateTypesFromJson (jsonData, typeName) {
  const jsonInput = await jsonInputForTargetLanguage('typescript');
  const sampleData = Array.isArray(jsonData) ? jsonData[0] : jsonData;
  
  await jsonInput.addSource({
    name: typeName,
    samples: [JSON.stringify(sampleData)],
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);
  const { lines } = await quicktype({
    inputData,
    lang: 'typescript',
    alphabetizeProperties: true,
    rendererOptions: {
      'just-types': 'true',
      'prefer-unions': 'true',
      'prefer-const-values': 'true'
    }
  });

  return lines.join('\n');
}

async function fetchJsonFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error.message);
    return null;
  }
}

function sanitizeTypeName(url) {
  return url
    .replace(/https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

async function promptForOutputPath(defaultFileName = 'types.ts') {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const defaultPath = path.join(desktopPath, defaultFileName);
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputPath',
      message: '请输入保存文件的完整路径:',
      default: defaultPath,
      validate: (input) => {
        if (!input.trim()) {
          return '路径不能为空';
        }
        const dir = path.dirname(input);
        if (!fs.existsSync(dir)) {
          return `目录不存在: ${dir}`;
        }
        return true;
      }
    }
  ]);
  
  return answers.outputPath;
}

async function promptForOutputDirectory() {
  const desktopPath = path.join(os.homedir(), 'Desktop', 'types');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputDir',
      message: '请输入保存目录的路径:',
      default: desktopPath,
      validate: (input) => {
        if (!input.trim()) {
          return '路径不能为空';
        }
        // 检查父目录是否存在
        const parentDir = path.dirname(input);
        if (!fs.existsSync(parentDir)) {
          return `父目录不存在: ${parentDir}`;
        }
        return true;
      }
    }
  ]);
  
  return answers.outputDir;
}

async function interactiveMode() {
  console.log('\n🎯 交互式类型生成器');
  
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: '请选择生成模式:',
      choices: [
        { name: '🔗 单个 API 生成', value: 'single' },
        { name: '📦 批量 API 生成', value: 'batch' }
      ]
    }
  ]);

  if (mode === 'single') {
    await interactiveSingleMode();
  } else {
    await interactiveBatchMode();
  }
}

async function interactiveSingleMode() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiUrl',
      message: '请输入 API URL:',
      validate: (input) => {
        if (!input.trim()) {
          return 'URL 不能为空';
        }
        try {
          new URL(input);
          return true;
        } catch {
          return '请输入有效的 URL';
        }
      }
    },
    {
      type: 'input',
      name: 'typeName',
      message: '请输入类型名称 (留空则自动生成):',
    }
  ]);

  console.log(`\n🔍 Fetching data from: ${answers.apiUrl}`);
  
  const jsonData = await fetchJsonFromUrl(answers.apiUrl);
  if (!jsonData) {
    process.exit(1);
  }

  const typeName = answers.typeName || sanitizeTypeName(answers.apiUrl);
  console.log(`\n⚡ Generating TypeScript types for: ${typeName}`);
  
  try {
    const types = await generateTypesFromJson(jsonData, typeName);
    const outputPath = await promptForOutputPath(`${typeName}.ts`);
    
    fs.writeFileSync(outputPath, types);
    console.log(`\n✅ Types generated successfully!`);
    console.log(`📁 Output file: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating types:', error.message);
    process.exit(1);
  }
}

async function interactiveBatchMode() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'domain',
      message: '请输入基础域名 (例如: https://api.example.com):',
      validate: (input) => {
        if (!input.trim()) {
          return '域名不能为空';
        }
        try {
          new URL(input);
          return true;
        } catch {
          return '请输入有效的域名';
        }
      }
    },
    {
      type: 'input',
      name: 'paths',
      message: '请输入 API 路径，用逗号或空格分隔 (例如: /users, /posts, /comments 或 /users /posts /comments):',
      validate: (input) => {
        if (!input.trim()) {
          return 'API 路径不能为空';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'prefix',
      message: '请输入类型名称前缀 (可选):',
    }
  ]);

  const domain = answers.domain;
  // 支持逗号或空格分隔
  const paths = answers.paths
    .split(/[,\s]+/)  // 使用正则表达式匹配逗号或空格
    .map(p => p.trim())
    .filter(p => p);
  const prefix = answers.prefix || '';

  console.log(`\n🔍 Processing ${paths.length} endpoints from domain: ${domain}`);
  
  const outputDir = await promptForOutputDirectory();
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];
  
  for (const pathStr of paths) {
    const fullUrl = `${domain.replace(/\/$/, '')}/${pathStr.replace(/^\//, '')}`;
    console.log(`\n📡 Fetching: ${fullUrl}`);
    
    const jsonData = await fetchJsonFromUrl(fullUrl);
    if (!jsonData) {
      console.log(`⚠️  Skipping ${fullUrl} due to fetch error`);
      continue;
    }

    const typeName = prefix + sanitizeTypeName(pathStr);
    console.log(`⚡ Generating types for: ${typeName}`);
    
    try {
      const types = await generateTypesFromJson(jsonData, typeName);
      const fileName = `${typeName}.ts`;
      const filePath = path.join(outputDir, fileName);
      
      fs.writeFileSync(filePath, types);
      results.push({ path: pathStr, file: filePath, typeName });
      console.log(`✅ Generated: ${fileName}`);
    } catch (error) {
      console.error(`❌ Error generating types for ${pathStr}:`, error.message);
    }
  }

  console.log(`\n🎉 Batch generation complete!`);
  console.log(`📊 Successfully generated ${results.length}/${paths.length} type files`);
  console.log(`📁 Output directory: ${outputDir}`);
  
  if (results.length > 0) {
    console.log('\n📝 Generated files:');
    results.forEach(result => {
      console.log(`  • ${result.file} (${result.typeName})`);
    });
  }
}

program
  .name('art-gen')
  .description('CLI tool to generate TypeScript interface definitions from JSON APIs')
  .version(version);

// 交互式命令
program
  .command('interactive')
  .alias('i')
  .description('启动交互式类型生成器')
  .action(async () => {
    await interactiveMode();
  });

program
  .command('url <apiUrl>')
  .description('Generate TypeScript types from a single API URL')
  .option('-o, --output <file>', 'Output file path')
  .option('-n, --name <typeName>', 'Custom type name')
  .action(async (apiUrl, options) => {
    console.log(`\n🔍 Fetching data from: ${apiUrl}`);
    
    const jsonData = await fetchJsonFromUrl(apiUrl);
    if (!jsonData) {
      process.exit(1);
    }

    const typeName = options.name || sanitizeTypeName(apiUrl);
    console.log(`\n⚡ Generating TypeScript types for: ${typeName}`);
    
    try {
      const types = await generateTypesFromJson(jsonData, typeName);
      
      // 如果没有指定输出路径，询问用户
      const outputPath = options.output || await promptForOutputPath(`${typeName}.ts`);
      
      fs.writeFileSync(outputPath, types);
      console.log(`\n✅ Types generated successfully!`);
      console.log(`📁 Output file: ${outputPath}`);
    } catch (error) {
      console.error('❌ Error generating types:', error.message);
      process.exit(1);
    }
  });

program
  .command('batch <domain> <paths...>')
  .description('Generate TypeScript types from domain + multiple paths')
  .option('-o, --output <dir>', 'Output directory')
  .option('-p, --prefix <prefix>', 'Type name prefix', '')
  .action(async (domain, paths, options) => {
    console.log(`\n🔍 Processing ${paths.length} endpoints from domain: ${domain}`);
    
    // 如果没有指定输出目录，询问用户
    const outputDir = options.output || await promptForOutputDirectory();
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const results = [];
    
    for (const pathStr of paths) {
      const fullUrl = `${domain.replace(/\/$/, '')}/${pathStr.replace(/^\//, '')}`;
      console.log(`\n📡 Fetching: ${fullUrl}`);
      
      const jsonData = await fetchJsonFromUrl(fullUrl);
      if (!jsonData) {
        console.log(`⚠️  Skipping ${fullUrl} due to fetch error`);
        continue;
      }

      const typeName = options.prefix + sanitizeTypeName(pathStr);
      console.log(`⚡ Generating types for: ${typeName}`);
      
      try {
        const types = await generateTypesFromJson(jsonData, typeName);
        const fileName = `${typeName}.ts`;
        const filePath = path.join(outputDir, fileName);
        
        fs.writeFileSync(filePath, types);
        results.push({ path: pathStr, file: filePath, typeName });
        console.log(`✅ Generated: ${fileName}`);
      } catch (error) {
        console.error(`❌ Error generating types for ${pathStr}:`, error.message);
      }
    }

    console.log(`\n🎉 Batch generation complete!`);
    console.log(`📊 Successfully generated ${results.length}/${paths.length} type files`);
    console.log(`📁 Output directory: ${outputDir}`);
    
    if (results.length > 0) {
      console.log('\n📝 Generated files:');
      results.forEach(result => {
        console.log(`  • ${result.file} (${result.typeName})`);
      });
    }
  });

// 主函数
async function main() {
  // 如果没有提供任何命令，启动交互模式
  if (process.argv.length === 2) {
    console.log('\n🚀 欢迎使用 art-gen!');
    console.log('💡 提示: 你也可以使用 "art-gen --help" 查看所有命令');
    await interactiveMode();
  } else {
    program.parse();
  }
}

// 运行主函数
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});