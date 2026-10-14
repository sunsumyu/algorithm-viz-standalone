/**
 * 左程云算法通关课 Class 065: 八数码难题 (Eight Puzzle · 洛谷 P1379)
 * 3x3 棋盘滑动，逆序对奇偶性剪枝与曼哈顿距离启发式 A* 搜索
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_065_PROBLEMS } from './graph-065-problem-content';
import { EIGHT_PUZZLE_065_CODES } from './graph-065-stage-codes';
import { renderEightPuzzleGrid } from './graph-065-shared';
import {
  EightPuzzleStep,
  buildEightPuzzle065Steps,
} from './eight-puzzle-065-step-compiler';

export { buildEightPuzzle065Steps, type EightPuzzleStep };

registerDeclarativeAlgorithm({
  id: 'eight-puzzle-065',
  name: '八数码难题 (A* 逆序对剪枝)',
  category: 'graph',
  difficulty: '困难',
  description: '左程云 Class 065 Code03：3x3 棋盘滑动，逆序对奇偶可解性判定与曼哈顿距离启发式 A* 搜索 (洛谷 P1379)',
  aliases: ['class065-code03', 'eight-puzzle-065', 'eight-puzzle-1379', 'luogu-p1379', 'eight-puzzle-class065'],
  problemHtml: GRAPH_065_PROBLEMS['eight-puzzle-065'].problemHtml,
  analysisHtml: GRAPH_065_PROBLEMS['eight-puzzle-065'].complexityHtml,
  codeLanguages: EIGHT_PUZZLE_065_CODES,
  presets: [
    { label: '单步解开用例 "123084765"', values: { preset: 'one_step' } },
    { label: '两步解开用例 "123840765"', values: { preset: 'two_steps' } },
    { label: '洛谷经典用例 "283104765"', values: { preset: 'luogu_sample' } },
    { label: '逆序对奇偶无解剪枝 "123804756"', values: { preset: 'unsolvable_parity' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildEightPuzzle065Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: EightPuzzleStep) => {
    container.innerHTML = renderEightPuzzleGrid({
      boardStr: step.boardStr,
      targetStr: step.targetStr,
      curG: step.curG,
      curH: step.curH,
      curF: step.curF,
      invCount: step.invCount,
      isSolvable: step.isSolvable,
    });
  },
});
