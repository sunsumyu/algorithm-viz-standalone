/**
 * 跳跃游戏 II 可视化器（贪心算法）— 声明式 4-Card 标准架构
 * LeetCode 45：维护当前步最远边界 (curDistance) 与下一步最远边界 (nextDistance)，触碰边界即贪心跳跃
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import type { HighlightTarget } from '../../../core/step-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
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
  codeLine: HighlightTarget;
  vars?: Array<{ name: string; value: string | number; type?: string }>;
  metrics?: Record<string, string>;
}

export const JUMP_GAME_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 2, python: 2, javascript: 2 },
  init: { java: 3, cpp: 3, python: 3, javascript: 3 },
  scan: { java: 5, cpp: 5, python: 5, javascript: 5 },
  check: { java: 6, cpp: 6, python: 6, javascript: 6 },
  jump: { java: 7, cpp: 7, python: 7, javascript: 7 },
  done: { java: 11, cpp: 11, python: 9, javascript: 11 },
};

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
      codeLine: JUMP_GAME_CODE_LINES.guard,
      vars: [{ name: 'nums.length', value: n }, { name: 'steps', value: 0 }],
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
    message: `初始化状态：nums = [${arr.join(', ')}]，curEnd=0, nextReach=0, steps=0`,
    log: `init: jumps=0, boundary=0, farthest=0`,
    codeLine: JUMP_GAME_CODE_LINES.init,
    vars: [
      { name: 'curEnd', value: 0 },
      { name: 'nextReach', value: 0 },
      { name: 'steps', value: 0 },
    ],
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
      message: `🔍 扫描下标 [${i}]=${arr[i]}，从该点可达下标 ${reach}，更新下一步最远 nextReach=${nextDistance}`,
      log: `scan i=${i}: reach=${reach}, nextReach=${nextDistance}`,
      codeLine: JUMP_GAME_CODE_LINES.scan,
      vars: [
        { name: 'i', value: i },
        { name: 'reach', value: reach },
        { name: 'nextReach', value: nextDistance },
        { name: 'curEnd', value: curDistance },
        { name: 'steps', value: jumps },
      ],
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
        message: `🦘 到达当前跳跃边界 [${i}]！必须跳跃一次，steps=${jumps}，新边界推进至 [${curDistance}]`,
        log: `jump #${jumps}: ${prevBoundary} → ${curDistance}`,
        codeLine: JUMP_GAME_CODE_LINES.jump,
        vars: [
          { name: 'i', value: i },
          { name: 'curEnd', value: curDistance },
          { name: 'steps', value: jumps },
        ],
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
    codeLine: JUMP_GAME_CODE_LINES.done,
    vars: [
      { name: 'return steps', value: jumps },
    ],
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: JumpStep[]): JumpStep[] {
  return steps.map((s) => {
    let action = s.isJump ? '🦘 触碰边界 (steps++)' : '🔍 扫描边界内节点';
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
      let shadow = '0 2px 5px rgba(0,0,0,0.04)';

      if (isCurrent) {
        bg = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        borderColor = '#1d4ed8';
        textColor = '#ffffff';
        shadow = '0 4px 12px rgba(59,130,246,0.3)';
      } else if (isAtCurBound) {
        bg = 'linear-gradient(135deg, #a78bfa, #7c3aed)';
        borderColor = '#6d28d9';
        textColor = '#ffffff';
        shadow = '0 4px 12px rgba(124,58,237,0.3)';
      } else if (isWithinCurBound) {
        bg = '#f5f3ff';
        borderColor = '#c4b5fd';
        textColor = '#5b21b6';
      }

      if (isDone && isTarget) {
        bg = 'linear-gradient(135deg, #10b981, #059669)';
        borderColor = '#047857';
        textColor = '#ffffff';
        shadow = '0 4px 12px rgba(16,185,129,0.3)';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <span style="font-size: 10px; color: ${isCurrent ? '#2563eb' : isAtCurBound ? '#7c3aed' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 当前' : isAtCurBound ? '🚪 边界' : isTarget ? '🏁 终点' : `[${idx}]`}
          </span>
          <div style="width: 56px; height: 56px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: ${shadow}; transition: all 0.2s;">
            <span>${val}</span>
            <span style="font-size: 9px; color: ${isCurrent || isAtCurBound || (isDone && isTarget) ? 'rgba(255,255,255,0.8)' : '#94a3b8'}; font-weight: 600;">+${val}</span>
          </div>
          <span style="font-size: 10px; color: ${isWithinCurBound ? '#7c3aed' : '#cbd5e1'}; font-weight: 700;">
            ${isWithinCurBound ? '✓ 可达' : '✗ 未及'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; box-sizing: border-box;">
      <!-- 边界双指示条 -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 10px; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569;">
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #7c3aed;"></span>
          🚪 当前步边界: 下标 <strong style="color: #7c3aed; font-family: monospace; font-size: 13px;">[${curBound}]</strong>
        </span>
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #059669;"></span>
          🌐 下一步最远: 下标 <strong style="color: #059669; font-family: monospace; font-size: 13px;">[${nextBound}]</strong>
        </span>
      </div>

      <!-- 单元格水平条 -->
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 10px; border: 1px solid #e2e8f0; padding: 16px;">
        <div style="display: flex; gap: 12px; overflow-x: auto; padding: 8px 0;">
          ${cellsHtml}
        </div>
      </div>
    </div>
  `;
}

registerAlgorithm({
  id: 'jump-game',
  name: '跳跃游戏 II',
  viewId: 'jump-game',
  category: 'greedy',
  icon: '🦘',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握跳跃游戏 II 中双边界推进与最小步数贪心触发机制',
  description: '求到达数组末尾的最少跳跃次数，触碰当前步覆盖边界即贪心跳跃',
  template: `<div id="jump-game" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerJumpGame(): void {
  // 保持向前兼容导出
}
