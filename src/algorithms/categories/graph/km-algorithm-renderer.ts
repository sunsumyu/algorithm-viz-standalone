/**
 * 二分图最大权完美匹配与 KM 算法 (Kuhn-Munkres Algorithm)
 * 统一收敛至单一事实来源：src/algorithms/categories/advanced-topics/advanced-173-178/km-matching-renderer
 * 本文件保留 Visualizer 构造类与步骤编译器供伴生单测使用，注销重复 catalog 注册
 */

import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { type KMStep, buildKMSteps } from './km-algorithm-step-compiler';
import { renderKMAlgorithmCanvas } from '../../../core/renderers/adapters/km-algorithm-canvas-adapter';
import {
  KM_ALGORITHM_CODE_LANGUAGES,
  KM_ALGORITHM_PROBLEM_HTML,
  KM_ALGORITHM_ANALYSIS_HTML,
} from './km-algorithm-problem-content';

export type { KMStep };
export { buildKMSteps, renderKMAlgorithmCanvas };

const { template, Visualizer } = createDeclarativeVisualizer<KMStep>({
  id: 'km-algorithm',
  name: 'KM 算法 (Kuhn-Munkres Algorithm)',
  category: 'graph',
  aliases: ['km', 'kuhn-munkres', 'class073', 'P6577'],
  hasDeductionTree: true,
  icon: '💘',
  difficulty: 3,
  levelOrder: 86,
  learningGoal: '深刻理解顶标理论、相等子图增广判定以及松弛变量 slack[] 顶标调整法则',
  badge: {
    mode: '二分图最佳完备匹配 · 顶标理论 · 相等子图',
    complexity: 'O(N³) · O(N²)',
  },
  card1Title: '💘 二分图最大权完美匹配与相等子图沙盘',
  card2Title: '📊 KM 顶标与松弛监视器 (lx, ly, slack, match)',
  card2Desc: '展示左顶标 lx、右顶标 ly、松弛变量 slack 以及相等子图增广翻转全流程',
  legend: [
    { label: '🔵 左部节点 L', color: '#0284c7' },
    { label: '🌸 右部节点 R', color: '#db2777' },
    { label: '🟢 最佳匹配边', state: 'discovered' },
    { label: '⚡ 当前探查边', color: '#f59e0b' },
    { label: '⚪ 相等子图备选边', color: '#475569' },
  ],
  presets: [
    { label: '标准 3x3 (ans=12)', values: { 'input-preset': 'standard' } },
    { label: '简单 2x2 (ans=18)', values: { 'input-preset': 'simple' } },
  ],
  metrics: [
    { id: 'metric-km-weight', label: '当前匹配总权值', color: '#10b981' },
    { id: 'metric-km-matched', label: '完备匹配对数', color: '#38bdf8' },
    { id: 'metric-km-slack', label: '顶标调整量 d', color: '#f59e0b' },
    { id: 'metric-km-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: KM_ALGORITHM_CODE_LANGUAGES,
  problemHtml: KM_ALGORITHM_PROBLEM_HTML,
  analysisHtml: KM_ALGORITHM_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'standard') as string;
    return buildKMSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderKMAlgorithmCanvas(container, step);
  },
});

export { Visualizer as KMAlgorithmVisualizer };
