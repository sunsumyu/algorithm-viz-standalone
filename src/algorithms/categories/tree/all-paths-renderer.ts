/**
 * LeetCode 257: 二叉树的所有路径 (Binary Tree Paths)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * 设计模式抽象与设计原则:
 *   - 建造者模式 (Builder Pattern): 利用 RecursiveCallTraceBuilder 结构化构建回溯 DFS 推演树与状态快照
 *   - 适配器模式 (Adapter Pattern): TreeCanvasAdapter (Card 1 画布) + RecursiveCallTraceAdapter (Card 2 调用栈视图)
 *   - 单一职责与防腐隔离 (SRP): Card 1 画布与 Card 2 指标/推演栈彻底解耦，杜绝跨容器 DOM 污染与选择器穿透
 *   - 严格一行一步与零静默 (Strict One-Line-One-Step): 覆盖所有递归入口/判空/压栈/叶子收获/下探/回溯出栈帧
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
  RecursiveCallTraceAdapter,
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
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
  action?: string;
  phase?: string;
  callTrace?: RecursiveCallTraceSnapshot;
}

/** 收集树中所有有效节点值，支持全景高亮与收尾状态守卫 */
export function collectTreeValues(node: TreeNode | null): number[] {
  if (!node) return [];
  const result: number[] = [];
  function traverse(n: TreeNode | null) {
    if (!n) return;
    result.push(n.val);
    traverse(n.left);
    traverse(n.right);
  }
  traverse(node);
  return result;
}

// =========================================================================
// Stage 1 步骤生成器: 回溯法 DFS 递归与显式路径栈 (Backtracking DFS)
// =========================================================================
export function buildAllPathsStage1BacktrackSteps(root: TreeNode | null): AllPathsStep[] {
  const steps: AllPathsStep[] = [];
  const lines = ALL_PATHS_STAGE1_LINES;
  const trace = new RecursiveCallTraceBuilder();
  const path: number[] = [];
  const allPaths: string[] = [];

  // 空树特判 (3 步合规)
  if (!root) {
    trace.addHeader('binaryTreePaths(null)', 0, '<- 根调用特判');
    trace.addConditionHit('root == null √ 命中 -> return []', 0);
    trace.addReturnLeaf('return []', 0);
    trace.addFinalResult('最终判定: [] (空树返回空列表)', 0, undefined, '[]');

    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '算法启动：空树特判',
      action: 'entry',
      phase: 'init',
      message: '传入二叉树根节点为空 (null)，启动递归基准条件检验。',
      log: 'binaryTreePaths(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '当前路径': '—', '已收集路径数': 0, cur: '-', depth: '0', path: '—', result: '0' },
      statusBadge: { text: '空树: 0 路径', type: 'info' },
      callTrace: trace.snapshot(),
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '空节点递归基准：返回空列表 []',
      action: 'base-null',
      phase: 'check',
      message: 'if (root == null) return paths。',
      log: 'root == null -> return []',
      codeLine: lines.baseNull,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '当前路径': '—', '已收集路径数': 0, cur: '-', depth: '0', path: '—', result: '0' },
      statusBadge: { text: '基准退出', type: 'info' },
      callTrace: trace.snapshot(),
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      path: [],
      allPaths: [],
      decision: '计算完成：空树路径数为 0',
      action: 'done',
      phase: 'done',
      message: '空树不存在任何根到叶子路径，返回空列表。',
      log: 'return []',
      codeLine: lines.returnPaths,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '已收集路径数': 0, cur: '-', depth: '0', path: '—', result: '0' },
      statusBadge: { text: '完成: 0 条路径', type: 'success' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  // Step 0: 入口
  trace.addHeader(`binaryTreePaths(root: Node(${root.val}))`, 0, '<- 根调用开始');
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    path: [],
    allPaths: [],
    decision: `算法启动：准备从根节点 Node(${root.val}) 开始回溯收集路径`,
    action: 'entry',
    phase: 'init',
    message: '二叉树所有路径：采用回溯法深度优先搜索，维护 path 动态栈，沿途 push，返回时 pop。',
    log: `binaryTreePaths(root: ${root.val})`,
    codeLine: lines.entry,
    stageId: 'stage-1',
    metrics: { '当前节点': `Node(${root.val})`, '当前路径': '—', '已收集路径数': 0, cur: String(root.val), depth: '0', path: '—', result: '0' },
    statusBadge: { text: '开始回溯', type: 'info' },
    callTrace: trace.snapshot(),
  });

  // Step 1: 初始化路径栈
  trace.addConditionPass('初始化路径栈 path = [] 和结果集 paths = []', 0);
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    path: [],
    allPaths: [],
    decision: '初始化空路径栈 path = [] 和结果列表 paths = []',
    action: 'init-path',
    phase: 'init',
    message: 'List<Integer> path = new ArrayList<>()；List<String> paths = new ArrayList<>()。',
    log: 'init path = [], paths = []',
    codeLine: lines.initPath,
    stageId: 'stage-1',
    metrics: { '当前节点': `Node(${root.val})`, '当前路径': '—', '已收集路径数': 0, cur: String(root.val), depth: '0', path: '—', result: '0' },
    statusBadge: { text: '初始化路径栈', type: 'info' },
    callTrace: trace.snapshot(),
  });

  // Step 2: 启动 DFS 递归调用
  trace.addRecursePrep(`dfs(Node(${root.val}), path, paths)`, 0, '<- 启动根节点回溯 DFS');
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    path: [],
    allPaths: [],
    decision: `调用 dfs 辅助函数: dfs(root, path, paths)`,
    action: 'call-dfs',
    phase: 'call',
    message: '传入根节点与初始空路径列表，启动深度优先搜索与回溯。',
    log: `call dfs(node=${root.val})`,
    codeLine: lines.callDfs,
    stageId: 'stage-1',
    metrics: { '当前节点': `Node(${root.val})`, '当前路径': '—', '已收集路径数': 0, cur: String(root.val), depth: '0', path: '—', result: '0' },
    statusBadge: { text: '进入递归', type: 'info' },
    callTrace: trace.snapshot(),
  });

  function dfs(node: TreeNode, depth: number): void {
    // DFS 函数入口帧
    trace.addHeader(`dfs(Node(${node.val}), depth=${depth})`, depth, `<- 深入 Node(${node.val}) 递归帧`);
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      path: [...path],
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...path],
      decision: `📥 进入 dfs 递归函数帧: dfs(Node(${node.val}), depth=${depth})`,
      action: 'dfs-entry',
      phase: 'entry',
      message: `到达节点 Node(${node.val})，准备将其推入路径栈并探索子树。`,
      log: `enter dfs(node=${node.val}, depth=${depth})`,
      codeLine: lines.dfsEntry,
      stageId: 'stage-1',
      metrics: {
        '当前节点': `Node(${node.val})`,
        '当前路径': path.length > 0 ? path.join('->') : '—',
        '当前深度': depth,
        '已收集路径数': allPaths.length,
        cur: String(node.val),
        depth: String(depth),
        path: path.length > 0 ? path.join('->') : '—',
        result: String(allPaths.length),
      },
      statusBadge: { text: `进入 Node(${node.val})`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 做出选择：当前节点入栈
    path.push(node.val);
    const pathStr = path.join('->');
    trace.addConditionPass(`path.add(${node.val}) -> 路径栈: [${path.join(', ')}]`, depth);

    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      path: [...path],
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...path],
      decision: `📥 做出选择：访问节点 Node(${node.val})，加入当前路径栈: [${path.join(', ')}]`,
      action: 'add-node',
      phase: 'explore',
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
      callTrace: trace.snapshot(),
    });

    // 检查是否为叶子节点
    const isLeaf = !node.left && !node.right;
    if (isLeaf) {
      trace.addConditionHit(`node.left == null && node.right == null √ 判定为叶子节点！`, depth);
    } else {
      trace.addConditionPass(`node.left != null || node.right != null (内部节点继续探测)`, depth);
    }

    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      path: [...path],
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...path],
      decision: `检查节点 Node(${node.val}) 是否为叶子节点 (左右孩子皆空)`,
      action: 'check-leaf',
      phase: 'check',
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
      statusBadge: { text: isLeaf ? '命中叶子！' : '内部节点', type: isLeaf ? 'success' : 'info' },
      callTrace: trace.snapshot(),
    });

    if (isLeaf) {
      allPaths.push(pathStr);
      trace.addReturnLeaf(`🎉 格式化并收获路径: "${pathStr}" (总计 ${allPaths.length} 条)`, depth);

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        path: [...path],
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...path],
        decision: `🎉 命中叶子节点！收获完整根到叶路径: "${pathStr}"`,
        action: 'harvest-path',
        phase: 'harvest',
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
        callTrace: trace.snapshot(),
      });
    }

    // 深入左子树
    if (node.left) {
      trace.addRecursePrep(`递归深入左孩子 dfs(Node(${node.left.val}))`, depth, '<- 分支探查');
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        path: [...path],
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...path],
        decision: `向左深入：准备递归访问左孩子 Node(${node.left.val})`,
        action: 'recurse-left',
        phase: 'recurse',
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
        callTrace: trace.snapshot(),
      });
      dfs(node.left, depth + 1);
    }

    // 深入右子树
    if (node.right) {
      trace.addRecursePrep(`递归深入右孩子 dfs(Node(${node.right.val}))`, depth, '<- 分支探查');
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        path: [...path],
        allPaths: [...allPaths],
        secondaryHighlightedNodes: [...path],
        decision: `向右深入：准备递归访问右孩子 Node(${node.right.val})`,
        action: 'recurse-right',
        phase: 'recurse',
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
        callTrace: trace.snapshot(),
      });
      dfs(node.right, depth + 1);
    }

    // 回溯：撤销当前节点选择
    const popped = path.pop();
    const remainingPathStr = path.length > 0 ? path.join('->') : '—';
    trace.addUnwindCalc(`path.remove() 弹出 Node(${popped})，回溯至深度 ${depth > 0 ? depth - 1 : 0}`, depth, '<- 回溯撤销');

    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      path: [...path],
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...path],
      decision: `↩️ 回溯现场：弹出节点 Node(${popped})，撤销选择恢复上层路径栈`,
      action: 'backtrack',
      phase: 'backtrack',
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
      callTrace: trace.snapshot(),
    });
  }

  dfs(root, 0);

  const allTreeVals = collectTreeValues(root);
  trace.addFinalResult(`全树回溯完成，最终收获 ${allPaths.length} 条路径`, 0, undefined, allPaths.length);

  // 结算最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: root ? root.val : null,
    depth: 0,
    path: allTreeVals,
    allPaths: [...allPaths],
    visitedNodes: allTreeVals,
    highlightedNodes: allTreeVals,
    secondaryHighlightedNodes: allTreeVals,
    decision: `🎉 全树回溯完成！共收集到 ${allPaths.length} 条根到叶子路径`,
    action: 'done',
    phase: 'done',
    message: `全部递归分支回溯完毕，最终路径集合: [${allPaths.map((p) => `"${p}"`).join(', ')}]。`,
    log: `done: total ${allPaths.length} paths -> [${allPaths.join(', ')}]`,
    codeLine: lines.returnPaths,
    stageId: 'stage-1',
    metrics: {
      '当前节点': root ? `Node(${root.val})` : '—',
      '当前路径': '—',
      '所有路径': allPaths.join(' | '),
      '已收集路径数': allPaths.length,
      cur: root ? String(root.val) : '-',
      depth: '0',
      path: '—',
      result: String(allPaths.length),
    },
    statusBadge: { text: `完成: ${allPaths.length} 条路径`, type: 'success' },
    callTrace: trace.snapshot(),
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
      action: 'entry',
      phase: 'init',
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
      action: 'base-null',
      phase: 'check',
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
      action: 'done',
      phase: 'done',
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
    action: 'entry',
    phase: 'init',
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
    action: 'call-dfs',
    phase: 'call',
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
      action: 'dfs-entry',
      phase: 'entry',
      message: `当前参数栈帧隔离：路径字符串作为不可变值传递，无需共享变量。`,
      log: `enter dfs(node=${node.val}, path="${pathStr}")`,
      codeLine: lines.dfsEntry,
      stageId: 'stage-2',
      metrics: { '当前节点': `Node(${node.val})`, '当前不可变路径': pathStr, '当前深度': depth, '已收集路径数': allPaths.length },
      statusBadge: { text: `访问: Node(${node.val})`, type: 'info' },
    });

    // 检查叶子节点
    const isLeaf = !node.left && !node.right;
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      path: [...nodePath],
      currentPathStr: pathStr,
      allPaths: [...allPaths],
      secondaryHighlightedNodes: [...nodePath],
      decision: `检查节点 Node(${node.val}) 是否为叶子`,
      action: 'check-leaf',
      phase: 'check',
      message: `if (node.left == null && node.right == null)：左孩子=${node.left ? node.left.val : 'null'}，右孩子=${node.right ? node.right.val : 'null'}。`,
      log: `check leaf: node=${node.val}`,
      codeLine: lines.checkLeaf,
      stageId: 'stage-2',
      metrics: { '当前节点': `Node(${node.val})`, '当前不可变路径': pathStr, '当前深度': depth, '已收集路径数': allPaths.length },
      statusBadge: { text: isLeaf ? '命中叶子！' : '内部节点', type: isLeaf ? 'success' : 'info' },
    });

    if (isLeaf) {
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
        action: 'harvest-path',
        phase: 'harvest',
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
        action: 'leaf-return',
        phase: 'return',
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
        action: 'recurse-left',
        phase: 'recurse',
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
        action: 'recurse-right',
        phase: 'recurse',
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

  const allTreeVals = collectTreeValues(root);

  // 结算最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: root ? root.val : null,
    depth: 0,
    path: allTreeVals,
    allPaths: [...allPaths],
    visitedNodes: allTreeVals,
    highlightedNodes: allTreeVals,
    secondaryHighlightedNodes: allTreeVals,
    decision: `🎉 纯函数递归完成！共收集 ${allPaths.length} 条根到叶子路径`,
    action: 'done',
    phase: 'done',
    message: `所有不可变路径参数已安全收敛，最终返回 paths: [${allPaths.map((p) => `"${p}"`).join(', ')}]。`,
    log: `Stage 2 done: [${allPaths.join(', ')}]`,
    codeLine: lines.returnPaths,
    stageId: 'stage-2',
    metrics: { '当前节点': root ? `Node(${root.val})` : '—', '所有路径': allPaths.join(' | '), '已收集路径数': allPaths.length },
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
      action: 'entry',
      phase: 'init',
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
      action: 'base-null',
      phase: 'check',
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
      action: 'done',
      phase: 'done',
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
    action: 'entry',
    phase: 'init',
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
    action: 'offer-root',
    phase: 'init',
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
      action: 'poll-node',
      phase: 'explore',
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
        action: 'harvest-path',
        phase: 'harvest',
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
        action: 'push-left',
        phase: 'recurse',
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
        action: 'push-right',
        phase: 'recurse',
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

  const allTreeVals = collectTreeValues(root);

  // 结算最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: root ? root.val : null,
    depth: 0,
    path: allTreeVals,
    allPaths: [...allPaths],
    visitedNodes: allTreeVals,
    highlightedNodes: allTreeVals,
    secondaryHighlightedNodes: allTreeVals,
    decision: `🎉 BFS 队列排空，遍历完成！共收获 ${allPaths.length} 条根到叶子路径`,
    action: 'done',
    phase: 'done',
    message: `双队列层序遍历无递归栈消耗，顺利收获所有路径: [${allPaths.map((p) => `"${p}"`).join(', ')}]。`,
    log: `BFS done: ${allPaths.length} paths -> [${allPaths.join(', ')}]`,
    codeLine: lines.returnPaths,
    stageId: 'stage-3',
    metrics: { '当前出队节点': root ? `Node(${root.val})` : '—', '所有路径': allPaths.join(' | '), '已收集路径数': allPaths.length },
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
// 表现层画板渲染器 (Presentation Canvas Renderer - Card 1)
// =========================================================================
function renderAllPathsCanvas(container: HTMLElement, step: AllPathsStep): void {
  if (step.tree) {
    const isDone = step.decision.includes('完成') || step.decision.includes('结束') || (step.statusBadge?.type === 'success');
    const allTreeVals = collectTreeValues(step.tree);
    let current = step.current;
    let visitedNodes = step.visitedNodes;
    let highlightedNodes = step.secondaryHighlightedNodes || step.highlightedNodes || step.path;

    if (isDone) {
      if (current === null) {
        current = step.tree.val;
      }
      if (!visitedNodes || visitedNodes.length === 0) {
        visitedNodes = allTreeVals;
      }
      if (!highlightedNodes || highlightedNodes.length === 0) {
        highlightedNodes = allTreeVals;
      }
    }

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current,
      visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
      secondaryHighlightedNodes: highlightedNodes && highlightedNodes.length > 0 ? highlightedNodes : [],
      primaryColor: isDone ? '#fbbf24' : '#f59e0b',
      secondaryColor: '#10b981',
      visitedColor: '#34d399',
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;">
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
// 表现层自定义指标与推演栈渲染器 (Card 2 Custom Metrics & Trace Renderer)
// =========================================================================
export function renderAllPathsCustomMetrics(container: HTMLElement, step: AllPathsStep): void {
  if (!container) return;
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 格关键指标
  const latestHarvested = step.metrics?.['最新收获路径'] as string | undefined;
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">考察节点</span>
      <span class="text-amber-300 font-mono font-bold text-sm mt-0.5 truncate">${step.current != null ? `Node(${step.current})` : '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">当前深度</span>
      <span class="text-blue-300 font-mono font-bold text-sm mt-0.5 truncate">${step.depth}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">已收集路径</span>
      <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.allPaths.length} 条</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">最新收获路径</span>
      <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${latestHarvested || (step.allPaths.length > 0 ? step.allPaths[step.allPaths.length - 1] : '—')}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 核心状态展示区：根据 Stage 差异化呈现
  if (step.stageId === 'stage-1') {
    // Stage 1: 路径栈槽位展示 + 递归调用推演栈
    const stage1Box = document.createElement('div');
    stage1Box.className = 'flex-1 min-h-0 flex flex-col gap-2 overflow-hidden';

    // 路径栈水平展示
    const pathStackCard = document.createElement('div');
    pathStackCard.className = 'flex-shrink-0 bg-slate-900/70 border border-slate-800 rounded-lg p-2 flex flex-col gap-1.5';
    pathStackCard.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
        <span>📚 动态路径栈 path (根 ➔ 当前节点)</span>
        <span class="text-slate-500 font-mono">栈深度: ${step.path.length}</span>
      </div>
    `;

    const pathSlots = document.createElement('div');
    pathSlots.className = 'flex flex-wrap items-center gap-1.5 min-h-[28px]';
    if (step.path.length === 0) {
      pathSlots.innerHTML = `<span class="text-slate-500 italic text-[11px]">(路径栈为空 [])</span>`;
    } else {
      step.path.forEach((val, idx) => {
        const isTop = idx === step.path.length - 1;
        const slot = document.createElement('div');
        slot.className = `flex items-center gap-1 px-2 py-1 rounded border font-mono text-xs font-bold transition-all ${
          isTop
            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/10'
            : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`;
        slot.innerHTML = `<span>${val}</span>${isTop ? '<span class="text-[9px] text-amber-400 font-normal ml-0.5">(栈顶)</span>' : ''}`;
        pathSlots.appendChild(slot);

        if (idx < step.path.length - 1) {
          const arrow = document.createElement('span');
          arrow.className = 'text-slate-600 font-bold text-[10px]';
          arrow.textContent = '➔';
          pathSlots.appendChild(arrow);
        }
      });
    }
    pathStackCard.appendChild(pathSlots);
    stage1Box.appendChild(pathStackCard);

    // 递归推演栈
    if (step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
        title: '🌲 显式回溯 DFS 递归推演栈 (LC 257)',
        maxHeight: '100%',
      });
      stage1Box.appendChild(traceBox);
    }
    container.appendChild(stage1Box);
  } else if (step.stageId === 'stage-2') {
    // Stage 2: 纯函数不可变字符串参数流监控
    const stage2Box = document.createElement('div');
    stage2Box.className = 'flex-1 min-h-0 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';

    stage2Box.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
        <span>🧵 纯函数不可变字符串传递 (参数隔离机制)</span>
        <span class="text-blue-400 font-mono">天然隔离无回溯</span>
      </div>
      <div class="bg-slate-800/60 border border-slate-700/60 rounded p-2 flex flex-col gap-1">
        <span class="text-slate-400 text-[10px]">当前函数栈帧接收实参 path:</span>
        <span class="text-amber-300 font-mono text-xs font-bold break-all">${step.currentPathStr || '—'}</span>
      </div>
      <div class="flex flex-col gap-1 mt-1">
        <span class="text-slate-400 text-[10px] font-semibold">已收集完整路径集 paths:</span>
        <div class="flex flex-wrap gap-1.5">
          ${step.allPaths.length === 0 
            ? '<span class="text-slate-500 italic text-[11px]">(尚未到达叶子节点)</span>' 
            : step.allPaths.map((p, idx) => `<span class="bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded font-mono text-xs">#${idx + 1}: ${p}</span>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(stage2Box);
  } else if (step.stageId === 'stage-3') {
    // Stage 3: BFS 双队列 (节点队列 + 路径队列)
    const stage3Box = document.createElement('div');
    stage3Box.className = 'flex-1 min-h-0 flex flex-col gap-2.5 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';

    // 节点队列
    const nodeQ = step.nodeQueueState || [];
    const pathQ = step.pathQueueState || [];

    stage3Box.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
        <span>📦 BFS 节点队列 nodeQueue (队首 ➔ 队尾)</span>
        <span class="text-slate-500 font-mono">Size: ${nodeQ.length}</span>
      </div>
      <div class="flex flex-wrap gap-1.5 min-h-[26px]">
        ${nodeQ.length === 0 
          ? '<span class="text-slate-500 italic text-[11px]">(队列为空)</span>' 
          : nodeQ.map((v, i) => `<span class="px-2 py-1 rounded border font-mono text-xs font-bold ${i === 0 ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-slate-800/80 border-slate-700 text-slate-300'}">Node(${v})${i === 0 ? ' (首)' : ''}</span>`).join('')}
      </div>

      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold mt-1">
        <span>🛤️ BFS 路径队列 pathQueue (同步对应)</span>
        <span class="text-slate-500 font-mono">Size: ${pathQ.length}</span>
      </div>
      <div class="flex flex-wrap gap-1.5 min-h-[26px]">
        ${pathQ.length === 0 
          ? '<span class="text-slate-500 italic text-[11px]">(队列为空)</span>' 
          : pathQ.map((p, i) => `<span class="px-2 py-1 rounded border font-mono text-xs ${i === 0 ? 'bg-blue-500/20 border-blue-400 text-blue-200 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300'}">"${p}"${i === 0 ? ' (首)' : ''}</span>`).join('')}
      </div>

      <div class="flex flex-col gap-1 mt-1 border-t border-slate-800/80 pt-2">
        <span class="text-slate-400 text-[10px] font-semibold">已收集路径集合 paths:</span>
        <div class="flex flex-wrap gap-1.5">
          ${step.allPaths.length === 0 
            ? '<span class="text-slate-500 italic text-[11px]">(尚未收获叶子路径)</span>' 
            : step.allPaths.map((p, idx) => `<span class="bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded font-mono text-xs">#${idx + 1}: ${p}</span>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(stage3Box);
  }

  // 3. 当前操作动作与决策总结
  const isDone = step.decision.includes('完成') || step.decision.includes('结束') || (step.statusBadge?.type === 'success');
  const summaryBox = document.createElement('div');
  summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed flex-shrink-0 ${
    isDone ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-slate-800/50 border-slate-700/40 text-slate-300'
  }`;
  summaryBox.innerHTML = `
    <div class="font-bold mb-1 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}">⚡ 当前决策: ${step.decision}</div>
    <div class="text-slate-400">${step.message}</div>
  `;
  container.appendChild(summaryBox);
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
      renderCustomMetrics: (container, step) => renderAllPathsCustomMetrics(container, step),
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
      renderCustomMetrics: (container, step) => renderAllPathsCustomMetrics(container, step),
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
      renderCustomMetrics: (container, step) => renderAllPathsCustomMetrics(container, step),
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
  renderCustomMetrics: (container, step) => renderAllPathsCustomMetrics(container, step),
});

