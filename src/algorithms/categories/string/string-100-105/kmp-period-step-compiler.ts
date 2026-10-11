/**
 * Class 101: KMP 循环节与周期串检测
 * Step Compiler
 */

import { KMP_PERIOD_LINES } from './string-100-105-stage-codes';
import { String100Step } from './string-100-105-shared';

export interface KmpPeriodStep extends String100Step {
  s: string;
  n: number;
  nextArr: number[];
  maxPrefixSuffix: number;
  periodLen: number;
  isDivisible: boolean;
  repeatCount: number;
}

export function computeNextArrayWithLength(s: string): number[] {
  const n = s.length;
  const next = new Array(n + 1).fill(0);
  next[0] = -1;
  if (n >= 1) next[1] = 0;
  let i = 2;
  let cn = 0;
  while (i <= n) {
    if (s[i - 1] === s[cn]) {
      next[i++] = ++cn;
    } else if (cn > 0) {
      cn = next[cn];
    } else {
      next[i++] = 0;
    }
  }
  return next;
}

export function buildKmpPeriodSteps(s: string): KmpPeriodStep[] {
  const steps: KmpPeriodStep[] = [];
  const lines = KMP_PERIOD_LINES;
  const n = s.length;

  // Step 0: 入口
  steps.push({
    s,
    n,
    nextArr: [],
    maxPrefixSuffix: 0,
    periodLen: n,
    isDivisible: false,
    repeatCount: 1,
    decision: `主函数入口：接收字符串 s="${s}"，长度 n=${n}`,
    message: '准备利用 KMP next[n] 求最长相等前后缀，从而计算最小正周期',
    log: `enter getMinPeriod(s="${s}")`,
    codeLine: lines.entry,
    metrics: { '字符串长度 n': n, '当前状态': '准备推导' },
  });

  // Step 1: 边界特判
  if (n <= 1) {
    steps.push({
      s,
      n,
      nextArr: n === 1 ? [-1, 0] : [-1],
      maxPrefixSuffix: 0,
      periodLen: n,
      isDivisible: true,
      repeatCount: 1,
      decision: `边界特判：长度 n=${n} <= 1，最小正周期为自身长度 ${n}`,
      message: '单字符或空串自身即为最小周期',
      log: `guard check, return ${n}`,
      codeLine: lines.guard,
      metrics: { '最小周期': n, '重复次数': 1 },
      statusBadge: { text: `周期 = ${n}`, type: 'success' },
    });
    return steps;
  }

  // Step 2: 生成 next 数组
  const nextArr = computeNextArrayWithLength(s);
  const maxPrefixSuffix = nextArr[n];

  steps.push({
    s,
    n,
    nextArr,
    maxPrefixSuffix,
    periodLen: n,
    isDivisible: false,
    repeatCount: 1,
    decision: `计算最长相等前后缀：next[n=${n}] = ${maxPrefixSuffix}`,
    message: `字符串 s 前缀 s[0..${maxPrefixSuffix - 1}] 与后缀 s[${n - maxPrefixSuffix}..${n - 1}] 完全相同！`,
    log: `next[${n}] = ${maxPrefixSuffix}`,
    codeLine: lines.calcNext,
    metrics: { '最长前后缀长度': maxPrefixSuffix },
    statusBadge: { text: `LPS = ${maxPrefixSuffix}`, type: 'info' },
  });

  // Step 3: 计算潜在周期长度
  const periodLen = n - maxPrefixSuffix;
  const isDivisible = n % periodLen === 0;
  const repeatCount = isDivisible ? n / periodLen : 1;

  steps.push({
    s,
    n,
    nextArr,
    maxPrefixSuffix,
    periodLen,
    isDivisible,
    repeatCount,
    decision: `周期长度推导：period = n - next[n] = ${n} - ${maxPrefixSuffix} = ${periodLen}`,
    message: `根据错位平移定理，若存在周期则周期必须为 ${periodLen}`,
    log: `periodLen = ${n} - ${maxPrefixSuffix} = ${periodLen}`,
    codeLine: lines.calcPeriod,
    metrics: { '潜在周期': periodLen, '整除条件': `${n} % ${periodLen} == ${n % periodLen}` },
  });

  // Step 4: 校验整除性
  steps.push({
    s,
    n,
    nextArr,
    maxPrefixSuffix,
    periodLen,
    isDivisible,
    repeatCount,
    decision: isDivisible
      ? `整除检验成立：n % period = ${n} % ${periodLen} == 0！存在整除真周期`
      : `整除检验不成立：n % period = ${n} % ${periodLen} = ${n % periodLen} != 0，无法整除`,
    message: isDivisible
      ? `最小正周期为 ${periodLen}，重复了 ${repeatCount} 次`
      : `无法由完整周期平铺构成，最小正周期只能是自身长度 ${n}`,
    log: `divisible check: ${isDivisible}`,
    codeLine: lines.checkDiv,
    metrics: { '整除判定': isDivisible ? '可整除 ✓' : '不可整除 ✗' },
    statusBadge: isDivisible ? { text: `周期 = ${periodLen}`, type: 'success' } : { text: '无真周期', type: 'warning' },
  });

  // Step 5: 最终返回
  const ans = isDivisible ? periodLen : n;
  steps.push({
    s,
    n,
    nextArr,
    maxPrefixSuffix,
    periodLen,
    isDivisible,
    repeatCount,
    decision: isDivisible
      ? `🏆 判定结论：最小正周期长度为 ${periodLen}（重复模式串 "${s.slice(0, periodLen)}"，共 ${repeatCount} 次）`
      : `🏁 判定结论：无更小整除周期，最小周期为全串长度 ${n}`,
    message: `返回 ${ans}`,
    log: `return ${ans}`,
    codeLine: lines.returnAns,
    metrics: { '最小正周期': ans, '重复周期数': repeatCount },
    statusBadge: { text: `最终周期: ${ans}`, type: 'success' },
  });

  return steps;
}
