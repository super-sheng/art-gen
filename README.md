# 🎨 Art-Gen

A powerful command-line tool for automatically generating TypeScript interface type definitions from JSON APIs.

## ✨ Features

- 🔗 **Single API Generation** - Generate TypeScript types from a single API URL
- 📦 **Batch Generation** - Batch generate type files from multiple API endpoints
- 🎯 **Interactive Mode** - User-friendly question-and-answer interface
- 🖥️ **Command Line Mode** - Support for traditional command line arguments
- 📁 **Smart Paths** - Default save to desktop, support custom paths
- ✅ **Input Validation** - Automatic validation of URLs and file paths
- 🌐 **Auto Type Inference** - Intelligent analysis of JSON structure to generate accurate TypeScript types

## 🚀 Installation

### Method 1: Using npx (Recommended)
```bash
npx @seanup/art-gen
```

### Method 2: Global Installation
```bash
npm install -g @seanup/art-gen
# Then you can use directly
art-gen
```

### Method 3: Local Development
```bash
# Clone the project
git clone https://github.com/super-sheng/art-gen
cd art-gen

# Install dependencies
pnpm install
```

## 📖 Usage

### Interactive Mode (Recommended)

The simplest way to use, run directly:

```bash
# Using npx
npx @seanup/art-gen

```

Or explicitly start interactive mode:

```bash
# Using npx
npx @seanup/art-gen interactive
npx @seanup/art-gen i  # Shorthand

# Or after global installation
art-gen interactive
art-gen i  # Shorthand
```

Interactive mode will guide you through the following steps:
1. Select generation mode (single API or batch generation)
2. Enter API information
3. Choose save location (default desktop)
4. Automatically generate type files

### Command Line Mode

#### Single API Generation

```bash
# Basic usage
npx @seanup/art-gen url https://jsonplaceholder.typicode.com/posts/1

# Specify output file
npx @seanup/art-gen url https://api.example.com/user -o ./types/User.ts

# Specify type name
npx @seanup/art-gen url https://api.example.com/user -n UserProfile -o ./User.ts

# Usage after global installation
art-gen url https://jsonplaceholder.typicode.com/posts/1
```

#### Batch Generation

```bash
# Basic usage (space-separated)
npx @seanup/art-gen batch https://jsonplaceholder.typicode.com /posts/1 /users/1 /comments/1

# Specify output directory and prefix
npx @seanup/art-gen batch https://api.example.com /users /posts /comments -o ./types -p Api

# Usage after global installation
art-gen batch https://jsonplaceholder.typicode.com /posts/1 /users/1 /comments/1

# Note: Command line mode uses space-separated paths, interactive mode supports comma or space separation
```

## 📝 Command Reference

### `interactive` or `i`
Start the interactive type generator with a question-and-answer approach.

### `url <apiUrl>`
Generate TypeScript types from a single API URL.

**Options:**
- `-o, --output <file>` - Specify output file path
- `-n, --name <typeName>` - Specify custom type name

### `batch <domain> <paths...>`
Batch generate type files from domain and multiple paths.

**Options:**
- `-o, --output <dir>` - Specify output directory
- `-p, --prefix <prefix>` - Specify type name prefix

## 🌰 Examples

### Example 1: Generate Single User Type
```bash
npx @seanup/art-gen url https://jsonplaceholder.typicode.com/users/1
```

Generated type file example:
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

### Example 2: Batch Generate Multiple Types
```bash
npx @seanup/art-gen batch https://jsonplaceholder.typicode.com /users/1 /posts/1 /comments/1 -p Api
```

Will generate:
- `ApiUsers.ts`
- `ApiPosts.ts` 
- `ApiComments.ts`

### Example 3: Interactive Generation
```bash
npx @seanup/art-gen
```

```
🚀 Welcome to art-gen!
💡 Tip: You can also use "art-gen --help" to view all commands

🎯 Interactive Type Generator
? Please select generation mode: (Use arrow keys)
❯ 🔗 Single API Generation
  📦 Batch API Generation
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

Made with ❤️ using TypeScript and Node.js