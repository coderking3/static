# antfu-eslint-config vs king3-eslint-config 完整对比报告

> 生成时间: 2026-04-23
> antfu-eslint-config: v8.2.0 (51 source files)
> king3-eslint-config: v5.0.0 (30 source files)

---

## 目录

- [一、项目结构总览](#一项目结构总览)
- [二、入口文件 index.ts](#二入口文件-indexts)
- [三、Factory 工厂函数](#三factory-工厂函数)
- [四、类型系统 types.ts](#四类型系统-typests)
- [五、工具函数 utils.ts](#五工具函数-utilsts)
- [六、Glob 模式 globs.ts](#六glob-模式-globsts)
- [七、环境检测](#七环境检测)
- [八、共有配置详细对比](#八共有配置详细对比)
  - [8.1 javascript.ts](#81-javascriptts)
  - [8.2 typescript.ts](#82-typescriptts)
  - [8.3 imports.ts](#83-importsts)
  - [8.4 vue.ts](#84-vuets)
  - [8.5 react.ts](#85-reactts)
  - [8.6 nextjs.ts](#86-nextjsts)
  - [8.7 perfectionist.ts](#87-perfectionistts)
  - [8.8 jsonc.ts](#88-jsoncts)
  - [8.9 yaml.ts](#89-yamlts)
  - [8.10 markdown.ts](#810-markdownts)
  - [8.11 pnpm.ts](#811-pnpmts)
  - [8.12 sort 排序文件](#812-sort-排序文件)
  - [8.13 jsdoc.ts](#813-jsdocts)
  - [8.14 node.ts](#814-nodets)
  - [8.15 comments.ts](#815-commentsts)
  - [8.16 ignores.ts](#816-ignorests)
  - [8.17 command.ts / regexp.ts / unicorn.ts / unocss.ts](#817-commandts--regexpts--unicornts--unocssts)
- [九、antfu 独有的配置模块](#九antfu-独有的配置模块)
  - [9.1 框架支持 (Angular / Astro / Solid / Svelte)](#91-框架支持)
  - [9.2 stylistic.ts](#92-stylisticts)
  - [9.3 test.ts](#93-testts)
  - [9.4 e18e.ts](#94-e18ets)
  - [9.5 jsx.ts](#95-jsxts)
  - [9.6 formatters.ts](#96-formattersts)
  - [9.7 toml.ts](#97-tomlts)
  - [9.8 disables.ts](#98-disablests)
  - [9.9 config-presets.ts](#99-config-presetsts)
- [十、king3 独有的配置模块](#十king3-独有的配置模块)
  - [10.1 prettier.ts](#101-prettierts)
  - [10.2 sortPnpmWorkspace.ts](#102-sortpnpmworkspacets)
- [十一、插件重命名映射差异](#十一插件重命名映射差异)
- [十二、总结与集成建议优先级](#十二总结与集成建议优先级)

---

## 一、项目结构总览

```
antfu-eslint-config/src/           king3-eslint-config/src/
├── cli/              (6 files)    (无)
├── cli.ts                         (无)
├── config-presets.ts              (无)
├── configs/          (28 files)   ├── configs/          (22 files)
├── factory.ts                     ├── factory.ts
├── globs.ts                       ├── globs.ts
├── index.ts                       ├── index.ts
├── types.ts                       ├── types.ts
├── typegen.d.ts                   ├── typegen.d.ts
├── utils.ts                       ├── utils.ts
└── vender/prettier-types.ts       ├── env.ts            (king3 独有)
                                   └── configs/prettier.ts (king3 独有)
```

| 维度 | antfu | king3 |
|------|-------|-------|
| 源文件总数 | 51 | 30 |
| Config 模块数 | 28 | 22 |
| 框架支持 | Angular, Astro, React, Solid, Svelte, Vue (2/3), Next.js | React, Vue (3), Next.js |
| 格式化方案 | @stylistic + formatters (Prettier/dprint 外部调用) | eslint-plugin-prettier (Prettier 作为 lint 规则) |
| 编辑器感知 | `isInEditor` 检测 + 规则降级 | 无 |
| CLI 工具 | 有（项目初始化向导） | 无 |

---

## 二、入口文件 index.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| 默认导出 | `export default antfu` | `export default king3` | — |
| 别名导出 | 无 | `export { king3 as defineConfig }` | king3 做法更好，保留 |
| `config-presets` | `export * from './config-presets'` | 无 | 可选：需要时再加 |
| `utils` 导出 | `export * from './utils'` | `export * from './utils'` | 相同 |

---

## 三、Factory 工厂函数

### 3.1 函数签名

```typescript
// antfu: 省略 files | ignores
antfu(options: OptionsConfig & Omit<TypedFlatConfigItem, 'files' | 'ignores'>, ...userConfigs)

// king3: 只省略 files
king3(options: OptionsConfig & Omit<TypedFlatConfigItem, 'files'>, ...userConfigs)
```

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| `files` 校验 | 传入 `files` 会抛错提示 | 无校验 | **推荐集成**：防止用户误用 |
| `ignores` 省略 | 省略 `ignores` | 不省略 | 保持 king3 当前做法 |

### 3.2 支持的选项 & 默认值

| 选项 | antfu 默认值 | king3 默认值 | 集成建议 |
|------|-------------|-------------|----------|
| `angular` | `false` | 无 | 不需要 |
| `astro` | `false` | 无 | 不需要 |
| `autoRenamePlugins` | `true` | `true` | 相同 |
| `e18e` | `true` | 无 | **可选集成** |
| `gitignore` | `true` | `true` | 相同 |
| `imports` | `true` (可关闭) | 始终开启 | **可选**：加开关 |
| `isInEditor` | 自动检测 | 无 | **推荐集成** |
| `jsdoc` | `true` (可关闭) | 始终开启 | **可选**：加开关 |
| `jsx` | `true` | 无（注释掉了） | **可选集成** |
| `node` | `true` (可关闭) | 始终开启 | **可选**：加开关 |
| `nextjs` | `false` | `false` | 相同 |
| `pnpm` | `!!findUpSync(...)` (自动检测) | `false` | **推荐集成**：自动检测更好 |
| `prettier` | 无 | `true` | king3 独有，保留 |
| `react` | `false` | `hasReact()` 自动检测 | king3 更好，保留 |
| `regexp` | `true` | `true` | 相同 |
| `solid` | `false` | 无 | 不需要 |
| `stylistic` | `{}` (默认开启) | 无 | 不需要 (king3 用 prettier) |
| `svelte` | `false` | 无 | 不需要 |
| `test` | `true` (默认开启) | 无 | **推荐集成** |
| `toml` | `true` | 无 | **可选集成** |
| `type` (app/lib) | `'app'` | 无 | **可选集成** |
| `typescript` | `isPackageExists(...)` | `hasTypeScript()` | king3 更好（集中管理），保留 |
| `unicorn` | `true` | `true` | 相同 |
| `unocss` | `false` | `hasUnoCSS()` 自动检测 | king3 更好，保留 |
| `vue` | 自动检测 Vue 包 | `hasVue()` | king3 更好，保留 |

### 3.3 编辑器模式

antfu 在检测到编辑器环境后会：
- `console.log` 提示正在编辑器模式
- 通过 `disableRulesFix` 禁用以下规则的自动修复：
  - `unused-imports/no-unused-imports`
  - `test/no-only-tests`
  - `prefer-const`

| 集成建议 | **推荐集成**：编辑器模式下禁用自动修复可以避免编码过程中代码被自动删除/修改 |
|---------|------|

### 3.4 Disables 配置

antfu 在末尾追加了 `disables()` 配置，为特定文件模式禁用规则。king3 无此配置。

| 集成建议 | **推荐集成**：对 scripts/cli/bin/dts/config 文件的规则禁用很实用 |
|---------|------|

---

## 四、类型系统 types.ts

### antfu 独有的类型接口

| 接口 | 用途 | 集成建议 |
|------|------|----------|
| `OptionsStylistic` / `StylisticConfig` | @stylistic 配置 | 不需要 (king3 用 prettier) |
| `OptionsVue` | Vue sfcBlocks, vueVersion, a11y | **可选**：如果要增强 Vue 配置 |
| `OptionsJSXA11y` / `OptionsJSX` | JSX a11y 支持 | **可选**：如果要加 jsx a11y |
| `OptionsFormatters` | CSS/HTML/XML 等格式化 | 不需要 |
| `OptionsE18e` | 现代化规则选项 | 跟随 e18e 配置决定 |
| `OptionsMarkdown` | Markdown gfm 选项 | **可选** |
| `OptionsProjectType` | `type: 'app' \| 'lib'` | **可选集成** |
| `OptionsTypeScriptErasableOnly` | TS 可擦除语法 | **可选** |
| `OptionsPnpm` | pnpm catalogs 选项 | 跟随 pnpm 配置决定 |

### king3 独有

| 特性 | 说明 |
|------|------|
| `Linter.Config` 替代 `ConfigWithExtends` | 更简洁的类型引用 |
| `prettier` 选项 | king3 独有的 prettier 开关 |

### OptionsConfig 选项数量

- antfu: **56+ 个属性**
- king3: **~24 个属性**

---

## 五、工具函数 utils.ts

| 函数 | antfu | king3 | 集成建议 |
|------|-------|-------|----------|
| `combine()` | 有 | 有 | 相同 |
| `renameRules()` | 有 | 有 | 相同 |
| `interopDefault()` | 有 | 有 | 相同 |
| `isPackageInScope()` | 有 | 有 | 相同 |
| `ensurePackages()` | 有 | 有 | 相同 |
| `parserPlain` | 有 | 无 | 按需集成（toml/formatters 需要） |
| `renamePluginInConfigs()` | 有 | 无 | 按需集成 |
| `toArray()` | 有 | 无 | 按需集成 |
| `isInEditorEnv()` | 有 | 无 | **推荐集成**（配合编辑器模式） |
| `isInGitHooksOrLintStaged()` | 有 | 无 | **可选集成** |

---

## 六、Glob 模式 globs.ts

### antfu 独有的 Glob 常量

| 常量 | 值 | 集成建议 |
|------|---|----------|
| `GLOB_POSTCSS` | PostCSS 文件 | 不需要 |
| `GLOB_SVELTE` | Svelte 文件 | 不需要 |
| `GLOB_TOML` | TOML 文件 | 跟随 toml 配置决定 |
| `GLOB_ASTRO` / `GLOB_ASTRO_TS` | Astro 文件 | 不需要 |
| `GLOB_GRAPHQL` | GraphQL 文件 | 不需要 |

### king3 独有的结构化常量

| 常量 | 说明 |
|------|------|
| `GLOB_NODE_MODULES` | `'**/node_modules' as const` |
| `GLOB_DIST` | `'**/dist' as const` |
| `GLOB_LOCKFILE` | 锁文件数组 |

### GLOB_EXCLUDE 差异

| 差异 | antfu | king3 |
|------|-------|-------|
| `.vite-inspect` | 包含 | 不包含 |
| `fixtures` | 不包含 | **包含** |
| `.svelte-kit` | 包含 | 包含 |

---

## 七、环境检测

| 方案 | antfu | king3 |
|------|-------|-------|
| 实现方式 | 内联在 factory.ts 中调用 `isPackageExists` | 集中在 `env.ts`，导出 `hasXxx()` |
| Vue 包列表 | factory.ts 顶层 `VuePackages` | env.ts 内部 `VuePackages` |
| React 检测 | 不自动检测（默认 `false`） | `hasReact()` 自动检测 |
| UnoCSS 检测 | 不自动检测（默认 `false`） | `hasUnoCSS()` 自动检测（含 4 个包） |
| TypeScript 检测 | `isPackageExists('typescript') \|\| isPackageExists('@typescript/native-preview')` | `isPackageExists('typescript')` |

| 集成建议 | king3 的集中管理更好。antfu 多检测了 `@typescript/native-preview`，**推荐加入** |
|---------|------|

---

## 八、共有配置详细对比

### 8.1 javascript.ts

**这是差异最大的配置文件。**

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| globals 版本 | `es2021` | `es2026` | king3 更新，保留 |
| 规则基础 | 手写全部 160+ 规则 | 继承 `eslintJs.configs.recommended` + 30 条覆盖 | king3 更简洁，保留 |
| `pluginAntfu` | `antfu/no-top-level-await` 等自定义规则 | 无 | 不需要 |
| `isInEditor` 支持 | `unused-imports` 在编辑器中降为 warn | 无 | **推荐集成** |

**规则严格度差异：**

| 规则 | antfu | king3 |
|------|-------|-------|
| `no-console` | `['error', { allow: ['warn', 'error'] }]` | `['warn', { allow: ['warn', 'error', 'info', 'clear'] }]` |
| `no-alert` | `'error'` | `'warn'` |
| `no-debugger` | `'error'` | `'warn'` |
| `prefer-const` | `'error'`（编辑器中 `'warn'`） | `'warn'` |
| `unused-imports/no-unused-imports` | `'error'`（编辑器中 `'warn'`） | `'warn'` |
| `dot-notation` | `['error', { allowKeywords: true }]` | `'warn'` |

**king3 独有规则：**

| 规则 | 值 |
|------|---|
| `no-duplicate-imports` | `'off'` |
| `no-inner-declarations` | `'error'` |
| `no-lonely-if` | `'error'` |
| `no-void` | `'error'` |
| `require-await` | `'off'` |

**king3 独有导出：**
- `restrictedSyntaxJs`：含 `LabeledStatement` 限制（antfu 用 `TSEnumDeclaration`）

---

### 8.2 typescript.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| 规则前缀 | `ts/` | `typescript/` | 保持 king3 风格 |
| `pluginAntfu` | 注册为插件 | 无 | 不需要 |
| `type` 项目类型 | `'app' \| 'lib'` 影响规则 | 无 | **可选集成** |
| erasable-only 支持 | 完整支持 `erasableSyntaxOnly` | 无 | **可选集成** |
| `strict-boolean-expressions` | `'error'`（带选项） | 无 | **可选集成** |
| type-aware 规则数 | 18 条 | 17 条 | 基本一致 |
| `no-duplicate-imports` | 无 | `'error'`（在 type-aware 中） | king3 独有，保留 |

**antfu 在 `type === 'lib'` 时的额外规则：**
- `ts/explicit-function-return-type: 'error'`（库项目要求显式返回类型）

---

### 8.3 imports.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| `OptionsStylistic` 支持 | 条件添加 `import/newline-after-import` | 无 | 不需要 (prettier 处理) |
| `antfu/import-dedupe` 等 | antfu 自定义规则 | 无 | 不需要 |

---

### 8.4 vue.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| Vue 版本 | Vue 2 + Vue 3 | 仅 Vue 3 | 按需加 Vue 2 |
| a11y 支持 | `eslint-plugin-vuejs-accessibility` | 无 | **可选集成** |
| SFC Blocks | `eslint-processor-vue-blocks` 复杂处理 | 默认 processor | **可选集成** |
| stylistic 规则 | 30+ 条格式化规则 | 无 | 不需要 (prettier 处理) |
| 规则总数 | 100+ 条 | ~20 条 | — |
| `vue/html-indent` | 可配置 indent | 不可配置 | 不需要 (prettier) |
| `vue/quotes` | 可配置 quotes | 硬编码 `'double'` | 不需要 (prettier) |

---

### 8.5 react.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| 规则定义方式 | 使用 `pluginReact.configs.recommended.rules` 预设 | 手写 150+ 条规则 | 各有优劣 |
| Remix / React Router 检测 | 自动检测，调整 export 命名 | 无 | **推荐集成** |
| 子插件 | dom, naming-convention, rsc, web-api | dom, hooks, hooks-extra, naming-convention, web-api | — |
| `react-hooks` 插件 | 无（由 @eslint-react 统一处理） | 显式引入 `eslint-plugin-react-hooks` | king3 更明确 |
| `react-hooks-extra` | 无 | 有 `no-direct-set-state-in-use-effect` 等 | king3 独有，保留 |
| `react-rsc` 插件 | 有 | 无 | **可选集成** |
| 严格度 | `'error'` 为主 | `'warn'` 为主 | — |
| type-aware 规则 | `no-leaked-conditional-rendering: 'error'` | `no-implicit-key: 'warn'` + `no-leaked-conditional-rendering: 'warn'` | — |
| React Refresh allowExports | 10 个 | 7 个（缺 `generateImageMetadata`, `generateSitemaps`, `viewport`） | **推荐补齐** |

---

### 8.6 nextjs.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| 错误信息包名 | `@antfu/eslint-config` | `@king-3/eslint-config` | 仅命名差异 |
| 功能实现 | 完全一致 | 完全一致 | 无需改动 |

---

### 8.7 perfectionist.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| 严格度 | 全部 `'error'` | 全部 `'warn'` | — |
| 排序选项 | 每个规则内联 | 提取 `SORT_OPTIONS` 常量 | king3 更好，保留 |
| import 分组 | 简单分组 | 详细分组 + `internalPattern: ['^[@~#]/.*']` | king3 更好，保留 |
| `newlinesBetween` | `'ignore'` | `'always'` | king3 更规范，保留 |
| `partitionByComment` | 无 | `['^Part:.*$']` | king3 独有，保留 |

---

### 8.8 jsonc.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| Parser | `language: 'jsonc/x'` | 显式 `jsonc-eslint-parser` | — |
| 规则基础 | 手写 25+ 条规则 | 继承 `recommended-with-jsonc` | king3 更简洁 |
| stylistic 规则 | 10+ 条格式化规则 | 关闭 `quote-props` 和 `quotes` | 不需要 (prettier) |

---

### 8.9 yaml.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| 规则基础 | 手写 20+ 条规则 | 继承 `standard` + `prettier` 配置 | king3 风格一致，保留 |
| stylistic 规则 | 15+ 条格式化规则 | 无 | 不需要 (prettier) |
| 可配置 indent/quotes | 有 | 无 | 不需要 (prettier) |

---

### 8.10 markdown.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| Processor | `eslint-merge-processors` 自定义合并 | 直接使用 `pluginMarkdown.configs.processor` | king3 更简洁 |
| Config 数量 | 5 个 | 2 个 | king3 更简洁 |
| gfm 选项 | 支持切换 gfm/commonmark | 无 | **可选集成** |
| 禁用规则范围 | 大量（command, perfectionist, regexp, style…） | 仅 markdown-code 相关 | **推荐参考 antfu 补充禁用规则** |
| ts 规则名 | `ts/*` | `typescript/*` | 各自风格 |

---

### 8.11 pnpm.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| 函数签名 | 接收 `OptionsPnpm` 选项 | 无参数 | **可选**：加选项支持 |
| Catalog 自动检测 | `detectCatalogUsage()` 读取 pnpm-workspace.yaml | 无 | **推荐集成** |
| `isInEditor` | autofix 行为依编辑器变化 | 无 | 跟随编辑器模式决定 |
| YAML 排序 | 180+ 行 pnpm settings 排序规则 | 无 | **可选集成** |
| Parser | `language: 'jsonc/x'` | `jsonc-eslint-parser` | — |

---

### 8.12 sort 排序文件

#### sortPackageJson()

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| 排序字段数 | 70+（含 VSCode 扩展字段） | 30+（实用子集） | **可选**：按需补充字段 |
| VSCode 扩展字段 | `publisher`, `displayName`, `icon`, `contributes`, `activationEvents` | 无 | 不常用，可忽略 |
| exports 排序 | `['types', 'import', 'require', 'default']` | `['types', 'require', 'import', 'default']` | antfu 顺序更标准，**推荐对齐** |
| git-hooks 排序 | 完整 hook 排序 | 无 | **可选集成** |

#### sortTsconfig()

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| 文件匹配 | `**/[jt]sconfig.json`（含 jsconfig） | `**/tsconfig.json` | **推荐集成**：支持 jsconfig |
| compilerOptions 数量 | 99 个 | 93 个 | **推荐补齐** |
| 额外字段 | `libReplacement`, `erasableSyntaxOnly` | 无 | **推荐补齐** |

#### sortPnpmWorkspace()

king3 独有，antfu 无此独立配置。

---

### 8.13 jsdoc.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| `OptionsStylistic` | 条件添加 stylistic 规则 | 无 | 不需要 (prettier) |
| `jsdoc/check-alignment` | 有（stylistic 开启时） | 无 | 不需要 (prettier) |
| `jsdoc/multiline-blocks` | 有（stylistic 开启时） | 无 | 不需要 (prettier) |
| 文件过滤 | `GLOB_SRC` | 无 | **可选**：加文件过滤更精准 |

---

### 8.14 node.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| Config 结构 | 2 个（setup + rules 分离） | 1 个（合并） | king3 更简洁，保留 |
| 文件过滤 | `files: [GLOB_SRC]` | 无 | **可选**：加文件过滤 |
| 规则内容 | 相同 | 相同 | — |

---

### 8.15 comments.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| 规则数 | 4 条 | 5 条 | — |
| `disable-enable-pair` | 无 | `['error', { allowWholeFile: true }]` | king3 独有，保留 |

---

### 8.16 ignores.ts

| 差异点 | antfu | king3 | 集成建议 |
|--------|-------|-------|----------|
| `ignoreTypeScript` 参数 | 有（条件忽略 TS 文件） | 无 | **可选**：特殊场景才需要 |

---

### 8.17 command.ts / regexp.ts / unicorn.ts / unocss.ts

这四个配置在两个项目中**功能完全一致**，仅命名不同（`antfu` → `king3`）。

---

## 九、antfu 独有的配置模块

### 9.1 框架支持

| 框架 | 插件 | 功能概述 |
|------|------|----------|
| **Angular** | `@angular-eslint/*` | 组件生命周期、模板语法、inject 偏好、standalone 偏好 |
| **Astro** | `eslint-plugin-astro` | 客户端指令、编译检查、弃用 API 警告、top-level await 允许 |
| **Solid** | `eslint-plugin-solid` | 组件响应性、JSX 验证、安全规则（no innerHTML）、type-aware 支持 |
| **Svelte** | `eslint-plugin-svelte` | 注释指令、生命周期、reactivity 检查、HTML 格式化 |

| 集成建议 | **不需要**（king3 聚焦 React/Vue/Next.js）。如未来需要，可按 antfu 实现参考添加 |
|---------|------|

### 9.2 stylistic.ts

使用 `@stylistic/eslint-plugin` 提供代码风格规则：
- 默认配置：2 空格缩进、单引号、无分号、启用 JSX
- 自定义 `antfu/*` 规则：consistent-chaining, consistent-list-newline, curly, if-newline, top-level-function
- `lessOpinionated` 模式：用标准 `curly: all` 替代 antfu 自定义规则

| 集成建议 | **不需要**：king3 使用 Prettier 处理格式化，stylistic 与 Prettier 职能重叠 |
|---------|------|

### 9.3 test.ts

提供测试文件的 lint 配置：
- **插件**：`@vitest/eslint-plugin`, `eslint-plugin-no-only-tests`
- **规则**：
  - `test/consistent-test-it: ['error', { fn: 'it' }]`（统一用 `it`）
  - `test/no-identical-title: 'error'`
  - `test/no-only-tests: 'error'`（编辑器中降为 `'warn'`）
  - `test/prefer-hooks-in-order: 'error'`
  - `test/prefer-lowercase-title: 'error'`
- **禁用**：在测试文件中关闭 `no-unused-expressions`, `node/prefer-global/process` 等

| 集成建议 | **推荐集成**：测试规则非常实用，防止 `.only` 泄漏到 CI、统一测试风格 |
|---------|------|

### 9.4 e18e.ts

现代化 / 性能优化规则（`eslint-plugin-e18e`）：
- 模块替换建议（用现代 API 替代旧 API）
- 性能改进建议
- 库项目启用更严格的规则

| 集成建议 | **可选集成**：对代码现代化有帮助，但优先级不高 |
|---------|------|

### 9.5 jsx.ts

独立 JSX 配置：
- 基础：启用 `ecmaFeatures.jsx`
- 可选 a11y：`eslint-plugin-jsx-a11y` recommended 规则

| 集成建议 | **可选集成**：king3 当前 JSX 支持被注释掉了。如果 React 项目需要独立 JSX lint，可以恢复 |
|---------|------|

### 9.6 formatters.ts

外部格式化器集成（`eslint-plugin-format`）：
- 支持格式：CSS, SCSS, Less, HTML, XML, SVG, Markdown, GraphQL
- 格式化器：Prettier (主要) 或 dprint (Markdown 替代)
- Slidev slides.md 特殊处理

| 集成建议 | **不需要**：king3 通过 eslint-plugin-prettier 统一处理格式化 |
|---------|------|

### 9.7 toml.ts

TOML 文件 lint（`eslint-plugin-toml`）：
- 规则：逗号风格、key 排序、数字分隔符、精度设置
- stylistic 规则：缩进、括号间距等

| 集成建议 | **可选集成**：如果项目使用 TOML 配置文件（如 Cargo.toml）则有用 |
|---------|------|

### 9.8 disables.ts

为特定文件模式禁用不适用的规则：

| 文件模式 | 禁用的规则 |
|----------|-----------|
| `**/scripts/**` | `no-top-level-await`, `no-console`, `explicit-return-type` |
| `**/cli/**`, `**/cli.ts` | `no-top-level-await`, `no-console` |
| `**/bin/**` | `no-import-dist`, `no-import-node-modules-by-path` |
| `**/*.d.ts` | `eslint-comments/*`, `no-restricted-syntax`, `unused-vars` |
| `**/*.js`, `**/*.cjs` | `ts/no-require-imports` |
| `**/*.config.ts` 等 | `no-top-level-await`, `no-console`, `explicit-return-type` |

| 集成建议 | **推荐集成**：这些禁用规则非常实用，避免在 scripts/cli/dts 等文件中产生噪音 |
|---------|------|

### 9.9 config-presets.ts

提供两个预设常量：
- `CONFIG_PRESET_FULL_ON`：启用所有功能
- `CONFIG_PRESET_FULL_OFF`：禁用所有功能

| 集成建议 | **可选**：需要时再加，目前 king3 选项较少，预设意义不大 |
|---------|------|

---

## 十、king3 独有的配置模块

### 10.1 prettier.ts

通过 `eslint-plugin-prettier` 将 Prettier 作为 ESLint 规则运行：
- 加载 `eslint-plugin-prettier/recommended` 配置
- 移除 `vue/html-self-closing` 规则（与 Prettier 冲突）
- 设置 `prettier/prettier: 'warn'`

**这是 king3 与 antfu 最核心的哲学差异**：antfu 用 @stylistic 做格式化，king3 用 Prettier。

### 10.2 sortPnpmWorkspace.ts

pnpm-workspace.yaml 排序：
- 17 个 root-level key 排序
- catalog 条目排序（含 `allowLineSeparatedGroups`）

antfu 的 pnpm-workspace 排序在 pnpm.ts 中实现，king3 单独抽取为独立配置。

---

## 十一、插件重命名映射差异

```
共有:
  '@eslint-react'               → 'react'
  '@eslint-react/dom'           → 'react-dom'
  '@eslint-react/naming-convention' → 'react-naming-convention'
  '@next/next'                  → 'next'
  'import-lite'                 → 'import'
  'n'                           → 'node'
  'yml'                         → 'yaml'

antfu 独有:
  '@eslint-react/rsc'           → 'react-rsc'
  '@eslint-react/web-api'       → 'react-web-api'
  '@stylistic'                  → 'style'
  'vitest'                      → 'test'

king3 独有:
  '@eslint-react/hooks-extra'   → 'react-hooks-extra'

命名差异:
  antfu: '@typescript-eslint'   → 'ts'
  king3: '@typescript-eslint'   → 'typescript'
```

| 集成建议 |
|---------|
| `vitest → test`：**推荐集成**（如果集成 test.ts 配置） |
| `@eslint-react/rsc → react-rsc`：**可选集成** |
| `@eslint-react/web-api → react-web-api`：king3 的 react.ts 中已使用该插件但未在映射中添加，**推荐补齐** |

---

## 十二、总结与集成建议优先级

### 推荐集成（高价值，低风险）

| 序号 | 特性 | 来源文件 | 理由 |
|------|------|----------|------|
| 1 | **编辑器模式 isInEditor** | factory.ts + utils.ts | 避免编辑器中自动删除未使用的 import |
| 2 | **disables.ts 文件级规则禁用** | configs/disables.ts | scripts/cli/dts 文件不该被无关规则报错 |
| 3 | **test.ts 测试规则** | configs/test.ts | 防止 .only 泄漏到 CI，统一测试风格 |
| 4 | **files 参数校验** | factory.ts | 防止用户误用首参的 `files` 属性 |
| 5 | **React Refresh allowExports 补齐** | configs/react.ts | 缺少 `generateImageMetadata`, `generateSitemaps`, `viewport` |
| 6 | **sortTsconfig 支持 jsconfig** | sort.ts | 许多 JS 项目使用 jsconfig.json |
| 7 | **sortTsconfig compilerOptions 补齐** | sort.ts | 缺少 `libReplacement`, `erasableSyntaxOnly` 等 6 个选项 |
| 8 | **exports 排序对齐** | sort.ts | `['types', 'import', 'require', 'default']` 更标准 |
| 9 | **markdown 禁用规则补充** | configs/markdown.ts | 参考 antfu 补充 perfectionist/regexp 等在 markdown 中的禁用 |
| 10 | **pnpm catalog 自动检测** | factory.ts | 比硬编码 `false` 更智能 |
| 11 | **env.ts 补充 @typescript/native-preview** | env.ts | antfu 多检测了这个包 |

### 可选集成（有价值，按需取用）

| 序号 | 特性 | 来由 |
|------|------|------|
| A | e18e 现代化规则 | 推动代码现代化 |
| B | jsx.ts + jsx-a11y 无障碍 | 增强 JSX 可访问性检查 |
| C | Vue a11y 支持 | 增强 Vue 无障碍检查 |
| D | toml.ts | 支持 TOML 文件 lint |
| E | `type: 'app' \| 'lib'` 项目类型 | 库项目可启用更严格规则 |
| F | React Router / Remix 检测 | 自动调整 react-refresh export 名单 |
| G | `react-rsc` 插件 | React Server Components 规则 |
| H | TypeScript `erasableSyntaxOnly` | 新版 TS 可擦除语法特性 |
| I | `isInGitHooksOrLintStaged()` | Git hooks 场景优化 |
| J | node/jsdoc/imports 可关闭开关 | 更灵活的配置 |
| K | pnpm YAML 排序规则 | pnpm-workspace.yaml 详细排序 |

### 不建议集成

| 特性 | 理由 |
|------|------|
| @stylistic 格式化 | king3 使用 Prettier，两者职能冲突 |
| Angular / Astro / Solid / Svelte 框架 | king3 聚焦 React/Vue/Next.js |
| formatters.ts 外部格式化器 | 由 Prettier 统一处理 |
| CLI 工具 | 不在 king3 规划内 |
| config-presets.ts | 当前选项数量不需要预设 |
| `pluginAntfu` 自定义规则 | antfu 特有，非通用 |
| stylistic 相关的 jsdoc/jsonc/yaml/vue 规则 | 由 Prettier 处理 |
