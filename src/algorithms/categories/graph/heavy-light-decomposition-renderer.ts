/**
 * 树链剖分与线段树维护 (Heavy-Light Decomposition - 树剖 HLD) 领域适配器
 * 进阶树论: 重儿子 size[v] 最大、重链顶点 top[u]、两遍 DFS 连续 DFN 序映射、树上路径转化为 O(log N) 个线段树连续区间 (洛谷 P3384)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  HLD_CODE_LANGUAGES,
  HLD_PROBLEM_HTML,
  HLD_ANALYSIS_HTML,
} from './heavy-light-decomposition-problem-content';
import {
  buildHLDSteps,
  type HLDStep,
} from './heavy-light-decomposition-step-compiler';
import {
  renderHLDCanvas,
  renderHLDCustomMetrics,
} from '../../../core/renderers/adapters/heavy-light-decomposition-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<HLDStep>({
  id: 'heavy-light-decomposition',
  name: '树链剖分 (Heavy-Light Decomposition)',
  viewId: 'algo-heavy-light-decomposition-view',
  category: 'graph',
  icon: '🪓',
  badge: {
    mode: '两遍 DFS + O(log N) 链跳跃',
    complexity: 'O(N) · O(log² N)',
  },
  card1Title: '🪓 树形拓扑、重链剖分与连续 DFN 序沙盘',
  card2Title: '📊 树剖状态分析器 (size, son, top, dfn, 路径区间)',
  card2Desc: '逐行对齐 DFS1 统计子树大小确立重儿子、DFS2 重儿子优先确立重链连续 DFN 及树上路径快速跳跃',
  hasDeductionTree: true,
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 重链顶点 (Top)', color: '#f59e0b' },
    { label: '👑 根节点 (Root)', state: 'discovered' },
    { label: '🟡 重边 (实线)', color: '#facc15' },
    { label: '⚪ 轻边 (虚线)', color: '#475569' },
  ],
  presets: [
    { label: '6 节点经典树', values: { 'input-preset': 'classic_6node' } },
    { label: '4 节点单链', values: { 'input-preset': 'line_4node' } },
  ],
  metrics: [
    { id: 'metric-heavy-chain', label: '重链头状态 top[]', color: '#f59e0b' },
    { id: 'metric-path-segments', label: '路径转化区间数', color: '#10b981' },
    { id: 'metric-cur-node', label: '当前分析节点', color: '#38bdf8' },
    { id: 'metric-hld-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: HLD_CODE_LANGUAGES,
  problemHtml: HLD_PROBLEM_HTML,
  analysisHtml: HLD_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_6node') as string;
    return buildHLDSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderHLDCanvas(container, step);

    const rootEl =
      container.closest('#algo-heavy-light-decomposition-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderHLDCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'heavy-light-decomposition',
  name: '树链剖分 (Heavy-Light Decomposition)',
  viewId: 'algo-heavy-light-decomposition-view',
  category: 'graph',
  description: '进阶树论经典：两遍 DFS 划分重链、重儿子优先连续 DFN 序编排、树上路径转化为连续线段树区间 (洛谷 P3384)',
  icon: '🪓',
  aliases: ['hld', 'tree-chain-decomposition', 'P3384', 'class074'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 83,
  learningGoal: '掌握重儿子判定与轻重链划分原理、两遍 DFS 连续 DFN 序映射及 O(log N) 树上路径跳跃技巧',
});

export { buildHLDSteps, type HLDStep };
export { Visualizer as HeavyLightDecompositionVisualizer };
