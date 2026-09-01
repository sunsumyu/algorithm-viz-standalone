/**
 * 好路径的数目 (Number of Good Paths - LeetCode 2421 / 左程云 Class 067 题目5) 声明式可视化器
 * 核心：按点权由小到大排序加边、并查集连通块维护同值最大点计数、乘法原理累加组合数 C(cnt, 2)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  GOOD_PATHS_CODE_LANGUAGES,
  GOOD_PATHS_PROBLEM_HTML,
  GOOD_PATHS_ANALYSIS_HTML,
} from './good-paths-problem-content';

export interface GoodPathsStep {
  curVal: number;
  activeEdges: Array<[number, number]>;
  totalGoodPaths: number;
  status: 'init' | 'merge_val' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildGoodPathsSteps(): GoodPathsStep[] {
  const steps: GoodPathsStep[] = [];

  steps.push({
    curVal: 1,
    activeEdges: [],
    totalGoodPaths: 4,
    status: 'init',
    message: '1. [每个单点自成好路径] 4 个节点自身各自构成长度为 0 的好路径，初始路径总数 = 4。',
    log: '初始化：4 个单点路径, ans = 4',
    codeLine: [18, 24],
  });

  steps.push({
    curVal: 2,
    activeEdges: [[0, 1]],
    totalGoodPaths: 4,
    status: 'merge_val',
    message: '2. [按点权升序激活边 (0-1)] 点权 max(val[0]=1, val[1]=2) = 2，合并 0 与 1！连通块内最大值 2 的出现次数为 1，无新增配对！',
    log: '激活边 (0, 1)：最大值 2 出现 1 次，无新增组合',
    codeLine: [26, 35],
  });

  steps.push({
    curVal: 3,
    activeEdges: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
    totalGoodPaths: 5,
    status: 'done',
    message: '🎉 [点权为 3 的节点配对] 合并至点权 3，节点 2 (val:3) 与 节点 3 (val:3) 连通，产生组合 C(2, 2) = 1 条好路径！总好路径数 = 5！',
    log: '✓ 激活点权 3 边：连通块内包含 2 个点权为 3 的端点，新增 1 条好路径，总数 = 5',
    codeLine: [38, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<GoodPathsStep>({
  id: 'good-paths',
  name: '好路径的数目 (Number of Good Paths)',
  category: 'graph',
  icon: '🛣️',
  badge: {
    mode: '点权升序加边 + 并查集同值计数',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🛣️ 树上点权与升序激活边沙盘',
  card2Title: '🧭 连通块同值计数与组合数监视器',
  card2Desc: '点权升序排序、连通块最大值计数与乘法原理新增好路径',
  legend: [
    { label: '低权值节点 (val: 1, 2)', color: '#0284c7' },
    { label: '⭐ 高权值端点 (val: 3)', color: '#f59e0b' },
    { label: '🟢 已激活的边', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典好路径树 (LeetCode 2421)', values: {} },
  ],
  metrics: [
    { id: 'metric-active-val', label: '当前激活点权上限', color: '#2563eb' },
    { id: 'metric-good-paths', label: '好路径累计总数', color: '#10b981' },
  ],
  codeLanguages: GOOD_PATHS_CODE_LANGUAGES,
  problemHtml: GOOD_PATHS_PROBLEM_HTML,
  analysisHtml: GOOD_PATHS_ANALYSIS_HTML,
  buildSteps: () => buildGoodPathsSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number; val: number }> = {
      0: { x: 75, y: 110, val: 1 },
      1: { x: 135, y: 110, val: 2 },
      2: { x: 195, y: 110, val: 3 },
      3: { x: 255, y: 110, val: 3 },
    };

    const treeEdges = [
      { u: 0, v: 1 },
      { u: 1, v: 2 },
      { u: 2, v: 3 },
    ];

    const isAct = (u: number, v: number) => step.activeEdges.some(([au, av]) => (au === u && av === v) || (au === v && av === u));

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const act = isAct(e.u, e.v);
        const color = act ? '#10b981' : '#475569';
        const width = act ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [0, 1, 2, 3];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isMaxVal = p.val === 3;
        const bg = isMaxVal ? '#b45309' : '#0369a1';
        const border = isMaxVal ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#facc15" font-size="9" font-weight="700" text-anchor="middle">v:${p.val}</text>
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
          🟢 绿色为已激活边 | 点权为 3 的节点 2 与 3 连通，产生好路径 (2 ➔ 3)
        </div>
      </div>
    `;

    const root = container.closest('#algo-good-paths-view');
    if (root) {
      const vEl = root.querySelector('#metric-active-val');
      const pEl = root.querySelector('#metric-good-paths');

      if (vEl) vEl.textContent = `val ≤ ${step.curVal}`;
      if (pEl) pEl.textContent = `${step.totalGoodPaths}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 组合计数公式:</span>
              <strong style="font-family: monospace; color: #2563eb;">两连通块合并时，同为最大值点数 c1 与 c2，新增好路径 c1 * c2 条</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'good-paths',
  name: '好路径的数目 (Number of Good Paths)',
  viewId: 'algo-good-paths-view',
  category: 'graph',
  description: '左程云算法通关课 Class 067 题目5：树上点权升序加边离线思想、并查集维护当前连通块最大值计数、组合数学求好路径总数 (LeetCode 2421)',
  icon: '🛣️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 35,
  learningGoal: '掌握离线按点权升序加边的转化技巧、并查集维护连通块极值计数的模板实现',
});

export { Visualizer as GoodPathsVisualizer };
