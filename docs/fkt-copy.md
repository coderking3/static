# 📦 File Kit Copy Tools

## 🔐 Base64 编码

**编码**

```bash
cd "$(git rev-parse --show-toplevel)" && zip -r gitzip.zip ./.git && fkt base64 gitzip.zip -o . && rm gitzip.zip
```

```powershell
cd $(git rev-parse --show-toplevel); Compress-Archive -Path .\.git -DestinationPath gitzip.zip -Force; fkt base64 gitzip.zip -o .; Remove-Item gitzip.zip
```

**还原**

```bash
fkt restore ./gitzip.base64.txt -o ./zip && unzip ./zip/gitzip.zip -d ./zip && rm ./gitzip.base64.txt ./zip/gitzip.zip && cd ./zip && git checkout . && cd ../
```

```powershell
fkt restore .\gitzip.base64.txt -o .\zip; Expand-Archive -Path .\zip\gitzip.zip -DestinationPath .\zip -Force; Remove-Item .\gitzip.base64.txt, .\zip\gitzip.zip; cd .\zip; git checkout .; cd ..
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
setopt extended_glob glob_dots && rm -rf ^(.git|zip|node_modules|.next)
```

```powershell
Get-ChildItem -Force | Where-Object { $_.Name -notin @('.git','zip','node_modules','.next') } | Remove-Item -Recurse -Force
```

**迁移 zip 内容到根目录** (排除 .git)

```bash
setopt extended_glob && setopt glob_dots && cp -r zip/^.git ./ && rm -rf zip/
```

```powershell
Get-ChildItem .\zip\ -Force | Where-Object { $_.Name -ne '.git' } | Copy-Item -Destination .\ -Recurse -Force; Remove-Item .\zip\ -Recurse -Force
```

**重置 git 提交**

```bash
rm -rf .git && git init && git add . && git commit -m 'temp'
```

```powershell
Remove-Item .\.git -Recurse -Force; git init; git add .; git commit -m 'temp'
```

⚠️ **删除操作不可恢复,请先预览确认**
