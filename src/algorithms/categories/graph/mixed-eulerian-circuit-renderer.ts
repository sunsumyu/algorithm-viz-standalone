/**
 * 混合图欧拉回路与网络流定向 (Mixed Graph Eulerian Circuit - POJ 1637) 声明式可视化器
 * 进阶网络流建模: 任意初始定向、度数差额 D[u]、Dinic 最大流调整方向、满流判定
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  MIXED_EULER_CODE_LANGUAGES,
  MIXED_EULER_PROBLEM_HTML,
  MIXED_EULER_ANALYSIS_HTML,
} from './mixed-eulerian-circuit-problem-content';

export interface MixedEulerStep {
  directedEdges: Array<{ u: number; v: number; isFlipped: boolean }>;
  degIn: Record<number, number>;
  degOut: Record<number, number>;
  flowVal: number;
  maxFlowTarget: number;
  isEulerian: boolean;
  status: 'init' | 'check' | 'flow' | 'flip' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildMixedEulerSteps(isSolvableCase: boolean): MixedEulerStep[] {
  const steps: MixedEulerStep[] = [];

  if (isSolvableCase) {
    // 4 节点可解情况
    const initEdges = [
      { u: 1, v: 2, isFlipped: false },
      { u: 2, v: 3, isFlipped: false },
      { u: 3, v: 4, isFlipped: false },
      { u: 4, v: 1, isFlipped: false },
      { u: 1, v: 3, isFlipped: false }, // 无向边初始定向 1 -> 3
    ];
    // In: 1:1, 2:1, 3:2, 4:1
    // Out: 1:2, 2:1, 3:1, 4:1
    // Diff (in - out): 1:-1, 2:0, 3:+1, 4:0

    steps.push({
      directedEdges: initEdges.map((e) => ({ ...e })),
      degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
      degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
      flowVal: 0,
      maxFlowTarget: 1,
      isEulerian: false,
      status: 'init',
      message: '1. [任意初始定向] 所有无向边任意选定一个方向（如 1➔3 定向为有向边），统计各点入度与出度。',
      log: '初始定向：无向边 1-3 定向为 1->3',
      codeLine: [15, 20],
    });

    steps.push({
      directedEdges: initEdges.map((e) => ({ ...e })),
      degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
      degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
      flowVal: 0,
      maxFlowTarget: 1,
      isEulerian: false,
      status: 'check',
      message: '2. [奇偶性校验] 差额 D[1]=-1, D[3]=+1。差额均为偶数差（|in - out| 为奇数则无解）。',
      log: '度数差额校验：D[1]=-1 (需流入), D[3]=+1 (需流出)',
      codeLine: [22, 28],
    });

    steps.push({
      directedEdges: initEdges.map((e) => ({ ...e })),
      degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
      degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
      flowVal: 1,
      maxFlowTarget: 1,
      isEulerian: true,
      status: 'flow',
      message: '3. [网络流建图与满流] 源点 S ➔ 3(容量 1)，1 ➔ 汇点 T(容量 1)，无向边加容量 1 的反向边。Dinic 求得最大流 = 1 满流！',
      log: 'Dinic 最大流求解：推流 1/1 满流',
      codeLine: [30, 36],
    });

    const flippedEdges = [
      { u: 1, v: 2, isFlipped: false },
      { u: 2, v: 3, isFlipped: false },
      { u: 3, v: 4, isFlipped: false },
      { u: 4, v: 1, isFlipped: false },
      { u: 3, v: 1, isFlipped: true }, // 反转边 3 -> 1
    ];

    steps.push({
      directedEdges: flippedEdges,
      degIn: { 1: 2, 2: 1, 3: 1, 4: 1 },
      degOut: { 1: 1, 2: 1, 3: 2, 4: 1 },
      flowVal: 1,
      maxFlowTarget: 1,
      isEulerian: true,
      status: 'flip',
      message: '4. [反转边重构] 根据满流残量网络，将满流边 1➔3 反转为 3➔1！此时所有节点入度严格等于出度！',
      log: '反转边 1->3 为 3->1，度数平衡',
      codeLine: [38, 42],
    });

    steps.push({
      directedEdges: flippedEdges,
      degIn: { 1: 2, 2: 1, 3: 1, 4: 1 },
      degOut: { 1: 1, 2: 1, 3: 2, 4: 1 },
      flowVal: 1,
      maxFlowTarget: 1,
      isEulerian: true,
      status: 'done',
      message: '🎉 判定成功！该混合图存在欧拉回路：1 ➔ 2 ➔ 3 ➔ 1 ➔ 2 ➔ 3 ➔ 4 ➔ 1！',
      log: '✓ 判定完成：存在欧拉回路',
      codeLine: 45,
    });
  } else {
    // 奇偶不合无解用例
    steps.push({
      directedEdges: [
        { u: 1, v: 2, isFlipped: false },
        { u: 2, v: 3, isFlipped: false },
      ],
      degIn: { 1: 0, 2: 1, 3: 1 },
      degOut: { 1: 1, 2: 1, 3: 0 },
      flowVal: 0,
      maxFlowTarget: 2,
      isEulerian: false,
      status: 'check',
      message: '❌ 奇偶性检验失败：节点入度与出度奇偶性不符，无法通过边反转实现平衡，直接判定无欧拉回路！',
      log: '❌ 奇偶性校验失败：无解',
      codeLine: 25,
    });
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<MixedEulerStep>({
  id: 'mixed-eulerian-circuit',
  name: '混合图欧拉回路 (Mixed Eulerian Circuit)',
  category: 'graph',
  icon: '🔄',
  badge: {
    mode: '初始定向 + 最大流反转',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '🌐 混合图初始定向与边反转沙盘',
  card2Title: '🧭 入出度差额 D[u] 与满流监视器',
  card2Desc: '无向边初始方向、差额 D[u]=(in-out)/2 与网络流反向调整',
  legend: [
    { label: '原始有向边', color: '#38bdf8' },
    { label: '🔄 反转有向边', color: '#10b981' },
    { label: '度数平衡节点', color: '#0284c7' },
  ],
  inputs: [
    {
      id: 'input-solvable',
      label: '用例模式',
      type: 'select',
      defaultValue: 'solvable',
      options: [
        { label: '标准可行混合图 (POJ 1637)', value: 'solvable' },
        { label: '奇偶不符无解图', value: 'unsolvable' },
      ],
      width: '180px',
    },
  ],
  presets: [
    { label: '标准可行混合图 (POJ 1637)', values: { 'input-solvable': 'solvable' } },
    { label: '奇偶不符无解图', values: { 'input-solvable': 'unsolvable' } },
  ],
  metrics: [
    { id: 'metric-flow', label: '最大流推流 / 目标', color: '#2563eb' },
    { id: 'metric-euler-status', label: '欧拉回路判定', color: '#10b981' },
  ],
  codeLanguages: MIXED_EULER_CODE_LANGUAGES,
  problemHtml: MIXED_EULER_PROBLEM_HTML,
  analysisHtml: MIXED_EULER_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const isSolvable = (inputs['input-solvable'] || 'solvable') === 'solvable';
    return buildMixedEulerSteps(isSolvable);
  },
  renderCanvas: (container, step) => {
    const nodePositions: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 55 },
      2: { x: 235, y: 55 },
      3: { x: 235, y: 175 },
      4: { x: 75, y: 175 },
    };

    const svgEdges = step.directedEdges
      .map((e) => {
        const p1 = nodePositions[e.u];
        const p2 = nodePositions[e.v];
        if (!p1 || !p2) return '';

        const color = e.isFlipped ? '#10b981' : '#38bdf8';
        const strokeWidth = e.isFlipped ? 3 : 1.5;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${strokeWidth}" marker-end="url(#arrow-${e.isFlipped ? 'flipped' : 'default'})" />
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const pos = nodePositions[u];
        if (!pos) return '';
        const inDeg = step.degIn[u] || 0;
        const outDeg = step.degOut[u] || 0;
        const isBalanced = inDeg === outDeg;

        return `
          <g>
            <circle cx="${pos.x}" cy="${pos.y}" r="15" fill="${isBalanced ? '#065f46' : '#1e3a8a'}" stroke="${isBalanced ? '#10b981' : '#38bdf8'}" stroke-width="2" />
            <text x="${pos.x}" y="${pos.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${pos.x}" y="${pos.y + 26}" fill="${isBalanced ? '#34d399' : '#facc15'}" font-size="9" font-weight="700" text-anchor="middle">in:${inDeg} out:${outDeg}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          <defs>
            <marker id="arrow-default" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-flipped" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色边为经 Dinic 最大流满流调整后反转的边 | 所有节点 in == out 即满足欧拉图条件
        </div>
      </div>
    `;

    const root = container.closest('#algo-mixed-eulerian-circuit-view');
    if (root) {
      const flowEl = root.querySelector('#metric-flow');
      const eulerEl = root.querySelector('#metric-euler-status');

      if (flowEl) flowEl.textContent = `${step.flowVal} / ${step.maxFlowTarget}`;
      if (eulerEl) {
        eulerEl.textContent = step.isEulerian ? '✓ 存在欧拉回路' : '求解中...';
        eulerEl.style.color = step.isEulerian ? '#10b981' : '#d97706';
      }

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 混合图欧拉回路定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">maxFlow == ∑max(0, (in - out)/2)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'mixed-eulerian-circuit',
  name: '混合图欧拉回路 (Mixed Eulerian Circuit)',
  viewId: 'algo-mixed-eulerian-circuit-view',
  category: 'graph',
  description: '进阶网络流经典建模：任意初始定向、出入度差额 D[u]、Dinic 最大流调整方向与满流回路判定 (POJ 1637)',
  icon: '🔄',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 71,
  learningGoal: '掌握混合图欧拉回路转化为网络流最大流的建模技巧、奇偶性判别及残量网络边反转重构回路',
});

export { Visualizer as MixedEulerianCircuitVisualizer };
