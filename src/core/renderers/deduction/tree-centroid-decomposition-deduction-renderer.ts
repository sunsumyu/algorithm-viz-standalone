/**
 * 树分治与静态点分治 (Tree Centroid Decomposition · POJ 1741 / 洛谷 P3806) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶树论: 树重心定位定理、最大子树不超过一半、树高递归降至 O(log N)、跨重心路径容斥统计
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeCentroidDecompositionDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-centroid-decomposition';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-centroid-decomposition' ||
      modelId === 'static-centroid' ||
      modelId === 'POJ1741' ||
      modelId === 'P3806' ||
      modelId === 'tree-divide-and-conquer'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '树分治与静态点分治 (Tree Centroid Decomposition · POJ 1741 / 洛谷 P3806) · 全景推演树',
      badge: 'POJ 1741 / 洛谷 P3806 · 进阶树论 + 点分治 · 树重心隔离 · 跨重心路径双指针统计与容斥 · 时间复杂度 O(N log² N)',
      descriptionHtml: `
        静态点分治（Centroid Decomposition）是解决树上点对路径统计问题的经典分治模型（如路径长度 $\\le K$ 点对数）。<br/>
        <b>三大核心机制与数学规约：</b><br/>
        ① <b>树的重心判定定理（对数层数保障）：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;对于大小为 $S$ 的树连通块，存在重心节点 $c$，使得删除 $c$ 后的所有子连通块规模均满足 $sz[v] \\le \\lfloor S / 2 \\rfloor$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;每次分治连通块规模至少折半，故递归树的深度严格受控于 $O(\\log N)$；<br/>
        ② <b>路径分类与跨重心路径统计：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;树中任意点对路径分为两类：完全包含在某个子树内部的路径（留给子分治），以及经过当前重心 $c$ 的跨子树路径；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;收集所有节点到重心 $c$ 的距离分布，利用排序 + 双指针在 $O(M \\log M)$ 内统计点对和；<br/>
        ③ <b>子树容斥去重（Inclusion-Exclusion）：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;在全局距离统计中，同一子树内部的两点组合会在重心处产生“折返伪路径”；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;对各子树分别运行相同的双指针统计，并从总数中扣除，即可精准计算跨重心有效路径；<br/>
        ④ <b>标记隔离与子连通块递归：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;设置 $vis[c] = true$ 将全树在拓扑上切断为若干更小的独立子树，自顶向下递归分治。
      `,
      initialStateText: '输入无向树邻接表与边权，初始化 sz[]、maxSubtree[] 与 vis[]，准备开始点分治。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点与边集规模',
        valuesStr: '节点 1..N，无向树边 N-1 条，目标统计满足特定约束的树上简单路径',
      },
      {
        prefix: '├───',
        label: '状态数组定义',
        valuesStr: 'sz[u]: 子树大小，maxSubtree[u]: 割断 u 后的最大子连通块规模，vis[u]: 重心隔离标记',
      },
      {
        prefix: '└───',
        label: '重心判定条件',
        valuesStr: 'maxSubtree[c] = min_{u} { max(max_{v} sz[v], totalNodes - sz[u]) } ≤ ⌊totalNodes / 2⌋',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】DFS 子树规模与重心定位 (Subtree Size & Centroid Identification)',
        subtitle: 'DFS 遍历当前连通块，统计每个节点的最大割块 maxSubtree[u] 并锁定重心',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '子树大小自底向上累加',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">DFS 探查</span>',
            detailLines: [
              '│  ① 初始 sz[u] = 1, maxSubtree[u] = 0',
              '│  ② 递归未隔离子节点 v：sz[u] += sz[v], maxSubtree[u] = max(maxSubtree[u], sz[v])',
            ],
            fillLine: '└── 子树规模动态聚合 🌲',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '计算上方断开块与候选重心更新',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">重心确立</span>',
            detailLines: [
              '│  ① 计算上方连通块：maxSubtree[u] = max(maxSubtree[u], totalNodes - sz[u])',
              '│  ② 若 maxSubtree[u] < maxPart，则更新当前连通块重心 root = u',
            ],
            fillLine: '└── 连通块绝对平衡重心确立 👑',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】标记隔离当前重心 (Centroid Isolation & Graph Partition)',
        subtitle: '确立重心后将其标记为已访问，逻辑切断与所有邻接点的连接',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '隔离标记设置 vis[c] = true',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">重心割断</span>',
            detailLines: [
              '│  ① 设置 vis[c] = true，禁止后续 DFS 穿越该重心',
              '│  ② 将原连通块分裂为若干互不相交的更小子树',
            ],
            fillLine: '└── 拓扑割断解耦完毕 ✂️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '分治层级与树高控制',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">O(log N) 深度</span>',
            detailLines: [
              '│  ① 每个分裂子连通块规模严格不超过 ⌊totalNodes / 2⌋',
              '│  ② 递归树高度严格受控于 O(log N)，杜绝链状退化',
            ],
            fillLine: '└── 严格对数层级保证 📐',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】跨重心深度收集与容斥统计 (Depth Collection & Inclusion-Exclusion)',
        subtitle: '收集所有子树节点到重心的距离分布，利用双指针计算合法路径并容斥去重',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '全局距离数组统计',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">双指针统计</span>',
            detailLines: [
              '│  ① DFS 收集当前连通块中所有节点到重心的深度 dist[x]',
              '│  ② 排序 dist 数组，双指针在 O(M log M) 内统计 dist[i] + dist[j] <= K 的点对数',
            ],
            fillLine: '└── 全局经过重心的候选路径汇总 📊',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '子树内部折返路径容斥剔除',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">容斥去重</span>',
            detailLines: [
              '│  ① 对各子连通块，以子节点为起点初始边权运行相同双指针统计',
              '│  ② 从全局总数中扣除子树内部的非法折返点对：ans -= invalid_pairs',
            ],
            fillLine: '└── 跨重心合法路径纯净提取 💡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】子连通块递归分治与全局闭环 (Recursive Sub-Block Conquer & Global Output)',
        subtitle: '对各未隔离子连通块递归运行点分治，汇总全部层级的路径统计结果',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '子连通块递归与求解完成',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">全局闭环</span>',
            detailLines: [
              '│  ① 对所有未访问邻居 v：重新计算 totalNodes = sz[v]，递归寻找新子重心 solve(newRoot)',
              '│  ② 所有分治重心递归完毕，全图任意两点路径统计圆满闭环',
            ],
            fillLine: '└── 静态点分治算法执行圆满完成 🏆',
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
