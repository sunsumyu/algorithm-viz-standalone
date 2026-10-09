/**
 * 差分约束系统 (System of Difference Constraints · 洛谷 P5960) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：代数不等式向有向图同构转化、超级源点基准连接、SPFA 最短路松弛与负权回路判定
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DiffConstraintsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'diff-constraints';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'diff-constraints' ||
      modelId === 'difference-constraints' ||
      modelId === 'system-of-difference-constraints' ||
      modelId === 'class070-code01' ||
      modelId === 'P5960'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '差分约束系统 (System of Difference Constraints) · 全景推演树',
      badge: '洛谷 P5960 / 左程云 class070 · 三角不等式同构 · 超级源点 · SPFA 负权环无解判定',
      descriptionHtml: `
        给定一组多元一次不等式形如 $x_v - x_u \\le c$，求解满足全部约束的一组实数解 $[x_1, x_2, \\dots, x_n]$ 或判定无解。<br/>
        算法推演四大核心阶段：<br/>
        ① <b>最短路代数同构：</b>将不等式 $x_v - x_u \\le c$ 变形为 $x_v \\le x_u + c$。该式与最短路三角不等式 $\\text{dist}[v] \\le \\text{dist}[u] + w(u,v)$ 在代数结构上严格同构，故从 $u$ 向 $v$ 连一条权值为 $c$ 的有向边；<br/>
        ② <b>超级源点建立基准：</b>建立虚节点 $S_0$，向所有变量节点 $x_1 \\dots x_n$ 引出一条权值为 0 的有向边（对应 $x_i \\le x_0 + 0$）。此举既连通了图的所有连通分量，又设定了上界基准 $x_i \\le 0$；<br/>
        ③ <b>SPFA 最短路松弛迭代：</b>以 $S_0$ 为源点运行 SPFA 最短路算法，动态更新各变量的最大上限 $\\text{dist}[v]$；<br/>
        ④ <b>负权回路判定收敛性：</b>若任一顶点的松弛次数超过变量总数 $n$（即 $\\text{count}[v] > n$），表明图中存在负权回路，产生形如 $x_1 < x_1$ 的代数矛盾，判定系统无解；否则 $\\text{dist}$ 数组即为系统的一组最大可行解。
      `,
      initialStateText: '初始建立超级源点 S0，向变量 x1, x2, x3 连接权值为 0 的有向边，dist 初始化为无穷大，准备开启 SPFA 求解。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '差分不等式组',
        valuesStr: 'x2 - x1 <= 3, x3 - x1 <= 1, x2 - x3 <= 1',
      },
      {
        prefix: '├───',
        label: '同构有向边集',
        valuesStr: 'E = {(1➔2, w=3), (1➔3, w=1), (3➔2, w=1), (S0➔i, w=0)}',
      },
      {
        prefix: '└───',
        label: '初始距离与计数',
        valuesStr: 'dist[0]=0, dist[1..3]=+∞, count[0..3]=0',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】超级源点发散与变量基准初始化 (Super Source Initialization)',
        subtitle: 'S0 出队，通过权值为 0 的超级边向所有变量节点扩散基准距离',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'S0 入队并弹出',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">源点 S0</span>',
            detailLines: [
              '│  ① dist[0] = 0, q = [0]',
              '│  ② pop(0)，遍历 S0 的出边 (0➔1), (0➔2), (0➔3)',
            ],
            fillLine: '└── S0 出队扩散 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '超级边 0 权松弛所有变量节点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dist[1..3]=0</span>',
            detailLines: [
              '│  ① dist[1] = 0 + 0 = 0, count[1] = 1, push(1)',
              '│  ② dist[2] = 0 + 0 = 0, count[2] = 1, push(2)',
              '│  ③ dist[3] = 0 + 0 = 0, count[3] = 1, push(3)',
            ],
            fillLine: '└── 建立初始变量上界约束: x1,x2,x3 <= 0 📌',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】SPFA 约束松弛与上界紧缩 (Constraint Relaxation & Convergence)',
        subtitle: '考察约束边 (3 ➔ 2, w=1)，检验三角不等式收敛性',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队节点 3 并检验出边 (3 ➔ 2, w=1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">边 (3➔2)</span>',
            detailLines: [
              '│  ① 弹出节点 3，当前 dist[3] = 0',
              '│  ② 考察边 3 ➔ 2 (权值 w=1)',
              '│  ③ 检验松弛条件: dist[2] > dist[3] + 1 ? (0 > 1 为 false)',
            ],
            fillLine: '└── 约束已满足，无需松弛 🔒',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '队列清空，系统全量约束达成稳态',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">稳态收敛</span>',
            detailLines: [
              '│  ① 所有节点入队计数 count[v] <= n=3',
              '│  ② SPFA 队列清空，图中不存在负权回路',
            ],
            fillLine: '└── 全量三角不等式满足 dist[v] <= dist[u] + w ✅',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】结论判定与可行解输出 (Feasible Solution / Negative Cycle)',
        subtitle: '输出满足所有不等式的最大可行解向量，或报告无解',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '输出解向量与负环判定法则',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">可行解确定</span>',
            detailLines: [
              '│  ① 可行解情况: [x1=0, x2=0, x3=0] 为一组满足约束的最大实数解',
              '│  ② 负环无解情况: 若 count[v] > n，则出现负权回路 x_v < x_v 代数矛盾 (UNSAT)',
            ],
            fillLine: '└── 差分约束求解完毕，复杂度 O(N · M) 🏆',
          }),
        ].join(''),
      }),
    ];

    return [header, baseCase, ...rounds].join('\n');
  }
}
