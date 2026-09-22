/**
 * 灌溉花园的最少水龙头数目 (LeetCode 1326) - 声明式教学级沙盘渲染器
 * 核心贪心：区间转换为右端点最远延伸 + 跳跃游戏模型
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_093_PROBLEMS } from './greedy-093-problem-content';
import {
  MIN_TAPS_CODES,
  MIN_TAPS_LINES,
} from './greedy-093-stage-codes';
import {
  Greedy093Step,
  renderDecisionBalance,
} from './greedy-093-shared';

export interface TapInterval {
  idx: number;
  center: number;
  radius: number;
  left: number;
  right: number;
}

export interface MinTapsStep extends Greedy093Step {
  n: number;
  ranges: number[];
  rightReach: number[];
  curIdx: number;
  curEnd: number;
  nextReach: number;
  stepsCount: number;
  taps: TapInterval[];
  isFailed?: boolean;
}

export function buildMinTapsSteps(n: number, ranges: number[]): MinTapsStep[] {
  const steps: MinTapsStep[] = [];
  const lines = MIN_TAPS_LINES;

  const taps: TapInterval[] = ranges.map((r, i) => ({
    idx: i,
    center: i,
    radius: r,
    left: Math.max(0, i - r),
    right: Math.min(n, i + r),
  }));

  // Step 0: 入口
  steps.push({
    n,
    ranges: [...ranges],
    rightReach: new Array(n + 1).fill(0),
    curIdx: -1,
    curEnd: 0,
    nextReach: 0,
    stepsCount: 0,
    taps: taps.map(t => ({ ...t })),
    decision: `主函数入口：花园范围 [0, ${n}]，共有 ${n + 1} 个水龙头`,
    message: '第一阶段：将各水龙头的覆盖半径转化为区间 [max(0, i - r), min(n, i + r)]，记录各起点的最远右达边界',
    log: `enter minTaps(n=${n})`,
    codeLine: lines.entry,
  });

  // Step 1: 预处理 rightReach
  const rightReach = new Array(n + 1).fill(0);
  for (let i = 0; i <= n; i++) {
    const l = Math.max(0, i - ranges[i]);
    const r = Math.min(n, i + ranges[i]);
    rightReach[l] = Math.max(rightReach[l], r);
  }

  steps.push({
    n,
    ranges: [...ranges],
    rightReach: [...rightReach],
    curIdx: -1,
    curEnd: 0,
    nextReach: 0,
    stepsCount: 0,
    taps: taps.map(t => ({ ...t })),
    decision: `区间转换预处理完成：rightReach 数组记录从每个左端点出发的最远延伸 [${rightReach.slice(0, 8).join(', ')}${rightReach.length > 8 ? '...' : ''}]`,
    message: '转化为跳跃游戏 II：从 0 开始分段寻找最少连续跳跃到达 n',
    log: 'built rightReach array',
    codeLine: lines.buildRange,
  });

  // Step 2: 核心跳跃推演
  let curEnd = 0;
  let nextReach = 0;
  let stepsCount = 0;

  for (let i = 0; i < n; i++) {
    nextReach = Math.max(nextReach, rightReach[i]);

    steps.push({
      n,
      ranges: [...ranges],
      rightReach: [...rightReach],
      curIdx: i,
      curEnd,
      nextReach,
      stepsCount,
      taps: taps.map(t => ({ ...t })),
      decision: `扫描位置 i=${i}：从该位置出发最远可覆盖到 ${rightReach[i]} ➔ 更新下一步最远边界 nextReach = max(${nextReach}, ${rightReach[i]}) = ${nextReach}`,
      message: `当前步覆盖右边界 curEnd=${curEnd}`,
      log: `scan i=${i}, reach=${rightReach[i]}, nextReach=${nextReach}`,
      codeLine: lines.extendReach,
    });

    if (i === curEnd) {
      if (nextReach <= i) {
        steps.push({
          n,
          ranges: [...ranges],
          rightReach: [...rightReach],
          curIdx: i,
          curEnd,
          nextReach,
          stepsCount,
          taps: taps.map(t => ({ ...t })),
          isFailed: true,
          decision: `❌ 灌溉断裂！到达当前边界 i=curEnd=${i}，但下一步最远探测 nextReach=${nextReach} <= ${i}，无法继续向右延伸，无法灌溉整个花园，返回 -1`,
          message: '存在无法被任何水龙头覆盖的盲区',
          log: `gap detected at i=${i}, return -1`,
          codeLine: lines.jumpTap,
        });
        return steps;
      }

      curEnd = nextReach;
      stepsCount++;

      steps.push({
        n,
        ranges: [...ranges],
        rightReach: [...rightReach],
        curIdx: i,
        curEnd,
        nextReach,
        stepsCount,
        taps: taps.map(t => ({ ...t })),
        decision: `⚡ 到达当前步右边界 i==curEnd==${i}！打开第 ${stepsCount} 个水龙头，灌溉边界推进至 ${curEnd}`,
        message: `当前已打开 ${stepsCount} 个水龙头`,
        log: `open tap, curEnd->${curEnd}, steps=${stepsCount}`,
        codeLine: lines.jumpTap,
      });
    }
  }

  // 收敛
  steps.push({
    n,
    ranges: [...ranges],
    rightReach: [...rightReach],
    curIdx: n,
    curEnd,
    nextReach,
    stepsCount,
    taps: taps.map(t => ({ ...t })),
    decision: `🎉 成功覆盖整个花园 [0, ${n}]！最少需要打开 ${stepsCount} 个水龙头`,
    message: '区间跳跃贪心收敛完毕',
    log: `done steps=${stepsCount}`,
    codeLine: lines.done,
  });

  return steps;
}

export const minTapsVisualizer = registerAlgorithm({
  id: 'minimum-number-of-taps-to-water-a-garden',
  name: '灌溉花园的最少水龙头数目',
  viewId: 'minimum-number-of-taps-to-water-a-garden',
  category: 'greedy',
  icon: '🚰',
  difficulty: 3,
  levelOrder: 932,
  learningGoal: '掌握区间辐射模型转换为右边界跳跃最远延伸的贪心转化',
  description: '将水龙头覆盖区间规约为区间接力模型，求解覆盖花园的最少水龙头数目',
  template: `<div id="minimum-number-of-taps-to-water-a-garden" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerMinTaps(): void {
  // 保持向前兼容导出
}
