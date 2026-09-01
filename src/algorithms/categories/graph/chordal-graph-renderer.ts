/**
 * 弦图判定与 MCS 最大势算法 (Chordal Graph & Maximum Cardinality Search) 声明式可视化器
 * 进阶图论: MCS 逆序生成完美消除序列 PEO、弦图充要条件检验 (洛谷 P3199)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CHORDAL_GRAPH_CODE_LANGUAGES,
  CHORDAL_GRAPH_PROBLEM_HTML,
  CHORDAL_GRAPH_ANALYSIS_HTML,
} from './chordal-graph-problem-content';

export interface ChordalStep {
  peoOrder: number[];
  labelWeights: Record<number, number>;
  curSelected: number;
  isChordal: boolean;
  status: 'mcs' | 'peo' | 'verify' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildChordalGraphSteps(): ChordalStep[] {
  const steps: ChordalStep[] = [];

  steps.push({
    peoOrder: [4],
    labelWeights: { 1: 1, 2: 1, 3: 0, 4: 0 },
    curSelected: 4,
    isChordal: true,
    status: 'mcs',
    message: '1. [MCS 贪心选取] 选取势最大的节点 4 加入 PEO 序列末尾，更新相邻点 1 与 2 的势权重 +1。',
    log: 'MCS 选取节点 4: PEO=[4]',
    codeLine: [15, 22],
  });

  steps.push({
    peoOrder: [2, 4],
    labelWeights: { 1: 2, 2: 1, 3: 1, 4: 0 },
    curSelected: 2,
    isChordal: true,
    status: 'mcs',
    message: '2. [MCS 选取节点 2] 节点 2 加入 PEO 序列，相邻点 1 与 3 权重更新。',
    log: 'MCS 选取节点 2: PEO=[2, 4]',
    codeLine: [15, 22],
  });

  steps.push({
    peoOrder: [1, 2, 4],
    labelWeights: { 1: 2, 2: 1, 3: 2, 4: 0 },
    curSelected: 1,
    isChordal: true,
    status: 'mcs',
    message: '3. [MCS 选取节点 1] 节点 1 加入 PEO 序列。',
    log: 'MCS 选取节点 1: PEO=[1, 2, 4]',
    codeLine: [15, 22],
  });

  steps.push({
    peoOrder: [3, 1, 2, 4],
    labelWeights: { 1: 2, 2: 1, 3: 2, 4: 0 },
    curSelected: 3,
    isChordal: true,
    status: 'done',
    message: '🎉 [PEO 完美消除序列检验成功] PEO 序列为 [3, 1, 2, 4]，每个点的后继邻居诱导子图均为完全图！判定为合法的弦图！',
    log: '✓ 判定成功：存在完美消除序列 PEO=[3,1,2,4]，为弦图',
    codeLine: [28, 35],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<ChordalStep>({
  id: 'chordal-graph',
  name: '弦图判定 MCS (Chordal Graph)',
  viewId: 'algo-chordal-graph-view',
  category: 'graph',
  icon: '🎻',
  badge: {
    mode: '最大势搜索 MCS + PEO',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🎻 弦图拓扑与完美消除序列沙盘',
  card2Title: '🧭 节点势 label[u] 与 PEO 监视器',
  card2Desc: 'MCS 逆序生成 PEO 序列、后继完全子图检验与弦图充要判定',
  legend: [
    { label: '未处理节点', color: '#0284c7' },
    { label: '⭐ 当前选取最大势节点', color: '#f59e0b' },
    { label: '🟢 已入 PEO 序列节点', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点弦图 (含对角弦)', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前最大势节点', color: '#f59e0b' },
    { id: 'metric-chordal-status', label: '弦图判定结论', color: '#10b981' },
  ],
  codeLanguages: CHORDAL_GRAPH_CODE_LANGUAGES,
  problemHtml: CHORDAL_GRAPH_PROBLEM_HTML,
  analysisHtml: CHORDAL_GRAPH_ANALYSIS_HTML,
  buildSteps: () => buildChordalGraphSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 80, y: 55 },
      2: { x: 230, y: 55 },
      3: { x: 80, y: 165 },
      4: { x: 230, y: 165 },
    };

    const edges = [
      { u: 1, v: 2 },
      { u: 2, v: 4 },
      { u: 4, v: 3 },
      { u: 3, v: 1 },
      { u: 1, v: 4 }, // 弦边
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isChord = (e.u === 1 && e.v === 4) || (e.u === 4 && e.v === 1);
        const color = isChord ? '#facc15' : '#475569';
        const width = isChord ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const inPEO = step.peoOrder.includes(u);
        const isCur = step.curSelected === u;
        const bg = isCur ? '#f59e0b' : inPEO ? '#065f46' : '#1e3a8a';
        const border = isCur ? '#facc15' : inPEO ? '#10b981' : '#38bdf8';
        const weight = step.labelWeights[u] || 0;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCur || inPEO ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${inPEO ? '#34d399' : '#94a3b8'}" font-size="9" font-weight="700" text-anchor="middle">势:${weight}</text>
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
          🟡 金色斜线为对角弦边 | 无环四边形均存在弦划分，MCS 逆序生成 PEO 序列
        </div>
      </div>
    `;

    const root = container.closest('#algo-chordal-graph-view');
    if (root) {
      const nodeEl = root.querySelector('#metric-cur-node');
      const chordalEl = root.querySelector('#metric-chordal-status');

      if (nodeEl) nodeEl.textContent = `Node ${step.curSelected}`;
      if (chordalEl) chordalEl.textContent = step.isChordal ? '✓ 判定为弦图' : '检验中...';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const peoStr = step.peoOrder.map((u) => `N${u}`).join(' ➔ ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>当前 PEO 逆序:</span>
              <strong style="color: #10b981; font-family: monospace;">[${peoStr}]</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 弦图充要条件:</span>
              <strong style="font-family: monospace; color: #2563eb;">图 G 为弦图 ⟺ 存在完美消除序列 PEO</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'chordal-graph',
  name: '弦图判定 MCS (Chordal Graph)',
  viewId: 'algo-chordal-graph-view',
  category: 'graph',
  description: '进阶图论最大势算法：最大势搜索 MCS 逆序生成完美消除序列 PEO、弦图充要判定 (洛谷 P3199)',
  icon: '🎻',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 64,
  learningGoal: '掌握最大势搜索 MCS 算法原理、完美消除序列 PEO 检验及弦图的判定定理',
});

export { Visualizer as ChordalGraphVisualizer };
