# 安全防护体系与运营手册 (Security Architecture & Operations Runbook)

> 适用范围：algorithm-viz-standalone 桌面端（Tauri 2 · Windows 优先）
> 本手册汇总既有防盗体系与新增的账号/水印/追踪/内容加密四层能力的
> 完整威胁模型、运维流程与应急响应手段。

## 一、防线总览（由外到内 8 层）

| # | 防线 | 模块 | 防什么 |
| --- | --- | --- | --- |
| 1 | 硬件指纹 | `machine_uid.rs` | 换机共享激活码 |
| 2 | 离线激活码 | `license_verifier.rs` (Ed25519) | 无授权使用；时钟回拨 |
| 3 | 账号体系 | `account_store.rs` + `machine_ledger.rs` | 试用农场 / 凭证重放 / 时钟回拨 / 库篡改 |
| 4 | 权益凭证 | `voucher.rs` + `voucher:gen` CLI | 无服务端下的试用延长/充值/会员发放 |
| 5 | 内容加密网关 | `stream_decrypt.rs` + `content_pack_key.rs` + `content_gateway.rs` + `apv://` | 内容明文提取；未授权访问加密资产 |
| 6 | 反注入/反调试 | `anti_cdp.rs` / `anti_debugger.rs` | CDP 参数与环境变量注入、调试器附加 |
| 7 | 泄露溯源水印 | `zero-width-watermark.ts` + `clipboard-watermark-guard.ts` + `visible-watermark.ts` + `watermark-injector.ts` | 截屏/复制/讲义外传的买者溯源 |
| 8 | 行为追踪 | `usage-tracker.ts` | 使用链证据（对账与取证辅助） |

**分层原则**：密钥不承担授权语义（内容包一张全用户通用）；机器与授权绑定
在服务门禁层（每次解密前验签 + 机器指纹；apv 请求持 24h 授权印章）。

## 二、威胁模型覆盖与残余风险（诚实清单）

### 已覆盖
- 普通用户共享/转卖激活码 → 机器绑定
- 删账号库薅试用 → 台账印记（ProgramData 文件 + 注册表双位置，HMAC 防篡改 fail-closed）
- 通配凭证重放 → 账号库 + 台账双层 nonce
- 系统时钟回拨续期 → 激活码与台账双通道防回拨（300s 容差）
- 安装目录 grep 明文 → 受保护发布流裁剪明文，算法资产仅存于 AES-256-GCM 包
- CDP / 调试器自动化扒取 → argv 与 WEBVIEW2 环境变量双消毒 + 看门狗
- 文本/讲义外传 → 双水印（可见威慑 + 零宽盲水印取证）
- 密文包整体替换/篡改 → GCM 逐片 Tag 校验

### 残余风险（桌面端通例，接受并监控）
1. **主密钥内嵌于二进制**（XOR 分片混淆，build.rs 生成）：不再有明文密钥文件
   随包分发；自动化 agent 无法「读文件即得密钥」，必须逆向分片重组逻辑。
   专业逆向者仍可还原（桌面端通例），不承诺抵御。未来服务端化后可将内容
   分发改为服务端按需加密，彻底消除此项。
2. **前端框架代码明文**（boot 引导 3 文件）：仅含框架骨架与激活 UI，
   不含算法讲义与步骤数据。
3. **授权印章 24h 窗口**：印章在 Rust 进程内，无法经 IPC 伪造；
   授权过期后新内容请求即 403。
4. **离线导出通道**：`export:standalone` 产出的单文件 HTML 无授权体系，
   已加双重门禁（显式 `--allow-distribute` + 强制双水印），仅限演示分发。

## 三、日常运营流程

### 3.1 发离线激活码（一机一码）
```bash
# 客户提供机器码（激活弹窗一键复制）→
npm run license:gen -- --hwid E804-62DB-86BA-555E --days 365 --user 客户订单号 --tier 3
```
`--days 0` 或 `--lifetime` 为永久；`--tier` 1 基础 / 2 进阶 / 3 全量。

### 3.2 手机号注册用户的权益调整（无需服务端）
```bash
# 延长试用 30 天（绑定手机号，勿用 --any 通用凭证，防重放面扩大）
npm run voucher:gen -- --type trial   --phone 13800138000 --days 30
# 充值按量次数
npm run voucher:gen -- --type credits --phone 13800138000 --credits 100
# 开通永久会员
npm run voucher:gen -- --type lifetime --phone 13800138000
# 可选 --redeemable-days N 限定凭证兑换窗口
```
用户在「账号登录与权益中心」弹窗粘贴凭证字符串即生效（nonce 一次性）。

### 3.3 受保护发布（唯一允许对外的发布通道）
```bash
npm run tauri:build:protected
```
编排：typecheck → 受保护 vite build（base → `http://apv.localhost/`）→
`content:pack --out src-tauri/resources --prune`（回读校验后裁剪明文）→
`tauri build`（apv 协议处理器 + 资源打包）。

主密钥首次自动生成于 `.security/content_master_key.hex`。
**⚠️ 主密钥与 `.security/` 私钥必须异地备份：密钥丢失 = 已发布包永久无法解密。**

### 3.4 泄露取证
```bash
npm run leak:investigate -- <泄露文本文件路径>
```
自动尝试新旧两种零宽水印格式还原买家身份。复制事件同时留有 usage-tracker
行为链（`window.usageTracker.exportEventsJson()`）。

### 3.5 离线演示分发（默认拦截）
```bash
npm run export:standalone -- --allow-distribute --buyer <订单号>
```
导出物强制注入可见水印 + 零宽盲水印，泄露可溯源。

## 四、真机验收清单（每次受保护发布后执行）

**机械化核验（一条命令，Exit 0 = 机械项全过）：**
```bash
npm run verify:protected -- --exe src-tauri/target/release/algorithm-viz.exe --origin http://apv.localhost/
```
覆盖：资源三件套齐备、资产包回读 + 抽样解密 SHA-256 对账、dist 明文裁剪、
boot 引导齐备、base 指向内容协议源、exe 讲义特征串/主密钥泄漏零命中。

1. 安装目录确认：无任何讲义/步骤明文（`grep -r "中序遍历" .` 应无命中）；
   仅有 `content.apack` 密文——**主密钥已内嵌于 exe（XOR 分片），不再有密钥文件**。
2. 未授权启动：界面为激活壳；DevTools 断开（消毒生效）；Network 中
   内容资产请求返回 403。
3. 激活后：页面自动重载，658 算法全部可打开、讲义完整。
4. 换一台未激活机器安装：激活码拒绝（机器码不匹配）；注册新账号
   → 试用 7 天；删账号库重注册 → 不再授予试用（台账生效）。
5. 凭证：试用延长/充值在客户端兑换后即时生效；同凭证二次兑换被拒。
6. `tauri:dev` 开发热更正常（base 不变，协议不参与）。

## 五、应急响应

- **激活码泄露（被公开）**：激活码绑机器码，泄露码在其他机器无效；无需处理。
- **主密钥疑似泄露**：更换 `.security/content_master_key.hex` → 重新受保护发布
  （build.rs 自动嵌入新钥）→ 旧版内容资产在旧包内仍可解密（密文包随旧版本走），
  新版彻底换锁；配合在线激活（规划中）可强制升级。
- **开发者私钥（`.security/developer_ed25519_*.pem`）泄露**：
  严重级最高——可伪造激活码/凭证/内容签名。必须立即更换密钥对并发布
  更新 `EMBEDDED_PUBLIC_KEY`（`license_verifier.rs`）的新版本，旧版全部作废。
- **用户报告 403 无法加载内容**：印章 24h 过期边缘场景 → 重启应用即可
  （启动自检重新盖章）；持续 403 → 检查安装包资源完整性。

## 六、规划中的下一阶段（服务端化）

1. 远程认证服务接管 `account_store.rs` 的读写（前端与 Tauri 命令契约不变，
   `EntitlementStatus.server_synced` 由服务端盖章）；
2. 在线激活/心跳 + 按量扣次服务端记账（usage-tracker sink 落地为 HTTP 上报）；
3. 内容资产改为服务端按用户加密分发，消除主密钥随包分发的残余风险；
4. 二进制自完整性校验（发布后对 exe 做 Ed25519 签名 + 运行时自校验，
   存在打包时序的先有鸡先有蛋问题，需拆分 build/bundle 两段实现）。
