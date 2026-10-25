/**
 * 解数独可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 37：填充 9×9 空白格，满足行、列、3×3 宫不重复
 * 核心：双重循环遍历棋盘 + 1-9 候选数字合法性校验 (isValid) + 立即返回剪枝
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SUDOKU_PROBLEM_HTML,
  SUDOKU_ANALYSIS_HTML,
  SUDOKU_CODE_LANGUAGES,
} from './sudoku-problem-content';
import {
  SudokuStep,
  DEFAULT_PUZZLE,
  EASY_PUZZLE,
  SIMPLE_PUZZLE,
  MAX_STEPS,
  parsePuzzle,
  buildSudokuSteps,
  withMetrics,
} from './sudoku-step-compiler';
import { renderSudokuCanvas } from './sudoku-canvas-adapter';

// 向后兼容导出
export type { SudokuStep };
export {
  DEFAULT_PUZZLE,
  EASY_PUZZLE,
  SIMPLE_PUZZLE,
  MAX_STEPS,
  parsePuzzle,
  buildSudokuSteps,
  renderSudokuCanvas,
};

registerDeclarativeAlgorithm({
  id: 'sudoku',
  aliases: ['37', 'leetcode-37', 'sudoku-solver'],
  hasDeductionTree: true,
  name: '解数独',
  category: 'backtracking',
  description: '9×9 棋盘填数回溯，行、列、3×3 宫合法性约束与递归立即返回',
  icon: '🧩',
  difficulty: 3,
  levelOrder: 17,
  learningGoal: '掌握二维双重循环回溯、布尔返回值剪枝与九宫格坐标映射机制',
  inputs: [
    {
      id: 'puzzle',
      label: '数独谜题 (81 格, . 为空)',
      type: 'text',
      defaultValue: DEFAULT_PUZZLE,
      placeholder: '81 个字符 (数字或 .)',
    },
  ],
  presets: [
    { label: '经典谜题', values: { puzzle: DEFAULT_PUZZLE } },
    { label: '简单谜题', values: { puzzle: EASY_PUZZLE } },
    { label: '已近完成', values: { puzzle: SIMPLE_PUZZLE } },
  ],
  metrics: [
    { id: 'try-cell', label: '当前尝试格', color: '#2563eb' },
    { id: 'candidate', label: '试探数字', color: '#b45309' },
    { id: 'filled', label: '填充进度', color: '#10b981' },
    { id: 'attempts', label: '尝试次数', color: '#f59e0b' },
    { id: 'action', label: '回溯动作', color: '#dc2626' },
  ],
  legend: [
    { label: '已填入 (可撤销)', color: '#3b82f6' },
    { label: '当前试探位', color: '#facc15' },
    { label: '冲突格', color: '#f87171' },
  ],
  codeLanguages: SUDOKU_CODE_LANGUAGES,
  problemHtml: SUDOKU_PROBLEM_HTML,
  analysisHtml: SUDOKU_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildSudokuSteps(parsePuzzle(String(inputs.puzzle ?? DEFAULT_PUZZLE)))),
  renderCanvas: (container, step) => renderSudokuCanvas(container, step as SudokuStep),
});
