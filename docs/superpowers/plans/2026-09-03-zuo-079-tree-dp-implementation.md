# 算法讲解079 树型DP (下) 剩余算法实现计划 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完整实现左程云《算法通关课》第079讲未收录的最后两道高阶经典树型DP算法：`height-removal-queries`（LeetCode 2458 移除子树后的二叉树高度）与 `minimum-score-after-removals`（LeetCode 2322 从树中删除边的最小分数），并将其无缝集成至可视化系统与测试套件。

**Architecture:** 按照 `AlgorithmSpec` 规范创建独立的算法定义文件，提供完整的 4 语言代码实现、逐行教学映射、关键思路与 FAQ。通过 DFN 序打平 + 前后缀极值及拓扑关系判定构建精细单步追踪（`generateSteps`），在 `TreeDpStrategy` 中扩充对应模型支持，并在 `dp-generated-renderers.ts`、`model-repository.ts`、`algorithm-manifests-meta.ts` 中注册元数据。

**Tech Stack:** TypeScript, Vue 3 / Universal Stage Engine, Vitest, Tailwind / CSS Variables, DpStepEngine.

## Global Constraints

- 遵循严谨的 `AlgorithmSpec` 标准格式，4 语言代码行号必须与 `semanticLines` 完全精确对齐。
- 单步执行 `generateSteps` 必须输出合法且语义丰富的 `DpTraceStep[]`，包括树结构节点状态（`normal` / `current` / `active` / `computed` / `disabled`）、变量列表、公式推导与日志。
- 新增算法必须通过现有 `tree-specs.test.ts` 测试套件，断言覆盖元数据完整性与算法结果准确性。

---

### Task 1: 实现 Code03 `HeightRemovalQueriesSpec` (移除子树后的二叉树高度)

**Files:**
- Create: `src/algorithms/categories/dynamic-programming/specs/tree/height-removal-queries.spec.ts`
- Test: `src/algorithms/categories/dynamic-programming/specs/tree/tree-specs.test.ts`

**Interfaces:**
- Produces: `HeightRemovalQueriesSpec: AlgorithmSpec`
- Consumes: `AlgorithmSpec, DpTraceStep from '../../engine/types'`, `makeTraceStep from '../../engine/dp-step-engine'`, `DpTreeNode from '../../dp-demo-visualizer'`

- [ ] **Step 1: 创建 `height-removal-queries.spec.ts` 算法规范文件**
  - 包含 LC 2458 题目信息、4 语言代码（Java / C++ / Python / JS）、逐行语义对齐、关键解析。
  - 实现 `generateSteps({ root, queries })`：先序 DFS 建立 DFN 序与深度数组，预处理前缀后缀最大深度，逐步展示查询移除子树和 $O(1)$ 获得答案的过程。
- [ ] **Step 2: 编写测试用例验证 `HeightRemovalQueriesSpec`**
  - 在 `tree-specs.test.ts` 中引入并测试输入 `root = [1, 3, 4, 2, null, 6, 5, null, null, 2], queries = [4]` 返回预期树高度。

---

### Task 2: 实现 Code04 `MinimumScoreAfterRemovalsSpec` (从树中删除边的最小分数)

**Files:**
- Create: `src/algorithms/categories/dynamic-programming/specs/tree/minimum-score-after-removals.spec.ts`
- Test: `src/algorithms/categories/dynamic-programming/specs/tree/tree-specs.test.ts`

**Interfaces:**
- Produces: `MinimumScoreAfterRemovalsSpec: AlgorithmSpec`
- Consumes: `AlgorithmSpec, DpTraceStep from '../../engine/types'`, `makeTraceStep from '../../engine/dp-step-engine'`, `DpTreeNode from '../../dp-demo-visualizer'`

- [ ] **Step 1: 创建 `minimum-score-after-removals.spec.ts` 算法规范文件**
  - 包含 LC 2322 题目信息、4 语言代码（Java / C++ / Python / JS）、逐行语义对齐、包含/并列拓扑判定数学推导。
  - 实现 `generateSteps({ nums, edges })`：后序 DFS 计算 DFN 序与子树异或和，逐步枚举切断的两条边，展示 3 个连通分支着色与异或计算。
- [ ] **Step 2: 编写测试用例验证 `MinimumScoreAfterRemovalsSpec`**
  - 在 `tree-specs.test.ts` 中测试标准用例 `nums = [1, 5, 5, 4, 11], edges = [[0,1],[1,2],[1,3],[3,4]]`，断言计算出的最小分数为 `9`。

---

### Task 3: 注册 Spec 并在 `TreeDpStrategy` 中扩充执行器

**Files:**
- Modify: `src/algorithms/categories/dynamic-programming/specs/index.ts`
- Modify: `src/core/strategies/tree-dp-strategy.ts`
- Modify: `src/core/strategies/index.ts`
- Modify: `src/algorithms/categories/dynamic-programming/dp-generated-renderers.ts`
- Modify: `src/core/model-repository.ts`
- Modify: `src/core/algorithm-manifests-meta.ts`

- [ ] **Step 1: 在 `specs/index.ts` 中集中导出并注册到 `DpStepEngine`**
- [ ] **Step 2: 在 `tree-dp-strategy.ts` 中扩展 `TreeDpModelId` 并实现对应的 Universal Step 编译逻辑**
- [ ] **Step 3: 在 `strategies/index.ts` 中注册两道题的策略实例**
- [ ] **Step 4: 在 `dp-generated-renderers.ts`、`model-repository.ts` 与 `algorithm-manifests-meta.ts` 中更新索引元数据**

---

### Task 4: 运行全量测试并回归验证

**Files:**
- Test: `src/algorithms/categories/dynamic-programming/specs/tree/tree-specs.test.ts`
- Test: `src/algorithms/categories/dynamic-programming/specs/complete-specs.test.ts`

- [ ] **Step 1: 运行 `vitest run src/algorithms/categories/dynamic-programming/specs/tree/tree-specs.test.ts`**
- [ ] **Step 2: 运行所有相关单元测试，确保无回归故障且构建正常**
