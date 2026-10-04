/**
 * 二叉树最小深度可视化器 (Minimum Depth of Binary Tree · LeetCode 111 / Zuoshen Class 036)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * Stage 1: 后序递归分治与叶节点特判 (Postorder Recursive DFS · LC 111 经典)
 * Stage 2: 广度优先搜索层序最短路提前终止 (BFS Level Order with Early Exit)
 * Stage 3: 静态数组模拟队列 (Static Array Queue BFS · Zuoshen Class 036 风格)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import {
  RecursiveCallTraceAdapter,
  type CallTraceSnapshot,
  type CallTraceLine,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  MIN_DEPTH_PROBLEM_HTML,
  MIN_DEPTH_ANALYSIS_HTML,
} from './min-depth-problem-content';
import {
  MIN_DEPTH_STAGE1_CODES,
  MIN_DEPTH_STAGE2_CODES,
  MIN_DEPTH_STAGE3_CODES,
} from './min-depth-stage-codes';
import { collectTreeValues } from './tree-depth-renderer';

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

function parseTreeInput(raw?: string, fallback: (number | null)[] = [3, 9, 20, null, null, 15, 7]): (number | null)[] {
  if (!raw || !raw.trim()) return fallback;
  const cleaned = raw.replace(/^\[|\]$/g, '').trim();
  if (!cleaned) return fallback;
  return cleaned
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .map((s) => (s === 'null' || s === 'nil' || s === 'none' || s === '' ? null : Number(s)));
}

// =========================================================================
// Stage 1: 后序递归分治与叶节点特判 (Recursive DFS)
// =========================================================================
export function buildMinDepthStage1Steps(root: TreeNode | null): MinDepthStep[] {
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
        tree: cloneStateDepTree(root),
        current: null,
        depth,
        minDepth: 0,
        decision: '空节点特判：返回深度 0',
        message: '遇到空节点 null，子树深度为 0。',
        log: 'node is null -> return 0',
        codeLine: lines.baseNull,
        stageId: 'stage-1',
        metrics: { '当前节点': 'null', '当前深度': depth, '当前子树深度': 0 },
        callTrace: makeSnapshot(lineId),
      });
      return 0;
    }

    // 1. 函数入口帧
    const callLineId = `call-${node.val}`;
    traceLines.push({
      id: callLineId,
      depth: depth - 1,
      text: `minDepth(${node.val})`,
      kind: 'header',
      comment: roleComment || (depth === 1 ? '<- 最终要算这个' : undefined),
    });

    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      minDepth: null,
      decision: `递归进入 minDepth(root = Node(${node.val})) 函数`,
      message: `考察节点 Node(${node.val})，当前所处深度层级为 ${depth}。`,
      log: `Enter minDepth(node=${node.val}) at depth ${depth}`,
      codeLine: lines.entry,
      stageId: 'stage-1',
      highlightedNodes: [node.val],
      metrics: { '当前节点': `Node(${node.val})`, '当前深度': depth, '执行阶段': '函数入口' },
      callTrace: makeSnapshot(callLineId),
    });

    // 2. 判空检查（已确认非空）
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
      decision: `判空检查：root == null 判定为 false，继续向下判断`,
      message: `Node(${node.val}) 存在，继续检查是否为叶子节点。`,
      log: `Node(${node.val}) != null -> continue`,
      codeLine: lines.baseNull,
      stageId: 'stage-1',
      highlightedNodes: [node.val],
      metrics: { '当前节点': `Node(${node.val})`, '判空结果': '非空' },
      callTrace: makeSnapshot(passLineId),
    });

    // 3. 叶节点判定
    if (!node.left && !node.right) {
      const leafLineId = `leaf-hit-${node.val}`;
      traceLines.push({
        id: leafLineId,
        depth: depth - 1,
        text: `② left==null && right==null √ 命中!`,
        kind: 'condition-hit',
      });
      traceLines.push({
        id: `leaf-ret-${node.val}`,
        depth: depth - 1,
        text: `|--- 返回 1 ---`,
        kind: 'return-leaf',
      });

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        minDepth: 1,
        decision: `🎯 命中叶子节点！Node(${node.val}) 左右孩子皆空，返回深度 1`,
        message: `叶子判定成功：无左右子树，以 Node(${node.val}) 为终点的子树深度为 1。`,
        log: `Leaf Node(${node.val}) -> return 1`,
        codeLine: lines.baseLeaf,
        stageId: 'stage-1',
        highlightedNodes: [node.val],
        metrics: { '当前节点': `Node(${node.val})`, '当前深度': depth, '叶子判定': '是', '子树深度': 1 },
        callTrace: makeSnapshot(leafLineId, 1),
      });
      return 1;
    }

    // 非叶节点：输出不是叶子的说明并显式高亮判定行 (Strict One-Line-One-Step)
    let childDesc = '';
    if (node.left && node.right) {
      childDesc = ' (有左右孩子)';
    } else if (node.right) {
      childDesc = ` (右孩子是${node.right.val})`;
    } else if (node.left) {
      childDesc = ` (左孩子是${node.left.val})`;
    }

    const notLeafLineId = `not-leaf-${node.val}`;
    traceLines.push({
      id: notLeafLineId,
      depth: depth - 1,
      text: `② 不是叶子${childDesc}`,
      kind: 'condition-skip',
    });

    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      minDepth: null,
      decision: `叶子判定：left == null && right == null 判定为 false${childDesc}，非叶子节点，继续向下特判`,
      message: `Node(${node.val}) 存在孩子节点${childDesc}，继续检查单侧子树是否为空。`,
      log: `Node(${node.val}) is not leaf${childDesc} -> continue`,
      codeLine: lines.baseLeaf,
      stageId: 'stage-1',
      highlightedNodes: [node.val],
      metrics: { '当前节点': `Node(${node.val})`, '当前深度': depth, '叶子判定': '否' },
      callTrace: makeSnapshot(notLeafLineId),
    });

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
      // 左子树非空：root.left == null 判定为 false，显式产生判定帧
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
      // 右子树亦非空：root.right == null 判定为 false，显式产生判定帧
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

// =========================================================================
// Stage 2: 广度优先搜索层序最短路提前终止 (BFS Level Order Early Exit)
// =========================================================================
export function buildMinDepthStage2BfsSteps(root: TreeNode | null): MinDepthStep[] {
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

// =========================================================================
// Stage 3: 静态数组模拟队列 (Static Array Queue BFS · Zuoshen Class 036)
// =========================================================================
export function buildMinDepthStage3StaticArraySteps(root: TreeNode | null): MinDepthStep[] {
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

// =========================================================================
// 向后兼容接口 (Backward-Compatible buildMinDepthSteps)
// =========================================================================
export function buildMinDepthSteps(root: TreeNode | null): MinDepthStep[] {
  return buildMinDepthStage1Steps(root);
}

// =========================================================================
// 表现层渲染 (Render Canvas & Metrics)
// =========================================================================
export function renderMinDepthCanvas(container: HTMLElement, step: MinDepthStep): void {
  // 1. Card 1 纯粹画布渲染 (零多余切换条、零嵌套卡片，100% 呈现二叉树拓扑沙盘)
  if (step.tree) {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      highlightedNodes: step.highlightedNodes,
      primaryColor: '#f59e0b',
      secondaryColor: '#38bdf8',
      visitedColor: '#34d399',
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 240px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树或初始化</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">准备计算二叉树最小深度...</span>
      </div>
    `;
  }

  // 2. Card 2 状态监视器与递归推演树联动
  const root = container.closest('#algo-min-depth-view') || container.parentElement;
  if (root) {
    const curEl = root.querySelector('#metric-cur');
    const depthEl = root.querySelector('#metric-depth');
    const resultEl = root.querySelector('#metric-result');

    if (curEl) curEl.textContent = step.current != null ? `Node(${step.current})` : '—';
    if (depthEl) depthEl.textContent = `${step.depth}`;
    if (resultEl) resultEl.textContent = step.minDepth != null ? `${step.minDepth}` : '计算中...';

    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
    if (customMetricsContainer) {
      if (step.callTrace) {
        // Stage 1 递归推演模式：上方紧凑节点深度指标，下方嵌入浅色优雅递归推演栈
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; height: 100%; gap: 6px; font-size: 11px; padding: 2px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; flex-shrink: 0;">
              <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 10px; color: #64748b;">考察节点:</span>
                <span style="font-weight: 700; font-size: 11.5px; color: #0d9488;">${step.current != null ? `Node(${step.current})` : '已收敛'}</span>
              </div>
              <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 10px; color: #64748b;">递归深度:</span>
                <span style="font-weight: 700; font-size: 11.5px; color: #2563eb;">${step.depth}</span>
              </div>
            </div>
            <div class="min-depth-trace-host" style="flex: 1; min-height: 120px; overflow: hidden;"></div>
          </div>
        `;

        const traceHost = customMetricsContainer.querySelector('.min-depth-trace-host') as HTMLElement | null;
        if (traceHost) {
          RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
            title: '📜 递归调用推演与归约栈',
            theme: 'light',
            maxHeight: '100%',
            showTerminalHeader: true,
          });
        }
      } else {
        // Stage 2 或 Stage 3：层序 BFS 队列或静态数组队列监视器
        let stateLabel = '递归调用深度';
        let stateContent = `${step.depth}`;

        if (step.staticQueueState) {
          stateLabel = `静态数组队列 [l=${step.staticQueueState.l}, r=${step.staticQueueState.r}]`;
          stateContent =
            step.staticQueueState.queue.length > 0
              ? `[${step.staticQueueState.queue.join(' ➔ ')}]`
              : '队列为空 []';
        } else if (step.queueState) {
          stateLabel = `BFS 队列 (${step.queueState.length})`;
          stateContent =
            step.queueState.length > 0
              ? `[${step.queueState.map((id) => `Node(${id})`).join(' ➔ ')}]`
              : '队列为空 []';
        }

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <span style="font-size: 10.5px; color: #64748b;">${stateLabel}:</span>
                <div style="font-weight: 700; font-size: 11.5px; color: #2563eb; overflow-x: auto; white-space: nowrap;">
                  ${stateContent}
                </div>
              </div>
              <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <span style="font-size: 10.5px; color: #64748b;">当前考察节点:</span>
                <div style="font-weight: 700; font-size: 12px; color: #0d9488;">
                  ${step.current != null ? `Node(${step.current})` : '已收敛'}
                </div>
              </div>
            </div>

            <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px;">
              <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
              <div>${step.message}</div>
            </div>
          </div>
        `;
      }
    }
  }
}

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================
export const minDepthVisualizer = registerDeclarativeAlgorithm<MinDepthStep>({
  id: 'min-depth',
  name: '二叉树最小深度',
  category: 'tree',
  icon: '📏',
  difficulty: 1,
  levelOrder: 111,
  aliases: ['leetcode-111', 'min-depth-tree', 'minimum-depth'],
  learningGoal: '透彻掌握二叉树最小深度与最大深度的本质差异，理解单侧子树陷阱与 BFS 提前退出优化',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H) / O(W)',
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序数组 (逗号分隔)',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      placeholder: '例如: 3, 9, 20, null, null, 15, 7',
    },
  ],
  presets: [
    {
      label: '截图推演用例: 典型四节点 [1, 2, 3, null, 4]',
      values: { 'input-tree': '1, 2, 3, null, 4' },
      description: '根 1，左 2(右 4)，右 3(叶子)，完整展示深入、单侧避坑与回溯归约',
    },
    {
      label: 'LeetCode 示例 1: 经典二分叉 2',
      values: { 'input-tree': '3, 9, 20, null, null, 15, 7' },
      description: '根 3，左 9 (叶子)，右 20(15, 7)，最小深度为 2',
    },
    {
      label: 'LeetCode 示例 2: 单侧长链 5',
      values: { 'input-tree': '2, null, 3, null, 4, null, 5, null, 6' },
      description: '单侧右斜链，必须走到叶子节点 6，深度为 5',
    },
    {
      label: '单侧陷阱用例 2',
      values: { 'input-tree': '1, 2' },
      description: '根 1，左 2，最小深度是 2 而非 1 (根不是叶节点)',
    },
    {
      label: '单节点根树 1',
      values: { 'input-tree': '10' },
      description: '仅包含根节点 10，自身即为叶子，最小深度 1',
    },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'depth', label: '当前深度', color: '#2563eb' },
    { id: 'result', label: '最小深度', color: '#10b981' },
  ],
  codeLanguages: MIN_DEPTH_STAGE1_CODES,
  problemHtml: MIN_DEPTH_PROBLEM_HTML,
  analysisHtml: MIN_DEPTH_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 后序递归分治与叶节点特判 (LC 111)',
      shortName: '后序递归特判',
      num: 1,
      codeLanguages: MIN_DEPTH_STAGE1_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeInput(inputs?.['input-tree'] || inputs?.['tree']);
        const root = buildTreeFromArr(arr);
        return buildMinDepthStage1Steps(root);
      },
      renderCanvas: (container, step) => renderMinDepthCanvas(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 广度优先搜索层序最短路提前终止 (BFS)',
      shortName: 'BFS 提前终止',
      num: 2,
      codeLanguages: MIN_DEPTH_STAGE2_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeInput(inputs?.['input-tree'] || inputs?.['tree']);
        const root = buildTreeFromArr(arr);
        return buildMinDepthStage2BfsSteps(root);
      },
      renderCanvas: (container, step) => renderMinDepthCanvas(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 静态数组模拟队列 (Zuoshen Class 036)',
      shortName: '静态数组队列',
      num: 3,
      codeLanguages: MIN_DEPTH_STAGE3_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeInput(inputs?.['input-tree'] || inputs?.['tree']);
        const root = buildTreeFromArr(arr);
        return buildMinDepthStage3StaticArraySteps(root);
      },
      renderCanvas: (container, step) => renderMinDepthCanvas(container, step),
    },
  ],
  generateSteps: (inputs) => {
    const arr = parseTreeInput(inputs?.['input-tree'] || inputs?.['tree']);
    const root = buildTreeFromArr(arr);
    return buildMinDepthStage1Steps(root);
  },
  buildSteps: (inputs) => {
    const arr = parseTreeInput(inputs?.['input-tree'] || inputs?.['tree']);
    const root = buildTreeFromArr(arr);
    return buildMinDepthStage1Steps(root);
  },
  renderCanvas: (container, step) => renderMinDepthCanvas(container, step),
});
