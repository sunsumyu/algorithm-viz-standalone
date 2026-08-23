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
