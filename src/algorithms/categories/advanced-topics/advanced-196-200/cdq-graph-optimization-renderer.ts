/**
 * Class 198: CDQ 分治优化建图 (CDQ Divide and Conquer Graph Optimization)
 * 多维偏序动态连边 / CF 1198F
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_196_200_PROBLEMS } from './advanced-196-200-problem-content';
import { CDQ_GRAPH_CODES, CDQ_GRAPH_LINES } from './advanced-196-200-stage-codes';
import { Advanced196Step, renderCDQGraphBoard } from './advanced-196-200-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface CDQGraphStep extends Advanced196Step {
  l: number;
  r: number;
  mid: number;
  leftElements: { id: number; a: number; b: number }[];
  rightElements: { id: number; a: number; b: number }[];
  prefixNodes: string[];
  activeConnections: { from: number; to: string }[];
  stats: { totalEdges: number; bruteForceEdges: number };
}

export function buildCDQGraphSteps(): CDQGraphStep[] {
  const steps: CDQGraphStep[] = [];
  const lines = CDQ_GRAPH_LINES;

  const allElements = [
    { id: 1, a: 1, b: 2 },
    { id: 2, a: 2, b: 5 },
    { id: 3, a: 3, b: 3 },
    { id: 4, a: 4, b: 6 },
  ];

  // Step 0: 入口帧
  steps.push({
    l: 1,
    r: 4,
    mid: 2,
    leftElements: [allElements[0], allElements[1]],
    rightElements: [allElements[2], allElements[3]],
    prefixNodes: [],
    activeConnections: [],
    stats: { totalEdges: 0, bruteForceEdges: 0 },
    decision: `主函数入口：开始对 4 个元素执行 CDQ 分治优化建图 (偏序连边条件: a_i <= a_j 且 b_i <= b_j)`,
    message: `第 1 维 a 已全局有序，分治天然保证了左半区任意点的 a 严格不超过右半区`,
    log: `enter cdqBuildGraph: l=1, r=4`,
    codeLine: lines.entry,
    metrics: { '区间长度': 4, '偏序维度': 2 },
  });

  // Step 1: 划分中点
  steps.push({
    l: 1,
    r: 4,
    mid: 2,
    leftElements: [allElements[0], allElements[1]],
    rightElements: [allElements[2], allElements[3]],
    prefixNodes: [],
    activeConnections: [],
    stats: { totalEdges: 0, bruteForceEdges: 0 },
    decision: `划分中点 mid=2：左半区 [1..2]，右半区 [3..4]`,
    message: `递归处理左区间与右区间的内部边后，开始着重建立跨区有向边 (从左向右)`,
    log: `split interval [1..4] at mid=2`,
    codeLine: lines.splitMid,
    statusBadge: { text: '区间切分', type: 'info' },
    metrics: { '左区规模': 2, '右区规模': 2 },
  });

  // Step 2: 递归子区间
  steps.push({
    l: 1,
    r: 4,
    mid: 2,
    leftElements: [allElements[0], allElements[1]],
    rightElements: [allElements[2], allElements[3]],
    prefixNodes: [],
    activeConnections: [{ from: 1, to: 'P2' }],
    stats: { totalEdges: 1, bruteForceEdges: 1 },
    decision: `左右子区间递归建边完成：左半区内部 P1 连向 P2 (a: 1<=2, b: 2<=5)`,
    message: `准备进行跨区间合并处理：对两半区按第 2 维 b 坐标排序`,
    log: `recursive steps completed for [1..2] and [3..4]`,
    codeLine: lines.recurseRight,
    statusBadge: { text: '子区间完成', type: 'info' },
    metrics: { '内部已建边': 1, '当前处理': '跨区合并' },
  });

  // Step 3: 右半区构建前缀虚点链
  const prefixNodes = ['Pref_1(P3, b=3)', 'Pref_2(P4, b=6)'];
  steps.push({
    l: 1,
    r: 4,
    mid: 2,
    leftElements: [allElements[0], allElements[1]],
    rightElements: [allElements[2], allElements[3]],
    prefixNodes,
    activeConnections: [{ from: 1, to: 'P2' }],
    stats: { totalEdges: 3, bruteForceEdges: 1 },
    decision: `右半区按 b 值排序并建立前缀虚点链：Pref_1 连向 Pref_2，且 Pref 虚点连向对应的右区实体点`,
    message: `前缀链的作用是将点对区间的 $O(K)$ 连边优化为向链首/链尾的 $O(1)$ 连边`,
    log: `prefix nodes built for right half: 2 aux nodes connected`,
    codeLine: lines.connectCross,
    statusBadge: { text: '前缀虚点链就绪', type: 'warning' },
    metrics: { '虚点数': 2, '链式传递边': 2 },
  });

  // Step 4: 跨区间双指针连边
  steps.push({
    l: 1,
    r: 4,
    mid: 2,
    leftElements: [allElements[0], allElements[1]],
    rightElements: [allElements[2], allElements[3]],
    prefixNodes,
    activeConnections: [
      { from: 1, to: 'Pref_1' },
      { from: 2, to: 'Pref_2' },
    ],
    stats: { totalEdges: 5, bruteForceEdges: 5 },
    decision: `双指针跨区间连边：P1(b=2) 连向 Pref_1，P2(b=5) 连向 Pref_2`,
    message: `P1 通过 Pref_1 自动连通了 P3 和 P4！仅用 2 条跨区边代替了暴力 3 条边，随着数据规模增大优势指数级倍增`,
    log: `cdq cross edges built: P1 -> Pref_1, P2 -> Pref_2`,
    codeLine: lines.connectCross,
    statusBadge: { text: '跨区优化建边完成', type: 'success' },
    metrics: { '优化建边总数': 5, '暴力若建边': 6 },
  });

  return steps;
}

export const cdqGraphOptimizationVisualizer = registerDeclarativeAlgorithm<CDQGraphStep>({
  id: 'cdq-graph-optimization-198',
  name: 'CDQ 分治优化建图 (Class 198)',
  category: 'graph',
  difficulty: 'hard',
  problemContent: ADVANCED_196_200_PROBLEMS.cdqGraphOptimization,
  sourceCodes: CDQ_GRAPH_CODES,
  generateSteps: buildCDQGraphSteps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderCDQGraphBoard(
          step.l,
          step.r,
          step.mid,
          step.leftElements,
          step.rightElements,
          step.prefixNodes,
          step.activeConnections,
          step.stats
        )}
        ${renderFormulaCard(
          'CDQ 分治优化建图时空定理',
          'T(N) = 2T(N/2) + O(N) = O(N \\log N), \\quad \\text{总边数 } E = O(N \\log N)',
          '利用分治在时间/第一维上的天然偏序，将跨区间多维建边转化为序列前缀建边，不仅不需要昂贵的动态树结构，更具有优秀的常数与缓存命中率。'
        )}
      </div>
    `;
  },
});
