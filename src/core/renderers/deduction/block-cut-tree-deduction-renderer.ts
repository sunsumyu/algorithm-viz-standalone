/**
 * 广义圆方树 (Block-Cut Tree · 洛谷 P4320 / P4630) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：点双连通分量 (v-BCC) 识别、圆方相间连边成树、原图两点间所有简单路径与树上路径圆点等价定理
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BlockCutTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'block-cut-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'block-cut-tree' ||
      modelId === 'bct' ||
      modelId === 'round-square-tree' ||
      modelId === 'P4320' ||
      modelId === 'P4630' ||
      modelId === 'P5236'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '广义圆方树 (Block-Cut Tree · 洛谷 P4320 / P4630) · 全景推演树',
      badge: '洛谷 P4320 / P4630 · 点双连通分量 (v-BCC) 缩点 · 圆方相间成树 · 树上必经割点定理',
      descriptionHtml: `
        无向图包含复杂环路与割点，圆方树通过点双连通分量 (v-BCC) 缩点将其转化为树形结构。<br/>
        <b>圆方树三大核心定理与推演支柱：</b><br/>
        ① <b>圆点与方点二分映射：</b>原图所有点映射为圆点，每个极大点双连通分量映射为一个方点。每个点双内的所有圆点向对应方点连边，形成无环且圆方严格相间的二分树；<br/>
        ② <b>割点判定与弹栈缩点：</b>在 Tarjan DFS 树中，当且仅当子节点 $v$ 满足 $\\text{low}[v] \\ge \\text{dfn}[u]$ 时，识别出一个以 $u$ 为根（若非根则 $u$ 为割点）的点双，栈顶到 $v$ 的所有节点与 $u$ 共同构成该点双；<br/>
        ③ <b>路径必经割点定理：</b>原图中任意两点 $u, v$ 间所有简单路径的并集，在圆方树上恰好映射为 $u$ 到 $v$ 唯一树上路径的所有圆点！求两点间必经割点转化为树上路径距离或 LCA 查询。
      `,
      initialStateText: '初始化原图顶点与边集，分配 dfn、low 与辅助栈，准备启动 Tarjan 点双连通分量缩点遍历。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '原图无向网络拓扑',
        valuesStr: '节点 1..n，包含环路与关键割点割边，需降维为二分树结构',
      },
      {
        prefix: '├───',
        label: 'Tarjan 状态分配',
        valuesStr: 'dfn = [0..0]，low = [0..0]，辅助栈 st = []，方点计数器 squareCnt = n',
      },
      {
        prefix: '└───',
        label: '圆方树目标形式',
        valuesStr: '圆点只能连方点，方点只能连圆点，无向图转化为严格无环树形拓扑',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】Tarjan 深度优先遍历与时间戳分配 (DFS Timestamp Discovery)',
        subtitle: 'DFS 遍历无向图，分配访问时间戳 dfn 并维护能够回溯的最小祖先 low',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '访问节点与入栈',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">DFS 探索</span>',
            detailLines: [
              '│  ① 首次访问节点 u：dfn[u] = low[u] = ++dfnCnt',
              '│  ② 将节点 u 压入点双候选辅助栈：st.push(u)',
            ],
            fillLine: '└── 节点压栈，等待探索所有邻接分支 ⏱️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '反向返祖边与回溯',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">追溯更新</span>',
            detailLines: [
              '│  ① 遇到已访问节点 v：low[u] = min(low[u], dfn[v])',
              '│  ② 子树遍历回溯：low[u] = min(low[u], low[child])',
            ],
            fillLine: '└── 连通分量回溯范围界定完成 📉',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】点双连通分量识别与方点连边 (v-BCC Identification & Square Linking)',
        subtitle: '判定 low[v] >= dfn[u] 割点条件，新建方点并弹栈连接点双内部圆点',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '点双边界充要判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">low[v] >= dfn[u]</span>',
            detailLines: [
              '│  ① 子节点 v 无法回溯到 u 的祖先，表明 u 与子树 v 构成独立点双分量',
              '│  ② 分配新方点 square = ++squareCnt 代表该点双',
            ],
            fillLine: '└── 极大点双分量边界精确锁定 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '弹栈圆方相间连边',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">圆方相间连边</span>',
            detailLines: [
              '│  ① 依次弹出栈顶节点 top 直至 top == v，连边 (top, square)',
              '│  ② 将割点 u 也与方点连边 (u, square)（割点属于多个点双）',
            ],
            fillLine: '└── 圆方树二分连边确立，割点天然成为连接不同方点的枢纽 🟩',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】树上必经割点定理转化与路径查询 (Path Theorem & Query Transformation)',
        subtitle: '原图简单路径集合等价映射至圆方树树上路径，降维打击仙人掌与一般图难题',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '必经割点等价定理',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">几何等价</span>',
            detailLines: [
              '│  ① 原图中 u 到 v 任意简单路径必经点 ⟺ 圆方树树上简单路径经过的圆点',
              '│  ② 排除端点 u 和 v 后，树上路径上的所有圆点即为必经割点',
            ],
            fillLine: '└── 复杂图论路径分析彻底转化为普通树上路径统计 ⚡',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '树链剖分与 LCA 倍增',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">LCA 极速查询</span>',
            detailLines: [
              '│  ① 在圆方树上预处理深度 depth 与 LCA 倍增表',
              '│  ② 两点间必经割点数 = (depth[u] + depth[v] - 2 * depth[lca]) / 2 - 1',
            ],
            fillLine: '└── 复杂度从 NP 难度直降为 O(log n)，圆方树构建圆满闭环 🏆',
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
