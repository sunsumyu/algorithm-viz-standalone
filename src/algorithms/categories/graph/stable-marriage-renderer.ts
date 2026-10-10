/**
 * 稳定婚姻匹配 (Stable Marriage - Gale-Shapley 延迟接受算法) 声明式可视化器
 * 进阶匹配理论: 男士主动求婚、女士择优暂留、严格无不稳定阻碍对 (洛谷 P4867 / 诺贝尔经济学奖算法)
 * 遵循 Matt Pocock 深模块规范，委托 StepCompiler、CanvasAdapter 与 DeductionTree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  STABLE_MARRIAGE_CODE_LANGUAGES,
  STABLE_MARRIAGE_PROBLEM_HTML,
  STABLE_MARRIAGE_ANALYSIS_HTML,
} from './stable-marriage-problem-content';
import {
  buildStableMarriageSteps,
  type MarriageStep,
} from './stable-marriage-step-compiler';
import {
  renderStableMarriageCanvas,
  renderStableMarriageCustomMetrics,
} from '../../../core/renderers/adapters/stable-marriage-canvas-adapter';

export { buildStableMarriageSteps, type MarriageStep };

const { template, Visualizer } = createDeclarativeVisualizer<MarriageStep>({
  id: 'stable-marriage',
  name: '稳定婚姻匹配 (Stable Marriage - Gale-Shapley)',
  viewId: 'algo-stable-marriage-view',
  category: 'graph',
  icon: '💍',
  badge: {
    mode: '男士主动求婚 + 女士择优暂留',
    complexity: 'O(N²) · O(N²)',
  },
  card1Title: '💍 男女偏好拓扑、求婚协商与婚约沙盘',
  card2Title: '📊 婚约状态监视器 (husband, wife, nextPropose)',
  card2Desc: '逐行对齐男士出队求婚、O(1) 查表偏好比对、移情别恋反悔与无不稳定阻碍对定理',
  hasDeductionTree: true,
  legend: [
    { label: '男士节点 (M1..Mn)', color: '#1e3a8a' },
    { label: '女士节点 (W1..Wn)', color: '#831843' },
    { label: '🟢 确立婚约 (实线)', state: 'discovered' },
    { label: '🟡 正在求婚 (金色)', color: '#facc15' },
    { label: '🔴 婉拒求婚 (红色)', state: 'swapping' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设偏好网络',
      type: 'select',
      defaultValue: 'classic_3pair',
      options: [
        { label: '3 对经典偏好 (W1:M2, W2:M1, W3:M3)', value: 'classic_3pair' },
        { label: '4 对循环偏好 (4 对完全匹配)', value: 'cyclic_4pair' },
      ],
    },
  ],
  presets: [
    { label: '3 对偏好', values: { 'input-preset': 'classic_3pair' } },
    { label: '4 对偏好', values: { 'input-preset': 'cyclic_4pair' } },
  ],
  metrics: [
    { id: 'metric-cur-prop', label: '当前求婚动作', color: '#facc15' },
    { id: 'metric-matched-pairs', label: '已缔结婚约数', color: '#10b981' },
    { id: 'metric-free-men', label: '单身男士队列', color: '#38bdf8' },
    { id: 'metric-marriage-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: STABLE_MARRIAGE_CODE_LANGUAGES,
  problemHtml: STABLE_MARRIAGE_PROBLEM_HTML,
  analysisHtml: STABLE_MARRIAGE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_3pair') as string;
    return buildStableMarriageSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderStableMarriageCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderStableMarriageCustomMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'stable-marriage',
  name: '稳定婚姻匹配 (Stable Marriage - Gale-Shapley)',
  viewId: 'algo-stable-marriage-view',
  category: 'graph',
  description: '博弈论与匹配经典：男士逐轮求婚、女士择优暂留、证明必定收敛且无不稳定阻碍对 (诺贝尔经济学奖算法)',
  icon: '💍',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 91,
  learningGoal: '掌握 Gale-Shapley 延迟接受算法机制、女士反悔移情逻辑及无不稳定阻碍对定理',
});

export { Visualizer as StableMarriageVisualizer };
