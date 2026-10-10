/**
 * 上下界网络流与循环流 (Bounded Flow / Feasible Circulation · LOJ 115 / 洛谷 P5192) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：强制下界底流扣减、差额网络构造、超级源汇 SS/TT 平衡、伴随网络满流充要判定与真实流量还原
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BoundedFlowDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bounded-flow';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bounded-flow' ||
      modelId === 'bounded-flow-circulation' ||
      modelId === 'feasible-circulation' ||
      modelId === 'LOJ115' ||
      modelId === 'P5192'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '上下界网络流与无源汇可行流 (Bounded Flow) · 全景推演树',
      badge: 'LOJ 115 / 洛谷 P5192 / 左程云 class073 · 差额网络平衡定理 · 超级源汇 SS/TT · 伴随网络满流充要判定 · 真实流量还原',
      descriptionHtml: `
        上下界网络流要求每条边 $e$ 满足 $low(e) \\le flow(e) \\le up(e)$，且每个顶点流量守恒。<br/>
        <b>差额网络与伴随流三大定理：</b><br/>
        ① <b>底流扣减与自由容量：</b>强制扣除各边最低下界底流 $low(e)$，剩余可浮动自由容量为 $up(e) - low(e)$；<br/>
        ② <b>顶点净差额平衡：</b>记 $\\Delta(u) = \\sum \\text{必须入流} - \\sum \\text{必须出流}$。若 $\\Delta(u) > 0$，超级源点 $SS$ 向 $u$ 连边 $\\Delta(u)$；若 $\\Delta(u) < 0$，$u$ 向超级汇点 $TT$ 连边 $-\\Delta(u)$；<br/>
        ③ <b>满流充要性与真实流还原：</b>在伴随网络上求 $SS \\to TT$ 最大流，当且仅当最大流等于 $\\sum_{\\Delta > 0} \\Delta$ 时原图存在可行流。每边真实流量为 $\\text{TrueFlow}(e) = low(e) + \\text{自由流}(e)$。
      `,
      initialStateText: '初始化原图各边上下界 [low, up]，分配净差额数组 delta，准备启动强制底流扣减。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '原图上下界约束',
        valuesStr: '节点 1..n，各边流量约束 [low, up]，要求严格满足无源汇流量平衡',
      },
      {
        prefix: '├───',
        label: '虚拟超级源汇配置',
        valuesStr: '超级源点 SS = n + 1，超级汇点 TT = n + 2，用于消除各顶点收支不平衡',
      },
      {
        prefix: '└───',
        label: '状态数组初始化',
        valuesStr: 'delta = [0] * (n + 1)，level = [-1] * (n + 3)，sumPositiveDelta = 0',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】强制下界底流扣减与点差额累计 (Lower Bound Pre-flow)',
        subtitle: '扣减底流 low(e)，边自由容量变为 up(e) - low(e)，维护入流与出流净差额',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '原图上下界边扣减与净差额维护',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">强制底流</span>',
            detailLines: [
              '│  ① 遍历原图每条上下界边 (u ➔ v, low, up)',
              '│  ② 强制流出 low：delta[u] -= low；强制流入 low：delta[v] += low',
            ],
            fillLine: '└── 各点净差额 Δ(u) 严密维护，两端点盈亏精准量化 ⚖️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '自由浮动网络边构建',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">自由容量</span>',
            detailLines: [
              '│  ① 自由边容量 cap = up - low，反向容量为 0',
              '│  ② 扣除强制底流后，允许后续最大流自由推进',
            ],
            fillLine: '└── 自由浮动边网络建立，满足容量上限约束 🌊',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】伴随网络超级源汇连边 (Super Source & Sink Construction)',
        subtitle: '超级源 SS 向盈余点补流，亏损点向超级汇 TT 泄流，达成全网络流守恒',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '超级源补流边建立 (SS ➔ 盈余点)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">超级源补流</span>',
            detailLines: [
              '│  ① 对于所有 delta[i] > 0 的节点 (入流盈余)',
              '│  ② 连接 SS ➔ i，容量为 delta[i]，累加 sumPositiveDelta += delta[i]',
            ],
            fillLine: '└── 超级源补流通道建立，为入流盈余点提供源头 💧',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '超级汇泄流边建立 (亏损点 ➔ TT)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">超级汇泄流</span>',
            detailLines: [
              '│  ① 对于所有 delta[i] < 0 的节点 (出流亏损)',
              '│  ② 连接 i ➔ TT，容量为 -delta[i]，由超级汇负责吸收不足流量',
            ],
            fillLine: '└── 超级汇泄流通道建立，吸收出流亏损差额 🔥',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】Dinic 伴随网络最大流求解 (Dinic Max-Flow Verification)',
        subtitle: 'BFS 层次分图 + DFS 阻塞推流，检验伴随网络是否满流',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '广度优先搜索构建分层网络',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">BFS 分层</span>',
            detailLines: [
              '│  ① 标定 level[SS] = 0，常规点 level = 1，level[TT] = 2',
              '│  ② 判定超级汇点 TT 在残量网络中是否可达',
            ],
            fillLine: '└── 分层网络构建完成，杜绝增广出现环路 📐',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '深度优先搜索多路阻塞推流',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">DFS 阻塞流</span>',
            detailLines: [
              '│  ① 沿分层路径持续推进增广流量',
              '│  ② 累计伴随网络最大推流 maxFlow',
            ],
            fillLine: '└── 伴随网络最大流计算完毕 🚀',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】满流充要判定与真实流量还原 (Feasibility & True Flow Restoration)',
        subtitle: '满流充要判定：maxFlow == sumPositiveDelta；还原真实流量 = low + 自由流',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '满流充要性定理验证',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">满流判定</span>',
            detailLines: [
              '│  ① 充要判定：maxFlow 是否等于 sumPositiveDelta',
              '│  ② 相等 ⟺ 所有超级源边全满流 ⟺ 原图各节点收支完全平衡，存在可行流！',
            ],
            fillLine: '└── 满流条件完美达成，判定原图存在可行流 ⚖️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '原图真实物理流量精确还原',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-green-100 text-green-800 rounded font-bold">流量还原</span>',
            detailLines: [
              '│  ① 每条原边真实流量 TrueFlow(e) = low(e) + 自由流 flow(e)',
              '│  ② 严格满足 low(e) <= TrueFlow(e) <= up(e) 且各顶点流量守恒',
            ],
            fillLine: '└── 原图真实合法可行流完全解出 🎉',
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
