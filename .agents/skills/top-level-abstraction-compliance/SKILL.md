---
name: top-level-abstraction-compliance
description: "检查所有算法演示是否符合顶层抽象架构标准（YAML 模型 + 策略引擎 + UniversalStageVisualizer），确保实现统一和设计原则遵守。"
---

# 顶层抽象合规检查技能 (Top-Level Abstraction Compliance)

本技能定义了**所有算法演示必须遵守的顶层抽象架构标准**，并提供自动化门禁测试来验证合规性。

> **核心原则**：
> 1. **单一事实源**：YAML 模型是算法元数据、四阶段代码、顺逆推定义的唯一权威来源；
> 2. **策略模式**：核心推演逻辑封装在 `IAlgorithmStrategy` 实现中，Renderer 只做薄切片；
> 3. **统一宿主**：所有 DP 算法必须使用 `UniversalStageVisualizer`（iframe 架构）；
> 4. **UI 一致性**：顶栏 Stage 胶囊、顺逆推切换、Card 1/2 渲染必须与黄金基准一致。

---

## 0. 为什么需要合规检查？

历史上，算法演示存在两种并行架构：

| 架构 | 来源 | 特征 | 问题 |
|---|---|---|---|
| **顶层抽象（合规）** | `dp-generated-renderers.ts` + `unique-paths-renderer.ts` | YAML 模型 + Strategy + UniversalStageVisualizer (iframe) | 需要完整接入三层架构 |
| **课族方言（违规）** | `knapsack-073/*-renderer.ts` 等 | `createDeclarativeVisualizer` + 手写步骤生成器 + 自定义 DOM 渲染 | 脱离顶层体系，UI/UX 不一致，无法复用顶层能力（顺逆推、lite/full 切换等） |

合规检查的目的：**发现并阻止新的违规注册，逐步迁移历史违规算法**。

---

## 1. 合规检查清单（全库硬门禁）

门禁测试位于 `src/core/top-level-abstraction-compliance.test.ts`，**采用 100% 硬断言拦截，严禁使用软断言（toBeGreaterThanOrEqual(0)）与伪绿灯**：

### L0：已锁定顶层抽象算法零退化硬门禁 (Zero-Regression Lock)
针对全库已完成重构锁定的算法（含 DP 核心 30+ 题及贪心已迁移的 `can-jump`, `jump-game-ii`, `min-taps`, `min-arrows`, `non-overlapping`, `merge-intervals`, `partition-labels`, `best-time-stock` 等）：
- [x] **L0-1**: 必须在 `AlgorithmModelRepository` 注册 YAML 模型；
- [x] **L0-2**: 必须在 `AlgorithmStrategyRegistry` 注册 Strategy 策略适配器；
- [x] **L0-3**: 必须挂载统一宿主 `UniversalStageVisualizer`；
- [x] **L0-4**: YAML 模型必须 100% 具备 `forward` 和 `reverse` 双向定义；
- [x] **L0-5**: YAML 模型必须 100% 具备 `stage-1` 到 `stage-4` 四阶段声明；
- [x] **L0-6**: 严禁调用 `registerDeclarativeAlgorithm` 等旧方言。
> **违规判定**：以上任何一项失败，门禁测试立即抛出致命错误并退出构建（Exit Code 1）。

### L1：全库遗留未迁移算法受控燃烧白名单 (Burndown Whitelist Gate)
- 覆盖 **`dynamic-programming` 与 `greedy`（贪心）全类目**；
- 维护严格的 `KNOWN_LEGACY_UNMIGRATED` 清单；
- **新算法硬拦截**：任何未登记在遗留白名单中、且未接入顶层抽象的算法，直接判定为非法私有接入，门禁立即红灯拦截！
- **燃烧只减不增**：算法一旦重构完成，立即移出遗留白名单并加入 `LOCKED_TOP_LEVEL_ALGORITHMS` 永久锁死，严禁反弹！

### L2：全库 YAML 模型完备性硬门禁 (Model Fidelity Gate)
- 全库所有已注册 YAML 模型必须 100% 具备 `forward`/`reverse` 双向与 `stage-1` 到 `stage-4` 四阶段。

---

## 2. 自动化门禁测试命令

```bash
# 运行顶层抽象合规硬门禁（覆盖 DP & Greedy，零容忍）
npx vitest run src/core/top-level-abstraction-compliance.test.ts

# 运行深模块架构与策略身材红线门禁（LOC < 120，防私有编译器膨胀）
npx vitest run src/core/strategies/top-level-abstraction.gate.test.ts
```

---

## 3. 违规处理流程

当合规检查发现违规时，按以下流程处理：

### 步骤 1：确认违规类型

- **L1 违规**：必须立即修复（架构级问题）
- **L2 违规**：计划内修复（功能缺失）
- **L3 违规**：长期迁移（视觉一致性）

### 步骤 2：加载重构技能

对于需要迁移的算法，加载 `universal-dp-refactoring` 技能：

```
加载技能：universal-dp-refactoring
```

该技能提供完整的重构指南，包括：
- YAML 模型创建规范
- 策略引擎实现模板
- 顶层宿主挂载步骤
- 旧文件清理流程

### 步骤 3：执行重构

按照 `universal-dp-refactoring` 技能的四步法执行：
1. 创建 YAML 黄金模型文件
2. 实现或适配顶层策略引擎
3. 遵循顺推与逆推不变式
4. 顶层统一舞台挂载与旧文件清理

### 步骤 4：重新运行合规检查

重构完成后，重新运行合规测试确认通过：

```bash
npx vitest run src/core/top-level-abstraction-compliance.test.ts
```

---

## 4. 参考案例

### 合规案例：unique-paths（黄金基准）

- **YAML 模型**：`src/core/models/unique-paths.yaml`
- **策略引擎**：`src/core/strategies/grid-unique-paths-strategy.ts`
- **宿主挂载**：`src/algorithms/categories/dynamic-programming/dp-generated-renderers.ts`（通过 `registerDemo`）
- **Visualizer**：`UniversalStageVisualizer`（iframe 架构）

### 违规案例：target-sum-standard（待迁移）

- **现状**：使用 `createDeclarativeVisualizer` + 手写步骤生成器
- **违规项**：L1-1、L1-2、L1-3、L2-1、L2-2、L3-1、L3-2、L3-3
- **迁移计划**：需创建 `target-sum.yaml`、`target-sum-strategy.ts`，并挂载到 `UniversalStageVisualizer`

### 违规案例：knapsack-073 课族（批量待迁移）

- **涉及文件**：`knapsack-073/*-renderer.ts`（共 8 个算法）
- **违规项**：L1-1、L1-4
- **迁移计划**：逐个创建 YAML 模型和策略，统一挂载到顶层

---

## 5. 与 universal-dp-refactoring 技能的关系

| 技能 | 定位 | 使用时机 |
|---|---|---|
| **top-level-abstraction-compliance** | **检查**：验证算法是否符合顶层抽象标准 | 新增算法时、重构完成后、定期审计时 |
| **universal-dp-refactoring** | **重构**：提供将违规算法迁移到顶层抽象的完整指南 | 发现违规后、执行迁移时 |

**工作流**：
1. 运行 `top-level-abstraction-compliance` 检查 → 发现违规
2. 加载 `universal-dp-refactoring` 技能 → 执行重构
3. 重新运行 `top-level-abstraction-compliance` → 确认合规

---

## 6. 交付前强制验证

在向用户汇报任何一个 DP 算法重构完成前，**必须**运行以下命令，全部返回 Exit code 0 方可宣布完成：

```bash
# 1. 运行顶层抽象合规门禁测试
npx vitest run src/core/top-level-abstraction-compliance.test.ts

# 2. 运行该算法专项测试套件
npx vitest run src/algorithms/categories/dynamic-programming/<cat>/<id>.test.ts

# 3. 运行顶层策略引擎单测与防跳步零跳步门禁
npx vitest run src/core/strategies/dp-stage-invariants.gate.test.ts
npx vitest run src/core/strategies/direction-divergence.gate.test.ts

# 4. 运行全局 YAML 模型高保真门禁测试
npx vitest run src/core/universal-model-fidelity.test.ts

# 5. 运行算法目录一致性新鲜度门禁
npx vitest run src/core/algorithm-catalog-indexer.test.ts

# 6. 全项目 TypeScript 类型检查（零编译警告）
npm run typecheck
```

**任何一项失败都意味着重构未完成，严禁交付。**
