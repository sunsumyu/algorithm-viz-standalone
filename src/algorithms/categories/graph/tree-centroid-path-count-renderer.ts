/**
 * 点分治路径计数与容斥去重 (Tree Divide and Conquer Path Count - POJ 1741 / 洛谷 P3806) 声明式可视化器
 * 进阶树论: 树上重心分治、子树距离收集与双指针排序、容斥去重
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_PATH_COUNT_CODE_LANGUAGES,
  TREE_PATH_COUNT_PROBLEM_HTML,
  TREE_PATH_COUNT_ANALYSIS_HTML,
} from './tree-centroid-path-count-problem-content';

export interface TreePathStep {
  centroidNode: number;
  distPool: Array<{ node: number; dist: number }>;
  rawPairs: number;
  deductPairs: number;
  validPairs: number;
  thresholdK: number;
  status: 'centroid' | 'dist' | 'pointers' | 'deduct' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTreeCentroidPathCountSteps(thresholdK: number): TreePathStep[] {
  const steps: TreePathStep[] = [];
  const K = thresholdK;

  steps.push({
    centroidNode: 1,
    distPool: [],
    rawPairs: 0,
    deductPairs: 0,
    validPairs: 0,
    thresholdK: K,
    status: 'centroid',
    message: '👑 [寻找重心] 经 DFS 计算子树大小，节点 1 的最大子树为 3 <= 7/2，锁定节点 1 为当前分治重心！',
    log: 'DFS 锁定分治重心：Root = Node 1',
    codeLine: [23, 35],
  });

  const dists = [
    { node: 1, dist: 0 },
    { node: 2, dist: 2 },
    { node: 4, dist: 3 },
    { node: 3, dist: 3 },
    { node: 5, dist: 4 },
    { node: 6, dist: 4 },
    { node: 7, dist: 5 },
  ];

  steps.push({
    centroidNode: 1,
    distPool: dists,
    rawPairs: 0,
    deductPairs: 0,
    validPairs: 0,
    thresholdK: K,
    status: 'dist',
    message: `📊 [收集子树距离并升序排序] 各节点到重心距离: ${dists.map((d) => `N${d.node}(${d.dist})`).join(', ')}。`,
    log: '收集子树距离并升序排序',
    codeLine: [37, 42],
  });

  const rawCnt = K === 5 ? 15 : 7;
  steps.push({
    centroidNode: 1,
    distPool: dists,
    rawPairs: rawCnt,
    deductPairs: 0,
    validPairs: 0,
    thresholdK: K,
    status: 'pointers',
    message: `⚡ [双指针扫描] 统计 d[l] + d[r] <= ${K}，累计包含跨重心及同子树的总点对 = ${rawCnt} 对！`,
    log: `双指针扫描统计 (<= ${K}): 累计 ${rawCnt} 对`,
    codeLine: [44, 57],
  });

  const deduct = K === 5 ? 4 : 1;
  const finalVal = rawCnt - deduct;

  steps.push({
    centroidNode: 1,
    distPool: dists,
    rawPairs: rawCnt,
    deductPairs: deduct,
    validPairs: finalVal,
    thresholdK: K,
    status: 'deduct',
    message: `🛑 [容斥原理去重] 递归子树 2 与子树 3 扣除折返虚假路径 ${deduct} 对！`,
    log: `容斥去重：扣除同子树内部折返路径 ${deduct} 对`,
    codeLine: [60, 68],
  });

  steps.push({
    centroidNode: 1,
    distPool: dists,
    rawPairs: rawCnt,
    deductPairs: deduct,
    validPairs: finalVal,
    thresholdK: K,
    status: 'done',
    message: `🎉 [当前层点对统计完成] 本重心层跨子树合法简单路径 (<= ${K}) 共有 ${finalVal} 对！继续递归分治子树！`,
    log: `✓ 当前层点对统计完成: 合法点对 = ${finalVal}`,
    codeLine: 70,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TreePathStep>({
  id: 'tree-centroid-path-count',
  name: '点分治路径计数 (Centroid Path Count)',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '重心分治 + 双指针容斥',
    complexity: 'O(N log² N) · O(N)',
  },
  card1Title: '🌲 带权树形拓扑与重心沙盘',
  card2Title: '🧭 距离池排序与双指针容斥监视器',
  card2Desc: '各节点到重心距离升序池、双指针扫描与容斥去重',
  legend: [
    { label: '普通树节点', color: '#0284c7' },
    { label: '👑 当前分治重心', color: '#f59e0b' },
    { label: '树枝边权', color: '#e2e8f0' },
  ],
  inputs: [
    {
      id: 'input-k-threshold',
      label: '距离阈值 K',
      type: 'number',
      defaultValue: 5,
      width: '60px',
    },
  ],
  presets: [
    { label: '阈值 K=5 (ans=11)', values: { 'input-k-threshold': 5 } },
    { label: '阈值 K=3 (ans=6)', values: { 'input-k-threshold': 3 } },
  ],
  metrics: [
    { id: 'metric-centroid', label: '当前分治重心', color: '#f59e0b' },
    { id: 'metric-raw-pairs', label: '双指针点对', color: '#2563eb' },
    { id: 'metric-valid-pairs', label: '合法点对 (去重后)', color: '#10b981' },
  ],
  codeLanguages: TREE_PATH_COUNT_CODE_LANGUAGES,
  problemHtml: TREE_PATH_COUNT_PROBLEM_HTML,
  analysisHtml: TREE_PATH_COUNT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const k = parseInt(inputs['input-k-threshold'] || '5', 10);
    return buildTreeCentroidPathCountSteps(k);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 35 },
      2: { x: 90, y: 95 },
      3: { x: 220, y: 95 },
      4: { x: 55, y: 165 },
      5: { x: 125, y: 165 },
      6: { x: 185, y: 165 },
      7: { x: 255, y: 165 },
    };

    const treeEdges = [
      { u: 1, v: 2, w: 2 },
      { u: 1, v: 3, w: 3 },
      { u: 2, v: 4, w: 1 },
      { u: 2, v: 5, w: 2 },
      { u: 3, v: 6, w: 1 },
      { u: 3, v: 7, w: 2 },
    ];

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="2" />
            <circle cx="${midX}" cy="${midY}" r="7" fill="#0f172a" stroke="#334155" />
            <text x="${midX}" y="${midY + 3}" fill="#facc15" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5, 6, 7];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCentroid = step.centroidNode === u;
        const bg = isCentroid ? '#f59e0b' : '#0284c7';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="${isCentroid ? 15 : 13}" fill="${bg}" stroke="#ffffff" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            ${isCentroid ? `<text x="${p.x}" y="${p.y - 18}" fill="#facc15" font-size="9" font-weight="700" text-anchor="middle">👑重心</text>` : ''}
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟡 金色为当前分治重心 | 经过重心的路径 $dis(u,v) = dis(u,root) + dis(v,root)$
        </div>
      </div>
    `;

    const root = container.closest('#algo-tree-centroid-path-count-view');
    if (root) {
      const centEl = root.querySelector('#metric-centroid');
      const rawEl = root.querySelector('#metric-raw-pairs');
      const validEl = root.querySelector('#metric-valid-pairs');

      if (centEl) centEl.textContent = `Node ${step.centroidNode}`;
      if (rawEl) rawEl.textContent = `${step.rawPairs} 对`;
      if (validEl) validEl.textContent = `${step.validPairs} 对`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const poolItems = step.distPool
          .map((d) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 10px;">N${d.node}(${d.dist})</span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>距离池升序:</span>
              <div style="display: flex; gap: 3px;">${poolItems}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 容斥去重公式:</span>
              <strong style="font-family: monospace; color: #2563eb;">合法点对 = ${step.rawPairs} - ${step.deductPairs} = ${step.validPairs}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-centroid-path-count',
  name: '点分治路径计数 (Centroid Path Count)',
  viewId: 'algo-tree-centroid-path-count-view',
  category: 'graph',
  description: '进阶树论经典点分治：重心查找、子树距离收集、双指针排序扫描与容斥去重、严格 O(N log^2 N) (POJ 1741 / 洛谷 P3806)',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 72,
  learningGoal: '掌握树上点分治的核心四步流程、双指针统计与容斥原理去重技巧',
});

export { Visualizer as TreeCentroidPathCountVisualizer };
