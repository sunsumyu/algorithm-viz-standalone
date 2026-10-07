/**
 * 吃掉 N 个橘子的最少天数 (LeetCode 1553) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  EAT_ORANGES_STAGE1_CODES,
  EAT_ORANGES_STAGE2_CODES,
  EAT_ORANGES_STAGE3_CODES,
} from './greedy-089-stage-codes';
import {
  EatOrangesStep,
  buildEatOrangesStage1Steps,
  buildEatOrangesStage2Steps,
  buildEatOrangesStage3Steps,
  parseEatOrangesInput,
} from './minimum-eat-oranges-step-compiler';
import {
  renderEatOrangesCanvas,
  renderEatOrangesMetrics,
} from './minimum-eat-oranges-canvas-adapter';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';

export type {
  EatOrangesStep,
};
export {
  buildEatOrangesStage1Steps,
  buildEatOrangesStage2Steps,
  buildEatOrangesStage3Steps,
  parseEatOrangesInput,
};

const { template, Visualizer } = createDeclarativeVisualizer<EatOrangesStep>({
  id: 'minimum-eat-oranges',
  name: '吃橘子的最少天数 (Eat Oranges)',
  category: 'greedy',
  icon: '🍊',
  badge: { mode: '贪心跨步+记忆化', complexity: 'O((log N)²) · O((log N)²)' },
  card1Title: '🌳 递归决策展开树与跳跃沙盘',
  card2Title: '🗄️ 记忆化缓存表与分支收益看板',
  card2Desc: '展示 memo 哈希剪枝表与除以 2 / 除以 3 的天平比对',
  legend: [
    { label: '活跃节点', color: '#3b82f6' },
    { label: '已求解节点', color: '#10b981' },
    { label: '剪枝命中节点', color: '#94a3b8' },
  ],
  inputs: [
    {
      id: 'input-n',
      label: '橘子数量 N',
      type: 'number',
      defaultValue: 10,
      width: '90px',
      placeholder: '整数 N',
    },
  ],
  presets: [
    { label: '经典示例: N=10', values: { 'input-n': 10 } },
    { label: '三倍数测试: N=6', values: { 'input-n': 6 } },
    { label: '质数测试: N=11', values: { 'input-n': 11 } },
  ],
  metrics: [
    { id: 'target-n', label: '剩余橘子数', color: '#f59e0b' },
    { id: 'memo-count', label: '记忆表大小', color: '#3b82f6' },
    { id: 'final-days', label: '最少天数', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力对比',
      shortName: '暴力递归',
      card2Desc: '展示逐个吃橘子的深度 O(N) 递归树退化与状态爆炸',
      codeLanguages: EAT_ORANGES_STAGE1_CODES,
      buildSteps: (inputs) => parseEatOrangesInput(inputs, 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 贪心跨步推演',
      shortName: '跨步贪心',
      card2Desc: '通过 (n%2)+1+f(n/2) 与 (n%3)+1+f(n/3) 极速跳跃，树深降至 O(log N)',
      codeLanguages: EAT_ORANGES_STAGE2_CODES,
      buildSteps: (inputs) => parseEatOrangesInput(inputs, 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 贪心证明',
      shortName: '贪心证明',
      card2Desc: '代数证明连续吃 1 严格劣于跨步整除跳跃',
      codeLanguages: EAT_ORANGES_STAGE3_CODES,
      buildSteps: (inputs) => parseEatOrangesInput(inputs, 3),
    },
  ],
  codeLanguages: EAT_ORANGES_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.minimumEatOranges.html,
  buildSteps: (inputs) => parseEatOrangesInput(inputs, 2),
  renderCanvas: renderEatOrangesCanvas,
  renderCustomMetrics: renderEatOrangesMetrics,
});

export const MinimumEatOrangesVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'minimum-eat-oranges',
  name: '吃橘子的最少天数 (Eat Oranges)',
  viewId: 'algo-minimum-eat-oranges-view',
  category: 'greedy',
  description: '左程云算法讲解089 Code04：LeetCode 1553 吃掉N个橘子的最少天数，贪心跨步整除飞跃与记忆化剪枝',
  icon: '🍊',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 893,
  learningGoal: '掌握贪心策略如何大幅压缩递归搜索状态空间，理解 (n%2+1) 跨步跳跃的数学本质',
  aliases: ['class089-code03', 'minimum-eat-oranges-1553', 'leetcode-1553'],
});
