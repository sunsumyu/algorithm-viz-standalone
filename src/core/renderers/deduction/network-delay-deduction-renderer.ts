/**
 * 网络延迟时间 (Network Delay Time · LeetCode 743) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 小根堆优先队列 Dijkstra 波前广播、信号到达锁定与全网连通性检验生命周期
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class NetworkDelayDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'network-delay-time';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'network-delay-time' ||
      modelId === 'network-delay-time-064' ||
      modelId === 'leetcode-743' ||
      modelId === 'class064-code01' ||
      modelId === 'class064-network-delay'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 743. 网络延迟时间 (Network Delay Time · O(E log V)) · 全景推演树',
      badge: '小根堆优先队列 Dijkstra · 全网波前广播 · max(dist[1..n])',
      descriptionHtml: `
        有向带权网络 <span class="font-bold text-slate-800">G = (V, E)</span> (4 节点)，源点为 2，times = [[2,1,1], [2,3,1], [3,4,1]]。<br/>
        核心机制：<br/>
        ① <b>波前广播：</b> 信号从源点 2 沿有向边向外辐射，以到达时间作为距离衡量，优先队列每次弹出最早抵达节点；<br/>
        ② <b>锁定过滤：</b> <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">visited[u] = true</code> 记录信号首次抵达的最早时间，跳过重复波前；<br/>
        ③ <b>全网收齐：</b> 算法结束后扫描所有节点到达时间，最终全网覆盖时间为 <code class="font-bold text-slate-800">max(dist[1..n])</code>；若存在不可达孤立点则返回 -1。
      `,
      initialStateText: '源点 2 信号发射 (dist[2]=0)，其余节点 distance 填充 ∞，优先队列初始化 pq=[(Node 2, 0ms)]。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '初始化到达时间表：dist[2]=0, dist[1,3,4]=INF',
        valuesStr: 'dist = [dist[1]:∞, dist[2]:0, dist[3]:∞, dist[4]:∞]',
      },
      {
        prefix: '└───',
        label: '源点加入波前优先队列：pq.add([2, 0ms])',
        valuesStr: 'PQ = [(Node 2, 0ms)]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】pq.poll() 弹出源点 Node 2 (时间 0ms)',
        subtitle: '锁定 visited[2] = true · 辐射源点所有出向信道',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆锁定 Node 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">信号发射</span>',
            detailLines: [
              '│  ① 弹出波前堆顶：(Node 2, 0ms)',
              '│  ② 标记锁定：visited[2] = true, 到达时间固定为 0ms',
            ],
            fillLine: '└── dist[2] = 0ms ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出边传播 (2 ➔ 1, 传输延时 1ms)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">波前扩散</span>',
            detailLines: [
              '│  ① 计算到达时刻：dist[2] + 1 = 0 + 1 = 1ms < dist[1](∞)',
              '│  ② 更新并入堆：dist[1] = 1ms, pq.add([1, 1ms])',
            ],
            fillLine: '└── Node 1 加入就绪波前',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出边传播 (2 ➔ 3, 传输延时 1ms)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">波前扩散</span>',
            detailLines: [
              '│  ① 计算到达时刻：dist[2] + 1 = 0 + 1 = 1ms < dist[3](∞)',
              '│  ② 更新并入堆：dist[3] = 1ms, pq.add([3, 1ms])',
            ],
            fillLine: '└── PQ = [(Node 1, 1ms), (Node 3, 1ms)]',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】pq.poll() 弹出最早抵达点 Node 1 (时间 1ms)',
        subtitle: '锁定 visited[1] = true · 检查节点 1 出边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出堆锁定 Node 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">信号锁定</span>',
            detailLines: [
              '│  ① 标记锁定：visited[1] = true, 到达时间固定为 1ms',
              '│  ② 节点 1 无出边信道，无需扩散',
            ],
            fillLine: '└── dist[1] = 1ms ✅',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】pq.poll() 弹出节点 Node 3 (时间 1ms)',
        subtitle: '锁定 visited[3] = true · 辐射信道 (3 ➔ 4)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆锁定 Node 3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">信号锁定</span>',
            detailLines: [
              '│  ① 标记锁定：visited[3] = true, 到达时间固定为 1ms',
            ],
            fillLine: '└── dist[3] = 1ms ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出边传播 (3 ➔ 4, 传输延时 1ms)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">波前扩散</span>',
            detailLines: [
              '│  ① 计算到达时刻：dist[3] + 1 = 1 + 1 = 2ms < dist[4](∞)',
              '│  ② 更新并入堆：dist[4] = 2ms, pq.add([4, 2ms])',
            ],
            fillLine: '└── PQ = [(Node 4, 2ms)]',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 轮】pq.poll() 弹出末尾节点 Node 4 (时间 2ms)',
        subtitle: '锁定 visited[4] = true · 全网信号完成覆盖',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出堆锁定 Node 4',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">信号锁定</span>',
            detailLines: [
              '│  ① 标记锁定：visited[4] = true, 到达时间固定为 2ms',
              '│  ② 波前堆变为空，Dijkstra 广播推演结束',
            ],
            fillLine: '└── dist[4] = 2ms ✅ (PQ 为空)',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '网络信号波前扩散与各节点接收时间锁定'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return max(dist[1..4]) = max(1, 0, 1, 2) = 2;',
      answerDescription: '全网各节点到达时间：N1=1ms, N2=0ms, N3=1ms, N4=2ms。所有节点均可达，信号覆盖全网的最迟时间为 2ms！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
