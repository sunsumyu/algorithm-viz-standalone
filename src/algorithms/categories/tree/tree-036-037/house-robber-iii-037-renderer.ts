/**
 * 左程云算法通关课 Class 037: 打家劫舍 III (House Robber III / LeetCode 337)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { Tree036Step } from './tree-036-037-shared';
import { HOUSE_ROBBER_III_037_CODES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  buildHouseRobberIII037Steps,
} from '../../../../core/renderers/adapters/house-robber-iii-step-compiler';
import {
  HouseRobberIIICanvasAdapter,
  renderHouseRobberIIICanvas,
} from '../../../../core/renderers/adapters/house-robber-iii-canvas-adapter';

export { buildHouseRobberIII037Steps, renderHouseRobberIIICanvas };

export const houseRobberIII037Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-037-house-robber-iii',
  name: '打家劫舍 III 树形DP (Class 037)',
  category: 'tree',
  icon: '💰',
  difficulty: 2,
  levelOrder: 3707,
  learningGoal: '领会树形动态规划经典互斥状态设计 [notRob, robCur]，掌握后序遍历自底向上的状态转移方程推导',
  problemHtml: TREE_036_037_PROBLEMS.houseRobberIII037.html,
  codeLanguages: HOUSE_ROBBER_III_037_CODES,
  inputs: [
    {
      id: 'tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 2, 3, null, 3, null, 1',
      width: '160px',
    },
  ],
  presets: [
    {
      label: '示例 1 (偷根最优 Ans=7)',
      values: { tree: '3, 2, 3, null, 3, null, 1' },
    },
    {
      label: '示例 2 (不偷根最优 Ans=9)',
      values: { tree: '3, 4, 5, 1, 3, null, 1' },
    },
    {
      label: '单节点抢劫',
      values: { tree: '10' },
    },
  ],
  generateSteps: (inputs) => buildHouseRobberIII037Steps(inputs?.tree),
  renderCanvas: (container, step) => HouseRobberIIICanvasAdapter.renderCanvas(container, step),
});
