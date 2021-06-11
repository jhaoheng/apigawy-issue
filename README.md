# replace this

- [ ] : issue
  1. 當設定好 api gateway 的 resource policy, 指定 access ip
  2. 利用 postman 在非指定的 ip 下, request api, 會得到 403
  3. 切換到指定 ip 下, 再 request 一次, 還是得到 403
  4. 方法一
    1. 將 postman request header 中的 Host 取消勾選
    2. request 一次 api, 得到 404
    3. 將 Host 勾選
    4. request, 得到 200
  5. 方法二
    1. 等待 五 分鐘左右, 可以得到 200
- 只要得到一次 403, 就必須用以上方法, 才能正常呼叫 api 


- api
  - curl -X POST https://{your-domain}/mytest

## 請填妥 main.ts 參數

```
const DomainName = ""
const SubDomainName = ""
const VpcId = ""
const SubnetId = ""
const SourceIps = [""]
```