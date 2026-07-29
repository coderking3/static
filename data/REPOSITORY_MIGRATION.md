# k3-server 仓库初始化与旧版本弃用

> 以下内容假设新版仓库地址为
> [`OpenKnights/k3-server`](https://github.com/OpenKnights/k3-server)。

## k3-server 首次提交

推荐的 commit message：

```text
🎉 chore: initialize k3-server
```

需要补充提交正文时，可以使用：

```text
🎉 chore: initialize k3-server

- add the H3-powered HTTP server factory
- add declarative routes and middleware
- add server lifecycle management
- add tests, playground, build configuration, and documentation
```

## better-mock-server 弃用说明

将下面的提示添加到旧仓库英文 README 顶部：

```md
> [!WARNING]
> This project is deprecated and no longer maintained. Please use [k3-server](https://github.com/OpenKnights/k3-server) instead.
```

将下面的提示添加到旧仓库中文 README 顶部：

```md
> [!WARNING]
> 本项目已弃用且不再维护。请迁移至新版 [k3-server](https://github.com/OpenKnights/k3-server)。
```

## npm 弃用说明

推荐的 npm deprecation message：

```text
Deprecated and no longer maintained. Please migrate to k3-server: https://github.com/OpenKnights/k3-server
```

将 npm 上所有 `better-mock-server` 版本标记为 deprecated：

```bash
npm deprecate better-mock-server@"*" "Deprecated and no longer maintained. Please migrate to k3-server: https://github.com/OpenKnights/k3-server"
```
