# 顶层设计规范：基于「不同路径 II」黄金基准的双串与网格动态规划通用模型架构 (Universal DP Model Architecture)

**日期**：2026-09-13  
**状态**：已评审 (Approved Design)  
**基准参考**：`src/core/models/unique-paths-ii.yaml` 与 `UniquePathsVisualizer`

---

## 1. 背景与核心动机

在当前代码库中，不同算法可视化存在严重的“架构割裂”：
- **黄金基准（不同路径 II）**：通过 YAML 模型声明 (`unique-paths-ii.yaml`) + 顶层策略引擎 (`IAlgorithmStrategy`) + 通用画板 (`UniversalStageVisualizer`) + 无状态网格适配器 (`GridVisualAdapter`) 驱动，结构极其稳固、状态无歧义、零冗余代码。
- **其他业务算法（如 LCS dp-067 等）**：采用了“大泥球模式”（Fat Renderer），在单个 `*-renderer.ts` 中手写了 3000 多行重复的步骤生成器、状态管理、模式切换及 DOM 拼接。由于缺乏顶层契约约束，导致了诸如：
  1. **状态机契约被破坏**：业务层随手预填 `0`，撞坏了底层将 `null` 视为未计算的约定，导致网格开局通盘全绿；
  2. **顺推/逆推语义倒错**：业务层私自定义方向，导致界面点击“顺推”，代码注释却赫然写着“倒序递推”；
  3. **重复修改引发连锁灾难**：业务层局部修补与顶层组件的硬编码判定打架，代码越改越乱。

本规范确立统一的**顶层设计模式 + YAML 驱动模型**，将所有同构 DP 算法的共性能力沉淀至顶层核心，业务算法只保留极简特异化声明。

---

## 2. 顶层架构设计 (Architecture Overview)

系统分层分为严格的四层单向依赖架构：

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 算法声明层 (YAML Model)                                   │
│    src/core/models/<algorithm-id>.yaml                      │
│    - 纯声明：题目信息、参数、方向转移向量、四阶段代码与说明     │
└──────────────────────────────▲──────────────────────────────┘
                               │ (YAML 解析)
┌──────────────────────────────┴──────────────────────────────┐
│ 2. 顶层通用策略引擎 (Universal DP Strategy Engine)           │
│    src/core/strategies/universal-string-dp-strategy.ts       │
│    - 实现 IAlgorithmStrategy 接口                           │
│    - 统一四阶段步进推导 (递归 / 记忆化 / 二维表 / 空间压缩)    │
│    - 统一管理生命周期 (null -> active -> done)               │
└──────────────────────────────▲──────────────────────────────┘
                               │ (驱动 UniversalStep)
┌──────────────────────────────┴──────────────────────────────┐
│ 3. 顶层演化画板容器 (Universal Visualizer)                   │
│    UniversalStageVisualizer                                 │
│    - 提供标准 4 阶段顶栏、代码终端、极简双串网格与动画         │
└──────────────────────────────▲──────────────────────────────┘
                               │ (复用纯净组件)
┌──────────────────────────────┴──────────────────────────────┐
│ 4. 纯净视觉适配器 (Visual Adapters)                          │
│    GridVisualAdapter / SpatialFlowVisualAdapter             │
│    - 统一探险家 🤠、安全绳 SVG 连线、字符标尺、匹配标徽      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 核心数学与方向规范 (Direction Specification)

为杜绝“顺推与逆推搞反”的歧义，顶层模型定义严格的对偶方向向量：

| 维度 | 顺推 (Forward / 默认模式) | 逆推 (Reverse / 对偶模式) |
| :--- | :--- | :--- |
| **状态数学模型** | **前缀模型 (Prefix DP)**：子串 `s[0..i-1]` | **后缀模型 (Suffix DP)**：子串 `s[i..]` |
| **阶段 3 循环** | `for (i = 1; i <= n; i++)` 递增正序填表 | `for (i = n - 1; i >= 0; i--)` 倒序填表 |
| **最终收敛目标** | `dp[n][m]`（右下角） | `dp[0][0]`（左上角） |
| **阶段 4 空间优化** | `1..n` 滚动更新，与阶段 3 完全对齐 | 倒序覆盖 |
| **字符匹配转移** | `↖️ [-1, -1] + 1` | `↘️ [1, 1] + 1` |
| **字符不匹配转移** | `max(⬆️[-1, 0], ⬅️[0, -1])` | `max(⬇️[1, 0], ➡️[0, 1])` |

---

## 4. LCS 黄金模型规范 (`longest-common-subsequence.yaml`)

创建 `src/core/models/longest-common-subsequence.yaml`，结构如下：
1. **`problem`**：LeetCode 1143 题面、样例、复杂度；
2. **`defaultParams`**：`s1: "abcde"`, `s2: "ace"`；
3. **`directions`**：
   - `forward`：起点 `[1, 1]`，目标 `[n, m]`，转移向量指向左上；
   - `reverse`：起点 `[n-1, m-1]`，目标 `[0, 0]`，转移向量指向右下；
4. **`stages`**：
   - `stage-1`：递归探索（前缀 vs 后缀分支）；
   - `stage-2`：记忆化搜索（剪枝树与 memo 矩阵）；
   - `stage-3`：严格二维表（状态转移拓扑树与网格状态变迁）；
   - `stage-4`：空间压缩（滚动数组与 leftUp 寄存器暂存）。

---

## 5. 顶层策略引擎 (`UniversalStringDpStrategy`) 实现要点

1. **统一网格状态机防御**：
   - 阶段 3 开始时，严格由 `createUncalculatedDpGrid(n+1, m+1)` 初始化全表为 `null`；
   - 仅将空串边界（第 0 行/第 0 列或第 n 行/第 m 列）置为 `0` 并标记已解通；
   - 双层循环递推中，计算中单元格处于 `isActive` 状态且值为 `null`，计算完成写入后变更为 `isDone`（绿色数值）。
2. **调用栈轨迹自动生成**：
   - 递归展开时自动维护 `activeStack`，触发 `SpatialFlowVisualAdapter` 安全绳连线；
   - 递归回溯时自动出栈收绳，保留格内成果。
3. **双串标尺与匹配标徽自动桥接**：
   - 自动为网格挂载 `['Ø', ...s1]` 和 `['Ø', ...s2]` 标尺；
   - 在字符命中时，单元格自动挂载 `✨` 标徽。

---

## 6. 瘦身业务层与向后兼容

1. **`longest-common-subsequence-renderer.ts` 瘦身**：
   - 从 3125 行精简至 30 行以内；
   - 仅负责载入 `longest-common-subsequence.yaml` 并注册至 `AlgorithmRegistry`。
2. **测试门禁兼容**：
   - `dp-067.test.ts` 保持测试套件平滑通过；
   - `npm run typecheck` 与 `npx vitest run src/core/algorithm-catalog-indexer.test.ts` 100% 保持通过。
