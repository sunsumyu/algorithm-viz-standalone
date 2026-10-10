/**
 * 弦图判定与 MCS 最大势算法 (Chordal Graph & Maximum Cardinality Search · 洛谷 P3199) 声明式可视化器
 * 进阶图论: MCS 逆序生成完美消除序列 PEO、弦图充要条件检验
 * 遵循 Matt Pocock 深模块规范，Thin Domain Adapter 控制在 120 行以内
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CHORDAL_GRAPH_CODE_LANGUAGES,
  CHORDAL_GRAPH_PROBLEM_HTML,
  CHORDAL_GRAPH_ANALYSIS_HTML,
} from './chordal-graph-problem-content';
import {
  buildChordalGraphSteps,
  type ChordalStep,
} from './chordal-graph-step-compiler';
import {
  renderChordalGraphCanvas,
  renderChordalGraphCustomMetrics,
} from '../../../core/renderers/adapters/chordal-graph-canvas-adapter';

export { buildChordalGraphSteps, type ChordalStep };

const { template, Visualizer } = createDeclarativeVisualizer<ChordalStep>({
  id: 'chordal-graph',
  name: '弦图判定 MCS (Chordal Graph)',
  category: 'graph',
  icon: '🎻',
  badge: {
    mode: 'MCS + PEO 单步虚拟机',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🎻 弦图拓扑与完美消除序列沙盘',
  card2Title: '📊 节点多数组 (label, peo, rank, vis) 实时监控器',
  card2Desc: '严格对齐每行代码推导，逐指令监控 label[] 势、peo[] 序列、rankOrder[] 及 vis[] 数组状态',
  hasDeductionTree: true,
  legend: [
    { label: '未处理节点', color: '#1e3a8a' },
    { label: '⭐ 当前选取最大势节点', color: '#f59e0b' },
    { label: '🟢 已入 PEO 序列节点', color: '#065f46' },
    { label: '🟡 对角弦边 (若存在)', color: '#facc15' },
    { label: '🔴 正在校验/冲突边', state: 'swapping' },
  ],
  inputs: [
    {
      id: 'input-graph-type',
      label: '图结构模式',
      type: 'select',
      defaultValue: 'chordal',
      options: [
        { label: '4 节点弦图 (含对角弦 1-4)', value: 'chordal' },
        { label: '4 节点无弦环 C4 (非弦图)', value: 'non-chordal' },
      ],
    },
  ],
  presets: [
    { label: '4 节点弦图 (含对角弦 1-4)', values: { 'input-graph-type': 'chordal' } },
    { label: '4 节点无弦环 C4 (非弦图)', values: { 'input-graph-type': 'non-chordal' } },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前焦点节点', color: '#f59e0b' },
    { id: 'metric-peo-len', label: 'PEO 生成进度', color: '#38bdf8' },
    { id: 'metric-chordal-status', label: '弦图判定结论', color: '#10b981' },
  ],
  codeLanguages: CHORDAL_GRAPH_CODE_LANGUAGES,
  problemHtml: CHORDAL_GRAPH_PROBLEM_HTML,
  analysisHtml: CHORDAL_GRAPH_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const type = (inputs['input-graph-type'] || 'chordal') as 'chordal' | 'non-chordal';
    return buildChordalGraphSteps(type);
  },
  renderCanvas: (container, step) => {
    renderChordalGraphCanvas(container, step);
    const root =
      container.closest('#algo-chordal-graph-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (root) {
      const nodeEl = root.querySelector('#metric-cur-node') || root.querySelector('#cur-node');
      const peoLenEl = root.querySelector('#metric-peo-len') || root.querySelector('#peo-len');
      const chordalEl = root.querySelector('#metric-chordal-status') || root.querySelector('#chordal-status');

      if (nodeEl) nodeEl.textContent = step.curSelected ? `Node ${step.curSelected}` : '无';
      if (peoLenEl) peoLenEl.textContent = `${step.peoOrder.length} / 4`;
      if (chordalEl) {
        chordalEl.textContent =
          step.status === 'done' || step.status === 'fail'
            ? step.isChordal
              ? '✓ 判定为弦图'
              : '❌ 非弦图 (含无弦环)'
            : '检验中...';
      }
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container') as HTMLElement;
      if (customMetricsContainer) {
        renderChordalGraphCustomMetrics(customMetricsContainer, step);
      }
    }
  },
  renderCustomMetrics: (container, step) => {
    renderChordalGraphCustomMetrics(container, step);
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
  aliases: ['mcs', 'peo', 'P3199', 'chordal'],
});

export { Visualizer as ChordalGraphVisualizer };
