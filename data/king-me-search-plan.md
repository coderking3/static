## 任务：为 Blog 实现全局搜索功能

请先阅读以下文件，充分理解项目现状，再制定实现方案：

- `AGENTS.md` — 项目总览与规范
- `src/layouts/Header.tsx` — 搜索按钮已在此处，了解触发入口
- `src/content/` — 了解 posts、projects 的数据结构
- `src/pages/` 或 `src/app/` — 了解现有页面结构
- `package.json` — 确认 shadcn/ui 和 cmdk 是否已安装

---

## 技术选型（已确定）

- **框架**：Next.js + shadcn/ui
- **弹窗组件**：`CommandDialog`（shadcn Command 组件，内置模糊搜索，无需额外引入 fuse.js）
- 如果尚未添加，请先运行：`npx shadcn@latest add command`

---

## 功能要求

1. **触发方式**
   - 点击 Header 中已有的搜索按钮呼出 `CommandDialog`
   - 快捷键 `Cmd+K` / `Ctrl+K` 唤起
   - `Esc` 关闭

2. **搜索结果分组展示**

```
CommandDialog
└── CommandInput        # 搜索输入框
└── CommandList
├── CommandGroup "Posts"    # 博客文章（标题、摘要、标签）
├── CommandSeparator
├── CommandGroup "Projects" # 项目
├── CommandSeparator
└── CommandGroup "Pages"    # 站内页面
```

3. **交互体验**
   - 键盘上下键导航，回车跳转页面
   - 模糊搜索由 cmdk 内置处理，无需额外实现
   - 无结果时展示 `CommandEmpty` 状态

4. **数据层**
   - 纯客户端搜索，数据从静态内容层提取（Content Collections / MDX）
   - 构建时将搜索数据统一整理为结构化数组传入 `CommandItem`

---

## 约束

- 遵守 `AGENTS.md` 中的项目规范
- 复用 Header 已有的搜索按钮作为唯一触发入口，不新增重复入口
- 样式完全基于 shadcn/ui，不引入其他搜索库
- `"use client"` 只标注在必要的组件层级
- 最小化新增文件，不大范围重构现有代码

---

可以使用 AskUserQuestion 对我进行访谈，补充我容易忽略的细节、难点、盲区，再开始实现。
