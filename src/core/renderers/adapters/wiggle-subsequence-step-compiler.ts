import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export const WIGGLE_SUBSEQUENCE_CODE_LINES: Record<string, HighlightTarget> = {
  entry: { java: 1, cpp: 3, python: 2, javascript: 1 },
  guard: {
    java: 2,
    cpp: 4,
    python: { primary: 4, context: [3] },
    javascript: 2,
  },
  init: {
    java: { primary: 5, context: [3, 4] },
    cpp: { primary: 7, context: [5, 6] },
    python: { primary: 7, context: [5, 6] },
    javascript: { primary: 5, context: [3, 4] },
  },
  peakOrValley: {
    java: { primary: 10, context: [6, 7, 9, 11] },
    cpp: { primary: 11, context: [8, 9, 10, 12] },
    python: { primary: 11, context: [8, 9, 10, 12] },
    javascript: { primary: 9, context: [6, 7, 8, 10] },
  },
  flatOrMono: {
    java: { primary: 9, context: [6, 7] },
    cpp: { primary: 10, context: [8, 9] },
    python: { primary: 10, context: [8, 9] },
    javascript: { primary: 8, context: [6, 7] },
  },
  success: { java: 14, cpp: 15, python: 13, javascript: 13 },
};

export interface WiggleStep extends StepBase {
  array: number[];
  currentIndex: number;
  length: number;
  trend: '↑' | '↓' | '-';
  curDiff: number;
  prevDiff: number;
  wiggleIndices: number[];
  skippedIndices: number[];
  decision?: string;
  message: string;
  action: 'init' | 'peak_or_valley' | 'flat_or_mono' | 'done';
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
  log?: string;
}

function getLine(target: HighlightTarget): number {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null && 'java' in target) {
    const j = (target as any).java;
    if (typeof j === 'number') return j;
    if (j && typeof j.primary === 'number') return j.primary;
  }
  return 1;
}

function withMetrics(steps: WiggleStep[]): WiggleStep[] {
  return steps.map((s) => {
    const isPeak = s.action === 'peak_or_valley';
    const isFlat = s.action === 'flat_or_mono';

    let action = '🏁 初始起点';
    if (isPeak) action = '⛰️ 构成波峰/波谷 (保留)';
    else if (isFlat) action = '🚫 单调坡/平坡 (删除)';
    else if (s.action === 'done') action = '🎉 完成';

    const diffText = s.curDiff > 0 ? `+${s.curDiff} (↑ 上升)` : s.curDiff < 0 ? `${s.curDiff} (↓ 下降)` : '0 (平坡)';

    return {
      ...s,
      decision: s.decision ?? action,
      log: s.log ?? s.message,
      line: s.line ?? getLine(s.codeLine),
      metrics: {
        'cur-diff': diffText,
        'prev-diff': String(s.prevDiff),
        'wiggle-len': String(s.length),
        sequence: `[${s.wiggleIndices.map((i) => s.array[i]).join(', ')}]`,
        action,
      },
    };
  });
}

export function wiggleSubsequenceSteps(nums: number[]): WiggleStep[] {
  const steps: WiggleStep[] = [];
  const n = nums.length;
  const lines = WIGGLE_SUBSEQUENCE_CODE_LINES;

  if (n <= 1) {
    steps.push({
      array: [...nums],
      currentIndex: 0,
      length: n,
      trend: '-',
      curDiff: 0,
      prevDiff: 0,
      wiggleIndices: n === 1 ? [0] : [],
      skippedIndices: [],
      message: n === 0 ? '空数组，摆动长度为 0' : `单元素数组 [${nums[0]}]，摆动长度为 1`,
      decision: n === 0 ? '空数组' : '单元素完成',
      action: 'done',
      codeLine: lines.guard,
      line: getLine(lines.guard),
    });
    return withMetrics(steps);
  }

  let count = 1;
  let prevDiff = 0;
  const wiggleIndices: number[] = [0];
  const skippedIndices: number[] = [];

  steps.push({
    array: [...nums],
    currentIndex: 0,
    length: count,
    trend: '-',
    curDiff: 0,
    prevDiff: 0,
    wiggleIndices: [...wiggleIndices],
    skippedIndices: [...skippedIndices],
    message: `初始化：默认选中首元素 nums[0]=${nums[0]}，当前摆动序列长度 = 1`,
    decision: '选中首元素',
    action: 'init',
    codeLine: lines.init,
    line: getLine(lines.init),
  });

  for (let i = 0; i < n - 1; i++) {
    const curDiff = nums[i + 1] - nums[i];
    let trend: '↑' | '↓' | '-' = '-';
    if (curDiff > 0) trend = '↑';
    else if (curDiff < 0) trend = '↓';

    const isPeakOrValley = (prevDiff <= 0 && curDiff > 0) || (prevDiff >= 0 && curDiff < 0);

    if (isPeakOrValley) {
      count++;
      wiggleIndices.push(i + 1);

      steps.push({
        array: [...nums],
        currentIndex: i + 1,
        length: count,
        trend,
        curDiff,
        prevDiff,
        wiggleIndices: [...wiggleIndices],
        skippedIndices: [...skippedIndices],
        message: `检查差值：prevDiff=${prevDiff}，curDiff=${curDiff} (${trend}) → 出现摆动转折峰谷！保留节点 nums[${i + 1}]=${nums[i + 1]}，长度更新为 ${count}`,
        decision: '保留峰谷节点',
        action: 'peak_or_valley',
        codeLine: lines.peakOrValley,
        line: getLine(lines.peakOrValley),
      });

      prevDiff = curDiff;
    } else {
      skippedIndices.push(i + 1);

      steps.push({
        array: [...nums],
        currentIndex: i + 1,
        length: count,
        trend,
        curDiff,
        prevDiff,
        wiggleIndices: [...wiggleIndices],
        skippedIndices: [...skippedIndices],
        message: `检查差值：prevDiff=${prevDiff}，curDiff=${curDiff} (${trend}) → 单调斜坡/平坡连续延伸，贪心过滤中间节点 nums[${i + 1}]=${nums[i + 1]}`,
        decision: '过滤单调/平坡节点',
        action: 'flat_or_mono',
        codeLine: lines.flatOrMono,
        line: getLine(lines.flatOrMono),
      });
    }
  }

  steps.push({
    array: [...nums],
    currentIndex: n - 1,
    length: count,
    trend: '-',
    curDiff: 0,
    prevDiff,
    wiggleIndices: [...wiggleIndices],
    skippedIndices: [...skippedIndices],
    message: `遍历完成！最长摆动子序列长度为 ${count}，选中节点集合: [${wiggleIndices.map((idx) => nums[idx]).join(', ')}]`,
    decision: '遍历完成',
    action: 'done',
    codeLine: lines.success,
    line: getLine(lines.success),
  });

  return withMetrics(steps);
}
