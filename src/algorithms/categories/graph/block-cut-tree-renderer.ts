/**
 * 广义圆方树 (Block-Cut Tree / Round-Square Tree) 领域适配器
 * 进阶树论: 点双连通分量 (v-BCC) 缩点、圆点代表原图节点、方点代表点双、树上必经割点 (洛谷 P4320 / P4630)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BLOCK_CUT_TREE_CODE_LANGUAGES,
  BLOCK_CUT_TREE_PROBLEM_HTML,
  BLOCK_CUT_TREE_ANALYSIS_HTML,
} from './block-cut-tree-problem-content';
import {
  buildBlockCutTreeSteps,
  type BlockCutStep,
} from './block-cut-tree-step-compiler';
import {
  renderBlockCutTreeCanvas,
  renderBlockCutTreeCustomMetrics,
} from '../../../core/renderers/adapters/block-cut-tree-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<BlockCutStep>({
  id: 'block-cut-tree',
  name: '广义圆方树 (Block-Cut Tree)',
  viewId: 'algo-block-cut-tree-view',
  category: 'graph',
  icon: '🔲',
  badge: {
    mode: '点双连通分量 + 圆方相间连边',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🔲 原图拓扑与广义圆方相间二分树沙盘',
  card2Title: '📊 圆方树多数组 (dfn, low, 栈, 割点) 监控器',
  card2Desc: '逐行对齐 Tarjan 求点双连通分量 (v-BCC)、新建方点并弹栈连边、割点判定及圆方树上必经点转化',
  hasDeductionTree: true,
  legend: [
    { label: '⚪ 原图圆点 (节点)', color: '#1e3a8a' },
    { label: '🔲 点双方点 (BCC)', color: '#f59e0b' },
    { label: '🔴 必经割点', state: 'swapping' },
    { label: '🟢 圆方树边 (实线)', state: 'discovered' },
    { label: '⚪ 原图边 (虚线)', color: '#475569' },
  ],
  presets: [
    { label: '6 节点经典图', values: { 'input-preset': 'classic_6node' } },
    { label: '4 节点简单图', values: { 'input-preset': 'simple_4node' } },
  ],
  metrics: [
    { id: 'metric-round-count', label: '原图圆点数', color: '#38bdf8' },
    { id: 'metric-square-count', label: '点双方点数', color: '#f59e0b' },
    { id: 'metric-cut-vertices', label: '全图割点集', color: '#ef4444' },
    { id: 'metric-bct-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: BLOCK_CUT_TREE_CODE_LANGUAGES,
  problemHtml: BLOCK_CUT_TREE_PROBLEM_HTML,
  analysisHtml: BLOCK_CUT_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_6node') as string;
    return buildBlockCutTreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderBlockCutTreeCanvas(container, step);

    const rootEl =
      container.closest('#algo-block-cut-tree-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderBlockCutTreeCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'block-cut-tree',
  name: '广义圆方树 (Block-Cut Tree)',
  viewId: 'algo-block-cut-tree-view',
  category: 'graph',
  description: '进阶树论经典：点双连通分量 (v-BCC) 缩点、圆方相间连边成树、树上必经点定理转化 (洛谷 P4320)',
  icon: '🔲',
  aliases: ['bct', 'round-square-tree', 'P4320', 'P4630', 'P5236'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 84,
  learningGoal: '掌握广义圆方树构建算法、low[v] >= dfn[u] 点双识别判定及圆方树树上必经割点定理',
});

export { buildBlockCutTreeSteps, type BlockCutStep };
export { Visualizer as BlockCutTreeVisualizer };
