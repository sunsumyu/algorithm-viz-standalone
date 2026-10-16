/**
 * 弦图判定与 MCS 最大势算法 (Chordal Graph & Maximum Cardinality Search · 洛谷 P3199)
 * 统一收敛至单一事实来源：src/algorithms/categories/advanced-topics/advanced-173-178/chordal-graph-mcs-renderer
 * 本文件保留 Visualizer 构造类与步骤编译器供伴生单测使用，注销重复 catalog 注册
 */

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
    { id: 'metric-peo-len', label: '已确定 PEO 长度', color: '#10b981' },
    { id: 'metric-cur-max-node', label: '当前最大势节点', color: '#f59e0b' },
    { id: 'metric-max-label', label: '当前最大势能值', color: '#38bdf8' },
    { id: 'metric-chordal-status', label: '判定状态', color: '#a855f7' },
  ],
  codeLanguages: CHORDAL_GRAPH_CODE_LANGUAGES,
  problemHtml: CHORDAL_GRAPH_PROBLEM_HTML,
  analysisHtml: CHORDAL_GRAPH_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const graphType = (inputs['input-graph-type'] || 'chordal') as 'chordal' | 'non-chordal';
    return buildChordalGraphSteps(graphType);
  },
  renderCanvas: renderChordalGraphCanvas,
  renderCustomMetrics: renderChordalGraphCustomMetrics,
});

export { Visualizer as ChordalGraphVisualizer };
