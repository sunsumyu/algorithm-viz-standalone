/**
 * 直线上最多的点数 全景推演树渲染策略 (MaxPointsDeductionRenderer)
 * 纯静态无状态，展示 GCD 约分斜率哈希与极值共线统计推导 (LeetCode 149)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MaxPointsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'max-points-deduction';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'max-points-on-a-line' ||
      modelId === 'max-points' ||
      modelId === '149' ||
      modelId === 'leetcode-149'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const points = [[1, 1], [2, 2], [3, 3], [1, 4], [3, 2], [5, 3]];
    const n = points.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '直线上最多的点数推演展板 (Max Points on a Line GCD Hash)',
      badge: 'O(N²) 时间 · O(N) 空间 · 避免浮点误差的 GCD 约分',
      descriptionHtml:
        '在平面直角坐标系中寻找最多共线点数：以每一个点 <code>P_i</code> 为基准锚点，计算它与其余点 <code>P_j</code> 的连线斜率。通过最大公约数 <code>gcd(dx, dy)</code> 将斜率化简为最简整数比 <code>dy/dx</code> 存入哈希表，彻底规避浮点除法的精度灾难。',
      initialStateText: `点集坐标 P = [${points.map(p => `(${p[0]},${p[1]})`).join(', ')}], 点数 N = ${n}`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '斜率化简公式', valuesStr: 'g = gcd(dx, dy), 唯一标准斜率键为 (dy/g) + "/" + (dx/g)' },
      { prefix: '├───', label: '符号规范化', valuesStr: '若 dx < 0 则两者均取反 (保持 dx > 0)；若 dx == 0 则统一定义为 "1/0" (垂直线)' },
      { prefix: '└───', label: '锚点独立性', valuesStr: '外层遍历锚点 i，内层统计以 i 出发的各斜率频次，局部最大值 + 1 (算上锚点本身)' },
    ]);

    const passes = [
      {
        anchor: '锚点 0: P(1, 1)',
        details: [
          '与 P1(2, 2): dx=1, dy=1 → 斜率 1/1 (频次 1)',
          '与 P2(3, 3): dx=2, dy=2 → gcd=2 → 斜率 1/1 (频次 2)',
          '与 P3(1, 4): dx=0, dy=3 → 垂直线 1/0 (频次 1)',
          '与 P4(3, 2): dx=2, dy=1 → 斜率 1/2 (频次 1)',
          '与 P5(5, 3): dx=4, dy=2 → gcd=2 → 斜率 1/2 (频次 2)',
        ],
        maxLocal: '斜率 1/1 出现 2 次，共线点数 = 2 + 1 = 3 (点: P0, P1, P2)',
      },
      {
        anchor: '锚点 1: P(2, 2)',
        details: [
          '与 P2(3, 3): dx=1, dy=1 → 斜率 1/1 (频次 1)',
          '与 P3(1, 4): dx=-1, dy=2 → 规范化 dx=1, dy=-2 → 斜率 -2/1 (频次 1)',
          '与 P4(3, 2): dx=1, dy=0 → 水平线 0/1 (频次 1)',
          '与 P5(5, 3): dx=3, dy=1 → 斜率 1/3 (频次 1)',
        ],
        maxLocal: '各斜率最大频次 1，共线点数 = 1 + 1 = 2',
      },
      {
        anchor: '锚点 3: P(1, 4)',
        details: [
          '与 P4(3, 2): dx=2, dy=-2 → gcd=2 → 斜率 -1/1 (频次 1)',
          '与 P5(5, 3): dx=4, dy=-1 → 斜率 -1/4 (频次 1)',
        ],
        maxLocal: '各斜率最大频次 1，共线点数 = 1 + 1 = 2',
      },
    ];

    const roundsHtml = passes
      .map(p =>
        DeductionBoardPrimitives.renderOuterRound({
          title: `锚点检验: ${p.anchor}`,
          subtitle: p.maxLocal,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: p.anchor,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">局部极值</span>`,
            detailLines: p.details,
            fillLine: `局部最大统计: ${p.maxLocal}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '锚点轮换 · GCD 精确约分 · 符号归一化 · 哈希表高频聚合'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'maxPoints = 3 (位于主对角线 y = x 上的点: (1,1), (2,2), (3,3))',
      answerDescription:
        '通过将斜率规约为最简整数分数 (dy/g, dx/g)，杜绝了 double 精度带来的浮点截断错误。以每个点为锚点单次哈希统计，在 O(N²) 时间内精确捕获全局最大共线点数。',
      complexityStr: '时间复杂度: O(N² · log(max_coord)) | 空间复杂度: O(N)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
