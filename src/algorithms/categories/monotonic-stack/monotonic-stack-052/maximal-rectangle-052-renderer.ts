/**
 * Class 052 Code06: 最大矩形 (Maximal Rectangle / LeetCode 85)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  MAXIMAL_RECTANGLE_CODES,
} from './stack-052-stage-codes';
import { renderMatrixToHistogramBoard } from './stack-052-shared';
import {
  buildMaximalRectangle052Steps,
  type MaximalRectangle052Step,
} from './maximal-rectangle-052-step-compiler';

export {
  buildMaximalRectangle052Steps,
  type MaximalRectangle052Step,
};

export function parseMatrixInput(input: string, fallback: number[][]): number[][] {
  try {
    const lines = input.trim().split(/[\n;]+/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return fallback;
    const res: number[][] = [];
    for (const line of lines) {
      const row = line.replace(/[[\]"]/g, '').split(/[, ]+/).filter(Boolean).map(Number);
      if (row.length > 0) res.push(row);
    }
    return res.length > 0 ? res : fallback;
  } catch {
    return fallback;
  }
}

const DEFAULT_MATRIX = [
  [1, 0, 1, 0, 0],
  [1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0],
];

export const maximalRectangle052Visualizer = registerDeclarativeAlgorithm<MaximalRectangle052Step>({
  id: 'maximal-rectangle-052',
  name: '最大矩形 (Class 052 Code06)',
  category: 'monotonic-stack',
  aliases: ['maximal-rectangle', 'maximal-rectangle-052', 'class052-code06', 'leetcode-85', '85'],
  difficulty: 'hard',
  hasDeductionTree: true,
  learningGoal: '掌握二维 0/1 矩阵向一维连续高度直方图压缩的降维思维，熟练串联多算法解决高维难题。',
  problemContent: STACK_052_PROBLEMS.maximalRectangle052,
  codeLanguages: MAXIMAL_RECTANGLE_CODES,
  inputs: [
    {
      id: 'matrix',
      label: '二维 0/1 矩阵',
      type: 'text',
      defaultValue: '1,0,1,0,0; 1,0,1,1,1; 1,1,1,1,1; 1,0,0,1,0',
      placeholder: '分号或换行分隔各行，逗号分隔 0 和 1',
    },
  ],
  presets: [
    {
      label: '示例 1: 官方 4×5 矩阵 (面积=6)',
      values: { matrix: '1,0,1,0,0; 1,0,1,1,1; 1,1,1,1,1; 1,0,0,1,0' },
    },
    {
      label: '示例 2: 全 1 矩阵 3×3 (面积=9)',
      values: { matrix: '1,1,1; 1,1,1; 1,1,1' },
    },
    {
      label: '示例 3: 棋盘对角单点 3×3 (面积=1)',
      values: { matrix: '1,0,0; 0,1,0; 0,0,1' },
    },
  ],
  generateSteps: (inputs) => {
    const raw = parseMatrixInput(inputs.matrix, DEFAULT_MATRIX);
    return buildMaximalRectangle052Steps(raw);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderMatrixToHistogramBoard(
      step.matrix,
      step.curRow,
      step.heights,
      step.stack,
      step.activeRect,
      step.maxArea
    );
  },
});
