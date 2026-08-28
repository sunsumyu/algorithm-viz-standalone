# Domain Glossary (上下文领域模型词汇表)

本文档定义算法可视化平台（algorithm-viz-standalone）的核心领域概念与标准统一术语。

---

## 1. 核心领域概念 (Core Domain Concepts)

### AlgorithmSpec (算法规范)
- **定义**：单一算法的可视化定义模型，纯数据与逻辑规范。
- **包含**：题目 ID、显示名称、算法分类、4 语种（Java / JavaScript / C++ / Python）官方演示代码、逐行语义解释、语义锚点行映射表（`SemanticLineMap`）以及纯函数式的单步推导生成器（`StepGenerator`）。
- **职责**：只负责声明算法的静态特征与动态推导逻辑，完全不与 DOM、SVG 或浏览器上下文耦合。

### DpStepEngine (动态规划单步推导引擎)
- **定义**：负责根据 `AlgorithmSpec` 和用户输入的参数，运行算法状态转移模拟，生成严格单步逐行执行的领域事件序列。
- **包含**：执行控制流（函数入口 $\rightarrow$ 边界初始化 $\rightarrow$ `for` 循环条件判断 $\rightarrow$ 循环体内转移 $\rightarrow$ 循环终止 $\rightarrow$ 函数返回）、变量快照差分、依赖状态索引分析。
- **职责**：向外部展示极简接口，内部封装复杂的逐行调试步进机制。

### DpTraceStep (单步执行轨迹事件)
- **定义**：动态规划执行轨迹中的单个原子时间点状态切片。
- **包含**：当前步骤语义（`action`）、高亮代码行、状态数组快照（`dp1d` / `dp2d`）、依赖的前驱索引（`dependencies`）、计算公式、运行变量快照（`vars`）及专用视觉元数据。

### VisualAdapter (物理实景视觉表现适配器群)
- **定义**：连接领域单步事件流与 UI 表现层的适配器深模块。
- **包含**：
  - `KnapsackRenderer`: 机械背包、传送带与货舱装载实景渲染器
  - `CoinRenderer`: 零钱兑换硬币天平与存钱罐渲染器
  - `GridRenderer`: 迷宫探险家寻路与越界落水反弹渲染器
  - `RobberRenderer`: 街景神偷与防盗警报物理实景渲染器
  - `StockRenderer`: 华尔街 K 线交易走势与操盘看板渲染器
  - `MathCutRenderer`: 激光光剑能量棒物理切割实景渲染器
- **职责**：接收 `DpTraceStep` 或 `DpThematicMeta` 快照，将其转化为生动沉浸的 SVG/Canvas 动效，完全不参与算法的逻辑推导。

### CodeSync (代码同步器)
- **定义**：代码面板多语言同步与逐行高亮适配器。
- **职责**：在用户切换 Java / JS / C++ / Python 语言时，自动将当前单步事件的语义锚点动态映射到对应语种的代码行与逐行解释。

### CodeStepIndexer (代码语义锚点索引编译器)
- **定义**：代码模板与单步执行之间的语义锚点编译器深模块。
- **职责**：自动提取多语言代码模板中的 `@step:anchor` 标签，编译 1-based 物理行号索引表并输出纯净源码，支持运行时 4 语种瞬时对齐。

### EvolutionStrategyDispatcher (多态算法演化策略调度器)
- **定义**：负责将算法演化请求分发到具体题型策略深模块的派发器。
- **职责**：对外暴露极简统一接口，内部委托给 `GridEvolutionStrategy`、`LinearEvolutionStrategy`、`KnapsackEvolutionStrategy` 等独立自治策略，消解超大单体 `if-else`。

### ProblemDimensionResolver (问题维度与布局特征解析深模块)
- **定义**：负责将 10+ 种不同算法入参结构（`m/n`、`nums1/nums2`、`text1/text2`、`word1/word2`、`prices`、`weights/bagWeight`、`s/t`、`nums`）归一化解析为标准维度的纯逻辑深模块。
- **职责**：输出 `{ m, n, is1D, category }`，彻底从控制器中消除分散冗长的参数猜测与分支判断。

### StageCodeCompiler (阶段源码编译与语义断点索引器)
- **定义**：负责各演化阶段（递归/记忆化/DP填表/空间压缩）Java 标准源码模板生成、`@step:anchor` 标签解析与纯净源码剥离的深模块。
- **职责**：将原本堆砌在仓储中的 500+ 行硬编码模板解耦，对外暴露统一编译接口 `compile(specId, stage)`。

### StateSpacePresenter (状态空间与多看板统一表现呈现器)
- **定义**：统合 Card 1 (执行沙盘/网格/一维槽位/3D透视) 与 Card 2 (状态数组/DP转移表/递归调用树) 多态视觉呈现的深模块。
- **职责**：对外暴露极简的高杠杆接口 `renderCard1` 与 `renderCard2`，内部自动自适应 1D 滚动槽位、2D DP 矩阵与 3D 立体沙盘。

### PlaybackCoordinator (播放时钟与时序协调调度深模块)
- **定义**：彻底封装播放/暂停状态机、定时器生命周期管理 (`setInterval`/`clearInterval`)、倍速切换与 seek 跳转的深模块。
- **职责**：对外呈现高杠杆的无 DOM 接口，支持动态总步数获取器与 FakeTimers 单元测试，从根本上防止动画竞态与时钟定时器泄漏。

### StepMatrixCompilerPrimitives (矩阵与单步编译领域原语深模块)
- **定义**：提供网格深克隆、标准 2D 状态转移步、一维滚动槽位压缩步与收尾返回步骤构造的纯函数原语深模块。
- **职责**：将零散在策略层各处的样板代码统一规范化，保证单步契约严格一致。

### AnalysisKnowledgePresenter (解法题解与五步法知识流呈现深模块)
- **定义**：负责将算法模型的题目描述、示例约束、标准 5 步递推推导与 FAQ 答疑卡片结构化呈现的深模块。
- **职责**：对外暴露极简的高杠杆接口 `renderProblemView` 与 `renderAnalysisView`，内置各题型（背包/双序列/股票/线性）自适应 5 步法推导规则，彻底从控制器中消除大段 HTML 模板。

### VisualizerParamSynchronizer (参数归一化与持久化状态同步深模块)
- **定义**：负责跨输入控件 (input-m, input-n)、URL Hash 与 LocalStorage 进行参数归一化、合法性约束与状态绑定的深模块。
- **职责**：对外暴露 `resolveInitialState` 与 `syncControlsToDom`，自动处理 1D 线性动规输入框显隐，隔离沙箱与 iframe 异常。

### StageNavigationCoordinator (阶段演化导航与 Tab 状态协调深模块)
- **定义**：负责顶部 4/5 阶段演化 Tab、复杂度时空徽章与双向推导（顺推/逆推）切换器呈现与事件协调的深模块。
- **职责**：对外暴露 `renderStageTabs` 与 `renderDirectionTabs`，内部封装激活类名切换、数字标号、阶段简称映射与时钟状态重置分发。

### RightPanelTabCoordinator (右侧多看板选项卡与代码面板协调深模块)
- **定义**：负责右侧代码面板 (Code)、题目描述 (Problem)、递推精讲 (Analysis) 选项卡切换与代码变体 (Variant Bar) 动态渲染的深模块。
- **职责**：对外暴露 `switchRightTab` 与 `updateCodePanel`，封装多看板显隐控制、变体选择器事件分发与滚动位置重置。

### VisualizerInteractionBinder (画板全局交互事件绑定深模块)
- **定义**：负责将播放控制、尺寸预设、3D 透视、视口模式路由与快捷键/弹窗事件统一绑定的深模块。
- **职责**：对外暴露 `bind(actions)`，实现声明式交互分发，彻底从控制器中消除手写 `addEventListener` 杂乱样板代码。

### DarkCodeTerminalPresenter (暗色代码终端表现器深模块)
- **定义**：统合右侧 Card 3 暗色代码终端交互的深模块。
- **职责**：对外暴露极简的高杠杆接口 `mount(container, config): DarkCodeTerminalInstance`，内部完全封装 Tab 状态机 (Code / Problem / Analysis)、Java/C++/Python/JS 4 语种瞬时切换、字号无缝缩放器 (A- 12 A+)、macOS 红黄绿窗口圆点、单步代码物理行高亮平滑滚动与力扣原题模态弹窗。

### BacktrackTraceEngine (回溯决策追踪推导引擎深模块)
- **定义**：负责根据声明式 `BacktrackSpec` 规则，运行回溯决策树搜索与分支剪枝，生成原子单步领域事件序列的 DDD 核心引擎。
- **职责**：纯算法数学与状态推导，0 DOM 依赖。对外暴露统一接口 `compile(spec): BacktrackTraceResult`，自动计算树坐标布局、路径栈差分与动态剪枝发现追踪。

### ViewMountEngine (算法视图挂载与生命周期引擎)
- **定义**：管理单一活动算法舞台（Single Active Stage Container）的完整生命周期接缝。
- **职责**：在切换算法时彻底注销上一个算法的定时器、事件监听器并清空 DOM 树，干净挂载新算法实例，从根本上杜绝 DOM 节点堆积、内存泄漏与全局 ID 冲突。

---

## 2. 模块接缝与关系 (Module Seams & Relationships)

```
┌────────────────────────────────────────────────────────┐
│             AlgorithmSpec (纯声明式算法规范)            │
│  - 多语言代码模板 (@step:update, @step:return)          │
│  - 语义锚点行映射 (SemanticLineMap)                      │
│  - 单步推导函数 (stepGenerator)                         │
└─────────────────────────┬──────────────────────────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
┌────────────────────────┐  ┌────────────────────────────┐
│ CodeStepIndexer        │  │ EvolutionStrategyDispatcher│
│ - 4语种行号自动编译    │  │ ├─ GridEvolutionStrategy   │
│ - 源码干净剥离标签     │  │ ├─ LinearEvolutionStrategy │
│                        │  │ └─ GenericEvolutionStrategy│
└────────────┬───────────┘  └─────────────┬──────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────┐  ┌────────────────────────────┐
│ CodePanel (代码联动)   │  │ VisualAdapter (视觉表现)   │
│ - 语义锚点高亮分发     │  │ - 机械背包/网格/树形动画   │
└────────────┬───────────┘  └─────────────┬──────────────┘
             │                            │
             └─────────────┬──────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ ★ ViewMountEngine (单一活动舞台挂载与生命周期引擎)     │
│ - mount(req) / unmountCurrent()                        │
│ - 彻底清空废弃 DOM 与事件监听器，零内存泄漏            │
└────────────────────────────────────────────────────────┘
```
