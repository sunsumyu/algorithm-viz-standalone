/**
 * 砍竹子 II (剪绳子 II / 整数拆分) - 声明式教学级沙盘渲染器
 * 核心贪心：优先拆 3，余 1 借 3 化 2×2，余 2 留 2
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  CUTTING_BAMBOO_STAGE1_CODES,
  CUTTING_BAMBOO_STAGE2_CODES,
  CUTTING_BAMBOO_STAGE3_CODES,
} from './greedy-090-stage-codes';
import {
  type BambooStep,
  buildBambooStage1Steps,
  buildBambooStage2Steps,
  buildBambooStage3Steps,
} from './cutting-bamboo-step-compiler';
import {
  renderBambooCanvas,
  renderBambooCustomMetrics,
  CUTTING_BAMBOO_ANALYSIS_HTML,
} from './cutting-bamboo-canvas-adapter';

export type { BambooStep };
export {
  buildBambooStage1Steps,
  buildBambooStage2Steps,
  buildBambooStage3Steps,
  renderBambooCanvas,
  renderBambooCustomMetrics,
};

const { template } = createDeclarativeVisualizer<BambooStep>({
  id: 'cutting-bamboo',
  name: '砍竹子 II (剪绳子 II)',
  category: 'greedy',
  icon: '🎋',
  badge: { mode: '贪心拆3与快速幂', complexity: 'O(log n) · O(1)' },
  card1Title: '📏 竹子/绳子切分条形动态沙盘',
  card2Title: '🧮 贪心决策公式与模运算监视器',
  card2Desc: '展示竹子各段切割比例、快速幂乘积推演与余数修正',
  legend: [
    { label: '长度 3 竹段 (最优)', color: '#10b981' },
    { label: '长度 2 竹段 (次优)', color: '#3b82f6' },
    { label: '首刀/试探切分段', color: '#f59e0b' },
    { label: '全长/未切分段', color: '#64748b' },
  ],
  inputs: [
    { id: 'input-n', label: '竹子总长 n', type: 'number', defaultValue: '10', width: '120px' },
  ],
  presets: [
    { label: '经典用例 n=10 (拆 3,3,4)', values: { 'input-n': '10' } },
    { label: '余数 0 用例 n=12 (全拆 3)', values: { 'input-n': '12' } },
    { label: '余数 2 用例 n=11 (拆 3,3,3,2)', values: { 'input-n': '11' } },
    { label: '小规模边界 n=2', values: { 'input-n': '2' } },
    { label: '小规模边界 n=3', values: { 'input-n': '3' } },
    { label: '大规模测试 n=58', values: { 'input-n': '58' } },
  ],
  metrics: [
    { id: 'bamboo-len', label: '当前竹子总长', color: '#38bdf8' },
    { id: 'parts-count', label: '总切分段数', color: '#f59e0b' },
    { id: 'final-product', label: '最终乘积结果', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力分割穷举对比',
      shortName: '暴力穷举',
      card2Desc: '小规模深度优先搜索，展示所有切分组合的乘积爆炸',
      codeLanguages: CUTTING_BAMBOO_STAGE1_CODES,
      buildSteps: (inputs) => buildBambooStage1Steps(parseInt(inputs?.['input-n'] || '10', 10)),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 尽力拆 3 与快速幂推演',
      shortName: '贪心拆3',
      card2Desc: '尽全力拆分成 3，对模 3 的余数退换修正，利用快速幂极速收敛',
      codeLanguages: CUTTING_BAMBOO_STAGE2_CODES,
      buildSteps: (inputs) => buildBambooStage2Steps(parseInt(inputs?.['input-n'] || '10', 10)),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 连续极值与驻点证明',
      shortName: '贪心证明',
      card2Desc: '由 f(x)=x^(1/x) 驻点 x=e 与 3^2 > 2^3 代数推导贪心全局最优性',
      codeLanguages: CUTTING_BAMBOO_STAGE3_CODES,
      buildSteps: (inputs) => buildBambooStage3Steps(parseInt(inputs?.['input-n'] || '10', 10)),
    },
  ],
  codeLanguages: CUTTING_BAMBOO_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.cuttingBamboo.html,
  analysisHtml: CUTTING_BAMBOO_ANALYSIS_HTML,
  buildSteps: (inputs) => buildBambooStage2Steps(parseInt(inputs?.['input-n'] || '10', 10)),
  renderCanvas: renderBambooCanvas,
  renderCustomMetrics: renderBambooCustomMetrics,
});

export const cuttingBambooRenderer = UniversalStageVisualizer;
registerAlgorithm({
  id: 'cutting-bamboo',
  name: '砍竹子 II (剪绳子 II)',
  viewId: 'algo-cutting-bamboo-view',
  category: 'greedy',
  description: '左程云算法讲解090 Code01：LeetCode 343 / 剑指 Offer 14-II 尽力拆 3 与快速幂取模运算',
  icon: '🎋',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 901,
  learningGoal: '掌握均值不等式与导数极值驻点离散化为拆 3 的数学本质',
  aliases: ['class090-code01', 'cutting-bamboo-343', 'leetcode-343', 'integer-break-ii'],
});
