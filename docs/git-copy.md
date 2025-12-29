# 📦 Git Copy

## 🔐 Base64 编码
**编码**
```bash
cd "$(git rev-parse --show-toplevel)" && zip -r gitzip.zip ./.git && fkt base64 gitzip.zip -o . && rm gitzip.zip
```

**还原**
```bash
fkt restore ./gitzip.base64.json -o ./zip && unzip ./zip/gitzip.zip -d ./zip && rm ./gitzip.base64.json ./zip/gitzip.zip && cd ./zip && git checkout . && cd ../
```

## 🔒 加密保护
**加密**
```bash
cd "$(git rev-parse --show-toplevel)" && zip -r gitzip.zip ./.git && fkt encrypt gitzip.zip -o . && rm gitzip.zip
```

**解密**
```bash
fkt decrypt ./gitzip.crypto.json -o ./zip && unzip ./zip/gitzip.zip -d ./zip && rm ./gitzip.crypto.json ./zip/gitzip.zip && cd ./zip && git checkout . && cd ../
```

**说明:** 自动定位到 Git 根目录,临时文件自动清理,还原文件在 `./zip` 目录

---

## 🔄 代码同步

**拉取最新代码**
```bash
git fetch origin && git reset --hard origin/main
```

**清理工作目录** (保留 .git、zip、node_modules、.next)
```bash
setopt extended_glob && rm -rf ^(.git|zip|node_modules|.next)
```

**迁移 zip 内容到根目录** (排除 .git)
```bash
setopt extended_glob && cp -r zip/^(.git)/ ./ && rm -rf zip/
```

⚠️ **删除操作不可恢复,请先预览确认**
