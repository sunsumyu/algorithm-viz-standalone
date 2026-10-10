/**
 * 平面图最小割转对偶图最短路 (Planar Graph Min-Cut to Dual Graph · 洛谷 P4001 狼抓兔子) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶图论: 平面图面转对偶点、割边转化为穿透对偶边、最小割等价于对偶最短路、Dijkstra 极速求解
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PlanarGraphDualDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'planar-graph-dual';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'planar-graph-dual' ||
      modelId === 'planar-dual' ||
      modelId === 'P4001' ||
      modelId === 'wolf-rabbit' ||
      modelId === 'planar-mincut'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '平面图最小割转对偶图最短路 (Planar Graph Min-Cut · 洛谷 P4001 狼抓兔子) · 全景推演树',
      badge: '洛谷 P4001 狼抓兔子 · 进阶图论 + 对偶图转化 · 最小割转最短路 · Dijkstra 堆优化 O(E log V) · 替代 O(V²E) 最大流',
      descriptionHtml: `
        平面图（Planar Graph）指可嵌入平面且边仅在顶点处相交的图。<br/>
        <b>平面图最小割对偶定理与核心规约法则：</b><br/>
        ① <b>面与对偶点的构造对应关系：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将原平面图划分出的每一个有限面（Face）抽象为对偶图中的一个顶点；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;原图源点 $S$ 上方与左侧的外表面合并抽象为对偶源点 $S^*$，汇点 $T$ 下方与右侧的外表面合并抽象为对偶汇点 $T^*$；<br/>
        ② <b>容量到边权的穿透映射：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;原图中连接两面 $F_A$ 与 $F_B$ 的边界边 $e = (u, v)$，在对偶图中映射为穿透该边的对偶边 $e^* = (F_A, F_B)$，其边权严格等于 $e$ 的容量 $cap(e)$；<br/>
        ③ <b>最小割等价于对偶最短路：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;原图中的任何一个 $S-T$ 割（Cut），在拓扑上都严格对应对偶图中一条连接 $S^*$ 与 $T^*$ 的简单路径；割的容量和等于对偶路径长度；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;原图最小割 $\\iff$ 对偶图从 $S^*$ 到 $T^*$ 的单源最短路！<br/>
        ④ <b>算法复杂度跨越级优化：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;网格图上运行最大流算法（Dinic）时空复杂度高达 $O(V^2 E) \\approx O(N^3)$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;对偶转换后使用小根堆优化 Dijkstra，时空复杂度严格降至 $O(E \\log V)$，极速突破百万级网格瓶颈。
      `,
      initialStateText: '输入平面网格边容量，构建对偶图顶点集合 {S*, F1..F4, T*} 与边集，初始化 dist 数组。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '原图与对偶图顶点规模',
        valuesStr: '原图网格 2x2（6 节点），对偶图 6 节点：{S*, F1, F2, F3, F4, T*}',
      },
      {
        prefix: '├───',
        label: '对偶距离初值',
        valuesStr: 'dist[S*] = 0, dist[F_i] = ∞, dist[T*] = ∞，小顶堆推入 (0, S*)',
      },
      {
        prefix: '└───',
        label: '对偶转化核心恒等式',
        valuesStr: 'MinCut(S, T) ≡ ShortestPath(S*, T*)，边容量 cap(u, v) 映射为对偶边权 weight(u*, v*)',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】平面图转对偶图建模与源汇确立 (Planar to Dual Modeling)',
        subtitle: '原图各面映射为对偶点，建立穿透对偶边并初始化 Dijkstra 状态',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '对偶源汇 S* 与 T* 确立',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">对偶源汇</span>',
            detailLines: [
              '│  ① 原图源点 S 外侧外表面定义为对偶起点 S*',
              '│  ② 原图汇点 T 外侧外表面定义为对偶终点 T*',
            ],
            fillLine: '└── 对偶拓扑骨架搭建完成 🌐',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '对偶边权穿透构造',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">穿透映射</span>',
            detailLines: [
              '│  ① 遍历原图每条内部边与边界边，横穿连接其分隔的两个对偶面',
              '│  ② 对偶边权完全继承原图边容量：w(e*) = cap(e)',
            ],
            fillLine: '└── 对偶邻接表构建完毕 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】Dijkstra 堆优化最短路松弛 (Dijkstra Shortest Path Relaxation)',
        subtitle: '优先队列不断弹出当前距离最小对偶点，松弛相连对偶边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '对偶起点 S* 展开出边松弛',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">起点展开</span>',
            detailLines: [
              '│  ① 弹出堆顶 S* (dist=0)，标记 visited[S*] = true',
              '│  ② 松弛出边：dist[F1] = 0 + 3 = 3，dist[F2] = 0 + 4 = 4',
            ],
            fillLine: '└── 首层对偶面距离更新 📊',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '内部对偶面对角穿透松弛',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">对角穿透</span>',
            detailLines: [
              '│  ① 弹出 F1 (dist=3)，松弛对角边 (1, 2)：dist[F3] = 3 + 2 = 5',
              '│  ② 弹出 F2 (dist=4)，松弛横向边：dist[F4] = 4 + 3 = 7',
            ],
            fillLine: '└── 内部对偶面最短路径单调扩展 📍',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】到达对偶汇点与提前终止 (Dual Destination Reached & Pruning)',
        subtitle: '弹出终点 T* 时触发提前剪枝，最短路最优值严格锁定',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '松弛对偶终点 T*',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">汇点松弛</span>',
            detailLines: [
              '│  ① F3 (dist=5) 穿透割边 (2, T)：dist[T*] = 5 + 3 = 8，推入堆 (8, T*)',
              '│  ② F4 (dist=7) 尝试松弛：7 + 2 = 9 > 8，松弛失败剪枝',
            ],
            fillLine: '└── 终点最短距离锁定为 8 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '命中目标并提前终止',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">提前终止</span>',
            detailLines: [
              '│  ① 弹出堆顶节点为 T*，命中目标条件 u == dest',
              '│  ② 直接 return dist[T*] = 8，终止后续冗余搜索',
            ],
            fillLine: '└── 最短路搜索极速闭环 🏁',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】对偶路径回溯与原图割割边映射 (Path Backtracking & Min-Cut Edges Mapping)',
        subtitle: '回溯对偶最短路径穿透的每一条原图边，提取原图全局最小割割边集',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '对偶路径与原图最小割全景映射',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">全局最小割</span>',
            detailLines: [
              '│  ① 对偶最优路径：S* ➔ F1 ➔ F3 ➔ T*，路径权值和 = 3 + 2 + 3 = 8',
              '│  ② 对应穿透原图割边集合：Cut = { (S, 1), (1, 2), (2, T) }',
              '│  ③ 割边容量和 = 3 + 2 + 3 = 8，恰好切断 S 到 T 的所有可行流',
            ],
            fillLine: '└── 平面图最小割转对偶最短路求解圆满闭环 🏆',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="p-4 bg-slate-950 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-xl space-y-4">
        ${header}
        ${baseCase}
        ${rounds.join('')}
      </div>
    `;
  }
}
