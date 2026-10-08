/**
 * Bellman-Ford · 全景推演树渲染策略 (BellmanFordDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 委托核心族群编译器 GraphShortestPathDeductionCompiler 进行标准化全景推演树编译
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { GraphShortestPathDeductionCompiler } from './graph-shortest-path-deduction-compiler';

export class BellmanFordDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bellman-ford';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bellman-ford' ||
      modelId === 'bellman-ford-061' ||
      modelId === 'class061-code03' ||
      modelId === 'bellmanford'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    return GraphShortestPathDeductionCompiler.compile({
      title: 'Bellman-Ford 负权最短路径 (V-1 轮全边松弛) · 全景推演树',
      badge: '支持负权边 · 早停检测 (Early Stop) · 负环代数判定',
      descriptionHtml: `
        有向带权图 <span class="font-bold text-slate-800">G = (V, E)</span> (5 节点，7 条边)，源点为 0。<br/>
        状态定义：<span class="font-bold text-slate-800">dist[v]</span> 表示从源点 0 出发到节点 v 的当前最短距离估计。<br/>
        外层循环执行至多 <span class="font-bold text-slate-800">V - 1 = 4</span> 轮全边扫描；每轮尝试对所有边进行松弛操作：
        若 <code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">dist[u] + w &lt; dist[v]</code> 则更新并记录 <code class="font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">updated = true</code>。<br/>
        若某一轮扫描中无任何边发生更新，则表明全网最短路已完全收敛，触发早停提前返回。
      `,
      initialStateText: '源点 0 初始为 0 (dist[0]=0)，其余节点距离设为正无穷 ∞，更新标记 updated = false。',
      baseCases: [
        {
          prefix: '├───',
          label: '源点初始化：dist[0] = 0，自身理论最短路必为 0',
          valuesStr: 'dist = [0, ∞, ∞, ∞, ∞]',
        },
        {
          prefix: '└───',
          label: '外层轮次上限：最多执行 V - 1 = 4 轮全边遍历松弛',
          valuesStr: 'maxRounds = 4，标记 updated = false',
        },
      ],
      rounds: [
        {
          title: '【第 1 轮】全边首次遍历松弛 (Round 1 / 4)',
          subtitle: '展开从源点 0 出发的第 1 跳与多跳波前',
          steps: [
            {
              connector: '├───',
              label: '松弛出边 (0 ➔ 1, w=4) 与 (0 ➔ 2, w=2)',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">成功松弛</span>',
              detailLines: [
                '│  ① dist[0] + 4 = 4 < dist[1](∞) ➔ dist[1] = 4',
                '│  ② dist[0] + 2 = 2 < dist[2](∞) ➔ dist[2] = 2',
              ],
              fillLine: '├── dist[1]=4, dist[2]=2 ✅',
            },
            {
              connector: '├───',
              label: '级联松弛 (2 ➔ 3, w=3)',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">成功松弛</span>',
              detailLines: [
                '│  ① 比较：dist[2] + 3 = 2 + 3 = 5 < dist[3](∞)',
                '│  ② 绕道 0 ➔ 2 ➔ 3 使得 dist[3] 缩短至 5',
              ],
              fillLine: '├── dist[3]=5 ✅',
            },
            {
              connector: '└───',
              label: '第 1 轮终态状态汇总',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">轮次标记</span>',
              detailLines: [
                '│  • updated = true (本轮有节点更新，继续执行第 2 轮)',
              ],
              fillLine: '└── 当前状态向量: dist = [0, 4, 2, 5, 8]',
            },
          ],
        },
        {
          title: '【第 2 轮】全边再次遍历松弛 (Round 2 / 4)',
          subtitle: '负权边深度穿透 · 发现更优路径',
          steps: [
            {
              connector: '├───',
              label: '利用负权边深入松弛 (1 ➔ 2, w=-1)',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">负权优化</span>',
              detailLines: [
                '│  ① 比较：dist[1] + (-1) = 4 - 1 = 3，原 dist[2] = 2',
                '│  ② 3 > 2，不更新',
              ],
              fillLine: '├── dist[2] 保持 2 (0➔2 仍优于 0➔1➔2)',
            },
            {
              connector: '├───',
              label: '松弛边 (3 ➔ 4, w=2) 优化到达节点 4',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">成功松弛</span>',
              detailLines: [
                '│  ① dist[3] + 2 = 5 + 2 = 7 < dist[4](8)',
                '│  ② 更新 dist[4] = 7，标记 updated = true',
              ],
              fillLine: '├── dist[4]=7 ✅',
            },
            {
              connector: '└───',
              label: '第 2 轮状态向量',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">更新就绪</span>',
              detailLines: [
                '│  • 全网距离完全收敛至理论最优',
              ],
              fillLine: '└── 当前状态向量: dist = [0, 4, 2, 5, 7]',
            },
          ],
        },
        {
          title: '【第 3 轮】早停验证轮 (Round 3 / 4 · Early Stop)',
          subtitle: '全边扫描均未产生任何松弛 · 触发早停提前结束',
          steps: [
            {
              connector: '└───',
              label: '早停准则命中：if (!updated) break;',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">早停触发</span>',
              detailLines: [
                '│  • 遍历全部 7 条边，均满足 dist[u] + w >= dist[v]',
                '│  • 本轮 updated 仍为 false，全网已完全收敛，无需继续执行第 4 轮！',
              ],
              fillLine: '└── 提前退出主循环，早停判定生效 ✅',
            },
          ],
        },
      ],
      finalReturn: {
        returnCode: 'return dist: [0, 4, 2, 5, 3]',
        answerDescription: '单源最短路径向量完全收敛，无负权回路，总计扫描 3 轮即可提前退出。',
      },
    });
  }
}
