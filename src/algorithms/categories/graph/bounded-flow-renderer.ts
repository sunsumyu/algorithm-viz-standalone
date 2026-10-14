/**
 * 上下界网络流与循环流 (Bounded Flow / Feasible Circulation) 领域适配器
 * 进阶网络流: 每条边强制流量 [low, up]、差额网络与超级源汇 SS/TT 平衡、满流判定定理 (LOJ 115 / 洛谷 P5192)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BOUNDED_FLOW_CODE_LANGUAGES,
  BOUNDED_FLOW_PROBLEM_HTML,
  BOUNDED_FLOW_ANALYSIS_HTML,
} from './bounded-flow-problem-content';
import {
  buildBoundedFlowSteps,
  type BoundedFlowStep,
} from './bounded-flow-step-compiler';
import {
  renderBoundedFlowCanvas,
  renderBoundedFlowCustomMetrics,
} from '../../../core/renderers/adapters/bounded-flow-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<BoundedFlowStep>({
  id: 'bounded-flow',
  name: '上下界网络流 (Bounded Flow)',
  category: 'graph',
  icon: '🚰',
  badge: {
    mode: '差额网络 + 超级源汇满流',
    complexity: 'O(V² E) · O(V + E)',
  },
  card1Title: '🚰 上下界差额网络与超级源汇沙盘',
  card2Title: '📊 差额与推流监控器 (delta, level, superFlow)',
  card2Desc: '逐行对齐上下界强制底流扣减、超级源汇补流边连接、Dinic 伴随网络推流与满流充要判定',
  hasDeductionTree: true,
  legend: [
    { label: '原图实体节点', color: '#1e3a8a' },
    { label: '⭐ 超级源汇 SS/TT', color: '#f59e0b' },
    { label: '🟢 满足下界流量边', state: 'discovered' },
    { label: '🟣 超级补流边', color: '#8b5cf6' },
  ],
  presets: [
    { label: '4 节点环路', values: { 'input-preset': 'four-nodes' } },
    { label: '3 节点三角形', values: { 'input-preset': 'triangle' } },
  ],
  metrics: [
    { id: 'cur-phase', label: '算法当前阶段', color: '#a855f7' },
    { id: 'super-flow', label: '伴随网络满流目标', color: '#f59e0b' },
    { id: 'feasible-status', label: '可行流判定结果', color: '#10b981' },
  ],
  codeLanguages: BOUNDED_FLOW_CODE_LANGUAGES,
  problemHtml: BOUNDED_FLOW_PROBLEM_HTML,
  analysisHtml: BOUNDED_FLOW_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'four-nodes') as string;
    return buildBoundedFlowSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderBoundedFlowCanvas(container, step);

    const root =
      container.closest('#algo-bounded-flow-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (root) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = root.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderBoundedFlowCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'bounded-flow',
  name: '上下界网络流 (Bounded Flow)',
  viewId: 'algo-bounded-flow-view',
  category: 'graph',
  description: '进阶网络流经典：边强制流量下界约束、差额网络构建、超级源汇 SS/TT 满流判定可行流 (LOJ 115)',
  icon: '🚰',
  aliases: ['bounded-flow-circulation', 'feasible-circulation', 'LOJ115', 'P5192'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 72,
  learningGoal: '掌握上下界网络流差额建模技巧、底流扣减定理及伴随网络满流充要判定方法',
});

export { buildBoundedFlowSteps, type BoundedFlowStep };
export { Visualizer as BoundedFlowVisualizer };
