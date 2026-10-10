/**
 * 网络流最大权闭合子图 (Max-Weight Closure · 洛谷 P2762) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：超级源汇网络流规约、强依赖边无穷大容量、最小割与净收益对偶定理、残量网络可达集还原
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MaxWeightClosureDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'max-weight-closure';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'max-weight-closure' ||
      modelId === 'max-weight-closure-graph' ||
      modelId === 'space-project' ||
      modelId === 'class072' ||
      modelId === 'P2762'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '网络流最大权闭合子图 (Max-Weight Closure) · 全景推演树',
      badge: '洛谷 P2762 太空飞行计划 / 左程云 class072 · 最小割模型 · 正权连源 S · 负权连汇 T · 依赖容量 ∞ · 最大净收益 = 正权和 - 最小割',
      descriptionHtml: `
        闭合子图是指图的一个子点集，其中任意节点的出边所指向的节点依然属于该点集。<br/>
        <b>网络流最小割规约三大定理：</b><br/>
        ① <b>权值转化源汇网络：</b>超级源 $S$ 向所有正权收益点连边，容量为收益；所有负权成本点向超级汇 $T$ 连边，容量为成本绝对值；原图中依赖边容量设为 $\\infty$（确保闭合性不被破坏）；<br/>
        ② <b>对偶极值恒等式：</b>割断 $(S \\to u)$ 代表放弃正权收益，割断 $(v \\to T)$ 代表支付负权成本。因此：$$\\text{最大净收益} = \\sum_{w > 0} w - \\text{最小割容量}$$；<br/>
        ③ <b>残量可达方案提取：</b>求解 $S-T$ 最大流（等于最小割）后，残量网络中从源点 $S$ 出发沿未满流边能够到达的所有节点集合，即为构成最大权闭合子图的最优解！
      `,
      initialStateText: '初始化实验与仪器节点配置，确立超级源点 S 与超级汇点 T，准备启动网络流最小割规约。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '太空飞行计划节点集',
        valuesStr: '实验 E1(+10), E2(+15)；仪器 I1(-5), I2(-8), I3(-7)',
      },
      {
        prefix: '├───',
        label: '依赖关系 (不可切断)',
        valuesStr: 'E1 依赖 I1, I2；E2 依赖 I2, I3 (容量 cap = ∞)',
      },
      {
        prefix: '└───',
        label: '初始总收益与割值',
        valuesStr: '正权总和 = 10 + 15 = 25，初始割值 minCut = 0，当前净收益 = 0',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】源汇建图与闭合依赖强约束建模 (Flow Network Construction)',
        subtitle: '正权连源 S，负权连汇 T，依赖关系赋予无穷大容量',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '正权收益边与负权成本边构建',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">收益/成本边</span>',
            detailLines: [
              '│  ① 连源边: S ➔ E1 (cap=10), S ➔ E2 (cap=15)，正权总收益 = 25',
              '│  ② 连汇边: I1 ➔ T (cap=5), I2 ➔ T (cap=8), I3 ➔ T (cap=7)',
            ],
            fillLine: '└── 源汇权值网络就绪，收益与成本完全量化 💰',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '无穷大闭合依赖约束边构建',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">强闭合约束</span>',
            detailLines: [
              '│  ① E1 ➔ I1 (cap=∞), E1 ➔ I2 (cap=∞)',
              '│  ② E2 ➔ I2 (cap=∞), E2 ➔ I3 (cap=∞)',
              '│  ③ 依赖边容量 ∞ 保证最小割绝对不会割断依赖边',
            ],
            fillLine: '└── 依赖边不可割断，闭合子图性质获得严密数学保证 🔒',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】Dinic 算法求解网络最小割 (Min-Cut Computation)',
        subtitle: '运行 Dinic 最大流算法，根据最大流最小割定理求得最小代价割',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '分层网络与阻塞流增广',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">增广推流</span>',
            detailLines: [
              '│  ① 第一路阻塞流: S ➔ E1 ➔ I1 ➔ T (推流 5)',
              '│  ② 第二路阻塞流: S ➔ E1 ➔ I2 ➔ T 与 S ➔ E2 ➔ I2 ➔ T (共推流 8)',
              '│  ③ 第三路阻塞流: S ➔ E2 ➔ I3 ➔ T (推流 7)',
            ],
            fillLine: '└── 网络满流，总推流流量达 20 🌊',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '最小割割值确定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-bold">最小割: 20</span>',
            detailLines: [
              '│  ① 割边集: (I1, T), (I2, T), (I3, T) 均达到饱和满流',
              '│  ② 最小割容量 minCut = 5 + 8 + 7 = 20',
            ],
            fillLine: '└── 最小割确定为 20，伴随成本完全割舍 ✂️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】最大净收益核算与闭合方案还原 (Max Profit & Chosen Nodes)',
        subtitle: '最大收益 = 正权和 - 最小割，残量网络 S 可达点为闭合子图',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '对偶极值计算',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">最大净收益</span>',
            detailLines: [
              '│  ① 正权总和 totalPos = 25',
              '│  ② 最小割代价 minCut = 20',
              '│  ③ 最大净收益 = totalPos - minCut = 25 - 20 = 5',
            ],
            fillLine: '└── 全局最大净收益达 5 万元 🏆',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '残量网络可达性遍历输出方案',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">闭合方案</span>',
            detailLines: [
              '│  ① 从源点 S 出发走 cap > flow 的残量边可达: E1, E2, I1, I2, I3',
              '│  ② 闭合子图所选节点集: { E1, E2, I1, I2, I3 }',
              '│  ③ 验证闭合性: E1 依赖的 I1, I2 在集合中；E2 依赖的 I2, I3 也在集合中！',
            ],
            fillLine: '└── 闭合子图性质 100% 满足，方案圆满闭环 ✅',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="p-4 space-y-4 font-mono text-xs text-slate-200">
        ${header}
        ${baseCase}
        ${rounds.join('')}
      </div>
    `;
  }
}
