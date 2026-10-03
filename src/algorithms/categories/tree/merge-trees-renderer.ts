/**
 * LeetCode 617: 合并二叉树 (Merge Two Binary Trees)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * 核心多阶段演化体系:
 *   Stage 1: 递归 DFS 同步下潜 (Simultaneous DFS, O(min(M, N)))
 *   Stage 2: 迭代 BFS 队列同步合并 (Iterative BFS Queue, O(min(M, N)))
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  MERGE_TREES_STAGE1_CODES,
  MERGE_TREES_STAGE1_LINES,
  MERGE_TREES_STAGE2_CODES,
  MERGE_TREES_STAGE2_LINES,
} from './merge-trees-stage-codes';
import {
  MERGE_TREES_PROBLEM_HTML,
  MERGE_TREES_ANALYSIS_HTML,
} from './merge-trees-problem-content';

export interface MergeTreesStep {
  // 向后兼容字段
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  sum: number | null;
  val1: number | null;
  val2: number | null;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;

  // 现代声明式与多树高亮增强字段
  tree1: TreeNode | null;
  tree2: TreeNode | null;
  mergedTree: TreeNode | null;
  focus1: number | null;
  focus2: number | null;
  focusMerged: number | null;
  highlightedMergedVals?: Set<number>;
  metrics?: Record<string, string>;
  queueState?: string[];
  opType: 'init' | 'check' | 'add' | 'graft' | 'recurse_left' | 'recurse_right' | 'complete';
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

/**
 * 将逗号分隔的输入字符串安全解析为二叉树层序数组
 * 支持 'null' 标识空节点
 */
export function parseTreeInput(inputStr: any, defaultVals: (number | null)[]): (number | null)[] {
  if (typeof inputStr !== 'string') {
    if (Array.isArray(inputStr)) return inputStr;
    return defaultVals;
  }
  const trimmed = inputStr.trim();
  if (!trimmed) return [];

  const rawTokens = trimmed
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(/[,，\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (rawTokens.length === 0) return [];

  return rawTokens.map((t) => {
    if (t.toLowerCase() === 'null' || t === '#') return null;
    const n = Number(t);
    return isNaN(n) ? null : n;
  });
}

// ----------------------------------------------------
// Stage 1: 递归 DFS 同步下潜 (Simultaneous DFS)
// ----------------------------------------------------
export function buildMergeTreesDfsSteps(
  tree1Arr: (number | null)[],
  tree2Arr: (number | null)[]
): MergeTreesStep[] {
  const steps: MergeTreesStep[] = [];
  const lines = MERGE_TREES_STAGE1_LINES;

  const root1 = buildTreeFromArr(tree1Arr);
  const root2 = buildTreeFromArr(tree2Arr);

  const initialTree1 = cloneTree(root1);
  const initialTree2 = cloneTree(root2);

  // 1. 初始化入口帧
  steps.push({
    tree: null,
    current: null,
    tree1: cloneTree(initialTree1),
    tree2: cloneTree(initialTree2),
    mergedTree: null,
    depth: 0,
    sum: null,
    val1: root1 ? root1.val : null,
    val2: root2 ? root2.val : null,
    focus1: root1 ? root1.val : null,
    focus2: root2 ? root2.val : null,
    focusMerged: null,
    highlightedMergedVals: new Set(),
    message: `准备开始合并：树 1 根节点 [${root1?.val ?? '空'}] 与 树 2 根节点 [${root2?.val ?? '空'}]`,
    log: '开始 DFS 递归合并两棵二叉树',
    codeLine: lines.entry,
    opType: 'init',
  });

  // 边界：两树皆空
  if (!root1 && !root2) {
    steps.push({
      tree: null,
      current: null,
      tree1: null,
      tree2: null,
      mergedTree: null,
      depth: 0,
      sum: null,
      val1: null,
      val2: null,
      focus1: null,
      focus2: null,
      focusMerged: null,
      highlightedMergedVals: new Set(),
      message: '两棵输入树皆为空，合并结果为 null',
      log: '两树均为空，直接返回 null',
      codeLine: lines.check1,
      opType: 'complete',
    });
    return steps;
  }

  let liveMergedRoot: TreeNode | null = null;
  const completedVals = new Set<number>();

  const dfs = (
    n1: TreeNode | null,
    n2: TreeNode | null,
    depth: number,
    parent?: TreeNode,
    isLeft?: boolean
  ): TreeNode | null => {
    // 检查树 1 是否为空
    if (!n1) {
      steps.push({
        tree: cloneTree(liveMergedRoot),
        current: n2 ? n2.val : null,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(liveMergedRoot),
        depth,
        sum: n2 ? n2.val : null,
        val1: null,
        val2: n2 ? n2.val : null,
        focus1: null,
        focus2: n2 ? n2.val : null,
        focusMerged: n2 ? n2.val : null,
        highlightedMergedVals: new Set(completedVals),
        message: `树 1 当前节点为空，直接继承/保留树 2 子树（节点值: ${n2 ? n2.val : 'null'}）`,
        log: `树 1 为空，返回树 2 子树 (${n2?.val ?? 'null'})`,
        codeLine: lines.check1,
        opType: 'check',
      });
      const grafted = cloneTree(n2);
      if (grafted) {
        if (!liveMergedRoot) {
          liveMergedRoot = grafted;
        } else if (parent) {
          if (isLeft) parent.left = grafted;
          else parent.right = grafted;
        }
        completedVals.add(grafted.val);
      }
      return grafted;
    }

    // 检查树 2 是否为空
    if (!n2) {
      steps.push({
        tree: cloneTree(liveMergedRoot),
        current: n1.val,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(liveMergedRoot),
        depth,
        sum: n1.val,
        val1: n1.val,
        val2: null,
        focus1: n1.val,
        focus2: null,
        focusMerged: n1.val,
        highlightedMergedVals: new Set(completedVals),
        message: `树 2 当前节点为空，直接继承/保留树 1 子树（节点值: ${n1.val}）`,
        log: `树 2 为空，返回树 1 子树 (${n1.val})`,
        codeLine: lines.check2,
        opType: 'check',
      });
      const grafted = cloneTree(n1);
      if (grafted) {
        if (!liveMergedRoot) {
          liveMergedRoot = grafted;
        } else if (parent) {
          if (isLeft) parent.left = grafted;
          else parent.right = grafted;
        }
        completedVals.add(grafted.val);
      }
      return grafted;
    }

    // 两树节点均非空：值相加
    const sum = n1.val + n2.val;
    const newNode: TreeNode = { val: sum, left: null, right: null };

    if (!liveMergedRoot) {
      liveMergedRoot = newNode;
    } else if (parent) {
      if (isLeft) parent.left = newNode;
      else parent.right = newNode;
    }

    steps.push({
      tree: cloneTree(liveMergedRoot),
      current: sum,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(liveMergedRoot),
      depth,
      sum,
      val1: n1.val,
      val2: n2.val,
      focus1: n1.val,
      focus2: n2.val,
      focusMerged: sum,
      highlightedMergedVals: new Set(completedVals),
      message: `重叠节点相加：树 1(${n1.val}) + 树 2(${n2.val}) = ${sum}，创建合并新节点`,
      log: `重叠相加: ${n1.val} + ${n2.val} = ${sum}`,
      codeLine: lines.createMerged,
      opType: 'add',
    });

    // 递归左子树
    steps.push({
      tree: cloneTree(liveMergedRoot),
      current: sum,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(liveMergedRoot),
      depth,
      sum,
      val1: n1.val,
      val2: n2.val,
      focus1: n1.left ? n1.left.val : null,
      focus2: n2.left ? n2.left.val : null,
      focusMerged: sum,
      highlightedMergedVals: new Set(completedVals),
      message: `向左下潜：递归合并节点 ${sum} 的左子树 (树 1: ${n1.left?.val ?? 'null'}, 树 2: ${n2.left?.val ?? 'null'})`,
      log: `下潜合并节点 ${sum} 的左子树`,
      codeLine: lines.recurseLeft,
      opType: 'recurse_left',
    });
    newNode.left = dfs(n1.left, n2.left, depth + 1, newNode, true);

    // 递归右子树
    steps.push({
      tree: cloneTree(liveMergedRoot),
      current: sum,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(liveMergedRoot),
      depth,
      sum,
      val1: n1.val,
      val2: n2.val,
      focus1: n1.right ? n1.right.val : null,
      focus2: n2.right ? n2.right.val : null,
      focusMerged: sum,
      highlightedMergedVals: new Set(completedVals),
      message: `向右下潜：递归合并节点 ${sum} 的右子树 (树 1: ${n1.right?.val ?? 'null'}, 树 2: ${n2.right?.val ?? 'null'})`,
      log: `下潜合并节点 ${sum} 的右子树`,
      codeLine: lines.recurseRight,
      opType: 'recurse_right',
    });
    newNode.right = dfs(n1.right, n2.right, depth + 1, newNode, false);

    completedVals.add(sum);

    // 左右合并完成，向上回溯
    steps.push({
      tree: cloneTree(liveMergedRoot),
      current: sum,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(liveMergedRoot),
      depth,
      sum,
      val1: n1.val,
      val2: n2.val,
      focus1: n1.val,
      focus2: n2.val,
      focusMerged: sum,
      highlightedMergedVals: new Set(completedVals),
      message: `节点 ${sum} 的左右子树全部合并完毕，返回该节点`,
      log: `节点 ${sum} 左右子树合并完毕`,
      codeLine: lines.returnMerged,
      opType: 'check',
    });

    return newNode;
  };

  const finalResult = dfs(root1, root2, 0);

  // 最终收尾步
  steps.push({
    tree: cloneTree(finalResult),
    current: finalResult ? finalResult.val : null,
    tree1: cloneTree(initialTree1),
    tree2: cloneTree(initialTree2),
    mergedTree: cloneTree(finalResult),
    depth: 0,
    sum: finalResult ? finalResult.val : null,
    val1: null,
    val2: null,
    focus1: null,
    focus2: null,
    focusMerged: finalResult ? finalResult.val : null,
    highlightedMergedVals: new Set(completedVals),
    message: '二叉树 DFS 递归合并全部完成！',
    log: '合并成功完成',
    codeLine: lines.returnMerged,
    opType: 'complete',
  });

  return steps;
}

// ----------------------------------------------------
// Stage 2: 迭代 BFS 队列同步合并 (Iterative BFS Queue)
// ----------------------------------------------------
export function buildMergeTreesBfsSteps(
  tree1Arr: (number | null)[],
  tree2Arr: (number | null)[]
): MergeTreesStep[] {
  const steps: MergeTreesStep[] = [];
  const lines = MERGE_TREES_STAGE2_LINES;

  const root1 = buildTreeFromArr(tree1Arr);
  const root2 = buildTreeFromArr(tree2Arr);

  const initialTree1 = cloneTree(root1);
  const initialTree2 = cloneTree(root2);

  steps.push({
    tree: null,
    current: null,
    tree1: cloneTree(initialTree1),
    tree2: cloneTree(initialTree2),
    mergedTree: null,
    depth: 0,
    sum: null,
    val1: root1 ? root1.val : null,
    val2: root2 ? root2.val : null,
    focus1: root1 ? root1.val : null,
    focus2: root2 ? root2.val : null,
    focusMerged: null,
    highlightedMergedVals: new Set(),
    queueState: [],
    message: 'BFS 广度优先合并开始：初始化双树与待处理节点队列',
    log: '初始化 BFS 队列合并',
    codeLine: lines.entry,
    opType: 'init',
  });

  if (!root1) {
    const res = cloneTree(root2);
    steps.push({
      tree: res,
      current: res ? res.val : null,
      tree1: null,
      tree2: cloneTree(initialTree2),
      mergedTree: res,
      depth: 0,
      sum: res ? res.val : null,
      val1: null,
      val2: res ? res.val : null,
      focus1: null,
      focus2: res ? res.val : null,
      focusMerged: res ? res.val : null,
      highlightedMergedVals: res ? new Set([res.val]) : new Set(),
      queueState: [],
      message: '树 1 为空，直接返回整棵树 2 作为合并结果',
      log: '树 1 为空，返回树 2',
      codeLine: lines.check1,
      opType: 'complete',
    });
    return steps;
  }

  if (!root2) {
    const res = cloneTree(root1);
    steps.push({
      tree: res,
      current: res ? res.val : null,
      tree1: cloneTree(initialTree1),
      tree2: null,
      mergedTree: res,
      depth: 0,
      sum: res ? res.val : null,
      val1: res ? res.val : null,
      val2: null,
      focus1: res ? res.val : null,
      focus2: null,
      focusMerged: res ? res.val : null,
      highlightedMergedVals: res ? new Set([res.val]) : new Set(),
      queueState: [],
      message: '树 2 为空，直接返回整棵树 1 作为合并结果',
      log: '树 2 为空，返回树 1',
      codeLine: lines.check2,
      opType: 'complete',
    });
    return steps;
  }

  // 以 root1 的副本作为 live 结果树
  const mergedRoot = cloneTree(root1)!;
  const queue: Array<{ n1: TreeNode; n2: TreeNode }> = [{ n1: mergedRoot, n2: root2 }];
  const completedVals = new Set<number>();

  steps.push({
    tree: cloneTree(mergedRoot),
    current: mergedRoot.val,
    tree1: cloneTree(initialTree1),
    tree2: cloneTree(initialTree2),
    mergedTree: cloneTree(mergedRoot),
    depth: 0,
    sum: null,
    val1: mergedRoot.val,
    val2: root2.val,
    focus1: mergedRoot.val,
    focus2: root2.val,
    focusMerged: mergedRoot.val,
    highlightedMergedVals: new Set(completedVals),
    queueState: [`[T1:${mergedRoot.val}, T2:${root2.val}]`],
    message: `根节点对入队: [T1:${mergedRoot.val}, T2:${root2.val}]`,
    log: `根节点入队: [${mergedRoot.val}, ${root2.val}]`,
    codeLine: lines.initQueue,
    opType: 'init',
  });

  while (queue.length > 0) {
    const formatQueue = () => queue.map((p) => `(${p.n1.val},${p.n2.val})`);

    steps.push({
      tree: cloneTree(mergedRoot),
      current: queue[0].n1.val,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(mergedRoot),
      depth: 0,
      sum: null,
      val1: queue[0].n1.val,
      val2: queue[0].n2.val,
      focus1: queue[0].n1.val,
      focus2: queue[0].n2.val,
      focusMerged: queue[0].n1.val,
      highlightedMergedVals: new Set(completedVals),
      queueState: formatQueue(),
      message: `队列循环：当前队列尚存 ${queue.length} 个重叠节点对待合并`,
      log: `队列待处理: ${queue.length} 对`,
      codeLine: lines.whileLoop,
      opType: 'check',
    });

    const { n1, n2 } = queue.shift()!;
    const originalN1Val = n1.val;
    const sum = n1.val + n2.val;
    n1.val = sum;
    completedVals.add(sum);

    steps.push({
      tree: cloneTree(mergedRoot),
      current: sum,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(mergedRoot),
      depth: 0,
      sum,
      val1: originalN1Val,
      val2: n2.val,
      focus1: originalN1Val,
      focus2: n2.val,
      focusMerged: sum,
      highlightedMergedVals: new Set(completedVals),
      queueState: formatQueue(),
      message: `弹出对头并在主树原地累加: ${originalN1Val} + ${n2.val} = ${sum}`,
      log: `弹出节点对求和: ${originalN1Val} + ${n2.val} = ${sum}`,
      codeLine: lines.addVal,
      opType: 'add',
    });

    // 检查左孩子
    if (n1.left && n2.left) {
      queue.push({ n1: n1.left, n2: n2.left });
      steps.push({
        tree: cloneTree(mergedRoot),
        current: sum,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(mergedRoot),
        depth: 0,
        sum,
        val1: n1.left.val,
        val2: n2.left.val,
        focus1: n1.left.val,
        focus2: n2.left.val,
        focusMerged: sum,
        highlightedMergedVals: new Set(completedVals),
        queueState: formatQueue(),
        message: `左右两树均有左孩子 (${n1.left.val} 与 ${n2.left.val})，入队等待层序求和`,
        log: `左孩子均存在，入队 (${n1.left.val}, ${n2.left.val})`,
        codeLine: lines.checkLeftBoth,
        opType: 'check',
      });
    } else if (!n1.left && n2.left) {
      n1.left = cloneTree(n2.left);
      if (n1.left) completedVals.add(n1.left.val);
      steps.push({
        tree: cloneTree(mergedRoot),
        current: sum,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(mergedRoot),
        depth: 0,
        sum,
        val1: null,
        val2: n2.left.val,
        focus1: null,
        focus2: n2.left.val,
        focusMerged: sum,
        highlightedMergedVals: new Set(completedVals),
        queueState: formatQueue(),
        message: `主树无左孩子但树 2 存在左孩子 (${n2.left.val})，直接嫁接树 2 的左子树`,
        log: `嫁接树 2 左孩子: ${n2.left.val}`,
        codeLine: lines.graftLeft,
        opType: 'graft',
      });
    }

    // 检查右孩子
    if (n1.right && n2.right) {
      queue.push({ n1: n1.right, n2: n2.right });
      steps.push({
        tree: cloneTree(mergedRoot),
        current: sum,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(mergedRoot),
        depth: 0,
        sum,
        val1: n1.right.val,
        val2: n2.right.val,
        focus1: n1.right.val,
        focus2: n2.right.val,
        focusMerged: sum,
        highlightedMergedVals: new Set(completedVals),
        queueState: formatQueue(),
        message: `左右两树均有右孩子 (${n1.right.val} 与 ${n2.right.val})，入队等待层序求和`,
        log: `右孩子均存在，入队 (${n1.right.val}, ${n2.right.val})`,
        codeLine: lines.checkRightBoth,
        opType: 'check',
      });
    } else if (!n1.right && n2.right) {
      n1.right = cloneTree(n2.right);
      if (n1.right) completedVals.add(n1.right.val);
      steps.push({
        tree: cloneTree(mergedRoot),
        current: sum,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(mergedRoot),
        depth: 0,
        sum,
        val1: null,
        val2: n2.right.val,
        focus1: null,
        focus2: n2.right.val,
        focusMerged: sum,
        highlightedMergedVals: new Set(completedVals),
        queueState: formatQueue(),
        message: `主树无右孩子但树 2 存在右孩子 (${n2.right.val})，直接嫁接树 2 的右子树`,
        log: `嫁接树 2 右孩子: ${n2.right.val}`,
        codeLine: lines.graftRight,
        opType: 'graft',
      });
    }
  }

  // 最终完成步
  steps.push({
    tree: cloneTree(mergedRoot),
    current: mergedRoot.val,
    tree1: cloneTree(initialTree1),
    tree2: cloneTree(initialTree2),
    mergedTree: cloneTree(mergedRoot),
    depth: 0,
    sum: mergedRoot.val,
    val1: null,
    val2: null,
    focus1: null,
    focus2: null,
    focusMerged: mergedRoot.val,
    highlightedMergedVals: new Set(completedVals),
    queueState: [],
    message: '二叉树 BFS 队列迭代合并全部完成！',
    log: '队列为空，迭代合并完成',
    codeLine: lines.returnRoot,
    opType: 'complete',
  });

  return steps;
}

// 向后兼容接口导出
export function buildMergeTreesSteps(
  tree1Arr: (number | null)[] = [1, 3, 2, 5],
  tree2Arr: (number | null)[] = [2, 1, 3, null, 4, null, 7]
): MergeTreesStep[] {
  return buildMergeTreesDfsSteps(tree1Arr, tree2Arr);
}

// ----------------------------------------------------
// 表现层渲染逻辑 (Presentation Logic)
// ----------------------------------------------------

/**
 * 绘制紧凑型微树 SVG
 */
function renderMiniTreeSVG(
  container: HTMLElement,
  root: TreeNode | null,
  focusVal: number | null,
  focusColor = '#38bdf8',
  completedVals?: Set<number>
): void {
  container.innerHTML = '';
  if (!root) {
    container.innerHTML = `
      <div style="height: 100%; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 12px; font-weight: 500;">
        (空树 null)
      </div>
    `;
    return;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 240 200');
  svg.style.overflow = 'visible';

  const lh = 38;

  const draw = (node: TreeNode, x: number, y: number, spread: number) => {
    const isFocus = focusVal !== null && node.val === focusVal;
    const isCompleted = completedVals ? completedVals.has(node.val) : false;

    if (node.left) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x - spread));
      line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', '#334155');
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
      draw(node.left, x - spread, y + lh, spread / 2);
    }

    if (node.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x + spread));
      line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', '#334155');
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
      draw(node.right, x + spread, y + lh, spread / 2);
    }

    // 节点圆圈
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', '15');

    let fill = '#1e293b';
    let stroke = '#475569';
    let textColor = '#e2e8f0';

    if (isFocus) {
      fill = 'rgba(56, 189, 248, 0.25)';
      stroke = focusColor;
      textColor = '#38bdf8';
    } else if (isCompleted) {
      fill = 'rgba(34, 197, 94, 0.15)';
      stroke = '#22c55e';
      textColor = '#4ade80';
    }

    circle.setAttribute('fill', fill);
    circle.setAttribute('stroke', stroke);
    circle.setAttribute('stroke-width', isFocus ? '2.5' : '1.5');
    svg.appendChild(circle);

    // 节点文字
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y + 4.5));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', '700');
    text.setAttribute('font-family', 'ui-monospace, monospace');
    text.setAttribute('fill', textColor);
    text.textContent = String(node.val);
    svg.appendChild(text);
  };

  draw(root, 120, 24, 52);
  container.appendChild(svg);
}

/**
 * Card 1: 主画布三树并排沙盘渲染
 */
export function renderMergeTreesCanvas(container: HTMLElement, step: MergeTreesStep): void {
  container.innerHTML = '';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.minHeight = '320px';
  container.style.display = 'flex';
  container.style.alignItems = 'stretch';
  container.style.justifyContent = 'space-between';
  container.style.gap = '8px';
  container.style.padding = '8px';
  container.style.boxSizing = 'border-box';

  // 1. 树 1 区域 (T1)
  const col1 = document.createElement('div');
  col1.style.flex = '1';
  col1.style.display = 'flex';
  col1.style.flexDirection = 'column';
  col1.style.background = 'rgba(15, 23, 42, 0.6)';
  col1.style.border = '1px solid #1e293b';
  col1.style.borderRadius = '8px';
  col1.style.padding = '8px';
  col1.style.minWidth = '0';

  const t1Header = document.createElement('div');
  t1Header.style.fontSize = '12px';
  t1Header.style.fontWeight = '700';
  t1Header.style.color = '#38bdf8';
  t1Header.style.marginBottom = '6px';
  t1Header.style.display = 'flex';
  t1Header.style.alignItems = 'center';
  t1Header.style.justifyContent = 'space-between';
  t1Header.innerHTML = `<span>🌳 输入树 1</span><span style="font-size: 11px; color: #94a3b8;">焦点: ${step.focus1 ?? '无'}</span>`;
  col1.appendChild(t1Header);

  const t1TreeBox = document.createElement('div');
  t1TreeBox.style.flex = '1';
  t1TreeBox.style.minHeight = '200px';
  renderMiniTreeSVG(t1TreeBox, step.tree1, step.focus1, '#38bdf8');
  col1.appendChild(t1TreeBox);

  // 2. 加号操作符
  const opPlus = document.createElement('div');
  opPlus.style.display = 'flex';
  opPlus.style.alignItems = 'center';
  opPlus.style.justifyContent = 'center';
  opPlus.style.fontSize = '24px';
  opPlus.style.fontWeight = '800';
  opPlus.style.color = '#64748b';
  opPlus.style.width = '24px';
  opPlus.textContent = '+';

  // 3. 树 2 区域 (T2)
  const col2 = document.createElement('div');
  col2.style.flex = '1';
  col2.style.display = 'flex';
  col2.style.flexDirection = 'column';
  col2.style.background = 'rgba(15, 23, 42, 0.6)';
  col2.style.border = '1px solid #1e293b';
  col2.style.borderRadius = '8px';
  col2.style.padding = '8px';
  col2.style.minWidth = '0';

  const t2Header = document.createElement('div');
  t2Header.style.fontSize = '12px';
  t2Header.style.fontWeight = '700';
  t2Header.style.color = '#c084fc';
  t2Header.style.marginBottom = '6px';
  t2Header.style.display = 'flex';
  t2Header.style.alignItems = 'center';
  t2Header.style.justifyContent = 'space-between';
  t2Header.innerHTML = `<span>🌿 输入树 2</span><span style="font-size: 11px; color: #94a3b8;">焦点: ${step.focus2 ?? '无'}</span>`;
  col2.appendChild(t2Header);

  const t2TreeBox = document.createElement('div');
  t2TreeBox.style.flex = '1';
  t2TreeBox.style.minHeight = '200px';
  renderMiniTreeSVG(t2TreeBox, step.tree2, step.focus2, '#c084fc');
  col2.appendChild(t2TreeBox);

  // 4. 等号/箭头操作符
  const opArrow = document.createElement('div');
  opArrow.style.display = 'flex';
  opArrow.style.alignItems = 'center';
  opArrow.style.justifyContent = 'center';
  opArrow.style.fontSize = '20px';
  opArrow.style.fontWeight = '800';
  opArrow.style.color = '#22c55e';
  opArrow.style.width = '24px';
  opArrow.textContent = '➔';

  // 5. 合并结果树区域 (Merged)
  const col3 = document.createElement('div');
  col3.style.flex = '1.2';
  col3.style.display = 'flex';
  col3.style.flexDirection = 'column';
  col3.style.background = 'rgba(15, 23, 42, 0.85)';
  col3.style.border = '1px solid rgba(34, 197, 94, 0.3)';
  col3.style.borderRadius = '8px';
  col3.style.padding = '8px';
  col3.style.minWidth = '0';

  const t3Header = document.createElement('div');
  t3Header.style.fontSize = '12px';
  t3Header.style.fontWeight = '700';
  t3Header.style.color = '#4ade80';
  t3Header.style.marginBottom = '6px';
  t3Header.style.display = 'flex';
  t3Header.style.alignItems = 'center';
  t3Header.style.justifyContent = 'space-between';
  t3Header.innerHTML = `<span>✨ 合并演进树</span><span style="font-size: 11px; color: #facc15;">当前合并: ${step.sum ?? '-'}</span>`;
  col3.appendChild(t3Header);

  const t3TreeBox = document.createElement('div');
  t3TreeBox.style.flex = '1';
  t3TreeBox.style.minHeight = '200px';
  renderMiniTreeSVG(t3TreeBox, step.mergedTree, step.focusMerged, '#facc15', step.highlightedMergedVals);
  col3.appendChild(t3TreeBox);

  container.appendChild(col1);
  container.appendChild(opPlus);
  container.appendChild(col2);
  container.appendChild(opArrow);
  container.appendChild(col3);
}

/**
 * Card 2: 辅助推演动态与状态卡片
 */
export function renderMergeTreesCard2(container: HTMLElement, step: MergeTreesStep): void {
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '10px';
  container.style.padding = '6px 2px';

  // 1. 算式推演视窗
  const formulaBox = document.createElement('div');
  formulaBox.style.background = 'rgba(15, 23, 42, 0.7)';
  formulaBox.style.border = '1px solid #1e293b';
  formulaBox.style.borderRadius = '8px';
  formulaBox.style.padding = '10px';

  const formulaTitle = document.createElement('div');
  formulaTitle.style.fontSize = '11px';
  formulaTitle.style.fontWeight = '700';
  formulaTitle.style.color = '#94a3b8';
  formulaTitle.style.marginBottom = '6px';
  formulaTitle.textContent = '📐 节点合并算式推导';
  formulaBox.appendChild(formulaTitle);

  const formulaRow = document.createElement('div');
  formulaRow.style.display = 'flex';
  formulaRow.style.alignItems = 'center';
  formulaRow.style.gap = '8px';
  formulaRow.style.fontFamily = 'ui-monospace, monospace';
  formulaRow.style.fontSize = '13px';
  formulaRow.style.fontWeight = '700';

  if (step.val1 !== null && step.val2 !== null && step.sum !== null) {
    formulaRow.innerHTML = `
      <span style="color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 2px 8px; border-radius: 4px;">T1: ${step.val1}</span>
      <span style="color: #64748b;">+</span>
      <span style="color: #c084fc; background: rgba(192, 132, 252, 0.15); padding: 2px 8px; border-radius: 4px;">T2: ${step.val2}</span>
      <span style="color: #22c55e;">=</span>
      <span style="color: #facc15; background: rgba(250, 204, 21, 0.15); padding: 2px 8px; border-radius: 4px;">合并新节点: ${step.sum}</span>
    `;
  } else if (step.val1 !== null && step.val2 === null) {
    formulaRow.innerHTML = `
      <span style="color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 2px 8px; border-radius: 4px;">T1: ${step.val1}</span>
      <span style="color: #64748b;">+</span>
      <span style="color: #64748b;">null</span>
      <span style="color: #22c55e;">➜</span>
      <span style="color: #4ade80;">单边保留 T1 子树 (节点 ${step.val1})</span>
    `;
  } else if (step.val1 === null && step.val2 !== null) {
    formulaRow.innerHTML = `
      <span style="color: #64748b;">null</span>
      <span style="color: #64748b;">+</span>
      <span style="color: #c084fc; background: rgba(192, 132, 252, 0.15); padding: 2px 8px; border-radius: 4px;">T2: ${step.val2}</span>
      <span style="color: #22c55e;">➜</span>
      <span style="color: #4ade80;">单边嫁接 T2 子树 (节点 ${step.val2})</span>
    `;
  } else {
    formulaRow.innerHTML = `<span style="color: #64748b;">(就绪或边界返回)</span>`;
  }
  formulaBox.appendChild(formulaRow);
  container.appendChild(formulaBox);

  // 2. 状态队列/调用栈沙盘
  if (step.queueState && step.queueState.length > 0) {
    const qBox = document.createElement('div');
    qBox.style.background = 'rgba(15, 23, 42, 0.7)';
    qBox.style.border = '1px solid #1e293b';
    qBox.style.borderRadius = '8px';
    qBox.style.padding = '10px';

    const qTitle = document.createElement('div');
    qTitle.style.fontSize = '11px';
    qTitle.style.fontWeight = '700';
    qTitle.style.color = '#94a3b8';
    qTitle.style.marginBottom = '6px';
    qTitle.textContent = `📋 BFS 待处理节点对队列 (Size: ${step.queueState.length})`;
    qBox.appendChild(qTitle);

    const qRow = document.createElement('div');
    qRow.style.display = 'flex';
    qRow.style.flexWrap = 'wrap';
    qRow.style.gap = '6px';

    step.queueState.forEach((item, idx) => {
      const pill = document.createElement('span');
      pill.style.padding = '2px 8px';
      pill.style.borderRadius = '4px';
      pill.style.fontSize = '11px';
      pill.style.fontFamily = 'ui-monospace, monospace';
      pill.style.fontWeight = '600';
      if (idx === 0) {
        pill.style.background = 'rgba(250, 204, 21, 0.2)';
        pill.style.border = '1px solid #facc15';
        pill.style.color = '#fef08a';
        pill.textContent = `${item} (头)`;
      } else {
        pill.style.background = 'rgba(51, 65, 85, 0.5)';
        pill.style.border = '1px solid #475569';
        pill.style.color = '#cbd5e1';
        pill.textContent = item;
      }
      qRow.appendChild(pill);
    });
    qBox.appendChild(qRow);
    container.appendChild(qBox);
  }

  // 3. 步骤决策与动态解释
  const summaryBox = document.createElement('div');
  summaryBox.style.background = 'rgba(30, 41, 59, 0.5)';
  summaryBox.style.padding = '10px';
  summaryBox.style.borderRadius = '8px';
  summaryBox.style.border = '1px solid #334155';
  summaryBox.style.fontSize = '12px';
  summaryBox.style.lineHeight = '1.5';
  summaryBox.style.color = '#94a3b8';
  summaryBox.innerHTML = `
    <div style="font-weight: 700; color: #38bdf8; margin-bottom: 2px;">⚡ 当前操作动作</div>
    <div style="color: #e2e8f0;">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}

// ----------------------------------------------------
// 注册声明式多阶段二叉树合并算法
// ----------------------------------------------------
registerDeclarativeAlgorithm({
  id: 'merge-trees',
  name: '合并二叉树',
  category: 'tree',
  description: '合并两棵二叉树：对应重叠节点值相加，单边存在节点直接继承',
  icon: '🤝',
  difficulty: 1,
  levelOrder: 617,
  aliases: ['leetcode-617', 'merge-two-binary-trees'],
  learningGoal: '掌握双树同步遍历递归模型 (Simultaneous DFS) 与广度优先队列迭代合并两大工业范式',
  inputs: [
    {
      id: 'tree1',
      label: '树 1 层序数组',
      type: 'text',
      defaultValue: '1, 3, 2, 5',
      placeholder: '以逗号分隔，如 1, 3, 2, 5',
    },
    {
      id: 'tree2',
      label: '树 2 层序数组',
      type: 'text',
      defaultValue: '2, 1, 3, null, 4, null, 7',
      placeholder: '以逗号分隔，如 2, 1, 3, null, 4, null, 7',
    },
  ],
  presets: [
    {
      label: '经典案例 [1,3,2,5] + [2,1,3,null,4,null,7]',
      values: {
        tree1: '1, 3, 2, 5',
        tree2: '2, 1, 3, null, 4, null, 7',
      },
    },
    {
      label: '单节点与多层树 [1] + [1, 2, 3]',
      values: {
        tree1: '1',
        tree2: '1, 2, 3',
      },
    },
    {
      label: '互补左右斜树 [1,2,null,3] + [1,null,2,null,3]',
      values: {
        tree1: '1, 2, null, 3',
        tree2: '1, null, 2, null, 3',
      },
    },
    {
      label: '一侧为空树 [1, 2, 3] + []',
      values: {
        tree1: '1, 2, 3',
        tree2: '',
      },
    },
  ],
  metrics: [
    { id: 'metric-val1', label: '树 1 节点值', color: '#38bdf8' },
    { id: 'metric-val2', label: '树 2 节点值', color: '#c084fc' },
    { id: 'metric-sum', label: '合并计算和', color: '#facc15' },
    { id: 'metric-depth', label: '递归深度/对数', color: '#10b981' },
  ],
  legend: [
    { label: '树 1 焦点', color: '#38bdf8' },
    { label: '树 2 焦点', color: '#c084fc' },
    { label: '合并当前值', color: '#facc15' },
    { label: '合并完成', color: '#22c55e' },
  ],
  stages: [
    {
      id: 'stage-1-recursive',
      name: 'Stage 1: 递归 DFS 同步下潜',
      shortName: '递归 DFS',
      num: 1,
      timeBadge: 'O(min(M,N))',
      codeLanguages: MERGE_TREES_STAGE1_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const t1 = parseTreeInput(inputs.tree1, [1, 3, 2, 5]);
        const t2 = parseTreeInput(inputs.tree2, [2, 1, 3, null, 4, null, 7]);
        return buildMergeTreesDfsSteps(t1, t2).map((s) => ({
          ...s,
          metrics: {
            'metric-val1': s.val1 !== null ? String(s.val1) : '-',
            'metric-val2': s.val2 !== null ? String(s.val2) : '-',
            'metric-sum': s.sum !== null ? String(s.sum) : '-',
            'metric-depth': String(s.depth),
          },
        }));
      },
      renderCanvas: (container: HTMLElement, step: MergeTreesStep) => renderMergeTreesCanvas(container, step),
      auxiliaryVisual: {
        title: '节点推导与推演动态',
        render: (container: HTMLElement, step: MergeTreesStep) => renderMergeTreesCard2(container, step),
      },
    },
    {
      id: 'stage-2-queue-bfs',
      name: 'Stage 2: 迭代 BFS 队列同步合并',
      shortName: '迭代 BFS 队列',
      num: 2,
      timeBadge: 'O(min(M,N))',
      codeLanguages: MERGE_TREES_STAGE2_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const t1 = parseTreeInput(inputs.tree1, [1, 3, 2, 5]);
        const t2 = parseTreeInput(inputs.tree2, [2, 1, 3, null, 4, null, 7]);
        return buildMergeTreesBfsSteps(t1, t2).map((s) => ({
          ...s,
          metrics: {
            'metric-val1': s.val1 !== null ? String(s.val1) : '-',
            'metric-val2': s.val2 !== null ? String(s.val2) : '-',
            'metric-sum': s.sum !== null ? String(s.sum) : '-',
            'metric-depth': String(s.queueState?.length ?? 0),
          },
        }));
      },
      renderCanvas: (container: HTMLElement, step: MergeTreesStep) => renderMergeTreesCanvas(container, step),
      auxiliaryVisual: {
        title: '节点推导与队列状态',
        render: (container: HTMLElement, step: MergeTreesStep) => renderMergeTreesCard2(container, step),
      },
    },
  ],
  problemHtml: MERGE_TREES_PROBLEM_HTML,
  analysisHtml: MERGE_TREES_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const t1 = parseTreeInput(inputs.tree1, [1, 3, 2, 5]);
    const t2 = parseTreeInput(inputs.tree2, [2, 1, 3, null, 4, null, 7]);
    return buildMergeTreesDfsSteps(t1, t2).map((s) => ({
      ...s,
      metrics: {
        'metric-val1': s.val1 !== null ? String(s.val1) : '-',
        'metric-val2': s.val2 !== null ? String(s.val2) : '-',
        'metric-sum': s.sum !== null ? String(s.sum) : '-',
        'metric-depth': String(s.depth),
      },
    }));
  },
  renderCanvas: (container, step) => renderMergeTreesCanvas(container, step as MergeTreesStep),
});
