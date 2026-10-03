/**
 * 二叉树最大宽度 (Width of Binary Tree · LeetCode 662 / Class 036 Code03)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 *
 * 核心多阶段演化体系:
 *   Stage 1: 标准 Queue + 基准偏移防溢出 (Queue BFS with Base Offset · 经典集合)
 *   Stage 2: 静态双数组模拟队列 (Two Static Arrays Queue · 左神 Class 036 招牌零 GC)
 *   Stage 3: DFS 递归先序遍历记录每层最左编号 (Depth-Indexed DFS with Leftmost Map)
 */

import { parseTreeArray } from '../../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr } from '../tree-template';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  WIDTH_STAGE1_CODE,
  WIDTH_STAGE1_LINES,
  WIDTH_STAGE2_STATIC_ARRAY_CODE,
  WIDTH_STAGE2_STATIC_ARRAY_LINES,
  WIDTH_STAGE3_DFS_CODE,
  WIDTH_STAGE3_DFS_LINES,
} from './width-of-binary-tree-036-stage-codes';

/** 递归收集整树所有节点数值集合 */
export function collectAllTreeVals(node: TreeNode | null, out: Set<number> = new Set()): Set<number> {
  if (!node) return out;
  out.add(node.val);
  if (node.left) collectAllTreeVals(node.left, out);
  if (node.right) collectAllTreeVals(node.right, out);
  return out;
}

// ============================================================
// 类型契约与状态定义 (Domain Step Contract)
// ============================================================
export interface Width036StaticQueueState {
  nq: (number | string)[];
  iq: (number | string)[];
  l: number;
  r: number;
  base: number;
  windowSize: number;
}

export interface Width036Step {
  tree: TreeNode | null;
  current: number | null;
  levelIndex: number;
  maxWidth: number;
  currentSpan: number;
  decision: string;
  action: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };

  /** 节点虚拟编号标签映射 (val -> index) */
  nodeIndices: Map<number, number>;

  /** Stage 1: 队列项目 (包含节点值与编号) */
  queueItems?: { val: number; rawIdx: number; normalizedIdx?: number }[];

  /** Stage 2: 静态连续双数组队列状态 */
  staticQueueState?: Width036StaticQueueState;

  /** Stage 3: DFS 深度映射状态 */
  dfsState?: {
    leftMost: Map<number, number>;
    currentDepth: number;
    currentIndex: number;
    callStack: string[];
  };

  /** 各层结算跨度历史 */
  levelSpans?: { level: number; leftIdx: number; rightIdx: number; span: number }[];

  /** 常驻已访问节点集合 (保证最后一步全树常驻高亮，绝无暗灰) */
  visitedNodes?: Set<number> | number[];

  /** 构成全局最大宽度的该层最左、最右端点节点值 [leftVal, rightVal] */
  maxWidthEndpoints?: [number, number];

  /** 显式高亮节点清单 (用于在最后一步高亮最大宽度端点) */
  highlightedNodes?: number[];

  // Legacy Tree036Step 兼容
  activeNodeId?: number | null;
  secondaryNodeId?: number | null;
  queue?: string[];
}

function makeWidthMetrics(
  curVal: number | null,
  level: number,
  span: number,
  maxW: number
): Record<string, string | number> {
  return {
    'cur-node': curVal !== null ? curVal : '—',
    'cur-level': `第 ${level} 层`,
    'cur-span': span,
    'max-width': maxW,
    '最终最大宽度 maxWidth': maxW,
    '当前层号': level,
    '本层跨度': span,
    '历史最大宽度': maxW,
  };
}

// ============================================================
// 表现层辅助呈现组件 (Presentation Helpers)
// ============================================================
function renderWidthMetricsShell(step: Width036Step, bufferHtml: string): string {
  const spansHtml = step.levelSpans && step.levelSpans.length > 0
    ? step.levelSpans.map((sp) => `
        <div style="display: flex; align-items: center; gap: 6px; padding: 2px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
          <span style="font-size: 10.5px; font-weight: 700; color: #166534;">第 ${sp.level} 层:</span>
          <span style="font-size: 11px; font-family: monospace; color: #15803d; font-weight: 600;">[#${sp.leftIdx} ~ #${sp.rightIdx}] 跨度: ${sp.span}</span>
        </div>
      `).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待首层跨度结算...</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 10px; padding: 6px 0;">
      ${bufferHtml}
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
          <span>📏</span> 各层跨度结算记录 (最大跨度: <strong style="color: #0284c7; font-size: 13px;">${step.maxWidth}</strong>):
        </span>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${spansHtml}
        </div>
      </div>
    </div>
  `;
}

/** 缓冲器 1：Stage 1 标准队列与归一化索引监视器 */
function renderStage1QueueBufferHtml(step: Width036Step): string {
  const items = step.queueItems && step.queueItems.length > 0
    ? step.queueItems.map(item => `
        <div style="display: flex; align-items: center; gap: 4px; padding: 3px 8px; background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 6px; font-size: 11px; font-family: monospace;">
          <strong style="color: #0369a1;">Node ${item.val}</strong>
          <span style="color: #64748b;">(raw: ${item.rawIdx}${item.normalizedIdx !== undefined ? `, idx: ${item.normalizedIdx}` : ''})</span>
        </div>
      `).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #1e40af;">当前层号 / 结算跨度:</span>
        <span style="font-size: 12px; font-weight: 700; color: #2563eb; font-family: monospace;">
          第 ${step.levelIndex} 层 | 跨度: ${step.currentSpan} | 最大: ${step.maxWidth}
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">🥞 FIFO 节点队列 (含完全二叉树编号):</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 36px; align-items: center;">
          ${items}
        </div>
      </div>
    </div>
  `;
}

/** 缓冲器 2：Stage 2 连续内存双数组 nq[MAXN] / iq[MAXN] 监视器 */
function renderStage2StaticArrayBufferHtml(state?: Width036StaticQueueState): string {
  if (!state) return '';
  const { nq, iq, l, r } = state;
  const maxDisplay = Math.min(Math.max(r + 2, 8), 14);
  const cells: string[] = [];

  for (let i = 0; i < maxDisplay; i++) {
    const nodeVal = i < nq.length && nq[i] != null ? nq[i] : '—';
    const idxVal = i < iq.length && iq[i] != null ? iq[i] : '—';
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

    let ptrLabel = '&nbsp;';
    if (isL && isR) ptrLabel = '<span style="color:#ef4444; font-weight:800; font-size:9.5px;">l/r</span>';
    else if (isL) ptrLabel = '<span style="color:#0284c7; font-weight:800; font-size:9.5px;">l↓</span>';
    else if (isR) ptrLabel = '<span style="color:#10b981; font-weight:800; font-size:9.5px;">r↓</span>';

    cells.push(`
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <div style="height: 12px; line-height: 12px; font-size: 9px; font-family: monospace;">${ptrLabel}</div>
        <div style="width: 40px; height: 42px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${borderColor}; border-radius: 6px; font-family: monospace; font-size: 11px;">
          <strong style="color: ${textColor};">${nodeVal}</strong>
          <span style="font-size: 9px; color: #94a3b8;">#${idxVal}</span>
        </div>
        <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">[${i}]</span>
      </div>
    `);
  }

  const windowSize = Math.max(0, r - l);
  const curSpan = r > l && iq[r - 1] !== '—' && iq[l] !== '—' ? Number(iq[r - 1]) - Number(iq[l]) + 1 : 0;

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #92400e;">左神双数组连续内存监视 (零 GC):</span>
        <span style="font-size: 12px; font-weight: 700; color: #b45309; font-family: monospace;">
          [l=${l}, r=${r}) | 窗口大小: ${windowSize} | 本层跨度: ${curSpan}
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">🏎️ nq[MAXN] 节点与 iq[MAXN] 编号连续槽位:</span>
        <div style="display: flex; gap: 6px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto;">
          ${cells.join('')}
        </div>
      </div>
    </div>
  `;
}

/** 缓冲器 3：Stage 3 DFS 深度映射表监视器 */
function renderStage3DfsBufferHtml(step: Width036Step): string {
  const state = step.dfsState;
  if (!state) return '';
  const { leftMost, currentDepth, currentIndex } = state;

  const entries: string[] = [];
  leftMost.forEach((idx, depth) => {
    const isCur = depth === currentDepth;
    entries.push(`
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; background: ${isCur ? '#fef3c7' : '#ffffff'}; border: 1px solid ${isCur ? '#f59e0b' : '#e2e8f0'}; border-radius: 6px; font-size: 11px;">
        <span style="color: ${isCur ? '#92400e' : '#475569'}; font-weight: 600;">深度 ${depth}:</span>
        <span style="font-family: monospace; font-weight: 700; color: ${isCur ? '#b45309' : '#0284c7'};">首访编号: #${idx}</span>
      </div>
    `);
  });

  const leftForCur = leftMost.get(currentDepth);
  const curFormula = leftForCur !== undefined
    ? `${currentIndex} - ${leftForCur} + 1 = ${currentIndex - leftForCur + 1}`
    : '首访入表';

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #065f46;">DFS 深度映射计算:</span>
        <span style="font-size: 12px; font-weight: 700; color: #047857; font-family: monospace;">
          depth: ${currentDepth}, index: ${currentIndex} → 跨度: ${curFormula}
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">🗺️ 各深度首访最左编号表 leftMost:</span>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 6px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${entries.length > 0 ? entries.join('') : '<span style="color:#94a3b8; font-size:11px;">等待 DFS 遍历...</span>'}
        </div>
      </div>
    </div>
  `;
}

/** 统一画布呈现 (全景高亮常驻与端点跨度标尺契约) */
export function renderWidthCanvasForStep(
  container: HTMLElement,
  step: Width036Step,
  primaryColor: string = '#0284c7'
): void {
  const labels = new Map<number, string>();
  const isDone = step.action === 'done';
  const endpoints = step.maxWidthEndpoints || [];
  const [leftEnd, rightEnd] = endpoints.length >= 2 ? endpoints : [null, null];

  if (step.nodeIndices) {
    step.nodeIndices.forEach((idx, val) => {
      if (isDone && val === leftEnd) {
        labels.set(val, `#${idx} [最左]`);
      } else if (isDone && val === rightEnd) {
        labels.set(val, `#${idx} [最右 · 跨度${step.maxWidth}]`);
      } else {
        labels.set(val, `#${idx}`);
      }
    });
  }

  // 计算次级活跃节点 (根据各 Stage 状态自适应)
  let secondaryNodes: number[] = [];
  if (step.queueItems && step.queueItems.length > 0) {
    secondaryNodes = step.queueItems.map((q) => q.val);
  } else if (step.staticQueueState && step.staticQueueState.nq) {
    const { nq, l, r } = step.staticQueueState;
    for (let i = l; i < r && i < nq.length; i++) {
      const item = nq[i];
      if (typeof item === 'number') secondaryNodes.push(item);
    }
  }

  // 常驻已访问节点
  const visitedArr = step.visitedNodes ? Array.from(step.visitedNodes) : [];

  // 收尾步焦点：将产生最大宽度的左右两个端点节点标为焦点
  const highlightedNodes = step.highlightedNodes || (isDone && endpoints.length > 0 ? endpoints : []);

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.current,
    highlightedNodes,
    secondaryHighlightedNodes: secondaryNodes,
    visitedNodes: visitedArr,
    primaryColor: isDone ? '#eab308' : primaryColor,
    secondaryColor: '#38bdf8',
    visitedColor: '#10b981',
    labels,
  });
}

// ============================================================
// Stage 1 步骤生成器: 标准 Queue + 基准偏移防溢出 (Queue BFS)
// ============================================================
export function buildWidth036QueueSteps(root: TreeNode | null): Width036Step[] {
  const steps: Width036Step[] = [];
  const nodeIndices = new Map<number, number>();
  const levelSpans: { level: number; leftIdx: number; rightIdx: number; span: number }[] = [];
  const allTreeVals = collectAllTreeVals(root);
  const visitedNodes = new Set<number>();
  let bestEndpoints: [number, number] | undefined = undefined;
  let bestSpan = 0;
  const L = WIDTH_STAGE1_LINES;

  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    maxWidth: 0,
    currentSpan: 0,
    nodeIndices: new Map(nodeIndices),
    queueItems: [],
    levelSpans: [...levelSpans],
    visitedNodes: new Set(visitedNodes),
    decision: '算法启动：完全二叉树编号模型初始化',
    action: 'init',
    message: root
      ? `开始计算二叉树最大宽度：根节点编号为 1，节点 i 的左孩子为 2*i，右孩子为 2*i+1。为防溢出每层记录 base。`
      : '空树特判，最大宽度直接为 0。',
    log: root ? `widthOfBinaryTree(root = ${root.val}), maxWidth = 0` : 'root == null -> 0',
    metrics: makeWidthMetrics(null, 0, 0, 0),
    codeLine: root ? L.entry : L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      maxWidth: 0,
      currentSpan: 0,
      nodeIndices: new Map(nodeIndices),
      queueItems: [],
      levelSpans: [],
      visitedNodes: new Set(),
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，返回最大宽度 0。',
      log: 'root == null -> return 0',
      metrics: makeWidthMetrics(null, 0, 0, 0),
      codeLine: L.entry,
    });
    return steps;
  }

  type QueueItem = { node: TreeNode; rawIdx: number; normalizedIdx?: number };
  let queue: QueueItem[] = [{ node: root, rawIdx: 1, normalizedIdx: 0 }];
  nodeIndices.set(root.val, 1);
  visitedNodes.add(root.val);
  bestEndpoints = [root.val, root.val];
  bestSpan = 1;
  let maxWidth = 0;
  let level = 0;

  const getQueueView = (q: QueueItem[]) =>
    q.map((it) => ({ val: it.node.val, rawIdx: it.rawIdx, normalizedIdx: it.normalizedIdx }));

  steps.push({
    tree: root,
    current: root.val,
    levelIndex: 0,
    maxWidth: 0,
    currentSpan: 0,
    nodeIndices: new Map(nodeIndices),
    queueItems: getQueueView(queue),
    levelSpans: [...levelSpans],
    visitedNodes: new Set(visitedNodes),
    maxWidthEndpoints: bestEndpoints,
    decision: '根节点赋编号 1 入队',
    action: 'init-queue',
    message: `根节点 ${root.val} 入队，分配初始完全二叉树编号 index = 1。`,
    log: `queue.offer(Node ${root.val}, 1)`,
    metrics: makeWidthMetrics(root.val, 0, 0, 0),
    codeLine: L.initQueue,
  });

  while (queue.length > 0) {
    level++;
    const size = queue.length;
    const base = queue[0].rawIdx;
    let left = 0;
    let right = 0;
    const leftNodeVal = queue[0].node.val;
    let rightNodeVal = queue[0].node.val;

    steps.push({
      tree: root,
      current: queue[0].node.val,
      levelIndex: level,
      maxWidth,
      currentSpan: 0,
      nodeIndices: new Map(nodeIndices),
      queueItems: getQueueView(queue),
      levelSpans: [...levelSpans],
      visitedNodes: new Set(visitedNodes),
      maxWidthEndpoints: bestEndpoints,
      decision: `锁定第 ${level} 层基准偏移量 base = ${base} (节点数: ${size})`,
      action: 'base-offset',
      message: `开始处理第 ${level} 层：最左节点绝对编号为 ${base}。本层节点减去 base 进行归一化，彻底消除大数溢出。`,
      log: `level ${level}: size = ${size}, base = ${base}`,
      metrics: makeWidthMetrics(queue[0].node.val, level, 0, maxWidth),
      codeLine: L.baseOffset,
    });

    const nextQueue: QueueItem[] = [];

    for (let i = 0; i < size; i++) {
      const curItem = queue.shift()!;
      const cur = curItem.node;
      const rawIdx = curItem.rawIdx;
      const idx = rawIdx - base;
      curItem.normalizedIdx = idx;

      visitedNodes.add(cur.val);
      if (i === 0) left = idx;
      if (i === size - 1) {
        right = idx;
        rightNodeVal = cur.val;
      }

      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        maxWidth,
        currentSpan: right - left + 1,
        nodeIndices: new Map(nodeIndices),
        queueItems: getQueueView([...queue, ...nextQueue]),
        levelSpans: [...levelSpans],
        visitedNodes: new Set(visitedNodes),
        maxWidthEndpoints: bestEndpoints,
        decision: `[${i + 1}/${size}] 弹出节点 ${cur.val} (相对编号: ${idx})`,
        action: 'poll',
        message: `出队节点 ${cur.val}，原始编号 #${rawIdx}，减去基准 base 得到相对编号 #${idx}。`,
        log: `poll: Node ${cur.val}, rawIdx=${rawIdx}, idx=${idx}`,
        metrics: makeWidthMetrics(cur.val, level, right - left + 1, maxWidth),
        codeLine: L.pollNode,
      });

      if (cur.left) {
        const leftRaw = idx * 2;
        nodeIndices.set(cur.left.val, leftRaw);
        visitedNodes.add(cur.left.val);
        nextQueue.push({ node: cur.left, rawIdx: leftRaw });

        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          maxWidth,
          currentSpan: right - left + 1,
          nodeIndices: new Map(nodeIndices),
          queueItems: getQueueView([...queue, ...nextQueue]),
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `左孩子 ${cur.left.val} 入队 (编号: idx*2 = ${leftRaw})`,
          action: 'push-left',
          message: `节点 ${cur.val} 的左孩子 ${cur.left.val} 入队，赋予完全二叉树编号 idx * 2 = ${leftRaw}。`,
          log: `offer left: Node ${cur.left.val}, idx=${leftRaw}`,
          metrics: makeWidthMetrics(cur.left.val, level, right - left + 1, maxWidth),
          codeLine: L.pushLeft,
        });
      }

      if (cur.right) {
        const rightRaw = idx * 2 + 1;
        nodeIndices.set(cur.right.val, rightRaw);
        visitedNodes.add(cur.right.val);
        nextQueue.push({ node: cur.right, rawIdx: rightRaw });

        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          maxWidth,
          currentSpan: right - left + 1,
          nodeIndices: new Map(nodeIndices),
          queueItems: getQueueView([...queue, ...nextQueue]),
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `右孩子 ${cur.right.val} 入队 (编号: idx*2+1 = ${rightRaw})`,
          action: 'push-right',
          message: `节点 ${cur.val} 的右孩子 ${cur.right.val} 入队，赋予完全二叉树编号 idx * 2 + 1 = ${rightRaw}。`,
          log: `offer right: Node ${cur.right.val}, idx=${rightRaw}`,
          metrics: makeWidthMetrics(cur.right.val, level, right - left + 1, maxWidth),
          codeLine: L.pushRight,
        });
      }
    }

    const currentSpan = right - left + 1;
    if (currentSpan > bestSpan) {
      bestSpan = currentSpan;
      bestEndpoints = [leftNodeVal, rightNodeVal];
    }
    maxWidth = Math.max(maxWidth, currentSpan);
    levelSpans.push({ level, leftIdx: left, rightIdx: right, span: currentSpan });

    steps.push({
      tree: root,
      current: null,
      levelIndex: level,
      maxWidth,
      currentSpan,
      nodeIndices: new Map(nodeIndices),
      queueItems: getQueueView(nextQueue),
      levelSpans: [...levelSpans],
      visitedNodes: new Set(visitedNodes),
      maxWidthEndpoints: bestEndpoints,
      decision: `第 ${level} 层跨度结算: ${right} - ${left} + 1 = ${currentSpan}`,
      action: 'calc-span',
      message: `第 ${level} 层遍历完毕！最左相对编号 ${left}，最右相对编号 ${right}，本层跨度 = ${currentSpan}。全局最大宽度更新为 ${maxWidth}。`,
      log: `level ${level} span = ${currentSpan}, maxWidth = ${maxWidth}`,
      metrics: makeWidthMetrics(null, level, currentSpan, maxWidth),
      codeLine: L.calcSpan,
    });

    queue = nextQueue;
  }

  steps.push({
    tree: root,
    current: null,
    levelIndex: level,
    maxWidth,
    currentSpan: bestSpan,
    nodeIndices: new Map(nodeIndices),
    queueItems: [],
    levelSpans: [...levelSpans],
    visitedNodes: allTreeVals,
    maxWidthEndpoints: bestEndpoints,
    highlightedNodes: bestEndpoints ? [...bestEndpoints] : [],
    decision: '全树计算完成，返回最大宽度',
    action: 'done',
    message: `🎉 所有层序遍历结束！二叉树的最大宽度为 【${maxWidth}】！最宽跨度由端点节点 [#${bestEndpoints?.[0] ?? '—'}, #${bestEndpoints?.[1] ?? '—'}] 贡献，全树节点均已点亮！`,
    log: `return maxWidth = ${maxWidth}`,
    metrics: makeWidthMetrics(null, level, 0, maxWidth),
    codeLine: L.returnAns,
  });

  return steps;
}

// ============================================================
// Stage 2 步骤生成器: 静态连续双数组模拟队列 (Two Static Arrays Queue · Class 036 招牌)
// ============================================================
export function buildWidth036StaticArraySteps(root: TreeNode | null): Width036Step[] {
  const steps: Width036Step[] = [];
  const nodeIndices = new Map<number, number>();
  const levelSpans: { level: number; leftIdx: number; rightIdx: number; span: number }[] = [];
  const allTreeVals = collectAllTreeVals(root);
  const visitedNodes = new Set<number>();
  let bestEndpoints: [number, number] | undefined = undefined;
  let bestSpan = 0;
  const L = WIDTH_STAGE2_STATIC_ARRAY_LINES;

  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    maxWidth: 0,
    currentSpan: 0,
    nodeIndices: new Map(nodeIndices),
    staticQueueState: { nq: [], iq: [], l: 0, r: 0, base: 0, windowSize: 0 },
    levelSpans: [...levelSpans],
    visitedNodes: new Set(visitedNodes),
    decision: '左神 Class 036 招牌优化：分配静态双连续数组 nq[MAXN] 与 iq[MAXN]',
    action: 'init',
    message: root
      ? `左神 Class 036 招牌零 GC 优化：使用 nq[MAXN] 存节点指针，iq[MAXN] 存编号，双指针 l=0, r=0 模拟 FIFO 队列。`
      : '空树特判，直接返回最大宽度 0。',
    log: root ? 'staticQueue: l=0, r=0, MAXN=3001, zero-GC' : 'root == null -> 0',
    metrics: makeWidthMetrics(null, 0, 0, 0),
    codeLine: root ? L.entry : L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      maxWidth: 0,
      currentSpan: 0,
      nodeIndices: new Map(nodeIndices),
      staticQueueState: { nq: [], iq: [], l: 0, r: 0, base: 0, windowSize: 0 },
      levelSpans: [],
      visitedNodes: new Set(),
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，直接返回最大宽度 0。',
      log: 'root == null -> return 0',
      metrics: makeWidthMetrics(null, 0, 0, 0),
      codeLine: L.entry,
    });
    return steps;
  }

  const nq: (TreeNode | null)[] = [];
  const iq: number[] = [];
  let l = 0;
  let r = 0;

  nq[r] = root;
  iq[r] = 1;
  r++;
  nodeIndices.set(root.val, 1);
  visitedNodes.add(root.val);
  bestEndpoints = [root.val, root.val];
  bestSpan = 1;
  let maxWidth = 0;
  let level = 0;

  const getStaticState = (base: number = 0): Width036StaticQueueState => ({
    nq: nq.map((n) => (n ? n.val : '—')),
    iq: iq.map((idx) => idx),
    l,
    r,
    base,
    windowSize: Math.max(0, r - l),
  });

  steps.push({
    tree: root,
    current: root.val,
    levelIndex: 0,
    maxWidth: 0,
    currentSpan: 0,
    nodeIndices: new Map(nodeIndices),
    staticQueueState: getStaticState(0),
    levelSpans: [...levelSpans],
    visitedNodes: new Set(visitedNodes),
    maxWidthEndpoints: bestEndpoints,
    decision: '根节点装载入静态数组: nq[r]=root, iq[r++]=1',
    action: 'offer-root',
    message: `根节点 ${root.val} 入静态数组 nq[0]，编号 1 入 iq[0]，r 指针自增为 1。`,
    log: `nq[0]=Node(${root.val}), iq[0]=1, r=1`,
    metrics: makeWidthMetrics(root.val, 0, 0, 0),
    codeLine: L.offerRoot,
  });

  while (l < r) {
    level++;
    const size = r - l;
    const base = iq[l];
    const span = iq[r - 1] - iq[l] + 1;
    const leftVal = nq[l]!.val;
    const rightVal = nq[r - 1]!.val;
    if (span > bestSpan) {
      bestSpan = span;
      bestEndpoints = [leftVal, rightVal];
    }
    maxWidth = Math.max(maxWidth, span);
    levelSpans.push({ level, leftIdx: iq[l], rightIdx: iq[r - 1], span });

    steps.push({
      tree: root,
      current: nq[l]?.val ?? null,
      levelIndex: level,
      maxWidth,
      currentSpan: span,
      nodeIndices: new Map(nodeIndices),
      staticQueueState: getStaticState(base),
      levelSpans: [...levelSpans],
      visitedNodes: new Set(visitedNodes),
      maxWidthEndpoints: bestEndpoints,
      decision: `区间 [l=${l}, r=${r}) 跨度直接得出: iq[${r - 1}] - iq[${l}] + 1 = ${span}`,
      action: 'calc-span',
      message: `第 ${level} 层无需出队后再次遍历，直接利用双指针首尾做差：iq[${r - 1}](${iq[r - 1]}) - iq[${l}](${iq[l]}) + 1 = ${span}！全局最大宽度更新为 ${maxWidth}。`,
      log: `level ${level}: span = iq[${r - 1}] - iq[${l}] + 1 = ${span}, maxWidth = ${maxWidth}`,
      metrics: makeWidthMetrics(nq[l]?.val ?? null, level, span, maxWidth),
      codeLine: L.calcSpan,
    });

    for (let i = 0; i < size; i++) {
      const cur = nq[l]!;
      const idx = iq[l++] - base;
      visitedNodes.add(cur.val);

      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        maxWidth,
        currentSpan: span,
        nodeIndices: new Map(nodeIndices),
        staticQueueState: getStaticState(base),
        levelSpans: [...levelSpans],
        visitedNodes: new Set(visitedNodes),
        maxWidthEndpoints: bestEndpoints,
        decision: `出队 nq[l++] -> ${cur.val}，相对编号: ${idx}`,
        action: 'poll',
        message: `l 指针推进，读取节点 ${cur.val}，相对编号为 idx = ${idx}。`,
        log: `cur = nq[${l - 1}](${cur.val}), idx=${idx}, l=${l}`,
        metrics: makeWidthMetrics(cur.val, level, span, maxWidth),
        codeLine: L.pollNode,
      });

      if (cur.left) {
        const leftIdx = idx * 2;
        nq[r] = cur.left;
        iq[r++] = leftIdx;
        nodeIndices.set(cur.left.val, leftIdx);
        visitedNodes.add(cur.left.val);

        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          maxWidth,
          currentSpan: span,
          nodeIndices: new Map(nodeIndices),
          staticQueueState: getStaticState(base),
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `左孩子入静态数组: nq[r]=${cur.left.val}, iq[r++]=${leftIdx}`,
          action: 'push-left',
          message: `左孩子 ${cur.left.val} 写入 nq[${r - 1}]，编号 ${leftIdx} 写入 iq[${r - 1}]。`,
          log: `nq[${r - 1}]=${cur.left.val}, iq[${r - 1}]=${leftIdx}, r=${r}`,
          metrics: makeWidthMetrics(cur.left.val, level, span, maxWidth),
          codeLine: L.pushLeft,
        });
      }

      if (cur.right) {
        const rightIdx = idx * 2 + 1;
        nq[r] = cur.right;
        iq[r++] = rightIdx;
        nodeIndices.set(cur.right.val, rightIdx);
        visitedNodes.add(cur.right.val);

        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          maxWidth,
          currentSpan: span,
          nodeIndices: new Map(nodeIndices),
          staticQueueState: getStaticState(base),
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `右孩子入静态数组: nq[r]=${cur.right.val}, iq[r++]=${rightIdx}`,
          action: 'push-right',
          message: `右孩子 ${cur.right.val} 写入 nq[${r - 1}]，编号 ${rightIdx} 写入 iq[${r - 1}]。`,
          log: `nq[${r - 1}]=${cur.right.val}, iq[${r - 1}]=${rightIdx}, r=${r}`,
          metrics: makeWidthMetrics(cur.right.val, level, span, maxWidth),
          codeLine: L.pushRight,
        });
      }
    }
  }

  steps.push({
    tree: root,
    current: null,
    levelIndex: level,
    maxWidth,
    currentSpan: bestSpan,
    nodeIndices: new Map(nodeIndices),
    staticQueueState: getStaticState(0),
    levelSpans: [...levelSpans],
    visitedNodes: allTreeVals,
    maxWidthEndpoints: bestEndpoints,
    highlightedNodes: bestEndpoints ? [...bestEndpoints] : [],
    decision: '静态数组探索完毕，返回最大宽度',
    action: 'done',
    message: `🎉 静态数组全部消费完毕 (l == r)！二叉树的最大宽度为 【${maxWidth}】！最宽跨度由端点节点 [#${bestEndpoints?.[0] ?? '—'}, #${bestEndpoints?.[1] ?? '—'}] 贡献，全树节点均已点亮！`,
    log: `return maxWidth = ${maxWidth}`,
    metrics: makeWidthMetrics(null, level, 0, maxWidth),
    codeLine: L.returnAns,
  });

  return steps;
}

// ============================================================
// Stage 3 步骤生成器: DFS 递归先序遍历记录每层最左编号
// ============================================================
export function buildWidth036DfsSteps(root: TreeNode | null): Width036Step[] {
  const steps: Width036Step[] = [];
  const nodeIndices = new Map<number, number>();
  const leftMost = new Map<number, number>();
  const depthToLeftVal = new Map<number, number>();
  const levelSpans: { level: number; leftIdx: number; rightIdx: number; span: number }[] = [];
  const allTreeVals = collectAllTreeVals(root);
  const visitedNodes = new Set<number>();
  let bestEndpoints: [number, number] | undefined = undefined;
  let bestSpan = 0;
  const callStack: string[] = [];
  const L = WIDTH_STAGE3_DFS_LINES;

  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    maxWidth: 0,
    currentSpan: 0,
    nodeIndices: new Map(nodeIndices),
    dfsState: { leftMost: new Map(leftMost), currentDepth: 0, currentIndex: 1, callStack: [] },
    levelSpans: [...levelSpans],
    visitedNodes: new Set(visitedNodes),
    decision: 'DFS 先序遍历求最大宽度：先根再左再右',
    action: 'init',
    message: root
      ? `DFS 先序遍历特性：对于任何深度 depth，首次被访问的节点必定是该层最左侧节点！记入 leftMost 表。`
      : '空树特判，返回最大宽度 0。',
    log: root ? `dfs(root = ${root.val}, depth = 0, index = 1)` : 'root == null -> 0',
    metrics: makeWidthMetrics(null, 0, 0, 0),
    codeLine: root ? L.entry : L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      maxWidth: 0,
      currentSpan: 0,
      nodeIndices: new Map(nodeIndices),
      dfsState: { leftMost: new Map(leftMost), currentDepth: 0, currentIndex: 0, callStack: [] },
      levelSpans: [],
      visitedNodes: new Set(),
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，返回最大宽度 0。',
      log: 'root == null -> return 0',
      metrics: makeWidthMetrics(null, 0, 0, 0),
      codeLine: L.entry,
    });
    return steps;
  }

  visitedNodes.add(root.val);
  bestEndpoints = [root.val, root.val];
  bestSpan = 1;
  let maxWidth = 0;

  function dfs(node: TreeNode | null, depth: number, index: number): void {
    if (!node) return;

    visitedNodes.add(node.val);
    callStack.push(`dfs(Node ${node.val}, depth: ${depth}, idx: ${index})`);
    nodeIndices.set(node.val, index);

    steps.push({
      tree: root,
      current: node.val,
      levelIndex: depth,
      maxWidth,
      currentSpan: 0,
      nodeIndices: new Map(nodeIndices),
      dfsState: { leftMost: new Map(leftMost), currentDepth: depth, currentIndex: index, callStack: [...callStack] },
      levelSpans: [...levelSpans],
      visitedNodes: new Set(visitedNodes),
      maxWidthEndpoints: bestEndpoints,
      decision: `DFS 触达节点 ${node.val} (深度: ${depth}, 编号: #${index})`,
      action: 'dfs-entry',
      message: `递归到达节点 ${node.val}，所在深度为 ${depth}，虚拟编号为 #${index}。`,
      log: `dfs(node: ${node.val}, depth: ${depth}, idx: ${index})`,
      metrics: makeWidthMetrics(node.val, depth, 0, maxWidth),
      codeLine: L.dfsEntry,
    });

    if (!leftMost.has(depth)) {
      leftMost.set(depth, index);
      depthToLeftVal.set(depth, node.val);
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: depth,
        maxWidth,
        currentSpan: 1,
        nodeIndices: new Map(nodeIndices),
        dfsState: { leftMost: new Map(leftMost), currentDepth: depth, currentIndex: index, callStack: [...callStack] },
        levelSpans: [...levelSpans],
        visitedNodes: new Set(visitedNodes),
        maxWidthEndpoints: bestEndpoints,
        decision: `深度 ${depth} 首次触达！记录最左编号: leftMost[${depth}] = ${index}`,
        action: 'record-left',
        message: `由于先序遍历先左后右，节点 ${node.val} 是深度 ${depth} 遇到的第一个节点，必为最左节点！存入表。`,
        log: `leftMost[${depth}] = ${index}`,
        metrics: makeWidthMetrics(node.val, depth, 1, maxWidth),
        codeLine: L.recordLeft,
      });
    }

    const curWidth = index - leftMost.get(depth)! + 1;
    if (curWidth > bestSpan) {
      bestSpan = curWidth;
      const leftVal = depthToLeftVal.get(depth) ?? node.val;
      bestEndpoints = [leftVal, node.val];
    }
    maxWidth = Math.max(maxWidth, curWidth);

    steps.push({
      tree: root,
      current: node.val,
      levelIndex: depth,
      maxWidth,
      currentSpan: curWidth,
      nodeIndices: new Map(nodeIndices),
      dfsState: { leftMost: new Map(leftMost), currentDepth: depth, currentIndex: index, callStack: [...callStack] },
      levelSpans: [...levelSpans],
      visitedNodes: new Set(visitedNodes),
      maxWidthEndpoints: bestEndpoints,
      decision: `计算节点 ${node.val} 产生的跨度: ${index} - ${leftMost.get(depth)} + 1 = ${curWidth}`,
      action: 'calc-width',
      message: `当前节点与本层最左节点的编号差加 1 为 ${curWidth}。更新全局最大宽度为 ${maxWidth}。`,
      log: `curWidth = ${index} - ${leftMost.get(depth)} + 1 = ${curWidth}, maxWidth = ${maxWidth}`,
      metrics: makeWidthMetrics(node.val, depth, curWidth, maxWidth),
      codeLine: L.calcWidth,
    });

    if (node.left) {
      visitedNodes.add(node.left.val);
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: depth,
        maxWidth,
        currentSpan: curWidth,
        nodeIndices: new Map(nodeIndices),
        dfsState: { leftMost: new Map(leftMost), currentDepth: depth, currentIndex: index, callStack: [...callStack] },
        levelSpans: [...levelSpans],
        visitedNodes: new Set(visitedNodes),
        maxWidthEndpoints: bestEndpoints,
        decision: `准备递归左子树: dfs(${node.left.val}, depth: ${depth + 1}, idx: ${index * 2})`,
        action: 'dfs-left',
        message: `向左子树递归，编号递推为 index * 2 = ${index * 2}。`,
        log: `recurse left: ${node.left.val}`,
        metrics: makeWidthMetrics(node.left.val, depth + 1, curWidth, maxWidth),
        codeLine: L.dfsLeft,
      });
      dfs(node.left, depth + 1, index * 2);
    }

    if (node.right) {
      visitedNodes.add(node.right.val);
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: depth,
        maxWidth,
        currentSpan: curWidth,
        nodeIndices: new Map(nodeIndices),
        dfsState: { leftMost: new Map(leftMost), currentDepth: depth, currentIndex: index, callStack: [...callStack] },
        levelSpans: [...levelSpans],
        visitedNodes: new Set(visitedNodes),
        maxWidthEndpoints: bestEndpoints,
        decision: `准备递归右子树: dfs(${node.right.val}, depth: ${depth + 1}, idx: ${index * 2 + 1})`,
        action: 'dfs-right',
        message: `向右子树递归，编号递推为 index * 2 + 1 = ${index * 2 + 1}。`,
        log: `recurse right: ${node.right.val}`,
        metrics: makeWidthMetrics(node.right.val, depth + 1, curWidth, maxWidth),
        codeLine: L.dfsRight,
      });
      dfs(node.right, depth + 1, index * 2 + 1);
    }

    callStack.pop();
  }

  dfs(root, 0, 1);

  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    maxWidth,
    currentSpan: bestSpan,
    nodeIndices: new Map(nodeIndices),
    dfsState: { leftMost: new Map(leftMost), currentDepth: 0, currentIndex: 0, callStack: [] },
    levelSpans: [...levelSpans],
    visitedNodes: allTreeVals,
    maxWidthEndpoints: bestEndpoints,
    highlightedNodes: bestEndpoints ? [...bestEndpoints] : [],
    decision: 'DFS 全树遍历结束，返回最大宽度',
    action: 'done',
    message: `🎉 DFS 遍历全部完成！二叉树的最大宽度为 【${maxWidth}】！最宽跨度由端点节点 [#${bestEndpoints?.[0] ?? '—'}, #${bestEndpoints?.[1] ?? '—'}] 贡献，全树节点均已点亮！`,
    log: `return maxWidth = ${maxWidth}`,
    metrics: makeWidthMetrics(null, 0, 0, maxWidth),
    codeLine: L.returnAns,
  });

  return steps;
}

// ============================================================
// 辅助解析与默认用例
// ============================================================
function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.tree ?? '1, 3, 2, 5, 3, null, 9';
  const arr = parseTreeArray(raw, [1, 3, 2, 5, 3, null, 9]);
  return buildTreeFromArr(arr);
}

/** Legacy 兼容包装函数 */
export function buildWidth036Steps(): Width036Step[] {
  const root = parseAndBuild();
  return buildWidth036QueueSteps(root);
}

// ============================================================
// 声明式算法注册中心配置 (Declarative Algorithm Visualizer)
// ============================================================
export const widthOfBinaryTree036Visualizer = registerDeclarativeAlgorithm<Width036Step>({
  id: 'tree-036-width-of-binary-tree',
  aliases: ['leetcode-662', 'width-of-binary-tree', 'tree-036-code03'],
  name: '二叉树最大宽度 (Class 036)',
  category: 'tree',
  icon: '📏',
  difficulty: 2,
  levelOrder: 3603,
  learningGoal: '掌握完全二叉树编号模型与基于首节点偏移 base 消除整数溢出的工程技巧',
  problemHtml: TREE_036_037_PROBLEMS.widthOfBinaryTree036.html,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 标准 Queue + 基准偏移防溢出',
      shortName: 'Queue+Base',
      num: 1,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '广度优先 · 首节点基准偏移归一化',
        complexity: 'O(n) · O(w) 队列防溢出',
      },
      card1Title: '📐 二叉树拓扑与完全二叉树编号沙盘',
      card2Title: '🥞 FIFO 队列与归一化编号监视器',
      codeLanguages: WIDTH_STAGE1_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildWidth036QueueSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: Width036Step) => renderWidthCanvasForStep(container, step, '#10b981'),
      renderCustomMetrics: (container: HTMLElement, step: Width036Step) => {
        container.innerHTML = renderWidthMetricsShell(step, renderStage1QueueBufferHtml(step));
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 静态连续双数组模拟队列 (Class 036 招牌)',
      shortName: '静态双数组',
      num: 2,
      timeBadge: 'O(n) · 零GC',
      theme: 'bg-amber' as const,
      badge: {
        mode: '层次遍历 · 静态双数组双指针模拟队列',
        complexity: 'O(n) · O(w) 常数极优',
      },
      card1Title: '⚡ 静态双连续数组队列拓扑沙盘',
      card2Title: '🏎️ 连续内存 nq[MAXN] / iq[MAXN] 与双指针监视器',
      codeLanguages: WIDTH_STAGE2_STATIC_ARRAY_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildWidth036StaticArraySteps(root);
      },
      renderCanvas: (container: HTMLElement, step: Width036Step) => renderWidthCanvasForStep(container, step, '#f59e0b'),
      renderCustomMetrics: (container: HTMLElement, step: Width036Step) => {
        container.innerHTML = renderWidthMetricsShell(step, renderStage2StaticArrayBufferHtml(step.staticQueueState));
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: DFS 递归先序遍历记录每层最左编号',
      shortName: 'DFS映射',
      num: 3,
      timeBadge: 'O(n) · O(h)',
      theme: 'bg-blue' as const,
      badge: {
        mode: '深度优先 · 递归先序每层最左节点首访入表',
        complexity: 'O(n) · O(h) 递归栈',
      },
      card1Title: '🌲 DFS 先序探索路径与虚拟编号沙盘',
      card2Title: '🗺️ DFS 递归栈与各层首访最左编号表 leftMost',
      codeLanguages: WIDTH_STAGE3_DFS_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildWidth036DfsSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: Width036Step) => renderWidthCanvasForStep(container, step, '#3b82f6'),
      renderCustomMetrics: (container: HTMLElement, step: Width036Step) => {
        container.innerHTML = renderWidthMetricsShell(step, renderStage3DfsBufferHtml(step));
      },
    },
  ],

  // Fallback
  codeLanguages: WIDTH_STAGE1_CODE,
  buildSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildWidth036QueueSteps(root);
  },
  generateSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildWidth036QueueSteps(root);
  },
  renderCanvas: (container, step) => {
    renderWidthCanvasForStep(container, step, '#10b981');
  },

  inputs: [
    {
      id: 'tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '1, 3, 2, 5, 3, null, 9',
      width: '160px',
    },
  ],
  presets: [
    {
      label: '示例 1 (跨度 4 · 两翼饱满)',
      values: {
        tree: '1, 3, 2, 5, 3, null, 9',
      },
      description: '左右最宽跨度为 4',
    },
    {
      label: '示例 2 (跨度 2 · 中间空位)',
      values: {
        tree: '1, 3, 2, 5, null, null, 9',
      },
      description: '中间空位跨度为 2',
    },
    {
      label: '单链极端偏斜 (跨度 1)',
      values: {
        tree: '1, 3, null, 5',
      },
      description: '单链跨度为 1',
    },
  ],
});
