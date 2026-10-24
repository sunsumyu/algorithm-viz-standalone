/**
 * 所有可能的路径 (LC 797) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * DAG 深度优先回溯搜索 · 解空间树分支展开与路径栈现场恢复
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ReachablePathsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'reachable-paths';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'reachable-paths' ||
      modelId === '797' ||
      modelId === 'all-paths-source-target' ||
      modelId === 'allPathsSourceTarget'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '所有可能的路径 (LC 797) · 全景推演树',
      badge: '有向无环图 (DAG) · 回溯解空间树遍历 · 路径栈压栈与弹出 · O(2^V × V) 完备搜索',
      descriptionHtml: `
        问题本质：在有向无环图 $G = (V, E)$ 中，枚举所有从源点 $0$ 到目标终点 $n - 1$ 的简单有效路径。<br/>
        <b>DAG 深度优先回溯与现场恢复机制：</b><br/>
        ① <b>DAG 天然无环性优势：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;由于图中不存在任何有向环，DFS 沿出边遍历绝不会发生死循环；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;因此无需全局 <code>visited</code> 标记集合，允许多条不同路径途经同一中间节点！<br/>
        ② <b>路径栈回溯 (Backtracking)：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;维护单调路径栈 <code>path = [0]</code>；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;深入探测邻居：<code>path.push(next)</code> 并递归 <code>dfs(next)</code>；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;探测结束后必须执行对称的 <code>path.pop()</code> 恢复现场，回退到当前节点尝试其他分支；<br/>
        ③ <b>基底判定与解集收集：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;当 <code>node === n - 1</code> 时，命中目标终点，将当前栈快照 <code>[...path]</code> 压入全局解集 <code>res</code> 并立即返回。
      `,
      initialStateText: '载入 4 节点 DAG：[[1,2], [3], [3], []]，起点 0，终点 3，初始路径栈 [0]。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '拓扑邻接表',
        valuesStr: '0: [1, 2], 1: [3], 2: [3], 3: []',
      },
      {
        prefix: '├───',
        label: '源点与终点',
        valuesStr: 'source = 0, target = 3',
      },
      {
        prefix: '└───',
        label: '探索目标',
        valuesStr: '遍历整棵决策树，收集所有以 0 开头、3 结尾的连通路径',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】源点初始化与分支一 (0 ➔ 1) 递归深入',
        subtitle: '从根节点 0 出发，优先探索第一条出边邻居 1',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '源点入栈启动',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">根节点入栈</span>',
            detailLines: [
              '│  ① path = [0], dfs(0) 启动',
              '│  ② 节点 0 出边邻居: [1, 2]',
            ],
            fillLine: '└── 准备深入邻居 1',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '深入节点 1 并触达终点 3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">首条路径达成</span>',
            detailLines: [
              '│  ① path.push(1) ➔ path = [0, 1]，深入 dfs(1)',
              '│  ② 节点 1 仅有邻居 3 ➔ path.push(3) ➔ path = [0, 1, 3]',
              '│  ③ 命中基底 3 === target，收集路径 #1: [0, 1, 3] 🎯',
            ],
            fillLine: '└── 首条完整路径收集完毕',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】回溯现场恢复 (Backtrack) 与分支切换',
        subtitle: '节点 3 返回后弹出恢复现场，回溯至节点 0 尝试次级出边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '从节点 3 回溯至节点 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">回溯弹出</span>',
            detailLines: [
              '│  ① path.pop() 弹出 3 ➔ path 恢复为 [0, 1]',
              '│  ② 节点 1 遍历完毕，再次 path.pop() 弹出 1 ➔ path 恢复为 [0]',
            ],
            fillLine: '└── 现场已完全恢复为根状态 [0]',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '切换至分支二: 深入节点 2 并触达终点 3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">第二路径达成</span>',
            detailLines: [
              '│  ① path.push(2) ➔ path = [0, 2]，深入 dfs(2)',
              '│  ② 节点 2 仅有邻居 3 ➔ path.push(3) ➔ path = [0, 2, 3]',
              '│  ③ 命中基底 3 === target，收集路径 #2: [0, 2, 3] 🎯',
            ],
            fillLine: '└── 第二条完整路径收集完毕',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】全遍历结算与复杂度收敛',
        subtitle: '完成所有回溯返回，生成完整路径方案集',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '全解集输出与性能审计',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">全解输出</span>',
            detailLines: [
              '│  ① 最终收集路径数: 2 条',
              '│  ② 方案集合: [[0, 1, 3], [0, 2, 3]]',
              '│  ③ 时间复杂度: O(2^V × V)，解空间树叶节点最优枚举',
              '│  ④ 空间复杂度: O(V)，递归栈深最多 V 层',
            ],
            fillLine: '└── 所有可能路径搜索圆满完成 🎉',
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
