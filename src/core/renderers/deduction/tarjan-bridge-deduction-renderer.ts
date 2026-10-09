/**
 * Tarjan 无向图割点与割边 (Cut Vertices & Bridges · 洛谷 P3388) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：DFS 时间戳 dfn、追溯值 low、割点定理 low[v] >= dfn[u]、桥边定理 low[v] > dfn[u]
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TarjanBridgeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tarjan-bridge';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tarjan-bridge' ||
      modelId === 'tarjan-bridge-cut' ||
      modelId === 'class068-code01' ||
      modelId === 'P3388' ||
      modelId === 'leetcode-1192'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: 'Tarjan 割点与桥 (Cut Vertices & Bridges) · 全景推演树',
      badge: '洛谷 P3388 / LeetCode 1192 · DFS 生成树 · 割点判定 (low[v] ≥ dfn[u]) · 桥判定 (low[v] > dfn[u])',
      descriptionHtml: `
        以 5 节点经典环桥图为例：顶点集 $\\{1, 2, 3, 4, 5\\}$，无向边集 $[(1,2), (2,3), (3,1), (3,4), (4,5)]$。<br/>
        算法推演四大核心阶段：<br/>
        ① <b>深度优先生成树与时间戳分配：</b>DFS 遍历为每个节点分配递增时间戳 $dfn[u]$，初始置追溯值 $low[u] = dfn[u]$；<br/>
        ② <b>返祖回边环路与追溯值更新：</b>遇到已访问祖先节点（且非直接父边），确认存在返祖回边形成环路，更新 $low[u] = \\min(low[u], dfn[v])$；<br/>
        ③ <b>割边（桥）判定定理：</b>当树边子节点 $v$ 满足 $low[v] > dfn[u]$ 时，说明子树 $v$ 无法绕过 $u$ 触达任何更早祖先，无向边 $(u, v)$ 必为桥；<br/>
        ④ <b>割点判定定理：</b>非根节点若存在子节点满足 $low[v] \\ge dfn[u]$，则 $u$ 为割点；根节点若在 DFS 树中拥有 $\\ge 2$ 个独立子树分支，则根节点亦为割点。
      `,
      initialStateText: '初始化 5 个顶点的时间戳 dfn 与追溯值 low 为 0，割点与桥列表为空，准备从节点 1 启动 Tarjan DFS。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '原图无向拓扑结构',
        valuesStr: 'V = {1, 2, 3, 4, 5}, E = {(1-2), (2-3), (3-1), (3-4), (4-5)}',
      },
      {
        prefix: '├───',
        label: '初始时间戳与追溯值',
        valuesStr: 'dfn = [0, 0, 0, 0, 0, 0], low = [0, 0, 0, 0, 0, 0]',
      },
      {
        prefix: '└───',
        label: '初始判定结果集',
        valuesStr: 'isCut = [F, F, F, F, F, F], bridges = [], timer = 0',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】DFS 树枝深入与时间戳记录 (Tree Edge Traversal)',
        subtitle: '沿未访问邻居深入，记录访问时间戳 dfn，并维护 DFS 树上的父子依赖关系',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '深入根节点 1 (father = 0)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dfn=1</span>',
            detailLines: [
              '│  ① 盖时间戳: timer++=1, dfn[1]=low[1]=1',
              '│  ② 子树计数: children=0',
            ],
            fillLine: '└── 根节点 1 进入 DFS 生成树态 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沿树边 (1 ➔ 2) 深入节点 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dfn=2</span>',
            detailLines: [
              '│  ① 根节点 1 的分支计数 children++ (=1)',
              '│  ② 递归进入节点 2: dfn[2]=low[2]=2',
            ],
            fillLine: '└── 节点 2 进入探索态 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '沿树边 (2 ➔ 3) 深入节点 3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dfn=3</span>',
            detailLines: [
              '│  ① 跳过父边 (2➔1)',
              '│  ② 递归进入节点 3: dfn[3]=low[3]=3',
            ],
            fillLine: '└── 节点 3 进入探索态 📍',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】返祖回边环路与右侧悬挂链深入 (Back Edge & Chain)',
        subtitle: '节点 3 发现返祖回边 (3-1) 更新追溯值，随后沿桥边 (3-4) 深入右侧链',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '返祖回边 (3 ➔ 1) 闭环更新',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">low[3]➔1</span>',
            detailLines: [
              '│  ① 邻居 1 已访问 (dfn[1]=1) 且非父节点 (1 ≠ father 2)',
              '│  ② 更新追溯值: low[3] = min(low[3], dfn[1]) = min(3, 1) = 1',
            ],
            fillLine: '└── 环路 {1, 2, 3} 追溯值成功连回源点 1 ⚡',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沿树边 (3 ➔ 4) 深入节点 4',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dfn=4</span>',
            detailLines: [
              '│  ① dfn[4]=0，递归调用: timer++=4, dfn[4]=low[4]=4',
            ],
            fillLine: '└── 节点 4 进入探索态 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '沿树边 (4 ➔ 5) 深入叶节点 5',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dfn=5</span>',
            detailLines: [
              '│  ① dfn[5]=0，递归调用: timer++=5, dfn[5]=low[5]=5',
              '│  ② 节点 5 邻居仅有父节点 4，出边扫描完毕准备回溯',
            ],
            fillLine: '└── 链末梢叶节点 5 到达尽头 📍',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】叶节点回溯与首条桥边割点判定 (Leaf Bridge & Cut)',
        subtitle: '节点 5 回溯至节点 4，触发桥与割点判定条件',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '节点 5 回溯至节点 4，更新 low[4]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">回溯回传</span>',
            detailLines: [
              '│  ① 更新 low[4] = min(low[4], low[5]) = min(4, 5) = 4',
            ],
            fillLine: '└── low[4] 保持为 4 🔄',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '割边（桥）判定: 边 (4, 5)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">桥边 4-5</span>',
            detailLines: [
              '│  ① 检验条件: low[5] > dfn[4] ➔ (5 > 4) 严格大于成立！',
              '│  ② 判定结论: 移除边 (4, 5) 将导致节点 5 孤立，边 (4, 5) 是桥边！',
            ],
            fillLine: '└── 发现首条桥边: (4, 5) 🌉',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '割点判定: 节点 4',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">割点 4</span>',
            detailLines: [
              '│  ① 检验条件: father 3 ≠ 0 且 low[5] >= dfn[4] ➔ (5 >= 4) 成立！',
              '│  ② 判定结论: isCut[4] = true，移除节点 4 将导致图分裂！',
            ],
            fillLine: '└── 确认割点: 节点 4 🚩',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】回溯至节点 3 与根节点割点检验 (Second Bridge & Root Cut)',
        subtitle: '节点 4 回溯至节点 3 发现第二条桥，整图回溯完成',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '节点 4 回溯至节点 3，割边与割点判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">桥边 3-4</span>',
            detailLines: [
              '│  ① low[4]=4 > dfn[3]=3 成立 ➔ 边 (3, 4) 是桥边！',
              '│  ② father 2 ≠ 0 且 low[4] >= dfn[3] (4 >= 3) 成立 ➔ 节点 3 是割点！',
            ],
            fillLine: '└── 确认第二条桥边 (3, 4) 与割点 3 🚩',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '回溯至根节点 1，根割点检验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">根非割点</span>',
            detailLines: [
              '│  ① 节点 2 回溯更新 low[2]=min(2, low[3])=1',
              '│  ② 根节点 1 检验: father == 0, children == 1 < 2，非割点',
            ],
            fillLine: '└── 根节点 1 仅有 1 棵子树，不属于割点 ✅',
          }),
        ].join(''),
      }),
    ];

    return [header, baseCase, ...rounds].join('\n');
  }
}
