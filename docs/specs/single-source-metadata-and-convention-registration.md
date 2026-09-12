# Spec: 算法目录单一事实源与约定注册 (Single-Source Metadata & Convention Registration Spec)

`triage: implemented`

---

## Problem Statement

当前算法目录元数据存在**双写漂移**与**注册仪式分散**两个结构性问题：

1. **元数据双写漂移**：每个算法的 9 个元数据字段（id/name/viewId/category/description/icon/difficulty/levelOrder/learningGoal）在 renderer spec 里写一次，又手工抄进 `src/core/algorithm-manifests-meta.ts`（6,066 行 · 556 条 · 全库最热文件，2026-07 以来 80 次提交）。漂移已双向发生：
   - **正向漂移**：31 个 renderer 已注册的 id 不在手写清单中——首页目录在插件初始化快照（`plugins/algorithm-viz/index.ts:490`）后永不刷新，这些算法**对目录永久不可见**。当前工作区未提交的 8 个新算法即属此类。
   - **重复 id**：手写清单存在 6 个重复 id（`two-city-scheduling` 等，556 条 / 550 唯一），`scripts/check_duplicates.cjs`（2026-09-11 未提交）正以一次性脚本手工排查——同一问题已被人工反复对抗。
2. **注册仪式分散**：新增一个算法需改 4–6 个文件（renderer + batch-N-index + algorithm-loader 类目映射 + manifests-meta + catalog-icons + batch 测试）。batch 序号与类目是**多对多**映射（tree 类目横跨 11 个 batch 文件），"改哪个 batch"是部落知识。
3. **三种注册方言并存**：233 个 renderer 走 `registerDeclarativeAlgorithm`、262 个直调 `registerAlgorithm`、68 个 DP 生成算法（17 篇文章 + 51 个 DpStepEngine 演示，含 `house-robber`/`coin-change` 等）由 `dp-generated-renderers.ts` 在注册期以 `globalLevelOrder++` **运行时计算 levelOrder**——任何静态解析方案都无法覆盖第三种方言。

---

## Solution

基于**单一事实源（renderer 注册即唯一手写源）**与**约定优于配置（目录即注册）**收敛：

1. **AlgorithmCatalogIndexer（算法目录索引收获器）**：在 vitest 环境复用已被 `fidelity-auditor.test.ts` 验证的 `loadAllAlgorithmBatches()` 全量加载路径，**收获** `getAllMetadata()` 的完整元数据投影（9 字段），生成提交物文件 `algorithm-catalog.generated.ts`（替代手写清单）；配套 vitest 门禁断言**新鲜度**（重新收获 vs 已提交生成物 diff 为空）、**id 唯一性**与**renderer↔目录完整性**。
2. **CategoryConventionLoader（类目约定加载器）**：`import.meta.glob('categories/<category>/**/*-renderer.ts')` 按目录路径派生类目→chunk 映射，退役全部 30 个 batch 索引文件与 `algorithm-loader.ts` 的手工 `BATCH_LOADERS` 映射。

---

## User Stories

1. As an **Algorithm Learner**, I want every registered algorithm to appear in the home catalog without exception, so that "registered but invisible" states are impossible by construction.
2. As an **Algorithm Contributor**, I want adding a new algorithm to mean writing exactly one renderer file under its category directory, so that my PR touches nothing else and can never conflict with concurrent batches.
3. As a **Core Developer**, I want catalog metadata derived from the real registration fallback logic (not a parallel copy of it), so that `registerDeclarativeAlgorithm` 的 fallback 语义（`viewId || 'algo-${id}-view'` 等）只在代码里存在一份。
4. As a **Core Developer**, I want the derivation to cover all three registration dialects (declarative / direct / dp-generated with runtime levelOrder), so that no algorithm family is systematically excluded.
5. As a **QA Engineer**, I want a vitest gate that fails when a renderer registers an id absent from the committed catalog, when the catalog contains duplicate ids, or when the catalog is stale, so that today's 8-invisible-algorithms bug would have been a red test on the contributor's machine.
6. As a **Maintainer**, I want the 6,066-line hottest file out of the change stream, so that feature batches stop paying the hand-copy tax.

---

## Implementation Decisions

### R1 · 排期：先 C1 后 C2，两个独立 PR
C1（单一事实源）先行止血——当前 8 个算法目录不可见的漂移立即消除；C2（约定注册）作为独立第二步，风险隔离。

### R2 · 唯一手写源：renderer spec / 注册调用本身
不做独立 manifest 文件（那是把手抄换成文件拆分，仍要维护两处对应）。

### R3 · 派生机制：运行时收获（harvest），不做 AST 静态解析
- vitest 环境已证明可全量加载 30 个 batch 索引（`fidelity-auditor.test.ts:8-26` 即此路径）；
- 68 个 dp-generated id 的 levelOrder 是注册期 `globalLevelOrder++` 算出的，静态解析拿不到；
- 收获天然复用生产 fallback 逻辑，覆盖三种注册方言，零解析脆弱性。

### R4 · 生成物形态：提交物（committed）+ 新鲜度门禁，不加 prebuild hook
- `npm run meta:sync`：收获并写 `src/core/algorithm-catalog.generated.ts`（导出同名 `ALL_ALGORITHM_METADATA`，形状与现状完全一致）；
- vitest 门禁：正常 `npm test` 时在内存中重新收获，与已提交生成物 diff，不一致即失败，失败信息提示运行 `meta:sync`；
- dev / build 流程零改动（`build` 不需要新 hook）。

### R5 · 字段调和：一次性数据迁移，手写清单的富文本回填进 spec
手写清单中 description/viewId 优于 spec fallback 的条目，迁移期脚本辅助 diff 后**回填进 renderer spec**；此后 spec 为唯一源。viewId 双约定（`algo-*-view` vs DP 的 `def.id`）保留现状——统一它不是本 spec 的目标。

### R6 · 重复 id：门禁判错，迁移期先行去重
收获自 Map 天然去重；6 个重复 id 在切换前人工裁决（保留已成功注册的定义，另一个改名或删除），之后门禁把清单内重复 id 定为错误。

### R7 · glob 粒度：per-file glob，按路径前缀归类目
`import.meta.glob('.../categories/*/*-renderer.ts', { eager: false })` → 每 renderer 一个 chunk（约 501 个）；tree 类目的请求数与今天（11 个 batch chunk）同量级、缓存粒度更细；Tauri 本地文件系统下请求开销可忽略。`manualChunks` 按类目合并留待实测后再议（YAGNI）。约束：所有注册副作用的文件必须位于其类目目录下（`dp-generated-renderers.ts` 已满足）。

### R8 · 迁移序列（渐进式，每步测试保持绿灯）

| 步骤 | 内容 | 验证 |
|---|---|---|
| 0 | 收获脚本首跑，产出与手写清单的**调和 diff 报告**：meta-only 死条目、字段级分歧（description/viewId）、6 个重复 id、31 个目录缺失 id | 人工裁决清单 |
| 1 | 富文本字段回填进 spec；重复 id 去重 | `meta:sync` 幂等 |
| 2 | `algorithm-registry.ts:13` 改 import 生成物；旧手写文件删除；4 个测试文件 import 路径不变（同名导出） | 全部既有测试（含 curriculum-filter 的 stats 断言）通过 |
| 3 | 新鲜度 + 唯一性 + 完整性门禁上线 | 故意漏注册一个 renderer → 红灯 |
| 4 | （独立 PR）C2：glob 约定加载，删 30 个 batch 索引与 `BATCH_LOADERS` | `fidelity-auditor.test.ts` 全量加载契约不变 |

### R9 · 测试影响面（已核查，形状不变即绿灯）
- 生产代码**唯一**消费方是 `algorithm-registry.ts:13`（构造器播种）；
- 4 个测试消费方（fidelity-auditor / algo-viz-skill-audit / curriculum-filter / dp-algorithms-audit）全部只依赖数组形状与 `.length`/`.filter` 语义，生成物保持同名同形导出即可；
- `curriculum-filter.test.ts` 的 `stats.total === ALL_ALGORITHM_METADATA.length` 在去重后以 550 计仍成立。

---

## 拟新增领域术语（确认后写入 CONTEXT.md）

- **AlgorithmCatalogIndexer（算法目录索引收获器）**：从真实注册表收获全量目录元数据并落盘为生成物、以 vitest 门禁保障新鲜度与完整性的深模块。
- **CategoryConventionLoader（类目约定加载器）**：以目录路径约定派生类目→chunk 映射、取代手写 batch 索引的加载深模块。

## 关联

- 兑现 `docs/specs/declarative-visualizer-and-domain-adapters.md` 用户故事 9（"IDs/titles/categories/loader routes derive from a single type-safe source of truth"）。
- 前置评审：`D:\tmp\architecture-review-20260911-1312.html` 候选 1 + 候选 2。
