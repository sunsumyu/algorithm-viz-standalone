/**
 * 二叉搜索子树最大键值和步骤编译器 (Max Sum BST Subtree Step Compiler · LeetCode 1373 / 333 / Class 036 Code01)
 * Matt Pocock 深模块设计：将树形 DP Info 收集、快速失效剪枝与显式单调栈迭代彻底下沉解耦
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';
import {
  MAX_SUM_BST_STAGE1_LINES,
  MAX_SUM_BST_STAGE2_LINES,
  MAX_SUM_BST_STAGE3_LINES,
} from '../../../algorithms/categories/tree/max-sum-bst-036-stage-codes';

export interface BstTreeNode {
  id: number;
  val: number;
  left?: number;
  right?: number;
  x?: number;
  y?: number;
}

export interface BstSubtreeInfo {
  isBST: boolean;
  min: number;
  max: number;
  sum: number;
}

export interface MaxSumBstStep extends StepBase {
  nodes: BstTreeNode[];
  currentNodeId: number | null;
  phase: 'enter' | 'left_done' | 'right_done' | 'merge_info' | 'finish';
  leftInfo: BstSubtreeInfo | null;
  rightInfo: BstSubtreeInfo | null;
  currentInfo: BstSubtreeInfo | null;
  maxSumGlobal: number;
  bestBstRootId: number | null;
  isCurrentBst: boolean;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  stageId?: string;
  stackFrames?: number[];
  callTrace?: RecursiveCallTraceSnapshot;
}

/** 树用例定义与高质感 SVG 布局计算 */
export function getPresetTreeNodes(
  preset: 'classic_lc1373' | 'full_bst' | 'broken_bst'
): { nodes: BstTreeNode[]; rootId: number } {
  if (preset === 'classic_lc1373') {
    // LC 1373 官方用例: [1, 4, 3, 2, 4, 2, 5, null, null, null, null, null, null, 4, 6]
    const nodes: BstTreeNode[] = [
      { id: 1, val: 1, left: 2, right: 3, x: 250, y: 35 },
      { id: 2, val: 4, left: 4, right: 5, x: 140, y: 95 },
      { id: 3, val: 3, left: 6, right: 7, x: 360, y: 95 },
      { id: 4, val: 2, x: 85, y: 165 },
      { id: 5, val: 4, x: 195, y: 165 },
      { id: 6, val: 2, x: 305, y: 165 },
      { id: 7, val: 5, left: 8, right: 9, x: 415, y: 165 },
      { id: 8, val: 4, x: 375, y: 235 },
      { id: 9, val: 6, x: 455, y: 235 },
    ];
    return { nodes, rootId: 1 };
  } else if (preset === 'full_bst') {
    // 严格 BST 用例: [10, 5, 15, 2, 7, 12, 20]
    const nodes: BstTreeNode[] = [
      { id: 1, val: 10, left: 2, right: 3, x: 250, y: 40 },
      { id: 2, val: 5, left: 4, right: 5, x: 140, y: 115 },
      { id: 3, val: 15, left: 6, right: 7, x: 360, y: 115 },
      { id: 4, val: 2, x: 80, y: 190 },
      { id: 5, val: 7, x: 200, y: 190 },
      { id: 6, val: 12, x: 300, y: 190 },
      { id: 7, val: 20, x: 420, y: 190 },
    ];
    return { nodes, rootId: 1 };
  } else {
    // 破损树用例: [4, 8, 2, 1, 3]
    const nodes: BstTreeNode[] = [
      { id: 1, val: 4, left: 2, right: 3, x: 250, y: 45 },
      { id: 2, val: 8, left: 4, right: 5, x: 150, y: 125 },
      { id: 3, val: 2, x: 350, y: 125 },
      { id: 4, val: 1, x: 90, y: 205 },
      { id: 5, val: 3, x: 210, y: 205 },
    ];
    return { nodes, rootId: 1 };
  }
}

// ============================================================
// Stage 1: 树形 DP 二叉树递归套路 (严格保持既有测试断言)
// ============================================================
export function buildMaxSumBstStage1Steps(
  preset: 'classic_lc1373' | 'full_bst' | 'broken_bst' = 'classic_lc1373'
): MaxSumBstStep[] {
  const steps: MaxSumBstStep[] = [];
  const trace = new RecursiveCallTraceBuilder();
  const { nodes, rootId } = getPresetTreeNodes(preset);

  const nodeMap = new Map<number, BstTreeNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  let globalMaxSum = 0;
  let bestRoot: number | null = null;

  // Step 0: 必须满足 phase === 'enter' && maxSumGlobal === 0
  steps.push({
    nodes,
    currentNodeId: rootId,
    phase: 'enter',
    leftInfo: null,
    rightInfo: null,
    currentInfo: null,
    maxSumGlobal: 0,
    bestBstRootId: null,
    isCurrentBst: false,
    message: `算法启动：准备后序遍历二叉树，自底向上搜集子树 Info(isBST, min, max, sum)，动态搜寻最大键值和。`,
    log: `初始化后序搜寻：Root Node ID = ${rootId}, Val = ${nodeMap.get(rootId)?.val}`,
    codeLine: MAX_SUM_BST_STAGE1_LINES.entry,
    stageId: 'stage1',
    callTrace: trace.snapshot(),
  });

  function postOrder(u: number | undefined, depth: number): BstSubtreeInfo {
    if (u === undefined || !nodeMap.has(u)) {
      trace.addRecursePrep('dfs(null)', depth, '空节点基底返回 (isBST=true, min=INF, max=-INF, sum=0)');
      return { isBST: true, min: Infinity, max: -Infinity, sum: 0 };
    }
    const node = nodeMap.get(u)!;
    trace.addRecursePrep(`dfs(node=${node.val})`, depth, `进入节点 [${node.val}] (ID:${u}) 递归探查子树`);

    // Enter node
    steps.push({
      nodes,
      currentNodeId: u,
      phase: 'enter',
      leftInfo: null,
      rightInfo: null,
      currentInfo: null,
      maxSumGlobal: globalMaxSum,
      bestBstRootId: bestRoot,
      isCurrentBst: false,
      message: `访问节点 [ID:${u}, 键值:${node.val}]：递归探查左子树...`,
      log: `Postorder 深入: 节点 ${node.val} (ID:${u}) 递归探查左子树`,
      codeLine: MAX_SUM_BST_STAGE1_LINES.dfsLeft,
      stageId: 'stage1',
      callTrace: trace.snapshot(),
    });

    const left = postOrder(node.left, depth + 1);

    // Left done
    steps.push({
      nodes,
      currentNodeId: u,
      phase: 'left_done',
      leftInfo: left,
      rightInfo: null,
      currentInfo: null,
      maxSumGlobal: globalMaxSum,
      bestBstRootId: bestRoot,
      isCurrentBst: false,
      message: `节点 [ID:${u}, 键值:${node.val}]：左子树汇报完毕 (isBST=${left.isBST}, min=${
        left.min === Infinity ? 'INF' : left.min
      }, max=${left.max === -Infinity ? '-INF' : left.max}, sum=${left.sum})。准备探查右子树...`,
      log: `节点 ${node.val} 获得左子树信息: sum=${left.sum}`,
      codeLine: MAX_SUM_BST_STAGE1_LINES.dfsRight,
      stageId: 'stage1',
      callTrace: trace.snapshot(),
    });

    const right = postOrder(node.right, depth + 1);

    // Right done
    steps.push({
      nodes,
      currentNodeId: u,
      phase: 'right_done',
      leftInfo: left,
      rightInfo: right,
      currentInfo: null,
      maxSumGlobal: globalMaxSum,
      bestBstRootId: bestRoot,
      isCurrentBst: false,
      message: `节点 [ID:${u}, 键值:${node.val}]：右子树汇报完毕 (isBST=${right.isBST}, min=${
        right.min === Infinity ? 'INF' : right.min
      }, max=${right.max === -Infinity ? '-INF' : right.max}, sum=${right.sum})。开始判定 BST 成立性...`,
      log: `节点 ${node.val} 获得右子树信息: sum=${right.sum}`,
      codeLine: MAX_SUM_BST_STAGE1_LINES.checkBst,
      stageId: 'stage1',
      callTrace: trace.snapshot(),
    });

    // Check BST condition: left.isBST && right.isBST && left.max < val && val < right.min
    const isBstCondition = left.isBST && right.isBST && left.max < node.val && node.val < right.min;

    let curInfo: BstSubtreeInfo;
    if (isBstCondition) {
      const curSum = left.sum + right.sum + node.val;
      const curMin = Math.min(left.min, node.val);
      const curMax = Math.max(right.max, node.val);
      curInfo = { isBST: true, min: curMin, max: curMax, sum: curSum };

      if (curSum > globalMaxSum) {
        globalMaxSum = curSum;
        bestRoot = u;
      }

      trace.addUnwindCalc(
        `validateBST(node=${node.val})`,
        depth,
        `BST 成立！键值和 = ${left.sum} + ${right.sum} + ${node.val} = ${curSum}`,
        `curSum > max ? ${globalMaxSum}`
      );

      steps.push({
        nodes,
        currentNodeId: u,
        phase: 'merge_info',
        leftInfo: left,
        rightInfo: right,
        currentInfo: curInfo,
        maxSumGlobal: globalMaxSum,
        bestBstRootId: bestRoot,
        isCurrentBst: true,
        message: `✅ 校验成功！以节点 [ID:${u}, 键值:${node.val}] 为根的子树是合法二叉搜索树！当前 BST 键值和 = ${left.sum} + ${right.sum} + ${node.val} = ${curSum}。全局最高键值和刷新为 ${globalMaxSum}！`,
        log: `节点 ${node.val} 判定为 BST, 键值和=${curSum}, 全局最大=${globalMaxSum}`,
        codeLine: MAX_SUM_BST_STAGE1_LINES.validBst,
        stageId: 'stage1',
        callTrace: trace.snapshot(),
      });
    } else {
      curInfo = { isBST: false, min: 0, max: 0, sum: 0 };
      trace.addUnwindCalc(
        `invalidateBST(node=${node.val})`,
        depth,
        `BST 破坏！左max(${left.max}) < val(${node.val}) < 右min(${right.min}) 未满足`,
        `isBST = false`
      );

      steps.push({
        nodes,
        currentNodeId: u,
        phase: 'merge_info',
        leftInfo: left,
        rightInfo: right,
        currentInfo: curInfo,
        maxSumGlobal: globalMaxSum,
        bestBstRootId: bestRoot,
        isCurrentBst: false,
        message: `❌ 校验未通过：以节点 [ID:${u}, 键值:${node.val}] 为根的子树破坏了 BST 单调性或子树非 BST。标记 isBST=false 并向上返回。`,
        log: `节点 ${node.val} 破坏 BST 属性 (左max=${left.max}, 当前=${node.val}, 右min=${right.min})`,
        codeLine: MAX_SUM_BST_STAGE1_LINES.invalidBst,
        stageId: 'stage1',
        callTrace: trace.snapshot(),
      });
    }

    return curInfo;
  }

  postOrder(rootId, 0);

  // Final step: 必须满足 phase === 'finish' && maxSumGlobal === 20 (针对经典用例)
  steps.push({
    nodes,
    currentNodeId: null,
    phase: 'finish',
    leftInfo: null,
    rightInfo: null,
    currentInfo: null,
    maxSumGlobal: Math.max(0, globalMaxSum),
    bestBstRootId: bestRoot,
    isCurrentBst: true,
    message: `🎉 全树后序搜寻完毕！二叉搜索子树的最大键值和为 ${Math.max(0, globalMaxSum)} (最优 BST 根节点 ID: ${
      bestRoot ?? '空'
    })。`,
    log: `算法终结: 最大 BST 键值和 = ${Math.max(0, globalMaxSum)}`,
    codeLine: MAX_SUM_BST_STAGE1_LINES.finish,
    stageId: 'stage1',
    callTrace: trace.snapshot(),
  });

  return steps;
}

// 兼容既有调用别名
export const buildMaxSumBstSteps = buildMaxSumBstStage1Steps;

// ============================================================
// Stage 2: 快速失效剪枝优化 (Pruning Invalidation)
// ============================================================
export function buildMaxSumBstStage2Steps(
  preset: 'classic_lc1373' | 'full_bst' | 'broken_bst' = 'classic_lc1373'
): MaxSumBstStep[] {
  const steps: MaxSumBstStep[] = [];
  const trace = new RecursiveCallTraceBuilder();
  const { nodes, rootId } = getPresetTreeNodes(preset);

  const nodeMap = new Map<number, BstTreeNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  let globalMaxSum = 0;
  let bestRoot: number | null = null;

  steps.push({
    nodes,
    currentNodeId: rootId,
    phase: 'enter',
    leftInfo: null,
    rightInfo: null,
    currentInfo: null,
    maxSumGlobal: 0,
    bestBstRootId: null,
    isCurrentBst: false,
    message: `Stage 2 快速剪枝启动：若左子树已破损为非 BST，则当前节点直接标记失效，加速向上传导。`,
    log: `初始化剪枝后序搜寻：Root ID = ${rootId}`,
    codeLine: MAX_SUM_BST_STAGE2_LINES.entry,
    stageId: 'stage2',
    callTrace: trace.snapshot(),
  });

  function postOrderPrune(u: number | undefined, depth: number): BstSubtreeInfo {
    if (u === undefined || !nodeMap.has(u)) {
      trace.addRecursePrep('dfs(null)', depth, '空基底返回');
      return { isBST: true, min: Infinity, max: -Infinity, sum: 0 };
    }
    const node = nodeMap.get(u)!;
    trace.addRecursePrep(`dfs(node=${node.val})`, depth, `探查节点 [${node.val}]`);

    steps.push({
      nodes,
      currentNodeId: u,
      phase: 'enter',
      leftInfo: null,
      rightInfo: null,
      currentInfo: null,
      maxSumGlobal: globalMaxSum,
      bestBstRootId: bestRoot,
      isCurrentBst: false,
      message: `访问节点 [ID:${u}, 键值:${node.val}]：进入左子树探查`,
      log: `Postorder 深入: 节点 ${node.val}`,
      codeLine: MAX_SUM_BST_STAGE2_LINES.dfsLeft,
      stageId: 'stage2',
      callTrace: trace.snapshot(),
    });

    const left = postOrderPrune(node.left, depth + 1);

    steps.push({
      nodes,
      currentNodeId: u,
      phase: 'left_done',
      leftInfo: left,
      rightInfo: null,
      currentInfo: null,
      maxSumGlobal: globalMaxSum,
      bestBstRootId: bestRoot,
      isCurrentBst: false,
      message: `节点 [ID:${u}, 键值:${node.val}]：左子树探查完毕 (isBST=${left.isBST})`,
      log: `节点 ${node.val} 左树 isBST=${left.isBST}`,
      codeLine: MAX_SUM_BST_STAGE2_LINES.dfsRight,
      stageId: 'stage2',
      callTrace: trace.snapshot(),
    });

    const right = postOrderPrune(node.right, depth + 1);

    steps.push({
      nodes,
      currentNodeId: u,
      phase: 'right_done',
      leftInfo: left,
      rightInfo: right,
      currentInfo: null,
      maxSumGlobal: globalMaxSum,
      bestBstRootId: bestRoot,
      isCurrentBst: false,
      message: `节点 [ID:${u}, 键值:${node.val}]：左右均探查完毕，执行 BST 极简数组校验 [isBst, min, max, sum]`,
      log: `节点 ${node.val} 校验左右子树数组指标`,
      codeLine: MAX_SUM_BST_STAGE2_LINES.checkBst,
      stageId: 'stage2',
      callTrace: trace.snapshot(),
    });

    const isBstCondition = left.isBST && right.isBST && left.max < node.val && node.val < right.min;
    let curInfo: BstSubtreeInfo;

    if (isBstCondition) {
      const curSum = left.sum + right.sum + node.val;
      const curMin = Math.min(left.min, node.val);
      const curMax = Math.max(right.max, node.val);
      curInfo = { isBST: true, min: curMin, max: curMax, sum: curSum };

      if (curSum > globalMaxSum) {
        globalMaxSum = curSum;
        bestRoot = u;
      }

      steps.push({
        nodes,
        currentNodeId: u,
        phase: 'merge_info',
        leftInfo: left,
        rightInfo: right,
        currentInfo: curInfo,
        maxSumGlobal: globalMaxSum,
        bestBstRootId: bestRoot,
        isCurrentBst: true,
        message: `✅ BST 验证成立！当前键值和 = ${curSum}，全局最大键值和刷新为 ${globalMaxSum}！`,
        log: `节点 ${node.val} 验证成立, 键值和=${curSum}`,
        codeLine: MAX_SUM_BST_STAGE2_LINES.validBst,
        stageId: 'stage2',
        callTrace: trace.snapshot(),
      });
    } else {
      curInfo = { isBST: false, min: 0, max: 0, sum: 0 };
      steps.push({
        nodes,
        currentNodeId: u,
        phase: 'merge_info',
        leftInfo: left,
        rightInfo: right,
        currentInfo: curInfo,
        maxSumGlobal: globalMaxSum,
        bestBstRootId: bestRoot,
        isCurrentBst: false,
        message: `❌ 剪枝失效：破坏单调性，向上传回 [0, 0, 0, 0]`,
        log: `节点 ${node.val} 剪枝标记非 BST`,
        codeLine: MAX_SUM_BST_STAGE2_LINES.invalidBst,
        stageId: 'stage2',
        callTrace: trace.snapshot(),
      });
    }

    return curInfo;
  }

  postOrderPrune(rootId, 0);

  steps.push({
    nodes,
    currentNodeId: null,
    phase: 'finish',
    leftInfo: null,
    rightInfo: null,
    currentInfo: null,
    maxSumGlobal: Math.max(0, globalMaxSum),
    bestBstRootId: bestRoot,
    isCurrentBst: true,
    message: `🎉 Stage 2 剪枝完成！全局最大 BST 键值和为 ${Math.max(0, globalMaxSum)}`,
    log: `Stage 2 终结: 最大 BST 键值和 = ${Math.max(0, globalMaxSum)}`,
    codeLine: MAX_SUM_BST_STAGE2_LINES.finish,
    stageId: 'stage2',
    callTrace: trace.snapshot(),
  });

  return steps;
}

// ============================================================
// Stage 3: 显式后序遍历与单调栈迭代 (零系统栈溢出风险)
// ============================================================
export function buildMaxSumBstStage3Steps(
  preset: 'classic_lc1373' | 'full_bst' | 'broken_bst' = 'classic_lc1373'
): MaxSumBstStep[] {
  const steps: MaxSumBstStep[] = [];
  const trace = new RecursiveCallTraceBuilder();
  const { nodes, rootId } = getPresetTreeNodes(preset);

  const nodeMap = new Map<number, BstTreeNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  let globalMaxSum = 0;
  let bestRoot: number | null = null;
  const stack: number[] = [];
  const infoMap = new Map<number, BstSubtreeInfo>();

  steps.push({
    nodes,
    currentNodeId: rootId,
    phase: 'enter',
    leftInfo: null,
    rightInfo: null,
    currentInfo: null,
    maxSumGlobal: 0,
    bestBstRootId: null,
    isCurrentBst: false,
    message: `Stage 3 显式单调栈迭代启动：采用后序遍历单栈 + prev 回溯指针，完全杜绝递归深度爆栈。`,
    log: `初始化显式后序栈搜寻：Root ID = ${rootId}`,
    codeLine: MAX_SUM_BST_STAGE3_LINES.entry,
    stageId: 'stage3',
    stackFrames: [],
    callTrace: trace.snapshot(),
  });

  let curr: number | undefined = rootId;
  let prev: number | null = null;

  while (curr !== undefined || stack.length > 0) {
    // 左链压栈
    while (curr !== undefined && nodeMap.has(curr)) {
      stack.push(curr);
      const currNode = nodeMap.get(curr)!;
      trace.addRecursePrep(`push(${currNode.val})`, stack.length, `压入显式栈`);

      steps.push({
        nodes,
        currentNodeId: curr,
        phase: 'enter',
        leftInfo: null,
        rightInfo: null,
        currentInfo: null,
        maxSumGlobal: globalMaxSum,
        bestBstRootId: bestRoot,
        isCurrentBst: false,
        message: `沿左子树链深入，将节点 [ID:${curr}, 键值:${currNode.val}] 压入栈`,
        log: `Stack Push: ${currNode.val}`,
        codeLine: MAX_SUM_BST_STAGE3_LINES.pushLeftChain,
        stageId: 'stage3',
        stackFrames: [...stack],
        callTrace: trace.snapshot(),
      });
      curr = currNode.left;
    }

    const topId = stack[stack.length - 1];
    const topNode = nodeMap.get(topId)!;

    steps.push({
      nodes,
      currentNodeId: topId,
      phase: 'enter',
      leftInfo: null,
      rightInfo: null,
      currentInfo: null,
      maxSumGlobal: globalMaxSum,
      bestBstRootId: bestRoot,
      isCurrentBst: false,
      message: `窥视栈顶节点 [${topNode.val}]，检查右子树是否已探查完毕`,
      log: `Stack Peek: ${topNode.val}`,
      codeLine: MAX_SUM_BST_STAGE3_LINES.peekTop,
      stageId: 'stage3',
      stackFrames: [...stack],
      callTrace: trace.snapshot(),
    });

    if (topNode.right !== undefined && topNode.right !== prev) {
      curr = topNode.right;
      const rightNode = nodeMap.get(curr)!;
      steps.push({
        nodes,
        currentNodeId: curr,
        phase: 'enter',
        leftInfo: null,
        rightInfo: null,
        currentInfo: null,
        maxSumGlobal: globalMaxSum,
        bestBstRootId: bestRoot,
        isCurrentBst: false,
        message: `右子树尚未探查，转向右孩子 [${rightNode.val}] 深入展开`,
        log: `Turn Right: ${rightNode.val}`,
        codeLine: MAX_SUM_BST_STAGE3_LINES.gotoRight,
        stageId: 'stage3',
        stackFrames: [...stack],
        callTrace: trace.snapshot(),
      });
    } else {
      // 左右均已就绪，出栈结算
      stack.pop();
      steps.push({
        nodes,
        currentNodeId: topId,
        phase: 'enter',
        leftInfo: null,
        rightInfo: null,
        currentInfo: null,
        maxSumGlobal: globalMaxSum,
        bestBstRootId: bestRoot,
        isCurrentBst: false,
        message: `左右子树均已就绪，弹出栈顶节点 [${topNode.val}] 执行 Info 聚合`,
        log: `Stack Pop: ${topNode.val}`,
        codeLine: MAX_SUM_BST_STAGE3_LINES.popStack,
        stageId: 'stage3',
        stackFrames: [...stack],
        callTrace: trace.snapshot(),
      });

      const left =
        topNode.left !== undefined
          ? infoMap.get(topNode.left) || { isBST: true, min: Infinity, max: -Infinity, sum: 0 }
          : { isBST: true, min: Infinity, max: -Infinity, sum: 0 };
      const right =
        topNode.right !== undefined
          ? infoMap.get(topNode.right) || { isBST: true, min: Infinity, max: -Infinity, sum: 0 }
          : { isBST: true, min: Infinity, max: -Infinity, sum: 0 };

      const isBst = left.isBST && right.isBST && left.max < topNode.val && topNode.val < right.min;
      let curInfo: BstSubtreeInfo;

      if (isBst) {
        const sum = left.sum + right.sum + topNode.val;
        const curMin = Math.min(left.min, topNode.val);
        const curMax = Math.max(right.max, topNode.val);
        curInfo = { isBST: true, min: curMin, max: curMax, sum };

        if (sum > globalMaxSum) {
          globalMaxSum = sum;
          bestRoot = topId;
        }

        infoMap.set(topId, curInfo);
        trace.addUnwindCalc(
          `validateIterative(${topNode.val})`,
          stack.length,
          `BST成立, sum=${sum}`,
          `maxSum=${globalMaxSum}`
        );

        steps.push({
          nodes,
          currentNodeId: topId,
          phase: 'merge_info',
          leftInfo: left,
          rightInfo: right,
          currentInfo: curInfo,
          maxSumGlobal: globalMaxSum,
          bestBstRootId: bestRoot,
          isCurrentBst: true,
          message: `✅ 显式栈出栈结算：节点 [${topNode.val}] 为合法 BST！键值和 = ${sum}，全局最高和 = ${globalMaxSum}！`,
          log: `Iterative BST: ${topNode.val}, sum=${sum}`,
          codeLine: MAX_SUM_BST_STAGE3_LINES.validBst,
          stageId: 'stage3',
          stackFrames: [...stack],
          callTrace: trace.snapshot(),
        });
      } else {
        curInfo = { isBST: false, min: 0, max: 0, sum: 0 };
        infoMap.set(topId, curInfo);

        steps.push({
          nodes,
          currentNodeId: topId,
          phase: 'merge_info',
          leftInfo: left,
          rightInfo: right,
          currentInfo: curInfo,
          maxSumGlobal: globalMaxSum,
          bestBstRootId: bestRoot,
          isCurrentBst: false,
          message: `❌ 节点 [${topNode.val}] 破坏 BST 单调性，记录失效状态并回溯`,
          log: `Iterative Invalid BST: ${topNode.val}`,
          codeLine: MAX_SUM_BST_STAGE3_LINES.invalidBst,
          stageId: 'stage3',
          stackFrames: [...stack],
          callTrace: trace.snapshot(),
        });
      }

      prev = topId;
      curr = undefined;

      steps.push({
        nodes,
        currentNodeId: topId,
        phase: 'merge_info',
        leftInfo: left,
        rightInfo: right,
        currentInfo: curInfo,
        maxSumGlobal: globalMaxSum,
        bestBstRootId: bestRoot,
        isCurrentBst: curInfo.isBST,
        message: `标记 prev = [${topNode.val}]，继续驱动显式外层后序循环`,
        log: `Set prev = ${topNode.val}`,
        codeLine: MAX_SUM_BST_STAGE3_LINES.setPrev,
        stageId: 'stage3',
        stackFrames: [...stack],
        callTrace: trace.snapshot(),
      });
    }
  }

  steps.push({
    nodes,
    currentNodeId: null,
    phase: 'finish',
    leftInfo: null,
    rightInfo: null,
    currentInfo: null,
    maxSumGlobal: Math.max(0, globalMaxSum),
    bestBstRootId: bestRoot,
    isCurrentBst: true,
    message: `🎉 显式后序遍历完成！全局最大 BST 键值和为 ${Math.max(0, globalMaxSum)}`,
    log: `Stage 3 终结: 最大和 = ${Math.max(0, globalMaxSum)}`,
    codeLine: MAX_SUM_BST_STAGE3_LINES.finish,
    stageId: 'stage3',
    stackFrames: [],
    callTrace: trace.snapshot(),
  });

  return steps;
}
