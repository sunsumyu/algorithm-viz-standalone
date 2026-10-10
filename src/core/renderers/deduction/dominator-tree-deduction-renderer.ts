/**
 * DAG 支配树 (Dominator Tree · 洛谷 P2597 / 编译原理 SSA) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：DAG 拓扑排序、前驱在支配树上的最近公共祖先 LCA 汇聚定理、唯一直接支配点 idom 确立与树形倍增更新
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DominatorTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'dominator-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'dominator-tree' ||
      modelId === 'dominator-tree-dag' ||
      modelId === 'dag-dominator-tree' ||
      modelId === 'P2597' ||
      modelId === 'P5180'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: 'DAG 支配树 (Dominator Tree) · 全景推演树',
      badge: '洛谷 P2597 / 编译原理 SSA 控制流分析 · DAG 拓扑排序 · 前驱 LCA 汇聚定理 · idom 唯一直接支配点 · 支配树倍增构建',
      descriptionHtml: `
        在有向图流图中，若从源点到节点 $w$ 的所有可能路径均必经节点 $d$，则称 $d$ <b>支配</b> $w$。<br/>
        <b>DAG 支配树三大核心定理：</b><br/>
        ① <b>唯一直接支配点定理 (idom)：</b>除源点外，每个可达节点存在唯一的直接支配点 $\\text{idom}[u]$，所有支配边构成一棵以源点为根的支配树；<br/>
        ② <b>前驱支配树 LCA 汇聚定理：</b>在 DAG 上，节点 $u$ 的直接支配点等于其所有直接前驱节点在支配树上的最近公共祖先：$$\\text{idom}[u] = \\text{LCA}_{\\text{DomTree}}(\\text{pred}_1, \\text{pred}_2, \\dots, \\text{pred}_k)$$；<br/>
        ③ <b>拓扑递推安全性：</b>由于 DAG 满足拓扑偏序，当节点 $u$ 的入度减为 0 出队时，其所有前驱必定已完成支配点求解并已加入支配树中，从而支持在线增量倍增 LCA。
      `,
      initialStateText: '初始化原图 DAG 节点与有向边，统计各节点入度与反向邻接表，准备启动拓扑自顶向下递推。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '原图节点与根节点',
        valuesStr: '节点 1..n，源点 root = 1，要求构建以 1 为根的全局支配树',
      },
      {
        prefix: '├───',
        label: '支配关系拓扑定义',
        valuesStr: '任意路径必经性：Path(root ➔ w) 必定包含 d ⟺ d dom w',
      },
      {
        prefix: '└───',
        label: '状态数组初始化',
        valuesStr: 'inDegree = [0..0]，depth[root] = 1，idom = [null..null]，up[u][i] 倍增表分配完毕',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】原图加边与入度统计 (Graph Ingestion & In-degree)',
        subtitle: '记录正向出边、反向依赖前驱，并统计各节点入度',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '正向与反向邻接表同步维护',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">边表录入</span>',
            detailLines: [
              '│  ① 读入原图有向边 (u ➔ v)，正向邻接表记录 adj[u].add(v)',
              '│  ② 反向邻接表记录 revAdj[v].add(u)，用于后续汇聚前驱节点',
            ],
            fillLine: '└── 双向图拓扑结构建立就绪 📐',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '节点入度累计与零入度识别',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">入度统计</span>',
            detailLines: [
              '│  ① 终点入度累加 inDegree[v]++',
              '│  ② 确认根节点入度为 0，作为拓扑遍历唯一起始源头',
            ],
            fillLine: '└── 拓扑入度准备完毕，确立拓扑起点 👑',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】拓扑排序推进与前驱 LCA 汇聚 (Topological Processing & LCA)',
        subtitle: '按拓扑序依次出队，在已建支配树上求所有前驱的公共祖先 LCA',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '队首出队与多前驱集合获取',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">拓扑出队</span>',
            detailLines: [
              '│  ① 拓扑队列弹出节点 u，获取其直接前驱集合 { pred_1, pred_2, ... }',
              '│  ② 拓扑性质确保：所有前驱在支配树中的位置已完全固化且可查',
            ],
            fillLine: '└── 前驱就绪，具备求 LCA 的严密前置条件 🔍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '在支配树上迭代求解前驱 LCA',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">LCA 汇聚</span>',
            detailLines: [
              '│  ① 初始化 pLCA = pred_1',
              '│  ② 遍历其余前驱：pLCA = getLCA(pLCA, pred_i)，收敛至公共必经节点',
            ],
            fillLine: '└── 前驱汇聚完成，收敛至唯一直系支配祖先 ⚖️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】确立直接支配点与倍增祖先更新 (idom Assignment & Binary Lifting)',
        subtitle: '确立 idom[u] = pLCA，连支配树边，更新 depth 与 2^k 倍增祖先',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '确立直接支配点并连支配树边',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">支配树连边</span>',
            detailLines: [
              '│  ① 记录 idom[u] = pLCA',
              '│  ② 支配树中连接有向父子边：pLCA ➔ u',
            ],
            fillLine: '└── 支配树结构扩张，确立树形拓扑关系 🌳',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '深度更新与倍增跳转表维护',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">倍增更新</span>',
            detailLines: [
              '│  ① depth[u] = depth[pLCA] + 1',
              '│  ② 递推更新倍增表：up[u][i] = up[up[u][i-1]][i-1] (O(log V) 转移)',
            ],
            fillLine: '└── 倍增祖先表更新完成，支持后续 O(log V) 极速 LCA 🚀',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】后继入度递减与支配终局验证 (Successor Decrement & Final Verification)',
        subtitle: '释放后继节点入度，拓扑归零者入队，最终达成支配树全收敛',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '后继节点入度递减与拓扑入队',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">入度削减</span>',
            detailLines: [
              '│  ① 遍历 u 的所有后继 v，执行 inDegree[v]--',
              '│  ② 若 inDegree[v] == 0，说明所有前驱均已处理完毕，v 压入队列',
            ],
            fillLine: '└── 拓扑流水线持续推进，无缝闭环 📥',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '支配树构建终局与工业应用',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-green-100 text-green-800 rounded font-bold">终局收敛</span>',
            detailLines: [
              '│  ① 全图节点直接支配点全部唯一定位',
              '│  ② 支配树直接应用于编译器 SSA 支配边界计算与控制流依赖分析',
            ],
            fillLine: '└── DAG 支配树推演圆满完成 🎉',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="p-4 space-y-4 font-mono text-xs text-slate-200">
        ${header}
        ${baseCase}
        ${rounds.join('')}
      </div>
    `;
  }
}
