/**
 * 反向索引堆优化 Dijkstra · 全景推演树渲染策略 (DijkstraIndexHeapDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 反向索引映射 where[]、原地 decreaseKey 上浮调整、杜绝冗余压堆生命周期
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DijkstraIndexHeapDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'dijkstra-index-heap';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'dijkstra-index-heap' ||
      modelId === 'dijkstra-decrease-key' ||
      modelId === 'dijkstra-indexed-heap' ||
      modelId === 'luogu-p4779' ||
      modelId === 'class061-index-heap' ||
      modelId === 'class062-index-heap'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '反向索引堆优化 Dijkstra 最短路径 (Dijkstra Index-Heap · O((V+E) log V)) · 全景推演树',
      badge: '反向索引映射 where[] · 原地 decreaseKey 上浮 · 零冗余压堆',
      descriptionHtml: `
        有向带权图 <span class="font-bold text-slate-800">G = (V, E)</span> (4 节点)，源点为 1。<br/>
        核心架构：<br/>
        ① <b>反向映射 where[u] 三态状态机：</b><br/>
        &nbsp;&nbsp;&bull; <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-bold">-1</code>：从未入堆；<br/>
        &nbsp;&nbsp;&bull; <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">&gt;= 0</code>：处于堆中位置 <code>heap[where[u]] == u</code>；<br/>
        &nbsp;&nbsp;&bull; <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">-2</code>：最短路已全局锁定，永久不再入堆。<br/>
        ② <b>原地 decreaseKey：</b> 发现更优路径时，无需像普通优先队列那样重复压入死节点，直接在堆中定位并 <code>heapInsert(where[v])</code> 原地上浮！堆空间恒为严格 <code class="font-bold text-slate-800">O(V)</code>。
      `,
      initialStateText: '源点 1 入堆 (dist[1]=0, where[1]=0)，其余节点 where=-1 且 dist=∞，堆大小 heapSize=1。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '初始化状态数组：where 填 -1 (未入堆)，distance 填 ∞ (不可达)',
        valuesStr: 'where = [-1, -1, -1, -1], distance = [0, ∞, ∞, ∞]',
      },
      {
        prefix: '└───',
        label: '源点 1 入堆建基：heap[0] = 1, where[1] = 0, heapSize = 1',
        valuesStr: 'heap = [Node 1], where[1] = 0 (堆顶)',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】pop() 弹出堆顶代表元 Node 1 (dist[1] = 0)',
        subtitle: '永久锁定 where[1] = -2 · 松弛源点出边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆锁定 Node 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">永久结算</span>',
            detailLines: [
              '│  ① 提取堆顶：ans = heap[0] = Node 1',
              '│  ② 标记锁定：where[1] = -2 (今后永不重复入堆)',
            ],
            fillLine: '└── dist[1] = 0 (已确认)',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '松弛出边 (1 ➔ 2, 权重 w=4)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">首次入堆</span>',
            detailLines: [
              '│  ① where[2] == -1：首次触达，分配堆槽 heap[0] = 2',
              '│  ② 更新：distance[2] = 4, where[2] = 0',
            ],
            fillLine: '└── heap = [Node 2], heapSize = 1',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '松弛出边 (1 ➔ 3, 权重 w=1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">首次入堆并上浮</span>',
            detailLines: [
              '│  ① where[3] == -1：放入堆尾 heap[1] = 3, distance[3] = 1',
              '│  ② 上浮调整：dist[3](1) < dist[2](4)，与堆顶 swap 交换！',
              '│  ③ 同步更新反向索引：where[3] = 0, where[2] = 1',
            ],
            fillLine: '└── heap = [Node 3, Node 2], 堆顶为 Node 3',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】pop() 弹出堆顶 Node 3 (dist[3] = 1)',
        subtitle: '锁定 where[3] = -2 · 触发核心原地 decreaseKey 机制',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆锁定 Node 3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">永久结算</span>',
            detailLines: [
              '│  ① 提取堆顶 Node 3，堆尾 Node 2 换至堆顶并下沉 heapify',
              '│  ② 标记锁定：where[3] = -2',
            ],
            fillLine: '└── dist[3] = 1 (已确认)',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '松弛出边 (3 ➔ 2, 权重 w=1) —— 核心原地 decreaseKey',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">原地 decreaseKey ⚡</span>',
            detailLines: [
              '│  ① 检查：where[2] == 0 (节点 2 已经在堆中！)',
              '│  ② 比较新路径：dist[3] + 1 = 1 + 1 = 2 < dist[2](4)',
              '│  ③ 原地减权更新：distance[2] = 2',
              '│  ④ 原地上浮：调用 heapInsert(where[2]=0) 完成调整，堆中无冗余副本体！',
            ],
            fillLine: '└── 突破性松弛！Node 2 距离缩短至 2，零死节点压堆 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '松弛出边 (3 ➔ 4, 权重 w=5)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">首次入堆</span>',
            detailLines: [
              '│  ① where[4] == -1：首次触达，放入堆尾 heap[1] = 4',
              '│  ② 更新：distance[4] = 6, where[4] = 1',
            ],
            fillLine: '└── heap = [Node 2 (d=2), Node 4 (d=6)]',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】pop() 弹出堆顶 Node 2 (dist[2] = 2)',
        subtitle: '锁定 where[2] = -2 · 松弛节点 2 出边并再次原地减权',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆锁定 Node 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">永久结算</span>',
            detailLines: [
              '│  ① 提取堆顶 Node 2，堆尾 Node 4 换至堆顶',
              '│  ② 标记锁定：where[2] = -2',
            ],
            fillLine: '└── dist[2] = 2 (已确认)',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '松弛出边 (2 ➔ 4, 权重 w=2) —— 再次触发 decreaseKey',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">原地 decreaseKey ⚡</span>',
            detailLines: [
              '│  ① 检查：where[4] == 0 (节点 4 正在堆顶！)',
              '│  ② 比较新路径：dist[2] + 2 = 2 + 2 = 4 < dist[4](6)',
              '│  ③ 原地减权更新：distance[4] = 4，原地上浮调整！',
            ],
            fillLine: '└── Node 4 距离从 6 优化为 4，堆中仅有 Node 4 ✅',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 轮】pop() 弹出堆顶 Node 4 (dist[4] = 4)',
        subtitle: '锁定 where[4] = -2 · 全图所有可达点完成结算',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出堆锁定 Node 4',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">永久结算</span>',
            detailLines: [
              '│  ① 提取堆顶 Node 4，堆规模减少为 0',
              '│  ② 标记锁定：where[4] = -2',
              '│  ③ 堆为空，算法圆满终止！',
            ],
            fillLine: '└── dist[4] = 4 (已确认)',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '反向索引堆 · 原地 decreaseKey 与上浮调整'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return distance[1..4] = [0, 2, 1, 4];',
      answerDescription: '全源最短路径确定：1➔1=0, 1➔2=2 (经由3), 1➔3=1, 1➔4=4 (经由3➔2➔4)。反向索引堆杜绝死节点压堆，空间严格 O(V)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
