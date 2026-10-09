/**
 * 有限最短路 (Limited Shortest Path · LC 787) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 限制最多 K+1 步松弛、clone[] 状态备份阻断多步串联、动态规划逐轮收敛
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LimitedShortestPathDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'limited-shortest-path';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'limited-shortest-path' ||
      modelId === 'cheapest-flights-within-k-stops' ||
      modelId === 'leetcode-787' ||
      modelId === 'lc-787'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 787. K 站中转内最便宜的航班 (Limited Shortest Path · Bellman-Ford) · 全景推演树',
      badge: '最多走 K+1 条边 · clone[] 状态备份阻断串联 · 动态规划逐轮收敛',
      descriptionHtml: `
        航线网络包含 5 座城市 (0..4) 与 7 条带权航线，起点 <code class="font-bold text-slate-800">src = 0</code>，终点 <code class="font-bold text-slate-800">dst = 4</code>，最多中转 <code class="font-bold text-slate-800">K = 2</code> 次（即最多走 <code class="font-bold text-slate-800">K + 1 = 3</code> 条边）。<br/>
        核心算法架构：<br/>
        ① <b>边数限制与 Bellman-Ford 轮次对齐：</b> Bellman-Ford 第 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">i</code> 轮迭代得到的正是严格最多走 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">i</code> 条边的单源最低价格；<br/>
        ② <b>状态备份阻断串联效应 (Critical Clone)：</b> 每轮松弛开始前必须克隆 <code class="font-mono bg-pink-50 text-pink-700 px-1 py-0.5 rounded font-bold">clone = dist.clone()</code>，松弛时依据 <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-bold">clone[u]</code> 推进，坚决防止同一轮迭代沿多条边发生连续串联导致步数超标；<br/>
        ③ <b>K + 1 轮早停与终态结算：</b> 仅需运行 <code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">K + 1</code> 轮全边松弛，最终返回 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">dist[dst] == INF ? -1 : dist[dst]</code>！
      `,
      initialStateText: '起点 dist[0] = 0，其余城市为 ∞，最多进行 K+1 = 3 轮松弛。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '距离表初始化：dist[0] = 0, 其余各城市置为 ∞',
        valuesStr: 'dist = [0, ∞, ∞, ∞, ∞]',
      },
      {
        prefix: '└───',
        label: '轮数上限约束：最多允许中转 K=2 次，对应至多经过 3 条航线',
        valuesStr: 'maxRound = K + 1 = 3',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮松弛】最多经过 1 条航线 (直飞航班)',
        subtitle: '备份 clone = [0, ∞, ∞, ∞, ∞] · 仅源点出边能产生有效松弛',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '航线 (0 ➔ 1, 价格 3)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">松弛成功</span>',
            detailLines: [
              '│  ① clone[0] + 3 = 0 + 3 = 3 < dist[1] (∞)',
              '│  ② 更新 dist[1] = 3',
            ],
            fillLine: '└── dist[1] = 3 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '航线 (0 ➔ 2, 价格 5)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">松弛成功</span>',
            detailLines: [
              '│  ① clone[0] + 5 = 0 + 5 = 5 < dist[2] (∞)',
              '│  ② 更新 dist[2] = 5',
            ],
            fillLine: '└── dist[2] = 5 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '其余航线前驱 clone[u] = ∞',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-bold">跳过</span>',
            detailLines: [
              '│  ① 航线 (1➔2, 1➔3, 2➔3, 2➔4, 3➔4) 前驱不可达，跳过',
            ],
            fillLine: '└── 第 1 轮结算：dist = [0, 3, 5, ∞, ∞]',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮松弛】最多经过 2 条航线 (1 站中转)',
        subtitle: '备份 clone = [0, 3, 5, ∞, ∞] · 扩展至城市 2, 3, 4',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '航线 (1 ➔ 2, 价格 1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">更优中转</span>',
            detailLines: [
              '│  ① clone[1] + 1 = 3 + 1 = 4 < dist[2] (5)',
              '│  ② 经城市 1 中转使到达城市 2 的花费从 5 降至 4！',
            ],
            fillLine: '└── dist[2] = 4 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '航线 (2 ➔ 3, 价格 2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">波前推进</span>',
            detailLines: [
              '│  ① clone[2] + 2 = 5 + 2 = 7 < dist[3] (∞)',
              '│  ② 更新 dist[3] = 7',
            ],
            fillLine: '└── dist[3] = 7 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '航线 (2 ➔ 4, 价格 7)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">终点首达</span>',
            detailLines: [
              '│  ① clone[2] + 7 = 5 + 7 = 12 < dist[4] (∞)',
              '│  ② 首度抵达终点城市 4：dist[4] = 12',
            ],
            fillLine: '└── 第 2 轮结算：dist = [0, 3, 4, 7, 12]',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮松弛】最多经过 3 条航线 (2 站中转 · 终态)',
        subtitle: '备份 clone = [0, 3, 4, 7, 12] · 锁定全局最优花费 9',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '航线 (2 ➔ 3, 价格 2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">缩短中转</span>',
            detailLines: [
              '│  ① clone[2] + 2 = 4 + 2 = 6 < dist[3] (7)',
              '│  ② 更新 dist[3] 从 7 缩短至 6',
            ],
            fillLine: '└── dist[3] = 6 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '航线 (2 ➔ 4, 价格 7)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">缩短终点</span>',
            detailLines: [
              '│  ① clone[2] + 7 = 4 + 7 = 11 < dist[4] (12)',
              '│  ② 经更便宜的城市 2 中转使 dist[4] 降至 11',
            ],
            fillLine: '└── dist[4] = 11 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '航线 (3 ➔ 4, 价格 2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">最终最优 ⚡</span>',
            detailLines: [
              '│  ① clone[3] + 2 = 7 + 2 = 9 < dist[4] (11)',
              '│  ② 沿路径 (0➔2➔3➔4) 达成最低价格 9！',
            ],
            fillLine: '└── 终态结算：dist[4] = 9 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'Bellman-Ford 状态备份逐轮松弛推演'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return dist[dst] = 9;',
      answerDescription: '在最多 2 站中转限制下，从城市 0 到城市 4 的最低价格路线为 0 ➔ 2 ➔ 3 ➔ 4 (共 3 条边，2 次中转)，总价格为 5 + 2 + 2 = 9！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
