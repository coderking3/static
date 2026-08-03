# king3 / Antfu / Sxzz ESLint Config 对比分析报告

> 审计日期：2026-08-03  
> 目标项目：`01_king3-eslint-config`  
> 参考项目：`02_antfu-eslint-config`、`03_sxzz-eslint-config`  
> 审计方式：只读扫描当前工作区、读取源码与工程配置、核对本地 Git 历史；未安装依赖、未运行自动修复、未修改三个项目。

## 1. 分析范围与结论说明

### 1.1 已确认的项目根目录

```text
/Users/wangmin/king3/project/library/eslint-config-all/01_king3-eslint-config
/Users/wangmin/king3/project/library/eslint-config-all/02_antfu-eslint-config
/Users/wangmin/king3/project/library/eslint-config-all/03_sxzz-eslint-config
```

本报告保存在三者共同父目录：

```text
/Users/wangmin/king3/project/library/eslint-config-all/eslint-config-comparison-report.md
```

### 1.2 审计基线与工作区状态

| 项目 | 当前版本 | 当前 HEAD | HEAD 日期 | 工作区状态 |
| --- | --- | --- | --- | --- |
| king3 | `5.0.0` | `d7c531f5fc3dbc7b9b5d188978ebbdaf0ca573a6` | 2026-02-19 | 有预存未提交修改：`src/configs/comments.ts`、`src/factory.ts`、`src/types.ts` |
| Antfu | `9.2.0` | `386531f48c8e7c12d68a498ade62da4bf6d6bdfc` | 2026-07-22 | 有预存未提交的纯格式修改：`src/configs/command.ts`、`src/types.ts` |
| Sxzz | `8.4.0` | `54e77bb98f487ea758ccff562703aeacdd7c6810` | 2026-07-31 | 干净 |

本报告以**当前工作区文件内容**为比较对象。king3 的三处本地修改尤其需要注意：

- `src/configs/comments.ts` 当前删除了 HEAD 中的 `eslint-comments/disable-enable-pair`。
- `src/factory.ts` 当前注释掉了三个 `@eslint-react/*` 子插件重命名条目。
- `src/types.ts` 当前已改用 `ConfigWithExtends`，并公开导出 `RuleOptions`；这与 Antfu 当前类型设计更接近，但尚未提交。

因此，“king3 当前没有 `eslint-comments/disable-enable-pair`”是工作区事实，不等同于已发布的 `5.0.0` 一定没有该规则。

### 1.3 文件覆盖范围与计数口径

- 三个项目共有 **289 个文件**，该数排除了 `.git`、`node_modules`、`dist`、`coverage`。
- 其中 **184 个实质文件**逐项纳入阅读：全部源码、脚本、工程配置、CI、文档、测试源码与 fixture 输入。
- Antfu 另有 **85 个 fixture 期望输出**，按 10 个输出组核对；另有 **13 个生成快照**，按 API、factory、CLI 快照职责核对。
- 三个 `pnpm-lock.yaml` 未逐行审查；用于确认 pnpm lockfile v9、实际解析版本与部分 Node engines。
- `LICENSE`、Funding 元数据仅确认存在，不作为功能源码。
- Sxzz 的 `src/typegen.ts` 为 18,399 行生成文件；已核对生成方式、导出形态、1,445 个规则类型属性、121 个弃用标记及 `ConfigNames`，未把生成类型的重复文本当作手写实现。

### 1.4 事实、推断、建议标记

- **事实**：可由当前源码、`package.json`、lockfile 或本地 Git 历史直接确认。
- **推断**：基于模块组合关系得出，但未执行最终 ESLint config。
- **建议**：结合 king3 “Prettier、Vue/React/Next、较简单 API”的当前定位作出的取舍。
- **待确认**：需要安装依赖、运行 resolved config、pack smoke test 或由维护者确认发布流程后才能定论。

### 1.5 重要限制

按照任务边界，本次没有安装依赖或执行项目测试。三个项目均无 `node_modules`。因此：

- 对源码中显式规则可以精确比较值。
- 对 `@eslint/js.configs.recommended`、`plugin.configs.recommended` 等动态展开项，结合 lockfile 版本、Antfu 已提交快照和 Sxzz 生成类型交叉判断；不能在没有执行 resolved config 的情况下把“源码未显式书写”误报为“最终配置一定未启用”。
- 规则是否在某个最小 peer 版本中存在，需要进一步做依赖矩阵测试；本报告不会猜测。

## 2. 三个项目整体概览

### 2.1 定位和规模

| 维度 | king3 | Antfu | Sxzz |
| --- | --- | --- | --- |
| 定位 | 目标项目；Prettier 优先；Vue、React、Next、UnoCSS | 大型个人化全栈 preset；Stylistic 默认；大量可选框架、CLI、测试 | 较小而严格的 Prettier preset；JS/TS/Vue/Astro |
| 非排除文件数 | 44 | 193 | 52 |
| `src` 文件数 | 29 | 50 | 31 |
| 手写源码/测试规模 | 约 2,491 行源码与脚本 | 约 5,745 行手写源码、脚本和测试（另有 fixtures/snapshots） | 约 1,423 行手写源码与脚本，另有 18,399 行生成类型 |
| 静态配置名规模 | 约 34 个 | 约 77 个有效配置名（另有动态名字） | 生成 `ConfigNames` 含约 60 项 |
| 测试 | 无 `test` 脚本和测试目录 | Vitest、factory 快照、fixture 自动修复、CLI、JSX a11y、API 快照、三系统 CI | `test: echo Skip`，CI 明确 `skip-test: true` |
| 格式策略 | `eslint-plugin-prettier` 默认开启 | `@stylistic` 默认开启；外部 formatter 可选 | `eslint-plugin-prettier` 默认开启 |
| 模块组合 | 一个集中式 `factory.ts` + 22 个 config 文件 | 集中式 `factory.ts` + 31 个 config 文件 + CLI | 多层 `preset*` 函数组合 + 22 个 config 文件 |
| CJS | 发布 ESM + CJS | ESM-only | ESM-only |

### 2.2 半年内参考项目的实际演进

以 king3 HEAD 日期 2026-02-19 为时间界线：

- Antfu 此后有 59 个相关提交，从 `7.4.3` 演进到 `9.2.0`。真正新增的源码模块是 `src/configs/e18e.ts`；更重要的是既有模块的行为迁移：Markdown language、JSONC language、React 插件 v5、规则作用域、API 快照、ESLint 10 兼容及依赖大版本更新。
- Sxzz 此后有 51 个相关提交，从 `7.8.0` 演进到 `8.4.0`。没有新增手写 `src/configs/*` 文件；主要变化是 ESLint/plugin 大版本、Node engines、JSONC flat config 形态、Unicorn 规则与作用域、Astro v2/v3 兼容、提交生成类型方式。

这说明“缺文件”不是半年差距的主要部分；**生态版本、规则作用域、测试发布保护和配置语言 API 迁移**才是主要差距。

### 2.3 整体定位结论

1. king3 的源结构最接近 Antfu 2026 年 2 月前的结构，同时保留了 Sxzz 的 Prettier 默认策略。
2. king3 并不需要复制 Antfu 的 Angular、Svelte、Solid、CLI、Stylistic、formatters；这些会显著扩大定位与维护面。
3. king3 应保留 CJS、Prettier、React/Next 和较小 API，这是相对两个参考项目的差异化价值。
4. 当前最明显的落后不是框架数量，而是没有测试/CI/发布兜底、没有声明真实 Node 下限、没有验证 peer 下限、规则作用域和 pnpm 子模块存在可复现的组合风险。

## 3. 依赖、版本与 package.json 对比

### 3.1 package 元数据和导出

| 项目 | exports | 类型 | 构建产物 | engines | 发布保护 |
| --- | --- | --- | --- | --- | --- |
| king3 | `.` 条件导出：`types`、`require`、`import`；另有 `main/module/types` | `dist/index.d.ts` | `index.cjs` + `index.mjs` | 无 | 无 `prepack/prepublishOnly`，无 CI/release workflow |
| Antfu | `.`、`./cli`、`./package.json` | `dist/index.d.mts` | ESM + CLI | 无 | `prepack: nr build`；CI；tag release workflow；API snapshot |
| Sxzz | `.`、`./package.json` | 依靠相邻 `.d.mts`/构建 preset | ESM | `^22.19.0 || ^24.11.0 || >=26.0.0` | `prepublishOnly: pnpm run build`；release workflows；但测试跳过 |

#### king3 的直接发布风险

**事实**：`01_king3-eslint-config/package.json` 的全部入口都指向 `dist`，`files` 也只有 `dist`；`dist` 未跟踪；`release` 仅执行 `bumpp`；没有 `prepack`、`prepublishOnly` 或仓库内发布 workflow。

**推断**：如果维护者在外部流程中总是先手工执行 `pnpm build`，发布可以成功；但该流程没有由仓库自证。直接 `pnpm publish`/`npm publish` 存在发布缺失入口文件的风险。

**建议**：P0 增加构建钩子和 `npm pack --dry-run`/导入烟测。不要删除 CJS；应同时验证 `import` 与 `require`。

### 3.2 核心版本锚点

| 组件 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| ESLint 实际开发版本 | `9.39.2` | `10.7.0` | `10.8.0` | king3 尚未验证 ESLint 10 |
| ESLint peer | `^9.10.0` | `^9.10.0 || ^10.0.0` | `^9.5.0 || ^10.0.0` | king3 声明的最低版本远低于唯一实际测试版本，且没有矩阵测试 |
| TypeScript | `5.9.3` | `6.0.3` | `6.0.3` + native preview | TS 6/tsgo 相关配置未验证 |
| typescript-eslint | 分包 `8.56.0` | 分包 `8.65.0` | 聚合包 `8.65.0` | king3 的分包动态加载仍合理；不必为统一而改聚合包 |
| flat config utils | `2.1.4` | `3.2.0` | `3.2.0` | v3 API/类型需要单独兼容验证 |
| `@eslint/markdown` | `7.5.1` | `8.0.3` | `8.0.3` | v8 language 与 Markdown 正文规则是关键演进 |
| `eslint-plugin-jsonc` | `2.21.1` | `3.3.0` | `3.3.0` | v3 使用 `language: jsonc/x`/flat config 数组 |
| `eslint-plugin-yml` | `1.19.1` | `3.6.0` | `3.6.0` | v3 config 形态与 language 支持改变 |
| `eslint-plugin-unicorn` | `62.0.0` | `72.0.0` | `72.0.0` | 多个规则新增、删除/弃用，且 Node 下限变化 |
| `eslint-plugin-perfectionist` | `4.15.1` | `5.10.0` | `5.10.0` | v5 import group 名称已变化，不能只升级依赖 |
| `eslint-plugin-jsdoc` | `61.7.1` | `63.2.0` | `63.3.2` | king3 lockfile 显示 v61 已要求 Node `>=20.11.0` |
| `eslint-plugin-n` | `17.24.0` | `18.2.2` | `18.2.2` | Node 规则与 ESLint 10 兼容需联动 |

### 3.3 依赖数量与策略

| 项目 | dependencies | devDependencies | peerDependencies | optional peers |
| --- | ---: | ---: | ---: | ---: |
| king3 | 30 | 19 | 6 | 5 |
| Antfu | 36 | 45 | 19 | 18 |
| Sxzz | 27 | 14 | 3 | 2 |

king3 的混合策略是合理的：基础 JS/TS/Vue/JSON/YAML/Prettier 插件作为直接依赖，React/Next/UnoCSS 作为 optional peer 并动态导入。不要改成 Sxzz 那样静态导入所有插件，也不要照搬 Antfu 的 18 个 optional peers。

### 3.4 Node、ESLint 和 peer 下限问题

1. **明确事实**：`01_king3-eslint-config/pnpm-lock.yaml` 中 `eslint-plugin-jsdoc@61.7.1` 声明 Node `>=20.11.0`；`eslint-plugin-unicorn@62.0.0` 声明 `^20.10.0 || >=21.0.0`。因此 king3 当前安装集合的实际 Node 下限至少为 20.11，但 `package.json` 没有 `engines`，README 也没说明。
2. **待验证**：king3 peer 写 `eslint ^9.10.0`、`@eslint-react/eslint-plugin ^2.0.1`，但开发锁定分别为 9.39.2、2.13.0。源码中的规则是否全部存在于最低版本，当前仓库没有测试证明。
3. **建议**：当前小版本先把 engines 与已验证下限写准确；ESLint 10、React plugin v5、Perfectionist v5、JSONC/YML v3 应在大版本分支统一迁移，避免“只改 semver”造成规则名或 config shape 失效。

### 3.5 React optional peer 契约不一致

`01_king3-eslint-config/src/configs/react.ts` 的 `react()` 明确动态导入：

```text
@eslint-react/eslint-plugin
eslint-plugin-react-hooks
eslint-plugin-react-refresh
```

`package.json` 也把三者列为 optional peers；但 `README.md` 与 `README_zh.md` 的 React 安装命令只列前两者。由于 `ensurePackages()` 在 CI 或非 TTY 会直接返回，缺少 `eslint-plugin-react-refresh` 时动态 import 会失败。这是公开文档可直接导致运行失败的 P0 问题。

## 4. 目录结构和模块设计对比

### 4.1 目录职责树

```text
king3
├─ src/factory.ts              集中装配、自动检测、重命名、用户配置融合
├─ src/configs/*.ts            语言/框架/规则模块
├─ src/{types,globs,utils}.ts  公共类型、glob、辅助函数
├─ src/env.ts                  内部环境检测
├─ scripts/{typegen,build}.ts  类型生成与双格式构建后处理
└─ README*.md                  双语文档

Antfu
├─ src/factory.ts              大型可选集成装配
├─ src/configs/*.ts            31 个模块，含框架、formatter、test、disables
├─ src/config-presets.ts       full-on/full-off 测试与类型生成预设
├─ src/cli/**                  初始化/迁移 CLI
├─ test/** + fixtures/**       API、工厂、CLI、格式化行为测试
└─ .github/**                  CI 与发布

Sxzz
├─ src/presets.ts              presetJavaScript → presetBasic → presetAll
├─ src/configs/*.ts            小函数数组组合
├─ src/plugins.ts              基础插件集中静态注册
├─ src/typegen.ts              提交到仓库的巨大生成类型
├─ src/env.ts                  Vue/Astro/UnoCSS 检测与 editor 检测
└─ .github/**                  复用 sxzz/workflows；当前跳过测试
```

### 4.2 为什么两份参考采用当前拆分

- Antfu 的拆分来自能力数量：31 个 config、19 个 optional peer、CLI、formatter、多框架。按集成拆分才能测试单个模块；`factory.ts` 仍然 469 行，说明仅增加文件并未完全解决装配复杂度。
- Sxzz 的拆分来自组合层次：每个 config 很小，`presets.ts` 用函数组合成不同层级。代价是 `presetAll()` 与 `sxzz()` 之间存在一定重复，且插件静态注册更集中。
- king3 规模明显较小，当前“一项集成一个文件”已经足够。真正需要拆的是 `factory.ts` 的装配策略/兼容性覆盖，而不是把每组规则拆成更多文件。

### 4.3 模块结构判断

| 问题 | 结论 |
| --- | --- |
| king3 更接近谁 | 代码血缘和 factory API 更接近 Antfu；Prettier 与默认功能组合更接近 Sxzz |
| 配置工厂是否继续集中 | 可以；但建议把默认值/检测、特殊文件覆盖、framework pipeline 分成内部 helper，不必拆公共 API |
| rule presets 是否独立 | 仅建议增加内部 `presetAll` 用于 typegen/test；公开 full-on/full-off 不是当前必需 |
| framework configs 是否独立 | 当前 React/Next/Vue/UnoCSS 已独立，正确；Astro 仅在确认定位后新增 |
| options/type 是否重组 | 建议按 base/language/framework/tool 分区；保持现有导出名以避免 breaking change |
| public/internal 是否隔离 | king3 将所有 configs、globs、utils 公开；这些都已构成公开 API。新 helper 应放 `internal/`，不要继续扩大根导出 |
| 循环依赖 | 当前 king3 未发现循环；Sxzz 的 Vue→TypeScript→JavaScript 是单向链，也未形成循环 |
| tree-shaking | Node 加载 config 时更关注副作用和可选依赖；king3 的 optional 动态 import 优于全部静态导入。不要为理论 tree-shaking 破坏简单入口 |
| 单模块测试 | king3 函数边界已可测试，缺的是测试目录而非更多拆分 |

## 5. 文件映射总表

下表按职责映射，不按路径机械匹配。`—` 表示无直接对应。

| 模块类别 | king3 文件 | Antfu 对应文件 | Sxzz 对应文件 | 映射关系 | 简要说明 |
| --- | --- | --- | --- | --- | --- |
| 包入口 | `src/index.ts` | `src/index.ts` | `src/index.ts` | 基本对应 | king3 另导出 `defineConfig` 别名和 default；Sxzz 还公开 plugins/env/typegen |
| 主工厂 | `src/factory.ts` | `src/factory.ts` | `src/presets.ts` | 部分对应 | Sxzz 将 factory 与层级 presets 合并在一个文件 |
| 公开类型 | `src/types.ts` | `src/types.ts` | `src/types.ts` | 基本对应 | Antfu options 最完整；Sxzz 类型很薄，规则类型在生成文件 |
| 类型生成结果 | 生成但未提交的 `src/typegen.d.ts` | 同左 | `src/typegen.ts` | 部分对应 | king3/Antfu 构建前生成；Sxzz 提交 18,399 行生成物 |
| 类型生成脚本 | `scripts/typegen.ts` | `scripts/typegen.ts` | `scripts/typegen.ts` | 基本对应 | 三者都用 `eslint-typegen`；Antfu 用 full-on preset，Sxzz过滤自有插件 |
| 配置 barrel | `src/configs/index.ts` | 同路径 | 同路径 | 基本对应 | 都是公共导出 |
| glob 常量 | `src/globs.ts` | 同路径 | 同路径 | 基本对应 | Antfu 覆盖 tests、Astro、Svelte、TOML、XML、GraphQL 及更多 excludes |
| 环境检测 | `src/env.ts` | 合并入 `src/factory.ts` + `src/utils.ts` | `src/env.ts` | 部分对应 | king3 独有 React 自动检测；Antfu 检测 native TS preview；Sxzz 检测 Astro |
| 工具函数 | `src/utils.ts` | 同路径 | `src/utils.ts` | 部分对应 | Antfu 多 editor/helper；Sxzz 仅 actionable dynamic import |
| 插件注册 | `src/plugins.ts` | 同路径 | 同路径 | 部分对应 | king3/Antfu 混合静态+动态；Sxzz 大量静态注册 |
| JS | `configs/javascript.ts` | 同路径 | 同路径 | 基本对应 | 规则集与严格度不同 |
| TS | `configs/typescript.ts` | 同路径 | 同路径 | 基本对应 | king3/Antfu 支持 project service type-aware；Sxzz 无 type-aware 选项 |
| Vue | `configs/vue.ts` | 同路径 | 同路径 | 基本对应 | Antfu 另支持 Vue 2、SFC blocks、a11y；Sxzz复用 TS preset |
| React | `configs/react.ts` | 同路径 | — | 基本对应 | king3 是其定位内的重要独有能力；Antfu 已迁移 React plugin v5 |
| Next.js | `configs/nextjs.ts` | 同路径 | — | 基本对应 | 两者几乎同职责；king3 应保留 |
| JSX/a11y | — | `configs/jsx.ts` | — | king3 缺失 | Antfu 把 JSX setup/a11y 从 React 解耦 |
| Astro | — | `configs/astro.ts` | `configs/astro.ts` | king3 缺失 | 两参考都支持，但对 king3 仅是可选扩展 |
| Angular | — | `configs/angular.ts` | — | king3 缺失 | Antfu 定位专属 |
| Svelte | — | `configs/svelte.ts` | — | king3 缺失 | Antfu 定位专属 |
| Solid | — | `configs/solid.ts` | — | king3 缺失 | Antfu 定位专属 |
| ignores/gitignore | `configs/ignores.ts` + factory | 同左 | `configs/ignores.ts` | 部分对应 | Sxzz 总是内含 gitignore；king3/Antfu 可配置 |
| comments | `configs/comments.ts` | 同路径 | 同路径 | 基本对应 | Sxzz 使用 recommended + disable-enable-pair |
| command | `configs/command.ts` | 同路径 | 同路径 | 基本对应 | 仅命名/插件版本差异 |
| imports | `configs/imports.ts` | 同路径 | 同路径 | 部分对应 | Sxzz 用 `eslint-plugin-importer` 且禁 default export |
| Node | `configs/node.ts` | 同路径 | 同路径 | 基本对应 | Antfu 已拆 setup/rules 并加 files；Sxzz 加 builtin compatibility |
| JSDoc | `configs/jsdoc.ts` | 同路径 | 同路径 | 基本对应 | Antfu 增加两个风格规则并限制文件 |
| RegExp | `configs/regexp.ts` | 同路径 | 同路径 | 基本对应 | king3 与 Antfu 都支持 level/overrides |
| Unicorn | `configs/unicorn.ts` | 同路径 | 同路径 | 部分对应 | king3≈Antfu 精选；Sxzz 从 unopinionated 扩展并覆盖很多偏好 |
| JSON/JSONC | `configs/jsonc.ts` | 同路径 | 同路径 | 基本对应 | 参考已迁到 plugin v3 language/flat config |
| YAML | `configs/yaml.ts` | 同路径 | `configs/yml.ts` | 基本对应 | 文件名和 namespace 不同；职责相同 |
| TOML | — | `configs/toml.ts` | — | king3 缺失 | 仅 Antfu |
| Markdown | `configs/markdown.ts` | 同路径 | 同路径 | 部分对应 | king3/Sxzz 只处理代码块；Antfu 还 lint 正文 |
| Prettier | `configs/prettier.ts` | 无同职责；`formatters.ts` 不是等价物 | `configs/prettier.ts` | 与 Sxzz 基本对应 | king3 与 Sxzz 实现近乎相同 |
| Stylistic | — | `configs/stylistic.ts` | — | 无直接对应 | 与 king3 的 Prettier 定位冲突 |
| 外部格式器 | — | `configs/formatters.ts` | — | 无直接对应 | 用 ESLint 格式化 CSS/HTML/XML/Markdown 等，不等于 Prettier config |
| Perfectionist | `configs/perfectionist.ts` | 同路径 | 合并在 `configs/sort.ts` | 部分对应 | king3 默认强制分组换行；参考 v5 group schema 已变化 |
| JSON/TS/pnpm 排序 | `configs/sort.ts` | 同路径 | 同路径 | 基本对应 | Antfu 把 pnpm YAML sort 移入 pnpm 模块；字段表更新 |
| pnpm | `configs/pnpm.ts` | 同路径 | 同路径 | 基本对应 | Antfu 支持 catalogs 检测、编辑器 autofix、条件 parser/sort |
| test 规则 | — | `configs/test.ts` | `configs/special-cases.ts` 的 tests override | 部分缺失 | 两参考都为测试文件做特殊处理，只有 Antfu 引入 Vitest 规则 |
| 特殊文件 override | — | `configs/disables.ts` | `configs/special-cases.ts` | king3 缺失 | 两参考共同设计方向 |
| baseline | — | — | `configs/baseline.ts` | king3 缺失 | 浏览器/JS builtin Baseline 检查 |
| De Morgan | — | — | `configs/de-morgan.ts` | king3 缺失 | 可修复表达式偏好 |
| e18e | — | `configs/e18e.ts` | — | king3 缺失 | Antfu 在 2026-03 新增的现代化/性能规则集合 |
| public presets | — | `src/config-presets.ts` | `src/presets.ts` | 部分缺失 | king3 有细粒度函数但无命名组合 preset |
| CLI | — | `src/cli.ts`、`src/cli/**`、`bin/index.mjs` | — | king3 缺失 | Antfu 初始化/迁移工具；不属于 lint 核心 |
| package/build | `package.json`、`tsdown.config.ts`、`scripts/build.ts` | `package.json`、`tsdown.config.ts` | `package.json`、`tsdown.config.ts` | 部分对应 | king3 双格式与重命名脚本是独有且有保留价值 |
| 自检配置 | `eslint.config.ts` | 同路径 | 同路径 + `eslint-inspector.config.ts` | 基本对应 | 都用于 dogfood；king3 没有行为测试 |
| 测试 | — | `vitest.config.ts`、`test/**`、`fixtures/**` | 无实际测试 | king3 缺失 | Antfu 是唯一可借鉴的测试基线 |
| CI/发布 | — | `.github/workflows/ci.yml`、`release.yml` | 三个 workflow | king3 缺失 | Sxzz workflow 复用其组织基础设施，不宜原样复制 |
| Renovate | — | — | `.github/renovate.json5` | king3 缺失 | 仅在维护者采用 Renovate 时有价值 |
| 编辑器 | `.editorconfig` | `.vscode/settings.json` | 两者都有 | 部分对应 | king3 README 有 VS Code 建议但仓库无 settings 文件 |
| 文档 | `README.md` + `README_zh.md` | 1,019 行 `README.md` | `README.md` + `CLAUDE.md` | 部分对应 | king3 双语是优势，但 options/兼容性/发布说明不足 |

## 6. 工程配置逐文件分析

### 6.1 `package.json`、构建与发布

#### 1. 文件映射

```text
king3: 01_king3-eslint-config/package.json
       01_king3-eslint-config/tsdown.config.ts
       01_king3-eslint-config/scripts/build.ts
Antfu: 02_antfu-eslint-config/package.json
       02_antfu-eslint-config/tsdown.config.ts
Sxzz:  03_sxzz-eslint-config/package.json
       03_sxzz-eslint-config/tsdown.config.ts
```

#### 2. 模块职责

定义公开入口、依赖契约、构建格式、类型声明和发布前行为。

#### 3. king3 当前实现

- `tsdown.config.ts` 构建 ESM/CJS 两份输出。
- `scripts/build.ts` 执行 `tsdown` 后把 `index.d.mts` 重命名为 `index.d.ts`。
- `exports`、`main/module/types` 同时维护，兼容旧工具和 Node 条件导出。
- `release` 只有 `bumpp`；不存在自动 build/pack/publish 保护。

#### 4. Antfu 当前实现

- ESM-only，`exports: true` 由 tsdown 生成导出辅助；另构建 CLI。
- `prepack` 强制 build。
- `tsdown-stale-guard` 配合 API snapshot 防止陈旧构建。
- 通过 `inlinedDependencies` 固化部分工具依赖，属于其大型包策略。

#### 5. Sxzz 当前实现

- ESM-only，使用组织自有 `tsdown-preset-sxzz` 与 `RequireCJS` 插件。
- `prepublishOnly` 强制 build。
- engines 非常激进，服务其 ESLint 10/未来 Node 策略。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| CJS | 有 | 无 | 无 | king3 兼容优势；删除会 breaking |
| 发布前构建 | 无 | `prepack` | `prepublishOnly` | king3 发布结果依赖人工流程 |
| 包烟测 | 无 | API snapshot + stale guard | 无 | king3 入口错误无法提前发现 |
| Node engines | 无 | 无 | 严格声明 | king3 与实际依赖下限不一致 |

#### 7. 可以考虑引入的内容

- 重新实现 Antfu/Sxzz 的发布前构建保护；无需复制其 workflow。
- 借鉴 Antfu 的 API snapshot 思路，增加 ESM/CJS/类型入口烟测。
- 写明 Node engines；当前版本至少 `>=20.11.0`，最终值要由实际依赖矩阵确认。

#### 8. 不建议引入的内容

- 不建议删除 CJS 来追求结构一致；king3 在 2025-11 历史中曾恢复 CJS，属于明确兼容选择。
- 不建议使用 `tsdown-preset-sxzz` 或复制 Antfu 的 `inlinedDependencies`，它们服务参考项目自己的构建/发布体系。

#### 9. 该模块最终结论

**建议优先引入**：发布保护和 engines 是 P0；双格式构建应保留。

### 6.2 TypeScript、pnpm workspace 与自检配置

#### 1. 文件映射

```text
king3: tsconfig.json, pnpm-workspace.yaml, eslint.config.ts, prettier.config.js
Antfu: tsconfig.json, pnpm-workspace.yaml, eslint.config.ts, vitest.config.ts
Sxzz:  tsconfig.json, pnpm-workspace.yaml, eslint.config.ts, eslint-inspector.config.ts
```

#### 2. 模块职责

维护开发期 TS 约束、依赖 catalog、项目自身 lint 和 inspector 配置。

#### 3. king3 当前实现

- TS 使用 `moduleResolution: Bundler`、strict、declaration、noUnusedLocals。
- catalog 按 dev/parsers/peer/plugins/prod 分类，清楚易维护。
- 自检开启 Vue、React、TS、pnpm、Prettier；Next 关闭。
- 本地 Prettier 使用 `@king-3/prettier-config`，与产品定位一致。

#### 4. Antfu 当前实现

- TS 配置较简，fixtures 排除；测试承担行为保护。
- pnpm 11 workspace 配置包含供应链策略、fixture workspace、pnpm 新设置。
- 自检覆盖所有主要框架和 `type: lib`。

#### 5. Sxzz 当前实现

- TS 使用 `NodeNext`、显式 `.ts` 扩展、`isolatedDeclarations`、`verbatimModuleSyntax`、`erasableSyntaxOnly`，并用 tsgo typecheck。
- inspector 单独文件，避免生产自检配置过重。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| TS 6/native | 未验证 | TS 6 | TS 6 + native preview | 生态迁移但非当前小版本必需 |
| self-lint 覆盖 | 无 tests/fixtures | 全模块 | 主要 preset | king3 自检不能替代消费端测试 |
| typegen 文件 | 缺失时 typecheck 可能失败 | CI 先 build 再 typecheck | 生成物提交 | 新 clone 工作流稳定性差异 |

#### 7. 可以考虑引入的内容

- 增加 `pretypecheck` 或明确 `gen → build/typecheck` 顺序；更推荐 CI 中验证 fresh clone。
- ESLint 10 大版本时评估 `NodeNext`/显式扩展，而不是现在机械复制 Sxzz tsconfig。
- inspector 单独配置属于小型可维护性改进，但优先级低。

#### 8. 不建议引入的内容

- 不建议当前引入 TS native preview、`erasableSyntaxOnly` 到仓库自身编译；这会抬高 Node/TS 基线。
- 不建议复制 Antfu 的 pnpm trust policy；它是仓库供应链偏好，不是发布包功能。

#### 9. 该模块最终结论

**建议引入**：先修复可重复 typegen/typecheck；TS 6/NodeNext 放入大版本评估。

### 6.3 测试、CI 和发布流程

#### 1. 文件映射

```text
king3: 无 test、无 .github workflows
Antfu: test/*.ts, test/__snapshots__/**, fixtures/**,
       .github/workflows/ci.yml, .github/workflows/release.yml
Sxzz:  .github/workflows/unit-test.yml, release*.yml（test 实际 Skip）
```

#### 2. 模块职责

验证 factory 组合、最终 Flat Config、自动修复结果、CLI、公开 API、跨平台行为和发布。

#### 3. king3 当前实现

只有 `lint`、`typecheck` 和 inspector，没有测试脚本、CI 或发布 workflow。

#### 4. Antfu 当前实现

- `factory-snap.test.ts` 覆盖 default/full-off/full-on、editor、lib、Vue without TS、pnpm without JSON/YAML。
- `fixtures.test.ts` 实际运行 ESLint `--fix`，比较 JS/TS/Vue/Astro/Svelte/TOML/formatter 结果。
- `api.test.ts` 对构建后的 JS/d.ts 入口快照。
- `jsx-a11y.test.ts` 直接 lint 文本验证规则开关。
- CI 在 Linux lint/build/typecheck，并在 Linux/Windows/macOS 测试。

#### 5. Sxzz 当前实现

workflow 复用 `sxzz/workflows`，但 `skip-test: true` 且 package `test` 为 `echo Skip`；不能作为测试质量参考。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| factory 组合快照 | 无 | 有 | 无 | king3 组合回归不可见 |
| 消费端 fixture | 无 | 有 | 无 | parser/plugin/formatter 兼容风险高 |
| API/pack 检查 | 无 | 有 | 无 | CJS/ESM 入口无保护 |
| CI | 无 | 有 | 有但跳过 test | king3 发布前没有自动门禁 |

#### 7. 可以考虑引入的内容

按 king3 规模重写最小测试集：

1. factory names/rules snapshot：default、all-off、React、Vue without TS、type-aware、`jsonc:true/yaml:false`、pnpm 组合。
2. JS/TS/Vue/React/Markdown/JSON/YAML fixture lint，不必复制 85 个格式化输出。
3. `npm pack` 后分别 `import()` 和 `require()`。
4. API d.ts snapshot，特别是 `defineConfig`、default export、`RuleOptions`、`ConfigNames`。

#### 8. 不建议引入的内容

- 不建议复制 Antfu CLI 测试和所有 formatter fixture，因为 king3 没有这些功能。
- 不建议复用 Sxzz 组织 workflow URL；应使用项目自有、可读的 CI。

#### 9. 该模块最终结论

**建议优先引入**：这是最重要的 P1 工程能力，且是后续依赖升级的前提。

### 6.4 文档与编辑器配置

#### 1. 文件映射

```text
king3: README.md, README_zh.md, .editorconfig, prettier.config.js
Antfu: README.md, .vscode/settings.json, netlify.toml
Sxzz: README.md, CLAUDE.md, .vscode/settings.json, .editorconfig
```

#### 2. 模块职责

说明安装、公开 API、可选依赖、IDE 行为、版本策略和维护流程。

#### 3. king3 当前实现

双语、简洁，清楚表达 Prettier 与 React/UnoCSS；但未完整列 options、Node/ESLint 版本、Next 依赖、React refresh 依赖、type-aware、plugin renaming 和 composer API。

#### 4. Antfu 当前实现

文档非常完整，覆盖 CLI、IDE、各框架、composer、rule override、Markdown caveat、版本策略；但 1,019 行规模不适合直接复制。

#### 5. Sxzz 当前实现

README 简洁，CLAUDE.md 记录维护架构；README 的 “Node >=20” 已落后于 package engines 的严格范围，是反例。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| 双语 | 有 | 无 | 无 | king3 优势 |
| option 参考 | 不完整 | 完整 | 简略 | 用户难发现 type-aware/Next/pnpm |
| 兼容矩阵 | 无 | 版本策略但无 engines | README 与 package 不一致 | 三者都有改进空间 |

#### 7. 可以考虑引入的内容

- 增加紧凑 options/依赖矩阵、Node/ESLint 支持范围、composer 示例和 breaking-change 说明。
- 修复 React 安装命令是 P0。

#### 8. 不建议引入的内容

- 不需要 Antfu 级别的 IDE 大全和 Netlify inspector 部署。
- 不应新增只服务某个 AI 工具的维护文档；可用普通 `CONTRIBUTING.md` 记录生成/测试顺序。

#### 9. 该模块最终结论

**建议引入**：保持双语简洁，补足准确性和公开契约。

## 7. 源码模块逐文件分析

### 7.1 入口、配置工厂、options 和 composer

#### 1. 文件映射

```text
king3: src/index.ts, src/factory.ts, src/types.ts
Antfu: src/index.ts, src/factory.ts, src/types.ts, src/config-presets.ts
Sxzz:  src/index.ts, src/presets.ts, src/types.ts
```

#### 2. 模块职责

公开主 API，解析用户 options，按顺序组合异步 Flat Config，融合用户配置并返回 `FlatConfigComposer`。

#### 3. king3 当前实现

- `king3()` 是主工厂，default 导出，同时在 `src/index.ts` 以 `defineConfig` 别名导出。
- 默认开启 gitignore、regexp、unicorn、Prettier、JSONC、YAML、Markdown；自动检测 TS/Vue/React/UnoCSS；Next/pnpm 默认关闭。
- `flatConfigProps` 允许在第一参数融合 `name/languageOptions/linterOptions/processor/plugins/rules/settings`。
- 自动重命名 `@typescript-eslint → typescript`、`n → node`、`yml → yaml` 等。
- 公开所有 configs、factory、globs、types、utils。

#### 4. Antfu 当前实现

- options 增加 `type`、`lessOpinionated`、`isInEditor`、imports/jsdoc/node/perfectionist/test toggles、多个框架、formatters、pnpm 细项。
- 明确拒绝第一参数出现 `files`，避免 JS 用户静默误用。
- Markdown 正文启用时对无 files 的配置设置默认 Markdown ignore，防止 JS-only rule crash。
- editor 中将若干 fixable rule 改为 non-fixable，而非关闭。
- `CONFIG_PRESET_FULL_ON/OFF` 主要服务类型生成和测试。

#### 5. Sxzz 当前实现

- `presetJavaScript/presetJsonc/presetLangsExtensions/presetBasic/presetAll` 分层组合。
- `sxzz()` 的 options 很小，只控制 Astro、baseline、command、Markdown、pnpm、Prettier、UnoCSS、Vue。
- TS 始终属于 `presetBasic`，不是自动检测开关。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| API 复杂度 | 中 | 高 | 低 | king3 当前平衡合理 |
| React 自动开启 | 是 | 否 | 不支持 | 可能在缺 peer 的 CI 中意外失败 |
| 第一参数 `files` | 类型层面排除，运行时静默忽略 | 运行时报错 | 无同类融合 | Antfu 更安全 |
| componentExts | `push('vue')` 修改传入数组 | 同样修改 | 无 | 可能产生调用方可见 mutation；两者共同历史问题，不应照旧保留 |
| named presets | 无 | full on/off 常量 | 多层公开 preset | 测试/typegen 可用内部 preset |

#### 7. 可以考虑引入的内容

- 运行时拒绝第一参数 `files`。
- 为测试/typegen 增加内部 `fullOptions`，避免脚本手写“全功能列表”漂移。
- 从 Sxzz 借鉴小型 preset 层级，但只用于 `base/languages/frameworks` 三层，不公开过多 API。
- 避免修改用户传入的 `componentExts`：先复制再追加。

#### 8. 不建议引入的内容

- 不建议把 Antfu 全部 options 引入 king3；大多数服务其框架矩阵。
- 不建议把 `env/plugins` 像 Sxzz 一样全部公开；会扩大兼容承诺。
- 不建议改 `typescript` namespace 为 `ts`；这是用户可见 breaking change。

#### 9. 该模块最终结论

**建议引入**：保持集中式工厂和现有主 API，只补运行时校验、内部 preset、无 mutation 和测试。

### 7.2 env、globs、plugins 和 utils

#### 1. 文件映射

```text
king3: src/env.ts, src/globs.ts, src/plugins.ts, src/utils.ts
Antfu: src/globs.ts, src/plugins.ts, src/utils.ts + factory 内检测
Sxzz:  src/env.ts, src/globs.ts, src/plugins.ts, src/utils.ts
```

#### 2. 模块职责

检测消费项目依赖、定义文件匹配、注册基础插件、处理 ESM/CJS interop 和 optional peer 安装。

#### 3. king3 当前实现

- 自动检测 TS、Vue 生态、React、UnoCSS。
- 基础插件静态导入，框架/解析器动态导入。
- `ensurePackages()` 只在非 CI、TTY 且包处于消费项目 scope 时询问安装；否则返回。
- `GLOB_EXCLUDE` 有 dist、coverage、Nuxt、Nitro、fixtures 等，但缺 `.next`、`.svelte-kit`、`.cache`、`.tmp`、AI 工具目录。

#### 4. Antfu 当前实现

- editor 检测覆盖 VS Code、JetBrains、Vim/Neovim、Zed，并排除 hooks/lint-staged。
- `parserPlain` 支持把非 JS 文本交给 formatter rule。
- 新增 `.next/.svelte-kit/.cache/.tmp/.context/.claude/.agents/.*/skills` 等 excludes。
- `GLOB_TESTS`、Astro/Svelte/TOML/XML/GraphQL 更完整。

#### 5. Sxzz 当前实现

- `importWithError()` 对缺失 optional peer 抛出明确安装命令。
- 检测 Astro，plugins 集中静态导入；通过构建插件处理 ESM 中的 require。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| optional peer 错误 | 可能是原始 import error | 可能提示安装，非 TTY 同样原始错误 | 明确安装命令 | CI 诊断体验 |
| `.next` ignore | 无 | 有 | 无 | 与 king3 Next 定位不一致；gitignore 关闭时明显 |
| React 自动检测 | 有 | 无 | 无 | king3 独有且应保留，但需错误保护 |
| plugin 加载 | 混合 | 混合 | 大量静态 | king3 更适合控制安装体积 |

#### 7. 可以考虑引入的内容

- 借鉴 Sxzz 的 actionable import error，保留 Antfu/king3 的交互安装。
- 增加 `.next`、通用 temp/cache 和 AI 工具目录 excludes；这是低风险维护项。
- TypeScript 检测可在未来识别 `@typescript/native-preview`。

#### 8. 不建议引入的内容

- 不建议静态导入 React/Next/UnoCSS optional peers。
- 不建议把 Antfu 所有 framework glob 都加入 `GLOB_ALL_SRC`，除非真正支持相应框架。
- 不建议默认忽略过宽的 `**/fixtures` 而不给用户覆盖；king3 已允许函数修改 ignores，应保留。

#### 9. 该模块最终结论

**建议引入**：错误信息与 excludes 是 P1；加载策略继续保留。

### 7.3 JavaScript 与 TypeScript

#### 1. 文件映射

```text
king3: src/configs/javascript.ts, src/configs/typescript.ts
Antfu: src/configs/javascript.ts, src/configs/typescript.ts
Sxzz:  src/configs/javascript.ts, src/configs/typescript.ts
```

#### 2. 模块职责

建立全局/解析器、基础正确性规则、unused-imports、TS parser、strict preset 和可选 type-aware rules。

#### 3. king3 当前实现

- JS 展开 `@eslint/js@9.39.2` recommended，再加较温和的 warn/error。
- TS 展开 `@typescript-eslint` 的 `eslint-recommended` 与 `strict`，namespace 改为 `typescript`。
- 提供 `tsconfigPath` 后启用 project service 和 21 项 type-aware 规则。
- TS 基础规则明确关闭 `no-explicit-any`、non-null assertion、triple slash、unified signatures 等偏好规则。

#### 4. Antfu 当前实现

- JS 不再依赖 `@eslint/js` 展开，而是显式列出规则；比 king3 更严格地禁止 eval/new/global/self/proto 等。
- TS 主体与 king3 同源；新增 `type: lib` 的显式返回类型和 `erasableOnly` 四项规则。
- 当前已移除 type-aware 层的 `ts/no-duplicate-imports`，并将 `consistent-type-imports` 只保留在基础层。
- TS 自动检测同时识别 `@typescript/native-preview`。

#### 5. Sxzz 当前实现

- JS 也展开 `@eslint/js@10.0.1` recommended，严格度更接近 king3，但额外启用若干 `no-useless-*`、`no-var`、`require-await`。
- TS 使用 `typescript-eslint.configs.recommended`，没有 type-aware；为 `.d.ts`、CJS/JS 提供独立覆盖。
- type import fix 采用 `inline-type-imports`，而 king3/Antfu 用 `separate-type-imports`。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| type-aware | 可选且完整 | 可选且完整 | 无 | king3 应保留优势 |
| `typescript/no-duplicate-imports` | type-aware `error` | 已移除 | 无；用 import 规则 | 可能冗余/弃用，建议移除前验证 |
| `.d.ts`/CJS 特例 | 无 | 在 `disables.ts` | TS 文件内置覆盖 | king3 常见误报风险 |
| lib/erasable options | 无 | 有 | 仓库自身 TS 使用 erasable | 可选增强，不应默认 |
| JS 严格度 | 中 | 高 | 中高 | 不能把 Antfu 个人偏好当必要升级 |

#### 7. 可以考虑引入的内容

- 优先引入 `.d.ts`、CJS、scripts/config/test 的少量覆盖，而不是新增大量基础规则。
- 评估删除 `typescript/no-duplicate-imports`，继续用 `import/no-duplicates`；统一 type-aware 与基础层的 `typescript/consistent-type-imports` options。
- 评估 `no-useless-call`、`no-useless-computed-key`、`no-useless-rename`、`unicorn/no-duplicate-set-values` 等低主观、偏正确性规则。
- `type: lib`/`erasableOnly` 可做显式 opt-in。

#### 8. 不建议引入的内容

- `antfu/no-top-level-await`、`one-var`、`vars-on-top`、`no-new`、`no-default-export` 等含强烈风格/架构偏好的规则不应因为上游存在就同步。
- Sxzz 的 `inline-type-imports` 与 king3 当前 separate imports 是风格选择，不是升级要求。

#### 9. 该模块最终结论

**建议引入**：保留 type-aware 架构；清理冗余规则和补特殊文件覆盖优先于扩大严格规则集。

### 7.4 Vue

#### 1. 文件映射

```text
king3: src/configs/vue.ts
Antfu: src/configs/vue.ts
Sxzz:  src/configs/vue.ts
```

#### 2. 模块职责

注册 Vue parser/plugin/processor、Vue globals、recommended rules 和 Vue 专项规则。

#### 3. king3 当前实现

- 支持 TS parser，使用 Vue flat recommended，处理常见 macros globals。
- 明确 Vue block 顺序、PascalCase、宏顺序、self-closing、no-v-html、prop defaults 等。
- Prettier 模块随后删除 `vue/html-self-closing` 的冲突关闭项，保留 king3 自己的 self-closing 规则。

#### 4. Antfu 当前实现

- 支持 Vue 2/3、SFC styles blocks processor、Vue a11y。
- Stylistic 开启时增加大量 Vue 格式规则。
- 新增 `vue/dot-notation`、`vue/no-irregular-whitespace`、`vue/no-restricted-v-bind`、`vue/no-sparse-arrays`、`vue/prefer-separate-static-class` 等。

#### 5. Sxzz 当前实现

- 将 `typescriptCore` 映射到 Vue 文件，结构紧凑但耦合更强。
- 保留 `vue/html-self-closing`、`vue/padding-line-between-blocks`，关闭 `vue/no-ref-as-operand` 和 one-component-per-file。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| Vue 2 | 无 | 可选 | 无 | 与 king3 当前定位不明确 |
| SFC blocks | 只标准 `.vue` processor | 合并 styles block processor | 标准 processor | 新依赖与处理复杂度 |
| a11y | 无 | opt-in 22 项 | 无 | 高价值但需 optional peer |
| `vue/padding-line-between-blocks` | 未显式 | stylistic 时 `error` | `error` | 纯风格 |
| `vue/no-restricted-v-bind` | 无 | `['error','/^v-/']` | 无 | 防止动态指令名误用，需评估现有代码 |

#### 7. 可以考虑引入的内容

- Vue a11y 作为 opt-in，且只在维护者确认需求后新增 peer。
- `vue/no-irregular-whitespace`、`vue/no-sparse-arrays` 是低主观候选。
- 如果项目实际 lint `<style>` custom blocks，再引入 processor merge；否则无价值。

#### 8. 不建议引入的内容

- 不建议引入 Antfu 的全套 Vue Stylistic；与 Prettier 重叠。
- 不建议默认支持 Vue 2 或强制 a11y，都会扩大行为面。
- 不建议照搬 Sxzz 将整个 TS preset映射到 Vue；king3 当前 parser/componentExts 复用更清晰。

#### 9. 该模块最终结论

**可以考虑**：当前实现足够；a11y 和少量正确性规则可选，风格规则暂不需要。

### 7.5 React、Next.js 与 JSX

#### 1. 文件映射

```text
king3: src/configs/react.ts, src/configs/nextjs.ts
Antfu: src/configs/react.ts, src/configs/nextjs.ts, src/configs/jsx.ts
Sxzz:  无对应文件
```

#### 2. 模块职责

为 JSX、React、React Hooks、React Refresh、React DOM/Web API 和 Next core-web-vitals 注册插件与规则。

#### 3. king3 当前实现

- `@eslint-react` v2 子插件手工注册：`react`、`react-dom`、`react-hooks-extra`、`react-naming-convention`、`react-web-api`。
- 另加载 Facebook `eslint-plugin-react-hooks` recommended 和 React Refresh。
- type-aware 时启用 `react/no-implicit-key`、`react/no-leaked-conditional-rendering` 为 warn。
- Next 与 Antfu 基本同构，合并 recommended + core-web-vitals。

#### 4. Antfu 当前实现

- 2026-04/05 两次 breaking upgrade 后使用 `@eslint-react/eslint-plugin` v5。
- 只注册统一 `react` plugin，直接展开 `pluginReact.configs.recommended.rules`；旧的 `react-dom/*` 等 namespace 已迁成 `react/dom-*` 形态。
- 移除单独 `eslint-plugin-react-hooks` peer/import。
- React Refresh 从 warn 提升 error，并支持 Next、Remix、React Router 的允许导出名。
- JSX a11y 与 React 解耦到 `jsx.ts`。

#### 5. Sxzz 当前实现

无 React/Next 支持，这是其明确定位，不是 king3 应跟随的删除方向。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| React plugin major | v2 | v5 | 无 | 升级会造成 namespace/规则/API breaking |
| recommended 获取 | 手工规则 + hooks recommended | plugin recommended | — | 手工列表容易与插件演进漂移 |
| React Refresh | `warn` | `error` | — | 提升会影响现有用户 |
| type-aware conditional | 两项 `warn` | leaked rendering `error` | — | 高风险规则等级变化 |
| JSX a11y | 无 | opt-in | — | 可选 peer 与新规则面 |

#### 7. 可以考虑引入的内容

- 在大版本中按 Antfu v5 的当前 API **重新设计** React 模块，不能直接改版本号。
- Next/Remix allowExportNames 中，king3 只需补 Next 当前有效名字；Remix/Router 不应在无定位时引入。
- JSX a11y 作为 opt-in 可有价值。
- 对现有 v2 分支先补依赖文档和版本矩阵测试。

#### 8. 不建议引入的内容

- 不建议在小版本把 `react-refresh/only-export-components` 或 type-aware 规则直接从 warn 改 error。
- 不建议删除 React/Next 以对齐 Sxzz；它们是 king3 的公开定位。
- 不建议同时保留旧子插件 namespace 和 v5 unified namespace，容易出现重复规则和重命名冲突。

#### 9. 该模块最终结论

**存在兼容性风险**：当前先修 P0 文档/peer 契约；v5 迁移应作为大版本独立项目。

### 7.6 JSONC、YAML、排序与 pnpm 的解析器关系

#### 1. 文件映射

```text
king3: configs/jsonc.ts, configs/yaml.ts, configs/sort.ts, configs/pnpm.ts
Antfu: configs/jsonc.ts, configs/yaml.ts, configs/sort.ts, configs/pnpm.ts
Sxzz:  configs/jsonc.ts, configs/yml.ts, configs/sort.ts, configs/pnpm.ts
```

#### 2. 模块职责

为 JSON/JSONC/YAML/pnpm workspace 选择 parser/language，注册规则并排序 package/tsconfig/workspace。

#### 3. king3 当前实现

- JSONC 使用 `jsonc-eslint-parser` + plugin v2 recommended。
- YAML 使用 `yaml-eslint-parser` + yml v1 standard/prettier。
- `sortPnpmWorkspace()` 写 `yaml/sort-keys`，在 `jsonc` 开启时无条件加入 factory。
- `pnpm()` 同时动态加载 JSON/YAML parser，规则没有 catalog 使用检测或 editor autofix 控制。

#### 4. Antfu 当前实现

- JSONC v3 使用 `language: 'jsonc/x'`，不再直接依赖 `jsonc-eslint-parser`。
- pnpm 根据 workspace 内容检测 catalog；可分别关闭 json/yaml、控制 sort、editor 中禁用 autofix。
- pnpm workspace sorting 已归入 pnpm 模块，只有 yaml 启用时才生成。
- package/tsconfig 排序更新 `publisher/displayName/imports/categories/scripts-info/libReplacement/erasableSyntaxOnly/git hooks` 等字段。

#### 5. Sxzz 当前实现

- 直接映射 plugin v3 flat recommended config；YAML 使用 `language: 'yml/yaml'`。
- pnpm 配置与 king3 较接近，但 workspace 使用 language，避免额外 parser。
- sort 更新了 j/tsconfig glob、libReplacement、erasableSyntaxOnly 等。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| JSONC API | parser + v2 config | v3 language | v3 flat configs | ESLint 10 迁移点 |
| YAML API | parser + v1 | parser + v3 手工 rules | v3 language | 升级不可机械替换 |
| pnpm/yaml 组合 | sort 由 jsonc 无条件引入 | 由 pnpm options 控制 | preset 中 YAML 总是存在 | king3 在 `yaml:false` 时可能缺 plugin |
| catalog rule | `pnpm:true` 后总启用 | 检测实际 catalog | 总启用 | 无 catalog workspace 可能误报 |

#### 7. 可以考虑引入的内容

- P0：让 `sortPnpmWorkspace` 依赖 yaml/pnpm 的真实启用状态，增加 `jsonc:true,yaml:false,pnpm:*` 组合测试。
- 大版本迁移 JSONC/YML v3 language API。
- 低风险同步排序字段和 `**/[jt]sconfig*.json` glob。
- pnpm options 应按 king3 规模只提供 `catalogs/json/yaml/sort`，不必复制全部 editor 逻辑。

#### 8. 不建议引入的内容

- 不建议强制 Antfu 的 `pnpm/yaml-enforce-settings`：`shellEmulator: true`、`trustPolicy: no-downgrade` 是团队偏好。
- 不建议把 package 字段排序完全照搬某一项目；应形成 king3 自己的稳定顺序，规则变更会产生大面积 autofix diff。

#### 9. 该模块最终结论

**建议优先引入**：先修组合错误；language/plugin v3 作为 ESLint 10 大版本迁移。

### 7.7 Markdown

#### 1. 文件映射

```text
king3: src/configs/markdown.ts
Antfu: src/configs/markdown.ts + factory.ts 的 setDefaultIgnores
Sxzz:  src/configs/markdown.ts
```

#### 2. 模块职责

处理 Markdown 代码块虚拟文件；Antfu 还解析并 lint Markdown 正文本身。

#### 3. king3 当前实现

- 展开 `@eslint/markdown.configs.processor`。
- 只为 Markdown 内 JS/TS/Vue 代码块关闭不适合 snippet 的规则。
- `markdown.overrides` 实际覆盖代码块规则，不覆盖 Markdown 正文。

#### 4. Antfu 当前实现

- 合并 markdown processor 与 pass-through processor。
- 用 `language: markdown/gfm|commonmark` lint 正文。
- 展开 Markdown recommended，提供 `overridesMarkdown`。
- 针对 `@eslint/markdown` SourceCode 与 JS-only rules 的不兼容，在 composer 中给无 files 配置加 Markdown ignore；有 `issue-837` fixture。

#### 5. Sxzz 当前实现

与 king3 同属旧式“仅代码块”路径，但已增加对 baseline/unicorn 新规则的 snippet disables。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| Markdown 正文 | 不 lint | lint recommended | 不 lint | 新能力但会新增用户报错 |
| GFM/CommonMark option | 无 | 有 | 无 | API 扩展 |
| processor merge | 无 | 有 | 无 | 新依赖 `eslint-merge-processors` |
| JS rule crash 保护 | 当前无正文所以不需要 | 有 | 当前无正文所以不需要 | 引入正文时必须一起实现 |

#### 7. 可以考虑引入的内容

作为 P2 opt-in 或下一个 minor 的显式选项重新实现 Markdown 正文 lint；必须同时引入 processor merge、`overridesMarkdown`、default ignores 和回归 fixture。

#### 8. 不建议引入的内容

不能只复制 `language: markdown/gfm` 或 rules，而不复制作用域保护；Antfu 2026-04 的 issue-837 修复证明这会使无 files 的 JS-only rule 在 `.md` 崩溃。

#### 9. 该模块最终结论

**可以考虑**：能力有价值，但不是 P0/P1，且必须成套设计。

### 7.8 imports、Perfectionist 和通用排序

#### 1. 文件映射

```text
king3: configs/imports.ts, configs/perfectionist.ts, configs/sort.ts
Antfu: 同路径三文件
Sxzz:  configs/imports.ts, configs/sort.ts
```

#### 2. 模块职责

检测 import 错误、去重、排序 import/export/named specifier 和结构化配置键。

#### 3. king3 当前实现

- import-lite + antfu rule；type specifier 固定 top-level。
- Perfectionist v4 默认启用，warn 级别，按类型/来源分组且组间必须空行。
- 没有在 factory options 暴露关闭/overrides。

#### 4. Antfu 当前实现

- imports 可关闭/override，Stylistic 时增加 `import/newline-after-import`。
- Perfectionist v5 可关闭/override，规则为 error，使用 v5 的 `type-import/value-*` group schema，组间不强制换行。

#### 5. Sxzz 当前实现

- 使用 `eslint-plugin-importer`，额外禁止 default export 和重复 specifier。
- Perfectionist v5 规则在 `sortImports()` 中，warn 为主，不强制换行。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| plugin | import-lite | import-lite | importer | 没有必要为统一迁移 |
| default export | 允许 | 允许 | 禁止 | Sxzz 个人架构偏好 |
| import 空行 | 强制 groups 间 always | ignore | ignore | king3 明确风格差异，应保留 |
| Perfectionist option | 无 | 可关闭/override | preset 固定 | 可配置性不足 |
| v5 schema | 未迁移 | 已迁移 | 已迁移 | 升级依赖必须改 options |

#### 7. 可以考虑引入的内容

- 在保持默认行为的前提下增加 `perfectionist?: boolean | { overrides }`。
- v5 升级时按 king3 当前分组意图重写 group 名称，不能复制 Antfu 的空行偏好。
- package/tsconfig 排序字段可低风险更新，但要做 fixture。

#### 8. 不建议引入的内容

- 不引入 `import/no-default-export`、不更换 importer，仅因 Sxzz 使用它。
- 不把 Antfu 的 error 级别和 `newlinesBetween: ignore` 直接覆盖 king3 的 warn/always。

#### 9. 该模块最终结论

**建议引入**：可配置性和 v5 迁移准备有价值；具体排序风格继续由 king3 决定。

### 7.9 comments、command、Node、JSDoc、RegExp、Unicorn、Prettier

#### 1. 文件映射

三个项目均有同职责文件；Antfu 没有与 king3 `prettier.ts` 等价的模块，Sxzz 的 `prettier.ts` 基本对应。

#### 2. 模块职责

提供跨语言/通用规则与 Prettier 集成。

#### 3. king3 当前实现

- comments、command 与 Antfu 基本相同。
- Node/JSDoc/Unicorn 规则与 plugin 注册写在无 `files` 的同一 config。
- RegExp 允许把 recommended error 全部降 warn。
- Prettier 与 Sxzz 同构：recommended rules，删除 `vue/html-self-closing` 的关闭项，`prettier/prettier` 设为 warn。

#### 4. Antfu 当前实现

- 2026-02 将 Node/JSDoc 拆为全局 setup + `GLOB_SRC` rules；2026-06 同样给 Unicorn 加 files。
- JSDoc Stylistic 时加 `jsdoc/check-alignment`、`jsdoc/multiline-blocks`。
- 不内置 `eslint-plugin-prettier`；Stylistic/formatter 是不同策略。

#### 5. Sxzz 当前实现

- Unicorn 同样限制 `GLOB_SRC`，并启用 unopinionated preset + 大量 override。
- Node 增加 `node/no-unsupported-features/es-builtins`。
- comments 用原 namespace recommended，并显式 `disable-enable-pair`；Prettier 与 king3 等价。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| Node/JSDoc files | 无 | `GLOB_SRC` | Node/JSDoc 无，Unicorn 有 | Antfu 最近修过 Node 作用域问题 |
| Unicorn files | 无 | 有 | 有 | 两参考共同收敛，建议同步设计 |
| Prettier | 默认 | 无等价 | 默认 | king3 应跟 Sxzz 保持自身定位 |
| comments pair | 当前本地删除 | 无 | `error allowWholeFile` | 维护者偏好，不能当必要同步 |

#### 7. 可以考虑引入的内容

- 把 Node/JSDoc/Unicorn 拆成 setup + `files: [GLOB_SRC]` rules；这是 P1。
- `unicorn/no-duplicate-set-values` 属于低误报正确性候选。
- 声明 engines 后再评估 `node/no-unsupported-features/es-builtins`。

#### 8. 不建议引入的内容

- 不建议用 Antfu Stylistic/formatters 替换 Prettier。
- 不建议复制 Sxzz 的 `unicorn/filename-case`、`no-for-loop`、`prefer-query-selector` 等个人偏好集合。
- `eslint-comments/disable-enable-pair` 是否恢复应由维护者确认本地删除意图。

#### 9. 该模块最终结论

**建议引入**：作用域收紧优先；Prettier 设计保留。

### 7.10 特殊文件、测试文件和可选框架

#### 1. 文件映射

```text
king3: 无统一模块
Antfu: configs/disables.ts, configs/test.ts,
       configs/astro.ts, angular.ts, svelte.ts, solid.ts, toml.ts
Sxzz:  configs/special-cases.ts, configs/astro.ts,
       configs/baseline.ts, configs/de-morgan.ts
```

#### 2. 模块职责

对 scripts/CLI/config/d.ts/CJS/tests 做场景化覆盖，并扩展额外框架/语言。

#### 3. king3 当前实现

没有集中式特殊覆盖；Markdown 内部自己关闭 snippet 规则。没有 Astro/Svelte/Solid/Angular/TOML/test lint。

#### 4. Antfu 当前实现

- `disables.ts` 为 scripts、CLI、bin、d.ts、CJS、config files 关闭不合适规则。
- `test.ts` 识别 spec/test/bench/benchmark，提供 no-only、标题、hook 顺序等规则。
- 可选框架均动态导入 optional peers。

#### 5. Sxzz 当前实现

- `special-cases.ts` 为 CLI、tests、default export 合法目录、GitHub template、JSX 组件放宽规则。
- Astro 直接使用插件 recommended；baseline/de-morgan 是其质量与风格偏好。

#### 6. 关键差异

| 差异项 | king3 | Antfu | Sxzz | 影响 |
| --- | --- | --- | --- | --- |
| special cases | 无 | 6 类 | 5 类 | 两参考共同证明需要场景覆盖 |
| test 专用 plugin | 无 | 有 | 无，仅 disables | 新依赖与行为面 |
| Astro | 无 | 有 | 有 | 两参考共同能力，但仍取决于 king3 定位 |
| 其他框架 | 无 | 多 | 无 | 不是“共同升级” |

#### 7. 可以考虑引入的内容

- 优先新增小型 `special-cases.ts`：scripts/config 允许 console、`.d.ts` 关闭无限 disable/unused vars、CJS 允许 require、tests 关闭 no-unused-expressions。
- 测试 no-only 规则可作为 opt-in 或默认低风险规则。
- Astro 可列 P2 可选扩展；只有确认用户需求后才加 optional peer。

#### 8. 不建议引入的内容

- Angular/Svelte/Solid/TOML、baseline、de-morgan 目前不符合 king3 明确定位，分别列 P3。
- 不要照搬 Sxzz 的 `import/no-default-export` 特例，因为 king3 根本没有禁止 default export。

#### 9. 该模块最终结论

**建议引入**：special cases 是共同设计、低成本高价值；新增框架需要维护者决定。

## 8. ESLint 规则差异专项分析

### 8.1 比较口径

规则比较采用三层证据：

1. 当前 `src/configs/*.ts` 的显式规则和值。
2. Antfu 当前 `test/__snapshots__/factory/*.snap.js` 中已经展开的最终规则名。
3. lockfile 中的插件版本与 Sxzz `src/typegen.ts` 的可用规则类型。

以下表达含义不同：

- “未显式”：源码未直接写出，但可能由 recommended preset 展开；不能直接视为关闭。
- “无模块”：项目没有该框架支持，不参与同等规则取舍。
- “off”：源码明确关闭。
- “需 resolved-config”：只有安装对应版本后展开最终 Flat Config 才能确认。

### 8.2 规则对比总表

| 规则名称 | king3 配置 | Antfu 配置 | Sxzz 配置 | 来源文件 | 差异说明 | 引入影响 | 建议 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `no-useless-call` | 未显式 | `error` | `error` | K/A/S `src/configs/javascript.ts` | 两参考显式采用 | 低主观，发现无意义 call/apply | **A，建议优先评估** |
| `no-useless-computed-key` | 未显式 | `error` | `error` | K/A/S `src/configs/javascript.ts` | 两参考显式采用 | 多数可安全修复 | **A** |
| `no-useless-rename` | 未显式 | `error` | `error` | K/A/S `src/configs/javascript.ts` | 两参考显式采用 | 低误报、减少冗余 | **A** |
| `no-var` | 未显式 | `error` | `error` | K/A/S `src/configs/javascript.ts` | 两参考显式采用 | 现代语法，但可能产生批量 fix | **B** |
| `no-useless-constructor` / `@typescript-eslint/no-useless-constructor` | core `off`（TS）；TS 版 `off` | JS core `error`；TS core/TS 版 `off` | JS core `error`；TS 版 `error` | 三项目 `javascript.ts`、`typescript.ts` | Sxzz 对 TS 最严格 | 会改 class boilerplate；TS decorator 场景需验证 | **B** |
| `one-var` | 未显式 | `['error',{ initialized:'never' }]` | 同左 | A/S `javascript.ts` | 两参考相同但属于声明风格 | 大量格式性改动 | **C，可选风格** |
| `require-await` | 明确 `off` | 未显式 | `error` | K/A/S `javascript.ts` | 三者策略分裂 | 常报接口实现/预留 async；行为噪声较高 | **D，暂不引入** |
| `default-case-last` | 未显式 | `error` | 未显式 | A `javascript.ts` | Antfu 独有显式规则 | 低风险、提高 switch 可读性 | **B** |
| `no-eval` | 未显式 | `error` | 未显式 | A `javascript.ts` | 安全性规则 | 对确有动态执行需求的代码会报错 | **B，建议** |
| `no-implied-eval` | type-aware 时 core `off`，由 `typescript/no-implied-eval:error` 取代 | JS `error`；type-aware 由 TS 版取代 | 未显式 | K/A `javascript.ts`、`typescript.ts` | king3 仅 TS type-aware 有覆盖，普通 JS 未显式 | 安全性收益清楚 | **A，先为 JS 评估** |
| `no-new-func` | 未显式 | `error` | 未显式 | A `javascript.ts` | Antfu 安全策略 | 少量动态代码生成会受影响 | **B** |
| `no-proto` | 未显式 | `error` | 未显式 | A `javascript.ts` | 禁止遗留 `__proto__` API | 低风险现代化 | **A** |
| `no-restricted-properties` | 未显式 | 禁 `__proto__`、`__defineGetter__`、`__defineSetter__`、`__lookupGetter__`、`__lookupSetter__` | 未显式 | A `javascript.ts` | Antfu 扩展安全/现代化 | 可能影响遗留代码 | **B** |
| `no-restricted-globals` | 未显式 | 禁 `global`、`self`，建议 `globalThis` | 未显式 | A `javascript.ts` | Antfu 运行时偏好 | browser worker 中 `self` 很常见，风险高 | **D** |
| `prefer-promise-reject-errors` | 未显式 | `error` | 未显式 | A `javascript.ts` | 更可靠的 rejection | 少数非 Error rejection 会报错 | **B** |
| `symbol-description` | 未显式 | `error` | 未显式 | A `javascript.ts` | 提升调试性 | 低风险 | **B** |
| `antfu/no-top-level-await` | 无 | `error`，在 scripts/CLI/config/Vue/Astro/test/Markdown 中关闭 | 无 | A `javascript.ts`、`disables.ts` 等 | Antfu 的目标环境偏好 | 需要大量例外，且 ESM 生态普遍支持 | **D** |
| `@typescript-eslint/consistent-type-assertions` | 未显式 | 未显式 | `['error',{ assertionStyle:'as', objectLiteralTypeAssertions:'allow-as-parameter' }]` | S `typescript.ts` | Sxzz 独有 | 风格+类型安全，可能大量修复 | **B** |
| `@typescript-eslint/prefer-as-const` | 取决于 strict preset，源码未显式 | 同左 | `warn` | 三项目 `typescript.ts` | 必须展开各自 preset 才能确认最终差异 | 低风险 | **E，resolved-config 验证** |
| `@typescript-eslint/prefer-literal-enum-member` | 未显式 | 未显式 | `['error',{ allowBitwiseExpressions:true }]` | S `typescript.ts` | Sxzz 独有 | 对 enum 风格有约束 | **B** |
| `@typescript-eslint/no-duplicate-imports`（king3 namespace 为 `typescript/no-duplicate-imports`） | type-aware `error` | 当前无 | 无 | K/A/S `typescript.ts` | king3 独有旧扩展；三者均已有 import 去重能力 | 重复检查，可能是旧设计 | **A，建议移除前验证** |
| `@typescript-eslint/consistent-type-imports` | 基础：`separate-type-imports`；type-aware 后被较简 options 覆盖 | 基础：`separate-type-imports`；type-aware 不重复 | `inline-type-imports` | 三项目 `typescript.ts` | king3 type-aware 文件最终 fixStyle 与基础文件不一致 | 改动 import 格式，是用户可见 fix 变化 | **A，先统一 king3 自身** |
| `@typescript-eslint/explicit-function-return-type` | 无 | `type:'lib'` 时 `error`，允许 expression/HOF/IIFE | 无 | A `typescript.ts` | library opt-in | 对库 API 有价值但报错量大 | **B，作为 opt-in** |
| `erasable-syntax-only/enums` | 无 | `erasableOnly` 时 `error` | 无独立规则；仓库 TS config 开 erasable | A `typescript.ts` | Antfu opt-in | 新依赖、限制 enum | **B/P2** |
| `erasable-syntax-only/import-aliases` | 无 | opt-in `error` | 无 | A `typescript.ts` | 同上 | 限制 TS-only runtime syntax | **B/P2** |
| `erasable-syntax-only/namespaces` | 无 | opt-in `error` | 无 | A `typescript.ts` | 同上 | 现有 namespace 代码 breaking | **B/P2** |
| `erasable-syntax-only/parameter-properties` | 无 | opt-in `error` | 无 | A `typescript.ts` | 同上 | Angular/legacy TS 常用，风险高 | **B/P2** |
| `react-refresh/only-export-components` | `warn`；Vite/Next allow list | `error`；Vite/Next/Remix/Router allow list | 无模块 | K/A `react.ts` | Antfu 提升等级并扩展框架 | error 会使现有 React 项目新增失败 | **B，保持 warn；补 Next 名字** |
| `react/no-leaked-conditional-rendering` | type-aware `warn` | type-aware `error` | 无模块 | K/A `react.ts` | 同一规则等级变化 | type-aware、可能有误报/改代码 | **B，保持 warn 观察** |
| `react/no-implicit-key` | type-aware `warn` | 当前由 v5 recommended 动态决定，type-aware 层不再显式 | 无模块 | K/A `react.ts` | 插件 v5 迁移后规则归属改变 | 不能跨 major 机械对照 | **E，v5 resolved-config** |
| `react-dom/no-*` → `react/dom-*` | v2 子插件 namespace，多项显式规则 | v5 unified recommended；显式 TS disables 为 `react/dom-no-*` | 无模块 | K/A `react.ts` | 插件规则 namespace/API 重构 | 公开 override、eslint-disable 都可能 breaking | **E，大版本迁移** |
| `vue/no-irregular-whitespace` | 未显式 | `error` | 未显式 | A `vue.ts` | Antfu 正确性规则 | 低主观 | **A** |
| `vue/no-sparse-arrays` | 未显式 | `error` | 未显式 | A `vue.ts` | 模板/表达式正确性 | 低风险 | **A** |
| `vue/no-restricted-v-bind` | 未显式 | `['error','/^v-/']` | 未显式 | A `vue.ts` | 防止动态 directive-like attribute | 可能影响高级动态绑定 | **B** |
| `vue/prefer-separate-static-class` | 未显式 | `error` | 未显式 | A `vue.ts` | 可修复模板质量规则 | 有一定风格性 | **B/C** |
| `vue/padding-line-between-blocks` | 未显式 | Stylistic 时 `['error','always']` | `['error','always']` | A/S `vue.ts` | 两参考共同但纯风格 | 与 Prettier/现有 SFC 格式有关 | **C** |
| `vue/return-in-computed-property` | recommended 动态值 | recommended 动态值 | 显式 `['error',{ treatUndefinedAsUnspecified:false }]` | 三项目 `vue.ts` | Sxzz 固定 option；不能据此断言 king3 未启用 | 改 option 可能报已有 computed | **E** |
| `import/no-duplicates` | `error` | `error` | `['error',{ preferInline:true }]` | 三项目 `imports.ts` | Sxzz 偏好 inline type imports | 与 king3 separate type import 冲突 | **D，保留现状** |
| `import/newline-after-import` | 无 | Stylistic 时 `['error',{count:1}]` | 无 | A `imports.ts` | Antfu 风格规则 | 与 Perfectionist 分组/Prettier重叠 | **C/D** |
| `unicorn/no-duplicate-set-values` | 无 | 精选集无 | `error` | S `unicorn.ts` | Sxzz 2026-06 新增，属错误检测 | 低误报，检测重复 Set literal | **A，优先候选** |
| `unicorn/filename-case` | 无 | 精选集无 | kebab/Pascal + locale/import_map 例外 | S `unicorn.ts` | Sxzz 文件命名偏好 | 大量重命名，跨平台风险 | **D** |
| `unicorn/no-for-loop` | 无 | 精选集无 | `error` | S `unicorn.ts` | 强风格偏好 | 算法代码误报/重写 | **D** |
| `node/no-unsupported-features/es-builtins` | 无 | 无 | `error` | S `node.ts` | 依据 engines 判断 builtin 支持 | 需先有准确 engines，可能非常有价值 | **B/P2** |
| `jsdoc/check-alignment` | 无 | Stylistic 时 `warn` | 无 | A `jsdoc.ts` | 风格规则 | 与 formatter 重叠 | **C/D** |
| `jsdoc/multiline-blocks` | 无 | Stylistic 时 `warn` | 无 | A `jsdoc.ts` | 风格规则 | 与 formatter重叠 | **C/D** |
| `eslint-comments/disable-enable-pair` | 当前工作区无；HEAD 曾为 `['error',{allowWholeFile:true}]` | 无 | 原 namespace下同样 `error/allowWholeFile` | K `comments.ts` 工作区 diff；S `comments.ts` | king3 本地正在删除，非上游缺失 | 强制成对会增加注释噪声 | **需要维护者决定** |
| `pnpm/json-enforce-catalog` | `error`，`pnpm:true` 即启用 | 仅检测到 catalog 时 `['error',{autofix:!isInEditor,ignores:['@types/vscode']}]` | `error` | 三项目 `pnpm.ts` | Antfu 最细致 | 现有非 catalog workspace 可能受影响 | **B，借鉴条件检测** |
| `pnpm/json-prefer-workspace-settings` | `error` | `['error',{autofix:!isInEditor}]` | `error` | 三项目 `pnpm.ts` | editor fix 行为不同 | 自动改 package/workspace，有用户可见 diff | **B** |
| `pnpm/yaml-enforce-settings` | 无 | 强制 `shellEmulator:true`、`trustPolicy:no-downgrade` | 无 | A `pnpm.ts` | Antfu 仓库偏好 | 不属于通用正确性 | **D** |
| `markdown/heading-increment` | 无正文模块 | recommended `error` | 无正文模块 | A `markdown.ts` + full-on snapshot | Markdown language 新能力 | 启用后大量文档新增错误 | **B/P2** |
| `markdown/no-duplicate-definitions` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 正确性较强 | 低主观 | **A（若引入正文 lint）** |
| `markdown/no-empty-definitions` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 正确性 | 低主观 | **A（条件同上）** |
| `markdown/no-empty-images` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 文档质量 | 可能影响占位文档 | **B** |
| `markdown/no-empty-links` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 文档质量 | 低风险 | **A/B** |
| `markdown/no-invalid-label-refs` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 文档正确性 | 低风险 | **A** |
| `markdown/no-missing-atx-heading-space` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 语法/格式 | 可自动修复 | **B/C** |
| `markdown/no-missing-link-fragments` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 链接正确性 | 可能受跨文件/生成 heading 影响 | **B** |
| `markdown/no-multiple-h1` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 文档结构偏好 | README/MDX 可能合理多 H1 | **B/C** |
| `markdown/no-reference-like-urls` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 防止误写引用 | 低风险 | **B** |
| `markdown/no-reversed-media-syntax` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 语法错误检测 | 低风险 | **A** |
| `markdown/no-space-in-emphasis` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 语法/格式 | 低风险 | **B/C** |
| `markdown/no-unused-definitions` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | 清理无用引用 | 大型拼接文档可能误报 | **B** |
| `markdown/require-alt-text` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | a11y | 高价值，但会新增报错 | **B** |
| `markdown/table-column-count` | 无正文模块 | recommended `error` | 无正文模块 | 同上 | GFM 表格正确性 | GFM 模式低风险 | **A** |
| `test/no-only-tests` | 无 | editor `warn`、CLI `error`，并将 fix 控制 | 无 plugin | A `test.ts` | 防止提交 `.only` | 高价值、需两个依赖或单一替代插件 | **B/P2** |
| `test/no-identical-title` | 无 | `error` | 无 | A `test.ts` | 测试质量 | 对 Vitest/Jest 风格有假设 | **B/P2** |
| `baseline-js/use-baseline` | 无 | 无 | `warn`，可配 widely/newly/年份 | S `baseline.ts` | Sxzz 独有，依赖目标环境 | 需要浏览器目标策略，可能高噪声 | **D/P3** |
| `e18e/prefer-array-fill`、`e18e/prefer-includes`、`e18e/prefer-nullish-coalescing`、`e18e/prefer-object-has-own`、`e18e/prefer-url-canparse`、`e18e/prefer-timer-args`、`e18e/prefer-date-now`、`e18e/prefer-regex-test`、`e18e/prefer-array-some`、`e18e/prefer-string-fromcharcode` | 无 | 默认由 e18e preset 启用 | 无 | A `e18e.ts` + full-on snapshot | Antfu 2026-03 新增 | 新硬依赖，部分自动变换有语义/目标环境风险 | **D/P3** |

表中 `K/A/S` 分别指完整项目根目录 `01_king3-eslint-config`、`02_antfu-eslint-config`、`03_sxzz-eslint-config`；具体相对路径已在“来源文件”列给出。

### 8.3 Type-aware 规则专项

`01_king3-eslint-config/src/configs/typescript.ts` 在 `tsconfigPath` 存在时启用下列完整规则：

```text
typescript/await-thenable
typescript/consistent-type-imports
typescript/dot-notation
typescript/no-duplicate-imports
typescript/no-floating-promises
typescript/no-for-in-array
typescript/no-implied-eval
typescript/no-misused-promises
typescript/no-unnecessary-type-assertion
typescript/no-unsafe-argument
typescript/no-unsafe-assignment
typescript/no-unsafe-call
typescript/no-unsafe-member-access
typescript/no-unsafe-return
typescript/promise-function-async
typescript/restrict-plus-operands
typescript/restrict-template-expressions
typescript/return-await
typescript/strict-boolean-expressions
typescript/switch-exhaustiveness-check
typescript/unbound-method
```

Antfu 当前除了不再在 type-aware 层重复 `consistent-type-imports`、移除 `no-duplicate-imports` 外，其余规则和值与 king3 基本一致。Sxzz 没有 type-aware 模式。由此可得：

- **事实**：king3 的 type-aware 能力并未明显落后，反而比 Sxzz 完整。
- **建议**：不要重写 type-aware 架构；只清理重复/旧规则并补 fixture 性能与 project service 测试。
- **风险**：所有 `no-unsafe-*`、`strict-boolean-expressions`、`no-misused-promises` 都会产生大量现有代码报错；保持 opt-in 是正确设计。

### 8.4 规则作用域变化

| 模块 | king3 | Antfu 当前 | Sxzz 当前 | 判断 |
| --- | --- | --- | --- | --- |
| Node | plugin+rules 无 files | setup 无 files，rules 仅 `GLOB_SRC` | 无 files | Antfu 2026-02 专门修复作用域，king3 值得同步 |
| JSDoc | plugin+rules 无 files | setup 无 files，rules 仅 `GLOB_SRC` | 无 files | 同上 |
| Unicorn | plugin+rules 无 files | setup 无 files，rules 仅 `GLOB_SRC` | unopinionated+rules 均 `GLOB_SRC` | 两参考当前共同限制，P1 |
| TypeScript | setup 无 files，parser/rules 有 files | 同 | recommended extends 有 files | 正确 |
| Vue/React/Next | rules 有 files | rules 有 files | Vue 有 files | 正确 |
| Markdown 正文 | 不适用 | 无 files 配置默认忽略 `.md` | 不适用 | 只有引入 Markdown language 后需要 |

### 8.5 规则/插件命名空间迁移

| 迁移 | king3 当前 | 参考现状 | 风险 |
| --- | --- | --- | --- |
| typescript-eslint | `@typescript-eslint/* → typescript/*` | Antfu 改为 `ts/*`；Sxzz保留原名 | king3 已有用户 override/disable，不应跟随改 `ts` |
| Node | `n/* → node/*` | Antfu 同；Sxzz直接注册 `node` | 保持 |
| YAML | `yml/* → yaml/*` | Antfu 同；Sxzz保留 `yml/*` | ESLint 10/YML v3 迁移时保留公开 alias |
| React v2→v5 | `react-dom/*` 等子插件名 | Antfu unified `react/*`，如 `react/dom-no-*` | 大量公开 rule ID breaking；必须大版本 |
| JSONC v2→v3 | parser + `jsonc/*` | `language: jsonc/x`，rule namespace不变 | config shape breaking，不一定影响用户 rule ID |
| Perfectionist v4→v5 | `external-type/builtin-type/...` groups | `type-import/value-builtin/...` groups | 旧 options 可能被拒绝或行为改变 |

### 8.6 规则推荐分类

#### A. 建议优先同步/验证

- `no-useless-call`
- `no-useless-computed-key`
- `no-useless-rename`
- `no-implied-eval`（普通 JS）
- `no-proto`
- `unicorn/no-duplicate-set-values`
- `vue/no-irregular-whitespace`
- `vue/no-sparse-arrays`
- 移除或替代 `typescript/no-duplicate-imports`
- 统一 `typescript/consistent-type-imports` 在基础与 type-aware 层的 options
- 若启用 Markdown 正文：`markdown/no-duplicate-definitions`、`markdown/no-empty-definitions`、`markdown/no-invalid-label-refs`、`markdown/no-reversed-media-syntax`、`markdown/table-column-count`

#### B. 建议评估后引入

- `default-case-last`
- `no-eval`
- `no-new-func`
- `no-restricted-properties`
- `prefer-promise-reject-errors`
- `symbol-description`
- `@typescript-eslint/consistent-type-assertions`
- `@typescript-eslint/prefer-literal-enum-member`
- `vue/no-restricted-v-bind`
- `vue/prefer-separate-static-class`
- `node/no-unsupported-features/es-builtins`
- `test/no-only-tests`、`test/no-identical-title`
- Markdown a11y/结构规则

#### C. 可选风格规则

- `one-var`
- `vue/padding-line-between-blocks`
- `import/newline-after-import`
- `jsdoc/check-alignment`
- `jsdoc/multiline-blocks`
- Antfu `style/*` 与 Vue Stylistic 规则

#### D. 不建议引入

- `antfu/no-top-level-await`
- `no-restricted-globals` 对 `self` 的限制
- `require-await:error`
- `pnpm/yaml-enforce-settings`
- `import/no-default-export`
- `unicorn/no-for-loop`
- `unicorn/filename-case`
- e18e 默认全集

#### E. 需要进一步验证

- `@eslint/js` v9/v10 recommended 的精确差异，尤其 `no-useless-assignment` 等新 core rule。
- `@eslint-react` v2 最低 peer 是否包含 king3 全部显式规则；v5 recommended 的最终规则和值。
- JSONC/YML/Unicorn/Perfectionist 大版本的弃用和 replacement，必须在安装目标版本后运行 resolved config。
- `eslint-plugin-regexp` recommended 从 v2.10 到 v3.1 的新增规则，包括复杂度/回溯检查的误报与性能。

## 9. Antfu 新增但 king3 缺失的内容

这里的“新增”分为“2026-02-19 后真正新增”和“当前存在但 king3 从未拥有”。

### 9.1 半年内真正新增/重构

| 来源文件 | 时间证据 | 模块职责 | king3 等价实现 | 引入价值 | 成本 | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| `02_antfu-eslint-config/src/configs/e18e.ts` | 2026-03-06 `ebd46fb` 新增 | 现代化/性能规则 preset | 无 | 某些低层规则有价值 | 新硬依赖、语义/目标环境风险 | P3，不整体引入 |
| `src/configs/markdown.ts` + `src/factory.ts` | 2026-02-24 后 language；2026-04-30 issue-837 保护 | Markdown 正文 lint | 仅代码块 | 文档正确性 | 新 processor、行为变化、规则 crash 防护 | P2，成套重实现 |
| `src/configs/jsonc.ts` | 2026-02-25 `a9b7aa4` | `language: jsonc/x` | parser v2 | ESLint 10/plugin v3 兼容 | 大版本依赖迁移 | P1 大版本 |
| `src/configs/node.ts`、`jsdoc.ts` | 2026-02-25 scope fix | setup/rules 分离 | 单个无 files config | 降低跨语言污染 | 低 | P1 |
| `src/configs/react.ts` | 2026-04/05 breaking commits | React plugin v3→v5 | v2 手工子插件 | 跟进插件 API/规则修复 | 高，公开 rule ID breaking | 大版本重新设计 |
| `test/api.test.ts` + tsnapi/stale guard | 2026-04-13 后 | 公共 API 快照 | 无 | 防止入口/类型破坏 | 中 | P1，按 king3 重写 |
| `src/factory.ts` Markdown default ignores | 2026-04-30 | 防 JS-only rule 作用于 Markdown | 无正文 lint，当前不需要 | 引入正文 lint 时必要 | 低但依赖 composer v3 行为 | 与 Markdown 一起 |

### 9.2 当前 Antfu 存在、king3 缺失的文件/模块

| 来源项目 | 文件路径 | 模块职责 | king3 是否有等价实现 | 引入价值 | 引入成本 | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| Antfu | `src/config-presets.ts` | full on/off presets | typegen 脚本手写全开 options | 测试/typegen 防漂移 | 低 | 内部借鉴，不必公开 |
| Antfu | `src/configs/disables.ts` | scripts/CLI/bin/d.ts/CJS/config 覆盖 | 无 | 高 | 低 | P1 重实现 |
| Antfu | `src/configs/test.ts` | Vitest/no-only | 无 | 中高 | 2 个依赖、框架假设 | P2 |
| Antfu | `src/configs/jsx.ts` | JSX setup/a11y | React 自带 JSX setup，无 a11y | a11y 高 | optional peer | P2 |
| Antfu | `src/configs/astro.ts` | Astro parser/rules | 无 | 取决于用户 | optional peers +测试 | P2 待定位 |
| Antfu | `src/configs/angular.ts` | Angular TS/template | 无 | 当前低 | 3 peers、复杂 processor | P3 |
| Antfu | `src/configs/svelte.ts` | Svelte parser/rules | 无 | 当前低 | 2 peers +维护 | P3 |
| Antfu | `src/configs/solid.ts` | Solid JSX | 无 | 当前低 | peer +维护 | P3 |
| Antfu | `src/configs/toml.ts` | TOML lint | 无 | 有限 | 2 直接依赖 | P3 |
| Antfu | `src/configs/stylistic.ts` | ESLint Stylistic | Prettier | 重复 | 冲突/体积 | P3，不引入 |
| Antfu | `src/configs/formatters.ts`、`src/vender/prettier-types.ts` | 通过 ESLint format CSS/HTML/XML/SVG/MD/Astro/GraphQL | Prettier plugin 仅 JS 支持 | 特定用户有价值 | 大模块、optional peers | P3，不纳入核心 |
| Antfu | `src/cli.ts`、`src/cli/**`、`bin/index.mjs` | 初始化/迁移 CLI | README 手工安装 | 低到中 | 10+ 文件、写用户项目、测试负担 | P3 |
| Antfu | `test/**`、`fixtures/**` | 行为/API/CLI测试 | 无 | 很高 | 中 | 只借测试策略 |
| Antfu | `.github/workflows/ci.yml` | build/lint/typecheck/test | 无 | 很高 | 低 | P1 重写 |
| Antfu | `.github/workflows/release.yml` | tag publish | 无 | 中 | 需确定发布权限 | P2/P0 发布保护的一部分 |
| Antfu | `netlify.toml` | 部署 inspector | 无 | 低 | 外部服务 | P3 |

## 10. Sxzz 新增但 king3 缺失的内容

Sxzz 在 2026-02-19 之后没有新增 `src/configs/*` 文件；以下是当前存在的职责差异或半年内行为变化。

| 来源项目 | 文件路径 | 模块职责 | king3 是否有等价实现 | 引入价值 | 引入成本 | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| Sxzz | `src/presets.ts` | 多层 preset + 主工厂 | king3 只有主 factory/细粒度 configs | 测试/typegen 组合可维护 | 低 | 内部轻量借鉴 |
| Sxzz | `src/configs/special-cases.ts` | CLI/test/default export/GitHub/JSX 场景覆盖 | 无统一模块 | 高 | 低 | P1，按 king3 规则重写 |
| Sxzz | `src/configs/astro.ts` | Astro recommended | 无 | 取决于用户 | optional peer/测试 | P2 |
| Sxzz | `src/configs/baseline.ts` | Web/JS Baseline | 无 | 目标明确时有价值 | 新依赖、高噪声 | P3 |
| Sxzz | `src/configs/de-morgan.ts` | De Morgan 自动转换 | 无 | 有限 | 新依赖、风格性 | P3 |
| Sxzz | `src/typegen.ts` | 提交生成规则类型 | 构建前生成、不提交 | fresh clone 可直接 typecheck | 18k 行 review 噪声 | P3，不照搬 |
| Sxzz | `.github/renovate.json5` | 自动依赖更新 | 无 | 维护便利 | 需要 bot 策略 | P2 可选 |
| Sxzz | `eslint-inspector.config.ts` | 独立 inspector | 合在自检配置 | 小幅解耦 | 低 | P2/低优先级 |
| Sxzz | `tsdown-preset-sxzz`、组织 workflows | 组织级构建/发布 | 无 | 对 king3 无直接价值 | 外部耦合 | P3 |

半年内值得注意而非“新文件”的变化：

- `src/configs/jsonc.ts` 改为 plugin v3 flat configs。
- `src/configs/unicorn.ts` 给两层配置加 `GLOB_SRC`，新增 `unicorn/no-duplicate-set-values`，并为 locale 文件修正 filename-case 例外。
- `package.json` 抬高 Node engines，扩展 Astro v2/v3；`tsconfig.json` 改 NodeNext/erasable。
- `scripts/typegen.ts` 改为 Node 直接运行并显式 `.ts` 扩展。

## 11. Antfu 和 Sxzz 共同采用的新设计

| 共同方向 | Antfu 证据 | Sxzz 证据 | king3 现状 | 判断 |
| --- | --- | --- | --- | --- |
| ESLint 10 peer | `package.json` | `package.json` | 仅 ESLint 9 | 生态必要方向，但应大版本迁移 |
| Plugin 大版本组合 | workspace catalogs：JSONC3/YML3/Unicorn72/Perfectionist5/Node18/JSDoc63 | 同等级版本 | 旧一代组合 | 说明不是单项目偏好；需整体兼容分支 |
| Unicorn 限定源码 glob | `configs/unicorn.ts` | 同 | 无 files | P1，低风险借鉴 |
| 特殊文件覆盖 | `configs/disables.ts` + `test.ts` | `configs/special-cases.ts` | 无 | P1，共同设计价值高 |
| Astro 支持 | `configs/astro.ts` | 同 | 无 | 共同能力，但仍不是 king3 必需定位 |
| package/tsconfig 排序新字段 | `configs/sort.ts` | 同 | 缺 `libReplacement/erasableSyntaxOnly`、jconfig 等 | P1 低风险更新 |
| pnpm 11 | package manager/workspace | 同 | pnpm 10 | 仓库工具升级，不等于发布库功能必要 |
| Prettier | Antfu 不同 | Sxzz 与 king3 相同 | 已有 | 没有共同迁移方向，king3 应保持自身策略 |

最重要的共同信号是“**为不同文件类型限制规则作用域**”与“**对特殊文件提供显式 override**”，而不是框架数量。

## 12. king3 独有实现与现有问题

### 12.1 king3 现有文件专项审查

| king3 文件 | 当前职责 | 发现的问题或特点 | 参考项目做法 | 是否建议调整 | 理由 |
| --- | --- | --- | --- | --- | --- |
| `package.json` | 公开包契约 | CJS+ESM 是优势；缺 engines/prepack/test/CI | 参考 ESM-only但有发布钩子 | 部分调整 | 保留双格式，补保护 |
| `scripts/build.ts` | 构建+类型名重命名 | 74 行后处理较重，但职责明确 | 参考交给 tsdown preset | 暂保留 | CJS/`.d.ts` 契约需要；先由测试证明 |
| `scripts/typegen.ts` | 生成 rule/config 类型 | 全开列表手写；生成物缺失时 typecheck 风险 | Antfu full-on preset；Sxzz提交生成物 | 调整 | 内部 full preset + CI fresh check |
| `src/index.ts` | 根导出 | `defineConfig` 别名是独有便利 | Antfu default only；Sxzz named only | 保留 | 已是公开 API |
| `src/factory.ts` | 工厂 | 282 行尚可；`componentExts.push` mutation；无 runtime files guard；pnpm sort耦合 | Antfu guard/更复杂 factory；Sxzz presets | 调整 | 修 bug/校验，不需大拆 |
| `src/types.ts` | 公共类型 | 本地未提交变更已对齐 `ConfigWithExtends`/RuleOptions | Antfu同设计 | 保留并测试 | 有助 composer extends 类型 |
| `src/env.ts` | 自动检测 | React 自动检测是独有；非 TTY 缺 peer 时失败信息差 | Antfu React 默认 false；Sxzz无 React | 保留并加保护 | 符合 README 定位 |
| `src/globs.ts` | 文件范围 | 缺 `.next`；多个导出仅外部可用、内部无调用 | Antfu更完整 | 调整 | Next 是已支持框架 |
| `src/configs/react.ts` | React 全家桶 | 基于 v2 手工列表；README 缺 refresh；未来 v5 breaking | Antfu v5 recommended | 先修文档，大版本重写 | 不能小版本机械升级 |
| `src/configs/nextjs.ts` | Next rules | 与 Antfu基本一致 | Sxzz无 | 保留 | king3 定位优势 |
| `src/configs/prettier.ts` | Prettier rule | 与 Sxzz同构，默认 warn | Antfu不采用 | 保留 | 核心定位；可讨论 lint 是否容忍 warn |
| `src/configs/perfectionist.ts` | import/export sorting | 默认实际启用，但 factory 注释称 optional/not enabled；无 toggle | Antfu已有 toggle/override | 调整 | 注释失真、可配置性不足 |
| `src/configs/sort.ts` | JSON key sorting | pnpm YAML 与 jsonc/yaml 生命周期耦合；字段略旧 | Antfu归入 pnpm；Sxzz仍同层但 YAML总启用 | 调整 | 有可复现组合风险 |
| `src/configs/markdown.ts` | code snippets | 无正文 lint；这是功能边界不是 bug | Antfu正文；Sxzz同 king3 | 可选 | 不应误判缺失 |
| `src/configs/comments.ts` | directive 规则 | 工作区删除 pair rule，意图未知 | Antfu也无；Sxzz有 | 待确认 | 不能覆盖维护者未提交选择 |
| `README*.md` | 双语文档 | 双语优势；依赖/版本/options 不完整 | Antfu完整但很长 | 调整 | 准确性优先 |

### 12.2 已无调用方或仅公共导出的符号

在 king3 内部，以下导出没有调用方：`GLOB_ALL_SRC`、`GLOB_CSS`、`GLOB_LESS`、`GLOB_SCSS`，`combine()` 也只作为公共 helper 存在。

这不等于“死代码”，因为 `src/index.ts` 明确把 globs/utils 作为公开 API 导出。删除会构成 breaking change。建议先用 API snapshot 固化，再在大版本通过 deprecation 处理，而不是当前删除。

### 12.3 应继续保留的设计

- CJS + ESM 双入口。
- `defineConfig` 别名和 default `king3`。
- `typescript`/`node`/`yaml` 语义化 rule namespace，尽管 Antfu改成 `ts`。
- Type-aware TS 为 opt-in。
- React/Next/UnoCSS optional peer + 动态加载。
- Prettier 默认，与 Sxzz/项目文档一致。
- 双语文档。
- 简单 options，不扩成 Antfu 的全框架矩阵。

## 13. 可以直接借鉴的内容

“直接借鉴”指设计和局部代码模式可按 king3 命名重写，不是复制文件。

| 内容 | 来源 | 解决的问题 | 对 king3 价值 | 新依赖 | 公开 API | 风险 | 方式 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| setup 与 rules 分离并给 rules 加 `GLOB_SRC` | Antfu `configs/node.ts`、`jsdoc.ts`、`unicorn.ts`；Sxzz `unicorn.ts` | 非源码文件被 JS plugin rule 处理 | 高 | 无 | config name 可能增加 | named config 变化 | 按 `king3/*` 重写 |
| special cases | Antfu `configs/disables.ts`；Sxzz `configs/special-cases.ts` | d.ts/CJS/scripts/config/tests 误报 | 高 | 无 | 新 config names | 规则放宽需 fixture | 取两者交集重写 |
| `prepack`/`prepublishOnly` | Antfu/Sxzz `package.json` | 空/旧 dist 发布 | 极高 | 无 | 无 | 构建时间 | 直接采用模式 |
| Node engines 元数据 | Sxzz `package.json` + king3 lockfile | 安装范围不透明 | 极高 | 无 | 安装约束 | 可能阻止旧 Node | 按 king3 实际下限写 |
| factory 组合快照 | Antfu `test/factory-snap.test.ts` | options 组合回归 | 高 | Vitest | 无 | snapshot 维护 | 精简重写 |
| API/pack snapshot | Antfu `test/api.test.ts` | 导出/类型回归 | 高 | 可选 tsnapi，或自写 smoke | 无 | 工具成本 | 先做 import/require smoke |
| optional peer 明确错误 | Sxzz `src/utils.ts#importWithError` | CI 原始 module error | 高 | 无 | 错误文本 | 低 | 与 `ensurePackages` 合并 |
| 第一参数 `files` 运行时报错 | Antfu `src/factory.ts#antfu` | JS 用户静默误用 | 中 | 无 | 错误行为 | 可能暴露已有错误配置 | 直接借鉴逻辑 |
| sort 新字段 | Antfu/Sxzz `configs/sort.ts` | 新 TS/package 字段被排到末尾 | 中 | 无 | autofix 行为 | 大量排序 diff | 分批同步并 fixture |
| internal full-on options | Antfu `src/config-presets.ts` | typegen/test 列表漂移 | 中 | 无 | 建议不公开 | 低 | 内部常量 |

## 14. 需要重新设计后引入的内容

### 14.1 ESLint 10/plugin 大版本组合

不能单独把 `eslint` peer 改成 `^9 || ^10`。至少要联动：

```text
eslint / @eslint/js
eslint-flat-config-utils
@eslint/markdown
eslint-plugin-jsonc / jsonc language
eslint-plugin-yml / yaml language
eslint-plugin-unicorn
eslint-plugin-perfectionist（import group schema）
eslint-plugin-n
eslint-plugin-jsdoc
Node engines
```

建议在 v6/大版本分支运行 ESLint 9 最新与 ESLint 10 双矩阵；如果某些插件只支持 ESLint 10，再决定是否放弃 ESLint 9，而不是先承诺 peer。

### 14.2 React plugin v5

`02_antfu-eslint-config/src/configs/react.ts` 已证明 v2→v5 是 breaking migration：子插件 namespace、recommended rules、React hooks 依赖和规则名都变化。king3 应：

1. 先固定当前 v2 resolved config snapshot。
2. 在独立分支生成 v5 resolved config，建立 old rule ID→new rule ID 映射。
3. 决定是否在一个 major 中直接切换，还是提供临时 legacy option。
4. 更新 README、peer、typegen、Next allow exports 和迁移说明。

### 14.3 Markdown 正文 lint

需同时引入：`eslint-merge-processors`、GFM/CommonMark language、`overridesMarkdown`、Markdown recommended、无 files config 的 Markdown default ignores、issue-837 类 fixture。只引入其中一部分是不完整实现。

### 14.4 pnpm 模块

建议把 `sortPnpmWorkspace` 从 JSONC 生命周期移到 pnpm/YAML 生命周期，并引入精简 options：

```ts
pnpm?: boolean | {
  catalogs?: boolean
  json?: boolean
  yaml?: boolean
  sort?: boolean
}
```

默认值应基于 `pnpm-workspace.yaml` 和 catalog 内容，而不是复制 Antfu 对 `shellEmulator/trustPolicy` 的偏好。

### 14.5 测试与 presets

测试策略可借 Antfu，但输出和 fixture 必须围绕 king3 的 Prettier/React/Next/CJS 定位重写。尤其 Antfu 没有 CJS发布，因此它的测试不能覆盖 king3 最独特的风险。

### 14.6 Astro/a11y

Astro 是两参考共同能力，JSX/Vue a11y 也有明确质量价值；但它们都增加 optional peers、类型生成与 fixture。应在用户需求明确后作为独立 feature 发布，不应夹带在生态依赖升级中。

## 15. 不建议引入的内容

| 内容 | 来源 | 不建议原因 |
| --- | --- | --- |
| 全套 ESLint Stylistic | Antfu `configs/stylistic.ts` | 与 king3/Sxzz 的 Prettier 定位重复并可能冲突 |
| 外部 formatter 大模块 | Antfu `configs/formatters.ts` | CSS/HTML/XML/SVG/GraphQL 支持带来较多 peer、parserPlain 和测试负担；不是当前核心 |
| 初始化/迁移 CLI | Antfu `src/cli/**` | 会把包变成写用户项目的工具，需要安全/迁移/跨平台测试；king3 当前文档安装足够简单 |
| e18e 默认全集 | Antfu `configs/e18e.ts` | 新硬依赖；部分变换受目标运行时和语义影响；只有一个参考采用 |
| Angular | Antfu `configs/angular.ts` | 三个 optional peer + template processor，超出定位 |
| Svelte/Solid | Antfu 对应文件 | 超出 README 定位；每个框架都要求持续跟进 parser/plugin major |
| TOML | Antfu `configs/toml.ts` | 需要两个直接依赖，king3 用户需求未证实 |
| Baseline plugin 默认开启 | Sxzz `configs/baseline.ts` | 没有 browsers/target 策略时告警缺乏语境 |
| De Morgan plugin | Sxzz `configs/de-morgan.ts` | 主要是表达形式偏好；新增依赖收益有限 |
| `eslint-plugin-importer` + `import/no-default-export` | Sxzz `configs/imports.ts` | king3 当前 import-lite 已满足需求；禁止默认导出与现有 `export default king3` 风格矛盾 |
| Sxzz 全套 Unicorn 偏好 | Sxzz `configs/unicorn.ts` | filename/no-for-loop/prefer-query-selector 等会产生大量主观约束 |
| 删除 CJS | 两参考均 ESM-only | 是 breaking change，且失去 king3 明确恢复的兼容能力 |
| 提交 18k 行 typegen | Sxzz `src/typegen.ts` | review 噪声与 merge 冲突高；可通过生成顺序和 CI 解决 fresh clone 问题 |
| 组织专属 workflow/preset | Sxzz `.github/**`、`tsdown-preset-sxzz` | 绑定外部组织基础设施，不可独立维护 |

## 16. 依赖与兼容性风险

### 16.1 候选能力依赖表

| 候选能力 | 所需依赖 | king3 当前是否已有 | 版本风险 | 是否影响用户安装 | 建议 |
| --- | --- | --- | --- | --- | --- |
| Node/JSDoc/Unicorn files scope | 无 | 是 | 无 | 否 | P1 |
| special cases | 无 | 是 | 规则 ID 需确认 | 否 | P1 |
| CI/factory tests | `vitest` 等 dev-only | 否 | 低 | 否 | P1 |
| pack/API smoke | dev-only 工具或 Node script | 部分 | 低 | 否 | P0/P1 |
| ESLint 10 | ESLint10 + 一组 plugin majors | 否 | **高** | 是，Node/peer/breaking | 大版本 |
| JSONC language | `eslint-plugin-jsonc@3`，可能移除直接 parser | v2/parser | 高 | 依赖树变化 | 与 ESLint10一起 |
| YAML language | `eslint-plugin-yml@3` | v1/parser | 高 | 依赖树变化 | 与 ESLint10一起 |
| Perfectionist v5 | `eslint-plugin-perfectionist@5` | v4 | 高，group names | 否（直接依赖）但 fix 行为变 | 大版本/充分 fixture |
| React v5 | `@eslint-react/eslint-plugin@5`、refresh；可能移除 hooks peer | v2 + hooks + refresh | **很高** | 是，peer 与 rule IDs | 大版本 |
| Markdown 正文 | `@eslint/markdown@8`、`eslint-merge-processors`、composer兼容版本 | markdown7，无 merge | 中高 | 增加直接依赖/报错 | P2 opt-in/明确 minor |
| Astro | `eslint-plugin-astro` + parser（取决于 plugin 版本） | 否 | 中高 | optional peer | 仅需求明确后 |
| JSX a11y | `eslint-plugin-jsx-a11y` | 否 | 中 | optional peer | P2 opt-in |
| Vue a11y | `eslint-plugin-vuejs-accessibility` | 否 | 中 | optional peer | P2 opt-in |
| test/no-only | `@vitest/eslint-plugin` + `eslint-plugin-no-only-tests` 或更小替代 | 否 | 中 | 增加直接依赖 | P2，评估更轻实现 |
| erasable TS | `eslint-plugin-erasable-syntax-only` | 否 | 中 | 可选依赖/内联策略 | P2 opt-in |
| Node builtin compatibility | 已有 `eslint-plugin-n`，需准确 engines | 是 | 中 | 否 | engines 后评估 |
| baseline | `eslint-plugin-baseline-js` | 否 | 中高 | 直接依赖 | P3 |
| e18e | `@e18e/eslint-plugin` | 否 | 中高 | 直接依赖/体积 | P3 |

### 16.2 公开 API 和 breaking-change 风险

| 变化 | 风险等级 | 原因 |
| --- | --- | --- |
| React v2→v5 | 高 | rule namespace、插件注册、peer、recommended 集合变化 |
| `typescript` alias 改为 `ts` | 高 | 用户 config、inline disable、composer rename 全部变化；不建议 |
| 删除 CJS/`require` export | 高 | CommonJS 消费者直接失败；不建议 |
| ESLint 10/Node engines 大幅抬高 | 高 | 安装环境变化 |
| 默认启用 Markdown 正文 lint | 中高 | 现有 `.md` 新增错误，JS-only override 作用域变化 |
| Perfectionist v5/排序 options | 中高 | 自动修复输出大面积变化 |
| 提升 React warn→error | 中高 | 现有项目 CI 失败 |
| 新增特殊文件 disables | 中低 | 通常减少错误，但 config names/最终 rule set 变化 |
| 新增 engines（匹配事实下限） | 中 | 旧 Node 安装被明确拒绝，但比运行时隐式失败更正确 |
| 增加 `prepack` | 低 | 只影响发布者，提升安全性 |

### 16.3 optional peer 的处理建议

- React/Next/UnoCSS 继续 optional peer + dynamic import。
- 缺依赖时：TTY 可询问安装；CI/non-TTY 应抛出带包名和安装命令的错误，不能静默跳过已显式启用的功能。
- 自动检测到框架但缺 lint peer 时，错误信息应明确“由自动检测启用，可传 `react:false` 关闭”。
- 不建议缺 peer 时静默跳过，因为用户会误以为规则已启用。
- 新增 Astro/a11y 应使用同样策略，不应转为硬 dependencies。

## 17. 建议目录结构草案

该草案适合 king3 当前规模，保留现有公共文件名，新增内容尽量内部化：

```text
src/
├─ index.ts                         # 保持公开根入口
├─ factory.ts                       # 保持 king3()/defineConfig；只做 orchestration
├─ types.ts                         # 保持现有公开类型名
├─ globs.ts                         # 保持公开 glob API
├─ configs/
│  ├─ index.ts
│  ├─ base/
│  │  ├─ javascript.ts
│  │  ├─ typescript.ts
│  │  ├─ comments.ts
│  │  ├─ command.ts
│  │  ├─ imports.ts
│  │  ├─ node.ts
│  │  ├─ jsdoc.ts
│  │  ├─ regexp.ts
│  │  └─ unicorn.ts
│  ├─ languages/
│  │  ├─ jsonc.ts
│  │  ├─ yaml.ts
│  │  └─ markdown.ts
│  ├─ frameworks/
│  │  ├─ vue.ts
│  │  ├─ react.ts
│  │  ├─ nextjs.ts
│  │  └─ unocss.ts
│  ├─ tools/
│  │  ├─ prettier.ts
│  │  ├─ perfectionist.ts
│  │  ├─ pnpm.ts
│  │  └─ sort.ts
│  └─ special-cases.ts              # 新增；d.ts/CJS/scripts/config/tests
├─ internal/
│  ├─ env.ts                        # 不扩大公开 API
│  ├─ optional-packages.ts          # ensure + actionable import error
│  ├─ options.ts                    # defaults/resolve/getOverrides/fullOptions
│  └─ plugin-renaming.ts            # default map 与兼容注释
└─ generated/
   └─ typegen.d.ts                  # 构建生成；也可继续放 src 根以减少 breaking

test/
├─ factory.test.ts
├─ fixtures.test.ts
├─ package.test.ts                  # pack + import/require/types
├─ api.test.ts
└─ fixtures/
   ├─ javascript/
   ├─ typescript/
   ├─ vue/
   ├─ react/
   ├─ markdown/
   ├─ jsonc/
   └─ yaml/
```

注意：

- 上述 `base/languages/frameworks/tools` 目录是大版本重构草案；小版本无需移动现有文件，因为路径虽未在 package exports 中逐项导出，源码模块函数已从根 barrel 公开，生成声明路径和 source maps 仍可能受影响。
- 如果不做大版本，只新增 `src/configs/special-cases.ts`、`test/` 和 `src/internal/optional-packages.ts` 就足够。
- 不建议复制 Antfu 的 CLI/vender 层，也不建议复制 Sxzz 的巨型生成文件提交策略。

## 18. P0 / P1 / P2 / P3 优先级清单

以下是去重后的 **43 项建议**：P0 4 项、P1 12 项、P2 14 项、P3 13 项。

### P0：需要优先处理（4）

| 编号 | 项目 | 定位证据 | 完成标准 |
| --- | --- | --- | --- |
| P0-1 | 发布前强制 build + pack/双入口烟测 | `01_king3-eslint-config/package.json`、`scripts/build.ts`；dist 未跟踪，入口全指 dist | `prepack/prepublishOnly`；pack 内容含 cjs/mjs/d.ts；import/require 成功 |
| P0-2 | 声明并文档化真实 Node engines | king3 lockfile：JSDoc `>=20.11.0`、Unicorn `>=20.10.0`；package 无 engines | package/中英文 README 一致；CI 最低 Node 验证 |
| P0-3 | 修复 JSONC/YAML/pnpm sort 组合 | factory 在 JSONC 分支无条件 `sortPnpmWorkspace()`；规则依赖 `yaml` plugin | `yaml:false` 不产生 `yaml/sort-keys` 无插件配置；组合测试通过 |
| P0-4 | 修复 React 安装文档/运行契约 | `react.ts` 导入三个 peer，README 只列两个 | 中英文命令含 refresh；非 TTY 缺包错误可操作 |

### P1：高价值改进（12）

| 编号 | 项目 | 主要收益 |
| --- | --- | --- |
| P1-1 | 建立自有 CI：build→lint→typecheck→test→pack | 防未生成类型、构建、发布回归 |
| P1-2 | 增加最小 factory/fixture/API/CJS-ESM 测试基线 | 后续规则和依赖升级可追踪 |
| P1-3 | 统一 typegen 入口与 fresh clone 顺序，内部 fullOptions 防漂移 | `pnpm typecheck`/build 可重复 |
| P1-4 | Node/JSDoc/Unicorn setup/rules 分离并限制 `GLOB_SRC` | 降低跨语言污染和 crash 风险 |
| P1-5 | 新增精简 `special-cases.ts` 覆盖 scripts/config/d.ts/CJS/tests | 两参考共同高价值设计 |
| P1-6 | 建 ESLint/Node/React peer 最低与最新版本矩阵，纠正未验证下限 | 避免 package 声明可装但规则不存在/不兼容 |
| P1-7 | 建立 ESLint 10 + plugin majors 大版本迁移分支 | 跟进生态必要变化且不破坏当前用户 |
| P1-8 | 为 React plugin v5 单独做 rule ID/API 迁移设计 | 避免手工列表漂移和无说明 breaking |
| P1-9 | 清理 `typescript/no-duplicate-imports`，统一 `consistent-type-imports` options | 去重复/旧规则和 fix 行为不一致 |
| P1-10 | 更新 ignores，至少加入 `.next`、常见 tmp/cache；评估 AI 目录 | 符合 Next 支持与现代工具环境 |
| P1-11 | 更新 package/tsconfig 排序字段与 jconfig glob，并加 fixture | 支持 TS 6/现代 package 字段 |
| P1-12 | 合并交互安装与 actionable dynamic import error | 自动检测/CI 的故障可诊断 |

### P2：可选增强（14）

| 编号 | 项目 | 条件/边界 |
| --- | --- | --- |
| P2-1 | Markdown 正文 lint | 成套引入 processor/language/rules/default ignores/fixture |
| P2-2 | pnpm `catalogs/json/yaml/sort` options 与实际 catalog 检测 | 不强制 Antfu workspace settings |
| P2-3 | `perfectionist` toggle/overrides | 默认行为保持不变；v5另在大版本 |
| P2-4 | 测试文件 `no-only`/title 规则 | 评估依赖重量与 Jest/Vitest 中立性 |
| P2-5 | JSX/Vue a11y opt-in | optional peers，不默认开启 |
| P2-6 | Astro opt-in | 先确认用户需求和版本范围 |
| P2-7 | `type:'lib'` 与 `erasableOnly` TS opt-in | 不默认限制现有 TS |
| P2-8 | 内部 `presetBasic/presetAll` | 优先服务 typegen/test，不急于公开 |
| P2-9 | editor 环境把危险 autofix 变 non-fixable | 保持终端规则严格；需 composer v3 评估 |
| P2-10 | runtime `files` guard + 避免 mutation `componentExts` | 小 API 健壮性改进 |
| P2-11 | `node/no-unsupported-features/es-builtins` | 先有准确 engines/目标版本 |
| P2-12 | `eslint-plugin-command` v4 | 与大版本依赖组一起验证 config export |
| P2-13 | 完善双语 options/依赖/兼容/版本策略文档 | 保持简洁，不复制 Antfu 1019 行 |
| P2-14 | Renovate/依赖自动更新 | 维护者愿意承担自动 PR 与 major 审核时 |

### P3：暂不建议（13）

| 编号 | 项目 | 原因 |
| --- | --- | --- |
| P3-1 | e18e 默认全集 | 单一参考、硬依赖、目标环境/语义风险 |
| P3-2 | ESLint Stylistic | 与 Prettier 定位冲突 |
| P3-3 | Antfu external formatters | 功能面和 peer 过大 |
| P3-4 | 初始化/迁移 CLI | 维护和安全边界超出配置库核心 |
| P3-5 | Angular | 复杂 processor/3 peers，定位不符 |
| P3-6 | Svelte/Solid | 框架维护成本，暂无定位 |
| P3-7 | TOML | 依赖成本相对收益低 |
| P3-8 | baseline-js 默认规则 | 缺目标浏览器策略 |
| P3-9 | De Morgan plugin | 主观变换、收益有限 |
| P3-10 | importer + no-default-export | 与现有 import/default export 设计冲突 |
| P3-11 | Sxzz 全套 Unicorn 严格偏好 | 大量主观/重命名规则 |
| P3-12 | 删除 CJS | breaking 且损失差异化价值 |
| P3-13 | 提交 18k 行生成 typegen | review 噪声，应以 CI/生成顺序解决 |

## 19. 需要维护者进一步决定的问题

1. king3 当前实际支持的最低 Node 是不是可以明确为 `>=20.11.0`？下一大版本是否愿意跟随 ESLint 10 抬高。
2. 发布是否存在仓库外的固定 build/publish 流程？若有，应把它文档化并仍增加 pack 门禁。
3. `comments.ts` 本地删除 `eslint-comments/disable-enable-pair` 是有意规则选择还是临时修改？
4. React 自动检测是否继续默认开启，还是像 Antfu 一样改为显式 `react:true`？保持自动检测更符合 king3 README，但需处理缺 peer。
5. React v5 迁移是否接受 rule ID breaking，是否需要 legacy 模式。
6. Perfectionist 的组间空行是 king3 明确风格吗？如果是，升级 v5 时要保留意图而不是复制参考配置。
7. Markdown 是否只 lint code snippets，还是希望新增正文质量检查？
8. Astro 是否属于未来明确支持范围？如果不是，不因两个参考都有就引入。
9. 是否希望默认支持 Vitest/Jest 测试规则，还是只做通用 test file disables？
10. `type:'lib'` 是否符合主要用户；若 king3 多用于应用，不应默认打开显式返回类型。
11. 规则变更在 king3 的版本策略中是否视为 breaking？建议至少将 warn→error、formatter 输出、plugin namespace 视为需要迁移说明。
12. 根入口公开所有 configs/globs/utils 是否继续承诺？若要收窄，只能在大版本逐步 deprecate。

## 20. 最终总结

### 20.1 king3 最明显落后的部分

不是缺少 Angular/Svelte 等框架，而是：

1. 无测试、CI、API/pack/双入口发布门禁。
2. package 没有反映实际 Node 下限，peer 最低版本没有矩阵证明。
3. ESLint 10 与 JSONC/YML/Unicorn/Perfectionist/React 新一代 API 尚未规划。
4. Node/JSDoc/Unicorn 作用域与特殊文件覆盖落后。
5. pnpm YAML sort 存在模块开关耦合问题。

### 20.2 哪些是 ESLint 生态升级带来的必要调整

- ESLint 10/Node engines 兼容评估。
- `@eslint/markdown` v8 language API。
- `eslint-plugin-jsonc@3` 的 `jsonc/x` language/flat config。
- `eslint-plugin-yml@3` config/language 形态。
- Perfectionist v5 group schema。
- React plugin v5 unified API/rule IDs。
- Unicorn/Node/JSDoc 等大版本的规则增删与 Node 下限。

这些应作为组合迁移，不应逐包盲升。

### 20.3 哪些只是 Antfu 或 Sxzz 的个人偏好

- Antfu：Stylistic、`antfu/no-top-level-await`、e18e 默认、pnpm 强制 settings、全框架矩阵。
- Sxzz：`import/no-default-export`、filename-case、no-for-loop、baseline 默认、De Morgan。
- 两者 ESM-only 也只是其发布选择，不代表 king3 应删除 CJS。

### 20.4 最值得优先引入的规则

优先 resolved-config 验证后考虑：

```text
no-useless-call
no-useless-computed-key
no-useless-rename
no-implied-eval（普通 JS）
no-proto
unicorn/no-duplicate-set-values
vue/no-irregular-whitespace
vue/no-sparse-arrays
```

同时优先清理 `typescript/no-duplicate-imports` 和 king3 自身两层 `typescript/consistent-type-imports` options 不一致。

### 20.5 最值得引入的新增模块

1. 精简 `special-cases.ts`。
2. `test/` 中的 factory/fixture/package/API 测试模块。
3. optional dependency actionable error helper。
4. 内部 fullOptions/preset，服务 typegen/test。
5. Markdown 正文模块只列 P2，必须成套实现。

### 20.6 值得借鉴的目录结构

- 继续“一项集成一个 config 文件”。
- 从 Sxzz 借三层内部 preset 思路，而不是照搬全部路径。
- 从 Antfu 借 test/fixtures 分层和 setup/rules 分离。
- 新 helper 放 `internal/`，不要继续扩大根导出。

### 20.7 看似先进但没有必要的内容

CLI、Netlify inspector、组织 workflow/preset、Antfu formatter 大模块、Stylistic、Angular/Svelte/Solid/TOML、Sxzz baseline/De Morgan、提交巨型 typegen，当前都不是 king3 的高价值目标。

### 20.8 应继续保留的 king3 设计

CJS+ESM、Prettier 默认、React/Next、type-aware opt-in、optional peer 动态加载、语义化 plugin aliases、双语文档、简单工厂 API。

### 20.9 可能构成 breaking change 的建议

React v5、ESLint10/Node engines 大幅抬升、plugin alias/rule ID 改名、删除 CJS、默认 Markdown 正文 lint、Perfectionist v5 排序输出、warn→error，都应按 breaking 或至少带完整迁移说明处理。

### 20.10 如果只安排一次小版本更新

建议只做：

1. P0 四项。
2. 最小 CI + factory/package smoke tests。
3. Node/JSDoc/Unicorn files scope。
4. special cases。
5. `.next`/temp ignores 和排序字段更新。
6. TS duplicate import/option 清理（验证后）。
7. 文档 options/兼容矩阵。

不要在该小版本同时升级 ESLint 10、React v5 或默认启用 Markdown 正文。

### 20.11 如果安排一次大版本重构

可以做：

1. ESLint 10 + plugin majors 联动。
2. React v5 rule ID/API 迁移。
3. JSONC/YAML language API。
4. Perfectionist v5 保持 king3 风格意图的重写。
5. `base/languages/frameworks/tools/internal` 目录整理。
6. 可选 Markdown 正文、Astro/a11y、`type:'lib'/erasableOnly`。
7. 完整 peer/Node/ESLint 矩阵与迁移文档。

### 20.12 推荐实施顺序

```text
发布与安装契约 P0
→ 建 CI/测试/pack 基线
→ 修作用域、special cases、ignores、TS/pnpm 小问题
→ 冻结当前 resolved-config/API 快照
→ 建 ESLint 10 + React v5 大版本分支
→ 逐插件迁移并比较快照/fixtures
→ 再决定 Markdown/Astro/a11y 等可选能力
→ 发布迁移指南与 major
```

最终判断：king3 不需要“追平 Antfu 的文件数量”。最有效的路线是先把当前小而有差异化的配置变得**可测试、可发布、版本契约准确、作用域清楚**，再以大版本成组吸收 ESLint 10 和插件 API 迁移。

## 附录 A：文件清单与扫描分组

### A.1 king3（44 个文件）

```text
.editorconfig
.gitattributes
.gitignore
LICENSE
README.md
README_zh.md
eslint.config.ts
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
prettier.config.js
scripts/build.ts
scripts/typegen.ts
src/configs/command.ts
src/configs/comments.ts
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

### A.2 Antfu（193 个文件）

核心源码 50 个：

```text
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
src/vender/prettier-types.ts
```

工程、文档和测试源码：

```text
.gitattributes
.github/workflows/ci.yml
.github/workflows/release.yml
.gitignore
.vscode/settings.json
LICENSE
README.md
bin/index.mjs
eslint.config.ts
netlify.toml
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
scripts/typegen.ts
scripts/versiongen.ts
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

Fixture 输入与配置共 21 个：`fixtures/eslint.config.ts`、`fixtures/input/**` 18 个、`fixtures/jsx-a11y-errors/**` 1 个、`fixtures/jsx-a11y-valid/**` 1 个。

Fixture 输出共 85 个，按以下 10 组完整扫描：

| 组 | 文件数 | 职责 |
| --- | ---: | --- |
| `fixtures/output/all` | 11 | 全功能修复输出 |
| `fixtures/output/issue-837` | 4 | Markdown SourceCode crash 回归 |
| `fixtures/output/js` | 4 | JS-only |
| `fixtures/output/no-markdown-with-formatters` | 7 | Markdown lint 关闭、formatter 开启 |
| `fixtures/output/no-style` | 6 | Stylistic 关闭 |
| `fixtures/output/tab-double-quotes` | 11 | 自定义风格 |
| `fixtures/output/ts-override` | 9 | TS rule override |
| `fixtures/output/ts-strict` | 9 | type-aware |
| `fixtures/output/ts-strict-with-react` | 9 | type-aware + React |
| `fixtures/output/with-formatters` | 15 | 多语言 formatter |

生成快照 13 个：API JS/d.ts 4 个、factory 9 个。它们作为生成证据阅读，没有逐段重复粘贴进报告。

上述 fixture 与快照的精确路径如下（路径均相对 `02_antfu-eslint-config`）：

```text
fixtures/eslint.config.ts
fixtures/input/angular-inline.component.ts
fixtures/input/angular.component.html
fixtures/input/angular.component.ts
fixtures/input/astro.astro
fixtures/input/css.css
fixtures/input/html.html
fixtures/input/javascript.js
fixtures/input/jsx.jsx
fixtures/input/markdown.md
fixtures/input/svelte.svelte
fixtures/input/svg.svg
fixtures/input/toml.toml
fixtures/input/tsconfig.json
fixtures/input/tsx.tsx
fixtures/input/typescript.ts
fixtures/input/vue-ts.vue
fixtures/input/vue.vue
fixtures/input/xml.xml
fixtures/jsx-a11y-errors/invalid-anchor-href.jsx
fixtures/jsx-a11y-valid/accessible-elements.jsx
fixtures/output/all/angular-inline.component.ts
fixtures/output/all/astro.astro
fixtures/output/all/javascript.js
fixtures/output/all/jsx.jsx
fixtures/output/all/markdown.md
fixtures/output/all/svelte.svelte
fixtures/output/all/toml.toml
fixtures/output/all/tsx.tsx
fixtures/output/all/typescript.ts
fixtures/output/all/vue-ts.vue
fixtures/output/all/vue.vue
fixtures/output/issue-837/javascript.js
fixtures/output/issue-837/jsx.jsx
fixtures/output/issue-837/markdown.md
fixtures/output/issue-837/toml.toml
fixtures/output/js/javascript.js
fixtures/output/js/jsx.jsx
fixtures/output/js/markdown.md
fixtures/output/js/toml.toml
fixtures/output/no-markdown-with-formatters/angular-inline.component.ts
fixtures/output/no-markdown-with-formatters/javascript.js
fixtures/output/no-markdown-with-formatters/jsx.jsx
fixtures/output/no-markdown-with-formatters/markdown.md
fixtures/output/no-markdown-with-formatters/toml.toml
fixtures/output/no-markdown-with-formatters/tsx.tsx
fixtures/output/no-markdown-with-formatters/typescript.ts
fixtures/output/no-style/javascript.js
fixtures/output/no-style/jsx.jsx
fixtures/output/no-style/toml.toml
fixtures/output/no-style/typescript.ts
fixtures/output/no-style/vue-ts.vue
fixtures/output/no-style/vue.vue
fixtures/output/tab-double-quotes/angular-inline.component.ts
fixtures/output/tab-double-quotes/angular.component.ts
fixtures/output/tab-double-quotes/javascript.js
fixtures/output/tab-double-quotes/jsx.jsx
fixtures/output/tab-double-quotes/markdown.md
fixtures/output/tab-double-quotes/toml.toml
fixtures/output/tab-double-quotes/tsconfig.json
fixtures/output/tab-double-quotes/tsx.tsx
fixtures/output/tab-double-quotes/typescript.ts
fixtures/output/tab-double-quotes/vue-ts.vue
fixtures/output/tab-double-quotes/vue.vue
fixtures/output/ts-override/angular-inline.component.ts
fixtures/output/ts-override/javascript.js
fixtures/output/ts-override/jsx.jsx
fixtures/output/ts-override/markdown.md
fixtures/output/ts-override/toml.toml
fixtures/output/ts-override/tsx.tsx
fixtures/output/ts-override/typescript.ts
fixtures/output/ts-override/vue-ts.vue
fixtures/output/ts-override/vue.vue
fixtures/output/ts-strict-with-react/angular-inline.component.ts
fixtures/output/ts-strict-with-react/javascript.js
fixtures/output/ts-strict-with-react/jsx.jsx
fixtures/output/ts-strict-with-react/markdown.md
fixtures/output/ts-strict-with-react/toml.toml
fixtures/output/ts-strict-with-react/tsx.tsx
fixtures/output/ts-strict-with-react/typescript.ts
fixtures/output/ts-strict-with-react/vue-ts.vue
fixtures/output/ts-strict-with-react/vue.vue
fixtures/output/ts-strict/angular-inline.component.ts
fixtures/output/ts-strict/javascript.js
fixtures/output/ts-strict/jsx.jsx
fixtures/output/ts-strict/markdown.md
fixtures/output/ts-strict/toml.toml
fixtures/output/ts-strict/tsx.tsx
fixtures/output/ts-strict/typescript.ts
fixtures/output/ts-strict/vue-ts.vue
fixtures/output/ts-strict/vue.vue
fixtures/output/with-formatters/angular-inline.component.ts
fixtures/output/with-formatters/angular.component.html
fixtures/output/with-formatters/astro.astro
fixtures/output/with-formatters/css.css
fixtures/output/with-formatters/html.html
fixtures/output/with-formatters/javascript.js
fixtures/output/with-formatters/jsx.jsx
fixtures/output/with-formatters/markdown.md
fixtures/output/with-formatters/svg.svg
fixtures/output/with-formatters/toml.toml
fixtures/output/with-formatters/tsx.tsx
fixtures/output/with-formatters/typescript.ts
fixtures/output/with-formatters/vue-ts.vue
fixtures/output/with-formatters/vue.vue
fixtures/output/with-formatters/xml.xml
test/__snapshots__/api/@antfu/eslint-config/cli.snapshot.d.ts
test/__snapshots__/api/@antfu/eslint-config/cli.snapshot.js
test/__snapshots__/api/@antfu/eslint-config/index.snapshot.d.ts
test/__snapshots__/api/@antfu/eslint-config/index.snapshot.js
test/__snapshots__/factory/default.snap.js
test/__snapshots__/factory/full-off.snap.js
test/__snapshots__/factory/full-on.snap.js
test/__snapshots__/factory/in-editor.snap.js
test/__snapshots__/factory/javascript-vue.snap.js
test/__snapshots__/factory/less-opinionated.snap.js
test/__snapshots__/factory/lib.snap.js
test/__snapshots__/factory/pnpm-without-jsonc.snap.js
test/__snapshots__/factory/pnpm-without-yaml.snap.js
```

### A.3 Sxzz（52 个文件）

```text
.editorconfig
.gitattributes
.github/FUNDING.yml
.github/renovate.json5
.github/workflows/release-commit.yml
.github/workflows/release.yml
.github/workflows/unit-test.yml
.gitignore
.prettierignore
.vscode/settings.json
CLAUDE.md
LICENSE
README.md
eslint-inspector.config.ts
eslint.config.ts
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
scripts/typegen.ts
src/configs/astro.ts
src/configs/baseline.ts
src/configs/command.ts
src/configs/comments.ts
src/configs/de-morgan.ts
src/configs/ignores.ts
src/configs/imports.ts
src/configs/index.ts
src/configs/javascript.ts
src/configs/jsdoc.ts
src/configs/jsonc.ts
src/configs/markdown.ts
src/configs/node.ts
src/configs/pnpm.ts
src/configs/prettier.ts
src/configs/regexp.ts
src/configs/sort.ts
src/configs/special-cases.ts
src/configs/typescript.ts
src/configs/unicorn.ts
src/configs/unocss.ts
src/configs/vue.ts
src/configs/yml.ts
src/env.ts
src/globs.ts
src/index.ts
src/plugins.ts
src/presets.ts
src/typegen.ts
src/types.ts
src/utils.ts
tsconfig.json
tsdown.config.ts
```

## 附录 B：追溯索引

| 结论主题 | 首要定位 |
| --- | --- |
| 发布无自动 build | `01_king3-eslint-config/package.json#scripts`、`files/exports` |
| 实际 Node 下限 | `01_king3-eslint-config/pnpm-lock.yaml` 中 `eslint-plugin-jsdoc@61.7.1`、`eslint-plugin-unicorn@62.0.0` |
| pnpm/yaml 耦合 | `01_king3-eslint-config/src/factory.ts` JSONC 分支；`src/configs/sort.ts#sortPnpmWorkspace` |
| React 文档缺 peer | `src/configs/react.ts#ensurePackages/Promise.all`；`README*.md` React 安装命令 |
| type-aware 规则 | `01_king3-eslint-config/src/configs/typescript.ts#typeAwareRules` |
| React v5 迁移 | `02_antfu-eslint-config/src/configs/react.ts`；本地 Git commits `83c1d11`、`06a1a8a` |
| Markdown language/保护 | `02_antfu-eslint-config/src/configs/markdown.ts`、`src/factory.ts#setDefaultIgnores`、`test/fixtures.test.ts#issue-837` |
| JSONC language | `02_antfu-eslint-config/src/configs/jsonc.ts`；`03_sxzz-eslint-config/src/configs/jsonc.ts` |
| 规则作用域 | Antfu `configs/node.ts/jsdoc.ts/unicorn.ts`；Sxzz `configs/unicorn.ts` |
| 特殊文件共同设计 | Antfu `configs/disables.ts/test.ts`；Sxzz `configs/special-cases.ts` |
| 工厂/fixture/API 测试 | `02_antfu-eslint-config/test/*.ts` |
| king3 本地未提交差异 | `git diff` 对 `comments.ts/factory.ts/types.ts`；详见 1.2 |
