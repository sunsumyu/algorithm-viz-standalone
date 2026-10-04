---
name: top-level-abstraction-compliance
description: "Audit and verify top-level abstraction compliance (YAML models + strategy engine + UniversalStageVisualizer). Use for architecture gating and compliance audits."
---

# 顶层抽象合规检查技能 (Top-Level Abstraction Compliance)

Top-level abstraction standards and automated gate test verification for all algorithm visualizers.

## Core Principles
1. **Single Source of Truth**: YAML models are the authoritative source for metadata, 4-stage code templates, and direction definitions.
2. **Strategy Pattern**: Core step generation logic is encapsulated in `IAlgorithmStrategy` (LOC < 120); renderers remain thin presentation adapters.
3. **Unified Host**: DP algorithms mount inside `UniversalStageVisualizer` (iframe-isolated sandbox).
4. **Bi-Version Synthesis**: When existing implementations conflict, merge strengths under primary ID with `aliases: [...]` (see [AGENTS.md](file:///f:/chain/algorithm-viz-standalone/AGENTS.md) §Bi-Version Synthesis).

---

## 1. Automated Gate Verification Commands

All checks evaluate exit codes (target: `exit code 0`):

```bash
# 1. 顶层抽象合规硬门禁（覆盖 DP & Greedy）
npx vitest run src/core/top-level-abstraction-compliance.test.ts

# 2. 策略引擎身材红线与防私有编译器门禁（LOC < 120）
npx vitest run src/core/strategies/top-level-abstraction.gate.test.ts

# 3. 全局 YAML 模型高保真门禁测试
npx vitest run src/core/universal-model-fidelity.test.ts
```

---

## 2. Three-Level Invariants

| 门禁级别 | 判定标准 | 拦截策略 |
| :--- | :--- | :--- |
| **L0：零退化锁死 (Zero-Regression)** | `LOCKED_TOP_LEVEL_ALGORITHMS` 锁定的算法必须具备 YAML 模型、Strategy 策略、`UniversalStageVisualizer` 宿主与四阶段双向演化 | 违规立即抛出致命错误，构建阻断 |
| **L1：遗留燃烧白名单 (Burndown Whitelist)** | 覆盖 `dynamic-programming` 与 `greedy`。新算法必须接入顶层架构，未登记在白名单的旧方言注册一律拒绝 | 燃烧只减不增，阻止未报备私造方言 |
| **L2：模型保真度 (Model Fidelity)** | 所有已注册 YAML 模型必须具备 `forward`/`reverse` 双向与 `stage-1` 到 `stage-4` 四阶段代码 | 缺失即红灯拦截 |

---

## 3. Compliance Workflow & Resolution

1. **Run Gates**: Execute `src/core/top-level-abstraction-compliance.test.ts`.
2. **Diagnose**: Match console errors to failure levels (L0 / L1 / L2).
3. **Structured Grilling**:
   - When facing legacy algorithm resolution choices, use `ask_question` to present structured options with a marked `(Recommended)` default and explicit trade-offs.
4. **Invoke Refactoring Skill**: For algorithm architecture migrations, activate `universal-dp-refactoring` for Tracer-Bullet pipeline execution (Phase 1–4).
5. **Re-Verify**: Confirm all gates exit with code 0.

---

## 4. Disclosed Reference Documentation

For detailed architectural background, compliance case studies, and migration strategies:
- [合规案例与迁移参考指南](file:///f:/chain/algorithm-viz-standalone/.agents/skills/top-level-abstraction-compliance/references/compliance-cases-and-migration.md)
