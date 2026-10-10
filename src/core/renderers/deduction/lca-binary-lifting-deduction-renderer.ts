/**
 * 最近公共祖先 LCA (Binary Lifting LCA · 洛谷 P3379) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：深度对齐 depth[u] == depth[v]、二进制倍增同步上跳 up[u][i] != up[v][i]、O(log N) 极速查询
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LCABinaryLiftingDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'lca-binary-lifting';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'lca-binary-lifting' ||
      modelId === 'lca' ||
      modelId === 'binary-lifting-lca' ||
      modelId === 'tree-lca' ||
      modelId === 'P3379' ||
      modelId === 'class076'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '最近公共祖先与树上倍增 (LCA Binary Lifting · 洛谷 P3379) · 全景推演树',
      badge: '洛谷 P3379 / 左程云 class076 · 树深度记录 · 二进制倍增递推 up[u][i] · 深度对齐 · 同步跃升 · 树上两点距离 dist · 查询 O(log N)',
      descriptionHtml: `
        最近公共祖先（Lowest Common Ancestor, LCA）是树论中的核心基石问题，树上倍增算法（Binary Lifting）通过预处理二进制祖先表，支持 $O(\\log N)$ 极速在线查询。<br/>
        <b>三大核心推演支柱与阶段：</b><br/>
        ① <b>DFS 预处理深度与倍增表：</b> $depth[u] = depth[p] + 1$，$up[u][0] = p$，$up[u][i] = up[up[u][i-1]][i-1]$（向上跳 $2^i$ 步等价于先跳 $2^{i-1}$ 步再跳 $2^{i-1}$ 步）；<br/>
        ② <b>阶段一：深度对齐：</b> 设 $depth[u] \\ge depth[v]$，利用二进制拆分使较深的节点 $u$ 向上跃升直至 $depth[u] = depth[v]$。若此时 $u == v$，则 $u$ 本身即为 LCA；<br/>
        ③ <b>阶段二：同步倍增试跳：</b> 从大到小枚举步长幂次 $i$（如 $19 \\to 0$），若 $up[u][i] \\ne up[v][i]$，说明跳跃未跨越 LCA，则同步上跳 $u = up[u][i], v = up[v][i]$；若相等则说明已越过 LCA，放弃该步长；<br/>
        ④ <b>定格 LCA 与树上两点距离：</b> 试跳结束后，$u$ 和 $v$ 恰好停在 LCA 的两个不同直接子节点上，故 $LCA = up[u][0]$；两点间最短树上路径距离公式为 $dist(u, v) = depth[u] + depth[v] - 2 \\cdot depth[LCA]$。
      `,
      initialStateText: '输入树拓扑结构与待查询节点对 (u, v)，初始化 depth 数组与 up[N][21] 倍增跳转表。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '树拓扑与查询点对',
        valuesStr: '节点 1..n 出边邻接表就绪，待查询节点对 (u, v)',
      },
      {
        prefix: '├───',
        label: '根节点初始基底',
        valuesStr: 'depth[root] = 1, up[root][0..20] = 0 (虚空祖先)',
      },
      {
        prefix: '└───',
        label: '二进制倍增跳转表规模',
        valuesStr: 'up[N][21]，空间复杂度 O(N log N)，幂次跨度 2^0 到 2^20',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】DFS 预处理深度与倍增跳转表 (Pre-DFS & Binary Ancestor Matrix)',
        subtitle: 'DFS 遍历整棵树，递归记录节点深度，并利用状态转移方程递推填入倍增祖先',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '深度计算与直系父节点确立',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">DFS 深度</span>',
            detailLines: [
              '│  ① 记录当前节点深度：depth[u] = depth[p] + 1',
              '│  ② 记录直系父亲（向上跳 2^0=1 步）：up[u][0] = p',
            ],
            fillLine: '└── 节点深度与第 1 层祖先确立 📏',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '二进制状态转移方程递推',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">倍增递推</span>',
            detailLines: [
              '│  ① 递推公式：up[u][i] = up[up[u][i-1]][i-1]',
              '│  ② 向上跳 2^i 步拆解为两段连续的 2^(i-1) 步跳转',
            ],
            fillLine: '└── 全树倍增跳转表预处理完成 🚀',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】查询阶段一：深度对齐跃升 (Depth Alignment Leap)',
        subtitle: '保证 depth[u] >= depth[v]，利用二进制步长将较深节点 u 上跳至与 v 同层',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '深度差二进制分解跃升',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">深度对齐</span>',
            detailLines: [
              '│  ① 从大到小枚举 i：if (depth[u] - (1 << i) >= depth[v]) u = up[u][i]',
              '│  ② 贪心快速消除深度差，直至两点深度严格相等',
            ],
            fillLine: '└── u 与 v 达到相同深度 depth[u] == depth[v] 🪜',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '同节点祖先特判',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">直系祖先判定</span>',
            detailLines: [
              '│  ① 检查是否 u == v：若对齐后重合，说明较浅点 v 本身即为 LCA',
              '│  ② 命中则无需进入第二阶段，直接返回当前节点作为答案',
            ],
            fillLine: '└── 直系祖先情况判定完毕 🎯',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】查询阶段二：二进制同步跃升 (Synchronous Binary Jumping)',
        subtitle: '两点深度相同但处于不同子树分支，由大到小枚举步长同步上跳，逼近 LCA 正下方',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '同步向上跃升逼近',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">同步试跳</span>',
            detailLines: [
              '│  ① 从大到小枚举 i：if (up[u][i] != up[v][i]) { u = up[u][i]; v = up[v][i]; }',
              '│  ② 祖先不同说明未跨过 LCA，放心执行同步跃升',
            ],
            fillLine: '└── 双指针同步向上逼近 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '跨越 LCA 避让判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">跨越避让</span>',
            detailLines: [
              '│  ① 若 up[u][i] == up[v][i]，说明跳 2^i 步已跨过 LCA',
              '│  ② 为避免越过真实 LCA，保持当前位置放弃本次跃升',
            ],
            fillLine: '└── 最终精准停在 LCA 正下方两个直接子节点 👑',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】结果锁定与树上最短距离结算 (LCA Retrieval & Distance Computation)',
        subtitle: '锁定 LCA = up[u][0]，并根据树深度差公式计算两点最短距离',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'LCA 结果锁定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">LCA 定格</span>',
            detailLines: [
              '│  ① u 与 v 位于 LCA 正下方，其共同父节点 up[u][0] 即为所求 LCA',
              '│  ② 耗时仅 O(log N)，倍增上跳完毕',
            ],
            fillLine: '└── 最近公共祖先 LCA 锁定 👑',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '树上两点最短距离计算',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">距离计算</span>',
            detailLines: [
              '│  ① 距离公式：dist(u, v) = depth[u] + depth[v] - 2 * depth[LCA]',
              '│  ② 利用预处理深度在 O(1) 内直接求出树上任意两点路径长度',
            ],
            fillLine: '└── 树上最短路径长度结算达成 🏆',
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
