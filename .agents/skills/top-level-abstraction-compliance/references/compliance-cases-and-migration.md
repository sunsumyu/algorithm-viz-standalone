# 顶层抽象合规案例与迁移参考指南 (Compliance Cases & Migration Reference)

本文件是 `top-level-abstraction-compliance` 技能的按需参考手册，详细记录架构背景、典型合规与违规对比案例及迁移处理细节。

---

## 1. 架构历史与为什么需要合规检查？

历史上，算法演示存在两种并行架构：

| 架构 | 来源 | 特征 | 问题 |
|---|---|---|---|
| **顶层抽象（合规）** | `dp-generated-renderers.ts` + `unique-paths-renderer.ts` | YAML 模型 + Strategy + UniversalStageVisualizer (iframe) | 需要完整接入三层架构，保证 UI/UX 极致一致与全功能复用 |
| **课族方言（违规）** | `knapsack-073/*-renderer.ts` 等 | `createDeclarativeVisualizer` + 手写步骤生成器 + 自定义 DOM 渲染 | 脱离顶层体系，UI/UX 割裂，无法复用顶层能力（顺逆推、Stage 1~4 演化、双卡片联动等） |

合规门禁的核心使命：**无条件阻止新的违规注册产生，逐步受控燃烧迁移历史违规算法**。

---

## 2. 典型合规与违规案例对比

### 2.1 黄金合规标杆：unique-paths (不同路径)
- **YAML 模型**：`src/core/models/unique-paths.yaml`（完整具备 `stage-1` 到 `stage-4` 四阶段代码与 `forward`/`reverse` 双向定义）
- **策略引擎**：`src/core/strategies/grid-unique-paths-strategy.ts`（轻量身材，只做入参解析与编译器调度）
- **编译器分发**：接入统一领域编译器 `GridUniquePathsCompiler`
- **宿主挂载**：`src/algorithms/categories/dynamic-programming/dp-generated-renderers.ts`（通过 `registerDemo`）
- **Visualizer**：统一挂载 `UniversalStageVisualizer`（iframe 沙箱隔离容器）

### 2.2 典型违规案例：target-sum-standard（待迁移）
- **现状**：调用旧方言 `createDeclarativeVisualizer` + 私有手写步骤生成逻辑。
- **违规项**：
  - 缺失顶层 YAML 模型；
  - 缺失 `IAlgorithmStrategy` 策略适配器；
  - 缺失 `UniversalStageVisualizer` 宿主挂载；
  - 无顺逆推双向支持；
  - 表现层存在私有样式污染。
- **治理方案**：创建 `target-sum.yaml` 与 `target-sum-strategy.ts`（接入 `KnapsackStepMatrixCompiler`），挂载至 `dp-generated-renderers.ts` 并加入 `LOCKED_TOP_LEVEL_ALGORITHMS`。

### 2.3 典型违规案例：knapsack-073 课族（批量待迁移）
- **涉及文件**：`knapsack-073/*-renderer.ts`（包含 8 个背包变种算法）
- **违规项**：未在 `AlgorithmModelRepository` 与 `AlgorithmStrategyRegistry` 注册，单题私造闭包状态。
- **治理方案**：归纳为背包族（`KnapsackStepMatrixCompiler`），逐个通过通用适配器进行顶层接入。

---

## 3. 违规诊断与阶梯治理矩阵

| 违规等级 | 严重度 | 现象与判定 | 治理行动 |
| :--- | :--- | :--- | :--- |
| **L0 级（锁定退化）** | **致命 (Fatal)** | 已被 `LOCKED_TOP_LEVEL_ALGORITHMS` 锁定的算法被篡改、删减 YAML 或退回旧方言 | 门禁立即红灯阻断构建（Exit Code 1），立即还原被锁定的顶层接入与 YAML 声明 |
| **L1 级（非法私造）** | **高危 (High)** | 新增算法未在遗留燃烧白名单，且未接入顶层 YAML + 策略架构 | 立即拒绝 PR/提交，按 `universal-dp-refactoring` 规范接入统一核心编译器 |
| **L2 级（模型残缺）** | **中度 (Medium)** | YAML 模型缺少 `forward`/`reverse` 双向或缺少 4 阶段声明 | 依据名师讲义补齐四阶段代码与双向状态演化数据 |

---

## 4. 与 universal-dp-refactoring 技能的联动流转

```
[运行门禁: top-level-abstraction-compliance]
                   │
                   ▼
       发现违规项 / 待迁移算法？
        ├── 否 ──► 保持零退化绿灯，流程结束
        └── 是 ──► 转入 [universal-dp-refactoring]
                        │
                        ▼
                1. 建立 YAML 模型
                2. 实现 Strategy 适配器
                3. 统一编译器调度
                4. UniversalStageVisualizer 挂载
                        │
                        ▼
        [重新触发: top-level-abstraction-compliance 门禁核验]
```
