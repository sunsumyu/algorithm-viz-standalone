/**
 * 有向图强连通性检测 (Kosaraju 双 DFS) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 正向全可达 + 反向全逆流 = 全图强连通充要判定
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class StronglyConnectedDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'strongly-connected';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'strongly-connected' ||
      modelId === 'strongly-connected-components' ||
      modelId === 'kosaraju' ||
      modelId === 'scc'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '有向图强连通性检测 (Kosaraju 双向 DFS) · 全景推演树',
      badge: '有向图强连通 · Kosaraju 算法 · 正向可达全集 · 反向图逆流溯源 · O(V+E) 线性最优',
      descriptionHtml: `
        强连通图严格定义：有向图 $G=(V, E)$ 中，任意两顶点 $u, v$ 之间均存在路径 $u \\to v$ 且存在路径 $v \\to u$。<br/>
        <b>Kosaraju 线性时间双向 DFS 判定机制：</b><br/>
        ① <b>基准源点正向辐射：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;选取任意基准顶点（如顶点 $0$），在原图 $G$ 上执行一次 DFS；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;若存在未访问顶点，说明顶点 $0$ 无法到达某些顶点，该图直接判定为非强连通；<br/>
        ② <b>反向图逆流溯源：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将原图 $G$ 的所有有向边反转 $(u \\to v \\implies v \\to u)$ 构造反向图 $G^R$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;在 $G^R$ 上从同一基准顶点 $0$ 执行第二次 DFS。在反向图上从 $0$ 可达 $u$，在原图上恰好等价于从 $u$ 可到达 $0$！<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;若反向 DFS 亦能遍历所有顶点，说明原图中所有顶点均可到达 $0$；<br/>
        ③ <b>双向互通充要性结论：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;两次 DFS 遍历全部顶点的充要条件：对任意顶点 $u$，均有 $0 \\to u$ 且 $u \\to 0$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;由路径传递性，对图中任意两个顶点 $u$ 与 $v$，存在通路 $u \\to 0 \\to v$ 与 $v \\to 0 \\to u$。<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;因此，全图必然强连通！时间复杂度严格为 $O(V + E)$！
      `,
      initialStateText: '载入顶点数 V = 4，有向边环 [0->1, 1->2, 2->3, 3->0]，准备从节点 0 启动正向 DFS。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点与边集',
        valuesStr: 'V = 4 (0..3), E = [0->1, 1->2, 2->3, 3->0]',
      },
      {
        prefix: '├───',
        label: '基准源点',
        valuesStr: 'source = 0',
      },
      {
        prefix: '└───',
        label: '目标判定',
        valuesStr: '验证图中是否任意两点均相互可达 (全源强连通)',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】基准源点正向 DFS 遍历 (Forward Reachability)',
        subtitle: '从节点 0 出发沿有向边深度优先探测，检验 0 能否到达图中所有其它节点',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '访问链: 0 ➔ 1 ➔ 2 ➔ 3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">正向链式遍历</span>',
            detailLines: [
              '│  ① 从 0 出发访问 1，从 1 出发访问 2，从 2 出发访问 3',
              '│  ② 正向访问集合: visitedForward = {0, 1, 2, 3}',
            ],
            fillLine: '└── visitedForward.size === 4，正向全达达成！ 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '正向全达性结论',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">0 可达全集</span>',
            detailLines: [
              '│  ① 节点 0 能够到达图中全部 4 个顶点',
              '│  ② 满足强连通必要条件之一，准备进入反向图验证',
            ],
            fillLine: '└── 正向阶段通过，未触发提前失败 🚀',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】构建反向图 G^R (Edge Reversal)',
        subtitle: '将原图中的所有有向边方向逆转，使得反向图的可达性等价于原图中的可溯源性',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '边向翻转映射',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">图反转</span>',
            detailLines: [
              '│  ① 原边 [0->1, 1->2, 2->3, 3->0]',
              '│  ② 翻转为 [1->0, 2->1, 3->2, 0->3]',
              '│  ③ 物理等价: 在 G^R 中 0 能到 u ⟺ 在 G 中 u 能到 0',
            ],
            fillLine: '└── 反向图构建完毕，准备逆流溯源 🔄',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】反向图逆流 DFS 遍历与强连通性终态判定',
        subtitle: '在反向图上再次从节点 0 出发遍历，检验全图是否所有节点均能到达 0',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '反向访问链: 0 ➔ 3 ➔ 2 ➔ 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">反向链式遍历</span>',
            detailLines: [
              '│  ① 从 0 出发沿反向边访问 3，再访问 2，再访问 1',
              '│  ② 反向访问集合: visitedReverse = {0, 3, 2, 1}',
            ],
            fillLine: '└── visitedReverse.size === 4，反向全达达成！ 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '双向互通与强连通性终态结算',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">强连通成立</span>',
            detailLines: [
              '│  ① 0 可达所有点，且所有点可达 0',
              '│  ② 对任意点对 (u, v): u -> 0 -> v 双向必通',
              '│  ③ 时间复杂度: 2 × O(V + E) = O(V + E)，线性极速',
            ],
            fillLine: '└── 该有向图严格为强连通图 (返回 true) 🎉',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="deduction-board" style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${header}
        ${baseCase}
        ${rounds.join('\n')}
      </div>
    `;
  }
}
