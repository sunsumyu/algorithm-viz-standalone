# Spec: 代码库架构深化与多态策略流水线重构 (Architecture Deepening & Strategy Pipeline Spec)

`triage: ready-for-agent`

---

## Problem Statement

当前算法可视化平台在快速扩张过程中积累了高摩擦的浅层与巨石模块：
1. **推演引擎单体巨石（4500 行、218KB）**：算法推演核心引擎集中于单体巨石文件（`universal-stage-engine.ts`），内部使用巨型 `switch-case` 硬编码了 30 余个算法的推导逻辑，新增或调试单一算法容易引发全局回归与合并冲突，违背开放封闭原则（OCP）。
2. **控制器上帝对象（1500 行）**：应用主控制器（`visualizer-app-controller.ts`）兼任了 DOM 绑定、时间轴步进、2D/3D 画布调度、分栏拖拽与主题切换，阻碍了无头化测试（Headless Testing）与模块深度复用。
3. **渲染器接口缺乏统一接缝**：2D 与 3D 渲染器接口不统一，调用方需要感知具体渲染器实现细节，多模态画布切换时存在状态残留与生命周期泄漏风险。

---

## Solution

基于**六边形架构 (Ports & Adapters)**、**策略模式 (Strategy Pattern)** 与**深层模块 (Deep Modules)** 原则重构算法推演与渲染管线：
1. **多态算法策略流水线 (Polymorphic Strategy Pipeline)**：将巨石推演引擎拆分为自治的独立算法策略模块，通过统一的小接口接缝 `AlgorithmStrategy` 与工厂注册表动态装配。
2. **多模态渲染桥接体系 (Visual Bridge)**：基于已验证成功的状态机模式（`ThreeActorStateMachine`），统一 2D DOM、3D WebGL 与 Canvas 树形渲染器的 `IVisualRenderer` 生命周期接缝。
3. **中介者状态总线 (View Mediator)**：将时间轴控制核、阶段转换器与视口渲染中枢解耦，控制器仅充当薄外观（Facade）。

---

## User Stories

1. As an **Algorithm Learner**, I want the algorithm visualizer to switch seamlessly between 2D and 3D modes without page lag or visual artifacts, so that I can explore spatial algorithms from different perspectives.
2. As an **Algorithm Learner**, I want boundary collisions and out-of-bounds exploration steps to display realistic physics feedback (water splash, bounce-back), so that I can intuitively understand boundary conditions.
3. As an **Algorithm Learner**, I want code panel highlights, step indexers, and visual models to stay 100% synchronized across all playback speeds, so that I can trace execution lines without desync.
4. As an **Open-Source Contributor**, I want to add a new algorithm by writing a single, self-contained strategy file without editing core monoliths, so that my pull request is isolated and zero-conflict.
5. As an **Open-Source Contributor**, I want standard template methods for the 4-stage DP progression (Recursion $\to$ Memoization $\to$ 2D DP $\to$ 1D Optimization), so that I don't write repetitive step-generation boilerplate.
6. As a **Core Developer**, I want the algorithm step generator to be pure TypeScript functions with zero DOM dependencies, so that I can run high-speed headless unit tests in milliseconds.
7. As a **Core Developer**, I want a unified `IVisualRenderer` interface for 2D, 3D, and Tree adapters, so that adding future WebGPU or VR visualizers requires zero controller rewrites.
8. As a **Core Developer**, I want the timeline controller to be decoupled from DOM manipulation, so that step jumping, scrubber scrubbing, and autoplay loops can be verified via pure state assertions.
9. As a **QA Engineer**, I want the 219-algorithm fidelity auditor to automatically audit every new strategy module, so that regressions in step invariants are blocked before release.
10. As a **Desktop User**, I want the visualizer to unmount previous 3D scenes and dispose of WebGL textures cleanly upon switching algorithms, so that application memory does not grow over extended sessions.

---

## Implementation Decisions

### 1. 多态策略体系 (Algorithm Strategy Pattern)
- **接缝设计**：抽象高杠杆小接口 `AlgorithmStrategy`：
  - `readonly modelId: string`
  - `generateStageSteps(stage: number, params: AlgorithmInput): UniversalStep[]`
  - `getMetadata(): AlgorithmMetadata`
- **目录结构规范**：
  每个算法作为一个独立深层模块存放在 `src/algorithms/categories/<category>/strategies/<model-id>/` 目录下。
- **注册工厂 (Registry Factory)**：
  提供 `AlgorithmStrategyRegistry`，支持运行时按需动态导入与策略查找，淘汰全局巨型 `switch-case`。

### 2. 状态机与多模态渲染桥接 (Bridge & State Machine)
- **渲染器接缝**：定义统一 `IVisualRenderer`：
  - `mount(container: HTMLElement, options: RenderOptions): void`
  - `updateStep(step: UniversalStep, options: RenderOptions): void`
  - `resetCameraPosition?(): void`
  - `dispose(): void`
- **纯状态机解耦**：
  保持 `ThreeActorStateMachine.resolve(step, ...)` 的纯函数特性，严禁将 Three.js Mesh 或动画 Loop 状态耦合入核心推演逻辑。

### 3. 中介者与外观解耦 (Mediator & Facade)
- 将 `VisualizerAppController` 拆分为：
  - `PlaybackTimelineController`：纯时间轴数学游标控制。
  - `StageOrchestrator`：负责题目阶段切换与缓存。
  - `VisualizerMediator`：处理视图与状态事件分发。

### 4. 架构范式裁定 (No Tactical DDD)
- 放弃生搬实体（Entity）、仓储（Repository）、工作单元（Unit of Work）等战术 DDD 概念，避免生成毫无业务价值的浅层透传样板。
- 保留战略 DDD 财富：统一领域词汇（`UniversalStep`、`ActorResolution`、`Trajectory`、`StageInvariant`）与清晰的限界上下文边界。

---

## Testing Decisions

### 1. 严格针对外部接缝（Behavioral Test Surface）测试
- 测试直接穿透 `AlgorithmStrategy.generateStageSteps` 与 `ThreeActorStateMachine.resolve` 接缝，断言生成的步骤数据、物理不变式与轨迹连续性，不刺探内部临时变量。

### 2. 黄金保真度审计网络 (Golden Invariant Net)
- 继承 `fidelity-auditor.test.ts` 的成熟实践，重构后的每一个算法策略必须 100% 通过 219 项跨算法全量保真度扫描。

### 3. 渲染器生命周期与内存泄漏测试
- 针对 `IVisualRenderer.dispose()` 编写自动化测试，断言 `WebGLRenderer.dispose()`、Geometry/Material 释放以及事件注销无泄漏。

---

## Out of Scope

1. 不涉及对现有 219 个题目可视化算法演示内容的业务重写或逻辑变更。
2. 不引入大型重量级外部状态管理框架（如 Redux Toolkit / MobX），保持轻量原生与高性能。
3. 不重写底层 Tauri Rust 窗口桥接与系统文件交互逻辑。

---

## Further Notes

- 重构采用“**分批策略迁移、渐进式瘦身**”路线，先以 `unique-paths` 和 `knapsack-01` 作为样板策略落地，再批量迁移其余算法。
- 保证重构期间全量测试套件（44 个测试文件、419 项测试）持续保持 100% 绿灯通过。
