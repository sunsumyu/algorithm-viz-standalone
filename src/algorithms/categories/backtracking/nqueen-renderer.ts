/**
 * N 皇后可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 51：在 N×N 棋盘上放置 N 个皇后，使得彼此不能相互攻击
 * 核心：逐行放置 + 三方向对角线冲突判定 (isValid)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  NQUEEN_PROBLEM_HTML,
  NQUEEN_ANALYSIS_HTML,
  NQUEEN_CODE_LANGUAGES,
} from './nqueen-problem-content';
import {
  NQueenStep,
  MAX_STEPS,
  buildNQueenSteps,
  withMetrics,
} from './nqueen-step-compiler';
import { renderNQueenCanvas } from './nqueen-canvas-adapter';

// 向后兼容导出
export type { NQueenStep };
export {
  MAX_STEPS,
  buildNQueenSteps,
  renderNQueenCanvas,
};

registerDeclarativeAlgorithm({
  id: 'nqueen',
  aliases: ['51', 'leetcode-51', 'n-queens'],
  hasDeductionTree: true,
  name: 'N 皇后',
  category: 'backtracking',
  description: '在 N×N 棋盘上放置 N 个皇后，逐行放置与三方向对角线冲突剪枝',
  icon: '👑',
  difficulty: 3,
  levelOrder: 16,
  learningGoal: '掌握二维棋盘回溯模型的按行递归与三方向 (列、主副对角线) 冲突检验机制',
  inputs: [
    {
      id: 'n',
      label: '棋盘规模 N',
      type: 'number',
      defaultValue: '4',
      placeholder: '4 - 8',
    },
  ],
  presets: [
    { label: 'N=4', values: { n: '4' } },
    { label: 'N=5', values: { n: '5' } },
    { label: 'N=6', values: { n: '6' } },
    { label: 'N=8', values: { n: '8' } },
  ],
  metrics: [
    { id: 'row', label: '当前放置行', color: '#2563eb' },
    { id: 'attempts', label: '尝试次数', color: '#f59e0b' },
    { id: 'solutions', label: '合法解数', color: '#10b981' },
    { id: 'col-mask', label: '列占用位图', color: '#2563eb' },
    { id: 'action', label: '回溯动作', color: '#dc2626' },
  ],
  legend: [
    { label: '已放置皇后', color: '#3b82f6' },
    { label: '当前试探位', color: '#facc15' },
    { label: '冲突格', color: '#f87171' },
  ],
  codeLanguages: NQUEEN_CODE_LANGUAGES,
  problemHtml: NQUEEN_PROBLEM_HTML,
  analysisHtml: NQUEEN_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let n = parseInt(String(inputs.n ?? '4'), 10);
    if (!Number.isFinite(n)) n = 4;
    n = Math.max(1, Math.min(9, n));
    return withMetrics(buildNQueenSteps(n));
  },
  renderCanvas: (container, step) => renderNQueenCanvas(container, step as NQueenStep),
});
