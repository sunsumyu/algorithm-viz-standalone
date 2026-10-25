/**
 * Lowest Common Ancestor in BST Step Compiler (LeetCode 235 / Class 037 Code02)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * 负责 BST 最近公共祖先单调性分叉推演与状态步进编译。
 * 支持 Stage 1 (递归分流 + RecursiveCallTrace) 与 Stage 2 (迭代 O(1) 空间)。
 */

import { TreeNode036, Tree036Step } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import {
  LCA_BST_037_STAGE1_LINES,
  LCA_BST_037_STAGE2_LINES,
} from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-stage-codes';
import { RecursiveCallTraceSnapshot, CallTraceLine } from './recursive-call-trace-adapter';

// 二叉搜索树标准结构: 根 6 -> 左 2 (0, 4 -> 3, 5), 右 8 (7, 9)
export const BST_LCA_NODES: TreeNode036[] = [
  { id: 1, val: 6, left: 2, right: 3, x: 200, y: 35 },
  { id: 2, val: 2, left: 4, right: 5, x: 100, y: 95 },
  { id: 3, val: 8, left: 6, right: 7, x: 300, y: 95 },
  { id: 4, val: 0, left: null, right: null, x: 50, y: 155 },
  { id: 5, val: 4, left: 8, right: 9, x: 140, y: 155 },
  { id: 6, val: 7, left: null, right: null, x: 260, y: 155 },
  { id: 7, val: 9, left: null, right: null, x: 340, y: 155 },
  { id: 8, val: 3, left: null, right: null, x: 115, y: 215 },
  { id: 9, val: 5, left: null, right: null, x: 165, y: 215 },
];

class LcaCallTrace {
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

  addFinalResult(text: string, depth: number, formula?: string): string {
    const id = `line-${this.lines.length + 1}`;
    this.lines.push({ id, depth, text, kind: 'final-result', formula, status: 'done' });
    this.activeLineId = id;
    return id;
  }

  setActive(id: string) {
    this.activeLineId = id;
  }

  snapshot(): RecursiveCallTraceSnapshot {
    return {
      lines: JSON.parse(JSON.stringify(this.lines)),
      activeLineId: this.activeLineId,
    };
  }
}

// =========================================================================
// Stage 1: 递归自顶向下分叉推演 (Recursive Top-Down Branching)
// =========================================================================
export function buildLcaBstStage1RecursiveSteps(
  treeRaw?: string,
  pInput?: number | string,
  qInput?: number | string
): Tree036Step[] {
  const steps: Tree036Step[] = [];
  const lines = LCA_BST_037_STAGE1_LINES;

  const pVal = pInput !== undefined && pInput !== '' && !isNaN(Number(pInput)) ? Number(pInput) : 3;
  const qVal = qInput !== undefined && qInput !== '' && !isNaN(Number(qInput)) ? Number(qInput) : 5;
  const minVal = Math.min(pVal, qVal);
  const maxVal = Math.max(pVal, qVal);

  const nodes = BST_LCA_NODES;
  const nodeMap = new Map<number, TreeNode036>(nodes.map((n) => [n.id, n]));
  const valToNode = new Map<number, TreeNode036>(nodes.map((n) => [n.val, n]));

  const pNode = valToNode.get(pVal);
  const qNode = valToNode.get(qVal);

  const trace = new LcaCallTrace();

  // 算法启动
  trace.addHeader(`lowestCommonAncestor(root = 6, p = ${pVal}, q = ${qVal})`, 0, '← 根调用入口');
  steps.push({
    codeLine: lines.entry,
    decision: `BST 最近公共祖先递归查找启动 (目标 p = ${pVal}, q = ${qVal})`,
    message: `利用 BST 左小右大严格单调性：目标区间 [${minVal}, ${maxVal}]。若当前节点大于两者则递归左子树；若小于两者则递归右子树；首次分流处即为 LCA！`,
    log: `lowestCommonAncestor(root = 6, p = ${pVal}, q = ${qVal})`,
    activeNodeId: 1,
    secondaryNodeId: pNode?.id ?? qNode?.id,
    metrics: {
      '当前数值': 6,
      '目标 p': pVal,
      '目标 q': qVal,
      '目标区间': `[${minVal}, ${maxVal}]`,
      '分叉节点 (LCA)': '推演中...',
    },
    statusBadge: { text: '递归启动', type: 'info' },
    extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
  });

  function recurse(cur: TreeNode036 | undefined, depth: number): TreeNode036 | undefined {
    if (!cur) {
      trace.addConditionHit(`root == null 命中 -> return null`, depth);
      steps.push({
        codeLine: lines.nullCheck,
        decision: `遇到空节点，向上回溯`,
        message: `当前子树为空 (null)，说明目标不在当前分支，返回 null。`,
        log: `lowestCommonAncestor(null) -> null`,
        activeNodeId: null,
        secondaryNodeId: pNode?.id ?? qNode?.id,
        metrics: {
          '当前数值': 'null',
          '目标 p': pVal,
          '目标 q': qVal,
          '目标区间': `[${minVal}, ${maxVal}]`,
          '分叉节点 (LCA)': '推演中...',
        },
        statusBadge: { text: '空节点回溯', type: 'warning' },
        extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
      });
      return undefined;
    }

    if (depth > 0) {
      trace.addHeader(`lowestCommonAncestor(root = ${cur.val}, p = ${pVal}, q = ${qVal})`, depth);
      steps.push({
        codeLine: lines.entry,
        decision: `深入调用帧: 检查当前节点 ${cur.val}`,
        message: `进入 lowestCommonAncestor(节点 ${cur.val})。对比节点值与目标区间 [${minVal}, ${maxVal}]。`,
        log: `lowestCommonAncestor(root = ${cur.val}, p = ${pVal}, q = ${qVal})`,
        activeNodeId: cur.id,
        secondaryNodeId: pNode?.id ?? qNode?.id,
        metrics: {
          '当前数值': cur.val,
          '目标 p': pVal,
          '目标 q': qVal,
          '目标区间': `[${minVal}, ${maxVal}]`,
          '分叉节点 (LCA)': '推演中...',
        },
        statusBadge: { text: `访问节点 ${cur.val}`, type: 'info' },
        extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
      });
    }

    if (cur.val > maxVal) {
      // 两个目标都在左子树
      const nextLeftId: number | null | undefined = cur.left;
      const nextNode: TreeNode036 | undefined = nextLeftId != null ? nodeMap.get(nextLeftId) : undefined;
      trace.addConditionPass(`① ${cur.val} > max(${pVal}, ${qVal}) -> 递归左子树 lowestCommonAncestor(${nextNode?.val ?? 'null'})`, depth);
      steps.push({
        codeLine: lines.goLeft,
        decision: `节点 ${cur.val} 同时大于 p(${pVal}) 与 q(${qVal})，向左递归`,
        message: `${cur.val} > ${pVal} 且 ${cur.val} > ${qVal}：两目标均在左子树中，进入 root.left (节点 ${nextNode ? nextNode.val : 'null'})`,
        log: `lowestCommonAncestor(left = ${nextNode?.val ?? 'null'})`,
        activeNodeId: cur.id,
        secondaryNodeId: nextNode?.id,
        metrics: {
          '当前数值': cur.val,
          '目标 p': pVal,
          '目标 q': qVal,
          '目标比较': `${cur.val} > ${maxVal}`,
          '走向': '向左递归 ⬅️',
          '分叉节点 (LCA)': '推演中...',
        },
        statusBadge: { text: `左转: ${nextNode?.val ?? nextLeftId}`, type: 'warning' },
        extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
      });
      const res = recurse(nextNode, depth + 1);
      trace.addReturnLeaf(`向上一层返回节点 ${res?.val}`, depth);
      return res;
    } else if (cur.val < minVal) {
      // 两个目标都在右子树
      const nextRightId: number | null | undefined = cur.right;
      const nextNode: TreeNode036 | undefined = nextRightId != null ? nodeMap.get(nextRightId) : undefined;
      trace.addConditionPass(`② ${cur.val} < min(${pVal}, ${qVal}) -> 递归右子树 lowestCommonAncestor(${nextNode?.val ?? 'null'})`, depth);
      steps.push({
        codeLine: lines.goRight,
        decision: `节点 ${cur.val} 同时小于 p(${pVal}) 与 q(${qVal})，向右递归`,
        message: `${cur.val} < ${pVal} 且 ${cur.val} < ${qVal}：两目标均在右子树中，进入 root.right (节点 ${nextNode ? nextNode.val : 'null'})`,
        log: `lowestCommonAncestor(right = ${nextNode?.val ?? 'null'})`,
        activeNodeId: cur.id,
        secondaryNodeId: nextNode?.id,
        metrics: {
          '当前数值': cur.val,
          '目标 p': pVal,
          '目标 q': qVal,
          '目标比较': `${cur.val} < ${minVal}`,
          '走向': '向右递归 ➡️',
          '分叉节点 (LCA)': '推演中...',
        },
        statusBadge: { text: `右转: ${nextNode?.val ?? nextRightId}`, type: 'warning' },
        extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
      });
      const res = recurse(nextNode, depth + 1);
      trace.addReturnLeaf(`向上一层返回节点 ${res?.val}`, depth);
      return res;
    } else {
      // 分叉命中或当前节点即是其中之一
      const isDirectMatch = cur.val === pVal || cur.val === qVal;
      trace.addConditionHit(
        isDirectMatch
          ? `③ 当前节点 ${cur.val} 即为目标之一 -> return TreeNode(${cur.val}) (命中 LCA)`
          : `③ ${minVal} <= ${cur.val} <= ${maxVal} 分叉点成立 -> return TreeNode(${cur.val}) (命中 LCA)`,
        depth
      );
      trace.addFinalResult(`🎯 LCA 定位成功: 节点 ${cur.val}`, depth, `return root;`);

      steps.push({
        codeLine: lines.splitFork,
        decision: isDirectMatch
          ? `当前节点 ${cur.val} 即为目标之一，命中 LCA！`
          : `节点 ${cur.val} 介于 p(${pVal}) 与 q(${qVal}) 之间，分叉命中 LCA！`,
        message: isDirectMatch
          ? `节点 ${cur.val} 本身即为目标之一，另一目标在其子树中，根据 LCA 定义直接返回该节点！`
          : `节点 ${cur.val} 满足 ${minVal} <= ${cur.val} <= ${maxVal}：目标在此首次分流，命中最近公共祖先！`,
        log: `分叉点确定: lowestCommonAncestor = TreeNode(${cur.val})`,
        activeNodeId: cur.id,
        secondaryNodeId: pNode?.id ?? qNode?.id,
        metrics: {
          '分叉节点 (LCA)': `节点 ${cur.val}`,
          '目标 p': pVal,
          '目标 q': qVal,
          '判定性质': isDirectMatch ? '当前节点为目标之一' : '数值分叉点',
        },
        statusBadge: { text: `命中 LCA: 节点 ${cur.val}`, type: 'success' },
        extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
      });
      return cur;
    }
  }

  recurse(nodes[0], 0);
  return steps;
}

// =========================================================================
// Stage 2: 迭代常数空间指针移动 (Iterative O(1) Space Pointer Traversal)
// =========================================================================
export function buildLcaBstStage2IterativeSteps(
  treeRaw?: string,
  pInput?: number | string,
  qInput?: number | string
): Tree036Step[] {
  const steps: Tree036Step[] = [];
  const lines = LCA_BST_037_STAGE2_LINES;

  const pVal = pInput !== undefined && pInput !== '' && !isNaN(Number(pInput)) ? Number(pInput) : 3;
  const qVal = qInput !== undefined && qInput !== '' && !isNaN(Number(qInput)) ? Number(qInput) : 5;
  const minVal = Math.min(pVal, qVal);
  const maxVal = Math.max(pVal, qVal);

  const nodes = BST_LCA_NODES;
  const nodeMap = new Map<number, TreeNode036>(nodes.map((n) => [n.id, n]));
  const valToNode = new Map<number, TreeNode036>(nodes.map((n) => [n.val, n]));

  const pNode = valToNode.get(pVal);
  const qNode = valToNode.get(qVal);

  let cur: TreeNode036 | undefined = nodes[0]; // root 6

  steps.push({
    codeLine: lines.entry,
    decision: `迭代 LCA 算法启动 (目标 p = ${pVal}, q = ${qVal})`,
    message: `以常数空间 O(1) 指针遍历：只要 root != null 持续比较，无需递归栈帧。`,
    log: `lowestCommonAncestor(root = ${cur?.val}, p = ${pVal}, q = ${qVal})`,
    activeNodeId: cur?.id ?? 1,
    secondaryNodeId: pNode?.id ?? qNode?.id,
    metrics: {
      '当前指针': `节点 ${cur?.val}`,
      '目标 p': pVal,
      '目标 q': qVal,
      '目标区间': `[${minVal}, ${maxVal}]`,
      '空间复杂度': 'O(1) 常数空间',
      '分叉节点 (LCA)': '查找中...',
    },
    statusBadge: { text: '迭代启动', type: 'info' },
    extraData: { treeNodes: nodes },
  });

  while (cur) {
    steps.push({
      codeLine: lines.whileLoop,
      decision: `while (root != null) 循环：检查指针节点 ${cur.val}`,
      message: `当前指针位于节点 ${cur.val}。比较与目标区间 [${minVal}, ${maxVal}] 的单调位置。`,
      log: `while(root != null) -> root.val = ${cur.val}`,
      activeNodeId: cur.id,
      secondaryNodeId: pNode?.id ?? qNode?.id,
      metrics: {
        '当前指针': `节点 ${cur.val}`,
        '目标 p': pVal,
        '目标 q': qVal,
        '目标区间': `[${minVal}, ${maxVal}]`,
        '空间复杂度': 'O(1)',
        '分叉节点 (LCA)': '查找中...',
      },
      statusBadge: { text: `检查节点 ${cur.val}`, type: 'info' },
      extraData: { treeNodes: nodes },
    });

    if (cur.val > maxVal) {
      const nextLeftId: number | null | undefined = cur.left;
      const nextNode: TreeNode036 | undefined = nextLeftId != null ? nodeMap.get(nextLeftId) : undefined;
      steps.push({
        codeLine: lines.goLeft,
        decision: `当前节点 ${cur.val} > max(${pVal}, ${qVal})，指针移向 root.left`,
        message: `两目标均在左子树，指针直接更新为 root.left (节点 ${nextNode ? nextNode.val : 'null'})。`,
        log: `root = root.left (${nextNode?.val ?? nextLeftId})`,
        activeNodeId: cur.id,
        secondaryNodeId: nextNode?.id,
        metrics: {
          '当前指针': `节点 ${cur.val}`,
          '比较条件': `${cur.val} > ${maxVal}`,
          '下一指针': `节点 ${nextNode?.val ?? 'null'}`,
          '走向': '⬅️ 移向左子树',
          '分叉节点 (LCA)': '查找中...',
        },
        statusBadge: { text: `左移: ${nextNode?.val ?? nextLeftId}`, type: 'warning' },
        extraData: { treeNodes: nodes },
      });
      cur = nextNode;
    } else if (cur.val < minVal) {
      const nextRightId: number | null | undefined = cur.right;
      const nextNode: TreeNode036 | undefined = nextRightId != null ? nodeMap.get(nextRightId) : undefined;
      steps.push({
        codeLine: lines.goRight,
        decision: `当前节点 ${cur.val} < min(${pVal}, ${qVal})，指针移向 root.right`,
        message: `两目标均在右子树，指针直接更新为 root.right (节点 ${nextNode ? nextNode.val : 'null'})。`,
        log: `root = root.right (${nextNode?.val ?? nextRightId})`,
        activeNodeId: cur.id,
        secondaryNodeId: nextNode?.id,
        metrics: {
          '当前指针': `节点 ${cur.val}`,
          '比较条件': `${cur.val} < ${minVal}`,
          '下一指针': `节点 ${nextNode?.val ?? 'null'}`,
          '走向': '➡️ 移向右子树',
          '分叉节点 (LCA)': '查找中...',
        },
        statusBadge: { text: `右移: ${nextNode?.val ?? nextRightId}`, type: 'warning' },
        extraData: { treeNodes: nodes },
      });
      cur = nextNode;
    } else {
      const isDirectMatch = cur.val === pVal || cur.val === qVal;
      steps.push({
        codeLine: lines.splitFork,
        decision: isDirectMatch
          ? `当前指针 ${cur.val} 即为目标之一，直接返回！`
          : `指针节点 ${cur.val} 介于两目标之间，分叉命中 LCA！`,
        message: isDirectMatch
          ? `当前节点 ${cur.val} 自身即为目标，另一目标必在其子树内，直接 return root。`
          : `满足 ${minVal} <= ${cur.val} <= ${maxVal}，两目标在此首次分岔，直接 return root！`,
        log: `return root (节点 ${cur.val})`,
        activeNodeId: cur.id,
        secondaryNodeId: pNode?.id ?? qNode?.id,
        metrics: {
          '分叉节点 (LCA)': `节点 ${cur.val}`,
          '目标 p': pVal,
          '目标 q': qVal,
          '判定性质': isDirectMatch ? '当前节点为目标之一' : '数值分叉点',
        },
        statusBadge: { text: `命中 LCA: 节点 ${cur.val}`, type: 'success' },
        extraData: { treeNodes: nodes },
      });
      break;
    }
  }

  return steps;
}

// 统一向后兼容函数
export function buildLcaBst037Steps(
  treeRaw?: string,
  pInput?: number | string,
  qInput?: number | string
): Tree036Step[] {
  return buildLcaBstStage1RecursiveSteps(treeRaw, pInput, qInput);
}
