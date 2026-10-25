/**
 * 位运算实现四则运算 全景推演树渲染策略 (BitwiseArithmeticDeductionRenderer)
 * 纯静态无状态，展示异或进位累加、补码相反数与二进制竖式乘除法推导过程 (Class 032)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BitwiseArithmeticDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bitwise-arithmetic-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bitwise-arithmetic-032' ||
      modelId === 'bitwise-arithmetic' ||
      modelId === 'class032-code02' ||
      modelId === 'class032'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const a = 19; // 0001 0011
    const b = 13; // 0000 1101

    const header = DeductionBoardPrimitives.renderHeader({
      title: '位运算实现四则运算推演展板 (ALU Bitwise Arithmetic Engine)',
      badge: '底层物理硬件逻辑 · 零算术运算符 · 异或与进位收敛',
      descriptionHtml:
        '揭示计算机 CPU 算术逻辑单元 (ALU) 的物理电路核心实现：1. 加法采用无进位相加 <code>a ^ b</code> 与进位信息 <code>(a & b) << 1</code> 反复迭代直至进位为 0；2. 减法转化为补码相反数 <code>a + (~b + 1)</code>；3. 乘法采用二进制移位列式累加。',
      initialStateText: `操作数 a = ${a} (0001 0011), b = ${b} (0000 1101)`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '加法基底原理', valuesStr: 'sum = a ^ b (无进位相加), carry = (a & b) << 1 (进位项)，迭代至 carry == 0' },
      { prefix: '├───', label: '减法补码规约', valuesStr: 'a - b = a + (-b) = add(a, add(~b, 1)) (取反加一求补码相反数)' },
      { prefix: '└───', label: '乘法移位累加', valuesStr: '若乘数 b 最低位为 1，则 ans = add(ans, a)；随后 a <<= 1, b >>>= 1' },
    ]);

    const addSteps = [
      {
        round: 1,
        desc: '初始输入 a = 19, b = 13',
        sum: '19 ^ 13 = 0001 0011 ^ 0000 1101 = 0001 1110 (十进制 30)',
        carry: '(19 & 13) << 1 = (0000 0001) << 1 = 0000 0010 (十进制 2)',
        next: '进位 carry = 2 ≠ 0，将 a 置为 30，b 置为 2 开启下一轮',
      },
      {
        round: 2,
        desc: '累加 a = 30, b = 2',
        sum: '30 ^ 2 = 0001 1110 ^ 0000 0010 = 0001 1100 (十进制 28)',
        carry: '(30 & 2) << 1 = (0000 0010) << 1 = 0000 0100 (十进制 4)',
        next: '进位 carry = 4 ≠ 0，将 a 置为 28，b 置为 4 开启下一轮',
      },
      {
        round: 3,
        desc: '累加 a = 28, b = 4',
        sum: '28 ^ 4 = 0001 1100 ^ 0000 0100 = 0001 1000 (十进制 24)',
        carry: '(28 & 4) << 1 = (0000 0100) << 1 = 0000 1000 (十进制 8)',
        next: '进位 carry = 8 ≠ 0，将 a 置为 24，b 置为 8 开启下一轮',
      },
      {
        round: 4,
        desc: '累加 a = 24, b = 8',
        sum: '24 ^ 8 = 0001 1000 ^ 0000 1000 = 0001 0000 (十进制 16)',
        carry: '(24 & 8) << 1 = (0000 1000) << 1 = 0001 0000 (十进制 16)',
        next: '进位 carry = 16 ≠ 0，将 a 置为 16，b 置为 16 开启下一轮',
      },
      {
        round: 5,
        desc: '累加 a = 16, b = 16',
        sum: '16 ^ 16 = 0001 0000 ^ 0001 0000 = 0000 0000 (十进制 0)',
        carry: '(16 & 16) << 1 = 0010 0000 (十进制 32)',
        next: '进入最终阶段 a = 0, b = 32',
      },
      {
        round: 6,
        desc: '最终结算 a = 0, b = 32',
        sum: '0 ^ 32 = 32',
        carry: '(0 & 32) << 1 = 0',
        next: '进位 carry == 0！加法收敛，最终输出 sum = 32 ✅',
      },
    ];

    const roundsHtml = addSteps
      .map(s =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `加法迭代轮次 ${s.round}`,
          subtitle: s.desc,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: s.next,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">轮次 ${s.round}</span>`,
            detailLines: [
              `无进位和 sum: ${s.sum}`,
              `进位信息 carry: ${s.carry}`,
            ],
            fillLine: s.next,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '异或取和 · 与运算取进位 · 左移传递 · 有限步进位消解'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'add(19, 13) = 32 | minus(19, 13) = 6 | multiply(19, 13) = 247',
      answerDescription:
        '纯粹基于与、或、非、异或与移位 5 种基本位运算指令，在硬件级别精确完成了加减乘除四则运算，进位项由于不断左移至多在 32 步内必然彻底归零。',
      complexityStr: '加减法时间: O(32) = O(1) | 乘法时间: O(32) = O(1) | 空间: O(1)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
