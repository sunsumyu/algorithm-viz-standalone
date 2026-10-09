/**
 * Kruskal 最小生成树 (MST Kruskal · 洛谷 P3366 · 左程云 Class 058) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 边权升序排序、并查集连通性判环、贪心加边与 V-1 条边早停
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MstKruskalDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'mst-kruskal';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'mst-kruskal' ||
      modelId === 'kruskal-mst' ||
      modelId === 'class058-code01' ||
      modelId === 'luogu-p3366-kruskal'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '最小生成树 (Kruskal 算法 · 加边法) · 全景推演树',
      badge: '边权升序排序 · 并查集回路检测 · 贪心加边 · O(E log E)',
      descriptionHtml: `
        包含 <code class="font-bold text-slate-800">V = 5</code> 个顶点 (0..4) 与 7 条无向带权边：<br/>
        <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">(0-1:2), (0-3:6), (1-2:3), (1-3:8), (1-4:5), (2-4:7), (3-4:9)</code>。<br/>
        核心算法架构：<br/>
        ① <b>全局边权贪心排序：</b> 将所有边按权重从小到大升序排序，优先考量代价最小的连接边；<br/>
        ② <b>并查集回路检验 (Union-Find Cycle Detection)：</b><br/>
        &nbsp;&nbsp;• 若候选边两端点 <code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">find(u) != find(v)</code>，说明两点处于不同连通分量，加入该边不会形成环，执行 <code class="font-bold text-emerald-700">union(u, v)</code> 并纳入 MST；<br/>
        &nbsp;&nbsp;• 若两端点 <code class="font-mono bg-rose-50 text-rose-800 px-1 py-0.5 rounded font-bold">find(u) == find(v)</code>，加入将构成回路，立即舍弃！<br/>
        ③ <b>V-1 条边早停收敛：</b> 一旦选满 <code class="font-bold text-slate-800">V - 1 = 4</code> 条边，全图已构成连通生成树，提前 break 退出！
      `,
      initialStateText: '全图 5 个节点，并查集初始化 parent[i]=i，全图 7 条边已按权值升序排列完毕。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边权升序候选队列 (按权值贪心递增)',
        valuesStr: 'sortedEdges = [(0,1:2), (1,2:3), (1,4:5), (0,3:6), (2,4:7), (1,3:8), (3,4:9)]',
      },
      {
        prefix: '├───',
        label: '并查集初始连通分量 (每个节点自成集合)',
        valuesStr: 'parent = [0:0, 1:1, 2:2, 3:3, 4:4]',
      },
      {
        prefix: '└───',
        label: '生成树初始容器与累计权值',
        valuesStr: 'mstEdges = [], totalWeight = 0, count = 0 / 4',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】考察边 (0 ➔ 1, 权值 w=2)',
        subtitle: '并查集判环 · 无环合并 · 纳入生成树',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '并查集连通性检验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">find(0)≠find(1)</span>',
            detailLines: [
              '│  ① find(0) = 0, find(1) = 1 -> 两点不在同一集合',
              '│  ② 执行 uf.union(0, 1) -> parent[0] = 1',
            ],
            fillLine: '└── 连通块合并：{0, 1} 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '固化 MST 边与权值累加',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">已选 1/4 边</span>',
            detailLines: [
              '│  ① mstEdges.push(0 ➔ 1)',
              '│  ② totalWeight = 0 + 2 = 2',
            ],
            fillLine: '└── totalWeight = 2 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】考察边 (1 ➔ 2, 权值 w=3)',
        subtitle: '并查集判环 · 无环合并 · 纳入生成树',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '并查集连通性检验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">find(1)≠find(2)</span>',
            detailLines: [
              '│  ① find(1) = 1, find(2) = 2 -> 根节点不同，无环',
              '│  ② 执行 uf.union(1, 2) -> parent[1] = 2',
            ],
            fillLine: '└── 连通块合并：{0, 1, 2} 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '固化 MST 边与权值累加',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">已选 2/4 边</span>',
            detailLines: [
              '│  ① mstEdges.push(1 ➔ 2)',
              '│  ② totalWeight = 2 + 3 = 5',
            ],
            fillLine: '└── totalWeight = 5 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】考察边 (1 ➔ 4, 权值 w=5)',
        subtitle: '并查集判环 · 无环合并 · 纳入生成树',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '并查集连通性检验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">find(1)≠find(4)</span>',
            detailLines: [
              '│  ① find(1) = 2, find(4) = 4 -> 根节点不同，无环',
              '│  ② 执行 uf.union(1, 4) -> parent[2] = 4',
            ],
            fillLine: '└── 连通块合并：{0, 1, 2, 4} 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '固化 MST 边与权值累加',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">已选 3/4 边</span>',
            detailLines: [
              '│  ① mstEdges.push(1 ➔ 4)',
              '│  ② totalWeight = 5 + 5 = 10',
            ],
            fillLine: '└── totalWeight = 10 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 轮】考察边 (0 ➔ 3, 权值 w=6)',
        subtitle: '并查集判环 · 达成 V-1 条边 · 提前早停',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '并查集连通性检验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">find(0)≠find(3)</span>',
            detailLines: [
              '│  ① find(0) = 4, find(3) = 3 -> 根节点不同，无环',
              '│  ② 执行 uf.union(0, 3) -> 连通全部 5 个顶点',
            ],
            fillLine: '└── 全图完全连通：{0, 1, 2, 3, 4} 🌟',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '选满 V-1 条边提前终止',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">已选 4/4 边</span>',
            detailLines: [
              '│  ① mstEdges.push(0 ➔ 3)',
              '│  ② totalWeight = 10 + 6 = 16',
              '│  ③ count == 4 (达到 V-1)，触发 break 提前早停！',
            ],
            fillLine: '└── 最小生成树构建完成 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '按边权由小到大贪心挑选，并查集判环防回路，选满 V-1 条边提前早停'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return totalWeight = 16;',
      answerDescription:
        '🏆 最终返回：成功选出 4 条核心树边构建最小生成树，联通全部 5 个顶点，最小生成树总权值 = 16！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
