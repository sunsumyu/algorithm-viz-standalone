/**
 * Prim 最小生成树 (MST Prim · 洛谷 P3366 · 左程云 Class 058) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 加点法贪心扩充、割边性质 (Cut Property)、minDist 动态松弛与前驱边固化
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MstPrimDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'mst-prim';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'mst-prim' ||
      modelId === 'prim-mst' ||
      modelId === 'class058-code02' ||
      modelId === 'luogu-p3366-prim'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '最小生成树 (Prim 算法 · 加点法) · 全景推演树',
      badge: '加点法贪心生长 · 切割性质 Cut Property · minDist 动态更新 · O(V²)',
      descriptionHtml: `
        包含 <code class="font-bold text-slate-800">V = 5</code> 个顶点 (0..4) 与 7 条无向带权边：<br/>
        <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">(0-1:2), (0-3:6), (1-2:3), (1-3:8), (1-4:5), (2-4:7), (3-4:9)</code>。<br/>
        核心算法架构：<br/>
        ① <b>切割性质 (Cut Property) 与贪心生长：</b> 维护已入树点集 <code class="font-bold text-slate-800">inMST</code> 与未入树点集构成的割 (Cut)，每次必选横跨割的最小权值切边；<br/>
        ② <b>minDist 动态切边距离更新：</b><br/>
        &nbsp;&nbsp;• <b>选点：</b> 在未入树点中挑选 <code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">minDist[u]</code> 最小的点 <code class="font-bold text-slate-800">u</code>；<br/>
        &nbsp;&nbsp;• <b>固化：</b> 标记 <code class="font-bold text-emerald-700">inMST[u] = true</code>，累计权值 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">totalWeight += minDist[u]</code>；<br/>
        &nbsp;&nbsp;• <b>出边松弛：</b> 遍历 <code class="font-bold text-slate-800">u</code> 的出边 <code class="font-bold text-slate-800">(u ➔ v, w)</code>，若 <code class="font-mono bg-purple-50 text-purple-800 px-1 py-0.5 rounded font-bold">!inMST[v] && w < minDist[v]</code>，则更新更优切边 <code class="font-mono bg-purple-50 text-purple-800 px-1 py-0.5 rounded font-bold">minDist[v] = w</code>！<br/>
        ③ <b>全点连通终止：</b> 循环执行 <code class="font-bold text-slate-800">V = 5</code> 轮，所有顶点全部纳入生成树，算法自然达成收敛。
      `,
      initialStateText: '全图 5 个节点，以节点 0 为生长根节点，minDist[0]=0，其余节点 minDist[1..4]=∞。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '切边距离数组 (minDist 初始状态)',
        valuesStr: 'minDist = [0:0, 1:∞, 2:∞, 3:∞, 4:∞]',
      },
      {
        prefix: '├───',
        label: '生成树点集标记 (inMST 初始布尔表)',
        valuesStr: 'inMST = [0:F, 1:F, 2:F, 3:F, 4:F]',
      },
      {
        prefix: '└───',
        label: '生成树边集与累计权值',
        valuesStr: 'mstEdges = [], totalWeight = 0, nodeCount = 0 / 5',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】选根节点 0 并入生成树',
        subtitle: '最小点挑选 · 纳入 inMST · 松弛邻居切边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '确定最小切边点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">u = 0 (d=0)</span>',
            detailLines: [
              '│  ① 全局最小切边为 minDist[0] = 0 -> 挑选点 0',
              '│  ② inMST[0] = true；作为 MST 初始根节点',
            ],
            fillLine: '└── inMST 点集：{0} 🌱',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '松弛出边切边距离',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">更新 2 条切边</span>',
            detailLines: [
              '│  ① 边 (0➔1, w=2) < minDist[1](∞) -> minDist[1] = 2',
              '│  ② 边 (0➔3, w=6) < minDist[3](∞) -> minDist[3] = 6',
            ],
            fillLine: '└── minDist = [0:0, 1:2, 2:∞, 3:6, 4:∞] ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】选节点 1 并入生成树',
        subtitle: '最小点挑选 · 固化边 (0-1:2) · 松弛邻居切边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '确定最小切边点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">u = 1 (d=2)</span>',
            detailLines: [
              '│  ① 未入树点中 minDist[1]=2 为最小 -> 挑选点 1',
              '│  ② inMST[1] = true, totalWeight = 0 + 2 = 2',
              '│  ③ 固化 MST 边：(0 ➔ 1, w=2)',
            ],
            fillLine: '└── totalWeight = 2 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '松弛出边切边距离',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">更新 2 条切边</span>',
            detailLines: [
              '│  ① 边 (1➔2, w=3) < minDist[2](∞) -> minDist[2] = 3',
              '│  ② 边 (1➔4, w=5) < minDist[4](∞) -> minDist[4] = 5',
              '│  ③ 边 (1➔3, w=8) > minDist[3](6) -> 跳过',
            ],
            fillLine: '└── minDist = [0:0, 1:2, 2:3, 3:6, 4:5] ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】选节点 2 并入生成树',
        subtitle: '最小点挑选 · 固化边 (1-2:3) · 松弛邻居切边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '确定最小切边点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">u = 2 (d=3)</span>',
            detailLines: [
              '│  ① 未入树点中 minDist[2]=3 为最小 -> 挑选点 2',
              '│  ② inMST[2] = true, totalWeight = 2 + 3 = 5',
              '│  ③ 固化 MST 边：(1 ➔ 2, w=3)',
            ],
            fillLine: '└── totalWeight = 5 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '松弛出边切边距离',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-bold">无更优更新</span>',
            detailLines: [
              '│  ① 边 (2➔4, w=7) > minDist[4](5) -> 已有更优边，跳过',
            ],
            fillLine: '└── minDist 保持不变 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 轮】选节点 4 并入生成树',
        subtitle: '最小点挑选 · 固化边 (1-4:5) · 松弛邻居切边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '确定最小切边点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">u = 4 (d=5)</span>',
            detailLines: [
              '│  ① 未入树点中 minDist[4]=5 为最小 -> 挑选点 4',
              '│  ② inMST[4] = true, totalWeight = 5 + 5 = 10',
              '│  ③ 固化 MST 边：(1 ➔ 4, w=5)',
            ],
            fillLine: '└── totalWeight = 10 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '松弛出边切边距离',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-bold">无更优更新</span>',
            detailLines: [
              '│  ① 边 (4➔3, w=9) > minDist[3](6) -> 跳过',
            ],
            fillLine: '└── minDist 保持不变 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 5 轮】选节点 3 并入生成树 (终态收敛)',
        subtitle: '最后节点 · 固化边 (0-3:6) · 全图顶点全部连通',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '确定最小切边点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">u = 3 (d=6)</span>',
            detailLines: [
              '│  ① 唯一起点 minDist[3]=6 -> 挑选点 3',
              '│  ② inMST[3] = true, totalWeight = 10 + 6 = 16',
              '│  ③ 固化 MST 边：(0 ➔ 3, w=6)',
            ],
            fillLine: '└── totalWeight = 16 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '全图 5 节点连通达成',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">MST 达成</span>',
            detailLines: [
              '│  ① 全图所有 5 个顶点全部已并入 inMST',
              '│  ② 共固化 4 条树边，满足 V - 1 结构！',
            ],
            fillLine: '└── 最小生成树加点法圆满达成 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '每轮贪心选取当前横跨割的最小 minDist 点并入树，并松弛未入树邻居的切边权值'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return totalWeight = 16;',
      answerDescription:
        '🏆 最终返回：加点法完成全部 5 轮割边贪心扩展，成功构建全局最小生成树，总权值 = 16！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
