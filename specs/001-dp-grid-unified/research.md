# Research & Decisions: 全局 DP 网格适配器与足迹机制统一

**Feature Branch**: `001-dp-grid-unified` | **Date**: 2026-09-12

## 1. 架构目标与核心决策

### 决策 1: 将字符表头标尺下沉为 GridVisualAdapter 原生能力
- **Decision**: 在 `GridVisualAdapter.renderGrid` 的入参 `GridRenderOptions` 中扩展可选字段：
  ```typescript
  export interface GridRenderOptions {
    m: number;
    n: number;
    isReverse?: boolean;
    isGridProblem?: boolean;
    modelId?: string;
    rowLabels?: string[];     // 扩展：行轴语义标尺 (如 ['Ø', 'a', 'b', 'c'])
    colLabels?: string[];     // 扩展：列轴语义标尺 (如 ['Ø', 'a', 'c', 'e'])
    isMatch?: (r: number, c: number) => boolean; // 扩展：是否为字符匹配单元格 (打 ✨ 勋章)
  }
  ```
- **Rationale**:
  1. 避免各 DP 算法（如 Class 067 系列、区间 DP 等）因为需要字符串标尺而在各业务目录内重复自制网格 DOM；
  2. 保持全局单一视觉源头（Single Source of Truth），所有二维网格、迷宫探索、双串比对共享同一个经过充分打磨的 `GridVisualAdapter`。
- **Alternatives Considered**:
  - *方案 A*: 维持现状，在 `dp-067-shared.ts` 内部自写 `renderStage1GridCard`。缺点：违背 DRY 原则，极易在维护中出现视觉异味和样式分化。
  - *方案 B*: 新建一个 `StringGridVisualAdapter`。缺点：增加了适配器层级，实际上双串网格与迷宫网格的核心都是 $M \times N$ 的单元格与探险家行走，仅表头与匹配标徽不同，不构成全新类型。

---

### 决策 2: 空间连线矢量 (Spatial Flow Arrows) 与标尺网格自适应对齐
- **Decision**:
  `SpatialFlowVisualAdapter.renderGridArrows` 的连线坐标计算统一基于单元格元素的 `offsetLeft + offsetWidth / 2` 与 `offsetTop + offsetHeight / 2`，并在存在行头（`rowLabels`）和列头（`colLabels`）时自动支持容器偏移。
- **Rationale**:
  无论网格上方是否有列标尺（`colLabels`）或左侧是否有行标尺（`rowLabels`），几何中心计算自动贴合格子位置，箭头始终精准吸附在活动单元格中心。
- **Alternatives Considered**:
  - *按行列索引硬编码坐标*：在不同窗口尺寸和自适应缩放时容易错位。
  - *基于 DOM offset 计算*（采纳）：天然具备响应式伸缩能力。

---

### 决策 3: 严格对齐「不同路径 II」的极简优雅视觉规范
- **Decision**:
  1. **`isCur`（当前探索格）**：浅蓝高亮背景，探险家 🤠 独立稳立在当前格上方（`-top-7`），脚下**绝不叠放多余脚印**；
  2. **`isTrail`（活动调用栈）**：浅蓝淡雅背景、虚线边框、单颗跳动的脉冲脚印 `👣`，**绝不放置生硬文字（如“栈”）**；
  3. **`isDone`（已求解完成格）**：淡绿底色、大号加粗数值（如 `1`），**绝不包含多余脚印或计数噪音（如 `×2`）**；若遇字符匹配命中，右上角精致打上 `✨`；
  4. **`isEmpty`（未探索格）**：淡灰虚线框，单字符 `-`。
- **Rationale**:
  完全继承用户认可的「不同路径 II」顶级视觉质感，彻底根除信息过载与视觉污染。
