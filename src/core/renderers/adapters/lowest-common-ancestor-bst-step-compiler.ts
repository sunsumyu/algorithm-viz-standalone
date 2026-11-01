/**
 * Lowest Common Ancestor in BST Step Compiler (LeetCode 235 / Class 037 Code02)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * 负责 BST 最近公共祖先单调性分叉推演与状态步进编译。
 * 支持 Stage 1 (递归分流 + RecursiveCallTrace) 与 Stage 2 (迭代 O(1) 空间)。
 */

import { TreeNode036, Tree036Step } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { TreeNode } from '../tree-svg';
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

/**
 * 由 BST_LCA_NODES 构建核心 TreeNode 链接树 (保留原数字 id 供高亮按 id 精确匹配)。
 * 挂载到 step.tree 后，StepNormalizationEngine 阶段 4 会自动合成树上挂树全景，
 * Card 1 全景推演树子视图随之渲染图形化推演树而非文本讲义兜底。
 */
export function buildLinkedBstLcaTree(): TreeNode {
  const nodeMap = new Map<number, TreeNode>(
    BST_LCA_NODES.map((n) => [n.id, { val: n.val, id: n.id } as TreeNode])
  );
  for (const n of BST_LCA_NODES) {
    const cur = nodeMap.get(n.id)!;
    cur.left = n.left != null ? nodeMap.get(n.left) ?? null : null;
    cur.right = n.right != null ? nodeMap.get(n.right) ?? null : null;
  }
  return nodeMap.get(1)!;
}

/** 为步骤序列批量挂载链接树与当前节点值 (供统一画布与全景推演消费) */
function attachTreeContext(steps: Tree036Step[]): Tree036Step[] {
  const linkedTree = buildLinkedBstLcaTree();
  const idToVal = new Map(BST_LCA_NODES.map((n) => [n.id, n.val]));
  for (const s of steps as any[]) {
    s.tree = linkedTree;
    s.current = s.activeNodeId != null ? idToVal.get(s.activeNodeId) ?? null : null;
  }
  return steps;
}

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
  let foundLCA: number | null = null;

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

  function recurse(
    cur: TreeNode036 | undefined,
    depth: number,
    parent?: TreeNode036,
    branch: 'left' | 'right' = 'left'
  ): TreeNode036 | undefined {
    // 递归推演五段式 ①: 函数入口帧 (带实参进入函数头，空子树挂探针锚点)
    if (depth > 0) {
      const label = cur ? `Node(${cur.val})` : 'null';
      trace.addHeader(`lowestCommonAncestor(${branch === 'left' ? 'root.left' : 'root.right'} = ${label}, p = ${pVal}, q = ${qVal})`, depth);
      steps.push({
        codeLine: lines.entry,
        decision: cur ? `深入调用帧: 携带实参进入节点 ${cur.val}` : `深入调用帧: 探测${branch === 'left' ? '左' : '右'}子树空槽位`,
        message: cur
          ? `进入 lowestCommonAncestor(节点 ${cur.val})，准备判空与单调性比较。`
          : `父节点 ${parent?.val} 的${branch === 'left' ? '左' : '右'}孩子为空，进入空调用帧。`,
        log: `lowestCommonAncestor(${label}, p = ${pVal}, q = ${qVal})`,
        activeNodeId: cur?.id ?? null,
        secondaryNodeId: pNode?.id ?? qNode?.id,
        nullProbe: !cur && parent ? { parentVal: parent.val, parentId: parent.id, branch, phase: 'entry' } : undefined,
        metrics: {
          '当前数值': cur ? cur.val : 'null',
          '目标 p': pVal,
          '目标 q': qVal,
          '目标区间': `[${minVal}, ${maxVal}]`,
          '分叉节点 (LCA)': '推演中...',
        },
        statusBadge: { text: cur ? `访问节点 ${cur.val}` : '空调用探针', type: 'info' },
        extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
      });
    }

    // 递归推演五段式 ②: 边界判空帧 (显式求值，空命中挂探针严禁画布断电)
    if (!cur) {
      trace.addConditionHit(`① root == null 命中 -> return null`, depth);
      steps.push({
        codeLine: lines.nullCheck,
        decision: `基底判空命中: ${parent?.val ?? '—'} 的${branch === 'left' ? '左' : '右'}子树为空`,
        message: `root == null 判空命中，说明目标不在当前分支，向父调用返回 null。`,
        log: `root is null -> return null`,
        activeNodeId: null,
        secondaryNodeId: pNode?.id ?? qNode?.id,
        nullProbe: parent ? { parentVal: parent.val, parentId: parent.id, branch, phase: 'return' } : undefined,
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
    trace.addConditionPass(`① root = Node(${cur.val}) ≠ null，判空通过`, depth);
    steps.push({
      codeLine: lines.nullCheck,
      decision: `判空通过: root = 节点 ${cur.val} 非空`,
      message: `root == null 不成立，当前节点 ${cur.val} 有效，继续单调性比较。`,
      log: `root = ${cur.val} is not null -> proceed`,
      activeNodeId: cur.id,
      secondaryNodeId: pNode?.id ?? qNode?.id,
      metrics: {
        '当前数值': cur.val,
        '目标 p': pVal,
        '目标 q': qVal,
        '目标区间': `[${minVal}, ${maxVal}]`,
        '分叉节点 (LCA)': '推演中...',
      },
      statusBadge: { text: `判空通过 ${cur.val}`, type: 'info' },
      extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
    });

    // 递归推演五段式 ③: 左单调性比较帧 (Line 3 显式求值)
    const goLeftCond = cur.val > maxVal;
    trace.addConditionPass(
      goLeftCond
        ? `② ${cur.val} > max(${pVal}, ${qVal}) = ${maxVal} 成立 -> 走左分支`
        : `② ${cur.val} > max(${pVal}, ${qVal}) = ${maxVal} 不成立`,
      depth
    );
    steps.push({
      codeLine: lines.leftCompare,
      decision: goLeftCond
        ? `节点 ${cur.val} 同时大于 p(${pVal}) 与 q(${qVal})，左条件成立`
        : `节点 ${cur.val} 不同时大于两目标，左条件不成立`,
      message: `求值 root.val > p.val && root.val > q.val → ${cur.val} > ${pVal} && ${cur.val} > ${qVal} → ${goLeftCond}。`,
      log: `if (${cur.val} > ${pVal} && ${cur.val} > ${qVal}) -> ${goLeftCond}`,
      activeNodeId: cur.id,
      secondaryNodeId: pNode?.id ?? qNode?.id,
      metrics: {
        '当前数值': cur.val,
        '目标 p': pVal,
        '目标 q': qVal,
        '目标比较': `${cur.val} > ${maxVal} ? ${goLeftCond}`,
        '走向': goLeftCond ? '向左递归 ⬅️' : '比较下一条件',
        '分叉节点 (LCA)': '推演中...',
      },
      statusBadge: { text: goLeftCond ? `左条件成立` : `左条件不成立`, type: goLeftCond ? 'warning' : 'info' },
      extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
    });

    if (goLeftCond) {
      // 递归推演五段式 ④: 深入分支调用帧 (Line 4)
      const nextNode: TreeNode036 | undefined = cur.left != null ? nodeMap.get(cur.left) : undefined;
      trace.addConditionPass(`③ 深入左子树 lowestCommonAncestor(${nextNode ? 'Node(' + nextNode.val + ')' : 'null'})`, depth);
      steps.push({
        codeLine: lines.goLeft,
        decision: `深入节点 ${cur.val} 的左子树`,
        message: `执行 return lowestCommonAncestor(root.left, p, q)：两目标均在左子树，进入节点 ${nextNode ? nextNode.val : 'null'}。`,
        log: `return lowestCommonAncestor(left = ${nextNode?.val ?? 'null'})`,
        activeNodeId: cur.id,
        secondaryNodeId: nextNode?.id,
        metrics: {
          '当前数值': cur.val,
          '目标 p': pVal,
          '目标 q': qVal,
          '走向': '⬅️ 深入左子树',
          '分叉节点 (LCA)': '推演中...',
        },
        statusBadge: { text: `深入左子树`, type: 'warning' },
        extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
      });
      const res = recurse(nextNode, depth + 1, cur, 'left');
      // 递归推演五段式 ⑤: 后序归约与返回帧 (子调用返回 -> 接收返回值 -> 恢复父现场 -> 向上传递)
      trace.addReturnLeaf(`子调用返回 ${res ? 'Node(' + res.val + ')' : 'null'} -> 向上一层返回`, depth);
      steps.push({
        codeLine: lines.goLeft,
        decision: `左子调用返回: ${res ? 'Node(' + res.val + ')' : 'null'}`,
        message: `左子调用已返回 ${res ? 'Node(' + res.val + ')' : 'null'}，恢复节点 ${cur.val} 现场，将结果向上一层原样返回。`,
        log: `leftRet = ${res ? res.val : 'null'} -> return`,
        activeNodeId: cur.id,
        secondaryNodeId: res?.id ?? pNode?.id ?? qNode?.id,
        metrics: {
          '当前数值': cur.val,
          '目标 p': pVal,
          '目标 q': qVal,
          '左返回值': res ? `节点 ${res.val}` : 'null',
          '分叉节点 (LCA)': foundLCA != null ? `节点 ${foundLCA}` : '推演中...',
        },
        statusBadge: { text: `返回归约`, type: 'info' },
        extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
      });
      return res;
    }

    // 递归推演五段式 ③': 右单调性比较帧 (Line 6 显式求值，仅左条件失败时)
    const goRightCond = cur.val < minVal;
    trace.addConditionPass(
      goRightCond
        ? `② ${cur.val} < min(${pVal}, ${qVal}) = ${minVal} 成立 -> 走右分支`
        : `② ${cur.val} < min(${pVal}, ${qVal}) = ${minVal} 不成立`,
      depth
    );
    steps.push({
      codeLine: lines.rightCompare,
      decision: goRightCond
        ? `节点 ${cur.val} 同时小于 p(${pVal}) 与 q(${qVal})，右条件成立`
        : `节点 ${cur.val} 不同时小于两目标，右条件不成立`,
      message: `求值 root.val < p.val && root.val < q.val → ${cur.val} < ${pVal} && ${cur.val} < ${qVal} → ${goRightCond}。`,
      log: `if (${cur.val} < ${pVal} && ${cur.val} < ${qVal}) -> ${goRightCond}`,
      activeNodeId: cur.id,
      secondaryNodeId: pNode?.id ?? qNode?.id,
      metrics: {
        '当前数值': cur.val,
        '目标 p': pVal,
        '目标 q': qVal,
        '目标比较': `${cur.val} < ${minVal} ? ${goRightCond}`,
        '走向': goRightCond ? '向右递归 ➡️' : '分叉判定',
        '分叉节点 (LCA)': '推演中...',
      },
      statusBadge: { text: goRightCond ? `右条件成立` : `右条件不成立`, type: goRightCond ? 'warning' : 'info' },
      extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
    });

    if (goRightCond) {
      // 递归推演五段式 ④': 深入右分支调用帧 (Line 7)
      const nextNode: TreeNode036 | undefined = cur.right != null ? nodeMap.get(cur.right) : undefined;
      trace.addConditionPass(`③ 深入右子树 lowestCommonAncestor(${nextNode ? 'Node(' + nextNode.val + ')' : 'null'})`, depth);
      steps.push({
        codeLine: lines.goRight,
        decision: `深入节点 ${cur.val} 的右子树`,
        message: `执行 return lowestCommonAncestor(root.right, p, q)：两目标均在右子树，进入节点 ${nextNode ? nextNode.val : 'null'}。`,
        log: `return lowestCommonAncestor(right = ${nextNode?.val ?? 'null'})`,
        activeNodeId: cur.id,
        secondaryNodeId: nextNode?.id,
        metrics: {
          '当前数值': cur.val,
          '目标 p': pVal,
          '目标 q': qVal,
          '走向': '➡️ 深入右子树',
          '分叉节点 (LCA)': '推演中...',
        },
        statusBadge: { text: `深入右子树`, type: 'warning' },
        extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
      });
      const res = recurse(nextNode, depth + 1, cur, 'right');
      // 递归推演五段式 ⑤': 右子树后序归约与返回帧
      trace.addReturnLeaf(`子调用返回 ${res ? 'Node(' + res.val + ')' : 'null'} -> 向上一层返回`, depth);
      steps.push({
        codeLine: lines.goRight,
        decision: `右子调用返回: ${res ? 'Node(' + res.val + ')' : 'null'}`,
        message: `右子调用已返回 ${res ? 'Node(' + res.val + ')' : 'null'}，恢复节点 ${cur.val} 现场，将结果向上一层原样返回。`,
        log: `rightRet = ${res ? res.val : 'null'} -> return`,
        activeNodeId: cur.id,
        secondaryNodeId: res?.id ?? pNode?.id ?? qNode?.id,
        metrics: {
          '当前数值': cur.val,
          '目标 p': pVal,
          '目标 q': qVal,
          '右返回值': res ? `节点 ${res.val}` : 'null',
          '分叉节点 (LCA)': foundLCA != null ? `节点 ${foundLCA}` : '推演中...',
        },
        statusBadge: { text: `返回归约`, type: 'info' },
        extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
      });
      return res;
    }

    // 分叉命中帧 (Line 9: return root) — 首次分流处即 LCA
    const isDirectMatch = cur.val === pVal || cur.val === qVal;
    foundLCA = cur.val;
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

  recurse(nodes[0], 0);

  // 顶层返回完成帧 (根调用收到结果，算法闭合)
  steps.push({
    codeLine: lines.splitFork,
    decision: `算法完成: 最近公共祖先 = ${foundLCA != null ? `节点 ${foundLCA}` : 'null'}`,
    message: `根调用 lowestCommonAncestor 已返回最终结果${foundLCA != null ? ` Node(${foundLCA})` : ' null'}，全部递归帧闭合。`,
    log: `全部执行完成: LCA = ${foundLCA != null ? `TreeNode(${foundLCA})` : 'null'}`,
    activeNodeId: foundLCA != null ? (valToNode.get(foundLCA)?.id ?? null) : null,
    secondaryNodeId: pNode?.id ?? qNode?.id,
    metrics: {
      '分叉节点 (LCA)': foundLCA != null ? `节点 ${foundLCA}` : 'null',
      '目标 p': pVal,
      '目标 q': qVal,
      '判定性质': '递归闭合',
    },
    statusBadge: { text: `执行完成`, type: 'success' },
    extraData: { treeNodes: nodes, callTrace: trace.snapshot() },
  });
  return attachTreeContext(steps);
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

    // 左单调性比较帧 (Line 3 显式求值——无论真假都必须独立成步，杜绝行号跳变)
    const goLeftCond = cur.val > maxVal;
    steps.push({
      codeLine: lines.leftCompare,
      decision: goLeftCond
        ? `节点 ${cur.val} 同时大于 p(${pVal}) 与 q(${qVal})，左条件成立`
        : `节点 ${cur.val} 不同时大于两目标，左条件不成立`,
      message: `求值 root.val > p.val && root.val > q.val → ${cur.val} > ${pVal} && ${cur.val} > ${qVal} → ${goLeftCond}。`,
      log: `if (${cur.val} > ${pVal} && ${cur.val} > ${qVal}) -> ${goLeftCond}`,
      activeNodeId: cur.id,
      secondaryNodeId: pNode?.id ?? qNode?.id,
      metrics: {
        '当前指针': `节点 ${cur.val}`,
        '目标 p': pVal,
        '目标 q': qVal,
        '目标比较': `${cur.val} > ${maxVal} ? ${goLeftCond}`,
        '走向': goLeftCond ? '⬅️ 左条件成立' : '比较下一条件',
        '分叉节点 (LCA)': '查找中...',
      },
      statusBadge: { text: goLeftCond ? `左条件成立` : `左条件不成立`, type: goLeftCond ? 'warning' : 'info' },
      extraData: { treeNodes: nodes },
    });

    if (goLeftCond) {
      const nextLeftId: number | null | undefined = cur.left;
      const nextNode: TreeNode036 | undefined = nextLeftId != null ? nodeMap.get(nextLeftId) : undefined;
      steps.push({
        codeLine: lines.goLeft,
        decision: `指针移动: root = root.left`,
        message: `两目标均在左子树，指针由节点 ${cur.val} 直接更新为 root.left (节点 ${nextNode ? nextNode.val : 'null'})，无递归栈开销。`,
        log: `root = root.left (${nextNode?.val ?? nextLeftId})`,
        activeNodeId: nextNode?.id ?? null,
        secondaryNodeId: pNode?.id ?? qNode?.id,
        nullProbe: !nextNode ? { parentVal: cur.val, parentId: cur.id, branch: 'left', phase: 'return' } : undefined,
        metrics: {
          '当前指针': `节点 ${nextNode?.val ?? 'null'}`,
          '比较条件': `${cur.val} > ${maxVal}`,
          '下一指针': `节点 ${nextNode?.val ?? 'null'}`,
          '走向': '⬅️ 已移向左子树',
          '分叉节点 (LCA)': '查找中...',
        },
        statusBadge: { text: `左移: ${nextNode?.val ?? nextLeftId}`, type: 'warning' },
        extraData: { treeNodes: nodes },
      });
      cur = nextNode;
      continue;
    }

    // 右单调性比较帧 (Line 5 else-if 显式求值)
    const goRightCond = cur.val < minVal;
    steps.push({
      codeLine: lines.rightCompare,
      decision: goRightCond
        ? `节点 ${cur.val} 同时小于 p(${pVal}) 与 q(${qVal})，右条件成立`
        : `节点 ${cur.val} 不同时小于两目标，右条件不成立`,
      message: `求值 root.val < p.val && root.val < q.val → ${cur.val} < ${pVal} && ${cur.val} < ${qVal} → ${goRightCond}。`,
      log: `else if (${cur.val} < ${pVal} && ${cur.val} < ${qVal}) -> ${goRightCond}`,
      activeNodeId: cur.id,
      secondaryNodeId: pNode?.id ?? qNode?.id,
      metrics: {
        '当前指针': `节点 ${cur.val}`,
        '目标 p': pVal,
        '目标 q': qVal,
        '目标比较': `${cur.val} < ${minVal} ? ${goRightCond}`,
        '走向': goRightCond ? '➡️ 右条件成立' : '分叉判定',
        '分叉节点 (LCA)': '查找中...',
      },
      statusBadge: { text: goRightCond ? `右条件成立` : `右条件不成立`, type: goRightCond ? 'warning' : 'info' },
      extraData: { treeNodes: nodes },
    });

    if (goRightCond) {
      const nextRightId: number | null | undefined = cur.right;
      const nextNode: TreeNode036 | undefined = nextRightId != null ? nodeMap.get(nextRightId) : undefined;
      steps.push({
        codeLine: lines.goRight,
        decision: `指针移动: root = root.right`,
        message: `两目标均在右子树，指针由节点 ${cur.val} 直接更新为 root.right (节点 ${nextNode ? nextNode.val : 'null'})，无递归栈开销。`,
        log: `root = root.right (${nextNode?.val ?? nextRightId})`,
        activeNodeId: nextNode?.id ?? null,
        secondaryNodeId: pNode?.id ?? qNode?.id,
        nullProbe: !nextNode ? { parentVal: cur.val, parentId: cur.id, branch: 'right', phase: 'return' } : undefined,
        metrics: {
          '当前指针': `节点 ${nextNode?.val ?? 'null'}`,
          '比较条件': `${cur.val} < ${minVal}`,
          '下一指针': `节点 ${nextNode?.val ?? 'null'}`,
          '走向': '➡️ 已移向右子树',
          '分叉节点 (LCA)': '查找中...',
        },
        statusBadge: { text: `右移: ${nextNode?.val ?? nextRightId}`, type: 'warning' },
        extraData: { treeNodes: nodes },
      });
      cur = nextNode;
      continue;
    }

    // 分叉命中帧 (Line 8: return root)
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

  return attachTreeContext(steps);
}

// 统一向后兼容函数
export function buildLcaBst037Steps(
  treeRaw?: string,
  pInput?: number | string,
  qInput?: number | string
): Tree036Step[] {
  return buildLcaBstStage1RecursiveSteps(treeRaw, pInput, qInput);
}
