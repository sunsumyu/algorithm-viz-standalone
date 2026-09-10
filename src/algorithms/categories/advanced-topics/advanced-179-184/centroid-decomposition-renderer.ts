/**
 * Class 179: 树上点分治 (Centroid Decomposition)
 * 重心分治 + 子树容斥 + 路径计数 / 洛谷 P3806 【模板】点分治1
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { CENTROID_DECOMPOSITION_CODES, CENTROID_DECOMPOSITION_LINES } from './advanced-179-184-stage-codes';
import { Advanced179Step, renderCentroidBoard } from './advanced-179-184-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface CentroidStep extends Advanced179Step {
  nodes: number[];
  centroid: number;
  visitedCentroids: number[];
  validPaths: { u: number; v: number; dist: number }[];
  stage: string;
}

export function buildCentroidSteps(): CentroidStep[] {
  const steps: CentroidStep[] = [];
  const lines = CENTROID_DECOMPOSITION_LINES;

  const nodes = [1, 2, 3, 4, 5];

  // Step 0: 入口帧
  steps.push({
    nodes,
    centroid: -1,
    visitedCentroids: [],
    validPaths: [],
    stage: '分治开始：初始化连通块',
    decision: `主函数入口：开始对包含 5 个节点的无根树进行点分治，统计路径长度满足 target=3 的点对`,
    message: `树上点分治核心思想：选取重心作为根节点，使最大子树大小不超过总大小的 1/2，保证递归层数至多 O(log N)`,
    log: `enter centroid decomposition: n=5, target=3`,
    codeLine: lines.entry,
    metrics: { '节点总数': 5, '目标距离': 3, '分治深度': 0 },
  });

  // Step 1: 树形 DP 计算重心 (Root Centroid = 2)
  steps.push({
    nodes,
    centroid: 2,
    visitedCentroids: [],
    validPaths: [],
    stage: '第一层分治：寻找整树重心',
    decision: `树形 DP 遍历整树计算各子树 sz：最大子树最小值在节点 2 处取得 (maxSub[2]=2 <= 5/2)`,
    message: `成功锁定全局重心为节点 2，以节点 2 作为当前递归分治的根节点`,
    log: `getCentroid: found root centroid = 2, maxSub=2`,
    codeLine: lines.treeDP,
    statusBadge: { text: '锁定重心: 节点 2', type: 'info' },
    metrics: { '当前重心': 2, '最大子树大小': 2, '分治深度': 1 },
  });

  // Step 2: 统计经过重心 2 的跨子树路径
  const paths1 = [
    { u: 1, v: 3, dist: 3 },
    { u: 4, v: 5, dist: 3 },
  ];
  steps.push({
    nodes,
    centroid: 2,
    visitedCentroids: [2],
    validPaths: paths1,
    stage: '统计经过重心 2 的点对路径',
    decision: `以重心 2 展开 BFS/DFS 获取各子节点到重心的距离数组，双指针统计跨子树路径`,
    message: `成功发现 2 条跨越重心 2 且长度为 3 的合法路径：(1-2-3 距离 3) 与 (4-2-5 距离 3)`,
    log: `calcPaths: centroid 2 found 2 valid paths`,
    codeLine: lines.calcPaths,
    statusBadge: { text: '发现 2 条合法路径', type: 'success' },
    metrics: { '当前重心': 2, '统计合法路径': 2, '已分治重心': 1 },
  });

  // Step 3: 在剩余连通块中寻找子重心 (左子块节点 1)
  steps.push({
    nodes,
    centroid: 1,
    visitedCentroids: [2, 1],
    validPaths: paths1,
    stage: '第二层分治：左子块重心求解',
    decision: `封闭重心 2，递归进入左子树连通块 {1}，连通块大小为 1，重心即为节点 1`,
    message: `由于单点无法形成长度为 3 的有效边，左子树递归直接返回`,
    log: `getCentroid: sub-block centroid = 1, sz=1`,
    codeLine: lines.findCentroid,
    statusBadge: { text: '单点子块，直接返回', type: 'info' },
    metrics: { '当前重心': 1, '子块大小': 1, '分治深度': 2 },
  });

  // Step 4: 在右子块连通块 {3, 4, 5} 中寻找子重心
  const paths2 = [
    ...paths1,
    { u: 3, v: 5, dist: 3 },
  ];
  steps.push({
    nodes,
    centroid: 4,
    visitedCentroids: [2, 1, 4],
    validPaths: paths2,
    stage: '第二层分治：右子块重心求解与统计',
    decision: `递归进入右子树连通块 {3, 4, 5}，通过树形 DP 确定子连通块重心为节点 4`,
    message: `在以 4 为重心的子块内统计路径，成功发现新路径 (3-4-5 距离 3)`,
    log: `calcPaths: centroid 4 found path (3-5), total=3`,
    codeLine: lines.calcPaths,
    statusBadge: { text: '右子块发现 1 条路径', type: 'success' },
    metrics: { '当前重心': 4, '子块大小': 3, '已分治重心': 3 },
  });

  // Step 5: 分治结束，返回答案
  steps.push({
    nodes,
    centroid: -1,
    visitedCentroids: [1, 2, 3, 4, 5],
    validPaths: paths2,
    stage: '树上点分治求解完毕',
    decision: `🎉 树上点分治全流程结束：共统计出 3 条长度为 target=3 的树上合法路径`,
    message: `点分治通过重心选择确保递归深度 O(log N)，总时间复杂度稳定在 O(N log N)，是树上静态路径统计利器`,
    log: `centroid decomposition finished: totalPaths=3`,
    codeLine: lines.returnAns,
    statusBadge: { text: '分治完成: 3 条路径', type: 'success' },
    metrics: { '最终路径数': 3, '总分治层数': 2, '状态': '求解完成' },
  });

  return steps;
}

export const centroidDecompositionVisualizer = registerDeclarativeAlgorithm<CentroidStep>({
  id: 'centroid-decomposition-179',
  name: '点分治 (Centroid Decomposition / Class 179)',
  category: 'tree',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 179,
  description: '左程云算法通关课 Class 179：树上点分治 (Centroid Decomposition)。通过重心分割递归树，保证 O(log N) 递归深度，优雅统计树上所有合法路径。',
  learningGoal: '掌握树上点分治重心求解、子树路径统计、容斥去重与全局递归分治',
  problemHtml: ADVANCED_179_184_PROBLEMS.centroidDecomposition.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.centroidDecomposition.html,
  inputs: [
    {
      id: 'preset',
      label: '树拓扑与目标距离',
      type: 'select',
      defaultValue: 'tree_5node_target3',
      options: [
        { label: '5 节点树，目标距离 K=3 (求得 3 条路径)', value: 'tree_5node_target3' },
      ],
    },
  ],
  codeLanguages: CENTROID_DECOMPOSITION_CODES,
  generateSteps: () => buildCentroidSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderCentroidBoard(
          step.nodes,
          step.centroid,
          step.visitedCentroids,
          step.validPaths,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #0284c7;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">递归深度保障</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">重心子树 <= N/2, 深度 <= log N</div>
          </div>
        </div>

        ${renderFormulaCard(
          '点分治复杂度保证',
          '递归深度: O(log N) | 每层统计: O(N) | 总时间复杂度: O(N log N)',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
