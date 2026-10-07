/**
 * 分成 k 份的最大乘积 - 声明式教学级沙盘渲染器
 * 核心贪心：均分定理，极差不能超过 1：b 份为 (a+1)，(k-b) 份为 a
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  MAX_PRODUCT_K_STAGE1_CODES,
  MAX_PRODUCT_K_STAGE2_CODES,
  MAX_PRODUCT_K_STAGE3_CODES,
} from './greedy-090-stage-codes';
import {
  type MaxProductKStep,
  buildMaxProductKStage1Steps,
  buildMaxProductKStage2Steps,
  buildMaxProductKStage3Steps,
} from './maximum-product-k-parts-step-compiler';
import {
  renderMaxProductKCanvas,
  renderMaxProductKCustomMetrics,
  MAX_PRODUCT_K_ANALYSIS_HTML,
} from './maximum-product-k-parts-canvas-adapter';

export type { MaxProductKStep };
export {
  buildMaxProductKStage1Steps,
  buildMaxProductKStage2Steps,
  buildMaxProductKStage3Steps,
  renderMaxProductKCanvas,
  renderMaxProductKCustomMetrics,
};

const { template } = createDeclarativeVisualizer<MaxProductKStep>({
  id: 'maximum-product-k-parts',
  name: '分成 k 份的最大乘积',
  category: 'greedy',
  icon: '📦',
  badge: { mode: '均分贪心定理', complexity: 'O(log k) · O(1)' },
  card1Title: '📊 k 份柱状能量条均分推演沙盘',
  card2Title: '📐 均值不等式与快速幂参数面板',
  card2Desc: '展示商 a、余数 b 的分配方案与极差反证过程',
  legend: [
    { label: '均分大份额 (a + 1)', color: '#10b981' },
    { label: '均分基准份额 a', color: '#3b82f6' },
    { label: '枚举/试探调整中', color: '#f59e0b' },
    { label: '极差失衡反例 (Δ >= 2)', color: '#ef4444' },
  ],
  inputs: [
    { id: 'input-n', label: '正整数 n', type: 'number', defaultValue: '14', width: '110px' },
    { id: 'input-k', label: '份数 k', type: 'number', defaultValue: '4', width: '90px' },
  ],
  presets: [
    { label: '标准用例 n=14, k=4 (3,3,4,4)', values: { 'input-n': '14', 'input-k': '4' } },
    { label: '整除用例 n=12, k=3 (4,4,4)', values: { 'input-n': '12', 'input-k': '3' } },
    { label: '大跨度用例 n=25, k=7', values: { 'input-n': '25', 'input-k': '7' } },
    { label: '边界用例 k=1 (n=9, k=1)', values: { 'input-n': '9', 'input-k': '1' } },
  ],
  metrics: [
    { id: 'total-n', label: '总数值 n', color: '#38bdf8' },
    { id: 'parts-k', label: '总份数 k', color: '#f59e0b' },
    { id: 'max-prod', label: '最大乘积结果', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力分割穷举对比',
      shortName: '暴力搜索',
      card2Desc: '枚举所有可能的第一份数值，展示指数级划分搜索空间',
      codeLanguages: MAX_PRODUCT_K_STAGE1_CODES,
      buildSteps: (inputs) => {
        const n = parseInt(inputs?.['input-n'] || '14', 10);
        const k = parseInt(inputs?.['input-k'] || '4', 10);
        return buildMaxProductKStage1Steps(n, k);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 均分贪心与快速幂推演',
      shortName: '均分贪心',
      card2Desc: '按 a = ⌊n/k⌋, b = n%k 计算，b 份为 a+1，其余为 a，快速幂求解',
      codeLanguages: MAX_PRODUCT_K_STAGE2_CODES,
      buildSteps: (inputs) => {
        const n = parseInt(inputs?.['input-n'] || '14', 10);
        const k = parseInt(inputs?.['input-k'] || '4', 10);
        return buildMaxProductKStage2Steps(n, k);
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 极差反证证明',
      shortName: '贪心证明',
      card2Desc: '代数证明任意极差 >= 2 的划分必严格劣于靠近均值的划分',
      codeLanguages: MAX_PRODUCT_K_STAGE3_CODES,
      buildSteps: (inputs) => {
        const n = parseInt(inputs?.['input-n'] || '14', 10);
        const k = parseInt(inputs?.['input-k'] || '4', 10);
        return buildMaxProductKStage3Steps(n, k);
      },
    },
  ],
  codeLanguages: MAX_PRODUCT_K_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.maximumProductKParts.html,
  analysisHtml: MAX_PRODUCT_K_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const n = parseInt(inputs?.['input-n'] || '14', 10);
    const k = parseInt(inputs?.['input-k'] || '4', 10);
    return buildMaxProductKStage2Steps(n, k);
  },
  renderCanvas: renderMaxProductKCanvas,
  renderCustomMetrics: renderMaxProductKCustomMetrics,
});

export const maximumProductKPartsRenderer = UniversalStageVisualizer;
registerAlgorithm({
  id: 'maximum-product-k-parts',
  name: '分成 k 份的最大乘积',
  viewId: 'algo-maximum-product-k-parts-view',
  category: 'greedy',
  description: '左程云算法讲解090 Code02：和为定值时均分定理，极差不能超过 1 的严格反证',
  icon: '📦',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 902,
  learningGoal: '掌握均分定理与极差大于等于 2 必劣化的代数反证法',
  aliases: ['class090-code02', 'max-product-k-parts', 'divide-k-parts'],
});
