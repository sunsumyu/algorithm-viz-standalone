import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export const LEMONADE_CODE_LINES: Record<string, HighlightTarget> = {
  entry: { java: 1, cpp: 3, python: 2, javascript: 1 },
  guardEmpty: { java: 20, cpp: 18, python: 20, javascript: 19 },
  init: { java: 2, cpp: 4, python: 3, javascript: 2 },
  receive5: {
    java: { primary: 5, context: [4] },
    cpp: 6,
    python: { primary: 6, context: [5] },
    javascript: { primary: 5, context: [4] },
  },
  fail10: {
    java: 7,
    cpp: 8,
    python: { primary: 9, context: [8] },
    javascript: 7,
  },
  change10: {
    java: 8,
    cpp: 9,
    python: { primary: 11, context: [10] },
    javascript: 8,
  },
  change20TenFive: {
    java: { primary: 12, context: [11] },
    cpp: { primary: 12, context: [11] },
    python: { primary: 14, context: [13, 15] },
    javascript: { primary: 11, context: [10] },
  },
  change20Five3: {
    java: { primary: 14, context: [13] },
    cpp: { primary: 14, context: [13] },
    python: { primary: 17, context: [16] },
    javascript: { primary: 13, context: [12] },
  },
  fail20: {
    java: { primary: 16, context: [15] },
    cpp: 15,
    python: { primary: 19, context: [18] },
    javascript: { primary: 15, context: [14] },
  },
  success: { java: 20, cpp: 18, python: 20, javascript: 19 },
};

export interface LemonadeStep extends StepBase {
  bills: number[];
  currentIndex: number;
  fiveCount: number;
  tenCount: number;
  currentBill: number;
  changeGiven: number[];
  success: boolean;
  action: 'init' | 'receive_5' | 'change_10' | 'change_20_10_5' | 'change_20_5_5_5' | 'fail' | 'done';
  decision?: string;
  message: string;
  log?: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
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

export function buildLemonadeSteps(rawBills: number[]): LemonadeStep[] {
  const steps: LemonadeStep[] = [];
  const n = rawBills.length;
  const lines = LEMONADE_CODE_LINES;

  if (n === 0) {
    steps.push({
      bills: [],
      currentIndex: -1,
      fiveCount: 0,
      tenCount: 0,
      currentBill: 0,
      changeGiven: [],
      success: true,
      action: 'done',
      message: '没有顾客，返回 true',
      codeLine: lines.guardEmpty,
      line: getLine(lines.guardEmpty),
    });
    return withMetrics(steps);
  }

  let five = 0;
  let ten = 0;

  steps.push({
    bills: [...rawBills],
    currentIndex: -1,
    fiveCount: 0,
    tenCount: 0,
    currentBill: 0,
    changeGiven: [],
    success: true,
    action: 'init',
    message: `初始化：共 ${n} 位顾客排队，收银台初始零钱：$5 数量 = 0, $10 数量 = 0`,
    codeLine: lines.init,
    line: getLine(lines.init),
  });

  for (let i = 0; i < n; i++) {
    const bill = rawBills[i];

    if (bill === 5) {
      five++;
      steps.push({
        bills: [...rawBills],
        currentIndex: i,
        fiveCount: five,
        tenCount: ten,
        currentBill: 5,
        changeGiven: [],
        success: true,
        action: 'receive_5',
        message: `💵 顾客 [${i}] 支付 $5，无需找零，直接存入收银台 ($5 储备增加到 ${five} 张)`,
        codeLine: lines.receive5,
        line: getLine(lines.receive5),
      });
    } else if (bill === 10) {
      if (five <= 0) {
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 10,
          changeGiven: [],
          success: false,
          action: 'fail',
          message: `❌ 顾客 [${i}] 支付 $10 需要找零 $5，但收银台没有 $5 纸币！找零失败，返回 false`,
          codeLine: lines.fail10,
          line: getLine(lines.fail10),
        });
        return withMetrics(steps);
      }
      five--;
      ten++;
      steps.push({
        bills: [...rawBills],
        currentIndex: i,
        fiveCount: five,
        tenCount: ten,
        currentBill: 10,
        changeGiven: [5],
        success: true,
        action: 'change_10',
        message: `💶 顾客 [${i}] 支付 $10，找零 1 张 $5 (剩余 $5: ${five} 张, $10: ${ten} 张)`,
        codeLine: lines.change10,
        line: getLine(lines.change10),
      });
    } else if (bill === 20) {
      if (ten > 0 && five > 0) {
        ten--;
        five--;
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 20,
          changeGiven: [10, 5],
          success: true,
          action: 'change_20_10_5',
          message: `💷 顾客 [${i}] 支付 $20！【贪心优先策略】找零 1 张 $10 + 1 张 $5，保留万能 $5 (剩余 $5: ${five} 张, $10: ${ten} 张)`,
          codeLine: lines.change20TenFive,
          line: getLine(lines.change20TenFive),
        });
      } else if (five >= 3) {
        five -= 3;
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 20,
          changeGiven: [5, 5, 5],
          success: true,
          action: 'change_20_5_5_5',
          message: `💷 顾客 [${i}] 支付 $20！【备选策略】无 $10，找零 3 张 $5 (剩余 $5: ${five} 张, $10: ${ten} 张)`,
          codeLine: lines.change20Five3,
          line: getLine(lines.change20Five3),
        });
      } else {
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 20,
          changeGiven: [],
          success: false,
          action: 'fail',
          message: `❌ 顾客 [${i}] 支付 $20 需要找零 $15，但收银台既无 ($10+$5) 也无 (3张$5)！找零失败，返回 false`,
          codeLine: lines.fail10,
          line: getLine(lines.fail10),
        });
        return withMetrics(steps);
      }
    }
  }

  steps.push({
    bills: [...rawBills],
    currentIndex: n - 1,
    fiveCount: five,
    tenCount: ten,
    currentBill: 0,
    changeGiven: [],
    success: true,
    action: 'done',
    message: `🎉 全部 ${n} 位顾客找零成功！最终收银台结存：$5: ${five} 张, $10: ${ten} 张，返回 true`,
    codeLine: lines.success,
    line: getLine(lines.success),
  });

  return withMetrics(steps);
}

function withMetrics(steps: LemonadeStep[]): LemonadeStep[] {
  return steps.map((s) => {
    const isPay5 = s.action === 'receive_5';
    const isChg10 = s.action === 'change_10';
    const isChg20Opt = s.action === 'change_20_10_5';
    const isChg20Alt = s.action === 'change_20_5_5_5';
    const isFail = s.action === 'fail';

    let action = '✓ 交易完成';
    if (isPay5) action = '💵 $5 直接收下';
    else if (isChg10) action = '💶 找零 1 张 $5';
    else if (isChg20Opt) action = '💷 贪心优先找 $10+$5';
    else if (isChg20Alt) action = '💷 备选方案找 3张 $5';
    else if (isFail) action = '❌ 零钱不足 (失败)';
    else if (s.action === 'init') action = '初始化';

    const curBill = s.currentBill;
    const changeNeed = curBill > 5 ? curBill - 5 : 0;

    return {
      ...s,
      decision: s.message,
      log: s.message,
      metrics: {
        'cur-bill': curBill > 0 ? `$${curBill}` : '—',
        'change-need': curBill > 0 ? (changeNeed > 0 ? `$${changeNeed}` : '$0 (无需找零)') : '—',
        'cashier': `$5 × ${s.fiveCount} | $10 × ${s.tenCount}`,
        'change-given': s.changeGiven.length ? s.changeGiven.map((c) => `$${c}`).join(' + ') : '无',
        'verdict': s.success ? 'true (可以找零)' : 'false (找零失败)',
        action,
      },
    };
  });
}
