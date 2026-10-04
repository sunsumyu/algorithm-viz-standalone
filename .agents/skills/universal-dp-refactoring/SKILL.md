---
name: universal-dp-refactoring
description: "Standardize dynamic-programming algorithms against the YAML-driven architecture and strategy engine. Restricted to the dynamic-programming category."
---

# 通用动态规划算法重构规范 (Universal DP Refactoring Standard)

Standard procedures for refactoring algorithms in `dynamic-programming` to the YAML-driven model architecture and strategy engine (benchmarked on `unique-paths-ii`).

## Core Invariants
1. **Single Source of Truth**: Data-driven YAML models (`src/core/models/<id>.yaml`) declare stages, state formulas, and problem dimensions.
2. **Strategy Engine Delegation**: Algorithms delegate core execution to top-level strategy compilers (`LinearStepMatrixCompiler`, `KnapsackStepMatrixCompiler`, etc.); renderers remain lightweight adapters.
3. **Fail-Fast Architectural Gates**: Missing models or unregistered strategies throw immediately; resolve errors by authoring missing models, never by catch-and-suppress or fallback mocks.
4. **Bi-Version Synthesis**: If duplicates exist, synthesize legacy and modern strengths into a primary ID with `aliases: [...]` (see [AGENTS.md](file:///f:/chain/algorithm-viz-standalone/AGENTS.md) §Bi-Version Synthesis).

---

## 0. Hard-Fail Architectural Contracts

- **Throw on Missing Contracts**:
  Exceptions such as `[VisualizerAppController] 算法模型 "${id}" 未在仓储中找到` represent essential boundary defenses.
- **Fail-Fast Resolution**:
  Resolve missing model errors exclusively by authoring `src/core/models/<algorithm-id>.yaml`, registering statically in `AlgorithmModelRepository`, and implementing Stages 1–4 in the strategy engine.
- **Immutable Test Contracts**:
  Test assertions in `universal-model-fidelity.test.ts` and stage invariant gates are immutable. Turn failures green exclusively by completing the model and strategy implementation until `exit code 0`.

---

## 1. Tracer-Bullet Multi-Phase Pipeline

Execute DP refactoring through discrete phases with test verification, git commit, and context clear (`/clear`) after each phase:

1. **Pre-Flight Grilling (Grill Before Code)**:
   - Identify target compiler family (Grid / 1D / Knapsack / Dual-Sequence).
   - If resolving version synthesis, present structured options with `ask_question` and mark `(Recommended)`.
2. **Phase 1: Tracer Skeleton**:
   - Write YAML model defining Stage 3 tabulation.
   - Wire minimal strategy execution with `UniversalStageVisualizer`.
   - Pass single test to confirm end-to-end seam $\rightarrow$ Git Commit $\rightarrow$ `/clear`.
3. **Phase 2: Stage Evolution (Stages 1 & 2)**:
   - Implement Stage 1 brute-force recursion and Stage 2 memoized search.
   - Verify step density and zero line freezing gates $\rightarrow$ Git Commit $\rightarrow$ `/clear`.
4. **Phase 3: Space Optimization & Code Linkage (Stage 4)**:
   - Implement Stage 4 1D space optimization.
   - Bind `@step:` 1-based line anchors across 4 languages.
   - Verify strategy size limit (LOC < 120) $\rightarrow$ Git Commit $\rightarrow$ `/clear`.
5. **Phase 4: Full Gate Verification**:
   - Run verification suite to confirm zero regression.

---

## 2. 顺推与逆推核心不变式 (The Direction Invariant)

| 模式 ID | 模式名称 | 核心语义 | 代码与步进实现必须满足 |
| :--- | :--- | :--- | :--- |
| **`id: 'forward'`** | **顺推** | 从原点/前缀基底向最终目标推导 | - Stage 1/2: 从首部 `f(0, 0)` 开始递归；<br>- Stage 3: `for i = 1..N` 自底向上填表；<br>- 默认配置必须是 `defaultMode: 'forward'` |
| **`id: 'reverse'`** | **逆推** | 从末尾目标向子问题基底反推 | - Stage 1/2: 从末尾 `f(N-1, M-1)` 开始递归；<br>- Stage 3: `for i = N-1..0` 倒序填表 |

---

## 3. 渐进式参考手册导航 (Progressive Disclosure References)

Consult detailed domain specifications on demand via context pointers:

| 领域模块 | 对应参考文件 | 核心包含内容 |
| :--- | :--- | :--- |
| **实施流程与清单** | [step-by-step-workflow.md](./references/step-by-step-workflow.md) | 穿甲弹多阶段重构工序 (Phase 1~4)、统一宿主对齐铁律及交付前“六项核验清单” |
| **编译器抽象基类** | [compiler-invariants.md](./references/compiler-invariants.md) | 递归与填表抽象基类规约、分支展开多行规范、零跳步门禁及网格/双序列典型案例 |

---

## 4. 重构后的强制全量验证门禁

重构任何 DP 算法后，依次执行以下确定性自检命令：

```bash
# 1. 运行该算法专项测试套件
npx vitest run src/algorithms/categories/dynamic-programming/<cat>/<id>.test.ts

# 2. 运行顶层策略引擎单测与防跳步零跳步门禁
npx vitest run src/core/strategies/dp-stage-invariants.gate.test.ts
npx vitest run src/core/strategies/direction-divergence.gate.test.ts

# 3. 运行全局 YAML 模型高保真门禁测试
npx vitest run src/core/universal-model-fidelity.test.ts

# 4. 运行算法目录一致性新鲜度门禁
npx vitest run src/core/algorithm-catalog-indexer.test.ts

# 5. 全项目 TypeScript 类型检查（零编译报错）
npm run typecheck

# 6. 顶层抽象合规门禁（必须通过）
npx vitest run src/core/top-level-abstraction-compliance.test.ts
```
