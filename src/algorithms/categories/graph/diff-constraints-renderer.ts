/**
 * 差分约束系统 (System of Difference Constraints) 声明式可视化器
 * 核心：不等式 x_v - x_u <= c 转化为有向带权边 u ➔ v (w=c)、超级源点连 0 权边、SPFA 负环判定 (洛谷 P5960)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DIFF_CONSTRAINTS_CODE_LANGUAGES,
  DIFF_CONSTRAINTS_PROBLEM_HTML,
  DIFF_CONSTRAINTS_ANALYSIS_HTML,
} from './diff-constraints-problem-content';

export interface DiffConstraintStep {
  distMap: Record<number, number>;
  curU: number;
  curV: number;
  hasNegativeCycle: boolean;
  status: 'init_super' | 'relax' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildDiffConstraintsSteps(): DiffConstraintStep[] {
  const steps: DiffConstraintStep[] = [];

  steps.push({
    distMap: { 0: 0, 1: 0, 2: 0, 3: 0 },
    curU: 0,
    curV: 1,
    hasNegativeCycle: false,
    status: 'init_super',
    message: '1. [超级源点初始化] 建立超级源点 0，向 1, 2, 3 分别连接权值为 0 的有向边，dist[0..3] = 0！',
    log: '建立超级源点 0：向所有变量连 0 权有向边',
    codeLine: [15, 22],
  });

  steps.push({
    distMap: { 0: 0, 1: 0, 2: 3, 3: 1 },
    curU: 1,
    curV: 2,
    hasNegativeCycle: false,
    status: 'relax',
    message: '2. [SPFA 最短路松弛] 由不等式 x2 - x1 <= 3 建边 1 ➔ 2 (w:3)；由 x3 - x1 <= 1 建边 1 ➔ 3 (w:1)！',
    log: 'SPFA 边松弛：dist[2]=min(0, 0+3)=3, dist[3]=1',
    codeLine: [24, 34],
  });

  steps.push({
    distMap: { 0: 0, 1: 0, 2: 3, 3: 1 },
    curU: 0,
    curV: 0,
    hasNegativeCycle: false,
    status: 'done',
    message: '🎉 [差分约束解求出] 无负环，求得最大可行解：x1 = 0, x2 = 3, x3 = 1！全部不等式严格成立！',
    log: '✓ 差分约束求解完成：解向量为 (x1=0, x2=3, x3=1)',
    codeLine: [36, 42],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<DiffConstraintStep>({
  id: 'diff-constraints',
  name: '差分约束系统 (Diff Constraints)',
  category: 'graph',
  icon: '⛓️',
  badge: {
    mode: '不等式转最短路/负环判定',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '⛓️ 不等式约束有向图与 SPFA 松弛沙盘',
  card2Title: '🧭 变量取值 dist[x] 与负环监视器',
  card2Desc: '超级源点 0、三角不等式 dist[v] <= dist[u] + w 与负环判无解',
  legend: [
    { label: '⭐ 超级源点 (Node 0)', color: '#f59e0b' },
    { label: '变量节点 (x1..x3)', color: '#0284c7' },
    { label: '🟢 约束有向边', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '3 变量经典差分约束组 (P5960)', values: {} },
  ],
  metrics: [
    { id: 'metric-diff-cycle', label: '负环判定', color: '#10b981' },
    { id: 'metric-diff-sol', label: '一组可行解', color: '#2563eb' },
  ],
  codeLanguages: DIFF_CONSTRAINTS_CODE_LANGUAGES,
  problemHtml: DIFF_CONSTRAINTS_PROBLEM_HTML,
  analysisHtml: DIFF_CONSTRAINTS_ANALYSIS_HTML,
  buildSteps: () => buildDiffConstraintsSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      0: { x: 50, y: 110 },
      1: { x: 130, y: 55 },
      2: { x: 230, y: 55 },
      3: { x: 180, y: 165 },
    };

    const edges = [
      { u: 0, v: 1, w: 0 },
      { u: 0, v: 2, w: 0 },
      { u: 0, v: 3, w: 0 },
      { u: 1, v: 2, w: 3 },
      { u: 1, v: 3, w: 1 },
      { u: 3, v: 2, w: 2 },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-diff)" />
            <text x="${midX}" y="${midY}" fill="#94a3b8" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">w:${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [0, 1, 2, 3];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isSuper = u === 0;
        const dist = step.distMap[u];
        const bg = isSuper ? '#b45309' : '#0369a1';
        const border = isSuper ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${isSuper ? 'S0' : `x${u}`}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">d:${dist}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          <defs>
            <marker id="arrow-diff" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          ⛓️ $x_v - x_u \le c$ 转换为有向边 $u \to v$ (权值 $c$) | SPFA 最短路等价于最大可行解
        </div>
      </div>
    `;

    const root = container.closest('#algo-diff-constraints-view');
    if (root) {
      const cEl = root.querySelector('#metric-diff-cycle');
      const sEl = root.querySelector('#metric-diff-sol');

      if (cEl) cEl.textContent = step.hasNegativeCycle ? '❌ 存在负环 (无解)' : '✓ 无负环 (有解)';
      if (sEl) sEl.textContent = `x1=${step.distMap[1]}, x2=${step.distMap[2]}, x3=${step.distMap[3]}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 差分约束等价性:</span>
              <strong style="font-family: monospace; color: #2563eb;">三角不等式 dist[v] <= dist[u] + w(u, v) 与 x_v - x_u <= c 形式完全一致</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'diff-constraints',
  name: '差分约束系统 (Diff Constraints)',
  viewId: 'algo-diff-constraints-view',
  category: 'graph',
  description: '线性规划向图论转化：不等式组建有向带权图、超级源点连通全图、SPFA 最短路求解与负环判无解 (洛谷 P5960)',
  icon: '⛓️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 33,
  learningGoal: '掌握不等式组转化为最短路/最长路的建图原则、超级源点的引入意义以及负环无解证明',
});

export { Visualizer as DiffConstraintsVisualizer };
