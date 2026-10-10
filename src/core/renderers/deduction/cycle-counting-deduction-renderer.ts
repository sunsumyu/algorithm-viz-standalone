/**
 * 三元环与四元环定向计数 (3-Cycle & 4-Cycle Counting · 洛谷 P1989) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶图论: 节点度数偏序 DAG 定向、出度根号分治截断 O(M sqrt(M))、三元环打标闭合与四元环中继组合
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CycleCountingDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'cycle-counting';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'cycle-counting' ||
      modelId === '3-cycle-counting' ||
      modelId === '4-cycle-counting' ||
      modelId === 'P1989' ||
      modelId === 'triangle-counting'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '三元环与四元环定向计数 (Cycle Counting · 洛谷 P1989) · 全景推演树',
      badge: '洛谷 P1989 · 进阶图论 + 根号分治 · 度数偏序 DAG 定向 · 出度 ≤ √(2M) · 三元环 O(M√M) · 四元环 O(M√M)',
      descriptionHtml: `
        在简单无向图中高效统计三元环（三角形）与四元环的数量是图分析与网络拓扑的核心基石。<br/>
        直接暴力的时间复杂度高达 $O(N^3)$ 或 $O(M \\cdot N)$，无法承受十万级图规模。<br/>
        <b>度数偏序 DAG 定向与根号截断核心定理：</b><br/>
        ① <b>无向边偏序定向：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;对于每条无向边 $(u, v)$，若 $\\text{deg}[u] < \\text{deg}[v]$ 或 $(\\text{deg}[u] == \\text{deg}[v] \\land u < v)$，则连有向边 $u \\to v$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;该规则保证定向后的有向图必为无环图（DAG），且每个顶点的出度严格满足 $\\text{outDeg}(u) \\le \\sqrt{2M}$！<br/>
        ② <b>三元环两步枚举法：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;枚举外层起点 $u$，将其所有 DAG 出邻居标记 $\\text{vis}[v] = u$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;再次枚举每个出邻居 $v$ 的所有出邻居 $w$：若 $\\text{vis}[w] == u$，说明存在 $u \\to w$，三角形闭合，环计数累加！<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;总操作次数 $\\sum_{(u, v)} \\text{outDeg}(v) \\le M \\cdot \\sqrt{2M} = O(M \\sqrt{M})$，突破性能瓶颈！<br/>
        ③ <b>四元环中继组合法：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;枚举两步可达点对 $(u, w)$，记录公共中继点个数 $\\text{cnt}[w]$；每次遇到同一终点 $w$ 时，之前已有 $\\text{cnt}[w]$ 条不同路径，即可组成 $\\text{cnt}[w]$ 个新四元环！
      `,
      initialStateText: '输入无向图边集，统计各节点初始度数 deg[]，分配 vis[] 与 cnt[] 辅助数组。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点与边集规模',
        valuesStr: 'N = 4 节点，M = 5 边 (1,2), (1,3), (2,3), (2,4), (3,4) [经典菱形图]',
      },
      {
        prefix: '├───',
        label: '偏序定向判别准则',
        valuesStr: 'cmp(u, v): deg[u] < deg[v] || (deg[u] == deg[v] && u < v) ⟹ 定向 u ➔ v',
      },
      {
        prefix: '└───',
        label: '出度根号上界保证',
        valuesStr: '每个节点在定向 DAG 中的出度 outDeg(u) ≤ √(2M) ≈ 3.16',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】度数统计与偏序 DAG 定向 (Degree Calculation & DAG Orientation)',
        subtitle: '统计各节点无向度数，利用偏序关系将所有无向边转化为有向无环图',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '累加顶点度数',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">度数统计</span>',
            detailLines: [
              '│  ① 节点度数计算：deg[1]=2, deg[2]=3, deg[3]=3, deg[4]=2',
              '│  ② 依据 (deg[u], u) 双关键字建立全序拓扑关系',
            ],
            fillLine: '└── 全图顶点度数就绪 📈',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '定向 DAG 邻接表构建',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">偏序定向</span>',
            detailLines: [
              '│  ① 边 (1,2): deg[1]<deg[2] ➔ 定向 1 ➔ 2；边 (1,3): 定向 1 ➔ 3',
              '│  ② 边 (2,3): deg 相等但 2<3 ➔ 定向 2 ➔ 3；边 (4,2), (4,3): 定向 4 ➔ 2, 4 ➔ 3',
            ],
            fillLine: '└── 成功将无向图定向为 DAG 🧭',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】三元环两步枚举与打标检验 (3-Cycle Enumeration & Marking)',
        subtitle: '枚举外层 u 及其出邻居打标，二次遍历出边检验闭合性',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '枚举 u = 1 并打标出邻居',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">出邻打标</span>',
            detailLines: [
              '│  ① u=1 的 DAG 出邻居为 {2, 3}，标记 vis[2] = 1, vis[3] = 1',
              '│  ② 遍历 1 的出邻居 2，其出邻居包含 3：检查 vis[3] == 1 匹配！',
            ],
            fillLine: '└── 发现三元环 (1, 2, 3) 🔺',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '枚举 u = 4 并打标出邻居',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">闭合检验</span>',
            detailLines: [
              '│  ① u=4 的 DAG 出邻居为 {2, 3}，标记 vis[2] = 4, vis[3] = 4',
              '│  ② 遍历 4 的出邻居 2，其出邻居包含 3：检查 vis[3] == 4 匹配！',
            ],
            fillLine: '└── 发现三元环 (4, 2, 3)，三元环累计 2 个 🔺',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】四元环中继公共组合统计 (4-Cycle Combinatorics)',
        subtitle: '枚举起点 u 经两步出边到达同一终点 w，由公共中继点组合计算四元环',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '两步路径公共终点枚举',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">公共中继</span>',
            detailLines: [
              '│  ① 从 u=1 出发经中继点 2 抵达终点 3，cnt[3] = 1',
              '│  ② 从 u=4 出发经中继点 2 抵达终点 3，同样探测到四元环结构',
            ],
            fillLine: '└── 发现四元环 (1-2-4-3)，累计四元环 1 个 💎',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '统计完成与复杂度验证',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">最终终态</span>',
            detailLines: [
              '│  ① 三元环总数: 2 个；四元环总数: 1 个',
              '│  ② 运行复杂度严格受限于 O(M √M)，无冗余对称重复统计',
            ],
            fillLine: '└── 根号分治定向计数验证完毕 🏆',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="deduction-board" style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${header}
        ${baseCase}
        ${rounds.join('\n')}
      </div>
    `;
  }
}
