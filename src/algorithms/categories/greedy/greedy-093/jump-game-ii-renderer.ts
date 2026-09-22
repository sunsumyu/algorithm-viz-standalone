/**
 * 跳跃游戏 II (LeetCode 45) - 声明式教学级沙盘渲染器
 * 核心贪心：右边界分段推进与最远跳跃探测
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { JUMP_GAME_II_LINES } from './greedy-093-stage-codes';
import { Greedy093Step } from './greedy-093-shared';

export interface JumpGameIIStep extends Greedy093Step {
  nums: number[];
  curIdx: number;
  curEnd: number;
  nextReach: number;
  stepsCount: number;
  isStepJump?: boolean;
}

export function buildJumpGameIISteps(nums: number[]): JumpGameIIStep[] {
  const steps: JumpGameIIStep[] = [];
  const lines = JUMP_GAME_II_LINES;
  const n = nums.length;

  // Step 0: 入口
  steps.push({
    nums: [...nums],
    curIdx: 0,
    curEnd: 0,
    nextReach: 0,
    stepsCount: 0,
    decision: `主函数入口：接收数组 nums=[${nums.join(', ')}]，起点位置 0，终点位置 ${n - 1}`,
    message: '核心机制：分段跳跃，维护当前跳跃右边界 curEnd 与下一步最远覆盖 nextReach',
    log: `enter jump(nums=[${nums.join(',')}])`,
    codeLine: lines.entry,
    vars: [{ name: 'nums.length', value: String(n) }, { name: 'steps', value: '0' }],
    metrics: {
      'cur-pos': '[0]',
      'cur-boundary': '[0]',
      'next-boundary': '[0]',
      jumps: '0 步',
      action: '初始化',
    },
  });

  if (n <= 1) {
    steps.push({
      nums: [...nums],
      curIdx: 0,
      curEnd: 0,
      nextReach: 0,
      stepsCount: 0,
      decision: `特判：起点即为终点 (n=${n} <= 1)，无需任何跳跃，返回 0`,
      message: '特判直接返回',
      log: 'guard n<=1 -> 0',
      codeLine: lines.done,
      vars: [{ name: 'steps', value: '0' }],
      metrics: {
        'cur-pos': '[0]',
        'cur-boundary': '[0]',
        'next-boundary': '[0]',
        jumps: '0 步',
        action: '🏁 已达终点',
      },
    });
    return steps;
  }

  let curEnd = 0;
  let nextReach = 0;
  let stepsCount = 0;

  for (let i = 0; i < n - 1; i++) {
    const reachableFromHere = i + nums[i];
    nextReach = Math.max(nextReach, reachableFromHere);
    const hitBoundary = i === curEnd;

    steps.push({
      nums: [...nums],
      curIdx: i,
      curEnd,
      nextReach,
      stepsCount,
      decision: `探针位于索引 ${i} (nums[${i}]=${nums[i]})：从此处最远可跳至 ${reachableFromHere} ➔ 更新下一步最远探测 nextReach = max(${nextReach}, ${reachableFromHere}) = ${nextReach}`,
      message: `当前步覆盖边界 curEnd=${curEnd}，下一步最远可达 nextReach=${nextReach}`,
      log: `scan i=${i}, reach=${reachableFromHere}, nextReach=${nextReach}`,
      codeLine: lines.explore,
      vars: [
        { name: 'i', value: String(i) },
        { name: 'nums[i]', value: String(nums[i]) },
        { name: 'reach', value: String(reachableFromHere) },
        { name: 'nextReach', value: String(nextReach) },
        { name: 'curEnd', value: String(curEnd) },
        { name: 'steps', value: String(stepsCount) },
      ],
      metrics: {
        'cur-pos': `[${i}]`,
        'cur-boundary': `[${curEnd}]`,
        'next-boundary': `[${nextReach}]`,
        jumps: `${stepsCount} 步`,
        action: '🔍 扫描边界内节点',
      },
    });

    if (hitBoundary) {
      curEnd = nextReach;
      stepsCount++;

      steps.push({
        nums: [...nums],
        curIdx: i,
        curEnd,
        nextReach,
        stepsCount,
        isStepJump: true,
        decision: `⚡ 到达当前步右边界 i==curEnd==${i}！必须触发新一次跳跃，跳跃次数 steps 增至 ${stepsCount}，当前跳跃右边界推进至 ${curEnd}`,
        message: `第 ${stepsCount} 次跳跃最远可达索引 ${curEnd}`,
        log: `jump boundary hit at i=${i}, curEnd->${curEnd}, steps=${stepsCount}`,
        codeLine: lines.jumpStep,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curEnd', value: String(curEnd) },
          { name: 'steps', value: String(stepsCount) },
        ],
        metrics: {
          'cur-pos': `[${i}]`,
          'cur-boundary': `[${curEnd}]`,
          'next-boundary': `[${nextReach}]`,
          jumps: `${stepsCount} 步`,
          action: '🦘 边界接力跳跃',
        },
      });
    }
  }

  // 收敛
  steps.push({
    nums: [...nums],
    curIdx: n - 1,
    curEnd,
    nextReach,
    stepsCount,
    decision: `🎉 推演完成！到达末尾所需的最少跳跃次数为 ${stepsCount} 次`,
    message: '右边界分段贪心跳跃达成全局最少跳跃',
    log: `done steps=${stepsCount}`,
    codeLine: lines.done,
    vars: [
      { name: 'return steps', value: String(stepsCount) },
    ],
    metrics: {
      'cur-pos': `[${n - 1}]`,
      'cur-boundary': `[${curEnd}]`,
      'next-boundary': `[${nextReach}]`,
      jumps: `${stepsCount} 步`,
      action: '🏁 已达终点',
    },
  });

  return steps;
}

registerAlgorithm({
  id: 'jump-game-ii',
  name: '跳跃游戏 II (Jump Game II)',
  viewId: 'jump-game-ii',
  category: 'greedy',
  icon: '🦘',
  difficulty: 2,
  levelOrder: 931,
  learningGoal: '掌握分段推进右边界与下一步最远覆盖的贪心跳跃策略',
  description: '跳跃游戏 II (Jump Game II)：维护当前跳跃右边界 curEnd 与下一步最远覆盖 nextReach，触碰边界即贪心跳跃',
  template: `<div id="jump-game-ii" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerJumpGameII(): void {
  // 保持向前兼容导出
}
