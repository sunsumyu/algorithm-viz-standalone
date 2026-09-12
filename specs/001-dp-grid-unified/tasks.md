# Implementation Tasks: 全局 DP 网格适配器与足迹机制统一

**Feature Branch**: `001-dp-grid-unified` | **Date**: 2026-09-12 | **Spec**: [spec.md](file:///f:/chain/algorithm-viz-standalone/specs/001-dp-grid-unified/spec.md) | **Plan**: [plan.md](file:///f:/chain/algorithm-viz-standalone/specs/001-dp-grid-unified/plan.md)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 初始化与基线确认

- [x] T001 [P] 校验工作区构建与测试基线状态 in src/core/renderers/grid-visual-adapter.test.ts
- [x] T002 [P] 验证 contract 定义与类型契约 in specs/001-dp-grid-unified/contracts/grid-visual-adapter.contract.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 核心通用适配器扩展基础，阻塞后续用户故事

**⚠️ CRITICAL**: 在修改业务算法前，必须先在核心适配器层扩展接口并保持向后兼容

- [x] T003 扩展 `GridRenderOptions` 接口支持 `rowLabels`、`colLabels` 与 `isMatch` 回调 in src/core/renderers/grid-visual-adapter.ts
- [x] T004 验证现有无标尺测试用例在 `grid-visual-adapter.test.ts` 中完全向后兼容通过

**Checkpoint**: 基础接口定义完成，可推进各用户故事。

---

## Phase 3: User Story 1 - GridVisualAdapter 原生支持字符标尺与极简状态 (Priority: P1) 🎯 MVP

**Goal**: 让底层核心网格适配器原生渲染字符行列标尺，并将单元格状态机严格对齐「不同路径 II」的极简优雅美学。

**Independent Test**: 在 `grid-visual-adapter.test.ts` 中传入 `rowLabels` 和 `colLabels`，断言 DOM 包含带字符语义的表头，且 `isCur`、`isTrail`、`isDone` 状态干净利落无噪音。

### Implementation for User Story 1

- [x] T005 [P] [US1] 在 `GridVisualAdapter.renderGrid` 中添加表头渲染逻辑（若传入 `colLabels` / `rowLabels` 则自动包裹 Board 标尺容器） in src/core/renderers/grid-visual-adapter.ts
- [x] T006 [P] [US1] 规范 `isCur` 状态：探险家 🤠 独立稳立当前格上方，格内纯净无多余脚印 in src/core/renderers/grid-visual-adapter.ts
- [x] T007 [US1] 规范 `isTrail` 状态：浅蓝虚线边框 + 单纯脉冲 `👣`，剔除一切多余文字 in src/core/renderers/grid-visual-adapter.ts
- [x] T008 [US1] 规范 `isDone` 状态：淡雅浅绿底色 + 粗体解值，字符命中匹配时呈现右上角精致 `✨` 标徽 in src/core/renderers/grid-visual-adapter.ts
- [x] T009 [US1] 编写针对 `GridVisualAdapter` 字符标尺与匹配状态的单元测试用例 in src/core/renderers/grid-visual-adapter.test.ts

**Checkpoint**: 核心层具备完整的双串/字符标尺渲染能力，极简视觉基线就绪。

---

## Phase 4: User Story 2 - 空间连线矢量与带标尺网格自适应对齐 (Priority: P1)

**Goal**: 确保 `SpatialFlowVisualAdapter` 绘制活动调用栈安全绳箭头连线时，能够自适应行列标尺产生的偏移，精准吸附至各单元格中心。

**Independent Test**: 传入包含标尺的多级 `activeStack`，验证生成的 SVG `<line>` 起止坐标严格等于各单元格的几何中心。

### Implementation for User Story 2

- [x] T010 [P] [US2] 检查并优化 `SpatialFlowVisualAdapter.renderGridArrows` 中基于容器内单元格 `data-coord` 的中心坐标计算 in src/core/renderers/spatial-flow-visual-adapter.ts
- [x] T011 [US2] 确保 `SpatialFlowVisualAdapter` 箭头 marker 样式与 `.dp-trail-arrow` 动画在动态生成层生效 in src/core/renderers/spatial-flow-visual-adapter.ts
- [x] T012 [US2] 编写带表头场景下网格 SVG 连线位置断言测试 in src/core/renderers/spatial-flow-visual-adapter.test.ts

**Checkpoint**: 连线安全绳与字符标尺网格浑然一体，深入拉绳、回溯收绳机制可靠。

---

## Phase 5: User Story 3 - 重构并收敛 dp-067-shared.ts 等业务私有实现 (Priority: P2)

**Goal**: 废除 `dp-067-shared.ts` 中的私有 `renderStage1GridCard` DOM 拼接，一行代码委托调用 `GridVisualAdapter.renderGrid`，消除架构异味。

**Independent Test**: 运行全量 `dp-067.test.ts`，64 项测试全部通过，LCS 视觉完美无瑕。

### Implementation for User Story 3

- [x] T013 [US3] 重构 `renderStage1GridCard`，将其直接委托给 `GridVisualAdapter.renderGrid` 并传入 `rowLabels`、`colLabels` 与 `isMatch` 回调 in src/algorithms/categories/dynamic-programming/dp-067/dp-067-shared.ts
- [x] T014 [US3] 清理 `dp-067-shared.ts` 中不再使用的私有样式拼接与冗余辅助变量 in src/algorithms/categories/dynamic-programming/dp-067/dp-067-shared.ts
- [x] T015 [US3] 运行并确保 Class 067 全量 64 个测试一次性通过 in src/algorithms/categories/dynamic-programming/dp-067/dp-067.test.ts

**Checkpoint**: Class 067 完全归一化接入全局底层适配器。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全局回归审查与质量门禁

- [x] T016 [P] 执行全局 TypeScript 严密类型检查 (`npm run typecheck`)
- [x] T017 [P] 执行全库算法目录新鲜度与元数据完整性门禁 (`npx vitest run src/core/algorithm-catalog-indexer.test.ts`)
- [x] T018 在 Tauri 开发环境中手动对比「不同路径 II」与「最长公共子序列」的视觉一致性

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: 无依赖，立即开始。
- **Phase 2 (Foundational)**: 依赖 Phase 1，阻塞所有用户故事。
- **Phase 3 (User Story 1)**: 依赖 Phase 2，核心 MVP。
- **Phase 4 (User Story 2)**: 依赖 Phase 3，完善连线对齐。
- **Phase 5 (User Story 3)**: 依赖 Phase 3 & Phase 4，业务层全面收敛。
- **Phase 6 (Polish)**: 依赖所有前置 Phase 完成。

### Parallel Opportunities
- T001 与 T002 可并行检查；
- T005 与 T006 在 `grid-visual-adapter.ts` 的不同方法/区块中可配合推进；
- T016 与 T017 门禁命令可并行校验。
