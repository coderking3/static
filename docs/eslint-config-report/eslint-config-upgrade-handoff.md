# King3 ESLint Config 升级交接说明

> 记录时间：2026-08-05（Asia/Shanghai）  
> 用途：与 `eslint-config-antfu-upgrade-report.md`、`eslint-config-upgrade-status.md` 一起提供给新的 Codex 对话，继续完成 Markdown 配置升级。  
> 本文记录的是前两份文档之后的最新结论；发生冲突时，以本文和代码当前状态为准。

## 1. 项目与参考关系

```text
eslint-config-all/
├── 01_king3-eslint-config/   # 实际升级目标
├── 02_antfu-eslint-config/   # 主要参考基准
├── 03_sxzz-eslint-config/    # 辅助参考；King3 旧 Markdown 来源
├── eslint-config-antfu-upgrade-report.md
├── eslint-config-upgrade-status.md
└── eslint-config-upgrade-handoff.md
```

- King3 当前提交：`7bd32fd99e72dd41cde2efd94ecd796fee1ed135`（提交信息 `temp`）。
- 记录本文时，`01_king3-eslint-config` 工作树干净。
- `02_antfu-eslint-config` 有既存未提交修改：
  - `src/configs/command.ts`
  - `src/configs/javascript.ts`
  - `src/configs/pnpm.ts`
  - `src/configs/vue.ts`
  - `src/configs/yaml.ts`
  - `src/factory.ts`
  - `src/types.ts`
- `03_sxzz-eslint-config` 有既存未提交修改：`src/configs/javascript.ts`。
- 参考项目的修改属于维护者现有工作，不要覆盖或回退。

## 2. 已确认的产品约束

1. King3 是个人使用、单人维护的 ESLint 配置库。
2. 只发布 ESM，不再提供 CommonJS 入口。
3. 不引入 Vitest、Jest 等测试框架，也不复制 Antfu 的 fixture/snapshot 测试体系。
4. Antfu 是主要规则和架构基准，但不是无条件完整复制；Sxzz 仅作为小型配置库和旧行为参考。
5. 不引入 `isInEditor` 及其 editor 专用行为。
6. 不引入 Antfu 的 stylistic 配置体系；King3 继续使用 Prettier 路线。
7. 不增加当前没有使用需求的 Angular、Astro、Solid、Svelte、TOML 等配置。
8. React 不支持 Remix 和 React Router 专用配置。
9. Vue 不支持 Vue 2、Vue a11y 和 Antfu stylistic 分支。
10. YAML 和 pnpm 配置已经由维护者人工确认，无须继续对齐。

## 3. 当前升级状态

`eslint-config-upgrade-status.md` 是当前模块状态主清单。已完成本轮目标的模块包括：

```text
comments
disables
e18e
ignores
imports
javascript
perfectionist
react
sort
unicorn
vue
```

已确认等价或暂不迁移的模块包括：

```text
command
jsdoc
jsonc
nextjs
node
pnpm
prettier
regexp
typescript
unocss
yaml
```

目前唯一待继续评估和实施的已有模块是：

```text
markdown
```

重要实现偏好：

- JavaScript 规则的基础仍以 Sxzz 为主，只增量引入已选中的 Antfu 规则。
- Perfectionist 可配置，默认开启；保留 King3 自己的分组、换行和 warning 策略。
- TypeScript 关闭时忽略 TS/TSX 文件。
- e18e 不接入 `isInEditor`；不要从 factory 给 `enableE18e` 错传 `appType`。
- React、Vue 的当前升级已经完成，不要在 Markdown 任务中顺带扩大范围。

## 4. `resolutions` 的最新结论

### 4.1 当前状态

King3 当前 `package.json` 已经删除整个 `resolutions` 字段。此前包含：

```json
{
  "@eslint-community/eslint-utils": "catalog:peer",
  "@typescript-eslint/types": "catalog:peer",
  "@typescript-eslint/utils": "catalog:peer",
  "eslint": "catalog:peer",
  "synckit": "catalog:peer",
  "tsx": "catalog:dev"
}
```

删除理由：

- pnpm 11 的正式做法是 `pnpm-workspace.yaml#overrides`；不应继续依赖 Yarn 风格的根 `package.json#resolutions`。
- 当前依赖树中这六个包均只有一个实际版本，且声明范围相容，没有真实冲突。
- `eslint` 和 `tsx` 已经是直接开发依赖。
- `@eslint-community/eslint-utils`、`@typescript-eslint/types`、`@typescript-eslint/utils`、`synckit` 都能通过现有上游范围自然收敛。
- Antfu 多出的 `chokidar`、`semver` 与 King3 当前定位无关，不添加。

### 4.2 尚需注意

`01_king3-eslint-config/pnpm-lock.yaml` 顶层目前仍保留旧记录：

```yaml
overrides:
  '@eslint-community/eslint-utils': ^4.9.1
  '@typescript-eslint/types': ^8.65.0
  '@typescript-eslint/utils': ^8.65.0
  eslint: ^10.7.0
  synckit: ^0.11.13
  tsx: ^4.23.1
```

这很可能是 pnpm 10 生成并保留下来的锁文件状态。后续应使用项目声明的 `pnpm@11.15.1` 正常重新安装或仅更新锁文件，确认这些记录是否自然移除；不要手工编辑锁文件。

删除 `resolutions` 后，`pnpm-workspace.yaml` 的 `peer` catalog 中以下条目可能已经没有引用：

```text
@eslint-community/eslint-utils
@typescript-eslint/types
@typescript-eslint/utils
synckit
```

是否清理这些 catalog 条目可以在重新生成锁文件时一起确认，但不要混入 Markdown 源码迁移，除非维护者明确要求。

## 5. Markdown 当前实现

King3 文件：`01_king3-eslint-config/src/configs/markdown.ts`

当前实现源自 Sxzz 的处理方式，核心是展开：

```ts
pluginMarkdown.configs.processor
```

这会：

- 注册 `@eslint/markdown` 插件；
- 给 `**/*.md` 设置 Markdown processor；
- 从 fenced code block 创建 JS/TS 等虚拟文件并 lint 代码片段。

它不会把 Markdown 正文本身作为 Markdown AST lint。King3 当前类型注释也明确写着：

```text
Enable linting for code snippets in Markdown.
This option does not lint Markdown content itself.
```

当前 King3 在 processor 之后还有两组关闭规则：

- `king3/markdown/disables/markdown`：针对物理 `.md` 文件关闭 command、perfectionist、regexp 等规则。
- `king3/markdown/disables/code`：针对 Markdown 中的代码虚拟文件关闭部分 JS、Node、TypeScript 和 unused-imports 规则。

## 6. Antfu Markdown 架构

Antfu 文件：`02_antfu-eslint-config/src/configs/markdown.ts`

Antfu 当前返回五组配置：

1. `antfu/markdown/setup`
   - 显式注册 `markdown` 插件。
2. `antfu/markdown/processor`
   - 对 Markdown 文件组合两个 processor：
     - `markdown.processors.markdown`：抽取 fenced code block；
     - `processorPassThrough`：把 Markdown 正文也作为虚拟文件继续 lint。
   - 使用 `GLOB_MARKDOWN_IN_MARKDOWN` 防止 pass-through 产生的 `.md` 虚拟文件再次进入 processor，避免递归。
3. `antfu/markdown/parser`
   - 默认使用 `markdown/gfm` language；`gfm: false` 时使用 `markdown/commonmark`。
4. `antfu/markdown/rules`
   - 启用 `@eslint/markdown` recommended 规则。
   - 主动关闭：
     - `markdown/fenced-code-language`
     - `markdown/no-missing-label-refs`（上游已知问题的规避）
   - `overridesMarkdown` 只覆盖 Markdown 正文规则。
5. `antfu/markdown/disables/code`
   - 继续放宽 fenced code block 中不适合文档示例的 JS/TS 规则。

Antfu recommended 中实际启用的 Markdown 规则，在关闭上述两条后主要包括：

```text
markdown/heading-increment
markdown/no-duplicate-definitions
markdown/no-empty-definitions
markdown/no-empty-images
markdown/no-empty-links
markdown/no-invalid-label-refs
markdown/no-missing-atx-heading-space
markdown/no-missing-link-fragments
markdown/no-multiple-h1
markdown/no-reference-like-urls
markdown/no-reversed-media-syntax
markdown/no-space-in-emphasis
markdown/no-unused-definitions
markdown/require-alt-text
markdown/table-column-count
```

这次升级的本质不是“补几条规则”，而是从“只 lint 代码块”升级到“同时 lint Markdown 正文和代码块”。

## 7. King3 已具备的依赖条件

不需要为了 Markdown 再新增依赖：

- `@eslint/markdown@8.0.3` 已在 dependencies/catalog/lockfile 中。
- `eslint-merge-processors@2.0.0` 已经因为 Vue SFC blocks 支持加入 dependencies。
- `eslint-flat-config-utils@3.2.0` 已支持 `FlatConfigComposer#setDefaultIgnores`。
- 当前只发布 ESM，与这些依赖的使用方式一致。

旧审计报告中“King3 尚未引入 `eslint-merge-processors`”已经过时，不要据此重复加依赖。

## 8. 建议的 Markdown 同步方案

### 8.1 应同步的核心架构

建议同步 Antfu 的以下部分：

1. 在 `src/globs.ts` 增加：

   ```ts
   export const GLOB_MARKDOWN_IN_MARKDOWN = '**/*.md/*.md'
   ```

2. 在 `src/types.ts` 增加：

   ```ts
   export interface OptionsMarkdown extends OptionsOverrides, OptionsFiles {
     /** @default true */
     gfm?: boolean

     /** Markdown 正文规则覆盖 */
     overridesMarkdown?: TypedFlatConfigItem['rules']
   }
   ```

3. 把 `OptionsConfig.markdown` 从：

   ```ts
   markdown?: boolean | OptionsOverrides
   ```

   改成：

   ```ts
   markdown?: boolean | OptionsMarkdown
   ```

   同时更新注释，说明现在会 lint 代码片段和 Markdown 正文。

   Antfu 原始类型没有让 `OptionsMarkdown` 继承 `OptionsFiles`，同时它的 factory 也没有转发 `files`。如果 King3 希望顶层 `king3({ markdown: { files: [...] } })` 可用，就应在这里一起补全，而不是只给直接调用 `markdown()` 的场景提供 `files`。

4. `markdown()` 参数可以保持明确的交叉类型：

   ```ts
   OptionsFiles & OptionsComponentExts & OptionsMarkdown
   ```

5. 使用 `mergeProcessors` 和 `processorPassThrough`，显式拆成 setup、processor、parser、rules、code disables 五组配置。

6. 默认启用 GFM，并提供 CommonMark 切换。

7. 启用 Markdown recommended rules，按 Antfu 关闭：

   ```ts
   'markdown/fenced-code-language': 'off'
   'markdown/no-missing-label-refs': 'off'
   ```

8. 在 factory 组合结束后增加：

   ```ts
   if (options.markdown ?? true) {
     composer = composer.setDefaultIgnores((prev) => [
       ...prev,
       GLOB_MARKDOWN
     ])
   }
   ```

   这是必要的兼容保护。Markdown language 的 `SourceCode` 没有 `getAllComments` 等 JS 专用方法；没有这层 default ignores，未声明 `files` 的全局 JS 规则或用户 overrides 可能应用到 `.md` 并崩溃。

### 8.2 Factory 必须正确转发子选项

Antfu 当前 factory 调用只传了 `componentExts` 和 `overrides`，没有把 `markdown.gfm`、`markdown.files`、`markdown.overridesMarkdown` 转发进去。不要机械复制这个遗漏。

King3 建议调用形式：

```ts
markdown({
  componentExts,
  ...resolveSubOptions(options, 'markdown'),
  overrides: getOverrides(options, 'markdown')
})
```

其中最终的 `overrides` 放在后面，以继续兼容顶层 deprecated overrides 与子配置 overrides 的合并逻辑。

至少要验证以下 API 都真正生效：

```ts
king3({
  markdown: {
    gfm: false,
    files: ['docs/**/*.md'],
    overrides: {
      'no-console': 'error'
    },
    overridesMarkdown: {
      'markdown/heading-increment': 'off'
    }
  }
})
```

### 8.3 规则 alias 与 King3 产品差异

不能直接复制 Antfu 的全部 rule key：

- Antfu 使用 `ts/*`；King3 使用 `typescript/*`。
- Antfu 使用 `style/*`；King3 不引入 stylistic 配置，因此 Markdown 中三条 `style/*` disable 可以省略。
- King3 已有 `antfu/*`、`node/*`、`e18e/*`、`unused-imports/*`，这些名称可以沿用。

建议从 Antfu 补入当前 King3 缺少的两条代码块放宽：

```ts
'antfu/no-top-level-await': 'off'
'typescript/explicit-function-return-type': 'off'
```

King3 当前比 Antfu 多出的三条需要有意识处理：

| 规则 | 当前判断 |
| --- | --- |
| `no-restricted-imports` | King3 当前其他 config 没有启用，属于冗余 disable，可删除 |
| `typescript/no-extraneous-class` | TypeScript 主配置本身已经是 `off`，Markdown 再关闭属于冗余，可删除 |
| `node/prefer-global/buffer` | Node 主配置实际启用；文档代码示例中放宽 Buffer 很合理，可作为 King3 有意差异保留 |

### 8.4 旧 `disables/markdown` 的处理

建议在新架构落地时删除整个 `king3/markdown/disables/markdown` 配置块，而不是继续维护一份针对 Markdown 物理文件的 JS 规则关闭清单。

理由：

- 新的 `.md` 正文由 `markdown/gfm` 或 `markdown/commonmark` language 处理。
- factory 的 `setDefaultIgnores` 会阻止未限定范围的 JS 规则泄漏到 Markdown language。
- 当前这组 command/perfectionist/regexp 的逐项关闭只是旧 code-only processor 架构下的局部补丁，覆盖不完整，也不能代替 language 隔离。

如果删除后发现某条规则实际作用于 fenced code virtual file，应把它明确放到 `king3/markdown/disables/code`，而不是重新加回物理 `.md` disable 块。

## 9. 无测试框架的验证方案

不新增 Vitest。完成 Markdown 迁移后至少执行：

```text
pnpm run typecheck
pnpm exec eslint src/configs/markdown.ts src/factory.ts src/globs.ts src/types.ts
pnpm run build
git diff --check
```

另外使用一次 Node ESM smoke check，通过 ESLint API 的 `lintText` 和 `filePath: 'markdown-smoke.md'` 验证，不需要把 fixture 提交进仓库。

建议覆盖四个场景：

1. Markdown 正文规则生效：`# H1` 后直接使用 `### H3` 应触发 `markdown/heading-increment`。
2. fenced JS/TS code block 仍能被处理，且示例中的 `console.log` 不触发 `no-console`。
3. `markdown.overridesMarkdown` 能关闭 `markdown/heading-increment`。
4. 用户传入一个没有 `files` 的 JS-only rule override 时，lint `.md` 不应因 Markdown `SourceCode` 缺少 JS 方法而崩溃。

如果实现 `gfm: false` 和自定义 `files`，还要分别确认它们通过顶层 `king3()` factory 生效，而不只是直接调用导出的 `markdown()` 时生效。

## 10. 下次继续时的推荐顺序

```text
1. 重新读取三份交接/状态/审计文档和当前 git status
2. 重新核对三个 Markdown 源文件，避免参考工作树发生变化
3. 修改 globs.ts
4. 修改 types.ts
5. 重构 configs/markdown.ts
6. 修正 factory 的 Markdown 子选项转发
7. 增加 composer.setDefaultIgnores
8. typecheck + targeted lint + build + ESM lintText smoke
9. 更新 eslint-config-upgrade-status.md，把 markdown 标记为完成
10. 如维护者要求，再单独处理 lockfile 中遗留 overrides/catalog 清理
```

## 11. 当前暂停点

本轮只完成了 Markdown 架构对比和迁移方案分析，没有修改三个项目源码。暂停点正好位于“开始实施 Markdown 迁移”之前。
