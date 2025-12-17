```bash
# base64 编码 / encrypt 加密
zip -r gitzip.zip ./.git && fkt base64 gitzip.zip -o . && rm gitzip.zip

# restore 还原 / decrypt 解密
fkt restore ./gitzip.base64.json -o ./zip && unzip ./zip/gitzip.zip -d ./zip && rm ./gitzip.base64.json ./zip/gitzip.zip && cd ./zip && git checkout .
```
