/**
 * 三元环与四元环定向计数 (3-Cycle & 4-Cycle Counting) 声明式可视化器
 * 进阶图论: 按度数度大到小定向成 DAG、三元环 O(m*sqrt(m))、四元环 O(m*sqrt(m)) 极速计数 (洛谷 P1989)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CYCLE_COUNTING_CODE_LANGUAGES,
  CYCLE_COUNTING_PROBLEM_HTML,
  CYCLE_COUNTING_ANALYSIS_HTML,
} from './cycle-counting-problem-content';

export interface CycleStep {
  curU: number;
  curV: number;
  curW: number;
  trianglesFound: Array<[number, number, number]>;
  total3Cycles: number;
  total4Cycles: number;
  status: 'orient' | 'search3' | 'search4' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildCycleCountingSteps(): CycleStep[] {
  const steps: CycleStep[] = [];

  steps.push({
    curU: 1,
    curV: 2,
    curW: 3,
    trianglesFound: [],
    total3Cycles: 0,
    total4Cycles: 0,
    status: 'orient',
    message: '1. [度数比较与 DAG 定向] 按度数 deg(u) < deg(v) (或编号较小) 对无向边单向定向，消灭重边与环！',
    log: '图定向为 DAG：边全部单向流转',
    codeLine: [12, 18],
  });

  steps.push({
    curU: 1,
    curV: 2,
    curW: 3,
    trianglesFound: [[1, 2, 3]],
    total3Cycles: 1,
    total4Cycles: 0,
    status: 'search3',
    message: '2. [发现三元环 (1, 2, 3)] 节点 1 遍历出邻居 2，再遍历 2 的出邻居 3，发现 1 与 3 相连！累计 1 个三元环！',
    log: '三元环计数 +1: 发现三角形 (1, 2, 3)',
    codeLine: [22, 30],
  });

  steps.push({
    curU: 1,
    curV: 2,
    curW: 4,
    trianglesFound: [
      [1, 2, 3],
      [1, 2, 4],
    ],
    total3Cycles: 2,
    total4Cycles: 1,
    status: 'done',
    message: '🎉 [环计数完成] 累计三元环 = 2 个，四元环 (3-1-4-2) = 1 个！严格 O(M √M) 复杂度！',
    log: '✓ 环计数完成：三元环 = 2, 四元环 = 1',
    codeLine: [32, 40],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<CycleStep>({
  id: 'cycle-counting',
  name: '三元环与四元环计数 (Cycle Counting)',
  category: 'graph',
  icon: '🔺',
  badge: {
    mode: 'DAG 定向 O(M√M)',
    complexity: 'O(M · √M) · O(N + M)',
  },
  card1Title: '🔺 定向拓扑图与环高亮沙盘',
  card2Title: '🧭 环计数器与根号复杂度监视器',
  card2Desc: '无向图度数定向 DAG、三元环与四元环累计总数',
  legend: [
    { label: '图节点 (1..4)', color: '#0284c7' },
    { label: '🟢 形成三元环的边', color: '#10b981' },
    { label: '普通定向边', color: '#475569' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典双三角形图 (P1989)', values: {} },
  ],
  metrics: [
    { id: 'metric-3cycle-count', label: '三元环总数', color: '#10b981' },
    { id: 'metric-4cycle-count', label: '四元环总数', color: '#f59e0b' },
  ],
  codeLanguages: CYCLE_COUNTING_CODE_LANGUAGES,
  problemHtml: CYCLE_COUNTING_PROBLEM_HTML,
  analysisHtml: CYCLE_COUNTING_ANALYSIS_HTML,
  buildSteps: () => buildCycleCountingSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 110 },
      2: { x: 235, y: 110 },
      3: { x: 155, y: 45 },
      4: { x: 155, y: 175 },
    };

    const edges = [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 3, v: 2 },
      { u: 1, v: 4 },
      { u: 4, v: 2 },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-green)" />`;
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
          <defs>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 定向后每条无向边只计算一次 | 严格满足 $O(M \sqrt{M})$ 根号复杂度上界
        </div>
      </div>
    `;

    const root = container.closest('#algo-cycle-counting-view');
    if (root) {
      const c3El = root.querySelector('#metric-3cycle-count');
      const c4El = root.querySelector('#metric-4cycle-count');

      if (c3El) c3El.textContent = `${step.total3Cycles} 个`;
      if (c4El) c4El.textContent = `${step.total4Cycles} 个`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const triStr = step.trianglesFound.map(([a, b, c]) => `(${a},${b},${c})`).join(' ') || '无';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>已定位三元环:</span>
              <strong style="color: #10b981; font-family: monospace;">${triStr}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 根号分治复杂度定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">定向后出度 ≤ √(2M)，总枚举步数 ≤ M√(2M)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'cycle-counting',
  name: '三元环与四元环计数 (Cycle Counting)',
  viewId: 'algo-cycle-counting-view',
  category: 'graph',
  description: '进阶图论经典环计数：按度数定向为 DAG、根号分治保证出度界、O(M√M) 极速三元环与四元环统计 (洛谷 P1989)',
  icon: '🔺',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 54,
  learningGoal: '掌握无向图按度数定向为 DAG 的技巧、三元环和四元环计数的 O(M√M) 严格数学证明',
});

export { Visualizer as CycleCountingVisualizer };
