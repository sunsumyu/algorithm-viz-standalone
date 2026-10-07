/**
 * 两地调度 (LeetCode 1029) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  TWO_CITY_STAGE1_CODES,
  TWO_CITY_STAGE2_CODES,
  TWO_CITY_STAGE3_CODES,
} from './greedy-089-stage-codes';
import {
  PersonCost,
  TwoCityStep,
  buildTwoCityStage1Steps,
  buildTwoCityStage2Steps,
  buildTwoCityStage3Steps,
  parseTwoCityInput,
} from './two-city-scheduling-step-compiler';
import {
  renderTwoCityCanvas,
  renderTwoCityMetrics,
} from './two-city-scheduling-canvas-adapter';

export type {
  PersonCost,
  TwoCityStep,
};
export {
  buildTwoCityStage1Steps,
  buildTwoCityStage2Steps,
  buildTwoCityStage3Steps,
  parseTwoCityInput,
};

const { template, Visualizer } = createDeclarativeVisualizer<TwoCityStep>({
  id: 'two-city-scheduling',
  name: '两地调度 (Two City Scheduling)',
  category: 'greedy',
  icon: '✈️',
  badge: { mode: '差额排序贪心', complexity: 'O(N log N) · O(1)' },
  card1Title: '🏙️ 两地人员派送天平看板',
  card2Title: '📐 差额增量 Δ=(costB - costA) 排序标尺',
  card2Desc: '展示每个人改派去 B 的费用差值，越小越优先去 B',
  legend: [
    { label: '去 A 市 (N 人)', color: '#3b82f6' },
    { label: '去 B 市 (N 人)', color: '#10b981' },
    { label: '待分配人员', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-costs',
      label: '人员费用 (costA,costB)',
      type: 'text',
      defaultValue: '10,20; 30,200; 400,50; 30,20',
      width: '200px',
      placeholder: '以分号分隔每人，如 10,20; 30,200',
    },
  ],
  presets: [
    { label: '经典用例 (4人)', values: { 'input-costs': '10,20; 30,200; 400,50; 30,20' } },
    { label: '差价悬殊 (4人)', values: { 'input-costs': '259,770; 448,54; 926,667; 184,139' } },
    { label: '均衡对比 (6人)', values: { 'input-costs': '10,100; 20,200; 30,300; 100,10; 200,20; 300,30' } },
  ],
  metrics: [
    { id: 'total-cost', label: '当前总费用', color: '#10b981' },
    { id: 'cost-a', label: 'A 市总花费', color: '#3b82f6' },
    { id: 'cost-b', label: 'B 市总花费', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力组合对比',
      shortName: '暴力搜索',
      card2Desc: '搜索 C(2N, N) 种划分方式，直观展示指数级复杂度',
      codeLanguages: TWO_CITY_STAGE1_CODES,
      buildSteps: (inputs) => parseTwoCityInput(inputs, 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 差额排序贪心',
      shortName: '差额贪心',
      card2Desc: '按 (costB - costA) 升序排序，前 N 人去 B，后 N 人去 A',
      codeLanguages: TWO_CITY_STAGE2_CODES,
      buildSteps: (inputs) => parseTwoCityInput(inputs, 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 费用置换反证',
      shortName: '贪心证明',
      card2Desc: '代数证明任意对调两市人员必然导致费用增量 Δ >= 0',
      codeLanguages: TWO_CITY_STAGE3_CODES,
      buildSteps: (inputs) => parseTwoCityInput(inputs, 3),
    },
  ],
  codeLanguages: TWO_CITY_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.twoCityScheduling.html,
  buildSteps: (inputs) => parseTwoCityInput(inputs, 2),
  renderCanvas: renderTwoCityCanvas,
  renderCustomMetrics: renderTwoCityMetrics,
});

export const TwoCitySchedulingVisualizer = Visualizer;

registerAlgorithm({
  id: 'two-city-scheduling',
  name: '两地调度 (Two City Scheduling)',
  viewId: 'two-city-scheduling',
  category: 'greedy',
  description: '左程云算法讲解089 Code02：LeetCode 1029 两地调度，差额排序贪心策略与数学置换反证法',
  icon: '✈️',
  template: `<div id="two-city-scheduling" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 892,
  learningGoal: '理解差额排序在多选一资源分配中的恒等式转化，掌握增量排序的本质',
  aliases: ['class089-code02', 'two-city-scheduling-1029', 'leetcode-1029'],
});
