/**
 * LeetCode 404: 左叶子之和 (Sum of Left Leaves)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * 核心多阶段演化体系:
 *   Stage 1: 后序分治递归与父节点前瞻探查 (Postorder Recursive DFS)
 *   Stage 2: 广度优先搜索层序队列遍历 (BFS Queue Level Order)
 *   Stage 3: 显式迭代栈遍历与左叶子累加 (Iterative Stack DFS · 零系统栈开销)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { parseTreeArray } from '../../../core/input-primitives';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  LEFT_LEAVES_STAGE1_CODES,
  LEFT_LEAVES_STAGE1_LINES,
  LEFT_LEAVES_STAGE2_CODES,
  LEFT_LEAVES_STAGE2_LINES,
  LEFT_LEAVES_STAGE3_CODES,
  LEFT_LEAVES_STAGE3_LINES,
} from './left-leaves-stage-codes';
import {
  LEFT_LEAVES_PROBLEM_HTML,
  LEFT_LEAVES_ANALYSIS_HTML,
} from './left-leaves-problem-content';

// =========================================================================
// 步骤状态契约 (Step Contract)
// =========================================================================
export interface LeftLeavesStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  leftLeafVal?: number | null;
  sum: number;
  depth?: number;
  isLeft?: boolean;
  message: string;
  log: string;
  decision: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };
  stageId?: string;
  leftNodes?: Set<number>;
  highlightedNodes?: number[];
  secondaryHighlightedNodes?: number[];
  visitedNodes?: number[];
  queueState?: number[];
  stackState?: number[];
}

// =========================================================================
// Stage 1 步骤生成器: 后序分治递归与父节点前瞻探查 (Postorder Recursive DFS)
// =========================================================================
export function buildLeftLeavesStage1Steps(root: TreeNode | null): LeftLeavesStep[] {
  const steps: LeftLeavesStep[] = [];
  const lines = LEFT_LEAVES_STAGE1_LINES;
  const leftNodes = new Set<number>();
  let currentSum = 0;

  // 空树边界特判 (合规 3 步)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      sum: 0,
      depth: 0,
      decision: '算法启动：空树特判',
      message: '传入二叉树根节点为空 (null)，启动递归基准条件检验。',
      log: 'sumOfLeftLeaves(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-1',
      metrics: { '当前考察节点': 'null', '左叶子之和': 0 },
      statusBadge: { text: '空树: 0', type: 'info' },
      leftNodes: new Set(),
    });
    steps.push({
      tree: null,
      current: null,
      sum: 0,
      depth: 0,
      decision: '空节点递归基准：返回 0',
      message: 'if (root == null) return 0。',
      log: 'root == null -> return 0',
      codeLine: lines.baseNull,
      stageId: 'stage-1',
      metrics: { '当前考察节点': 'null', '左叶子之和': 0 },
      statusBadge: { text: '基准退出', type: 'info' },
      leftNodes: new Set(),
    });
    steps.push({
      tree: null,
      current: null,
      sum: 0,
      depth: 0,
      decision: '计算完成：空树左叶子之和为 0',
      message: '空树不存在任何节点，左叶子总和为 0。',
      log: 'return 0',
      codeLine: lines.returnSum,
      stageId: 'stage-1',
      metrics: { '左叶子总数': 0, '左叶子之和': 0 },
      statusBadge: { text: '总和: 0', type: 'success' },
      leftNodes: new Set(),
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    sum: 0,
    depth: 0,
    decision: `启动左叶子之和递归计算: root = Node(${root.val})`,
    message: '二叉树左叶子判定核心：不能仅凭节点自身推断，必须由其父节点通过 root.left 前瞻审视！',
    log: `sumOfLeftLeaves(root: ${root.val}), depth = 0`,
    codeLine: lines.entry,
    stageId: 'stage-1',
    metrics: { '当前考察节点': `Node(${root.val})`, '最新命中左叶子': '无', '左叶子之和': 0 },
    statusBadge: { text: '开始递归', type: 'info' },
    leftNodes: new Set(),
  });

  // 单节点特判呈现 (根节点不是任何节点的左孩子，左叶子和为 0)
  if (!root.left && !root.right) {
    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      sum: 0,
      depth: 0,
      decision: `根节点 Node(${root.val}) 无任何子节点，属于单节点树`,
      message: `避坑提醒：根节点自身虽为叶子，但它不是任何节点的「左孩子」！故左叶子之和为 0。`,
      log: `root has no children -> leftSum = 0, rightSum = 0`,
      codeLine: lines.isLeftLeaf,
      stageId: 'stage-1',
      metrics: { '当前考察节点': `Node(${root.val})`, '最新命中左叶子': '无', '左叶子之和': 0 },
      statusBadge: { text: '根非左叶子', type: 'warning' },
      leftNodes: new Set(),
    });
    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      sum: 0,
      depth: 0,
      decision: `计算完成：单节点树左叶子之和为 0`,
      message: `整树中不存在任何满足父子关系的左叶子节点，返回结果 0。`,
      log: `return leftSum + rightSum = 0`,
      codeLine: lines.returnSum,
      stageId: 'stage-1',
      metrics: { '当前考察节点': `Node(${root.val})`, '左叶子总数': 0, '左叶子之和': 0 },
      statusBadge: { text: '总和: 0', type: 'success' },
      leftNodes: new Set(),
    });
    return steps;
  }

  function dfs(node: TreeNode | null, depth: number): number {
    if (!node) return 0;

    let leftSum = 0;

    // 前瞻判定：检查当前节点的左孩子是否恰好为叶子节点
    if (node.left && !node.left.left && !node.left.right) {
      leftSum = node.left.val;
      currentSum += leftSum;
      leftNodes.add(node.left.val);

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        leftLeafVal: node.left.val,
        sum: currentSum,
        depth,
        decision: `🎉 节点 Node(${node.val}) 的左孩子 Node(${node.left.val}) 是叶子！命中左叶子！`,
        message: `充要条件满足：Node(${node.left.val}) 是 Node(${node.val}) 的左孩子，且左右皆空。累加 ${node.left.val} 到左叶子之和！`,
        log: `hit left leaf: node ${node.val}'s left child ${node.left.val} -> sum = ${currentSum}`,
        codeLine: lines.isLeftLeaf,
        stageId: 'stage-1',
        leftNodes: new Set(leftNodes),
        secondaryHighlightedNodes: [node.left.val],
        metrics: {
          '当前考察节点': `Node(${node.val})`,
          '最新命中左叶子': `Node(${node.left.val})`,
          '左叶子之和': currentSum,
        },
        statusBadge: { text: `命中左叶子: ${node.left.val}`, type: 'success' },
      });
    } else if (node.left) {
      // 左孩子不是叶子，继续下探探索左孩子的子树
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        sum: currentSum,
        depth,
        decision: `节点 Node(${node.val}) 的左孩子非叶子，递归深入左子树`,
        message: `调用 sumOfLeftLeaves(node.left: Node(${node.left.val}))，向下寻找深层左叶子。`,
        log: `node ${node.val}.left (${node.left.val}) is not leaf -> recurse left`,
        codeLine: lines.recurseLeft,
        stageId: 'stage-1',
        leftNodes: new Set(leftNodes),
        metrics: {
          '当前考察节点': `Node(${node.val})`,
          '下探分支': `左孩子 Node(${node.left.val})`,
          '左叶子之和': currentSum,
        },
        statusBadge: { text: '深入左子树', type: 'info' },
      });
      leftSum = dfs(node.left, depth + 1);
    }

    let rightSum = 0;
    if (node.right) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        sum: currentSum,
        depth,
        decision: `深入节点 Node(${node.val}) 的右子树寻找内部左叶子`,
        message: `注意：虽然 Node(${node.right.val}) 自身是右孩子，但其子树内部完全可能包含左叶子！继续递归。`,
        log: `node ${node.val} recurse right: Node(${node.right.val})`,
        codeLine: lines.recurseRight,
        stageId: 'stage-1',
        leftNodes: new Set(leftNodes),
        metrics: {
          '当前考察节点': `Node(${node.val})`,
          '下探分支': `右孩子 Node(${node.right.val})`,
          '左叶子之和': currentSum,
        },
        statusBadge: { text: '深入右子树', type: 'info' },
      });
      rightSum = dfs(node.right, depth + 1);
    }

    const total = leftSum + rightSum;
    if (node !== root) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        sum: currentSum,
        depth,
        decision: `节点 Node(${node.val}) 汇聚左右贡献: 左 ${leftSum}, 右 ${rightSum}`,
        message: `以 Node(${node.val}) 为根的子树中所有左叶子之和为 ${leftSum} + ${rightSum} = ${total}。向上传递。`,
        log: `node ${node.val} aggregated: leftSum=${leftSum}, rightSum=${rightSum} -> total=${total}`,
        codeLine: lines.returnSum,
        stageId: 'stage-1',
        leftNodes: new Set(leftNodes),
        metrics: {
          '当前考察节点': `Node(${node.val})`,
          '本子树贡献': total,
          '全树累计总和': currentSum,
        },
        statusBadge: { text: `子树小计: ${total}`, type: 'info' },
      });
    }

    return total;
  }

  dfs(root, 0);

  // 收尾最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    sum: currentSum,
    depth: 0,
    decision: `🎉 全树搜索完成！所有左叶子之和为 ${currentSum}`,
    message: `全树递归遍历完毕，共收集到 ${leftNodes.size} 个左叶子节点 [${Array.from(leftNodes).join(', ')}]，最终左叶子之和为 ${currentSum}。`,
    log: `Final result: sumOfLeftLeaves = ${currentSum}`,
    codeLine: lines.returnSum,
    stageId: 'stage-1',
    leftNodes: new Set(leftNodes),
    secondaryHighlightedNodes: Array.from(leftNodes),
    metrics: {
      '当前考察节点': `Node(${root.val})`,
      '左叶子总数': leftNodes.size,
      '左叶子之和': currentSum,
    },
    statusBadge: { text: `最终总和: ${currentSum}`, type: 'success' },
  });

  return steps;
}

// =========================================================================
// Stage 2 步骤生成器: 广度优先搜索层序队列遍历 (BFS Queue Traversal)
// =========================================================================
export function buildLeftLeavesStage2BfsSteps(root: TreeNode | null): LeftLeavesStep[] {
  const steps: LeftLeavesStep[] = [];
  const lines = LEFT_LEAVES_STAGE2_LINES;
  const leftNodes = new Set<number>();
  let currentSum = 0;

  // 空树特判 (3 步合规)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      sum: 0,
      decision: '算法启动：BFS 队列空树特判',
      message: '传入二叉树根节点为 null，无需入队，直接返回 0。',
      log: 'root == null -> return 0',
      codeLine: lines.entry,
      stageId: 'stage-2',
      metrics: { 'BFS 队列': '[]', '左叶子之和': 0 },
      statusBadge: { text: '空树: 0', type: 'info' },
      leftNodes: new Set(),
    });
    steps.push({
      tree: null,
      current: null,
      sum: 0,
      decision: '队列初始化跳过',
      message: 'if (root == null) return 0。',
      log: 'skip queue offer',
      codeLine: lines.baseNull,
      stageId: 'stage-2',
      metrics: { 'BFS 队列': '[]', '左叶子之和': 0 },
      statusBadge: { text: '基准退出', type: 'info' },
      leftNodes: new Set(),
    });
    steps.push({
      tree: null,
      current: null,
      sum: 0,
      decision: '计算完成：空树返回 0',
      message: 'BFS 遍历完成，返回左叶子之和 0。',
      log: 'return 0',
      codeLine: lines.returnSum,
      stageId: 'stage-2',
      metrics: { '左叶子之和': 0 },
      statusBadge: { text: '总和: 0', type: 'success' },
      leftNodes: new Set(),
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    sum: 0,
    decision: `算法启动：根节点 Node(${root.val}) 入队`,
    message: '广度优先搜索层序遍历：构建先进先出队列 Queue，将根节点压入队列，初始化 sum = 0。',
    log: `BFS queue.offer(root: ${root.val}), sum = 0`,
    codeLine: lines.initQueue,
    stageId: 'stage-2',
    metrics: { '当前考察节点': `Node(${root.val})`, '队列大小': 1, '左叶子之和': 0 },
    statusBadge: { text: '根节点入队', type: 'info' },
    leftNodes: new Set(),
    queueState: [root.val],
  });

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const cur = queue.shift()!;

    steps.push({
      tree: cloneStateDepTree(root),
      current: cur.val,
      sum: currentSum,
      decision: `节点 Node(${cur.val}) 出队，前瞻检查其子节点`,
      message: `从队列头部取出当前节点 Node(${cur.val})，检查其左孩子是否为左叶子，并将非叶子孩子推入队列。`,
      log: `queue.poll() -> Node(${cur.val}), queue remaining: ${queue.length}`,
      codeLine: lines.pollNode,
      stageId: 'stage-2',
      leftNodes: new Set(leftNodes),
      queueState: queue.map((n) => n.val),
      metrics: { '当前出队节点': `Node(${cur.val})`, '剩余队列深度': queue.length, '左叶子之和': currentSum },
      statusBadge: { text: `出队: ${cur.val}`, type: 'info' },
    });

    // 检查左孩子
    if (cur.left) {
      if (!cur.left.left && !cur.left.right) {
        currentSum += cur.left.val;
        leftNodes.add(cur.left.val);

        steps.push({
          tree: cloneStateDepTree(root),
          current: cur.val,
          leftLeafVal: cur.left.val,
          sum: currentSum,
          decision: `🎉 发现左叶子 Node(${cur.left.val})！累加其值到 sum`,
          message: `节点 Node(${cur.left.val}) 是 Node(${cur.val}) 的左孩子且为叶子，累加其值 ${cur.left.val}，且无需将其推入队列！`,
          log: `found left leaf ${cur.left.val} -> sum = ${currentSum}`,
          codeLine: lines.findLeftLeaf,
          stageId: 'stage-2',
          leftNodes: new Set(leftNodes),
          secondaryHighlightedNodes: [cur.left.val],
          queueState: queue.map((n) => n.val),
          metrics: {
            '当前父节点': `Node(${cur.val})`,
            '最新命中左叶子': `Node(${cur.left.val})`,
            '左叶子之和': currentSum,
          },
          statusBadge: { text: `命中左叶子: ${cur.left.val}`, type: 'success' },
        });
      } else {
        queue.push(cur.left);
        steps.push({
          tree: cloneStateDepTree(root),
          current: cur.val,
          secondaryHighlightedNodes: [cur.left.val],
          sum: currentSum,
          decision: `左孩子 Node(${cur.left.val}) 非叶子，将其推入队列`,
          message: `左孩子内部还有分支，将其加入队列等待后续广搜。`,
          log: `queue.offer(cur.left: ${cur.left.val})`,
          codeLine: lines.pushLeft,
          stageId: 'stage-2',
          leftNodes: new Set(leftNodes),
          queueState: queue.map((n) => n.val),
          metrics: { '当前父节点': `Node(${cur.val})`, '入队左孩子': `Node(${cur.left.val})`, '左叶子之和': currentSum },
          statusBadge: { text: `入队: ${cur.left.val}`, type: 'info' },
        });
      }
    }

    // 检查右孩子
    if (cur.right) {
      queue.push(cur.right);
      steps.push({
        tree: cloneStateDepTree(root),
        current: cur.val,
        secondaryHighlightedNodes: [cur.right.val],
        sum: currentSum,
        decision: `右孩子 Node(${cur.right.val}) 存在，推入队列`,
        message: `右孩子自身非左叶子，但其子树内可能含有左叶子，推入队列等待遍历。`,
        log: `queue.offer(cur.right: ${cur.right.val})`,
        codeLine: lines.pushRight,
        stageId: 'stage-2',
        leftNodes: new Set(leftNodes),
        queueState: queue.map((n) => n.val),
        metrics: { '当前父节点': `Node(${cur.val})`, '入队右孩子': `Node(${cur.right.val})`, '左叶子之和': currentSum },
        statusBadge: { text: `入队: ${cur.right.val}`, type: 'info' },
      });
    }
  }

  // 结算最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    sum: currentSum,
    decision: `🎉 BFS 队列排空，遍历完成！左叶子之和为 ${currentSum}`,
    message: `层序遍历扫描完树中所有节点，共命中 ${leftNodes.size} 个左叶子，累加总和为 ${currentSum}。`,
    log: `BFS done, sum = ${currentSum}`,
    codeLine: lines.returnSum,
    stageId: 'stage-2',
    leftNodes: new Set(leftNodes),
    secondaryHighlightedNodes: Array.from(leftNodes),
    metrics: { '左叶子总数': leftNodes.size, '左叶子之和': currentSum },
    statusBadge: { text: `最终总和: ${currentSum}`, type: 'success' },
  });

  return steps;
}

// =========================================================================
// Stage 3 步骤生成器: 显式迭代栈遍历与左叶子累加 (Iterative Stack DFS)
// =========================================================================
export function buildLeftLeavesStage3StackSteps(root: TreeNode | null): LeftLeavesStep[] {
  const steps: LeftLeavesStep[] = [];
  const lines = LEFT_LEAVES_STAGE3_LINES;
  const leftNodes = new Set<number>();
  let currentSum = 0;

  // 空树特判 (3 步合规)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      sum: 0,
      decision: '算法启动：显式栈空树特判',
      message: '传入根节点为 null，无需初始化栈，直接返回 0。',
      log: 'root == null -> return 0',
      codeLine: lines.entry,
      stageId: 'stage-3',
      metrics: { '栈状态': '[]', '左叶子之和': 0 },
      statusBadge: { text: '空树: 0', type: 'info' },
      leftNodes: new Set(),
    });
    steps.push({
      tree: null,
      current: null,
      sum: 0,
      decision: '空节点特判退出',
      message: 'if (root == null) return 0。',
      log: 'base null return',
      codeLine: lines.baseNull,
      stageId: 'stage-3',
      metrics: { '栈状态': '[]', '左叶子之和': 0 },
      statusBadge: { text: '基准退出', type: 'info' },
      leftNodes: new Set(),
    });
    steps.push({
      tree: null,
      current: null,
      sum: 0,
      decision: '计算完成：返回 0',
      message: '显式栈探索完毕，返回左叶子之和 0。',
      log: 'return 0',
      codeLine: lines.returnSum,
      stageId: 'stage-3',
      metrics: { '左叶子之和': 0 },
      statusBadge: { text: '总和: 0', type: 'success' },
      leftNodes: new Set(),
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    sum: 0,
    decision: `算法启动：根节点 Node(${root.val}) 压入显式栈`,
    message: '显式堆栈模拟 DFS 前序遍历：构建 Deque<TreeNode> 栈，将根节点压栈，初始化 sum = 0。',
    log: `stack.push(root: ${root.val}), sum = 0`,
    codeLine: lines.initStack,
    stageId: 'stage-3',
    metrics: { '当前考察节点': `Node(${root.val})`, '栈大小': 1, '左叶子之和': 0 },
    statusBadge: { text: '根节点压栈', type: 'info' },
    leftNodes: new Set(),
    stackState: [root.val],
  });

  const stack: TreeNode[] = [root];

  while (stack.length > 0) {
    const cur = stack.pop()!;

    steps.push({
      tree: cloneStateDepTree(root),
      current: cur.val,
      sum: currentSum,
      decision: `节点 Node(${cur.val}) 弹出栈顶`,
      message: `从显式栈中弹出当前节点 Node(${cur.val})，检查其左孩子是否为左叶子，再将右孩子与左孩子分别压栈。`,
      log: `stack.pop() -> Node(${cur.val}), stack depth: ${stack.length}`,
      codeLine: lines.popNode,
      stageId: 'stage-3',
      leftNodes: new Set(leftNodes),
      stackState: stack.map((n) => n.val),
      metrics: { '当前弹出节点': `Node(${cur.val})`, '剩余栈深度': stack.length, '左叶子之和': currentSum },
      statusBadge: { text: `出栈: ${cur.val}`, type: 'info' },
    });

    // 检查左孩子是否为叶子
    if (cur.left && !cur.left.left && !cur.left.right) {
      currentSum += cur.left.val;
      leftNodes.add(cur.left.val);

      steps.push({
        tree: cloneStateDepTree(root),
        current: cur.val,
        leftLeafVal: cur.left.val,
        sum: currentSum,
        decision: `🎉 栈顶节点 Node(${cur.val}) 的左孩子 Node(${cur.left.val}) 是左叶子！累加其值`,
        message: `Node(${cur.left.val}) 是左叶子，累加 ${cur.left.val} 到左叶子之和，且无需将此叶子压栈！`,
        log: `stack hit left leaf: ${cur.left.val} -> sum = ${currentSum}`,
        codeLine: lines.checkLeftLeaf,
        stageId: 'stage-3',
        leftNodes: new Set(leftNodes),
        secondaryHighlightedNodes: [cur.left.val],
        stackState: stack.map((n) => n.val),
        metrics: {
          '当前父节点': `Node(${cur.val})`,
          '最新命中左叶子': `Node(${cur.left.val})`,
          '左叶子之和': currentSum,
        },
        statusBadge: { text: `命中左叶子: ${cur.left.val}`, type: 'success' },
      });
    }

    // 先压右孩子（保证左孩子先弹出处理）
    if (cur.right) {
      stack.push(cur.right);
      steps.push({
        tree: cloneStateDepTree(root),
        current: cur.val,
        secondaryHighlightedNodes: [cur.right.val],
        sum: currentSum,
        decision: `右孩子 Node(${cur.right.val}) 压入显式栈`,
        message: `DFS 前序遍历优先处理左分支，故先将右孩子压栈后出。`,
        log: `stack.push(cur.right: ${cur.right.val})`,
        codeLine: lines.pushRight,
        stageId: 'stage-3',
        leftNodes: new Set(leftNodes),
        stackState: stack.map((n) => n.val),
        metrics: { '当前父节点': `Node(${cur.val})`, '压栈右孩子': `Node(${cur.right.val})`, '左叶子之和': currentSum },
        statusBadge: { text: `压右: ${cur.right.val}`, type: 'info' },
      });
    }

    // 若左孩子不是叶子，再将左孩子压栈
    if (cur.left && (cur.left.left || cur.left.right)) {
      stack.push(cur.left);
      steps.push({
        tree: cloneStateDepTree(root),
        current: cur.val,
        secondaryHighlightedNodes: [cur.left.val],
        sum: currentSum,
        decision: `非叶左孩子 Node(${cur.left.val}) 压入显式栈`,
        message: `左孩子内部还有分支，将其压入显式栈等待深度优先探索。`,
        log: `stack.push(cur.left: ${cur.left.val})`,
        codeLine: lines.pushLeft,
        stageId: 'stage-3',
        leftNodes: new Set(leftNodes),
        stackState: stack.map((n) => n.val),
        metrics: { '当前父节点': `Node(${cur.val})`, '压栈左孩子': `Node(${cur.left.val})`, '左叶子之和': currentSum },
        statusBadge: { text: `压左: ${cur.left.val}`, type: 'info' },
      });
    }
  }

  // 结算最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    sum: currentSum,
    decision: `🎉 显式栈排空，迭代遍历完成！左叶子之和为 ${currentSum}`,
    message: `显式栈模拟前序遍历完成，零递归栈开销，最终所有左叶子之和为 ${currentSum}。`,
    log: `Stack DFS done, sum = ${currentSum}`,
    codeLine: lines.returnSum,
    stageId: 'stage-3',
    leftNodes: new Set(leftNodes),
    secondaryHighlightedNodes: Array.from(leftNodes),
    metrics: { '左叶子总数': leftNodes.size, '左叶子之和': currentSum },
    statusBadge: { text: `最终总和: ${currentSum}`, type: 'success' },
  });

  return steps;
}

// =========================================================================
// 统一向下兼容入口 (100% Backward Compatible Step Generator)
// =========================================================================
export function buildLeftLeavesSteps(root: TreeNode | null): LeftLeavesStep[] {
  return buildLeftLeavesStage1Steps(root);
}

// =========================================================================
// 表现层画板渲染器 (Presentation Canvas Renderer)
// =========================================================================
function renderLeftLeavesCanvas(container: HTMLElement, step: LeftLeavesStep): void {
  if (step.tree) {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: step.leftNodes ? Array.from(step.leftNodes) : [],
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
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">空树无任何节点，左叶子之和为 0</span>
      </div>
    `;
  }
}

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================
export const leftLeavesVisualizer = registerDeclarativeAlgorithm<LeftLeavesStep>({
  id: 'left-leaves',
  name: '左叶子之和',
  category: 'tree',
  icon: '🍃',
  difficulty: 1,
  levelOrder: 404,
  aliases: ['leetcode-404', 'sum-of-left-leaves'],
  learningGoal: '深刻理解左叶子的充要定义，掌握父节点前瞻探查法则，对比递归分治、BFS 队列与显式迭代栈',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H) / O(W)',
  inputs: [
    {
      id: 'tree',
      label: '二叉树层序数组',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      placeholder: '例如: 3, 9, 20, null, null, 15, 7',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 经典二分叉 (和 24)',
      values: { tree: '3, 9, 20, null, null, 15, 7' },
      description: '根 3 的左孩子 9 是叶子(9)，20 的左孩子 15 是叶子(15)，左叶子之和为 24',
    },
    {
      label: 'LeetCode 示例 2: 满二叉树 (和 4)',
      values: { tree: '1, 2, 3, 4, 5' },
      description: '根 1 的左孩子 2 的左孩子 4 是叶子，左叶子之和为 4',
    },
    {
      label: '单节点根树 (避坑用例，和 0)',
      values: { tree: '1' },
      description: '根 1 虽是叶子但非任何节点的左孩子，左叶子之和严格为 0',
    },
    {
      label: '空树用例 (和 0)',
      values: { tree: '[]' },
      description: '空树无节点，左叶子之和为 0',
    },
  ],
  metrics: [
    { id: 'cur', label: '当前考察节点', color: '#fab387' },
    { id: 'leaf', label: '最新命中左叶子', color: '#10b981' },
    { id: 'result', label: '左叶子之和', color: '#2563eb' },
  ],
  codeLanguages: LEFT_LEAVES_STAGE1_CODES,
  problemHtml: LEFT_LEAVES_PROBLEM_HTML,
  analysisHtml: LEFT_LEAVES_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 后序分治递归与父节点前瞻探查 (Postorder Recursive DFS)',
      shortName: '后序前瞻递归',
      num: 1,
      codeLanguages: LEFT_LEAVES_STAGE1_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
        const root = buildTreeFromArr(arr);
        return buildLeftLeavesStage1Steps(root);
      },
      renderCanvas: (container, step) => renderLeftLeavesCanvas(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 广度优先搜索层序队列遍历 (BFS Queue Traversal)',
      shortName: 'BFS 层序队列',
      num: 2,
      codeLanguages: LEFT_LEAVES_STAGE2_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
        const root = buildTreeFromArr(arr);
        return buildLeftLeavesStage2BfsSteps(root);
      },
      renderCanvas: (container, step) => renderLeftLeavesCanvas(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 显式迭代栈遍历与左叶子累加 (Iterative Stack DFS)',
      shortName: '显式迭代栈',
      num: 3,
      codeLanguages: LEFT_LEAVES_STAGE3_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
        const root = buildTreeFromArr(arr);
        return buildLeftLeavesStage3StackSteps(root);
      },
      renderCanvas: (container, step) => renderLeftLeavesCanvas(container, step),
    },
  ],

  generateSteps: (inputs) => {
    const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
    const root = buildTreeFromArr(arr);
    return buildLeftLeavesStage1Steps(root);
  },
  buildSteps: (inputs) => {
    const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
    const root = buildTreeFromArr(arr);
    return buildLeftLeavesStage1Steps(root);
  },
  renderCanvas: (container, step) => renderLeftLeavesCanvas(container, step),
});
