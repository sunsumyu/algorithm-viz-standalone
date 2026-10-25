/**
 * 左程云算法通关课 Class 037: 打家劫舍 III (House Robber III / LeetCode 337)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 * Card 1: 纯净二叉树拓扑沙盘与 [不偷, 偷] 状态徽章渐进生成
 * Card 2: 挂接全库统一顶层抽象 RecursiveCallTraceAdapter 呈现自底向上后序归约树
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
  aliases: ['leetcode-337', 'house-robber-iii', 'tree-dp-house-robber', 'house-robber-3'],
  name: '打家劫舍 III 树形DP (Class 037)',
  category: 'tree',
  icon: '💰',
  hasDeductionTree: true,
  difficulty: 2,
  levelOrder: 3707,
  learningGoal: '领会树形动态规划经典互斥状态设计 [notRob, robCur]，掌握后序遍历自底向上的状态转移方程推导',
  badge: { mode: '树形动态规划: 自底向上后序归约', complexity: 'O(N) · O(H)' },
  card1Title: '🌲 树形拓扑与自底向上状态汇聚沙盘',
  card2Title: '🧭 树形 DP 递归调用树与状态转移监视器',
  card2Desc: '基于 [notRob, robCur] 二元组后序归约的递归推演与状态转移实时监视',
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
  metrics: [
    { id: 'cur-node', label: '当前节点', color: '#3b82f6' },
    { id: 'not-rob', label: '不偷当前收益', color: '#64748b' },
    { id: 'rob-cur', label: '偷当前收益', color: '#eab308' },
    { id: 'ans', label: '全树最优窃取金额', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 树形 DP 自底向上归约',
      shortName: '树形DP',
      card2Desc: '后序遍历自底向上汇聚 [notRob, robCur] 状态二元组，挂载标准 RecursiveCallTrace 递归树',
      codeLanguages: HOUSE_ROBBER_III_037_CODES,
      generateSteps: (inputs) => buildHouseRobberIII037Steps(inputs?.tree),
      renderCanvas: (c, s) => HouseRobberIIICanvasAdapter.renderCanvas(c, s),
      renderCustomMetrics: (c, s) => HouseRobberIIICanvasAdapter.renderCustomMetrics(c, s),
    },
  ],
  generateSteps: (inputs) => buildHouseRobberIII037Steps(inputs?.tree),
  renderCanvas: (container, step) => HouseRobberIIICanvasAdapter.renderCanvas(container, step),
  renderCustomMetrics: (c, s) => HouseRobberIIICanvasAdapter.renderCustomMetrics(c, s),
});
