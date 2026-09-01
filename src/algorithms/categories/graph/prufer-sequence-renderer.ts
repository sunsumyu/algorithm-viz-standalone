/**
 * Prufer 序列与 Cayley 公式 (Prufer Sequence & Cayley's Formula) 声明式可视化器
 * 组合图论: 树到 Prufer 序列的双向双射、O(N) 线性编解码、完全图生成树计数 n^(n-2) (洛谷 P6086)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PRUFER_CODE_LANGUAGES,
  PRUFER_PROBLEM_HTML,
  PRUFER_ANALYSIS_HTML,
} from './prufer-sequence-problem-content';

export interface PruferStep {
  curLeaf: number;
  curNeighbor: number;
  pruferSequence: number[];
  remainingEdges: Array<{ u: number; v: number }>;
  nodeDegrees: Record<number, number>;
  status: 'start' | 'encode' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildPruferSteps(): PruferStep[] {
  const steps: PruferStep[] = [];

  const initialEdges = [
    { u: 1, v: 2 },
    { u: 1, v: 3 },
    { u: 1, v: 4 },
  ];

  steps.push({
    curLeaf: 2,
    curNeighbor: 1,
    pruferSequence: [1],
    remainingEdges: [
      { u: 1, v: 3 },
      { u: 1, v: 4 },
    ],
    nodeDegrees: { 1: 2, 2: 0, 3: 1, 4: 1 },
    status: 'encode',
    message: '1. [弹出最小叶子 2] 节点 2 为当前编号最小叶子，记录邻居 1 加入 Prufer 序列，删除节点 2！',
    log: '编码步骤 1: 弹出最小叶子 2 ➔ Prufer 加入 [1]',
    codeLine: [15, 22],
  });

  steps.push({
    curLeaf: 3,
    curNeighbor: 1,
    pruferSequence: [1, 1],
    remainingEdges: [{ u: 1, v: 4 }],
    nodeDegrees: { 1: 1, 2: 0, 3: 0, 4: 1 },
    status: 'encode',
    message: '2. [弹出最小叶子 3] 节点 3 为当前编号最小叶子，记录邻居 1 加入 Prufer 序列，删除节点 3！',
    log: '编码步骤 2: 弹出最小叶子 3 ➔ Prufer 加入 [1, 1]',
    codeLine: [15, 22],
  });

  steps.push({
    curLeaf: 4,
    curNeighbor: 1,
    pruferSequence: [1, 1],
    remainingEdges: [{ u: 1, v: 4 }],
    nodeDegrees: { 1: 1, 2: 0, 3: 0, 4: 1 },
    status: 'done',
    message: '🎉 [Prufer 序列编码完成] 剩余最后 2 个点终止，4 节点星形树的 Prufer 序列为 [1, 1]！满足 Cayley 公式 $n^{n-2} = 4^2 = 16$！',
    log: '✓ Prufer 序列编码完成: [1, 1]',
    codeLine: [25, 30],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<PruferStep>({
  id: 'prufer-sequence',
  name: 'Prufer 序列与 Cayley 公式 (Prufer Sequence)',
  category: 'graph',
  icon: '📼',
  badge: {
    mode: '双向双射编解码',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '📼 树形拓扑与最小叶子消除沙盘',
  card2Title: '🧭 Prufer 序列与节点度数监视器',
  card2Desc: '度数 degree[u]、每次消除最小编号叶子与生成树计数 n^(n-2)',
  legend: [
    { label: '内部主节点', color: '#0284c7' },
    { label: '⚡ 当前消除最小叶子', color: '#f59e0b' },
    { label: '剩余树枝', color: '#475569' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点星形树 (Prufer=[1, 1])', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-leaf', label: '当前消除叶子', color: '#f59e0b' },
    { id: 'metric-prufer-seq', label: 'Prufer 序列', color: '#10b981' },
    { id: 'metric-cayley-count', label: 'Cayley 生成树总数', color: '#2563eb' },
  ],
  codeLanguages: PRUFER_CODE_LANGUAGES,
  problemHtml: PRUFER_PROBLEM_HTML,
  analysisHtml: PRUFER_ANALYSIS_HTML,
  buildSteps: () => buildPruferSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 80 },
      2: { x: 75, y: 155 },
      3: { x: 155, y: 165 },
      4: { x: 235, y: 155 },
    };

    const svgEdges = step.remainingEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="2" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCurLeaf = step.curLeaf === u;
        const deg = step.nodeDegrees[u] ?? 0;
        const isRemoved = deg === 0;
        const bg = isCurLeaf ? '#f59e0b' : isRemoved ? '#334155' : '#0284c7';
        const border = isCurLeaf ? '#facc15' : isRemoved ? '#475569' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCurLeaf ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${isRemoved ? '#64748b' : '#34d399'}" font-size="9" font-weight="700" text-anchor="middle">deg:${deg}</text>
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
          🟡 金色为被删除的最小编号叶子 | 长度为 $n-2$ 的 Prufer 序列与 $n$ 节点无根树一一对应
        </div>
      </div>
    `;

    const root = container.closest('#algo-prufer-sequence-view');
    if (root) {
      const leafEl = root.querySelector('#metric-cur-leaf');
      const seqEl = root.querySelector('#metric-prufer-seq');
      const cayleyEl = root.querySelector('#metric-cayley-count');

      if (leafEl) leafEl.textContent = `Node ${step.curLeaf}`;
      if (seqEl) seqEl.textContent = `[${step.pruferSequence.join(', ')}]`;
      if (cayleyEl) cayleyEl.textContent = '4^(4-2) = 16 种';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Prufer 编码序列:</span>
              <strong style="color: #10b981; font-family: monospace;">[${step.pruferSequence.join(', ')}]</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 Cayley 公式:</span>
              <strong style="font-family: monospace; color: #2563eb;">n 节点完全图不同生成树总数 = n^(n - 2)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'prufer-sequence',
  name: 'Prufer 序列与 Cayley 公式 (Prufer Sequence)',
  viewId: 'algo-prufer-sequence-view',
  category: 'graph',
  description: '组合图论经典：无根树与 Prufer 序列的双向双射、线性 O(N) 编解码与 Cayley 公式 n^(n-2) (洛谷 P6086)',
  icon: '📼',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 56,
  learningGoal: '掌握 Prufer 序列的双射原理、指针 O(N) 线性编解码算法及 Cayley 公式在计数中的应用',
});

export { Visualizer as PruferSequenceVisualizer };
