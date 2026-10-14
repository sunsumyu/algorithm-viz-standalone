/**
 * 树上启发式合并 (DSU on Tree · CF600E) 领域适配器
 * 进阶树论: 树链剖分重儿子保留 (keep=true)、轻儿子子树清除 (keep=false)、O(N log N) 极速统计 (CF600E)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DSU_ON_TREE_CODE_LANGUAGES,
  DSU_ON_TREE_PROBLEM_HTML,
  DSU_ON_TREE_ANALYSIS_HTML,
} from './dsu-on-tree-problem-content';
import {
  buildDSUOnTreeSteps,
  type DSUTreeStep,
} from './dsu-on-tree-step-compiler';
import {
  renderDSUOnTreeCanvas,
  renderDSUOnTreeCustomMetrics,
} from '../../../core/renderers/adapters/dsu-on-tree-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<DSUTreeStep>({
  id: 'dsu-on-tree',
  name: '树上启发式合并 (DSU on Tree)',
  viewId: 'algo-dsu-on-tree-view',
  category: 'graph',
  icon: '🌳',
  badge: {
    mode: '重链剖分 + 启发式合并',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🌳 树形拓扑与重儿子链沙盘',
  card2Title: '📊 DSU 多数组 (sz, son, cnt, ans) 实时监控器',
  card2Desc: '逐行对齐重儿子子树保留 (keep=true)、轻儿子回溯清空 (keep=false) 与颜色频次桶更新',
  hasDeductionTree: true,
  legend: [
    { label: '普通轻节点', color: '#1e3a8a' },
    { label: '👑 重儿子 (Heavy Son)', color: '#f59e0b' },
    { label: '🟢 活跃操作子树', state: 'discovered' },
    { label: '🟡 重边 (实线)', color: '#facc15' },
    { label: '⚪ 轻边 (虚线)', color: '#475569' },
  ],
  presets: [
    { label: '4 节点经典树', values: { 'input-preset': 'classic_4node' } },
    { label: '3 节点星形树', values: { 'input-preset': 'simple_star' } },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前焦点节点', color: '#38bdf8' },
    { id: 'metric-keep-status', label: '数据保留状态', color: '#10b981' },
    { id: 'metric-heavy-son', label: '当前点重儿子', color: '#f59e0b' },
    { id: 'metric-dsu-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: DSU_ON_TREE_CODE_LANGUAGES,
  problemHtml: DSU_ON_TREE_PROBLEM_HTML,
  analysisHtml: DSU_ON_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node') as string;
    return buildDSUOnTreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderDSUOnTreeCanvas(container, step);

    const rootEl =
      container.closest('#algo-dsu-on-tree-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderDSUOnTreeCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'dsu-on-tree',
  name: '树上启发式合并 (DSU on Tree)',
  viewId: 'algo-dsu-on-tree-view',
  category: 'graph',
  description: '进阶树论经典：树链剖分重儿子保留、轻儿子子树清除、O(N log N) 极速子树信息统计 (CF600E)',
  icon: '🌳',
  aliases: ['dsu-tree', 'sack', 'CF600E', 'U41492', 'class075'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 69,
  learningGoal: '掌握 DSU on Tree 算法思想、重轻链剖分性质及如何在 O(N log N) 内离线求解子树问题',
});

export { buildDSUOnTreeSteps, type DSUTreeStep };
export { Visualizer as DSUOnTreeVisualizer };
