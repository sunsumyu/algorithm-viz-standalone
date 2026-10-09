/**
 * K 短路与 A* 搜索 (K-th Shortest Path · 洛谷 P2483) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 反向 Dijkstra 预处理 h(u)、A* 启发式综合估价 f(u) = g(u) + h(u)、第 K 次出堆命中定理
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class KShortestPathDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'k-shortest-path';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'k-shortest-path' ||
      modelId === 'k-shortest-paths' ||
      modelId === 'luogu-p2483' ||
      modelId === 'luogu-p4467' ||
      modelId === 'kth-shortest-path'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P2483 / P4467 K 短路 (K-th Shortest Path · A* 启发式搜索) · 全景推演树',
      badge: '反向 Dijkstra 预处理 h(u) · A* 综合估价 f(u) = g(u) + h(u) · 第 K 次出堆最优性',
      descriptionHtml: `
        有向带权图 <span class="font-bold text-slate-800">G = (V, E)</span> (4 节点 5 边)，求解从源点 <code class="font-bold text-slate-800">S = 1</code> 到汇点 <code class="font-bold text-slate-800">T = 4</code> 的第 <code class="font-bold text-slate-800">K = 2</code> 短路。<br/>
        核心算法架构：<br/>
        ① <b>反向图最短路启发函数 h(u)：</b> 从终点 T 出发在反图上运行单源 Dijkstra，计算各点到 T 的绝对最短距离作为完美启发函数，严格满足可采纳性 (Admissible, <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">h(u) &le; h*(u)</code>)；<br/>
        ② <b>正向 A* 优先队列搜索：</b> 节点综合估价 <code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">f(u) = g(u) + h(u)</code>，优先队列每次按 f 升序弹出最有希望的状态；<br/>
        ③ <b>第 K 次出堆最优性定理：</b> 当终点 T 累计第 K 次从优先队列弹出时，对应的实际路径长度 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">g(T)</code> 必定是全局第 K 短路！
      `,
      initialStateText: '反向 Dijkstra 预处理完毕：h = [-, 4, 3, 3, 0]，正向优先队列 PQ=[(Node 1, g:0, h:4, f:4)]。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '反向 Dijkstra 预处理启发函数：h[u] = dist(u ➔ T)',
        valuesStr: 'h[1] = 4, h[2] = 3, h[3] = 3, h[4] = 0',
      },
      {
        prefix: '└───',
        label: '源点 S = 1 入优先队列：g(1) = 0, f(1) = 0 + 4 = 4',
        valuesStr: 'PQ = [(Node 1, path: [1], g: 0, f: 4)]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】poll 出堆状态 (Node 1, g=0, h=4, 综合 f=4)',
        subtitle: '锁定 countPop[1] = 1 · 扩展出边 1➔2, 1➔3, 1➔4',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆源点 Node 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">源点展开</span>',
            detailLines: [
              '│  ① 弹出 Node 1，当前路径 [1]，实际耗费 g = 0',
            ],
            fillLine: '└── countPop[1] = 1 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沿边 (1 ➔ 2, w=1) 扩展',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">入堆 Node 2</span>',
            detailLines: [
              '│  ① 新增花费：g(2) = 0 + 1 = 1',
              '│  ② 综合估价：f(2) = g(2) + h[2] = 1 + 3 = 4',
              '│  ③ 入堆：PQ.push([Node 2, path:[1,2], g:1, f:4])',
            ],
            fillLine: '└── 状态 (Node 2, g:1, f:4) 就绪',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沿边 (1 ➔ 3, w=2) 扩展',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">入堆 Node 3</span>',
            detailLines: [
              '│  ① 新增花费：g(3) = 0 + 2 = 2',
              '│  ② 综合估价：f(3) = g(3) + h[3] = 2 + 3 = 5',
              '│  ③ 入堆：PQ.push([Node 3, path:[1,3], g:2, f:5])',
            ],
            fillLine: '└── 状态 (Node 3, g:2, f:5) 就绪',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '沿边 (1 ➔ 4, w=6) 扩展',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">入堆 Node 4</span>',
            detailLines: [
              '│  ① 新增花费：g(4) = 0 + 6 = 6',
              '│  ② 综合估价：f(4) = g(4) + h[4] = 6 + 0 = 6',
              '│  ③ 入堆：PQ.push([Node 4, path:[1,4], g:6, f:6])',
            ],
            fillLine: '└── 状态 (Node 4, g:6, f:6) 就绪',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】poll 出堆状态 (Node 2, g=1, h=3, 综合 f=4)',
        subtitle: '锁定 countPop[2] = 1 · 沿边 (2 ➔ 4, w=3) 极速推进至终点',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆状态 Node 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">中转扩展</span>',
            detailLines: [
              '│  ① 弹出当前 f 最小状态 Node 2，路径 [1, 2]，实际耗费 g = 1',
            ],
            fillLine: '└── countPop[2] = 1 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '沿边 (2 ➔ 4, w=3) 扩展至终点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">终点波前 ⚡</span>',
            detailLines: [
              '│  ① 新增花费：g(4) = 1 + 3 = 4',
              '│  ② 综合估价：f(4) = g(4) + h[4] = 4 + 0 = 4',
              '│  ③ 入堆：PQ.push([Node 4, path:[1,2,4], g:4, f:4])',
            ],
            fillLine: '└── 终点候选状态 (Node 4, g:4, f:4) 进驻优先队列！',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】poll 出堆终点状态 (Node 4, g=4, h=0, 综合 f=4)',
        subtitle: '首度命中终点 T · 记录第 1 短路 · 尚未达到 K=2 继续搜索',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '首度命中终点 T=4 (第 1 短路达成)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">第 1 短路 ✅</span>',
            detailLines: [
              '│  ① 终点 T 出堆！路径为 1 ➔ 2 ➔ 4，实际长度 g = 4',
              '│  ② 更新计数：countPop[4] = 1',
              '│  ③ 判定：countPop[4] (1) < K (2)，目标尚未达成，继续循环出堆',
            ],
            fillLine: '└── 第 1 短路 len = 4 记录完毕，继续寻找第 2 短路',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 轮】poll 出堆状态 (Node 3, g=2, h=3, 综合 f=5)',
        subtitle: '锁定 countPop[3] = 1 · 沿边 (3 ➔ 4, w=3) 产生第 2 条通往终点路径',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆状态 Node 3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">备选分支</span>',
            detailLines: [
              '│  ① 弹出 Node 3，路径 [1, 3]，实际花费 g = 2, 综合 f = 5',
            ],
            fillLine: '└── countPop[3] = 1 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '沿边 (3 ➔ 4, w=3) 扩展至终点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">关键入堆 🎯</span>',
            detailLines: [
              '│  ① 新增花费：g(4) = 2 + 3 = 5',
              '│  ② 综合估价：f(4) = 5 + 0 = 5',
              '│  ③ 入堆：PQ.push([Node 4, path:[1,3,4], g:5, f:5])',
            ],
            fillLine: '└── 终点候选状态 (Node 4, g:5, f:5) 入堆！',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 5 轮】poll 出堆终点状态 (Node 4, g=5, h=0, 综合 f=5)',
        subtitle: '第 2 次命中终点 T · 触发 countPop[4] == K · 锁定第 2 短路！',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '终点 T 第 2 次出堆 (目标达成)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">目标命中 🏁</span>',
            detailLines: [
              '│  ① 终点 T 再次出堆！路径为 1 ➔ 3 ➔ 4，实际长度 g = 5',
              '│  ② 更新计数：countPop[4] = 2',
              '│  ③ 命中准则：countPop[4] == K (2 == 2) 成立！',
              '│  ④ 根据 A* 最优性定理，当前出堆长度 5 严格保证为全局第 2 短路！',
            ],
            fillLine: '└── return cur.g = 5 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'A* 启发式优先队列综合估价 f(u) 升序松弛推演'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return cur.g = 5;',
      answerDescription: '第 2 短路求解完成：从 1 到 4 的第 1 短路为 1 ➔ 2 ➔ 4 (长 4)，第 2 短路为 1 ➔ 3 ➔ 4 (长 5)，第 3 短路为 1 ➔ 4 (长 6)。返回长度 5！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
