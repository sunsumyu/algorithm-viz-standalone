/**
 * Class 113: 区间合并线段树 (Interval Merge Segment Tree) 步骤编译器
 * 洛谷 P4513 小白逛公园 / GSS1
 * 深模块核心编译器 (Deep Module)
 */

import { INTERVAL_MERGE_SEGMENT_TREE_CODES, INTERVAL_MERGE_SEGMENT_TREE_LINES } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-stage-codes';
import { Tree108Step } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-shared';

export interface IntervalMergeNode {
  id: number;
  l: number;
  r: number;
  sum: number;
  lmax: number;
  rmax: number;
  maxSum: number;
}

export interface IntervalMergeStep extends Tree108Step {
  nums: number[];
  nodes: IntervalMergeNode[];
  activeNodeId: number;
  bestMaxSum: number;
}

export { INTERVAL_MERGE_SEGMENT_TREE_CODES, INTERVAL_MERGE_SEGMENT_TREE_LINES };

export function buildIntervalMergeSteps(nums: number[]): IntervalMergeStep[] {
  const steps: IntervalMergeStep[] = [];
  const lines = INTERVAL_MERGE_SEGMENT_TREE_LINES;
  const currentNums = [...nums];
  const n = currentNums.length;
  const nodesMap = new Map<number, IntervalMergeNode>();

  const getSnapshot = () => Array.from(nodesMap.values()).sort((a, b) => a.id - b.id);

  // Step 0: 入口
  steps.push({
    nums: [...currentNums],
    nodes: [],
    activeNodeId: 1,
    bestMaxSum: 0,
    decision: `主函数入口：接收含正负数序列 nums=[${currentNums.join(', ')}] (长 ${n})`,
    message: '准备通过维护四元组 (sum, lmax, rmax, maxSum) 构建支持区间合并的高阶线段树',
    log: `enter buildIntervalMerge(n=${n})`,
    codeLine: lines.entry,
    metrics: { '数据规模': n, '当前状态': '准备建树' },
  });

  function build(node: number, l: number, r: number) {
    if (l === r) {
      const v = currentNums[l - 1] ?? 0;
      const leafNode: IntervalMergeNode = {
        id: node,
        l,
        r,
        sum: v,
        lmax: v,
        rmax: v,
        maxSum: v,
      };
      nodesMap.set(node, leafNode);
      steps.push({
        nums: [...currentNums],
        nodes: getSnapshot(),
        activeNodeId: node,
        bestMaxSum: leafNode.maxSum,
        decision: `叶子节点初始化：#${node} [${l}..${l}] 对应数值 ${v}，初始四元组均设为 ${v}`,
        message: `sum=${v}, lmax=${v}, rmax=${v}, maxSum=${v}`,
        log: `leaf node #${node} val=${v}`,
        codeLine: lines.calcSum,
        metrics: { '叶子节点': `#${node}`, '数值': v },
      });
      return;
    }

    const mid = Math.floor((l + r) / 2);
    build(node * 2, l, mid);
    build(node * 2 + 1, mid + 1, r);

    // 四元组合并 pushUp
    const left = nodesMap.get(node * 2)!;
    const right = nodesMap.get(node * 2 + 1)!;
    const sum = left.sum + right.sum;
    const lmax = Math.max(left.lmax, left.sum + right.lmax);
    const rmax = Math.max(right.rmax, right.sum + left.rmax);
    const crossMax = left.rmax + right.lmax;
    const maxSum = Math.max(Math.max(left.maxSum, right.maxSum), crossMax);

    const mergedNode: IntervalMergeNode = {
      id: node,
      l,
      r,
      sum,
      lmax,
      rmax,
      maxSum,
    };
    nodesMap.set(node, mergedNode);

    steps.push({
      nums: [...currentNums],
      nodes: getSnapshot(),
      activeNodeId: node,
      bestMaxSum: maxSum,
      decision: `🧩 四元组区间合并 (PushUp)：节点 #${node} [${l}..${r}] 汇总左右子节点！最大子段和 maxSum = ${maxSum} (跨越中点组合: left.rmax(${left.rmax}) + right.lmax(${right.lmax}) = ${crossMax})`,
      message: `sum=${sum} | lmax=${lmax} | rmax=${rmax} | 全局最大子段=${maxSum}`,
      log: `merge node #${node}: sum=${sum}, lmax=${lmax}, rmax=${rmax}, maxSum=${maxSum}`,
      codeLine: lines.calcMaxSum,
      metrics: { '合并节点': `#${node}`, '跨越合并值': crossMax, '最大连续和': maxSum },
      statusBadge: { text: `maxSum = ${maxSum}`, type: 'success' },
    });
  }

  build(1, 1, n);

  // Step End: 终局
  const root = nodesMap.get(1)!;
  steps.push({
    nums: [...currentNums],
    nodes: getSnapshot(),
    activeNodeId: 1,
    bestMaxSum: root.maxSum,
    decision: `🏆 线段树区间合并建树完成：全序列 [1..${n}] 最大连续子段和为 ${root.maxSum}！`,
    message: '任意区间查询均可通过类似四元组在 O(log N) 内合并求得最优解',
    log: `root maxSum=${root.maxSum}`,
    codeLine: lines.calcMaxSum,
    metrics: { '全序列最大连续子段和': root.maxSum, '全序列总和': root.sum },
    statusBadge: { text: `最大子段和: ${root.maxSum}`, type: 'success' },
  });

  return steps;
}
