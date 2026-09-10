# 算法代码高亮语义映射与模板配置化改造计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Spec 语义行号到 AnchorMap 的通用模板自动桥接管道，彻底消除代码高亮越界及人工硬编码脆弱性，修复 LC 2458 与 LC 2322 高亮错位与越界 Bug。

**Architecture:** 通过在 `model-repository.ts` 中构建自动语义行桥接管道，将所有 `AlgorithmSpec.semanticLines` 无缝转换为各演化阶段与变体的标准 `anchorMap`；修正 `height-removal-queries` 与 `minimum-score-after-removals` 的规范行号与策略兜底；在测试套件中加入越界安全断言扫描。

**Tech Stack:** TypeScript, Vitest, Universal Stage Engine.

## Global Constraints

- 默认语言以 `java` 为准，`anchorMap` 解析需准确对齐 Java 代码行号。
- 向下兼容已定义 `@step:` 标签的静态模板。
- 所有执行器生成步骤的 `step.line` 必须 `<= codeLines.length`，严禁越界。

---

### Task 1: 修正 Spec 语义行号与策略兜底行号

**Files:**
- Modify: `src/algorithms/categories/dynamic-programming/specs/tree/height-removal-queries.spec.ts`
- Modify: `src/algorithms/categories/dynamic-programming/specs/tree/minimum-score-after-removals.spec.ts`
- Modify: `src/core/strategies/tree-dp-strategy.ts`

- [ ] **Step 1: 修正 `height-removal-queries.spec.ts` 中的 `semanticLines`**
  - 将 `stateTransfer.java` 补齐第 17 行（`ans[k] = Math.max(...)`）。
  - 将 `returnResult.java` 修正为 19（对应 `return ans;`）。
- [ ] **Step 2: 修正 `minimum-score-after-removals.spec.ts` 中的 `semanticLines`**
  - 将 `returnResult.java` 修正为 34（对应 Java `return ans;`）。
  - 将 `stateTransfer.java` 修正为包含 31（`ans = Math.min(...)`）。
- [ ] **Step 3: 修正 `tree-dp-strategy.ts` 中的硬编码兜底行号**
  - `compileHeightRemovalQueries`: Step 1 -> 8, Step 2 -> 17, Step 3 -> 19。
  - `compileMinimumScoreAfterRemovals`: Step 1 -> 3, Step 2 -> 31, Step 3 -> 34。

---

### Task 2: 建立 Spec 语义行号到 AnchorMap 的自动注入管道

**Files:**
- Modify: `src/core/model-repository.ts`

- [ ] **Step 1: 实现 `bridgeSemanticLinesToAnchorMap` 转换工具函数**
  - 支持将 `spec.semanticLines` 中 `entry`, `guard`, `init`, `stateTransfer`, `returnResult` 安全转换为 `{ entry, guard, init, transfer, return }` 形式的 `anchorMap`。
- [ ] **Step 2: 在 `AlgorithmModelRepository.synthesizeFromSpec` 与阶段编译中注入自动生成的 `anchorMap`**
  - 若 `StageCodeCompiler` 没有提供带标签的模板，且 `compiled.anchorMap` 为空，自动注入转换后的 `anchorMap`。

---

### Task 3: 自动化测试套件与安全守护断言

**Files:**
- Modify: `src/core/model-repository.test.ts`
- Modify: `src/algorithms/categories/dynamic-programming/specs/tree/tree-specs.test.ts`

- [ ] **Step 1: 在 `model-repository.test.ts` 中验证 `height-removal-queries` 的 `anchorMap` 自动提取成功**
  - 断言 `anchorMap.entry === 8`、`anchorMap.transfer === 17`、`anchorMap.return === 19`。
- [ ] **Step 2: 在 `tree-specs.test.ts` 中验证步骤行号有效性**
  - 断言 `TreeDpStrategy.generateSteps` 生成的所有 `step.line` 均在合法范围内（1..28），第 3 步行号为 19。
- [ ] **Step 3: 增加全量模型高亮行号无越界守护测试**
  - 遍历所有注册模型，确保不存在任何越界行号。
