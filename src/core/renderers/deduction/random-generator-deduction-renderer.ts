/**
 * 不均匀随机发生器向等概率转化 全景推演树渲染策略 (RandomGeneratorDeductionRenderer)
 * 纯静态无状态，展示冯·诺依曼偏置消除法与二进制拒绝采样推导过程 (Class 035 / LeetCode 470)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RandomGeneratorDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'random-generator-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'random-generator-035' ||
      modelId === 'random-generator' ||
      modelId === 'class035' ||
      modelId === 'class035-code01' ||
      modelId === '470' ||
      modelId === 'leetcode-470'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const p = 0.8; // 偏置黑盒 f() 产出 0 的概率 80%, 1 的概率 20%

    const header = DeductionBoardPrimitives.renderHeader({
      title: '随机发生器等概率转化推演展板 (von Neumann Debiasing & Rejection)',
      badge: '期望 O(1) · 严格 50% 等可能 · 冯·诺依曼偏置消除',
      descriptionHtml:
        '计算机经典概率转化母题：给定一个产出 0 概率为 <code>p</code>、产出 1 概率为 <code>1-p</code> 的偏置黑盒 <code>f()</code>，如何构造严格等概率的发生器？利用双掷独立性：<code>P(0, 1) = p(1-p)</code> 与 <code>P(1, 0) = (1-p)p</code> 具有绝对代数对称性，舍弃全同事件即可获得纯净的 0/1 发生器。',
      initialStateText: `黑盒偏置参数 P(f()=0) = ${p}, P(f()=1) = ${(1 - p).toFixed(1)}`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '阶段 1: 偏置消除', valuesStr: '独立调用 2 次：若为 (0,1) 返回 0；若为 (1,0) 返回 1；若为 (0,0) 或 (1,1) 重做' },
      { prefix: '├───', label: '阶段 2: 拼装二进制位', valuesStr: '调用 3 次等概率发生器，得到 3 位二进制数 b2 b1 b0，取值范围 [0, 7]' },
      { prefix: '└───', label: '阶段 3: 拒绝采样', valuesStr: '若拼装结果为 0 (或 > 7) 则拒绝并重做，剩余 [1, 7] 的 7 种结果严格等可能 (各占 1/7)' },
    ]);

    const stages = [
      {
        title: '阶段 1: 冯·诺依曼偏置消除演算 (产生等概率 01)',
        detail: '独立双掷事件空间概率分布',
        calc: [
          `事件 (0, 0): 概率 p² = 0.8 * 0.8 = 0.64 → 舍弃重试 🔄`,
          `事件 (1, 1): 概率 (1-p)² = 0.2 * 0.2 = 0.04 → 舍弃重试 🔄`,
          `事件 (0, 1): 概率 p(1-p) = 0.8 * 0.2 = 0.16 → 映射为 0 ✅`,
          `事件 (1, 0): 概率 (1-p)p = 0.2 * 0.8 = 0.16 → 映射为 1 ✅`,
          `有效事件中 P(0) : P(1) = 0.16 : 0.16 = 1 : 1，各占严格 50.000%！`,
        ],
        badge: '对称代数消除',
      },
      {
        title: '阶段 2: 由等概率 01 扩展到任意等概率范围 [1, 7]',
        detail: '3 位二进制插值拼装',
        calc: [
          `bit2: rand01() → 1 (最高位权值 4)`,
          `bit1: rand01() → 0 (中间位权值 2)`,
          `bit0: rand01() → 1 (最低位权值 1)`,
          `拼装数值: 1*4 + 0*2 + 1*1 = 5`,
          `等可能样本空间 [0, 7] 共 8 种可能，每种概率均为 1/8`,
        ],
        badge: '二进制拼接',
      },
      {
        title: '阶段 3: 拒绝采样收敛判定',
        detail: '过滤无效值 0',
        calc: [
          `若得到 0: 超出 [1, 7] 目标域，触发重试 (概率 1/8)`,
          `若得到 [1, 7]: 命中目标域，直接返回当前值 5 (概率 7/8)`,
          `期望重试次数: 1 / (7/8) = 8/7 ≈ 1.14 次，极速收敛！`,
        ],
        badge: '拒绝采样',
      },
    ];

    const roundsHtml = stages
      .map(s =>
        DeductionBoardPrimitives.renderOuterRound({
          title: s.title,
          subtitle: s.detail,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: s.detail,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">${s.badge}</span>`,
            detailLines: s.calc,
            fillLine: `阶段结论: ${s.badge} 达成`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '对称概率对消 · 二进制权位合成 · 拒绝采样 · 期望常数步'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'rand1To7() = 5 (每个数被抽中概率严格为 1/7)',
      answerDescription:
        '通过冯·诺依曼偏置对消法将任意固定概率的黑盒转化为 0/1 等概率发生器，再通过二进制位拼接与拒绝采样，可以在期望常数步 O(1) 内构造任意范围 [A, B] 的绝对均匀随机发生器。',
      complexityStr: '时间复杂度 (期望): O(1) | 空间复杂度: O(1)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
