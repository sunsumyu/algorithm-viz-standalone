/**
 * 二分图博弈 (Game on Bipartite Graph · 洛谷 P4055) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：最大匹配充要定理判定、匈牙利基准匹配求解、未匹配点交错轨 DFS 拓展与先手必胜点集判定
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BipartiteGameDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bipartite-game';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bipartite-game' ||
      modelId === 'game-on-bipartite-graph' ||
      modelId === 'jsoi2009-game' ||
      modelId === 'P4055'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '二分图博弈 (Game on Bipartite Graph) · 全景推演树',
      badge: '洛谷 P4055 [JSOI2009] 游戏 · 最大匹配定理 · 匈牙利增广 · 交错轨 DFS 解绑 · 先手必胜点集',
      descriptionHtml: `
        两人轮流在二分图上移动同一枚棋子，每个节点只能访问一次，无法移动者判负。<br/>
        <b>博弈论核心判定定理：</b><br/>
        起点 $u$ 是先手必胜点，<b>当且仅当 $u$ 属于该二分图的每一个最大匹配</b>！<br/>
        若存在某个最大匹配不包含 $u$，则后手必胜（后手可沿交错轨策略移动，先手必将无路可走）。<br/>
        推演分为三大阶段：<br/>
        ① <b>匈牙利求基准最大匹配：</b>先求出图的一组基准最大匹配 $M$；<br/>
        ② <b>交错轨 DFS 寻找可解绑点：</b>从所有未匹配的左部节点出发，沿「非匹配边 ➔ 匹配边」构成的交错轨进行 DFS 探索。所有被访问到的左部节点均可通过交错轨反转转化为非匹配点，标记 $\\text{canBeUnmatched}[u] = \\text{true}$；<br/>
        ③ <b>筛选先手必胜点集：</b>满足 $\\text{matchLeft}[u] > 0 \\land \\neg \\text{canBeUnmatched}[u]$ 的节点即为属于所有最大匹配的先手必胜起点。
      `,
      initialStateText: '初始载入二分图模型，分配 matchLeft[], matchRight[], canBeUnmatched[] 数组，准备启动匈牙利基准匹配。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点划分与边集',
        valuesStr: 'Left = {1, 2, 5}, Right = {3, 4}, E = {(1,3), (2,3), (2,4), (5,4)}',
      },
      {
        prefix: '├───',
        label: '博弈充要条件',
        valuesStr: '先手必胜 ⟺ 起点 u 属于图的每一个最大匹配',
      },
      {
        prefix: '└───',
        label: '初始配对状态',
        valuesStr: 'matchLeft = [0, 0, 0, 0, 0, 0], canBeUnmatched = [F, F, F, F, F, F]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】匈牙利算法求解基准最大匹配 (Benchmark Maximum Matching)',
        subtitle: '依次为左部节点 1, 2, 5 寻找增广路径，建立一组基准匹配',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '为节点 1 寻找增广路 (1 ➔ 3)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">匹配 (1, 3)</span>',
            detailLines: [
              '│  ① 考察边 1 ➔ 3，右部节点 3 单身空闲',
              '│  ② 确立匹配: matchLeft[1] = 3, matchRight[3] = 1',
            ],
            fillLine: '└── 基准匹配增至 1 对 💖',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '为节点 2 寻找增广路 (2 ➔ 4)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">匹配 (2, 4)</span>',
            detailLines: [
              '│  ① 考察边 2 ➔ 3 (占用)，转向考察边 2 ➔ 4',
              '│  ② 右部节点 4 单身空闲，确立匹配: matchLeft[2] = 4, matchRight[4] = 2',
            ],
            fillLine: '└── 基准匹配增至 2 对 💖',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '为节点 5 寻找增广路 (尝试腾位失败)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">未匹配点 5</span>',
            detailLines: [
              '│  ① 节点 5 出边 5 ➔ 4 已被 2 占用',
              '│  ② 原配 2 尝试改嫁节点 3，但 3 的原配 1 无其他出边，让位失败',
              '│  ③ 节点 5 保持未匹配状态: matchLeft[5] = 0',
            ],
            fillLine: '└── 基准最大匹配对数为 2，节点 5 属于未匹配点 ⚠️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】交错轨 DFS 探索非必须匹配点 (Alternating Path DFS)',
        subtitle: '从所有未匹配左部点 (节点 5) 出发，沿交错轨搜索可替换点',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '从未匹配点 5 出发发起交错轨',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">交错源点 5</span>',
            detailLines: [
              '│  ① 标记 canBeUnmatched[5] = true (本身未匹配)',
              '│  ② 沿非匹配边 5 ➔ 4 走向右部节点 4',
            ],
            fillLine: '└── 探查未匹配边 (5 ➔ 4) 🔍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沿匹配边 (4 ➔ 2) 反向回溯至左部节点 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">回溯至节点 2</span>',
            detailLines: [
              '│  ① 右部点 4 的匹配原配为 2 (matchRight[4] = 2)',
              '│  ② 沿匹配边反推至左部节点 2，标记 canBeUnmatched[2] = true',
              '│  ③ 从节点 2 出发考察非匹配出边 2 ➔ 3',
            ],
            fillLine: '└── 节点 2 可通过反转 (5-4, 2-4) 变为未匹配点！🚩',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '沿匹配边 (3 ➔ 1) 反向回溯至左部节点 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">回溯至节点 1</span>',
            detailLines: [
              '│  ① 右部点 3 的匹配原配为 1 (matchRight[3] = 1)',
              '│  ② 沿匹配边反推至左部节点 1，标记 canBeUnmatched[1] = true',
              '│  ③ 节点 1 无其他交错分支，DFS 终止',
            ],
            fillLine: '└── 节点 1 亦可通过交错轨反转变为未匹配点！🚩',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】博弈胜负态判定与先手必胜点集确立 (Winning Set Decision)',
        subtitle: '充要判定: matchLeft[u] > 0 且 !canBeUnmatched[u]',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '综合判定左部节点先手胜负',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">必胜点判定</span>',
            detailLines: [
              '│  ① 节点 1, 5 均可通过交错轨变为未匹配点，后手可迫使先手无路可走 (后手必胜)',
              '│  ② 若某节点在所有最大匹配中均无法被解绑，先手总能走匹配边回应 (先手必胜)',
              '│  ③ 在 5 节点用例中，先手必胜点集确认，复杂度 O(V · E) 🏆',
            ],
            fillLine: '└── 二分图博弈判定完毕，输出先手必胜起始节点集 👑',
          }),
        ].join(''),
      }),
    ];

    return [header, baseCase, ...rounds].join('\n');
  }
}
