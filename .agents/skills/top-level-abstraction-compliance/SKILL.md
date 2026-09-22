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

## 1. 合规检查清单（三层门禁）

### L1：架构合规（自动化可检）

这些检查项可以通过代码静态分析和运行时断言自动验证：

- [ ] **L1-1. DP 算法必须使用 UniversalStageVisualizer**
  - 检查：`manifest.Visualizer === UniversalStageVisualizer`
  - 违规案例：`target-sum-standard` 使用 `createDeclarativeVisualizer` 返回的自定义 Visualizer

- [ ] **L1-2. DP 算法必须有 YAML 模型**
  - 检查：`AlgorithmModelRepository.hasModel(id) === true`
  - 违规案例：`target-sum-standard` 无对应 YAML 文件

- [ ] **L1-3. DP 算法必须有策略实现**
  - 检查：`AlgorithmStrategyRegistry.has(id) === true`
  - 违规案例：`target-sum-standard` 无对应 Strategy 类

- [ ] **L1-4. 禁止在 DP 类目使用 registerDeclarativeAlgorithm**
  - 检查：静态代码扫描 `src/algorithms/categories/dynamic-programming/` 下的 `*-renderer.ts`，禁止出现 `registerDeclarativeAlgorithm` 调用
  - 违规案例：`dp-067/*-renderer.ts`、`knapsack-073/*-renderer.ts` 等

- [ ] **L1-5. 禁止先验注册遮蔽**
  - 检查：`dp-generated-renderers.ts` 中注册的 ID 不应与 `dynamic-programming/` 目录下的手写 `*-renderer.ts` 冲突
  - 违规案例：若 `target-sum` 同时在 `dp-generated-renderers.ts` 和 `target-sum-renderer.ts` 注册

### L2：功能合规（半自动）

这些检查项需要部分自动化 + 部分人工验证：

- [ ] **L2-1. YAML 模型必须包含 directions**
  - 检查：`model.directions.forward` 和 `model.directions.reverse` 存在且结构完整
  - 说明：即使算法本身没有真正的逆推写法，也必须声明 `reverse` 方向（可为空操作或展示逆向填表）

- [ ] **L2-2. YAML 模型必须包含四阶段**
  - 检查：`model.stages` 包含 `stage-1`、`stage-2`、`stage-3`、`stage-4`
  - 说明：每个阶段必须有 `type`、`name`、`desc`，以及 `code` 或 `variants`

- [ ] **L2-3. 顶栏 Stage 胶囊存在**
  - 检查：界面顶部正中央是否有 `[1 递归] [2 记忆化] [3 递推DP] [4 空间压缩]` 按钮
  - 说明：由 `UniversalStageVisualizer` 自动提供，合规算法无需额外实现

- [ ] **L2-4. 顺逆推切换按钮存在**
  - 检查：顶栏右侧是否有 `[➜ 顺推] [← 逆推]` 按钮
  - 说明：由 `UniversalStageVisualizer` 根据 YAML `directions` 自动提供

### L3：视觉合规（人工）

这些检查项需要人工对比黄金基准：

- [ ] **L3-1. Card 1 状态空间沙盘**
  - 检查：是否由 `StateSpacePresenter` / `GridVisualAdapter` 渲染 2D 状态网格，并具备动画卡通实体（小人）实时站位移动
  - 说明：非网格类算法（如序列 DP）可使用一维序列变体，但必须使用顶层 Presenter

- [ ] **L3-2. Card 2 业务专属看板**
  - 检查：是否为领域专属辅助看板（如双串比对看板、一维状态流动条或状态依赖树），绝无平铺的孤立数字卡
  - 说明：由 `MemoSlotVisualAdapter` / `DpTableVisualAdapter` / `RecursionTreeAdapter` 等顶层适配器提供

- [ ] **L3-3. 宿主一致性**
  - 检查：点击打开后，界面外观、交互手感与 LeetCode 115 不同的子序列（黄金基准）完全一致
  - 说明：包括 iframe 架构、lite/full 切换、state-router、键盘快捷键等

---

## 2. 自动化门禁测试

### 运行测试

```bash
# 运行顶层抽象合规门禁测试
npx vitest run src/core/top-level-abstraction-compliance.test.ts
```

### 测试内容

测试文件 `src/core/top-level-abstraction-compliance.test.ts` 包含以下断言：

1. **L1-1**: 所有 `dynamic-programming` 类目算法必须挂载 `UniversalStageVisualizer`
2. **L1-2**: 所有 `dynamic-programming` 算法必须在 `AlgorithmModelRepository` 注册
3. **L1-3**: 所有 `dynamic-programming` 算法必须在 `AlgorithmStrategyRegistry` 注册策略
4. **L1-4**: `dynamic-programming` 类目严禁调用 `registerDeclarativeAlgorithm`（静态代码扫描）
5. **L1-5**: 不存在手写 renderer 抢占顶层算法 ID
6. **L2-1**: 所有 YAML 模型必须定义 `forward` 和 `reverse` 方向
7. **L2-2**: 所有 YAML 模型必须定义 `stage-1` 到 `stage-4`

### 测试设计原则

- **报告违规而非阻断构建**：测试失败时输出详细违规清单，但不阻断 CI/CD（因历史违规较多）
- **分层检查**：L1 架构合规项为硬门禁（必须通过），L2/L3 为软门禁（警告但不阻断）
- **可扩展**：新增检查项时只需在测试文件中添加 `it` 块

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
