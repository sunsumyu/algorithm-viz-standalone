# 递归调用跟踪树 (Recursive Call Trace) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建通用的递归调用跟踪适配器 `RecursiveCallTraceAdapter`，并在 LeetCode 111 (二叉树最小深度) 中实现深度融合：Card 1 支持双重视角切换动态高亮推演树，题目解析模态框收录完整手抄本。

**Architecture:** 
1. 提炼深度渲染模块 `RecursiveCallTraceAdapter`，采用纯 TS / DOM 树与 JetBrains Mono 终端风格，实现树状分支缩进线、条件判定序号 ①~⑤、命中徽章与高亮平滑滚动；
2. 升级 `min-depth-renderer.ts` 步进生成器，在 Stage 1 遍历中全生命周期构造 `CallTraceSnapshot`，并在 Card 1 沙盘区增加 `[🌲 二叉树拓扑]` / `[📜 递归推演树]` 切换胶囊；
3. 在 `min-depth-problem-content.ts` 的 `MIN_DEPTH_ANALYSIS_HTML` 中嵌入高保真排版的经典递归推演手抄本。

**Tech Stack:** TypeScript 5.8+, Vite 6, Vitest 3, Tailwind CSS / Vanilla CSS, DOM APIs.

## Global Constraints
- 所有代码使用强类型 TypeScript，禁止 `any` 泄漏；
- 保持 1-based 代码行精准对齐；
- 既有单元测试与不变性断言不可篡改（保持 100% 绿灯）；
- 符合 DOM 纯净性规范（`sanitizeSandboxDom` 契约），不引入多余嵌套卡片。

---

### Task 1: 递归调用跟踪适配器 `RecursiveCallTraceAdapter` (TDD)

**Files:**
- Create: `src/core/renderers/adapters/recursive-call-trace-adapter.ts`
- Test: `src/core/renderers/adapters/recursive-call-trace-adapter.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export type CallTraceLineKind =
    | 'header'
    | 'condition-pass'
    | 'condition-skip'
    | 'condition-hit'
    | 'recurse-prep'
    | 'return-leaf'
    | 'unwind-calc'
    | 'final-result';

  export interface CallTraceLine {
    id: string;
    depth: number;
    text: string;
    kind: CallTraceLineKind;
    comment?: string;
    formula?: string;
    status?: 'active' | 'done' | 'pending';
  }

  export interface CallTraceSnapshot {
    lines: CallTraceLine[];
    activeLineId?: string;
    finalResult?: number | string;
  }

  export class RecursiveCallTraceAdapter {
    static render(
      container: HTMLElement,
      snapshot: CallTraceSnapshot | null,
      options?: { title?: string; maxHeight?: string }
    ): void;
  }
  ```

- [x] **Step 1: 编写失败的单元测试**

在 `src/core/renderers/adapters/recursive-call-trace-adapter.test.ts` 中写入生命周期测试：
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  RecursiveCallTraceAdapter,
  CallTraceSnapshot,
} from './recursive-call-trace-adapter';

describe('RecursiveCallTraceAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('空快照时应渲染优雅的占位提示', () => {
    RecursiveCallTraceAdapter.render(container, null);
    expect(container.textContent).toContain('准备递归推演');
  });

  it('能正确渲染多层缩进调用树与分支线', () => {
    const snapshot: CallTraceSnapshot = {
      lines: [
        { id: 'l1', depth: 0, text: 'minDepth(1)', kind: 'header', comment: '<- 最终要算这个' },
        { id: 'l2', depth: 0, text: '① root=1, 非空', kind: 'condition-pass' },
        { id: 'l3', depth: 1, text: 'minDepth(2)', kind: 'header', comment: '<- 先算左边' },
        { id: 'l4', depth: 1, text: '③ root.left == null √ 命中!', kind: 'condition-hit' },
        { id: 'l5', depth: 1, text: '回到 minDepth(2): return 1 + 1 = 2', kind: 'unwind-calc' },
      ],
      activeLineId: 'l4',
    };

    RecursiveCallTraceAdapter.render(container, snapshot);
    const rendered = container.innerHTML;
    expect(rendered).toContain('minDepth(1)');
    expect(rendered).toContain('<- 最终要算这个');
    expect(rendered).toContain('minDepth(2)');
    expect(rendered).toContain('√ 命中!');
    expect(rendered).toContain('active-line');
  });
});
```

- [x] **Step 2: 运行测试验证失败**

```bash
npx vitest run src/core/renderers/adapters/recursive-call-trace-adapter.test.ts
```
Expected: FAIL（模块不存在）

- [x] **Step 3: 编写 `RecursiveCallTraceAdapter` 实现**

在 `src/core/renderers/adapters/recursive-call-trace-adapter.ts` 中实现：
- 数据类型定义；
- HTML 结构拼装：等宽暗黑终端风格、左侧树干线条（根据 `depth` 绘制 `│` 与 `├──`）、条件序号着色、高亮当前 `activeLineId` 并执行平滑滚动；
- 响应式样式与复制功能。

- [x] **Step 4: 运行测试验证通过**

```bash
npx vitest run src/core/renderers/adapters/recursive-call-trace-adapter.test.ts
```
Expected: PASS

- [x] **Step 5: Git 提交**

```bash
git add src/core/renderers/adapters/recursive-call-trace-adapter.ts src/core/renderers/adapters/recursive-call-trace-adapter.test.ts
git commit -m "feat(core): add RecursiveCallTraceAdapter for tree execution visualization"
```

---

### Task 2: `min-depth-renderer.ts` 注入 `callTrace` 步进数据与四节点典型预设

**Files:**
- Modify: `src/algorithms/categories/tree/min-depth-renderer.ts`
- Test: `src/core/strategies/tree-classic-stage-invariants.gate.test.ts`

**Interfaces:**
- Consumes: `CallTraceSnapshot`, `CallTraceLine`, `CallTraceLineKind` from `recursive-call-trace-adapter`
- Produces: `MinDepthStep.callTrace`

- [x] **Step 1: 扩展 `MinDepthStep` 契约并在 Stage 1 构造调用树追踪**

在 `min-depth-renderer.ts` 中：
1. 导入 `CallTraceSnapshot`、`CallTraceLine`；
2. 在 `MinDepthStep` 接口中增加 `callTrace?: CallTraceSnapshot;`；
3. 在 `buildMinDepthStage1Steps(root)` 中维护累积的 `traceLines: CallTraceLine[]`：
   - 根节点与递归入口：追加 `header` 与侧边注释（例如根节点标记 `<- 最终要算这个`，左孩子标记 `<- 先算左边`，右孩子标记 `<- 再算右边`）；
   - 判空帧：追加 `① root=..., 非空`；
   - 判叶帧：若为叶节点追加 `② left==null && right==null √ 命中!`，返回 `|--- 返回 1 ---`；若非叶追加 `② 不是叶子`；
   - 单侧空帧：追加 `③ root.left == null √ 命中!` 或 `④ right != null, 跳过`；
   - 左右均非空：追加 `⑤ 走最后一行: Math.min(minDepth(左), minDepth(右)) + 1`；
   - 后序回溯归约：追加 `回到 minDepth(...): return ... = ...`；
   - 最终结束：追加 `最终返回 ${finalMinDepth}`；
4. 每发射一个 `step`，将当前已生成的 `traceLines` 与当前 `activeLineId` 注入到 `step.callTrace` 中。

- [x] **Step 2: 增加预设案例**

在 `minDepthVisualizer.presets` 增加：
```typescript
{
  label: '截图推演用例: 四节点偏斜树 [1, 2, 3, null, 4]',
  values: { 'input-tree': '1, 2, 3, null, 4' },
  description: '根 1，左 2(右 4)，右 3(叶子)，完整展示深入、单侧避坑与回溯归约',
}
```

- [x] **Step 3: 运行既有测试确保零退化**

```bash
npx vitest run src/core/strategies/tree-classic-stage-invariants.gate.test.ts
```
Expected: PASS

- [x] **Step 4: Git 提交**

```bash
git add src/algorithms/categories/tree/min-depth-renderer.ts
git commit -m "feat(tree): integrate CallTrace tracking into minDepth stage 1 steps and add 4-node preset"
```

---

### Task 3: Card 1 视图切换器（[🌲 二叉树拓扑] vs [📜 递归推演树]）与表现层渲染

**Files:**
- Modify: `src/algorithms/categories/tree/min-depth-renderer.ts`

- [x] **Step 1: 在 `renderMinDepthCanvas` 实现双重视角动态渲染**

在 `renderMinDepthCanvas(container: HTMLElement, step: MinDepthStep)` 中：
1. 检查当前是否为 Stage 1（`step.stageId === 'stage-1'` 或 `step.callTrace != null`）；
2. 若处于 Stage 1，在容器顶层维护视图切换状态（支持本地记忆或局部状态 `currentViewMode: 'tree' | 'trace'`）；
3. 渲染视图切换控制条：
   ```html
   <div class="min-depth-view-toggle flex items-center justify-end gap-2 mb-2">
     <button class="btn-view-tree ...">🌲 二叉树拓扑</button>
     <button class="btn-view-trace ...">📜 递归推演树</button>
   </div>
   ```
4. 切换为 `tree` 视图时：调用 `TreeCanvasAdapter.renderTree(treeWrap, ...)`；
5. 切换为 `trace` 视图时：调用 `RecursiveCallTraceAdapter.render(traceWrap, step.callTrace)`；
6. 自动记忆用户所选模式，单步调试或拖动播放条时保持当前视图连续性。

- [x] **Step 2: 运行表现层契约门禁**

```bash
npm run test:presentation
```
Expected: PASS（无标题泄露、无套娃、Card 1 DOM 纯净）

- [x] **Step 3: Git 提交**

```bash
git add src/algorithms/categories/tree/min-depth-renderer.ts
git commit -m "feat(tree): support tree and recursive call trace view switching in minDepth"
```

---

### Task 4: 讲义深度剖析 `MIN_DEPTH_ANALYSIS_HTML` 嵌入精美推演手抄本

**Files:**
- Modify: `src/algorithms/categories/tree/min-depth-problem-content.ts`

- [x] **Step 1: 在 `MIN_DEPTH_ANALYSIS_HTML` 嵌入推演手抄本**

在 `min-depth-problem-content.ts` 中，为 Stage 1 的解析区域增加格式化代码块：
```html
<div style="margin-top: 10px; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #e2e8f0; line-height: 1.5; overflow-x: auto;">
  <div style="color: #38bdf8; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
    <span>📜 典型用例 [1, 2, 3, null, 4] 树状调用推演执行全景</span>
    <span style="font-size: 10px; background: rgba(56,189,248,0.2); color: #38bdf8; padding: 2px 6px; border-radius: 4px;">手抄本</span>
  </div>
  <pre style="margin: 0; font-family: inherit;">...包含完整的树状展开文字与高亮徽标...</pre>
</div>
```

- [x] **Step 2: 验证题目模态框解析内容**

运行单测确保 HTML 解析无误，无语法错误。

- [x] **Step 3: Git 提交**

```bash
git add src/algorithms/categories/tree/min-depth-problem-content.ts
git commit -m "docs(tree): add recursive call trace transcript to minDepth problem analysis"
```

---

### Task 5: 全套门禁自检与回归验证

- [x] **Step 1: 运行所有算法与合规门禁**
```bash
npx vitest run src/core/renderers/adapters/recursive-call-trace-adapter.test.ts
npx vitest run src/core/strategies/tree-classic-stage-invariants.gate.test.ts
npm run test:gate
npm run test:presentation
```
Expected: 全部 100% PASS

- [x] **Step 2: 同步元数据并类型检查**
```bash
npm run meta:sync
npm run typecheck
```
Expected: `Exit code 0`，全库无报错。
