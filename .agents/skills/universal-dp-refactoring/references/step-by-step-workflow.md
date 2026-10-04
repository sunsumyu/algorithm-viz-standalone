# 动态规划规范实施多阶段工序与交付前六项核验清单

本文件是 `universal-dp-refactoring` 技能的按需参考手册，基于 **《掌握AI编码》第三章高维规划与穿甲弹工序（Tracer Bullet Pipeline）** 制定，指导如何安全、增量地将 DP 算法迁移至顶层架构。

---

## 一、高维规划：穿甲弹多阶段重构工序 (Multi-Phase Tracer Pipeline)

遵循 **Phase 1~4 增量穿甲弹流水线 (Incremental Tracer Pipeline)**，单次会话聚焦单个阶段（Kanban WIP=1），每阶段完成后执行测试断言、Git 提交并清空会话（`/clear`）：

```
[Phase 1: 穿甲弹刺穿] 最小表递推(Stage 3)骨架打通 ──► 单测绿灯 ──► Commit ──► 🧹 /clear
                                                                            │
[Phase 2: 递归与记忆化] 扩展 Stage 1(暴力递归) + Stage 2(记忆化) ──► 测试 ──► Commit ──► 🧹 /clear
                                                                            │
[Phase 3: 空间优化与四语言] 扩展 Stage 4(一维压缩) + 四语言行号联动 ──► 门禁 ──► Commit ──► 🧹 /clear
                                                                            │
[Phase 4: 全景门禁与核查] 顺逆推双向核验 + 6 大硬门禁 + 1920x1080 视口 ──► 验收合流
```

---

### Phase 1：第一发穿甲弹（端到端最简表递推骨架刺穿）

**目标**：打通领域模型 ➔ 策略分发 ➔ 统一宿主渲染的完整链路，验证架构接缝零摩擦。

1. **创建 YAML 黄金模型骨架**（`src/core/models/<algorithm-id>.yaml`）：
   - 填充基础元数据（`id`, `name`, `category`, `difficulty`, `learningGoal`）；
   - 定义 `defaultParams` 与 `directions`（`forward` 顺推与 `reverse` 逆推）；
   - **首发穿甲**：先声明 `stage-3`（严格表递推）的完整定义与代码映射。
2. **在仓储注册**：在 `src/core/model-repository.ts` 中注册该 YAML 模型。
3. **实现最小策略切片**：
   - 继承或适配核心编译器（如网格类继承 `GridUniquePathsCompiler`，背包类接入 `KnapsackStepMatrixCompiler`）；
   - 仅需先跑通 `compileStage3`（自底向上严格表递推）；
   - 在 `src/core/strategies/index.ts` 中注册策略实例。
4. **挂载统一宿主与清理旧注册**：
   - 在 `src/algorithms/categories/dynamic-programming/dp-generated-renderers.ts` 中通过 `registerDemo` 挂载 `UniversalStageVisualizer`；
   - 彻底删除或注销任何旧有的 `registerDeclarativeAlgorithm` 或私有 `*-renderer.ts`。
5. **阶段验收门禁**：
   ```bash
   npx vitest run src/core/universal-model-fidelity.test.ts
   npm run meta:sync
   npm run typecheck
   ```
   *验证通过后立即 Git Commit，执行 `/clear` 进入下一阶段。*

---

### Phase 2：阶段扩展（暴力递归与记忆化搜索演化）

**目标**：补全状态依赖展开树与备忘录剪枝逻辑。

1. **在 YAML 模型中补齐**：
   - `stage-1`：纯暴力递归（函数签名、递归基、分支展开多行与行号）；
   - `stage-2`：记忆化搜索（Cache 查表行号、剪枝标记、重叠子问题高亮）。
2. **在策略引擎中实现**：
   - 实现 `compileStage1or2`，确保递归深度与树节点 ID 规范；
   - 必须通过 `dp-stage-invariants.gate.test.ts`（防跳步、零跳步门禁）。
3. **阶段验收门禁**：
   ```bash
   npx vitest run src/core/strategies/dp-stage-invariants.gate.test.ts
   ```
   *验证通过后立即 Git Commit，执行 `/clear`。*

---

### Phase 3：高级优化（空间压缩与四语言精准行号绑定）

**目标**：补齐 Stage 4 优化与多语言严密联动。

1. **在 YAML 模型中补齐**：
   - `stage-4`：一维空间压缩（滚动数组/单一数组、暂存寄存器如 `leftUp` 状态覆盖保护）；
   - 四语言源码面板（`java`, `cpp`, `python`, `javascript`），行号采用 1-based 局部相对行号。
2. **策略引擎与编译器收敛**：
   - 策略类身材必须严格控制在 **LOC < 120 行**，核心状态矩阵必须委托至统一抽象编译器。
3. **阶段验收门禁**：
   ```bash
   npx vitest run src/core/strategies/top-level-abstraction.gate.test.ts
   ```

---

### Phase 4：全景门禁核查与交付验收

执行六项视觉与架构刚性核验清单，确保全库零退化。

---

## 二、交付前“六项视觉与架构刚性核验清单”（Checklist Gate）

在宣布重构完成前，**必须逐项核对并输出以下 6 项状态**：

- [ ] **1. 排除外围框架**：确认代码中未调用 `registerDeclarativeAlgorithm`，且无任何残留 `*-renderer.ts` 抢占 ID；
- [ ] **2. 顶栏 Stage 胶囊控制**：界面顶部正中央是否为规范的 Stage 胶囊按钮（`[1 递归]` `[2 记忆化]` `[3 递推DP / 二维DP]` `[4 空间压缩]`），绝无下拉菜单；
- [ ] **3. 双向推演控制**：顶栏右侧是否具备 **`[➜ 顺推]` 与 `[← 逆推]`** 独立切换按钮；
- [ ] **4. Card 1 状态空间沙盘**：是否由 `StateSpacePresenter` / `GridVisualAdapter` 渲染 2D 状态网格，并具备动画卡通实体（小人）实时站位移动；
- [ ] **5. Card 2 业务专属看板**：是否为领域专属辅助看板（如双串比对看板、一维状态流动条或状态依赖树），绝无平铺的孤立数字卡；
- [ ] **6. 宿主一致性**：点击打开后，界面外观、交互手感与 LeetCode 115 不同的子序列（黄金基准）完全一致！
