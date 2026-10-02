/**
 * LeetCode 513: 找树左下角的值 (Find Bottom Left Tree Value)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
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
}

// =========================================================================
// Stage 1 步骤生成器: 先序递归 DFS 与最深层先登者锁定 (Preorder DFS)
// =========================================================================
export function buildBottomLeftStage1PreorderSteps(root: TreeNode | null): BottomLeftStep[] {
  const steps: BottomLeftStep[] = [];
  const lines = BOTTOM_LEFT_STAGE1_LINES;
  let maxDepth = -1;
  let bottomLeft: number | null = null;

  // 空树特判 (3 步合规)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: -1,
      bottomLeft: null,
      decision: '算法启动：空树特判',
      message: '传入二叉树根节点为空 (null)，启动边界条件检验。',
      log: 'findBottomLeftValue(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '当前最大深度': '-', '左下角值': '-', cur: '-', depth: '0', 'max-depth': '-', result: '?' },
      statusBadge: { text: '空树: 无节点', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: -1,
      bottomLeft: null,
      decision: '空节点基准退出：返回 0',
      message: 'if (root == null) return 0。',
      log: 'root == null -> return 0',
      codeLine: lines.baseNull,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '当前最大深度': '-', '左下角值': '-', cur: '-', depth: '0', 'max-depth': '-', result: '?' },
      statusBadge: { text: '基准退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: -1,
      bottomLeft: 0,
      decision: '计算完成：空树返回 0',
      message: '空树不存在节点，返回默认值 0。',
      log: 'return 0',
      codeLine: lines.returnAns,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '左下角值': 0, cur: '-', depth: '0', 'max-depth': '-', result: '0' },
      statusBadge: { text: '完成: 0', type: 'success' },
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    maxDepth: -1,
    bottomLeft: null,
    decision: `算法启动：准备从根节点 Node(${root.val}) 开始先序 DFS 搜索`,
    message: '核心原理：先序遍历遵循根->左->右，同深度首次被访问到的叶子必然是该层最靠左的节点！',
    log: `findBottomLeftValue(root: ${root.val})`,
    codeLine: lines.entry,
    stageId: 'stage-1',
    metrics: { '当前节点': `Node(${root.val})`, '当前最大深度': '-', '左下角值': '-', cur: String(root.val), depth: '0', 'max-depth': '-', result: '?' },
    statusBadge: { text: '启动先序DFS', type: 'info' },
  });

  // Step 1: 初始化全局变量
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    depth: 0,
    maxDepth: -1,
    bottomLeft: null,
    decision: '初始化追踪变量：maxDepth = -1, bottomLeft = 0',
    message: '初始化最大发现深度为 -1，当遍历到更深层（depth > maxDepth）时锁定该层首访节点。',
    log: 'init maxDepth = -1, bottomLeft = 0',
    codeLine: lines.initVars,
    stageId: 'stage-1',
    metrics: { '当前节点': `Node(${root.val})`, '当前最大深度': '-1', '左下角值': '-', cur: String(root.val), depth: '0', 'max-depth': '-1', result: '?' },
    statusBadge: { text: '变量初始化', type: 'info' },
  });

  function dfs(node: TreeNode, depth: number): void {
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      depth,
      maxDepth,
      bottomLeft,
      secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
      decision: `📥 访问节点 Node(${node.val})，当前所处深度: ${depth}`,
      message: `进入 dfs(node=${node.val}, depth=${depth})，当前记录的最深层为 ${maxDepth}。`,
      log: `dfs(node=${node.val}, depth=${depth})`,
      codeLine: lines.dfsEntry,
      stageId: 'stage-1',
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
    });

    // 检查叶子节点
    if (!node.left && !node.right) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        maxDepth,
        bottomLeft,
        secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
        decision: `节点 Node(${node.val}) 为叶子节点，检验是否刷新深度纪录 (depth ${depth} > maxDepth ${maxDepth})`,
        message: `node.left == null && node.right == null 成立，判断是否到达了未曾触达的更深层。`,
        log: `check leaf: depth=${depth}, maxDepth=${maxDepth}`,
        codeLine: lines.checkDepth,
        stageId: 'stage-1',
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
      });

      if (depth > maxDepth) {
        maxDepth = depth;
        bottomLeft = node.val;

        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          maxDepth,
          bottomLeft,
          secondaryHighlightedNodes: [bottomLeft],
          decision: `🎉 攻入新最深层！锁定该层先登左下角值: Node(${node.val}) (深度 ${depth})`,
          message: `由于先序遍历先左后右，深度 ${depth} 首个碰到的叶子 Node(${node.val}) 必然是该层最靠左的节点！刷新 bottomLeft = ${node.val}。`,
          log: `update: maxDepth=${maxDepth}, bottomLeft=${bottomLeft}`,
          codeLine: lines.updateAns,
          stageId: 'stage-1',
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
        });
      }

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        maxDepth,
        bottomLeft,
        secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
        decision: `叶子节点 Node(${node.val}) 处理完毕，递归 return 返回上一层`,
        message: '叶子已无子树，执行 return 弹出当前递归栈帧。',
        log: `leaf return`,
        codeLine: lines.leafReturn,
        stageId: 'stage-1',
        metrics: {
          '当前节点': `Node(${node.val})`,
          '当前左下角值': bottomLeft != null ? bottomLeft : '-',
          cur: String(node.val),
          depth: String(depth),
          'max-depth': maxDepth >= 0 ? String(maxDepth) : '-',
          result: bottomLeft != null ? String(bottomLeft) : '?',
        },
        statusBadge: { text: '叶子返回', type: 'info' },
      });
      return;
    }

    // 深入左子树
    if (node.left) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        maxDepth,
        bottomLeft,
        secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
        decision: `向左优先深入：准备递归访问左孩子 Node(${node.left.val})`,
        message: `node.left != null，调用 dfs(node.left, depth + 1 = ${depth + 1})。`,
        log: `recurse left: dfs(node=${node.left.val})`,
        codeLine: lines.recurseLeft,
        stageId: 'stage-1',
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
      });
      dfs(node.left, depth + 1);
    }

    // 深入右子树
    if (node.right) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        maxDepth,
        bottomLeft,
        secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
        decision: `向右下探：准备递归访问右孩子 Node(${node.right.val})`,
        message: `node.right != null，调用 dfs(node.right, depth + 1 = ${depth + 1})。`,
        log: `recurse right: dfs(node=${node.right.val})`,
        codeLine: lines.recurseRight,
        stageId: 'stage-1',
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
      });
      dfs(node.right, depth + 1);
    }
  }

  dfs(root, 0);

  // 最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: null,
    depth: 0,
    maxDepth,
    bottomLeft,
    secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
    decision: `🎉 全树遍历结束！最底层 (深度 ${maxDepth}) 最左边节点的值为 ${bottomLeft}`,
    message: `深度优先搜索完成，全树最大深度为 ${maxDepth}，最终答案锁定为 ${bottomLeft}。`,
    log: `done: bottomLeft = ${bottomLeft}`,
    codeLine: lines.returnAns,
    stageId: 'stage-1',
    metrics: {
      '当前节点': '—',
      '全树最大深度': maxDepth,
      '最终左下角值': bottomLeft != null ? bottomLeft : '-',
      cur: '-',
      depth: '0',
      'max-depth': String(maxDepth),
      result: bottomLeft != null ? String(bottomLeft) : '?',
    },
    statusBadge: { text: `答案: ${bottomLeft}`, type: 'success' },
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
      maxDepth: -1,
      bottomLeft: null,
      decision: '算法启动：BFS 队列空树特判',
      message: '传入二叉树根节点为空，直接返回 0。',
      log: 'root == null -> return 0',
      codeLine: lines.entry,
      stageId: 'stage-2',
      metrics: { '当前节点': 'null', '左下角值': 0 },
      statusBadge: { text: '空树: 0', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: -1,
      bottomLeft: null,
      decision: '空节点基准退出',
      message: 'if (root == null) return 0。',
      log: 'return 0',
      codeLine: lines.baseNull,
      stageId: 'stage-2',
      metrics: { '当前节点': 'null', '左下角值': 0 },
      statusBadge: { text: '基准退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: -1,
      bottomLeft: 0,
      decision: '计算完成：返回 0',
      message: 'BFS 遍历完成，返回 0。',
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
    secondaryHighlightedNodes: [root.val],
    decision: `算法启动：根节点 Node(${root.val}) 入队并初始化 bottomLeft = ${root.val}`,
    message: '标准层序广搜：按层处理，每层的第一个出队节点 (i == 0) 即为该层最靠左的节点！',
    log: `BFS queue.offer(root: ${root.val}), bottomLeft = ${root.val}`,
    codeLine: lines.entry,
    stageId: 'stage-2',
    queueState: [root.val],
    metrics: { '当前出队节点': `Node(${root.val})`, '当前层首左值': root.val, '队列长度': 1 },
    statusBadge: { text: '根节点入队', type: 'info' },
  });

  const queue: TreeNode[] = [root];
  let bottomLeft = root.val;
  let currentLevel = 0;

  while (queue.length > 0) {
    const size = queue.length;

    steps.push({
      tree: cloneStateDepTree(root),
      current: queue[0].val,
      depth: currentLevel,
      maxDepth: currentLevel,
      bottomLeft,
      secondaryHighlightedNodes: [bottomLeft],
      queueState: queue.map((n) => n.val),
      decision: `🌊 开启第 ${currentLevel} 层遍历：本层节点总数 size = ${size}`,
      message: `int size = queue.size() = ${size}。准备逐一出队本层节点，其中首个出队节点将成为本层左边界。`,
      log: `Level ${currentLevel}: size = ${size}, current queue: [${queue.map((n) => n.val).join(', ')}]`,
      codeLine: lines.getLevelSize,
      stageId: 'stage-2',
      metrics: { '当前考察层': currentLevel, '本层宽度': size, '当前左下角值': bottomLeft },
      statusBadge: { text: `第 ${currentLevel} 层 (${size}节点)`, type: 'info' },
    });

    for (let i = 0; i < size; i++) {
      const cur = queue.shift()!;

      steps.push({
        tree: cloneStateDepTree(root),
        current: cur.val,
        depth: currentLevel,
        maxDepth: currentLevel,
        bottomLeft,
        secondaryHighlightedNodes: [bottomLeft],
        queueState: queue.map((n) => n.val),
        decision: `节点 Node(${cur.val}) 出队 (本层序号 i = ${i} / ${size})`,
        message: `TreeNode cur = queue.poll()。检查是否为本层首个节点 (i == 0)。`,
        log: `poll: node=${cur.val}, index=${i}`,
        codeLine: lines.pollNode,
        stageId: 'stage-2',
        metrics: { '当前出队节点': `Node(${cur.val})`, '本层索引': `${i + 1}/${size}`, '当前左下角值': bottomLeft },
        statusBadge: { text: `出队: ${cur.val}`, type: 'info' },
      });

      // 层首捕获
      if (i === 0) {
        bottomLeft = cur.val;
        steps.push({
          tree: cloneStateDepTree(root),
          current: cur.val,
          depth: currentLevel,
          maxDepth: currentLevel,
          bottomLeft,
          secondaryHighlightedNodes: [bottomLeft],
          queueState: queue.map((n) => n.val),
          decision: `🎯 命中第 ${currentLevel} 层层首节点！捕获左边界: bottomLeft = ${bottomLeft}`,
          message: `i == 0 成立！该节点是第 ${currentLevel} 层最靠左的节点，更新临时答案 bottomLeft = ${bottomLeft}。`,
          log: `capture level head: bottomLeft = ${bottomLeft}`,
          codeLine: lines.captureFirst,
          stageId: 'stage-2',
          metrics: { '当前出队节点': `Node(${cur.val})`, [`第${currentLevel}层最左值`]: bottomLeft, '当前左下角值': bottomLeft },
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
          queueState: queue.map((n) => n.val),
          decision: `左孩子 Node(${cur.left.val}) 存在，推入下一层队列`,
          message: `queue.offer(cur.left: Node(${cur.left.val}))。`,
          log: `offer left: ${cur.left.val}`,
          codeLine: lines.pushLeft,
          stageId: 'stage-2',
          metrics: { '当前出队节点': `Node(${cur.val})`, '推入左孩子': `Node(${cur.left.val})`, '当前左下角值': bottomLeft },
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
          queueState: queue.map((n) => n.val),
          decision: `右孩子 Node(${cur.right.val}) 存在，推入下一层队列`,
          message: `queue.offer(cur.right: Node(${cur.right.val}))。`,
          log: `offer right: ${cur.right.val}`,
          codeLine: lines.pushRight,
          stageId: 'stage-2',
          metrics: { '当前出队节点': `Node(${cur.val})`, '推入右孩子': `Node(${cur.right.val})`, '当前左下角值': bottomLeft },
          statusBadge: { text: `入队右: ${cur.right.val}`, type: 'info' },
        });
      }
    }

    currentLevel++;
  }

  // 结算最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: null,
    depth: currentLevel - 1,
    maxDepth: currentLevel - 1,
    bottomLeft,
    secondaryHighlightedNodes: [bottomLeft],
    decision: `🎉 BFS 队列排空，遍历完成！最后一层最左边节点为 ${bottomLeft}`,
    message: `全部 ${currentLevel} 层节点遍历完毕，最后一层的层首节点即为最终树左下角的值: ${bottomLeft}。`,
    log: `BFS done: bottomLeft = ${bottomLeft}`,
    codeLine: lines.returnAns,
    stageId: 'stage-2',
    metrics: { '当前出队节点': '—', '全树总层数': currentLevel, '最终左下角值': bottomLeft },
    statusBadge: { text: `答案: ${bottomLeft}`, type: 'success' },
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
      maxDepth: -1,
      bottomLeft: null,
      decision: '算法启动：逆向 BFS 空树特判',
      message: '传入二叉树根节点为空，直接返回 0。',
      log: 'root == null -> return 0',
      codeLine: lines.entry,
      stageId: 'stage-3',
      metrics: { '当前节点': 'null', '左下角值': 0 },
      statusBadge: { text: '空树: 0', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: -1,
      bottomLeft: null,
      decision: '空节点基准退出',
      message: 'if (root == null) return 0。',
      log: 'return 0',
      codeLine: lines.baseNull,
      stageId: 'stage-3',
      metrics: { '当前节点': 'null', '左下角值': 0 },
      statusBadge: { text: '基准退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxDepth: -1,
      bottomLeft: 0,
      decision: '计算完成：返回 0',
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

  while (queue.length > 0) {
    cur = queue.shift()!;

    steps.push({
      tree: cloneStateDepTree(root),
      current: cur.val,
      depth: 0,
      maxDepth: 0,
      bottomLeft: cur.val,
      secondaryHighlightedNodes: [cur.val],
      queueState: queue.map((n) => n.val),
      decision: `节点 Node(${cur.val}) 出队，刷新最后弹出游标 cur = Node(${cur.val})`,
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
        queueState: queue.map((n) => n.val),
        decision: `【先入右孩子】Node(${cur.right.val}) 优先入队`,
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
        queueState: queue.map((n) => n.val),
        decision: `【后入左孩子】Node(${cur.left.val}) 后入队`,
        message: `if (cur.left != null) queue.offer(cur.left)。保证左孩子在队列最末端，成为最后出队的候选者！`,
        log: `offer left: ${cur.left.val}`,
        codeLine: lines.pushLeftSecond,
        stageId: 'stage-3',
        metrics: { '最新出队节点': `Node(${cur.val})`, '后入左': `Node(${cur.left.val})`, '队列新大小': queue.length },
        statusBadge: { text: `入左: ${cur.left.val}`, type: 'info' },
      });
    }
  }

  // 最终步：最后一个出队的就是答案！
  steps.push({
    tree: cloneStateDepTree(root),
    current: null,
    depth: 0,
    maxDepth: 0,
    bottomLeft: cur.val,
    secondaryHighlightedNodes: [cur.val],
    decision: `🎉 队列彻底排空！最后一个从队列弹出的节点 Node(${cur.val}) 必为树左下角的值！`,
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
// 表现层画板渲染器 (Presentation Canvas Renderer)
// =========================================================================
function renderBottomLeftCanvas(container: HTMLElement, step: BottomLeftStep): void {
  if (step.tree) {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: step.bottomLeft != null ? [step.bottomLeft] : [],
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
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">空树无任何节点，左下角值为空</span>
      </div>
    `;
  }
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
      codeLanguages: BOTTOM_LEFT_STAGE1_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [2, 1, 3]);
        const root = buildTreeFromArr(arr);
        return buildBottomLeftStage1PreorderSteps(root);
      },
      renderCanvas: (container, step) => renderBottomLeftCanvas(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 标准层序 BFS 队列与层首捕获 (Standard Level-Order BFS)',
      shortName: '标准层序BFS',
      num: 2,
      codeLanguages: BOTTOM_LEFT_STAGE2_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [2, 1, 3]);
        const root = buildTreeFromArr(arr);
        return buildBottomLeftStage2BfsSteps(root);
      },
      renderCanvas: (container, step) => renderBottomLeftCanvas(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 逆向右先层序 BFS (Reverse Right-to-Left BFS · 最优解)',
      shortName: '逆向右先BFS',
      num: 3,
      codeLanguages: BOTTOM_LEFT_STAGE3_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [2, 1, 3]);
        const root = buildTreeFromArr(arr);
        return buildBottomLeftStage3ReverseBfsSteps(root);
      },
      renderCanvas: (container, step) => renderBottomLeftCanvas(container, step),
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
});
