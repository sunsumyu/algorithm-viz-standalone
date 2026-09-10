# 左程云《算法通关课》全量动态规划 (DP) 算法实现计划 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于左程云老师《算法通关课》课件体系，补齐 7 大核心专项共 22 道进阶 DP 算法的完整 `AlgorithmSpec`（含 4 语言代码、逐行语义高亮、FAQ、单步执行追踪引擎）、配套自动化测试，并全量注册至 `DpStepEngine`。

**Architecture:** 按照领域特征划分为 7 个独立子目录（`interval`, `tree`, `bitmask`, `three-dimension`, `digit`, `subarray-extension`, `optimization`），完全遵循 `AlgorithmSpec` 标准接口，通过 `DpStepEngine` 统一调度与测试套件校验。

**Tech Stack:** TypeScript, Vitest, JetBrains Mono/Primer CSS Design System.

## Global Constraints

- 每个 `.spec.ts` 必须提供完整的 `problem`（题目详情、样例、约束）、`semanticLines`（4 语言语义行映射）、`code`（JS/Java/C++/Python 4 语言代码与逐行解析、`keyPoints` 核心思维与 `faqList`）、`generateSteps`（变量监控、代入公式、依赖项、高亮行）。
- 每个子目录必须配套 `*-specs.test.ts`，验证所有 Spec 的结构完整性、执行正确性、关键用例输出。
- `specs/index.ts` 与 `DpStepEngine` 必须完成全量导出与注册。

---

### Task 1: 区间 DP 专项 (Interval DP - 算法讲解076~077)

**Files:**
- Create: `src/algorithms/categories/dynamic-programming/specs/interval/merge-stones.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/interval/burst-balloons.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/interval/predict-the-winner.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/interval/min-score-triangulation.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/interval/strange-printer.spec.ts`
- Test: `src/algorithms/categories/dynamic-programming/specs/interval/interval-specs.test.ts`

**Interfaces:**
- Produces: `MergeStonesSpec`, `BurstBalloonsSpec`, `PredictTheWinnerSpec`, `MinScoreTriangulationSpec`, `StrangePrinterSpec`

- [ ] **Step 1: Write test suite for Interval DP specs**
Create `interval-specs.test.ts` validating structure, step generation, and correct return results for each interval DP spec.

- [ ] **Step 2: Run test to verify it fails before implementation**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/interval/interval-specs.test.ts`
Expected: FAIL (files missing).

- [ ] **Step 3: Implement 5 Interval DP specs**
Implement `merge-stones.spec.ts` (石子合并), `burst-balloons.spec.ts` (戳气球), `predict-the-winner.spec.ts` (预测赢家), `min-score-triangulation.spec.ts` (多边形三角剖分), `strange-printer.spec.ts` (奇怪的打印机) with complete 4-language code, line explanations, key points, FAQs, and step traces.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/interval/interval-specs.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/algorithms/categories/dynamic-programming/specs/interval/
git commit -m "feat(dp): implement interval dynamic programming specs and tests"
```

---

### Task 2: 树型 DP 与换根 DP 专项 (Tree DP & Re-rooting - 算法讲解078~079 & 123)

**Files:**
- Create: `src/algorithms/categories/dynamic-programming/specs/tree/max-path-sum.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/tree/binary-tree-cameras.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/tree/tree-diameter.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/tree/course-selection.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/tree/tree-rerooting.spec.ts`
- Test: `src/algorithms/categories/dynamic-programming/specs/tree/tree-specs.test.ts`

**Interfaces:**
- Produces: `MaxPathSumSpec`, `BinaryTreeCamerasSpec`, `TreeDiameterSpec`, `CourseSelectionSpec`, `TreeRerootingSpec`

- [ ] **Step 1: Write test suite for Tree DP specs**
Create `tree-specs.test.ts` testing tree DP step execution, bottom-up tree state collection, and camera/path calculations.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/tree/tree-specs.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement 5 Tree DP specs**
Implement `max-path-sum.spec.ts` (二叉树最大路径和), `binary-tree-cameras.spec.ts` (监控二叉树), `tree-diameter.spec.ts` (树的直径), `course-selection.spec.ts` (选课树上背包), `tree-rerooting.spec.ts` (换根DP树中距离之和).

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/tree/tree-specs.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/algorithms/categories/dynamic-programming/specs/tree/
git commit -m "feat(dp): implement tree dynamic programming and re-rooting specs"
```

---

### Task 3: 状态压缩 DP 专项 (Bitmask DP - 算法讲解080~081)

**Files:**
- Create: `src/algorithms/categories/dynamic-programming/specs/bitmask/tsp.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/bitmask/partition-k-subsets.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/bitmask/domino-tromino-tiling.spec.ts`
- Test: `src/algorithms/categories/dynamic-programming/specs/bitmask/bitmask-specs.test.ts`

**Interfaces:**
- Produces: `TspSpec`, `PartitionKSubsetsSpec`, `DominoTrominoTilingSpec`

- [ ] **Step 1: Write test suite for Bitmask DP specs**
Create `bitmask-specs.test.ts` asserting bitmask state progression and correctness.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/bitmask/bitmask-specs.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement 3 Bitmask DP specs**
Implement `tsp.spec.ts` (旅行商TSP), `partition-k-subsets.spec.ts` (划分k个相等子集), `domino-tromino-tiling.spec.ts` (多米诺和三格骨牌铺瓦).

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/bitmask/bitmask-specs.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/algorithms/categories/dynamic-programming/specs/bitmask/
git commit -m "feat(dp): implement bitmask dynamic programming specs and tests"
```

---

### Task 4: 三维 DP 专项 (3D DP - 算法讲解069)

**Files:**
- Create: `src/algorithms/categories/dynamic-programming/specs/three-dimension/knight-probability.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/three-dimension/out-of-boundary-paths.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/three-dimension/profitable-schemes.spec.ts`
- Test: `src/algorithms/categories/dynamic-programming/specs/three-dimension/three-dimension-specs.test.ts`

**Interfaces:**
- Produces: `KnightProbabilitySpec`, `OutOfBoundaryPathsSpec`, `ProfitableSchemesSpec`

- [ ] **Step 1: Write test suite for 3D DP specs**
Create `three-dimension-specs.test.ts`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/three-dimension/three-dimension-specs.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement 3 3D DP specs**
Implement `knight-probability.spec.ts` (骑士棋盘概率), `out-of-boundary-paths.spec.ts` (出界路径数), `profitable-schemes.spec.ts` (盈利计划).

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/three-dimension/three-dimension-specs.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/algorithms/categories/dynamic-programming/specs/three-dimension/
git commit -m "feat(dp): implement 3D dynamic programming specs and tests"
```

---

### Task 5: 数位 DP 专项 (Digit DP - 算法讲解084~085)

**Files:**
- Create: `src/algorithms/categories/dynamic-programming/specs/digit/count-digit-one.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/digit/non-negative-consecutive-ones.spec.ts`
- Test: `src/algorithms/categories/dynamic-programming/specs/digit/digit-specs.test.ts`

**Interfaces:**
- Produces: `CountDigitOneSpec`, `NonNegativeConsecutiveOnesSpec`

- [ ] **Step 1: Write test suite for Digit DP specs**
Create `digit-specs.test.ts`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/digit/digit-specs.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement 2 Digit DP specs**
Implement `count-digit-one.spec.ts` (数字1的个数), `non-negative-consecutive-ones.spec.ts` (不含连续1的非负整数).

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/digit/digit-specs.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/algorithms/categories/dynamic-programming/specs/digit/
git commit -m "feat(dp): implement digit dynamic programming specs and tests"
```

---

### Task 6: 子数组与 LIS 深度扩展专项 (Subarray & LIS Extensions - 算法讲解070~072)

**Files:**
- Create: `src/algorithms/categories/dynamic-programming/specs/subarray-extension/max-circular-subarray.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/subarray-extension/max-product-subarray.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/subarray-extension/magic-scroll.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/subarray-extension/russian-doll-envelopes.spec.ts`
- Test: `src/algorithms/categories/dynamic-programming/specs/subarray-extension/subarray-extension-specs.test.ts`

**Interfaces:**
- Produces: `MaxCircularSubarraySpec`, `MaxProductSubarraySpec`, `MagicScrollSpec`, `RussianDollEnvelopesSpec`

- [ ] **Step 1: Write test suite for Subarray Extension specs**
Create `subarray-extension-specs.test.ts`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/subarray-extension/subarray-extension-specs.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement 4 Subarray & LIS Extension specs**
Implement `max-circular-subarray.spec.ts` (环形子数组最大和), `max-product-subarray.spec.ts` (乘积最大子数组), `magic-scroll.spec.ts` (魔法卷轴问题), `russian-doll-envelopes.spec.ts` (俄罗斯套娃信封).

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/subarray-extension/subarray-extension-specs.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/algorithms/categories/dynamic-programming/specs/subarray-extension/
git commit -m "feat(dp): implement subarray and LIS extension dynamic programming specs"
```

---

### Task 7: 观察与单调性优化 DP 专项 (Optimization & Observation DP - 算法讲解082~083 & 130)

**Files:**
- Create: `src/algorithms/categories/dynamic-programming/specs/optimization/super-egg-drop.spec.ts`
- Create: `src/algorithms/categories/dynamic-programming/specs/optimization/sliding-window-dp.spec.ts`
- Test: `src/algorithms/categories/dynamic-programming/specs/optimization/optimization-specs.test.ts`

**Interfaces:**
- Produces: `SuperEggDropSpec`, `SlidingWindowDpSpec`

- [ ] **Step 1: Write test suite for Optimization DP specs**
Create `optimization-specs.test.ts`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/optimization/optimization-specs.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement 2 Optimization DP specs**
Implement `super-egg-drop.spec.ts` (高楼扔鸡蛋观察与二分优化), `sliding-window-dp.spec.ts` (单调队列优化DP跳跃游戏VI).

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/specs/optimization/optimization-specs.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/algorithms/categories/dynamic-programming/specs/optimization/
git commit -m "feat(dp): implement optimization and observation dynamic programming specs"
```

---

### Task 8: 全量注册、别名映射与主测试套件校验 (Engine Integration & Full Verification)

**Files:**
- Modify: `src/algorithms/categories/dynamic-programming/specs/index.ts`
- Modify: `src/algorithms/categories/dynamic-programming/engine/dp-step-engine.ts`
- Modify: `src/algorithms/categories/dynamic-programming/specs/complete-specs.test.ts`

- [ ] **Step 1: Update index.ts and DpStepEngine**
Export and register all 22 new specs, configure ALIAS_MAP with shortnames and kebab-case identifiers.

- [ ] **Step 2: Update complete-specs.test.ts**
Add test assertions verifying that all 22 new algorithms are properly registered in `DpStepEngine` and generate valid trace steps.

- [ ] **Step 3: Run full DP test suite**
Run: `npx vitest run src/algorithms/categories/dynamic-programming/`
Expected: ALL PASS.

- [ ] **Step 4: Commit**
```bash
git add src/algorithms/categories/dynamic-programming/
git commit -m "feat(dp): register all zuo dynamic programming specs and verify full test suite"
```

---
