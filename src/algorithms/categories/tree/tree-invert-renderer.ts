/**
 * 翻转二叉树 (Invert Binary Tree · LeetCode 226)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 *
 * 核心多阶段演化体系:
 *   Stage 1: 前序递归翻转 (Recursive Preorder DFS · 经典指针互换)
 *   Stage 2: 队列层序遍历翻转 (Iterative Queue BFS · 逐层出队交换)
 *   Stage 3: 静态数组模拟队列 (Static Array Queue · 左神招牌零 GC 连续内存)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget, StepBase } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  TREE_INVERT_PROBLEM_HTML,
  TREE_INVERT_ANALYSIS_HTML,
} from './tree-invert-problem-content';
import {
  TREE_INVERT_STAGE1_CODE,
  TREE_INVERT_STAGE1_LINES,
  TREE_INVERT_STAGE2_QUEUE_CODE,
  TREE_INVERT_STAGE2_QUEUE_LINES,
  TREE_INVERT_STAGE3_STATIC_ARRAY_CODE,
  TREE_INVERT_STAGE3_STATIC_ARRAY_LINES,
} from './tree-invert-stage-codes';

// ============================================================
// 类型契约与状态定义 (Domain Step Contract)
// ============================================================
export interface InvertStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  leftVal: number | null;
  rightVal: number | null;
  invertedCount: number;
  isSwapping: boolean;
  action: 'enter' | 'swap' | 'leave' | 'done' | string;
  actionName?: string;
  decision?: string;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };

  /** Stage 2 队列专用 */
  queue?: (number | string)[];

  /** Stage 3 静态数组专用 */
  staticQueueState?: {
    array: (number | string)[];
    l: number;
    r: number;
    cur: number | string | null;
  };
}

// 树快照统一委托 core/strategies/tree-clone.ts
function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

// ============================================================
// Stage 1 Step Generator: 前序递归翻转 (Recursive Preorder DFS)
// ============================================================
export function buildTreeInvertSteps(root: TreeNode | null): InvertStep[] {
  const steps: InvertStep[] = [];
  const L = TREE_INVERT_STAGE1_LINES;
  const workingTree = cloneTree(root);
  let invertedCount = 0;

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree?.val ?? null,
    leftVal: null,
    rightVal: null,
    invertedCount: 0,
    isSwapping: false,
    action: 'enter',
    decision: workingTree ? `启动前序递归翻转：从根节点 ${workingTree.val} 开始` : '空二叉树：无需翻转',
    message: workingTree ? `初始化翻转二叉树：从根节点 ${workingTree.val} 开始递归。` : '空树，无需翻转。',
    log: workingTree ? '开始翻转二叉树' : '空树',
    codeLine: L.entry,
    metrics: { '当前处理节点': workingTree ? `节点 ${workingTree.val}` : '—', '已互换次数': 0 },
    statusBadge: { text: '递归启动', type: 'info' },
  });

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      leftVal: null,
      rightVal: null,
      invertedCount: 0,
      isSwapping: false,
      action: 'done',
      decision: '空树翻转完成，返回 null',
      message: '✅ 翻转完成，返回 null。',
      log: '✓ 翻转完成 (null)',
      codeLine: L.nullCheck,
      metrics: { '已互换次数': 0, '最终结果': 'null' },
      statusBadge: { text: '空树完成', type: 'success' },
    });
    return steps;
  }

  const invert = (node: TreeNode | null) => {
    if (!node) return;

    const lVal = node.left ? node.left.val : null;
    const rVal = node.right ? node.right.val : null;

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: lVal,
      rightVal: rVal,
      invertedCount,
      isSwapping: false,
      action: 'enter',
      decision: `进入节点 ${node.val}：准备互换其左孩子 (${lVal ?? 'null'}) 与右孩子 (${rVal ?? 'null'})`,
      message: `进入节点 ${node.val}：准备互换其左孩子 (${lVal ?? 'null'}) 与右孩子 (${rVal ?? 'null'})。`,
      log: `进入 ${node.val} (L=${lVal ?? 'null'}, R=${rVal ?? 'null'})`,
      codeLine: L.swap,
      metrics: { '当前节点': node.val, '原左孩子': lVal ?? 'null', '原右孩子': rVal ?? 'null' },
      statusBadge: { text: `考察节点 ${node.val}`, type: 'info' },
    });

    // 交换左右子树
    const temp = node.left;
    node.left = node.right;
    node.right = temp;
    invertedCount++;

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: true,
      action: 'swap',
      decision: `🔀 节点 ${node.val} 左右指针互换完成！新左: ${node.left ? node.left.val : 'null'}, 新右: ${node.right ? node.right.val : 'null'}`,
      message: `🔀 互换完成！节点 ${node.val}：原左孩子变为 ${node.left ? node.left.val : 'null'}，原右孩子变为 ${node.right ? node.right.val : 'null'}。`,
      log: `节点 ${node.val} 左右互换完成`,
      codeLine: L.swap,
      metrics: { '当前节点': node.val, '新左孩子': node.left ? node.left.val : 'null', '新右孩子': node.right ? node.right.val : 'null', '已互换次数': invertedCount },
      statusBadge: { text: `互换成功 (#${invertedCount})`, type: 'warning' },
    });

    if (node.left) {
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        leftVal: node.left.val,
        rightVal: node.right ? node.right.val : null,
        invertedCount,
        isSwapping: false,
        action: 'recurse-left',
        decision: `向左子树递归：进入翻转后的左孩子 ${node.left.val}`,
        message: `向左递归调用 invertTree(node.left: ${node.left.val})。`,
        log: `recurse left: ${node.left.val}`,
        codeLine: L.recurseLeft,
        metrics: { '当前节点': node.val, '下一步递归': `左孩子 ${node.left.val}` },
        statusBadge: { text: '向左递归', type: 'info' },
      });
      invert(node.left);
    }

    if (node.right) {
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        leftVal: node.left ? node.left.val : null,
        rightVal: node.right.val,
        invertedCount,
        isSwapping: false,
        action: 'recurse-right',
        decision: `向右子树递归：进入翻转后的右孩子 ${node.right.val}`,
        message: `向右递归调用 invertTree(node.right: ${node.right.val})。`,
        log: `recurse right: ${node.right.val}`,
        codeLine: L.recurseRight,
        metrics: { '当前节点': node.val, '下一步递归': `右孩子 ${node.right.val}` },
        statusBadge: { text: '向右递归', type: 'info' },
      });
      invert(node.right);
    }

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: false,
      action: 'leave',
      decision: `离开节点 ${node.val}：该子树左右翻转全部完成`,
      message: `离开节点 ${node.val}：该子树左右翻转全部完成。`,
      log: `离开 ${node.val}`,
      codeLine: L.leave,
      metrics: { '当前完成节点': node.val, '已互换次数': invertedCount },
      statusBadge: { text: `节点 ${node.val} 完成`, type: 'success' },
    });
  };

  invert(workingTree);

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree.val,
    leftVal: null,
    rightVal: null,
    invertedCount,
    isSwapping: false,
    action: 'done',
    decision: `🎉 二叉树翻转全部完成！共执行 ${invertedCount} 次子树互换`,
    message: `🎉 二叉树翻转全部完成！共执行 ${invertedCount} 次子树互换。`,
    log: `✓ 全部完成 (共交换 ${invertedCount} 次)`,
    codeLine: L.returnRoot,
    metrics: { '总交换次数': invertedCount, '整树状态': '完全镜像倒置', '时间复杂度': 'O(N)' },
    statusBadge: { text: `翻转完成 (${invertedCount} 次交换)`, type: 'success' },
  });

  return steps;
}

// ============================================================
// Stage 2 Step Generator: 队列层序遍历翻转 (Iterative Queue BFS)
// ============================================================
export function buildTreeInvertBfsSteps(root: TreeNode | null): InvertStep[] {
  const steps: InvertStep[] = [];
  const L = TREE_INVERT_STAGE2_QUEUE_LINES;
  const workingTree = cloneTree(root);

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      leftVal: null,
      rightVal: null,
      invertedCount: 0,
      isSwapping: false,
      action: 'done',
      decision: '空二叉树：无需翻转，返回 null',
      message: '✅ 翻转完成，返回 null。',
      log: '✓ 翻转完成 (null)',
      codeLine: L.nullCheck,
      metrics: { '已互换次数': 0 },
      statusBadge: { text: '空树完成', type: 'success' },
    });
    return steps;
  }

  const queue: TreeNode[] = [workingTree];
  const qVals = (): (number | string)[] => queue.map(n => n.val);
  let invertedCount = 0;

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree.val,
    leftVal: null,
    rightVal: null,
    invertedCount: 0,
    isSwapping: false,
    action: 'init',
    queue: qVals(),
    decision: `初始化 BFS 队列：将根节点 ${workingTree.val} 推入队列`,
    actionName: 'init-queue',
    message: `启动广度优先遍历层序翻转：初始化队列，根节点 ${workingTree.val} 入队。`,
    log: `queue init: [${workingTree.val}]`,
    codeLine: L.initQueue,
    metrics: { '当前队列大小': 1, '已翻转节点数': 0 },
    statusBadge: { text: '根节点入队', type: 'info' },
  });

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const lVal = cur.left ? cur.left.val : null;
    const rVal = cur.right ? cur.right.val : null;

    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      leftVal: lVal,
      rightVal: rVal,
      invertedCount,
      isSwapping: false,
      action: 'poll',
      queue: qVals(),
      decision: `队列头部出队节点 ${cur.val}：原左孩子 ${lVal ?? 'null'}，原右孩子 ${rVal ?? 'null'}`,
      message: `从队列头部弹出节点 ${cur.val}，准备交换其左右孩子指针。`,
      log: `poll cur = ${cur.val}`,
      codeLine: L.poll,
      metrics: { '出队节点': cur.val, '剩余队列': queue.length },
      statusBadge: { text: `出队 ${cur.val}`, type: 'info' },
    });

    // 交换
    const temp = cur.left;
    cur.left = cur.right;
    cur.right = temp;
    invertedCount++;

    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      leftVal: cur.left ? cur.left.val : null,
      rightVal: cur.right ? cur.right.val : null,
      invertedCount,
      isSwapping: true,
      action: 'swap',
      queue: qVals(),
      decision: `🔀 交换节点 ${cur.val} 的左右孩子指针完成 (新左: ${cur.left?.val ?? 'null'}, 新右: ${cur.right?.val ?? 'null'})`,
      message: `交换完成！节点 ${cur.val} 的左右指针互换。`,
      log: `swap cur = ${cur.val} children`,
      codeLine: L.swap,
      metrics: { '当前节点': cur.val, '已互换次数': invertedCount },
      statusBadge: { text: `交换成功 (#${invertedCount})`, type: 'warning' },
    });

    if (cur.left) {
      queue.push(cur.left);
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        leftVal: cur.left.val,
        rightVal: cur.right ? cur.right.val : null,
        invertedCount,
        isSwapping: false,
        action: 'push-left',
        queue: qVals(),
        decision: `非空左孩子 ${cur.left.val} 入队等待下一轮翻转`,
        message: `将节点 ${cur.val} 的新左孩子 ${cur.left.val} 推入队列。`,
        log: `push left child ${cur.left.val}`,
        codeLine: L.pushLeft,
        metrics: { '入队节点': cur.left.val, '当前队列': queue.length },
        statusBadge: { text: `入队 ${cur.left.val}`, type: 'info' },
      });
    }

    if (cur.right) {
      queue.push(cur.right);
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        leftVal: cur.left ? cur.left.val : null,
        rightVal: cur.right.val,
        invertedCount,
        isSwapping: false,
        action: 'push-right',
        queue: qVals(),
        decision: `非空右孩子 ${cur.right.val} 入队等待下一轮翻转`,
        message: `将节点 ${cur.val} 的新右孩子 ${cur.right.val} 推入队列。`,
        log: `push right child ${cur.right.val}`,
        codeLine: L.pushRight,
        metrics: { '入队节点': cur.right.val, '当前队列': queue.length },
        statusBadge: { text: `入队 ${cur.right.val}`, type: 'info' },
      });
    }
  }

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree.val,
    leftVal: null,
    rightVal: null,
    invertedCount,
    isSwapping: false,
    action: 'done',
    queue: [],
    decision: `🎉 队列已清空，层序遍历翻转完成！共交换 ${invertedCount} 次`,
    message: `🎉 广度优先层序遍历翻转圆满完成！整棵二叉树已完全镜像倒置。`,
    log: `✓ BFS 完成 (共交换 ${invertedCount} 次)`,
    codeLine: L.returnRoot,
    metrics: { '总交换次数': invertedCount, '算法时间复杂度': 'O(N)', '空间复杂度': 'O(W)' },
    statusBadge: { text: `翻转完成 (${invertedCount} 次)`, type: 'success' },
  });

  return steps;
}

// ============================================================
// Stage 3 Step Generator: 静态数组模拟队列 (Static Array Queue)
// ============================================================
export function buildTreeInvertStaticArraySteps(root: TreeNode | null): InvertStep[] {
  const steps: InvertStep[] = [];
  const L = TREE_INVERT_STAGE3_STATIC_ARRAY_LINES;
  const workingTree = cloneTree(root);

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      leftVal: null,
      rightVal: null,
      invertedCount: 0,
      isSwapping: false,
      action: 'done',
      decision: '空二叉树：无需翻转，返回 null',
      message: '✅ 翻转完成，返回 null。',
      log: '✓ 翻转完成 (null)',
      codeLine: L.nullCheck,
      metrics: { '已互换次数': 0 },
      statusBadge: { text: '空树完成', type: 'success' },
    });
    return steps;
  }

  const MAXN = 2001;
  const queue: TreeNode[] = new Array(MAXN);
  let l = 0;
  let r = 0;
  let invertedCount = 0;

  queue[r++] = workingTree;

  const getArraySnapshot = (currL: number, currR: number): (number | string)[] => {
    const arr: (number | string)[] = [];
    for (let i = 0; i < Math.min(currR + 2, 10); i++) {
      if (i < currR) {
        arr.push(queue[i]?.val ?? '—');
      } else {
        arr.push('—');
      }
    }
    return arr;
  };

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree.val,
    leftVal: null,
    rightVal: null,
    invertedCount: 0,
    isSwapping: false,
    action: 'init',
    decision: `连续内存初始化：queue[0]=${workingTree.val} (l=0, r=1)`,
    message: `左神 Class 036 招牌零 GC 连续内存队列：使用 queue[MAXN] 与双指针 l=0, r=1 消除频繁对象垃圾回收。`,
    log: `static queue init: l=${l}, r=${r}`,
    codeLine: L.initQueue,
    staticQueueState: {
      array: getArraySnapshot(l, r),
      l,
      r,
      cur: workingTree.val,
    },
    metrics: { '双指针状态': `l=${l}, r=${r}`, '待处理元素': r - l, '内存优化': '零 GC 连续内存' },
    statusBadge: { text: '静态队列就绪', type: 'info' },
  });

  while (l < r) {
    const cur = queue[l++];
    const lVal = cur.left ? cur.left.val : null;
    const rVal = cur.right ? cur.right.val : null;

    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      leftVal: lVal,
      rightVal: rVal,
      invertedCount,
      isSwapping: false,
      action: 'poll',
      decision: `双指针出队：cur=queue[${l - 1}]=${cur.val} (l推进至 ${l})`,
      message: `从连续数组弹出节点 ${cur.val}。`,
      log: `poll cur = ${cur.val} (l=${l}, r=${r})`,
      codeLine: L.poll,
      staticQueueState: {
        array: getArraySnapshot(l, r),
        l,
        r,
        cur: cur.val,
      },
      metrics: { '当前出队': cur.val, '指针范围': `[l=${l}, r=${r})` },
      statusBadge: { text: `出队 ${cur.val}`, type: 'info' },
    });

    // 交换
    const temp = cur.left;
    cur.left = cur.right;
    cur.right = temp;
    invertedCount++;

    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      leftVal: cur.left ? cur.left.val : null,
      rightVal: cur.right ? cur.right.val : null,
      invertedCount,
      isSwapping: true,
      action: 'swap',
      decision: `🔀 交换节点 ${cur.val} 左右指针完成 (新左: ${cur.left?.val ?? 'null'}, 新右: ${cur.right?.val ?? 'null'})`,
      message: `交换完成！节点 ${cur.val} 的左右孩子指针互换。`,
      log: `swap cur = ${cur.val}`,
      codeLine: L.swap,
      staticQueueState: {
        array: getArraySnapshot(l, r),
        l,
        r,
        cur: cur.val,
      },
      metrics: { '当前节点': cur.val, '已互换次数': invertedCount },
      statusBadge: { text: `交换成功 (#${invertedCount})`, type: 'warning' },
    });

    if (cur.left) {
      queue[r++] = cur.left;
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        leftVal: cur.left.val,
        rightVal: cur.right ? cur.right.val : null,
        invertedCount,
        isSwapping: false,
        action: 'push-left',
        decision: `左孩子写入连续数组 queue[${r - 1}]=${cur.left.val} (r递增至 ${r})`,
        message: `将非空左孩子 ${cur.left.val} 写入连续数组末尾。`,
        log: `push left: queue[${r - 1}]=${cur.left.val}`,
        codeLine: L.pushLeft,
        staticQueueState: {
          array: getArraySnapshot(l, r),
          l,
          r,
          cur: cur.val,
        },
        metrics: { '写入槽位': `[${r - 1}]`, '双指针状态': `l=${l}, r=${r}` },
        statusBadge: { text: `写入左孩子 ${cur.left.val}`, type: 'info' },
      });
    }

    if (cur.right) {
      queue[r++] = cur.right;
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        leftVal: cur.left ? cur.left.val : null,
        rightVal: cur.right.val,
        invertedCount,
        isSwapping: false,
        action: 'push-right',
        decision: `右孩子写入连续数组 queue[${r - 1}]=${cur.right.val} (r递增至 ${r})`,
        message: `将非空右孩子 ${cur.right.val} 写入连续数组末尾。`,
        log: `push right: queue[${r - 1}]=${cur.right.val}`,
        codeLine: L.pushRight,
        staticQueueState: {
          array: getArraySnapshot(l, r),
          l,
          r,
          cur: cur.val,
        },
        metrics: { '写入槽位': `[${r - 1}]`, '双指针状态': `l=${l}, r=${r}` },
        statusBadge: { text: `写入右孩子 ${cur.right.val}`, type: 'info' },
      });
    }
  }

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree.val,
    leftVal: null,
    rightVal: null,
    invertedCount,
    isSwapping: false,
    action: 'done',
    decision: `🎉 静态数组队列 l==r 清空完毕，整树翻转完成！共交换 ${invertedCount} 次`,
    message: `🎉 静态数组零 GC 翻转全部完成！共执行 ${invertedCount} 次子树互换。`,
    log: `✓ 静态数组全部完成 (共交换 ${invertedCount} 次)`,
    codeLine: L.returnRoot,
    staticQueueState: {
      array: getArraySnapshot(l, r),
      l,
      r,
      cur: null,
    },
    metrics: { '总交换次数': invertedCount, '双指针终态': `l=${l}, r=${r}`, '内存优化': '零 GC 极速' },
    statusBadge: { text: `翻转完成 (${invertedCount} 次)`, type: 'success' },
  });

  return steps;
}

// ============================================================
// 辅助解析与默认用例
// ============================================================
function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['input-tree'] ?? inputs?.tree ?? '4, 2, 7, 1, 3, 6, 9';
  const arr = parseTreeArray(raw, [4, 2, 7, 1, 3, 6, 9]);
  return buildTree(arr);
}

// ============================================================
// 表现层渲染辅助器 (Card 1 & Card 2 Presenters)
// ============================================================

/** Card 1: 树画布渲染 */
function renderTreeInvertCanvasForStep(container: HTMLElement, step: InvertStep, primaryColor: string = '#0284c7'): void {
  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.current,
    primaryColor: step.isSwapping ? '#f59e0b' : primaryColor,
  });
}

/** Card 2 缓冲器：Stage 1 指针互换对比面板 */
function renderStage1SwapBufferHtml(step: InvertStep): string {
  const lVal = step.leftVal !== null ? `${step.leftVal}` : 'null';
  const rVal = step.rightVal !== null ? `${step.rightVal}` : 'null';

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #166534;">当前指针互换状态:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #15803d;">
          左孩子: ${lVal} &nbsp;🔀&nbsp; 右孩子: ${rVal}
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; color: #64748b;">
        <span>• 暂存左指针: temp = root.left</span>
        <span>• 互换挂载: root.left = root.right; root.right = temp;</span>
      </div>
    </div>
  `;
}

/** Card 2 缓冲器：Stage 2 队列管道面板 */
function renderStage2QueueBufferHtml(step: InvertStep): string {
  const q = step.queue ?? [];
  const chips = q.length > 0
    ? q.map((v, idx) => {
        const isHead = idx === 0;
        const bg = isHead ? '#dbeafe' : '#f1f5f9';
        const color = isHead ? '#1e40af' : '#475569';
        const border = isHead ? '#93c5fd' : '#cbd5e1';
        return `<span style="padding: 2px 7px; background: ${bg}; color: ${color}; border: 1px solid ${border}; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>`;
      }).join('')
    : '<span style="color:#94a3b8; font-size:11px;">[ 队列已清空 ]</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #1e40af;">BFS 层序遍历队列大小:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #1d4ed8;">
          ${q.length} 个待处理节点
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">出队并互换左右子树管道:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 36px; align-items: center;">
          ${chips}
        </div>
      </div>
    </div>
  `;
}

/** Card 2 缓冲器：Stage 3 静态数组面板 */
function renderStage3StaticArrayBufferHtml(step: InvertStep): string {
  const s = step.staticQueueState;
  const arr = s?.array ?? [];
  const cells = arr.map((v, i) => {
    const isL = i === s?.l;
    const isR = i === s?.r;
    let ptr = '&nbsp;';
    if (isL && isR) ptr = '<span style="color:#ef4444; font-weight:800;">l/r</span>';
    else if (isL) ptr = '<span style="color:#0284c7; font-weight:800;">l↓</span>';
    else if (isR) ptr = '<span style="color:#10b981; font-weight:800;">r↓</span>';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <div style="height: 12px; line-height: 12px; font-size: 9px; font-family: monospace;">${ptr}</div>
        <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: ${i >= (s?.l ?? 0) && i < (s?.r ?? 0) ? '#e0f2fe' : '#ffffff'}; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 11px; font-weight: 700;">
          ${v}
        </div>
        <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">[${i}]</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #92400e;">左神静态连续数组 queue[MAXN]:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #b45309;">
          [l=${s?.l ?? 0}, r=${s?.r ?? 0}) | 待处理: ${Math.max(0, (s?.r ?? 0) - (s?.l ?? 0))}
        </span>
      </div>
      <div style="display: flex; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto;">
        ${cells}
      </div>
    </div>
  `;
}

/** Card 2 全景指标诊断看板外壳 */
function renderTreeInvertMetricsShell(step: InvertStep, bufferHtml: string, tipHtml: string): string {
  const curVal = step.current != null ? `节点 ${step.current}` : '—';
  const stateText = step.isSwapping ? '正在互换左右指针' : step.action === 'done' ? '翻转全部完成' : '递归遍历中';
  const stateColor = step.isSwapping ? '#d97706' : step.action === 'done' ? '#16a34a' : '#2563eb';

  return `
    <div style="display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">当前考察节点</div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${curVal}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">当前状态</div>
          <div style="font-size: 13px; font-weight: 800; color: ${stateColor}; margin-top: 2px;">${stateText}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">已互换子树次数</div>
          <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 2px;">${step.invertedCount} 次</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">时间复杂度</div>
          <div style="font-size: 13px; font-weight: 800; color: #0d9488; margin-top: 2px;">O(N) · O(H)</div>
        </div>
      </div>

      <div style="padding: 10px; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px;">
        ${bufferHtml}
      </div>

      <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 0 6px 6px 0; font-size: 12px; color: #334155;">
        <span>💡</span>
        <span>${tipHtml}</span>
      </div>
    </div>
  `;
}

// ============================================================
// 声明式算法注册中心配置 (Declarative Algorithm Visualizer)
// ============================================================
export const treeInvertVisualizer = registerDeclarativeAlgorithm<InvertStep>({
  id: 'tree-invert',
  aliases: ['leetcode-226', 'invert-binary-tree'],
  name: '翻转二叉树',
  category: 'tree',
  icon: '🪞',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '掌握利用递归或层序遍历互换每个节点左右子树指针的算法本质',
  problemHtml: TREE_INVERT_PROBLEM_HTML,
  analysisHtml: TREE_INVERT_ANALYSIS_HTML,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 前序递归翻转 (Recursive Preorder DFS)',
      shortName: '前序递归',
      num: 1,
      timeBadge: 'O(N) · O(H)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '深度优先 · 递归交换左右子树指针',
        complexity: 'O(N) · O(H) 递归栈',
      },
      card1Title: '🌳 二叉树动态镜像翻转沙盘',
      card2Title: '🧭 左右孩子互换状态监视器',
      codeLanguages: TREE_INVERT_STAGE1_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildTreeInvertSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: InvertStep) => renderTreeInvertCanvasForStep(container, step, '#10b981'),
      renderCustomMetrics: (container: HTMLElement, step: InvertStep) => {
        container.innerHTML = renderTreeInvertMetricsShell(
          step,
          renderStage1SwapBufferHtml(step),
          '经典递归：遍历到每个节点时，执行 swap(node.left, node.right)，再分别向左、右子树递归。'
        );
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 队列层序遍历翻转 (Iterative Queue BFS)',
      shortName: '队列BFS',
      num: 2,
      timeBadge: 'O(N) · O(W)',
      theme: 'bg-blue' as const,
      badge: {
        mode: '广度优先 · 逐层出队交换指针',
        complexity: 'O(N) · O(W) 队列',
      },
      card1Title: '🚪 队列层序翻转拓扑沙盘',
      card2Title: '🔄 队列管道与逐层交换监视器',
      codeLanguages: TREE_INVERT_STAGE2_QUEUE_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildTreeInvertBfsSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: InvertStep) => renderTreeInvertCanvasForStep(container, step, '#3b82f6'),
      renderCustomMetrics: (container: HTMLElement, step: InvertStep) => {
        container.innerHTML = renderTreeInvertMetricsShell(
          step,
          renderStage2QueueBufferHtml(step),
          '广度优先迭代：使用队列按层访问，弹出节点立即互换其左右孩子指针，并将非空孩子入队。'
        );
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 静态数组模拟队列 (Static Array Queue)',
      shortName: '静态数组',
      num: 3,
      timeBadge: 'O(N) · 零GC',
      theme: 'bg-amber' as const,
      badge: {
        mode: '连续内存 · 双指针模拟队列零 GC',
        complexity: 'O(N) · O(W) 零GC',
      },
      card1Title: '⚡ 连续内存队列拓扑沙盘',
      card2Title: '🏎️ queue[MAXN] 连续槽位与双指针监视器',
      codeLanguages: TREE_INVERT_STAGE3_STATIC_ARRAY_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildTreeInvertStaticArraySteps(root);
      },
      renderCanvas: (container: HTMLElement, step: InvertStep) => renderTreeInvertCanvasForStep(container, step, '#f59e0b'),
      renderCustomMetrics: (container: HTMLElement, step: InvertStep) => {
        container.innerHTML = renderTreeInvertMetricsShell(
          step,
          renderStage3StaticArrayBufferHtml(step),
          '左神 Class 036 招牌：queue[MAXN] 连续数组配合 l, r 双指针，彻底消灭 GC 开销！'
        );
      },
    },
  ],

  // Fallback
  codeLanguages: TREE_INVERT_STAGE1_CODE,
  buildSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildTreeInvertSteps(root);
  },
  generateSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildTreeInvertSteps(root);
  },
  renderCanvas: (container, step) => {
    renderTreeInvertCanvasForStep(container, step, '#10b981');
  },

  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '4, 2, 7, 1, 3, 6, 9',
      width: '160px',
      placeholder: '4, 2, 7, 1, 3, 6, 9',
    },
  ],
  presets: [
    {
      label: '标准满二叉树 [4, 2, 7, 1, 3, 6, 9]',
      values: { 'input-tree': '4, 2, 7, 1, 3, 6, 9' },
      description: '7 节点满二叉树',
    },
    {
      label: '简单示例 [2, 1, 3]',
      values: { 'input-tree': '2, 1, 3' },
      description: '3 节点简单二叉树',
    },
    {
      label: '单侧偏斜树 [1, 2, null, 3, null]',
      values: { 'input-tree': '1, 2, null, 3, null' },
      description: '单侧链状二叉树',
    },
    {
      label: '单节点极限 [1]',
      values: { 'input-tree': '1' },
      description: '单节点根树',
    },
  ],
});