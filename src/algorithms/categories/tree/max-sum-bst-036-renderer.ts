/**
 * 二叉搜索子树的最大键值和 (Max Sum BST Subtree · LeetCode 1373 / 333 / Class 036 Code01)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MAX_SUM_BST_PROBLEM_HTML,
  MAX_SUM_BST_ANALYSIS_HTML,
} from './max-sum-bst-036-problem-content';
import {
  MAX_SUM_BST_CODES,
  MAX_SUM_BST_CODE_LINES,
  MAX_SUM_BST_STAGE1_CODES,
  MAX_SUM_BST_STAGE2_CODES,
  MAX_SUM_BST_STAGE3_CODES,
} from './max-sum-bst-036-stage-codes';
import {
  BstTreeNode,
  BstSubtreeInfo,
  MaxSumBstStep,
  buildMaxSumBstStage1Steps,
  buildMaxSumBstStage2Steps,
  buildMaxSumBstStage3Steps,
  buildMaxSumBstSteps,
} from '../../../core/renderers/adapters/max-sum-bst-step-compiler';
import {
  MaxSumBstCanvasAdapter,
  renderMaxSumBstCanvas,
  renderMaxSumBstCard2,
} from '../../../core/renderers/adapters/max-sum-bst-canvas-adapter';

// 兼容导出
export type { BstTreeNode, BstSubtreeInfo, MaxSumBstStep };
export {
  MAX_SUM_BST_CODES,
  MAX_SUM_BST_CODE_LINES,
  buildMaxSumBstStage1Steps,
  buildMaxSumBstStage2Steps,
  buildMaxSumBstStage3Steps,
  buildMaxSumBstSteps,
  renderMaxSumBstCanvas,
  renderMaxSumBstCard2,
};

export const maxSumBst036Visualizer = registerDeclarativeAlgorithm<MaxSumBstStep>({
  id: 'max-sum-bst-036',
  name: '二叉搜索子树最大键值和 (Class 036)',
  category: 'tree',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 36,
  learningGoal: '掌握二叉树树形 DP 递归套路与 Info 结构体设计，自底向上搜集子树信息判定二叉搜索树并动态刷新最大键值和',
  aliases: ['leetcode-1373', 'leetcode-333', 'max-sum-bst', 'maximum-sum-bst-in-binary-tree'],
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 树形 DP Info 收集',
      shortName: '树形DP',
      card2Title: '树形 DP 结构体探针与决策面板',
      card2Desc: '后序遍历自底向上搜集 Info(isBST, min, max, sum)',
      codeLanguages: MAX_SUM_BST_STAGE1_CODES,
      generateSteps: (rawInputs) => {
        const preset = (rawInputs.preset || 'classic_lc1373') as any;
        return buildMaxSumBstStage1Steps(preset);
      },
      renderCanvas: MaxSumBstCanvasAdapter.renderCanvas,
      renderCustomMetrics: MaxSumBstCanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage2',
      name: 'Stage 2: 快速失效剪枝优化',
      shortName: '剪枝优化',
      card2Title: '快速失效剪枝状态面板',
      card2Desc: '破损非 BST 时快速向上传导 [0, 0, 0, 0] 免除无效求和',
      codeLanguages: MAX_SUM_BST_STAGE2_CODES,
      generateSteps: (rawInputs) => {
        const preset = (rawInputs.preset || 'classic_lc1373') as any;
        return buildMaxSumBstStage2Steps(preset);
      },
      renderCanvas: MaxSumBstCanvasAdapter.renderCanvas,
      renderCustomMetrics: MaxSumBstCanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage3',
      name: 'Stage 3: 显式单调栈后序迭代',
      shortName: '栈迭代',
      card2Title: '显式后序栈帧与状态映射',
      card2Desc: '显式单调栈消除系统调用栈爆栈风险',
      codeLanguages: MAX_SUM_BST_STAGE3_CODES,
      generateSteps: (rawInputs) => {
        const preset = (rawInputs.preset || 'classic_lc1373') as any;
        return buildMaxSumBstStage3Steps(preset);
      },
      renderCanvas: MaxSumBstCanvasAdapter.renderCanvas,
      renderCustomMetrics: MaxSumBstCanvasAdapter.renderCustomMetrics,
    },
  ],
  inputs: [
    {
      id: 'preset',
      label: '树形测试用例',
      type: 'select',
      defaultValue: 'classic_lc1373',
      options: [
        { label: 'LC 1373 官方多层破损树', value: 'classic_lc1373' },
        { label: '全树均为严格 BST 用例', value: 'full_bst' },
        { label: '根节点倒错非 BST 用例', value: 'broken_bst' },
      ],
    },
  ],
  card2Title: '树形 DP 结构体探针与决策面板',
  card2Desc: '后序遍历自底向上搜集 Info(isBST, min, max, sum)',
  problemHtml: MAX_SUM_BST_PROBLEM_HTML,
  analysisHtml: MAX_SUM_BST_ANALYSIS_HTML,
  generateSteps: (rawInputs) => {
    const preset = (rawInputs.preset || 'classic_lc1373') as any;
    return buildMaxSumBstStage1Steps(preset);
  },
  buildSteps: (rawInputs) => {
    const preset = (rawInputs.preset || 'classic_lc1373') as any;
    return buildMaxSumBstStage1Steps(preset);
  },
  renderCanvas: MaxSumBstCanvasAdapter.renderCanvas,
  renderCustomMetrics: MaxSumBstCanvasAdapter.renderCustomMetrics,
});
