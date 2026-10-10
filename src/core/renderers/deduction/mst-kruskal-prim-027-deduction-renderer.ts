/**
 * 最小生成树算法 (MST - Kruskal & Prim) (Class 027 / 洛谷 P3366) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * Kruskal 边权升序排序 + 并查集防环判定 + Prim 切分定理
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MstKruskalPrim027DeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'mst-kruskal-prim-027';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'mst-kruskal-prim-027' ||
      modelId === 'mst-kruskal-prim' ||
      modelId === 'class027-code01' ||
      modelId === 'class027-code02' ||
      modelId === 'luogu-p3366'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '最小生成树算法 (Kruskal & Prim) · 全景推演树',
      badge: '洛谷 P3366 · 最小生成树 · Kruskal 边贪心并查集 · Prim 顶点切分小根堆 · O(E log E) 最优',
      descriptionHtml: `
        问题定义：给定具有 $V$ 个顶点与 $E$ 条带权边的无向连通图，选取恰好 $V - 1$ 条边使全图连通，且总边权和最小。<br/>
        <b>Kruskal 边贪心与 Prim 顶点切分双核机制：</b><br/>
        ① <b>Kruskal 算法 (加边法)：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将图中全部 $E$ 条边按权值非递减升序排序：$e_1 \le e_2 \le \dots \le e_E$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;初始化并查集，每个顶点属于独立的连通集合；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;遍历边 $(u, v, w)$，通过 <code>find(u) !== find(v)</code> 校验：若不属于同一集合，则采纳该边执行 <code>union(u, v)</code> 并累加权值；若已在同一集合则果断舍弃（防环）；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;累计采纳边数达到 $V - 1$ 时立即提前终止，时间复杂度 $O(E \log E)$；<br/>
        ② <b>Prim 算法 (加点法)：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;维护已连通点集 $S$ 与未连通点集 $V \setminus S$，小根堆维护横跨切分 $(S, V \setminus S)$ 的所有割边；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;每次弹出权值最小的割边，将对应未访问端点纳入 $S$ 并将新出边入堆，时间复杂度 $O(E \log V)$。
      `,
      initialStateText: '载入 4 顶点 5 带权边连通图，准备启动 Kruskal 边权升序排序与并查集贪心加边。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点与边集',
        valuesStr: 'V = 4, E = [(1-2:1), (2-3:2), (2-4:3), (1-3:4), (3-4:5)]',
      },
      {
        prefix: '├───',
        label: '生成树终止条件',
        valuesStr: '选满 V - 1 = 3 条边且不形成环路',
      },
      {
        prefix: '└───',
        label: '优化目标',
        valuesStr: '使所选边权之和 totalWeight 达到全局最小',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】边权升序排序与并查集初始化',
        subtitle: '按权值由小到大重排候选边，并查集初始化每个顶点的父节点为自身',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '升序候选队列',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">升序排列</span>',
            detailLines: [
              '│  ① 排序后序列: [1-2(w=1), 2-3(w=2), 2-4(w=3), 1-3(w=4), 3-4(w=5)]',
              '│  ② 并查集 parent: {1:1, 2:2, 3:3, 4:4}',
            ],
            fillLine: '└── 贪心考察队列就绪 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '首边 1 ↔ 2 (w=1) 采纳',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">边 #1 入选</span>',
            detailLines: [
              '│  ① find(1) = 1, find(2) = 2，分属不同分量，不会成环',
              '│  ② union(1, 2) ➔ 合并集合，totalWeight = 1',
              '│  ③ 已选边数: 1 / 3',
            ],
            fillLine: '└── 边 (1-2) 固化入生成树',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】贪心考察后续边权与并查集合并',
        subtitle: '依次考察边 (2-3) 与 (2-4)，判定连通性与扩充生成树',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '第二边 2 ↔ 3 (w=2) 采纳',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">边 #2 入选</span>',
            detailLines: [
              '│  ① find(2) = 2, find(3) = 3，分属不同分量',
              '│  ② union(2, 3) ➔ 合并集合，totalWeight = 1 + 2 = 3',
              '│  ③ 已选边数: 2 / 3',
            ],
            fillLine: '└── 边 (2-3) 固化入生成树',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '第三边 2 ↔ 4 (w=3) 采纳与达成满配',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">边 #3 入选 (满配)</span>',
            detailLines: [
              '│  ① find(2) = 3, find(4) = 4，分属不同分量',
              '│  ② union(2, 4) ➔ totalWeight = 3 + 3 = 6',
              '│  ③ 已选边数达到 3 = V - 1，全部 4 顶点完全连通！',
            ],
            fillLine: '└── 达成终止条件，触发提前退出 🎯',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】最小生成树终态结算与剩余边跳过',
        subtitle: '后续大权边 (1-3:4) 与 (3-4:5) 无需考量或已被防环拦截',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'MST 权值核算与算法复杂度总结',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">MST 结算</span>',
            detailLines: [
              '│  ① 最小生成树边集: [(1-2), (2-3), (2-4)]',
              '│  ② 最小生成树总权值: 1 + 2 + 3 = 6',
              '│  ③ 若继续考察 1-3，由于 1 和 3 已连通，将被并查集防环丢弃',
              '│  ④ 运行复杂度: 边排序 O(E log E) + 并查集 O(E α(V)) = O(E log E)',
            ],
            fillLine: '└── 最小生成树构建圆满成功，返回总权值 6 🎉',
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
