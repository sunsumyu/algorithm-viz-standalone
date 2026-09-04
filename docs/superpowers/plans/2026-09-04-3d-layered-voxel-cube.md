# 3D 立体分层立交体素沙盘 (ThreeLayeredVoxelAdapter) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建专属于高维与三维动态规划（如 $dp[step][r][c]$ / $dp[i][j][k]$）的 3D 分层立交立体沙盘渲染引擎，支持多层透明体素网格与跨层贝塞尔能量光柱汇聚动效。

**Architecture:** 基于 `codebase-design` 深模块设计模式，将 3D 分层渲染逻辑封装进自治的 `ThreeLayeredVoxelAdapter`，通过 `LayeredVoxelStepAdapter` 自动转换步骤切片，并在 `StateSpacePresenter` 中通过类别/特征侦测接入，实现零回归、高表现力的 3D 立体空间。

**Tech Stack:** TypeScript, Three.js, OrbitControls, Vitest, Vite

## Global Constraints

- **Zero Regression:** 必须确保现有 331 个算法的单测、保真度审计（`fidelity-auditor.test.ts`）与 2D 沙盘 100% 不受影响。
- **Zero Memory Leak:** WebGL 对象、几何体、材质、贴图与动画帧在销毁时显式释放。
- **Mock DOM & Zero-DOM Friendly:** 适配器核心支持在 Node.js / Mock 纯逻辑环境下正常加载与测试。

---

### Task 1: 定义分层体素数据结构与纯逻辑步骤适配器 (LayeredVoxelStepAdapter)

**Files:**
- Create: `src/core/renderers/layered-voxel-step-adapter.ts`
- Test: `src/core/renderers/layered-voxel-step-adapter.test.ts`

**Interfaces:**
- Consumes: `DpTraceStep` / `UniversalStep`
- Produces: `LayeredVoxelStepData`, `LayeredVoxelCell`, `InterLayerDependency`

- [x] **Step 1: 编写测试用例**
  编写针对 `LayeredVoxelStepAdapter` 的单元测试，测试从普通 2D 步骤或带 3D 信息的步骤中提取多层切片快照及识别跨层依赖。
- [x] **Step 2: 运行单测验证失败**
  `npx vitest run src/core/renderers/layered-voxel-step-adapter.test.ts`
- [x] **Step 3: 实现 `LayeredVoxelStepAdapter`**
  实现根据当前步骤及历史积累状态构建 $K \times M \times N$ 立方体切片，并提取跨层依赖索引。
- [x] **Step 4: 运行单测验证通过**
  `npx vitest run src/core/renderers/layered-voxel-step-adapter.test.ts`

---

### Task 2: 构建分层立体沙盘深模块 (ThreeLayeredVoxelAdapter)

**Files:**
- Create: `src/core/renderers/three-layered-voxel-adapter.ts`
- Test: `src/core/renderers/three-layered-voxel-adapter.test.ts`

**Interfaces:**
- Consumes: `LayeredVoxelStepData`, Three.js
- Produces: `ThreeLayeredVoxelAdapter` (`mount`, `render`, `dispose`, `focusLayer`, `focusAll`)

- [x] **Step 1: 编写适配器基础架构与生命周期单测**
  验证 `mount`、`render`、`dispose` 在非浏览器环境下的容错性，以及多层几何体与网格计算逻辑。
- [x] **Step 2: 运行单测验证失败**
  `npx vitest run src/core/renderers/three-layered-voxel-adapter.test.ts`
- [x] **Step 3: 实现 `ThreeLayeredVoxelAdapter`**
  - 构建 Y 轴等距分层晶圆网格与半透明霓虹层标牌；
  - 构建体素多态材质（`active` 浮起发光、`dependency` 琥珀金芒、`computed` 冰晶半透明、`empty` 虚线框）；
  - 构建基于 `CatmullRomCurve3` 与 `TubeGeometry` 的跨层能量汇聚导管与光流粒子动画；
  - 实现相机全景等轴巡航与层特写视角调度；
  - 严格实现 `dispose()` 资源彻底释放。
- [x] **Step 4: 运行单测验证通过**
  `npx vitest run src/core/renderers/three-layered-voxel-adapter.test.ts`

---

### Task 3: 与 StateSpacePresenter 挂载门面接轨并支持三维 DP 场景

**Files:**
- Modify: `src/core/renderers/state-space-presenter.ts`
- Test: `src/core/renderers/state-space-presenter.test.ts`

**Interfaces:**
- Consumes: `ThreeLayeredVoxelAdapter`, `LayeredVoxelStepAdapter`
- Produces: `StateSpacePresenter.renderCard1` / `renderLiteVisuals` 支持 3D 分层立交沙盘

- [x] **Step 1: 编写门面三维分发单测**
  在 `state-space-presenter.test.ts` 中增加对三维 DP 题目（或带 `is3DLayered` 参数）时自动委派给分层体素适配器的测试。
- [x] **Step 2: 接入 `StateSpacePresenter`**
  在 `renderCard1` 与 `renderLiteVisuals` 中检测是否为三维 DP 算法或三维立体沙盘模式，动态装配与渲染 `ThreeLayeredVoxelAdapter`。
- [x] **Step 3: 运行单测验证通过**
  `npx vitest run src/core/renderers/state-space-presenter.test.ts`

---

### Task 4: 端到端联动测试与全库保真度回归审计

**Files:**
- Test: `src/algorithms/categories/dynamic-programming/specs/three-dimension/three-dimension-3d-visuals.test.ts`
- Test: `src/core/fidelity-auditor.test.ts`

- [x] **Step 1: 编写三维 DP 算法全链路真实步骤联动测试**
  以《出界的路径数》(LeetCode 576) 和《骑士在棋盘上的概率》(LeetCode 688) 为测试基准，验证真实单步数据流畅驱动 3D 分层沙盘并生成跨层光束。
- [x] **Step 2: 运行全库审计与回归套件**
  - `npx vitest run src/core/fidelity-auditor.test.ts` (确保 331 算法 100% 审计通过)
  - `npm run typecheck`
  - `npm run build`
