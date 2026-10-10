/**
 * 虚树与树形 DP (Virtual Tree · 洛谷 P2495) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：关键点 DFN 序排序、单调栈维护最右链、极浅 LCA 插入、规模浓缩至 O(K) 极速 DP
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class VirtualTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'virtual-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'virtual-tree' ||
      modelId === 'auxiliary-tree' ||
      modelId === 'vtree' ||
      modelId === 'P2495' ||
      modelId === 'SDOI2011' ||
      modelId === 'class073'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '虚树与关键点浓缩 (Virtual Tree · 洛谷 P2495) · 全景推演树',
      badge: '洛谷 P2495 / 左程云 class073 · DFN 时间戳排序 · 单调栈维护最右链 · 极浅 LCA 插入 · 规模压缩至 O(K) · 极速树形 DP',
      descriptionHtml: `
        在树形 DP 题目中，经常面对多组询问，每次只给出树上的少量关键点（$\\sum K \\le 5 \\times 10^5$），原树规模巨大。虚树（Auxiliary Tree）只保留关键点及其两两之间的 LCA，将树规模压缩至不超过 $2K$ 个节点。<br/>
        <b>虚树三大核心定理与推演支柱：</b><br/>
        ① <b>关键点 DFN 排序：</b>按 DFS 时间戳 $\\text{dfn}$ 升序排序所有关键点，保证遍历顺序与原树的先序遍历完全一致；<br/>
        ② <b>单调栈维护最右链：</b>使用单调栈维护当前虚树上的一条自根向下的链。加入新关键点 $u$ 时，求 $u$ 与栈顶的 $\\text{LCA}$。若 $\\text{LCA}$ 不在栈顶，通过循环弹栈并连边，将已完成的分支收束，并将 $\\text{LCA}$ 和 $u$ 压入栈中；<br/>
        ③ <b>极速树形 DP 求解：</b>在节点总数不超过 $2K$ 的浓缩虚树上运行树形 DP（如消耗战最小割阻断代价），时间复杂度从每次 $O(N)$ 暴降为 $O(K \\log N)$，彻底破除 TLE 瓶颈。
      `,
      initialStateText: '预处理原树 DFS 时间戳与倍增 LCA 数组，输入多组询问的关键点集合，准备单调栈浓缩构建虚树。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '原树拓扑与关键点',
        valuesStr: '大图节点 1..n，单次询问只涉及 k 个关键点，需剥离无关冗余分支',
      },
      {
        prefix: '├───',
        label: '单调栈初始状态',
        valuesStr: 'stk = [1]，保证原树根节点 1 始终作为虚树根节点存在',
      },
      {
        prefix: '└───',
        label: '虚树规模上界定理',
        valuesStr: 'k 个关键点至多产生 k-1 个两两互异的非根 LCA，虚树总节点数严格 <= 2k',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】原树预处理与关键点 DFN 序排序 (Pre-DFS & Key Nodes Sorting)',
        subtitle: '预处理整棵原树的 DFS 时间戳 dfn 与倍增 LCA 表，对当前询问的关键点升序排序',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '全局 DFS 预处理',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">DFS 预处理</span>',
            detailLines: [
              '│  ① 遍历原树：分配 dfn[u] = ++dfnClock 与 depth[u] = d',
              '│  ② 倍增预处理祖先表 up[u][19]，支持 O(log N) 快速 LCA 查询',
            ],
            fillLine: '└── 原树时空索引拓扑就绪 ⏱️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '关键点按 DFN 序排序',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">DFN 排序</span>',
            detailLines: [
              '│  ① 对关键点集合执行 keyNodes.sort((a, b) -> dfn[a] - dfn[b])',
              '│  ② 保证单调栈加入节点时沿树的“左先右后”顺序规整推进',
            ],
            fillLine: '└── 关键点遍历流规整完毕 🔤',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】单调栈最右链维护与 LCA 虚树构建 (Monotonic Stack & Virtual Edge Linking)',
        subtitle: '利用单调栈维护当前最右链，通过判定 LCA 深度完成旧支路回溯弹栈与新分支插入',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'LCA 关系探测与弹栈收束',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">LCA 判定</span>',
            detailLines: [
              '│  ① 计算当前点 u 与栈顶 top 的公共祖先 lca = getLCA(u, top)',
              '│  ② 若 lca != top，循环弹出 depth[stk[次顶]] >= depth[lca] 的节点并连接虚树边',
            ],
            fillLine: '└── 左侧完整子分支收束连边 🪜',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '插入 LCA 与关键点入栈',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">关键点压栈</span>',
            detailLines: [
              '│  ① 若 lca 尚未在栈中，将 lca 插入虚树连边并压入栈顶',
              '│  ② 将当前关键点 u 压入单调栈，延续成为新的最右链',
            ],
            fillLine: '└── 虚树骨架严密衔接，多余中间点彻底剪枝 🌲',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】O(K) 浓缩骨架上的极速树形 DP 求解 (Subtree DP on Condensed Auxiliary Tree)',
        subtitle: '清空单调栈残留连边形成最终虚树，在 O(K) 节点上运行经典树形 DP',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '单调栈收尾连边',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">最终收尾</span>',
            detailLines: [
              '│  ① 遍历结束后，将栈中剩余节点自顶向下逐层弹出并连边',
              '│  ② 虚树构建全流程宣告结束，总节点规模不超过 2k',
            ],
            fillLine: '└── 虚树拓扑完全成型 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '虚树树形 DP 极速出解',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">O(K) DP</span>',
            detailLines: [
              '│  ① 在虚树上自底向上进行树形 DP：dp[u] = sum(min(w, dp[v]))',
              '│  ② 运算耗时仅与关键点数量 k 线性相关，杜绝全树遍历 TLE',
            ],
            fillLine: '└── 最小阻断代价计算达成，虚树大一统推演圆满闭环 🏆',
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
