# Jump Point Search (JPS) 算法实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个从传统 A* 启发式搜索一步一步渐进升级到 Jump Point Search (JPS) 的全新独立声明式交互可视化算法，包含 4 阶段演进（A* 泛洪痛点 $\to$ 自然与强迫邻居剪枝 $\to$ 射线跳跃探测 $\to$ 完整 JPS 极速实战）、四语言精准行号映射、响应式双栏沙盘与全套测试门禁。

**Architecture:** 
遵循项目的声明式算法规范（`registerDeclarativeAlgorithm`），在 `src/algorithms/categories/graph/` 下构建 `jump-point-search-problem-content.ts`（讲义与四语言代码）和 `jump-point-search-renderer.ts`（4-Stage 步骤生成器与 SVG/Grid 渲染器），在 `batch-2-index.ts` 注册，并利用 `meta:sync` 自动同步元数据，最终通过目录完整性、架构合规与真实 DOM 渲染契约门禁。

**Tech Stack:** TypeScript, Vitest, SVG/DOM Grid rendering, Tailwind CSS/Visual Tokens, Declarative Algorithm API.

## Global Constraints
- 全库纯 TypeScript 规范，严禁新建任何 `.js` 脚本；
- 严禁手写编辑 `src/core/algorithm-catalog.generated.ts`（唯一手写源为 renderer，必须通过 `npm run meta:sync` 收获）；
- 响应式双栏排布（左侧 50% 状态空间沙盘 + 右侧 50% 暗色代码终端），保证 $\ge 1024\text{px}$ 黄金排布；
- 步骤代码行号 1-based 精准绑定，严禁出现无效行号；
- DOM 渲染严格契约：单源网格、零卡片镜像重复、零 `[object Object]`、无 NaN 样式。

---

### Task 1: 编写名师讲义与四语言标准 JPS 代码面板

**Files:**
- Create: `src/algorithms/categories/graph/jump-point-search-problem-content.ts`
- Test: `src/algorithms/categories/graph/jump-point-search.test.ts`

**Interfaces:**
- Produces:
  - `JUMP_POINT_SEARCH_PROBLEM_HTML: string`
  - `JUMP_POINT_SEARCH_ANALYSIS_HTML: string`
  - `JUMP_POINT_SEARCH_CODE_LANGUAGES: Record<string, string>` (Java, C++, Python, JavaScript)
  - `JPS_CODE_LINES: Record<string, Record<string, number | number[]>>` (行号锚点映射)

- [x] **Step 1: 编写测试用例验证讲义与代码结构**
在 `src/algorithms/categories/graph/jump-point-search.test.ts` 中编写测试：
```typescript
import { describe, it, expect } from 'vitest';
import {
  JUMP_POINT_SEARCH_PROBLEM_HTML,
  JUMP_POINT_SEARCH_ANALYSIS_HTML,
  JUMP_POINT_SEARCH_CODE_LANGUAGES,
  JPS_CODE_LINES,
} from './jump-point-search-problem-content';

describe('JPS Problem Content & Code Panel', () => {
  it('应包含完备的教学讲义与分析 HTML', () => {
    expect(JUMP_POINT_SEARCH_PROBLEM_HTML).toContain('Jump Point Search');
    expect(JUMP_POINT_SEARCH_PROBLEM_HTML).toContain('强迫邻居');
    expect(JUMP_POINT_SEARCH_ANALYSIS_HTML).toContain('复杂度');
  });

  it('四语言代码中必须覆盖 Java / C++ / Python / JavaScript', () => {
    const langs = Object.keys(JUMP_POINT_SEARCH_CODE_LANGUAGES);
    expect(langs).toContain('java');
    expect(langs).toContain('cpp');
    expect(langs).toContain('python');
    expect(langs).toContain('javascript');
  });

  it('所有锚点行号必须在有效代码行数范围内', () => {
    for (const [action, langMap] of Object.entries(JPS_CODE_LINES)) {
      for (const [lang, lineOrLines] of Object.entries(langMap)) {
        const code = JUMP_POINT_SEARCH_CODE_LANGUAGES[lang];
        const lineCount = code.split('\n').length;
        const lines = Array.isArray(lineOrLines) ? lineOrLines : [lineOrLines];
        for (const l of lines) {
          expect(l).toBeGreaterThan(0);
          expect(l).toBeLessThanOrEqual(lineCount);
        }
      }
    }
  });
});
```

- [x] **Step 2: 运行测试验证失败（文件尚不存在）**
运行：`npx vitest run src/algorithms/categories/graph/jump-point-search.test.ts`
预期：FAIL（找不到模块 `jump-point-search-problem-content`）。

- [x] **Step 3: 编写 `jump-point-search-problem-content.ts`**
实现详尽的高亮讲义与工业级 4 语言标准 JPS 实现，定义 `JPS_CODE_LINES` 锚点。

- [x] **Step 4: 重新运行测试验证通过**
运行：`npx vitest run src/algorithms/categories/graph/jump-point-search.test.ts`
预期：PASS。

- [x] **Step 5: 提交本任务产物**
```bash
git add src/algorithms/categories/graph/jump-point-search-problem-content.ts src/algorithms/categories/graph/jump-point-search.test.ts
git commit -m "feat(graph): add JPS problem content and multi-language code templates"
```

---

### Task 2: 实现核心算法逻辑与 4-Stage 演进步骤生成器

**Files:**
- Create: `src/algorithms/categories/graph/jump-point-search-renderer.ts`（先编写数据模型与 step 生成逻辑）
- Modify: `src/algorithms/categories/graph/jump-point-search.test.ts`

**Interfaces:**
- Consumes: `JPS_CODE_LINES` from Task 1
- Produces:
  - `buildJumpPointSearchSteps(preset: string, mode?: string): JpsStep[]`
  - `JpsStep` 接口定义（含 Stage 1~4 演进状态、光束射线、跳点、强迫邻居、指标等）
  - 核心跳点探测函数 `jump(grid, x, y, dx, dy, goal)`
  - 强迫邻居判定函数 `hasForcedNeighbor(grid, x, y, dx, dy)`

- [x] **Step 1: 在测试中补充 4-Stage 步骤覆盖与算法正确性断言**
在 `jump-point-search.test.ts` 中增加：
```typescript
import { buildJumpPointSearchSteps } from './jump-point-search-renderer';

describe('JPS 4-Stage Step Generation', () => {
  it('应能针对默认预设生成全部 4 阶段步骤', () => {
    const steps = buildJumpPointSearchSteps('corner');
    expect(steps.length).toBeGreaterThan(15);
    const stages = new Set(steps.map(s => s.stage));
    expect(stages).toContain('stage1_astar');
    expect(stages).toContain('stage2_prune');
    expect(stages).toContain('stage3_jump_ray');
    expect(stages).toContain('stage4_jps_full');
  });

  it('Stage 4 必须成功搜索到终点并重构出最终路径', () => {
    const steps = buildJumpPointSearchSteps('corner', 'stage4');
    const lastStep = steps[steps.length - 1];
    expect(lastStep.finalPath.length).toBeGreaterThan(0);
    expect(lastStep.stage).toBe('stage4_jps_full');
  });

  it('JPS 探索节点数应显著少于 A* 探索节点数', () => {
    const steps = buildJumpPointSearchSteps('plain');
    const astarStep = steps.find(s => s.stage === 'stage1_astar' && s.action === 'reach-goal');
    const jpsStep = steps.find(s => s.stage === 'stage4_jps_full' && s.action === 'reach-goal');
    expect(astarStep).toBeDefined();
    expect(jpsStep).toBeDefined();
    expect(jpsStep!.jpsVisitedCount).toBeLessThan(astarStep!.astarVisitedCount);
  });
});
```

- [x] **Step 2: 运行测试验证失败**
运行：`npx vitest run src/algorithms/categories/graph/jump-point-search.test.ts`
预期：FAIL（`jump-point-search-renderer` 尚无导出）。

- [x] **Step 3: 编写 4 阶段步骤生成器及 JPS 核心数学引擎**
实现：
1. 标准 8-向网格与切比雪夫/八角距离启发函数；
2. Stage 1: 8-向经典 A*，记录扩展节点数与泛洪网格；
3. Stage 2: 自然邻居剪枝与转角强迫邻居（FN）单步教学；
4. Stage 3: 水平/垂直与对角复合跳跃光束（Ray）扫描步骤；
5. Stage 4: 完整 JPS 优先队列寻路与终点路径回溯；
6. `withMetrics` 封装指标输出（A* vs JPS 节点节省率计算）。

- [x] **Step 4: 运行测试验证通过**
运行：`npx vitest run src/algorithms/categories/graph/jump-point-search.test.ts`
预期：PASS。

- [x] **Step 5: 提交本任务产物**
```bash
git add src/algorithms/categories/graph/jump-point-search-renderer.ts src/algorithms/categories/graph/jump-point-search.test.ts
git commit -m "feat(graph): implement JPS 4-stage step generation engine and core pruning logic"
```

---

### Task 3: 编写沙盘 Canvas 渲染器与声明式算法自注册

**Files:**
- Modify: `src/algorithms/categories/graph/jump-point-search-renderer.ts`
- Modify: `src/algorithms/batch-2-index.ts`
- Modify: `src/algorithms/categories/graph/jump-point-search.test.ts`

**Interfaces:**
- Produces:
  - `renderJumpPointSearchCanvas(container: HTMLElement, step: JpsStep): void`
  - `registerDeclarativeAlgorithm` 自注册元数据与预设配置
  - `batch-2-index.ts` 中引入 `./categories/graph/jump-point-search-renderer`

- [x] **Step 1: 在测试中验证渲染器 DOM 生成与注册信息**
在 `jump-point-search.test.ts` 中增加：
```typescript
import { renderJumpPointSearchCanvas } from './jump-point-search-renderer';
import { algorithmRegistry } from '../../../core/algorithm-registry';

describe('JPS Canvas Presentation & Registry', () => {
  it('应成功自注册到 algorithmRegistry', () => {
    const manifest = algorithmRegistry.getManifest('jump-point-search');
    expect(manifest).toBeDefined();
    expect(manifest?.name).toContain('跳点搜索');
    expect(manifest?.category).toBe('graph');
    expect(manifest?.aliases).toContain('jps');
  });

  it('渲染函数应在 DOM 容器中构建合法的网格沙盘与光束指示', () => {
    const container = document.createElement('div');
    const steps = buildJumpPointSearchSteps('corner');
    renderJumpPointSearchCanvas(container, steps[steps.length - 1]);
    expect(container.innerHTML).toContain('grid');
    expect(container.innerHTML).not.toContain('[object Object]');
    expect(container.innerHTML).not.toContain('undefined');
  });
});
```

- [x] **Step 2: 运行测试验证失败**
运行：`npx vitest run src/algorithms/categories/graph/jump-point-search.test.ts`
预期：FAIL（未定义 `renderJumpPointSearchCanvas` 及尚未注册）。

- [x] **Step 3: 编写 Canvas 渲染器并执行 `registerDeclarativeAlgorithm`**
实现：
1. 具备高质感视觉设计：起点 `S`、终点 `G`、障碍物、强迫邻居 `FN` 警示角标、核心跳点 `JP` 芯片徽章、射线光束、最优路径；
2. 底部辅助演进说明栏；
3. 声明式注册配置：3 个预设（开阔平原、经典拐角、迷宫障碍）、1 个模式参数（4 阶段完整 / 单阶段单独体验）、高亮指标（阶段、当前点、Open 堆、访问节点对比）；
4. 在 `src/algorithms/batch-2-index.ts` 中加入 `import './categories/graph/jump-point-search-renderer';`。

- [x] **Step 4: 运行测试验证通过**
运行：`npx vitest run src/algorithms/categories/graph/jump-point-search.test.ts`
预期：PASS。

- [x] **Step 5: 提交本任务产物**
```bash
git add src/algorithms/categories/graph/jump-point-search-renderer.ts src/algorithms/batch-2-index.ts src/algorithms/categories/graph/jump-point-search.test.ts
git commit -m "feat(graph): add JPS canvas renderer and declarative algorithm registration"
```

---

### Task 4: 执行全库目录同步与严格门禁测试验证

**Files:**
- Update: `src/core/algorithm-catalog.generated.ts`（通过 `npm run meta:sync` 自动生成）
- Audit: 全门禁测试流水线

- [x] **Step 1: 运行 `npm run meta:sync` 更新元数据**
运行：`npm run meta:sync`
预期：自动检测到新算法 `jump-point-search` 并更新 `algorithm-catalog.generated.ts`。

- [x] **Step 2: 验证目录索引器门禁测试**
运行：`npx vitest run src/core/algorithm-catalog-indexer.test.ts`
预期：PASS（目录新鲜度与零漂移验证通过）。

- [x] **Step 3: 执行顶层抽象与表现层真实契约门禁**
运行：`npx vitest run src/core/top-level-abstraction-compliance.test.ts`
运行：`npm run test:presentation`
预期：PASS（卡片零镜像、零 `[object Object]`、无 NaN、行号有效）。

- [x] **Step 4: 执行全量 TypeScript 类型检查**
运行：`npm run typecheck`
预期：PASS（0 错误）。

- [x] **Step 5: 提交元数据生成物与最终代码**
```bash
git add src/core/algorithm-catalog.generated.ts
git commit -m "chore: sync algorithm catalog for jump-point-search"
```
