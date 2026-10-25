/**
 * 只出现一次的数字 III 全景推演树渲染策略 (SingleNumberIIIDeductionRenderer)
 * 纯静态无状态，展示异或分组与最低有效位划分推导过程 (LeetCode 260 / Class 034)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SingleNumberIIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'single-number-iii-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'single-number-iii' ||
      modelId === 'single-number-260' ||
      modelId === 'leetcode-260' ||
      modelId === 'single-number-3' ||
      modelId === '260' ||
      modelId === 'bitwise-xor-odd-times-034' ||
      modelId === 'class032-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [1, 2, 1, 3, 2, 5];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '只出现一次的数字 III 推演展板 (XOR Partition by Lowbit)',
      badge: 'O(N) 线性时间 · O(1) 原地空间 · 异或与最右 1 分流',
      descriptionHtml:
        '数组中有两个数字 <code>a</code> 与 <code>b</code> 仅出现 1 次，其余数字均出现 2 次。第一阶段全员异或求得 <code>eor = a ^ b</code>；第二阶段提取最右侧 1 <code>diff = eor & (-eor)</code> 区分两数差异位；第三阶段将全量数组按该位是否为 1 划分为两组分别异或，独立解出 <code>a</code> 与 <code>b</code>。',
      initialStateText: `输入数组 A = [${rawArr.join(', ')}], 目标找出唯一出现的两个数`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '阶段 1: 全员异或', valuesStr: 'eor = A[0] ^ A[1] ^ ... ^ A[n-1] = a ^ b (偶数次数字两两自消为 0)' },
      { prefix: '├───', label: '阶段 2: 提取 Lowbit', valuesStr: 'diff = eor & (-eor)：取出 a 与 b 存在差异的最低二进制位 (必不为0)' },
      { prefix: '└───', label: '阶段 3: 分组异或', valuesStr: '若 (num & diff) === 0 归入 A 组异或得 a；若不为 0 归入 B 组异或得 b' },
    ]);

    const steps = [
      {
        phase: '阶段 1: 全员异或流水线',
        detail: '1 ^ 2 ^ 1 ^ 3 ^ 2 ^ 5',
        calc: '(1 ^ 1) ^ (2 ^ 2) ^ (3 ^ 5) = 0 ^ 0 ^ (0011 ^ 0101) = 0110 (十进制 6)',
        state: 'eor = a ^ b = 6 (二进制 0110)',
      },
      {
        phase: '阶段 2: 提取差异位 (Lowbit)',
        detail: 'diff = eor & (-eor) = 6 & (-6)',
        calc: '6 原码: 0000 0110\n-6 补码: 1111 1010\n按位与: 0000 0010 (十进制 2, 即第 1 位)',
        state: '锁定差异掩码 diff = 2 (表示 a 与 b 在第 1 位一个为 0、另一个为 1)',
      },
      {
        phase: '阶段 3: 分组异或独立求解',
        detail: '按 (num & 2) 是否为 0 分流',
        calc: 'A 组 (num & 2 == 0): [1, 1, 5] → 1 ^ 1 ^ 5 = 5 (求出第 1 个数!)\nB 组 (num & 2 != 0): [2, 3, 2] → 2 ^ 2 ^ 3 = 3 (求出第 2 个数!)',
        state: '独立解得: a = 3, b = 5',
      },
    ];

    const roundsHtml = steps
      .map(s =>
        DeductionBoardPrimitives.renderOuterRound({
          title: s.phase,
          subtitle: s.detail,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: s.detail,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">${s.state}</span>`,
            detailLines: s.calc.split('\n'),
            fillLine: `阶段产物: ${s.state}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '异或对消 · 最低差异位提取 · 独立子空间划分 · 极速破局'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '[3, 5]',
      answerDescription:
        '通过利用异或自反性 (x ^ x = 0) 与补码 Lowbit 提取，两趟线性扫描即可完美分离两个独立数字，避免了哈希表 O(N) 的内存开销，空间复杂度达严格 O(1)。',
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
