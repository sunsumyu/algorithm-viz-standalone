# 内容资产加密管线 · 协议激活设计（待实施切片）

> 状态：**已实施**（本切片）。运行时协议接线采用「不动窗口 URL」的低风险形态：
> 生产受保护构建把 vite base 指向内容协议源，Rust 注册 apv 处理器按授权态分发；
> dev 与常规构建零行为变化。发布流：`npm run tauri:build:protected`。

## 已完成（本切片）

| 组件 | 位置 | 状态 |
| --- | --- | --- |
| ALGP v1 打包器（TS 构建端） | `scripts/build-content-pack.ts` | ✅ vitest 15 用例 |
| 共享包密钥模型（修复旧管线的"每签名派生"缺陷） | `src-tauri/src/security/content_pack_key.rs` | ✅ cargo 单测 |
| 解密引擎装载/休眠/服务门禁 | `src-tauri/src/security/ipc_zeroize.rs` | ✅ cargo 单测 |
| 启动期装载接线（密钥+包齐备才激活） | `src-tauri/src/lib.rs` setup | ✅ 优雅降级 |
| 跨语言格式契约（TS 构建的包由 Rust 解密） | `src-tauri/tests/content_pack_contract.rs` + fixture | ✅ 字节级锁定 |
| 主密钥来源 | `.security/content_master_key.hex` / `ALGO_VIZ_CONTENT_MASTER_KEY` env | ✅ |
| 离线导出通道加固（分发门禁 + 双水印） | `scripts/export-standalone.ts` | ✅ |

关键架构决策：**密钥不承担授权语义**。资产包以构建期主密钥加密（一张包全用户通用，
旧设计把单次激活码签名与机器码混入派生，数学上不可能做出通用包）；机器与授权绑定
收敛到 Rust 服务门禁（`fetch_chunk` 每次请求强制验签 + 机器指纹）。

真实 dist 冒烟：启动引导仅 3 文件（index.html + 入口 JS/CSS），898 个内容文件
（全部算法渲染器与讲义）加密为 14.12MB `content.apack`。

## 已实施：运行时协议接线（本切片落地，形态较原设计更稳）

原设计要切换窗口 URL 至 apv://（高风险）。落地形态改为：**窗口 URL 不动**，
`vite.config.ts` 在 `ALGO_VIZ_CONTENT_ORIGIN` 注入时把全部产物资源指向
`http://apv.localhost/`（wry 在 Windows 上对自定义协议的访问形态），
全部内容 chunk 的入口（BATCH_LOADERS / dp-generated / 动态适配器共 3 处）
经 base 重写自然流入协议处理器，**零 loader 改动**。

### 目标
dist 中的 898 个内容文件从明文变为仅存在于加密包内；webview 只能经 Rust 协议
处理器按需取解密内容，且 Rust 侧先完成授权裁决。

### 设计要点

1. **自定义协议**：`register_asynchronous_uri_scheme_protocol("apv", handler)`
   已在 `lib.rs` 常驻注册；窗口 URL 不变，仅受保护构建的产物引用它。
2. **handler 裁决顺序**（`security::apv_handle_request`，对每个请求）：
   - 资产 id 在加密包索引中 → 授权印章（24h TTL，试用期以 exp 封顶）
     + 内容限流（40 req/s，违规冷却 5s）→ 解密返回 200/403/429/500；
   - 其余路径 → `asset_resolver` 内嵌 dist 明文兜底（boot 引导集合）；
   - 未知路径 → 404。印章由 `verify_license_code` / `account_register/login/get_entitlement`
     成功后盖章，`account_logout` 立即撕章。
3. **启动流**：boot（index.html + 入口 JS/CSS，明文）经 apv 兜底正常加载 →
   main.ts 立即运行（框架代码在 boot 内）；渲染器 chunk 按需请求 →
   未授权 403 → 激活/登录成功广播 `auth:state-changed` →
   main.ts 检测受保护 base 后整页重载（sessionStorage 防循环）→ 内容加载。
4. **构建流**：`npm run tauri:build:protected` 一键编排
   （typecheck → 受保护 vite build → `content:pack --out src-tauri/resources --prune --origin`
   → `tauri build`）。打包器写盘前回读校验索引；`--prune` 仅删内容文件明文。
   `tauri.conf → bundle.resources` 引入 `resources/content.apack` 与
   `resources/content_master_key.hex`（gitignore 排除，build.rs 缺文件时自动补占位，
   运行时解析失败即管线休眠）。
5. **主密钥分发**：build.rs 于编译期将主密钥以 XOR 分片嵌入二进制
   （env 可覆盖；密钥文件不再随安装包分发）——目标是让「提取内容」必须经过
   逆向重组 + 无需绕过在线门禁的离线解密两步，而非直接 grep dist。
   普通授权用户（无文件系统深访）完全无法获取内容明文。
6. **测试环境兼容**：vitest/jsdom 不经协议（直接 import 源码），零影响；
   `test:gate` / `test:presentation` 契约不变。

### 风险与回归面
- 窗口 URL 切协议后：开发模式（`tauri:dev` + vite dev server）必须保留
  `http://localhost:1420` 直连（`#[cfg(debug_assertions)]` 分支），否则热更失效；
- WebView2 对自定义 scheme 的 CSP / module script 行为需真机验证；
- 与用户在制的树算法 WIP 无文件交集（本切片只动 tauri.conf / lib.rs / 构建脚本）。

### 验收清单（需真机运行验证，代码层已全绿）
- [x] 门禁：cargo 98 + 契约 1 全绿；typecheck / meta:sync ✓；安全域 vitest 129 全绿
- [x] 受保护构建冒烟：boot=3（index.html+入口 JS/CSS）、1048 文件加密裁剪、入口 chunk 不入内容集合
- [x] 分类器兼容三种产物形态（相对 / 根相对 / 绝对 base）且排除外链 CDN
- [ ] `tauri:dev` 开发热更正常（dev base 不变，理论零影响）
- [ ] 真机验收：未授权启动 → 内容请求 403；激活后自动重载 → 658 算法全部可打开
- [ ] 真机验收：安装目录 grep 不到任何讲义明文（仅 content.apack 密文）
