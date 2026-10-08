import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export type MSPhase = 'init' | 'reset' | 'extend' | 'new-max' | 'done';

export interface MSSStep extends StepBase {
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
  decision?: string;
  codeLine: HighlightTarget;
  line?: number;
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

function getLine(target: HighlightTarget): number {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null && 'java' in target) {
    const j = (target as any).java;
    if (typeof j === 'number') return j;
    if (j && typeof j.primary === 'number') return j.primary;
  }
  return 1;
}

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
      decision: s.decision ?? action,
      line: s.line ?? getLine(s.codeLine),
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

export function buildMaxSubarraySteps(arr: number[]): MSSStep[] {
  const steps: MSSStep[] = [];
  const n = arr.length;
  const lines = MAX_SUBARRAY_CODE_LINES;

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
      decision: '空输入',
      codeLine: lines.guard,
      line: getLine(lines.guard),
    });
    return withMetrics(steps);
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
    decision: '初始化',
    codeLine: lines.init,
    line: getLine(lines.init),
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
        decision: '刷新最大和',
        codeLine: lines.newMax,
        line: getLine(lines.newMax),
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
        decision: '正常扩展',
        codeLine: lines.extend,
        line: getLine(lines.extend),
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
        decision: '负和清零',
        codeLine: lines.reset,
        line: getLine(lines.reset),
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
    decision: '扫描完成',
    codeLine: lines.done,
    line: getLine(lines.done),
  });

  return withMetrics(steps);
}
