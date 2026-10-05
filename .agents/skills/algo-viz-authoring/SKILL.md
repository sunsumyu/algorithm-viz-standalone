---
name: algo-viz-authoring
description: "Author and review algorithm visualizers, steppers, and multi-language code linkage. Route DP refactoring to universal-dp-refactoring and compliance audits to top-level-abstraction-compliance."
---

# 算法可视化开发与审查规范 (Algorithm Visualizer Authoring)

Core authoring rules for visualizer renderers, step generation, multi-language code linkage, and stage evolution.

---

## 0. Pre-Flight Verification & Workflow

### 0.1 Four-Dimensional Deduplication
Perform full-text search across the repository before authoring any algorithm:
1. **LeetCode ID**: `grep "<number>"` (e.g. `102`, `236`, `105`)
2. **Canonical Name**: `grep "<functionOrClass>"` (e.g. `levelOrder`, `lowestCommonAncestor`)
3. **Chinese Keywords**: `grep "<chineseTerm>"` (e.g. `层序遍历`, `最近公共祖先`)
4. **Catalog Index**: Inspect `src/algorithms/categories/<category>/` and `src/core/algorithm-catalog.generated.ts`

### 0.2 Bi-Version Synthesis
If an existing implementation exists, synthesize legacy and modern strengths under a single primary ID with `aliases: [...]` (see [AGENTS.md](file:///f:/chain/algorithm-viz-standalone/AGENTS.md) §Bi-Version Synthesis):
- Merge legacy inputs, presets, and canvas geometry with modern `problemHtml`, 4-language `codeLine`, and stage evolution.

### 0.3 Structured Decision Grilling
When encountering ambiguous requirements or synthesis trade-offs, ask structured multiple-choice questions with `ask_question`:
- State technical assumptions explicitly;
- Provide structured options with pros/cons and a marked `(Recommended)` default;
- Commit decisions as a single source of truth.

### 0.4 Tracer-Bullet Pipeline
Advance complex implementations through discrete phases. Each phase requires verification, git commit, and context clear (`/clear`):
- **Phase 1: Tracer Skeleton**: Minimal renderer + init frame + single smoke test + batch registration → run `npm run meta:sync`.
- **Phase 2: Core Stepper (TDD)**: Red-to-green state transition loop; assert keyframes and state invariants.
- **Phase 3: Multi-Language Code Linkage**: `@step:` anchors for Java, C++, Python, and JS 1-based relative lines.
- **Phase 4: Viewport & Polish**: Full HD 1920×1080 layout verification, flat hierarchy, no card nesting.

> [!TIP]
> **Tracer vs Throwaway Prototype**: A tracer bullet builds permanent production foundations with tests and types. UI layout experiments belong in a throwaway scratch script, deleted immediately once answered.

---

## 1. Five Core Invariants

1. **Relative 1-Based Code Lines**:
   `codeLine` must map to `[1, codeArray.length]` for all 4 languages via `@step:` anchors (`CodeStepIndexer` / `StageCodeRegistry`).
2. **Strict One-Line-One-Step**:
   Every state change emits an explicit step frame mapped to its active source line. Unfold compound multi-branch expressions into separate lines; include auxiliary helper functions in the code panel.
3. **Deep Module & Thin Adapter Invariant**:
   - **Thin Adapter Body Limit**: Algorithm renderers (`*-renderer.ts`) are pure configuration adapters (`LOC < 120`). They declare stage manifests, 4-language code linkages, inputs, and presets only.
   - **Zero Canvas / DOM in Renderers**: No renderer may contain coordinate layouts, raw SVG/DOM creation, or step compilation state machines.
   - **The Two-Adapter Deepening Rule**: Visual rendering belongs behind domain adapters in `src/core/renderers/adapters/`; state progression belongs behind step compilers in `src/core/strategies/` or `src/core/compilers/`. When authoring a visualizer for a data structure archetype without an existing core adapter, or encountering the 2nd instance of any archetype (e.g. Trie after PrefixTree, Interval after Range), you MUST extract a shared `*Adapter` or `*Compiler` into `src/core/` before completing the renderer.
   - **Adapter Catalog Pointer**: Consult [domain-adapters.md](./references/domain-adapters.md) for existing core primitives.
4. **Visual Continuity & Clean State**:
   Sequence comparisons append an `EOF` sentinel slot. Retain active pointers at boundaries rather than unmounting them. Output sanitized values (`null` rendered as `-`, never raw `undefined` or `NaN`).
5. **Immutable Test Contracts**:
   Pre-existing test assertions are immutable. Turn failures green exclusively by fixing production code until `exit code 0`.

---

## 2. Progressive Disclosure References

Consult detailed domain specifications on demand via context pointers:

| 领域模块 | 对应参考文件 | 核心包含内容 |
| :--- | :--- | :--- |
| **适配器目录** | [domain-adapters.md](./references/domain-adapters.md) | 全库核心领域视觉适配器（Tree/Trie/Grid 等）与推演编译器总览表 |
| **避坑指南** | [anti-patterns.md](./references/anti-patterns.md) | 历史 24 大典型故障深度复盘与纠偏指引（行号超界、跳步、套娃、穿模、脏数据等） |
| **代码联动** | [code-linkage.md](./references/code-linkage.md) | 四语言相对行号、完整生命周期闭环、递归日志形参绑定、多向分支独立分行规范 |
| **阶段演化** | [stage-evolution.md](./references/stage-evolution.md) | 动态规划标准“四段式”体系、空间压缩寄存器透明原则、正逆序双向推演支持 |
| **沙盘与布局** | [sandbox-and-ui.md](./references/sandbox-and-ui.md) | 卡通实体动画、递归树避让算法、双指针哨兵、UI 布局去套娃、Splitter 边界约束 |
| **模板与清单** | [template-and-checklist.md](./references/template-and-checklist.md) | 标准 TypeScript 步进生成器骨架、Vitest 自动化防退化断言与终极提交前 Checklist |

---

## 3. 自动化门禁自检命令

每次编写或重构算法完成后，依次执行以下确定性自检命令：

```bash
# 1. 验证目标算法单测与防退化断言
npx vitest run src/algorithms/categories/<类目>/<算法名>.test.ts

# 2. 验证全库目录新鲜度与元数据索引同步
npm run meta:sync

# 3. 验证 TypeScript 类型全库无报错
npm run typecheck
```
