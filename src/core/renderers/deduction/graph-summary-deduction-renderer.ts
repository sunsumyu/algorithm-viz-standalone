/**
 * 图论总结篇 (Graph Summary) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学
 * 五大领域知识图谱推演树展开
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class GraphSummaryDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'graph-summary';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'graph-summary' ||
      modelId === 'graph-overview' ||
      modelId === 'graph-cheat-sheet'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '图论全景核心知识体系 · 决策雷达推演树',
      badge: '图论五大支柱 · 遍历搜索 · 并查集 · 最小生成树 · 拓扑排序 · 最短路径',
      descriptionHtml: `
        图论体系全景展开：依据问题特征（连通性、权重、有向无向、依赖关系）快速决策算法路径：<br/>
        ① <b>遍历搜索 (DFS/BFS)：</b>无权图最短路、连通块计数、状态空间搜索。<br/>
        ② <b>并查集 (Union-Find)：</b>动态增边连通性维护、判环、Kruskal 最小生成树判环。<br/>
        ③ <b>最小生成树 (MST)：</b>全图最小代价连通。稀疏图选 Kruskal (边排序)，稠密图选 Prim (割定理堆优化)。<br/>
        ④ <b>拓扑排序 (Topological)：</b>DAG 依赖解耦。Kahn 算法入度剥离，DAG 最长路与拓扑 DP。<br/>
        ⑤ <b>最短路径 (Shortest Path)：</b>单源正权 Dijkstra、负权 Bellman-Ford/SPFA、全源 Floyd-Warshall。
      `,
      initialStateText: '图论五大支柱构建就绪，准备展开全景决策推演树。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '核心领域',
        valuesStr: '遍历搜索、并查集、最小生成树、拓扑排序、最短路径',
      },
      {
        prefix: '├───',
        label: '时空尺度',
        valuesStr: 'O(V+E) 线性基底 至 O(V³) 全源高阶',
      },
      {
        prefix: '└───',
        label: '决策中枢',
        valuesStr: '依边权性质 (无权/非负/负权) 与拓扑依赖精准分流',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【支柱一 & 二】图遍历基石与不相交集合维护',
        subtitle: 'DFS/BFS 深入与层序遍历，并查集动态连通性判定',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '遍历搜索 (DFS / BFS)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">图论基石</span>',
            detailLines: [
              '│  ① DFS：递归/栈深入搜索，visited 判重，适用于路径搜索与连通块标记',
              '│  ② BFS：队列先进先出，波前层序推进，无权图单源最短路最优解',
            ],
            fillLine: '└── O(V + E) 线性遍历基石 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '并查集 (Disjoint Set)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">反阿克曼复杂度</span>',
            detailLines: [
              '│  ① find(x)：递归沿途路径压缩，parent[x] 直接挂载到根',
              '│  ② union(x, y)：按秩合并小树并入大树，近乎 O(1) 维护连通分支',
            ],
            fillLine: '└── O(α(n)) 动态判环利器 🚀',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【支柱三 & 四】骨干网络连通与有向无环依赖解耦',
        subtitle: '最小生成树两派贪心，拓扑排序依赖消除',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '最小生成树 (MST)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">骨干贪心</span>',
            detailLines: [
              '│  ① Kruskal：按边权升序排列，并查集贪心加边判环，O(E log E) 适合稀疏图',
              '│  ② Prim：顶点集合切分扩展割边，优先队列松弛，O(E + V log V) 适合稠密图',
            ],
            fillLine: '└── N 个点恰取 N-1 条最小权边 🌲',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '拓扑排序 (Topological)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">DAG 解耦</span>',
            detailLines: [
              '│  ① Kahn 算法：统计入度 inDegree，入度为 0 顶点入队剥洋葱',
              '│  ② 环检测：若最终拓扑序长度 < V，判定存在有向环',
            ],
            fillLine: '└── 任务排期与关键路径推进 📋',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【支柱五】全图路网最优距离度量',
        subtitle: '单源非负、负权检测与全源动态规划',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'Dijkstra (非负权堆优化)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">贪心松弛</span>',
            detailLines: [
              '│  ① 小顶堆维护当前最近未锁定顶点，每次锁定全局最小值',
              '│  ② 三角不等式松弛邻居边：dist[v] = min(dist[v], dist[u] + w)',
            ],
            fillLine: '└── O((V + E) log V) 工业级标准 📏',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'Bellman-Ford / SPFA / Floyd',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-bold">全场景覆盖</span>',
            detailLines: [
              '│  ① Bellman-Ford/SPFA：支持负权边与负权回路检测，O(VE) / 期望 O(kE)',
              '│  ② Floyd-Warshall：全源最短路三重循环动态规划，O(V³)',
            ],
            fillLine: '└── 全场景最短路体系完备 🎯',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '图论五大核心领域推演'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return GraphKnowledgeSystem.isComplete();',
      answerDescription: '掌握图论五大支柱（DFS/BFS、并查集、MST、拓扑序、最短路），建立完备知识图谱与选型直觉！',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCase}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
