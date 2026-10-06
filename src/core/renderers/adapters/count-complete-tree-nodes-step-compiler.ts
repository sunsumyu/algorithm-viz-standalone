/**
 * 完全二叉树节点个数步骤编译器 (Count Complete Tree Nodes Step Compiler · LeetCode 222 / Class 036 Code06)
 * Matt Pocock 深模块设计：将 DFS 朴素遍历、左神 O((logN)^2) 满树公式剪枝与二分二进制寻路彻底下沉解耦
 */

import { HighlightTarget, StepBase } from '../../step-visualizer';
import { TreeNode, buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { parseTreeArray } from '../../input-primitives';
import {
  COUNT_NODES_STAGE1_LINES,
  COUNT_NODES_STAGE2_LINES,
  COUNT_NODES_STAGE3_LINES,
} from '../../../algorithms/categories/tree/tree-036-037/count-complete-tree-nodes-036-stage-codes';

// ============================================================
// 类型契约与状态定义 (Domain Step Contract)
// ============================================================
export interface CountNodes036Step extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  secondaryNodeId?: number | null;
  highlightedNodes?: number[];
  decision: string;
  action: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };

  /** Stage 1 DFS 递归状态 */
  dfsState?: {
    current: number;
    leftCount?: number;
    rightCount?: number;
    subTotal?: number;
    visitedSet: number[];
  };

  /** Stage 2 左神满树公式状态 */
  zuoshenState?: {
    totalHeight: number;
    currentLevel: number;
    rightSubtreeMostLeftDepth: number;
    isLeftFull: boolean;
    formula: string;
    accumulatedCount: number;
    pathNodes: number[];
  };

  /** Stage 3 二分寻路状态 */
  binarySearchState?: {
    treeHeight: number;
    low: number;
    high: number;
    mid: number;
    currentBitMask: number;
    currentNavPath: { nodeVal: number; direction: 'L' | 'R' }[];
    exists: boolean;
    lastFound: number;
  };

  extraData?: any;
}

/** 辅助解析输入并构建树 */
export function parseCountNodesInputs(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.tree ?? '1, 2, 3, 4, 5, 6';
  const arr = parseTreeArray(raw, [1, 2, 3, 4, 5, 6]);
  return buildTreeFromArr(arr);
}

export const parseAndBuild = parseCountNodesInputs;

// ============================================================
// Stage 1 Step Generator: 朴素递归 DFS (O(N))
// ============================================================
export function buildCountNodesDfsSteps(root: TreeNode | null): CountNodes036Step[] {
  const steps: CountNodes036Step[] = [];
  const L = COUNT_NODES_STAGE1_LINES;

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      decision: '空二叉树：节点总数为 0',
      action: 'base-case',
      message: '根节点为 null，整棵二叉树无任何节点，直接返回 0。',
      log: 'countNodes(null) -> 0',
      codeLine: L.baseCase,
      metrics: { '最终结果': 0, '算法时间复杂度': 'O(1)' },
      statusBadge: { text: '空树 (0 节点)', type: 'info' },
    });
    return steps;
  }

  const visitedNodes = new Set<number>();

  steps.push({
    tree: root,
    current: root.val,
    decision: '启动二叉树朴素 DFS 遍历计数',
    action: 'entry',
    message: '从根节点开始执行深度优先遍历（后序遍历），分别统计左右子树节点总数并汇总。时间复杂度严格为 O(N)。',
    log: `countNodes(root = ${root.val})`,
    codeLine: L.entry,
    metrics: { '遍历方式': '深度优先 (DFS)', '已访问节点数': 0, '当前子树': `节点 ${root.val}` },
    statusBadge: { text: 'DFS 启动', type: 'info' },
  });

  const dfs = (node: TreeNode): number => {
    visitedNodes.add(node.val);

    steps.push({
      tree: root,
      current: node.val,
      highlightedNodes: Array.from(visitedNodes),
      decision: `访问节点 ${node.val}，下潜探测子节点`,
      action: 'visit',
      message: `进入节点 ${node.val}，当前递归调用栈已访问 ${visitedNodes.size} 个节点，准备探测其左、右子树。`,
      log: `visit node: ${node.val}`,
      codeLine: L.entry,
      dfsState: { current: node.val, visitedSet: Array.from(visitedNodes) },
      metrics: { '当前节点': node.val, '已访问节点数': visitedNodes.size },
      statusBadge: { text: `访问节点 ${node.val}`, type: 'info' },
    });

    // 递归左子树
    let leftCount = 0;
    if (node.left) {
      steps.push({
        tree: root,
        current: node.val,
        secondaryNodeId: node.left.val,
        highlightedNodes: Array.from(visitedNodes),
        decision: `向左子树递归：进入左孩子 ${node.left.val}`,
        action: 'recurse-left',
        message: `从节点 ${node.val} 递归调用 countNodes(node.left: ${node.left.val})。`,
        log: `recurse left: ${node.val} -> ${node.left.val}`,
        codeLine: L.recurseLeft,
        metrics: { '当前处理': `进入左孩子 ${node.left.val}`, '已访问节点数': visitedNodes.size },
        statusBadge: { text: '向左递归', type: 'warning' },
      });
      leftCount = dfs(node.left);
    } else {
      steps.push({
        tree: root,
        current: node.val,
        highlightedNodes: Array.from(visitedNodes),
        decision: `节点 ${node.val} 的左孩子为空，左子树计数 0`,
        action: 'base-null',
        message: `节点 ${node.val} 无左孩子 (node.left == null)，左侧子树贡献 0 个节点。`,
        log: `node ${node.val}.left == null -> 0`,
        codeLine: L.baseCase,
        metrics: { '当前节点': node.val, '左子树计数': 0 },
        statusBadge: { text: '左子树空', type: 'info' },
      });
    }

    // 递归右子树
    let rightCount = 0;
    if (node.right) {
      steps.push({
        tree: root,
        current: node.val,
        secondaryNodeId: node.right.val,
        highlightedNodes: Array.from(visitedNodes),
        decision: `向右子树递归：进入右孩子 ${node.right.val}`,
        action: 'recurse-right',
        message: `从节点 ${node.val} 递归调用 countNodes(node.right: ${node.right.val})。`,
        log: `recurse right: ${node.val} -> ${node.right.val}`,
        codeLine: L.recurseRight,
        metrics: { '当前处理': `进入右孩子 ${node.right.val}`, '已访问节点数': visitedNodes.size },
        statusBadge: { text: '向右递归', type: 'warning' },
      });
      rightCount = dfs(node.right);
    } else {
      steps.push({
        tree: root,
        current: node.val,
        highlightedNodes: Array.from(visitedNodes),
        decision: `节点 ${node.val} 的右孩子为空，右子树计数 0`,
        action: 'base-null',
        message: `节点 ${node.val} 无右孩子 (node.right == null)，右侧子树贡献 0 个节点。`,
        log: `node ${node.val}.right == null -> 0`,
        codeLine: L.baseCase,
        metrics: { '当前节点': node.val, '右子树计数': 0 },
        statusBadge: { text: '右子树空', type: 'info' },
      });
    }

    // 汇总该节点子树
    const subTotal = leftCount + rightCount + 1;
    steps.push({
      tree: root,
      current: node.val,
      highlightedNodes: Array.from(visitedNodes),
      decision: `汇总节点 ${node.val} 的子树总数: ${leftCount} + ${rightCount} + 1 = ${subTotal}`,
      action: 'combine',
      message: `子树汇聚：节点 ${node.val} 的左子树有 ${leftCount} 个，右子树有 ${rightCount} 个，加上自身 1 个，共计 ${subTotal} 个节点。`,
      log: `node ${node.val}: left(${leftCount}) + right(${rightCount}) + 1 = ${subTotal}`,
      codeLine: L.combine,
      dfsState: { current: node.val, leftCount, rightCount, subTotal, visitedSet: Array.from(visitedNodes) },
      metrics: {
        '当前节点': node.val,
        '左子树计数': leftCount,
        '右子树计数': rightCount,
        '该子树合计': subTotal,
        '已访问总节点': visitedNodes.size,
      },
      statusBadge: { text: `子树共 ${subTotal} 个`, type: 'success' },
    });

    return subTotal;
  };

  const finalTotal = dfs(root);

  steps.push({
    tree: root,
    current: root.val,
    highlightedNodes: Array.from(visitedNodes),
    decision: `DFS 完整遍历完成，总节点数: ${finalTotal}`,
    action: 'done',
    message: `🎉 朴素深度优先遍历圆满完成！整树共包含 ${finalTotal} 个节点。每个节点均被精确访问 1 次，时间复杂度严格 O(N)。`,
    log: `return final total = ${finalTotal}`,
    codeLine: L.combine,
    dfsState: { current: root.val, subTotal: finalTotal, visitedSet: Array.from(visitedNodes) },
    metrics: { '最终结果': finalTotal, '遍历节点总数': visitedNodes.size, '算法时间复杂度': 'O(N)' },
    statusBadge: { text: `计算完成 (${finalTotal} 节点)`, type: 'success' },
  });

  return steps;
}

// ============================================================
// Stage 2 Step Generator: 左神二分子树定界剪枝 (O((log N)^2))
// ============================================================
export function buildCountNodesZuoshenSteps(root: TreeNode | null): CountNodes036Step[] {
  const steps: CountNodes036Step[] = [];
  const L = COUNT_NODES_STAGE2_LINES;

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      decision: '空二叉树：节点总数为 0',
      action: 'base-case',
      message: '根节点为 null，整树无任何节点，直接返回 0。',
      log: 'countNodes(null) -> 0',
      codeLine: L.entry,
      metrics: { '最终结果': 0, '算法时间复杂度': 'O(1)' },
      statusBadge: { text: '空树 (0 节点)', type: 'info' },
    });
    return steps;
  }

  // 1. 算法启动
  steps.push({
    tree: root,
    current: root.val,
    decision: '启动左神 O((logN)^2) 满二叉树性质节点计数',
    action: 'entry',
    message: '左神 Class 036 核心招牌：利用完全二叉树左右两棵子树中必有一棵为满二叉树的铁律，通过 2^k 满树公式直接计入，递归只进另一侧！',
    log: `countNodes(root = ${root.val})`,
    codeLine: L.entry,
    metrics: { '算法时间复杂度': 'O((log N)^2)', '普通遍历复杂度': 'O(N)' },
    statusBadge: { text: '左神剪枝启动', type: 'info' },
  });

  // 2. 沿最左边界一路下潜测量总树高 h
  let h = 0;
  let cur: TreeNode | null = root;
  const leftPath: number[] = [];

  while (cur) {
    h++;
    leftPath.push(cur.val);
    steps.push({
      tree: root,
      current: cur.val,
      highlightedNodes: [...leftPath],
      decision: `测定总树高：沿最左边界深入至节点 ${cur.val} (深度 ${h})`,
      action: 'measure-height',
      message: `调用 mostLeft(root: ${root.val}, 1)：沿整棵树的最左分支持续下潜，探得节点 ${cur.val}，当前深度达 ${h}。`,
      log: `mostLeft(root, 1): cur = ${cur.val}, depth = ${h}`,
      codeLine: L.calcHeight,
      metrics: { '当前探测节点': cur.val, '当前深度': h, '总树高 h': h },
      statusBadge: { text: `探测深度: ${h}`, type: 'info' },
    });
    cur = cur.left ?? null;
  }

  steps.push({
    tree: root,
    current: leftPath[leftPath.length - 1],
    highlightedNodes: [...leftPath],
    decision: `最左分支触底！确定整棵完全二叉树的总树高 h = ${h}`,
    action: 'height-confirmed',
    message: `深入叶子节点 ${leftPath[leftPath.length - 1]}，其左孩子为空触底！确定整棵完全二叉树的全局总树高为 h = ${h}。`,
    log: `confirmed total tree height h = ${h}`,
    codeLine: L.calcHeight,
    metrics: { '总树高 h': h, '触底叶子': leftPath[leftPath.length - 1] },
    statusBadge: { text: `总树高 h = ${h}`, type: 'success' },
  });

  // 辅助函数：求 node 的最左深度
  const getMostLeftDepth = (node: TreeNode | null, startLevel: number): { depth: number; path: number[] } => {
    let depth = startLevel - 1;
    let n = node;
    const path: number[] = [];
    while (n) {
      depth++;
      path.push(n.val);
      n = n.left ?? null;
    }
    return { depth: Math.max(startLevel - 1, depth), path };
  };

  // 3. 递归二分求解 count(node, level, h)
  let totalConfirmedNodes = 0;

  const count = (node: TreeNode, level: number): number => {
    steps.push({
      tree: root,
      current: node.val,
      decision: `递归考察节点 ${node.val} (位于第 ${level} 层, 全局树高 h = ${h})`,
      action: 'count-entry',
      message: `进入 count(node: ${node.val}, level: ${level}, h: ${h})，探查以 ${node.val} 为根的子树节点数。`,
      log: `count(node: ${node.val}, level: ${level}, h: ${h})`,
      codeLine: L.countEntry,
      zuoshenState: {
        totalHeight: h,
        currentLevel: level,
        rightSubtreeMostLeftDepth: level,
        isLeftFull: false,
        formula: '探测右子树最左深度...',
        accumulatedCount: totalConfirmedNodes,
        pathNodes: [node.val],
      },
      metrics: { '当前处理节点': node.val, '当前层级': level, '全局总树高 h': h },
      statusBadge: { text: `处理节点 ${node.val}`, type: 'info' },
    });

    // 边界条件：到达底层叶子
    if (level === h) {
      steps.push({
        tree: root,
        current: node.val,
        decision: `到达整树底层叶子节点 ${node.val} (level == h: ${h})，直接返回 1`,
        action: 'base-leaf',
        message: `当前节点 ${node.val} 已经位于最底层 (第 ${level} 层)，由于整树高度为 ${h}，该节点必定为叶子节点，直接返回 1 个节点。`,
        log: `node ${node.val} is at bottom level ${h} -> return 1`,
        codeLine: L.baseCase,
        zuoshenState: {
          totalHeight: h,
          currentLevel: level,
          rightSubtreeMostLeftDepth: level,
          isLeftFull: true,
          formula: '叶子节点 = 1',
          accumulatedCount: totalConfirmedNodes + 1,
          pathNodes: [node.val],
        },
        metrics: { '当前节点': node.val, '当前层级': level, '总树高 h': h, '返回节点数': 1 },
        statusBadge: { text: '叶子返回 1', type: 'success' },
      });
      return 1;
    }

    // 探测右子树的最左分支深度
    const { depth: rightDepth, path: rightProbePath } = getMostLeftDepth(node.right ?? null, level + 1);

    steps.push({
      tree: root,
      current: node.val,
      secondaryNodeId: node.right?.val ?? null,
      highlightedNodes: rightProbePath,
      decision: `探测右子树最左深度：起点右孩子 ${node.right?.val ?? 'null'}，测得深度 ${rightDepth}`,
      action: 'probe-right',
      message: `转入右子树调用 mostLeft(node.right: ${node.right?.val ?? 'null'}, ${level + 1})。探测路径: [${rightProbePath.join(' -> ')}]，测得最左深度为 ${rightDepth} (总树高 h = ${h})。`,
      log: `probe right: node.right = ${node.right?.val ?? 'null'}, mostLeft = ${rightDepth}`,
      codeLine: L.probeRight,
      zuoshenState: {
        totalHeight: h,
        currentLevel: level,
        rightSubtreeMostLeftDepth: rightDepth,
        isLeftFull: rightDepth === h,
        formula: rightDepth === h ? `mostLeft == h (${h})` : `mostLeft (${rightDepth}) < h (${h})`,
        accumulatedCount: totalConfirmedNodes,
        pathNodes: rightProbePath,
      },
      metrics: {
        '当前节点': node.val,
        '右子树最左深度': rightDepth,
        '全局总树高 h': h,
        '判定结论': rightDepth === h ? '左子树必为满树' : '右子树必为满树',
      },
      statusBadge: { text: `右深: ${rightDepth} (h=${h})`, type: rightDepth === h ? 'success' : 'warning' },
    });

    if (rightDepth === h) {
      // 深度等于 h: 说明左子树是满二叉树，高为 h - level
      const fullCount = 1 << (h - level);
      totalConfirmedNodes += fullCount;

      steps.push({
        tree: root,
        current: node.val,
        secondaryNodeId: node.left?.val ?? null,
        decision: `右子树最左扎到底层 h=${h}！左子树必为满树，公式直接计入 1 << (${h} - ${level}) = ${fullCount} 个节点`,
        action: 'left-full',
        message: `由于右子树的最左叶子成功扎到了整树底层 (${h})，根据完全二叉树紧凑排列的性质，以 ${node.left?.val} 为根的左子树必为满二叉树！节点数（含根节点 ${node.val} 和整棵左子树）直接由公式 2^(${h} - ${level}) = ${fullCount} 算得！无需递归进入左子树任何节点，转向右子树递归。`,
        log: `left subtree is FULL: 1 << (${h} - ${level}) = ${fullCount}, recurse right: node ${node.right?.val}`,
        codeLine: L.leftFullSubtree,
        zuoshenState: {
          totalHeight: h,
          currentLevel: level,
          rightSubtreeMostLeftDepth: rightDepth,
          isLeftFull: true,
          formula: `1 << (${h} - ${level}) = ${fullCount}`,
          accumulatedCount: totalConfirmedNodes,
          pathNodes: rightProbePath,
        },
        metrics: {
          '左满树+根节点': fullCount,
          '累计确认节点': totalConfirmedNodes,
          '下一步递归': `右子树 ${node.right?.val ?? 'null'}`,
        },
        statusBadge: { text: `左满树累加 ${fullCount}`, type: 'success' },
      });

      const rightPart = node.right ? count(node.right, level + 1) : 0;
      return fullCount + rightPart;
    } else {
      // 深度小于 h: 说明右子树是满二叉树，高为 h - level - 1
      const fullCount = 1 << (h - level - 1);
      totalConfirmedNodes += fullCount;

      steps.push({
        tree: root,
        current: node.val,
        secondaryNodeId: node.right?.val ?? null,
        decision: `右子树最左深度为 ${rightDepth} < ${h}，无法触底！右子树必为满树，公式直接计入 1 << (${h} - ${level} - 1) = ${fullCount} 个节点`,
        action: 'right-full',
        message: `右子树最左深度仅为 ${rightDepth}，未到达底层 ${h}。这意味着底层断层空隙发生在左子树内部，以 ${node.right?.val ?? 'null'} 为根的右子树必为少一层的满二叉树！节点数（含根节点 ${node.val} 和整棵右子树）由公式 2^(${h} - ${level} - 1) = ${fullCount} 算得！无需递归进入右子树任何节点，转向左子树递归。`,
        log: `right subtree is FULL: 1 << (${h} - ${level} - 1) = ${fullCount}, recurse left: node ${node.left?.val}`,
        codeLine: L.rightFullSubtree,
        zuoshenState: {
          totalHeight: h,
          currentLevel: level,
          rightSubtreeMostLeftDepth: rightDepth,
          isLeftFull: false,
          formula: `1 << (${h} - ${level} - 1) = ${fullCount}`,
          accumulatedCount: totalConfirmedNodes,
          pathNodes: rightProbePath,
        },
        metrics: {
          '右满树+根节点': fullCount,
          '累计确认节点': totalConfirmedNodes,
          '下一步递归': `左子树 ${node.left?.val ?? 'null'}`,
        },
        statusBadge: { text: `右满树累加 ${fullCount}`, type: 'success' },
      });

      const leftPart = node.left ? count(node.left, level + 1) : 0;
      return fullCount + leftPart;
    }
  };

  const finalResult = count(root, 1);

  steps.push({
    tree: root,
    current: root.val,
    decision: `左神 O((logN)^2) 剪枝递归求解完成，最终节点总数: ${finalResult}`,
    action: 'done',
    message: `🎉 完全二叉树节点计算圆满完成！整棵树通过巧妙探测右子树最左深度，配合 2^k 满树公式剪枝，完全跳过了一半以上的子树遍历，在 O((logN)^2) 极致复杂度下精确得出答案: ${finalResult}。`,
    log: `return totalNodes = ${finalResult}`,
    codeLine: L.finish,
    zuoshenState: {
      totalHeight: h,
      currentLevel: 1,
      rightSubtreeMostLeftDepth: h,
      isLeftFull: true,
      formula: `最终节点总数 = ${finalResult}`,
      accumulatedCount: finalResult,
      pathNodes: [root.val],
    },
    metrics: { '最终结果': finalResult, '总树高 h': h, '算法时间复杂度': 'O((log N)^2)' },
    statusBadge: { text: `计算完成 (${finalResult} 节点)`, type: 'success' },
  });

  return steps;
}

// ============================================================
// Stage 3 Step Generator: 二分叶子编号 + 二进制寻路探测 (O((log N)^2))
// ============================================================
export function buildCountNodesBinarySearchSteps(root: TreeNode | null): CountNodes036Step[] {
  const steps: CountNodes036Step[] = [];
  const L = COUNT_NODES_STAGE3_LINES;

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      decision: '空二叉树：节点总数为 0',
      action: 'base-case',
      message: '根节点为 null，整树无任何节点，直接返回 0。',
      log: 'countNodes(null) -> 0',
      codeLine: L.entry,
      metrics: { '最终结果': 0, '算法时间复杂度': 'O(1)' },
      statusBadge: { text: '空树 (0 节点)', type: 'info' },
    });
    return steps;
  }

  // 1. 测量总树高
  let h = 0;
  let cur: TreeNode | null = root;
  const leftPath: number[] = [];

  while (cur) {
    h++;
    leftPath.push(cur.val);
    cur = cur.left ?? null;
  }

  steps.push({
    tree: root,
    current: root.val,
    highlightedNodes: leftPath,
    decision: `一路向左测量总树高 h = ${h}`,
    action: 'measure-height',
    message: `沿最左路径下潜测定完全二叉树的全局树高 h = ${h}。完全二叉树除最后一层外是全满的，最后一层节点序号在 [2^(h-1), 2^h - 1] 区间！`,
    log: `measured total tree height h = ${h}`,
    codeLine: L.calcHeight,
    metrics: { '总树高 h': h, '底层节点范围': `[${1 << (h - 1)}, ${(1 << h) - 1}]` },
    statusBadge: { text: `总树高 h = ${h}`, type: 'info' },
  });

  if (h <= 1) {
    steps.push({
      tree: root,
      current: root.val,
      decision: `树高 h = ${h} <= 1，直接返回 ${h}`,
      action: 'done',
      message: `树高只有 ${h}，直接得出节点数为 ${h}。`,
      log: `return ${h}`,
      codeLine: L.entry,
      metrics: { '最终结果': h },
      statusBadge: { text: `结果: ${h}`, type: 'success' },
    });
    return steps;
  }

  // 2. 初始化二分查找区间
  let low = 1 << (h - 1);
  let high = (1 << h) - 1;

  steps.push({
    tree: root,
    current: root.val,
    decision: `初始化底层二分探测范围 [${low}, ${high}]`,
    action: 'init-range',
    message: `完全二叉树第 ${h} 层的满节点范围是 [${low}, ${high}]。我们将在这个区间二分查找最后一个存在的节点编号！二分次数为 log(2^(h-1)) = h-1 次。`,
    log: `binary search range: low = ${low}, high = ${high}`,
    codeLine: L.initRange,
    binarySearchState: {
      treeHeight: h,
      low,
      high,
      mid: low + Math.floor((high - low) / 2),
      currentBitMask: 1 << (h - 2),
      currentNavPath: [],
      exists: true,
      lastFound: low,
    },
    metrics: { '二分下界 low': low, '二分上界 high': high, '总树高 h': h },
    statusBadge: { text: `二分范围 [${low}, ${high}]`, type: 'info' },
  });

  // 3. 二分循环
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);

    steps.push({
      tree: root,
      current: root.val,
      decision: `二分尝试检验编号 mid = ${mid} (二进制: 0b${mid.toString(2)}) 是否存在？`,
      action: 'calc-mid',
      message: `计算二分中点 mid = ${low} + (${high} - ${low}) / 2 = ${mid}。准备利用 mid 的二进制位自顶向下寻路探测！`,
      log: `probe mid = ${mid} (0b${mid.toString(2)})`,
      codeLine: L.calcMid,
      binarySearchState: {
        treeHeight: h,
        low,
        high,
        mid,
        currentBitMask: 1 << (h - 2),
        currentNavPath: [],
        exists: false,
        lastFound: high,
      },
      metrics: { '当前测试 mid': mid, '二进制表示': `0b${mid.toString(2)}`, '搜索区间': `[${low}, ${high}]` },
      statusBadge: { text: `探测 mid=${mid}`, type: 'warning' },
    });

    // 寻路探测 exists(root, h, mid)
    let bits = 1 << (h - 2);
    let node: TreeNode | null = root;
    const navPath: { nodeVal: number; direction: 'L' | 'R' }[] = [];
    const pathNodeIds: number[] = [root.val];

    while (node && bits > 0) {
      const dir: 'L' | 'R' = (mid & bits) !== 0 ? 'R' : 'L';
      navPath.push({ nodeVal: node.val, direction: dir });
      const nextNode: TreeNode | null = dir === 'R' ? (node.right ?? null) : (node.left ?? null);
      if (nextNode) pathNodeIds.push(nextNode.val);

      steps.push({
        tree: root,
        current: node.val,
        secondaryNodeId: nextNode?.val ?? null,
        highlightedNodes: [...pathNodeIds],
        decision: `二进制位 mask=0b${bits.toString(2)}: (mid & mask) = ${(mid & bits) !== 0 ? '1 (向右)' : '0 (向左)'}`,
        action: 'bit-step',
        message: `序号 ${mid} (0b${mid.toString(2)}) 在权值 ${bits} 处的二进制位为 ${(mid & bits) !== 0 ? '1' : '0'}。从节点 ${node.val} 向${dir === 'R' ? '右孩子' : '左孩子'}移动。`,
        log: `mid=${mid}, bit=${bits} -> direction ${dir} -> ${nextNode?.val ?? 'null'}`,
        codeLine: L.bitPath,
        binarySearchState: {
          treeHeight: h,
          low,
          high,
          mid,
          currentBitMask: bits,
          currentNavPath: [...navPath],
          exists: nextNode !== null,
          lastFound: high,
        },
        metrics: {
          '当前节点': node.val,
          '测试序号': mid,
          '当前权值 bit': bits,
          '分支方向': dir === 'R' ? '右孩子 (bit=1)' : '左孩子 (bit=0)',
        },
        statusBadge: { text: `寻路: ${dir}`, type: 'info' },
      });

      node = nextNode;
      bits >>= 1;
    }

    const exists = node !== null;

    if (exists) {
      steps.push({
        tree: root,
        current: node?.val ?? mid,
        highlightedNodes: [...pathNodeIds],
        decision: `编号 mid = ${mid} 节点存在！说明底层叶子至少延伸至此，向右收缩 low = ${mid + 1}`,
        action: 'found-node',
        message: `成功沿路径到达底层叶子节点 (序号 ${mid})！该节点真实存在，说明最后的叶子编号必定 >= ${mid}。收缩搜索区间至右侧：low = ${mid + 1}。`,
        log: `node ${mid} EXISTS -> low = ${mid + 1}`,
        codeLine: L.moveRight,
        binarySearchState: {
          treeHeight: h,
          low: mid + 1,
          high,
          mid,
          currentBitMask: 0,
          currentNavPath: [...navPath],
          exists: true,
          lastFound: mid,
        },
        metrics: { '探测序号': mid, '存在判定': '真实存在', '新区间 low': mid + 1 },
        statusBadge: { text: `序号 ${mid} 存在`, type: 'success' },
      });
      low = mid + 1;
    } else {
      steps.push({
        tree: root,
        current: pathNodeIds[pathNodeIds.length - 1],
        highlightedNodes: [...pathNodeIds],
        decision: `编号 mid = ${mid} 节点不存在 (遇 null 触底)！说明断层在此之前，向左收缩 high = ${mid - 1}`,
        action: 'miss-node',
        message: `沿路径寻路触空 (null)！序号 ${mid} 的节点不存在，说明完全二叉树的底层断层空隙发生在 ${mid} 的左侧。收缩搜索区间至左侧：high = ${mid - 1}。`,
        log: `node ${mid} NOT EXISTS -> high = ${mid - 1}`,
        codeLine: L.moveLeft,
        binarySearchState: {
          treeHeight: h,
          low,
          high: mid - 1,
          mid,
          currentBitMask: 0,
          currentNavPath: [...navPath],
          exists: false,
          lastFound: high - 1,
        },
        metrics: { '探测序号': mid, '存在判定': '不存在(遇空)', '新区间 high': mid - 1 },
        statusBadge: { text: `序号 ${mid} 不存在`, type: 'warning' },
      });
      high = mid - 1;
    }
  }

  // 4. 收敛完成，high 即为最后一个存在的节点编号
  steps.push({
    tree: root,
    current: root.val,
    decision: `二分查找收敛完成！最终节点总数: high = ${high}`,
    action: 'done',
    message: `🎉 二分搜索区间成功收敛！最后一个真实存在的底层叶子节点编号为 ${high}，即整棵完全二叉树的节点总数为: ${high}。二分次数 O(log N)，每次寻路 O(log N)，总时间复杂度严格 O((log N)^2)！`,
    log: `return high = ${high}`,
    codeLine: L.finish,
    binarySearchState: {
      treeHeight: h,
      low,
      high,
      mid: high,
      currentBitMask: 0,
      currentNavPath: [],
      exists: true,
      lastFound: high,
    },
    metrics: { '最终结果': high, '总树高 h': h, '算法时间复杂度': 'O((log N)^2)' },
    statusBadge: { text: `二分完成 (${high} 节点)`, type: 'success' },
  });

  return steps;
}

/** Legacy 兼容包装函数 (保证 tree-036-037.test.ts 零退化通过) */
export function buildCountNodes036Steps(): CountNodes036Step[] {
  const root = parseAndBuild();
  return buildCountNodesZuoshenSteps(root);
}
