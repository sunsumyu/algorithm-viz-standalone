# Universal DP Model & Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于「不同路径 II」黄金基准建立统一的双串/网格动态规划顶层策略引擎与 YAML 驱动模型，并将最长公共子序列 (LCS) 全面迁移收敛，彻底消灭冗余的大泥球渲染器与状态倒错 bug。

**Architecture:** 
1. 算法声明层采用 YAML 模型 (`src/core/models/longest-common-subsequence.yaml`)，定义严格对偶的方向体系（顺推 `1→N` 默认 vs 逆推 `N→0` 倒序）与四阶段演化元数据；
2. 顶层策略引擎 (`UniversalStringDpStrategy`) 实现 `IAlgorithmStrategy`，统一生成 4 阶段的 `UniversalStep` 步进流，严格管控状态机生命周期 (`null` 未计算防御) 与调用栈安全绳连线；
3. 业务渲染器 (`longest-common-subsequence-renderer.ts`) 缩减至 30 行以内的极简注册声明，挂载通用画板容器。

**Tech Stack:** TypeScript, Vitest, YAML (via js-yaml/YamlModelLoader), Tauri desktop environment.

## Global Constraints

- **Single Source of Truth**: 严禁在业务渲染器中手写重复的 3000 行步骤推导，必须由 YAML 模型与通用策略引擎驱动。
- **Contract Integrity**: 网格初始未计算单元格必须为 `null`（白底虚线框 `-`），严禁预填 `0`；计算中为 `isActive` 且值为 `null`，转移完成写入具体数值后点亮为 `isDone`（绿色）。
- **Direction Duality**: `forward` 顺推必须为经典前缀模型（`1→N` 顺向填表，目标 `dp[n][m]`）；`reverse` 逆推必须为后缀模型（`N→0` 倒序填表，目标 `dp[0][0]`）。
- **Zero Regression**: 必须保证 `dp-067.test.ts` 全量测试、`npm run typecheck`、以及 `algorithm-catalog-indexer.test.ts` 门禁 100% 绿色通过。

---

### Task 1: 创建 LCS 黄金 YAML 规范模型 (`longest-common-subsequence.yaml`)

**Files:**
- Create: `src/core/models/longest-common-subsequence.yaml`
- Test: `src/core/universal-model-fidelity.test.ts`

**Interfaces:**
- Produces: `IYamlAlgorithmModel` 兼容结构，包含 `id`, `name`, `directions`, `stages` (1~4 阶段)，以及对应的多语言代码块。

- [x] **Step 1: 编写模型保真度验证测试**

在 `src/core/universal-model-fidelity.test.ts` 中增加针对 `longest-common-subsequence` 的 YAML 模型解析断言：

```typescript
it('longest-common-subsequence 模型应严格遵循黄金基准结构', () => {
  const model = YamlModelLoader.load('longest-common-subsequence');
  expect(model).toBeDefined();
  expect(model.id).toBe('longest-common-subsequence');
  expect(model.directions?.forward).toBeDefined();
  expect(model.directions?.reverse).toBeDefined();
  expect(model.stages?.['stage-1']).toBeDefined();
  expect(model.stages?.['stage-2']).toBeDefined();
  expect(model.stages?.['stage-3']).toBeDefined();
  expect(model.stages?.['stage-4']).toBeDefined();
});
```

- [x] **Step 2: 运行测试以确认其失败**

运行：`npx vitest run src/core/universal-model-fidelity.test.ts`  
预期：FAIL（提示模型尚未创建或找不到文件）

- [x] **Step 3: 创建完整 YAML 模型文件**

在 `src/core/models/longest-common-subsequence.yaml` 中编写完整规范，严格对齐 `unique-paths-ii.yaml` 格式：
- `defaultParams`: `s1: "abcde"`, `s2: "ace"`
- `directions`:
  - `forward`: `label: "顺推 (1→N 正序)"`, 前缀 DP 模型，目标在 `dp[n][m]`
  - `reverse`: `label: "逆推 (N→0 倒序)"`, 后缀 DP 模型，目标在 `dp[0][0]`
- `stages`: 包含 stage-1 (递归), stage-2 (记忆化), stage-3 (严格二维表), stage-4 (一维滚动 + leftUp 暂存) 及其 Java/CPP/Python/JS 代码和代码锚点。

- [x] **Step 4: 运行测试确认通过**

运行：`npx vitest run src/core/universal-model-fidelity.test.ts`  
预期：PASS

- [x] **Step 5: 提交代码**

```bash
git add src/core/models/longest-common-subsequence.yaml src/core/universal-model-fidelity.test.ts
git commit -m "feat(dp): add longest-common-subsequence golden yaml model"
```

---

### Task 2: 研发顶层双串 DP 通用策略引擎 (`UniversalStringDpStrategy`)

**Files:**
- Create: `src/core/strategies/universal-string-dp-strategy.ts`
- Create: `src/core/strategies/universal-string-dp-strategy.test.ts`
- Modify: `src/core/strategies/index.ts`

**Interfaces:**
- Consumes: `IAlgorithmStrategy`, `StageExecutionParams`, `UniversalStep`, `createUncalculatedDpGrid`
- Produces: `UniversalStringDpStrategy` 类，支持 `canHandle(modelId: string)` 与 `generateSteps(...)`

- [x] **Step 1: 编写通用策略引擎的单元测试**

创建 `src/core/strategies/universal-string-dp-strategy.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { UniversalStringDpStrategy } from './universal-string-dp-strategy';
import { YamlModelLoader } from '../yaml-model-loader';

describe('UniversalStringDpStrategy', () => {
  const strategy = new UniversalStringDpStrategy('longest-common-subsequence');
  const model = YamlModelLoader.load('longest-common-subsequence');

  it('Stage 3 顺推时必须初始为 null，按 1->N 计算且最终到达目标 dp[n][m]', () => {
    const steps = strategy.generateSteps(model, {
      stage: 3,
      direction: 'forward',
      s1: 'abcde',
      s2: 'ace',
    });
    expect(steps.length).toBeGreaterThan(0);
    // 初始第 0 步未计算单元格必须为 null
    const step0 = steps[0];
    expect(step0.dpTable[1][1]).toBeNull();
    // 最终解为 3
    const last = steps[steps.length - 1];
    expect(last.currentVal).toBe(3);
  });
});
```

- [x] **Step 2: 运行测试确认其失败**

运行：`npx vitest run src/core/strategies/universal-string-dp-strategy.test.ts`  
预期：FAIL（找不到 `universal-string-dp-strategy`）

- [x] **Step 3: 实现 `UniversalStringDpStrategy`**

在 `src/core/strategies/universal-string-dp-strategy.ts` 中实现：
1. `generateStage1or2`：统一生成带有 `activeStack` 安全绳连线的 DFS 递归树，遇字符匹配走对角线分支，不匹配走 max 分支；stage 2 自动生成带 memo 缓存命中剪枝帧；
2. `generateStage3`：
   - 强制使用 `createUncalculatedDpGrid(n+1, m+1)` 初始化全表为 `null`；
   - 根据 `direction` 执行：
     - `forward`：基底初始化 `(0, *)` 与 `(*, 0)` 为 0；双层循环 `i: 1..n`, `j: 1..m`；
     - `reverse`：基底初始化 `(n, *)` 与 `(*, m)` 为 0；双层循环 `i: n-1..0`, `j: m-1..0`；
   - 转移前单元格状态为 `isActive` 且值为 `null`，转移计算后写入数值并变更为 `isDone`；
3. `generateStage4`：统一一维空间压缩与 `leftUp` 寄存器备份步进。
并在 `src/core/strategies/index.ts` 中导出并注册。

- [x] **Step 4: 运行测试确认通过**

运行：`npx vitest run src/core/strategies/universal-string-dp-strategy.test.ts`  
预期：PASS

- [x] **Step 5: 提交代码**

```bash
git add src/core/strategies/universal-string-dp-strategy.ts src/core/strategies/universal-string-dp-strategy.test.ts src/core/strategies/index.ts
git commit -m "feat(core): implement UniversalStringDpStrategy for two-string DP models"
```

---

### Task 3: 改造 LCS 渲染器，全面收敛至顶层策略与 YAML 驱动

**Files:**
- Modify: `src/algorithms/categories/dynamic-programming/dp-067/longest-common-subsequence-renderer.ts`
- Test: `src/algorithms/categories/dynamic-programming/dp-067/dp-067.test.ts`

**Interfaces:**
- Consumes: `UniversalStringDpStrategy`, `longest-common-subsequence.yaml`, `registerAlgorithm`
- Produces: 极简轻量级算法声明（将 3125 行巨型文件精简为清晰优雅的代理注册）

- [ ] **Step 1: 验证现有 `dp-067.test.ts` 基线通过状态**

运行：`npx vitest run src/algorithms/categories/dynamic-programming/dp-067/dp-067.test.ts`  
预期：PASS (66/66 tests)

- [ ] **Step 2: 改造 `longest-common-subsequence-renderer.ts` 委托顶层引擎**

在 `longest-common-subsequence-renderer.ts` 中：
1. 载入 `longest-common-subsequence.yaml`；
2. 注册 `UniversalStringDpStrategy('longest-common-subsequence')`；
3. 将现有的 `buildLcsStage1Steps`、`buildLcsStage2Steps`、`buildLcsStage3Steps`、`buildLcsStage4Steps` 委托至顶层策略引擎的 `generateSteps`，保证导出函数签名与测试完全向后兼容；
4. 挂载极简声明式 Visualizer，移除内部冗余的手写循环与状态矩阵逻辑。

- [ ] **Step 3: 运行 `dp-067.test.ts` 确认全量通过**

运行：`npx vitest run src/algorithms/categories/dynamic-programming/dp-067/dp-067.test.ts`  
预期：PASS (66/66 tests 完全通过)

- [ ] **Step 4: 提交代码**

```bash
git add src/algorithms/categories/dynamic-programming/dp-067/longest-common-subsequence-renderer.ts
git commit -m "refactor(dp-067): converge LCS renderer to UniversalStringDpStrategy and YAML model"
```

---

### Task 4: 全局门禁验证与质量验收

**Files:**
- Verify: 全库测试与类型安全

- [ ] **Step 1: 全库 TypeScript 类型检查**

运行：`npm run typecheck`  
预期：`tsc -b --noEmit` 0 errors

- [ ] **Step 2: 算法目录新鲜度与元数据完整性门禁**

运行：`npx vitest run src/core/algorithm-catalog-indexer.test.ts`  
预期：PASS (3/3 tests)

- [ ] **Step 3: 提交并准备向用户汇报验收**

```bash
git commit --allow-empty -m "chore: verify universal DP model implementation across all quality gates"
```
