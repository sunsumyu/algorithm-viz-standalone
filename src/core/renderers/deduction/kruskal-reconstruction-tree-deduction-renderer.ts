/**
 * Kruskal 重构树 (Kruskal Reconstruction Tree · 洛谷 P4768 / P4197) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：边权升序合并、边权转化新虚点点权、点权大根堆单调性、LCA 瓶颈路径与子树可达性等价定理
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class KruskalReconstructionTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'kruskal-reconstruction-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'kruskal-reconstruction-tree' ||
      modelId === 'kruskal-tree' ||
      modelId === 'reconstruction-tree' ||
      modelId === 'P4768' ||
      modelId === 'P4197' ||
      modelId === 'class072'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: 'Kruskal 重构树 (Kruskal Reconstruction Tree · 洛谷 P4768 / P4197) · 全景推演树',
      badge: '洛谷 P4768 / P4197 / 左程云 class072 · 边权升序合并 · 虚点点权大根堆单调性 · LCA 路径瓶颈转化 · 子树可达性',
      descriptionHtml: `
        在无向带权图中，Kruskal 重构树通过边权升序合并连通块并引入代表边权的虚节点，构建出一棵包含 $2n-1$ 个节点的二叉树。<br/>
        <b>重构树三大核心定理与推演支柱：</b><br/>
        ① <b>边权转点权与大根堆性质：</b>原图中的 $n$ 个实体点为叶子节点（点权为 0），每当通过边 $(u, v, w)$ 合并两个集合时，新建一个虚节点其点权赋值为 $w$。由于边权升序合并，从叶子到根的路径上点权严格单调递增，天然满足大根堆性质；<br/>
        ② <b>路径瓶颈 LCA 定理：</b>原图中任意两点 $u, v$ 之间所有路径中，“最大边权的最小值”（瓶颈距离），严格等价于重构树上 $\\text{LCA}(u, v)$ 的点权（$\\text{val}[\\text{LCA}(u, v)]$）；<br/>
        ③ <b>子树连通性与倍增跳跃：</b>从某点 $u$ 出发，只经过边权 $\\le x$ 的边所能到达的所有节点，恰好对应重构树上深度最浅的满足 $\\text{val}[\\text{anc}] \\le x$ 的祖先节点 $\\text{anc}$ 的<b>整棵子树内的所有叶子节点</b>！利用倍增或树剖可在 $O(\\log n)$ 内极速圈定连通块。
      `,
      initialStateText: '初始化实体节点并查集，边集按权值升序排序，准备构建包含 2n-1 个节点的 Kruskal 重构二叉树。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '原图网络与实体叶子',
        valuesStr: '节点 1..n 映射为重构树叶子，点权 val[1..n] = 0',
      },
      {
        prefix: '├───',
        label: '边权升序排列',
        valuesStr: '所有无向边按权值升序排序，保证后续生成的父节点权值单调递增',
      },
      {
        prefix: '└───',
        label: '并查集空间分配',
        valuesStr: 'father[1..2n] = 1..2n，val[1..2n] = 0，nodeCount = n，准备容纳 n-1 个虚节点',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】边权升序排序与并查集初始化 (Kruskal Edge Sorting & Disjoint Set Init)',
        subtitle: '基于贪心策略对图边升序排序，为后续虚节点大根堆单调性奠定数学基石',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '边集贪心升序排序',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">升序排序</span>',
            detailLines: [
              '│  ① 遍历所有边，执行 edges.sort((a, b) -> a.w - b.w)',
              '│  ② 确保每次合并的边权单调不减，保证重构树点权从底到顶单调递增',
            ],
            fillLine: '└── 边集排序完毕，大根堆单调性前置条件达成 ⚖️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '并查集代表元自环',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">并查集初始化</span>',
            detailLines: [
              '│  ① 前 n 个实体节点 father[i] = i',
              '│  ② 初始时每个实体节点自成一个独立连通块',
            ],
            fillLine: '└── 实体点初始代表元就绪 📌',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】虚点构建与边权转点权 (Virtual Node Allocation & Weight Upward Propagation)',
        subtitle: '逐条考察边，若连接不同分量则新建虚节点作为两子树根的父亲，边权赋为点权',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '连通性判别与成环规避',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">find(u) != find(v)</span>',
            detailLines: [
              '│  ① 查询端点代表元 fu = find(u), fv = find(v)',
              '│  ② 若 fu == fv 说明已在同一连通分量，该边跳过不建虚点',
            ],
            fillLine: '└── 严格规避环路，确保生成树拓扑无冗余 🚫',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '分配虚点并挂载子树',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">新建虚节点</span>',
            detailLines: [
              '│  ① 分配新虚点 nc = ++nodeCount，赋值 val[nc] = e.w',
              '│  ② 重定向并查集：father[fu] = nc, father[fv] = nc, father[nc] = nc',
              '│  ③ 添加重构树有向边 (nc ➔ fu) 与 (nc ➔ fv)',
            ],
            fillLine: '└── 边权成功转化为虚节点点权，二叉重构树优雅生长 🌲',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】大根堆单调性与 LCA 瓶颈路径极速查询 (Monotonic Heap Property & LCA Bottleneck Query)',
        subtitle: '任意两点路径最大边权最小值转化为 LCA 点权，利用倍增在 O(log n) 极速解题',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '瓶颈路径 LCA 定理',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">LCA 瓶颈等价</span>',
            detailLines: [
              '│  ① 原图中 u 到 v 任意简单路径的最大边权最小值 ⟺ 重构树上 val[LCA(u, v)]',
              '│  ② 无需对复杂原图进行二分或多次 BFS，一次 LCA 查询即可瞬时出解',
            ],
            fillLine: '└── 瓶颈路径距离查询转化完毕 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '子树可达性倍增跳跃',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">倍增圈定连通块</span>',
            detailLines: [
              '│  ① 限制边权 <= x 时，从 u 出发倍增跳跃到满足 val[anc] <= x 的最高祖先',
              '│  ② anc 的整棵子树内的所有叶子节点即为满足条件的连通块集合',
            ],
            fillLine: '└── 复杂可达性问题彻底降维为 DFS 序与主席树子树查询，推演完美闭环 🏆',
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
