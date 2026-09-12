# Quickstart & Validation Guide: 全局 DP 网格适配器与足迹机制统一

**Feature Branch**: `001-dp-grid-unified` | **Date**: 2026-09-12

本指南提供全链路验证本特性的可执行验证步骤。

---

## 1. 前置条件 (Prerequisites)

- Node.js 18+
- 工作区依赖完整安装 (`npm install`)

---

## 2. 自动化验证指令 (Automated Verification)

### ① 运行 Class 067 算法测试套件（含 LCS 网格验证）
```bash
npx vitest run src/algorithms/categories/dynamic-programming/dp-067/dp-067.test.ts
```
**期望结果**：全量 64 个测试 100% 通过（`64 passed`）。

### ② 运行通用网格与空间连线测试套件
```bash
npx vitest run src/core/renderers/grid-visual-adapter.test.ts src/core/renderers/spatial-flow-visual-adapter.test.ts
```
**期望结果**：网格与矢量连线单元测试全部通过。

### ③ 全局 TypeScript 严格类型检查
```bash
npm run typecheck
```
**期望结果**：`tsc -b --noEmit` 零错误退出（Exit code 0）。

---

## 3. 人工视觉审查清单 (Manual Visual Checklist)

启动开发服务器并在浏览器/Tauri 中打开 `最长公共子序列 (LCS)` 与 `不同路径 II (Unique Paths II)`：

1. **当前格探险家**：
   - 探险家 🤠 稳立于当前考察格上方；
   - 脚下无任何重叠的脚印字符；
   - 角色随步进平滑瞬移。
2. **活动调用栈路径**：
   - 历史调用节点显示浅蓝虚线框，内嵌纯净单颗跳动 `👣`；
   - 节点之间有带箭头的蓝色流动虚线（安全绳）；
   - 回溯时安全绳自然缩短，前进时自然拉长。
3. **回溯后的解格**：
   - 呈现淡雅浅绿底色，大号加粗展示已算出的数字解；
   - 若两字符相等，右上角保留精致 `✨`；
   - 无任何 `×2`、`栈` 等杂质。
4. **两题视觉一致性**：
   - LCS 与不同路径 II 的单元格质感、边框圆角、字体与角色完全一致。
