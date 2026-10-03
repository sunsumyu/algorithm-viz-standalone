# AGENTS.md — algorithm-viz-standalone

## 项目概览
Tauri + Vite 算法可视化桌面应用（586 个算法），前端 TypeScript、Vite 6 + vitest，Tauri 2 Rust 后端。

## 算法实现与重构前置死门禁（死门禁！强制查重 + 双版本长处综合整合，严禁直接删掉）
在动手编写、接入或修改任何算法前，**必须强制执行查重与版本整合规范**：
1. **强制前置四维查重（第 0 步门禁）**：严禁拿到需求直接新建文件！必须先无条件执行全库四维检索：
   - **LeetCode / 权威题号**：如 `grep "102"`、`grep "236"`；
   - **英文函数名 / 类名**：如 `grep "levelOrder"`、`grep "lowestCommonAncestor"`；
   - **中文核心关键词**：如 `grep "层序遍历"`、`grep "最近公共祖先"`；
   - **全量元数据与目录**：核验 `src/algorithms/categories/` 与 `src/core/algorithm-catalog.generated.ts`。
2. **双版本长处综合整合（Bi-Version Synthesis, NOT Deletion）**：
   - 若库内已存在对应算法或出现两个版本，**绝对严禁另起炉灶建平行文件，更绝对严禁粗暴删除其中任一版本**！
   - **必须综合提取两个版本的长处进行深度融合整合**：
     - **旧版本长处**：细致打磨的参数输入框（`inputs`）、丰富的典型预设用例（`presets` 案例下拉选择）、成熟稳定的 SVG/Canvas 画布渲染器与边界处理；
     - **新版本长处**：体系化名师讲义（`problemHtml`）、Java/C++/Python/JS 四语言精准 1-based 行号联动（`codeLanguages` / `codeLine`）、深度解构的 Stage 演化阶段；
     - **唯一事实来源与别名统合（Aliases）**：将两者长处融为一体，保留核心主 ID，将课号/别名加入 `aliases: [...]`，保持全库单一事实来源，消除平行冗余。

## 元数据规范（重要！）
算法元数据的**唯一手写源**是各 renderer 的注册调用（`registerDeclarativeAlgorithm` / `registerAlgorithm` / `dp-generated` 三种方言）。

### 加算法的正确流程
1. **先执行第 0 步四维查重**；若已存在，转入「双版本长处综合整合」，严禁新建；
2. 若确实为全库全新算法，在 `src/algorithms/categories/<类目>/` 下写 `*-renderer.ts`，自注册；
3. 把 import 加进对应的 `batch-N-index.ts`；
4. 若新类目：在 `algorithm-loader.ts` 的 `BATCH_LOADERS` 里加一行；
5. 运行 `npm run meta:sync` → 生成物自动更新 → `git diff src/core/algorithm-catalog.generated.ts` 确认。

**禁止**手写编辑 `algorithm-catalog.generated.ts`——它是生成物。

### 删算法
1. 删 renderer 文件
2. 从 `batch-N-index.ts` 删 import
3. `npm run meta:sync` → 生成物自动反映

## 动态规划与贪心顶层抽象架构硬门禁（死门禁！严禁单题私建编译器）
所有新算法接入或重构，**必须先进行数学归约，作为领域适配器（Domain Adapter）接入统一核心编译器，严禁重复造轮子**：
1. **严禁私有编译器膨胀**：除核心深模块基建外，绝对禁止为单一题目新建几百行的 `*-compiler.ts`（如 `min-taps-compiler.ts` 是严重反模式）。
2. **核心编译器族群字典**（详见 `CONTEXT.md`）：
   - 线性 1D DP 族 $\rightarrow$ `LinearStepMatrixCompiler`
   - 背包族 $\rightarrow$ `KnapsackStepMatrixCompiler`
   - 双序列矩阵 DP 族 $\rightarrow$ `SequenceStepMatrixCompiler`
   - 区间接力与覆盖族 $\rightarrow$ `IntervalRelayStepCompiler`
   - 区间调度与互斥合并族 $\rightarrow$ `IntervalSchedulingStepCompiler`
   - 双向前后缀与邻域扫描族 $\rightarrow$ `TwoPassNeighborStepCompiler`
   - 网格探索 DP 族 $\rightarrow$ `GridUniquePathsCompiler`
   - 树形展开与记忆化 $\rightarrow$ `StateDependencyTreeCompiler`
3. **策略类身材红线（LOC < 120 行）**：单题 `*Strategy.ts` 的唯一职责是「提取入参、规约转换与委托调用」，体积严禁超过 120 行。
4. **强制自省门禁命令（死门禁！严禁伪绿灯）**：任何策略或算法修改、新增或重构后，必须运行：
   ```bash
   # 1. 顶层抽象架构合规硬门禁（全库锁死零退化，杜绝旧方言）
   npx vitest run src/core/top-level-abstraction-compliance.test.ts

   # 2. 策略引擎身材红线与防私有编译器门禁
   npx vitest run src/core/strategies/top-level-abstraction.gate.test.ts

   # 3. 表现层真实渲染契约与全景红灯陷阱门禁（DOM 契约零重复、零脑裂、零污染）
   npm run test:presentation
   ```
   若测试未通过，**必须严格阅读控制台报错中的【红灯陷阱编号】与【纠偏指引】自动自愈修复**，严禁未经通过便交付！
   - **DOM 契约硬红线**：严禁上下卡片镜像重复、严禁一维槽位受二维表格污染、严禁标题与渲染内容脑裂、严禁徽章尺寸撒谎、严禁页面泄露 `[object Object]`！
## 浏览器可视化调试与视口规范（死门禁！严禁默认低分辨率截图）
进行任何浏览器端 UI 调试、Puppeteer 自动化交互或截图核验时，**必须强制加载并遵循 `browser-viewport-debugging` Skill**：
1. **严禁裸调默认截图**：严禁调用不带分辨率参数的 `puppeteer_screenshot`（Puppeteer 默认会重设为 800×600，导致页面缩死在左上角且在大屏出现大面积无内容空白留白）。
2. **强制全高清视口参数**：每次截图与视口设置必须显式指定：
   ```json
   { "name": "...", "width": 1920, "height": 1080 }
   ```
3. **响应式双栏核验**：确保视口宽度 $\ge 1024\text{px}$ 激活 Tailwind `lg:flex-row` 左右双栏黄金排布（左侧 50% 状态空间沙盘 + 右侧 50% 暗色代码终端），严禁以移动端退化折叠态交付。


## 会话生命周期与人在回路（HITL）协同纪律（死门禁！GEC 微循环与看板流）
为彻底对抗 LLM 的注意力坍塌（Lost in the Middle）与复合错误（$0.9^{10} \approx 35\%$），执行最高人机协同纪律：
1. **150k 智能区与看板流（Kanban WIP=1）**：拒绝僵化超长瀑布计划；单次会话只聚焦单个垂直切片卡片，严禁跨题混跑，防止注意力稀释。
2. **GEC 极简微循环（Grill ➔ Execute ➔ Clear）**：
   - **Grill（盘问）**：四维查重与数学规约；遇设计或双版本分歧向人类提结构化多选项（带 `(Recommended)`），由人类拍板；
   - **Execute（执行）**：TDD 红绿循环驱动；交付前执行「双轴审查」（规范轴：纯TS/1-based行号；契约轴：14大陷阱/断言无篡改）；
   - **Clear（清空）**：门禁全绿并 Git 提交后，**必须清空会话（`/clear`）**，彻底清空历史废气。
3. **HITL 任务分流原则**：涉及 UI 交互手感、双版本整合与架构决策必须人类在场定夺（拿不准可用抛弃型原型验证后销毁）；局部单测自愈与格式对齐由 Agent 自主闭环。

## 测试防篡改与防爆舱死门禁（死门禁！严禁偷删测试、严禁自测假绿灯）
1. **测试断言不可篡改（No Test Tampering）**：严禁为了跑通门禁私自删改、注释已有测试断言，严禁将精准断言篡改为软断言（如 `toBeGreaterThanOrEqual(0)`）；报错必须通过修改业务实现自愈，严禁“改测试迎合错误实现”。
2. **防自写自测假绿灯（No Self-Authored Mock Tests）**：严禁让 AI 编写迎合自身错误逻辑的伪单测。测试契约必须依据权威原题与讲义严格先行（RED 先行，人类或断言契约守门）。
3. **爆炸半径与安全隔离（Small Blast Radius）**：单任务严格聚焦目标算法垂直切片，严禁越界修改系统顶层核心协议或无关模块；严禁执行任何破坏性 Git 指令（`git push -f`、`git reset --hard` 等）。

## 纯 TypeScript 规范（死门禁！遇到 JS 改成 TS）
全库统一使用强类型 TypeScript：
1. **禁止新建任何 JS 脚本**：包括 `scripts/` 下的工具脚本、临时脚本或测试辅助代码，一律使用 `.ts` 扩展名，严禁创建 `.js`、`.mjs`、`.cjs`。
2. **遇到 JS 必须改成 TS**：无论在任何环节发现遗留或新增的 `.js` / `.mjs` / `.cjs` 文件，必须立即将其改造为类型安全的 `.ts` 文件，删除原 JS 文件，并用 `vite-node` 或 `vitest` 执行。
3. **npm scripts 对齐**：`package.json` 中的命令如果执行脚本，统一使用 `vite-node scripts/*.ts`。

## 构建与测试
```bash
npm install
npm run dev               # Vite dev server (port 3000)
npm run build             # tsc + test:gate + vite build
npm test                  # vitest run（含门禁：目录新鲜度/唯一性/完整性）
npm run test:gate         # 顶层抽象合规 + 策略身材 + 表现层契约全套门禁
npm run test:presentation # 表现层真实渲染与 14 大红灯陷阱门禁测试
npm run meta:sync         # 重新收获算法目录元数据
npm run typecheck         # tsc -b --noEmit
```

## 目录结构
```
src/
  core/                          # 框架深模块（~52k LOC）
    algorithm-catalog.generated.ts  # 生成物：全量目录元数据（禁止手写）
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
根据工序按需唤起 `.agents/skills/` 下的垂直技能，严禁在无技能指引下盲目操作：
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

## 测试
- 核心模块有 co-located `.test.ts`（playback-coordinator / algorithm-registry / model-repository 等）
- 门禁测试 `algorithm-catalog-indexer.test.ts`：目录新鲜度 / id 唯一性 / renderer↔目录完整性
- 批量算法测试按类目目录 co-locate（如 `categories/beginner-and-hard-interview-5.test.ts`）
- 渲染器表现层契约由 `npm run test:presentation`（`presentation-contract.gate.test.ts` 与 `declarative-presentation-contract.gate.test.ts`）自动化拦截，覆盖 14 大红灯陷阱、纯净度与防重复渲染硬约束
