/**
 * 最小均值回路与 0-1 分数规划 (Min Mean Cycle · Karp / 洛谷 P2868) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶图论: 0-1 分数规划、边权动态赋权 w'(e) = w(e) - λ、SPFA 负权回路判定、二分答案
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MinMeanCycleDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'min-mean-cycle';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'min-mean-cycle' ||
      modelId === 'karp' ||
      modelId === 'min-mean-weight-cycle' ||
      modelId === 'P2868' ||
      modelId === 'fractional-programming'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '最小均值回路与 0-1 分数规划 (Min Mean Cycle · Karp / 洛谷 P2868) · 全景推演树',
      badge: '洛谷 P2868 · 进阶图论 + 0-1 分数规划 · 二分答案 · SPFA 负权回路判定 · 边权重赋权 w\'(e) = w(e) - λ',
      descriptionHtml: `
        最小均值回路目标是寻找有向图中的一个简单回路 $C$，使得平均边权 $\\lambda = \\frac{\\sum_{e \\in C} w(e)}{|C|}$ 达到最小。<br/>
        <b>0-1 分数规划核心数学规约与判定法则：</b><br/>
        ① <b>不等式转化：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;假设存在回路满足 $\\frac{\\sum w(e)}{|C|} < \\lambda \\iff \\sum_{e \\in C} (w(e) - \\lambda) < 0$；<br/>
        ② <b>动态边权新图构造：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将全图每条有向边赋予新权值 $w'(e) = w(e) - \\lambda$；<br/>
        ③ <b>SPFA / Bellman-Ford 负权回路判定：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;• <b>若新图中存在负环：</b>说明存在某回路平均边权严格小于 $\\lambda$，真实最优值 $\\lambda^* < \\lambda$，收缩右界 $R \\leftarrow \\lambda$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;• <b>若新图中不存在负环：</b>说明所有回路的平均边权均 $\\ge \\lambda$，真实最优值 $\\lambda^* \\ge \\lambda$，提升左界 $L \\leftarrow \\lambda$；<br/>
        ④ <b>零环极值特征：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;当 $\\lambda = \\lambda^*$ 时，重赋权图恰好出现权值和为 0 的零环（Zero Cycle），二分在阈值 $|R - L| < 10^{-5}$ 下极速收敛。
      `,
      initialStateText: '输入有向图边集与权值，设定二分上下界 [L, R] = [0.000, 5.000]，精度阈值 ε = 1e-5。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '二分初始搜索区间',
        valuesStr: '[L, R] = [0.000, 5.000]，覆盖全图最小到最大可能边权均值',
      },
      {
        prefix: '├───',
        label: '动态边权映射规则',
        valuesStr: 'w\'(e) = w(e) - λ，将分数目标转化为代数和负权判定',
      },
      {
        prefix: '└───',
        label: '负环判定判据',
        valuesStr: 'SPFA 探测到负环 ⟺ λ* < λ (需缩小上界)；无负环 ⟺ λ* ≥ λ (需提升下界)',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】二分猜测与动态边权赋权 (Binary Guess & Reweighting)',
        subtitle: '二分选取试验均值 mid = (L + R) / 2，执行全图边权平移',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '二分中点选取',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">二分中点</span>',
            detailLines: [
              '│  ① 计算中点：mid = (L + R) / 2.0',
              '│  ② 假设目标平均回路权值为 λ = mid',
            ],
            fillLine: '└── 猜测平均边权确立 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '动态边权平移赋权',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">边权平移</span>',
            detailLines: [
              '│  ① 遍历所有有向边 e = (u, v, w)：w\'(e) = w(e) - λ',
              '│  ② 正权边表示均值高于 λ，负权边表示均值低于 λ',
            ],
            fillLine: '└── 残量赋权新图构建完成 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】SPFA 负权回路探测 (Negative Cycle Detection)',
        subtitle: '利用 SPFA 或 Bellman-Ford 检测重赋权图是否存在总权值 < 0 的有向回路',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '超级源点与队列松弛',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">队列松弛</span>',
            detailLines: [
              '│  ① 建立虚拟源点向所有点连 0 权边，所有节点入队',
              '│  ② 循环弹出队头节点 u，对出边 (u, v) 尝试松弛：dist[v] > dist[u] + w\'(e)',
            ],
            fillLine: '└── 最短路距离数组与入队计数维护 📊',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '入队次数超限判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">负环判决</span>',
            detailLines: [
              '│  ① 若某节点入队次数 count[v] >= n，立刻断定存在负权回路',
              '│  ② 提取负环路径 cycle = { 2 -> 4 -> 3 -> 2 }，返回 true',
            ],
            fillLine: '└── 负权回路精准锁定 ⭕',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】二分上下界收缩转移 (Interval Bisection Adjustment)',
        subtitle: '根据负环存在性单调调整二分搜索区间 [L, R]',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '存在负环：收缩上界',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">收缩上界</span>',
            detailLines: [
              '│  ① 负环表明回路平均边权 < λ，当前 λ 偏大',
              '│  ② 更新右端点：R = mid，二分区间向左半侧压缩',
            ],
            fillLine: '└── 搜索上界严格收敛 📉',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '无负环：提升下界',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">提升下界</span>',
            detailLines: [
              '│  ① 无负环表明全图回路平均边权均 >= λ，当前 λ 偏小',
              '│  ② 更新左端点：L = mid，二分区间向右半侧压缩',
            ],
            fillLine: '└── 搜索下界稳步提升 📈',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】收敛至零环与极值回路输出 (Zero Cycle Convergence & Output)',
        subtitle: '二分区间跨度达到浮点精度阈值，零环对应原图最优最小均值回路',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '最优最小平均边权确定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">全局最优解</span>',
            detailLines: [
              '│  ① |R - L| < 1e-5，逼近最优临界值 λ* = 1.333',
              '│  ② 最优回路 2 ➔ 4 ➔ 3 ➔ 2 边权和 4，边数 3，平均边权 1.333',
            ],
            fillLine: '└── 0-1 分数规划最小均值回路求解圆满闭环 🏆',
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
