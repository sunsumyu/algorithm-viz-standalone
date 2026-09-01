/**
 * 欧拉回路与欧拉路径 (Eulerian Path & Circuit - Hierholzer 算法) 声明式可视化器
 * 图论经典: 度数奇偶判定、Hierholzer 递归回溯压栈倒序输出、一笔画遍历所有边 (洛谷 P7771 / P2731)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  EULERIAN_CIRCUIT_CODE_LANGUAGES,
  EULERIAN_CIRCUIT_PROBLEM_HTML,
  EULERIAN_CIRCUIT_ANALYSIS_HTML,
} from './eulerian-circuit-problem-content';

export interface EulerianStep {
  curNode: number;
  circuitPath: number[];
  visitedEdges: Array<[number, number]>;
  status: 'check' | 'traverse' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildEulerianCircuitSteps(): EulerianStep[] {
  const steps: EulerianStep[] = [];

  steps.push({
    curNode: 1,
    circuitPath: [],
    visitedEdges: [],
    status: 'check',
    message: '1. [度数奇偶检验] 所有节点度数均为偶数 (deg[1..4]=2 或 4)，满足欧拉回路存在判定定理！从 1 开始 DFS！',
    log: '全图度数均为偶数，欧拉回路必然存在',
    codeLine: [18, 25],
  });

  steps.push({
    curNode: 2,
    circuitPath: [],
    visitedEdges: [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
    ],
    status: 'traverse',
    message: '2. [Hierholzer 贪心走边与无出边入栈] 遍历环 1 ➔ 2 ➔ 3 ➔ 4 ➔ 1，所有边被且仅被遍历一次！',
    log: '走遍所有边：1 ➔ 2 ➔ 3 ➔ 4 ➔ 1',
    codeLine: [28, 36],
  });

  steps.push({
    curNode: 1,
    circuitPath: [1, 4, 3, 2, 1],
    visitedEdges: [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
    ],
    status: 'done',
    message: '🎉 [欧拉回路倒序输出完成] 回溯出栈得到完整欧拉回路：[1, 2, 3, 4, 1]！每条边恰好经过一次！',
    log: '✓ 欧拉回路生成完成: [1, 2, 3, 4, 1]',
    codeLine: [38, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<EulerianStep>({
  id: 'eulerian-circuit',
  name: '欧拉回路与路径 (Eulerian Circuit)',
  category: 'graph',
  icon: '♾️',
  badge: {
    mode: 'Hierholzer 算法',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '♾️ 一笔画拓扑与欧拉回路沙盘',
  card2Title: '🧭 节点度数奇偶与回路序列监视器',
  card2Desc: '无向/有向度数判定、当前弧优化删边与回溯倒序回路',
  legend: [
    { label: '图节点 (1..4)', color: '#0284c7' },
    { label: '🟢 欧拉回路走过的边', color: '#10b981' },
    { label: '未遍历边', color: '#475569' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典环形欧拉图', values: {} },
  ],
  metrics: [
    { id: 'metric-euler-status', label: '回路存在性', color: '#10b981' },
    { id: 'metric-euler-path', label: '欧拉回路序列', color: '#2563eb' },
  ],
  codeLanguages: EULERIAN_CIRCUIT_CODE_LANGUAGES,
  problemHtml: EULERIAN_CIRCUIT_PROBLEM_HTML,
  analysisHtml: EULERIAN_CIRCUIT_ANALYSIS_HTML,
  buildSteps: () => buildEulerianCircuitSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 75 },
      2: { x: 235, y: 75 },
      3: { x: 235, y: 155 },
      4: { x: 75, y: 155 },
    };

    const edges = [
      { u: 1, v: 2 },
      { u: 2, v: 3 },
      { u: 3, v: 4 },
      { u: 4, v: 1 },
    ];

    const isVisited = (u: number, v: number) => step.visitedEdges.some(([vu, vv]) => (vu === u && vv === v) || (vu === v && vv === u));

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const vis = isVisited(e.u, e.v);
        const color = vis ? '#10b981' : '#475569';
        const width = vis ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curNode === u;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${isCur ? '#b45309' : '#0369a1'}" stroke="${isCur ? '#facc15' : '#38bdf8'}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
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
          🟢 绿色为一笔画欧拉回路 | Hierholzer 算法在回溯时将节点压栈，最后倒序输出
        </div>
      </div>
    `;

    const root = container.closest('#algo-eulerian-circuit-view');
    if (root) {
      const sEl = root.querySelector('#metric-euler-status');
      const pEl = root.querySelector('#metric-euler-path');

      if (sEl) sEl.textContent = '✓ 存在欧拉回路';
      if (pEl) pEl.textContent = step.circuitPath.length > 0 ? `[${step.circuitPath.join('➔')}]` : '生成中...';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 欧拉回路存在充要条件:</span>
              <strong style="font-family: monospace; color: #2563eb;">连通且所有顶点的度数均为偶数 (有向图入度 = 出度)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'eulerian-circuit',
  name: '欧拉回路与路径 (Eulerian Circuit)',
  viewId: 'algo-eulerian-circuit-view',
  category: 'graph',
  description: '图论经典一笔画问题：奇偶度数判定定理、Hierholzer 删边算法、回溯倒序输出 O(V+E) 欧拉回路 (洛谷 P7771 / P2731)',
  icon: '♾️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 34,
  learningGoal: '掌握欧拉回路与欧拉路径的充要判定条件、Hierholzer 删边当前弧优化及栈倒序输出',
});

export { Visualizer as EulerianCircuitVisualizer };
