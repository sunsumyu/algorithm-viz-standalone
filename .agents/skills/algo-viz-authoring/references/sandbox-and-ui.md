# 物理沙盘、实体动画与 UI 布局控制规范 (Sandbox, Entities & UI Layout)

## 4. 物理沙盘与实体动画交互规范

### 4.1 卡通实体常驻渲染规范 (Entity Persistence Invariant)
- 沙盘上的行走角色（如小人、探针指示器）代表执行指令游标指针。
- **实体常驻生命周期**：角色在全部推演步骤中常驻保留在 DOM 中：
  - 在函数入口时：停留在起始方格（`[0, 0]`）。
  - 在遇到障碍物、边界特判或河道时：播放**碰壁反弹（Bounce Back）**动画，即短暂前倾后弹回上一个合法方格。
  - 在函数返回时：原地播放庆祝或终点标定动画，保持视觉落定。

### 4.2 状态依赖树与自适应视口 (Tree Visualizer & Adaptive Viewport)
- 递归树/状态依赖树随着步骤推演**动态点亮与生长**。
- **自适应视口居中 (Scale to Fit)**：树节点扩展时，自动计算 SVG 视口比例（Zoom & Pan），使活跃节点保持在视口黄金中心区。

### 4.3 路径痕迹与单元格依赖高亮
- 网格推演走过的路径保留足迹（Footprints）与流动箭头。
- 正在被当前单元格 `dp[i][j]` 依赖的单元格（如 `dp[i-1][j]`、`dp[i][j-1]`）使用对比色（如黄色/琥珀色脉冲光）突出显示。

### 4.4 递归调用树与依赖图统一模板复用契约 (Mandatory Tree Template Reuse)
- **核心模块统一复用**：
  - 涉及**暴力递归展开树（Recursion Tree）**、**记忆化剪枝树（Memo Pruning Tree）**、**状态转移依赖图（DP Dependency Tree）**的算法沙盘，统一接入核心深度模块 `RecursionTreeAdapter.renderRecursionTree`（位于 `src/core/renderers/recursion-tree-adapter.ts`）。
  - 仅在面临完全异构的物理形态（例如三维力导向图、极坐标雷达网、粒子碰撞物理引擎等通用树完全无法支持的特殊沙盘）时，才采用单独特异化实现。
- **几何防重叠与安全避让规范 (Collision-Free Geometry Invariant)**：
  - **动态安全层高计算**：当树中存在连线分支标签（`edgeLabel`，如 `↑上`、`\ 'e'`）或节点返回值徽章（`tag`）时，垂直层间距 `levelH` 自适应扩展至 **72px ~ 84px**，维持充分的垂直空间。
  - **垂直净空安全定位 (Safe Vertical Clearance)**：
    连线上的分支标签胶囊 `edgeLabel` 计算父节点底部与子节点顶部的安全中点：
    $$\text{SafeMidY} = \frac{(Y_{\text{parent}} + \text{nodeH}/2 + \text{tagPad}) + (Y_{\text{child}} - \text{nodeH}/2 - \text{frogPad})}{2}$$
    X 坐标沿贝塞尔 S 弯曲线动态取值，确保边标签四周保留至少 $\ge 8\text{px}$ 的安全净空，与父节点的返回值徽章（Tag）或子节点头顶的当前活跃游标（🐸 青蛙）错开层次。
  - **图层分层与不透明底衬 (Layering & Opaque Shields)**：
    SVG 图元按层次分层输出：`底图连线层 (lines) ➔ 中间分支标签层 (edgeLabels) ➔ 顶层状态节点层 (nodes)`。分支标签自带不透明 `#ffffff` 填充底衬与边框阴影，保持文字高可读性。

### 4.5 序列比对与双指针跟踪交互规范 (Sequence Alignment & Dual-Pointer Tracking Invariants)
- **四态视觉连续性状态机 (4-State Visual Continuity State Machine)**：
  - 凡涉及字符串比对、双指针滑动、序列模式匹配（LCS、编辑距离、通配符、回文串）等推演，使用四态视觉连续性状态机：
    1. **待考察（Unvisited/Pending）**：默认中性底色。
    2. **已考察/历史轨迹（Visited/Explored）**：弱化半透明灰，展现扫描前进历史。
    3. **当前活跃焦点（Active Focus）**：高亮亮蓝/琥珀金脉冲，指示当前正在比对的字符。
    4. **路径有效锁定（Matched/Committed）**：当前调用链上已匹配采纳的字符，保持翡翠绿高亮与标识，直至该分支回溯退栈。
- **末尾边界哨兵不变量 (EOF / Boundary Sentinel Invariant)**：
  - 双序列/双指针算法中，当 `i >= s.length` 或 `j >= s.length` 达到基底终止条件时，字符容器末尾常驻保留一个 **`EOF` 或 `Ø` 哨兵单元格**。越界推演步的活跃光标停驻在 `EOF` 哨兵格上。
- **防御性空值校验与纯净渲染 (Defensive Null Guard & Clean Rendering)**：
  - 渲染层取字符值统一进行防御性校验：`(idx >= 0 && idx < s.length) ? s[idx] : 'Ø/空'`。
  - 保持所有卡片、Tooltip、日志与徽章内容具备定义值。
  - **自动化门禁断言**：由 `presentation-contract.gate.test.ts` 自动化断言（红灯陷阱 5 & 6 与 9 & 10）验证，确保 Card 1/2 的 HTML 字符串及 inline style 中无 `[object Object]`、`undefined` 或 `NaN`。
- **统一复用核心深度模块**：
  - 序列比对与指针跟踪优先调用 `SequenceAlignmentPresenter`，保持各算法交互一致。

---

## 5. UI 布局、层次去冗余与交互控制规范

### 5.1 消除嵌套与冗余规范 (Anti-Nesting & Visual Hierarchy)
- **单层主容器法则**：外部使用单个主 Card 容器，子指标直接平铺展现。
- **单一语言规范**：使用清晰精炼的中文专业术语，避免中英双语冗余堆叠。
- **主画布占比 (Canvas Dominance)**：核心可视化区域（网格、树、沙盘）占据视口的 **60%~70%** 黄金面积。
- **框架解耦呈现**：由呈现器框架负责卡片外框、标题及指标药丸；Card 1 聚焦核心图形与状态沙盘渲染。通过 `declarative-presentation-contract.gate.test.ts` 自动化核验。

### 5.2 核心变量指标看板规范
- 动态变化的游标变量（如当前索引 $i, j$、暂存值 `backup`、当前物品容量/价值）以显著独立的 Badge/看板优先展示。
- **参数排布顺序**：动态游标变量（$i, j, k$）放左侧，静态规模参数（$m, n, W$）放右侧。
- 算式代入展示具体代入数值（如 `dp[2][3] = dp[1][3] (5) + dp[2][2] (4) = 9`）。

### 5.3 控件与输入框排布顺序
- **顶栏左侧弹性自适应 (Flexible Left Header)**：
  - 顶栏左侧容器使用弹性自适应（`flex-shrink: 0; min-width: 0;`），标题设置 `text-overflow: ellipsis; white-space: nowrap;` 并提供原生 `title` 浮动提示。
  - 辅以响应式断点（如 `< 1380px` 隐藏模式徽章、`< 1200px` 隐藏复杂度徽章），确保各可见元素完整。
- **顶栏“应用”按钮明确语义**：
  - 顶栏用于重新生成/应用参数的按钮统一标为明确汉字 **“应用”**。
  - 与旁边的“重置”按钮保持高度、圆角、字号和内边距的对称统一。
- **输入标签标点统一与防重**：
  - 对输入项 `label` 实施尾部冒号过滤 `label.replace(/[:：]\s*$/, '')`，避免重复双冒号。
- **控件排列顺序**：
  - 各类预设用例、输入框从左至右依次排列：`[预设用例/下拉] ➔ [输入框组] ➔ [应用按钮] ➔ [重置按钮]`。
  - **“重置”按钮位于最末尾**。
- **播放控制区**：播放、暂停、单步前进、单步后退、速度滑块居中或贴近核心画布右下方，便于单手交互。
- **代码面板一键复制代码规范 (One-Click Code Copy Standard)**：
  - 代码调试面板右上角控制区常驻提供「一键复制当前代码」按钮（`#btn-code-copy`）。
  - 支持一键提取当前活跃语言纯净源码写入剪贴板（支持 `navigator.clipboard` 与 `execCommand` 双向降级）。
  - 点击后提供即时微动画反馈（图标转为 `✓`，文字变为 `已复制`，高亮翠绿并在 1.8 秒后复位）。
- **原题信息展示**：所有算法在顶栏或右上角提供题目原题入口，统一弹窗标题为 `📋 算法题目描述`。

### 5.4 面板 Splitter 拖拽持久化与安全边界
- 分割条（Resizer/Splitter）设置安全最小尺寸：`minWidth: 320px`，`minHeight: 200px`。
- 用户拖动后的尺寸存入 `localStorage`，重新加载时自动恢复。

---

## 6. 重置状态与幂等性规范

### 6.1 状态幂等初始化
- 用户点击“重置”或更改输入参数重新生成时，系统初始化至 `Step 0`：
  - 清空推演历史栈与日志。
  - 恢复实体角色至起点位置。
  - 重置 DP 表格各格为初始值（如 `0`、`inf` 或空）。
  - 保持画布就绪且状态沙盘清晰可见。
