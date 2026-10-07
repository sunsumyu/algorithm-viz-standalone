/**
 * 单词搜索 (LeetCode 79) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_067_PROBLEMS } from './dp-067-problem-content';
import {
  type WordSearchStep,
  parseWordSearchInputs,
  buildWordSearchStage1Steps,
  buildWordSearchStage2Steps,
  buildWordSearchStage3Steps,
  buildWordSearchStage4Steps,
} from '../../../../core/renderers/adapters/word-search-step-compiler';
import {
  renderBoardGrid,
  renderPruneDashboard,
  createWordSearchStages,
} from '../../../../core/renderers/adapters/word-search-canvas-adapter';

// 向后兼容导出
export {
  type WordSearchStep,
  parseWordSearchInputs,
  buildWordSearchStage1Steps,
  buildWordSearchStage2Steps,
  buildWordSearchStage3Steps,
  buildWordSearchStage4Steps,
  renderBoardGrid,
  renderPruneDashboard,
};

export const WordSearchDeclarativeResult = registerDeclarativeAlgorithm<WordSearchStep>({
  id: 'word-search',
  name: '单词搜索 (LeetCode 79)',
  category: 'dynamic-programming',
  description: '左程云算法讲解067 Code02：LeetCode 79 单词搜索，无后效性反例深度辨析与启发式剪枝',
  icon: '🔍',
  aliases: ['class067-code02', 'word-search-067', 'word-search-problem', 'leetcode-79'],
  difficulty: 2,
  levelOrder: 102,
  learningGoal: '理解无后效性是动态规划的核心前提，掌握带回溯的现场恢复与首尾字符频次剪枝优化',
  badge: {
    mode: '回溯反例辨析 · 启发式剪枝',
    complexity: 'O(M×N×3^L) · O(L) 栈深',
  },
  primaryVisual: {
    title: '🔤 字符网格地图与实时足迹',
    render: (container, step) => {
      renderBoardGrid(container, step.board, step.i, step.j, step.path);
    },
  },
  auxiliaryVisual: {
    title: '🔬 无后效性反例与剪枝监视器',
    desc: '阐释动态规划的前提假设，辨析为什么本题无法转为记忆化/DP',
    render: (container, step) => {
      renderPruneDashboard(container, step);
    },
  },
  legend: [
    { label: '匹配成功', color: '#10b981' },
    { label: '当前访问', color: '#38bdf8' },
    { label: '回溯现场恢复', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-board',
      label: '网格',
      type: 'text',
      defaultValue: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]',
      width: '240px',
    },
    {
      id: 'input-word',
      label: '目标单词',
      type: 'text',
      defaultValue: 'ABCCED',
      width: '90px',
    },
  ],
  presets: [
    {
      label: '经典案例 1 (ABCCED, 返回 true)',
      values: {
        'input-board': '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]',
        'input-word': 'ABCCED',
      },
    },
    {
      label: '经典案例 2 (SEE, 返回 true)',
      values: {
        'input-board': '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]',
        'input-word': 'SEE',
      },
    },
  ],
  metrics: [
    { id: 'metric-matched', label: '匹配进度', color: '#10b981' },
    { id: 'metric-status', label: '搜索状态', color: '#38bdf8' },
  ],
  codeLanguages: DP_067_PROBLEMS['word-search'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['word-search'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['word-search'].analysisHtml,
  defaultStage: 'stage-1',
  buildSteps: buildWordSearchStage1Steps,
  stages: createWordSearchStages(),
});

export const WordSearchVisualizer = WordSearchDeclarativeResult.Visualizer;
