# AGENTS.md — algorithm-viz-standalone

## 项目概览
Tauri + Vite 算法可视化桌面应用（586 个算法），前端 TypeScript、Vite 6 + vitest，Tauri 2 Rust 后端。

## 元数据规范（重要！）
算法元数据的**唯一手写源**是各 renderer 的注册调用（`registerDeclarativeAlgorithm` / `registerAlgorithm` / `dp-generated` 三种方言）。

### 加算法的正确流程
1. 在 `src/algorithms/categories/<类目>/` 下写 `*-renderer.ts`，自注册
2. 把 import 加进对应的 `batch-N-index.ts`
3. 若新类目：在 `algorithm-loader.ts` 的 `BATCH_LOADERS` 里加一行
4. 运行 `npm run meta:sync` → 生成物自动更新 → `git diff src/core/algorithm-catalog.generated.ts` 确认

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
   - 网格探索 DP 族 $\rightarrow$ `GridUniquePathsCompiler`
   - 树形展开与记忆化 $\rightarrow$ `StateDependencyTreeCompiler`
3. **策略类身材红线（LOC < 120 行）**：单题 `*Strategy.ts` 的唯一职责是「提取入参、规约转换与委托调用」，体积严禁超过 120 行。
4. **强制自省门禁命令**：任何策略修改或新增后，必须运行：
   ```bash
   npx vitest run src/core/strategies/top-level-abstraction.gate.test.ts
   ```
   若测试未通过，**必须严格阅读控制台报错中的【数学归约】与【纠偏指引】自动自愈修复**，严禁未经通过便交付！
## 浏览器可视化调试与视口规范（死门禁！严禁默认低分辨率截图）
进行任何浏览器端 UI 调试、Puppeteer 自动化交互或截图核验时，**必须强制加载并遵循 `browser-viewport-debugging` Skill**：
1. **严禁裸调默认截图**：严禁调用不带分辨率参数的 `puppeteer_screenshot`（Puppeteer 默认会重设为 800×600，导致页面缩死在左上角且在大屏出现大面积无内容空白留白）。
2. **强制全高清视口参数**：每次截图与视口设置必须显式指定：
   ```json
   { "name": "...", "width": 1920, "height": 1080 }
   ```
3. **响应式双栏核验**：确保视口宽度 $\ge 1024\text{px}$ 激活 Tailwind `lg:flex-row` 左右双栏黄金排布（左侧 50% 状态空间沙盘 + 右侧 50% 暗色代码终端），严禁以移动端退化折叠态交付。


## 构建与测试
```bash
npm install
npm run dev          # Vite dev server (port 3000)
npm run build        # tsc + vite build
npm test             # vitest run（含门禁：目录新鲜度/唯一性/完整性）
npm run meta:sync    # 重新收获算法目录元数据
npm run typecheck    # tsc --noEmit
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
- 渲染器 `render*Canvas` 的 innerHTML/SVG 部分目前无自动化测试（手动验证）
