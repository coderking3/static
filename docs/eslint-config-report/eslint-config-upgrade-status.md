# King3 Config 升级状态清单

> 更新日期：2026-08-05  
> 对比目标：`01_king3-eslint-config/src/configs`  
> 主要基准：`02_antfu-eslint-config/src/configs`  
> 说明：本清单按当前工作树判断。只修改 factory 调用方式时，会单独标注，不等同于规则文件已整体迁移。

## 总览

King3 当前共有 23 个 config 模块（不计 `configs/index.ts`）：

| 状态 | 数量 | Configs |
| --- | ---: | --- |
| 已完成当前升级目标 | 11 | `comments`、`disables`、`e18e`、`ignores`、`imports`、`javascript`、`perfectionist`、`react`、`sort`、`unicorn`、`vue` |
| 尚未更新，值得继续评估 | 1 | `markdown` |
| 已等价或当前不需要迁移 | 11 | `command`、`jsdoc`、`jsonc`、`nextjs`、`node`、`pnpm`、`prettier`、`regexp`、`typescript`、`unocss`、`yaml` |

## 尚未更新：按预计改动量从小到大

这里的顺序按实现改动量排序，不代表规则价值或风险等级。每次仍建议只处理一个 config。

| 顺序 | Config | 规模 | 当前主要差异 | 建议范围 |
| ---: | --- | --- | --- | --- |
| 1 | `markdown` | L | Antfu 使用 Markdown language、GFM/CommonMark、recommended rules，并通过 `eslint-merge-processors` 合并 pass-through processor | 可复用 Vue 已引入的 processor 依赖；仍需新增 glob、types 和 factory options，属于架构迁移 |

### 1. `markdown`

- King3：`01_king3-eslint-config/src/configs/markdown.ts`
- Antfu：`02_antfu-eslint-config/src/configs/markdown.ts`
- Antfu 不再只 lint fenced code，而是同时 lint Markdown AST，并提供 `gfm`、`files`、`overridesMarkdown`。
- `eslint-merge-processors` 已由 Vue SFC 支持引入；仍需增加 `GLOB_MARKDOWN_IN_MARKDOWN` 和对应 types/factory options。
- 这是配置架构升级，不属于简单增加几条规则。

## 已完成当前升级目标

| Config | 已完成内容 | 有意保留的差异 |
| --- | --- | --- |
| `comments` | 移除 `eslint-comments/disable-enable-pair`，规则集合与 Antfu 对齐 | 保留 `king3/*` config name |
| `disables` | scripts/CLI 增加 `antfu/no-top-level-await` 例外；bin 增加两个 import 例外 | 继续使用 King3 的 `typescript/*` plugin alias；不引入 editor 逻辑 |
| `e18e` | 接受 `OptionsProjectType`，默认 `app`；app 下关闭 `e18e/prefer-static-regex` | 不引入 `isInEditor`；factory 不传 `appType`；`moduleReplacements` 继续默认 `false` |
| `ignores` | TypeScript 关闭时忽略 TS/TSX，并由 factory 传入状态 | 保留 King3 原有 ignore 列表与用户回调行为 |
| `imports` | factory 已正确转发 `imports` 子选项和 overrides | 不增加 Antfu 的 stylistic `import/newline-after-import` |
| `javascript` | 保留 Sxzz 的 recommended + 精选规则结构；增加四条 `no-useless-*` 和 `one-var` | 不复制 Antfu 的完整显式规则表；保留 King3/Sxzz severity 和 ESM 使用取向 |
| `perfectionist` | 增加顶层开关，默认 `true`；支持 config overrides | 保留 King3 的 `warn`、分组、新行和 `partitionByComment` 策略 |
| `react` | 升级到 `@eslint-react/eslint-plugin` 5.x 统一插件；迁移为 `react/*` 规则命名；保留 Vite、Next 和 type-aware 行为 | 不增加 Remix、React Router 或 Astro 支持；移除 v5 已删除的 `prefer-namespace-import` |
| `sort` | 在 `scripts` 后增加 `scripts-info`，并修正 `sortTsconfig` 的注释 | 保留现有 config name，避免无意义的公开名称变化 |
| `unicorn` | 按 Antfu 拆分 setup/rules，并把规则限制到 `GLOB_SRC` | 保留 `king3/*` config name 和现有 options API |
| `vue` | 对齐 Antfu 的 Vue 3 presets、通用规则和 SFC blocks processor；新增 `sfcBlocks` 选项 | 不引入 stylistic 条件规则、a11y 插件或 Vue 2 支持 |

## 已等价或当前不需要迁移

| Config | 结论 |
| --- | --- |
| `command` | 实现和行为基本等价，无需更新 |
| `jsdoc` | 15 条功能规则一致；Antfu 只额外增加两条 stylistic 规则，Prettier 定位下不迁移 |
| `jsonc` | 功能规则基本一致；Antfu 的新增差异主要来自 stylistic 分支，当前不迁移 |
| `nextjs` | 都展开 recommended 和 core-web-vitals，行为等价 |
| `node` | 8 条规则一致，无需更新 |
| `pnpm` | 已人工确认无需更改；King3 不引入 `isInEditor`，也不跟进依赖该状态的 autofix 控制 |
| `prettier` | King3 独有且符合当前定位；Antfu 的 `stylistic`/`formatters` 不是替代升级目标 |
| `regexp` | 都基于 recommended rules、关闭 dangerous autofix，并支持 overrides，行为等价 |
| `typescript` | 规则集合基本等价；`typescript/*` 与 Antfu 的 `ts/*` 是 plugin alias 选择，不是规则缺失 |
| `unocss` | 规则和 `attributify`/`strict` 行为一致，无需更新 |
| `yaml` | 已人工确认无需更改；保留 King3 当前规则，并继续由 Prettier 负责 stylistic |

## Antfu 独有 Config 的处理结论

| Antfu config | 当前结论 |
| --- | --- |
| `test` | 明确不引入；King3 不使用 Vitest/Jest 等测试框架配置 |
| `stylistic`、`formatters` | 继续使用现有 Prettier 路线时不引入 |
| `angular`、`astro`、`solid`、`svelte` | 没有明确使用需求，不纳入升级列表 |
| `toml` | 当前没有 TOML lint 需求，不引入 parser/plugin |
| `jsx` | 可在 React 迁移时重新评估，不单独提前引入 |

## 推荐执行顺序

```text
markdown
```

每完成一项，都应至少运行：

```text
pnpm run typecheck
pnpm exec eslint <本次修改文件>
git diff --check
```

Markdown 还需要补一次无需测试框架的 ESM 配置生成 smoke check。
