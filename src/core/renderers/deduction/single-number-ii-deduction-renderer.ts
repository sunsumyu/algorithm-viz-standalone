/**
 * 只出现一次的数字 II 全景推演树渲染策略 (SingleNumberIIDeductionRenderer)
 * 纯静态无状态，展示模 3 有限状态自动机与位运算常数空间推导 (LeetCode 137)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SingleNumberIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'single-number-ii-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'single-number-ii' ||
      modelId === 'single-number-137' ||
      modelId === 'leetcode-137' ||
      modelId === 'single-number-2' ||
      modelId === '137' ||
      modelId === 'class031-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [2, 2, 3, 2];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '只出现一次的数字 II 推演展板 (Single Number II Mod-3 FSM)',
      badge: 'O(N) 线性时间 · O(1) 绝对常数空间 · 模 3 有限状态自动机',
      descriptionHtml:
        '除唯一出现 1 次的元素外，其余元素均恰好出现 3 次。针对二进制每一位建立模 3 状态机：计数状态循环为 <code>00 → 01 → 10 → 00</code>。利用两个变量 <code>ones</code> 与 <code>twos</code> 协同表示状态，最终 <code>ones</code> 中保留的即为所求目标。',
      initialStateText: `待处理数组 A = [${rawArr.join(', ')}], 初始状态 ones = 0, twos = 0`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '状态转移方程 1', valuesStr: 'ones = (ones ^ num) & ~twos (当前位出现 1 次且非 2 次时置 1)' },
      { prefix: '├───', label: '状态转移方程 2', valuesStr: 'twos = (twos ^ num) & ~ones (当前位出现 2 次且非 3 次时置 1)' },
      { prefix: '└───', label: '三进制归零', valuesStr: '当某一二进制位累计出现第 3 次时，自动回滚至 (ones=0, twos=0)' },
    ]);

    const steps = [
      {
        num: 2,
        binary: '0010 (十进制 2)',
        desc: '处理第 1 个 2: ones ^ 2 = 2, twos = 0',
        ones: '0010 (2)',
        twos: '0000 (0)',
        meaning: '第 1 位出现 1 次 (计数 1)',
      },
      {
        num: 2,
        binary: '0010 (十进制 2)',
        desc: '处理第 2 个 2: ones 清零转入 twos',
        ones: '0000 (0)',
        twos: '0010 (2)',
        meaning: '第 1 位出现 2 次 (计数 2)',
      },
      {
        num: 3,
        binary: '0011 (十进制 3)',
        desc: '处理独立数 3: 第 0 位 (1) 首次登场放入 ones; 第 1 位 (2) 仍停在 twos',
        ones: '0001 (1)',
        twos: '0010 (2)',
        meaning: '第 0 位计数 1，第 1 位计数 2',
      },
      {
        num: 2,
        binary: '0010 (十进制 2)',
        desc: '处理第 3 个 2: 第 1 位达到 3 次触发归零！第 0 位不受影响保持在 ones',
        ones: '0011 & ~0 = 0011 (3)',
        twos: '0000 (0)',
        meaning: '所有出现 3 次的 2 全局消除，仅剩目标 3 的二进制位！',
      },
    ];

    const roundsHtml = steps
      .map((s, idx) =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `步骤 ${idx + 1}: 输入元素 num = ${s.num} (${s.binary})`,
          subtitle: s.desc,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: s.meaning,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">ones=${s.ones}</span>`,
            detailLines: [
              `位掩码转移演算: ${s.desc}`,
              `寄存器状态: ones = ${s.ones}, twos = ${s.twos}`,
            ],
            fillLine: `状态含义解释: ${s.meaning}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '有限状态自动机 · 模 3 循环转移 · 出现 3 次的位自然湮灭'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return ones = 3',
      answerDescription:
        '由于所有重复数字均出现 3 次并在二进制对应位上完整经历 00 → 01 → 10 → 00 的闭环归零，最终留在 ones 寄存器中的正是仅出现 1 次的目标元素 3。',
      complexityStr: '时间复杂度: O(N) | 空间复杂度: O(1)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
