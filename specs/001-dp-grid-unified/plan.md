# Implementation Plan: 全局 DP 网格适配器与足迹机制统一

**Branch**: `001-dp-grid-unified` | **Date**: 2026-09-12 | **Spec**: [spec.md](file:///f:/chain/algorithm-viz-standalone/specs/001-dp-grid-unified/spec.md)

**Input**: Feature specification from `specs/001-dp-grid-unified/spec.md`

## Summary

将字符标尺（`rowLabels` / `colLabels`）与字符匹配勋章（`isMatch`）下沉至全局底层通用模块 [GridVisualAdapter](file:///f:/chain/algorithm-viz-standalone/src/core/renderers/grid-visual-adapter.ts)，将探险家活动调用栈安全绳（`.dp-trail-arrow`）与网格自适应对齐。彻底消除各算法目录（如 `dp-067-shared.ts`）内复制的私有网格渲染逻辑，让全库所有网格类 DP 算法严格统一遵循「不同路径 II」的极简优雅视觉规范。

## Technical Context

**Language/Version**: TypeScript 5.6+ / Node.js 18+

**Primary Dependencies**: Vite 6, Tailwind CSS 4, Three.js (3D 视图桥接), Vitest

**Storage**: 纯内存状态，不涉及服务端持久化

**Testing**: Vitest (自动化门禁与单元测试)

**Target Platform**: Tauri 2 (Windows / macOS / Linux 跨平台桌面端) + Web 浏览器端

**Project Type**: 算法可视化桌面应用程序 (Deep Module 架构)

**Performance Goals**: 60 FPS 平滑步进动画，网格重绘延迟 < 16ms

**Constraints**:
- 不得破坏现有 586+ 个算法元数据生成物与目录一致性门禁；
- 保持向后兼容：不传 `rowLabels`/`colLabels` 时行为与普通网格算法（不同路径）完全一致；
- 严禁向单元格注入未经设计的文字噪音。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **单源元数据规范**：本特性属于视觉呈现层适配器改造，不触碰元数据手写源或目录索引。
- [x] **深度模块 (Deep Module) 约束**：`GridVisualAdapter` 接口极窄极深，隐藏所有 SVG 计算与 DOM 状态流转细节。
- [x] **测试第一准则**：覆盖率包含现有 `dp-067.test.ts`、`grid-visual-adapter.test.ts` 全量门禁。

## Project Structure

### Documentation (this feature)

```text
specs/001-dp-grid-unified/
├── plan.md              # 规划主文档
├── research.md          # 架构调研与技术决策 (Phase 0)
├── data-model.md        # 实体与单元格状态机 (Phase 1)
├── quickstart.md        # 验证与测试运行手册 (Phase 1)
└── contracts/
    └── grid-visual-adapter.contract.ts # 公共接口契约 (Phase 1)
```

### Source Code (repository root)

```text
src/
├── core/
│   └── renderers/
│       ├── grid-visual-adapter.ts          # [MODIFY] 扩展支持 rowLabels, colLabels, isMatch 与极简状态
│       ├── grid-visual-adapter.test.ts     # [MODIFY] 补充字符标尺与极简渲染单测
│       └── spatial-flow-visual-adapter.ts  # [MODIFY] 完善标尺偏移下的中心连线计算
└── algorithms/
    └── categories/
        └── dynamic-programming/
            └── dp-067/
                ├── dp-067-shared.ts        # [MODIFY] 废弃私有 DOM 拼接，委托调用 GridVisualAdapter
                └── dp-067.test.ts          # 校验 64 项回归门禁
```

## Proposed Changes

### Core Renderers Layer

#### [MODIFY] [grid-visual-adapter.ts](file:///f:/chain/algorithm-viz-standalone/src/core/renderers/grid-visual-adapter.ts)
- 在 `GridRenderOptions` 中增加 `rowLabels?: string[]`, `colLabels?: string[]`, `isMatch?: (r: number, c: number) => boolean`；
- 在 `renderGrid` 中若检测到标尺存在，自动包裹带行列表头的 Board 容器；
- 状态机统一：
  - `isCur`：探险家 🤠 稳立上方，格内纯净无多余脚印；
  - `isTrail`：淡蓝虚线框，脉冲单脚印 `👣`，无多余文字；
  - `isDone`：淡绿底色，粗体数值（若匹配带 `✨`），无 `×2` 杂质；
  - `isEmpty`：淡灰单字符 `-`。

#### [MODIFY] [grid-visual-adapter.test.ts](file:///f:/chain/algorithm-viz-standalone/src/core/renderers/grid-visual-adapter.test.ts)
- 添加包含 `rowLabels` 和 `colLabels` 的渲染用例断言。

### Algorithms Domain Layer

#### [MODIFY] [dp-067-shared.ts](file:///f:/chain/algorithm-viz-standalone/src/algorithms/categories/dynamic-programming/dp-067/dp-067-shared.ts)
- 彻底移除 `renderStage1GridCard` 中冗余的手工 DOM 拼接代码，将其直接委托给 `GridVisualAdapter.renderGrid`；
- 移除多余的 `historyTrailMap` 和未使用的辅助样式。

## Verification Plan

### Automated Tests
```bash
npx vitest run src/core/renderers/grid-visual-adapter.test.ts
npx vitest run src/algorithms/categories/dynamic-programming/dp-067/dp-067.test.ts
npm run typecheck
```

### Manual Verification
- 在桌面端同时打开 `不同路径 II` 与 `最长公共子序列`，单步播放至回溯环节，对比探险家移动、安全绳伸缩与解留存效果，确保两者视觉质感完全一致。

