import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 数字 1 的个数 (Number of Digit One)
 * LeetCode 233 / 左程云算法通关课 第084讲 数位DP
 * 按位拆分统计：对于每一数位（个位、十位、百位...），分别统计数字 1 在该位出现的次数。
 */
export const CountDigitOneSpec: AlgorithmSpec = {
  id: 'count-digit-one',
  name: '数字 1 的个数 (Number of Digit One)',
  category: '数位 DP',
  description:
    '给定一个整数 n，计算所有小于等于 n 的非负整数中数字 1 出现的总次数。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 233,
    leetcodeUrl: 'https://leetcode.cn/problems/number-of-digit-one/',
    difficulty: 'hard',
    tags: ['递归', '数学', '动态规划', '数位DP'],
    description:
      '给定一个整数 <code>n</code>，计算所有小于等于 <code>n</code> 的非负整数中数字 <code>1</code> 出现的个数。<br/><br/><strong>数位分析法：</strong>依次固定个位、十位、百位为 1，将数字分为高位部分 <code>high</code>、当前位 <code>cur</code> 与低位部分 <code>low</code>：<br/>• 当 <code>cur == 0</code> 时：出现次数为 <code>high * base</code>；<br/>• 当 <code>cur == 1</code> 时：出现次数为 <code>high * base + low + 1</code>；<br/>• 当 <code>cur > 1</code> 时：出现次数为 <code>(high + 1) * base</code>。',
    examples: [
      {
        input: 'n = 13',
        output: '6',
        explanation: '数字 1 出现在 1, 10, 11, 12, 13 中，其中 11 包含两个 1，总共 6 个。',
      },
      {
        input: 'n = 0',
        output: '0',
        explanation: '小于等于 0 的非负整数中没有数字 1。',
      },
    ],
    constraints: [
      '0 <= n <= 10^9',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: 5, cpp: 6, python: 5, javascript: 4 },
    loopCheck: { java: 7, cpp: 8, python: 7, javascript: 6 },
    stateTransfer: {
      java: [8, 9, 10, 11, 12, 13, 14],
      cpp: [9, 10, 11, 12, 13, 14, 15],
      python: [8, 9, 10, 11, 12, 13, 14],
      javascript: [7, 8, 9, 10, 11, 12, 13],
    },
    loopExit: { java: 16, cpp: 17, python: 15, javascript: 15 },
    returnResult: { java: 17, cpp: 18, python: 16, javascript: 16 },
  },
  code: {
    languages: {
      javascript: [
        'function countDigitOne(n) {',
        '  if (n <= 0) return 0;',
        '  let count = 0;',
        '  let base = 1;',
        '  while (base <= n) {',
        '    const high = Math.floor(n / (base * 10));',
        '    const cur = Math.floor(n / base) % 10;',
        '    const low = n % base;',
        '    if (cur === 0) {',
        '      count += high * base;',
        '    } else if (cur === 1) {',
        '      count += high * base + low + 1;',
        '    } else {',
        '      count += (high + 1) * base;',
        '    }',
        '    base *= 10;',
        '  }',
        '  return count;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int countDigitOne(int n) {',
        '        if (n <= 0) return 0;',
        '        long count = 0, base = 1;',
        '        while (base <= n) {',
        '            long high = n / (base * 10);',
        '            long cur = (n / base) % 10;',
        '            long low = n % base;',
        '            if (cur == 0) {',
        '                count += high * base;',
        '            } else if (cur == 1) {',
        '                count += high * base + low + 1;',
        '            } else {',
        '                count += (high + 1) * base;',
        '            }',
        '            base *= 10;',
        '        }',
        '        return (int) count;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int countDigitOne(int n) {',
        '        if (n <= 0) return 0;',
        '        long long count = 0, base = 1;',
        '        while (base <= n) {',
        '            long long high = n / (base * 10);',
        '            long long cur = (n / base) % 10;',
        '            long long low = n % base;',
        '            if (cur == 0) {',
        '                count += high * base;',
        '            } else if (cur == 1) {',
        '                count += high * base + low + 1;',
        '            } else {',
        '                count += (high + 1) * base;',
        '            }',
        '            base *= 10;',
        '        }',
        '        return count;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def countDigitOne(self, n: int) -> int:',
        '        if n <= 0:',
        '            return 0',
        '        count, base = 0, 1',
        '        while base <= n:',
        '            high = n // (base * 10)',
        '            cur = (n // base) % 10',
        '            low = n % base',
        '            if cur == 0:',
        '                count += high * base',
        '            elif cur == 1:',
        '                count += high * base + low + 1',
        '            else:',
        '                count += (high + 1) * base',
        '            base *= 10',
        '        return count',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入待统计上界 n。',
        2: '特判 n <= 0 时直接返回 0。',
        4: 'base 初始为 1，代表当前统计的权值位（1=个位, 10=十位, 100=百位...）。',
        5: '循环推进每一数位，直到 base 超过 n。',
        6: '计算当前位更高位数字 high = floor(n / (base * 10))。',
        7: '计算当前位数字 cur = floor(n / base) % 10。',
        8: '计算当前位更低位数字 low = n % base。',
        9: '若 cur == 0，高位可选 0..high-1，低位任意，总数 = high * base。',
        11: '若 cur == 1，除 high*base 外，高位取 high 时低位可取 0..low 共 low+1 种。',
        13: '若 cur > 1，高位可选 0..high，低位任意，总数 = (high + 1) * base。',
        18: '返回各数位累加总计数字 1 的个数。',
      },
      java: {
        2: '方法入口。',
        4: '使用 long 防止 base * 10 溢出。',
        5: '数位循环递推。',
        9: '按当前位 0/1/>1 三种情况分类累加。',
        17: '强转返回整型结果。',
      },
      cpp: {
        3: '函数入口。',
        5: 'long long 防止乘法溢出。',
        8: '三路按位贡献度统计。',
        18: '返回总出现频次。',
      },
      python: {
        2: '方法入口。',
        5: '初始化计数器与位基底。',
        9: '三大条件分支累加。',
        16: '返回计算结果。',
      },
    },
    keyPoints: {
      thinking:
        '数位DP与贡献法思想：不用逐个遍历每个数字，而是固定数位（个位、十位、百位……），分别统计该位上数字 1 出现的次数再求和。将数字拆为 high、cur、low 三段，每段根据 cur 是否等于 1 或大于 1 精准封闭计算。',
      state: '当前数位基准 base = 10^i，当前位数字 cur = (n / base) % 10。',
      equation: 'count(base) = cur==0 ? (high*base) : cur==1 ? (high*base + low + 1) : ((high+1)*base)',
      initAndBounds: 'base 从 1 开始，每次乘以 10，当 base > n 时结束。',
      complexity: '时间复杂度 $O(\\log_{10} n)$，空间复杂度 $O(1)$。',
    },
    faqList: [
      {
        tag: '重复计数问题',
        question: '像数字 11 中包含两个 1，这种按位累加法会漏算或多数吗？',
        answer:
          '不会。在统计十位时，数字 11 的十位是 1 会被计入一次；在统计个位时，数字 11 的个位是 1 又会被计入一次，两者相加恰好为 2 次，完全符合题意。',
      },
    ],
  },
  generateSteps: (input: { n?: number } = {}): DpTraceStep[] => {
    const n = input?.n ?? 13;
    const steps: DpTraceStep[] = [];

    if (n <= 0) {
      steps.push(
        makeTraceStep({
          message: `输入 n=${n} <= 0，不包含任何正整数 1，答案为 0。`,
          metrics: { totalOnes: 0 },
        })
      );
      return steps;
    }

    let count = 0;
    let base = 1;
    const bitResults: Array<{ name: string; high: number; cur: number; low: number; added: number }> = [];

    steps.push(
      makeTraceStep({
        message: `🔢 开始统计数字 1 在 1 ~ ${n} 中出现的总次数。我们将按位（个位、十位、百位...）分别独立计算贡献度。`,
        log: `启动数位统计: n = ${n}`,
        vars: [
          { name: '上界 n', value: String(n) },
          { name: '累计 1 个数', value: '0' },
        ],
        metrics: { totalOnes: 0 },
      })
    );

    const posNames: Record<number, string> = {
      1: '个位 (10^0)',
      10: '十位 (10^1)',
      100: '百位 (10^2)',
      1000: '千位 (10^3)',
      10000: '万位 (10^4)',
      100000: '十万位 (10^5)',
      1000000: '百万位 (10^6)',
      10000000: '千万位 (10^7)',
      100000000: '亿位 (10^8)',
    };

    while (base <= n) {
      const high = Math.floor(n / (base * 10));
      const cur = Math.floor(n / base) % 10;
      const low = n % base;
      let added = 0;
      let reason = '';

      if (cur === 0) {
        added = high * base;
        reason = `cur=0: 仅由高位决定 [0..${high - 1}] × ${base} = ${added}`;
      } else if (cur === 1) {
        added = high * base + low + 1;
        reason = `cur=1: 高位提供 ${high * base} + 低位提供 (0..${low})共 ${low + 1} = ${added}`;
      } else {
        added = (high + 1) * base;
        reason = `cur>1(${cur}): 高位可选 [0..${high}] × ${base} = ${added}`;
      }

      count += added;
      const posName = posNames[base] || `10^${Math.round(Math.log10(base))}位`;
      bitResults.push({ name: posName, high, cur, low, added });

      steps.push(
        makeTraceStep({
          dp1d: bitResults.map((b) => ({ value: b.added, label: b.name, state: 'computed' })),
          message: `📊 统计 <strong>${posName}</strong>：拆分为 high=${high}, cur=${cur}, low=${low}。<br/>${reason}。当前累计 1 的总数为 <strong>${count}</strong>。`,
          log: `${posName}: high=${high}, cur=${cur}, low=${low} -> added=${added}, count=${count}`,
          formula: cur === 0 ? 'high * base' : cur === 1 ? 'high * base + low + 1' : '(high + 1) * base',
          vars: [
            { name: '当前位基底', value: String(base) },
            { name: '当前位数字 cur', value: String(cur) },
            { name: '该位贡献 1 频次', value: String(added) },
            { name: '总累计 1 频次', value: String(count) },
          ],
          metrics: { totalOnes: count },
        })
      );

      base *= 10;
    }

    steps.push(
      makeTraceStep({
        dp1d: bitResults.map((b) => ({ value: b.added, label: b.name, state: 'computed' })),
        message: `🏆 统计完成！在 1 ~ ${n} 中数字 1 一共出现了 <strong>${count}</strong> 次。`,
        log: `统计结束：1 出现的总次数 = ${count}`,
        vars: [
          { name: '最终结果', value: String(count) },
        ],
        metrics: { totalOnes: count },
      })
    );

    return steps;
  },
};
