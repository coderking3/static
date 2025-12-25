# 📦 Git Copy

## File Kit Copy

### 🔐 Base64 编码

#### 编码
```bash
cd "$(git rev-parse --show-toplevel)" && \
zip -r gitzip.zip ./.git && \
fkt base64 gitzip.zip -o . && \
rm gitzip.zip
```

#### 还原
```bash
fkt restore ./gitzip.base64.json -o ./zip && \
unzip ./zip/gitzip.zip -d ./zip && \
rm ./gitzip.base64.json ./zip/gitzip.zip && \
cd ./zip && \
git checkout . && \
cd ../
```

---

### 🔒 加密保护

#### 加密
```bash
cd "$(git rev-parse --show-toplevel)" && \
zip -r gitzip.zip ./.git && \
fkt encrypt gitzip.zip -o . && \
rm gitzip.zip
```

#### 解密
```bash
fkt decrypt ./gitzip.crypto.json -o ./zip && \
unzip ./zip/gitzip.zip -d ./zip && \
rm ./gitzip.crypto.json ./zip/gitzip.zip && \
cd ./zip && \
git checkout . && \
cd ../
```

---

### 📝 说明

- 命令会自动定位到 Git 仓库根目录
- 临时的 `gitzip.zip` 文件会在处理后自动清理
- 还原的文件会放置在 `./zip` 目录中
- 最后的 `git checkout .` 会恢复工作区状态

---

## Local Git pull

同步origin代码
```bash
git fetch origin && git reset --hard origin/main
```


## 清理工作目录

删除 zip 文件、node_modules 和 .next 之外的所有文件和文件夹
```bash
# 预览删除文件
setopt extended_glob && ls -d ^(zip|node_modules|.next)
# 删除命令
setopt extended_glob && rm -rf ^(zip|node_modules|.next)
```

⚠️ 注意
- 此命令会永久删除匹配的文件和文件夹,无法恢复
- 执行前请确认当前目录位置
- 建议先用 ls -d !(*.zip|node_modules|.next) 预览将被删除的内容
