/**
 * LeetCode 1631: 最小体力消耗路径 · 全景推演树渲染策略 (PathMinEffortDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PathMinEffortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'path-min-effort';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'path-min-effort' ||
      modelId === 'minimum-effort-path' ||
      modelId === 'leetcode-1631' ||
      modelId === 'class064-code02'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(6, options.m ?? 3));
    const cols = Math.max(3, Math.min(6, options.n ?? 3));
    const targetR = rows - 1;
    const targetC = cols - 1;

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 1631. 最小体力消耗路径 · 全景推演树',
      badge: 'MiniMax 瓶颈最短路 · Dijkstra 优先队列松弛',
      descriptionHtml: `
        网格地形 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，从起点 (0, 0) 前往终点 (${targetR}, ${targetC})。<br/>
        <span class="font-bold text-slate-800">MiniMax 瓶颈模型</span>：整条路径的体力消耗定义为相邻格子高度差绝对值的<span class="font-bold text-indigo-700">最大值 (Max 落差)</span>；目标是寻找所有路径中消耗的<span class="font-bold text-indigo-700">最小值 (Min 瓶颈)</span>。<br/>
        松弛方程：<code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">newEffort = max(effort[u], |height[u] - height[v]|)</code>。<br/>
        若 <code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">newEffort < effort[v]</code>，则更新距离并压入小根堆。
      `,
      initialStateText: `起点 effort[0][0] = 0 入优先队列，其余单元格 effort 初始置为 ∞。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '起点 (0, 0) 基准初始化：无位移，初始瓶颈落差为 0',
        valuesStr: 'effort[0][0] = 0, PriorityQueue.push((0,0), effort=0)',
      },
      {
        prefix: '└───',
        label: `终点锁定 (${targetR}, ${targetC})：初始瓶颈设为正无穷`,
        valuesStr: `effort[${targetR}][${targetC}] = ∞`,
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【波前推进 轮次 1】从优先队列弹出最小瓶颈节点 (0, 0)',
        subtitle: 'Dijkstra 贪心弹出堆顶',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '向右探测相邻格 (0, 1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">边权落差</span>',
            detailLines: [
              `│  ① 计算绝对落差：diff = |height[0][0] - height[0][1]|`,
              `│  ② MiniMax 状态转移：<span class="font-bold text-indigo-700">nextEffort = max(effort[0][0], diff) = max(0, diff) = diff</span>`,
              `│  ③ 满足 nextEffort < effort[0][1] (∞)：松弛成功`,
            ],
            fillLine: `└── 更新 effort[0][1] 并压入优先队列 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '向下探测相邻格 (1, 0)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">边权落差</span>',
            detailLines: [
              `│  ① 计算绝对落差：diff = |height[0][0] - height[1][0]|`,
              `│  ② MiniMax 状态转移：nextEffort = max(effort[0][0], diff) = diff`,
              `│  ③ 满足 nextEffort < effort[1][0] (∞)：松弛成功`,
            ],
            fillLine: `└── 更新 effort[1][0] 并压入优先队列 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【优先队列扩展 轮次 2】贪心选择全局瓶颈落差最小的分支向前推移',
        subtitle: '排除绕远高落差分支',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '小根堆堆顶节点优先出队',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">⛰️ 贪心扩展</span>',
            detailLines: [
              `│  ① 优先探索落差更平缓的地势，阻断陡峭山峰方向`,
              `│  ② 若某邻格已被更小瓶颈访问过，自动跳过（非严格更优不松弛）`,
            ],
            fillLine: `└── 持续沿平缓山谷推进 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: `终点出队锁定判定 (${targetR}, ${targetC})`,
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🏁 达到最优</span>',
            detailLines: [
              `│  ① Dijkstra 性质保证：当终点节点首次作为堆顶被 poll() 时，其 effort 必为全局最小值`,
              `│  ② 算法立即提前退出，无需遍历剩余高落差节点`,
            ],
            fillLine: `└── 搜索提前收敛，返回最终瓶颈体力 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(rounds.join(''), 'Dijkstra 堆优化 · O(MN log(MN)) 最优复杂度');

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: `return effort[${targetR}][${targetC}];`,
      answerDescription: '已找到全局体力消耗最小路径，返回终点最终瓶颈落差值 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
