/**
 * 跳跃游戏 I 可视化器（贪心算法）— 声明式 4-Card 标准架构
 * LeetCode 55：维护最大覆盖范围 (cover)，贪心推进直至覆盖终点
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  CAN_JUMP_PROBLEM_HTML,
  CAN_JUMP_ANALYSIS_HTML,
  CAN_JUMP_CODE_LANGUAGES,
} from './can-jump-problem-content';

export interface CanJumpStep {
  array: number[];
  currentIndex: number;
  maxReach: number;
  prevMaxReach: number;
  canJump: boolean;
  action: 'init' | 'scan' | 'extend' | 'blocked' | 'success' | 'done';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
}

export function canJumpSteps(arr: number[]): CanJumpStep[] {
  const steps: CanJumpStep[] = [];
  const n = arr.length;

  if (n === 0) return steps;
  if (n === 1) {
    steps.push({
      array: [...arr],
      currentIndex: 0,
      maxReach: 0,
      prevMaxReach: 0,
      canJump: true,
      action: 'success',
      message: '数组长度为 1，起始即在终点，直接返回 true',
      codeLine: 2,
    });
    return steps;
  }

  let cover = 0;
  let canReach = false;

  steps.push({
    array: [...arr],
    currentIndex: 0,
    maxReach: 0,
    prevMaxReach: 0,
    canJump: true,
    action: 'init',
    message: `初始化：nums = [${arr.join(', ')}]，初始最大覆盖范围 cover = 0`,
    codeLine: 3,
  });

  for (let i = 0; i <= cover; i++) {
    const reach = i + arr[i];
    const oldCover = cover;

    steps.push({
      array: [...arr],
      currentIndex: i,
      maxReach: cover,
      prevMaxReach: oldCover,
      canJump: true,
      action: 'scan',
      message: `🔍 位于下标 [${i}]=${arr[i]}，从该点最远可跳至下标 ${reach}`,
      codeLine: 5,
    });

    if (reach > cover) {
      cover = reach;
      steps.push({
        array: [...arr],
        currentIndex: i,
        maxReach: cover,
        prevMaxReach: oldCover,
        canJump: true,
        action: 'extend',
        message: `🌐 扩展覆盖范围：cover 从 ${oldCover} 推进至 ${cover}！`,
        codeLine: 5,
      });
    }

    if (cover >= n - 1) {
      canReach = true;
      steps.push({
        array: [...arr],
        currentIndex: i,
        maxReach: cover,
        prevMaxReach: oldCover,
        canJump: true,
        action: 'success',
        message: `🎉 成功覆盖终点！最大覆盖范围 cover=${cover} &ge; 终点下标 ${n - 1}，必定可达！`,
        codeLine: 6,
      });
      break;
    }
  }

  if (!canReach) {
    steps.push({
      array: [...arr],
      currentIndex: cover,
      maxReach: cover,
      prevMaxReach: cover,
      canJump: false,
      action: 'blocked',
      message: `❌ 无法前进：最大覆盖范围停留在下标 ${cover}，无法到达终点 ${n - 1}`,
      codeLine: 8,
    });
  }

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: CanJumpStep[]): CanJumpStep[] {
  return steps.map((s) => {
    const n = s.array.length;
    const curVal = s.currentIndex < n ? s.array[s.currentIndex] : 0;
    const reach = s.currentIndex + curVal;
    const isReach = s.maxReach >= n - 1;

    let action = s.action === 'extend' ? '🌐 覆盖范围扩大' : '🔍 正常推进';
    if (s.action === 'success') action = '🎉 覆盖终点 (返回 true)';
    else if (s.action === 'blocked') action = '❌ 覆盖受阻 (返回 false)';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-pos': `[${s.currentIndex}] (跳力: ${curVal})`,
        reach: `i + nums[i] = ${reach}`,
        cover: `0 ~ ${s.maxReach}`,
        'reach-goal': isReach ? '✓ 可达' : '⏳ 未达',
        action,
      },
    };
  });
}

export function renderCanJumpCanvas(container: HTMLElement, step: CanJumpStep): void {
  const arr = step.array;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const maxReach = step.maxReach;
  const isSuccess = step.action === 'success';
  const isBlocked = step.action === 'blocked';

  const cellsHtml = arr
    .map((val, idx) => {
      const isCurrent = idx === curIdx && !isSuccess && !isBlocked;
      const isCovered = idx <= maxReach;
      const isTarget = idx === n - 1;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#eff6ff';
        borderColor = '#2563eb';
        textColor = '#2563eb';
      } else if (isCovered) {
        bg = isSuccess && isTarget ? '#ecfdf5' : '#f5f3ff';
        borderColor = isSuccess && isTarget ? '#10b981' : '#c084fc';
        textColor = isSuccess && isTarget ? '#059669' : '#7e22ce';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9.5px; color: ${isCurrent ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 当前' : isTarget ? '🏁 终点' : `[${idx}]`}
          </span>
          <div style="width: 48px; height: 48px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 5px rgba(0,0,0,0.04); transition: all 0.15s;">
            <span>${val}</span>
            <span style="font-size: 8.5px; color: #94a3b8; font-weight: 600;">+${val}</span>
          </div>
          <span style="font-size: 9px; color: ${isCovered ? '#7e22ce' : '#cbd5e1'}; font-weight: 700;">
            ${isCovered ? '✓ 覆盖' : '未达'}
          </span>
        </div>
      `;
    })
    .join('');

  const coverPercent = Math.min(100, ((maxReach + 1) / n) * 100);

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 覆盖范围标尺带 -->
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>🌐 当前最远覆盖范围: 下标 0 ~ <strong style="color: #7e22ce; font-family: monospace;">${maxReach}</strong></span>
        <span style="color: ${isSuccess ? '#059669' : isBlocked ? '#dc2626' : '#2563eb'};">${coverPercent.toFixed(0)}% 进度</span>
      </div>
      <div style="background: #f1f5f9; border-radius: 999px; height: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(90deg, #3b82f6, #a855f7); width: ${coverPercent}%; height: 100%; transition: width 0.2s;"></div>
      </div>

      <!-- 单元格水平条 -->
      <div style="display: flex; gap: 10px; overflow-x: auto; justify-content: center; padding: 6px 0;">
        ${cellsHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'can-jump',
  name: '跳跃游戏 I',
  category: 'greedy',
  description: '维护最大跳跃覆盖范围，贪心判断能否到达数组末尾',
  icon: '🦘',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '理解贪心算法中覆盖范围（Cover Range）思想，避免陷入局部单步推导陷阱',
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
    { label: '示例 1 (可达 true)', values: { nums: '2,3,1,1,4' } },
    { label: '示例 2 (不可达 false)', values: { nums: '3,2,1,0,4' } },
    { label: '单元素 (true)', values: { nums: '0' } },
    { label: '长程跳跃', values: { nums: '1,1,1,3,0,0,0,0,4' } },
  ],
  metrics: [
    { id: 'cur-pos', label: '当前扫描位置', color: '#3b82f6' },
    { id: 'reach', label: '从该点可达', color: '#7e22ce' },
    { id: 'cover', label: '最远覆盖范围', color: '#a855f7' },
    { id: 'reach-goal', label: '终点可达性', color: '#059669' },
    { id: 'action', label: '贪心判定', color: '#2563eb' },
  ],
  legend: [
    { label: '🏁 终点目标', color: '#10b981' },
    { label: '📍 当前扫描格', color: '#3b82f6' },
    { label: '🌐 最大覆盖范围', color: '#a855f7' },
  ],
  codeLanguages: CAN_JUMP_CODE_LANGUAGES,
  problemHtml: CAN_JUMP_PROBLEM_HTML,
  analysisHtml: CAN_JUMP_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawNums = parseNumberList(inputs.nums, '2,3,1,1,4');
    return withMetrics(canJumpSteps(rawNums.length > 0 ? rawNums : [2, 3, 1, 1, 4]));
  },
  renderCanvas: (container, step) => renderCanJumpCanvas(container, step as CanJumpStep),
});
