/**
 * 位运算核心技巧 全景推演树渲染策略 (BitTricksDeductionRenderer)
 * 纯静态无状态，展示 Brian Kernighan 算法、最右 1 提取与 2 的幂判定推导 (LC 191 / 231)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BitTricksDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bit-tricks-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bit-tricks' ||
      modelId === 'brian-kernighan' ||
      modelId === 'bit-tricks-030' ||
      modelId === 'class030-code01' ||
      modelId === 'class002-code01' ||
      modelId === '191' ||
      modelId === 'leetcode-191' ||
      modelId === '231' ||
      modelId === 'leetcode-231'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const x = 40; // 0010 1000

    const header = DeductionBoardPrimitives.renderHeader({
      title: '位运算核心神技全景推演展板 (Brian Kernighan & Bit Tricks)',
      badge: 'O(1) 极端高效 · O(1) 原地空间 · 硬件指令级原子加速',
      descriptionHtml:
        '深入计算机二进制底层的三大经典神技：1. 提取最右侧 1 <code>x & (-x)</code>；2. 抹除最右侧 1 <code>x & (x - 1)</code>（Brian Kernighan 1 的个数计数，迭代次数仅等于 1 的个数）；3. 2 的幂次极速判定 <code>x > 0 && (x & (x - 1)) == 0</code>。',
      initialStateText: `分析样例 x = ${x} (二进制 0010 1000)`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '技巧 1: 提取最右 1', valuesStr: 'lowbit = x & (-x) (利用补码反码+1的借位传递特性精确保留最低位 1)' },
      { prefix: '├───', label: '技巧 2: 抹除最右 1', valuesStr: 'x = x & (x - 1) (每次恰好消除二进制中最靠右的一个 1)' },
      { prefix: '└───', label: '技巧 3: 2 的幂判定', valuesStr: '若 x > 0 且抹除一次 1 后直接变为 0，则说明二进制仅有 1 个 1，必为 2 的整数次幂' },
    ]);

    const passes = [
      {
        title: '技巧 1: 提取最右侧的 1 (Lowbit)',
        formula: '40 & (-40)',
        details: [
          '40 原码: 0010 1000 (十进制 40)',
          '-40 补码: 1101 1000 (反码 1101 0111 + 1)',
          '按位与运算: 0000 1000 (十进制 8)',
        ],
        result: '提取出最低位 1: 8 (对应二进制第 3 位)',
      },
      {
        title: '技巧 2: Brian Kernighan 统计二进制 1 的个数 (LC 191)',
        formula: '迭代抹除: x = x & (x - 1)',
        details: [
          '第 1 次抹除: 40(0010 1000) & 39(0010 0111) = 32(0010 0000) [消去第 3 位的 1, count=1]',
          '第 2 次抹除: 32(0010 0000) & 31(0001 1111) = 0(0000 0000) [消去第 5 位的 1, count=2]',
          '变为 0 终止循环：仅执行 2 次运算即精确统计完毕！',
        ],
        result: '40 的二进制包含 2 个 1，跳过所有 0，迭代步数极简',
      },
      {
        title: '技巧 3: 2 的幂判定 (Power of Two · LC 231)',
        formula: 'x > 0 && (x & (x - 1)) == 0',
        details: [
          '对于 40: 40 & 39 = 32 ≠ 0 → 40 不是 2 的幂',
          '对于 32: 32 & 31 = 0 == 0 → 32 是 2 的幂 (2^5 = 32) ✅',
          '对于 16: 16 & 15 = 0 == 0 → 16 是 2 的幂 (2^4 = 16) ✅',
        ],
        result: '单条位运算指令无循环判定 2 的幂',
      },
    ];

    const roundsHtml = passes
      .map(p =>
        DeductionBoardPrimitives.renderOuterRound({
          title: p.title,
          subtitle: p.formula,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: p.formula,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">${p.formula}</span>`,
            detailLines: p.details,
            fillLine: `推演结论: ${p.result}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '位级补码映射 · 借位消除 · 零分支与单周期硬件指令'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'lowbit=8, count=2, isPowerOf2=false',
      answerDescription:
        'Brian Kernighan 系列位运算技巧将常规 32 次遍历的位计数与幂判定缩减至 O(1) 或 O(k)（k 为 1 的个数），是树状数组 (Fenwick Tree)、哈希状态压缩与分布式位图的核心基石。',
      complexityStr: '时间复杂度: O(k) / O(1) | 空间复杂度: O(1)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
