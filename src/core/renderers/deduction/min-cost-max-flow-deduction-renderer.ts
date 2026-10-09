/**
 * 最小费用最大流 (Minimum Cost Maximum Flow - MCMF · 洛谷 P3381) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：残量网络连续最短路 (SSP / SPFA)、成对反向弧流量更新、反向弧负费用冲抵退费与总费用闭环
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MinCostMaxFlowDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'min-cost-max-flow';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'min-cost-max-flow' ||
      modelId === 'mcmf' ||
      modelId === 'minimum-cost-maximum-flow' ||
      modelId === 'class072-code01' ||
      modelId === 'P3381'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '最小费用最大流 (Minimum Cost Maximum Flow) · 全景推演树',
      badge: '洛谷 P3381 / 左程云 class072 · 连续最短路算法 (SSP) · SPFA 寻费 · 成对反向弧负费用退流 · 费用闭环',
      descriptionHtml: `
        在容量网络中寻找源点 $S$ 到汇点 $T$ 的一条最大流，并使得沿途边的单位费用总和最小。<br/>
        算法推演三大核心阶段：<br/>
        ① <b>连续最短路寻找 (Successive Shortest Path)：</b>在残量网络中，以弧的单位费用 $\\text{cost}$ 为权值，运行 SPFA 算法寻找 $S$ 到 $T$ 的单位费用最短路径；<br/>
        ② <b>瓶颈容量增广与成对反向弧维护：</b>沿最短路计算瓶颈剩余容量 $f = \\min(c(e) - f(e))$。正向弧流量增加 $f$，成对反向弧流量减少 $f$（反向弧容量为 0，费用为 $-\\text{cost}$），实现流量反悔与负费用退费冲抵；<br/>
        ③ <b>残量网络耗尽与终局核算：</b>重复 SPFA 寻路直至残量网络中 $S$ 与 $T$ 不再连通。此时最大流达成且总费用 $\\sum f \\times \\text{dist}[T]$ 达到全局理论极小值。
      `,
      initialStateText: '初始化 4 点残量网络，全边正向容量就绪，反向弧费用置为相反数，准备调用 SPFA 寻找首轮最低单位费用增广路。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '网络节点与弧配置',
        valuesStr: 'S(源), A, B, T(汇), 弧集: S➔A(3,¥1), A➔T(2,¥2), S➔B(2,¥3), B➔T(3,¥1), A➔B(1,¥1)',
      },
      {
        prefix: '├───',
        label: '反向弧反悔法则',
        valuesStr: '反向弧费用为 -cost，退流时同步冲抵对应单位费用',
      },
      {
        prefix: '└───',
        label: '初始流量与累计费用',
        valuesStr: 'maxFlow = 0, minCost = 0',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】第一轮增广：经由主干通路 S ➔ A ➔ T (Cost = 3)',
        subtitle: 'SPFA 发现单位费用最低路径 S ➔ A (¥1) ➔ T (¥2)，单位费用为 3',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'SPFA 锁定最短路径 S ➔ A ➔ T',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">单位费: 3</span>',
            detailLines: [
              '│  ① dist[S]=0, dist[A]=1, dist[T]=3',
              '│  ② 前驱路径: S ➔ A ➔ T',
            ],
            fillLine: '└── 锁定首条最低费用增广路径 🔍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '瓶颈计算与推流 2 单位',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">+2 流</span>',
            detailLines: [
              '│  ① 瓶颈残量 pushed = min(3-0, 2-0) = 2',
              '│  ② 边 A➔T 满流饱和 (2/2)',
              '│  ③ 费用累加: 2 × ¥3 = ¥6，maxFlow=2, minCost=6',
            ],
            fillLine: '└── 完成第 1 轮增广推流 🌊',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】第二轮增广：经由下路分流 S ➔ B ➔ T (Cost = 4)',
        subtitle: '下路弧 S ➔ B (¥3) ➔ T (¥1)，单位费用为 4',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'SPFA 发现最短路 S ➔ B ➔ T',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">单位费: 4</span>',
            detailLines: [
              '│  ① dist[S]=0, dist[B]=3, dist[T]=4',
              '│  ② 前驱路径: S ➔ B ➔ T',
            ],
            fillLine: '└── 锁定次优最低费用增广路 🔍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '瓶颈计算与推流 2 单位',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">+2 流</span>',
            detailLines: [
              '│  ① 瓶颈残量 pushed = min(2-0, 3-0) = 2',
              '│  ② 边 S➔B 达成满流 (2/2)',
              '│  ③ 费用累加: 2 × ¥4 = ¥8，maxFlow=4, minCost=14',
            ],
            fillLine: '└── 完成第 2 轮增广推流 🌊',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】第三轮增广：中继跨越 S ➔ A ➔ B ➔ T (Cost = 3)',
        subtitle: '利用中继边 A ➔ B 榨干剩余容量，推流 1 单位',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'SPFA 发现折线增广路 S ➔ A ➔ B ➔ T',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">单位费: 3</span>',
            detailLines: [
              '│  ① 路径费用: 1 + 1 + 1 = 3',
              '│  ② 瓶颈残量 pushed = min(3-2, 1-0, 3-2) = 1',
            ],
            fillLine: '└── 榨取全网最后 1 单位流量 🔍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '终局结算与收敛',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">全局最优</span>',
            detailLines: [
              '│  ① 最终累计流量: maxFlow = 5',
              '│  ② 最终累计费用: minCost = 14 + 1 × 3 = 17',
              '│  ③ 残量网络中 S 与 T 不再连通，增广结束',
            ],
            fillLine: '└── 达成全局理论最小费用最大流: Flow=5, Cost=17 🏆',
          }),
        ].join(''),
      }),
    ];

    return [header, baseCase, ...rounds].join('\n');
  }
}
