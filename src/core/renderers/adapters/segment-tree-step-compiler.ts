/**
 * Class 110: 经典线段树与懒惰标记 (Segment Tree with Lazy Tag) 步骤编译器
 * 洛谷 P3372 【模板】线段树 1
 * 深模块核心编译器 (Deep Module)
 */

import { SEGMENT_TREE_CODES, SEGMENT_TREE_LINES } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-stage-codes';
import { Tree108Step } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-shared';

export interface SegTreeNode {
  id: number;
  l: number;
  r: number;
  val: number;
  lazy: number;
}

export interface SegmentTreeStep extends Tree108Step {
  nodes: SegTreeNode[];
  activeNodeId: number;
  queryL: number;
  queryR: number;
  addVal: number;
}

export { SEGMENT_TREE_CODES, SEGMENT_TREE_LINES };

export function buildSegmentTreeSteps(
  nums: number[],
  ql: number,
  qr: number,
  val: number
): SegmentTreeStep[] {
  const steps: SegmentTreeStep[] = [];
  const lines = SEGMENT_TREE_LINES;
  const n = nums.length;

  // 初始化线段树静态节点
  const nodesMap = new Map<number, SegTreeNode>();

  function buildTree(node: number, l: number, r: number) {
    if (l === r) {
      nodesMap.set(node, { id: node, l, r, val: nums[l - 1] ?? 0, lazy: 0 });
      return;
    }
    const mid = Math.floor((l + r) / 2);
    buildTree(node * 2, l, mid);
    buildTree(node * 2 + 1, mid + 1, r);
    const sum = (nodesMap.get(node * 2)?.val ?? 0) + (nodesMap.get(node * 2 + 1)?.val ?? 0);
    nodesMap.set(node, { id: node, l, r, val: sum, lazy: 0 });
  }

  buildTree(1, 1, n);

  const getSnapshot = () => Array.from(nodesMap.values()).sort((a, b) => a.id - b.id);

  // Step 0: 入口
  steps.push({
    nodes: getSnapshot(),
    activeNodeId: 1,
    queryL: ql,
    queryR: qr,
    addVal: val,
    decision: `主函数入口：目标对区间 [${ql}..${qr}] 每个元素统一增加 +${val}`,
    message: '准备通过懒惰标记 (Lazy Tag) 在 O(log N) 时间内完成区间更新',
    log: `enter updateRange(ql=${ql}, qr=${qr}, val=${val})`,
    codeLine: lines.entry,
    metrics: { '目标区间': `[${ql}..${qr}]`, '增量 val': `+${val}` },
  });

  function pushDown(node: number, l: number, r: number) {
    const cur = nodesMap.get(node);
    if (!cur || cur.lazy === 0) return;
    const mid = Math.floor((l + r) / 2);
    const left = nodesMap.get(node * 2);
    const right = nodesMap.get(node * 2 + 1);
    if (left) {
      left.lazy += cur.lazy;
      left.val += cur.lazy * (mid - l + 1);
    }
    if (right) {
      right.lazy += cur.lazy;
      right.val += cur.lazy * (r - mid);
    }
    cur.lazy = 0;
  }

  function updateRange(node: number, l: number, r: number) {
    const cur = nodesMap.get(node);
    if (!cur) return;

    if (ql <= l && r <= qr) {
      cur.val += (r - l + 1) * val;
      cur.lazy += val;

      steps.push({
        nodes: getSnapshot(),
        activeNodeId: node,
        queryL: ql,
        queryR: qr,
        addVal: val,
        decision: `🎯 命中完全包含区间：节点 #${node} 区间 [${l}..${r}] 完全被目标 [${ql}..${qr}] 包含！打上懒标记 lazy += ${val}，节点和更新为 ${cur.val}`,
        message: '直接截断递归返回，无需深入叶子节点，保持 O(log N) 高效性',
        log: `hit node #${node} [${l}..${r}], add lazy ${val}`,
        codeLine: lines.hitRange,
        metrics: { '当前节点': `#${node}`, '新节点和': cur.val, '懒标记': `+${cur.lazy}` },
        statusBadge: { text: `命中 #${node} (+${val})`, type: 'success' },
      });
      return;
    }

    // 下传懒标记
    if (cur.lazy !== 0) {
      pushDown(node, l, r);
      steps.push({
        nodes: getSnapshot(),
        activeNodeId: node,
        queryL: ql,
        queryR: qr,
        addVal: val,
        decision: `⬇️ 下传懒标记 (PushDown)：节点 #${node} 向子节点下传旧懒标记`,
        message: '确保子树区间的数值正确性',
        log: `pushDown at node #${node}`,
        codeLine: lines.pushDown,
        metrics: { '当前节点': `#${node}`, '操作': '下传标记' },
        statusBadge: { text: '下传 Lazy', type: 'info' },
      });
    }

    const mid = Math.floor((l + r) / 2);
    if (ql <= mid) {
      steps.push({
        nodes: getSnapshot(),
        activeNodeId: node * 2,
        queryL: ql,
        queryR: qr,
        addVal: val,
        decision: `分支下探：目标区间 [${ql}..${qr}] 与左子树 [${l}..${mid}] 有交集，进入左子节点 #${node * 2}`,
        message: '分治递归更新左半部分',
        log: `recurse left to #${node * 2}`,
        codeLine: lines.splitLeft,
        metrics: { '进入节点': `#${node * 2}`, '左区间': `[${l}..${mid}]` },
      });
      updateRange(node * 2, l, mid);
    }

    if (qr > mid) {
      steps.push({
        nodes: getSnapshot(),
        activeNodeId: node * 2 + 1,
        queryL: ql,
        queryR: qr,
        addVal: val,
        decision: `分支下探：目标区间 [${ql}..${qr}] 与右子树 [${mid + 1}..${r}] 有交集，进入右子节点 #${node * 2 + 1}`,
        message: '分治递归更新右半部分',
        log: `recurse right to #${node * 2 + 1}`,
        codeLine: lines.splitRight,
        metrics: { '进入节点': `#${node * 2 + 1}`, '右区间': `[${mid + 1}..${r}]` },
      });
      updateRange(node * 2 + 1, mid + 1, r);
    }

    // 向上合并
    const leftVal = nodesMap.get(node * 2)?.val ?? 0;
    const rightVal = nodesMap.get(node * 2 + 1)?.val ?? 0;
    cur.val = leftVal + rightVal;

    steps.push({
      nodes: getSnapshot(),
      activeNodeId: node,
      queryL: ql,
      queryR: qr,
      addVal: val,
      decision: `⬆️ 向上合并 (PushUp)：节点 #${node} 汇总左右子节点和 = ${leftVal} + ${rightVal} = ${cur.val}`,
      message: '树结构数据一致性同步完成',
      log: `pushUp node #${node}, sum=${cur.val}`,
      codeLine: lines.pushUp,
      metrics: { '汇总节点': `#${node}`, '新节点和': cur.val },
    });
  }

  updateRange(1, 1, n);

  // Step End: 终局
  steps.push({
    nodes: getSnapshot(),
    activeNodeId: 1,
    queryL: ql,
    queryR: qr,
    addVal: val,
    decision: `🏆 区间修改完成：区间 [${ql}..${qr}] 的所有元素已成功累加 +${val}，根节点全树总和为 ${nodesMap.get(1)?.val}`,
    message: '全流程严格在 O(log N) 时间内完成',
    log: `updateRange finished, rootSum=${nodesMap.get(1)?.val}`,
    codeLine: lines.pushUp,
    metrics: { '全树总和': nodesMap.get(1)?.val ?? 0, '状态': '完成' },
    statusBadge: { text: '更新完成', type: 'success' },
  });

  return steps;
}
