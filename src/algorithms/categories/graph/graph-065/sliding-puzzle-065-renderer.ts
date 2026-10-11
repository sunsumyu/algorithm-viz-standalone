/**
 * 左程云算法通关课 Class 065: 滑动谜题 (Sliding Puzzle · LeetCode 773)
 * 2x3 网格状态空间与曼哈顿距离启发式 A* 搜索
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_065_PROBLEMS } from './graph-065-problem-content';
import { SLIDING_PUZZLE_065_CODES } from './graph-065-stage-codes';
import { renderSlidingGrid } from './graph-065-shared';
import {
  type SlidingPuzzleStep,
  buildSlidingPuzzle065Steps,
} from './sliding-puzzle-065-step-compiler';

export { buildSlidingPuzzle065Steps, type SlidingPuzzleStep };

registerDeclarativeAlgorithm({
  id: 'sliding-puzzle-065',
  name: '滑动谜题 (A* 启发式搜索)',
  category: 'graph',
  difficulty: '困难',
  description: '左程云 Class 065 Code02：2x3 网格滑动谜题，曼哈顿距离启发函数 h 与 A* 优先队列定向加速寻路 (LeetCode 773)',
  aliases: ['class065-code02', 'sliding-puzzle-065', 'sliding-puzzle-773', 'leetcode-773', 'sliding-puzzle-class065'],
  problemHtml: GRAPH_065_PROBLEMS['sliding-puzzle-065'].problemHtml,
  analysisHtml: GRAPH_065_PROBLEMS['sliding-puzzle-065'].complexityHtml,
  codeLanguages: SLIDING_PUZZLE_065_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'standard_5_steps',
      options: [
        { label: '标准 5 步用例 "412503"', value: 'standard_5_steps' },
        { label: '单步解开用例 "123405"', value: 'one_step' },
        { label: '三步解开用例 "123045"', value: 'three_steps' },
        { label: '无解反例用例 "123540"', value: 'unsolvable' },
      ],
    },
  ],
  presets: [
    { label: '标准 5 步用例 "412503"', values: { preset: 'standard_5_steps' } },
    { label: '单步解开用例 "123405"', values: { preset: 'one_step' } },
    { label: '三步解开用例 "123045"', values: { preset: 'three_steps' } },
    { label: '无解反例用例 "123540"', values: { preset: 'unsolvable' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildSlidingPuzzle065Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: SlidingPuzzleStep) => {
    container.innerHTML = renderSlidingGrid({
      boardStr: step.boardStr,
      targetStr: step.targetStr,
      curG: step.curG,
      curH: step.curH,
      curF: step.curF,
      swappedIndices: step.swappedIndices,
    });
  },
});
