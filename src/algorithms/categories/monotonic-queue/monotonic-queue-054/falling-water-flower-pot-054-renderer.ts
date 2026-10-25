/**
 * Class 054: Code03 接取落水的最小花盆 (Falling Water Flowerpot)
 * 几何坐标排序 + 双指针滑窗 + 双单调队列维护落水时间差 / 洛谷 P2698 / USACO 2012 Mar Silver
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_054_PROBLEMS } from './queue-054-problem-content';
import { CODE03_FLOWER_POT_CODES } from './queue-054-stage-codes';
import { Step054, renderFallingWaterFlowerPotBoard } from './queue-054-shared';
import {
  type WaterPoint,
  buildFallingWaterFlowerPotSteps,
} from './falling-water-flower-pot-054-step-compiler';

export { type WaterPoint, buildFallingWaterFlowerPotSteps };

export const fallingWaterFlowerPot054Renderer = registerDeclarativeAlgorithm<Step054>({
  id: 'falling-water-flower-pot-054',
  aliases: [
    'class054-code03',
    'falling-water-flowerpot',
    'falling-water-flower-pot',
    'luogu-p2698',
    'p2698',
    '2698',
    'usaco-flowerpot',
    'falling-water-flowerpot-054',
  ],
  name: '接取落水最小花盆 (Class 054)',
  category: 'monotonic-queue',
  difficulty: 'hard',
  hasDeductionTree: true,
  badge: { mode: '坐标排序+单调队列', complexity: 'O(N log N)' },
  description: '水滴坐标排序 + 双指针滑窗 + 双单调队列维护最高/最低落水时间差：求能接住时间差 ≥ D 的最小花盆宽度 (洛谷 P2698)',
  learningGoal: '掌握单调队列与坐标排序、双指针在二维几何与物理落水模型中的联合应用，体会 O(1) 极差维护与滑动窗口收缩的精妙契合。',
  icon: '🪴',

  inputs: [
    {
      id: 'points',
      label: '水滴坐标对 (x, y; 分号隔开)',
      type: 'text',
      defaultValue: '6, 3; 2, 4; 4, 10; 10, 15',
      placeholder: '例如: 6, 3; 2, 4; 4, 10; 10, 15',
    },
    {
      id: 'd',
      label: '目标时间差 D',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 100,
    },
  ],

  presets: [
    {
      label: '洛谷样例: (6,3),(2,4),(4,10),(10,15), D=5 (答案: 2)',
      values: { points: '6, 3; 2, 4; 4, 10; 10, 15', d: 5 },
    },
    {
      label: '平缓小高差: (1,1),(3,2),(5,3), D=4 (无解: -1)',
      values: { points: '1, 1; 3, 2; 5, 3', d: 4 },
    },
    {
      label: '同点垂直水滴: (5,1),(5,8),(9,12), D=7 (答案: 0)',
      values: { points: '5, 1; 5, 8; 9, 12', d: 7 },
    },
  ],

  problemContent: QUEUE_054_PROBLEMS.fallingWaterFlowerPot054,
  codeLanguages: CODE03_FLOWER_POT_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let pts: Array<[number, number]> = [
      [6, 3],
      [2, 4],
      [4, 10],
      [10, 15],
    ];
    let d = 5;

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

    if (params && params.d !== undefined) {
      const parsedD = parseInt(params.d, 10);
      if (!isNaN(parsedD) && parsedD > 0) d = parsedD;
    }

    return buildFallingWaterFlowerPotSteps(pts, d);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderFallingWaterFlowerPotBoard(step);
  },
});
