/**
 * SPFA · 全景推演树渲染策略 (SpfaDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 委托核心族群编译器 GraphShortestPathDeductionCompiler 进行标准化全景推演树编译
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { GraphShortestPathDeductionCompiler } from './graph-shortest-path-deduction-compiler';

export class SpfaDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'spfa';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'spfa' ||
      modelId === 'spfa-061' ||
      modelId === 'class061-code04'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    return GraphShortestPathDeductionCompiler.compile({
      title: 'SPFA 队列优化最短路 (Shortest Path Faster Algorithm) · 全景推演树',
      badge: '队列驱动松弛 · 在队标记 inQueue · 稀疏图高效求解',
      descriptionHtml: `
        有向带权图 <span class="font-bold text-slate-800">G = (V, E)</span> (5 节点，7 边)，源点为 0。<br/>
        核心原理：仅当某个顶点 <span class="font-bold text-slate-800">u</span> 的最短距离被成功优化时，其后继顶点才有可能被进一步优化。<br/>
        利用先进先出队列 <code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">Queue</code> 维护波前节点，
        搭配布尔数组 <code class="font-mono bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-bold">inQueue[v]</code> 避免相同顶点重复进队。<br/>
        出队时清除标记 <code class="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">inQueue[u] = false</code>，允许后续新一轮松弛再次入队。
      `,
      initialStateText: '源点 0 初始入队 (queue = [0])，inQueue[0] = true，dist[0] = 0，其余节点为 ∞。',
      baseCases: [
        {
          prefix: '├───',
          label: '源点入队与标号初始化：dist[0] = 0，其余为 ∞',
          valuesStr: 'dist = [0, ∞, ∞, ∞, ∞]',
        },
        {
          prefix: '└───',
          label: '在队状态标记：inQueue[0] = true，队列 queue = [0]',
          valuesStr: 'queue = [0], inQueue = [true, false, false, false, false]',
        },
      ],
      rounds: [
        {
          title: '【阶段 1】源点出队推进 (poll u = 0)',
          subtitle: '松弛源点出边 · 触发节点 1 与 2 入队',
          steps: [
            {
              connector: '├───',
              label: '出队消标：u = 0 出队，inQueue[0] = false',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">出队</span>',
              detailLines: [
                '│  • 弹出节点 0，检查其出边 (0➔1, w=4) 与 (0➔2, w=2)',
              ],
              fillLine: '├── u = 0 出队',
            },
            {
              connector: '└───',
              label: '松弛成功并触发入队：offer(1), offer(2)',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">松弛入队</span>',
              detailLines: [
                '│  ① dist[1] 缩短至 4，!inQueue[1] ➔ queue.offer(1), inQueue[1] = true',
                '│  ② dist[2] 缩短至 2，!inQueue[2] ➔ queue.offer(2), inQueue[2] = true',
              ],
              fillLine: '└── 当前队列: [1, 2]，dist: [0, 4, 2, ∞, ∞] ✅',
            },
          ],
        },
        {
          title: '【阶段 2】节点 1 与 2 依次出队处理 (poll u = 1, u = 2)',
          subtitle: '波前扩散 · 触发节点 3 与 4 进队',
          steps: [
            {
              connector: '├───',
              label: 'u = 1 出队处理出边',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">出队</span>',
              detailLines: [
                '│  • 考察 (1➔2, w=-1)：dist[1]+(-1)=3 > dist[2](2)，无需更新',
                '│  • 考察 (1➔4, w=4)：dist[1]+4=8 < dist[4](∞) ➔ dist[4]=8, offer(4)',
              ],
              fillLine: '├── offer(4), inQueue[4]=true',
            },
            {
              connector: '└───',
              label: 'u = 2 出队处理出边',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">松弛入队</span>',
              detailLines: [
                '│  • 考察 (2➔3, w=3)：dist[2]+3=5 < dist[3](∞) ➔ dist[3]=5, offer(3)',
                '│  • 考察 (2➔4, w=5)：dist[2]+5=7 < dist[4](8) ➔ dist[4]=7 (已有优化！)',
              ],
              fillLine: '└── 当前队列: [4, 3]，dist: [0, 4, 2, 5, 7] ✅',
            },
          ],
        },
        {
          title: '【阶段 3】节点 4 与 3 依次出队 · 队列清空收敛',
          subtitle: '队列变空 · 算法自然终结',
          steps: [
            {
              connector: '└───',
              label: '剩余节点出队且无新更优解',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">完全收敛</span>',
              detailLines: [
                '│  • 节点 4 与 3 相继出队，出边松弛条件均不满足',
                '│  • 队列变为 empty，全网达到稳定态',
              ],
              fillLine: '└── 队列为空，退出主循环 ✅',
            },
          ],
        },
      ],
      finalReturn: {
        returnCode: 'return dist: [0, 4, 2, 5, 3]',
        answerDescription: 'SPFA 队列驱动松弛完成，仅需局部入队扩散即收敛至全网理论最短路。',
      },
    });
  }
}
