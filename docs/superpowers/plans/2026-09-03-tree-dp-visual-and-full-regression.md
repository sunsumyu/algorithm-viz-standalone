# 树型 DP 可视化呈现优化与 DP 全量模型自动化回归方案

## 背景与问题目标

在用户提供的截图中，LeetCode 2458（二叉树移除子树后高度）等树型 DP 题目在 `stage-explorer-lite.html` 阶段 3（状态转移/推演）下存在显著的视觉错位：
1. **画布分类误判**：`ProblemDimensionResolver` 将所有树型题目归类为 `'1d-linear'`，导致页面强制展示“一维状态槽位 (1x6) 3D立体”与斜二测 3D 猫咪方块。
2. **树型画布被掩盖**：`VisualizerAppController.stage3SubView` 默认设为 `'matrix'`，且由于 `m === 1`，顶栏子视图切换条被隐藏，导致题目精心构建的 `step.treeRoot`（二叉树/DFN 剪枝态）无法在阶段 3 展现。
3. **违反设计原则**：违反了项目 `ui-layout-design` 中的 **主画布优先 (Canvas Dominance)** 与 **消除冗余 (Zero Redundancy)** 原则。

同时，针对用户提出的“第 1 项与第 3 项”需求，我们在完成树型 DP 可视化体验重构后，将对全量已实现的 30+ 道动态规划算法开展多端、多语言与行号联动的系统性回归扫描。

---

## 拟定技术方案

### 阶段一：树型 DP 可视化呈现与自适应布局优化 (Task 1)

1. **维度解析器扩展 (`ProblemDimensionResolver`)**：
   - 在 `src/core/resolvers/problem-dimension-resolver.ts` 中引入 `TREE_PROBLEM_IDS` 集合（覆盖 `height-removal-queries`, `minimum-score-after-removals`, `party-without-boss`, `max-path-sum`, `tree-diameter`, `binary-tree-cameras`, `course-selection`, `minimum-fuel-cost`, `longest-path-different-characters`, `max-distance-in-tree`, `largest-bst-subtree` 等）。
   - 若命中或参数中包含 `root` / `queries` / `edges` 且无网格参数，归一化输出 `category: 'tree'`。

2. **视图控制器自适应 (`VisualizerAppController`)**：
   - 初始化时感知 `resolved.category === 'tree'`，自动将 `stage3SubView` 初始化为 `'tree'`。
   - 在树型模式下，优化 Card 1 与 Card 2 容器展示：
     - 若为树型模式，隐藏纯网格专用 3D 控制按钮与 1D 槽位沙盘；
     - 主画布全屏/自适应聚焦展现 SVG 递归树/状态依赖树，节点展示 DFN 序、剪枝态、子树异或或子树高度。

3. **渲染器适配器完善 (`StateSpacePresenter` & `StageViewPresenter`)**：
   - 树型算法在阶段 3 下，当 `step.treeRoot` 存在且无 2D 矩阵时，直出 `RecursionTreeAdapter.renderRecursionTree`，不降级为 1D 滚动数组。
   - Card 1 标题同步更新为 `🌲 二叉树与拓扑依赖沙盘`，Card 2 更新为 `📊 状态转移推导与节点指标`。

---

### 阶段二：全量 DP 算法多端多语言联动与自动化回归扫描 (Task 2)

1. **自动化扫描套件**：
   - 编写/增强全量扫描测试用例，覆盖：
     1. 全量 DP 模型的 4 语言（Java, C++, Python, JavaScript）源码与语义行映射有效性。
     2. 验证所有阶段的 `anchorMap` 行号严格大于 0 且在代码行数上限之内。
     3. 验证每道题目执行器的 `generateSteps()` 在第一步、中间步、最后一步的行号与高亮均准确无误。
2. **运行全量测试套件并出具回归报告**：
   - 运行 DP 模块所有 spec 测试（`vitest run src/algorithms/categories/dynamic-programming/`）；
   - 运行全局保真度与架构守护测试。

---

## 变更文件列表

#### [MODIFY] [problem-dimension-resolver.ts](file:///f:/chain/algorithm-viz-standalone/src/core/resolvers/problem-dimension-resolver.ts)
- 增加 `TREE_PROBLEM_IDS` 白名单，正确返回 `category: 'tree'`。

#### [MODIFY] [problem-dimension-resolver.test.ts](file:///f:/chain/algorithm-viz-standalone/src/core/resolvers/problem-dimension-resolver.test.ts)
- 增加针对树型 DP 题目的维度与类别识别测试用例。

#### [MODIFY] [visualizer-app-controller.ts](file:///f:/chain/algorithm-viz-standalone/src/core/visualizer-app-controller.ts)
- 识别树型类别，默认启用 `'tree'` 子视图，并在树型题目下规避无关的 1D 槽位渲染。

#### [MODIFY] [state-space-presenter.ts](file:///f:/chain/algorithm-viz-standalone/src/core/renderers/state-space-presenter.ts)
- 完善阶段 3 下树型题目的直出逻辑与卡片标题自适应。

#### [MODIFY] [stage-view-presenter.ts](file:///f:/chain/algorithm-viz-standalone/src/core/renderers/stage-view-presenter.ts)
- 同步阶段 3 Card 2 呈现逻辑。

#### [NEW] [dp-full-regression.test.ts](file:///f:/chain/algorithm-viz-standalone/src/core/dp-full-regression.test.ts)
- 全量 DP 模型 4 语言行号与单步代码高亮联动回归测试。

---

## 验证计划

### 自动化测试
- `npx vitest run src/core/resolvers/problem-dimension-resolver.test.ts`
- `npx vitest run src/core/dp-full-regression.test.ts`
- `npx vitest run src/algorithms/categories/dynamic-programming/`
- `npx vitest run src/core/universal-model-fidelity.test.ts`

### 手动与视觉验证
- 打开 `stage-explorer-lite.html?model=height-removal-queries`，验证：
  1. Card 1 / Card 2 不再出现 1D 槽位和 3D 猫咪平台；
  2. 居中完整展示二叉树 SVG 结构，第 2 步切除节点 4 子树时呈现已剔除（`inactive`）态；
  3. 右侧代码面板第一步高亮第 8 行，第二步高亮第 17 行，第三步高亮第 19 行，联动平滑自然。
