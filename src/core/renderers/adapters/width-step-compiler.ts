/**
 * 二叉树最大宽度通用步进编译器 (WidthStepCompiler)
 * 深度模块 (Deep Module): 封装完全二叉树编号模型、首节点基准偏移归一化、
 * 静态连续双数组双指针模拟、以及先序 DFS 深度映射等三阶段演化推演
 * 遵循 Matt Pocock 深模块规范与 Strict One-Line-One-Step 步进契约
 */

import { TreeNode, buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { parseTreeArray } from '../../input-primitives';
import { HighlightTarget } from '../../step-visualizer';
import {
  WidthCanvasAdapter,
  Width036StaticQueueState,
} from './width-canvas-adapter';
import {
  WIDTH_STAGE1_LINES,
  WIDTH_STAGE2_STATIC_ARRAY_LINES,
  WIDTH_STAGE3_DFS_LINES,
} from '../../../algorithms/categories/tree/tree-036-037/width-of-binary-tree-036-stage-codes';

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

  nodeIndices: Map<number, number>;
  queueItems?: { val: number; rawIdx: number; normalizedIdx?: number }[];
  staticQueueState?: Width036StaticQueueState;
  dfsState?: {
    leftMost: Map<number, number>;
    currentDepth: number;
    currentIndex: number;
    callStack: string[];
  };
  levelSpans?: { level: number; leftIdx: number; rightIdx: number; span: number }[];
  visitedNodes?: Set<number> | number[];
  maxWidthEndpoints?: [number, number];
  highlightedNodes?: number[];

  // Legacy Tree036Step 兼容
  activeNodeId?: number | null;
  secondaryNodeId?: number | null;
  queue?: string[];
}

export function collectAllTreeVals(node: TreeNode | null, out: Set<number> = new Set()): Set<number> {
  if (!node) return out;
  out.add(node.val);
  if (node.left) collectAllTreeVals(node.left, out);
  if (node.right) collectAllTreeVals(node.right, out);
  return out;
}

export class WidthStepCompiler {
  /**
   * Stage 1: 标准 Queue + 基准偏移防溢出 (Queue BFS)
   */
  public static compileQueueSteps(root: TreeNode | null): Width036Step[] {
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
      metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, 0),
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
        metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, 0),
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
      metrics: WidthCanvasAdapter.makeMetrics(root.val, 0, 0, 0),
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
        metrics: WidthCanvasAdapter.makeMetrics(queue[0].node.val, level, 0, maxWidth),
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
          metrics: WidthCanvasAdapter.makeMetrics(cur.val, level, right - left + 1, maxWidth),
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
            metrics: WidthCanvasAdapter.makeMetrics(cur.left.val, level, right - left + 1, maxWidth),
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
            metrics: WidthCanvasAdapter.makeMetrics(cur.right.val, level, right - left + 1, maxWidth),
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
        metrics: WidthCanvasAdapter.makeMetrics(null, level, currentSpan, maxWidth),
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
      metrics: WidthCanvasAdapter.makeMetrics(null, level, 0, maxWidth),
      codeLine: L.returnAns,
    });

    return steps;
  }

  /**
   * Stage 2: 静态连续双数组模拟队列 (Two Static Arrays Queue)
   */
  public static compileStaticArraySteps(root: TreeNode | null): Width036Step[] {
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
      metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, 0),
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
        metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, 0),
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
      metrics: WidthCanvasAdapter.makeMetrics(root.val, 0, 0, 0),
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
        metrics: WidthCanvasAdapter.makeMetrics(nq[l]?.val ?? null, level, span, maxWidth),
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
          metrics: WidthCanvasAdapter.makeMetrics(cur.val, level, span, maxWidth),
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
            metrics: WidthCanvasAdapter.makeMetrics(cur.left.val, level, span, maxWidth),
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
            metrics: WidthCanvasAdapter.makeMetrics(cur.right.val, level, span, maxWidth),
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
      metrics: WidthCanvasAdapter.makeMetrics(null, level, 0, maxWidth),
      codeLine: L.returnAns,
    });

    return steps;
  }

  /**
   * Stage 3: DFS 递归先序遍历记录每层最左编号
   */
  public static compileDfsSteps(root: TreeNode | null): Width036Step[] {
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
      metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, 0),
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
        metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, 0),
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
        metrics: WidthCanvasAdapter.makeMetrics(node.val, depth, 0, maxWidth),
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
          metrics: WidthCanvasAdapter.makeMetrics(node.val, depth, 1, maxWidth),
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
        metrics: WidthCanvasAdapter.makeMetrics(node.val, depth, curWidth, maxWidth),
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
          metrics: WidthCanvasAdapter.makeMetrics(node.left.val, depth + 1, curWidth, maxWidth),
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
          metrics: WidthCanvasAdapter.makeMetrics(node.right.val, depth + 1, curWidth, maxWidth),
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
      metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, maxWidth),
      codeLine: L.returnAns,
    });

    return steps;
  }

  /**
   * Legacy 兼容函数
   */
  public static compileLegacySteps(treeRaw?: string): Width036Step[] {
    const raw = treeRaw ?? '1, 3, 2, 5, 3, null, 9';
    const arr = parseTreeArray(raw, [1, 3, 2, 5, 3, null, 9]);
    const root = buildTreeFromArr(arr);
    return WidthStepCompiler.compileQueueSteps(root);
  }
}
