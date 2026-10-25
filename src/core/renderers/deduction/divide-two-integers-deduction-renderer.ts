/**
 * 两数相除 全景推演树渲染策略 (DivideTwoIntegersDeductionRenderer)
 * 纯静态无状态，展示不用乘除号的二进制倍增减法推演过程 (LeetCode 29)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DivideTwoIntegersDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'divide-two-integers-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'divide-two-integers' ||
      modelId === 'divide-integers' ||
      modelId === '29' ||
      modelId === 'leetcode-29'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const dividend = 29;
    const divisor = 3;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '两数相除全景推演展板 (Divide Two Integers Doubling Subtraction)',
      badge: 'O(log² N) 时间 · O(1) 原地空间 · 纯位运算倍增试商',
      descriptionHtml:
        '在禁止使用乘法 <code>*</code>、除法 <code>/</code> 和取模 <code>%</code> 的严苛限制下完成两数相除。采用二进制倍增思想：寻找除数左移 <code>(divisor << shift)</code> 能逼近被除数的最大块，扣除并累加商 <code>(1 << shift)</code>，对数级逼近商。统一转入负数域计算规避溢出。',
      initialStateText: `被除数 a = ${dividend}, 除数 b = ${divisor}, 目标求商 a / b`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '溢出边界特判', valuesStr: '当 a = MIN_VALUE 且 b = -1 时结果溢出，特判返回 MAX_VALUE (2147483647)' },
      { prefix: '├───', label: '负数域转换', valuesStr: '由于绝对值域中 |-2147483648| 无法存入正数 int，将两者统一转为负数计算' },
      { prefix: '└───', label: '倍增定位公式', valuesStr: '寻找最大的 shift 使得 (b << shift) >= a (负数中大于等于表示绝对值更小)' },
    ]);

    const rounds = [
      {
        round: 1,
        curA: 29,
        action: '寻找除数 3 的最大二进制倍数',
        details: [
          '3 << 0 = 3 ≤ 29',
          '3 << 1 = 6 ≤ 29',
          '3 << 2 = 12 ≤ 29',
          '3 << 3 = 24 ≤ 29',
          '3 << 4 = 48 > 29 (过大)',
          '锁定 shift = 3 (对应商贡献 1 << 3 = 8)',
        ],
        subtraction: 'a = 29 - 24 = 5，当前商累加 quotient = 8',
      },
      {
        round: 2,
        curA: 5,
        action: '对剩余 5 继续寻找 3 的倍数',
        details: [
          '3 << 0 = 3 ≤ 5',
          '3 << 1 = 6 > 5 (过大)',
          '锁定 shift = 0 (对应商贡献 1 << 0 = 1)',
        ],
        subtraction: 'a = 5 - 3 = 2，当前商累加 quotient = 8 + 1 = 9',
      },
      {
        round: 3,
        curA: 2,
        action: '余数终止判定',
        details: [
          '剩余被除数 a = 2 < 除数 3',
          '无法再减去任何 3 的正倍数，除法循环立即终止',
        ],
        subtraction: '余数 = 2，最终商 = 9',
      },
    ];

    const roundsHtml = rounds
      .map(r =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `倍增轮次 ${r.round} (剩余被除数 = ${r.curA})`,
          subtitle: r.action,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: r.action,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">Shift 试商</span>`,
            detailLines: r.details,
            fillLine: `扣除与累加: ${r.subtraction}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '指数级倍增试商 · 移位逼近 · 负数域防溢出 · 快速收敛'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'quotient = 9 (29 / 3 = 9 余 2)',
      answerDescription:
        '通过二进制移位试商，原先逐次累减的 O(N) 线性时间被彻底加速为 O(log² N) 或固定 31 次移位判定，完全无需硬件乘除法支持。',
      complexityStr: '时间复杂度: O(log² N) | 空间复杂度: O(1)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
