/**
 * 动态点分树 (Dynamic Centroid Tree · 洛谷 P6329 / SP1437) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶树论: 重心递归分治建树、树高严格 O(log N)、动态单点修改与跳链容斥查询
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CentroidTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'centroid-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'centroid-tree' ||
      modelId === 'dynamic-centroid-tree' ||
      modelId === 'P6329' ||
      modelId === 'SP1437' ||
      modelId === 'centroid-decomposition-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '动态点分树与重心分治重构 (Dynamic Centroid Tree · 洛谷 P6329 / SP1437) · 全景推演树',
      badge: '洛谷 P6329 / SP1437 · 树分治与动态点分树 · 树高严格 O(log N) · 单点修改与容斥查询 · 动态时空复杂度 O(N log N + M log² N)',
      descriptionHtml: `
        动态点分树（Centroid Tree）是将静态点分治算法结构化为一棵树形拓扑的高级树论模型。通过把每一层分治重心作为重构树的节点并建立父子关系，使树高严格降为 $O(\\log N)$。<br/>
        <b>三大核心机制与数学规约：</b><br/>
        ① <b>树的重心判定定理：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;对于大小为 $S$ 的连通块，存在至少一个重心节点 $c$，使得删除 $c$ 后的所有子连通块规模均满足 $sz[v] \\le \\lfloor S/2 \\rfloor$；<br/>
        ② <b>对数级树高保证（复杂度核心）：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;以 $c$ 作为当前层重构根，递归对其断开后的各个连通块继续求重心并连边 $c_{child} \\to c$。每次分治连通块规模至少折半，故重构树的深度严格不超过 $\\lceil \\log_2 N \\rceil$；<br/>
        ③ <b>路径覆盖与跳链容斥查询：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;原树中任意两点 $u$ 和 $v$ 之间的简单路径，在点分树上必且仅在其最近公共祖先 $LCA_{CTree}(u, v)$ 处被拆分统计；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;动态单点修改时只需沿点分树父指针向上跳跃 $O(\\log N)$ 层更新各层数据结构；查询时同样跳链累加并容斥剔除子树重合，单次操作复杂度严格为 $O(\\log^2 N)$。
      `,
      initialStateText: '输入无向树拓扑与点权，初始化 DFS 子树大小数组 sz 与最大子连通块数组 maxSub，准备构建点分重构树。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '原树拓扑与节点规模',
        valuesStr: '节点 1..n，初始边数 n-1，全树节点总规模 total = n',
      },
      {
        prefix: '├───',
        label: '重心判定界限',
        valuesStr: '任意子连通块规模上限 ≤ ⌊total / 2⌋，递归分治必收敛',
      },
      {
        prefix: '└───',
        label: '重构树父指针表',
        valuesStr: 'parentCTree[1..n] 全部初始化为 null，树高严格 ≤ ⌈log₂ n⌉',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】连通块规模 DFS 与重心定位 (Subtree Size & Centroid Finding)',
        subtitle: 'DFS 遍历当前连通块求各节点子树大小，定位最大子连通块最小的重心节点',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '子树大小与最大子块统计',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">DFS 统计</span>',
            detailLines: [
              '│  ① 统计各分支：sz[u] = 1 + ∑ sz[v]',
              '│  ② 计算最大连通块：maxSub[u] = max(max(sz[v]), total - sz[u])',
            ],
            fillLine: '└── 各节点连通块规模精确计算完毕 📏',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '全局重心锁定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">锁定重心</span>',
            detailLines: [
              '│  ① 选取 maxSub[c] 最小的节点 c 作为当前连通块重心',
              '│  ② 验证满足 maxSub[c] ≤ ⌊total / 2⌋',
            ],
            fillLine: '└── 当前分治重心节点确立 👑',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】标记当前重心并递归处理子连通块 (Centroid Tagging & Divide-and-Conquer)',
        subtitle: '将重心打标隔离，对删除重心后的若干独立子连通块递归执行重心分治',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '重心访问标记隔离',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">打标隔离</span>',
            detailLines: [
              '│  ① 标记 vis[c] = true，阻断后续子树遍历穿透重心',
              '│  ② 原树被重心分割为若干严格变小的独立连通子树',
            ],
            fillLine: '└── 重心节点完成树拓扑解耦 ✂️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '递归深入子连通块',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">深入分治</span>',
            detailLines: [
              '│  ① 对各邻接子连通块：计算其实际规模 childTotal',
              '│  ② 递归求解子连通块重心：childCentroid = build(v, childTotal)',
            ],
            fillLine: '└── 子连通块分治递归启动 🍃',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】建立点分树父子边与树高上界确立 (Centroid Tree Edge Linking & Depth Bound)',
        subtitle: '将子连通块重心指向父重心，构建对数级高度的点分重构树',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '重构树父子连边',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">重构连边</span>',
            detailLines: [
              '│  ① 确立父指针：parentCTree[childCentroid] = c',
              '│  ② 点分重构树结构显式建立',
            ],
            fillLine: '└── 重构树父子拓扑连接完成 🌲',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '对数级深度验证',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">树高上界</span>',
            detailLines: [
              '│  ① 连通块每层至少折半：S_{k+1} ≤ S_k / 2',
              '│  ② 点分重构树最大深度严格满足 depth ≤ ⌈log₂ N⌉',
            ],
            fillLine: '└── 树高严格控制在 O(log N) 理论上界 🏆',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】动态修改向上跳链与路径容斥查询 (Dynamic Update & Query via Ancestor Chain)',
        subtitle: '单点修改沿点分树祖先链跳跃更新；路径查询通过容斥原理消除子树重合',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '祖先链跳跃修改',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">跳链修改</span>',
            detailLines: [
              '│  ① 从修改点 u 出发：cur = u; while(cur != null) { update(cur); cur = parentCTree[cur]; }',
              '│  ② 仅需遍历 O(log N) 个祖先节点，每次在数据结构中修改耗时 O(log N)',
            ],
            fillLine: '└── 单点动态修改严格耗时 O(log² N) 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '路径聚合与容斥查询',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">容斥查询</span>',
            detailLines: [
              '│  ① 查询以祖先 cur 为重心的有效路径总和',
              '│  ② 扣除来自相同子分治树的重复贡献（容斥消除同一分支内的非法路径）',
            ],
            fillLine: '└── 树上全局路径查询严格耗时 O(log² N) ✅',
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
