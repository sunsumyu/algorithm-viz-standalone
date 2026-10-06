/**
 * LeetCode 404: 左叶子之和 (Sum of Left Leaves)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  LEFT_LEAVES_STAGE1_CODES,
  LEFT_LEAVES_STAGE2_CODES,
  LEFT_LEAVES_STAGE3_CODES,
} from './left-leaves-stage-codes';
import {
  LEFT_LEAVES_PROBLEM_HTML,
  LEFT_LEAVES_ANALYSIS_HTML,
} from './left-leaves-problem-content';
import {
  LeftLeavesStep,
  collectTreeValues,
  parseAndBuildLeftLeavesTree,
  buildLeftLeavesStage1Steps,
  buildLeftLeavesStage2BfsSteps,
  buildLeftLeavesStage3StackSteps,
  buildLeftLeavesSteps,
} from '../../../core/renderers/adapters/left-leaves-step-compiler';
import { LeftLeavesCanvasAdapter } from '../../../core/renderers/adapters/left-leaves-canvas-adapter';

// 兼容导出
export type { LeftLeavesStep };
export {
  collectTreeValues,
  buildLeftLeavesStage1Steps,
  buildLeftLeavesStage2BfsSteps,
  buildLeftLeavesStage3StackSteps,
  buildLeftLeavesSteps,
};

export const leftLeavesVisualizer = registerDeclarativeAlgorithm<LeftLeavesStep>({
  id: 'left-leaves',
  name: '左叶子之和',
  category: 'tree',
  icon: '🍃',
  difficulty: 1,
  levelOrder: 404,
  aliases: ['leetcode-404', 'sum-of-left-leaves'],
  learningGoal: '深刻理解左叶子的充要定义，掌握父节点前瞻探查法则，对比递归分治、BFS 队列与显式迭代栈',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H) / O(W)',
  inputs: [
    {
      id: 'tree',
      label: '二叉树层序数组',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      placeholder: '例如: 3, 9, 20, null, null, 15, 7',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 经典二分叉 (和 24)',
      values: { tree: '3, 9, 20, null, null, 15, 7' },
      description: '根 3 的左孩子 9 是叶子(9)，20 的左孩子 15 是叶子(15)，左叶子之和为 24',
    },
    {
      label: 'LeetCode 示例 2: 满二叉树 (和 4)',
      values: { tree: '1, 2, 3, 4, 5' },
      description: '根 1 的左孩子 2 的左孩子 4 是叶子，左叶子之和为 4',
    },
    {
      label: '单节点根树 (避坑用例，和 0)',
      values: { tree: '[1]' },
      description: '根 1 虽是叶子但非任何节点的左孩子，左叶子之和严格为 0',
    },
    {
      label: '空树用例 (和 0)',
      values: { tree: '[]' },
      description: '空树无节点，左叶子之和为 0',
    },
  ],
  metrics: [
    { id: 'cur', label: '当前考察节点', color: '#fab387' },
    { id: 'leaf', label: '最新命中左叶子', color: '#10b981' },
    { id: 'result', label: '左叶子之和', color: '#2563eb' },
  ],
  codeLanguages: LEFT_LEAVES_STAGE1_CODES,
  problemHtml: LEFT_LEAVES_PROBLEM_HTML,
  analysisHtml: LEFT_LEAVES_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 后序分治递归与父节点前瞻探查 (Postorder Recursive DFS)',
      shortName: '后序前瞻递归',
      num: 1,
      codeLanguages: LEFT_LEAVES_STAGE1_CODES,
      buildSteps: (inputs) => buildLeftLeavesStage1Steps(parseAndBuildLeftLeavesTree(inputs)),
      renderCanvas: LeftLeavesCanvasAdapter.renderCanvas,
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 广度优先搜索层序队列遍历 (BFS Queue Traversal)',
      shortName: 'BFS 层序队列',
      num: 2,
      codeLanguages: LEFT_LEAVES_STAGE2_CODES,
      buildSteps: (inputs) => buildLeftLeavesStage2BfsSteps(parseAndBuildLeftLeavesTree(inputs)),
      renderCanvas: LeftLeavesCanvasAdapter.renderCanvas,
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 显式迭代栈遍历与左叶子累加 (Iterative Stack DFS)',
      shortName: '显式迭代栈',
      num: 3,
      codeLanguages: LEFT_LEAVES_STAGE3_CODES,
      buildSteps: (inputs) => buildLeftLeavesStage3StackSteps(parseAndBuildLeftLeavesTree(inputs)),
      renderCanvas: LeftLeavesCanvasAdapter.renderCanvas,
    },
  ],

  generateSteps: (inputs) => buildLeftLeavesStage1Steps(parseAndBuildLeftLeavesTree(inputs)),
  buildSteps: (inputs) => buildLeftLeavesStage1Steps(parseAndBuildLeftLeavesTree(inputs)),
  renderCanvas: LeftLeavesCanvasAdapter.renderCanvas,
});
