import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export interface MonotoneStep extends StepBase {
  originalNum: number;
  digits: number[];
  checkIndex: number;
  flag: number;
  action: 'init' | 'check_ok' | 'borrow' | 'fill_9' | 'done';
  message: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
  log?: string;
}

export const MONOTONE_DIGITS_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 1, cpp: 3, python: 2, javascript: 1 },
  init: { java: 4, cpp: 5, python: 4, javascript: 3 },
  checkOk: { java: 7, cpp: 7, python: 6, javascript: 5 },
  borrow: { java: 8, cpp: 8, python: 7, javascript: 6 },
  fill9: { java: 14, cpp: 13, python: 10, javascript: 11 },
  done: { java: 16, cpp: 15, python: 11, javascript: 13 },
};

export function parseNumber(raw: string | number): number {
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  const parsed = parseInt(String(raw).trim(), 10);
  return Number.isNaN(parsed) ? 332 : parsed;
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

function withMetrics(steps: MonotoneStep[]): MonotoneStep[] {
  return steps.map((s) => {
    const n = s.digits.length;
    const idx = s.checkIndex;
    const hasPair = idx > 0 && idx < n;
    const isBorrow = s.action === 'borrow';
    const isFill9 = s.action === 'fill_9';

    let action = '✓ 单调递增无违背';
    if (isBorrow) action = '⚠️ 高位 > 低位 (借位减1，更新flag)';
    else if (isFill9) action = '9️⃣ 后续低位全置 9 (最大化)';
    else if (s.action === 'done') action = '🎉 完成';

    const currentVal = parseInt(s.digits.join(''), 10);

    return {
      ...s,
      line: getLine(s.codeLine),
      log: s.message,
      metrics: {
        pair: hasPair ? `digits[${idx - 1}](${s.digits[idx - 1]}) vs digits[${idx}](${s.digits[idx]})` : '—',
        flag: s.flag < n ? `下标 [${s.flag}]` : '未触发借位',
        value: String(currentVal),
        digits: `[${s.digits.join('')}]`,
        action,
      },
    };
  });
}

export function buildMonotoneDigitsSteps(num: number): MonotoneStep[] {
  const steps: MonotoneStep[] = [];
  const digits = String(num)
    .split('')
    .map(Number);
  const n = digits.length;

  if (n <= 1) {
    steps.push({
      originalNum: num,
      digits: [...digits],
      checkIndex: -1,
      flag: n,
      action: 'done',
      message: `数字 ${num} 仅有 1 位，天然满足单调递增，直接返回 ${num}`,
      codeLine: MONOTONE_DIGITS_CODE_LINES.guard,
    });
    return withMetrics(steps);
  }

  let flag = n;

  steps.push({
    originalNum: num,
    digits: [...digits],
    checkIndex: -1,
    flag,
    action: 'init',
    message: `初始化：将数字 ${num} 拆解为 ${n} 位数数组 [${digits.join(', ')}]，初始变9标记 flag = ${flag}`,
    codeLine: MONOTONE_DIGITS_CODE_LINES.init,
  });

  // 1. 从右往左逆序扫描
  for (let i = n - 1; i > 0; i--) {
    if (digits[i - 1] > digits[i]) {
      digits[i - 1]--;
      flag = i;

      steps.push({
        originalNum: num,
        digits: [...digits],
        checkIndex: i,
        flag,
        action: 'borrow',
        message: `⚠️ 逆序比较 [${i - 1}] 位 (${digits[i - 1] + 1}) > [${i}] 位 (${digits[i]}) 违反单调递增！高位借位减 1 变为 ${digits[i - 1]}，更新变9起点 flag = ${flag}`,
        codeLine: MONOTONE_DIGITS_CODE_LINES.borrow,
      });
    } else {
      steps.push({
        originalNum: num,
        digits: [...digits],
        checkIndex: i,
        flag,
        action: 'check_ok',
        message: `✓ 逆序比较 [${i - 1}] 位 (${digits[i - 1]}) ≤ [${i}] 位 (${digits[i]})，满足单调递增，继续向左扫描`,
        codeLine: MONOTONE_DIGITS_CODE_LINES.checkOk,
      });
    }
  }

  // 2. 将 flag 之后的数字全部置为 9
  if (flag < n) {
    for (let i = flag; i < n; i++) {
      digits[i] = 9;
    }

    steps.push({
      originalNum: num,
      digits: [...digits],
      checkIndex: -1,
      flag,
      action: 'fill_9',
      message: `9️⃣ 统一将 flag=[${flag}] 及后续所有低位全部置为 9，使数值在满足单调递增前提下最大化！`,
      codeLine: MONOTONE_DIGITS_CODE_LINES.fill9,
    });
  }

  const resultNum = parseInt(digits.join(''), 10);

  steps.push({
    originalNum: num,
    digits: [...digits],
    checkIndex: -1,
    flag,
    action: 'done',
    message: `🎉 计算完成！小于或等于 ${num} 的最大单调递增整数为 ${resultNum}`,
    codeLine: MONOTONE_DIGITS_CODE_LINES.done,
  });

  return withMetrics(steps);
}
