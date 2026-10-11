/**
 * 前缀优化建图 (Prefix Optimization Graph) 声明式可视化器
 * 进阶图论: 2-SAT / 前缀点前向连边链、边数由 O(N^2) 压缩至 O(N)
 * 遵循 Matt Pocock 深模块哲学与标准 4-Card 声明式沙盘架构
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PREFIX_OPT_CODE_LANGUAGES,
  PREFIX_OPT_PROBLEM_HTML,
  PREFIX_OPT_ANALYSIS_HTML,
} from './prefix-opt-graph-problem-content';
import {
  type PrefixOptStep,
  buildPrefixOptSteps,
} from './prefix-opt-graph-step-compiler';
import { renderPrefixOptGraphCanvas } from '../../../core/renderers/adapters/prefix-opt-graph-canvas-adapter';

export type { PrefixOptStep };
export { buildPrefixOptSteps };

const { template, Visualizer } = createDeclarativeVisualizer<PrefixOptStep>({
  id: 'prefix-opt-graph',
  name: '前缀优化建图 (Prefix Opt Graph)',
  category: 'graph',
  icon: '🌐',
  badge: {
    mode: '前缀虚点链边数压缩',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '🌐 原点与前缀虚点拓扑沙盘',
  card2Title: '🧭 边数对比与级联前向监视器',
  card2Desc: '前缀辅助节点 P_i、级联连边与边数压缩 O(N^2) -> O(N)',
  legend: [
    { label: '原图实体节点 (1..5)', color: '#0284c7' },
    { label: '⭐ 前缀辅助虚点 (P1..P5)', color: '#f59e0b' },
    { label: '级联链/透传边', state: 'discovered' },
    { label: '外部查询连边 (S1/S2)', color: '#ec4899' },
  ],
  inputs: [
    {
      id: 'input-opt-mode',
      label: '建图模式',
      type: 'select',
      defaultValue: 'prefix',
      options: [
        { label: '⚡ 前缀优化建图 O(N)', value: 'prefix' },
        { label: '❌ 朴素两两连边 O(N^2)', value: 'naive' },
      ],
      width: '180px',
    },
  ],
  presets: [
    { label: '前缀优化建图 O(N)', values: { 'input-opt-mode': 'prefix' } },
    { label: '朴素两两连边 O(N^2)', values: { 'input-opt-mode': 'naive' } },
  ],
  metrics: [
    { id: 'metric-opt-mode', label: '建图方案', color: '#2563eb' },
    { id: 'metric-edge-count', label: '总边数', color: '#10b981' },
    { id: 'metric-cur-op', label: '当前操作', color: '#f59e0b' },
    { id: 'metric-compression-ratio', label: '压缩效益', color: '#ec4899' },
  ],
  codeLanguages: PREFIX_OPT_CODE_LANGUAGES,
  problemHtml: PREFIX_OPT_PROBLEM_HTML,
  analysisHtml: PREFIX_OPT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const mode = (inputs['input-opt-mode'] || 'prefix') as 'naive' | 'prefix';
    return buildPrefixOptSteps(mode);
  },
  renderCanvas: renderPrefixOptGraphCanvas,
});

registerAlgorithm({
  id: 'prefix-opt-graph',
  name: '前缀优化建图 (Prefix Opt Graph)',
  viewId: 'algo-prefix-opt-graph-view',
  category: 'graph',
  description: '进阶图论建图优化：前缀虚点链级联传递、区间连边由 O(N^2) 稠密压缩至 O(N) 线性边数 (2-SAT 优化)',
  icon: '🌐',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 69,
  learningGoal: '掌握前缀优化建图的虚点级联构造法、2-SAT 命题前缀约束与边数线性压缩技巧',
});

export { Visualizer as PrefixOptGraphVisualizer };
