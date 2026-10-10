/**
 * 欧拉回路与欧拉路径 (Eulerian Circuit & Path - Hierholzer 算法) 领域适配器
 * 进阶图论: Hierholzer 深度优先搜索 + 当前弧优化删边 + 死胡同回溯压栈倒序输出 (洛谷 P7771 / LeetCode 332)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  EULERIAN_CIRCUIT_CODE_LANGUAGES,
  EULERIAN_CIRCUIT_PROBLEM_HTML,
  EULERIAN_CIRCUIT_ANALYSIS_HTML,
} from './eulerian-circuit-problem-content';
import {
  buildEulerianCircuitSteps,
  type EulerianStep,
} from './eulerian-circuit-step-compiler';
import {
  renderEulerianCircuitCanvas,
  renderEulerianCircuitCustomMetrics,
} from '../../../core/renderers/adapters/eulerian-circuit-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<EulerianStep>({
  id: 'eulerian-circuit',
  name: '欧拉回路 (Eulerian Circuit - Hierholzer)',
  viewId: 'algo-eulerian-circuit-view',
  category: 'graph',
  icon: '🔄',
  badge: {
    mode: 'Hierholzer 深度优先 · 当前弧删边优化',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🔄 有向图拓扑与一笔画欧拉轨迹舱',
  card2Title: '📊 Hierholzer 状态监视器 (head, 出度, 栈, path)',
  card2Desc: '展示当前弧 head[u] 动态删边、递归调用栈与死胡同回溯倒序构建欧拉回路全过程',
  hasDeductionTree: true,
  legend: [
    { label: '⚡ 当前遍历活跃顶点', color: '#f59e0b' },
    { label: '✔ 已完整走过的有向边', state: 'discovered' },
    { label: '⚪ 待访问边', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_4node',
      options: [
        { label: '4 节点经典回路 (1->2->3->4->1 一笔画)', value: 'classic_4node' },
        { label: '3 节点环形回路 (1->2->3->1 一笔画)', value: 'simple_triangle' },
      ],
    },
  ],
  presets: [
    { label: '4 节点环路', values: { 'input-preset': 'classic_4node' } },
    { label: '3 节点环路', values: { 'input-preset': 'simple_triangle' } },
  ],
  metrics: [
    { id: 'metric-euler-status', label: '图连通与度数', color: '#10b981' },
    { id: 'metric-euler-path', label: '当前回路轨迹', color: '#38bdf8' },
    { id: 'metric-euler-cur', label: '当前考察顶点', color: '#f59e0b' },
    { id: 'metric-euler-stack', label: 'DFS 活跃调用栈', color: '#a855f7' },
  ],
  codeLanguages: EULERIAN_CIRCUIT_CODE_LANGUAGES,
  problemHtml: EULERIAN_CIRCUIT_PROBLEM_HTML,
  analysisHtml: EULERIAN_CIRCUIT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node') as string;
    return buildEulerianCircuitSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderEulerianCircuitCanvas(container, step);

    const rootEl =
      container.closest('#algo-eulerian-circuit-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderEulerianCircuitCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'eulerian-circuit',
  name: '欧拉回路 (Eulerian Circuit - Hierholzer)',
  viewId: 'algo-eulerian-circuit-view',
  category: 'graph',
  description: '进阶图论经典：有向图欧拉回路求解、出入度平衡判定、当前弧优化删边与死胡同回溯压栈 (洛谷 P7771)',
  icon: '🔄',
  aliases: ['eulerian-path', 'hierholzer', 'P7771', 'leetcode-332', 'class067'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 74,
  learningGoal: '掌握 Hierholzer 欧拉回路算法思想、度数守恒判定、当前弧动态删边技巧与后序倒序输出原理',
});

export { buildEulerianCircuitSteps, type EulerianStep };
export { Visualizer as EulerianCircuitVisualizer };
