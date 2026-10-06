/**
 * 二叉树深度族群推演步进编译器深模块 (TreeDepthStepCompiler)
 *
 * 依据 Matt Pocock 深模块哲学与“两适配器深化法则（Two-Adapter Deepening Rule）”，
 * 将 LeetCode 104 (最大深度) 与 LeetCode 111 (最小深度) 的多阶段演化推演逻辑沉淀为单一事实来源：
 *   - Stage 1: 递归后序自底向上高度归约 (Divide & Conquer DFS)
 *   - Stage 2: 层次遍历 BFS 队列层数探索与提前退出 (Level Order BFS Queue)
 *   - Stage 3: 静态连续内存双指针模拟队列 (Static Array Queue · 左神 Class 036 招牌零 GC)
 */

import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import { HighlightTarget, StepBase } from '../../step-visualizer';
import {
  CallTraceSnapshot,
  CallTraceLine,
} from './recursive-call-trace-adapter';
import {
  TREE_DEPTH_STAGE1_LINES,
  TREE_DEPTH_STAGE2_BFS_LINES,
  TREE_DEPTH_STAGE3_STATIC_ARRAY_LINES,
} from '../../../algorithms/categories/tree/tree-depth-stage-codes';
import {
  MIN_DEPTH_STAGE1_CODES,
} from '../../../algorithms/categories/tree/min-depth-stage-codes';

// ============================================================
// 契约类型定义
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

export interface MinDepthStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  minDepth: number | null;
  message: string;
  log: string;
  decision: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string | number>;
  stageId?: string;
  queueState?: number[];
  staticQueueState?: { l: number; r: number; queue: number[] };
  highlightedNodes?: number[];
  callTrace?: CallTraceSnapshot;
}

export const TREE_DEPTH_CODE_LINES = TREE_DEPTH_STAGE1_LINES;

export const MIN_DEPTH_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  baseNull: { java: 3, cpp: 4, python: 3, javascript: 2 },
  baseLeaf: { java: 4, cpp: 5, python: 5, javascript: 3 },
  leftNull: { java: 5, cpp: 6, python: 7, javascript: 4 },
  rightNull: { java: 6, cpp: 7, python: 9, javascript: 5 },
  callLeft: { java: 7, cpp: 8, python: 11, javascript: 6 },
  callRight: { java: 8, cpp: 9, python: 12, javascript: 7 },
  returnMin: { java: 9, cpp: 10, python: 13, javascript: 8 },
  bothRecurse: { java: 9, cpp: 10, python: 13, javascript: 8 },
  done: { java: 10, cpp: 11, python: 13, javascript: 9 },
};

export const MIN_DEPTH_STAGE2_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  baseNull: { java: 3, cpp: 4, python: 3, javascript: 2 },
  initQueue: { java: 4, cpp: 5, python: 5, javascript: 3 },
  whileLoop: { java: 7, cpp: 8, python: 7, javascript: 5 },
  pollNode: { java: 10, cpp: 11, python: 9, javascript: 8 },
  leafExit: { java: 12, cpp: 13, python: 11, javascript: 10 },
  pushChildren: { java: 14, cpp: 15, python: 13, javascript: 12 },
  incDepth: { java: 17, cpp: 18, python: 16, javascript: 15 },
  done: { java: 19, cpp: 20, python: 11, javascript: 10 },
};

export const MIN_DEPTH_STAGE3_LINES = {
  entry: { java: 4, cpp: 5, python: 2, javascript: 1 },
  baseNull: { java: 5, cpp: 6, python: 3, javascript: 2 },
  initArray: { java: 6, cpp: 7, python: 5, javascript: 3 },
  whileLoop: { java: 9, cpp: 10, python: 10, javascript: 7 },
  pollNode: { java: 12, cpp: 13, python: 12, javascript: 10 },
  leafExit: { java: 14, cpp: 15, python: 15, javascript: 12 },
  pushChildren: { java: 16, cpp: 17, python: 17, javascript: 14 },
  incDepth: { java: 19, cpp: 20, python: 24, javascript: 17 },
  done: { java: 14, cpp: 15, python: 15, javascript: 12 },
};

export const MIN_DEPTH_CODES = MIN_DEPTH_STAGE1_CODES;

export function makeTDMetrics(curNode: number | null, lDepth: number, rDepth: number, maxD: number): Record<string, string | number> {
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

export class TreeDepthStepCompiler {
  // ============================================================
  // LeetCode 104: 最大深度 (Maximum Depth)
  // ============================================================

  /**
   * Stage 1: 递归后序自底向上高度归约 (Post-order DFS)
   */
  public static compileMaxDepthStage1Steps(root: TreeNode | null): TDStep[] {
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

      steps.push({
        tree: root,
        current: node.val,
        leftDepth: 0,
        rightDepth: 0,
        maxDepth: 0,
        depthsMap: new Map(depthsMap),
        decision: `节点 ${node.val} 非空检查通过`,
        action: 'check-non-empty',
        message: `节点 ${node.val} 非空，跳过 root == null 特判，准备深入左子树。`,
        log: `node ${node.val} != null`,
        metrics: makeTDMetrics(node.val, 0, 0, 0),
        codeLine: L.empty,
        callTrace: makeSnapshot(passLineId),
      });

      // 深入左子树
      const leftPrepId = `left-prep-${node.val}`;
      traceLines.push({
        id: leftPrepId,
        depth: depth - 1,
        text: `② int leftDepth = maxDepth(${node.left ? node.left.val : 'null'})`,
        kind: 'recurse-prep',
      });

      steps.push({
        tree: root,
        current: node.val,
        leftDepth: 0,
        rightDepth: 0,
        maxDepth: 0,
        depthsMap: new Map(depthsMap),
        decision: `准备深入节点 ${node.val} 的左子树`,
        action: 'call-left',
        message: `发起左递归调用：int leftDepth = maxDepth(${node.left ? node.left.val : 'null'})。`,
        log: `recurse left: ${node.left ? node.left.val : 'null'}`,
        metrics: makeTDMetrics(node.val, 0, 0, 0),
        codeLine: L.callLeft,
        callTrace: makeSnapshot(leftPrepId),
      });

      const l = dfs(node.left, depth + 1, `<- 算${node.val}的左子树`);

      // 左子树就绪
      const leftDoneId = `left-done-${node.val}`;
      traceLines.push({
        id: leftDoneId,
        depth: depth - 1,
        text: `左子树就绪: leftDepth = ${l}`,
        kind: 'unwind-calc',
      });

      steps.push({
        tree: root,
        current: node.val,
        leftDepth: l,
        rightDepth: 0,
        maxDepth: 0,
        depthsMap: new Map(depthsMap),
        decision: `节点 ${node.val} 左子树深度就绪: ${l}`,
        action: 'left-done',
        message: `节点 ${node.val} 的左子树深度计算完成: leftDepth = ${l}。接下来深入右子树。`,
        log: `node ${node.val}: leftDepth = ${l}`,
        metrics: makeTDMetrics(node.val, l, 0, 0),
        codeLine: L.leftDone,
        callTrace: makeSnapshot(leftDoneId),
      });

      // 深入右子树
      const rightPrepId = `right-prep-${node.val}`;
      traceLines.push({
        id: rightPrepId,
        depth: depth - 1,
        text: `③ int rightDepth = maxDepth(${node.right ? node.right.val : 'null'})`,
        kind: 'recurse-prep',
      });

      steps.push({
        tree: root,
        current: node.val,
        leftDepth: l,
        rightDepth: 0,
        maxDepth: 0,
        depthsMap: new Map(depthsMap),
        decision: `准备深入节点 ${node.val} 的右子树`,
        action: 'call-right',
        message: `发起右递归调用：int rightDepth = maxDepth(${node.right ? node.right.val : 'null'})。`,
        log: `recurse right: ${node.right ? node.right.val : 'null'}`,
        metrics: makeTDMetrics(node.val, l, 0, 0),
        codeLine: L.callRight,
        callTrace: makeSnapshot(rightPrepId),
      });

      const r = dfs(node.right, depth + 1, `<- 算${node.val}的右子树`);

      // 右子树就绪
      const rightDoneId = `right-done-${node.val}`;
      traceLines.push({
        id: rightDoneId,
        depth: depth - 1,
        text: `右子树就绪: rightDepth = ${r}`,
        kind: 'unwind-calc',
      });

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

  /**
   * Stage 2: 层次遍历 BFS 队列层数计数 (Level Order BFS Queue)
   */
  public static compileMaxDepthStage2BfsSteps(root: TreeNode | null): TDStep[] {
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
        message: '树为空，直接返回深度 0。',
        log: 'root == null -> 0',
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
      decision: `根节点 ${root.val} 入队，准备开始逐层遍历`,
      action: 'enqueue-root',
      message: `将根节点 ${root.val} 放入队列，此时队列长度为 1。`,
      log: `enqueue root ${root.val}`,
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
        decision: `准备遍历第 ${depth + 1} 层：本层包含 ${size} 个节点`,
        action: 'level-start',
        message: `当前层节点总数 size = ${size}。将在一次循环中全部出队并扩展下一层节点。`,
        log: `level ${depth + 1} size = ${size}`,
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
          decision: `节点 ${cur.val} 出队，并探查其孩子节点`,
          action: 'poll-node',
          message: `节点 ${cur.val} 出队。检查其左孩子 (${cur.left ? cur.left.val : '空'}) 与右孩子 (${cur.right ? cur.right.val : '空'})。`,
          log: `poll ${cur.val}`,
          metrics: makeTDMetrics(cur.val, 0, 0, depth),
          codeLine: L.popNode,
        });

        if (cur.left) {
          queue.push(cur.left);
          steps.push({
            tree: root,
            current: cur.val,
            leftDepth: 0,
            rightDepth: 0,
            maxDepth: depth,
            depthsMap: new Map(depthsMap),
            queue: queue.map((n) => n.val),
            levelIndex: depth,
            decision: `节点 ${cur.val} 的左孩子 ${cur.left.val} 入队`,
            action: 'enqueue-child',
            message: `发现左孩子 ${cur.left.val}，推入下一层队列等待扫描。`,
            log: `enqueue left child ${cur.left.val}`,
            metrics: makeTDMetrics(cur.val, 0, 0, depth),
            codeLine: L.pushChildren,
          });
        }

        if (cur.right) {
          queue.push(cur.right);
          steps.push({
            tree: root,
            current: cur.val,
            leftDepth: 0,
            rightDepth: 0,
            maxDepth: depth,
            depthsMap: new Map(depthsMap),
            queue: queue.map((n) => n.val),
            levelIndex: depth,
            decision: `节点 ${cur.val} 的右孩子 ${cur.right.val} 入队`,
            action: 'enqueue-child',
            message: `发现右孩子 ${cur.right.val}，推入下一层队列等待扫描。`,
            log: `enqueue right child ${cur.right.val}`,
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

  /**
   * Stage 3: 静态数组模拟队列 (Static Array Queue BFS · Class 036 招牌)
   */
  public static compileMaxDepthStage3StaticArraySteps(root: TreeNode | null): TDStep[] {
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
      staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l },
      decision: `根节点 ${root.val} 写入 queue[0]，指针前进至 r=1`,
      action: 'enqueue-root',
      message: `静态数组压入根节点：queue[r++] = root。双指针状态: l=${l}, r=${r}。`,
      log: `queue[0] = ${root.val}, r=1`,
      metrics: makeTDMetrics(root.val, 0, 0, 0),
      codeLine: L.initPointers,
    });

    while (l < r) {
      const n = r; // 本层右边界

      steps.push({
        tree: root,
        current: null,
        leftDepth: 0,
        rightDepth: 0,
        maxDepth: depth,
        depthsMap: new Map(depthsMap),
        staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l },
        decision: `本层扫描窗口确立：区间 [l=${l}, r=${n})，共 ${n - l} 个节点`,
        action: 'level-boundary',
        message: `捕获本层静态边界 n = ${n}。循环条件：while (l < n)，无需任何动态队列开销！`,
        log: `level boundary n = ${n}, window size = ${n - l}`,
        metrics: makeTDMetrics(null, 0, 0, depth),
        codeLine: L.loopLevel,
      });

      while (l < n) {
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
          decision: `从连续内存读取节点 queue[l++] ➔ ${cur.val}，指针 l 推进至 ${l}`,
          action: 'poll-static',
          message: `节点 ${cur.val} 读取完成。指针自增 l=${l}。继续检查左右子节点并追加至 r 指针处。`,
          log: `read cur = queue[${l - 1}] (${cur.val}), l=${l}`,
          metrics: makeTDMetrics(cur.val, 0, 0, depth),
          codeLine: L.popNode,
        });

        if (cur.left) {
          staticArray[r++] = cur.left;
          steps.push({
            tree: root,
            current: cur.val,
            leftDepth: 0,
            rightDepth: 0,
            maxDepth: depth,
            depthsMap: new Map(depthsMap),
            staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l },
            decision: `左孩子 ${cur.left.val} 写入连续内存 queue[r++]，r 推进至 ${r}`,
            action: 'push-left',
            message: `将左孩子放入连续内存：queue[${r - 1}] = ${cur.left.val}。`,
            log: `queue[${r - 1}] = ${cur.left.val}, r=${r}`,
            metrics: makeTDMetrics(cur.val, 0, 0, depth),
            codeLine: L.pushChildren,
          });
        }

        if (cur.right) {
          staticArray[r++] = cur.right;
          steps.push({
            tree: root,
            current: cur.val,
            leftDepth: 0,
            rightDepth: 0,
            maxDepth: depth,
            depthsMap: new Map(depthsMap),
            staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l },
            decision: `右孩子 ${cur.right.val} 写入连续内存 queue[r++]，r 推进至 ${r}`,
            action: 'push-right',
            message: `将右孩子放入连续内存：queue[${r - 1}] = ${cur.right.val}。`,
            log: `queue[${r - 1}] = ${cur.right.val}, r=${r}`,
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
  // LeetCode 111: 最小深度 (Minimum Depth)
  // ============================================================

  /**
   * Stage 1: 后序递归分治与叶节点特判 (Recursive DFS)
   */
  public static compileMinDepthStage1Steps(root: TreeNode | null): MinDepthStep[] {
    const steps: MinDepthStep[] = [];
    const lines = MIN_DEPTH_STAGE1_LINES;

    if (!root) {
      const traceSnapshot: CallTraceSnapshot = {
        lines: [
          {
            id: 'null-root',
            depth: 0,
            text: 'minDepth(null) -> 树为空 -> return 0',
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
        depth: 0,
        minDepth: 0,
        decision: '特判返回：树为空',
        message: '树为空，最小深度为 0。',
        log: 'root is null -> return 0',
        codeLine: lines.baseNull,
        stageId: 'stage-1',
        metrics: { '当前节点': 'null', '当前深度': 0, '最小深度': 0 },
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
      text: `minDepth(${root.val})`,
      kind: 'header',
      comment: '<- 最终要算这个',
    });

    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      depth: 1,
      minDepth: null,
      decision: `递归入口：minDepth(Node(${root.val}))，当前递归层深度 = 1`,
      message: `开始求解以 ${root.val} 为根的二叉树最小深度。注意：当某一子树为空时，不能直接取 min(0, ...)！`,
      log: `Enter minDepth(root=${root.val})`,
      codeLine: lines.entry,
      stageId: 'stage-1',
      highlightedNodes: [root.val],
      metrics: { '当前节点': `Node(${root.val})`, '当前深度': 1, '最小深度': '计算中' },
      callTrace: makeSnapshot(rootHeaderId),
    });

    function dfs(node: TreeNode | null, depth: number, roleComment?: string): number {
      // 1. 基底判空
      if (!node) {
        const nullLineId = `null-${depth}-${Math.random().toString(36).slice(2, 6)}`;
        traceLines.push({
          id: nullLineId,
          depth: depth - 1,
          text: 'root == null -> return 0',
          kind: 'condition-skip',
        });
        steps.push({
          tree: cloneStateDepTree(root),
          current: null,
          depth,
          minDepth: 0,
          decision: '遇到空节点，触发基底返回：return 0',
          message: '递归探查到空指针 null，返回深度 0。',
          log: 'node is null -> return 0',
          codeLine: lines.baseNull,
          stageId: 'stage-1',
          metrics: { '当前节点': 'null', '当前深度': depth, '返回值': 0 },
          callTrace: makeSnapshot(nullLineId),
        });
        return 0;
      }

      const callLineId = `call-${node.val}`;
      if (node !== root) {
        traceLines.push({
          id: callLineId,
          depth: depth - 1,
          text: `minDepth(${node.val})`,
          kind: 'header',
          comment: roleComment,
        });

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: null,
          decision: `递归进入子节点 Node(${node.val})，深度为 ${depth}`,
          message: `深入递归栈，当前探查节点为 Node(${node.val})。`,
          log: `Enter minDepth(${node.val}) at depth ${depth}`,
          codeLine: lines.entry,
          stageId: 'stage-1',
          highlightedNodes: [node.val],
          metrics: { '当前节点': `Node(${node.val})`, '当前深度': depth },
          callTrace: makeSnapshot(callLineId),
        });
      }

      // 2. 非空通过判定
      const passLineId = `pass-${node.val}`;
      traceLines.push({
        id: passLineId,
        depth: depth - 1,
        text: `① root=${node.val}, 非空`,
        kind: 'condition-pass',
      });
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        minDepth: null,
        decision: `非空判别通过：Node(${node.val}) != null，继续检查是否为叶子节点`,
        message: `节点 Node(${node.val}) 存在，跳过基底判空，进入后续叶子与分支判断。`,
        log: `Node(${node.val}) is not null`,
        codeLine: lines.baseNull,
        stageId: 'stage-1',
        highlightedNodes: [node.val],
        metrics: { '当前节点': `Node(${node.val})`, '非空检查': '通过' },
        callTrace: makeSnapshot(passLineId),
      });

      // 3. 叶子节点特判 (核心定义：左右孩子皆为空)
      if (!node.left && !node.right) {
        const leafLineId = `leaf-hit-${node.val}`;
        traceLines.push({
          id: leafLineId,
          depth: depth - 1,
          text: `② root.left == null && root.right == null √ 命中叶子!`,
          kind: 'condition-hit',
        });
        traceLines.push({
          id: `ret-leaf-${node.val}`,
          depth: depth - 1,
          text: '    -> return 1',
          kind: 'return-leaf',
        });

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: 1,
          decision: `🎯 命中叶节点：Node(${node.val}) 左右均为空，直接返回深度 1 (return 1)`,
          message: `叶子节点定义达成：Node(${node.val}) 没有左右孩子，其自身子树最小深度即为 1。`,
          log: `Node(${node.val}) is leaf -> return 1`,
          codeLine: lines.baseLeaf,
          stageId: 'stage-1',
          highlightedNodes: [node.val],
          metrics: { '当前节点': `Node(${node.val})`, '节点类型': '叶子节点', '子树最小深度': 1 },
          callTrace: makeSnapshot(leafLineId, 1),
        });
        return 1;
      } else {
        const skipLeafId = `skip-leaf-${node.val}`;
        traceLines.push({
          id: skipLeafId,
          depth: depth - 1,
          text: `② 不是叶子 (left=${node.left ? node.left.val : 'null'}, right=${node.right ? node.right.val : 'null'}), 跳过`,
          kind: 'condition-skip',
        });
        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: null,
          decision: `Node(${node.val}) 并非叶子节点 (left=${node.left?.val ?? 'null'}, right=${node.right?.val ?? 'null'})，继续检查单侧空情况`,
          message: `节点具有子节点，不能直接当作叶子返回 1，继续下一步单侧子树避坑检查。`,
          log: `Node(${node.val}) not a leaf`,
          codeLine: lines.baseLeaf,
          stageId: 'stage-1',
          highlightedNodes: [node.val],
          metrics: { '当前节点': `Node(${node.val})`, '节点类型': '内部节点' },
          callTrace: makeSnapshot(skipLeafId),
        });
      }

      // 4. 单侧左为空特判
      if (!node.left && node.right) {
        const leftNullLineId = `left-null-hit-${node.val}`;
        traceLines.push({
          id: leftNullLineId,
          depth: depth - 1,
          text: `③ root.left == null √ 命中!`,
          kind: 'condition-hit',
        });
        traceLines.push({
          id: `stmt-r1-${node.val}`,
          depth: depth - 1,
          text: `    -> return minDepth(root.right) + 1`,
          kind: 'recurse-prep',
        });
        traceLines.push({
          id: `stmt-r2-${node.val}`,
          depth: depth - 1,
          text: `    -> return minDepth(${node.right.val}) + 1`,
          kind: 'recurse-prep',
        });

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: null,
          decision: `Node(${node.val}) 左子树为空但右子树非空，必须只探索右子树 minDepth(right) + 1`,
          message: `避坑：Node(${node.val}) 不是叶子节点，不能将左侧深度 0 计入取 min！必须转向右子树探索。`,
          log: `Node(${node.val}) left is null -> recurse right`,
          codeLine: lines.leftNull,
          stageId: 'stage-1',
          highlightedNodes: [node.val, node.right.val],
          metrics: { '当前节点': `Node(${node.val})`, '当前深度': depth, '探索方向': '仅右子树' },
          callTrace: makeSnapshot(leftNullLineId),
        });

        const rDepth = dfs(node.right, depth + 1, `<- 算${node.val}的右孩子`);
        const res = rDepth + 1;

        const unwindLineId = `unwind-${node.val}`;
        traceLines.push({
          id: unwindLineId,
          depth: depth - 1,
          text: `回到 minDepth(${node.val}): return ${rDepth} + 1 = ${res}`,
          kind: 'unwind-calc',
        });
        traceLines.push({
          id: `ret-stmt-${node.val}`,
          depth: depth - 1,
          text: `返回 ${res} ---`,
          kind: 'return-leaf',
        });

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: res,
          decision: `Node(${node.val}) 右子树返回深度 ${rDepth}，归约结果: ${rDepth} + 1 = ${res}`,
          message: `单侧右子树结算完成，Node(${node.val}) 子树最小深度为 ${res}。`,
          log: `Node(${node.val}) returns rightDepth + 1 = ${res}`,
          codeLine: lines.leftNull,
          stageId: 'stage-1',
          highlightedNodes: [node.val],
          metrics: { '当前节点': `Node(${node.val})`, '右子树深度': rDepth, '归约结果': res },
          callTrace: makeSnapshot(unwindLineId, res),
        });
        return res;
      } else {
        const skipLeftId = `skip-left-${node.val}`;
        traceLines.push({
          id: skipLeftId,
          depth: depth - 1,
          text: `③ left != null (是${node.left!.val}), 跳过`,
          kind: 'condition-skip',
        });
        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: null,
          decision: `单侧检查：root.left == null 判定为 false (左孩子是 Node(${node.left!.val}))，跳过左空分支`,
          message: `Node(${node.val}) 左子树存在，继续检查右子树是否为空。`,
          log: `Node(${node.val}) left != null -> continue`,
          codeLine: lines.leftNull,
          stageId: 'stage-1',
          highlightedNodes: [node.val, node.left!.val],
          metrics: { '当前节点': `Node(${node.val})`, '左孩子': `Node(${node.left!.val})`, '左空特判': '未触发' },
          callTrace: makeSnapshot(skipLeftId),
        });
      }

      // 5. 单侧右为空特判
      if (node.left && !node.right) {
        const rightNullLineId = `right-null-hit-${node.val}`;
        traceLines.push({
          id: rightNullLineId,
          depth: depth - 1,
          text: `④ root.right == null √ 命中!`,
          kind: 'condition-hit',
        });
        traceLines.push({
          id: `stmt-l1-${node.val}`,
          depth: depth - 1,
          text: `    -> return minDepth(root.left) + 1`,
          kind: 'recurse-prep',
        });
        traceLines.push({
          id: `stmt-l2-${node.val}`,
          depth: depth - 1,
          text: `    -> return minDepth(${node.left.val}) + 1`,
          kind: 'recurse-prep',
        });

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: null,
          decision: `Node(${node.val}) 右子树为空但左子树非空，必须只探索左子树 minDepth(left) + 1`,
          message: `避坑：Node(${node.val}) 不是叶子节点，不能将右侧深度 0 计入取 min！必须转向左子树探索。`,
          log: `Node(${node.val}) right is null -> recurse left`,
          codeLine: lines.rightNull,
          stageId: 'stage-1',
          highlightedNodes: [node.val, node.left.val],
          metrics: { '当前节点': `Node(${node.val})`, '当前深度': depth, '探索方向': '仅左子树' },
          callTrace: makeSnapshot(rightNullLineId),
        });

        const lDepth = dfs(node.left, depth + 1, `<- 算${node.val}的左孩子`);
        const res = lDepth + 1;

        const unwindLineId = `unwind-${node.val}`;
        traceLines.push({
          id: unwindLineId,
          depth: depth - 1,
          text: `回到 minDepth(${node.val}): return ${lDepth} + 1 = ${res}`,
          kind: 'unwind-calc',
        });
        traceLines.push({
          id: `ret-stmt-${node.val}`,
          depth: depth - 1,
          text: `返回 ${res} ---`,
          kind: 'return-leaf',
        });

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: res,
          decision: `Node(${node.val}) 左子树返回深度 ${lDepth}，归约结果: ${lDepth} + 1 = ${res}`,
          message: `单侧左子树结算完成，Node(${node.val}) 子树最小深度为 ${res}。`,
          log: `Node(${node.val}) returns leftDepth + 1 = ${res}`,
          codeLine: lines.rightNull,
          stageId: 'stage-1',
          highlightedNodes: [node.val],
          metrics: { '当前节点': `Node(${node.val})`, '左子树深度': lDepth, '归约结果': res },
          callTrace: makeSnapshot(unwindLineId, res),
        });
        return res;
      } else {
        const skipRightId = `skip-right-${node.val}`;
        traceLines.push({
          id: skipRightId,
          depth: depth - 1,
          text: `④ right != null (是${node.right!.val}), 跳过`,
          kind: 'condition-skip',
        });
        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: null,
          decision: `单侧检查：root.right == null 判定为 false (右孩子是 Node(${node.right!.val}))，两侧均非空`,
          message: `Node(${node.val}) 两侧子树均非空，跳过单侧特判分支，准备进入双分支独立递归。`,
          log: `Node(${node.val}) right != null -> continue`,
          codeLine: lines.rightNull,
          stageId: 'stage-1',
          highlightedNodes: [node.val, node.right!.val],
          metrics: { '当前节点': `Node(${node.val})`, '右孩子': `Node(${node.right!.val})`, '右空特判': '未触发' },
          callTrace: makeSnapshot(skipRightId),
        });
      }

      // 6. 左右均非空：先准备深入左子树
      const prepBothId = `prep-both-${node.val}`;
      traceLines.push({
        id: prepBothId,
        depth: depth - 1,
        text: `⑤ 走最后一行: Math.min(minDepth(左), minDepth(右)) + 1`,
        kind: 'recurse-prep',
      });

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        minDepth: null,
        decision: `Node(${node.val}) 深入左子树求解：int leftDepth = minDepth(root.left)`,
        message: `后序遍历顺序：首先深入求解左子树 Node(${node.left!.val})。`,
        log: `Node(${node.val}): call minDepth(left=${node.left!.val})`,
        codeLine: lines.callLeft,
        stageId: 'stage-1',
        highlightedNodes: [node.val, node.left!.val],
        metrics: { '当前节点': `Node(${node.val})`, '当前深度': depth, '探索分支': '左子树' },
        callTrace: makeSnapshot(prepBothId),
      });

      const leftVal = dfs(node.left, depth + 1, '<- 先算左边');

      // 7. 左子树就绪，接收返回值帧 (Line 7 闭环赋值)
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        minDepth: null,
        decision: `Node(${node.val}) 左子树求解完成：leftDepth = ${leftVal}，赋值就绪`,
        message: `后序遍历：左子树已返回最小深度 ${leftVal}，存储至 leftDepth。准备深入右子树。`,
        log: `Node(${node.val}): leftDepth=${leftVal}`,
        codeLine: lines.callLeft,
        stageId: 'stage-1',
        highlightedNodes: [node.val, node.left!.val],
        metrics: { '当前节点': `Node(${node.val})`, 'leftDepth': leftVal, '探索分支': '左子树就绪' },
        callTrace: makeSnapshot(prepBothId),
      });

      // 8. 接下来深入右子树 (Line 8 发起调用帧)
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        minDepth: null,
        decision: `Node(${node.val}) 深入右子树求解：int rightDepth = minDepth(root.right)`,
        message: `后序遍历顺序：接下来深入求解右子树 Node(${node.right!.val})。`,
        log: `Node(${node.val}): call minDepth(right=${node.right!.val})`,
        codeLine: lines.callRight,
        stageId: 'stage-1',
        highlightedNodes: [node.val, node.right!.val],
        metrics: { '当前节点': `Node(${node.val})`, 'leftDepth': leftVal, '探索分支': '右子树' },
        callTrace: makeSnapshot(prepBothId),
      });

      const rightVal = dfs(node.right, depth + 1, '<- 再算右边');

      // 9. 右子树就绪，接收返回值帧 (Line 8 闭环赋值)
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        minDepth: null,
        decision: `Node(${node.val}) 右子树求解完成：rightDepth = ${rightVal}，赋值就绪`,
        message: `后序遍历：右子树已返回最小深度 ${rightVal}，存储至 rightDepth。左右子树均就绪，准备后序归约。`,
        log: `Node(${node.val}): rightDepth=${rightVal}`,
        codeLine: lines.callRight,
        stageId: 'stage-1',
        highlightedNodes: [node.val, node.right!.val],
        metrics: { '当前节点': `Node(${node.val})`, 'leftDepth': leftVal, 'rightDepth': rightVal },
        callTrace: makeSnapshot(prepBothId),
      });

      const res = Math.min(leftVal, rightVal) + 1;

      // 10. 左右齐备，后序自底向上归约 (Line 9 计算返回帧)
      const unwindBothId = `unwind-both-${node.val}`;
      traceLines.push({
        id: unwindBothId,
        depth: depth - 1,
        text: `回到 minDepth(${node.val}): return Math.min(${leftVal}, ${rightVal}) + 1 = ${leftVal < rightVal ? leftVal : rightVal} + 1 = ${res}`,
        kind: 'unwind-calc',
      });

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        minDepth: res,
        decision: `Node(${node.val}) 左右归约：Math.min(${leftVal}, ${rightVal}) + 1 = ${res}`,
        message: `子树合并完成：Node(${node.val}) 左深=${leftVal}, 右深=${rightVal}，最小深度收敛至 ${res}。`,
        log: `Node(${node.val}) returns min(${leftVal}, ${rightVal}) + 1 = ${res}`,
        codeLine: lines.returnMin,
        stageId: 'stage-1',
        highlightedNodes: [node.val],
        metrics: { '当前节点': `Node(${node.val})`, '左深': leftVal, '右深': rightVal, '归约结果': res },
        callTrace: makeSnapshot(unwindBothId, res),
      });

      return res;
    }

    const finalMinDepth = dfs(root, 1);
    const allTreeVals = collectTreeValues(root);

    const finalResultId = 'final-result';
    traceLines.push({
      id: finalResultId,
      depth: 0,
      text: `最终返回 ${finalMinDepth} ✅`,
      kind: 'final-result',
    });

    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      depth: 1,
      minDepth: finalMinDepth,
      decision: `🎉 递归完成！二叉树最小深度收敛至 ${finalMinDepth}`,
      message: `全树递归后序分治完成，最短根到叶路径深度为 ${finalMinDepth}。`,
      log: `MinDepth DFS done. Result = ${finalMinDepth}`,
      codeLine: lines.done,
      stageId: 'stage-1',
      highlightedNodes: allTreeVals,
      metrics: { '最终最小深度': finalMinDepth, '遍历节点总数': allTreeVals.length },
      callTrace: makeSnapshot(finalResultId, finalMinDepth),
    });

    return steps;
  }

  /**
   * Stage 2: 广度优先搜索层序最短路提前终止 (BFS Level Order Early Exit)
   */
  public static compileMinDepthStage2BfsSteps(root: TreeNode | null): MinDepthStep[] {
    const steps: MinDepthStep[] = [];
    const lines = MIN_DEPTH_STAGE2_LINES;

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        depth: 0,
        minDepth: 0,
        decision: '特判返回：树为空',
        message: '树为空，最小深度为 0。',
        log: 'root is null -> return 0',
        codeLine: lines.baseNull,
        stageId: 'stage-2',
        metrics: { '当前层深度': 0, '最小深度': 0 },
      });
      return steps;
    }

    const queue: TreeNode[] = [root];
    let depth = 1;

    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      depth: 1,
      minDepth: null,
      decision: `启动 BFS 层序遍历：root = Node(${root.val}) 入队，初始层深度 = 1`,
      message: 'BFS 最短路核心：逐层波前推进，首个遇见的叶子节点所在层深度即为全树最小深度！',
      log: `Init BFS queue with Node(${root.val})`,
      codeLine: lines.initQueue,
      stageId: 'stage-2',
      queueState: [root.val],
      highlightedNodes: [root.val],
      metrics: { '当前层深度': 1, '队列长度': 1, '当前节点': `Node(${root.val})` },
    });

    while (queue.length > 0) {
      const size = queue.length;
      const currentLevelNodes = queue.map((n) => n.val);

      steps.push({
        tree: cloneStateDepTree(root),
        current: queue[0].val,
        depth,
        minDepth: null,
        decision: `当前正探索第 ${depth} 层：本层共有 ${size} 个节点 [${currentLevelNodes.join(', ')}]`,
        message: `逐个检查第 ${depth} 层的节点，若发现叶子节点即可立即提前终止！`,
        log: `Explore Level ${depth}, size=${size}`,
        codeLine: lines.whileLoop,
        stageId: 'stage-2',
        queueState: [...currentLevelNodes],
        highlightedNodes: [...currentLevelNodes],
        metrics: { '当前层深度': depth, '本层节点数': size },
      });

      for (let i = 0; i < size; i++) {
        const node = queue.shift()!;

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: null,
          decision: `出队考察节点 Node(${node.val})，检查是否为叶子节点`,
          message: `node = queue.poll()，检查左右孩子指针 left=${node.left?.val ?? 'null'}, right=${node.right?.val ?? 'null'}`,
          log: `Poll Node(${node.val}) at depth ${depth}`,
          codeLine: lines.pollNode,
          stageId: 'stage-2',
          queueState: queue.map((n) => n.val),
          highlightedNodes: [node.val],
          metrics: { '出队节点': `Node(${node.val})`, '当前层深度': depth },
        });

        if (!node.left && !node.right) {
          steps.push({
            tree: cloneStateDepTree(root),
            current: node.val,
            depth,
            minDepth: depth,
            decision: `🎯 命中首个叶子节点 Node(${node.val})！触发 BFS 提前退出，最小深度 = ${depth}`,
            message: `BFS 最优性定理：层序遍历首次遇见的叶子节点保证具有最短根到叶距离，立即返回当前深度 ${depth}！`,
            log: `First leaf Node(${node.val}) reached! Early exit at depth ${depth}`,
            codeLine: lines.leafExit,
            stageId: 'stage-2',
            highlightedNodes: [node.val],
            metrics: { '命中叶子节点': `Node(${node.val})`, '提前终止深度': depth, '全树最小深度': depth },
          });

          steps.push({
            tree: cloneStateDepTree(root),
            current: null,
            depth,
            minDepth: depth,
            decision: `🎉 BFS 提前终止成功！二叉树最小深度 = ${depth}`,
            message: `无需继续遍历后续深层节点，算法以最优常数时间提前结束。`,
            log: `BFS early exit done. Result = ${depth}`,
            codeLine: lines.done,
            stageId: 'stage-2',
            metrics: { '最终最小深度': depth },
          });

          return steps;
        }

        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: null,
          decision: `Node(${node.val}) 非叶子，将非空孩子推入下一层队列：[${[node.left?.val, node.right?.val].filter((v) => v !== undefined).join(', ')}]`,
          message: `子节点加入队列，队列新长度为 ${queue.length}`,
          log: `Enqueue children of Node(${node.val})`,
          codeLine: lines.pushChildren,
          stageId: 'stage-2',
          queueState: queue.map((n) => n.val),
          highlightedNodes: [node.val],
          metrics: { '考察节点': `Node(${node.val})`, '队列新长度': queue.length },
        });
      }

      depth++;
      steps.push({
        tree: cloneStateDepTree(root),
        current: null,
        depth,
        minDepth: null,
        decision: `第 ${depth - 1} 层全数完成且无叶子，层深度自增：depth ➔ ${depth}`,
        message: `下一轮将扫描深度为 ${depth} 的节点波前。`,
        log: `Depth increments to ${depth}`,
        codeLine: lines.incDepth,
        stageId: 'stage-2',
        queueState: queue.map((n) => n.val),
        metrics: { '新层深度': depth, '队列待检节点数': queue.length },
      });
    }

    return steps;
  }

  /**
   * Stage 3: 静态数组模拟队列 (Static Array Queue BFS · Zuoshen Class 036)
   */
  public static compileMinDepthStage3StaticArraySteps(root: TreeNode | null): MinDepthStep[] {
    const steps: MinDepthStep[] = [];
    const lines = MIN_DEPTH_STAGE3_LINES;

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        depth: 0,
        minDepth: 0,
        decision: '特判返回：树为空',
        message: '树为空，最小深度为 0。',
        log: 'root is null -> return 0',
        codeLine: lines.baseNull,
        stageId: 'stage-3',
        metrics: { '当前深度': 0, '最小深度': 0 },
      });
      return steps;
    }

    const queueArr: TreeNode[] = [];
    let l = 0;
    let r = 0;

    queueArr[r++] = root;
    let depth = 1;

    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      depth: 1,
      minDepth: null,
      decision: `初始化静态数组队列：queue[r++] = Node(${root.val})，指针状态 l=0, r=1`,
      message: '左神 Class 036 风格：用连续数组与双指针 l/r 模拟队列，杜绝对象分配与 GC 抖动。',
      log: `Init static array queue with root Node(${root.val})`,
      codeLine: lines.initArray,
      stageId: 'stage-3',
      staticQueueState: { l, r, queue: queueArr.slice(l, r).map((n) => n.val) },
      highlightedNodes: [root.val],
      metrics: { '指针 l': l, '指针 r': r, '当前深度': 1, '当前节点': `Node(${root.val})` },
    });

    while (l < r) {
      const size = r - l;
      const currentSlice = queueArr.slice(l, r).map((n) => n.val);

      steps.push({
        tree: cloneStateDepTree(root),
        current: queueArr[l].val,
        depth,
        minDepth: null,
        decision: `当前层深度 = ${depth}，本层待扫描窗口长度 size = r - l = ${r} - ${l} = ${size}`,
        message: `窗口内节点: [${currentSlice.join(', ')}]，开始静态数组层序弹出与叶子判定。`,
        log: `Static array level ${depth}: l=${l}, r=${r}, size=${size}`,
        codeLine: lines.whileLoop,
        stageId: 'stage-3',
        staticQueueState: { l, r, queue: currentSlice },
        highlightedNodes: [...currentSlice],
        metrics: { '层深度': depth, '指针 l': l, '指针 r': r, '窗口大小': size },
      });

      for (let i = 0; i < size; i++) {
        const node = queueArr[l++];

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: null,
          decision: `弹出队头 node = queue[l++] ➔ Node(${node.val})，l 增至 ${l}`,
          message: `检查 Node(${node.val}) 是否为叶节点：left=${node.left?.val ?? 'null'}, right=${node.right?.val ?? 'null'}`,
          log: `Poll queueArr[${l - 1}] = Node(${node.val})`,
          codeLine: lines.pollNode,
          stageId: 'stage-3',
          staticQueueState: { l, r, queue: queueArr.slice(l, r).map((n) => n.val) },
          highlightedNodes: [node.val],
          metrics: { '出队节点': `Node(${node.val})`, '指针 l': l, '指针 r': r },
        });

        if (!node.left && !node.right) {
          steps.push({
            tree: cloneStateDepTree(root),
            current: node.val,
            depth,
            minDepth: depth,
            decision: `🎯 静态数组首现叶子 Node(${node.val})！触发提前终止，直接返回深度 ${depth}`,
            message: `静态数组模拟队列同样具备 BFS 最优性，首个叶节点即确定最小深度为 ${depth}！`,
            log: `Static array early exit at leaf Node(${node.val}), depth=${depth}`,
            codeLine: lines.leafExit,
            stageId: 'stage-3',
            staticQueueState: { l, r, queue: queueArr.slice(l, r).map((n) => n.val) },
            highlightedNodes: [node.val],
            metrics: { '命中叶节点': `Node(${node.val})`, '最终最小深度': depth },
          });

          steps.push({
            tree: cloneStateDepTree(root),
            current: null,
            depth,
            minDepth: depth,
            decision: `🎉 静态数组模拟队列算法完成！二叉树最小深度 = ${depth}`,
            message: `算法以极高常数性能与零动态分配提前终止返回 ${depth}。`,
            log: `Static array BFS done. Result = ${depth}`,
            codeLine: lines.done,
            stageId: 'stage-3',
            staticQueueState: { l, r, queue: [] },
            metrics: { '最终最小深度': depth },
          });

          return steps;
        }

        if (node.left) queueArr[r++] = node.left;
        if (node.right) queueArr[r++] = node.right;

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          minDepth: null,
          decision: `将 Node(${node.val}) 子树压入静态数组右端，r 增至 ${r}`,
          message: `孩子入队后静态队列区间为 [l=${l}, r=${r})`,
          log: `Push children of Node(${node.val}), r=${r}`,
          codeLine: lines.pushChildren,
          stageId: 'stage-3',
          staticQueueState: { l, r, queue: queueArr.slice(l, r).map((n) => n.val) },
          highlightedNodes: [node.val],
          metrics: { '指针 l': l, '指针 r': r, '未处理元素数': r - l },
        });
      }

      depth++;
      steps.push({
        tree: cloneStateDepTree(root),
        current: null,
        depth,
        minDepth: null,
        decision: `第 ${depth - 1} 层扫描完毕，层深度自增：depth ➔ ${depth}`,
        message: `下一轮将扫描静态数组 [${l}, ${r}) 区间中的第 ${depth} 层节点。`,
        log: `Depth increments to ${depth}`,
        codeLine: lines.incDepth,
        stageId: 'stage-3',
        staticQueueState: { l, r, queue: queueArr.slice(l, r).map((n) => n.val) },
        metrics: { '新层深度': depth, '待处理元素数': r - l },
      });
    }

    return steps;
  }
}
