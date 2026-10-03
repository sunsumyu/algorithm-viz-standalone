---
name: top-level-abstraction-compliance
description: "用于对算法演示进行顶层抽象架构合规性门禁审计与测试（YAML 模型 + 策略引擎 + UniversalStageVisualizer）。仅在架构合规检查、门禁审计、发现违规或验证重构状态时使用；切勿在普通算法编码或实现新演示时误调用（日常开发请使用 algo-viz-authoring 或 universal-dp-refactoring）。"
---

# 顶层抽象合规检查技能 (Top-Level Abstraction Compliance)

本技能定义**所有算法演示必须遵守的顶层抽象架构标准**，并通过确定性自动化门禁测试（Vitest Exit Code）强制拦截违规与架构退化。

> **核心原则**：
> 1. **单一事实源**：YAML 模型是算法元数据、四阶段代码、顺逆推定义的唯一权威来源；
> 2. **策略模式**：核心推演逻辑封装在 `IAlgorithmStrategy` 中（LOC < 120），Renderer 仅做薄切片；
> 3. **统一宿主**：所有 DP 算法必须使用 `UniversalStageVisualizer`（iframe 隔离沙箱）；
> 4. **强制查重与双版本长处整合（死门禁）**：实现或重构前必须全库四维查重；遇同题双版本绝对禁止粗暴二选一删除，必须综合两版本长处（旧版输入交互/预设用例/成熟画布 + 新版讲义/四语言行号/阶段演化）深度整合，主 ID 留存并用 `aliases` 统合别名。

---

## 一、自动化门禁测试命令（确定性裁判）

所有检查均以命令行退出码为准，严禁伪绿灯：

```bash
# 1. 顶层抽象合规硬门禁（覆盖 DP & Greedy，零容忍）
npx vitest run src/core/top-level-abstraction-compliance.test.ts

# 2. 策略引擎身材红线与防私有编译器门禁（LOC < 120，防私有膨胀）
npx vitest run src/core/strategies/top-level-abstraction.gate.test.ts

# 3. 全局 YAML 模型高保真门禁测试
npx vitest run src/core/universal-model-fidelity.test.ts
```

---

## 二、三级合规门禁契约 (Three-Level Invariants)

| 门禁级别 | 判定标准 | 拦截策略 |
| :--- | :--- | :--- |
| **L0：零退化锁死 (Zero-Regression)** | `LOCKED_TOP_LEVEL_ALGORITHMS` 锁定的算法必须 100% 具备 YAML 模型、Strategy 策略、`UniversalStageVisualizer` 宿主与四阶段双向演化 | 违规立即抛出致命错误，构建阻断 |
| **L1：遗留燃烧白名单 (Burndown Whitelist)** | 覆盖 `dynamic-programming` 与 `greedy`。新算法必须接入顶层架构，未登记在白名单的旧方言注册一律拒绝 | 燃烧只减不增，严禁未报备算法私造方言 |
| **L2：模型保真度 (Model Fidelity)** | 所有已注册 YAML 模型必须 100% 具备 `forward`/`reverse` 双向与 `stage-1` 到 `stage-4` 四阶段代码 | 缺失即红灯拦截 |

---

## 三、合规闭环与违规处置流转

1. **执行检查**：运行 `src/core/top-level-abstraction-compliance.test.ts`。
2. **分析诊断**：若有报错，对照错误日志排查缺失的 YAML、Strategy 或非法旧注册。
3. **加载重构技能**：涉及算法架构迁移时，激活 `universal-dp-refactoring` 技能进行标准四步法重构。
4. **重新核验**：再次运行门禁测试，直至全套命令通过。

---

## 四、渐进式详细参考库

架构背景、详细合规与违规对比案例（如 `unique-paths` vs `target-sum-standard` / `knapsack-073`）及治理方案，详见：
- [合规案例与迁移参考指南](file:///f:/chain/algorithm-viz-standalone/.agents/skills/top-level-abstraction-compliance/references/compliance-cases-and-migration.md)
