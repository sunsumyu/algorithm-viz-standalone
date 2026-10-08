/**
 * Bellman-Ford 负权环检测 · 全景推演树渲染策略 (NegativeCycleDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 委托核心族群编译器 GraphShortestPathDeductionCompiler 进行标准化全景推演树编译
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { GraphShortestPathDeductionCompiler } from './graph-shortest-path-deduction-compiler';

export class NegativeCycleDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'negative-cycle';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'negative-cycle' ||
      modelId === 'negative-cycle-061' ||
      modelId === 'class061-code06' ||
      modelId === 'bellman-ford-negative-cycle'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    return GraphShortestPathDeductionCompiler.compile({
      title: 'Bellman-Ford 负权回路检测 (Negative Cycle Detection) · 全景推演树',
      badge: '第 V 轮反证法检测 · 负无穷陷阱判定 · 图论代数收敛性',
      descriptionHtml: `
        核心数学原理：在一个不含负权回路的 <span class="font-bold text-slate-800">V</span> 节点图中，任意两点间的最短路径至多包含 <span class="font-bold text-slate-800">V - 1</span> 条边。<br/>
        因此，前 <span class="font-bold text-slate-800">V - 1</span> 轮松弛必然使所有最短路完全收敛。<br/>
        若在第 <span class="font-bold text-slate-800">V</span> 轮再次执行全边扫描时，仍存在任意一条边满足：
        <code class="font-mono bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold">dist[u] + w &lt; dist[v]</code>，
        则通过反证法必然推导出图中存在<strong>负权回路（Negative Weight Cycle）</strong>，距离可无限衰减至 <span class="font-bold text-red-600">-∞</span>。
      `,
      initialStateText: '图含 4 节点 4 边，构造 1➔2➔3➔1 (4 + (-6) + 1 = -1 < 0) 负环。源点 0 初始为 0。',
      baseCases: [
        {
          prefix: '├───',
          label: '前置判定阈值：V 个节点，理论松弛轮次上限为 V - 1 = 3 轮',
          valuesStr: 'maxNormalRounds = 3',
        },
        {
          prefix: '└───',
          label: '第 V = 4 轮检测目标：验证是否存在仍能被压缩松弛的异常边',
          valuesStr: 'hasNegativeCycle = false (探测中)',
        },
      ],
      rounds: [
        {
          title: '【前 3 轮】标准 V-1 轮常规松弛收敛阶段',
          subtitle: '距离持续下探 · 负环能量外溢',
          steps: [
            {
              connector: '├───',
              label: '第 1 轮松弛：波前由源点扩散至各节点',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">初始松弛</span>',
              detailLines: [
                '│  • dist[0]=0 ➔ dist[1]=1 ➔ dist[2]=5 ➔ dist[3]=-1',
              ],
              fillLine: '├── 第 1 轮终态 dist: [0, 1, 5, -1]',
            },
            {
              connector: '└───',
              label: '第 2~3 轮松弛：环内能量循环释放',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">异常衰减</span>',
              detailLines: [
                '│  • 绕环 1 周净权值 Δ = -1，节点 1/2/3 距离继续被强行压低',
                '│  • 第 3 轮终态 dist: [0, -1, 3, -3]',
              ],
              fillLine: '└── 正常图在第 3 轮理应完全收敛，但负环图数值依然持续下降',
            },
          ],
        },
        {
          title: '【第 4 轮】第 V 轮额外松弛定理 · 致命检测',
          subtitle: '扫描边集 · 捕捉可继续松弛的铁证',
          steps: [
            {
              connector: '└───',
              label: '捕获负权回路：hasCycle = true',
              badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-bold">发现负环</span>',
              detailLines: [
                '│  • 检查边 (3 ➔ 1, w=1)：dist[3] + 1 = -3 + 1 = -2',
                '│  • 原 dist[1] = -1，显著存在 -2 < -1！',
                '│  • 结论：第 V 轮仍能继续松弛，图内必然存在负权回路！',
              ],
              fillLine: '└── 🚨 锁定负环路径: 1 ➔ 2 ➔ 3 ➔ 1 (总权值 -1)',
            },
          ],
        },
      ],
      finalReturn: {
        returnCode: 'return true (检测到负权回路)',
        answerDescription: '判定成功：图中存在负权回路，无法定义有限的最短路径值。',
      },
    });
  }
}
