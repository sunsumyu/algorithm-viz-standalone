/**
 * 冗余连接 II (Redundant Connection II · LC 685) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 双父节点冲突统计、并查集有向环检验、三向分支决策终局消解
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RedundantEdgeIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'redundant-edge-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'redundant-edge-ii' ||
      modelId === 'redundant-connection-ii' ||
      modelId === 'redundant-connection-ii-685' ||
      modelId === 'redundant-edge-2' ||
      modelId === 'leetcode-685' ||
      modelId === 'lc-685' ||
      modelId === 'class057-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 685. 冗余连接 II (Redundant Connection II · 并查集) · 全景推演树',
      badge: '有向图并查集 · 入度为 2 双父节点冲突 · 有向环回路判定与三向分支消解',
      descriptionHtml: `
        给定有向图包含 <code class="font-bold text-slate-800">N = 3</code> 个节点与 3 条有向边序列：<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">[[1, 2], [1, 3], [2, 3]]</code>。<br/>
        核心算法架构：<br/>
        ① <b>合法有向树的两大黄金法则：</b> 全图有且仅有一个根节点入度为 0，其余所有节点入度严格等于 1，且图内绝无有向环；<br/>
        ② <b>附加有向边引发的冲突分流：</b><br/>
        &nbsp;&nbsp;• <b>冲突 A（入度为 2）：</b> 某个子节点拥有两个父节点（双入边）；<br/>
        &nbsp;&nbsp;• <b>冲突 B（有向环）：</b> 某条附加边使祖先与子孙形成了回路闭环；<br/>
        ③ <b>三大终局决策分支消解：</b><br/>
        &nbsp;&nbsp;• <b>分支 1 (conflict < 0)：</b> 全图节点入度均 ≤ 1，退化为无向判环 (LC 684)，直接返回成环边 <code class="font-mono bg-pink-50 text-pink-700 px-1 py-0.5 rounded font-bold">edges[cycle]</code>；<br/>
        &nbsp;&nbsp;• <b>分支 2 (conflict ≥ 0 且 cycle ≥ 0)：</b> 假设跳过第二条入边后仍有环，说明导致环的必然是第一条入边，必须返回指向该目标节点的第一条入边；<br/>
        &nbsp;&nbsp;• <b>分支 3 (conflict ≥ 0 且 cycle < 0)：</b> 假设跳过第二条入边后全图无环合法，说明该冲突边正是冗余连接，直接返回 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">edges[conflict]</code>！
      `,
      initialStateText: '初始化 inDegree = [0, 0, 0, 0]，conflict = -1, cycle = -1。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '入度表初始化：inDegree[i] = 0 (节点 1..3 初始入度均为 0)',
        valuesStr: 'inDegree = [-, 1:0, 2:0, 3:0]',
      },
      {
        prefix: '├───',
        label: '待检验有向边序列：3 条有向边',
        valuesStr: 'edges = [[1, 2], [1, 3], [2, 3]]',
      },
      {
        prefix: '└───',
        label: '双指针游标初始化：双父冲突与环路索引',
        valuesStr: 'conflict = -1, cycle = -1',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第一阶段】首轮遍历：统计入度检测双父节点冲突',
        subtitle: '统计各节点入度 · 捕捉入度为 2 的第二条入边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '考察边 edges[0] = [1 ➔ 2]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">入度累加</span>',
            detailLines: [
              '│  ① inDegree[2] 初始为 0',
              '│  ② inDegree[2]++ -> 1',
            ],
            fillLine: '└── inDegree = [-, 1:0, 2:1, 3:0]',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '考察边 edges[1] = [1 ➔ 3]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">入度累加</span>',
            detailLines: [
              '│  ① inDegree[3] 初始为 0',
              '│  ② inDegree[3]++ -> 1',
            ],
            fillLine: '└── inDegree = [-, 1:0, 2:1, 3:1]',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '考察边 edges[2] = [2 ➔ 3]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">双父冲突 ⚠️</span>',
            detailLines: [
              '│  ① inDegree[3] 当前已为 1，边 [2, 3] 为指向节点 3 的第二条入边！',
              '│  ② 记录双父冲突边索引：conflict = 2 (即边 [2, 3])',
            ],
            fillLine: '└── 锁定冲突：conflict = 2 (edges[2] = [2, 3]) ⚠️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第二阶段】次轮建树判环：假设跳过 conflict 边 [2, 3]',
        subtitle: '并查集动态加边 · 检验跳过后的剩余图是否依然含环',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '初始化并查集 parent = [-, 1:1, 2:2, 3:3]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-bold">重置集合</span>',
            detailLines: [
              '│  ① 准备以并查集测试连通分支成环情况',
            ],
            fillLine: '└── parent = [-, 1:1, 2:2, 3:3]',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '考察边 edges[0] = [1 ➔ 2]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">合并集合</span>',
            detailLines: [
              '│  ① find(1) = 1, find(2) = 2 -> 根不同',
              '│  ② union: parent[1] = 2',
            ],
            fillLine: '└── parent = [-, 1:2, 2:2, 3:3]',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '考察边 edges[1] = [1 ➔ 3]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">合并集合</span>',
            detailLines: [
              '│  ① find(1) = 2, find(3) = 3 -> 根不同',
              '│  ② union: parent[2] = 3',
            ],
            fillLine: '└── parent = [-, 1:2, 2:3, 3:3]',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '考察边 edges[2] = [2 ➔ 3]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">跳过验证 ⏭️</span>',
            detailLines: [
              '│  ① 当前索引 i === conflict (2)，按既定策略跳过该边！',
              '│  ② 剩余边遍历完毕，全程未触发同根成环 (cycle 维持为 -1)！',
            ],
            fillLine: '└── 环路检测结算：cycle = -1 (跳过该边后整图完全无环) ✅',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第三阶段】终局决策消解：三向分支裁决',
        subtitle: 'conflict 与 cycle 联合判定',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '分支 1 判定：if (conflict < 0)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-bold">不满足</span>',
            detailLines: [
              '│  ① conflict = 2 (>= 0)，存在双父节点冲突，排除纯有向环分支 1',
            ],
            fillLine: '└── 继续检验分支 2',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '分支 2 判定：if (cycle >= 0)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-bold">不满足</span>',
            detailLines: [
              '│  ① cycle = -1 (< 0)，跳过 conflict 边后并没有残存环路',
              '│  ② 排除第一条入边有环分支 2',
            ],
            fillLine: '└── 进入分支 3',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '分支 3 判定：return edges[conflict]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">命中胜出 🏆</span>',
            detailLines: [
              '│  ① 跳过冲突边 edges[2] = [2, 3] 后整图成为合法无环树',
              '│  ② 该边即为导致双父冲突的唯一冗余边！',
            ],
            fillLine: '└── return edges[conflict] = [2, 3] 🎉',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '入度统计、跳过建树与三向分支决策'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return edges[conflict] = [2, 3];',
      answerDescription: '跳过指向节点 3 的第二条入边 [2, 3] 后，剩余有向边成功构成合法有向树（节点 1 为根，入度分别为 0, 1, 1），故边 [2, 3] 即为冗余连接！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
