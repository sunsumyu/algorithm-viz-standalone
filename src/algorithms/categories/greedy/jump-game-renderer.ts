/**
 * 跳跃游戏 II 可视化器（贪心算法）— 声明式 4-Card 标准架构
 * LeetCode 45：维护当前步最远边界 (curDistance) 与下一步最远边界 (nextDistance)，触碰边界即贪心跳跃
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  JUMP_GAME_PROBLEM_HTML,
  JUMP_GAME_ANALYSIS_HTML,
  JUMP_GAME_CODE_LANGUAGES,
} from './jump-game-problem-content';

export interface JumpStep {
  array: number[];
  currentIndex: number;
  currentBoundary: number;
  nextBoundary: number;
  jumpCount: number;
  isJump: boolean;
  jumpFrom: number;
  jumpTo: number;
  action: 'init' | 'scan' | 'jump' | 'done';
  message: string;
  log: string;
  codeLine: number;
  metrics?: Record<string, string>;
}

export function buildJumpGameSteps(arr: number[]): JumpStep[] {
  const steps: JumpStep[] = [];
  const n = arr.length;

  if (n <= 1) {
    steps.push({
      array: [...arr],
      currentIndex: 0,
      currentBoundary: 0,
      nextBoundary: 0,
      jumpCount: 0,
      isJump: false,
      jumpFrom: -1,
      jumpTo: -1,
      action: 'done',
      message: '数组长度 <= 1，已经在终点，无需跳跃，步数为 0',
      log: 'no jumps needed',
      codeLine: 2,
    });
    return steps;
  }

  let jumps = 0;
  let curDistance = 0;
  let nextDistance = 0;

  steps.push({
    array: [...arr],
    currentIndex: 0,
    currentBoundary: 0,
    nextBoundary: 0,
    jumpCount: 0,
    isJump: false,
    jumpFrom: -1,
    jumpTo: -1,
    action: 'init',
    message: `初始化：nums = [${arr.join(', ')}]，jumps=0, curBoundary=0, nextBoundary=0`,
    log: `init: jumps=0, boundary=0, farthest=0`,
    codeLine: 3,
  });

  for (let i = 0; i < n - 1; i++) {
    const reach = i + arr[i];
    nextDistance = Math.max(nextDistance, reach);

    steps.push({
      array: [...arr],
      currentIndex: i,
      currentBoundary: curDistance,
      nextBoundary: nextDistance,
      jumpCount: jumps,
      isJump: false,
      jumpFrom: -1,
      jumpTo: -1,
      action: 'scan',
      message: `🔍 扫描下标 [${i}]=${arr[i]}，从该点可达下标 ${reach}，更新下一步最远 nextBoundary=${nextDistance}`,
      log: `scan i=${i}: reach=${reach}, nextBoundary=${nextDistance}`,
      codeLine: 7,
    });

    if (i === curDistance) {
      jumps++;
      const prevBoundary = curDistance;
      curDistance = nextDistance;

      steps.push({
        array: [...arr],
        currentIndex: i,
        currentBoundary: curDistance,
        nextBoundary: nextDistance,
        jumpCount: jumps,
        isJump: true,
        jumpFrom: prevBoundary,
        jumpTo: curDistance,
        action: 'jump',
        message: `🦘 到达当前跳跃边界 [${i}]！必须跳跃一次，jumps=${jumps}，新边界推进至 [${curDistance}]`,
        log: `jump #${jumps}: ${prevBoundary} → ${curDistance}`,
        codeLine: 10,
      });

      if (curDistance >= n - 1) {
        break; // 已经覆盖终点
      }
    }
  }

  steps.push({
    array: [...arr],
    currentIndex: n - 1,
    currentBoundary: n - 1,
    nextBoundary: nextDistance,
    jumpCount: jumps,
    isJump: false,
    jumpFrom: -1,
    jumpTo: -1,
    action: 'done',
    message: `🎉 成功到达终点！最少跳跃次数为 ${jumps} 次`,
    log: `done: jumps=${jumps}`,
    codeLine: 14,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: JumpStep[]): JumpStep[] {
  return steps.map((s) => {
    let action = s.isJump ? '🦘 触碰边界 (jumps++)' : '🔍 扫描边界内节点';
    if (s.action === 'done') action = '🏁 已达终点';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      metrics: {
        'cur-pos': `[${s.currentIndex}]`,
        'cur-boundary': `[${s.currentBoundary}]`,
        'next-boundary': `[${s.nextBoundary}]`,
        jumps: `${s.jumpCount} 步`,
        action,
      },
    };
  });
}

export function renderJumpGameCanvas(container: HTMLElement, step: JumpStep): void {
  const arr = step.array;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const curBound = step.currentBoundary;
  const nextBound = step.nextBoundary;
  const isDone = step.action === 'done';

  const cellsHtml = arr
    .map((val, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isAtCurBound = idx === curBound;
      const isWithinCurBound = idx <= curBound;
      const isTarget = idx === n - 1;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#eff6ff';
        borderColor = '#2563eb';
        textColor = '#2563eb';
      } else if (isAtCurBound) {
        bg = '#f5f3ff';
        borderColor = '#7c3aed';
        textColor = '#7c3aed';
      } else if (isWithinCurBound) {
        bg = '#faf5ff';
        borderColor = '#ddd6fe';
        textColor = '#6b21a8';
      }

      if (isDone && isTarget) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9.5px; color: ${isCurrent ? '#2563eb' : isAtCurBound ? '#7c3aed' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 当前' : isAtCurBound ? '🚪 边界' : isTarget ? '🏁 终点' : `[${idx}]`}
          </span>
          <div style="width: 48px; height: 48px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 5px rgba(0,0,0,0.04); transition: all 0.15s;">
            <span>${val}</span>
            <span style="font-size: 8.5px; color: #94a3b8; font-weight: 600;">+${val}</span>
          </div>
          <span style="font-size: 9px; color: ${isWithinCurBound ? '#7c3aed' : '#cbd5e1'}; font-weight: 700;">
            ${isWithinCurBound ? '可达' : '未及'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 边界双指示条 -->
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>🚪 当前步边界: 下标 <strong style="color: #7c3aed; font-family: monospace;">[${curBound}]</strong></span>
        <span>🌐 下一步最远: 下标 <strong style="color: #059669; font-family: monospace;">[${nextBound}]</strong></span>
      </div>

      <!-- 单元格水平条 -->
      <div style="display: flex; gap: 10px; overflow-x: auto; justify-content: center; padding: 6px 0;">
        ${cellsHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'jump-game',
  name: '跳跃游戏 II',
  category: 'greedy',
  description: '求到达数组末尾的最少跳跃次数，触碰当前步覆盖边界即贪心跳跃',
  icon: '🦘',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握跳跃游戏 II 中双边界推进与最小步数贪心触发机制',
  inputs: [
    {
      id: 'nums',
      label: '跳跃数组',
      type: 'text',
      defaultValue: '2,3,1,1,4',
      placeholder: '2,3,1,1,4',
    },
  ],
  presets: [
    { label: '示例 1 (2 步)', values: { nums: '2,3,1,1,4' } },
    { label: '示例 2 (2 步)', values: { nums: '2,3,0,1,4' } },
    { label: '步步推进 (3 步)', values: { nums: '1,1,1,1' } },
  ],
  metrics: [
    { id: 'cur-pos', label: '当前扫描位置', color: '#2563eb' },
    { id: 'cur-boundary', label: '当前跳跃右边界', color: '#7c3aed' },
    { id: 'next-boundary', label: '下一步最远边界', color: '#059669' },
    { id: 'jumps', label: '最少跳跃次数', color: '#f59e0b' },
    { id: 'action', label: '贪心判定', color: '#7c3aed' },
  ],
  legend: [
    { label: '🚪 当前跳跃右边界', color: '#7c3aed' },
    { label: '🌐 下一步最远边界', color: '#059669' },
    { label: '📍 当前扫描格', color: '#2563eb' },
  ],
  codeLanguages: JUMP_GAME_CODE_LANGUAGES,
  problemHtml: JUMP_GAME_PROBLEM_HTML,
  analysisHtml: JUMP_GAME_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawNums = String(inputs.nums ?? '2,3,1,1,4')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return withMetrics(buildJumpGameSteps(rawNums.length > 0 ? rawNums : [2, 3, 1, 1, 4]));
  },
  renderCanvas: (container, step) => renderJumpGameCanvas(container, step as JumpStep),
});
