/**
 * 二叉树最大宽度通用步进编译器 (WidthStepCompiler)
 * 遵循 Matt Pocock 深模块哲学，作为轻量领域适配器全面委托收敛至 BinaryTreeTraversalCompiler
 * 封装完全二叉树编号模型、首节点基准偏移归一化、静态连续双数组双指针模拟与先序 DFS
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
import { BinaryTreeTraversalCompiler } from './binary-tree-traversal-compiler';

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
   * Stage 1: 标准 Queue + 基准偏移防溢出 (委托至 BinaryTreeTraversalCompiler.compileBfs)
   */
  public static compileQueueSteps(root: TreeNode | null): Width036Step[] {
    const nodeIndices = new Map<number, number>();
    const levelSpans: { level: number; leftIdx: number; rightIdx: number; span: number }[] = [];
    const allTreeVals = collectAllTreeVals(root);
    const visitedNodes = new Set<number>();
    const rawIdxMap = new Map<TreeNode, number>();
    let bestEndpoints: [number, number] | undefined = undefined;
    let bestSpan = 0;
    let maxWidth = 0;
    let curLevel = 0;
    let base = 1;
    let left = 0;
    let right = 0;
    let leftNodeVal = 0;
    let rightNodeVal = 0;
    let levelSize = 0;
    const L = WIDTH_STAGE1_LINES;

    return BinaryTreeTraversalCompiler.compileBfs<TreeNode, number>({
      root,
      stageId: 'stage-1',
      onEmpty: () => ({
        result: 0,
        steps: [
          {
            tree: null,
            current: null,
            levelIndex: 0,
            maxWidth: 0,
            currentSpan: 0,
            nodeIndices: new Map(nodeIndices),
            queueItems: [],
            levelSpans: [],
            visitedNodes: new Set(),
            decision: '算法启动：完全二叉树编号模型初始化',
            action: 'init',
            message: '空树特判，最大宽度直接为 0。',
            log: 'root == null -> 0',
            metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, 0),
            codeLine: L.entry,
          },
          {
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
          },
        ],
      }),
      onInit: (ctx) => {
        rawIdxMap.set(root!, 1);
        nodeIndices.set(root!.val, 1);
        visitedNodes.add(root!.val);
        bestEndpoints = [root!.val, root!.val];
        bestSpan = 1;

        return [
          {
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
            message: `开始计算二叉树最大宽度：根节点编号为 1，节点 i 的左孩子为 2*i，右孩子为 2*i+1。为防溢出每层记录 base。`,
            log: `widthOfBinaryTree(root = ${root!.val}), maxWidth = 0`,
            metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, 0),
            codeLine: L.entry,
          },
          {
            tree: root,
            current: root!.val,
            levelIndex: 0,
            maxWidth: 0,
            currentSpan: 0,
            nodeIndices: new Map(nodeIndices),
            queueItems: [{ val: root!.val, rawIdx: 1, normalizedIdx: 0 }],
            levelSpans: [...levelSpans],
            visitedNodes: new Set(visitedNodes),
            maxWidthEndpoints: bestEndpoints,
            decision: '根节点赋编号 1 入队',
            action: 'init-queue',
            message: `根节点 ${root!.val} 入队，分配初始完全二叉树编号 index = 1。`,
            log: `queue.offer(Node ${root!.val}, 1)`,
            metrics: WidthCanvasAdapter.makeMetrics(root!.val, 0, 0, 0),
            codeLine: L.initQueue,
          },
        ];
      },
      onLevelStart: (ctx) => {
        curLevel = ctx.levelIndex;
        levelSize = ctx.queue.length;
        base = rawIdxMap.get(ctx.queue[0]) ?? 1;
        leftNodeVal = ctx.queue[0].val;
        rightNodeVal = ctx.queue[levelSize - 1]?.val ?? ctx.queue[0].val;

        const queueItems = ctx.queue.map((n) => {
          const raw = rawIdxMap.get(n) ?? 1;
          return { val: n.val, rawIdx: raw, normalizedIdx: raw - base };
        });

        return {
          tree: root,
          current: ctx.queue[0].val,
          levelIndex: curLevel,
          maxWidth,
          currentSpan: 0,
          nodeIndices: new Map(nodeIndices),
          queueItems,
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `锁定第 ${curLevel} 层基准偏移量 base = ${base} (节点数: ${levelSize})`,
          action: 'base-offset',
          message: `开始处理第 ${curLevel} 层：最左节点绝对编号为 ${base}。本层节点减去 base 进行归一化，彻底消除大数溢出。`,
          log: `level ${curLevel}: size = ${levelSize}, base = ${base}`,
          metrics: WidthCanvasAdapter.makeMetrics(ctx.queue[0].val, curLevel, 0, maxWidth),
          codeLine: L.baseOffset,
        };
      },
      onPollNode: (cur, ctx) => {
        const rawIdx = rawIdxMap.get(cur) ?? 1;
        const idx = rawIdx - base;
        visitedNodes.add(cur.val);

        if (leftNodeVal === cur.val) left = idx;
        right = idx;
        rightNodeVal = cur.val;

        const queueItems = ctx.queue.map((n) => {
          const r = rawIdxMap.get(n) ?? 1;
          return { val: n.val, rawIdx: r, normalizedIdx: r - base };
        });

        return {
          tree: root,
          current: cur.val,
          levelIndex: curLevel,
          maxWidth,
          currentSpan: right - left + 1,
          nodeIndices: new Map(nodeIndices),
          queueItems,
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `[出队节点] 弹出节点 ${cur.val} (相对编号: ${idx})`,
          action: 'poll',
          message: `出队节点 ${cur.val}，原始编号 #${rawIdx}，减去基准 base 得到相对编号 #${idx}。`,
          log: `poll: Node ${cur.val}, rawIdx=${rawIdx}, idx=${idx}`,
          metrics: WidthCanvasAdapter.makeMetrics(cur.val, curLevel, right - left + 1, maxWidth),
          codeLine: L.pollNode,
        };
      },
      onExpandChild: (parent, child, branch, ctx) => {
        const parentRaw = rawIdxMap.get(parent) ?? 1;
        const parentIdx = parentRaw - base;
        const childRaw = branch === 'left' ? parentIdx * 2 : parentIdx * 2 + 1;
        rawIdxMap.set(child, childRaw);
        nodeIndices.set(child.val, childRaw);
        visitedNodes.add(child.val);

        const queueItems = ctx.queue.map((n) => {
          const r = rawIdxMap.get(n) ?? 1;
          return { val: n.val, rawIdx: r, normalizedIdx: r - base };
        });

        return {
          tree: root,
          current: parent.val,
          levelIndex: curLevel,
          maxWidth,
          currentSpan: right - left + 1,
          nodeIndices: new Map(nodeIndices),
          queueItems,
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `${branch === 'left' ? '左' : '右'}孩子 ${child.val} 入队 (编号: ${branch === 'left' ? 'idx*2' : 'idx*2+1'} = ${childRaw})`,
          action: branch === 'left' ? 'push-left' : 'push-right',
          message: `节点 ${parent.val} 的${branch === 'left' ? '左' : '右'}孩子 ${child.val} 入队，赋予完全二叉树编号 ${childRaw}。`,
          log: `offer ${branch}: Node ${child.val}, idx=${childRaw}`,
          metrics: WidthCanvasAdapter.makeMetrics(child.val, curLevel, right - left + 1, maxWidth),
          codeLine: branch === 'left' ? L.pushLeft : L.pushRight,
        };
      },
      onLevelEnd: (ctx) => {
        const currentSpan = right - left + 1;
        if (currentSpan > bestSpan) {
          bestSpan = currentSpan;
          bestEndpoints = [leftNodeVal, rightNodeVal];
        }
        maxWidth = Math.max(maxWidth, currentSpan);
        levelSpans.push({ level: curLevel, leftIdx: left, rightIdx: right, span: currentSpan });

        const queueItems = ctx.queue.map((n) => {
          const r = rawIdxMap.get(n) ?? 1;
          return { val: n.val, rawIdx: r, normalizedIdx: r - base };
        });

        return {
          tree: root,
          current: null,
          levelIndex: curLevel,
          maxWidth,
          currentSpan,
          nodeIndices: new Map(nodeIndices),
          queueItems,
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `第 ${curLevel} 层跨度结算: ${right} - ${left} + 1 = ${currentSpan}`,
          action: 'calc-span',
          message: `第 ${curLevel} 层遍历完毕！最左相对编号 ${left}，最右相对编号 ${right}，本层跨度 = ${currentSpan}。全局最大宽度更新为 ${maxWidth}。`,
          log: `level ${curLevel} span = ${currentSpan}, maxWidth = ${maxWidth}`,
          metrics: WidthCanvasAdapter.makeMetrics(null, curLevel, currentSpan, maxWidth),
          codeLine: L.calcSpan,
        };
      },
      onDone: () => ({
        tree: root,
        current: null,
        levelIndex: curLevel,
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
        metrics: WidthCanvasAdapter.makeMetrics(null, curLevel, 0, maxWidth),
        codeLine: L.returnAns,
      }),
    }) as Width036Step[];
  }

  /**
   * Stage 2: 静态连续双数组模拟队列 (委托至 BinaryTreeTraversalCompiler.compileStaticQueue)
   */
  public static compileStaticArraySteps(root: TreeNode | null): Width036Step[] {
    const nodeIndices = new Map<number, number>();
    const levelSpans: { level: number; leftIdx: number; rightIdx: number; span: number }[] = [];
    const allTreeVals = collectAllTreeVals(root);
    const visitedNodes = new Set<number>();
    const nqList: (TreeNode | null)[] = [];
    const iqList: number[] = [];
    let bestEndpoints: [number, number] | undefined = undefined;
    let bestSpan = 0;
    let maxWidth = 0;
    let curLevel = 0;
    let base = 0;
    let span = 0;
    const L = WIDTH_STAGE2_STATIC_ARRAY_LINES;

    const getStaticState = (l: number, r: number, b: number = 0): Width036StaticQueueState => ({
      nq: nqList.slice(0, r).map((n) => (n ? n.val : '—')),
      iq: iqList.slice(0, r),
      l,
      r,
      base: b,
      windowSize: Math.max(0, r - l),
    });

    return BinaryTreeTraversalCompiler.compileStaticQueue<TreeNode, number>({
      root,
      stageId: 'stage-2',
      onEmpty: () => ({
        result: 0,
        steps: [
          {
            tree: null,
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
            message: '空树特判，直接返回最大宽度 0。',
            log: 'root == null -> 0',
            metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, 0),
            codeLine: L.entry,
          },
          {
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
          },
        ],
      }),
      onInit: (l, r) => {
        nqList[0] = root;
        iqList[0] = 1;
        nodeIndices.set(root!.val, 1);
        visitedNodes.add(root!.val);
        bestEndpoints = [root!.val, root!.val];
        bestSpan = 1;

        return [
          {
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
            message: `左神 Class 036 招牌零 GC 优化：使用 nq[MAXN] 存节点指针，iq[MAXN] 存编号，双指针 l=0, r=0 模拟 FIFO 队列。`,
            log: 'staticQueue: l=0, r=0, MAXN=3001, zero-GC',
            metrics: WidthCanvasAdapter.makeMetrics(null, 0, 0, 0),
            codeLine: L.entry,
          },
          {
            tree: root,
            current: root!.val,
            levelIndex: 0,
            maxWidth: 0,
            currentSpan: 0,
            nodeIndices: new Map(nodeIndices),
            staticQueueState: getStaticState(0, 1, 0),
            levelSpans: [...levelSpans],
            visitedNodes: new Set(visitedNodes),
            maxWidthEndpoints: bestEndpoints,
            decision: '根节点装载入静态数组: nq[r]=root, iq[r++]=1',
            action: 'offer-root',
            message: `根节点 ${root!.val} 入静态数组 nq[0]，编号 1 入 iq[0]，r 指针自增为 1。`,
            log: `nq[0]=Node(${root!.val}), iq[0]=1, r=1`,
            metrics: WidthCanvasAdapter.makeMetrics(root!.val, 0, 0, 0),
            codeLine: L.offerRoot,
          },
        ];
      },
      onLevelStart: (level, _levelSize, l, r) => {
        curLevel = level;
        base = iqList[l] ?? 1;
        span = iqList[r - 1] - iqList[l] + 1;
        const leftVal = nqList[l]!.val;
        const rightVal = nqList[r - 1]!.val;

        if (span > bestSpan) {
          bestSpan = span;
          bestEndpoints = [leftVal, rightVal];
        }
        maxWidth = Math.max(maxWidth, span);
        levelSpans.push({ level, leftIdx: iqList[l], rightIdx: iqList[r - 1], span });

        return {
          tree: root,
          current: nqList[l]?.val ?? null,
          levelIndex: level,
          maxWidth,
          currentSpan: span,
          nodeIndices: new Map(nodeIndices),
          staticQueueState: getStaticState(l, r, base),
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `区间 [l=${l}, r=${r}) 跨度直接得出: iq[${r - 1}] - iq[${l}] + 1 = ${span}`,
          action: 'calc-span',
          message: `第 ${level} 层无需出队后再次遍历，直接利用双指针首尾做差：iq[${r - 1}](${iqList[r - 1]}) - iq[${l}](${iqList[l]}) + 1 = ${span}！全局最大宽度更新为 ${maxWidth}。`,
          log: `level ${level}: span = iq[${r - 1}] - iq[${l}] + 1 = ${span}, maxWidth = ${maxWidth}`,
          metrics: WidthCanvasAdapter.makeMetrics(nqList[l]?.val ?? null, level, span, maxWidth),
          codeLine: L.calcSpan,
        };
      },
      onPollNode: (cur, l, r) => {
        const rawIdx = iqList[l - 1] ?? 1;
        const idx = rawIdx - base;
        visitedNodes.add(cur.val);

        return {
          tree: root,
          current: cur.val,
          levelIndex: curLevel,
          maxWidth,
          currentSpan: span,
          nodeIndices: new Map(nodeIndices),
          staticQueueState: getStaticState(l, r, base),
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `出队 nq[l++] -> ${cur.val}，相对编号: ${idx}`,
          action: 'poll',
          message: `l 指针推进，读取节点 ${cur.val}，相对编号为 idx = ${idx}。`,
          log: `cur = nq[${l - 1}](${cur.val}), idx=${idx}, l=${l}`,
          metrics: WidthCanvasAdapter.makeMetrics(cur.val, curLevel, span, maxWidth),
          codeLine: L.pollNode,
        };
      },
      onPushChild: (child, branch, l, r, _arr, parent) => {
        const parentRaw = iqList[l - 1] ?? 1;
        const parentIdx = parentRaw - base;
        const childIdx = branch === 'left' ? parentIdx * 2 : parentIdx * 2 + 1;
        nqList[r - 1] = child;
        iqList[r - 1] = childIdx;
        nodeIndices.set(child.val, childIdx);
        visitedNodes.add(child.val);

        return {
          tree: root,
          current: parent?.val ?? null,
          levelIndex: curLevel,
          maxWidth,
          currentSpan: span,
          nodeIndices: new Map(nodeIndices),
          staticQueueState: getStaticState(l, r, base),
          levelSpans: [...levelSpans],
          visitedNodes: new Set(visitedNodes),
          maxWidthEndpoints: bestEndpoints,
          decision: `${branch === 'left' ? '左' : '右'}孩子入静态数组: nq[r]=${child.val}, iq[r++]=${childIdx}`,
          action: branch === 'left' ? 'push-left' : 'push-right',
          message: `${branch === 'left' ? '左' : '右'}孩子 ${child.val} 写入 nq[${r - 1}]，编号 ${childIdx} 写入 iq[${r - 1}]。`,
          log: `nq[${r - 1}]=${child.val}, iq[${r - 1}]=${childIdx}, r=${r}`,
          metrics: WidthCanvasAdapter.makeMetrics(child.val, curLevel, span, maxWidth),
          codeLine: branch === 'left' ? L.pushLeft : L.pushRight,
        };
      },
      onDone: (_res, l, r) => ({
        tree: root,
        current: null,
        levelIndex: curLevel,
        maxWidth,
        currentSpan: bestSpan,
        nodeIndices: new Map(nodeIndices),
        staticQueueState: getStaticState(l, r, 0),
        levelSpans: [...levelSpans],
        visitedNodes: allTreeVals,
        maxWidthEndpoints: bestEndpoints,
        highlightedNodes: bestEndpoints ? [...bestEndpoints] : [],
        decision: '静态数组探索完毕，返回最大宽度',
        action: 'done',
        message: `🎉 静态数组全部消费完毕 (l == r)！二叉树的最大宽度为 【${maxWidth}】！最宽跨度由端点节点 [#${bestEndpoints?.[0] ?? '—'}, #${bestEndpoints?.[1] ?? '—'}] 贡献，全树节点均已点亮！`,
        log: `return maxWidth = ${maxWidth}`,
        metrics: WidthCanvasAdapter.makeMetrics(null, curLevel, 0, maxWidth),
        codeLine: L.returnAns,
      }),
    }) as Width036Step[];
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
