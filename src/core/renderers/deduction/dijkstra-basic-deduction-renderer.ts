/**
 * 朴素 Dijkstra · 全景推演树渲染策略 (DijkstraBasicDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 贪心选点、三角不等式松弛 (dist[u] + w < dist[v]) 与最短路锁定生命周期
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DijkstraBasicDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'dijkstra-basic';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'dijkstra-basic' ||
      modelId === 'dijkstra' ||
      modelId === 'dijkstra-naive' ||
      modelId === 'dijkstra-basic-061' ||
      modelId === 'class061-dijkstra-basic' ||
      modelId === 'class061-code01'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '朴素 Dijkstra 最短路径 (Dijkstra Naive · O(V²)) · 全景推演树',
      badge: '贪心选点 · 三角不等式松弛 (dist[u] + w < dist[v])',
      descriptionHtml: `
        有向带权图 <span class="font-bold text-slate-800">G = (V, E)</span> (5 节点)，源点为 0。<br/>
        状态定义：<span class="font-bold text-slate-800">dist[i]</span> 表示从源点 0 出发到节点 i 的当前最短距离估计；
        <span class="font-bold text-slate-800">visited[i]</span> 标记节点 i 的最短路是否已全局锁定确定。<br/>
        每轮从未访问集合中贪心提取 dist 最小节点 u，锁定 <code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">visited[u] = true</code>，并尝试松弛其所有出边 (u ➔ v, w)。
      `,
      initialStateText: '源点 0 初始化为 0 (dist[0]=0)，其余节点距离设为正无穷 ∞，visited 访问集置空。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '源点初始化：dist[0] = 0，源点到自身理论最短路必为 0',
        valuesStr: 'dist = [0, ∞, ∞, ∞, ∞]',
      },
      {
        prefix: '└───',
        label: '访问集合置空：boolean[] visited = new boolean[5]，记录全局已锁定顶点',
        valuesStr: 'visited = [false, false, false, false, false]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】贪心选出最小未访问节点 u = 0 (dist[0] = 0)',
        subtitle: '锁定 visited[0] = true · 松弛节点 0 的出边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '考察出边 (0 ➔ 1, 权重 w=4)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">成功松弛</span>',
            detailLines: [
              '│  ① 比较：dist[0] + 4 = 0 + 4 = 4 < dist[1](∞)',
              '│  ② 更新：dist[1] 从 ∞ 缩短至 4',
            ],
            fillLine: '└── dist[1] = 4 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '考察出边 (0 ➔ 2, 权重 w=1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">成功松弛</span>',
            detailLines: [
              '│  ① 比较：dist[0] + 1 = 0 + 1 = 1 < dist[2](∞)',
              '│  ② 更新：dist[2] 从 ∞ 缩短至 1',
            ],
            fillLine: '└── dist[2] = 1 ✅ (当前状态 dist: [0, 4, 1, ∞, ∞])',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】贪心选出最小未访问节点 u = 2 (dist[2] = 1)',
        subtitle: '锁定 visited[2] = true · 探索三角不等式缩短路径',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '考察出边 (2 ➔ 1, 权重 w=2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">路径更优</span>',
            detailLines: [
              '│  ① 三角不等式检验：dist[2] + 2 = 1 + 2 = 3 < dist[1](4)',
              '│  ② 绕道 0 ➔ 2 ➔ 1 距离比直接 0 ➔ 1 更短！dist[1] 缩短为 3',
            ],
            fillLine: '└── dist[1] = 3 ⚡ (突破性松弛)',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '考察出边 (2 ➔ 3, 权重 w=5)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">成功松弛</span>',
            detailLines: [
              '│  ① 比较：dist[2] + 5 = 1 + 5 = 6 < dist[3](∞)',
              '│  ② 更新：dist[3] 从 ∞ 缩短至 6',
            ],
            fillLine: '└── dist[3] = 6 ✅ (当前状态 dist: [0, 3, 1, 6, ∞])',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】贪心选出最小未访问节点 u = 1 (dist[1] = 3)',
        subtitle: '锁定 visited[1] = true · 传递松弛后续节点',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '考察出边 (1 ➔ 3, 权重 w=1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">二次缩短</span>',
            detailLines: [
              '│  ① 比较：dist[1] + 1 = 3 + 1 = 4 < dist[3](6)',
              '│  ② 绕道 0 ➔ 2 ➔ 1 ➔ 3 比 0 ➔ 2 ➔ 3 缩短 2 个单位！',
            ],
            fillLine: '└── dist[3] 从 6 缩短为 4 ⚡ (当前状态 dist: [0, 3, 1, 4, ∞])',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4~5 轮】选出 u = 3 (dist=4) 及最终节点 u = 4 (dist=7)',
        subtitle: '全网节点最短路径逐一锁定收敛',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '锁定 u = 3，松弛出边 (3 ➔ 4, 权重 w=3)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">终点抵达</span>',
            detailLines: [
              '│  ① 比较：dist[3] + 3 = 4 + 3 = 7 < dist[4](∞)',
              '│  ② 节点 4 最短路径确立为 7',
            ],
            fillLine: '└── dist[4] = 7 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '锁定 u = 4，无剩余未访问出边，算法收敛',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">全局最优</span>',
            detailLines: [
              '│  ① 所有 5 个顶点均已置入 visited 集合',
              '│  ② 三角不等式全部满足：dist[v] <= dist[u] + w(u, v)',
            ],
            fillLine: '└── return dist: [0, 3, 1, 4, 7] 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '朴素 Dijkstra · O(V²) 经典贪心选点与松弛'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return dist;',
      answerDescription: '全图单源最短路径计算完毕，返回距离向量 dist: [0, 3, 1, 4, 7] ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
