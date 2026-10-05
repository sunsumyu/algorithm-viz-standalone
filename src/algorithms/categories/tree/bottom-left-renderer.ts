/**
 * LeetCode 513: 找树左下角的值 (Find Bottom Left Tree Value)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * 设计模式抽象与设计原则:
 *   - 建造者模式 (Builder Pattern): 利用 RecursiveCallTraceBuilder 结构化构建先序 DFS 推演树与状态快照
 *   - 适配器模式 (Adapter Pattern): TreeCanvasAdapter (Card 1 画布) + RecursiveCallTraceAdapter (Card 2 调用栈视图)
 *   - 单一职责与防腐隔离 (SRP): Card 1 与 Card 2 彻底解耦，杜绝跨容器选择器穿透与 DOM 污染
 *   - 严格一行一步与零静默 (Strict One-Line-One-Step): 覆盖所有递归入口/判空/叶子判定/最深层先登者锁定与回溯帧
 *
 * 核心多阶段演化体系:
 *   Stage 1: 先序递归 DFS 与最深层先登者锁定 (Preorder DFS with Max Depth First-Visit)
 *   Stage 2: 标准层序 BFS 队列与层首捕获 (Standard Level-Order BFS)
 *   Stage 3: 逆向右先层序 BFS (Reverse Right-to-Left BFS · 终节点即答案)
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
  BOTTOM_LEFT_STAGE1_CODES,
  BOTTOM_LEFT_STAGE1_LINES,
  BOTTOM_LEFT_STAGE2_CODES,
  BOTTOM_LEFT_STAGE2_LINES,
  BOTTOM_LEFT_STAGE3_CODES,
  BOTTOM_LEFT_STAGE3_LINES,
} from './bottom-left-stage-codes';
import {
  BOTTOM_LEFT_PROBLEM_HTML,
  BOTTOM_LEFT_ANALYSIS_HTML,
} from './bottom-left-problem-content';

// =========================================================================
// 步骤状态契约 (Step Contract)
// =========================================================================
export interface BottomLeftStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  maxDepth: number;
  bottomLeft: number | null;
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
  queueState?: number[];
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
// Stage 1 步骤生成器: 先序递归 DFS 与最深层先登者锁定 (Preorder DFS)
// =========================================================================
export function buildBottomLeftStage1PreorderSteps(root: TreeNode | null): BottomLeftStep[] {
  const steps: BottomLeftStep[] = [];
  const lines = BOTTOM_LEFT_STAGE1_LINES;
  const trace = new RecursiveCallTraceBuilder();
  let maxDepth = -1;
  let bottomLeft: number | null = null;

  // 空树特判 (3 步合规)
  if (!root) {
    trace.addHeader('findBottomLeftValue(null)', 0, '<- 根调用特判');
    trace.addConditionHit('root == null √ 命中 -> return 0', 0);
    trace.addReturnLeaf('return 0', 0);
    trace.addFinalResult('最终判定: 0 (空树返回 0)', 0, undefined, 0);

    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: -1,
      bottomLeft: null,
      decision: '算法启动：空树特判',
      action: 'entry',
      phase: 'init',
      message: '传入二叉树根节点为空 (null)，启动边界条件检验。',
      log: 'findBottomLeftValue(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '当前最大深度': '-', '左下角值': '-', cur: '-', depth: '0', 'max-depth': '-', result: '?' },
      statusBadge: { text: '空树: 无节点', type: 'info' },
      callTrace: trace.snapshot(),
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: -1,
      bottomLeft: null,
      decision: '空节点基准退出：返回 0',
      action: 'base-null',
      phase: 'check',
      message: 'if (root == null) return 0。',
      log: 'root == null -> return 0',
      codeLine: lines.baseNull,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '当前最大深度': '-', '左下角值': '-', cur: '-', depth: '0', 'max-depth': '-', result: '?' },
      statusBadge: { text: '基准退出', type: 'info' },
      callTrace: trace.snapshot(),
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: -1,
      bottomLeft: 0,
      decision: '计算完成：空树返回 0',
      action: 'done',
      phase: 'done',
      message: '空树不存在节点，返回默认值 0。',
      log: 'return 0',
      codeLine: lines.returnAns,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '左下角值': 0, cur: '-', depth: '0', 'max-depth': '-', result: '0' },
      statusBadge: { text: '完成: 0', type: 'success' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  // Step 0: 入口
  trace.addHeader(`findBottomLeftValue(root: Node(${root.val}))`, 0, '<- 根调用开始');
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    maxDepth: -1,
    bottomLeft: null,
    decision: `算法启动：准备从根节点 Node(${root.val}) 开始先序 DFS 搜索`,
    action: 'entry',
    phase: 'init',
    message: '核心原理：先序遍历遵循根->左->右，同深度首次被访问到的叶子必然是该层最靠左的节点！',
    log: `findBottomLeftValue(root: ${root.val})`,
    codeLine: lines.entry,
    stageId: 'stage-1',
    metrics: { '当前节点': `Node(${root.val})`, '当前最大深度': '-', '左下角值': '-', cur: String(root.val), depth: '0', 'max-depth': '-', result: '?' },
    statusBadge: { text: '启动先序DFS', type: 'info' },
    callTrace: trace.snapshot(),
  });

  // Step 1: 初始化全局变量
  trace.addConditionPass('初始化全局变量 maxDepth = -1, bottomLeft = 0', 0);
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    maxDepth: -1,
    bottomLeft: null,
    decision: '初始化追踪变量：maxDepth = -1, bottomLeft = 0',
    action: 'init-vars',
    phase: 'init',
    message: '初始化最大发现深度为 -1，当遍历到更深层（depth > maxDepth）时锁定该层首访节点。',
    log: 'init maxDepth = -1, bottomLeft = 0',
    codeLine: lines.initVars,
    stageId: 'stage-1',
    metrics: { '当前节点': `Node(${root.val})`, '当前最大深度': '-1', '左下角值': '-', cur: String(root.val), depth: '0', 'max-depth': '-1', result: '?' },
    statusBadge: { text: '变量初始化', type: 'info' },
    callTrace: trace.snapshot(),
  });

  // Step 2: 启动 DFS 递归调用
  trace.addRecursePrep(`dfs(Node(${root.val}), depth=0)`, 0, '<- 启动根深度 0 先序遍历');
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    maxDepth: -1,
    bottomLeft: null,
    decision: `调用辅助递归函数: dfs(root, 0)`,
    action: 'call-dfs',
    phase: 'init',
    message: `调用 dfs(root, 0)，从根节点出发，以深度 0 开始自顶向下深入探测。`,
    log: `call dfs(root: ${root.val}, 0)`,
    codeLine: lines.callDfs,
    stageId: 'stage-1',
    metrics: { '当前节点': `Node(${root.val})`, '递归深度': 0, '当前最大深度': '-1' },
    statusBadge: { text: '进入递归 dfs', type: 'info' },
    callTrace: trace.snapshot(),
  });

  const visitedSet = new Set<number>();

  function dfs(node: TreeNode, depth: number): void {
    visitedSet.add(node.val);
    trace.addHeader(`dfs(Node(${node.val}), depth=${depth})`, depth, `<- 深入 Node(${node.val})`);

    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      maxDepth,
      bottomLeft,
      secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
      decision: `📥 访问节点 Node(${node.val})，当前所处深度: ${depth}`,
      action: 'dfs-entry',
      phase: 'recurse',
      message: `进入 dfs(node=${node.val}, depth=${depth})，当前记录的最深层为 ${maxDepth}。`,
      log: `dfs(node=${node.val}, depth=${depth})`,
      codeLine: lines.dfsEntry,
      stageId: 'stage-1',
      visitedNodes: Array.from(visitedSet),
      metrics: {
        '当前节点': `Node(${node.val})`,
        '当前深度': depth,
        '最深记录': maxDepth >= 0 ? maxDepth : '-',
        '当前左下角值': bottomLeft != null ? bottomLeft : '-',
        cur: String(node.val),
        depth: String(depth),
        'max-depth': maxDepth >= 0 ? String(maxDepth) : '-',
        result: bottomLeft != null ? String(bottomLeft) : '?',
      },
      statusBadge: { text: `深度: ${depth}`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 检查叶子节点
    if (!node.left && !node.right) {
      trace.addConditionHit(`Node(${node.val}) 是叶子节点 (left==null && right==null)`, depth);

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        maxDepth,
        bottomLeft,
        secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
        decision: `节点 Node(${node.val}) 为叶子节点，检验是否刷新深度纪录 (depth ${depth} > maxDepth ${maxDepth})`,
        action: 'check-leaf',
        phase: 'check',
        message: `node.left == null && node.right == null 成立，判断是否到达了未曾触达的更深层。`,
        log: `check leaf: depth=${depth}, maxDepth=${maxDepth}`,
        codeLine: lines.checkLeaf,
        stageId: 'stage-1',
        visitedNodes: Array.from(visitedSet),
        metrics: {
          '当前节点': `Node(${node.val})`,
          '当前深度': depth,
          '最深记录': maxDepth >= 0 ? maxDepth : '-',
          '当前左下角值': bottomLeft != null ? bottomLeft : '-',
          cur: String(node.val),
          depth: String(depth),
          'max-depth': maxDepth >= 0 ? String(maxDepth) : '-',
          result: bottomLeft != null ? String(bottomLeft) : '?',
        },
        statusBadge: { text: depth > maxDepth ? '新最深层！' : '浅层/同层叶子', type: depth > maxDepth ? 'success' : 'info' },
        callTrace: trace.snapshot(),
      });

      if (depth > maxDepth) {
        maxDepth = depth;
        bottomLeft = node.val;
        trace.addConditionHit(`depth (${depth}) > maxDepth (${maxDepth}) √ 首次抵达更深层，锁定左下角: ${node.val}`, depth);

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          maxDepth,
          bottomLeft,
          secondaryHighlightedNodes: [bottomLeft],
          decision: `🎉 攻入新最深层！锁定该层先登左下角值: Node(${node.val}) (深度 ${depth})`,
          action: 'update-ans',
          phase: 'update',
          message: `由于先序遍历先左后右，深度 ${depth} 首个碰到的叶子 Node(${node.val}) 必然是该层最靠左的节点！刷新 bottomLeft = ${node.val}。`,
          log: `update: maxDepth=${maxDepth}, bottomLeft=${bottomLeft}`,
          codeLine: lines.updateAns,
          stageId: 'stage-1',
          visitedNodes: Array.from(visitedSet),
          metrics: {
            '当前节点': `Node(${node.val})`,
            '当前深度': depth,
            '最新最深层': maxDepth,
            '当前左下角值': bottomLeft,
            cur: String(node.val),
            depth: String(depth),
            'max-depth': String(maxDepth),
            result: String(bottomLeft),
          },
          statusBadge: { text: `刷新左下角: ${bottomLeft}`, type: 'success' },
          callTrace: trace.snapshot(),
        });
      } else {
        trace.addConditionPass(`depth (${depth}) <= maxDepth (${maxDepth}) × 未超越已知最深层，保持原值: ${bottomLeft}`, depth);
      }

      trace.addReturnLeaf(`叶子 Node(${node.val}) 处理完成 -> return`, depth);
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        maxDepth,
        bottomLeft,
        secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
        decision: `叶子节点 Node(${node.val}) 处理完毕，递归 return 返回上一层`,
        action: 'leaf-return',
        phase: 'unwind',
        message: '叶子已无子树，执行 return 弹出当前递归栈帧。',
        log: `leaf return`,
        codeLine: lines.leafReturn,
        stageId: 'stage-1',
        visitedNodes: Array.from(visitedSet),
        metrics: {
          '当前节点': `Node(${node.val})`,
          '当前左下角值': bottomLeft != null ? bottomLeft : '-',
          cur: String(node.val),
          depth: String(depth),
          'max-depth': maxDepth >= 0 ? String(maxDepth) : '-',
          result: bottomLeft != null ? String(bottomLeft) : '?',
        },
        statusBadge: { text: '叶子返回', type: 'info' },
        callTrace: trace.snapshot(),
      });
      return;
    }

    // 深入左子树
    if (node.left) {
      trace.addRecursePrep(`递归探索左孩子 Node(${node.left.val})`, depth, `depth = ${depth + 1}`);
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        maxDepth,
        bottomLeft,
        secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
        decision: `向左优先深入：准备递归访问左孩子 Node(${node.left.val})`,
        action: 'recurse-left',
        phase: 'recurse',
        message: `node.left != null，调用 dfs(node.left, depth + 1 = ${depth + 1})。`,
        log: `recurse left: dfs(node=${node.left.val})`,
        codeLine: lines.recurseLeft,
        stageId: 'stage-1',
        visitedNodes: Array.from(visitedSet),
        metrics: {
          '当前节点': `Node(${node.val})`,
          '下探分支': `左孩子 Node(${node.left.val})`,
          '当前左下角值': bottomLeft != null ? bottomLeft : '-',
          cur: String(node.val),
          depth: String(depth),
          'max-depth': maxDepth >= 0 ? String(maxDepth) : '-',
          result: bottomLeft != null ? String(bottomLeft) : '?',
        },
        statusBadge: { text: '下探左子树', type: 'info' },
        callTrace: trace.snapshot(),
      });
      dfs(node.left, depth + 1);
      trace.addUnwindCalc(`左孩子 Node(${node.left.val}) 探索完毕，返回至 Node(${node.val})`, depth);
    }

    // 深入右子树
    if (node.right) {
      trace.addRecursePrep(`递归探索右孩子 Node(${node.right.val})`, depth, `depth = ${depth + 1}`);
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        maxDepth,
        bottomLeft,
        secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
        decision: `向右下探：准备递归访问右孩子 Node(${node.right.val})`,
        action: 'recurse-right',
        phase: 'recurse',
        message: `node.right != null，调用 dfs(node.right, depth + 1 = ${depth + 1})。`,
        log: `recurse right: dfs(node=${node.right.val})`,
        codeLine: lines.recurseRight,
        stageId: 'stage-1',
        visitedNodes: Array.from(visitedSet),
        metrics: {
          '当前节点': `Node(${node.val})`,
          '下探分支': `右孩子 Node(${node.right.val})`,
          '当前左下角值': bottomLeft != null ? bottomLeft : '-',
          cur: String(node.val),
          depth: String(depth),
          'max-depth': maxDepth >= 0 ? String(maxDepth) : '-',
          result: bottomLeft != null ? String(bottomLeft) : '?',
        },
        statusBadge: { text: '下探右子树', type: 'info' },
        callTrace: trace.snapshot(),
      });
      dfs(node.right, depth + 1);
      trace.addUnwindCalc(`右孩子 Node(${node.right.val}) 探索完毕，返回至 Node(${node.val})`, depth);
    }
  }

  dfs(root, 0);

  const allTreeVals = collectTreeValues(root);

  // Step 最终步: 返回 bottomLeft
  trace.addFinalResult(`DFS 全部回溯完成，最深层为 ${maxDepth}，左下角值为 ${bottomLeft}`, 0, undefined, bottomLeft!);
  steps.push({
    tree: cloneStateDepTree(root),
    current: root ? root.val : null,
    depth: maxDepth,
    maxDepth,
    bottomLeft,
    visitedNodes: allTreeVals,
    secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
    decision: `🎉 先序 DFS 搜索完毕！树最深层 ${maxDepth} 最先访问的左下角值为 Node(${bottomLeft})`,
    action: 'done',
    phase: 'done',
    message: `遍历全树结束，最深层首次被碰到的叶子节点值为 ${bottomLeft}，执行 return bottomLeft 返回结果！`,
    log: `Search complete -> return bottomLeft = ${bottomLeft}`,
    codeLine: lines.done,
    stageId: 'stage-1',
    metrics: {
      '最终左下角值': bottomLeft ?? '-',
      '最大探索深度': maxDepth,
      '全树节点总数': allTreeVals.length,
      cur: bottomLeft != null ? String(bottomLeft) : '-',
      depth: String(maxDepth),
      'max-depth': String(maxDepth),
      result: bottomLeft != null ? String(bottomLeft) : '-',
    },
    statusBadge: { text: `最终结果: ${bottomLeft}`, type: 'success' },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// =========================================================================
// Stage 2 步骤生成器: 标准层序 BFS 队列与层首捕获 (Standard Level-Order BFS)
// =========================================================================
export function buildBottomLeftStage2BfsSteps(root: TreeNode | null): BottomLeftStep[] {
  const steps: BottomLeftStep[] = [];
  const lines = BOTTOM_LEFT_STAGE2_LINES;

  // 空树特判 (3 步合规)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: 0,
      bottomLeft: null,
      decision: '算法启动：空树特判',
      action: 'entry',
      message: '传入二叉树为空，启动判空防御。',
      log: 'findBottomLeftValue(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-2',
      metrics: { '当前节点': 'null', '左下角值': 0 },
      statusBadge: { text: '空树: 0', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: 0,
      bottomLeft: null,
      decision: '空树判空命中：返回 0',
      action: 'base-null',
      message: 'if (root == null) return 0。',
      log: 'root == null -> return 0',
      codeLine: lines.baseNull,
      stageId: 'stage-2',
      metrics: { '当前节点': 'null', '左下角值': 0 },
      statusBadge: { text: '基准退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: 0,
      bottomLeft: 0,
      decision: '计算完成：返回 0',
      action: 'done',
      message: '返回默认值 0。',
      log: 'return 0',
      codeLine: lines.returnAns,
      stageId: 'stage-2',
      metrics: { '当前节点': 'null', '左下角值': 0 },
      statusBadge: { text: '完成: 0', type: 'success' },
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    maxDepth: 0,
    bottomLeft: root.val,
    decision: `算法启动：根节点 Node(${root.val}) 入队，初始化标准 BFS 搜索`,
    action: 'entry',
    message: '标准 BFS 队列按层遍历，每层第 1 个出队的节点 (i == 0) 即为该层的最左侧节点。',
    log: `BFS queue.offer(root: ${root.val})`,
    codeLine: lines.entry,
    stageId: 'stage-2',
    queueState: [root.val],
    metrics: { '当前节点': `Node(${root.val})`, '队列长度': 1, '当前候选答案': root.val },
    statusBadge: { text: 'BFS 启动', type: 'info' },
  });

  const queue: TreeNode[] = [root];
  let bottomLeft = root.val;
  let currentLevel = 0;
  const visitedSet = new Set<number>();

  while (queue.length > 0) {
    const size = queue.length;

    steps.push({
      tree: cloneStateDepTree(root),
      current: queue[0].val,
      depth: currentLevel,
      maxDepth: currentLevel,
      bottomLeft,
      secondaryHighlightedNodes: [bottomLeft],
      decision: `🌊 开始处理第 ${currentLevel} 层：本层共有 ${size} 个节点`,
      action: 'level-size',
      message: `int size = queue.size() = ${size}。准备按序遍历本层所有节点，并在 i == 0 时锁定本层首节点。`,
      log: `Level ${currentLevel}: size = ${size}`,
      codeLine: lines.getLevelSize,
      stageId: 'stage-2',
      visitedNodes: Array.from(visitedSet),
      queueState: queue.map((n) => n.val),
      metrics: { '当前遍历层': currentLevel, '本层节点数': size, '当前候选左下角': bottomLeft },
      statusBadge: { text: `第 ${currentLevel} 层 (共 ${size} 节点)`, type: 'info' },
    });

    for (let i = 0; i < size; i++) {
      const cur = queue.shift()!;
      visitedSet.add(cur.val);

      steps.push({
        tree: cloneStateDepTree(root),
        current: cur.val,
        depth: currentLevel,
        maxDepth: currentLevel,
        bottomLeft,
        secondaryHighlightedNodes: [bottomLeft],
        decision: `节点 Node(${cur.val}) 出队 (本层第 ${i + 1}/${size} 个)`,
        action: 'poll-node',
        message: `从队首弹出节点 Node(${cur.val})。`,
        log: `poll cur = ${cur.val}`,
        codeLine: lines.pollNode,
        stageId: 'stage-2',
        visitedNodes: Array.from(visitedSet),
        queueState: queue.map((n) => n.val),
        metrics: { '出队节点': `Node(${cur.val})`, '层内序号': `${i + 1}/${size}`, '当前候选左下角': bottomLeft },
        statusBadge: { text: `出队: ${cur.val}`, type: 'info' },
      });

      // 捕获层首节点
      if (i === 0) {
        bottomLeft = cur.val;
        steps.push({
          tree: cloneStateDepTree(root),
          current: cur.val,
          depth: currentLevel,
          maxDepth: currentLevel,
          bottomLeft,
          secondaryHighlightedNodes: [bottomLeft],
          decision: `🎯 捕获第 ${currentLevel} 层首节点: Node(${cur.val})，更新 bottomLeft = ${cur.val}`,
          action: 'capture-first',
          message: `i == 0 命中！Node(${cur.val}) 是第 ${currentLevel} 层最先出队的节点，必为该层最左侧节点。`,
          log: `capture level head: bottomLeft = ${bottomLeft}`,
          codeLine: lines.captureFirst,
          stageId: 'stage-2',
          visitedNodes: Array.from(visitedSet),
          queueState: queue.map((n) => n.val),
          metrics: { '当前层最左节点': cur.val, '当前遍历层': currentLevel, '锁定左下角': bottomLeft },
          statusBadge: { text: `捕获层首: ${bottomLeft}`, type: 'success' },
        });
      }

      // 入队左孩子
      if (cur.left) {
        queue.push(cur.left);
        steps.push({
          tree: cloneStateDepTree(root),
          current: cur.val,
          depth: currentLevel,
          maxDepth: currentLevel,
          bottomLeft,
          secondaryHighlightedNodes: [bottomLeft],
          decision: `Node(${cur.val}) 的左孩子 Node(${cur.left.val}) 入队`,
          action: 'push-left',
          message: `cur.left != null，将左孩子入队以便下一层优先处理。`,
          log: `offer left: ${cur.left.val}`,
          codeLine: lines.pushLeft,
          stageId: 'stage-2',
          visitedNodes: Array.from(visitedSet),
          queueState: queue.map((n) => n.val),
          metrics: { '出队节点': `Node(${cur.val})`, '入队左孩子': `Node(${cur.left.val})`, '队列新长度': queue.length },
          statusBadge: { text: `入队左: ${cur.left.val}`, type: 'info' },
        });
      }

      // 入队右孩子
      if (cur.right) {
        queue.push(cur.right);
        steps.push({
          tree: cloneStateDepTree(root),
          current: cur.val,
          depth: currentLevel,
          maxDepth: currentLevel,
          bottomLeft,
          secondaryHighlightedNodes: [bottomLeft],
          decision: `Node(${cur.val}) 的右孩子 Node(${cur.right.val}) 入队`,
          action: 'push-right',
          message: `cur.right != null，将右孩子入队。`,
          log: `offer right: ${cur.right.val}`,
          codeLine: lines.pushRight,
          stageId: 'stage-2',
          visitedNodes: Array.from(visitedSet),
          queueState: queue.map((n) => n.val),
          metrics: { '出队节点': `Node(${cur.val})`, '入队右孩子': `Node(${cur.right.val})`, '队列新长度': queue.length },
          statusBadge: { text: `入队右: ${cur.right.val}`, type: 'info' },
        });
      }
    }

    currentLevel++;
  }

  const allTreeVals = collectTreeValues(root);

  // 最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: root ? root.val : null,
    depth: currentLevel - 1,
    maxDepth: currentLevel - 1,
    bottomLeft,
    visitedNodes: allTreeVals,
    secondaryHighlightedNodes: [bottomLeft],
    decision: `🎉 队列已排空，最后一层的首节点即为树左下角的值: Node(${bottomLeft})`,
    action: 'done',
    message: `BFS 遍历结束，最后一层第 1 个出队的节点为 ${bottomLeft}，执行 return bottomLeft！`,
    log: `BFS complete -> return ${bottomLeft}`,
    codeLine: lines.returnAns,
    stageId: 'stage-2',
    metrics: { '最终左下角值': bottomLeft, '整树层数': currentLevel, '总节点数': allTreeVals.length },
    statusBadge: { text: `最终结果: ${bottomLeft}`, type: 'success' },
  });

  return steps;
}

// =========================================================================
// Stage 3 步骤生成器: 逆向右先层序 BFS (Reverse Right-to-Left BFS · 最优解)
// =========================================================================
export function buildBottomLeftStage3ReverseBfsSteps(root: TreeNode | null): BottomLeftStep[] {
  const steps: BottomLeftStep[] = [];
  const lines = BOTTOM_LEFT_STAGE3_LINES;

  // 空树特判 (3 步合规)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: 0,
      bottomLeft: null,
      decision: '算法启动：空树特判',
      action: 'entry',
      message: '传入二叉树为空，启动判空防御。',
      log: 'findBottomLeftValue(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-3',
      metrics: { '当前节点': 'null', '左下角值': 0 },
      statusBadge: { text: '空树: 0', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: 0,
      bottomLeft: null,
      decision: '空节点特判：返回 0',
      action: 'base-null',
      message: 'if (root == null) return 0。',
      log: 'root == null -> return 0',
      codeLine: lines.baseNull,
      stageId: 'stage-3',
      metrics: { '当前节点': 'null', '左下角值': 0 },
      statusBadge: { text: '基准退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: 0,
      bottomLeft: 0,
      decision: '计算完成：返回 0',
      action: 'done',
      message: '逆向 BFS 遍历结束，返回 0。',
      log: 'return 0',
      codeLine: lines.returnAns,
      stageId: 'stage-3',
      metrics: { '当前节点': 'null', '左下角值': 0 },
      statusBadge: { text: '完成: 0', type: 'success' },
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    maxDepth: 0,
    bottomLeft: root.val,
    secondaryHighlightedNodes: [root.val],
    decision: `算法启动：根节点 Node(${root.val}) 入队，开启逆向右先层序遍历`,
    action: 'entry',
    message: '逆向神级解法：反转入队顺序（先入右孩子，后入左孩子），整树最后一个出队的节点必然是最左下角的节点！',
    log: `reverse BFS queue.offer(root: ${root.val})`,
    codeLine: lines.entry,
    stageId: 'stage-3',
    queueState: [root.val],
    metrics: { '当前出队节点': `Node(${root.val})`, '队列长度': 1, '当前候选答案': root.val },
    statusBadge: { text: '逆向右先入队', type: 'info' },
  });

  const queue: TreeNode[] = [root];
  let cur: TreeNode = root;
  const visitedSet = new Set<number>();

  while (queue.length > 0) {
    cur = queue.shift()!;
    visitedSet.add(cur.val);

    steps.push({
      tree: cloneStateDepTree(root),
      current: cur.val,
      depth: 0,
      maxDepth: 0,
      bottomLeft: cur.val,
      secondaryHighlightedNodes: [cur.val],
      visitedNodes: Array.from(visitedSet),
      queueState: queue.map((n) => n.val),
      decision: `节点 Node(${cur.val}) 出队，刷新最后弹出游标 cur = Node(${cur.val})`,
      action: 'poll-cur',
      message: `TreeNode cur = queue.poll()。由于采用从右向左的逆向顺序，出队操作不断向左下角推移。`,
      log: `poll cur = ${cur.val}, queue remaining: [${queue.map((n) => n.val).join(', ')}]`,
      codeLine: lines.pollCur,
      stageId: 'stage-3',
      metrics: { '最新出队节点': `Node(${cur.val})`, '剩余队列元素': queue.length, '最后游标值': cur.val },
      statusBadge: { text: `出队: ${cur.val}`, type: 'info' },
    });

    // 关键反转：先入右孩子！
    if (cur.right) {
      queue.push(cur.right);
      steps.push({
        tree: cloneStateDepTree(root),
        current: cur.val,
        depth: 0,
        maxDepth: 0,
        bottomLeft: cur.val,
        secondaryHighlightedNodes: [cur.val],
        visitedNodes: Array.from(visitedSet),
        queueState: queue.map((n) => n.val),
        decision: `【先入右孩子】Node(${cur.right.val}) 优先入队`,
        action: 'push-right-first',
        message: `if (cur.right != null) queue.offer(cur.right)。保证右侧分支早于左侧分支被处理。`,
        log: `offer right: ${cur.right.val}`,
        codeLine: lines.pushRightFirst,
        stageId: 'stage-3',
        metrics: { '最新出队节点': `Node(${cur.val})`, '优先入右': `Node(${cur.right.val})`, '队列新大小': queue.length },
        statusBadge: { text: `入右: ${cur.right.val}`, type: 'info' },
      });
    }

    // 后入左孩子！
    if (cur.left) {
      queue.push(cur.left);
      steps.push({
        tree: cloneStateDepTree(root),
        current: cur.val,
        depth: 0,
        maxDepth: 0,
        bottomLeft: cur.val,
        secondaryHighlightedNodes: [cur.val],
        visitedNodes: Array.from(visitedSet),
        queueState: queue.map((n) => n.val),
        decision: `【后入左孩子】Node(${cur.left.val}) 后入队`,
        action: 'push-left-second',
        message: `if (cur.left != null) queue.offer(cur.left)。保证左孩子在队列最末端，成为最后出队的候选者！`,
        log: `offer left: ${cur.left.val}`,
        codeLine: lines.pushLeftSecond,
        stageId: 'stage-3',
        metrics: { '最新出队节点': `Node(${cur.val})`, '后入左': `Node(${cur.left.val})`, '队列新大小': queue.length },
        statusBadge: { text: `入左: ${cur.left.val}`, type: 'info' },
      });
    }
  }

  const allTreeVals = collectTreeValues(root);

  // 最终步：最后一个出队的就是答案！
  steps.push({
    tree: cloneStateDepTree(root),
    current: root ? root.val : null,
    depth: 0,
    maxDepth: 0,
    bottomLeft: cur.val,
    visitedNodes: allTreeVals,
    secondaryHighlightedNodes: [cur.val],
    decision: `🎉 队列彻底排空！最后一个从队列弹出的节点 Node(${cur.val}) 必为树左下角的值！`,
    action: 'done',
    message: `逆向 BFS 遍历结束，无需任何层深判断与复杂循环，直接返回 cur.val = ${cur.val}！`,
    log: `Reverse BFS complete -> return ${cur.val}`,
    codeLine: lines.returnAns,
    stageId: 'stage-3',
    metrics: { '最后出队节点': `Node(${cur.val})`, '最终答案': cur.val },
    statusBadge: { text: `最终答案: ${cur.val}`, type: 'success' },
  });

  return steps;
}

// =========================================================================
// 统一向下兼容入口 (100% Backward Compatible Step Generator)
// =========================================================================
export function buildBottomLeftSteps(root: TreeNode | null): BottomLeftStep[] {
  return buildBottomLeftStage1PreorderSteps(root);
}

// =========================================================================
// 表现层画板渲染器 (Presentation Canvas Renderer - Card 1)
// =========================================================================
function renderBottomLeftCanvas(container: HTMLElement, step: BottomLeftStep): void {
  if (step.tree) {
    const isDone = step.decision.includes('完成') || step.decision.includes('结束') || step.decision.includes('排空') || step.statusBadge?.type === 'success';
    const allTreeVals = collectTreeValues(step.tree);
    let current = step.current;
    let visitedNodes = step.visitedNodes;
    let secondaryHighlightedNodes = step.secondaryHighlightedNodes || (step.bottomLeft != null ? [step.bottomLeft] : []);

    if (isDone) {
      if (current === null) {
        current = step.tree.val;
      }
      if (!visitedNodes || visitedNodes.length === 0) {
        visitedNodes = allTreeVals;
      }
    }

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current,
      visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
      secondaryHighlightedNodes: secondaryHighlightedNodes.length > 0 ? secondaryHighlightedNodes : [],
      primaryColor: '#fbbf24',
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
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">空树无任何节点，左下角值为空</span>
      </div>
    `;
  }
}

// =========================================================================
// 表现层自定义指标与推演栈渲染器 (Card 2 Custom Metrics & Trace Renderer)
// =========================================================================
export function renderBottomLeftCustomMetrics(container: HTMLElement, step: BottomLeftStep): void {
  if (!container) return;
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 格关键指标
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
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">最深纪录</span>
      <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${step.maxDepth >= 0 ? step.maxDepth : '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">锁定左下角</span>
      <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.bottomLeft != null ? `Node(${step.bottomLeft})` : '-'}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 核心状态展示区：Stage 1 为递归推演栈，Stage 2/3 为 BFS 队列监视器
  if (step.stageId === 'stage-1' && step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
      title: '🌲 先序先登 DFS 递归调用推演栈 (LC 513)',
      maxHeight: '100%',
    });
    container.appendChild(traceBox);
  } else if (step.queueState && step.queueState.length >= 0) {
    const queueBox = document.createElement('div');
    queueBox.className = 'flex-1 min-h-0 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';

    const queueHeader = document.createElement('div');
    queueHeader.className = 'flex items-center justify-between text-slate-400 text-[11px] font-semibold';
    queueHeader.innerHTML = `
      <span>📦 BFS 队列状态 (队首 ➔ 队尾)</span>
      <span class="text-slate-500 font-mono">Size: ${step.queueState.length}</span>
    `;
    queueBox.appendChild(queueHeader);

    const queueRow = document.createElement('div');
    queueRow.className = 'flex flex-wrap gap-2 items-center';

    if (step.queueState.length === 0) {
      queueRow.innerHTML = `<span class="text-slate-500 italic text-xs">(队列为空)</span>`;
    } else {
      step.queueState.forEach((v, idx) => {
        const isHead = idx === 0;
        const slot = document.createElement('div');
        slot.className = `px-2.5 py-1.5 rounded border font-mono text-xs font-bold transition-all ${
          isHead
            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/10'
            : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`;
        slot.innerHTML = `<span>Node(${v})</span>${isHead ? '<span class="text-[9px] text-amber-300 ml-1 font-normal">(首)</span>' : ''}`;
        queueRow.appendChild(slot);
      });
    }
    queueBox.appendChild(queueRow);
    container.appendChild(queueBox);
  }

  // 3. 当前操作动作与决策总结
  const isDone = step.decision.includes('完成') || step.decision.includes('结束') || step.decision.includes('排空') || step.statusBadge?.type === 'success';
  const summaryBox = document.createElement('div');
  summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed ${
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
export const bottomLeftVisualizer = registerDeclarativeAlgorithm<BottomLeftStep>({
  id: 'bottom-left',
  name: '找树左下角的值',
  category: 'tree',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 513,
  aliases: ['leetcode-513', 'find-bottom-left-value'],
  learningGoal: '掌握先序优先先登锁定、标准层序首节点捕获与逆向右先层序终节点即答案三大演化形态',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H) / O(W)',
  inputs: [
    {
      id: 'tree',
      label: '二叉树层序数组',
      type: 'text',
      defaultValue: '2, 1, 3',
      placeholder: '例如: 2, 1, 3',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: [2, 1, 3] (答案 1)',
      values: { tree: '2, 1, 3' },
      description: '第 1 层有 1 和 3，最左边节点为 1',
    },
    {
      label: 'LeetCode 示例 2: [1, 2, 3, 4, null, 5, 6, null, null, 7] (答案 7)',
      values: { tree: '1, 2, 3, 4, null, 5, 6, null, null, 7' },
      description: '最底层为第 3 层的节点 7（7 是节点 5 的左孩子）',
    },
    {
      label: '单节点根树: [1] (答案 1)',
      values: { tree: '1' },
      description: '整树仅一个节点，左下角即根节点自身',
    },
    {
      label: '右偏单链树: [1, null, 2, null, 3, null, 4] (答案 4)',
      values: { tree: '1, null, 2, null, 3, null, 4' },
      description: '右偏链每层仅一个右孩子，最底层最左边即节点 4',
    },
    {
      label: '空树用例: [] (答案 0)',
      values: { tree: '[]' },
      description: '空树特判',
    },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'depth', label: '当前深度', color: '#2563eb' },
    { id: 'result', label: '左下角值', color: '#10b981' },
  ],
  codeLanguages: BOTTOM_LEFT_STAGE1_CODES,
  problemHtml: BOTTOM_LEFT_PROBLEM_HTML,
  analysisHtml: BOTTOM_LEFT_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 先序递归 DFS 与最深层先登者锁定 (Preorder DFS)',
      shortName: '先序先登DFS',
      num: 1,
      badge: {
        mode: '先序遍历 · 先登者锁定',
        complexity: 'O(N) · O(H)',
      },
      card1Title: '🌲 二叉树先序深度优先搜索沙盘',
      card2Title: '🧭 递归推演栈与最深层首访锁定',
      card2Desc: '先左后右先序遍历，同深度首次访问的叶子必为该层最左节点',
      codeLanguages: BOTTOM_LEFT_STAGE1_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [2, 1, 3]);
        const root = buildTreeFromArr(arr);
        return buildBottomLeftStage1PreorderSteps(root);
      },
      renderCanvas: (container, step) => renderBottomLeftCanvas(container, step),
      renderCustomMetrics: (container, step) => renderBottomLeftCustomMetrics(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 标准层序 BFS 队列与层首捕获 (Standard Level-Order BFS)',
      shortName: '标准层序BFS',
      num: 2,
      badge: {
        mode: '层序队列 · 层首捕获',
        complexity: 'O(N) · O(W)',
      },
      card1Title: '🌲 标准层序广度优先搜索沙盘',
      card2Title: '📦 BFS 队列槽与层首元素监控',
      card2Desc: '每层 i == 0 时锁定层首节点，遍历至最后一层获得答案',
      codeLanguages: BOTTOM_LEFT_STAGE2_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [2, 1, 3]);
        const root = buildTreeFromArr(arr);
        return buildBottomLeftStage2BfsSteps(root);
      },
      renderCanvas: (container, step) => renderBottomLeftCanvas(container, step),
      renderCustomMetrics: (container, step) => renderBottomLeftCustomMetrics(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 逆向右先层序 BFS (Reverse Right-to-Left BFS · 最优解)',
      shortName: '逆向右先BFS',
      num: 3,
      badge: {
        mode: '逆向层序 · 终节点即答案',
        complexity: 'O(N) · O(W)',
      },
      card1Title: '🌲 逆向右先层序广度优先沙盘',
      card2Title: '⚡ 逆向 BFS 队列与最后出队监视器',
      card2Desc: '先入右孩子后入左孩子，队列最后一个出队的节点即为树左下角的值',
      codeLanguages: BOTTOM_LEFT_STAGE3_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [2, 1, 3]);
        const root = buildTreeFromArr(arr);
        return buildBottomLeftStage3ReverseBfsSteps(root);
      },
      renderCanvas: (container, step) => renderBottomLeftCanvas(container, step),
      renderCustomMetrics: (container, step) => renderBottomLeftCustomMetrics(container, step),
    },
  ],

  generateSteps: (inputs) => {
    const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [2, 1, 3]);
    const root = buildTreeFromArr(arr);
    return buildBottomLeftStage1PreorderSteps(root);
  },
  buildSteps: (inputs) => {
    const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [2, 1, 3]);
    const root = buildTreeFromArr(arr);
    return buildBottomLeftStage1PreorderSteps(root);
  },
  renderCanvas: (container, step) => renderBottomLeftCanvas(container, step),
  renderCustomMetrics: (container, step) => renderBottomLeftCustomMetrics(container, step),
});
