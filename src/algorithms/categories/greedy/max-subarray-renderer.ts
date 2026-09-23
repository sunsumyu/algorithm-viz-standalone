/**
 * 最大子数组和可视化器（贪心算法 Kadane）— 声明式 4-Card 标准架构
 * LeetCode 53：连续和为负数时果断清零，贪心捕捉全局峰值
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import type { HighlightTarget } from '../../../core/step-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  MAX_SUBARRAY_PROBLEM_HTML,
  MAX_SUBARRAY_ANALYSIS_HTML,
  MAX_SUBARRAY_CODE_LANGUAGES,
} from './max-subarray-problem-content';

export type MSPhase = 'init' | 'reset' | 'extend' | 'new-max' | 'done';

export interface MSSStep {
  array: number[];
  currentIndex: number;
  currentSum: number;
  maxSum: number;
  maxStart: number;
  maxEnd: number;
  currentStart: number;
  phase: MSPhase;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export const MAX_SUBARRAY_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 4, python: 3, javascript: 2 },
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  extend: { java: 6, cpp: 7, python: 6, javascript: 5 },
  newMax: { java: 8, cpp: 9, python: 8, javascript: 7 },
  reset: { java: 11, cpp: 12, python: 10, javascript: 10 },
  done: { java: 14, cpp: 15, python: 11, javascript: 13 },
};

export function buildMaxSubarraySteps(arr: number[]): MSSStep[] {
  const steps: MSSStep[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({
      array: [],
      currentIndex: -1,
      currentSum: 0,
      maxSum: 0,
      maxStart: -1,
      maxEnd: -1,
      currentStart: -1,
      phase: 'done',
      message: '输入为空，返回 0',
      log: 'init: empty',
      codeLine: MAX_SUBARRAY_CODE_LINES.guard,
    });
    return steps;
  }

  let currentSum = 0;
  let maxSum = arr[0];
  let maxStart = 0;
  let maxEnd = 0;
  let currentStart = 0;

  steps.push({
    array: [...arr],
    currentIndex: -1,
    currentSum: 0,
    maxSum,
    maxStart: 0,
    maxEnd: 0,
    currentStart: 0,
    phase: 'init',
    message: `初始化：nums = [${arr.join(', ')}]，初始最大和 maxSum = ${maxSum}`,
    log: `init: max=${maxSum}, cur=0`,
    codeLine: MAX_SUBARRAY_CODE_LINES.init,
  });

  for (let i = 0; i < n; i++) {
    currentSum += arr[i];

    if (currentSum > maxSum) {
      maxSum = currentSum;
      maxStart = currentStart;
      maxEnd = i;
      steps.push({
        array: [...arr],
        currentIndex: i,
        currentSum,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        phase: 'new-max',
        message: `★ 刷新全局最大和！nums[${i}]=${arr[i]}，当前累加和=${currentSum}，刷新最高值 maxSum=${maxSum} [${maxStart}..${maxEnd}]`,
        log: `new-max @ ${i}: max=${maxSum}, range=[${maxStart}..${maxEnd}]`,
        codeLine: MAX_SUBARRAY_CODE_LINES.newMax,
      });
    } else {
      steps.push({
        array: [...arr],
        currentIndex: i,
        currentSum,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        phase: 'extend',
        message: `➕ 加入 nums[${i}]=${arr[i]}，当前区间和 currentSum=${currentSum} (未超过历史最大和 ${maxSum})`,
        log: `extend @ ${i}: +${arr[i]}, cur=${currentSum}`,
        codeLine: MAX_SUBARRAY_CODE_LINES.extend,
      });
    }

    if (currentSum < 0) {
      currentSum = 0;
      currentStart = i + 1;
      steps.push({
        array: [...arr],
        currentIndex: i,
        currentSum: 0,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        phase: 'reset',
        message: `⚠️ 负和拉低：当前累加和 < 0，只会拖累后续求和，贪心清零 count=0，重置下一区间起点为 ${i + 1}`,
        log: `reset @ ${i}: curSum -> 0, next_start=${i + 1}`,
        codeLine: MAX_SUBARRAY_CODE_LINES.reset,
      });
    }
  }

  steps.push({
    array: [...arr],
    currentIndex: n - 1,
    currentSum,
    maxSum,
    maxStart,
    maxEnd,
    currentStart,
    phase: 'done',
    message: `🎉 扫描完成！最大连续子数组和为 ${maxSum}，对应区间为 nums[${maxStart}..${maxEnd}]`,
    log: `done: max=${maxSum}, range=[${maxStart}..${maxEnd}]`,
    codeLine: MAX_SUBARRAY_CODE_LINES.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: MSSStep[]): MSSStep[] {
  return steps.map((s) => {
    let action = '➕ 正常累加';
    if (s.phase === 'new-max') action = '★ 刷新最高和';
    else if (s.phase === 'reset') action = '⚠️ 负和清零 (重置)';
    else if (s.phase === 'init') action = '初始化';
    else if (s.phase === 'done') action = '🏁 扫描完成';

    const bestSubarray = s.array.slice(s.maxStart, s.maxEnd + 1);

    return {
      ...s,
      metrics: {
        'cur-sum': String(s.currentSum),
        'max-sum': String(s.maxSum),
        'best-range': `nums[${s.maxStart}..${s.maxEnd}] = [${bestSubarray.join(', ')}]`,
        'cur-range': `[${s.currentStart}..${s.currentIndex >= 0 ? s.currentIndex : 0}]`,
        action,
      },
    };
  });
}

export function renderMaxSubarrayCanvas(container: HTMLElement, step: MSSStep): void {
  const arr = step.array;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const isDone = step.phase === 'done';
  const curIdx = step.currentIndex;
  const curStart = step.currentStart;
  const maxStart = step.maxStart;
  const maxEnd = step.maxEnd;

  const maxAbs = Math.max(...arr.map((v) => Math.abs(v)), 1);

  const barsHtml = arr
    .map((val, idx) => {
      const isCurrentCursor = !isDone && idx === curIdx;
      const isInCurrentWindow = !isDone && idx >= curStart && idx <= curIdx;
      const isInBestWindow = isDone || (idx >= maxStart && idx <= maxEnd);

      const barHeight = Math.max(12, (Math.abs(val) / maxAbs) * 60);

      let barBg = '#94a3b8';
      let borderColor = '#cbd5e1';
      let textColor = '#0f172a';

      if (isCurrentCursor) {
        barBg = '#3b82f6';
        borderColor = '#1d4ed8';
        textColor = '#1d4ed8';
      } else if (isInBestWindow && isDone) {
        barBg = '#10b981';
        borderColor = '#059669';
        textColor = '#059669';
      } else if (isInCurrentWindow) {
        barBg = '#60a5fa';
        borderColor = '#3b82f6';
        textColor = '#2563eb';
      } else if (val < 0) {
        barBg = '#f87171';
        borderColor = '#ef4444';
        textColor = '#dc2626';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 10px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace;">
            ${val}
          </span>
          <div style="width: 28px; height: 70px; display: flex; align-items: ${val >= 0 ? 'flex-end' : 'flex-start'}; justify-content: center; background: #f1f5f9; border-radius: 6px; padding: 2px;">
            <div style="width: 100%; height: ${barHeight}px; background: ${barBg}; border: 1px solid ${borderColor}; border-radius: 4px; transition: all 0.15s;"></div>
          </div>
          <span style="font-size: 8.5px; color: ${isCurrentCursor ? '#2563eb' : '#94a3b8'}; font-weight: 700; font-family: monospace;">
            [${idx}]
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; gap: 6px; overflow-x: auto; justify-content: center; padding-bottom: 4px;">
        ${barsHtml}
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: #64748b; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
        <span>当前扫描区间: <strong style="color:#2563eb; font-family:monospace;">[${curStart}..${curIdx >= 0 ? curIdx : 0}]</strong></span>
        <span>历史最大区间: <strong style="color:#059669; font-family:monospace;">[${maxStart}..${maxEnd}]</strong></span>
      </div>
    </div>
  `;
}

registerAlgorithm({
  id: 'max-subarray',
  name: '最大子数组和',
  viewId: 'max-subarray',
  category: 'greedy',
  icon: '📊',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握贪心算法在连续子数组求和中的局部最优（负和清零）与全局最优（最大和），理解Kadane算法四阶段演进',
  description: 'Kadane 贪心算法，连续累加和小于 0 时立即清零重新统计',
  template: `<div id="max-subarray" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerMaxSubarray(): void {
  // 保持向前兼容导出
}

