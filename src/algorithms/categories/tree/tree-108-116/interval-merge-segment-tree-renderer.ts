/**
 * Class 113: 区间合并线段树 (Interval Merge Segment Tree)
 * 洛谷 P4513 小白逛公园 / GSS1
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_108_116_PROBLEMS } from './tree-108-116-problem-content';
import { INTERVAL_MERGE_SEGMENT_TREE_CODES, INTERVAL_MERGE_SEGMENT_TREE_LINES } from './tree-108-116-stage-codes';
import { Tree108Step } from './tree-108-116-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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

export function buildIntervalMergeSteps(nums: number[]): IntervalMergeStep[] {
  const steps: IntervalMergeStep[] = [];
  const lines = INTERVAL_MERGE_SEGMENT_TREE_LINES;
  const n = nums.length;
  const nodesMap = new Map<number, IntervalMergeNode>();

  const getSnapshot = () => Array.from(nodesMap.values()).sort((a, b) => a.id - b.id);

  // Step 0: 入口
  steps.push({
    nums: [...nums],
    nodes: [],
    activeNodeId: 1,
    bestMaxSum: 0,
    decision: `主函数入口：接收含正负数序列 nums=[${nums.join(', ')}] (长 ${n})`,
    message: '准备通过维护四元组 (sum, lmax, rmax, maxSum) 构建支持区间合并的高阶线段树',
    log: `enter buildIntervalMerge(n=${n})`,
    codeLine: lines.entry,
    metrics: { '数据规模': n, '当前状态': '准备建树' },
  });

  function build(node: number, l: number, r: number) {
    if (l === r) {
      const v = nums[l - 1] ?? 0;
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
        nums: [...nums],
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
      nums: [...nums],
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
    nums: [...nums],
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

export const intervalMergeVisualizer = registerDeclarativeAlgorithm<IntervalMergeStep>({
  id: 'interval-merge-segment-tree-113',
  name: '区间合并线段树 (Class 113)',
  category: 'tree',
  icon: '🧩',
  difficulty: 3,
  levelOrder: 113,
  learningGoal: '掌握线段树四元组 (sum, lmax, rmax, maxSum) 的合并定理与跨越中点动态拼接技巧',
  problemHtml: TREE_108_116_PROBLEMS.intervalMerge.html,
  analysisHtml: TREE_108_116_PROBLEMS.intervalMerge.html,
  inputs: [
    {
      id: 'nums',
      label: '输入序列 (含正负数，逗号分隔)',
      type: 'text',
      defaultValue: '2,-4,3,-1,2,-3,4,-1',
      placeholder: '如 2,-4,3,-1,2,-3,4,-1',
    },
  ],
  codeLanguages: INTERVAL_MERGE_SEGMENT_TREE_CODES,
  generateSteps: (input) => {
    const nums = String(input.nums || '2,-4,3,-1,2,-3,4,-1').split(',').map(Number).filter(n => !isNaN(n));
    return buildIntervalMergeSteps(nums);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px;">
          🌲 区间合并节点四元组展板 (当前激活: #${step.activeNodeId})
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
          ${step.nodes.map((node) => {
            const isCur = node.id === step.activeNodeId;
            return `
              <div style="background: ${isCur ? '#e0e7ff' : '#ffffff'}; border: 2px solid ${isCur ? '#6366f1' : '#cbd5e1'}; border-radius: 10px; padding: 10px; box-shadow: ${isCur ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'};">
                <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 6px;">
                  <span>#${node.id}</span>
                  <span style="color: #4338ca;">[${node.l}..${node.r}]</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-family: monospace; font-size: 11px;">
                  <div style="background: #f8fafc; padding: 2px 4px; border-radius: 4px;">sum: ${node.sum}</div>
                  <div style="background: #f8fafc; padding: 2px 4px; border-radius: 4px;">lmax: ${node.lmax}</div>
                  <div style="background: #f8fafc; padding: 2px 4px; border-radius: 4px;">rmax: ${node.rmax}</div>
                  <div style="background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 4px; border-radius: 4px;">max: ${node.maxSum}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${renderFormulaCard(
          '区间合并核心公式',
          `maxSum = max(left.maxSum, right.maxSum, left.rmax + right.lmax) | 全局最大连续和: ${step.bestMaxSum}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
