import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export interface MaxSumKStep extends StepBase {
  array: number[];
  currentIndex: number;
  remainingK: number;
  currentSum: number;
  flippedIndices: number[];
  action: 'init' | 'sort' | 'flip_negative' | 'skip_positive' | 'flip_smallest' | 'done';
  message: string;
  decision?: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
  log?: string;
}

export const MAXIMIZE_SUM_K_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 4, python: 3, javascript: 2 },
  sort: { java: 3, cpp: 5, python: 4, javascript: 2 },
  skip: { java: 9, cpp: 9, python: 6, javascript: 4 },
  flipNeg: { java: 10, cpp: 10, python: 7, javascript: 5 },
  flipSmall: { java: 15, cpp: 14, python: 10, javascript: 9 },
  done: { java: 17, cpp: 17, python: 11, javascript: 10 },
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

function withMetrics(steps: MaxSumKStep[]): MaxSumKStep[] {
  return steps.map((s) => {
    const isFlipNeg = s.action === 'flip_negative';
    const isFlipSmall = s.action === 'flip_smallest';

    let action = '🔍 遍历扫描中';
    if (isFlipNeg) action = '🔄 贪心1: 大负数优先转正';
    else if (isFlipSmall) action = '⚖️ 贪心2: 奇数次翻转最小绝对值';
    else if (s.action === 'done') action = '🎉 完成';
    else if (s.action === 'sort') action = '🔀 绝对值降序排序';

    return {
      ...s,
      decision: s.decision ?? action,
      log: s.log ?? s.message,
      line: s.line ?? getLine(s.codeLine),
      metrics: {
        'remaining-k': String(s.remainingK),
        flipped: `${s.flippedIndices.length} 次`,
        sum: String(s.currentSum),
        array: `[${s.array.join(', ')}]`,
        action,
      },
    };
  });
}

export function buildMaxSumKSteps(rawArr: number[], initialK: number): MaxSumKStep[] {
  const steps: MaxSumKStep[] = [];
  const n = rawArr.length;
  const lines = MAXIMIZE_SUM_K_CODE_LINES;

  if (n === 0) {
    steps.push({
      array: [],
      currentIndex: -1,
      remainingK: initialK,
      currentSum: 0,
      flippedIndices: [],
      action: 'done',
      message: '数组为空，返回 0',
      decision: '空数组',
      codeLine: lines.guard,
      line: getLine(lines.guard),
    });
    return withMetrics(steps);
  }

  // 1. 按照绝对值从大到小排序
  const arr = [...rawArr].sort((a, b) => Math.abs(b) - Math.abs(a));
  let k = initialK;
  let currentSum = arr.reduce((acc, v) => acc + v, 0);
  const flippedIndices: number[] = [];

  steps.push({
    array: [...arr],
    currentIndex: -1,
    remainingK: k,
    currentSum,
    flippedIndices: [],
    action: 'sort',
    message: `第 1 步：按绝对值降序排序完成：nums = [${arr.join(', ')}]，初始总和 = ${currentSum}，剩余 K = ${k}`,
    decision: '按绝对值降序排序',
    codeLine: lines.sort,
    line: getLine(lines.sort),
  });

  // 2. 第一步贪心：遍历数组，遇到负数翻转为正数
  for (let i = 0; i < n; i++) {
    if (arr[i] < 0 && k > 0) {
      const oldVal = arr[i];
      arr[i] = -arr[i];
      k--;
      currentSum += 2 * arr[i]; // -oldVal 变为 +oldVal
      flippedIndices.push(i);

      steps.push({
        array: [...arr],
        currentIndex: i,
        remainingK: k,
        currentSum,
        flippedIndices: [...flippedIndices],
        action: 'flip_negative',
        message: `🔄 优先翻转绝对值大的负数：[${i}] 从 ${oldVal} &rarr; ${arr[i]}，和增加 ${2 * arr[i]}，剩余 K = ${k}`,
        decision: '翻转大负数',
        codeLine: lines.flipNeg,
        line: getLine(lines.flipNeg),
      });
    } else {
      steps.push({
        array: [...arr],
        currentIndex: i,
        remainingK: k,
        currentSum,
        flippedIndices: [...flippedIndices],
        action: 'skip_positive',
        message: `⏩ 下标 [${i}]=${arr[i]} 为非负数或 K 已耗尽，暂不翻转`,
        decision: '跳过非负数',
        codeLine: lines.skip,
        line: getLine(lines.skip),
      });
    }
  }

  // 3. 第二步贪心：如果 k 还有剩余且为奇数，翻转绝对值最小的元素 (arr[n - 1])
  if (k % 2 === 1) {
    const lastIdx = n - 1;
    const oldVal = arr[lastIdx];
    arr[lastIdx] = -arr[lastIdx];
    currentSum += 2 * arr[lastIdx];
    flippedIndices.push(lastIdx);

    steps.push({
      array: [...arr],
      currentIndex: lastIdx,
      remainingK: 0,
      currentSum,
      flippedIndices: [...flippedIndices],
      action: 'flip_smallest',
      message: `⚖️ 剩余 K=${k} 为奇数！翻转绝对值最小的尾部元素：[${lastIdx}] 从 ${oldVal} &rarr; ${arr[lastIdx]}，损失降至最低！`,
      decision: '翻转最小绝对值元素',
      codeLine: lines.flipSmall,
      line: getLine(lines.flipSmall),
    });
  } else if (k > 0) {
    steps.push({
      array: [...arr],
      currentIndex: -1,
      remainingK: 0,
      currentSum,
      flippedIndices: [...flippedIndices],
      action: 'skip_positive',
      message: `⚖️ 剩余 K=${k} 为偶数！在同一元素上反复翻转两次即抵消，对总和无损害`,
      decision: '偶数次抵消',
      codeLine: lines.skip,
      line: getLine(lines.skip),
    });
  }

  steps.push({
    array: [...arr],
    currentIndex: -1,
    remainingK: 0,
    currentSum,
    flippedIndices: [...flippedIndices],
    action: 'done',
    message: `🎉 贪心取反完成！修改后数组可能的最大和为 ${currentSum}`,
    decision: '贪心取反完成',
    codeLine: lines.done,
    line: getLine(lines.done),
  });

  return withMetrics(steps);
}
