/**
 * 0-1 BFS 双端队列最短路 (0-1 BFS Deque · LeetCode 2290 / Class 062) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 双端队列两段性维持 [d, d+1]、0 权插队头 addFirst、1 权插队尾 addLast、严格 O(V + E)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BFS01DeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bfs-01';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bfs-01' ||
      modelId === 'leetcode-2290' ||
      modelId === 'lc-2290' ||
      modelId === 'minimum-obstacle-removal' ||
      modelId === 'class062-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '0-1 BFS 双端队列最短路 (0-1 BFS Deque · LC 2290) · 全景推演树',
      badge: '双端队列 Deque · 0 权插队头 · 1 权插队尾 · 严格 O(V + E)',
      descriptionHtml: `
        包含 <code class="font-bold text-slate-800">5</code> 个节点与带权有向边：<br/>
        <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">(1➔2: 0), (1➔3: 1), (2➔4: 1), (3➔4: 0), (4➔5: 0)</code>。<br/>
        核心算法架构：<br/>
        ① <b>双端队列两段性维持：</b> 队列中元素距离至多相差 1，始终呈现 <code class="font-bold text-slate-800">[d, ..., d, d+1, ..., d+1]</code>；<br/>
        ② <b>出边松弛分流机制：</b><br/>
        &nbsp;&nbsp;• 边权为 <code class="font-bold text-emerald-700">0</code>：代价不增，调用 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">deque.addFirst()</code> 插队头，维持严格单调递增；<br/>
        &nbsp;&nbsp;• 边权为 <code class="font-bold text-indigo-700">1</code>：代价增加 1，调用 <code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">deque.addLast()</code> 插队尾，自然延续两段性递增；<br/>
        ③ <b>线性时空收敛：</b> 全程免去二叉堆或优先队列的 $O(\log V)$ 调整开销，达到严格理论下界 $O(V + E)$！
      `,
      initialStateText: '图拓扑初始化完毕，起点 Node 1 距离设为 0 并入队头，其余节点距离记为 ∞。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '起点距离与到达状态初始化',
        valuesStr: 'dist[1] = 0, dist[2..5] = ∞',
      },
      {
        prefix: '├───',
        label: '双端队列 Deque 初始队头元素',
        valuesStr: 'deque = [ Node 1 (d: 0) ]',
      },
      {
        prefix: '└───',
        label: '目标终点节点',
        valuesStr: 'target = Node 5',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】队头弹出 Node 1 (d = 0)',
        subtitle: '松弛出边 (1➔2, w=0) 与 (1➔3, w=1)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出边 (1➔2, w=0)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">0权插队头</span>',
            detailLines: [
              '│  ① dist[2] = 0 + 0 = 0 < ∞ ➔ 成功松弛',
              '│  ② 权值 w=0 无代价 ➔ deque.addFirst(Node 2, d: 0)',
            ],
            fillLine: '└── 队头插入 Node 2 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出边 (1➔3, w=1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">1权插队尾</span>',
            detailLines: [
              '│  ① dist[3] = 0 + 1 = 1 < ∞ ➔ 成功松弛',
              '│  ② 权值 w=1 耗费代价 ➔ deque.addLast(Node 3, d: 1)',
            ],
            fillLine: '└── 队尾插入 Node 3 🐢 (当前队列: [N2(0), N3(1)])',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】队头弹出 Node 2 (d = 0)',
        subtitle: '松弛出边 (2➔4, w=1)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出边 (2➔4, w=1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">1权插队尾</span>',
            detailLines: [
              '│  ① dist[4] = 0 + 1 = 1 < ∞ ➔ 成功松弛',
              '│  ② 权值 w=1 ➔ deque.addLast(Node 4, d: 1)',
            ],
            fillLine: '└── 队尾插入 Node 4 (当前队列: [N3(1), N4(1)])',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】队头弹出 Node 3 与 Node 4 并延伸至终点',
        subtitle: '松弛出边 (4➔5, w=0) 抵达终点',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'Node 4 松弛 (4➔5, w=0)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">0权插队头</span>',
            detailLines: [
              '│  ① dist[5] = 1 + 0 = 1 < ∞ ➔ 成功松弛',
              '│  ② 权值 w=0 ➔ deque.addFirst(Node 5, d: 1)',
            ],
            fillLine: '└── 队头插入 Node 5 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '队头弹出 Node 5',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">抵达终点</span>',
            detailLines: [
              '│  ① pollFirst() 取出 Node 5 (d = 1)',
              '│  ② 命中终点目标 target = 5，最短路即时锁定！',
            ],
            fillLine: '└── 最短路径: 1 ➔ 2 ➔ 4 ➔ 5，总权值 = 1 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'pollFirst 队头弹出 ➔ 0 权 addFirst 队头 ➔ 1 权 addLast 队尾'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return dist[5] = 1;',
      answerDescription:
        '🏆 最终返回：双端队列在 O(V + E) 线性时空下成功收敛，到达终点 Node 5 的最小障碍/距离为 1！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
