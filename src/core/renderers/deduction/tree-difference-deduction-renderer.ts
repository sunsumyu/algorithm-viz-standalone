/**
 * 树上差分 (Tree Difference · 洛谷 P3128 / P3258) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶树论: 点差分 (diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--) 与 边差分 (diff[u]++, diff[v]++, diff[lca]-=2)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeDifferenceDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-difference';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-difference' ||
      modelId === 'tree-diff' ||
      modelId === 'tree-difference-122' ||
      modelId === 'P3128' ||
      modelId === 'P3258' ||
      modelId === 'class122' ||
      modelId === 'class122-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '树上差分与子树前缀和 (Tree Difference · 洛谷 P3128 / P3258) · 全景推演树',
      badge: '洛谷 P3128 / P3258 / 左程云 class122 · 点差分与边差分 · 倍增 LCA 约束 · 自底向上后序前缀和 · 离线统计 O(N + M log N)',
      descriptionHtml: `
        树上差分是将一维差分数组的思想推广到树形拓扑上的高级算法，通过在树上端点及 LCA 处打常数个加减标记，再利用自底向上的子树求和（前缀和）在 $O(N)$ 复杂度内一次性还原所有节点或边的真实覆盖权值。<br/>
        <b>两大核心差分模式与标记定理：</b><br/>
        ① <b>树上点差分（将路径 $u \\to v$ 上所有节点权值 $+w$）：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;标记公式：$diff[u] += w$，$diff[v] += w$，$diff[LCA] -= w$，$diff[fa[LCA]] -= w$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;原理：子树和自底向上累加时，在 $u$ 与 $v$ 处各注入 $+w$，到达 $LCA$ 汇聚为 $+2w$，通过 $-w$ 使 $LCA$ 处净权值为 $+w$；在 $fa[LCA]$ 处再减 $w$ 彻底阻断权值溢出到更高层祖先；<br/>
        ② <b>树上边差分（将路径 $u \\to v$ 上所有树边权值 $+w$）：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;标记公式：$diff[u] += w$，$diff[v] += w$，$diff[LCA] -= 2w$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;原理：将边权下压到深度较深的子节点上；从 $u$ 和 $v$ 向上回溯到 $LCA$ 时，各覆盖一条链，两段链在 $LCA$ 处结束，故在 $LCA$ 处直接扣除 $2w$，完美消除对父边的影响；<br/>
        ③ <b>自底向上前缀和后序还原：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;后序遍历每个节点 $u$：$val[u] = diff[u] + \\sum_{v \\in son[u]} val[v]$，单次遍历全树完成所有点权/边权结算。
      `,
      initialStateText: '输入树拓扑结构与多次路径修改操作，初始化 depth 深度表、倍增 LCA 数组与 diff 差分标记桶。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '树拓扑与路径修改集',
        valuesStr: '节点 1..n，初始差分数组 diff[1..n] = 0，还原权值 val[1..n] = 0',
      },
      {
        prefix: '├───',
        label: '树深度与倍增 LCA 表',
        valuesStr: 'depth 数组与 up[N][21] 倍增跳转表就绪，支持 O(log N) 求公共祖先',
      },
      {
        prefix: '└───',
        label: '差分标记模式规约',
        valuesStr: '点差分 (4 端点打标) / 边差分 (3 端点打标)，消除冗余链上遍历',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】预处理深度与倍增 LCA (Pre-DFS & Binary Lifting LCA)',
        subtitle: 'DFS 预处理树深度与倍增祖先数组，为后续快速求解路径 LCA 建立时空索引',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '深度与父节点确立',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">DFS 深度</span>',
            detailLines: [
              '│  ① 记录节点深度：depth[u] = depth[p] + 1',
              '│  ② 记录直系父亲：up[u][0] = p',
            ],
            fillLine: '└── 节点深度与直系父指针确立 📏',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '倍增跳转表递推',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">倍增递推</span>',
            detailLines: [
              '│  ① 递推转移：up[u][i] = up[up[u][i-1]][i-1]',
              '│  ② 支持任意两点在 O(log N) 内查询最近公共祖先 LCA',
            ],
            fillLine: '└── 倍增 LCA 索引体系就绪 🚀',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】路径端点 LCA 判定与差分标记注入 (LCA Query & Difference Tagging)',
        subtitle: '查询路径 u 到 v 的 LCA，严格按照点差分或边差分端点公式打上加减标记',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '点差分标记注入',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">点差分标记</span>',
            detailLines: [
              '│  ① 端点注入：diff[u] += w, diff[v] += w',
              '│  ② LCA 抵消与截断：diff[lca] -= w, diff[fa[lca]] -= w',
            ],
            fillLine: '└── 点差分端点与截断标记注入完毕 ✏️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '边差分标记注入',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">边差分标记</span>',
            detailLines: [
              '│  ① 端点边权下压：diff[u] += w, diff[v] += w',
              '│  ② LCA 完全抵消：diff[lca] -= 2 * w',
            ],
            fillLine: '└── 边差分端点标记注入完毕 🏷️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】后序遍历自底向上前缀和还原 (Bottom-Up DFS Subtree Aggregation)',
        subtitle: '从根节点向下递归，在后序回溯时自底向上汇总子树和，还原各节点与边的真实覆盖权值',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '自身差分标记载入',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">载入标记</span>',
            detailLines: [
              '│  ① 初始权值：val[u] = diff[u]',
              '│  ② 将当前节点自身的打标值作为累加基底',
            ],
            fillLine: '└── 当前节点基底差分载入 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '子树前缀和后序汇总',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">子树累加</span>',
            detailLines: [
              '│  ① 遍历各子节点 v：val[u] += val[v]',
              '│  ② 自底向上后序合并所有子树贡献，求得最终路径覆盖总次数',
            ],
            fillLine: '└── 全树路径覆盖点权/边权完美还原 🏆',
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
