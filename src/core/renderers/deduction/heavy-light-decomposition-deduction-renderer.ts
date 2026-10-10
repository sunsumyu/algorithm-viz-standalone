/**
 * 树链剖分 (Heavy-Light Decomposition · 洛谷 P3384) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：两遍 DFS 划分重儿子、重链连续 DFN 序映射、树上路径转化为 O(log N) 个线段树连续区间
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class HeavyLightDecompositionDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'heavy-light-decomposition';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'heavy-light-decomposition' ||
      modelId === 'hld' ||
      modelId === 'tree-chain-decomposition' ||
      modelId === 'P3384' ||
      modelId === 'class074'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '树链剖分与重链维护 (Heavy-Light Decomposition · 洛谷 P3384) · 全景推演树',
      badge: '洛谷 P3384 / 左程云 class074 · 两遍 DFS 划分重链 · 连续 DFN 序拍平 · O(log^2 N) 树上路径跳跃 · 线段树无缝对接',
      descriptionHtml: `
        树链剖分（重链剖分）将树形结构划分为若干条互不相交的重链，使得树上任意两点之间的简单路径可以被拆分为不超过 $O(\\log n)$ 条重链区间。<br/>
        <b>树剖三大核心定理与推演支柱：</b><br/>
        ① <b>DFS1 重儿子统计：</b>第一遍 DFS 递归遍历整棵树，统计每个顶点的深度 $\\text{depth}[u]$、父节点 $\\text{parent}[u]$ 以及子树大小 $\\text{size}[u]$，选出子树最大的儿子作为重儿子 $\\text{son}[u]$，其余为轻儿子；<br/>
        ② <b>DFS2 链头确立与连续 DFN 序：</b>第二遍 DFS 优先深入重儿子，保证同一条重链上的所有节点分配到连续的 $\\text{dfn}$ 时间戳。重儿子继承当前链头 $\\text{top}[u]$，轻儿子以自身为新链头开启新重链；<br/>
        ③ <b>轻重边跃迁与区间聚合：</b>树上任意路径被轻边切断的次数不超过 $\\log_2 n$。查询或修改路径时，通过不断将深度较深的链头向上跳跃至 $\\text{parent}[\\text{top}[u]]$，沿途收集连续区间 $[\\text{dfn}[\\text{top}[u]], \\text{dfn}[u]]$，直接对接线段树实现 $O(\\log^2 n)$ 极速修改与查询。
      `,
      initialStateText: '初始化树形邻接表，准备执行两遍 DFS，完成重儿子确立、连续 DFN 序拍平与链头标记。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '树形无向网络拓扑',
        valuesStr: '节点 1..n，以 root=1 为根，无环连通拓扑，需剖分为连续线性区间',
      },
      {
        prefix: '├───',
        label: 'DFS 状态数组分配',
        valuesStr: 'parent, depth, size, son, top, dfn 均初始化为 0，计数器 timer = 0',
      },
      {
        prefix: '└───',
        label: '区间连续性定理保证',
        valuesStr: '重儿子优先遍历确保重链 DFN 严格连续，整棵子树 DFN 也落在连续区间 [dfn[u], dfn[u]+size[u]-1]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】第一次 DFS：深度、父节点、子树大小统计与重儿子判定 (DFS1 Heavy Son Identification)',
        subtitle: '递归统计每个顶点的 depth, parent, size，并贪心选取子树规模最大的子节点作为重儿子 son',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '节点初访与属性标记',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">DFS1 深入</span>',
            detailLines: [
              '│  ① 记录父节点 parent[u] = p 与深度 depth[u] = d',
              '│  ② 初始化节点自身大小 size[u] = 1',
            ],
            fillLine: '└── 节点拓扑属性初态就绪 📐',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '子树累加与重儿子甄选',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">重儿子判定</span>',
            detailLines: [
              '│  ① 遍历非父邻居 v：递归 dfs1(v, u, d + 1) 并累加 size[u] += size[v]',
              '│  ② 若 son[u] == 0 或 size[v] > size[son[u]]，则更新重儿子 son[u] = v',
            ],
            fillLine: '└── 重儿子精准锁定，重边 (u, son[u]) 确立 ⭐',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】第二次 DFS：重儿子优先遍历、链头确立与连续 DFN 序编排 (DFS2 Chain Heading & Continuous DFN)',
        subtitle: '重儿子优先递归以继承链头并连续分配 DFN，轻儿子以自身为链头开启新重链',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '链头标记与时间戳分配',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">top & dfn</span>',
            detailLines: [
              '│  ① 设置节点链头 top[u] = t',
              '│  ② 分配 DFS 时间戳 dfn[u] = ++timer',
            ],
            fillLine: '└── 连续时间戳分配就绪 ⏱️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '重儿子优先与轻链开辟',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">优先走重儿子</span>',
            detailLines: [
              '│  ① 优先递归 dfs2(son[u], t)：重儿子继承当前链头 t，DFN 序无缝衔接',
              '│  ② 遍历其余轻儿子 v：递归 dfs2(v, v)，以自身为链头开辟新链',
            ],
            fillLine: '└── 重链与轻链划分完成，整树彻底拍平为连续区间 🏷️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】树上路径跳跃与线段树连续区间映射 (Tree Path Jumps & Segment Tree Mapping)',
        subtitle: '在树上任意两点路径跳跃，将树上路径转化为至多 O(log N) 个连续线段树区间',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '链头深度比较与上跳',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">跨链跃迁</span>',
            detailLines: [
              '│  ① 循环判定 while (top[u] != top[v])：选择 depth[top] 较大者上跳',
              '│  ② 收集重链区间 [dfn[top[u]], dfn[u]]，令 u = parent[top[u]]',
            ],
            fillLine: '└── 每次上跳深度至少翻倍，保证至多 O(log N) 次跳跃 🪜',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '汇聚同链与线段树无缝对接',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">终末同链合并</span>',
            detailLines: [
              '│  ① 当 top[u] == top[v] 时，两点汇聚在同一重链',
              '│  ② 收集最终区间 [min(dfn[u], dfn[v]), max(dfn[u], dfn[v])]',
              '│  ③ 将所有区间全权委托给普通 1D 线段树进行区间加/区间求和',
            ],
            fillLine: '└── 复杂度从 O(N) 直降至 O(log^2 N)，树剖大一统架构完美闭环 🏆',
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
