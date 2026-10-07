/**
 * 砍树问题 (Cutting Tree) - 声明式教学级沙盘渲染器
 * 核心贪心：增长率升序邻项交换律 + 0-1背包动态规划
 * Thin Domain Adapter (< 60 LOC)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_094_PROBLEMS } from './greedy-094-problem-content';
import { CUTTING_TREE_CODES } from './greedy-094-stage-codes';
import {
  TreeInfo,
  CuttingTreeStep,
  buildCuttingTreeSteps,
  parseCuttingTreeInputs,
} from './cutting-tree-step-compiler';
import { renderCuttingTreeCanvas } from './cutting-tree-canvas-adapter';

export type { TreeInfo, CuttingTreeStep };
export { buildCuttingTreeSteps, renderCuttingTreeCanvas };

export const cuttingTreeVisualizer = registerDeclarativeAlgorithm<CuttingTreeStep>({
  id: 'cutting-tree',
  name: '砍树问题 (Cutting Tree)',
  category: 'greedy',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 945,
  aliases: ['class094-code05', 'cutting-trees', 'poj-2784'],
  learningGoal: '掌握增长率升序邻项交换律确定砍伐序，结合0-1背包DP收敛全局最优',
  problemHtml: GREEDY_094_PROBLEMS.cuttingTree.html,
  analysisHtml: GREEDY_094_PROBLEMS.cuttingTree.html,
  inputs: [
    {
      id: 'input-trees',
      label: '树木 (weight,growth 分号隔开)',
      type: 'text',
      defaultValue: '10,2; 5,5; 20,1',
      placeholder: '10,2; 5,5; 20,1',
    },
    {
      id: 'input-m',
      label: '砍伐天数 m',
      type: 'text',
      defaultValue: '2',
      placeholder: '2',
    },
  ],
  codeLanguages: CUTTING_TREE_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const { trees, m } = parseCuttingTreeInputs(inputs);
    return buildCuttingTreeSteps(trees, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CuttingTreeStep) => {
    renderCuttingTreeCanvas(stageContainer, step);
  },
});
