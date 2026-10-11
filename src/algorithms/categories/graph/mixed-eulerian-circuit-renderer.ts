/**
 * 混合图欧拉回路与网络流定向 (Mixed Eulerian Circuit - POJ 1637) — 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 步进推演委托至 MixedEulerianCircuitStepCompiler
 * 拓扑沙盘与满流监控委托至 MixedEulerianCircuitCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MIXED_EULER_CODE_LANGUAGES,
  MIXED_EULER_PROBLEM_HTML,
  MIXED_EULER_ANALYSIS_HTML,
} from './mixed-eulerian-circuit-problem-content';
import {
  buildMixedEulerSteps,
  type MixedEulerStep,
} from './mixed-eulerian-circuit-step-compiler';
import {
  renderMixedEulerianCircuitCanvas,
  renderMixedEulerianCircuitCustomMetrics,
} from '../../../core/renderers/adapters/mixed-eulerian-circuit-canvas-adapter';

const { Visualizer } = registerDeclarativeAlgorithm({
  id: 'mixed-eulerian-circuit',
  name: '混合图欧拉回路 (Mixed Eulerian Circuit)',
  category: 'graph',
  description: '进阶网络流经典建模：任意初始定向、出入度差额 D[u]、Dinic 最大流调整方向与满流回路判定 (POJ 1637)',
  icon: '🔄',
  difficulty: 3,
  levelOrder: 71,
  learningGoal: '掌握混合图欧拉回路转化为网络流最大流的建模技巧、奇偶性判别及残量网络边反转重构回路',
  aliases: ['mixed-euler', 'poj-1637'],
  card1Title: '混合图初始定向与边反转沙盘',
  card2Title: '入出度差额与满流监视器',
  card2Desc: '无向边初始方向、差额 D[u]=(in-out)/2 与网络流反向调整',
  inputs: [
    {
      id: 'input-solvable',
      label: '用例模式',
      type: 'select',
      defaultValue: 'solvable',
      options: [
        { label: '标准可行混合图 (POJ 1637)', value: 'solvable' },
        { label: '奇偶不符无解图', value: 'unsolvable' },
      ],
      width: '180px',
    },
  ],
  presets: [
    { label: '标准可行混合图 (POJ 1637)', values: { 'input-solvable': 'solvable' } },
    { label: '奇偶不符无解图', values: { 'input-solvable': 'unsolvable' } },
  ],
  metrics: [
    { id: 'metric-deg-diff', label: '出入度差额 D[u]', color: '#f59e0b' },
    { id: 'metric-flow', label: '最大流推流 / 目标', color: '#2563eb' },
    { id: 'metric-euler-status', label: '欧拉回路判定', color: '#10b981' },
    { id: 'metric-flipped-count', label: '反转边数量', color: '#a855f7' },
  ],
  codeLanguages: MIXED_EULER_CODE_LANGUAGES,
  problemHtml: MIXED_EULER_PROBLEM_HTML,
  analysisHtml: MIXED_EULER_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const isSolvable = (inputs['input-solvable'] || 'solvable') === 'solvable';
    return buildMixedEulerSteps(isSolvable);
  },
  renderCanvas: (container, step) => renderMixedEulerianCircuitCanvas(container, step as MixedEulerStep),
  renderCustomMetrics: (container, step) => renderMixedEulerianCircuitCustomMetrics(container, step as MixedEulerStep),
});

export { Visualizer as MixedEulerianCircuitVisualizer, buildMixedEulerSteps, type MixedEulerStep };
