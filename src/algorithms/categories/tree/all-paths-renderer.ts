/**
 * LeetCode 257: 二叉树的所有路径 (Binary Tree Paths)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * 核心多阶段演化体系:
 *   Stage 1: 经典显式回溯 DFS 递归与路径栈 (Backtracking DFS with Path Stack)
 *   Stage 2: 纯函数递归与不可变字符串传递 (Pure Functional DFS)
 *   Stage 3: 广度优先搜索双队列层序遍历 (BFS Double Queue Level Order)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { parseTreeArray } from '../../../core/input-primitives';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  ALL_PATHS_STAGE1_CODES,
  ALL_PATHS_STAGE1_LINES,
  ALL_PATHS_STAGE2_CODES,
  ALL_PATHS_STAGE2_LINES,
  ALL_PATHS_STAGE3_CODES,
  ALL_PATHS_STAGE3_LINES,
} from './all-paths-stage-codes';
import {
  ALL_PATHS_PROBLEM_HTML,
  ALL_PATHS_ANALYSIS_HTML,
} from './all-paths-problem-content';

// =========================================================================
// 步骤状态契约 (Step Contract)
// =========================================================================
export interface AllPathsStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  path: number[];
  allPaths: string[];
  currentPathStr?: string;
  message: string;
  log: string;
  decision: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };
  stageId?: string;
  highlightedNodes?: number[];
  secondaryHighlightedNodes?: number[];
  visitedNodes?: number[];
  nodeQueueState?: number[];
  pathQueueState?: string[];
}

// =========================================================================
// Stage 1 步骤生成器: 回溯法 DFS 递归与显式路径栈 (Backtracking DFS)
// =========================================================================
export function buildAllPathsStage1BacktrackSteps(root: TreeNode | null): AllPathsStep[] {
  const steps: AllPathsStep[] = [];
  const lines = ALL_PATHS_STAGE1_LINES;
  const path: number[] = [];
  const allPaths: string[] = [];

  // 空树特判 (3 步合规)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '算法启动：空树特判',
      message: '传入二叉树根节点为空 (null)，启动递归基准条件检验。',
      log: 'binaryTreePaths(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '当前路径': '—', '已收集路径数': 0, cur: '-', depth: '0', path: '—', result: '0' },
      statusBadge: { text: '空树: 0 路径', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '空节点递归基准：返回空列表 []',
      message: 'if (root == null) return paths。',
      log: 'root == null -> return []',
      codeLine: lines.baseNull,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '当前路径': '—', '已收集路径数': 0, cur: '-', depth: '0', path: '—', result: '0' },
      statusBadge: { text: '基准退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '计算完成：空树路径数为 0',
      message: '空树不存在任何根到叶子路径，返回空列表。',
      log: 'return []',
      codeLine: lines.returnPaths,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '已收集路径数': 0, cur: '-', depth: '0', path: '—', result: '0' },
      statusBadge: { text: '完成: 0 条路径', type: 'success' },
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    path: [],
    allPaths: [],
    decision: `算法启动：准备从根节点 Node(${root.val}) 开始回溯收集路径`,
    message: '二叉树所有路径：采用回溯法深度优先搜索，维护 path 动态栈，沿途 push，返回时 pop。',
    log: `binaryTreePaths(root: ${root.val})`,
    codeLine: lines.entry,
    stageId: 'stage-1',
    metrics: { '当前节点': `Node(${root.val})`, '当前路径': '—', '已收集路径数': 0, cur: String(root.val), depth: '0', path: '—', result: '0' },
    statusBadge: { text: '开始回溯', type: 'info' },
  });

  // Step 1: 初始化路径栈
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    path: [],
    allPaths: [],
    decision: '初始化空路径栈 path = [] 和结果列表 paths = []',
    message: 'List<Integer> path = new ArrayList<>()；List<String> paths = new ArrayList<>()。',
    log: 'init path = [], paths = []',
    codeLine: lines.initPath,
    stageId: 'stage-1',
    metrics: { '当前节点': `Node(${root.val})`, '当前路径': '—', '已收集路径数': 0, cur: String(root.val), depth: '0', path: '—', result: '0' },
    statusBadge: { text: '初始化路径栈', type: 'info' },
  });

  function dfs(node: TreeNode, depth: number): void {
    // 做出选择：当前节点入栈
    path.push(node.val);
    const pathStr = path.join('->');

    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      path: [...path],
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...path],
      decision: `📥 访问节点 Node(${node.val})，加入当前路径栈: [${path.join(', ')}]`,
      message: `执行 path.add(${node.val})，当前深入深度 ${depth}，路径当前前缀: ${pathStr}。`,
      log: `dfs(node=${node.val}): path.add(${node.val}) -> ${pathStr}`,
      codeLine: lines.addNode,
      stageId: 'stage-1',
      metrics: {
        '当前节点': `Node(${node.val})`,
        '当前路径': pathStr,
        '当前深度': depth,
        '已收集路径数': allPaths.length,
        cur: String(node.val),
        depth: String(depth),
        path: pathStr,
        result: String(allPaths.length),
      },
      statusBadge: { text: `深入: Node(${node.val})`, type: 'info' },
    });

    // 检查是否为叶子节点
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      path: [...path],
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...path],
      decision: `检查节点 Node(${node.val}) 是否为叶子节点 (左右孩子皆空)`,
      message: `判断 node.left == null && node.right == null：左孩子=${node.left ? node.left.val : 'null'}，右孩子=${node.right ? node.right.val : 'null'}。`,
      log: `checkLeaf(node=${node.val}): left=${node.left ? node.left.val : 'null'}, right=${node.right ? node.right.val : 'null'}`,
      codeLine: lines.checkLeaf,
      stageId: 'stage-1',
      metrics: {
        '当前节点': `Node(${node.val})`,
        '当前路径': pathStr,
        '当前深度': depth,
        '已收集路径数': allPaths.length,
        cur: String(node.val),
        depth: String(depth),
        path: pathStr,
        result: String(allPaths.length),
      },
      statusBadge: { text: !node.left && !node.right ? '命中叶子！' : '内部节点', type: !node.left && !node.right ? 'success' : 'info' },
    });

    if (!node.left && !node.right) {
      allPaths.push(pathStr);

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        path: [...path],
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...path],
        decision: `🎉 命中叶子节点！收获完整根到叶路径: "${pathStr}"`,
        message: `叶子节点触发收获：格式化路径 "${pathStr}" 并加入 paths 结果列表。当前已收集 ${allPaths.length} 条有效路径！`,
        log: `harvest path: "${pathStr}" -> total paths = ${allPaths.length}`,
        codeLine: lines.harvestPath,
        stageId: 'stage-1',
        metrics: {
          '当前节点': `Node(${node.val})`,
          '当前路径': pathStr,
          '最新收获路径': pathStr,
          '已收集路径数': allPaths.length,
          cur: String(node.val),
          depth: String(depth),
          path: pathStr,
          result: String(allPaths.length),
        },
        statusBadge: { text: `收获路径 #${allPaths.length}`, type: 'success' },
      });
    }

    // 深入左子树
    if (node.left) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        path: [...path],
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...path],
        decision: `向左深入：准备递归访问左孩子 Node(${node.left.val})`,
        message: `node.left != null，调用 dfs(node.left, path, paths)。`,
        log: `recurse left: dfs(node=${node.left.val})`,
        codeLine: lines.recurseLeft,
        stageId: 'stage-1',
        metrics: {
          '当前节点': `Node(${node.val})`,
          '当前路径': pathStr,
          '下探分支': `左孩子 Node(${node.left.val})`,
          '已收集路径数': allPaths.length,
          cur: String(node.val),
          depth: String(depth),
          path: pathStr,
          result: String(allPaths.length),
        },
        statusBadge: { text: '下探左子树', type: 'info' },
      });
      dfs(node.left, depth + 1);
    }

    // 深入右子树
    if (node.right) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        path: [...path],
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...path],
        decision: `向右深入：准备递归访问右孩子 Node(${node.right.val})`,
        message: `node.right != null，调用 dfs(node.right, path, paths)。`,
        log: `recurse right: dfs(node=${node.right.val})`,
        codeLine: lines.recurseRight,
        stageId: 'stage-1',
        metrics: {
          '当前节点': `Node(${node.val})`,
          '当前路径': pathStr,
          '下探分支': `右孩子 Node(${node.right.val})`,
          '已收集路径数': allPaths.length,
          cur: String(node.val),
          depth: String(depth),
          path: pathStr,
          result: String(allPaths.length),
        },
        statusBadge: { text: '下探右子树', type: 'info' },
      });
      dfs(node.right, depth + 1);
    }

    // 回溯：撤销当前节点选择
    const popped = path.pop();
    const remainingPathStr = path.length > 0 ? path.join('->') : '—';

    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      path: [...path],
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...path],
      decision: `↩️ 回溯现场：弹出节点 Node(${popped})，撤销选择恢复上层路径栈`,
      message: `执行 path.remove(path.size() - 1)，从路径末尾弹出 ${popped}。当前残留路径栈: [${path.join(', ')}]。`,
      log: `backtrack: path.pop(${popped}) -> remaining: ${remainingPathStr}`,
      codeLine: lines.backtrack,
      stageId: 'stage-1',
      metrics: {
        '当前节点': `Node(${node.val})`,
        '当前路径': remainingPathStr,
        '当前深度': depth,
        '已收集路径数': allPaths.length,
        cur: String(node.val),
        depth: String(depth),
        path: remainingPathStr,
        result: String(allPaths.length),
      },
      statusBadge: { text: `回溯: Node(${popped})`, type: 'warning' },
    });
  }

  dfs(root, 0);

  // 结算最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: null,
    depth: 0,
    path: [],
    allPaths: [...allPaths],
    decision: `🎉 全树回溯完成！共收集到 ${allPaths.length} 条根到叶子路径`,
    message: `全部递归分支回溯完毕，最终路径集合: [${allPaths.map((p) => `"${p}"`).join(', ')}]。`,
    log: `done: total ${allPaths.length} paths -> [${allPaths.join(', ')}]`,
    codeLine: lines.returnPaths,
    stageId: 'stage-1',
    metrics: {
      '当前节点': '—',
      '当前路径': '—',
      '所有路径': allPaths.join(' | '),
      '已收集路径数': allPaths.length,
      cur: '-',
      depth: '0',
      path: '—',
      result: String(allPaths.length),
    },
    statusBadge: { text: `完成: ${allPaths.length} 条路径`, type: 'success' },
  });

  return steps;
}

// =========================================================================
// Stage 2 步骤生成器: 纯函数递归与不可变字符串传递 (Pure Functional DFS)
// =========================================================================
export function buildAllPathsStage2FunctionalSteps(root: TreeNode | null): AllPathsStep[] {
  const steps: AllPathsStep[] = [];
  const lines = ALL_PATHS_STAGE2_LINES;
  const allPaths: string[] = [];

  // 空树特判 (3 步合规)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '算法启动：纯函数递归空树特判',
      message: '传入二叉树根节点为空 (null)，直接返回空路径列表。',
      log: 'root == null -> return []',
      codeLine: lines.entry,
      stageId: 'stage-2',
      metrics: { '当前节点': 'null', '当前不可变路径': '—', '已收集路径数': 0 },
      statusBadge: { text: '空树: 0 路径', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '空节点基准退出',
      message: 'if (root == null) return paths。',
      log: 'return []',
      codeLine: lines.baseNull,
      stageId: 'stage-2',
      metrics: { '当前节点': 'null', '当前不可变路径': '—', '已收集路径数': 0 },
      statusBadge: { text: '基准退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '计算完成：空树返回空列表',
      message: '纯函数递归执行结束，返回空列表。',
      log: 'return []',
      codeLine: lines.returnPaths,
      stageId: 'stage-2',
      metrics: { '当前节点': 'null', '已收集路径数': 0 },
      statusBadge: { text: '完成: 0 条路径', type: 'success' },
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    path: [root.val],
    currentPathStr: String(root.val),
    allPaths: [],
    decision: `算法启动：准备以不可变字符串 "${root.val}" 开启纯函数递归`,
    message: '纯函数不可变字符串传递：每次递归直接向下传递 path + "->" + child.val，函数栈帧天然隔离状态，无需显式回溯！',
    log: `dfs(root, path="${root.val}")`,
    codeLine: lines.entry,
    stageId: 'stage-2',
    metrics: { '当前节点': `Node(${root.val})`, '当前不可变路径': String(root.val), '已收集路径数': 0 },
    statusBadge: { text: '纯函数递归', type: 'info' },
  });

  // Step 1: 调用 dfs 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    path: [root.val],
    currentPathStr: String(root.val),
    allPaths: [],
    decision: `调用 dfs(root, "${root.val}", paths)`,
    message: `以根节点值 "${root.val}" 作为初始路径字符串，启动深度优先搜索。`,
    log: `call dfs(node=${root.val}, path="${root.val}")`,
    codeLine: lines.callDfs,
    stageId: 'stage-2',
    metrics: { '当前节点': `Node(${root.val})`, '当前不可变路径': String(root.val), '已收集路径数': 0 },
    statusBadge: { text: '进入递归', type: 'info' },
  });

  function dfs(node: TreeNode, pathStr: string, nodePath: number[], depth: number): void {
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      path: [...nodePath],
      currentPathStr: pathStr,
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...nodePath],
      decision: `📥 进入 dfs 栈帧: node=Node(${node.val}), path="${pathStr}"`,
      message: `当前参数栈帧隔离：路径字符串作为不可变值传递，无需共享变量。`,
      log: `enter dfs(node=${node.val}, path="${pathStr}")`,
      codeLine: lines.dfsEntry,
      stageId: 'stage-2',
      metrics: { '当前节点': `Node(${node.val})`, '当前不可变路径': pathStr, '当前深度': depth, '已收集路径数': allPaths.length },
      statusBadge: { text: `访问: Node(${node.val})`, type: 'info' },
    });

    // 检查叶子节点
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      path: [...nodePath],
      currentPathStr: pathStr,
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...nodePath],
      decision: `检查节点 Node(${node.val}) 是否为叶子`,
      message: `if (node.left == null && node.right == null)：左孩子=${node.left ? node.left.val : 'null'}，右孩子=${node.right ? node.right.val : 'null'}。`,
      log: `check leaf: node=${node.val}`,
      codeLine: lines.checkLeaf,
      stageId: 'stage-2',
      metrics: { '当前节点': `Node(${node.val})`, '当前不可变路径': pathStr, '当前深度': depth, '已收集路径数': allPaths.length },
      statusBadge: { text: !node.left && !node.right ? '命中叶子！' : '内部节点', type: !node.left && !node.right ? 'success' : 'info' },
    });

    if (!node.left && !node.right) {
      allPaths.push(pathStr);

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        path: [...nodePath],
        currentPathStr: pathStr,
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...nodePath],
        decision: `🎉 命中叶子节点！直接收获不可变字符串路径: "${pathStr}"`,
        message: `叶子节点：paths.add("${pathStr}")。无需回溯，直接 return 结束当前函数帧！`,
        log: `harvest immutable path "${pathStr}" -> total paths = ${allPaths.length}`,
        codeLine: lines.harvestPath,
        stageId: 'stage-2',
        metrics: { '当前节点': `Node(${node.val})`, '当前不可变路径': pathStr, '最新收获路径': pathStr, '已收集路径数': allPaths.length },
        statusBadge: { text: `收获路径 #${allPaths.length}`, type: 'success' },
      });

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        path: [...nodePath],
        currentPathStr: pathStr,
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...nodePath],
        decision: `叶子分支 return 返回上一层`,
        message: '叶子节点已无子树，直接 return 弹出递归帧。',
        log: `leaf return`,
        codeLine: lines.leafReturn,
        stageId: 'stage-2',
        metrics: { '当前节点': `Node(${node.val})`, '已收集路径数': allPaths.length },
        statusBadge: { text: '叶子返回', type: 'info' },
      });
      return;
    }

    // 左子树
    if (node.left) {
      const nextPath = `${pathStr}->${node.left.val}`;
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        path: [...nodePath],
        currentPathStr: pathStr,
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...nodePath],
        decision: `左子树存在，拼接新不可变串 "${nextPath}" 深入递归`,
        message: `调用 dfs(node.left, path + "->" + node.left.val)，新串通过实参传递，上层 path 保持不变。`,
        log: `recurse left: nextPath = "${nextPath}"`,
        codeLine: lines.recurseLeft,
        stageId: 'stage-2',
        metrics: { '当前节点': `Node(${node.val})`, '当前不可变路径': pathStr, '下探分支串': nextPath, '已收集路径数': allPaths.length },
        statusBadge: { text: '深入左子树', type: 'info' },
      });
      dfs(node.left, nextPath, [...nodePath, node.left.val], depth + 1);
    }

    // 右子树
    if (node.right) {
      const nextPath = `${pathStr}->${node.right.val}`;
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        path: [...nodePath],
        currentPathStr: pathStr,
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...nodePath],
        decision: `右子树存在，拼接新不可变串 "${nextPath}" 深入递归`,
        message: `调用 dfs(node.right, path + "->" + node.right.val)，无需回溯清理左分支残留。`,
        log: `recurse right: nextPath = "${nextPath}"`,
        codeLine: lines.recurseRight,
        stageId: 'stage-2',
        metrics: { '当前节点': `Node(${node.val})`, '当前不可变路径': pathStr, '下探分支串': nextPath, '已收集路径数': allPaths.length },
        statusBadge: { text: '深入右子树', type: 'info' },
      });
      dfs(node.right, nextPath, [...nodePath, node.right.val], depth + 1);
    }
  }

  dfs(root, String(root.val), [root.val], 0);

  // 结算最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: null,
    depth: 0,
    path: [],
    allPaths: [...allPaths],
    decision: `🎉 纯函数递归完成！共收集 ${allPaths.length} 条根到叶子路径`,
    message: `所有不可变路径参数已安全收敛，最终返回 paths: [${allPaths.map((p) => `"${p}"`).join(', ')}]。`,
    log: `Stage 2 done: [${allPaths.join(', ')}]`,
    codeLine: lines.returnPaths,
    stageId: 'stage-2',
    metrics: { '当前节点': '—', '所有路径': allPaths.join(' | '), '已收集路径数': allPaths.length },
    statusBadge: { text: `完成: ${allPaths.length} 条路径`, type: 'success' },
  });

  return steps;
}

// =========================================================================
// Stage 3 步骤生成器: 广度优先搜索双队列层序遍历 (BFS Double Queue Level Order)
// =========================================================================
export function buildAllPathsStage3BfsSteps(root: TreeNode | null): AllPathsStep[] {
  const steps: AllPathsStep[] = [];
  const lines = ALL_PATHS_STAGE3_LINES;
  const allPaths: string[] = [];

  // 空树特判 (3 步合规)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '算法启动：BFS 双队列空树特判',
      message: '传入二叉树根节点为空 (null)，无需初始化队列，直接返回空列表。',
      log: 'root == null -> return []',
      codeLine: lines.entry,
      stageId: 'stage-3',
      metrics: { '节点队列': '[]', '路径队列': '[]', '已收集路径数': 0 },
      statusBadge: { text: '空树: 0 路径', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '空节点基准退出',
      message: 'if (root == null) return paths。',
      log: 'return []',
      codeLine: lines.baseNull,
      stageId: 'stage-3',
      metrics: { '节点队列': '[]', '路径队列': '[]', '已收集路径数': 0 },
      statusBadge: { text: '基准退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '计算完成：返回空列表',
      message: 'BFS 遍历结束，返回空列表。',
      log: 'return []',
      codeLine: lines.returnPaths,
      stageId: 'stage-3',
      metrics: { '节点队列': '[]', '路径队列': '[]', '已收集路径数': 0 },
      statusBadge: { text: '完成: 0 条路径', type: 'success' },
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    path: [root.val],
    currentPathStr: String(root.val),
    allPaths: [],
    decision: `算法启动：准备初始化 BFS 双队列层序遍历`,
    message: '广度优先搜索双队列：采用 nodeQueue 维护遍历节点，pathQueue 同步维护到达该节点的累积路径字符串。',
    log: `BFS init for root: ${root.val}`,
    codeLine: lines.entry,
    stageId: 'stage-3',
    metrics: { '当前出队节点': `Node(${root.val})`, '节点队列深度': 0, '路径队列深度': 0, '已收集路径数': 0 },
    statusBadge: { text: 'BFS 初始化', type: 'info' },
  });

  // Step 1: 队列初始化与根节点入队
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    path: [root.val],
    currentPathStr: String(root.val),
    allPaths: [],
    decision: `初始化双队列并将根节点 Node(${root.val}) 及初始路径 "${root.val}" 入队`,
    message: 'nodeQueue.offer(root)；pathQueue.offer(String.valueOf(root.val))。',
    log: `nodeQueue.offer(${root.val}), pathQueue.offer("${root.val}")`,
    codeLine: lines.offerRoot,
    stageId: 'stage-3',
    nodeQueueState: [root.val],
    pathQueueState: [String(root.val)],
    metrics: { '当前出队节点': `Node(${root.val})`, '节点队列深度': 1, '路径队列深度': 1, '已收集路径数': 0 },
    statusBadge: { text: '根节点入队', type: 'info' },
  });

  const nodeQueue: { node: TreeNode; path: number[] }[] = [{ node: root, path: [root.val] }];
  const pathQueue: string[] = [String(root.val)];

  while (nodeQueue.length > 0) {
    const item = nodeQueue.shift()!;
    const curPathStr = pathQueue.shift()!;
    const curNode = item.node;
    const curPath = item.path;

    steps.push({
      tree: cloneStateDepTree(root),
      current: curNode.val,
      depth: curPath.length - 1,
      path: [...curPath],
      currentPathStr: curPathStr,
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...curPath],
      nodeQueueState: nodeQueue.map((q) => q.node.val),
      pathQueueState: [...pathQueue],
      decision: `节点 Node(${curNode.val}) 与路径 "${curPathStr}" 同步出队`,
      message: `TreeNode node = nodeQueue.poll()；String path = pathQueue.poll()。队列剩余 ${nodeQueue.length} 元素。`,
      log: `poll: node=${curNode.val}, path="${curPathStr}"`,
      codeLine: lines.pollNodeAndPath,
      stageId: 'stage-3',
      metrics: {
        '当前出队节点': `Node(${curNode.val})`,
        '当前出队路径': curPathStr,
        '剩余队列深度': nodeQueue.length,
        '已收集路径数': allPaths.length,
      },
      statusBadge: { text: `出队: Node(${curNode.val})`, type: 'info' },
    });

    // 检查是否为叶子节点
    if (!curNode.left && !curNode.right) {
      allPaths.push(curPathStr);

      steps.push({
        tree: cloneStateDepTree(root),
        current: curNode.val,
        depth: curPath.length - 1,
        path: [...curPath],
        currentPathStr: curPathStr,
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...curPath],
        nodeQueueState: nodeQueue.map((q) => q.node.val),
        pathQueueState: [...pathQueue],
        decision: `🎉 发现叶子节点 Node(${curNode.val})！收获路径 "${curPathStr}"`,
        message: `node.left == null && node.right == null 成立，将 "${curPathStr}" 加入 paths 结果集。`,
        log: `BFS harvested: "${curPathStr}" -> total paths = ${allPaths.length}`,
        codeLine: lines.harvestPath,
        stageId: 'stage-3',
        metrics: {
          '当前出队节点': `Node(${curNode.val})`,
          '当前出队路径': curPathStr,
          '最新收获路径': curPathStr,
          '已收集路径数': allPaths.length,
        },
        statusBadge: { text: `收获路径 #${allPaths.length}`, type: 'success' },
      });
    }

    // 处理左孩子
    if (curNode.left) {
      const nextLeftStr = `${curPathStr}->${curNode.left.val}`;
      nodeQueue.push({ node: curNode.left, path: [...curPath, curNode.left.val] });
      pathQueue.push(nextLeftStr);

      steps.push({
        tree: cloneStateDepTree(root),
        current: curNode.val,
        depth: curPath.length - 1,
        path: [...curPath],
        currentPathStr: curPathStr,
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...curPath],
        nodeQueueState: nodeQueue.map((q) => q.node.val),
        pathQueueState: [...pathQueue],
        decision: `左孩子 Node(${curNode.left.val}) 存在，推入节点队列，并推入路径 "${nextLeftStr}"`,
        message: `nodeQueue.offer(node.left)；pathQueue.offer(path + "->" + node.left.val)。`,
        log: `offer left: node=${curNode.left.val}, path="${nextLeftStr}"`,
        codeLine: lines.pushLeft,
        stageId: 'stage-3',
        metrics: {
          '当前出队节点': `Node(${curNode.val})`,
          '新入队左孩子': `Node(${curNode.left.val})`,
          '队列新深度': nodeQueue.length,
          '已收集路径数': allPaths.length,
        },
        statusBadge: { text: `入队: 左孩子 ${curNode.left.val}`, type: 'info' },
      });
    }

    // 处理右孩子
    if (curNode.right) {
      const nextRightStr = `${curPathStr}->${curNode.right.val}`;
      nodeQueue.push({ node: curNode.right, path: [...curPath, curNode.right.val] });
      pathQueue.push(nextRightStr);

      steps.push({
        tree: cloneStateDepTree(root),
        current: curNode.val,
        depth: curPath.length - 1,
        path: [...curPath],
        currentPathStr: curPathStr,
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...curPath],
        nodeQueueState: nodeQueue.map((q) => q.node.val),
        pathQueueState: [...pathQueue],
        decision: `右孩子 Node(${curNode.right.val}) 存在，推入节点队列，并推入路径 "${nextRightStr}"`,
        message: `nodeQueue.offer(node.right)；pathQueue.offer(path + "->" + node.right.val)。`,
        log: `offer right: node=${curNode.right.val}, path="${nextRightStr}"`,
        codeLine: lines.pushRight,
        stageId: 'stage-3',
        metrics: {
          '当前出队节点': `Node(${curNode.val})`,
          '新入队右孩子': `Node(${curNode.right.val})`,
          '队列新深度': nodeQueue.length,
          '已收集路径数': allPaths.length,
        },
        statusBadge: { text: `入队: 右孩子 ${curNode.right.val}`, type: 'info' },
      });
    }
  }

  // 结算最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: null,
    depth: 0,
    path: [],
    allPaths: [...allPaths],
    decision: `🎉 BFS 队列排空，遍历完成！共收获 ${allPaths.length} 条根到叶子路径`,
    message: `双队列层序遍历无递归栈消耗，顺利收获所有路径: [${allPaths.map((p) => `"${p}"`).join(', ')}]。`,
    log: `BFS done: ${allPaths.length} paths -> [${allPaths.join(', ')}]`,
    codeLine: lines.returnPaths,
    stageId: 'stage-3',
    metrics: { '当前出队节点': '—', '所有路径': allPaths.join(' | '), '已收集路径数': allPaths.length },
    statusBadge: { text: `完成: ${allPaths.length} 条路径`, type: 'success' },
  });

  return steps;
}

// =========================================================================
// 统一向下兼容入口 (100% Backward Compatible Step Generator)
// =========================================================================
export function buildAllPathsSteps(root: TreeNode | null): AllPathsStep[] {
  return buildAllPathsStage1BacktrackSteps(root);
}

// =========================================================================
// 表现层画板渲染器 (Presentation Canvas Renderer)
// =========================================================================
function renderAllPathsCanvas(container: HTMLElement, step: AllPathsStep): void {
  if (step.tree) {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: step.path ? step.path : [],
      primaryColor: '#f59e0b',
      secondaryColor: '#10b981',
      visitedColor: '#34d399',
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树 (Null)</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">空树无任何节点，路径集合为空</span>
      </div>
    `;
  }
}

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================
export const allPathsVisualizer = registerDeclarativeAlgorithm<AllPathsStep>({
  id: 'all-paths',
  name: '二叉树所有路径',
  category: 'tree',
  icon: '🛤️',
  difficulty: 1,
  levelOrder: 257,
  aliases: ['leetcode-257', 'binary-tree-paths'],
  learningGoal: '掌握回溯法收集路径的经典范式，对比显式栈回溯、纯函数不可变字符串传递与 BFS 双队列层序遍历',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(N)',
  inputs: [
    {
      id: 'tree',
      label: '二叉树层序数组',
      type: 'text',
      defaultValue: '1, 2, 3, null, 5',
      placeholder: '例如: 1, 2, 3, null, 5',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: [1, 2, 3, null, 5] (2条路径)',
      values: { tree: '1, 2, 3, null, 5' },
      description: '生成两条路径："1->2->5" 和 "1->3"',
    },
    {
      label: 'LeetCode 示例 2: 单节点 [1] (1条路径)',
      values: { tree: '1' },
      description: '根节点自身即为叶子，输出单一路径："1"',
    },
    {
      label: '满二叉树 3 层: [1, 2, 3, 4, 5, 6, 7] (4条路径)',
      values: { tree: '1, 2, 3, 4, 5, 6, 7' },
      description: '对称满树，包含 4 条各具深度的完整路径',
    },
    {
      label: '单链倾斜树: [1, 2, null, 3, null, 4] (1条深路径)',
      values: { tree: '1, 2, null, 3, null, 4' },
      description: '深度为 4 的单支倾斜树，输出 "1->2->3->4"',
    },
    {
      label: '空树用例: [] (0条路径)',
      values: { tree: '[]' },
      description: '空树特判，输出空列表 []',
    },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'result', label: '已收集路径数', color: '#10b981' },
  ],
  codeLanguages: ALL_PATHS_STAGE1_CODES,
  problemHtml: ALL_PATHS_PROBLEM_HTML,
  analysisHtml: ALL_PATHS_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 经典显式回溯 DFS 递归与路径栈 (Backtracking DFS)',
      shortName: '回溯路径栈',
      num: 1,
      codeLanguages: ALL_PATHS_STAGE1_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [1, 2, 3, null, 5]);
        const root = buildTreeFromArr(arr);
        return buildAllPathsStage1BacktrackSteps(root);
      },
      renderCanvas: (container, step) => renderAllPathsCanvas(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 纯函数递归与不可变字符串传递 (Pure Functional DFS)',
      shortName: '不可变串传递',
      num: 2,
      codeLanguages: ALL_PATHS_STAGE2_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [1, 2, 3, null, 5]);
        const root = buildTreeFromArr(arr);
        return buildAllPathsStage2FunctionalSteps(root);
      },
      renderCanvas: (container, step) => renderAllPathsCanvas(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 广度优先搜索双队列层序遍历 (BFS Double Queue)',
      shortName: 'BFS 双队列',
      num: 3,
      codeLanguages: ALL_PATHS_STAGE3_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [1, 2, 3, null, 5]);
        const root = buildTreeFromArr(arr);
        return buildAllPathsStage3BfsSteps(root);
      },
      renderCanvas: (container, step) => renderAllPathsCanvas(container, step),
    },
  ],

  generateSteps: (inputs) => {
    const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [1, 2, 3, null, 5]);
    const root = buildTreeFromArr(arr);
    return buildAllPathsStage1BacktrackSteps(root);
  },
  buildSteps: (inputs) => {
    const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [1, 2, 3, null, 5]);
    const root = buildTreeFromArr(arr);
    return buildAllPathsStage1BacktrackSteps(root);
  },
  renderCanvas: (container, step) => renderAllPathsCanvas(container, step),
});
