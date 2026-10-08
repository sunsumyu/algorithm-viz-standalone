/**
 * Floyd-Warshall · 全景推演树渲染策略 (FloydDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 委托核心族群编译器 GraphShortestPathDeductionCompiler 进行标准化全景推演树编译
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { GraphShortestPathDeductionCompiler } from './graph-shortest-path-deduction-compiler';

export class FloydDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'floyd';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'floyd' ||
      modelId === 'floyd-061' ||
      modelId === 'class061-code05' ||
      modelId === 'floyd-warshall'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    return GraphShortestPathDeductionCompiler.compile({
      title: 'Floyd-Warshall 全源最短路径 (O(V³) 矩阵动规) · 全景推演树',
      badge: '三维状态降维 · 中转点 k 阶段推进 · 全源距离矩阵',
      descriptionHtml: `
        有向带权图 <span class="font-bold text-slate-800">G = (V, E)</span> (4 节点，4 条有向边)。<br/>
        状态定义：<span class="font-bold text-slate-800">dp[k][i][j]</span> 表示仅允许经过节点编号集合 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">{0, ..., k}</code> 作为中间跳板时，从 i 到 j 的最短路径长度。<br/>
        状态转移方程（降维空间压缩）：
        <code class="font-mono bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-bold">dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])</code>。<br/>
        最外层必须严格循环中转点 <span class="font-bold text-slate-800">k</span>，内层双重循环遍历所有起点 i 与终点 j。
      `,
      initialStateText: '初始对角线 dist[i][i] = 0，直接邻接边填入边权，其余无直达边填入无穷大 ∞。',
      baseCases: [
        {
          prefix: '├───',
          label: '自身对角线初始化：dist[i][i] = 0 (i ∈ {0,1,2,3})',
          valuesStr: 'dist[0][0]=0, dist[1][1]=0, dist[2][2]=0, dist[3][3]=0',
        },
        {
          prefix: '└───',
          label: '初始边权矩阵：填入初始边 (0➔1: 5, 0➔3: 10, 1➔2: 3, 2➔3: 1)',
          valuesStr: 'dist[0][1]=5, dist[0][3]=10, dist[1][2]=3, dist[2][3]=1',
        },
      ],
      rounds: [
        {
          title: '【中转点 k = 0】允许经过节点 0 作为跳板',
          subtitle: '考察是否存在路径以 0 为中继使 (i ➔ j) 缩短',
          steps: [
            {
              connector: '└───',
              label: '遍历所有点对 (i, j)：以 0 为中转点',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-bold">无更优</span>',
              detailLines: [
                '│  • 无任何前驱能够以更低成本经过 0 达到其他节点',
                '│  • 矩阵保持初始距离状态',
              ],
              fillLine: '└── k = 0 轮次矩阵无更新',
            },
          ],
        },
        {
          title: '【中转点 k = 1】允许经过节点 1 作为跳板',
          subtitle: '考察以节点 1 为桥梁的路径松弛',
          steps: [
            {
              connector: '└───',
              label: '发现更优路径：0 ➔ 1 ➔ 2',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">矩阵更新</span>',
              detailLines: [
                '│  • dist[0][2] = min(∞, dist[0][1] + dist[1][2]) = 5 + 3 = 8',
                '│  • 从 0 到 2 开辟出最短路径 8 (原先不可达 ∞)',
              ],
              fillLine: '└── 更新 dist[0][2] = 8 ✅',
            },
          ],
        },
        {
          title: '【中转点 k = 2】允许经过节点 2 作为跳板',
          subtitle: '关键穿透：0 ➔ 2 ➔ 3 与 1 ➔ 2 ➔ 3 路径优化',
          steps: [
            {
              connector: '├───',
              label: '优化路径 1 ➔ 3：绕经节点 2',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">矩阵更新</span>',
              detailLines: [
                '│  • dist[1][3] = min(∞, dist[1][2] + dist[2][3]) = 3 + 1 = 4',
                '│  • 从 1 到 3 开辟出最短路径 4',
              ],
              fillLine: '├── 更新 dist[1][3] = 4 ✅',
            },
            {
              connector: '└───',
              label: '二次优化路径 0 ➔ 3：绕经节点 2',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">矩阵更新</span>',
              detailLines: [
                '│  • dist[0][3] = min(10, dist[0][2] + dist[2][3]) = 8 + 1 = 9',
                '│  • 经由 0 ➔ 1 ➔ 2 ➔ 3 (权值 9) 胜过直连 0 ➔ 3 (权值 10)',
              ],
              fillLine: '└── 更新 dist[0][3] = 9 (优化直连边) ✅',
            },
          ],
        },
        {
          title: '【中转点 k = 3】允许经过节点 3 作为跳板',
          subtitle: '终局收敛 · 全源距离矩阵就绪',
          steps: [
            {
              connector: '└───',
              label: '全源矩阵完全收敛',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">收敛终态</span>',
              detailLines: [
                '│  • 3 作为出度为 0 的汇点，无法为其他点对带来额外中继红利',
                '│  • 所有点对 (i, j) 最短路已全部推演完毕',
              ],
              fillLine: '└── 全源最短距离矩阵完全收敛 ✅',
            },
          ],
        },
      ],
      finalReturn: {
        returnCode: 'dist[0][3] = 9, dist[1][3] = 4, dist[0][2] = 8',
        answerDescription: '全源点对最短距离计算完毕，成功绕开高权直连边并求得全局最优解。',
      },
    });
  }
}
