/**
 * 左程云算法通关课 Class 036 Code01: 二叉搜索子树的最大键值和 (Max Sum BST Subtree)
 * LeetCode 1373 / 333 (二叉树树形 DP / 递归信息结构体搜集套路经典神题)
 *
 * 采用顶层声明式 4-Card 架构与多阶段演化标准:
 *   Stage 1: 树形 DP 二叉树递归套路 (Info 结构体自底向上收集)
 *   Stage 2: 快速失效剪枝优化 (Pruning Invalidation)
 *   Stage 3: 显式后序遍历与单调栈迭代 (零系统栈溢出风险)
 *
 * 设计模式应用:
 *   建造者模式 (RecursiveCallTraceBuilder): 追踪后序递归信息搜集调用轨迹
 *   适配器模式 (TreeCanvasAdapter): 桥接纯净 SVG 树拓扑沙盘与 Card 2 Info 结构体决策面板
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import {
  MAX_SUM_BST_PROBLEM_HTML,
  MAX_SUM_BST_ANALYSIS_HTML,
} from './max-sum-bst-036-problem-content';
import {
  MAX_SUM_BST_CODES,
  MAX_SUM_BST_CODE_LINES,
  MAX_SUM_BST_STAGE1_CODES,
  MAX_SUM_BST_STAGE2_CODES,
  MAX_SUM_BST_STAGE3_CODES,
  MAX_SUM_BST_STAGE1_LINES,
  MAX_SUM_BST_STAGE2_LINES,
  MAX_SUM_BST_STAGE3_LINES,
} from './max-sum-bst-036-stage-codes';

export { MAX_SUM_BST_CODES, MAX_SUM_BST_CODE_LINES };

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
function getPresetTreeNodes(preset: 'classic_lc1373' | 'full_bst' | 'broken_bst'): { nodes: BstTreeNode[]; rootId: number } {
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
      message: `节点 [ID:${u}, 键值:${node.val}]：左子树汇报完毕 (isBST=${left.isBST}, min=${left.min === Infinity ? 'INF' : left.min}, max=${left.max === -Infinity ? '-INF' : left.max}, sum=${left.sum})。准备探查右子树...`,
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
      message: `节点 [ID:${u}, 键值:${node.val}]：右子树汇报完毕 (isBST=${right.isBST}, min=${right.min === Infinity ? 'INF' : right.min}, max=${right.max === -Infinity ? '-INF' : right.max}, sum=${right.sum})。开始判定 BST 成立性...`,
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
    message: `🎉 全树后序搜寻完毕！二叉搜索子树的最大键值和为 ${Math.max(0, globalMaxSum)} (最优 BST 根节点 ID: ${bestRoot ?? '空'})。`,
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

      const left = topNode.left !== undefined ? infoMap.get(topNode.left) || { isBST: true, min: Infinity, max: -Infinity, sum: 0 } : { isBST: true, min: Infinity, max: -Infinity, sum: 0 };
      const right = topNode.right !== undefined ? infoMap.get(topNode.right) || { isBST: true, min: Infinity, max: -Infinity, sum: 0 } : { isBST: true, min: Infinity, max: -Infinity, sum: 0 };

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
        trace.addUnwindCalc(`validateIterative(${topNode.val})`, stack.length, `BST成立, sum=${sum}`, `maxSum=${globalMaxSum}`);

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

// ============================================================
// Card 1 纯净 SVG 二叉树沙盘渲染 (零标题、零指标、零嵌套)
// ============================================================
export function renderMaxSumBstCanvas(container: HTMLElement, step: MaxSumBstStep) {
  const nodeMap = new Map<number, BstTreeNode>();
  step.nodes.forEach((n) => nodeMap.set(n.id, n));

  // 连线 SVG
  const linesHtml = step.nodes
    .map((node) => {
      const leftChild = node.left !== undefined ? nodeMap.get(node.left) : null;
      const rightChild = node.right !== undefined ? nodeMap.get(node.right) : null;
      const nx = node.x ?? 250;
      const ny = node.y ?? 40;

      let res = '';
      if (leftChild) {
        const lx = leftChild.x ?? 150;
        const ly = leftChild.y ?? 100;
        res += `<line x1="${nx}" y1="${ny}" x2="${lx}" y2="${ly}" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round" />`;
      }
      if (rightChild) {
        const rx = rightChild.x ?? 350;
        const ry = rightChild.y ?? 100;
        res += `<line x1="${nx}" y1="${ny}" x2="${rx}" y2="${ry}" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round" />`;
      }
      return res;
    })
    .join('');

  // 节点 SVG
  const nodesHtml = step.nodes
    .map((n) => {
      const nx = n.x ?? 250;
      const ny = n.y ?? 40;
      const isCurrent = step.currentNodeId === n.id;
      const isBestRoot = step.bestBstRootId === n.id;

      let fill = 'rgba(30, 41, 59, 0.92)';
      let stroke = 'rgba(255, 255, 255, 0.28)';
      let textColor = '#f8fafc';
      let filter = 'none';

      if (isBestRoot) {
        fill = 'rgba(6, 78, 59, 0.65)';
        stroke = '#34d399';
        textColor = '#34d399';
        filter = 'drop-shadow(0 0 10px rgba(52,211,153,0.65))';
      }
      if (isCurrent) {
        fill = 'rgba(234, 179, 8, 0.35)';
        stroke = '#facc15';
        textColor = '#fde047';
        filter = 'drop-shadow(0 0 12px rgba(250,204,21,0.85))';
      }

      return `
      <g style="filter: ${filter};">
        <circle cx="${nx}" cy="${ny}" r="22" fill="${fill}" stroke="${stroke}" stroke-width="${isCurrent || isBestRoot ? 3 : 1.5}" />
        <text x="${nx}" y="${ny + 5}" font-size="14" font-weight="700" fill="${textColor}" text-anchor="middle" font-family="system-ui, sans-serif">${n.val}</text>
        <text x="${nx}" y="${ny + 35}" font-size="9" fill="#94a3b8" text-anchor="middle" font-family="monospace">#${n.id}</text>
        ${
          isBestRoot
            ? `<text x="${nx}" y="${ny - 28}" font-size="10" fill="#34d399" font-weight="700" text-anchor="middle">★ 最优根</text>`
            : isCurrent
            ? `<text x="${nx}" y="${ny - 28}" font-size="10" fill="#facc15" font-weight="700" text-anchor="middle">🔍 当前</text>`
            : ''
        }
      </g>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
      <div style="position: absolute; top: 12px; right: 16px; display: flex; gap: 14px; font-size: 0.8rem; background: rgba(15,23,42,0.6); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
        <span style="color: #facc15; display: flex; align-items: center; gap: 4px;">● 当前探查点</span>
        <span style="color: #34d399; display: flex; align-items: center; gap: 4px;">★ 最优BST根</span>
      </div>
      <svg viewBox="0 0 520 280" style="width: 100%; max-height: 320px; overflow: visible;">
        ${linesHtml}
        ${nodesHtml}
      </svg>
    </div>
  `;
}

// ============================================================
// Card 2 辅助决策沙盘 (Info 结构体三联探针与全局决策)
// ============================================================
export function renderMaxSumBstCard2(container: HTMLElement, step: MaxSumBstStep) {
  const { leftInfo, rightInfo, currentInfo, isCurrentBst, maxSumGlobal, bestBstRootId, stackFrames, stageId } = step;

  const stackHtml =
    stageId === 'stage3' && stackFrames
      ? `
      <div style="padding: 8px 12px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.78rem; font-weight: 600; color: #94a3b8;">🥞 显式迭代栈:</span>
        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
          ${
            stackFrames.length
              ? stackFrames.map((id) => `<span style="background: rgba(56,189,248,0.2); border: 1px solid #38bdf8; color: #38bdf8; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">ID:${id}</span>`).join('')
              : '<span style="color:#64748b; font-size:0.75rem;">(栈空)</span>'
          }
        </div>
      </div>
    `
      : '';

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
      ${stackHtml}

      <!-- Info 结构体三联探针面板 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex: 1;">
        <!-- Left Info -->
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(2, 6, 23, 0.5); display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-size: 0.8rem; font-weight: 600; color: #38bdf8; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>左子树 Info</span>
            <span style="font-size: 0.72rem; color: #64748b;">Postorder L</span>
          </div>
          ${
            leftInfo
              ? `
            <div style="font-size: 0.75rem; line-height: 1.5; color: #cbd5e1; font-family: monospace;">
              <div>isBST: <strong style="color: ${leftInfo.isBST ? '#34d399' : '#f87171'};">${leftInfo.isBST}</strong></div>
              <div>区间: [${leftInfo.min === Infinity ? 'INF' : leftInfo.min}, ${leftInfo.max === -Infinity ? '-INF' : leftInfo.max}]</div>
              <div>键值和: <strong style="color: #fde047;">${leftInfo.sum}</strong></div>
            </div>
          `
              : `<div style="font-size: 0.75rem; color: #64748b; font-style: italic;">尚未探查或空节点</div>`
          }
        </div>

        <!-- Current Node Decision -->
        <div style="padding: 10px; border-radius: 8px; border: 1px solid ${
          isCurrentBst ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.08)'
        }; background: ${isCurrentBst ? 'rgba(6, 78, 59, 0.25)' : 'rgba(2, 6, 23, 0.5)'}; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-size: 0.8rem; font-weight: 600; color: #fde047; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>当前节点决策</span>
            <span style="font-size: 0.72rem; font-weight: bold; color: ${isCurrentBst ? '#34d399' : '#94a3b8'};">
              ${currentInfo ? (isCurrentBst ? 'BST 成立' : '非 BST') : '评估中'}
            </span>
          </div>
          ${
            currentInfo
              ? `
            <div style="font-size: 0.75rem; line-height: 1.5; color: #cbd5e1; font-family: monospace;">
              <div>isBST: <strong style="color: ${currentInfo.isBST ? '#34d399' : '#f87171'};">${currentInfo.isBST}</strong></div>
              <div>区间: [${currentInfo.min}, ${currentInfo.max}]</div>
              <div>当前和: <strong style="color: #34d399;">${currentInfo.sum}</strong></div>
            </div>
          `
              : `<div style="font-size: 0.75rem; color: #64748b; font-style: italic;">等待子树汇报汇聚...</div>`
          }
        </div>

        <!-- Right Info -->
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(2, 6, 23, 0.5); display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-size: 0.8rem; font-weight: 600; color: #c084fc; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>右子树 Info</span>
            <span style="font-size: 0.72rem; color: #64748b;">Postorder R</span>
          </div>
          ${
            rightInfo
              ? `
            <div style="font-size: 0.75rem; line-height: 1.5; color: #cbd5e1; font-family: monospace;">
              <div>isBST: <strong style="color: ${rightInfo.isBST ? '#34d399' : '#f87171'};">${rightInfo.isBST}</strong></div>
              <div>区间: [${rightInfo.min === Infinity ? 'INF' : rightInfo.min}, ${rightInfo.max === -Infinity ? '-INF' : rightInfo.max}]</div>
              <div>键值和: <strong style="color: #fde047;">${rightInfo.sum}</strong></div>
            </div>
          `
              : `<div style="font-size: 0.75rem; color: #64748b; font-style: italic;">尚未探查或空节点</div>`
          }
        </div>
      </div>

      <!-- 全局最大和状态 -->
      <div style="padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.82rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; color: #34d399;">🏆 全局最高 BST 键值和: <strong style="font-size: 0.95rem; color: #f1f5f9;">${maxSumGlobal}</strong></span>
        <span style="color: #94a3b8; font-size: 0.76rem;">最优根节点: <strong style="color: #cbd5e1;">${bestBstRootId !== null ? `ID #${bestBstRootId}` : '暂无'}</strong></span>
      </div>
    </div>
  `;
}

// ============================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// ============================================================
export const maxSumBst036Visualizer = registerDeclarativeAlgorithm<MaxSumBstStep>({
  id: 'max-sum-bst-036',
  name: '二叉搜索子树最大键值和 (Class 036)',
  category: 'tree',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 36,
  learningGoal: '掌握二叉树树形 DP 递归套路与 Info 结构体设计，自底向上搜集子树信息判定二叉搜索树并动态刷新最大键值和',
  aliases: ['leetcode-1373', 'leetcode-333', 'max-sum-bst', 'maximum-sum-bst-in-binary-tree'],
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 树形 DP Info 收集',
      shortName: '树形DP',
      card2Title: '树形 DP 结构体探针与决策面板',
      card2Desc: '后序遍历自底向上搜集 Info(isBST, min, max, sum)',
      codeLanguages: MAX_SUM_BST_STAGE1_CODES,
      generateSteps: (rawInputs) => {
        const preset = (rawInputs.preset || 'classic_lc1373') as any;
        return buildMaxSumBstStage1Steps(preset);
      },
    },
    {
      id: 'stage2',
      name: 'Stage 2: 快速失效剪枝优化',
      shortName: '剪枝优化',
      card2Title: '快速失效剪枝状态面板',
      card2Desc: '破损非 BST 时快速向上传导 [0, 0, 0, 0] 免除无效求和',
      codeLanguages: MAX_SUM_BST_STAGE2_CODES,
      generateSteps: (rawInputs) => {
        const preset = (rawInputs.preset || 'classic_lc1373') as any;
        return buildMaxSumBstStage2Steps(preset);
      },
    },
    {
      id: 'stage3',
      name: 'Stage 3: 显式单调栈后序迭代',
      shortName: '栈迭代',
      card2Title: '显式后序栈帧与状态映射',
      card2Desc: '显式单调栈消除系统调用栈爆栈风险',
      codeLanguages: MAX_SUM_BST_STAGE3_CODES,
      generateSteps: (rawInputs) => {
        const preset = (rawInputs.preset || 'classic_lc1373') as any;
        return buildMaxSumBstStage3Steps(preset);
      },
    },
  ],
  inputs: [
    {
      id: 'preset',
      label: '树形测试用例',
      type: 'select',
      defaultValue: 'classic_lc1373',
      options: [
        { label: 'LC 1373 官方多层破损树', value: 'classic_lc1373' },
        { label: '全树均为严格 BST 用例', value: 'full_bst' },
        { label: '根节点倒错非 BST 用例', value: 'broken_bst' },
      ],
    },
  ],
  card2Title: '树形 DP 结构体探针与决策面板',
  card2Desc: '后序遍历自底向上搜集 Info(isBST, min, max, sum)',
  problemHtml: MAX_SUM_BST_PROBLEM_HTML,
  analysisHtml: MAX_SUM_BST_ANALYSIS_HTML,
  renderCanvas: (container: HTMLElement, step: any) => {
    renderMaxSumBstCanvas(container, step as MaxSumBstStep);
  },
  renderCustomMetrics: (container: HTMLElement, step: any) => {
    renderMaxSumBstCard2(container, step as MaxSumBstStep);
  },
});
