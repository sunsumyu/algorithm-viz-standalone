/**
 * 跳跃游戏 II (LeetCode 45) - 声明式教学级沙盘渲染器
 * 核心贪心：右边界分段推进与最远跳跃探测
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_093_PROBLEMS } from './greedy-093-problem-content';
import {
  JUMP_GAME_II_CODES,
  JUMP_GAME_II_LINES,
} from './greedy-093-stage-codes';
import {
  Greedy093Step,
  renderDecisionBalance,
} from './greedy-093-shared';

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
  });

  return steps;
}

export const jumpGameIIVisualizer = registerDeclarativeAlgorithm<JumpGameIIStep>({
  id: 'jump-game-ii',
  name: '跳跃游戏 II (Jump Game II)',
  category: 'greedy',
  icon: '🦘',
  difficulty: 2,
  levelOrder: 931,
  learningGoal: '掌握分段推进右边界与下一步最远覆盖的贪心跳跃策略',
  problemHtml: GREEDY_093_PROBLEMS.jumpGameII.html,
  analysisHtml: GREEDY_093_PROBLEMS.jumpGameII.html,
  inputs: [
    {
      id: 'input-nums',
      label: '数组 nums',
      type: 'text',
      defaultValue: '2, 3, 1, 1, 4',
      placeholder: '2, 3, 1, 1, 4',
    },
  ],
  codeLanguages: JUMP_GAME_II_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-nums'] || '2, 3, 1, 1, 4');
    const nums = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildJumpGameIISteps(nums);
  },
  renderCanvas: (stageContainer: HTMLElement, step: JumpGameIIStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">当前边界 curEnd:</span>
          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #fef2f2; color: #dc2626; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${step.curEnd}</span>
          <span style="color: #cbd5e1;">|</span>
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">下一步最远 nextReach:</span>
          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #047857; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${step.nextReach}</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">最少跳跃次数:</span>
          <span style="color: #2563eb; font-weight: 800; font-size: 16px;">${step.stepsCount} 步</span>
        </div>
      </div>
    `;

    // 中部网格与跳跃轨道
    const gridBox = document.createElement('div');
    gridBox.style.cssText = 'flex: 1; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

    step.nums.forEach((val, idx) => {
      const isCur = step.curIdx === idx;
      const isCurEnd = step.curEnd === idx;
      const isNextReach = step.nextReach === idx;

      let border = '#cbd5e1';
      let bg = '#f8fafc';
      let color = '#334155';

      if (isCur) {
        border = '#3b82f6';
        bg = '#eff6ff';
        color = '#1d4ed8';
      } else if (isCurEnd) {
        border = '#ef4444';
        bg = '#fee2e2';
        color = '#b91c1c';
      } else if (isNextReach) {
        border = '#10b981';
        bg = '#ecfdf5';
        color = '#047857';
      }

      const item = document.createElement('div');
      item.style.cssText = `min-width: 44px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 14px; color: ${color}; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.04);`;

      item.innerHTML = `
        <span>${val}</span>
        <span style="font-size: 9px; font-weight: 600; color: #94a3b8;">[${idx}]</span>
      `;

      if (isCur) {
        const tag = document.createElement('span');
        tag.style.cssText = 'position: absolute; top: -11px; background: #3b82f6; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
        tag.textContent = '探针 i';
        item.appendChild(tag);
      }
      if (isCurEnd && !isCur) {
        const tag = document.createElement('span');
        tag.style.cssText = 'position: absolute; bottom: -11px; background: #ef4444; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
        tag.textContent = '边界';
        item.appendChild(tag);
      }

      gridBox.appendChild(item);
    });
    mainCard.appendChild(gridBox);

    stageContainer.appendChild(mainCard);
  },
});

export function registerJumpGameII(): void {
  // 保持向前兼容导出
}
