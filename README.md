# 🎨 Art-Gen

一个强大的命令行工具，用于从 JSON API 自动生成 TypeScript 接口类型定义。

## ✨ 特性

- 🔗 **单个 API 生成** - 从单个 API URL 生成 TypeScript 类型
- 📦 **批量生成** - 从多个 API 端点批量生成类型文件
- 🎯 **交互式模式** - 友好的问答式操作界面
- 🖥️ **命令行模式** - 支持传统命令行参数操作
- 📁 **智能路径** - 默认保存到桌面，支持自定义路径
- ✅ **输入验证** - 自动验证 URL 和文件路径
- 🌐 **自动类型推断** - 智能分析 JSON 结构生成准确的 TypeScript 类型

## 🚀 安装

### 方式一：使用 npx（推荐）
```bash
npx art-gen
```

### 方式二：全局安装
```bash
npm install -g art-gen
# 然后可以直接使用
art-gen
```

### 方式三：本地开发
```bash
# 克隆项目
git clone <repository-url>
cd art-gen

# 安装依赖
pnpm install
```

## 📖 使用方法

### 交互式模式（推荐）

最简单的使用方式，直接运行：

```bash
# 使用 npx
npx art-gen

# 或全局安装后
art-gen
```

或者明确启动交互模式：

```bash
# 使用 npx
npx art-gen interactive
npx art-gen i  # 简写

# 或全局安装后
art-gen interactive
art-gen i  # 简写
```

交互式模式会引导你完成以下步骤：
1. 选择生成模式（单个 API 或批量生成）
2. 输入 API 信息
3. 选择保存位置（默认桌面）
4. 自动生成类型文件

### 命令行模式

#### 单个 API 生成

```bash
# 基本用法
npx art-gen url https://jsonplaceholder.typicode.com/posts/1

# 指定输出文件
npx art-gen url https://api.example.com/user -o ./types/User.ts

# 指定类型名称
npx art-gen url https://api.example.com/user -n UserProfile -o ./User.ts

# 全局安装后的用法
art-gen url https://jsonplaceholder.typicode.com/posts/1
```

#### 批量生成

```bash
# 基本用法（空格分隔）
npx art-gen batch https://jsonplaceholder.typicode.com /posts/1 /users/1 /comments/1

# 指定输出目录和前缀
npx art-gen batch https://api.example.com /users /posts /comments -o ./types -p Api

# 全局安装后的用法
art-gen batch https://jsonplaceholder.typicode.com /posts/1 /users/1 /comments/1

# 注意：命令行模式使用空格分隔路径，交互式模式支持逗号或空格分隔
```

## 📝 命令详解

### `interactive` 或 `i`
启动交互式类型生成器，通过问答方式完成操作。

### `url <apiUrl>`
从单个 API URL 生成 TypeScript 类型。

**选项：**
- `-o, --output <file>` - 指定输出文件路径
- `-n, --name <typeName>` - 指定自定义类型名称

### `batch <domain> <paths...>`
从域名和多个路径批量生成类型文件。

**选项：**
- `-o, --output <dir>` - 指定输出目录
- `-p, --prefix <prefix>` - 指定类型名称前缀

## 🌰 使用示例

### 示例 1：生成单个用户类型
```bash
npx art-gen url https://jsonplaceholder.typicode.com/users/1
```

生成的类型文件示例：
```typescript
export interface Users {
    id: number;
    name: string;
    username: string;
    email: string;
    address: Address;
    phone: string;
    website: string;
    company: Company;
}

export interface Address {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: Geo;
}
```

### 示例 2：批量生成多个类型
```bash
npx art-gen batch https://jsonplaceholder.typicode.com /users/1 /posts/1 /comments/1 -p Api
```

将生成：
- `ApiUsers.ts`
- `ApiPosts.ts` 
- `ApiComments.ts`

### 示例 3：交互式生成
```bash
npx art-gen
```

```
🚀 欢迎使用 art-gen!
💡 提示: 你也可以使用 "art-gen --help" 查看所有命令

🎯 交互式类型生成器
? 请选择生成模式: (Use arrow keys)
❯ 🔗 单个 API 生成
  📦 批量 API 生成
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

Made with ❤️ using TypeScript and Node.js