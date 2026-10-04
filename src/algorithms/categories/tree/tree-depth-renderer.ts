/**
 * 二叉树最大深度可视化器 (Maximum Depth of Binary Tree · LeetCode 104 / Class 036 Code04)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 *
 * 多阶段演化体系 (Multi-Stage Evolution):
 *   Stage 1: 递归后序自底向上高度归约 (Post-order Divide and Conquer · 1 + max(l, r) 黄金原型)
 *   Stage 2: 层次遍历 BFS 队列层数计数 (Level Order BFS Queue · 逐层扩展 depth++)
 *   Stage 3: 静态数组模拟队列 (Static Array Queue BFS · 左神 Class 036 招牌零 GC 连续内存)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import {
  RecursiveCallTraceAdapter,
  type CallTraceSnapshot,
  type CallTraceLine,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  TREE_DEPTH_PROBLEM_HTML,
  TREE_DEPTH_ANALYSIS_HTML,
} from './tree-depth-problem-content';
import {
  TREE_DEPTH_STAGE1_CODE,
  TREE_DEPTH_STAGE1_LINES,
  TREE_DEPTH_STAGE2_BFS_CODE,
  TREE_DEPTH_STAGE2_BFS_LINES,
  TREE_DEPTH_STAGE3_STATIC_ARRAY_CODE,
  TREE_DEPTH_STAGE3_STATIC_ARRAY_LINES,
} from './tree-depth-stage-codes';

// ============================================================
// 步骤与状态契约 (Domain Step Contract)
// ============================================================
export interface TDStaticQueueState {
  array: (number | null)[];
  l: number;
  r: number;
  windowSize: number;
}

export interface TDStep {
  tree: TreeNode | null;
  current: number | null;
  leftDepth: number;
  rightDepth: number;
  maxDepth: number;
  depthsMap: Map<number, number>;
  decision: string;
  action: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;

  /** Stage 2 专属：BFS 队列节点列表 */
  queue?: number[];
  levelIndex?: number;

  /** Stage 3 专属：静态连续内存队列状态 */
  staticQueueState?: TDStaticQueueState;

  /** Stage 1 专属：递归调用树跟踪快照 */
  callTrace?: CallTraceSnapshot;
}

export const TREE_DEPTH_CODE_LINES = TREE_DEPTH_STAGE1_LINES;

// ============================================================
// 表现层辅助呈现组件 (Presentation Components)
// ============================================================
function makeTDMetrics(curNode: number | null, lDepth: number, rDepth: number, maxD: number): Record<string, string | number> {
  return {
    'cur-node': curNode !== null ? `${curNode}` : '—',
    'l-depth': lDepth,
    'r-depth': rDepth,
    'max-depth-res': maxD > 0 ? maxD : '计算中',
    'metric-cur-node': curNode !== null ? `${curNode}` : '—',
    'metric-l-depth': lDepth,
    'metric-r-depth': rDepth,
    'metric-max-depth-res': maxD > 0 ? `${maxD}` : '计算中',
  };
}

/** 缓冲器 1：Stage 1 后序左右深度比对、已归约映射表与浅色递归推演树 */
function renderStage1CustomMetrics(container: HTMLElement, step: TDStep): void {
  const depthBadges =
    step.depthsMap.size > 0
      ? Array.from(step.depthsMap.entries())
          .map(
            ([val, d]) => `
          <div style="display: flex; align-items: center; gap: 4px; padding: 2px 7px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
            <span style="font-weight: 700; color: #166534; font-size: 10.5px;">节点 ${val}:</span>
            <span style="font-family: monospace; font-size: 10.5px; color: #15803d; font-weight: 700;">深=${d}</span>
          </div>`
          )
          .join('')
      : '<span style="color:#94a3b8; font-size: 10.5px; font-style:italic;">等待首个叶节点深度归约...</span>';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; gap: 6px; font-size: 11px;">
      <div style="display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; color: #64748b;">左深 (leftDepth):</span>
            <span style="font-weight: 700; font-size: 12px; color: #2563eb;">${step.leftDepth}</span>
          </div>
          <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; color: #64748b;">右深 (rightDepth):</span>
            <span style="font-weight: 700; font-size: 12px; color: #0d9488;">${step.rightDepth}</span>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; align-items: center;">
          <span style="font-size: 10px; font-weight: 700; color: #64748b; margin-right: 2px;">已归约:</span>
          ${depthBadges}
        </div>
      </div>
      <div class="td-trace-host" style="flex: 1; min-height: 120px; overflow: hidden;"></div>
    </div>
  `;

  if (step.callTrace) {
    const traceHost = container.querySelector('.td-trace-host') as HTMLElement | null;
    if (traceHost) {
      RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
        title: '📜 递归调用推演与归约栈',
        theme: 'light',
        maxHeight: '100%',
        showTerminalHeader: true,
      });
    }
  }
}

/** 缓冲器 2：Stage 2 层次遍历 FIFO 队列监视器 */
function renderStage2BufferHtml(queue: number[], depth: number): string {
  const chips = queue.length > 0
    ? queue.map((v) => `<span style="padding: 2px 7px; background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600;">${v}</span>`).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空 (层序探索收敛)</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #166534;">当前层序深度计数器 depth:</span>
        <span style="font-size: 14px; font-weight: 800; font-family: monospace; color: #15803d;">${depth} 层</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">🥞 FIFO 队列待探索节点:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 32px; align-items: center;">
          ${chips}
        </div>
      </div>
    </div>
  `;
}

/** 缓冲器 3：Stage 3 静态连续内存 queue[MAXN] 与 l/r 双指针监视器 */
function renderStage3BufferHtml(state?: TDStaticQueueState, depth: number = 0): string {
  if (!state) return '';
  const { array, l, r } = state;
  const maxDisplay = Math.max(r + 2, 8);
  const cells: string[] = [];

  for (let i = 0; i < maxDisplay; i++) {
    const val = i < array.length ? array[i] : null;
    const isInside = i >= l && i < r;
    const isL = i === l;
    const isR = i === r;

    let bg = '#ffffff';
    let borderColor = '#e2e8f0';
    let textColor = '#64748b';

    if (isInside) {
      bg = '#e0f2fe';
      borderColor = '#7dd3fc';
      textColor = '#0369a1';
    }

    const pointerTags: string[] = [];
    if (isL) pointerTags.push('<span style="color:#ea580c;font-weight:800;">l</span>');
    if (isR) pointerTags.push('<span style="color:#2563eb;font-weight:800;">r</span>');

    cells.push(`
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 32px;">
        <div style="height: 14px; font-size: 9.5px; font-weight: 700; font-family: monospace;">
          ${pointerTags.join('/')}
        </div>
        <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${borderColor}; border-radius: 6px; font-size: 11.5px; font-family: monospace; font-weight: 700; color: ${textColor};">
          ${val !== null && val !== undefined ? val : '—'}
        </div>
        <div style="font-size: 9px; color: #94a3b8; font-family: monospace; margin-top: 1px;">
          [${i}]
        </div>
      </div>
    `);
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #1e40af;">静态数组遍历层数 depth:</span>
        <span style="font-size: 14px; font-weight: 800; font-family: monospace; color: #2563eb;">${depth} 层</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
          <span>🏎️ queue[MAXN] 连续内存条 (Class 036 招牌零 GC):</span>
          <span style="color: #0284c7; font-size: 10px; font-weight: 600;">[l=${l}, r=${r}) 窗口大小: ${r - l}</span>
        </div>
        <div style="display: flex; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; overflow-x: auto;">
          ${cells.join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 递归收集二叉树中所有非空节点值
 */
export function collectTreeValues(node: TreeNode | null): number[] {
  if (!node) return [];
  const res: number[] = [];
  const queue: TreeNode[] = [node];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    res.push(cur.val);
    if (cur.left) queue.push(cur.left);
    if (cur.right) queue.push(cur.right);
  }
  return res;
}

/** 统一画布呈现（支持二叉树拓扑与递归推演树双重视角） */
function renderTreeDepthCanvasForStep(container: HTMLElement, step: TDStep, primaryColor: string = '#fbbf24'): void {
  const isDone = step.action === 'done';
  const allTreeVals = collectTreeValues(step.tree);
  const resolvedNodes = isDone ? allTreeVals : Array.from(step.depthsMap.keys());
  const current = isDone && step.current === null && step.tree ? step.tree.val : step.current;

  if (step.tree) {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current,
      secondaryHighlightedNodes: step.queue || resolvedNodes,
      visitedNodes: resolvedNodes,
      primaryColor,
      secondaryColor: '#60a5fa',
      visitedColor: '#34d399',
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 240px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树或初始化</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">准备计算二叉树最大深度...</span>
      </div>
    `;
  }
}

// ============================================================
// Stage 1 步骤生成器: 递归后序自底向上高度归约 (Post-order DFS)
// ============================================================
export function buildTDSteps(root: TreeNode | null): TDStep[] {
  const steps: TDStep[] = [];
  const depthsMap = new Map<number, number>();
  const L = TREE_DEPTH_STAGE1_LINES;

  if (!root) {
    const traceSnapshot: CallTraceSnapshot = {
      lines: [
        {
          id: 'null-root',
          depth: 0,
          text: 'maxDepth(null) -> 树为空 -> return 0',
          kind: 'header',
          comment: '<- 树为空',
        },
      ],
      activeLineId: 'null-root',
      finalResult: 0,
    };

    steps.push({
      tree: null,
      current: null,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，返回深度 0。',
      log: 'root is null -> return 0',
      metrics: makeTDMetrics(null, 0, 0, 0),
      codeLine: L.empty,
      callTrace: traceSnapshot,
    });
    return steps;
  }

  const traceLines: CallTraceLine[] = [];

  function makeSnapshot(activeLineId?: string, finalResult?: number): CallTraceSnapshot {
    return {
      lines: traceLines.map((l) => ({ ...l })),
      activeLineId,
      finalResult,
    };
  }

  const rootHeaderId = `call-${root.val}`;
  traceLines.push({
    id: rootHeaderId,
    depth: 0,
    text: `maxDepth(${root.val})`,
    kind: 'header',
    comment: '<- 最终要算这个',
  });

  steps.push({
    tree: root,
    current: null,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: 0,
    depthsMap: new Map(depthsMap),
    decision: '算法启动：初始化最大深度计算',
    action: 'enter',
    message: `求二叉树最大深度：从根节点 ${root.val} 开始后序自底向上高度归约。递推式: 1 + max(leftDepth, rightDepth)。`,
    log: `maxDepth(root: ${root.val})`,
    metrics: makeTDMetrics(null, 0, 0, 0),
    codeLine: L.entry,
    callTrace: makeSnapshot(rootHeaderId),
  });

  function dfs(node: TreeNode | null, depth: number, roleComment?: string): number {
    if (!node) {
      const lineId = `null-${depth}-${Math.random().toString(36).slice(2, 6)}`;
      traceLines.push({
        id: lineId,
        depth: depth - 1,
        text: '遇到空节点 null -> return 0',
        kind: 'condition-skip',
      });
      steps.push({
        tree: root,
        current: null,
        leftDepth: 0,
        rightDepth: 0,
        maxDepth: 0,
        depthsMap: new Map(depthsMap),
        decision: '空节点特判：返回深度 0',
        action: 'empty-node',
        message: '遇到空节点 null，返回深度 0。',
        log: 'node is null -> return 0',
        metrics: makeTDMetrics(null, 0, 0, 0),
        codeLine: L.empty,
        callTrace: makeSnapshot(lineId),
      });
      return 0;
    }

    const callLineId = `call-${node.val}`;
    if (node !== root) {
      traceLines.push({
        id: callLineId,
        depth: depth - 1,
        text: `maxDepth(${node.val})`,
        kind: 'header',
        comment: roleComment,
      });
    }

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      decision: `考察节点 ${node.val}`,
      action: 'enter',
      message: `递归到达节点 ${node.val}，准备分别计算其左右子树深度。`,
      log: `visit node: ${node.val}`,
      metrics: makeTDMetrics(node.val, 0, 0, 0),
      codeLine: L.entry,
      callTrace: makeSnapshot(callLineId),
    });

    const passLineId = `pass-${node.val}`;
    traceLines.push({
      id: passLineId,
      depth: depth - 1,
      text: `① root=${node.val}, 非空`,
      kind: 'condition-pass',
    });

    // 2. 边界判空求值帧 (Line 3: if (root == null) 判定为 false)
    steps.push({
      tree: root,
      current: node.val,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      decision: `判空检查：节点 ${node.val} 非空，跳过基准返回`,
      action: 'check-null',
      message: `root != null (当前节点是 ${node.val})，判空条件 root == null 不成立，继续执行左右子树求解。`,
      log: `node ${node.val} != null -> continue`,
      metrics: makeTDMetrics(node.val, 0, 0, 0),
      codeLine: L.nullCheck,
      callTrace: makeSnapshot(passLineId),
    });

    // 3. 发起深入左子树调用帧 (Line 4: int leftDepth = maxDepth(root.left))
    const callLeftId = `call-left-${node.val}`;
    traceLines.push({
      id: callLeftId,
      depth: depth - 1,
      text: `② 发起左子树深入: int leftDepth = maxDepth(${node.left ? node.left.val : 'null'})`,
      kind: 'recurse-prep',
    });

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      decision: `深入左子树：int leftDepth = maxDepth(${node.left ? node.left.val : 'null'})`,
      action: 'call-left',
      message: `后序遍历：首先深入左子树求解高度，实参为 ${node.left ? `Node(${node.left.val})` : 'null'}。`,
      log: `node ${node.val}: call maxDepth(left=${node.left ? node.left.val : 'null'})`,
      metrics: makeTDMetrics(node.val, 0, 0, 0),
      codeLine: L.callLeft,
      callTrace: makeSnapshot(callLeftId),
    });

    const l = dfs(node.left, depth + 1, '<- 先算左边');

    // 4. 左子树就绪接收返回值帧 (Line 4: 接收 leftDepth = l)
    const leftDoneId = `left-done-${node.val}`;
    steps.push({
      tree: root,
      current: node.val,
      leftDepth: l,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      decision: `节点 ${node.val} 左子树深度就绪: ${l}`,
      action: 'left-done',
      message: `节点 ${node.val} 的左子树深度计算完成: leftDepth = ${l}。接下来计算右子树深度。`,
      log: `node ${node.val}: leftDepth = ${l}`,
      metrics: makeTDMetrics(node.val, l, 0, 0),
      codeLine: L.leftDone,
      callTrace: makeSnapshot(leftDoneId),
    });

    // 5. 发起深入右子树调用帧 (Line 5: int rightDepth = maxDepth(root.right))
    const callRightId = `call-right-${node.val}`;
    traceLines.push({
      id: callRightId,
      depth: depth - 1,
      text: `③ 发起右子树深入: int rightDepth = maxDepth(${node.right ? node.right.val : 'null'})`,
      kind: 'recurse-prep',
    });

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: l,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      decision: `深入右子树：int rightDepth = maxDepth(${node.right ? node.right.val : 'null'})`,
      action: 'call-right',
      message: `后序遍历：接下来深入右子树求解高度，实参为 ${node.right ? `Node(${node.right.val})` : 'null'}。`,
      log: `node ${node.val}: call maxDepth(right=${node.right ? node.right.val : 'null'})`,
      metrics: makeTDMetrics(node.val, l, 0, 0),
      codeLine: L.callRight,
      callTrace: makeSnapshot(callRightId),
    });

    const r = dfs(node.right, depth + 1, '<- 再算右边');

    // 6. 右子树就绪接收返回值帧 (Line 5: 接收 rightDepth = r)
    const rightDoneId = `right-done-${node.val}`;
    steps.push({
      tree: root,
      current: node.val,
      leftDepth: l,
      rightDepth: r,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      decision: `节点 ${node.val} 右子树深度就绪: ${r}`,
      action: 'right-done',
      message: `节点 ${node.val} 的右子树深度计算完成: rightDepth = ${r}。左右子树高度齐备，准备归约自身深度。`,
      log: `node ${node.val}: rightDepth = ${r}`,
      metrics: makeTDMetrics(node.val, l, r, 0),
      codeLine: L.rightDone,
      callTrace: makeSnapshot(rightDoneId),
    });

    const curDepth = 1 + Math.max(l, r);
    depthsMap.set(node.val, curDepth);

    const unwindLineId = `unwind-${node.val}`;
    traceLines.push({
      id: unwindLineId,
      depth: depth - 1,
      text: `回到 maxDepth(${node.val}): return 1 + max(${l}, ${r}) = ${curDepth}`,
      kind: 'unwind-calc',
      formula: `1 + max(${l}, ${r}) = ${curDepth}`,
      status: 'done',
    });

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: l,
      rightDepth: r,
      maxDepth: curDepth,
      depthsMap: new Map(depthsMap),
      decision: `归约节点 ${node.val} 深度: 1 + max(${l}, ${r}) = ${curDepth}`,
      action: 'return-depth',
      message: `节点 ${node.val} 高度归约完成：1 + max(${l}, ${r}) = ${curDepth}。向父节点回溯该值。`,
      log: `node ${node.val} maxDepth = 1 + max(${l}, ${r}) = ${curDepth}`,
      metrics: makeTDMetrics(node.val, l, r, curDepth),
      codeLine: L.returnDepth,
      callTrace: makeSnapshot(unwindLineId),
    });

    return curDepth;
  }

  const finalMax = dfs(root, 1);

  const finalResultId = `final-res-${root.val}`;
  traceLines.push({
    id: finalResultId,
    depth: 0,
    text: `🎉 最终结果: maxDepth(${root.val}) = ${finalMax}`,
    kind: 'final-result',
    status: 'done',
  });

  steps.push({
    tree: root,
    current: root.val,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: finalMax,
    depthsMap: new Map(depthsMap),
    decision: '最大深度计算完成',
    action: 'done',
    message: `🎉 深度计算完毕！整棵二叉树的最大深度为 【${finalMax}】。`,
    log: `done maxDepth=${finalMax}`,
    metrics: makeTDMetrics(root.val, 0, 0, finalMax),
    codeLine: L.done,
    callTrace: makeSnapshot(finalResultId, finalMax),
  });

  return steps;
}

// ============================================================
// Stage 2 步骤生成器: 层次遍历 BFS 队列层数计数 (Level Order BFS Queue)
// ============================================================
export function buildTDBfsSteps(root: TreeNode | null): TDStep[] {
  const steps: TDStep[] = [];
  const depthsMap = new Map<number, number>();
  const L = TREE_DEPTH_STAGE2_BFS_LINES;

  steps.push({
    tree: root,
    current: null,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: 0,
    depthsMap: new Map(depthsMap),
    queue: [],
    levelIndex: 0,
    decision: 'BFS 层次遍历启动：初始化队列与深度计数器',
    action: 'init',
    message: root
      ? `层次遍历求最大深度：每将一层的全部节点出队并加入其左右孩子后，深度计数器 depth++。`
      : '空树特判，直接返回深度 0。',
    log: root ? `bfs(root: ${root.val}), depth = 0` : 'bfs(root: null) -> 0',
    metrics: makeTDMetrics(null, 0, 0, 0),
    codeLine: root ? L.entry : L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      queue: [],
      levelIndex: 0,
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，返回深度 0。',
      log: 'root == null -> return 0',
      metrics: makeTDMetrics(null, 0, 0, 0),
      codeLine: L.entry,
    });
    return steps;
  }

  const queue: TreeNode[] = [root];
  let depth = 0;

  steps.push({
    tree: root,
    current: root.val,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: 0,
    depthsMap: new Map(depthsMap),
    queue: [root.val],
    levelIndex: 0,
    decision: '根节点入队，depth = 0',
    action: 'offer',
    message: `根节点 ${root.val} 入队，初始队列大小为 1，深度 depth 初始为 0。`,
    log: `queue.offer(${root.val}), depth=0`,
    metrics: makeTDMetrics(root.val, 0, 0, 0),
    codeLine: L.initQueue,
  });

  while (queue.length > 0) {
    const size = queue.length;

    steps.push({
      tree: root,
      current: null,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: depth,
      depthsMap: new Map(depthsMap),
      queue: queue.map((n) => n.val),
      levelIndex: depth,
      decision: `锁定第 ${depth + 1} 层 (包含 ${size} 个节点)`,
      action: 'lock-level',
      message: `当前层共有 ${size} 个节点，开始出队并收集下一层子节点。`,
      log: `while(!queue.isEmpty()): size=${size}, depth=${depth}`,
      metrics: makeTDMetrics(null, 0, 0, depth),
      codeLine: L.loopLevel,
    });

    for (let i = 0; i < size; i++) {
      const cur = queue.shift()!;
      depthsMap.set(cur.val, depth + 1);

      steps.push({
        tree: root,
        current: cur.val,
        leftDepth: 0,
        rightDepth: 0,
        maxDepth: depth,
        depthsMap: new Map(depthsMap),
        queue: queue.map((n) => n.val),
        levelIndex: depth,
        decision: `弹出节点 ${cur.val} 并记录其深度为 ${depth + 1}`,
        action: 'poll',
        message: `节点 ${cur.val} 出队，位于二叉树第 ${depth + 1} 层。`,
        log: `queue.poll() -> ${cur.val}, level=${depth + 1}`,
        metrics: makeTDMetrics(cur.val, 0, 0, depth),
        codeLine: L.popNode,
      });

      if (cur.left) queue.push(cur.left);
      if (cur.right) queue.push(cur.right);

      if (cur.left || cur.right) {
        steps.push({
          tree: root,
          current: cur.val,
          leftDepth: 0,
          rightDepth: 0,
          maxDepth: depth,
          depthsMap: new Map(depthsMap),
          queue: queue.map((n) => n.val),
          levelIndex: depth,
          decision: `节点 ${cur.val} 的子节点入队`,
          action: 'push-children',
          message: `节点 ${cur.val} 的子节点${cur.left ? ` 左(${cur.left.val})` : ''}${cur.right ? ` 右(${cur.right.val})` : ''} 入队。`,
          log: `offer children of ${cur.val}`,
          metrics: makeTDMetrics(cur.val, 0, 0, depth),
          codeLine: L.pushChildren,
        });
      }
    }

    depth++;

    steps.push({
      tree: root,
      current: null,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: depth,
      depthsMap: new Map(depthsMap),
      queue: queue.map((n) => n.val),
      levelIndex: depth,
      decision: `第 ${depth} 层处理完毕，depth++ 累加为 ${depth}`,
      action: 'level-done',
      message: `整层节点遍历完毕，深度计数器自增：depth++ 达到 ${depth}。`,
      log: `depth++ -> ${depth}`,
      metrics: makeTDMetrics(null, 0, 0, depth),
      codeLine: L.levelDone,
    });
  }

  steps.push({
    tree: root,
    current: null,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: depth,
    depthsMap: new Map(depthsMap),
    queue: [],
    levelIndex: depth,
    decision: '层次遍历完成，返回最大深度',
    action: 'done',
    message: `🎉 队列为空，层次遍历全部结束！二叉树的最大深度为 【${depth}】。`,
    log: `return depth = ${depth}`,
    metrics: makeTDMetrics(null, 0, 0, depth),
    codeLine: L.returnDepth,
  });

  return steps;
}

// ============================================================
// Stage 3 步骤生成器: 静态数组模拟队列 (Static Array Queue BFS · Class 036 招牌)
// ============================================================
export function buildTDStaticArraySteps(root: TreeNode | null): TDStep[] {
  const steps: TDStep[] = [];
  const depthsMap = new Map<number, number>();
  const L = TREE_DEPTH_STAGE3_STATIC_ARRAY_LINES;

  steps.push({
    tree: root,
    current: null,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: 0,
    depthsMap: new Map(depthsMap),
    staticQueueState: { array: [], l: 0, r: 0, windowSize: 0 },
    decision: '左神 Class 036 招牌优化：分配静态连续内存 queue[MAXN]',
    action: 'init',
    message: root
      ? `左神 Class 036 极致优化：使用连续内存 queue[MAXN] 与双指针 l=0, r=0。每扩展完一个区间 [l, r) 时 depth++！`
      : '空树特判，直接返回深度 0。',
    log: root ? `staticQueue: l=0, r=0, MAXN=2001, depth=0` : 'root == null -> 0',
    metrics: makeTDMetrics(null, 0, 0, 0),
    codeLine: root ? L.entry : L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      staticQueueState: { array: [], l: 0, r: 0, windowSize: 0 },
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，直接返回深度 0。',
      log: 'root == null -> return 0',
      metrics: makeTDMetrics(null, 0, 0, 0),
      codeLine: L.entry,
    });
    return steps;
  }

  const staticArray: TreeNode[] = [];
  let l = 0;
  let r = 0;
  staticArray[r++] = root;
  let depth = 0;

  steps.push({
    tree: root,
    current: root.val,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: 0,
    depthsMap: new Map(depthsMap),
    staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: 1 },
    decision: '根节点写入连续内存 queue[0]',
    action: 'push-static',
    message: `根节点 ${root.val} 写入 queue[r++] (l=0, r=1)，零 GC 分配！`,
    log: `queue[r++] = root(val: ${root.val}), l=0, r=1`,
    metrics: makeTDMetrics(root.val, 0, 0, 0),
    codeLine: L.initPointers,
  });

  while (l < r) {
    const size = r - l;

    steps.push({
      tree: root,
      current: null,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: depth,
      depthsMap: new Map(depthsMap),
      staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: size },
      decision: `锁定第 ${depth + 1} 层内存窗口 [l=${l}, r=${r})，大小 ${size}`,
      action: 'lock-window',
      message: `当前层窗口为 [${l}, ${r})，包含 ${size} 个节点。`,
      log: `while(l < r): l=${l}, r=${r}, size=${size}, depth=${depth}`,
      metrics: makeTDMetrics(null, 0, 0, depth),
      codeLine: L.loopLevel,
    });

    for (let i = 0; i < size; i++) {
      const cur = staticArray[l++];
      depthsMap.set(cur.val, depth + 1);

      steps.push({
        tree: root,
        current: cur.val,
        leftDepth: 0,
        rightDepth: 0,
        maxDepth: depth,
        depthsMap: new Map(depthsMap),
        staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l },
        decision: `移动左指针 l++，弹出节点 ${cur.val}`,
        action: 'pop-node',
        message: `node = queue[l++] (${cur.val}) 出窗，更新后 l=${l}。`,
        log: `cur = queue[l++] -> ${cur.val}, l=${l}`,
        metrics: makeTDMetrics(cur.val, 0, 0, depth),
        codeLine: L.popNode,
      });

      const pushLeft = cur.left;
      const pushRight = cur.right;

      if (pushLeft) staticArray[r++] = pushLeft;
      if (pushRight) staticArray[r++] = pushRight;

      if (pushLeft || pushRight) {
        steps.push({
          tree: root,
          current: cur.val,
          leftDepth: 0,
          rightDepth: 0,
          maxDepth: depth,
          depthsMap: new Map(depthsMap),
          staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l },
          decision: `子节点追加至连续内存末尾 queue[r++]`,
          action: 'push-children',
          message: `子节点${pushLeft ? ` 左(${pushLeft.val})` : ''}${pushRight ? ` 右(${pushRight.val})` : ''} 写入末尾，r 更新为 ${r}。`,
          log: `r updated to ${r}`,
          metrics: makeTDMetrics(cur.val, 0, 0, depth),
          codeLine: L.pushChildren,
        });
      }
    }

    depth++;

    steps.push({
      tree: root,
      current: null,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: depth,
      depthsMap: new Map(depthsMap),
      staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l },
      decision: `当前层窗口扫描完毕，depth++ 累加为 ${depth}`,
      action: 'level-done',
      message: `本层节点全部移出窗口，深度计数器自增：depth++ 达到 ${depth}。`,
      log: `depth++ -> ${depth}`,
      metrics: makeTDMetrics(null, 0, 0, depth),
      codeLine: L.levelDone,
    });
  }

  steps.push({
    tree: root,
    current: null,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: depth,
    depthsMap: new Map(depthsMap),
    staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: 0 },
    decision: '静态数组层次遍历完成，返回最大深度',
    action: 'done',
    message: `🎉 双指针完全闭合 (l=${l}, r=${r})，二叉树最大深度为 【${depth}】。`,
    log: `return depth = ${depth}`,
    metrics: makeTDMetrics(null, 0, 0, depth),
    codeLine: L.returnDepth,
  });

  return steps;
}

// ============================================================
// 输入参数解析辅助
// ============================================================
function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 9, 20, null, null, 15, 7';
  const arr = parseTreeArray(raw, [3, 9, 20, null, null, 15, 7]);
  return buildTree(arr);
}

// ============================================================
// 声明式算法注册 — 3 阶段完整演化体系 (Class 036 Code04)
// ============================================================
export const treeDepthVisualizer = registerDeclarativeAlgorithm<TDStep>({
  id: 'tree-depth',
  aliases: ['tree-036-depth-of-binary-tree', 'maximum-depth-of-binary-tree', 'leetcode-104'],
  name: '二叉树的最大深度',
  category: 'tree',
  icon: '📉',
  difficulty: 1,
  levelOrder: 104,
  learningGoal: '深刻理解后序自底向上分治归约与层次遍历逐层计数的两种求深度范式，掌握静态数组在层序中的极致优化',
  problemHtml: TREE_DEPTH_PROBLEM_HTML,
  analysisHtml: TREE_DEPTH_ANALYSIS_HTML,

  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      width: '180px',
      placeholder: '3, 9, 20, null...',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 3 层非平衡树',
      values: { 'input-tree': '3, 9, 20, null, null, 15, 7' },
      description: '右子树深于左子树，最大深度 = 3',
    },
    {
      label: '单链倾斜树 (4 层)',
      values: { 'input-tree': '1, 2, null, 3, null, 4' },
      description: '退化为单链表，最大深度 = 4',
    },
    {
      label: '满二叉树 (3 层)',
      values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7' },
      description: '完全对称饱满，最大深度 = 3',
    },
    {
      label: '单节点二叉树',
      values: { 'input-tree': '1' },
      description: '仅有根节点，最大深度 = 1',
    },
  ],
  metrics: [
    { id: 'cur-node', label: '当前考察节点', color: '#f59e0b' },
    { id: 'l-depth', label: '左子树深度 left', color: '#2563eb' },
    { id: 'r-depth', label: '右子树深度 right', color: '#0d9488' },
    { id: 'max-depth-res', label: '当前计算深度', color: '#16a34a' },
  ],

  // ========================
  // 多阶段演化配置 (Class 036 三段式体系)
  // ========================
  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 递归后序自底向上归约',
      shortName: '递归后序',
      num: 1,
      timeBadge: 'O(n) · O(h)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '后序分治 · 自底向上高度归约',
        complexity: 'O(n) · O(h) 递归栈深',
      },
      card1Title: '📊 二叉树拓扑与自底向上深度沙盘',
      card2Title: '🧭 左右深度比对与归约计算器',
      codeLanguages: TREE_DEPTH_STAGE1_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildTDSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: TDStep) => renderTreeDepthCanvasForStep(container, step, '#fbbf24'),
      renderCustomMetrics: (container: HTMLElement, step: TDStep) => {
        renderStage1CustomMetrics(container, step);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 层次遍历 BFS 队列计数',
      shortName: 'BFS队列',
      num: 2,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-blue' as const,
      badge: {
        mode: '广度优先 · 队列逐层扩展计数',
        complexity: 'O(n) · O(w) 队列宽度',
      },
      card1Title: '🌊 二叉树拓扑与广度层序扩展沙盘',
      card2Title: '🥞 FIFO 队列与深度计数监视器',
      codeLanguages: TREE_DEPTH_STAGE2_BFS_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildTDBfsSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: TDStep) => renderTreeDepthCanvasForStep(container, step, '#38bdf8'),
      renderCustomMetrics: (container: HTMLElement, step: TDStep) => {
        container.innerHTML = renderStage2BufferHtml(step.queue || [], step.maxDepth);
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 静态数组模拟队列 (Class 036)',
      shortName: '静态数组',
      num: 3,
      timeBadge: 'O(n) · 零GC',
      theme: 'bg-amber' as const,
      badge: {
        mode: '层次遍历 · 连续内存双指针模拟队列',
        complexity: 'O(n) · O(w) 常数极优',
      },
      card1Title: '⚡ 静态数组模拟队列拓扑沙盘',
      card2Title: '🏎️ 连续内存 queue[MAXN] 与 l/r 双指针监视器',
      codeLanguages: TREE_DEPTH_STAGE3_STATIC_ARRAY_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildTDStaticArraySteps(root);
      },
      renderCanvas: (container: HTMLElement, step: TDStep) => renderTreeDepthCanvasForStep(container, step, '#f97316'),
      renderCustomMetrics: (container: HTMLElement, step: TDStep) => {
        container.innerHTML = renderStage3BufferHtml(step.staticQueueState, step.maxDepth);
      },
    },
  ],

  // Legacy fallback
  codeLanguages: TREE_DEPTH_STAGE1_CODE,
  buildSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildTDSteps(root);
  },
  generateSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildTDSteps(root);
  },
  renderCanvas: (container, step) => {
    renderTreeDepthCanvasForStep(container, step, '#fbbf24');
  },
});