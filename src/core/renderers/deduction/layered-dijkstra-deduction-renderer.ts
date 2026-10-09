/**
 * 分层图最短路 (Layered Dijkstra · 洛谷 P4568 飞行路线) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 状态升维 (u, usedK)、同层原价转移与跨层 0 权免票跃迁生命周期
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LayeredDijkstraDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'layered-dijkstra';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'layered-dijkstra' ||
      modelId === 'layered-dijkstra-064' ||
      modelId === 'luogu-p4568' ||
      modelId === 'flight-routes' ||
      modelId === 'class064-code04' ||
      modelId === 'class064-layered-dijkstra'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P4568 飞行路线 (Layered Dijkstra · 分层图最短路) · 全景推演树',
      badge: '状态升维 (u, usedK) · 同层常规转移 · 跨层 0 权免票跃迁',
      descriptionHtml: `
        有向/无向带权网络 <span class="font-bold text-slate-800">G = (V, E)</span> (5 城市 7 航线)，支持最多 <code class="font-bold text-slate-800">k = 1</code> 次免费乘坐特权。<br/>
        核心建模架构：<br/>
        ① <b>状态空间升维：</b> 每一个实体城市被克隆为 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">k + 1</code> 层（第 0 层原价购票，第 1 层已用 1 次免票）；<br/>
        ② <b>同层买票转移：</b> <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-bold">dist[v][used] = dist[u][used] + w</code>，不消耗免票特权；<br/>
        ③ <b>跨层 0 权跃迁：</b> 若 <code class="font-mono bg-pink-50 text-pink-700 px-1 py-0.5 rounded font-bold">used &lt; k</code>，可沿边直接跃迁至 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">dist[v][used + 1] = dist[u][used] + 0</code>，零花费升舱！
      `,
      initialStateText: '起点 0 在第 0 层入堆 (dist[0][0]=0)，其余各层各点为 ∞，优先队列 pq=[(0, used:0, 0元)]。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '升维状态矩阵定义：dist[n][k+1]，记录各城市在各免票状态下的最小花费',
        valuesStr: 'dist[0..4][0..1] 全部初始化为 ∞',
      },
      {
        prefix: '└───',
        label: '起点 0 在 0 免票层入堆：dist[0][0] = 0',
        valuesStr: 'PQ = [(Node 0, used: 0, cost: 0元)]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】poll 出堆状态 (Node 0, used: 0, 花费 0元)',
        subtitle: '锁定 visited[0][0] = true · 产生同层买票与跨层免单双重波前',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆锁定状态 (0, 0)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">起点结算</span>',
            detailLines: [
              '│  ① 锁定当前最优：dist[0][0] = 0元',
            ],
            fillLine: '└── dist[0][0] = 0元 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '航线 (0 ➔ 1, 原价 2元) 双决策松弛',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">同层+跨层</span>',
            detailLines: [
              '│  ① 同层购票：dist[1][0] = 0 + 2 = 2元, 入堆 pq([1, used:0, 2元])',
              '│  ② 跨层免单：used(0) < k(1)，dist[1][1] = 0 + 0 = 0元, 入堆 pq([1, used:1, 0元])',
            ],
            fillLine: '└── 跨层 0 权产生极速波前 (1, L1, 0元)',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '航线 (0 ➔ 2, 原价 5元) 双决策松弛',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">跨层免大额</span>',
            detailLines: [
              '│  ① 同层购票：dist[2][0] = 0 + 5 = 5元',
              '│  ② 跨层免单：dist[2][1] = 0 + 0 = 0元, 入堆 pq([2, used:1, 0元])',
            ],
            fillLine: '└── 免去 5 元昂贵机票！(2, L1, 0元) 入堆',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】poll 出堆状态 (Node 1, used: 1, 花费 0元)',
        subtitle: '锁定 visited[1][1] = true · 免票额度已用尽，仅同层买票推进',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出堆锁定状态 (1, 1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">免票波前</span>',
            detailLines: [
              '│  ① 当前花费 0元到达城市 1 (已使用 1 次免票)',
              '│  ② 考察出边 (1 ➔ 2, 2元): dist[2][1] = 0 + 2 = 2元 (因已有 0元 故不更新)',
              '│  ③ 考察出边 (1 ➔ 3, 4元): dist[3][1] = 0 + 4 = 4元, 入堆 pq([3, used:1, 4元])',
            ],
            fillLine: '└── dist[3][1] = 4元 ✅',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】poll 出堆状态 (Node 2, used: 1, 花费 0元)',
        subtitle: '锁定 visited[2][1] = true · 沿航线 (2 ➔ 3, 1元) 极速突破',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '航线 (2 ➔ 3, 原价 1元) 同层推进',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">突破性松弛 ⚡</span>',
            detailLines: [
              '│  ① 比较：0 + 1 = 1元 < dist[3][1] (4元)',
              '│  ② 刷新城市 3 最小花费：dist[3][1] 从 4元 大幅缩短至 1元！',
              '│  ③ 入堆：pq.push([3, used:1, 1元])',
            ],
            fillLine: '└── dist[3][1] 更新为 1元，取得全局优势！',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 轮】poll 出堆状态 (Node 3, used: 1, 花费 1元)',
        subtitle: '锁定 visited[3][1] = true · 直达终点城市 4',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '航线 (3 ➔ 4, 原价 3元) 直达终点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">终点松弛</span>',
            detailLines: [
              '│  ① 计算到达终点花费：dist[3][1] + 3 = 1 + 3 = 4元',
              '│  ② 更新终点：dist[4][1] = 4元, 入堆 pq([4, used:1, 4元])',
            ],
            fillLine: '└── dist[4][1] = 4元 ✅ 终点波前就绪',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 5 轮】poll 出堆终点状态 (Node 4, used: 1, 花费 4元)',
        subtitle: '首度命中终点城市 · 触发早停，锁定全局最优花费',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '终点代表元锁定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">最优收敛</span>',
            detailLines: [
              '│  ① 城市 4 在第 1 层出堆，花费 4 元',
              '│  ② Dijkstra 贪心性保证后续出堆状态花费必 >= 4元，直接终止搜索',
            ],
            fillLine: '└── return dist[4][1] = 4元 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '分层状态空间 Dijkstra 松弛推演'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return dist[t][k] = 4;',
      answerDescription: '最优飞行路线确定：0 ➔ 2 (免票 0元) ➔ 3 (原价 1元) ➔ 4 (原价 3元)，免去最贵票价 5元，总花费仅为 4元！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
