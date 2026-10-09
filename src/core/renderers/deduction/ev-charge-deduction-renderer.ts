/**
 * 电动车充放电最短路 (EV Charging Dijkstra · LeetCode LCP 35) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 状态升维 (city, power)、原地充电 +1 与道路放电 -w 双决策生命周期
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class EVChargeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'ev-charge-dijkstra';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'ev-charge-dijkstra' ||
      modelId === 'ev-charge-dijkstra-064' ||
      modelId === 'leetcode-lcp-35' ||
      modelId === 'lcp-35' ||
      modelId === 'class064-code05' ||
      modelId === 'class064-ev-charge'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode LCP 35. 电动车充放电最短路 (EV Charging Dijkstra) · 全景推演树',
      badge: '二维状态升维 (city, power) · 原地充电 +1格 · 道路行驶放电 -w · 小根堆优化',
      descriptionHtml: `
        城市路网包含 <span class="font-bold text-slate-800">N = 3</span> 座城市 (C0, C1, C2)，电池最大容量为 <code class="font-bold text-slate-800">cnt = 2</code> 格，起点 C0，终点 C2。<br/>
        城市充电站单价：<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">charge = [2, 1, 5]</code>，道路耗电与耗时：<code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-bold">paths = [[0, 1, 2], [1, 2, 2]]</code>。<br/>
        核心转移架构：<br/>
        ① <b>状态空间升维：</b> 每一个状态由二元组 <code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">(city, power)</code> 唯一确定，总状态数 <span class="font-bold">N × (cnt + 1)</span>；<br/>
        ② <b>原地充电决策：</b> 若 <code class="font-mono bg-pink-50 text-pink-700 px-1 py-0.5 rounded font-bold">power &lt; cnt</code>，充 1 格电耗时 <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-bold">charge[city]</code>，跃迁至 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">(city, power + 1)</code>；<br/>
        ③ <b>公路行驶放电：</b> 若 <code class="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-bold">power &ge; w</code>，可沿公路行驶耗时 <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-bold">w</code>，跃迁至 <code class="font-mono bg-cyan-50 text-cyan-800 px-1 py-0.5 rounded font-bold">(nextCity, power - w)</code>。
      `,
      initialStateText: '起点 (C0, 电量 0格) 花费 0 入堆，dist 矩阵全为 ∞，小根堆 PQ=[(C0, p:0, 0s)]。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '升维状态矩阵定义：dist[n][cnt+1]，记录各城市在各电量水平下的最小累计耗时',
        valuesStr: 'dist[0..2][0..2] 全部初始化为 ∞',
      },
      {
        prefix: '└───',
        label: '起点 0 初始电量 0 入堆：dist[0][0] = 0',
        valuesStr: 'PQ = [(City 0, power: 0, cost: 0s)]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】poll 出堆状态 (City 0, power: 0格, 耗时 0s)',
        subtitle: '锁定 visited[0][0] = true · 产生原地充电分支',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆锁定起点状态 (C0, 0格)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">起点结算</span>',
            detailLines: [
              '│  ① 锁定当前最优到达时间：dist[0][0] = 0s',
            ],
            fillLine: '└── dist[0][0] = 0s ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '决策一：原地充电 (单价 2s/格)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">原地充电</span>',
            detailLines: [
              '│  ① 当前电量 0 < 2格，充 1 格电预计耗时 0 + 2 = 2s',
              '│  ② dist[0][1] = 2s, 推入小根堆 pq([C0, p:1, 2s])',
            ],
            fillLine: '└── 获得新状态 (C0, p:1, 2s) 入堆',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '决策二：公路行驶考察 (0 ➔ 1, 需耗电 2格)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">电量不足</span>',
            detailLines: [
              '│  ① 当前电量 0 < 道路消耗 2格，无法通行，必须先充电',
            ],
            fillLine: '└── 行驶分支剪枝 ❌',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】poll 出堆状态 (City 0, power: 1格, 耗时 2s)',
        subtitle: '锁定 visited[0][1] = true · 继续原地充电以满足 2格 电量门槛',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆锁定状态 (C0, 1格)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">波前锁定</span>',
            detailLines: [
              '│  ① 锁定 dist[0][1] = 2s',
            ],
            fillLine: '└── dist[0][1] = 2s ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '决策一：原地充电至 2格满电',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">充至满电</span>',
            detailLines: [
              '│  ① 1格 < 2格，再充 1 格耗时 2 + 2 = 4s',
              '│  ② dist[0][2] = 4s, 推入小根堆 pq([C0, p:2, 4s])',
            ],
            fillLine: '└── 满电状态 (C0, p:2, 4s) 入堆',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】poll 出堆状态 (City 0, power: 2格, 耗时 4s)',
        subtitle: '满电状态出堆 · 满足公路通行条件，向城市 C1 放电行驶',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆锁定满电状态 (C0, 2格)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">满电就绪</span>',
            detailLines: [
              '│  ① 锁定 dist[0][2] = 4s',
            ],
            fillLine: '└── dist[0][2] = 4s ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '决策二：公路行驶 (0 ➔ 1, 耗电 2格, 耗时 2s)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">道路行驶 🚗</span>',
            detailLines: [
              '│  ① 电量 2 >= 2格，行驶到达城市 C1，剩余电量 2 - 2 = 0格',
              '│  ② 到达时间 4 + 2 = 6s < dist[1][0] (∞)',
              '│  ③ 更新 dist[1][0] = 6s, 推入小根堆 pq([C1, p:0, 6s])',
            ],
            fillLine: '└── 成功抵达城市 C1，新波前 (C1, p:0, 6s) 入堆！',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 轮】poll 出堆状态 (City 1, power: 0格, 耗时 6s)',
        subtitle: '锁定 visited[1][0] = true · 城市 C1 拥有最便宜充电站 (单价 1s/格)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆锁定状态 (C1, 0格)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">抵站锁定</span>',
            detailLines: [
              '│  ① 锁定 dist[1][0] = 6s',
            ],
            fillLine: '└── dist[1][0] = 6s ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '决策一：在 C1 廉价充电站充 1 格电',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">廉价快充 ⚡</span>',
            detailLines: [
              '│  ① 单价仅 1s/格！充 1 格电累计耗时 6 + 1 = 7s',
              '│  ② dist[1][1] = 7s, 推入小根堆 pq([C1, p:1, 7s])',
            ],
            fillLine: '└── dist[1][1] = 7s 入堆',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 5 轮】poll 出堆状态 (City 1, power: 1格, 耗时 7s)',
        subtitle: '在 C1 继续充至满电 2 格',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '决策一：在 C1 充第 2 格电',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">充至满电</span>',
            detailLines: [
              '│  ① 累计耗时 7 + 1 = 8s',
              '│  ② dist[1][2] = 8s, 推入小根堆 pq([C1, p:2, 8s])',
            ],
            fillLine: '└── dist[1][2] = 8s ✅ (满电就绪)',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 6 轮】poll 出堆状态 (City 1, power: 2格, 耗时 8s)',
        subtitle: '满电状态出堆 · 沿公路驶往目的地城市 C2',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '决策二：公路行驶 (1 ➔ 2, 耗电 2格, 耗时 2s)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">直达终点 🏁</span>',
            detailLines: [
              '│  ① 电量 2 >= 2格，行驶到达终点 C2，剩余电量 2 - 2 = 0格',
              '│  ② 到达时间 8 + 2 = 10s',
              '│  ③ 更新 dist[2][0] = 10s, 推入小根堆 pq([C2, p:0, 10s])',
            ],
            fillLine: '└── dist[2][0] = 10s 入堆！终点波前就绪',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 7 轮】poll 出堆终点状态 (City 2, power: 0格, 耗时 10s)',
        subtitle: '首度命中终点城市 · 触发早停，锁定全局最优耗时',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '终点城市代表元锁定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">最优收敛</span>',
            detailLines: [
              '│  ① 城市 C2 首度出堆，当前最小耗时 10s',
              '│  ② 小根堆单调性保证后续出堆状态耗时必 >= 10s，直接终止',
            ],
            fillLine: '└── return dist[2][0] = 10s 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '分层状态空间 (city, power) Dijkstra 松弛推演'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return dist[end][0] = 10;',
      answerDescription: '最优电动车行程规划完成：在 C0 充 2 格电 (4s) ➔ 驶往 C1 耗电 2 格 (2s，耗时6s) ➔ 在 C1 廉价充电站充 2 格电 (2s，耗时8s) ➔ 驶往 C2 耗电 2 格 (2s，耗时10s)，全局最小旅行总耗时为 10s！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
