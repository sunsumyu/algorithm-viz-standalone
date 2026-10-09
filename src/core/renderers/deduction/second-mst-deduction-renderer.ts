/**
 * 严格次小生成树 (Strict Second-Best MST · 洛谷 P4180) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * Kruskal 主生成树、树上倍增维护严格最大/次大边、非树边破圈严格大于换边
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SecondMstDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'second-mst';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'second-mst' ||
      modelId === 'strict-second-mst' ||
      modelId === 'luogu-p4180' ||
      modelId === 'second-best-mst'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '严格次小生成树 (Strict Second-Best MST · 洛谷 P4180) · 全景推演树',
      badge: 'Kruskal 主生成树 · 倍增维护严格次大 · 破圈非树边试探 · O(M log N)',
      descriptionHtml: `
        包含 <code class="font-bold text-slate-800">N = 4</code> 个顶点与 4 条无向带权边：<br/>
        <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">(1-2:1), (2-3:2), (3-4:3), (1-4:4)</code>。<br/>
        核心算法架构：<br/>
        ① <b>Kruskal 构建基础最小生成树 (MST)：</b> 优先选择权值最小的边，构成总权值为 <code class="font-bold text-emerald-700">6</code> 的基准 MST；<br/>
        ② <b>树上倍增维护严格最大边与严格次大边：</b><br/>
        &nbsp;&nbsp;• 为避免换入与树边等权的非树边导致生成树总权值不变（非严格次小），树上必须同时维护 <code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">max1</code> (最大边) 与 <code class="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-bold">max2</code> (严格次大边)；<br/>
        ③ <b>非树边破圈换边贪心求解：</b><br/>
        &nbsp;&nbsp;• 加入非树边 <code class="font-bold text-slate-800">(u, v, w)</code> 必定在树上形成简单环；<br/>
        &nbsp;&nbsp;• 若 <code class="font-bold text-slate-800">w > max1</code>，替换 <code class="font-bold text-slate-800">max1</code>：增量 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">delta = w - max1</code>；<br/>
        &nbsp;&nbsp;• 若 <code class="font-bold text-slate-800">w == max1</code>，绝不能替换 <code class="font-bold text-slate-800">max1</code>，转而替换严格次大边 <code class="font-bold text-slate-800">max2</code>：增量 <code class="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-bold">delta = w - max2</code>！
      `,
      initialStateText: '全图 4 个节点，4 条边按权值升序排列，准备执行 Kruskal 算法求出基础最小生成树。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '基础最小生成树树边集合 (Kruskal 所得)',
        valuesStr: 'mstEdges = [(1,2:1), (2,3:2), (3,4:3)], mstWeight = 6',
      },
      {
        prefix: '├───',
        label: '待试探非树边集合 (加入将与树成环)',
        valuesStr: 'nonTreeEdges = [(1,4:4)]',
      },
      {
        prefix: '└───',
        label: '严格次小生成树初始权值记录',
        valuesStr: 'secondMstWeight = +∞',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】Kruskal 贪心求解基础最小生成树 (MST)',
        subtitle: '边权升序排序 · 并查集无环合并 · 选满 3 条树边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '边权贪心选边',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">3 条边入选</span>',
            detailLines: [
              '│  ① 选入 (1, 2, w=1) -> 权值累加至 1',
              '│  ② 选入 (2, 3, w=2) -> 权值累加至 3',
              '│  ③ 选入 (3, 4, w=3) -> 权值累加至 6',
            ],
            fillLine: '└── 基础 MST 总权值 mstWeight = 6 🌲',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '标记非树边',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">非树边 1 条</span>',
            detailLines: [
              '│  ① 边 (1, 4, w=4) 两端点已在树中连通',
              '│  ② 归类为候选非树边，准备后续破圈换边试探',
            ],
            fillLine: '└── nonTreeEdges = [(1, 4: 4)] 🔍',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】树上倍增初始化最大与严格次大边 (max1 & max2)',
        subtitle: 'DFS 遍历树形拓扑 · 维护各点到根路径边权极值',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '树上边权极值数组维护',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">DFS 预处理</span>',
            detailLines: [
              '│  ① depth = [1:1, 2:2, 3:3, 4:4]',
              '│  ② 节点 4 到 1 的树上简单路径为：4 ➔ 3 ➔ 2 ➔ 1',
              '│  ③ 路径上最大边 max1 = 3 (边 3-4)，次大边 max2 = 2 (边 2-3)',
            ],
            fillLine: '└── 路径极值：max1 = 3, max2 = 2 📐',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】枚举非树边 (1, 4, w=4) 进行破圈换边',
        subtitle: '成环检验 · 判定严格大于 · 替换最大边 max1',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '非树边入环判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">w=4 > max1=3</span>',
            detailLines: [
              '│  ① 考察非树边 (1, 4, w=4)，其在树上回路的最大边为 max1 = 3',
              '│  ② 边权检验：w(4) > max1(3) 严格成立！',
              '│  ③ 移去树边 (3, 4, w=3)，加入非树边 (1, 4, w=4)',
            ],
            fillLine: '└── 破圈换边增量：delta = 4 - 3 = +1 ⚡',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '更新严格次小生成树权值',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">SecondMST 达成</span>',
            detailLines: [
              '│  ① secondMstWeight = mstWeight + delta = 6 + 1 = 7',
              '│  ② 7 > 6，满足严格次小生成树严格大于定义！',
            ],
            fillLine: '└── secondMstWeight = 7 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'Kruskal 构树 ➔ 倍增维护 max1/max2 ➔ 枚举非树边破圈换边'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return secondMstWeight = 7;',
      answerDescription:
        '🏆 最终返回：成功求得严格次小生成树，基础 MST 权值 = 6，严格次小生成树权值 = 7 (换边增量 +1)！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
