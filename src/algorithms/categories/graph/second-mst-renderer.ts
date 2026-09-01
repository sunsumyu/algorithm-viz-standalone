/**
 * 严格次小生成树 (Strict Second-Best MST) 声明式可视化器
 * 进阶图论: Kruskal 求最小生成树、树上倍增维护严格最大边与严格次大边、枚举非树边换边 (洛谷 P4180)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  SECOND_MST_CODE_LANGUAGES,
  SECOND_MST_PROBLEM_HTML,
  SECOND_MST_ANALYSIS_HTML,
} from './second-mst-problem-content';

export interface SecondMstStep {
  mstWeight: number;
  secondMstWeight: number;
  testedNonTreeEdge: { u: number; v: number; w: number } | null;
  replacedMstEdge: { u: number; v: number; w: number } | null;
  status: 'mst' | 'swap' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildSecondMstSteps(): SecondMstStep[] {
  const steps: SecondMstStep[] = [];

  steps.push({
    mstWeight: 6,
    secondMstWeight: Infinity,
    testedNonTreeEdge: null,
    replacedMstEdge: null,
    status: 'mst',
    message: '1. [Kruskal 求出最小生成树] 包含边 (1-2, w:1), (2-3, w:2), (3-4, w:3)，MST 总权值 = 6。',
    log: 'Kruskal 求出最小生成树：MST 权值 = 6',
    codeLine: [15, 22],
  });

  steps.push({
    mstWeight: 6,
    secondMstWeight: 7,
    testedNonTreeEdge: { u: 1, v: 4, w: 4 },
    replacedMstEdge: { u: 3, v: 4, w: 3 },
    status: 'swap',
    message: '2. [非树边换边测试] 尝试加入非树边 (1-4, w:4)，环上最大严格小于 4 的边为 (3-4, w:3)，换边后权值 = 6 - 3 + 4 = 7！',
    log: '非树边 (1, 4, w:4) 替换树边 (3, 4, w:3) -> 严格次小权值 = 7',
    codeLine: [26, 35],
  });

  steps.push({
    mstWeight: 6,
    secondMstWeight: 7,
    testedNonTreeEdge: { u: 1, v: 4, w: 4 },
    replacedMstEdge: { u: 3, v: 4, w: 3 },
    status: 'done',
    message: '🎉 [严格次小生成树确定] 遍历所有非树边，严格次小生成树总权值 = 7！',
    log: '✓ 严格次小生成树验证完成：权重 = 7',
    codeLine: [38, 42],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<SecondMstStep>({
  id: 'second-mst',
  name: '严格次小生成树 (Second-Best MST)',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '倍增维护最大/次大边',
    complexity: 'O(M log M + M log N) · O(N log N + M)',
  },
  card1Title: '🌲 最小生成树与非树边换边沙盘',
  card2Title: '🧭 严格次小生成树权值监视器',
  card2Desc: 'MST 权值、非树边权值、环上严格最大边与严格次小换边增量',
  legend: [
    { label: 'MST 树边', color: '#10b981' },
    { label: '⚡ 非树边 (尝试加入)', color: '#f59e0b' },
    { label: '🔴 被替换剔除的树边', color: '#ef4444' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典换边图 (P4180)', values: {} },
  ],
  metrics: [
    { id: 'metric-mst-w', label: '最小生成树权值', color: '#10b981' },
    { id: 'metric-second-mst-w', label: '严格次小权值', color: '#2563eb' },
  ],
  codeLanguages: SECOND_MST_CODE_LANGUAGES,
  problemHtml: SECOND_MST_PROBLEM_HTML,
  analysisHtml: SECOND_MST_ANALYSIS_HTML,
  buildSteps: () => buildSecondMstSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 55 },
      2: { x: 235, y: 55 },
      3: { x: 235, y: 165 },
      4: { x: 75, y: 165 },
    };

    const edges = [
      { u: 1, v: 2, w: 1, isMst: true },
      { u: 2, v: 3, w: 2, isMst: true },
      { u: 3, v: 4, w: 3, isMst: true },
      { u: 1, v: 4, w: 4, isMst: false },
    ];

    const isReplaced = (u: number, v: number) => step.replacedMstEdge && ((step.replacedMstEdge.u === u && step.replacedMstEdge.v === v) || (step.replacedMstEdge.u === v && step.replacedMstEdge.v === u));
    const isAdded = (u: number, v: number) => step.testedNonTreeEdge && ((step.testedNonTreeEdge.u === u && step.testedNonTreeEdge.v === v) || (step.testedNonTreeEdge.u === v && step.testedNonTreeEdge.v === u));

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const rep = isReplaced(e.u, e.v);
        const add = isAdded(e.u, e.v);
        const color = rep ? '#ef4444' : add ? '#f59e0b' : e.isMst ? '#10b981' : '#475569';
        const width = rep || add ? 3 : 2;
        const dash = add ? 'stroke-dasharray="4,4"' : '';
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${dash} />
            <text x="${midX}" y="${midY}" fill="${color}" font-size="9" font-weight="700" font-family="monospace" text-anchor="middle">w:${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟡 金色虚线为加入的非树边 | 🔴 红色为环上被替换的严格最大边 | 确保次小值严格大于 MST
        </div>
      </div>
    `;

    const root = container.closest('#algo-second-mst-view');
    if (root) {
      const mstEl = root.querySelector('#metric-mst-w');
      const secEl = root.querySelector('#metric-second-mst-w');

      if (mstEl) mstEl.textContent = `${step.mstWeight}`;
      if (secEl) secEl.textContent = step.secondMstWeight === Infinity ? '计算中...' : `${step.secondMstWeight}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 严格次小换边定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">SecondMST = min(MST - max_strict_edge + w(e_non_tree))</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'second-mst',
  name: '严格次小生成树 (Second-Best MST)',
  viewId: 'algo-second-mst-view',
  category: 'graph',
  description: '进阶图论换边优化：Kruskal 求最小生成树、倍增维护环上严格最大与严格次大边、枚举非树边换边 (洛谷 P4180)',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 52,
  learningGoal: '掌握严格次小生成树的倍增数据结构设计、严格严格次大边分类讨论及换边正确性证明',
});

export { Visualizer as SecondMstVisualizer };
