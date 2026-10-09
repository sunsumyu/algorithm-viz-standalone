/**
 * 冗余连接 (Redundant Connection · LC 684) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 并查集动态加边连通性演进、无向环闭合诊断与冗余边截断
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RedundantEdgeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'redundant-edge';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'redundant-edge' ||
      modelId === 'redundant-connection' ||
      modelId === 'leetcode-684' ||
      modelId === 'lc-684' ||
      modelId === 'class056-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 684. 冗余连接 (Redundant Connection · 并查集) · 全景推演树',
      badge: '无向图回路检测 · 动态加边查根 · O(N·α(N)) 路径压缩并查集',
      descriptionHtml: `
        给定一棵包含 <code class="font-bold text-slate-800">N = 5</code> 个节点的树被添加了一条附加边，输入 5 条边序列：<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">[[1,2], [2,3], [3,4], [1,4], [1,5]]</code>。<br/>
        核心算法架构：<br/>
        ① <b>无向树与环路成因：</b> 拥有 <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-bold">N</code> 个节点的合法无向树必须且仅能拥有 <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-bold">N - 1</code> 条边。多出的 1 条附加边必然使图产生唯一环路；<br/>
        ② <b>并查集动态加边连通性判定：</b> 初始时所有顶点各自独立（<code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">parent[i] = i</code>）。按序考察各边 <code class="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-bold">[u, v]</code>，分别通过 <code class="font-mono bg-purple-50 text-purple-800 px-1 py-0.5 rounded font-bold">find(u)</code> 与 <code class="font-mono bg-purple-50 text-purple-800 px-1 py-0.5 rounded font-bold">find(v)</code> 查找所在连通分量的根节点；<br/>
        ③ <b>同根即闭环截获：</b> 若 <code class="font-mono bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-bold">rootU == rootV</code>，说明两顶点此前已连通，此边加入必然闭合环路，立即返回该冗余边！否则执行 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">parent[rootU] = rootV</code> 连通两分支。
      `,
      initialStateText: '初始化并查集 parent = [0, 1, 2, 3, 4, 5]，5 个独立连通块，0 条树边。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '并查集数组初始化：parent[i] = i (节点 1..5 自成集合)',
        valuesStr: 'parent = [-, 1:1, 2:2, 3:3, 4:4, 5:5]',
      },
      {
        prefix: '└───',
        label: '待检验边序列 (按输入给定次序遍历)',
        valuesStr: 'edges = [[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 步】考察边 [1, 2] (加边与集合合并)',
        subtitle: '查找两端点根节点 · 验证连通性',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'find 寻根核验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">根不同</span>',
            detailLines: [
              '│  ① find(1) = 1, find(2) = 2',
              '│  ② rootU (1) !== rootV (2) -> 两端点尚未连通，无环',
            ],
            fillLine: '└── 合并集合：parent[1] = 2 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '状态快照',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">树边 +1</span>',
            detailLines: [
              '│  ① 树边集合 = [[1, 2]]',
              '│  ② 当前连通块：{1, 2}, {3}, {4}, {5}',
            ],
            fillLine: '└── parent = [-, 1:2, 2:2, 3:3, 4:4, 5:5]',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 步】考察边 [2, 3] (加边与集合合并)',
        subtitle: '查找两端点根节点 · 验证连通性',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'find 寻根核验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">根不同</span>',
            detailLines: [
              '│  ① find(2) = 2, find(3) = 3',
              '│  ② rootU (2) !== rootV (3) -> 两端点尚未连通，无环',
            ],
            fillLine: '└── 合并集合：parent[2] = 3 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '状态快照',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">树边 +1</span>',
            detailLines: [
              '│  ① 树边集合 = [[1, 2], [2, 3]]',
              '│  ② 当前连通块：{1, 2, 3}, {4}, {5}',
            ],
            fillLine: '└── parent = [-, 1:2, 2:3, 3:3, 4:4, 5:5]',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 步】考察边 [3, 4] (加边与集合合并)',
        subtitle: '查找两端点根节点 · 验证连通性',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'find 寻根核验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">根不同</span>',
            detailLines: [
              '│  ① find(3) = 3, find(4) = 4',
              '│  ② rootU (3) !== rootV (4) -> 两端点尚未连通，无环',
            ],
            fillLine: '└── 合并集合：parent[3] = 4 ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '状态快照',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">树边 +1</span>',
            detailLines: [
              '│  ① 树边集合 = [[1, 2], [2, 3], [3, 4]]',
              '│  ② 当前连通块：{1, 2, 3, 4}, {5}',
            ],
            fillLine: '└── parent = [-, 1:2, 2:3, 3:4, 4:4, 5:5]',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 步】考察边 [1, 4] (诊断并捕获无向环回路)',
        subtitle: '两端点寻根一致 · 触发环路截断',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'find 寻根核验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">同根成环</span>',
            detailLines: [
              '│  ① find(1) -> 追溯 parent: 1 ➔ 2 ➔ 3 ➔ 4, 根为 4',
              '│  ② find(4) -> 根为 4',
              '│  ③ rootU (4) === rootV (4) -> 节点 1 与节点 4 早已在连通块中存在路径 1-2-3-4！',
            ],
            fillLine: '└── 判定边 [1, 4] 为导致环路生成的冗余边 ⚠️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '截获冗余边并返回',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">算法终局</span>',
            detailLines: [
              '│  ① 发现闭环边 [1, 4]，后续边无需再遍历',
              '│  ② 移除此边即可恢复合法树结构',
            ],
            fillLine: '└── return [1, 4] 🎉',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '并查集动态加边连通性演进与回路判定'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return [1, 4];',
      answerDescription: '在遍历第 4 条边 [1, 4] 时，两端点根相同 (rootU == rootV == 4)，闭合简单环路 (1-2-3-4-1)，该边即为必须移除的冗余连接！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
