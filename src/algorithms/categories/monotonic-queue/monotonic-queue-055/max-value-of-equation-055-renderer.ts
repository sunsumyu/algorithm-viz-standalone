/**
 * Class 055: Code02 满足不等式的最大值 (Max Value of Equation)
 * 公式分离 (xj + yj) + (yi - xi) + 单调递减队列维护历史最大权值 / LeetCode 1499
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_055_PROBLEMS } from './queue-055-problem-content';
import { CODE02_MAX_EQUATION_CODES } from './queue-055-stage-codes';
import { Step055, renderMaxValueOfEquationBoard } from './queue-055-shared';
import { buildMaxValueOfEquationSteps } from './max-value-of-equation-055-step-compiler';

export { buildMaxValueOfEquationSteps };

export const maxValueOfEquation055Renderer = registerDeclarativeAlgorithm<Step055>({
  id: 'max-value-of-equation-055',
  aliases: [
    'class055-code02',
    'max-value-of-equation',
    'max-value-of-equation-1499',
    'leetcode-1499',
    '1499',
  ],
  name: '满足不等式最大值 (Class 055)',
  category: 'monotonic-queue',
  difficulty: 'hard',
  hasDeductionTree: true,
  badge: { mode: '数学分离+单调队列', complexity: 'O(N)' },
  description: '展开绝对值化简为 (xj + yj) + (yi - xi)：单调递减队列动态维护有效跨度内历史最大 yi - xi 权值 (LeetCode 1499)',
  learningGoal: '掌握不等式与绝对值在几何有序点集中的数学拆解技巧，体会单调队列维护多变量分离极值的核心解题模式。',
  icon: '📐',

  inputs: [
    {
      id: 'points',
      label: '点集坐标对 (x, y; 分号隔开, x升序)',
      type: 'text',
      defaultValue: '1, 3; 2, 0; 5, 10; 6, -10',
      placeholder: '例如: 1, 3; 2, 0; 5, 10; 6, -10',
    },
    {
      id: 'k',
      label: '最大距离限制 K',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 100,
    },
  ],

  presets: [
    {
      label: 'LeetCode 样例 1: (1,3),(2,0),(5,10),(6,-10), K=1 (答案: 4)',
      values: { points: '1, 3; 2, 0; 5, 10; 6, -10', k: 1 },
    },
    {
      label: 'LeetCode 样例 2: (0,0),(3,0),(9,2), K=3 (答案: 3)',
      values: { points: '0, 0; 3, 0; 9, 2', k: 3 },
    },
    {
      label: '大高差跨度: (1,10),(2,15),(3,25),(7,30), K=2 (答案: 41)',
      values: { points: '1, 10; 2, 15; 3, 25; 7, 30', k: 2 },
    },
  ],

  problemContent: QUEUE_055_PROBLEMS.maxValueOfEquation055,
  codeLanguages: CODE02_MAX_EQUATION_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let pts: Array<[number, number]> = [
      [1, 3],
      [2, 0],
      [5, 10],
      [6, -10],
    ];
    let k = 1;

    if (params && params.points) {
      const pairs = String(params.points)
        .split(/[;；]+/)
        .map(pair => {
          const coords = pair.split(/[,，\s]+/).filter(Boolean).map(Number);
          return coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])
            ? [coords[0], coords[1]] as [number, number]
            : null;
        })
        .filter((item): item is [number, number] => item !== null);
      if (pairs.length > 0) pts = pairs;
    }

    if (params && params.k !== undefined) {
      const parsedK = parseInt(params.k, 10);
      if (!isNaN(parsedK) && parsedK > 0) k = parsedK;
    }

    return buildMaxValueOfEquationSteps(pts, k);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderMaxValueOfEquationBoard(step);
  },
});
