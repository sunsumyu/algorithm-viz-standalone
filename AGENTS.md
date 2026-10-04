# AGENTS.md — algorithm-viz-standalone

## 项目概览
Tauri + Vite 算法可视化桌面应用（586 个算法），前端 TypeScript、Vite 6 + vitest，Tauri 2 Rust 后端。

## 算法实现与重构前置门禁 (Pre-Flight Verification & Bi-Version Synthesis)
在编写、接入或修改任何算法前，必须执行前置检索与长处整合：
1. **全库四维查重 (Four-Dimensional Deduplication)**：
   - **LeetCode / 权威题号**：如 `grep "102"`、`grep "236"`；
   - **英文函数名 / 类名**：如 `grep "levelOrder"`、`grep "lowestCommonAncestor"`；
   - **中文核心关键词**：如 `grep "层序遍历"`、`grep "最近公共祖先"`；
   - **全量元数据与目录**：核验 `src/algorithms/categories/` 与 `src/core/algorithm-catalog.generated.ts`。
2. **双版本长处综合整合 (Bi-Version Synthesis, NOT Deletion)**：
   若库内已存在对应算法或出现两个版本，综合提取两者的长处进行深度融合，确立单一事实来源：
   - **旧版本长处**：参数输入框（`inputs`）、丰富典型预设用例（`presets` 案例下拉选择）、成熟稳定的 SVG/Canvas 画布渲染器与边界处理；
   - **新版本长处**：体系化名师讲义（`problemHtml`）、Java/C++/Python/JS 四语言精准 1-based 行号联动（`codeLanguages` / `codeLine`）、Stage 演化阶段；
   - **唯一事实来源与别名统合（Aliases）**：将两者长处融为一体，保留核心主 ID，将课号/别名加入 `aliases: [...]`，消除平行割裂。

## 元数据规范
算法元数据的**唯一手写源**是各 renderer 的注册调用（`registerDeclarativeAlgorithm` / `registerAlgorithm` / `dp-generated` 三种方言）。

### 加算法流程
1. 执行第 0 步四维查重；若已存在，转入「双版本长处综合整合」；
2. 若确实为全库全新算法，在 `src/algorithms/categories/<类目>/` 下写 `*-renderer.ts` 自注册；
3. 把 import 加进对应的 `batch-N-index.ts`；
4. 若新类目：在 `algorithm-loader.ts` 的 `BATCH_LOADERS` 里加一行；
5. 运行 `npm run meta:sync` → 生成物自动更新 → `git diff src/core/algorithm-catalog.generated.ts` 确认。

*注：`algorithm-catalog.generated.ts` 为脚本全自动投影产物，修改通过更新 renderer 元数据并运行 `npm run meta:sync` 同步。*

### 删算法流程
1. 删除 renderer 文件；
2. 从 `batch-N-index.ts` 移除 import；
3. 运行 `npm run meta:sync` 自动同步目录生成物。

## 动态规划与贪心顶层抽象架构规范
所有新算法接入或重构，作为领域适配器（Domain Adapter）接入统一核心编译器：
1. **统一核心编译器分发**：避免为单题新建私有编译器，核心算法归约至统一编译器族群（详见 `CONTEXT.md`）：
   - 线性 1D DP 族 $\rightarrow$ `LinearStepMatrixCompiler`
   - 背包族 $\rightarrow$ `KnapsackStepMatrixCompiler`
   - 双序列矩阵 DP 族 $\rightarrow$ `SequenceStepMatrixCompiler`
   - 区间接力与覆盖族 $\rightarrow$ `IntervalRelayStepCompiler`
   - 区间调度与互斥合并族 $\rightarrow$ `IntervalSchedulingStepCompiler`
   - 双向前后缀与邻域扫描族 $\rightarrow$ `TwoPassNeighborStepCompiler`
   - 网格探索 DP 族 $\rightarrow$ `GridUniquePathsCompiler`
   - 树形展开与记忆化 $\rightarrow$ `StateDependencyTreeCompiler`
2. **策略类身材红线 (LOC < 120 行)**：单题 `*Strategy.ts` 的职责是「提取入参、规约转换与委托调用」，源码控制在 120 行以内。
3. **强制自省门禁**：策略或算法变更后必须依次运行以下门禁：
   ```bash
   npm run test:gate         # 顶层抽象合规 + 策略身材红线门禁
   npm run test:presentation # 表现层真实渲染契约与 14 大红灯陷阱全套拦截
   ```
   所有自省门禁以 Exit Code 0 为唯一通过判据。若退出码非 0，必须从控制台提取【红灯陷阱编号】与【纠偏指引】自愈修复生产代码，直至全绿方可宣布完成。

## 浏览器可视化调试与视口规范
进行浏览器端 UI 调试、Puppeteer 自动化交互或截图核验时，严格遵循 `browser-viewport-debugging` Skill：
1. **显式全高清视口参数**：每次截图与视口设置必须显式指定：
   ```json
   { "name": "...", "width": 1920, "height": 1080 }
   ```
2. **响应式双栏核验**：确保视口宽度 $\ge 1024\text{px}$ 激活 Tailwind `lg:flex-row` 左右双栏排布（左侧 50% 状态空间沙盘 + 右侧 50% 暗色代码终端）。

## 会话生命周期与人在回路（HITL）协同纪律
1. **150k 智能区与看板流（Kanban WIP=1）**：单次会话聚焦单个垂直切片，防止上下文注意力稀释。
2. **GEC 极简微循环（Grill ➔ Execute ➔ Clear）**：
   - **Grill（盘问）**：四维查重与数学规约；遇到设计或版本整合分歧时向人类提结构化多选项（带 `(Recommended)`）；
   - **Execute（执行）**：TDD 红绿循环驱动；交付前执行双轴审查（纯 TS/1-based 行号/断言无篡改）；
   - **Clear（清空）**：门禁全绿并 Git 提交后，清空会话（`/clear`）。
3. **HITL 任务分流原则**：UI 交互手感、双版本整合与架构决策由人类定夺；局部单测自愈与格式对齐由 Agent 自主闭环。

## 步进生成器颗粒度与代码联动规范
1. **严格一行一步与零静默（Strict One-Line-One-Step）**：代码面板完整展示被调用的辅助函数。每一次状态变更映射到具体代码行，杜绝高亮冻结（Zero Line Freezing）与静默跳步。
2. **多分支递归独立分行（Independent Branch Unfolding）**：将复合递归调用或多向探测在模板中展开为独立分行（如 `int leftDepth = ...` 与 `int rightDepth = ...`），使光标精准跳入各分支。
3. **递归推演五段式生命周期**：
   - 📥 **函数入口帧**：带着实参进入函数头；
   - 🔍 **边界判空与基底帧**：高亮判空行，显式求值；
   - 🎯 **叶节点与特判帧**：命中返回基底；
   - 🔀 **深入分支调用帧**：高亮子调用语句并深入子树；
   - 🔄 **后序归约与返回帧**：子调用结果就绪，高亮计算并向父层返回。
4. **测试契约先行**：单测断言步骤密度下限，强校验 `codeLine` 存在且覆盖核心生命周期行。

## 测试契约不可篡改与安全隔离
1. **测试断言不可篡改（Immutable Test Contracts）**：既有测试断言不可私自删改、注释或弱化为软断言。报错必须通过修改业务实现自愈。
2. **契约先行防假绿灯**：测试契约依据原题与规范先行定义（RED 先行）。
3. **爆炸半径与安全隔离（Small Blast Radius）**：单任务严格聚焦目标算法垂直切片，隔离顶层核心协议与无关模块，保持 Git 历史非破坏性演进。

## 纯 TypeScript 规范
全库统一使用强类型 TypeScript：
1. **统一 TS 扩展名**：`scripts/` 下的工具脚本、临时脚本或测试辅助代码一律使用 `.ts`。
2. **遇到 JS 改造为 TS**：发现遗留 `.js` / `.mjs` / `.cjs` 文件，改造为强类型 `.ts` 文件，删除原 JS 文件，并用 `vite-node` 或 `vitest` 执行。
3. **npm scripts 对齐**：`package.json` 中的命令如果执行脚本，统一使用 `vite-node scripts/*.ts`。

## 核心校验门禁与测试规范 (Verification Gates)
日常开发与构建脚本以 `package.json` 为单一源。任务交付前必须按顺序通过以下硬门禁（以 Exit code 0 为准）：
```bash
npm run meta:sync         # 1. 算法目录与元数据索引同步（生成物自动反映）
npm run typecheck         # 2. 全库 TypeScript 强类型校验（零报错）
npm run test:gate         # 3. 顶层抽象合规 + 策略身材红线门禁
npm run test:presentation # 4. 表现层真实渲染与 14 大红灯陷阱全套拦截
```
- **伴生测试拓扑（Co-located Tests）**：核心深模块（`algorithm-registry` 等）与类目算法均采用同目录伴生 `.test.ts` 结构。



## 目录结构
```
src/
  core/                          # 框架深模块（~52k LOC）
    algorithm-catalog.generated.ts  # 生成物：由 meta:sync 自动投影生成
    algorithm-catalog-indexer.ts    # 收获器：从注册表投影目录
    algorithm-registry.ts           # 注册中心：播种 + 惰性解析
    algorithm-loader.ts             # 分包加载：类目 → batch 动态 import
    declarative-algorithm-visualizer.ts  # 声明式注册入口
    renderers/                      # 领域视觉适配器（IVisualRenderer）
    controllers/                    # 中介者层（VisualizerMediator 等）
    strategies/                     # 多态算法策略（IAlgorithmStrategy）
  algorithms/
    categories/<类目>/*-renderer.ts  # 单算法垂直切片（step + render + spec）
    batch-N-index.ts                # 批量索引（副作用 import 列表）
```

## 技能总线与指针索引（Agent Skills Index）
按需唤起 `.agents/skills/` 下的垂直技能：
| 任务场景 | 唤起技能 | 核心职责与防腐边界 |
| :--- | :--- | :--- |
| **新算法编写与高亮审查** | `algo-viz-authoring` | 四维查重、双版本整合、四语言 1-based 行号绑定、严格一行一步 |
| **动态规划类目标准化重构** | `universal-dp-refactoring` | 仅限 `dynamic-programming` 类目；遵循 YAML 黄金基准与穿甲弹多阶段工序 (Phase 1~4) |
| **顶层抽象合规检查** | `top-level-abstraction-compliance` | 运行 L0/L1/L2 顶层抽象与防伪实现门禁，阻断违规旧方言反弹 |
| **UI 交互与去套娃规范** | `ui-layout-design` | 黄金画布 60%~70% 占比、消灭嵌套卡片与中英冗余、Splitter 边界保护 |
| **浏览器调试与全高清截图** | `browser-viewport-debugging` | 强制 1920×1080 视口配置，杜绝 800×600 局促缩放与大面积空白留白 |

## 关键接缝
- **AlgorithmMetadata ↔ AlgorithmManifest**：metadata 是 9 字段目录数据；manifest = metadata + template + Visualizer
- **IVisualRenderer**：mount/updateStep/dispose 生命周期桥接 2D/3D
- **IAlgorithmStrategy**：canHandle/generateSteps 策略分发
- **DeclarativeAlgorithmSpec**：声明式配置 → 自动编译 HTML 骨架 + 注册

## 术语统一（CONTEXT.md）
本项目的领域术语定义在 `CONTEXT.md`，所有代码注释与 PR 描述使用其中的标准名称：
AlgorithmSpec / DpStepEngine / DpTraceStep / VisualAdapter / CodeSync / CodeStepIndexer /
EvolutionStrategyDispatcher / ProblemDimensionResolver / StageCodeCompiler / StateSpacePresenter /
PlaybackCoordinator / AlgorithmRegistry / AlgorithmCatalogIndexer / CategoryConventionLoader / StepBase

