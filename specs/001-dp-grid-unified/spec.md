# Feature Specification: 全局 DP 网格适配器与足迹机制统一

**Feature Branch**: `001-dp-grid-unified`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Unify DP grid visual adapter and footprint system across all dynamic programming algorithms (将字符标尺与匹配标徽下沉至 GridVisualAdapter，统一全库 DP 网格)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - GridVisualAdapter 原生扩展双串字符行列标尺与匹配勋章 (Priority: P1)

作为算法学习者，在查看二维网格与双串 DP（如 LCS、最长回文子序列、不同路径等）时，我希望网格的横纵轴能够清晰显示字符语义（如 'Ø', 'a', 'b', 'c'），且命中匹配时有精巧的 `✨` 标徽，同时保持「不同路径 II」一样干净、清爽、无视觉噪音的专业质感。

**Why this priority**: 核心视觉基础，彻底打破双串 DP 与迷宫网格 DP 的表现壁垒，让底层深模块 `GridVisualAdapter` 成为全库统一的视觉源。

**Independent Test**: 在 `GridVisualAdapter.renderGrid` 中传入 `rowLabels` 与 `colLabels`，渲染出带字符标尺与匹配勋章的网格，视觉极简纯粹。

**Acceptance Scenarios**:
1. **Given** 传入 `rowLabels: ['Ø', 'a', 'b']` 和 `colLabels: ['Ø', 'a', 'c']`，**When** 调用 `GridVisualAdapter.renderGrid`，**Then** 网格顶部与左侧正确渲染对应字符标尺与当前活跃行列高亮。
2. **Given** 单元格回溯求解完成（`isDone`），**When** 该单元格存在字符匹配时，**Then** 显示浅绿底色、大号加粗数值与右上角 `✨` 勋章，不包含冗余脚印或计数噪点。
3. **Given** 探险家处于当前格（`isCur`），**When** 渲染该格，**Then** 探险家 🤠 独立稳立在单元格上方，脚下不出现重叠脚印。

---

### User Story 2 - 空间连线矢量与任意带标尺网格自适应对齐 (Priority: P1)

作为算法学习者，当探险家在网格中深入递归或回溯退回时，我希望有一根带箭头的浅蓝虚线流动安全绳（`SpatialFlowVisualAdapter`）连接调用栈中的各个节点，直观体现“探索拉绳、回溯收绳”，彻底消除“足迹被撤销”的困惑。

**Why this priority**: 用户心智模型的关键纽带。连线建立了调用父子关系，回溯即收绳，成果留格内。

**Independent Test**: 给定包含多级栈深度的 `step.activeStack`，检查 SVG 图层精准在各格中心连线，带有 `marker-end` 箭头与 `.dp-trail-arrow` 流动动效。

**Acceptance Scenarios**:
1. **Given** `step.activeStack` 包含 3 个连续探索节点，**When** 渲染网格时，**Then** SVG 覆盖层自动在节点中心之间绘制 2 段带箭头的虚线连线。
2. **Given** 递归发生回溯弹出 1 个栈帧，**When** 切换到下一步，**Then** 安全绳自动收缩回上一级父节点，原节点保留已求解绿色数字。

---

### User Story 3 - 彻底重构收敛 dp-067-shared.ts 中的私有网格实现 (Priority: P2)

作为工程维护者，我希望消除 `dp-067-shared.ts` 中拷贝出来的私有 `renderStage1GridCard`，直接统一调用核心层的 `GridVisualAdapter.renderGrid`，实现全库零重复实现与架构收敛。

**Why this priority**: 消除代码异味（Code Smell），保证后续所有 DP 题目的网格呈现逻辑单一源头（Single Source of Truth）。

**Independent Test**: 将 `dp-067-shared.ts` 中的私有 DOM 拼接彻底替换为对 `GridVisualAdapter.renderGrid` 的单行委托，所有 64 项单元测试保持 100% 通过。

**Acceptance Scenarios**:
1. **Given** LCS 阶段 1 渲染沙盘，**When** 调用统一适配器，**Then** 界面呈现与「不同路径 II」一致的极简优雅风格，且所有交互正常。

---

### Edge Cases

- **单行/单列极端退化网格**：`m=1` 或 `n=1` 时，字符标尺与探险家依然保持良好居中，不产生布局撕裂。
- **超长字符串场景**：字符串长度较长时（如 10×10），格子尺寸 `cellPx` 自适应缩小，字号与探险家比例协调。
- **无 activeStack 的初始帧与结算帧**：安全绳优雅隐藏，不抛出空引用或未捕获异常。

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `GridRenderOptions` 扩展支持可选的 `rowLabels?: string[]`、`colLabels?: string[]`、`isMatch?: (r: number, c: number) => boolean`。
- **FR-002**: `GridVisualAdapter.renderGrid` 必须原生支持渲染行列字符表头，并将单元格的探索状态（`isCur`、`isTrail`、`isDone`、`isEmpty`）统一为极简风格。
- **FR-003**: `GridVisualAdapter` 必须内建或协同挂载 `SpatialFlowVisualAdapter` 的 SVG 连线图层，确保调用栈轨迹连线在任何网格上即插即用。
- **FR-004**: `dp-067-shared.ts` 必须废弃私有的 DOM 拼接逻辑，直接委托调用 `GridVisualAdapter.renderGrid`。
- **FR-005**: 保证现有的 64 个自动化单元测试与全量 TypeScript 类型检查严格通过，无回归破坏。

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- [Assumption about target users, e.g., "Users have stable internet connectivity"]
- [Assumption about scope boundaries, e.g., "Mobile support is out of scope for v1"]
- [Assumption about data/environment, e.g., "Existing authentication system will be reused"]
- [Dependency on existing system/service, e.g., "Requires access to the existing user profile API"]
