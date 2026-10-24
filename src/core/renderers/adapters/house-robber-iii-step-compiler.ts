/**
 * House Robber III Step Compiler (LeetCode 337 / Class 037 Code05)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * 负责打家劫舍 III 树形 DP (自底向上树形递归汇聚与状态推演)。
 * 深度集成 RecursiveCallTraceAdapter，输出逐帧调用的树形推演快照。
 */

import { TreeNode036, Tree036Step } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { HOUSE_ROBBER_III_037_LINES } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-stage-codes';
import { RecursiveCallTraceSnapshot, CallTraceLine } from './recursive-call-trace-adapter';

// 经典二叉树: 根 3 -> 左 2 (右 3), 右 3 (右 1)
export const ROB_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3, x: 200, y: 35 },
  { id: 2, val: 2, left: null, right: 4, x: 120, y: 105 },
  { id: 3, val: 3, left: null, right: 5, x: 280, y: 105 },
  { id: 4, val: 3, left: null, right: null, x: 160, y: 175 },
  { id: 5, val: 1, left: null, right: null, x: 320, y: 175 },
];

export const ROB_TREE_NODES_EX2: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3, x: 200, y: 35 },
  { id: 2, val: 4, left: 4, right: 5, x: 100, y: 105 },
  { id: 3, val: 5, left: null, right: 6, x: 300, y: 105 },
  { id: 4, val: 1, left: null, right: null, x: 60, y: 175 },
  { id: 5, val: 3, left: null, right: null, x: 140, y: 175 },
  { id: 6, val: 1, left: null, right: null, x: 340, y: 175 },
];

export const ROB_SINGLE_NODE: TreeNode036[] = [
  { id: 1, val: 10, left: null, right: null, x: 200, y: 100 },
];

class RobCallTrace {
  private lines: CallTraceLine[] = [];
  private activeLineId?: string;

  addHeader(text: string, depth: number, comment?: string): string {
    const id = `line-${this.lines.length + 1}`;
    this.lines.push({ id, depth, text, kind: 'header', comment, status: 'active' });
    this.activeLineId = id;
    return id;
  }

  addConditionHit(text: string, depth: number): string {
    const id = `line-${this.lines.length + 1}`;
    this.lines.push({ id, depth, text, kind: 'condition-hit', status: 'active' });
    this.activeLineId = id;
    return id;
  }

  addConditionPass(text: string, depth: number): string {
    const id = `line-${this.lines.length + 1}`;
    this.lines.push({ id, depth, text, kind: 'condition-pass', status: 'active' });
    this.activeLineId = id;
    return id;
  }

  addReturnLeaf(text: string, depth: number): string {
    const id = `line-${this.lines.length + 1}`;
    this.lines.push({ id, depth, text, kind: 'return-leaf', status: 'done' });
    this.activeLineId = id;
    return id;
  }

  addUnwind(text: string, depth: number, formula?: string): string {
    const id = `line-${this.lines.length + 1}`;
    this.lines.push({ id, depth, text, kind: 'unwind-calc', formula, status: 'done' });
    this.activeLineId = id;
    return id;
  }

  addFinalResult(text: string, depth: number, formula?: string, val?: number | string): string {
    const id = `line-${this.lines.length + 1}`;
    this.lines.push({ id, depth, text, kind: 'final-result', formula, status: 'done' });
    this.activeLineId = id;
    return id;
  }

  snapshot(): RecursiveCallTraceSnapshot {
    return {
      lines: JSON.parse(JSON.stringify(this.lines)),
      activeLineId: this.activeLineId,
    };
  }
}

export function buildHouseRobberIII037Steps(treeRaw?: string): Tree036Step[] {
  const steps: Tree036Step[] = [];
  const lines = HOUSE_ROBBER_III_037_LINES;
  const raw = (treeRaw || '').trim().replace(/\s+/g, '');

  if (raw === '10') {
    const tNodes = ROB_SINGLE_NODE;
    const singleTrace = new RobCallTrace();
    singleTrace.addHeader('rob(root: 10)', 0, '← 树形DP主入口');
    steps.push({
      codeLine: lines.entry,
      decision: '启动打家劫舍 III 树形 DP (单节点)',
      message: '单节点树，无需递归子节点',
      log: 'rob(root: 10)',
      activeNodeId: 1,
      metrics: { '当前节点': '节点 10', '树形DP状态定义': '[不偷最大收益, 偷当前最大收益]' },
      statusBadge: { text: '树形DP启动', type: 'info' },
      extraData: { treeNodes: tNodes, badges: { 1: '[0, 10]' }, callTrace: singleTrace.snapshot() },
    });

    singleTrace.addReturnLeaf('节点 10 返回状态: [notRob: 0, robCur: 10]', 0);
    steps.push({
      codeLine: lines.baseCheck,
      decision: '单节点 10 的 DP 状态 [0, 10]',
      message: '若不偷收益为 0；若偷收益为 10。返回状态 [0, 10]',
      log: 'dp(10) -> [notRob: 0, rob: 10]',
      activeNodeId: 1,
      metrics: { '当前节点': '节点 10', '不偷当前收益': 0, '偷当前收益': 10 },
      statusBadge: { text: '单节点决策: [0, 10]', type: 'info' },
      extraData: { treeNodes: tNodes, badges: { 1: '[0, 10]' }, callTrace: singleTrace.snapshot() },
    });

    singleTrace.addFinalResult('全树决策: max(notRob: 0, robCur: 10) = 10', 0, 'return 10', 10);
    steps.push({
      codeLine: lines.returnMax,
      decision: '取最优决策 max(0, 10) = 10',
      message: '直接偷单节点 10，获得最大金额 10',
      log: 'return 10',
      activeNodeId: 1,
      metrics: { '当前节点': '节点 10', '全树最优窃取金额': 10 },
      statusBadge: { text: '最大金额 = 10', type: 'success' },
      extraData: { treeNodes: tNodes, badges: { 1: '💰 偷取 (+10)' }, callTrace: singleTrace.snapshot() },
    });

    return steps;
  }

  let nodes: TreeNode036[] = ROB_TREE_NODES;
  if (raw.includes('3,4,5') || raw.includes('4,5')) {
    nodes = ROB_TREE_NODES_EX2;
  }

  const nodeMap = new Map<number, TreeNode036>(nodes.map((n) => [n.id, n]));
  const badges: Record<number, string> = {};
  const trace = new RobCallTrace();

  // Step 1: 入口
  trace.addHeader(`rob(root = ${nodes[0]?.val})`, 0, '← 树形DP主入口');
  steps.push({
    codeLine: lines.entry,
    decision: '启动打家劫舍 III 树形动态规划',
    message: '二叉树树形 DP 状态设计：每个节点返回元组 [notRob, robCur]。向左右要信息，根据父子互斥原则完成自底向上后序状态转移',
    log: `rob(root: ${nodes[0]?.val}), 调用 dp(root)`,
    activeNodeId: nodes[0]?.id ?? 1,
    metrics: {
      '当前节点': `根节点 ${nodes[0]?.val}`,
      '状态定义': '[不偷最大收益, 偷当前最大收益]',
      '父子约束': '若偷父，必不偷子',
      '时间复杂度': 'O(N) 线性遍历',
    },
    statusBadge: { text: '树形DP启动', type: 'info' },
    extraData: { treeNodes: nodes, badges: { ...badges }, callTrace: trace.snapshot() },
  });

  // 内部后序递归
  function postorderDp(node: TreeNode036 | undefined, depth: number): [number, number] {
    if (!node) {
      trace.addConditionHit('node == null -> return [0, 0]', depth);
      steps.push({
        codeLine: lines.baseCheck,
        decision: '空节点基准条件：收益均为 0',
        message: '空节点无法盗窃，返回状态 [notRob = 0, robCur = 0]。',
        log: 'dp(null) -> [0, 0]',
        activeNodeId: null,
        metrics: {
          '当前节点': '空节点 (null)',
          '不偷当前收益': 0,
          '偷当前收益': 0,
        },
        statusBadge: { text: '空节点: [0, 0]', type: 'info' },
        extraData: { treeNodes: nodes, badges: { ...badges }, callTrace: trace.snapshot() },
      });
      return [0, 0];
    }

    trace.addHeader(`dp(节点 ${node.val})`, depth);
    steps.push({
      codeLine: lines.dpHeader,
      decision: `深入调用帧: 处理节点 ${node.val}`,
      message: `进入 dp(节点 ${node.val})，准备向左孩子与右孩子后序索要信息。`,
      log: `dp(node: ${node.val})`,
      activeNodeId: node.id,
      metrics: {
        '当前节点': `节点 ${node.val}`,
        '节点金额': node.val,
        '执行阶段': '向子节点索要信息',
      },
      statusBadge: { text: `访问节点 ${node.val}`, type: 'info' },
      extraData: { treeNodes: nodes, badges: { ...badges }, callTrace: trace.snapshot() },
    });

    // 递归左孩子
    let leftRes: [number, number] = [0, 0];
    const leftChild = node.left != null ? nodeMap.get(node.left) : undefined;
    if (leftChild) {
      trace.addConditionPass(`① 向左孩子深入: dp(节点 ${leftChild.val})`, depth);
      steps.push({
        codeLine: lines.recurseLeft,
        decision: `深入左子树: dp(节点 ${leftChild.val})`,
        message: `向左子树递归索取信息 [leftNotRob, leftRobCur]。`,
        log: `dp(left: ${leftChild.val})`,
        activeNodeId: node.id,
        secondaryNodeId: leftChild.id,
        metrics: {
          '当前节点': `节点 ${node.val}`,
          '下一探针': `左孩子 ${leftChild.val}`,
        },
        statusBadge: { text: `进入左子树`, type: 'warning' },
        extraData: { treeNodes: nodes, badges: { ...badges }, callTrace: trace.snapshot() },
      });
      leftRes = postorderDp(leftChild, depth + 1);
    }

    // 递归右孩子
    let rightRes: [number, number] = [0, 0];
    const rightChild = node.right != null ? nodeMap.get(node.right) : undefined;
    if (rightChild) {
      trace.addConditionPass(`② 向右孩子深入: dp(节点 ${rightChild.val})`, depth);
      steps.push({
        codeLine: lines.recurseRight,
        decision: `深入右子树: dp(节点 ${rightChild.val})`,
        message: `向右子树递归索取信息 [rightNotRob, rightRobCur]。`,
        log: `dp(right: ${rightChild.val})`,
        activeNodeId: node.id,
        secondaryNodeId: rightChild.id,
        metrics: {
          '当前节点': `节点 ${node.val}`,
          '下一探针': `右孩子 ${rightChild.val}`,
        },
        statusBadge: { text: `进入右子树`, type: 'warning' },
        extraData: { treeNodes: nodes, badges: { ...badges }, callTrace: trace.snapshot() },
      });
      rightRes = postorderDp(rightChild, depth + 1);
    }

    // 计算当前节点状态
    // 1. 偷当前节点: robCur = node.val + left[0] + right[0]
    const robCur = node.val + leftRes[0] + rightRes[0];
    trace.addUnwind(
      `偷当前: ${node.val} + left[0](${leftRes[0]}) + right[0](${rightRes[0]}) = ${robCur}`,
      depth,
      `robCur = node.val + left[0] + right[0]`
    );
    steps.push({
      codeLine: lines.robCur,
      decision: `节点 ${node.val} 状态转移: 尝试偷取当前`,
      message: `若偷当前节点：左右子节点绝对不可偷取！收益 = 金额(${node.val}) + 左不偷(${leftRes[0]}) + 右不偷(${rightRes[0]}) = ${robCur}。`,
      log: `dp(${node.val}) robCur = ${node.val} + ${leftRes[0]} + ${rightRes[0]} = ${robCur}`,
      activeNodeId: node.id,
      secondaryNodeId: leftChild?.id ?? rightChild?.id,
      metrics: {
        '当前节点': `节点 ${node.val}`,
        '偷当前收益': robCur,
        '计算公式': `${node.val} + ${leftRes[0]} + ${rightRes[0]}`,
        '互斥约束': '左右子树必须取不偷状态',
      },
      statusBadge: { text: `偷收益: ${robCur}`, type: 'warning' },
      extraData: { treeNodes: nodes, badges: { ...badges }, callTrace: trace.snapshot() },
    });

    // 2. 不偷当前节点: notRob = max(left[0], left[1]) + max(right[0], right[1])
    const maxLeft = Math.max(leftRes[0], leftRes[1]);
    const maxRight = Math.max(rightRes[0], rightRes[1]);
    const notRob = maxLeft + maxRight;
    trace.addUnwind(
      `不偷当前: max(${leftRes[0]}, ${leftRes[1]}) + max(${rightRes[0]}, ${rightRes[1]}) = ${notRob}`,
      depth,
      `notRob = max(left) + max(right)`
    );
    steps.push({
      codeLine: lines.notRob,
      decision: `节点 ${node.val} 状态转移: 尝试放弃当前`,
      message: `若不偷当前节点：左右子节点解绑，可偷可不偷取较大值！收益 = max(${leftRes[0]}, ${leftRes[1]}) + max(${rightRes[0]}, ${rightRes[1]}) = ${notRob}。`,
      log: `dp(${node.val}) notRob = max(${leftRes}) + max(${rightRes}) = ${notRob}`,
      activeNodeId: node.id,
      secondaryNodeId: leftChild?.id ?? rightChild?.id,
      metrics: {
        '当前节点': `节点 ${node.val}`,
        '不偷当前收益': notRob,
        '左子树最优': maxLeft,
        '右子树最优': maxRight,
      },
      statusBadge: { text: `不偷收益: ${notRob}`, type: 'warning' },
      extraData: { treeNodes: nodes, badges: { ...badges }, callTrace: trace.snapshot() },
    });

    // 3. 产生该节点完整返回元组
    badges[node.id] = `[${notRob}, ${robCur}]`;
    trace.addReturnLeaf(`节点 ${node.val} 返回状态: [notRob: ${notRob}, robCur: ${robCur}]`, depth);
    steps.push({
      codeLine: lines.returnDp,
      decision: `节点 ${node.val} 状态确立: 返回 [${notRob}, ${robCur}]`,
      message: `节点 ${node.val} 归约完毕！向父层返回 [notRob = ${notRob}, robCur = ${robCur}]，局部最优 = ${Math.max(notRob, robCur)}。`,
      log: `return new int[]{${notRob}, ${robCur}}`,
      activeNodeId: node.id,
      metrics: {
        '当前节点': `节点 ${node.val}`,
        '不偷当前收益': notRob,
        '偷当前收益': robCur,
        '当前局部最优': Math.max(notRob, robCur),
      },
      statusBadge: { text: `确立: [${notRob}, ${robCur}]`, type: 'info' },
      extraData: { treeNodes: nodes, badges: { ...badges }, callTrace: trace.snapshot() },
    });

    return [notRob, robCur];
  }

  const rootRes = postorderDp(nodes[0], 0);
  const finalAns = Math.max(rootRes[0], rootRes[1]);

  trace.addFinalResult(
    `全树决策: max(notRob: ${rootRes[0]}, robCur: ${rootRes[1]}) = ${finalAns}`,
    0,
    `return Math.max(res[0], res[1]);`,
    finalAns
  );

  // 最终收官步：给各节点打上最终偷/不偷的指示徽章
  if (finalAns === rootRes[1]) {
    // 偷根节点最优
    badges[nodes[0].id] = `💰 偷取 (+${nodes[0].val})`;
    if (nodes[0].left && nodeMap.get(nodes[0].left)) badges[nodes[0].left] = '🛡️ 放弃 (防报警)';
    if (nodes[0].right && nodeMap.get(nodes[0].right)) badges[nodes[0].right] = '🛡️ 放弃 (防报警)';
  } else {
    // 不偷根节点最优
    badges[nodes[0].id] = '🛡️ 放弃 (子树更优)';
  }

  steps.push({
    codeLine: lines.returnMax,
    decision: `全树决策大圆满: 取根节点最优决策 max(${rootRes[0]}, ${rootRes[1]}) = ${finalAns}`,
    message: `全树递归遍历完毕！根节点状态 [不偷: ${rootRes[0]}, 偷: ${rootRes[1]}]，取较大者获得全树最大盗窃金额 ${finalAns}！`,
    log: `return Math.max(${rootRes[0]}, ${rootRes[1]}) = ${finalAns}`,
    activeNodeId: nodes[0]?.id ?? 1,
    metrics: {
      '当前节点': `根节点 ${nodes[0]?.val}`,
      '不偷当前收益': rootRes[0],
      '偷当前收益': rootRes[1],
      '全树最优窃取金额': finalAns,
    },
    statusBadge: { text: `最大金额 = ${finalAns}`, type: 'success' },
    extraData: { treeNodes: nodes, badges: { ...badges }, callTrace: trace.snapshot() },
  });

  return steps;
}
