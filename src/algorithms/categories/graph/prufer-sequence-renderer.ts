/**
 * Prufer 序列与 Cayley 公式 (Prufer Sequence · 洛谷 P6086) 领域适配器
 * 组合图论: 树到 Prufer 序列的双向一一双射、O(N) 线性双指针编解码、Cayley 定理 (洛谷 P6086)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PRUFER_CODE_LANGUAGES,
  PRUFER_PROBLEM_HTML,
  PRUFER_ANALYSIS_HTML,
} from './prufer-sequence-problem-content';
import {
  buildPruferSteps,
  type PruferStep,
} from './prufer-sequence-step-compiler';
import {
  renderPruferSequenceCanvas,
  renderPruferSequenceCustomMetrics,
} from '../../../core/renderers/adapters/prufer-sequence-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<PruferStep>({
  id: 'prufer-sequence',
  name: 'Prufer 序列与 Cayley 公式 (Prufer Sequence)',
  viewId: 'algo-prufer-sequence-view',
  category: 'graph',
  icon: '🔤',
  badge: {
    mode: 'O(N) 线性双指针双向编解码',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '🔤 树形拓扑、叶节点消除与 Prufer 序列沙盘',
  card2Title: '📊 编码多数组 (parent, deg, prufer) 监控器',
  card2Desc: '逐行对齐度数统计 deg[]、双指针定位最小叶节点、消除叶节点与父节点推入 Prufer 序列',
  hasDeductionTree: true,
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 当前最小叶子', state: 'discovered' },
    { label: '📌 父节点 (写入 Prufer)', color: '#f59e0b' },
    { label: '⚪ 树边', state: 'scanning' },
    { label: '❌ 已删除边 (红虚线)', state: 'swapping' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设树结构',
      type: 'select',
      defaultValue: 'star_4node',
      options: [
        { label: '4 节点星型图 (Prufer: [1, 1])', value: 'star_4node' },
        { label: '4 节点单链 (Prufer: [2, 3])', value: 'line_4node' },
      ],
    },
  ],
  presets: [
    { label: '4 节点星型图', values: { 'input-preset': 'star_4node' } },
    { label: '4 节点单链', values: { 'input-preset': 'line_4node' } },
  ],
  metrics: [
    { id: 'metric-cur-leaf', label: '当前删除叶子', color: '#10b981' },
    { id: 'metric-prufer-seq', label: '当前 Prufer 序列', color: '#f59e0b' },
    { id: 'metric-cayley-count', label: 'Cayley 生成树数', color: '#38bdf8' },
    { id: 'metric-prufer-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: PRUFER_CODE_LANGUAGES,
  problemHtml: PRUFER_PROBLEM_HTML,
  analysisHtml: PRUFER_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'star_4node') as string;
    return buildPruferSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderPruferSequenceCanvas(container, step);

    const rootEl =
      container.closest('#algo-prufer-sequence-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderPruferSequenceCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'prufer-sequence',
  name: 'Prufer 序列与 Cayley 公式 (Prufer Sequence)',
  viewId: 'algo-prufer-sequence-view',
  category: 'graph',
  description: '组合图论经典：无根树与 Prufer 序列的双射双向转换、O(N) 线性双指针、Cayley 公式 n^(n-2) 定理 (洛谷 P6086)',
  icon: '🔤',
  aliases: ['prufer', 'cayley', 'P6086', 'class077'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 79,
  learningGoal: '掌握 Prufer 序列与无根树的双射关系、线性双指针构造及在完全图生成树计数中的应用',
});

export { buildPruferSteps, type PruferStep };
export { Visualizer as PruferSequenceVisualizer };
