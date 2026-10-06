/**
 * 平衡二叉树步骤编译器 (Balanced Binary Tree Step Compiler · LeetCode 110 / Class 037)
 * Matt Pocock 深模块设计：将 Info 二元组树形 DP、-1 剪枝击穿与显式后序栈推演完全解耦
 */

import { TreeNode, buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import { parseTreeArray } from '../../input-primitives';
import {
  TreeNode036,
  Tree036Step,
} from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import {
  BALANCED_TREE_037_STAGE1_LINES,
  BALANCED_TREE_037_STAGE2_LINES,
  BALANCED_TREE_037_STAGE3_LINES,
} from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-stage-codes';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';

// =========================================================================
// 步骤状态契约 (Step Contract)
// =========================================================================
export interface BalancedTree037Step extends Tree036Step {
  tree: TreeNode | null;
  current: number | null;
  secondaryCurrent?: number | null;
  stageId?: string;
  isBalanced?: boolean;
  height?: number;
  heightMap?: Record<number, number>;
  stackState?: number[];
  callStack?: string[];
  pruned?: boolean;
  action?: string;
  visitedNodes?: number[];
  callTrace?: RecursiveCallTraceSnapshot;
}

/** 收集树中所有有效节点值，支持全景高亮与收尾状态守卫 */
export function collectTreeValues(node: TreeNode | null): number[] {
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

/** 解析输入参数并构建树 */
export function parseBalancedTreeInputs(inputs?: Record<string, any>): TreeNode | null {
  const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
  return buildTreeFromArr(arr);
}

// =========================================================================
// Stage 1 步骤生成器: 自底向上递归与 Info 二元组套路 (Tree DP Info Model)
// =========================================================================
export function buildBalancedStage1Steps(root: TreeNode | null): BalancedTree037Step[] {
  const steps: BalancedTree037Step[] = [];
  const lines = BALANCED_TREE_037_STAGE1_LINES;
  const trace = new RecursiveCallTraceBuilder();

  // 空树边界特判 (生成 3 步合规序列)
  if (!root) {
    trace.addHeader('isBalanced(null)', 0, '<- 根调用特判');
    trace.addConditionHit('① root == null √ 命中 -> return true', 0);
    trace.addReturnLeaf('return true', 0);
    trace.addFinalResult('最终判定: true (空树平衡)', 0, undefined, 'true');

    steps.push({
      tree: null,
      current: null,
      decision: '算法启动：空树特判',
      action: 'entry',
      message: '传入二叉树根节点为空 (null)，启动递归基准条件检验。',
      log: 'isBalanced(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '套路结构体': 'Info { isBalanced: true, height: 0 }', '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '空树平衡', type: 'success' },
      callTrace: trace.snapshot(),
    });
    steps.push({
      tree: null,
      current: null,
      decision: '空节点直接返回 Info(true, 0)',
      action: 'base-check',
      message: '递归基准：x == null 返回 new Info(true, 0)。',
      log: 'process(null) -> return Info(true, 0)',
      codeLine: lines.baseCheck,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '当前高度': 0, '局部平衡性': 'TRUE', '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '基准退出', type: 'info' },
      callTrace: trace.snapshot(),
    });
    steps.push({
      tree: null,
      current: null,
      decision: '空树最终判定：二叉树严格平衡 (TRUE)',
      action: 'done',
      message: '空树天然满足任意两子树高度差 <= 1 的平衡条件。',
      log: 'return process(null).isBalanced -> true',
      codeLine: lines.done,
      stageId: 'stage-1',
      metrics: { '整树最大高度': 0, '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '全树平衡: TRUE', type: 'success' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  // Step 0: 算法入口
  trace.addHeader(`isBalanced(root: Node(${root.val}))`, 0, '<- 根调用开始');
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    decision: `启动平衡二叉树递归信息套路判定: root = Node(${root.val})`,
    action: 'entry',
    message: '二叉树递归套路核心：定义结构体 Info { isBalanced, height }，向左子树要信息，向右子树要信息，最后在本层完成整合。',
    log: `isBalanced(root: ${root.val})`,
    codeLine: lines.entry,
    stageId: 'stage-1',
    activeNodeId: 1,
    metrics: { '当前节点': `Node(${root.val})`, '套路结构体': 'Info { isBalanced, height }', '平衡条件': '|左高 - 右高| <= 1', '整树平衡判定': '计算中' },
    statusBadge: { text: '套路启动', type: 'info' },
    callTrace: trace.snapshot(),
  });

  // Step 1: 辅助递归入口准备
  trace.addRecursePrep(`process(Node(${root.val}))`, 0, '<- 启动递归套路推演');
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    decision: `调用辅助递归函数: return process(root).isBalanced`,
    action: 'call-process',
    message: '进入递归辅助函数 process，向子树索取 Info 结构体并提取 isBalanced 判定结果。',
    log: `call process(Node(${root.val}))`,
    codeLine: lines.callProcess,
    stageId: 'stage-1',
    activeNodeId: 1,
    metrics: { '当前节点': `Node(${root.val})`, '套路结构体': 'Info { isBalanced, height }', '整树平衡判定': '计算中' },
    statusBadge: { text: '调用 process', type: 'info' },
    callTrace: trace.snapshot(),
  });

  interface Info {
    isBalanced: boolean;
    height: number;
  }

  const visitedSet = new Set<number>();

  function process(node: TreeNode | null, depth: number): Info {
    if (!node) {
      trace.addHeader('process(null)', depth);
      trace.addConditionHit('① x == null √ 命中 -> return Info(true, 0)', depth);
      trace.addReturnLeaf('return Info(true, 0)', depth);
      steps.push({
        tree: cloneStateDepTree(root),
        current: null,
        decision: '空节点基准特判：x == null，返回 Info(true, 0)',
        action: 'base-null',
        message: '遇到空子节点，天然平衡且高度为 0，返回 new Info(true, 0)。',
        log: 'process(null) -> Info(true, 0)',
        codeLine: lines.baseCheck,
        stageId: 'stage-1',
        visitedNodes: Array.from(visitedSet),
        metrics: { '当前节点': 'null', '当前高度': 0, '局部平衡性': 'TRUE' },
        statusBadge: { text: '空节点基准', type: 'info' },
        callTrace: trace.snapshot(),
      });
      return { isBalanced: true, height: 0 };
    }

    visitedSet.add(node.val);
    trace.addHeader(`process(Node(${node.val}))`, depth, `<- 深入 Node(${node.val})`);
    trace.addConditionPass(`① x != null (Node(${node.val}))`, depth);

    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      decision: `考察节点 Node(${node.val})：检查判空基准条件`,
      action: 'process-entry',
      message: `节点 Node(${node.val}) != null，判空未命中，准备向左孩子 process(x.left) 索要信息。`,
      log: `process(${node.val}): node != null`,
      codeLine: lines.baseCheck,
      stageId: 'stage-1',
      activeNodeId: node.val,
      visitedNodes: Array.from(visitedSet),
      metrics: { '当前节点': `Node(${node.val})`, '整树平衡判定': '递归计算中' },
      statusBadge: { text: `考察节点 ${node.val}`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 深入左子树
    trace.addRecursePrep(`l = process(${node.left ? `Node(${node.left.val})` : 'null'})`, depth, '<- 索要左子树 Info');
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      secondaryCurrent: node.left ? node.left.val : null,
      decision: `向 Node(${node.val}) 的左子树索要信息：调用 process(x.left)`,
      action: 'left-call',
      message: `准备向左子树发起递归调用 process(x.left)，获取左子树的 Info{isBalanced, height}。`,
      log: `process(${node.val}): call process(left)`,
      codeLine: lines.leftCall,
      stageId: 'stage-1',
      activeNodeId: node.val,
      visitedNodes: Array.from(visitedSet),
      metrics: { '当前节点': `Node(${node.val})`, '正在探测': '左子树' },
      statusBadge: { text: '索要左信息', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const left = process(node.left, depth + 1);

    // 深入右子树
    trace.addRecursePrep(`r = process(${node.right ? `Node(${node.right.val})` : 'null'})`, depth, '<- 索要右子树 Info');
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      secondaryCurrent: node.right ? node.right.val : null,
      decision: `向 Node(${node.val}) 的右子树索要信息：调用 process(x.right)`,
      action: 'right-call',
      message: `左子树信息已就绪 (bal=${left.isBalanced}, h=${left.height})，现在向右子树发起递归调用 process(x.right)。`,
      log: `process(${node.val}): call process(right)`,
      codeLine: lines.rightCall,
      stageId: 'stage-1',
      activeNodeId: node.val,
      visitedNodes: Array.from(visitedSet),
      metrics: { '当前节点': `Node(${node.val})`, '左高已锁定': left.height, '正在探测': '右子树' },
      statusBadge: { text: '索要右信息', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const right = process(node.right, depth + 1);

    // 整合左右子树信息
    const h = Math.max(left.height, right.height) + 1;
    const diff = Math.abs(left.height - right.height);
    const bal = left.isBalanced && right.isBalanced && diff <= 1;

    trace.addUnwindCalc(
      `整合: h = max(${left.height}, ${right.height}) + 1 = ${h}, diff = ${diff} ${diff <= 1 ? '<= 1' : '> 1'}`,
      depth,
      bal ? '局部平衡' : '局部失衡'
    );

    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      secondaryCurrent: node.left ? node.left.val : (node.right ? node.right.val : null),
      decision: `节点 Node(${node.val}) 汇聚左右子树: 左高 ${left.height}, 右高 ${right.height}, 差值 ${diff}`,
      action: 'aggregate',
      message: `整合左右子树：左高 ${left.height}, 右高 ${right.height}，高度差 |${left.height} - ${right.height}| = ${diff} ${diff <= 1 ? '<= 1' : '> 1 (失衡)'}。当前节点是否平衡: ${bal}。`,
      log: `node ${node.val}: l=(${left.isBalanced}, ${left.height}), r=(${right.isBalanced}, ${right.height}) -> bal=${bal}, h=${h}`,
      codeLine: lines.aggregateInfo,
      stageId: 'stage-1',
      activeNodeId: node.val,
      visitedNodes: Array.from(visitedSet),
      metrics: {
        '当前节点': `Node(${node.val})`,
        '左子树高度': left.height,
        '右子树高度': right.height,
        '高度差': diff,
        '局部平衡性': bal ? 'TRUE' : 'FALSE (失衡)',
        '整树平衡判定': bal ? '局部平衡' : 'FALSE (存在失衡)',
      },
      statusBadge: { text: bal ? `节点 ${node.val} 平衡` : `节点 ${node.val} 失衡`, type: bal ? 'info' : 'warning' },
      callTrace: trace.snapshot(),
    });

    // 返回 Info
    trace.addReturnLeaf(`return Info(isBalanced=${bal}, height=${h})`, depth);
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      decision: `节点 Node(${node.val}) 返回 Info(${bal}, ${h})`,
      action: 'return-info',
      message: `构造 Info 结构体并向上层调用栈返回：Info { isBalanced: ${bal}, height: ${h} }。`,
      log: `return new Info(${bal}, ${h})`,
      codeLine: lines.returnInfo,
      stageId: 'stage-1',
      activeNodeId: node.val,
      visitedNodes: Array.from(visitedSet),
      metrics: {
        '当前节点': `Node(${node.val})`,
        '返回高度': h,
        '返回平衡性': bal ? 'TRUE' : 'FALSE',
      },
      statusBadge: { text: bal ? `返回 Info: 平衡` : `返回 Info: 失衡`, type: bal ? 'success' : 'danger' },
      callTrace: trace.snapshot(),
    });

    return { isBalanced: bal, height: h };
  }

  const rootInfo = process(root, 0);
  const allTreeVals = collectTreeValues(root);

  // 最终判定结算
  trace.addFinalResult(
    `最终结算: return process(root).isBalanced -> ${rootInfo.isBalanced}`,
    0,
    rootInfo.isBalanced ? '全树平衡' : '存在失衡',
    rootInfo.isBalanced ? 'true' : 'false'
  );

  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    visitedNodes: allTreeVals,
    decision: rootInfo.isBalanced
      ? `全树最终判定：二叉树严格平衡 (TRUE)`
      : `全树最终判定：二叉树出现严重失衡 (FALSE)`,
    action: 'done',
    message: rootInfo.isBalanced
      ? `递归完成：向左右子树索要的 Info 结构体均满足平衡条件且高度差绝对值 <= 1，返回 true。`
      : `递归完成：检测到子树高度差绝对值 > 1 或子树自身非平衡，返回 false。`,
    log: `Final return process(root).isBalanced = ${rootInfo.isBalanced}`,
    codeLine: lines.done,
    stageId: 'stage-1',
    activeNodeId: 1,
    metrics: {
      '整树最大高度': rootInfo.height,
      '整树平衡判定': rootInfo.isBalanced ? 'TRUE (全树平衡)' : 'FALSE (存在失衡)',
    },
    statusBadge: { text: rootInfo.isBalanced ? '全树平衡: TRUE' : '判定失衡: FALSE', type: rootInfo.isBalanced ? 'success' : 'danger' },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// =========================================================================
// Stage 2 步骤生成器: 剪枝返回值复用优化 (-1 标记失衡 · LC 110 最优解)
// =========================================================================
export function buildBalancedStage2PruneSteps(root: TreeNode | null): BalancedTree037Step[] {
  const steps: BalancedTree037Step[] = [];
  const lines = BALANCED_TREE_037_STAGE2_LINES;
  const trace = new RecursiveCallTraceBuilder();

  // 空树边界特判 (生成 3 步合规序列)
  if (!root) {
    trace.addHeader('isBalanced(null)', 0, '<- 根调用特判');
    trace.addConditionHit('① check(null) == 0 != -1 √ 命中 -> return true', 0);
    trace.addReturnLeaf('return true', 0);
    trace.addFinalResult('最终判定: true (空树平衡)', 0, undefined, 'true');

    steps.push({
      tree: null,
      current: null,
      decision: '算法启动：-1 标记剪枝检测 (空树用例)',
      action: 'entry',
      message: '传入根节点为 null，空树天然满足平衡条件。',
      log: 'isBalanced(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-2',
      metrics: { '整树平衡判定': 'TRUE (空树平衡)', '剪枝状态': '无失衡' },
      statusBadge: { text: '空树平衡', type: 'success' },
      callTrace: trace.snapshot(),
    });
    steps.push({
      tree: null,
      current: null,
      decision: '空节点递归基准：返回高度 0',
      action: 'base-null',
      message: 'check(null) 返回高度 0，不属于 -1 失衡标记。',
      log: 'check(null) -> return 0',
      codeLine: lines.baseNull,
      stageId: 'stage-2',
      metrics: { '当前高度': 0, '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '高度: 0', type: 'info' },
      callTrace: trace.snapshot(),
    });
    steps.push({
      tree: null,
      current: null,
      decision: 'check(null) 返回 0 != -1，最终判定为平衡',
      action: 'done',
      message: '根节点返回值不等于 -1，判定结果为 true。',
      log: 'return check(root) != -1 -> true',
      codeLine: lines.done,
      stageId: 'stage-2',
      metrics: { '根节点返回值': 0, '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '全树平衡: TRUE', type: 'success' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  // Step 0: 入口
  trace.addHeader(`isBalanced(root: Node(${root.val}))`, 0, '<- 根调用开始');
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    decision: `启动 -1 标记剪枝检测: check(root = Node(${root.val}))`,
    action: 'entry',
    message: '核心优化：若子树失衡直接返回 -1 逐层剪枝击穿递归，无需封装 Info 对象，极致节省调用栈与内存。',
    log: `isBalanced(root: ${root.val}), 调用 check(root)`,
    codeLine: lines.entry,
    stageId: 'stage-2',
    metrics: { '当前考察节点': `Node(${root.val})`, '剪枝状态': '正常递归中', '整树平衡判定': '计算中' },
    statusBadge: { text: '剪枝检测启动', type: 'info' },
    callTrace: trace.snapshot(),
  });

  const visitedSet = new Set<number>();

  function check(node: TreeNode | null, depth: number): number {
    if (!node) {
      trace.addHeader('check(null)', depth);
      trace.addConditionHit('① node == null √ 命中 -> return 0', depth);
      trace.addReturnLeaf('return 0', depth);
      steps.push({
        tree: cloneStateDepTree(root),
        current: null,
        decision: '空节点递归基准：node == null，返回高度 0',
        action: 'base-null',
        message: '当前递归节点为空，子树高度为 0，未触发 -1 剪枝标记。',
        log: 'check(null) -> return 0',
        codeLine: lines.baseNull,
        stageId: 'stage-2',
        visitedNodes: Array.from(visitedSet),
        metrics: { '当前节点': 'null', '当前高度': 0, '剪枝状态': '正常' },
        statusBadge: { text: '空节点高度 0', type: 'info' },
        callTrace: trace.snapshot(),
      });
      return 0;
    }

    visitedSet.add(node.val);
    trace.addHeader(`check(Node(${node.val}))`, depth, `<- 深入 Node(${node.val})`);
    trace.addConditionPass(`① node != null (Node(${node.val}))`, depth);

    // 探测左子树
    trace.addRecursePrep(`left = check(${node.left ? `Node(${node.left.val})` : 'null'})`, depth, '<- 探测左子树');
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      secondaryCurrent: node.left ? node.left.val : null,
      decision: `考察节点 Node(${node.val}) 的左子树：调用 check(node.left)`,
      action: 'check-left',
      message: `调用 check(node.left) 获取左子树高度；若左子树返回 -1 则立即触发提前剪枝。`,
      log: `check(${node.val}) -> checking left child`,
      codeLine: lines.checkLeft,
      stageId: 'stage-2',
      visitedNodes: Array.from(visitedSet),
      metrics: { '当前节点': `Node(${node.val})`, '正在探测': '左子树', '整树平衡判定': '计算中' },
      statusBadge: { text: '探测左子树', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const left = check(node.left, depth + 1);
    if (left === -1) {
      trace.addConditionHit('② left == -1 √ 命中 -> 触发剪枝 return -1', depth);
      trace.addReturnLeaf('return -1 (剪枝击穿)', depth);
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        decision: `节点 Node(${node.val}) 的左子树返回 -1，触发失衡剪枝提前返回 -1！`,
        action: 'prune-left',
        message: `左子树已经失衡 (left == -1)，无需再探索右子树，直接返回 -1 逐层击穿调用栈！`,
        log: `node ${node.val}: left == -1 -> prune and return -1`,
        codeLine: lines.pruneLeft,
        stageId: 'stage-2',
        pruned: true,
        visitedNodes: Array.from(visitedSet),
        metrics: { '当前节点': `Node(${node.val})`, '剪枝原因': '左子树失衡', '返回高度': -1, '整树平衡判定': 'FALSE (提前剪枝)' },
        statusBadge: { text: '左侧剪枝返回 -1', type: 'danger' },
        callTrace: trace.snapshot(),
      });
      return -1;
    }

    // 探测右子树
    trace.addRecursePrep(`right = check(${node.right ? `Node(${node.right.val})` : 'null'})`, depth, '<- 探测右子树');
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      secondaryCurrent: node.right ? node.right.val : null,
      decision: `节点 Node(${node.val}) 左子树正常 (高 ${left})，继续考察右子树: check(node.right)`,
      action: 'check-right',
      message: `调用 check(node.right) 获取右子树高度；若右子树返回 -1 则同样触发剪枝。`,
      log: `check(${node.val}) -> checking right child`,
      codeLine: lines.checkRight,
      stageId: 'stage-2',
      visitedNodes: Array.from(visitedSet),
      metrics: { '当前节点': `Node(${node.val})`, '左高已锁定': left, '正在探测': '右子树', '整树平衡判定': '计算中' },
      statusBadge: { text: '探测右子树', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const right = check(node.right, depth + 1);
    if (right === -1) {
      trace.addConditionHit('③ right == -1 √ 命中 -> 触发剪枝 return -1', depth);
      trace.addReturnLeaf('return -1 (剪枝击穿)', depth);
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        decision: `节点 Node(${node.val}) 的右子树返回 -1，触发失衡剪枝提前返回 -1！`,
        action: 'prune-right',
        message: `右子树已经失衡 (right == -1)，无需继续计算当前节点，直接返回 -1。`,
        log: `node ${node.val}: right == -1 -> prune and return -1`,
        codeLine: lines.pruneRight,
        stageId: 'stage-2',
        pruned: true,
        visitedNodes: Array.from(visitedSet),
        metrics: { '当前节点': `Node(${node.val})`, '剪枝原因': '右子树失衡', '返回高度': -1, '整树平衡判定': 'FALSE (提前剪枝)' },
        statusBadge: { text: '右侧剪枝返回 -1', type: 'danger' },
        callTrace: trace.snapshot(),
      });
      return -1;
    }

    // 检查高度差
    const diff = Math.abs(left - right);
    if (diff > 1) {
      trace.addConditionHit(`④ |left - right| = |${left} - ${right}| = ${diff} > 1 √ 命中 -> 标记失衡 return -1`, depth);
      trace.addReturnLeaf('return -1 (高度差越界)', depth);
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        decision: `节点 Node(${node.val}) 左右高度差 |${left} - ${right}| = ${diff} > 1，触发失衡返回 -1！`,
        action: 'check-diff',
        message: `左右子树虽各自内部平衡，但在本节点高度差越界，立即标记失衡并返回 -1！`,
        log: `node ${node.val}: |${left} - ${right}| = ${diff} > 1 -> return -1`,
        codeLine: lines.checkDiff,
        stageId: 'stage-2',
        pruned: true,
        visitedNodes: Array.from(visitedSet),
        metrics: { '当前节点': `Node(${node.val})`, '左高': left, '右高': right, '高度差': diff, '返回高度': -1, '整树平衡判定': 'FALSE (高度差越界)' },
        statusBadge: { text: '高度差超标: -1', type: 'danger' },
        callTrace: trace.snapshot(),
      });
      return -1;
    }

    trace.addConditionPass(`④ |left - right| = |${left} - ${right}| = ${diff} <= 1 平衡未触发剪枝`, depth);
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      decision: `节点 Node(${node.val}) 左右高度差 |${left} - ${right}| = ${diff} <= 1，未触发剪枝`,
      action: 'check-diff',
      message: `左右子树高度差处于平衡范围 (|${left} - ${right}| <= 1)，未触发 -1 剪枝，准备返回自身高度。`,
      log: `node ${node.val}: |${left} - ${right}| = ${diff} <= 1 -> pass`,
      codeLine: lines.checkDiff,
      stageId: 'stage-2',
      visitedNodes: Array.from(visitedSet),
      metrics: { '当前节点': `Node(${node.val})`, '左高': left, '右高': right, '高度差': diff, '差值判定': '合格 (<= 1)' },
      statusBadge: { text: '高度差合格', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const curH = Math.max(left, right) + 1;
    trace.addUnwindCalc(`平衡: curH = max(${left}, ${right}) + 1 = ${curH}, diff = ${diff} <= 1`, depth);
    trace.addReturnLeaf(`return ${curH}`, depth);
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      decision: `节点 Node(${node.val}) 平衡 (|${left} - ${right}| <= 1)，返回自身高度 ${curH}`,
      action: 'return-height',
      message: `左右子树均平衡且高度差在 1 以内，自身高度为 max(${left}, ${right}) + 1 = ${curH}。`,
      log: `node ${node.val}: balanced -> return ${curH}`,
      codeLine: lines.returnHeight,
      stageId: 'stage-2',
      visitedNodes: Array.from(visitedSet),
      metrics: { '当前节点': `Node(${node.val})`, '左高': left, '右高': right, '高度差': diff, '返回高度': curH, '整树平衡判定': '局部平衡' },
      statusBadge: { text: `节点 ${node.val} 高度: ${curH}`, type: 'info' },
      callTrace: trace.snapshot(),
    });
    return curH;
  }

  const finalRes = check(root, 0);
  const isBal = finalRes !== -1;
  const allTreeVals = collectTreeValues(root);

  trace.addFinalResult(
    `最终判定: return check(root) != -1 -> ${isBal} (res=${finalRes})`,
    0,
    isBal ? '全树平衡' : '剪枝击穿失衡',
    isBal ? 'true' : 'false'
  );

  steps.push({
    tree: cloneStateDepTree(root),
    current: root ? root.val : null,
    visitedNodes: allTreeVals,
    decision: isBal
      ? `check(root) 返回高度 ${finalRes} != -1，最终判定：全树平衡 (TRUE)`
      : `check(root) 返回 -1，最终判定：全树失衡 (FALSE)`,
    action: 'done',
    message: isBal
      ? `整树无任何剪枝触发，根节点返回有效高度 ${finalRes}，整棵二叉树为平衡二叉树！`
      : `整树计算过程中击穿触发了 -1 失衡返回，整棵二叉树为非平衡二叉树！`,
    log: `Final return check(root) != -1 -> ${isBal} (res: ${finalRes})`,
    codeLine: lines.done,
    stageId: 'stage-2',
    metrics: { '根节点返回值': finalRes, '整树平衡判定': isBal ? 'TRUE (全树平衡)' : 'FALSE (存在失衡)' },
    statusBadge: { text: isBal ? '全树平衡: TRUE' : '判定失衡: FALSE', type: isBal ? 'success' : 'danger' },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// =========================================================================
// Stage 3 步骤生成器: 显式后序遍历与深度表映射 (Iterative Postorder & Height Map)
// =========================================================================
export function buildBalancedStage3StackSteps(root: TreeNode | null): BalancedTree037Step[] {
  const steps: BalancedTree037Step[] = [];
  const lines = BALANCED_TREE_037_STAGE3_LINES;

  // 空树边界特判 (生成 3 步合规序列)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      decision: '算法启动：显式后序遍历与深度表映射 (空树特判)',
      message: '传入根节点为 null，空树天然满足平衡条件。',
      log: 'isBalanced(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-3',
      metrics: { '整树平衡判定': 'TRUE (空树平衡)', '栈大小': 0 },
      statusBadge: { text: '空树平衡', type: 'success' },
    });
    steps.push({
      tree: null,
      current: null,
      decision: '空树特判：root 为 null 直接返回 true',
      message: 'if (root == null) return true。',
      log: 'root == null -> return true',
      codeLine: lines.entry,
      stageId: 'stage-3',
      metrics: { '整树平衡判定': 'TRUE (空树平衡)', '栈大小': 0 },
      statusBadge: { text: '立即退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      decision: '空树判定完成：返回 true',
      message: '后序遍历无需展开，空树属于平衡二叉树。',
      log: 'return true',
      codeLine: lines.done,
      stageId: 'stage-3',
      metrics: { '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '全树平衡: TRUE', type: 'success' },
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    decision: '算法启动：显式后序遍历与深度表映射 (零递归栈)',
    message: '维护显式栈 Deque<TreeNode> 模拟后序遍历 (左右根)，配合 Map<TreeNode, Integer> 记录子树高度。',
    log: `isBalanced(root: ${root.val}), 初始化 stack 与 heightMap`,
    codeLine: lines.entry,
    stageId: 'stage-3',
    metrics: { '当前考察节点': `Node(${root.val})`, '后序栈深度': 0, '已结算高度节点数': 0, '整树平衡判定': '计算中' },
    statusBadge: { text: '显式栈启动', type: 'info' },
  });

  const stack: TreeNode[] = [];
  const heightMap = new Map<TreeNode, number>();
  let curr: TreeNode | null = root;
  let lastVisited: TreeNode | null = null;
  let isBroken = false;

  while ((curr || stack.length > 0) && !isBroken) {
    // 持续沿左孩子入栈
    while (curr) {
      stack.push(curr);
      steps.push({
        tree: cloneStateDepTree(root),
        current: curr.val,
        decision: `节点 Node(${curr.val}) 压入显式栈，继续深入左子树`,
        message: `后序遍历先探索左孩子：将当前节点压栈，curr 移动到 curr.left。当前栈深: ${stack.length}。`,
        log: `stack.push(${curr.val}), curr = curr.left`,
        codeLine: lines.pushLeft,
        stageId: 'stage-3',
        stackState: stack.map((n) => n.val),
        metrics: {
          '当前压栈节点': `Node(${curr.val})`,
          '后序栈深度': stack.length,
          '栈顶节点': `Node(${stack[stack.length - 1].val})`,
          '整树平衡判定': '计算中',
        },
        statusBadge: { text: `入栈: ${curr.val}`, type: 'info' },
      });
      curr = curr.left;
    }

    const top = stack[stack.length - 1];

    // 检查右子树是否未被访问
    if (top.right && top.right !== lastVisited) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: top.val,
        secondaryCurrent: top.right.val,
        decision: `栈顶 Node(${top.val}) 存在未访问的右孩子 Node(${top.right.val})，转向右子树`,
        message: `后序遍历必须先处理完右子树才能出栈自身：转向 curr = top.right。`,
        log: `top ${top.val} has unvisited right child ${top.right.val} -> curr = top.right`,
        codeLine: lines.checkRight,
        stageId: 'stage-3',
        stackState: stack.map((n) => n.val),
        metrics: {
          '当前栈顶': `Node(${top.val})`,
          '转向右孩子': `Node(${top.right.val})`,
          '后序栈深度': stack.length,
          '整树平衡判定': '计算中',
        },
        statusBadge: { text: `转向右: ${top.right.val}`, type: 'info' },
      });
      curr = top.right;
    } else {
      // 左右子树均已访问完毕，弹出栈顶计算高度
      stack.pop();
      const l = top.left ? (heightMap.get(top.left) || 0) : 0;
      const r = top.right ? (heightMap.get(top.right) || 0) : 0;
      const diff = Math.abs(l - r);

      steps.push({
        tree: cloneStateDepTree(root),
        current: top.val,
        decision: `栈顶 Node(${top.val}) 出栈，从深度表中查询左右高度: 左 ${l}, 右 ${r}`,
        message: `节点 ${top.val} 左右子树均已访问完毕，从 heightMap 取出左右高度进行高度差检验。`,
        log: `stack.pop(${top.val}), leftHeight = ${l}, rightHeight = ${r}, diff = ${diff}`,
        codeLine: lines.popAndCalc,
        stageId: 'stage-3',
        stackState: stack.map((n) => n.val),
        metrics: {
          '出栈节点': `Node(${top.val})`,
          '左子树高度': l,
          '右子树高度': r,
          '高度差': diff,
          '整树平衡判定': '局部计算中',
        },
        statusBadge: { text: `出栈结算: ${top.val}`, type: 'info' },
      });

      if (diff > 1) {
        steps.push({
          tree: cloneStateDepTree(root),
          current: top.val,
          decision: `节点 Node(${top.val}) 高度差 |${l} - ${r}| = ${diff} > 1，立即返回 false 失衡终止！`,
          message: `显式栈检测到失衡节点，无需继续遍历其余栈内节点，直接返回 false 提前终止！`,
          log: `node ${top.val}: diff = ${diff} > 1 -> return false`,
          codeLine: lines.checkDiff,
          stageId: 'stage-3',
          stackState: stack.map((n) => n.val),
          metrics: {
            '失衡节点': `Node(${top.val})`,
            '左子树高度': l,
            '右子树高度': r,
            '高度差': diff,
            '整树平衡判定': 'FALSE (高度差越界)',
          },
          statusBadge: { text: '判定失衡: FALSE', type: 'danger' },
        });
        isBroken = true;
        return steps;
      }

      const h = Math.max(l, r) + 1;
      heightMap.set(top, h);
      lastVisited = top;

      steps.push({
        tree: cloneStateDepTree(root),
        current: top.val,
        decision: `节点 Node(${top.val}) 记录高度 ${h}，存入 heightMap`,
        message: `高度合法 (|${l} - ${r}| <= 1)，更新 heightMap[${top.val}] = ${h}，更新 lastVisited。`,
        log: `heightMap.put(${top.val}, ${h})`,
        codeLine: lines.saveHeight,
        stageId: 'stage-3',
        stackState: stack.map((n) => n.val),
        metrics: {
          '当前节点': `Node(${top.val})`,
          '自身高度': h,
          '已结算节点数': heightMap.size,
          '整树平衡判定': '局部平衡',
        },
        statusBadge: { text: `高度: ${h}`, type: 'success' },
      });
    }
  }

  const allTreeVals = collectTreeValues(root);

  // 最终全部节点出栈完毕且无失衡
  steps.push({
    tree: cloneStateDepTree(root),
    current: root ? root.val : null,
    visitedNodes: allTreeVals,
    decision: '显式后序遍历完毕，全树所有节点均平衡，返回 true',
    message: '栈内所有节点全部安全弹出且未触发任何失衡退出，整棵树为平衡二叉树！',
    log: 'while loop finished without imbalance -> return true',
    codeLine: lines.done,
    stageId: 'stage-3',
    metrics: {
      '整树最大高度': heightMap.get(root) || 0,
      '遍历总节点数': heightMap.size,
      '整树平衡判定': 'TRUE (全树平衡)',
    },
    statusBadge: { text: '全树平衡: TRUE', type: 'success' },
  });

  return steps;
}

// =========================================================================
// 统一向下兼容入口 (100% Backward Compatible Step Generator)
// =========================================================================
export function buildBalancedTree037Steps(treeRaw?: string): BalancedTree037Step[] {
  const raw = (treeRaw || '').trim().replace(/\s+/g, '');

  let root: TreeNode | null;
  if (!treeRaw || raw === '') {
    root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
  } else if (raw.includes('1,2,2,3,3') || raw.includes('4,4')) {
    root = buildTreeFromArr([1, 2, 2, 3, 3, null, null, 4, 4]);
  } else if (raw === '1') {
    root = buildTreeFromArr([1]);
  } else if (raw === '[]' || raw === 'null') {
    root = null;
  } else {
    const arr = parseTreeArray(treeRaw, [3, 9, 20, null, null, 15, 7]);
    root = buildTreeFromArr(arr);
  }

  return buildBalancedStage1Steps(root);
}

export function compileBalancedStage1(inputs?: Record<string, any>): BalancedTree037Step[] {
  const root = parseBalancedTreeInputs(inputs);
  return buildBalancedStage1Steps(root);
}

export function compileBalancedStage2(inputs?: Record<string, any>): BalancedTree037Step[] {
  const root = parseBalancedTreeInputs(inputs);
  return buildBalancedStage2PruneSteps(root);
}

export function compileBalancedStage3(inputs?: Record<string, any>): BalancedTree037Step[] {
  const root = parseBalancedTreeInputs(inputs);
  return buildBalancedStage3StackSteps(root);
}
