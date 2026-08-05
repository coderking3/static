# king3 ESLint Config 基于 Antfu 的升级审计报告

> 审计日期：2026-08-05（Asia/Shanghai）  
> 审计对象：三个本地工作树，不代表 npm registry 或远程仓库在其他时间点的状态  
> 主要基准：`02_antfu-eslint-config`；辅助基准：`03_sxzz-eslint-config`  
> 执行方式：源码阅读、Git 历史与 lockfile 静态分析；未安装依赖、未构建、未运行 lint/test、未修改三个项目源码

## 1. 分析目标与范围

本报告回答 `01_king3-eslint-config` 应如何跟进当前 `02_antfu-eslint-config`，但不以复制 Antfu 为目标。分析覆盖：项目文件与职责清单、依赖及真实锁定版本、package exports、Node/ESLint/TypeScript 兼容性、构建/测试/发布、公共 API、配置工厂、插件和 parser 加载、Flat Config 组合顺序、规则键和值、默认行为、breaking 风险，以及适合小型配置库的目录草案。

维护者已明确两个产品约束：这是个人使用、单人维护的配置库，不引入 Vitest/Jest 等内部测试框架，也不建设 Antfu 规模的 fixture/snapshot 体系；包从当前版本起只发布 ESM。所以下文把 Antfu 的测试体系和 CJS 兼容仅作为对比事实，不再列为 king3 的实施目标。必要验证收敛为无需测试框架的 `typecheck`、`build`、pack 内容检查和一次 Node ESM import smoke check。

审计口径有三个限制：

- king3 工作树在审计和报告修订期间持续有维护者手动调整，最新检查涉及 package/workspace/lockfile、ESM 构建、typegen、入口/类型、自配置和文档等多个路径；其中包名、default export、React peer 和构建格式会改变行为。Antfu 的 `src/configs/command.ts`、`src/types.ts` 有未提交格式修改。报告已按与本次决策相关的最新状态更新；三个项目源码均未由本报告任务修改。
- `node_modules/` 只在 king3 存在，用于读取已安装包的 `package.json`、peer/engine 元数据和规则清单；没有修改它。三个项目均无 `dist/`、`coverage/`。
- Antfu 的 106 个 fixture 文件和 13 个 snapshot 文件按测试场景和生成行为阅读，不把每个输出文件当成独立业务模块；重要源码/工程文件的统计口径见附录。

事实、推断和建议在全文中分别使用“事实”“推断”“建议”措辞。无法从本地源码确认的 npm 发布端行为、真实用户规模和 lint 性能数字标为“需要进一步验证”。

## 2. 项目角色和对比权重

| 项目 | 本地版本/提交 | 最近提交日期 | 角色 | 权重 |
| --- | --- | --- | --- | --- |
| `01_king3-eslint-config` | 工作树 `@king3/eslint-config@6.1.0`（HEAD 为 `@king-3/eslint-config`）/ `7f208a2` | 2026-05-09 | 升级目标 | 所有建议以其定位为准 |
| `02_antfu-eslint-config` | `@antfu/eslint-config@9.2.0` / `386531f` | 2026-07-22 | 主要基准 | 约 85% |
| `03_sxzz-eslint-config` | `@sxzz/eslint-config@8.4.0` / `54e77bb` | 2026-07-31 | 小型方案辅助参考 | 约 15% |

本地提交日期显示 king3 与 Antfu 当前快照相差约两个半月，而不是仅凭背景描述认定“半年”。差异仍然显著，主要来自这段时间内 Antfu 的 React 5 迁移、插件 major 更新、Markdown 修复、unicorn 作用域修复和工程测试增强。

## 3. 三个项目整体概览

### 3.1 环境确认

三个绝对路径均存在：

```text
/Users/wangmin/king3/project/library/eslint-config-all/01_king3-eslint-config
/Users/wangmin/king3/project/library/eslint-config-all/02_antfu-eslint-config
/Users/wangmin/king3/project/library/eslint-config-all/03_sxzz-eslint-config
```

| 项目 | `.git` | `package.json` | 源码 | lockfile | workspace | 多 package | `node_modules` | `dist` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| king3 | 有 | 有 | `src/` 31 个跟踪文件 | `pnpm-lock.yaml` | `packages: []` | 否 | 有 | 无 |
| Antfu | 有 | 有 | `src/` 50 个跟踪文件 | `pnpm-lock.yaml` | `fixtures/*` | 当前无第二个 `package.json` | 无 | 无 |
| Sxzz | 有 | 有 | `src/` 31 个跟踪文件 | `pnpm-lock.yaml` | `packages: []` | 否 | 无 | 无 |

三个项目都是单包 pnpm 项目。Antfu 声明 `fixtures/*` workspace pattern，但当前 fixture 下没有子包，不能据此称为真正 monorepo。

### 3.2 完整目录职责清单

```text
01_king3-eslint-config/                         # HEAD 46 个跟踪路径；工作树删除 1 个
├── package.json / pnpm-lock.yaml / pnpm-workspace.yaml
├── tsconfig.json / tsdown.config.ts            # 类型检查与当前 ESM-only 构建
├── eslint.config.ts / prettier.config.js       # 自检与项目格式化
├── scripts/
│   ├── build.ts [工作树已删除]                 # HEAD 中的 tsdown + d.mts→d.ts 后处理
│   └── typegen.ts                              # 规则与 ConfigNames 类型生成
└── src/
    ├── index.ts                                # 唯一包入口
    ├── factory.ts                              # king3() 组合工厂
    ├── types.ts / globs.ts / utils.ts / env.ts / plugins.ts
    └── configs/                                # 24 个配置/导出文件

02_antfu-eslint-config/                         # 193 个 Git 跟踪文件
├── package.json / pnpm-lock.yaml / pnpm-workspace.yaml
├── tsconfig.json / tsdown.config.ts / vitest.config.ts
├── eslint.config.ts / netlify.toml
├── .github/workflows/{ci,release}.yml
├── bin/index.mjs                               # CLI 启动器
├── scripts/{typegen,versiongen}.ts
├── src/
│   ├── index.ts / factory.ts / types.ts / utils.ts / globs.ts / plugins.ts
│   ├── config-presets.ts
│   ├── configs/                                # 32 个配置/导出文件
│   ├── cli.ts + cli/                           # 初始化/迁移 CLI，9 个文件
│   └── vender/prettier-types.ts                # 内嵌 Prettier option 类型
├── test/                                       # 6 个测试 + 13 个 snapshots
└── fixtures/                                   # 18 个输入、86 个场景输出、2 个 a11y fixture

03_sxzz-eslint-config/                          # 52 个 Git 跟踪文件
├── package.json / pnpm-lock.yaml / pnpm-workspace.yaml
├── tsconfig.json / tsdown.config.ts
├── eslint.config.ts / eslint-inspector.config.ts
├── .github/                                    # Renovate、发布、复用 CI
├── scripts/typegen.ts
└── src/
    ├── presets.ts                              # 简化工厂和 preset 组合
    ├── types.ts / env.ts / globs.ts / utils.ts / plugins.ts
    └── configs/                                # 22 个配置/导出文件
```

### 3.3 package 字段总览

| 字段 | king3 | Antfu | Sxzz |
| --- | --- | --- | --- |
| `type` | `module` | `module` | `module` |
| `exports` | ESM 根入口、`./package.json` | 根、`./cli`、`./package.json` | 根、`./package.json` |
| `main/module/types` | 无 `main/module`；顶层 `types` 指向 `.d.mts` | 只有顶层 `types` | 均省略，由构建产物约定 |
| `bin` | 无 | `./bin/index.mjs` | 无 |
| `files` | `dist` | `bin`, `dist` | `dist` |
| `engines` | **缺失** | **缺失** | `^22.19.0 || ^24.11.0 || >=26` |
| `sideEffects` | 缺失 | 缺失 | 缺失 |
| `optionalDependencies` | 无 | 无 | 无 |
| `publishConfig` | `access: public` | 无 | `access: public` |
| 内部测试框架 | 无，且个人库定位下不计划引入 | Vitest + factory/fixture/API/CLI/a11y | `test` 仅输出 Skip |
| 发布前构建 | 当前工作树新增 `prepublishOnly: pnpm build` | `prepack: nr build` | `prepublishOnly: pnpm run build` |
| CI | 无 | lint/typecheck/build + 三 OS test | 复用工作流但 `skip-test: true` |

### 3.4 默认能力差异

king3 默认开启 JavaScript、comments、command、imports、Node、JSDoc、e18e、unicorn、regexp、Prettier、JSONC、YAML、Markdown、perfectionist；TypeScript/Vue/React/UnoCSS 自动探测，pnpm 按 workspace 文件探测。Antfu 默认还开启 JSX、stylistic、test、TOML，但 React/UnoCSS 不自动开启，formatter 默认关闭。该差异反映产品定位：king3 明确以 Prettier 和自动框架探测为卖点，不能无条件改成 Antfu 的 stylistic-first 默认值。

## 4. king3 与 Antfu 的文件映射总表

| 模块类别 | king3 文件 | Antfu 对应文件 | 映射关系 | 职责差异 | 深入结论 |
| --- | --- | --- | --- | --- | --- |
| 包入口 | `src/index.ts` | `src/index.ts` | 基本对应 | Antfu 多导出 `config-presets`；king3 另有 `defineConfig` 别名 | 保留 king3 别名 |
| 工厂 | `src/factory.ts` | `src/factory.ts` | 基本对应、Antfu 扩展 | Antfu 多 editor、JSX、test、stylistic、formatter、多个框架和 Markdown 默认 ignore 后处理 | 选择性引入 |
| 类型 | `src/types.ts` | `src/types.ts` | 部分对应 | king3 已补导出 `RuleOptions`；仍未使用 `ConfigWithExtends` | 只需调整 typed extends |
| 环境探测 | `src/env.ts` | `src/factory.ts`, `src/utils.ts` | 被合并 | king3 独立且简单；Antfu editor 探测在 utils | 继续独立 |
| 工具 | `src/utils.ts` | `src/utils.ts` | 基本对应 | Antfu 多 `parserPlain`、`renamePluginInConfigs`、`toArray`、editor 探测 | 按需求引入 |
| glob | `src/globs.ts` | `src/globs.ts` | 基本对应 | Antfu 多测试、TOML、Astro、Svelte、XML/SVG/GraphQL/PostCSS | 随功能增量引入 |
| 静态插件桶 | `src/plugins.ts` | `src/plugins.ts` | 基本对应 | 两者都静态加载 8 个基础插件 | 无上游优化可抄 |
| 配置出口 | `src/configs/index.ts` | `src/configs/index.ts` | 基本对应 | Antfu 额外 9 个配置模块 | 保持 barrel 即可 |
| ignores | `src/configs/ignores.ts` | 同路径 | 基本对应 | Antfu 在 TS 关闭时额外忽略 TS/TSX | 建议引入 |
| disables | `src/configs/disables.ts` | 同路径 | 基本对应 | Antfu 为 `antfu/no-top-level-await` 和 bin import 规则加例外 | 只随规则引入 |
| JavaScript | `src/configs/javascript.ts` | 同路径 | 职责已变化 | king3 展开 `@eslint/js` recommended；Antfu 手列 core rules并增加偏好规则 | 不机械替换 |
| TypeScript | `src/configs/typescript.ts` | 同路径 | 基本对应 | 规则几乎完全一致，仅 Antfu 排除 Astro virtual TS、插件前缀不同 | 现状已接近上游 |
| imports | `src/configs/imports.ts` | 同路径 | 基本对应 | Antfu 在 stylistic 开启时增加 `import/newline-after-import` | 非必要 |
| Node/comments/command/regexp | 同名 4 文件 | 同名 4 文件 | 基本对应 | 规则核心相同；comments 名称和一个 king3 独有规则不同 | 保持为主 |
| JSDoc | `src/configs/jsdoc.ts` | 同路径 | 基本对应 | Antfu stylistic 模式增加 2 条规则 | Prettier 定位下不需要 |
| e18e | `src/configs/e18e.ts` | 同路径 | 部分对应 | Antfu 尝试按 app/lib/editor 控制；当前 factory 未传 `type`，存在上游内部不一致 | 借思想并修正实现 |
| unicorn | `src/configs/unicorn.ts` | 同路径 | 职责相同、作用域不同 | Antfu 把规则限制到 `GLOB_SRC` | **优先同步** |
| perfectionist | `src/configs/perfectionist.ts` | 同路径 | 部分对应 | king3 固定开启、warn、强制分组换行；Antfu 可关闭/override、error、少换行约束 | API 值得引入，参数保留 king3 |
| React | `src/configs/react.ts` | 同路径 | 职责已变化 | Antfu 已迁移 `@eslint-react` 5 的单插件命名，并支持 Remix/React Router export allowlist | major 后引入 |
| Next.js | `src/configs/nextjs.ts` | 同路径 | 基本对应 | 行为等价 | 无需重写 |
| Vue | `src/configs/vue.ts` | 同路径 | 部分对应 | Antfu 支持 Vue 2、a11y、SFC blocks、stylistic；推荐 preset 展开方式表面不同但最终层级等价 | 按需拆选项 |
| JSONC/YAML | 同名 2 文件 | 同名 2 文件 | 基本对应 | Antfu 把格式规则绑定 stylistic；king3 交给 Prettier | 保持 king3 模式 |
| Markdown | `src/configs/markdown.ts` | 同路径 | 职责已变化 | king3 只用 processor lint code block；Antfu 还 lint Markdown AST/GFM，并合并 pass-through processor | 调整后、opt-in 引入 |
| Prettier/formatter | `src/configs/prettier.ts` | `src/configs/formatters.ts`, `src/configs/stylistic.ts` | 一对多、部分对应 | 产品策略不同 | 保留 Prettier；额外格式按需 |
| pnpm/sort | `src/configs/pnpm.ts`, `sort.ts` | 同路径 | 基本对应 | Antfu 有 editor 禁止 autofix、package `scripts-info` 新排序键 | 小幅同步 |
| JSX | 无 | `src/configs/jsx.ts` | king3 缺失 | JSX file setup + 可选 `jsx-a11y` | 可选增强 |
| test | 无 | `src/configs/test.ts` | king3 不计划引入 | 测试 glob、Vitest/no-only-tests | 与个人库定位不符 |
| TOML | 无 | `src/configs/toml.ts` | king3 缺失 | parser + correctness/stylistic | 暂不默认引入 |
| Astro/Solid/Svelte/Angular | 无 | 4 个同名模块 | king3 缺失 | 独立框架支持 | 需求驱动，不预装 |
| presets | 无 | `src/config-presets.ts` | king3 缺失 | Antfu 的 full-on/off 服务 typegen/test；king3 只需 typegen 全开对象 | 内部常量即可 |
| CLI | 无 | `src/cli.ts`, `src/cli/**`, `bin/index.mjs` | king3 缺失 | 初始化、迁移、写 package/VS Code 文件 | 对当前规模过重 |
| 类型生成 | `scripts/typegen.ts` | `scripts/typegen.ts` | 基本对应 | king3 漏开 erasable；Antfu 使用 full-on preset | 修复 king3 漏项 |
| 构建 | `tsdown.config.ts`；HEAD 的 `scripts/build.ts` 当前删除 | `tsdown.config.ts` | 当前均由单个配置驱动 | 两者均 ESM-only；king3 只生成根入口和 `.d.mts` | 当前方向成立，做轻量产物校验 |
| 测试 | 无 | `test/**`, `fixtures/**`, `vitest.config.ts` | 有意不对应 | Antfu 验证大量组合；king3 个人使用不承担该矩阵 | 不引入测试框架/快照体系 |
| 发布 | 无 workflow，已有 `prepublishOnly` | `.github/workflows/**` | king3 采用本地轻量流程 | Antfu tag 发布且 prepack 构建 | 保留 prepublish，补无框架 smoke 即可 |

## 5. package.json 与依赖差异

### 5.1 关键兼容事实

1. king3 声明 peer `eslint: ^9.10.0 || ^10.0.0`，但直接依赖 `@eslint/js@^10.0.1`；本地 `@eslint/js@10.0.1/package.json` 声明 peer `eslint:^10.0.0`。
2. king3 当前直接依赖中的 `eslint-plugin-jsonc@3.1.2`、`eslint-plugin-regexp@3.1.0`、`eslint-plugin-yml@3.3.1`、`eslint-plugin-unicorn@64.0.0` 均要求 ESLint `>=9.38.0`，已经高于 king3 声明的 `9.10.0`。
3. 当前 `package.json` 已把可选 React peer 改为 `@eslint-react/eslint-plugin:^5.6.0`，但 workspace catalog、lockfile 和已安装开发版本仍是 3.0.0，`src/configs/react.ts` 也仍使用 v3 的多插件注册和旧规则名。两代都要求 Node `>=22.0.0`；在源码成组迁移前，当前声明会误导安装并可能导致 React 配置加载失败。
4. king3 的基础运行依赖 `@eslint/js@10`、`@eslint/markdown@8`、JSDoc/JSONC/regexp/YAML parser 等给出的 Node 交集为 `^20.19.0 || ^22.13.0 || >=24`，但 package 没有 `engines`。
5. TypeScript parser/plugin 8.59 的传递 peer 范围是 TypeScript `>=4.8.4 <6.1.0`；king3 锁定的开发版本 6.0.3 在范围内。

因此，依赖首要问题不是“全部版本偏旧”，而是公开兼容范围与当前依赖真实要求冲突。

### 5.2 依赖差异表

表内版本为 workspace catalog range；括号内在重要处补充 lockfile 实际版本。

| 包名 | king3 版本/类型 | Antfu 版本/类型 | 用途 | 变化原因/风险 | king3 是否需要 | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| `eslint` | peer `^9.10 || ^10`；dev 10.2.1 | peer 相同；dev 10.7.0 | 核心 | king3 实际依赖已不支持 9.10 | 必需 | **P0：major 收窄到 ESLint 10；若保留 9，必须另做兼容规则集** |
| `@eslint/js` | dep `^10.0.1` | 已移除 | core recommended | 与 ESLint 9 peer 冲突，但可自动获得 ESLint 10 新 recommended | 有价值 | ESLint 10 路线继续保留；不要照搬 Antfu 删除 |
| `@eslint/markdown` | 8.0.1 | 8.0.3 | Markdown processor/language | 小版本 | 必需 | 建议升级 |
| `@typescript-eslint/eslint-plugin` / `parser` | 8.58.1（锁 8.59） | 8.65.0 | TS 规则/parser | 同 major；源码规则已基本同步 | 必需 | 建议升级后用自身 lint/typecheck 验证 |
| `eslint-flat-config-utils` | 3.1.0 | 3.2.0 | composer | 新版提供 Antfu 使用的 Markdown default ignores；现版已有 `ConfigWithExtends` 类型 | 必需 | 建议升级 |
| `@eslint-react/eslint-plugin` | package peer 已写 `^5.6`；catalog/lock/dev 仍 3.0.0 | optional peer `^5.6`，dev 5.17.3 | React | **当前内部不一致；源码仍是 v3 API，breaking** | React 使用需要 | **P0：要么暂退 peer 3，要么立即完成 v5 成组迁移** |
| `eslint-plugin-react-refresh` | optional peer 0.5.0，锁 0.5.2 | optional peer 0.5.0，锁 0.5.3 | HMR export | 小版本；Antfu 加 Remix/Router allowlist | React 用户需要 | 建议升级 |
| `@next/eslint-plugin-next` | optional peer `>=15` | 相同 | Next | 实现等价 | 按需 | 继续保留 |
| `@unocss/eslint-plugin` | optional peer `>=0.50` | 相同 | UnoCSS | 实现等价 | 按需 | 继续保留 |
| `eslint-plugin-erasable-syntax-only` | optional peer `>=0.4` | 仅 dev 0.4.2，未列 peer | TS erasable | king3 的 peer 定义反而更正确；但缺显式 dev/typegen 覆盖 | 按需 | 保留 optional peer，补 dev 依赖 |
| `@e18e/eslint-plugin` | 0.3.0 | 0.5.1 | 现代化/性能 | 新增 `e18e/prefer-string-fromcharcode`；默认规则有行为影响 | 默认需要 | 评估后升级 |
| `eslint-plugin-unicorn` | 64.0.0 | 72.0.0 | correctness | 跨 major，但当前手选 15 条规则仍存在；Node/ESLint floor 需复核 | 默认需要 | 调整后升级；先修 files 作用域 |
| `eslint-plugin-n` | 17.24.0 | 18.2.2 | Node | 跨 major；手选规则相同 | 默认需要 | 建议升级并测试 |
| `eslint-plugin-jsdoc` | 62.9.0 | 63.2.0 | JSDoc | 跨 major；手选规则相同 | 默认需要 | 建议升级并测试 |
| `eslint-plugin-jsonc` | 3.1.2 | 3.3.0 | JSON/JSONC language | 同 major；最低 ESLint 已是 9.38 | 默认需要 | 建议升级 |
| `eslint-plugin-yml` / `yaml-eslint-parser` | 3.3.1 / 2.0.0 | 3.6.0 / 2.1.0 | YAML | 同 major | 默认需要 | 建议升级 |
| `eslint-plugin-vue` / `vue-eslint-parser` | 10.8.0（锁 10.9）/10.4.0 | 10.10.0/10.4.1 | Vue | 同 major，推荐 preset 行为兼容 | 默认依赖 | 建议升级 |
| `eslint-plugin-perfectionist` | 5.8.0（锁 5.9） | 5.10.0 | import/export sort | 同 major；配置参数差异比版本更影响用户 | 默认需要 | 建议升级，保留 king3 分组策略 |
| `eslint-plugin-pnpm` | 1.6.0 | 1.6.1 | catalog/workspace | 小版本 | 按 workspace | 建议升级 |
| `eslint-plugin-regexp` | 3.1.0 | 3.1.1 | regexp correctness | 小版本 | 默认需要 | 建议升级 |
| `eslint-plugin-command` | 3.5.2 | 3.5.3 | 注释命令 | 小版本 | 默认需要 | 建议升级；不要越级跟 Sxzz 4.0 |
| `eslint-plugin-antfu` | 3.2.2 | 3.2.3 | import/自定义规则 | 小版本 | 默认需要 | 建议升级 |
| `eslint-plugin-import-lite` | 0.6.0 | 0.6.0 | import | 无变化 | 默认需要 | 继续保留 |
| `eslint-plugin-unused-imports` | 4.4.1 | 4.4.1 | unused | 无变化 | 默认需要 | 继续保留 |
| `@eslint-community/eslint-plugin-eslint-comments` | 4.7.1 | 4.7.2 | directive correctness | patch | 默认需要 | 建议升级 |
| `eslint-config-prettier` / `eslint-plugin-prettier` / `prettier` | 10.1.8 / 5.5.5 / 3.8.1 | 已移除 | king3 的 Prettier-first 策略 | Antfu 改为 stylistic + 可选 format；不是生态强制迁移 | king3 定位需要 | **继续保留** |
| `globals` | 17.5.0 | 17.7.0 | globals | 小版本 | 必需 | 建议升级 |
| `local-pkg` | 1.1.2 | 1.2.1 | 探测/optional load | 小版本 | 必需 | 建议升级 |
| `find-up-simple` | dep 1.0.1 | 构建时 inline 1.0.1 | pnpm 探测 | Antfu 内联以减少外部 runtime dep | 需要功能 | 保留依赖更透明；无需照抄内联 |
| `@antfu/install-pkg` / `@clack/prompts` | 1.1.0 / 1.2.0 | 1.1.0 / 1.7.0 | 缺包交互安装 | 只有 `ensurePackages` 使用；会在配置加载期间产生交互/写入 | 可替换 | 维护者决定：保留并升级，或改清晰报错后移除 |
| `@stylistic/eslint-plugin` | 无 | dep 5.10.0 | ESLint 风格 | 与 Prettier 定位重叠 | 不需要 | 不建议新增 |
| `eslint-merge-processors` | 无 | dep 2.0.0 | Markdown pass-through、Vue blocks | 只在新增相应能力时需要 | 条件需要 | 调整后新增 |
| `@vitest/eslint-plugin`, `eslint-plugin-no-only-tests` | 无 | dep | test rules | 与个人库定位无关，会扩大依赖和维护面 | 不需要 | 明确不新增 |
| `eslint-plugin-toml`, `toml-eslint-parser` | 无 | dep | TOML | 新格式、两项常驻依赖 | 当前不需要 | 暂不跟进 |
| `eslint-plugin-format` | 无 | dep 且 optional peer | CSS/HTML/XML 等 formatter | 与现有 Prettier plugin 部分重叠 | 可选 | 有非 JS 格式需求时再引入 |
| Angular/Astro/Solid/Svelte/a11y peers | 无 | optional peers | 框架/a11y | 用户按功能安装，不增加基础 tarball 但增加维护矩阵 | 需求未知 | 暂不跟进 |
| `cac`, runtime `ansis`, `parse-gitignore` | king3 已移除 dev `ansis` | dep | CLI/日志 | 旧 build/typegen 日志依赖已清理 | 不需要 | 保持不引入 |

### 5.3 依赖类型结论

- king3 的 React、Next、UnoCSS、erasable 插件采用 optional peer + 动态 import 是正确方向；没有理由改成普通 dependency。
- `peerDependenciesMeta` 对现有 5 个可选 peer 均已覆盖，没有漏标；真正的问题是 React 的自动开启与缺包时错误体验。
- 三个项目均无 `optionalDependencies`。不要为了模仿上游新增；ESLint 插件更适合作 optional peer，由使用者控制版本。
- king3 不应删除 `@eslint/js` 只为与 Antfu 对齐。它使 ESLint 10 新 recommended（如 `no-constant-binary-expression`、`no-unsafe-optional-chaining`、`preserve-caught-error`、`no-useless-assignment`）自动进入配置，这是 king3 的优势；前提是解决 ESLint 9/10 版本矛盾。

## 6. Node.js、ESLint 与 TypeScript 兼容性

| 维度 | king3 声明 | 源码/依赖实际要求 | 风险 | 建议 |
| --- | --- | --- | --- | --- |
| Node.js | 无 | 基础依赖交集 `^20.19.0 || ^22.13.0 || >=24` | 旧 Node 可安装后在加载阶段失败 | **P0 添加 engines** |
| React 的 Node | 无 | 声明目标 v5 与当前开发 v3 均要求 `>=22` | Node 20 基础项目在自动探测 React 后失败 | 文档注明；major 时考虑 React 默认策略 |
| ESLint | `^9.10 || ^10` | 多包要求 `>=9.38`；`@eslint/js@10` 与当前开发 React 3 要求 10 | peer 声明失真 | 优先选择 ESLint 10-only major |
| TypeScript | 无直接 peer；dev 6.0.3 | parser/plugin 8.59 要求 `>=4.8.4 <6.1.0` | 传递 peer 由包管理器处理，文档不透明 | 文档列出范围；不必重复声明强制 peer |
| typescript-eslint | 8.58 range，锁 8.59 | Antfu 8.65 | 同 major，规则 API接近 | 升级后在个人 type-aware 项目验证 |
| type-aware lint | 仅提供 `tsconfigPath` 时启用 | 使用 `projectService.defaultProject` + `process.cwd()` | lint 更慢、monorepo root 可能不准 | 保持 opt-in；增加性能和 root 文档 |

### 兼容路线决策

**推荐路线：v7 将 ESLint 收窄到 `^10.0.0`，并声明实际 Node engines。** 这与 king3 当前 `@eslint/js@10`、开发环境 ESLint 10、React 插件和多个 parser 的事实一致，维护成本最低。

若维护者必须支持 ESLint 9，则不能只把最低版本提高到 9.38：`@eslint/js@10` 的 peer 仍冲突。需要显式维护跨 9/10 的 core rule 集合，或在运行时按实际 builtinRules 过滤新规则；这是独立兼容工程，必须增加 ESLint 9.38 与 10 双矩阵测试。Antfu 的显式规则方式可参考，但它当前也漏掉了 16 条 ESLint 10 recommended，因此不能原样复制。

## 7. package exports 与发布结构

### 7.1 当前导出行为

`01_king3-eslint-config/package.json` 同时提供：

```json
{
  "exports": {
    ".": "./dist/index.mjs",
    "./package.json": "./package.json"
  },
  "types": "./dist/index.d.mts"
}
```

事实：当前 package 与 tsdown 都已改成 ESM-only：不再公开 `require`/`main`，构建 `format:['esm']`，声明文件使用 `.d.mts`。虽然历史上 v4.1 曾恢复 CJS，但维护者现已明确只服务个人 ESM 环境，因此历史选择不再约束当前设计。该变化会中断旧的 `require()` 消费者，是已接受的 breaking 决策。

建议：

1. 保留已增加的 `"./package.json": "./package.json"`；不要添加大量源码子路径 export。所有配置函数已通过根 barrel 公开，子路径只会扩大 API 冻结面。
2. 根 export 可改成显式条件对象 `{ "types":"./dist/index.d.mts", "import":"./dist/index.mjs" }`，让现代 TypeScript/bundler 的类型入口更明确；顶层 `types` 可暂时保留给旧工具。
3. 发布前只需验证 ESM import 和 `.d.mts` 两种消费路径，不再维护 CJS fixture 或 `.d.cts`。
4. `sideEffects:false` 收益很低，且配置包不是浏览器 bundle 热点；先不加。

### 7.2 发布可靠性

king3 的 `files` 仅包含 `dist`，仓库不提交 `dist`。当前工作树已有 `prepublishOnly: pnpm build`，而 package exports 与 tsdown 现在都指向 ESM，先前的 CJS 入口冲突已经消失。剩余风险只是未实际验证 tarball 中是否包含 `index.mjs` 和 `index.d.mts`。

**建议 P1：**保留当前 `prepublishOnly`，增加一个无需测试框架的发布检查命令：build 后执行 pack dry-run/列出 tarball，再由 Node 动态 import 打包后的 ESM 入口。对个人库这已足够，不需要 Vitest、API snapshot 或多操作系统矩阵。

## 8. 工程配置逐文件分析

### `package.json` / `pnpm-workspace.yaml`

#### 文件映射

```text
king3: 01_king3-eslint-config/package.json
       01_king3-eslint-config/pnpm-workspace.yaml
Antfu: 02_antfu-eslint-config/package.json
       02_antfu-eslint-config/pnpm-workspace.yaml
```

#### 模块职责与差异

king3 用 catalog 区分 prod/plugins/parsers/peer/dev，结构清楚；Antfu 额外使用 `inlinedDependencies`、构建许可、release-age exclusions 和 fixture workspace。这些字段大部分服务 Antfu 的大依赖矩阵或 CLI，不是配置库的必要能力。king3 值得同步的是版本、真实 peer/engine 和发布脚本，不是整份 workspace policy。

| 差异项 | king3 | Antfu | 影响 |
| --- | --- | --- | --- |
| pnpm | 10.30 | 11.15 | 仅开发工作流；升级可独立处理 |
| runtime inline | 无 | `find-up-simple` 等内联 | Antfu 减少外部依赖但增加构建隐式性 |
| 发布钩子 | 当前工作树有 `prepublishOnly` | `prepack` 构建 | king3 已补构建钩子，只需轻量 pack/ESM 入口验证 |
| 内部测试 | 有意不引入框架 | Vitest | 符合个人库定位，不视为缺陷 |
| engines | 无 | 也无 | 不能照抄；应依据自身依赖补 |

结论：**调整后借鉴**。

### `tsconfig.json`

king3 当前工作树使用 `moduleResolution: bundler`、strict/noUnusedLocals/noEmit、`isolatedModules`、`verbatimModuleSyntax`；Antfu 也是 Bundler 但更精简。Sxzz 另用 NodeNext、`isolatedDeclarations` 和 `erasableSyntaxOnly`。king3 这次未提交调整已补上原先缺失的 `noEmit` 和模块隔离约束，但仍未验证 declarations 可独立生成。

建议用现有 `pnpm typecheck` 验证，而不是为此引入测试框架。`isolatedDeclarations` 能提高声明可靠性，但会要求大量显式类型，属于 P2 工程重构；`erasableSyntaxOnly` 与项目自身源码风格兼容后可考虑。结论：**仅参考设计**。

### `tsdown.config.ts` / 已删除的 `scripts/build.ts`

king3 的 HEAD 曾为 ESM 和 CJS 建两个 config，并用 73 行脚本把 `index.d.mts` 重命名为 `index.d.ts`。当前工作树已删除脚本，改成单 config、`format:['esm']`、`dts:true`；package 同步指向 `index.mjs` 和 `index.d.mts`。Antfu 也使用单配置 ESM 构建，但还承担 CLI 和 API stale guard；Sxzz 的 CJS transform 对当前 king3 已无参考价值。

当前简化已经形成 ESM 闭环，也删除了无必要的日志/exec/rename 失败点；`ansis` 已从 workspace/package 清理，typegen 改用 tsdown logger。只需在实际 build 后确认 tsdown 的真实文件名与 package 声明一致；不恢复 CJS，也不需要 `.d.cts`。结论：**继续保留，做一次轻量产物验证**。

### `scripts/typegen.ts`

两者都通过完整配置 + builtinRules 调 `flatConfigsToRulesDTS`，并附加 `ConfigNames`。king3 的 full config 没有给 `typescript` 设置 `erasableOnly:true`，生成的 `ConfigNames` 实际缺少 `king3/typescript/erasable-syntax-only`，规则类型也不覆盖 `erasable-syntax-only/*`；同时 package 已公开该 option。

建议把“所有公开 feature 都启用”的对象抽为内部常量供 typegen 使用，并显式添加 `eslint-plugin-erasable-syntax-only` devDependency。无需为了复用该常量引入 factory snapshot。结论：**建议优先修复**。

### `eslint.config.ts` / `prettier.config.js`

king3 自检开启 Vue、React、pnpm、Prettier，但没有覆盖 type-aware、erasable、Next、UnoCSS 的所有分支；Antfu 用 fixture test 覆盖更多组合。个人库无需复制该矩阵，现有自检应保持轻量。king3 单独使用 `@king-3/prettier-config` 符合项目定位，应保留。

建议继续只 lint/typecheck 实际使用的自配置，不追求每个 optional feature 的组合覆盖。结论：**继续保留**。

### `vitest.config.ts` / `test/**` / `fixtures/**`

king3 无对应文件，维护者也明确不引入 Vitest/Jest 等测试框架。Antfu 的职责分为：

- `factory-snap.test.ts`：默认、全开/关、editor、lib、TS/Vue、pnpm 条件组合的最终 config 快照；
- `fixtures.test.ts`：真实 ESLint `--fix` 输出，覆盖 TS type-aware、React、formatter、Markdown issue 837；
- `api.test.ts`：tsdown stale guard + 每入口 API snapshot；
- `types.ts`：`TypedFlatConfigItem` 与 `Linter.Config` 双向兼容；
- `jsx-a11y.test.ts`、`cli.test.ts`：功能专项。

这些文件说明 Antfu 如何控制其大规模公共配置矩阵，但不适合直接缩植到个人库。king3 只保留框架无关的发布 smoke：`typecheck`、`build`、pack 文件检查、Node ESM import；不增加 snapshot、fixture runner 或测试依赖。结论：**了解其覆盖目标，但不引入实现**。

### `.github/workflows/ci.yml` / `release.yml`

king3 无 CI。Antfu 在 Linux 执行 build/lint/typecheck，并在三 OS 执行 Vitest。对个人 ESM-only 库，CI 不是必需前置；如果未来需要自动发布，只跑单一 Linux/当前 Node 的 lint、typecheck、build、pack/ESM import 即可，不建立 Node/ESLint/OS 矩阵。结论：**当前不引入，未来自动发布时再加轻量 workflow**。

### 其他工程文件

| Antfu 文件/能力 | king3 等价 | 价值 | 建议 |
| --- | --- | --- | --- |
| `src/config-presets.ts` | typegen 内手写全开对象 | 防止 feature 漏测 | 内部化引入，不必公开 |
| `scripts/versiongen.ts` | 无 | 只为 CLI 生成依赖版本 | 不引入 |
| `netlify.toml` | 无 | 在线 inspector | 暂不引入 |
| `.vscode/settings.json` | README 有手工说明 | 开发体验 | 保持文档即可 |
| lint-staged/simple-git-hooks | 两者都有 | 提交前质量 | king3 已有；无需改成 Antfu 命令 |
| changesets/Renovate/Dependabot | Antfu 也无 changesets/Renovate | 不构成基准差异 | 可独立决定 |
| `.npmignore` | 都无 | `files` 已控制发布 | 不需要 |

## 9. 源码目录与模块设计分析

### 9.1 主入口与公开面

#### 文件映射

```text
king3: 01_king3-eslint-config/src/index.ts
Antfu: 02_antfu-eslint-config/src/index.ts
```

king3 根入口导出全部 configs、factory、globs、types、utils，并把 `king3` 同时暴露为 `king3` 和 `defineConfig` named exports；当前工作树已删除 default export。Antfu 同样宽导出，但没有 `defineConfig` 别名，额外导出 presets。由于 package exports 只允许根入口，物理目录重排不会直接开放子路径；删除 default export 会中断 `import config from '@king-3/eslint-config'`，是另一个已采用的 breaking 决策。

建议保留 `king3`/`defineConfig` 两个 named exports 和当前单入口。既然定位为个人 ESM 使用，可以不恢复 default export，但应与包名迁移一起写明。

### 9.2 `env.ts`、`globs.ts`、`plugins.ts`、`utils.ts`

| 文件 | king3 当前职责 | Antfu 变化 | 结论 |
| --- | --- | --- | --- |
| `src/env.ts` | 探测 TS/Vue/React/UnoCSS | Vue/TS 探测折入 factory，editor 探测在 utils；没有 React 自动探测 | king3 独立文件职责单一，继续保留 |
| `src/globs.ts` | JS/TS/style/JSON/Markdown/Vue/YAML/HTML 与 ignores | 新增 test、TOML、Astro、Svelte、XML/SVG/GraphQL/PostCSS | 只随功能添加，不复制全集 |
| `src/plugins.ts` | 静态导出 8 个基础插件 | 几乎完全相同 | 两者都会在根包加载时拉入这些插件；不是动态加载优化 |
| `src/utils.ts` | combine、default interop、依赖探测/安装、rule rename | Antfu 多 plain parser、config plugin rename、array helper、editor 探测 | `parserPlain` 只随额外 formatter；`renamePluginInConfigs` 当前无调用需求 |

`combine()` 在 king3 源码中只对外导出、内部没有调用方；它仍可能是公共 helper，不能仅因内部未用就删除。`renameRules()` 有 TypeScript 配置调用方。`isPackageInScope()` 和 `ensurePackages()` 服务 optional feature。

### 9.3 基础配置模块

#### JavaScript：`src/configs/javascript.ts`

king3 生成两个 config：全局 language/linter setup，以及全局 rules/plugin config。它把 `@eslint/js.configs.recommended.rules` 作为底座，再覆盖 unused 规则和偏好；Antfu 手工列出 core rules并注册 `eslint-plugin-antfu`。

实际影响：

- king3 自动包含当前 ESLint 10 recommended，而 Antfu 9.2.0 的手工清单没有包含 16 条当前 recommended（完整列表见第 13 节）。
- Antfu 另加约 38 条非-recommended core/custom rules；其中有正确性/安全规则，也有个人风格。
- king3 将 console/debugger/alert/unused import/prefer-const 多设为 warn，体现较温和默认；Antfu 多为 error。

结论：**保留 `@eslint/js` 底座，选择性补安全规则；不要用 Antfu 文件整体替换。**

#### comments/command/imports/node/jsdoc

```text
king3: src/configs/{comments,command,imports,node,jsdoc}.ts
Antfu: src/configs/{comments,command,imports,node,jsdoc}.ts
```

职责与调用关系基本相同。king3 独有 `eslint-comments/disable-enable-pair: ['error',{allowWholeFile:true}]`，有助于保证成对 directive，应保留。Antfu 仅在 stylistic 模式为 imports/JSDoc 加换行/对齐规则，不适合直接放入 Prettier-first 的 king3。

关键 bug：`OptionsConfig.imports` 允许 `{overrides}`，`imports()` 也读取 overrides，但 `factory.ts` 当前只调用 `imports()`，没有把 `resolveSubOptions/getOverrides` 传入。因此该公开 option 静默无效。应像 Antfu 一样传入，属于 **P0 bug fix**。

#### e18e/regexp/unicorn/perfectionist

```text
king3: src/configs/{e18e,regexp,unicorn,perfectionist}.ts
Antfu: src/configs/{e18e,regexp,unicorn,perfectionist}.ts
```

- `regexp` 行为相同，支持全体 recommended 降为 warn；无需重构。
- `unicorn` 的选中规则相同，但 king3 的 rules config 无 `files`，Antfu 2026-06-24 的 `8207876` 明确拆成 setup + `files:[GLOB_SRC]` rules。这防止 JS-only 规则泄漏到 JSON/YAML/Markdown language，应优先同步。
- `perfectionist` 在 king3 始终加入，用户无法关闭/override；Antfu 新增 `perfectionist?: boolean|OptionsOverrides`。API 值得直接借鉴，但 king3 的 warn 和分组/换行策略是刻意偏好，没必要改成 Antfu error。
- king3 的 e18e 默认启用 modernization/performance。Antfu 增加 app/lib/editor 条件，意图在 app 关闭 `e18e/prefer-static-regex`，但当前 Antfu factory 没把 `appType` 传给 `e18e()`，所以 `type:'lib'` 通过主 factory 时仍落到 module 默认 `app`。建议借其意图并在 king3 正确传 `type`，不要复制该遗漏。

### 9.4 TypeScript：`src/configs/typescript.ts`

两个实现的 parser、plugin、rule 集合几乎逐项一致：

- 只有提供 `tsconfigPath` 才启用 type-aware；
- 非 type-aware 与 type-aware files 分开；
- 使用 `projectService.allowDefaultProject:['./*.js']` 和 `defaultProject:tsconfigPath`；
- type-aware 20 条规则配置相同；
- `type:'lib'` 才打开 `explicit-function-return-type`；
- erasable syntax 4 条规则相同。

真正差异只有插件别名（king3 `typescript`，Antfu `ts`）以及 Antfu 默认从 type-aware 忽略 `GLOB_ASTRO_TS`。在 king3 没有 Astro 时后者没有价值。切换前缀会让所有用户 overrides breaking，**不建议**。

风险：`tsconfigRootDir: process.cwd()` 对从 monorepo 子目录调用或把 config 文件放在非 cwd 的用户可能不准确；当前本地代码无法确认真实使用场景。建议增加 root option 或文档，并在维护者现有 monorepo 中验证，不要贸然改默认。

模块结论：**规则无需追赶；升级同 major 依赖并补测试即可。**

### 9.5 Vue：`src/configs/vue.ts`

king3 注册 Vue globals、parser、processor，并展开 `flat/recommended`。本地 `eslint-plugin-vue@10.9` 的 `flat/recommended` 已依次包含 base、essential、strongly-recommended、recommended；Antfu 再分别展开三套看似更多，最终 rule 层级并不代表新增能力。

Antfu 的真实新增能力是：

- `vueVersion:2|3`；
- `a11y` + optional peer `eslint-plugin-vuejs-accessibility`；
- `eslint-processor-vue-blocks` 与 processor merge；
- 随 stylistic options 生成 Vue 格式规则；
- 新的 correctness/约束覆盖（第 13 节）。

king3 的 `vue/html-self-closing` 自定义与 `prettier.ts` 删除相应 disable 是一套配对设计，来源风格更接近 Sxzz，应保留。Antfu 的 Vue 2、a11y、SFC block 可以分别做 opt-in，不能作为一个大包默认引入。

### 9.6 React/Next.js：`src/configs/react.ts`、`nextjs.ts`

Next.js 的 recommended + core-web-vitals、rule normalization、settings 和 optional loading 两边等价，无需重写。

React 有明确 major 迁移：Antfu commit `06a1a8a` 将 `@eslint-react` 3 升到 5，删除多个独立插件注册，规则从 `react-dom/no-string-style-prop` 迁为 `react/dom-no-string-style-prop`，并删除 `react/prefer-namespace-import`。同时 React Refresh allowlist 增加 Remix/React Router 的 `meta`、`links`、`headers`、`loader`、`action`、`clientLoader`、`clientAction`、`handle`、`shouldRevalidate`。

该升级必须成组完成：peer range、workspace catalog/lockfile、plugin registration、rule names、defaultPluginRenaming 和 typegen。当前只改了 package peer，尚未完成迁移，已从“未来 P1”变成当前 P0。无需引入 fixture 框架，但至少应在个人 React 项目上实际运行一次 ESLint。Refresh allowlist 可随 v5 迁移一起补充。

### 9.7 JSONC/YAML/pnpm/sort

```text
king3: src/configs/{jsonc,yaml,pnpm,sort}.ts
Antfu: src/configs/{jsonc,yaml,pnpm,sort}.ts
```

king3 JSONC 使用 ESLint language `jsonc/x`，而非手动 parser；这是 6.0 已完成的现代化，不落后。Antfu 将 JSON/YAML 格式规则挂在 stylistic option，king3 则依赖全局 Prettier；两者不能机械合并。

值得同步的细节：

- package.json 根键排序新增 `scripts-info`；
- pnpm JSON 规则加入 `{autofix: !isInEditor}`，避免 editor 中破坏性修复；需要先引入 editor option；
- YAML 新增 `yaml/vue-custom-block/no-parsing-error`，仅在 Vue custom block 场景有价值。

king3 的 `pnpm.sort` 文档默认写 true，Antfu 类型注释写 false 但函数默认实际也是 true；应以源码为准，不照搬错误注释。

### 9.8 Markdown/Prettier

king3 的 `@eslint/markdown.configs.processor` 产生 `recommended/plugin`、`recommended/processor`、`recommended/code-blocks`，重点是代码块。它没有给原始 Markdown 文件设置 `markdown/gfm` language，也没有 Markdown content rules。

Antfu 现在：

1. 注册 markdown plugin；
2. 合并 markdown processor 和 pass-through processor；
3. 给原文件设置 `markdown/gfm` 或 commonmark language；
4. 启用 Markdown recommended；
5. 使用 composer `setDefaultIgnores`，把无 files 的 JS/user rules 从 `.md` 排除，修复 issue 837。

因此“king3 没有 `setDefaultIgnores`”不是当前配置的独立 bug；只有当它引入 Markdown AST lint/pass-through 后，这项保护才成为必要配套。若默认把现有 `markdown:true` 改成同时检查 content，会新增 Markdown 报错，是 breaking。建议先新增 opt-in `markdown:{content:true,gfm:true}`，成熟后再考虑 major 默认。

king3 `prettier.ts` 使用 `eslint-plugin-prettier/recommended`、删除 `vue/html-self-closing` disable，并把 `prettier/prettier` 降为 warn；Sxzz 完全采用同一路径。这是清晰且适合 king3 品牌的实现。Antfu 的 formatter 只在需要 CSS/HTML/XML/SVG/GraphQL/Astro 这类 ESLint 默认不发现的文件时有增量价值。

### 9.9 独立文件还是职责拆分

king3 目前 31 个跟踪源码文件，不存在明显循环依赖：入口→factory→configs；configs→types/globs/utils/plugins。`factory.ts` 317 行、`types.ts` 383 行是最重文件，但复杂度主要来自 options 和组合顺序，按框架继续拆 factory 只会增加跳转。

建议只做三处职责调整：

- 把默认 options 解析/feature detection 抽为 `options.ts`（纯函数，可测）；
- 把 typegen 的 full-on 常量放 `internal/presets.ts`；无需 full-off 测试 preset；
- 可选依赖加载统一到 `optional.ts`，提供一致错误。

不要复制 Antfu 的 CLI 目录和 vendored Prettier type；不要为每条规则拆 preset 文件。

## 10. 配置工厂与 options 设计分析

### 10.1 生成顺序

king3 当前顺序为：gitignore → command/comments/ignores/JS/perfectionist → imports/JSDoc/Node/e18e/unicorn → TS/regexp/Vue/React/Next/Uno → Prettier → JSONC/sort → pnpm → YAML → Markdown → disables → 第一参数融合项 → user configs → plugin rename。

后面的 config 覆盖前面的同名 rule。disables 位于内建配置最后、user configs 之前，因此用户仍可重新打开 rule；这是合理公共语义。Antfu 基本相同，但在 append 后增加 Markdown default ignores、editor disable-fixes。

### 10.2 已确认的 options 问题

| option/API | 当前行为 | 问题 | 建议 |
| --- | --- | --- | --- |
| `imports:{overrides}` | 类型允许，模块支持，factory 丢弃 | 静默失效 | **P0 修复** |
| `perfectionist` | 无 option、始终开启 | 用户不能关闭或 override | 增加 `boolean|OptionsOverrides`，默认 true |
| `vue` | 类型只允许 boolean | factory/module 已能消费 override，但类型阻止对象 | 扩为 `boolean|OptionsOverrides` |
| `componentExts` | 解构后 `push('vue')` | 修改调用方数组，复用 options 会累积 | 解构时复制数组 |
| `typescript:false` | 不增加 TS global ignore | 显式 lint TS 文件时可能落入 JS parser | 借鉴 Antfu `ignores(...,!enableTS)` |
| `type:'lib'` + e18e | king3 e18e 不接 type | 无法按 app/lib调整 static regex | 扩展 module option并正确传入 |
| `erasableOnly` | runtime 有，typegen full-on 未开 | 类型/ConfigNames 不完整 | 修 typegen + dev dep |
| `autoRenamePlugins` | 默认 true，TS→`typescript` | 与 Antfu `ts` 不同 | 保留，避免 override breaking |
| `react` 自动探测 | 检测 React 后动态 import optional peers | CI/non TTY 缺包时直接 module-not-found | 清晰报错或改显式启用（后者 major） |

### 10.3 `TypedFlatConfigItem`

Antfu 改为 `Omit<ConfigWithExtends,'plugins'|'rules'>`，king3 仍用 `Linter.Config`。king3 已依赖的 `eslint-flat-config-utils@3.1` 类型本身导出 `ConfigWithExtends`，所以无需等 3.2 才能采用。收益是 user config 可以类型安全地使用 composer 支持的 `extends`；运行时 composer本就能解析。

当前工作树已从 `types.ts` 重新导出 `RuleOptions`。剩余建议仅是把基类改为 `ConfigWithExtends`，再用现有 `typecheck` 确认即可；不为此增加类型测试框架或快照。

### 10.4 不应照搬的 options

`lessOpinionated`、`stylistic`、`formatters`、`isInEditor`、Angular/Solid/Svelte 等不应一次加入。一个 options key 会成为长期公共 API 和测试分支；只有确定功能进入维护范围时才新增。

## 11. 插件、parser 与动态加载设计

### 11.1 实际加载清单

| 加载方式 | king3 模块/包 | 关闭 option 是否避免加载 |
| --- | --- | --- |
| 根入口静态加载 | e18e、eslint-comments、antfu、import-lite、n、perfectionist、unicorn、unused-imports（经 `plugins.ts`） | 否 |
| 模块静态加载 | `eslint-plugin-command/config`、`eslint-plugin-regexp`、`@eslint/js`、globals | 否（factory 静态 import configs） |
| 动态加载 | TypeScript plugin/parser、Vue plugin/parser、JSDoc、JSONC、YAML、Markdown、Prettier、pnpm | 只有调用配置函数才加载 |
| optional 动态加载 | React、React Refresh、Next、UnoCSS、erasable syntax | 对应功能关闭时不加载 |

Antfu 对共享插件采用相同静态桶，因此没有值得照抄的基础启动性能优化。若 king3 未来要真正让 `e18e:false`/`unicorn:false` 降低加载成本，需要把这些插件的 import 移进模块函数；这会改变 bundle/external 行为，收益需 benchmark，列 P2 而非当前优先项。

### 11.2 缺包处理

`ensurePackages()` 只在非 CI、TTY、且包在当前 scope 时询问安装；CI/non-TTY 直接返回，随后 dynamic import 抛底层错误。Sxzz 的 `importWithError()` 更简单，始终给出“安装哪个包”的确定错误。

建议二选一：

- 保留交互安装，但 dynamic import 必须 catch 并给清晰错误；或
- 对小型库移除 `@clack/prompts`/`@antfu/install-pkg`，统一清晰报错，降低运行依赖和配置加载副作用。

自动写用户依赖不是 ESLint 生态必需能力。第二种更符合 king3 规模，但属于维护者体验选择。

### 11.3 parser 结论

TS/Vue/YAML parser 配置已现代且与 Antfu一致。JSONC 使用 language API更先进。只有 Markdown content、TOML、Astro/Svelte/Angular 和 raw formatter 文件需要新 parser；应与 feature 同时按需引入。

## 12. Flat Config 组合逻辑分析

### 12.1 最终行为

- 第一参数既是 options 又可包含已知 Flat Config keys；`files/ignores` 被禁止/单独处理，防止全局 options 误当局部配置。
- user configs 在所有内建 configs 后 append，所以拥有最终覆盖权。
- plugin rename 在所有配置解析后执行，用户写 `@typescript-eslint/*` 也会被改成 `typescript/*`；这是公开行为。
- `getOverrides()` 合并 deprecated global overrides 和 feature-local overrides，local 优先。
- configs 多为 Promise，composer 统一 await/flatten，支持数组和另一个 composer。

### 12.2 与 Antfu 的关键差异

| 差异 | 实际影响 | 判断 |
| --- | --- | --- |
| `setDefaultIgnores(GLOB_MARKDOWN)` | 保护 Markdown language 不运行 JS-only全局规则 | 仅与 Markdown AST lint 成套引入 |
| `disableRulesFix()` in editor | editor 中仍报告但关闭 unused/prefer-const/no-only-tests fix | 可提升编辑体验，但需增加环境分支测试 |
| `ConfigWithExtends` 类型 | 用户 config 可用 `extends` | 建议引入 |
| TS disabled 时 global ignore | 避免 TS 落到 JS parser | 建议引入 |
| `perfectionist` 条件 append | 关闭依赖规则行为 | 建议引入 |

### 12.3 命名与过滤

king3 的 50 个生成 config name 有稳定前缀，适合 composer `override()`。唯一命名错误曾在提交 `8340e61` 修复，说明 name 是实际公共 API。目录重构必须保留现有 name；`sort/tsconfig` 不要仅为对齐 Antfu 改成 `sort/tsconfig-json`。

## 13. ESLint 规则差异专项分析

### 13.1 `@eslint/js` 等价展开校正

源码 AST 初看 Antfu JavaScript 比 king3 多 79 条显式规则，但扣除 king3 展开的 `@eslint/js@10.0.1` recommended 后，真正 Antfu 独有约 38 条。反向地，king3 因使用当前 recommended 而拥有以下 Antfu 手工清单未列出的规则：

| 规则名称 | king3 | Antfu | 价值 | 建议 |
| --- | --- | --- | --- | --- |
| `for-direction` | recommended error | 未显式开启 | 防止错误 for 方向 | 继续保留 |
| `getter-return` | error | 未显式开启 | getter 正确性 | 继续保留 |
| `no-constant-binary-expression` | error | 未显式开启 | 发现恒定表达式 bug | 继续保留 |
| `no-constant-condition` | error | 未显式开启 | 控制流错误 | 继续保留 |
| `no-dupe-else-if` | error | 未显式开启 | 不可达分支 | 继续保留 |
| `no-empty-static-block` | error | 未显式开启 | 无意义代码 | 继续保留 |
| `no-nonoctal-decimal-escape` | error | 未显式开启 | 转义歧义 | 继续保留 |
| `no-setter-return` | error | 未显式开启 | setter 正确性 | 继续保留 |
| `no-unassigned-vars` | error | 未显式开启 | 新 core bug 检测 | 继续保留；要求匹配 ESLint 版本 |
| `no-unsafe-optional-chaining` | error | 未显式开启 | 运行时错误 | 优先保留 |
| `no-unused-labels` | error | 未显式开启 | 无效 label | 继续保留 |
| `no-unused-private-class-members` | error | 未显式开启 | dead code | 继续保留 |
| `no-useless-assignment` | error | 未显式开启 | 无效赋值 | 优先保留 |
| `no-useless-escape` | error | 未显式开启 | 无效转义 | 继续保留 |
| `preserve-caught-error` | error | 未显式开启 | 保留 error cause | 优先保留 |
| `require-yield` | error | 未显式开启 | generator 正确性 | 继续保留 |

### 13.2 同规则配置值变化

| 规则名称 | king3 配置 | Antfu 配置 | 实际影响 | 建议 |
| --- | --- | --- | --- | --- |
| `dot-notation` | `'warn'` | `['error',{allowKeywords:true}]` | 级别升高、明确 keyword | 可同步参数，是否 error 由维护者决定 |
| `no-alert` | `'warn'` | `'error'` | 前端代码报错增加 | 保持 warn |
| `no-console` | `['warn',{allow:['warn','error','info','clear']}]` | `['error',{allow:['warn','error']}]` | 大量新增报错 | 暂不同步 |
| `no-debugger` | `'warn'` | `'error'` | CI 严格性提高 | 可在 CI max-warnings=0 达到同效 |
| `no-fallthrough` | `['warn',{commentPattern:'break…omitted'}]` | `'error'` | king3 只接受更明确注释，Antfu 级别更高 | 保持参数，考虑升 error |
| `no-unused-vars` | `'off'` | core error + plugin error | Antfu 可能双重覆盖 unused | 保持 off，由 `unused-imports` 负责 |
| `prefer-const` | warn | editor warn / 其他 error | CI 报错面增加 | 保持 warn 或只在 major 调整 |
| `unused-imports/no-unused-imports` | warn | editor warn / 其他 error | 自动修复/报错行为变化 | 保持 warn；CI 可禁 warnings |
| `unused-imports/no-unused-vars` | 无显式 `vars:'all'` | `vars:'all'` | 默认本就通常为 all，影响低 | 可显式补齐 |
| `perfectionist/sort-exports` | `['warn',{order:'asc',type:'natural',partitionByComment:['^Part:.*$']}]` | `['error',{order:'asc',type:'natural'}]` | king3 允许分区 | 保留 king3 |
| `perfectionist/sort-imports` | 强制组间 1 空行、支持 internal/style/side-effect-style | 忽略内外换行、组更少 | 大量格式 diff | 保留 king3（产品偏好） |
| `pnpm/json-enforce-catalog` | `'error'` | `['error',{autofix:!isInEditor,ignores:['@types/vscode']}]` | editor 修复安全和特例 | 调整后引入 |
| `pnpm/json-prefer-workspace-settings` | `'error'` | `['error',{autofix:!isInEditor}]` | editor 行为 | 随 editor option 引入 |
| `react-refresh/only-export-components` | Next allowlist | Next + Remix/React Router allowlist | 减少框架误报 | 建议补充 |

### 13.3 Antfu 独有 JavaScript rules 分类

| 规则名称 | 类型 | 收益/报错影响 | 建议 |
| --- | --- | --- | --- |
| `no-eval`, `no-implied-eval`, `no-new-func` | 安全/正确性 | 高收益；只命中危险动态执行 | **优先同步** |
| `no-proto`, `no-restricted-properties`（限制 `__proto__`/legacy getter/setter APIs） | 正确性/兼容 | 低误报，替代 API 清晰 | **优先同步** |
| `no-unreachable-loop`, `no-unmodified-loop-condition` | bug 检测 | 可发现死循环/错误循环；少量复杂循环误报 | **优先同步** |
| `prefer-promise-reject-errors`, `no-throw-literal` | 错误处理 | 保证可追踪 Error | **优先同步** |
| `no-caller`, `no-extend-native`, `no-iterator`, `no-new-wrappers`, `no-octal-escape`, `no-var` | 过时/危险语法 | 现代代码风险低 | 建议同步 |
| `default-case-last` | correctness/readability | 低风险 | 建议同步 |
| `no-array-constructor` | readability/TS overlap | 少量现有写法报错 | 建议同步 |
| `no-restricted-globals`（`global`,`self`） | portability 偏好 | Web Worker `self` 可能大量报错 | 评估后同步 |
| `no-use-before-define` | 风格/可读性 | 函数外变量可能大量报错 | 评估后同步 |
| `no-new`, `no-lone-blocks`, `no-sequences`, `no-unneeded-ternary` | 偏好/潜在 bug | 合法技巧会报错 | 可选 |
| `new-cap`, `one-var`, `symbol-description`, `yoda` | 明显风格偏好 | 与正确性关系弱 | 不建议默认同步 |
| `antfu/no-top-level-await` | Antfu 项目偏好 | 现代 ESM/脚本常合法；还需大量例外 | 不建议同步 |

其余 Antfu 显式列出但 king3 未显式列出的 core recommended 已由 `@eslint/js` 覆盖，不应重复计为新增。

### 13.4 Vue/Markdown 规则差异与 Antfu 测试规则（仅对比）

| 规则名称 | king3 | Antfu | 影响 | 建议 |
| --- | --- | --- | --- | --- |
| `vue/dot-notation`, `vue/no-irregular-whitespace`, `vue/no-sparse-arrays` | 无显式覆盖 | error | correctness、低风险 | 优先评估同步 |
| `vue/no-restricted-v-bind` | 无 | `['error','/^v-/']` | 限制动态参数，可能有框架用法误报 | 评估后同步 |
| `vue/no-dupe-keys` | 来自 recommended，保持开启 | Antfu 显式 off | king3 更严格且偏正确性 | **继续保留 king3** |
| `vue/html-self-closing` | 自定义 always/any | 无自定义 | 与 king3 Prettier 设计配对 | 继续保留 |
| `vue/no-constant-condition` | warn | 无显式覆盖 | 防止模板恒定条件 | 继续保留 |
| `vue/prefer-separate-static-class` | 无 | error | 风格/模板输出变化 | 不建议默认同步 |
| `vue/space-infix-ops`, `vue/space-unary-ops`, `vue/html-indent` | 交给 Prettier | Antfu/stylistic error | 重复格式职责 | 不同步 |
| `markdown/fenced-code-language` | 不 lint content | Antfu先从 recommended 展开再 off | 引入 content 后无新增报错 | 随 Markdown 能力 |
| `markdown/no-missing-label-refs` | 不 lint content | 因上游 issue 暂时 off | 避免误报 | 随 Markdown 能力 |
| `test/no-only-tests` | 无 | editor warn/CI error | 对团队测试仓库有价值 | 个人配置库不引入对应模块/依赖 |
| `test/no-identical-title`, `test/no-import-node-test` | 无 | error | Vitest 定位 | 不引入 |
| `test/consistent-test-it`, `test/prefer-hooks-in-order`, `test/prefer-lowercase-title` | 无 | error | 偏风格 | 不引入 |

### 13.5 Type-aware 规则与性能

两项目以下完整规则配置一致，king3 没有规则追赶缺口：

`@typescript-eslint/await-thenable`、`@typescript-eslint/dot-notation`、`@typescript-eslint/no-floating-promises`、`@typescript-eslint/no-for-in-array`、`@typescript-eslint/no-implied-eval`、`@typescript-eslint/no-misused-promises`、`@typescript-eslint/no-unnecessary-type-assertion`、`@typescript-eslint/no-unsafe-argument`、`@typescript-eslint/no-unsafe-assignment`、`@typescript-eslint/no-unsafe-call`、`@typescript-eslint/no-unsafe-member-access`、`@typescript-eslint/no-unsafe-return`、`@typescript-eslint/promise-function-async`、`@typescript-eslint/restrict-plus-operands`、`@typescript-eslint/restrict-template-expressions`、`@typescript-eslint/return-await`、`@typescript-eslint/strict-boolean-expressions`、`@typescript-eslint/switch-exhaustiveness-check`、`@typescript-eslint/unbound-method`，以及 React 的 `@eslint-react/no-leaked-conditional-rendering`（自动 rename 后分别为 `typescript/*`、`react/*`）。

这些规则需要 project service，尤其全套 `no-unsafe-*`、promise 和 exhaustiveness 会增加 lint 时间并带来大量存量报错；保持 `tsconfigPath` opt-in 是正确设计。实际耗时可直接在维护者日常使用的仓库中观察，无需为个人库建立专门 benchmark fixture。

### 13.6 king3 独有或 Antfu 已不显式使用的规则

| 规则名称 | 状态 | 结论 |
| --- | --- | --- |
| `eslint-comments/disable-enable-pair` | king3 error，Antfu无 | 正确性规则，保留 |
| `no-inner-declarations` | king3 error | 保留；注意新版 JS block function 语义，后续按 ESLint 文档复核参数 |
| `no-lonely-if` | king3 error | 风格偏好，可保留 |
| `no-void` | king3 error | 对 `void promise` 模式限制较强；维护者决定 |
| `require-await` | king3 off | 纯关闭项，可删除但无行为收益 |
| `no-duplicate-imports` | king3 off | `import/no-duplicates` 接管；保留 off 说明意图 |
| `vue/component-tags-order` | king3/Antfu 都 off，但 Vue 10 已无该 rule | ESLint 10 对 severity off 不校验不存在规则；可清理无效配置，非 P0 |
| `yaml/no-empty-mapping-value` | king3 YAML 中 off | 允许空 mapping value 的偏好；保留 |

规则元数据校验结果：king3 源码中显式配置的插件规则，除上述 severity 为 off 且已不存在的 `vue/component-tags-order` 外，均能在当前安装插件中找到，且没有任何已启用规则标记 `meta.deprecated`；React DOM 两条关闭项按 `@eslint-react/dom` 子插件核对后也存在。当前显式 core rules，以及本报告建议优先同步的 core rules，也未被 ESLint 10 标记 deprecated。这个结论只针对本地锁定版本；升级 major 后仍应由测试再次扫描 rule meta。

## 14. 建议优先同步的规则

建议第一批以低误报 correctness/security 为主：

1. `no-eval`
2. `no-implied-eval`
3. `no-new-func`
4. `no-proto`
5. `no-restricted-properties`（只采用 Antfu 列出的 legacy prototype APIs）
6. `no-unreachable-loop`
7. `no-unmodified-loop-condition`
8. `prefer-promise-reject-errors`
9. `no-throw-literal`
10. `default-case-last`
11. `vue/no-irregular-whitespace`
12. `vue/no-sparse-arrays`
13. `vue/dot-notation`

引入前用 king3 自身和维护者现有的一个 Vue/TS 项目统计新增消息；其中 1–10 可放小版本但应在 release notes 明示，11–13 需确认 Vue parser 版本后加入。

## 15. 需要评估后同步的规则

| 规则/规则组 | 评估点 | 默认建议 |
| --- | --- | --- |
| `no-restricted-globals` | Web Worker/Service Worker 是否使用 `self` | 先不开或只限制 `global` |
| `no-use-before-define` | 现有代码变量声明风格 | 仅变量 true，函数/class false；major 考虑 |
| `no-new`, `no-sequences`, `no-unneeded-ternary` | 合法表达技巧误报 | 统计后决定 |
| `no-console`/`no-alert`/`no-debugger` 升 error | 会产生大量新增报错 | 保持 warn，CI 用 max-warnings 控制 |
| perfectionist 四条 warn→error | 自动修复 diff 大 | 保持 warn |
| `vue/no-restricted-v-bind` | Vue 动态参数实际用法 | 在个人 Vue 项目中观察后决定 |
| Antfu test rules | 与当前个人使用范围无关 | 不引入 test config 或 runner 插件 |
| `e18e/prefer-string-fromcharcode` | 0.5 新规则的兼容/可修复行为 | 依赖升级后单独观察 |

## 16. 不建议同步的规则

默认不引入 `antfu/no-top-level-await`、`new-cap`、`one-var`、`symbol-description`、`yoda`、`vue/prefer-separate-static-class`，以及 Antfu stylistic 模块产生的 `style/*` 和 Vue/JSON/YAML/TOML 格式规则。原因分别是现代 ESM 冲突、个人风格、Prettier 重叠或与 king3 支持范围无关。

也不建议把 Antfu 手工 core rule 清单整体复制到 king3；这会失去 `@eslint/js` 随 ESLint 10 获取新 recommended 的优势，并产生双重维护。

## 17. Antfu 新增但 king3 缺失的能力

| Antfu 文件或能力 | 模块职责 | king3 等价实现 | 实际价值 | 引入成本 | breaking 风险 | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| `factory.ts` Markdown default ignores | 隔离 JS rules 与 Markdown language | 当前架构不需要 | 引入 content lint 时必需 | composer 3.2 | 低/配套 | 调整后引入 |
| `types.ts` `ConfigWithExtends` | typed extends | 无 | 公共 API 更强 | 低 | 低 | 建议引入 |
| `config-presets.ts` | 全开/关矩阵 | typegen 手写 | 防漏分支 | 低 | 无 | 内部引入 |
| `configs/jsx.ts` | JSX setup/a11y | React setup部分重叠 | 非 React JSX + a11y | optional peer + tests | 默认开启会报错 | opt-in |
| `configs/test.ts` | test/no-only | 无 | 对团队测试仓库有价值 | 2 deps + runner语义 | 中 | 个人库不引入 |
| `configs/markdown.ts` content/GFM | lint Markdown 本身 | 只 lint code block | 文档质量 | merge processor + 新报错 | 高 | opt-in 后 major评估 |
| `configs/vue.ts` SFC blocks | lint style/custom blocks | 无 | Vue SFC 完整性 | processor dep | 中 | 可选 |
| Vue/JSX a11y | accessibility | 无 | 产品质量 | optional peers、误报处理 | 中 | P2 opt-in |
| `configs/formatters.ts` | raw CSS/HTML/XML/SVG/GraphQL | Prettier只覆盖 ESLint已发现文件 | 扩文件格式 | plugin/option/parser | 中 | 有需求再引入 |
| `configs/toml.ts` | TOML | 无 | 新格式 | 2 常驻 deps | 默认新增报错 | 暂不引入 |
| Astro/Svelte/Solid/Angular | 框架 | 无 | 扩生态 | 多 peer/维护面 | 高 | 需求驱动 |
| `isInEditor` + disable fix | 编辑器性能/稳定 | 无 | 避免编辑时自动删除 | 环境分支 | 中 | 可以考虑 |
| factory/fixture snapshots | 行为回归 | 无 | 对公共大矩阵价值高 | 测试框架和持续维护 | 无用户 break | 个人库不引入 |
| API snapshot/stale guard | 发布 API | 无 | 对多入口公共包价值高 | 测试依赖/维护 | 无 | 以 build/pack/ESM import 替代 |
| CLI | 初始化/迁移 | README手工 | 新手体验 | 约 10 源码文件+3 runtime deps | 写用户文件 | 暂不引入 |
| online inspector/Netlify | 展示 | 本地 inspector script | 低 | 部署维护 | 无 | 不建议当前引入 |

## 18. 需要调整后引入的 Antfu 设计

1. **验证架构**：不引入 Vitest、factory snapshot 或 fixture；只保留现有 lint/typecheck/build，加一个无框架的 pack/ESM import smoke 命令。
2. **Markdown content lint**：新增 opt-in 并同时引入 merge processor、language、default ignores；不能只抄其中一个文件。
3. **React 5**：成组迁移 dependency、catalog/lockfile、plugin registration、rule namespace 和 renaming；在个人 React 项目手工验证后发布。
4. **editor 模式**：只关闭具有破坏性 autofix 的规则，不让同一规则在 editor/CI 产生完全不同的语义；允许用户显式覆盖探测。
5. **perfectionist option**：借 API，不借 Antfu 的 error 级别和换行策略。
6. **e18e app/lib**：借条件化思想，但必须把 `type` 从 factory 正确传入，修正 Antfu 当前遗漏。
7. **package 构建**：ESM-only 决策已确定；只借鉴发布前构建与入口校验思想，不引入 stale/API snapshot 框架。

## 19. 不适合 king3 的 Antfu 特有设计

| Antfu 设计 | 不适合原因 | 结论 |
| --- | --- | --- |
| 默认 `@stylistic` + `style/*` | king3 文档和现有实现明确使用 Prettier；双开会重复职责 | 不建议引入 |
| 10 文件 CLI + bin | 维护依赖映射、迁移规则和用户文件写入的成本高；king3 README 已能覆盖安装 | 暂不引入 |
| 默认 test/TOML/JSX/stylistic 全开 | 增加基础依赖、默认报错面和测试矩阵 | 不复制默认面 |
| Angular/Solid/Svelte 全支持 | 当前无 king3 用户需求证据 | 需求驱动 |
| CJS 双格式恢复 | 当前维护者只使用 ESM；会重新增加构建与类型出口复杂度 | 不恢复 CJS |
| `@typescript-eslint` rename 为 `ts` | 现有用户 overrides 使用 `typescript/*`；收益仅少字符 | 不建议，breaking |
| vendored Prettier option types | king3 让 `eslint-plugin-prettier` 读取用户 Prettier config，无需维护拷贝类型 | 不引入 |
| runtime `inlinedDependencies` | 对小型包增加构建隐式性，直接依赖更透明 | 仅参考，不采用 |
| Vitest + 三 OS 全量 fixture | 个人库收益不足以覆盖维护成本 | 不引入；本地 ESM smoke 足够 |
| Netlify inspector | 展示价值低于真实兼容与发布可靠性 | P3 |

## 20. king3 现有实现反向审查

| king3 文件或设计 | 当前职责 | 发现的问题或特点 | Antfu 做法 | 是否建议调整 | 理由 |
| --- | --- | --- | --- | --- | --- |
| `package.json` ESLint peer | 允许 9/10 | 与 `@eslint/js@10`、多插件最低版本冲突 | 也声明 9/10，但避开 `@eslint/js` | 是，P0 | 当前声明不真实 |
| `package.json` engines | 无 | 旧 Node 安装后失败 | Antfu 也无；Sxzz 有 | 是，P0 | 应从自身依赖求交集 |
| `package.json` release | bumpp + prepublishOnly，ESM exports 已对齐 | 尚未实际核对 tarball/ESM import | prepack + workflow | 轻量调整，P1 | 用无框架 smoke 补齐即可 |
| `src/factory.ts` imports | 组合 imports | 丢失 overrides | 正确传入 | 是，P0 | 公开 option 无效 |
| `src/factory.ts` `componentExts` | 聚合 SFC ext | 原地 push | Antfu 同样有此问题 | 是，P1 | 上游并非总是正确 |
| `src/factory.ts` React auto | 自动体验 | optional peers 缺失时 CI 抛底层错误 | 默认 false | 调整错误处理 | 保留产品特色，改善失败路径 |
| `src/configs/unicorn.ts` | unicorn 规则 | rules 无 files | 限制 GLOB_SRC | 是，P0 | 真实作用域修复 |
| `src/configs/typescript.ts` | TS/type-aware | 与 Antfu 已高度一致 | 基本同 | 小幅 | 无需重写 |
| `src/configs/javascript.ts` | core 底座 | `@eslint/js@10` 带来新规则，也造成 ESLint 9冲突 | 手工规则 | 保留思路，修兼容 | 自动跟 core 是优势 |
| `src/configs/prettier.ts` | Prettier lint | 全局 warn、保留 Vue self-closing | Antfu无直接等价 | 保留 | 符合定位，Sxzz也采用 |
| `src/configs/perfectionist.ts` | import sort | 永远启用，无法 override | 可配置 | 是 | additive API |
| `src/configs/markdown.ts` | code block | 不 lint Markdown content | GFM/content | 可选增强 | 不是当前 bug |
| `src/plugins.ts` | 共享插件 | 即使 option false 也静态加载 | 相同 | 暂不改 | 需要 benchmark 才值得 |
| `src/types.ts` | 公共 options/config | 已导出 RuleOptions；仍不支持 `extends` type | Antfu 两者都有 | 是 | 只剩 `ConfigWithExtends` 增强 |
| `scripts/typegen.ts` | 规则类型 | 漏 erasable feature | full-on preset覆盖 | 是，P0 | 类型公共面不完整 |
| `tsdown.config.ts` / 删除的 `scripts/build.ts` | 工作树已简化为单配置 ESM | package 入口已同步；待确认真实产物文件名 | tsdown 单配置 ESM | 保留 | 不恢复 CJS；`ansis` 已清理 |
| README React 安装 | 用户说明 | 写成 `eslint-plugin-react-hooks`，源码实际 import `eslint-plugin-react-refresh` | Antfu 文档为 refresh | 是，P0 | 会直接导致缺包 |
| README 中英文 | 双语文档 | 维护需同步但覆盖用户更好 | 仅英文 | 保留 | king3 独有优势 |
| `combine()` | 公共 helper | 无内部调用 | Antfu也保留 | 保留 | 可能有外部用户 |
| `vue/component-tags-order:'off'` | 历史兼容 | Vue 10 已无该 rule，off 不触发 ESLint10校验 | Antfu也留着 | 可清理 | 无行为变化，非优先 |

### 无调用方与重复项

- `combine()` 无内部调用，但由根入口公开，不能判断为死代码。
- `GLOB_ALL_SRC` 当前内部无调用，但同样由根入口公开；可继续作为用户 helper。
- `OptionsConfig.overrides` 已 deprecated，仍有 `getOverrides()` 调用，不能删除；major 可评估移除。
- `no-duplicate-imports:'off'` 与 `import/no-duplicates:'error'` 是有意 core→plugin 接管，不是重复启用。
- JSONC/TS/Vue 展开 plugin recommended 后再覆盖规则是必要的最终值定义，不应为了减少行数抽象成通用 merge helper。

## 21. king3 应继续保留的设计

1. `@eslint/js.configs.recommended` 作为 core 底座（在 ESLint 10-only 后）。
2. Prettier-first 默认，以及 `vue/html-self-closing` 的成套例外。
3. `defineConfig` 别名、单根 package export、链式 FlatConfigComposer。
4. ESM-only 单产物和 `.d.mts` 类型入口；这是个人使用场景下已确认的取舍。
5. 独立 `env.ts` 和紧凑 `configs/` 平铺目录。
6. TypeScript/Vue/React/UnoCSS 自动探测的产品体验；但补清晰 optional peer 错误。
7. `eslint-comments/disable-enable-pair`、当前较温和 warn 级别和 perfectionist 分组策略。
8. 中英文 README。
9. JSONC language API，而不是退回手动 parser 注册。
10. `typescript` plugin alias，不跟 Antfu 改成 `ts`。

## 22. Sxzz 可提供的补充设计参考

本节只引用 7 项与 king3 决策直接相关的 Sxzz 设计。

| # | 设计问题 | king3 当前方案 | Antfu 方案 | Sxzz 方案 | 更适合 king3 的方案 | 理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Core recommended | `@eslint/js` 展开 | 手列 core rules | `configJs.configs.recommended` 独立 config | 保留 king3/Sxzz思路 | 自动获得新 correctness rules |
| 2 | 格式化 | Prettier plugin/recommended | stylistic 默认、format 可选 | 与 king3 几乎相同，亦删除 Vue self-closing disable | 保留 king3 | 两个较小项目一致，符合定位 |
| 3 | 工厂规模 | 中等 options factory | 大型 feature factory | 简单 preset + 少量 options | 保持 king3 介于两者之间 | 无需为未支持框架扩大 API |
| 4 | Node engines | 缺失 | 缺失 | 明确写严格 Node 范围 | 采用“明确声明”思想，不照抄具体 22 floor | king3 应按自身依赖交集 |
| 5 | optional import | 交互安装后动态 import | 同 king3 | `importWithError()` 给确定安装提示 | 倾向 Sxzz 简化错误 | 更适合小维护规模、无配置期写入 |
| 6 | 特殊文件例外 | `disables.ts` 多 config | 同名模块 | `special-cases.ts`集中 tests/CLI/config | 继续保留 king3 单个 disables 文件 | 已足够集中，不再拆分 |
| 7 | Baseline API 检查 | 无 | 无 | `baseline-js/use-baseline` opt-in style preset | 未来 P2 试验，不默认 | 与新增框架相比更独立，但会受目标环境影响 |

不采用 Sxzz 的 `typescript-eslint` meta-package/全静态插件桶迁移：king3 当前独立 parser/plugin 的动态加载已稳定，迁移收益不足以抵消依赖和规则前缀变化。Sxzz CI 显式 `skip-test:true`，也说明小型个人配置可以不建设内部测试框架；但发布产物仍应由 build/pack/ESM smoke 自证可加载。

## 23. 依赖和兼容性风险

| 候选调整 | 所需依赖 | king3 当前是否已有 | 版本风险 | 用户安装影响 | 默认行为影响 | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| ESLint 10-only | ESLint 10、`@eslint/js`10 | 是 | **major** | Node 也需提高 | 新 core recommended | v7 |
| React 5 | `@eslint-react/eslint-plugin@^5` | package peer 已改，源码/catalog/lock 未改 | **当前不一致/major API** | React 环境会安装不匹配版本 | rule namespace改变 | P0 成组处理 |
| Markdown content | `eslint-merge-processors`, flat-utils 3.2 | 否/旧版 | 中 | 增 1 dep | `.md` 新报错、可能增耗时 | 先 opt-in |
| JSX a11y | optional `eslint-plugin-jsx-a11y` | 否 | 低 | 用户按需安装 | JSX 新报错 | opt-in |
| Vue a11y | optional `eslint-plugin-vuejs-accessibility` | 否 | 低 | 用户按需安装 | Vue 新报错/误报 | opt-in |
| Vue SFC blocks | `eslint-processor-vue-blocks`, merge-processors | 否 | 中 | 基础 dep 或 conditional dep | style block进入 lint | opt-in |
| test rules | Vitest plugin + no-only-tests | 否 | runner 兼容 | 2 常驻依赖且非个人需求 | 测试文件新报错 | 不引入 |
| raw formatter | `eslint-plugin-format` + optional prettier plugins | 否 | parser/plugin组合 | 安装体积按格式增长 | lint 更多文件、耗时增加 | 需求驱动 |
| TOML | TOML plugin/parser | 否 | 低 | 2 deps | 默认扫描 TOML | 暂不引入 |
| type-aware | 现有 TS parser/plugin | 是 | TS/project版本 | 无新增包 | **显著增加 lint 时间/报错** | 继续 opt-in |
| erasable type coverage | erasable plugin dev + optional peer | peer已有 | 低 | consumer 仍按需 | 只修类型生成 | 立即修 |
| optional clear error | 可移除 prompts/install-pkg | 当前有 | UX change | 基础依赖可减少 | 不自动安装 | 维护者决定 |

缺少 optional peer 时应“明确报错并指出包名”，不应静默跳过已明确开启的功能；自动探测触发的功能可在错误中说明如何 `react:false`/`unocss:false` 关闭。静默跳过会让用户误以为规则已生效。

## 24. 建议目录结构草案

以下结构针对 king3 当前规模，不创建实际文件：

```text
src/
├── index.ts                         # 保留：唯一公共 barrel
├── factory.ts                       # 保留：只负责组合顺序
├── options.ts                       # [建议新增] 默认值、探测、纯 resolve 函数
├── types.ts                         # 保留：公共类型，改用 ConfigWithExtends
├── globs.ts                         # 保留
├── env.ts                           # 保留：包/环境探测
├── optional.ts                      # [建议新增] optional peer import + 一致错误
├── utils.ts                         # 保留：combine/rename 等通用 helper
├── plugins.ts                       # 暂时保留；未来有 benchmark 再拆静态加载
├── internal/
│   └── presets.ts                   # [建议新增] full-on，仅供 typegen 使用
└── configs/
    ├── index.ts
    ├── command.ts comments.ts disables.ts ignores.ts
    ├── javascript.ts typescript.ts imports.ts node.ts jsdoc.ts
    ├── e18e.ts regexp.ts unicorn.ts perfectionist.ts
    ├── vue.ts react.ts nextjs.ts unocss.ts
    ├── jsonc.ts yaml.ts markdown.ts prettier.ts
    ├── pnpm.ts sort.ts
    ├── jsx.ts                       # [未来/opt-in]
    └── astro.ts                     # [未来，仅有需求时]
```

不建议新建 `frameworks/` 层：当前只有 Vue/React/Next，平铺更易查找。`sort.ts` 两个职责紧密且共享 JSONC 前提，不拆。`disables.ts` 继续集中场景例外。`options.ts` 与 `internal/presets.ts` 是唯二能明显降低 factory/typegen 耦合的新模块。

## 25. 小版本可实施的更新

若只发布一次 v6.x 小版本，建议包含不要求用户改配置的项目：

1. 修复 `imports:{overrides}` 传递。
2. 将 unicorn rules 限制为 `GLOB_SRC`，保留单独 setup。
3. 修复 README React 依赖名为 `eslint-plugin-react-refresh`，补充 CI/non-TTY 缺 peer 的错误说明。
4. typegen 开启 `erasableOnly`，把该插件加入 devDependency，校验 ConfigNames。
5. 保留 ESM-only 与 `prepublishOnly`，把根 export 改成显式 types/import 条件，并用 shell/Node 命令检查 pack、ESM import 和 `.d.mts`；不引入测试框架。
6. 解决 React peer 已改 v5、源码/catalog/lock 仍为 v3 的当前不一致；若不准备立即迁移源码，先把 peer 退回 v3。
7. 增加 `perfectionist?: boolean|OptionsOverrides`，默认保持 true；修复 Vue/imports 的 override typing。
8. 复制 `componentExts`，避免修改调用方 options。
9. TS 关闭时忽略 TS/TSX。
10. 升级同 major/patch 依赖：flat-utils 3.2、TypeScript ESLint 8.65、Markdown 8.0.3、Vue 10.10、JSONC/YAML/regexp/pnpm/globals/local-pkg 等，并用自身 lint/typecheck 与现有个人项目验证。
11. package.json sort 加 `scripts-info`。
12. 可在 release note 明示后加入第 14 节低误报安全规则；若项目严格遵循“新 lint error 即 breaking”，则留到 v7。

ESLint peer/engines 矛盾无法在完全无 breaking 的小版本里干净解决。可以先文档警告实际只测试 ESLint 10，但正式收窄 peer 应放 major。若包管理器对缺 engines 的风险不可接受，可在小版本补真实 engines，并明确这是对既有运行要求的声明；是否符合项目 semver 政策需维护者决定。

## 26. 大版本可实施的重构

v7 推荐范围：

1. peer 收窄到 ESLint 10，声明 Node `^20.19.0 || ^22.13.0 || >=24`；React 文档注明 Node >=22，或把 React 自动开启改为显式（后者需单独决定）。
2. 完成已经开始的 `@eslint-react` 3→5 成组迁移，更新 catalog/lockfile、plugin namespace、规则名和 Refresh allowlist。
3. `TypedFlatConfigItem` 基于 `ConfigWithExtends`，清理 deprecated global overrides（若删除则 breaking）。
4. 评估把 Markdown content/GFM 从 opt-in 改默认；必须携带 default ignores，并在个人文档项目中验证。
5. 批量启用已验证的新 correctness rules，并提供迁移说明。
6. 选择是否引入 editor mode；保持用户显式 `isInEditor:false` 的可控性。
7. 保持当前 tsdown ESM-only 构建，在验证声明产物后清理旧 CJS/构建脚本残留依赖。
8. 只按个人实际需求加入 JSX a11y/Astro 等模块；不引入 test config 或测试框架。

## 27. P0 / P1 / P2 / P3 优先级清单

以下 39 项是按“个人使用、ESM-only、不引入测试框架”重新去重后的统一清单；其他章节引用这些结论，不另计数。

### P0：必须优先处理（7）

| ID | 建议 | 引入方式 | breaking |
| --- | --- | --- | --- |
| P0-1 | 解决 ESLint peer `^9.10||^10` 与 `@eslint/js@10`/插件最低版本冲突 | major 收窄，或单独兼容实现 | **是（推荐路线）** |
| P0-2 | 声明实际 Node engines，并说明 React >=22 | 直接引入/随 major | **可能** |
| P0-3 | 修复 `imports:{overrides}` 被 factory 丢弃 | 直接引入 | 否，bug fix 但可能出现用户期望的新增报错 |
| P0-4 | unicorn setup/rules 拆分并用 `files:[GLOB_SRC]` 限定 | 直接引入 | 否 |
| P0-5 | 解决 React peer 已为 v5、源码/catalog/lock 仍为 v3 的不一致 | 立即退回 peer 或完成迁移 | **是（完成 v5 路线）** |
| P0-6 | 修 README 的 React 依赖名及 optional peer 失败说明 | 直接引入 | 否 |
| P0-7 | typegen 覆盖 erasable config，并补显式 devDependency | 直接引入 | 否 |

### P1：高价值升级（12）

| ID | 建议 | 引入方式 | 风险 |
| --- | --- | --- | --- |
| P1-1 | 升级 shared 同 major/patch dependencies | 直接引入 | 用自身 lint/typecheck 和日常项目观察插件输出 |
| P1-2 | `TypedFlatConfigItem` 改 `ConfigWithExtends`（`RuleOptions` 导出已完成） | 调整后引入 | 公共类型变化 |
| P1-3 | 增加可关闭/override 的 perfectionist option，保留默认和 king3 参数 | 直接引入 | 低 |
| P1-4 | 复制 `componentExts`，消除 options 原地修改 | 直接引入 | 低 |
| P1-5 | TypeScript 关闭时 global ignore TS/TSX | 直接引入 | 显式 lint TS 的结果改变 |
| P1-6 | e18e 按 app/lib 正确传 type，app 关闭 static-regex | 调整后引入 | 规则减少/变化 |
| P1-7 | 引入第 14 节低误报 JS security/correctness rules | 调整后引入 | **默认新增报错** |
| P1-8 | 评估 `vue/dot-notation`、`vue/no-irregular-whitespace`、`vue/no-sparse-arrays` | 调整后引入 | **默认新增报错** |
| P1-9 | 明确 ESM types/import export，并加无框架 build/pack/Node import smoke | 直接引入 | 低 |
| P1-10 | React Refresh 增加 Remix/React Router export allowlist | 随 React 5 迁移 | 低 |
| P1-11 | pnpm editor autofix 参数与 `scripts-info` 排序键 | 调整后引入 | 排序 diff |
| P1-12 | optional dynamic import 统一给出包名和关闭方式 | 调整后引入 | UX 变化 |

### P2：可选增强（9）

| ID | 建议 | 引入方式 | 条件 |
| --- | --- | --- | --- |
| P2-1 | Markdown content/GFM + merge processor + default ignores | 调整后引入 | 先 opt-in |
| P2-2 | JSX a11y | 暂不默认 | 用户需求 |
| P2-3 | Vue a11y | 暂不默认 | 用户需求 |
| P2-4 | Vue SFC blocks processor | 暂不默认 | style/custom block需求 |
| P2-5 | raw CSS/HTML/XML/SVG/GraphQL formatter | 暂不引入 | 非 JS 格式需求 |
| P2-6 | Astro 支持 | 暂不引入 | 个人需求 |
| P2-7 | TOML 支持 | 暂不引入 | 个人需求/接受两依赖 |
| P2-8 | editor disable-fixes | 调整后引入 | 在日常编辑环境观察 |
| P2-9 | `options.ts` + internal full-on/off preset + 可选 baseline 试验 | 调整后引入 | 不扩大 public API |

### P3：暂不建议（11）

| ID | 内容 | 原因 |
| --- | --- | --- |
| P3-1 | 默认 `@stylistic` | 与 Prettier 重叠 |
| P3-2 | Antfu CLI/bin | 对当前规模过重 |
| P3-3 | Angular | 无需求证据、维护矩阵大 |
| P3-4 | Solid | 同上 |
| P3-5 | Svelte | 同上 |
| P3-6 | Netlify/在线 inspector | 优先级低 |
| P3-7 | 恢复 CJS 双格式 | 当前已明确只服务个人 ESM 环境，只会增加复杂度 |
| P3-8 | plugin alias `typescript`→`ts` | 无实质收益且 breaking |
| P3-9 | 复制 Antfu 手工 core rule 清单 | 会失去 ESLint recommended 自动更新 |
| P3-10 | 原样复制 Antfu 目录/全量 fixtures/workflow | 过度设计和维护成本 |
| P3-11 | Vitest/Jest、test config、factory/API snapshots | 与个人库明确定位不符 |

## 28. 推荐实施顺序

1. **先消除当前不一致**：决定 React peer 暂退 v3 还是立刻完成 v5 源码迁移；同时 build/pack 一次，确认 ESM 与 `.d.mts` 入口。
2. **修当前 bug**：imports overrides、unicorn files、typegen erasable、README React、componentExts mutation。
3. **确定兼容政策**：决定 ESLint 10-only 和 Node engines；ESM-only 已确定，不再讨论 CJS。
4. **升级低风险依赖**：flat-utils、typescript-eslint、Markdown、Vue、JSON/YAML/regexp/pnpm 等同 major，用自身与日常项目验证。
5. **发布 v6.x**：只含保持默认规则兼容的修复/API 增强；发布前执行 lint、typecheck、build、pack/ESM import，不引入测试框架。
6. **准备 v7 branch**：收窄 ESLint/Node；若未在 v6 处理，再完成 React 5 的 rule namespace 迁移。
7. **引入 correctness rules**：先对 king3 自身与代表项目跑只读统计，按低误报→高影响排序。
8. **试验可选能力**：Markdown content、a11y；保持 opt-in，只按个人实际项目需求增加，不引入 test config。
9. **最后才评估目录/构建简化**：确保重构不和规则/依赖升级混在同一变更，方便回归定位。

## 29. 需要维护者决定的问题

1. 是否接受 v7 只支持 ESLint 10？这是最重要的前置决策。
2. Node 20 基础支持是否必须？React 自动模式实际要求 Node 22，是否改为显式 `react:true`？
3. 配置加载时是否继续交互安装 optional peers，还是改为 Sxzz 风格的确定错误？
4. 新 lint error 在本项目 semver 中算 minor 还是 major？这决定第 14 节规则进入 v6 还是 v7。
5. Markdown option 未来是否同时代表 code block 和 Markdown content，还是永久分成两个开关？
6. 包名从 `@king-3/eslint-config` 改为 `@king3/eslint-config`、并删除 default export 是否都已确定？前者相当于发布新 npm 包，后者会中断 default import，需要同步 README、徽章和迁移说明。
7. 是否有 Astro/Svelte/Solid/Angular/TOML/a11y 的个人实际需求？没有则不扩大范围。
8. 是否把 deprecated 顶层 `overrides` 留过一个 major，还是 v7 删除？
9. 是否接受 editor 环境自动改变 fix 行为；如接受，必须允许显式关闭探测。

## 30. 最终总结

1. **最明显问题**：不是 TS rule，也不是缺少测试框架，而是 ESLint/Node 兼容声明失真、React peer v5 与源码 v3 不一致、unicorn 作用域，以及几个公开 option/typegen bug。
2. **生态必要调整**：ESLint/Node peer-engine 对齐、parser/plugin 最低版本、`ConfigWithExtends` 类型、发布产物验证。
3. **优先升级依赖**：`eslint-flat-config-utils` 3.2、typescript-eslint 8.65、Vue/JSONC/YAML/regexp/pnpm/Markdown 的同 major 版本；随后独立处理 unicorn/n/jsdoc major。
4. **应新增依赖**：立即只补 `eslint-plugin-erasable-syntax-only` devDependency；Markdown/a11y 等均条件新增，不增加测试框架依赖。
5. **应移除依赖**：`ansis` 已随旧 build 日志清理；若放弃交互安装，再移除 `@clack/prompts`/`@antfu/install-pkg`；保留 Prettier stack。
6. **peer 调整**：ESLint 推荐 v7 改 `^10`；React peer 已先改 `^5.6`，必须立刻同步源码/catalog/lock 或暂退 v3；保留 Next/Uno/erasable/refresh optional meta。
7. **exports 调整**：ESM-only 和 `./package.json` 已完成；建议把根入口显式写为 types/import 条件，不再提供 require/main/module 或 `.d.cts`。
8. **最值得借鉴的模块设计**：typed extends、per-feature overrides、供 typegen 使用的 full-on preset、Markdown 成套 processor 保护、editor 可控修复。
9. **最值得采用的目录拆分**：只新增 `options.ts`、`optional.ts`、internal presets；不复制 CLI/框架层级。
10. **过度复杂抽象**：CLI、vendored formatter types、全量 framework options、在线 inspector、Vitest/snapshot/fixture 与多 OS 测试矩阵。
11. **优先规则**：`no-eval`、`no-implied-eval`、`no-new-func`、`no-proto`、`no-restricted-properties`、循环正确性和 Error reject 规则。
12. **大量新增报错规则**：`no-console:error`、`no-use-before-define`、perfectionist error/换行变化、Markdown content recommended、type-aware `no-unsafe-*`。
13. **Antfu 个人偏好规则**：`antfu/no-top-level-await`、`one-var`、`yoda`、`new-cap`、`vue/prefer-separate-static-class`、大部分 stylistic。
14. **需要类型信息**：第 13.5 节完整 TypeScript/React type-aware 集合；king3 已实现且应继续 opt-in。
15. **性能影响**：project service/type-aware 最大；其次 Markdown content、多 formatter、SFC blocks、多框架插件；在日常个人项目中观察即可，不建设 benchmark suite。
16. **breaking change**：共 9 类——6 类待决定（ESLint 10-only、Node engines、React 5、默认新增 JS 规则、默认新增 Vue 规则、未来默认 Markdown content）和 3 类已采用（ESM-only、npm 包名迁移、删除 default export）。
17. **应保留的 king3 设计**：Prettier、ESM-only、`@eslint/js` recommended、自动探测、`typescript` alias、双语文档、紧凑目录。
18. **Sxzz 参考**：共引用 7 项，最重要的是 Prettier/`@eslint/js` 取舍、明确 engines、简单 optional 错误和不过度扩大 factory。
19. **只发小版本**：先修 React 声明不一致和其他 P0 bug，再做 additive options/types、同 major 升级；只用现有命令加无框架 ESM smoke。
20. **大版本重构**：统一 ESLint10/Node 政策、React5、可能清理 deprecated overrides，再决定 Markdown 默认和新规则。
21. **具体顺序**：React/ESM 当前一致性 → 当前 bug → 兼容政策 → 低风险依赖 → v6.x → React/ESLint major → 规则 → 可选能力 → 结构简化。

### 最终判断

king3 的 TypeScript、FlatConfigComposer 组合骨架、JSONC language API 和多数 shared config 已接近 Antfu，甚至 `@eslint/js` recommended 与 Prettier 策略更适合其个人配置定位。此次升级不应以测试框架、更多框架文件或公共生态矩阵为中心，而应先修真实兼容和当前 React 声明不一致。完成 P0/P1 后，以少量无框架发布检查保证 ESM 产物可用即可；这比复制 Antfu 的 CLI、Vitest、stylistic 和 fixture 矩阵更合适。

## 附录 A：重要文件审计清单与计数

### king3：43 个重要路径

```text
.editorconfig
.gitignore
README.md
README_zh.md
eslint.config.ts
package.json
pnpm-workspace.yaml
prettier.config.js
scripts/build.ts [HEAD 中存在，当前工作树删除；已审计 diff/职责]
scripts/typegen.ts
src/configs/command.ts
src/configs/comments.ts
src/configs/disables.ts
src/configs/e18e.ts
src/configs/ignores.ts
src/configs/imports.ts
src/configs/index.ts
src/configs/javascript.ts
src/configs/jsdoc.ts
src/configs/jsonc.ts
src/configs/markdown.ts
src/configs/nextjs.ts
src/configs/node.ts
src/configs/perfectionist.ts
src/configs/pnpm.ts
src/configs/prettier.ts
src/configs/react.ts
src/configs/regexp.ts
src/configs/sort.ts
src/configs/typescript.ts
src/configs/unicorn.ts
src/configs/unocss.ts
src/configs/vue.ts
src/configs/yaml.ts
src/env.ts
src/factory.ts
src/globs.ts
src/index.ts
src/plugins.ts
src/types.ts
src/utils.ts
tsconfig.json
tsdown.config.ts
```

43 的口径是 42 个当前重要文件，加 1 个仍在 HEAD、当前工作树删除且已审计的 `scripts/build.ts` 路径。另外检查了 `pnpm-lock.yaml`、`.gitattributes`、LICENSE 和被 ignore 的生成文件 `src/typegen.d.ts`；它们不计入 43。`node_modules` 存在，未逐文件分析；`dist/coverage` 不存在。

### Antfu：69 个重要文件

```text
.github/workflows/ci.yml
.github/workflows/release.yml
.gitignore
README.md
bin/index.mjs
eslint.config.ts
netlify.toml
package.json
pnpm-workspace.yaml
scripts/typegen.ts
scripts/versiongen.ts
src/cli.ts
src/cli/constants-generated.ts
src/cli/constants.ts
src/cli/index.ts
src/cli/run.ts
src/cli/stages/update-eslint-files.ts
src/cli/stages/update-package-json.ts
src/cli/stages/update-vscode-settings.ts
src/cli/types.ts
src/cli/utils.ts
src/config-presets.ts
src/configs/angular.ts
src/configs/astro.ts
src/configs/command.ts
src/configs/comments.ts
src/configs/disables.ts
src/configs/e18e.ts
src/configs/formatters.ts
src/configs/ignores.ts
src/configs/imports.ts
src/configs/index.ts
src/configs/javascript.ts
src/configs/jsdoc.ts
src/configs/jsonc.ts
src/configs/jsx.ts
src/configs/markdown.ts
src/configs/nextjs.ts
src/configs/node.ts
src/configs/perfectionist.ts
src/configs/pnpm.ts
src/configs/react.ts
src/configs/regexp.ts
src/configs/solid.ts
src/configs/sort.ts
src/configs/stylistic.ts
src/configs/svelte.ts
src/configs/test.ts
src/configs/toml.ts
src/configs/typescript.ts
src/configs/unicorn.ts
src/configs/unocss.ts
src/configs/vue.ts
src/configs/yaml.ts
src/factory.ts
src/globs.ts
src/index.ts
src/plugins.ts
src/types.ts
src/utils.ts
test/api.test.ts
test/cli.test.ts
test/factory-snap.test.ts
test/fixtures.test.ts
test/jsx-a11y.test.ts
test/types.ts
tsconfig.json
tsdown.config.ts
vitest.config.ts
```

另外按场景检查了 `fixtures/` 106 个文件、`test/__snapshots__` 13 个文件、`.vscode/settings.json`、`src/vender/prettier-types.ts`、lockfile、LICENSE 和 `.gitattributes`，不计入 69。`node_modules/dist/coverage` 均不存在。

### Sxzz 引用口径

完整扫描 52 个 Git 跟踪文件，深入读取 package/workspace/build/CI、入口、presets、types/env/utils/plugins/globs，以及与 king3 决策相关的 12 个 config。正式报告只引用第 22 节的 7 项设计，不做三方机械对称审计。

## 附录 B：结论计数与验证状态

```text
P0: 7
P1: 12
P2: 9
P3: 11
合计: 39

breaking change 类别: 9（6 类待决定，3 类已采用）
引用的 Sxzz 设计: 7
```

仍需进一步验证：

- 当前工作树实际 build/pack 后是否准确包含 `dist/index.mjs` 和 `dist/index.d.mts`；
- ESLint 9 的真实用户占比，以及维护双 major 的必要性；
- Node 20 + React 用户占比；
- 新 JS/Vue rules 在真实用户代码中的 message 数；
- type-aware/projectService 在代表性 monorepo 的耗时与 root 行为；
- `@eslint-react` 5 在 king3 全部现有 override/Next/Refresh 场景的迁移结果；
- Markdown content、a11y 和额外框架是否属于维护者个人真实需求。
