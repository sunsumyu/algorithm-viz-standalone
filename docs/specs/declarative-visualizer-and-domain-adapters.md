# Spec: 声明式配置化可视化器与领域专属画布适配器架构 (Declarative Visualizer & Domain Adapters Spec)

`triage: ready-for-agent`

---

## Problem Statement

当前算法可视化平台存在**浅层模板重复**与**缺乏统一声明式抽象**的架构摩擦，同时存在**视觉嵌套子框过多**的问题：
1. **151 个独立 HTML 模板导致代码库极其碎片化**：每个算法页面均手写一套独立的 HTML 骨架与 scoped CSS，重复定义 Header 控件、时间轴控制器、代码终端容器和日志面板。当进行全局规范升级（如去重框、预设栏对齐、输入框紧凑化）时，需要手工维护 151 个文件，维护成本极高且容易出现 DOM ID 错位导致空白页。
2. **多层嵌套子边框削弱了沙盘视觉体验**：许多历史算法在 Card 1 / Card 2 内部滥用嵌套卡片（如大卡片套灰色背景框，内部又动态生成白色带边框的子卡片 `.mq-subcard`, `inStack` 子框等），导致画面碎片化、有效绘图空间被压缩。
3. **“一刀切”统一的风险**：不同算法领域的视觉形态差异巨大（二叉树的 SVG 拓扑连线、图论的加权网络与松弛流、数组的双指针与滑动窗口、动态规划的 2D/3D 网格与阶段演进、双栈队列的数据倒置流等）。如果强行使用单一固定视图抹平所有差异，会导致特定算法的交互与动态特性丢失。

---

## Solution

基于**组合模式 (Composite Pattern)** 与 **适配器模式 (Adapter Pattern)** 构建**声明式配置化渲染引擎**，严格划清「通用统一骨架」与「领域专属画板」的接缝：

1. **统一的声明式外壳 (Universal Visualizer Shell Seam)**：
   - 统一由核心呈现引擎挂载 4-Card 标准响应式网格。
   - 自动装配顶栏（标题、模式标签、紧凑输入框、对齐预设栏）、右侧暗色代码终端、底部 Scrubber 进度条与执行日志流。
2. **领域专属画布适配器体系 (Domain-Specific Canvas Adapters)**：
   - 保留并规范化 6 大领域适配器，不强行抹平领域差异：
     1. **`TreeCanvasAdapter`**：二叉树 / BST 拓扑层次 SVG 投影、节点高亮与递归路径追踪。
     2. **`GraphTopologyAdapter`**：有向/无向加权图、最短路松弛流、并查集连通分量与邻接矩阵。
     3. **`ArrayTrackAdapter`**：单轨/双轨/三轨数组、双指针滑动窗口、原地元素交换。
     4. **`DPGridVoxelAdapter`**：2D 动态规划网格、3D WebGL 体素、1D 空间压缩状态行。
     5. **`DualStructureAdapter`**：双栈/双队列进出倒置流与转移轨迹动画。
     6. **`HistogramStackAdapter`**：单调栈柱状图、雨水填充面与栈内单调性柱体。
3. **强制去框规范 (Strict Zero-Subbox Constraint)**：
   - 沙盘内部一律采用统一扁平背景（`#f8fafc`），所有元素通过间距与轻量分割排布，100% 杜绝在沙盘内嵌套白色带有 border 的子框。
4. **声明式算法模型 (Declarative Algorithm Spec)**：
   - 算法开发者只需编写纯 TypeScript 的参数定义、数据推导函数（`buildSteps`）与指标映射配置，彻底告别手写 HTML/CSS。

---

## User Stories

1. As an **Algorithm Learner**, I want all algorithm pages to have a clean, distraction-free visual canvas without nested boxes inside boxes, so that I can focus entirely on data structure state changes.
2. As an **Algorithm Learner**, I want tree algorithms to use dedicated SVG hierarchical projections and graph algorithms to use topology node-link layouts, so that each algorithm is presented in its most natural visual format.
3. As an **Algorithm Learner**, I want the dual-stack queue visualizer to clearly show elements flowing between `inStack` and `outStack` directly on the canvas without wrapped card borders, so that the FIFO queue emulation is visually immediate.
4. As an **Algorithm Learner**, I want input controls to be tightly sized to the expected input data (e.g. 40px for numbers, 120px for short arrays), so that the header looks balanced and professional.
5. As an **Algorithm Learner**, I want preset buttons to align cleanly on wrap without breaking into disjointed sub-panels, so that switching examples feels smooth and cohesive.
6. As an **Algorithm Developer**, I want to create a new visualizer by writing a single declarative config spec in TypeScript without creating separate HTML and CSS files, so that I don't repeat boilerplate code.
7. As an **Algorithm Developer**, I want the framework to automatically handle dark code terminal mounting, scrubber scrubbing, step timing, and log updates, so that I only write the domain step-generation algorithm.
8. As a **Core Maintainer**, I want global layout adjustments (such as theme color tokens or spacing) to be modified in one place and apply instantly across all 151+ algorithms, so that there is zero layout drift.
9. As a **Core Maintainer**, I want algorithm IDs, titles, categories, and loader routes to derive from a single type-safe source of truth, so that runtime route blank-screen bugs are impossible by construction.
10. As a **QA Engineer**, I want automated headless tests to assert the step correctness of every algorithm without needing real DOM rendering, so that test suites run in seconds.

---

## Implementation Decisions

### 1. 声明式配置接口规范 (Declarative Algorithm Spec Interface)

每个算法定义为一个纯数据与逻辑模块：

```typescript
export interface InputControlDef {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  defaultValue: any;
  width?: string; // 紧凑宽度如 '45px', '120px'
  placeholder?: string;
  options?: { label: string; value: any }[];
}

export interface PresetCaseDef {
  label: string;
  values: Record<string, any>;
}

export interface MetricCardDef {
  id: string;
  label: string;
  getValue: (step: any) => string | number;
  color?: string;
}

export interface DeclarativeAlgorithmSpec<TStep> {
  id: string;
  name: string;
  category: string;
  badge: { mode: string; complexity: string };
  codeLanguages: Record<string, string[]>;
  problemHtml: string;
  analysisHtml: string;
  inputs: InputControlDef[];
  presets?: PresetCaseDef[];
  modes?: { id: string; label: string }[];
  canvasAdapter: 'tree' | 'graph' | 'array-track' | 'dp-grid' | 'dual-structure' | 'histogram' | 'custom';
  metrics: MetricCardDef[];
  buildSteps: (inputs: Record<string, any>, mode?: string) => TStep[];
  renderCanvas: (container: HTMLElement, step: TStep, canvasState?: any) => void;
}
```

### 2. 区分「可统一」与「不可统一」的边界

| 模块区域 | 处理策略 | 实现方案 |
| :--- | :--- | :--- |
| **顶栏 Header** | **强制统一** | 由 Shell 根据 `inputs` 与 `presets` 自动生成，统一紧凑宽度与单框预设栏 |
| **代码终端** | **强制统一** | 由 `DarkCodeTerminalPresenter` 统一挂载，支持 Java/C++/Python/JS 切换与题目解析 |
| **时间轴控制器** | **强制统一** | 由 `PlaybackCoordinator` 统一驱动步数进度条、播放暂停与速度切换 |
| **执行日志流** | **强制统一** | 统一由 Shell 渲染步骤序号与彩色操作标签 |
| **Card 1 沙盘画板** | **分类适配** | 采用 6 大领域 Adapter，严禁一刀切破坏领域表达 |
| **Card 2 状态指标** | **配置化统一** | 根据 `metrics` 声明自动渲染指标条与实时输出列表 |

### 3. 强制去框规则 (Zero-Subbox Design Rule)

- **外层**：Card 1 与 Card 2 外部保留标准 1 层微边框卡片（`border: 1px solid #e2e8f0; background: #ffffff;`）。
- **沙盘层**：沙盘内部背景为平整浅灰（`#f8fafc`），**严禁在沙盘内出现带 border 的白色卡片**。
- **元素层**：元素（树节点、图节点、数组项、栈元素）直接在画布背景上浮现，通过行间距、虚线分割线和微型胶囊（Chip）区隔，消除“框套框”。

---

## Testing Decisions

1. **无头推导逻辑测试 (Headless Step Tests)**：
   - 针对每个算法的 `buildSteps` 函数进行纯数据断言，验证不同输入用例下的状态转移正确性，不依赖任何浏览器 DOM。
2. **声明式 Spec 结构完整性审计 (Spec Integrity Auditor)**：
   - 在 `fidelity-auditor.test.ts` 中遍历所有算法 Spec，确保输入控件 ID、指标字段、多语言代码行号及题目 HTML 100% 完备。
3. **画板去框断言 (De-boxing DOM Guard)**：
   - 在组件挂载测试中检查沙盘容器的子节点结构，断言沙盘内部不存在多余的 `.mq-subcard`, `.tt-subcard` 等多层嵌套边框类名。

---

## Out of Scope

1. **不修改各算法的数学与数据结构核心推导逻辑**：原有的 BFS、DFS、DP 状态转移与双指针推导逻辑完全保持原貌。
2. **不引入重型前端框架（如 React/Vue）**：继续保持高性能、零框架依赖的纯 TypeScript / Vanilla DOM 架构，确保毫秒级启动与极低资源消耗。

---

## Further Notes

- 重构采用**平滑渐进迁移策略**：
  1. 先落地 `DeclarativeStagePresenter` 核心引擎并为基础领域（如 Stack、Array、Tree）建立通用配置样板；
  2. 验证去框效果与多语言调试完全一致后，逐步批量注销旧有的 151 个 `.html` 文件；
  3. 保留所有现有自动化测试，确保重构过程 100% 零回归。
