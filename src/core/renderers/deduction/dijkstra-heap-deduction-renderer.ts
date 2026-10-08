/**
 * 堆优化 Dijkstra · 全景推演树渲染策略 (DijkstraHeapDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 小顶堆优先队列快速极值提取、惰性删除冗余标号与松弛入堆生命周期
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DijkstraHeapDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'dijkstra-heap';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'dijkstra-heap' ||
      modelId === 'dijkstra-pq' ||
      modelId === 'dijkstra-heap-061' ||
      modelId === 'class061-dijkstra-heap' ||
      modelId === 'dijkstra-priority-queue'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '堆优化 Dijkstra 最短路径 (Dijkstra Min-Heap · O(E log V)) · 全景推演树',
      badge: '小顶堆优先队列 · 惰性丢弃 (Lazy Deletion)',
      descriptionHtml: `
        有向带权图 <span class="font-bold text-slate-800">G = (V, E)</span>，优先队列 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">PriorityQueue&lt;int[]&gt;</code> 动态维护 <code class="font-bold text-slate-800">(d, u)</code> 二元组。<br/>
        核心机制：<br/>
        ① <b>极速提取：</b> 小顶堆在 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">O(log V)</code> 时间内直接弹出全局最小候选节点；<br/>
        ② <b>惰性丢弃：</b> 若出堆时满足 <code class="font-mono bg-red-50 text-red-700 px-1 py-0.5 rounded font-bold">d &gt; dist[u]</code>，证明已被更优路径覆盖，直接丢弃（Lazy Drop）；<br/>
        ③ <b>松弛入堆：</b> 满足三角不等式缩短时，更新 dist 并将新二元组推入优先队列。
      `,
      initialStateText: '源点入堆 (d=0, u=0)，dist[0]=0，其余节点标号正无穷，优先队列动态维护。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '初始化距离表：dist[0] = 0, dist[1..4] = INF',
        valuesStr: 'dist = [0, ∞, ∞, ∞, ∞]',
      },
      {
        prefix: '└───',
        label: '源点二元组推入小顶堆：pq.offer({d: 0, u: 0})',
        valuesStr: 'PQ = [(d:0, u:0)]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】pq.poll() 弹出堆顶 (d=0, u=0)',
        subtitle: '检查有效性：d <= dist[0] (0 <= 0) · 遍历出边松弛',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '松弛出边 (0 ➔ 1, w=4)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">入堆排队</span>',
            detailLines: [
              '│  ① 距离缩短：dist[1] 从 ∞ 更新为 4',
              '│  ② 入堆：pq.offer({d: 4, u: 1})',
            ],
            fillLine: '└── dist[1] = 4 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '松弛出边 (0 ➔ 2, w=1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">入堆排队</span>',
            detailLines: [
              '│  ① 距离缩短：dist[2] 从 ∞ 更新为 1',
              '│  ② 入堆：pq.offer({d: 1, u: 2})',
            ],
            fillLine: '└── dist[2] = 1 ✅ (PQ: [(d:1, u:2), (d:4, u:1)])',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】pq.poll() 弹出堆顶 (d=1, u=2)',
        subtitle: '有效标号出堆 · 展开节点 2 的邻接出边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '松弛出边 (2 ➔ 1, w=2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">更优标号</span>',
            detailLines: [
              '│  ① 比较：dist[2] + 2 = 1 + 2 = 3 < dist[1](4)',
              '│  ② 产生新最优标号：dist[1] = 3，pq.offer({d: 3, u: 1})',
              '│  ③ 注意：旧标号 (d:4, u:1) 仍在堆中等待后续惰性丢弃！',
            ],
            fillLine: '└── dist[1] = 3 ⚡ (新二元组入堆)',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '松弛出边 (2 ➔ 3, w=5)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">入堆排队</span>',
            detailLines: [
              '│  ① 比较：dist[2] + 5 = 1 + 5 = 6 < dist[3](∞)',
              '│  ② 更新：dist[3] = 6，pq.offer({d: 6, u: 3})',
            ],
            fillLine: '└── dist[3] = 6 ✅',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】pq.poll() 弹出堆顶 (d=3, u=1)',
        subtitle: '节点 1 最短路确立 · 松弛出边 (1 ➔ 3)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '松弛出边 (1 ➔ 3, w=1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">二次缩短</span>',
            detailLines: [
              '│  ① 比较：dist[1] + 1 = 3 + 1 = 4 < dist[3](6)',
              '│  ② 更新：dist[3] 缩短为 4，pq.offer({d: 4, u: 3})',
            ],
            fillLine: '└── dist[3] = 4 ⚡ (PQ 内部堆顶: (d:4, u:1) 与 (d:4, u:3))',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 轮】惰性删除触发与终点松弛',
        subtitle: '核心机制演示：d > dist[u] 冗余标号识别',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'pq.poll() 弹出历史二元组 (d=4, u=1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">惰性丢弃</span>',
            detailLines: [
              '│  ① 冗余核验：当前 d=4 > dist[1](3)',
              '│  ② 节点 1 早已有更短路径 3，该标号已失效过期',
            ],
            fillLine: '└── 直接 continue 丢弃，零多余边遍历 🗑️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'pq.poll() 弹出 (d=4, u=3)，松弛出边 (3 ➔ 4, w=3)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">终点抵达</span>',
            detailLines: [
              '│  ① 比较：dist[3] + 3 = 4 + 3 = 7 < dist[4](∞)',
              '│  ② 更新：dist[4] = 7，pq.offer({d: 7, u: 4})',
            ],
            fillLine: '└── dist[4] = 7 ✅',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 5 轮】剩余过时项惰性丢弃与优先队列清空',
        subtitle: '算法圆满收敛 · 全网单源最短路径向量锁定',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '弹出 (d=6, u=3) -> d=6 > dist[3](4) -> 惰性丢弃 🗑️',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">惰性删除</span>',
            detailLines: ['│  过时标号直接丢弃'],
            fillLine: '└── skip redundant element',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '弹出 (d=7, u=4) -> 终点锁定，队列清空',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">算法完成</span>',
            detailLines: ['│  优先队列清空 (!pq.isEmpty() 为假)，主循环退出'],
            fillLine: '└── return dist: [0, 3, 1, 4, 7] 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'Dijkstra 堆优化 · O(E log V) 优先队列与惰性删除'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return dist;',
      answerDescription: '优先队列清空，全网单源最短路径计算完毕，返回 dist: [0, 3, 1, 4, 7] ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
