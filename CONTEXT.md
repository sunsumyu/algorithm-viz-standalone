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
- **定义**：统合 Card 1 (执行沙盘/网格/一维槽位/3D透视) 与 Card 2 (状态数组/DP转移表/递归调用树) 多态视觉呈现的深门面模块。
- **职责**：对外暴露极窄且高杠杆的接口（`renderCard1`、`renderCard2`、`renderLiteVisuals`、`renderStepLogStream`）。通过容器局部限定原语（Scoped Container Locality）彻底杜绝全局 `document.getElementById` 穿透泄漏；内部采用策略/适配器模式分发树形拓扑、2D 平面网格、1D 滚动槽位及 3D 立体沙盘，实现完全的容器隔离与生命周期安全。

### PlaybackCoordinator (播放时钟与时序协调调度深模块)
- **定义**：100% 零 DOM 依赖（Zero-DOM）的纯状态机与安全定时器调度深模块。
- **职责**：彻底封装播放/暂停状态流转、单步步进（`next`/`prev`）、任意点跳转（`seek`）、边界自动暂停与重播流转、倍速动态切换以及总步数重构时的索引安全收敛（Clamp/Reset）。通过显式回调（`onStepChange`、`onStateChange`）向外界广播时序坐标，对算法数据结构完全无感，从根本上杜绝时钟泄漏与跨算法动画竞态。

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
- **定义**：统合右侧 Card 3 暗色代码终端与代码联动的唯一权威深模块。
- **职责**：彻底消除双轨高亮机制。对外暴露极窄且高杠杆的接口（`mount(container, config): DarkCodeTerminalInstance`、`highlightLine(target)`、`updateVars(vars)`），内部封装 Tab 状态机 (Code / Problem / Analysis)、Java/C++/Python/JS 4 语种瞬时切换、字号无缝缩放器 (A- 12 A+)、单步代码多态入参归一化（物理行/区间/语义锚点）、视口平滑滚动居中、力扣原题模态弹窗与集成式变量监视底栏。兼容遗留 `[data-code-panel]` 挂载点，实现零 DOM 泄漏与极致的变更局部性。

### BacktrackTraceEngine (回溯决策追踪推导引擎深模块)
- **定义**：负责根据声明式 `BacktrackSpec` 规则，运行回溯决策树搜索与分支剪枝，生成原子单步领域事件序列的 DDD 核心引擎。
- **职责**：纯算法数学与状态推导，0 DOM 依赖。对外暴露统一接口 `compile(spec): BacktrackTraceResult`，自动计算树坐标布局、路径栈差分与动态剪枝发现追踪。

### AlgorithmRegistry (算法注册中心与惰性解析深模块)
- **定义**：全库 330+ 算法元数据、模板与工厂构造器的唯一权威真实来源（Single Source of Truth）。
- **职责**：统一收拢原本分散在 `registry.ts`、`template-loader.ts` 与 `algorithm-manager.ts` 的三份浅 Map；内部封装按需分包动态加载（`loadAlgorithmBatch`），对外仅提供 `register(manifest)`、`getMetadata(id)`、`resolve(id): Promise<ResolvedAlgorithmEntry>` 与 `getAllMetadata()` 极窄接口，实现零 DOM 依赖的数据自治。

### ViewMountEngine (算法视图挂载与生命周期引擎)
- **定义**：管理单一活动算法舞台（Single Active Stage Container）与主视口切换的完整生命周期深模块。
- **职责**：在切换算法时彻底注销上一个算法的定时器、事件监听器并清空 DOM 树，干净挂载新算法实例；对外暴露 `showAlgorithm(id)` 与 `showSelector()` 统合算法舞台展开与主大纲视口折叠；通过发布 `algo:mounted` 与 `algo:selector-shown` 事件解耦全局导航等观察者，从根本上杜绝循环导入、内存泄漏与 ID 冲突。

### CatalogPresenter (算法目录学与卡片沙盘呈现深模块)
- **定义**：统合算法卡片网格、侧边分类栏与快捷目录抽屉的统一呈现深模块。
- **职责**：接收 `AlgoSearchCatalog` 领域查询结果，对外暴露 `renderCategoryNav`、`renderCardGrid`、`renderDrawerContent` 以及 `resolveAlgorithmIcon` 极简接口；内部封装三级图标解析回退机制与高亮标签切分，彻底从插件与导航控制器中消除 800+ 行重复的 DOM 拼装、硬编码字典与分散隐式状态。

### ModelSynthesisEngine (算法模型合成与语义编译引擎)
- **定义**：负责根据声明式 `IAlgorithmSpec` 规范合成统一 `IYamlAlgorithmModel` 结构的 DDD 领域引擎。
- **职责**：对外暴露 `synthesizeFromSpec`、`getStageAnnotatedCode`、`resolveSemanticLine` 与 `bridgeSemanticLinesToAnchorMap` 极窄接口；内部封装按题型类别映射的 O(1) `DEFAULT_PARAMS_MAP` 字典与语义行到物理行号的自适应编译，彻底消除仓储层中 35+ 行级联三元推导与模板胶水代码。

### ThreeLayeredVoxelAdapter (3D 分层立交体素沙盘适配器深模块)
- **定义**：专为三维与高维动态规划（$dp[k][r][c]$ / $dp[i][j][k]$）设计的 WebGL 立体多层晶圆呈现深模块。
- **职责**：对外暴露 `mount`、`render`、`dispose`、`focusLayer` 与 `focusAll` 极窄高杠杆契约；内部封装垂直 Y 轴分层晶圆网格布局、半透明霓虹层标牌、体素多态水晶材质（活跃浮起、前驱金芒、冰晶穿透）以及基于三维 CatmullRom 样条曲线的跨层贝塞尔导管与光流粒子动画。

### LayeredVoxelStepAdapter (3D 分层切片数据提取与依赖编译器)
- **定义**：将多态单步事件流 (`DpTraceStep` / `UniversalStep`) 归一化为三维空间切片立方体的纯逻辑深模块。
- **职责**：100% 零 DOM 依赖。对外暴露 `adapt` 与 `buildCubeFromSteps`，自动从步进中提取层级维度 $k$，累积维护 $K \times M \times N$ 状态立方体快照，并解析上一层到本层的跨层有向依赖集合（`interLayerDependencies`）。

### ThreeGraphTopologyAdapter (3D 空间图论拓扑与网络流粒子沙盘表现器深模块)
- **定义**：专为复杂图论算法（网络最大流 Dinic、Dijkstra/A* 寻路、Tarjan 强连通分量、二分图匹配等）设计的 WebGL 3D 空间立体拓扑沙盘深模块。
- **职责**：实现 `IVisualRenderer` 标准生命周期契约。对外暴露 `mount`、`render`、`setLayoutMode` 与 `dispose` 极窄接口；内部封装 Three.js 场景树、3D 空间发光节点悬浮球体（带文字 Sprite 标牌与探测状态光晕）、流光能量管道与箭头几何体、沿 Z 轴递增的半透明多层立交网格底盘（Layer Plazas）以及 OrbitControls 360° 自由旋转视角交互。

### ThreeGraphLayoutEngine (3D 空间图论自适应布局引擎)
- **定义**：负责将抽象图结构（节点、边）转换为三维空间欧氏坐标的纯算法数学深模块。
- **职责**：100% 零 DOM / 零 WebGL 依赖。对外提供三大空间布局算法：
  1. `computeLayeredLayout`：分层立交布局，按 BFS 深度/拓扑分层将节点分布在各 Z 轴平面并呈环状均匀展开；
  2. `computeProjectionLayout`：平面 2D 坐标升维投影，按度数/权重赋予地势落差；
  3. `computeForceLayout`：三维空间库仑-胡克引力斥力迭代，使无序图自然舒展。

### ThreeGraphParticleFlow (3D 空间图论流光管道与水流粒子流动引擎)
- **定义**：负责在有向网络边、增广多路流束与最短路路径上实时推演流光粒子微观动力学的纯状态机引擎。
- **职责**：100% 零 DOM 强依赖。对外暴露粒子坐标插值与时钟驱动（`step(deltaSeconds)`）；内部基于抛物线/二次贝塞尔平滑弧线插值计算粒子轨迹，根据流量与容量比（$\text{flow}/\text{cap}$）动态调节流速与密度，并自适应映射增广金芒、饱和警戒红与清澈水流蓝。

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
