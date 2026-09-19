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

## 动态规划（DP）顶层黄金规约（死门禁！）
所有动态规划算法重构或新增，**必须严格执行 `universal-dp-refactoring` Skill**，并无条件通过六项交付核验：
1. **严禁外围框架**：绝对禁止调用 `registerDeclarativeAlgorithm`（这是非 DP 算法用的）。
2. **清理先验遮蔽**：若 `src/algorithms/categories/dynamic-programming/` 下存在历史手写 `*-renderer.ts`，必须清除其注册或移除文件，严防遮蔽顶层注册。
3. **顶层黄金链路**：
   - 领域事实源：`src/core/models/<id>.yaml`（包含 4 阶段代码与顺逆推）
   - 仓储静态注册：`AlgorithmModelRepository.registerModel`
   - 策略编译器：`IAlgorithmStrategy` 生成全量 `UniversalStep`
   - 统一挂载宿主：`dp-generated-renderers.ts` 统一注册为 `Visualizer: UniversalStageVisualizer`
4. **视觉必须对齐 115 标杆**：必须具备顶栏 Stage 胶囊（`[1 递归]` `[2 记忆化]` `[3 递推DP]` `[4 空间压缩]`）、右侧 `[➜ 顺推]` / `[← 逆推]` 双向切换、Card 1 状态网格与移动实体、Card 2 业务专属看板。


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
