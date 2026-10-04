---
name: ui-layout-design
description: "Rules for visualization canvas dominance (60%–70%), anti-card-nesting, responsive splitters, and control layout hierarchy."
---

# 算法可视化 UI 布局与交互设计规范 (UI Layout & Interaction Design)

Core UI layout principles for visualization sandboxes, card hierarchy, responsive splitters, and control ergonomics.

---

## 1. 核心布局准则 (Layout Principles)

### 1.1 主画布黄金面积优先 (Canvas Dominance)
- Visualization sandbox (grids, SVG trees, graph topologies, 2D/3D physics) must occupy **60% ~ 70%** of total viewport height/width.
- Maintain balanced geometry between sandbox and auxiliary code panels.

### 1.2 彻底消灭“俄罗斯套娃”嵌套框 (Zero Nested Box Redundancy)
- **单层主容器法则**：每个主要功能区外部保留单层高质感容器（Card）。
- **扁平内嵌**：文字、日志、属性直接在卡片内排版，避免内部多余的独立 Card 或 Border 嵌套。
- **单一语义标签**：使用单一简练专业标签（例如直接使用 `状态转移方程`，避免使用 `状态转移方程 (Transition Formula)` 这类中英冗余双语堆叠）。

### 1.3 顶栏与侧边栏自适应弹性布局
- 侧边栏展开时，右侧主内容区必须弹性自适应缩减（`flex-1; min-width: 0`），保持主操作按钮与内容始终在视口内可见。

---

## 2. 控件与参数排布规范 (Control Order Standards)

### 2.1 顶栏与输入控件
- **顶栏文字防截断**：
  - 顶栏左侧容器（如 `.dsp-header-left`）必须弹性伸缩（`flex-shrink: 0; min-width: 0;`）；
  - 标题长文本配置省略号与浮动原生 `title`，辅助徽章小屏下响应式隐藏。
- **语义化操作按钮**：
  - 应用新参数重新生成的按钮使用明确文字（统一为 **“应用”** 或 **“运行”**），避免单独使用播放三角图标 `▶` 造成与底部播放控件混淆；
  - “应用”与“重置”按钮保持高度（24px）、圆角和字号对称。
- **输入项与重置排布**：
  - 输入框按从左至右自然流式排列；
  - **“重置”按钮置于所有输入框与应用按钮的最末尾**；
  - 过滤输入项 label 尾部冒号：`label.replace(/[:：]\s*$/, '')`，消除双冒号污染。
- 播放控制栏居中或置于核心画布右下角；推演步进条横贯视口最底部。

### 2.2 状态变量与指标看板排布
- **游标动态变量优先**：动态游标（$i, j, k$、暂存寄存器）排在最左侧或最上方显著位置；
- **静态规模参数靠后**：静态规模（$m, n$、$target$）排在后面；
- 算式面板必须展示实际数值代入（Concrete Value Substitution），避免纯抽象字母公式。

### 2.3 题目信息标准弹窗
- 顶部导航栏保留原题入口，弹窗统一命名为：`📋 算法题目描述`；
- 包含权威题号、完整题目描述与输入输出约束。

---

## 3. 拖拽分割条与响应式安全边界 (Splitter & Resizer)

1. **绝对安全最小尺寸 (Min-Bounds Protection)**：
   - 水平分割条：两侧面板 `minWidth >= 320px`；
   - 垂直分割条：上下卡片 `minHeight >= 200px`；
   - 设置物理边界锁死，保持内容与操作按钮始终可交互。
2. **尺寸持久化 (Dimension Persistence)**：
   - 拖拽宽高自动持久化至 `localStorage`；
   - 页面刷新或重载时自动恢复设定尺寸。
