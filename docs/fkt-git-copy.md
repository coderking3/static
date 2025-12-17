# 📦 File Kit - Git 目录备份

使用 File Kit 快速备份和还原 `.git` 目录的命令集合。

---

## 🔐 Base64 编码

### 编码
```bash
cd "$(git rev-parse --show-toplevel)" && \
zip -r gitzip.zip ./.git && \
fkt base64 gitzip.zip -o . && \
rm gitzip.zip
```

### 还原
```bash
fkt restore ./gitzip.base64.json -o ./zip && \
unzip ./zip/gitzip.zip -d ./zip && \
rm ./gitzip.base64.json ./zip/gitzip.zip && \
cd ./zip && \
git checkout .
```

---

## 🔒 加密保护

### 加密
```bash
cd "$(git rev-parse --show-toplevel)" && \
zip -r gitzip.zip ./.git && \
fkt encrypt gitzip.zip -o . && \
rm gitzip.zip
```

### 解密
```bash
fkt decrypt ./gitzip.crypto.json -o ./zip && \
unzip ./zip/gitzip.zip -d ./zip && \
rm ./gitzip.crypto.json ./zip/gitzip.zip && \
cd ./zip && \
git checkout .
```

---

## 📝 说明

- 命令会自动定位到 Git 仓库根目录
- 临时的 `gitzip.zip` 文件会在处理后自动清理
- 还原的文件会放置在 `./zip` 目录中
- 最后的 `git checkout .` 会恢复工作区状态
