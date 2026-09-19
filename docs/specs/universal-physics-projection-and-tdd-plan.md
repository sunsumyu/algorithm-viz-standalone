# 通用物理语义投影与测试驱动开发（TDD）完整重构方案

## 1. 架构目标与核心原则

在算法可视化系统中，长久以来存在一个两难矛盾：
- **纯通用工具（如 algorithm-visualizer）**：只有通用的数组/网格变色，缺少生动的物理教学语义（如小人跳台阶、路径探索、决策对比）。
- **纯手写实现**：每个算法手动编写数以千计的 `steps.push(...)` 和像素坐标计算，导致开发维护极其痛苦，频繁发生**小人停在 0 阶不跳**、**Card 2 决策数据丢失**、**行高亮偏差**、**顺逆推倒挂**等绑定 Bug。

本项目立足于三大原则：
1. **测试驱动开发（TDD）**：门禁先行。任何算法重构必须先编写无头物理断言测试，红灯后再实现策略与编译器，绿灯即交付。
2. **零像素坐标**：算法层和编译器只输出离散拓扑数据（如 `slot 0 -> slot 2`），Canvas 独立负责几何视口自适应变换与抛物线补间。
3. **低调试成本**：通过“强类型契约 + 零值安全拦截 + 双层无头门禁 + 可视化 HUD”，将 Bug 排查时间降到秒级。

---

## 2. 总体架构设计

```
                  ┌─────────────────────────────────────┐
                  │ 1. 唯一事实源：YAML / Model 定义      │
                  │ (算法公式、数据、4阶段代码、顺逆推逻辑)   │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │ 2. 状态转移编译器 (Compiler)          │
                  │ - 自动运行递推与作用域快照              │
                  │ - 纯数学拓扑：fromSlot -> toSlot      │
                  │ - 统一装配 ActorPhysicsState 协议    │
                  └──────────────────┬──────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│ 3. 双层无头门禁 (UniversalPhysicsGate)│     │ 4. 语义投影渲染器 (Projection Engine)  │
│ - 步数充足度断言 (>= 15 steps)        │     │ - Track-Agent 轨道-实体通用模板        │
│ - 零值槽位物理安全断言 (slot: 0)        │     │ - 双模自适应抛物线补间 (Tweening)     │
│ - 物理跳跃有效性断言 (hasValidJump)    │     │ - 开发模式 HUD 实时调试浮窗 (角标/按键)│
│ - Card 2 决策分支对比完整性断言        │     │ - 生产构建 Tree-shaking 完全剔除     │
└──────────────────────────────────────┘     └──────────────────────────────────────┘
```

---

## 3. 详细设计规范

### 3.1 严格物理契约（Actor & Decision Contract）
统一使用 `ActorPhysicsState`，杜绝散落在 `curJ`、`activeSlot` 等历史字段中：

```typescript
export interface ActorPhysicsState {
  currentSlot: number;         // 严格数字槽位索引，支持 0 阶
  jumpFrom?: number;           // 起跳点，用于抛物线计算
  action: 'idle' | 'walk' | 'jump' | 'compare';
}
```

### 3.2 双层无头门禁套件（UniversalPhysicsGate）
设计为双层架构：
1. **基础套件 `assertUniversalPhysicsInvariants(steps, options)`**：
   - 步数充足度断言（防止生成器异常中断）
   - 零值安全断言（验证第一步槽位 0 未被隐式转换截断）
   - 拓扑位移断言（验证是否存在起跳与跨槽移动）
   - 决策分支断言（验证 Card 2 在发生比较时必须携带对比数据）
   - 行号映射断言（验证 `codeLine` 均在真实代码行范围内）
2. **全库参数化回归**：
   在 `src/core/testing/universal-dp-physics.gate.test.ts` 中一键扫描所有已重构 DP 算法，单次全量执行耗时 < 50ms。

### 3.3 双模自适应物理补间渲染（Adaptive Tweening）
在 Canvas 渲染层挂载轻量抛物线物理插值器：
- **自动播放模式（Play）**：启动 200~300ms 正弦抛物线动画：
  $$y(t) = \text{baseY} - \sin(t \cdot \pi) \cdot H$$
- **手动点击 / 进度条拖拽模式**：自动检测到密集步进，立即切换为瞬时吸附（零延迟），确保交互极其跟手、无拖影。

### 3.4 开发者物理调试 HUD（Physics Inspector）
- 仅在 `import.meta.env.DEV` 下编译生效；
- 画布右上角提供极简折叠角标，支持快捷键 `Ctrl + Shift + D` 呼出；
- 半透明面板实时呈现：
  `Step 14/28 | Actor: slot=2 (from 0) | Action: JUMP | Decision: [10 vs 15 -> 10]`
- 一秒定责：数据缺失归咎于编译器，坐标不对归咎于 Canvas 绘制。

---

## 4. 测试驱动（TDD）实施计划与任务分解 (优化升级版)

### Phase 1: 基础设施沉淀（底座先行）[已完成]
- [x] **Task 1.1**: 在 `src/core/universal-stage-engine.ts` 规范化 `ActorPhysicsState` 契约与 `normalizeStepInvariants` 物理归一化。
- [x] **Task 1.2**: 提炼并创建通用测试套件 `src/core/testing/universal-physics-gate.ts`。
- [x] **Task 1.3**: 将既有标杆（115 `distinct-subsequences` 与 746 `min-cost-climbing-stairs`）接入统一门禁，全绿通过。

### Phase 2: 极速调试赋能与渲染层物理补间
- [ ] **Task 2.1: 开发者 Physics HUD 极速前置 (20分钟)**
  - 实现基于 `import.meta.env.DEV` 的轻量折叠式调试浮窗，支持角标与 `Ctrl+Shift+D` 开关；
  - 实时显示当前步骤物理拓扑、槽位移动与决策分支，为后续算法重构提供毫秒级调试定责。
- [ ] **Task 2.2: 通用渲染适配器双模抛物线物理补间 (Tweening)**
  - 自动播放时启动 200~300ms 物理抛物线重力动画；
  - 快速点击/拖动进度条时瞬时吸附。

### Phase 3: DP 族群编译器提炼与 TDD 推进（以 LeetCode 343 为起点）
- [ ] **Task 3.1: 整数拆分（LeetCode 343 `integer-break`）TDD 标准化**
  - 编写 `src/core/models/integer-break.yaml` 领域模型（含 4 阶段代码与转移规则）；
  - 编写无头物理门禁测试 `integer-break.gate.test.ts`（红灯）；
  - 提炼通用的 **一维内循环切分族编译器 (`PartitionDPCompiler`)**，实现顺逆推与决策比对（绿灯）；
  - 接入 `universal-dp-physics.gate.test.ts` 全量门禁回归。
- [ ] **Task 3.2: 族群编译器复用推广**
  - 将通用的 `PartitionDPCompiler` 推广至后续同族算法（完全平方数、零钱兑换等）。
