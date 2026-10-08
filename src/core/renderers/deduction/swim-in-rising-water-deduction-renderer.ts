/**
 * LeetCode 778: 水位上升的泳池中游泳 · 全景推演树渲染策略 (SwimInRisingWaterDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SwimInRisingWaterDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'swim-in-rising-water';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'swim-in-rising-water' ||
      modelId === 'swim-in-water' ||
      modelId === 'leetcode-778' ||
      modelId === 'class064-code03'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(5, options.m ?? 3));
    const cols = Math.max(3, Math.min(5, options.n ?? 3));
    const targetR = rows - 1;
    const targetC = cols - 1;

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 778. 水位上升的泳池中游泳 · 全景推演树',
      badge: 'MiniMax 水位瓶颈 · Dijkstra 优先队列定向淹没',
      descriptionHtml: `
        游泳池网格地形 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，从左上角 (0, 0) 前往右下角 (${targetR}, ${targetC})。<br/>
        <span class="font-bold text-slate-800">MiniMax 瓶颈模型</span>：任何时刻泳者只能游入海拔 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded">h ≤ t</code> 的格子。整条路径所需的最短等待时间为路径上海拔的<span class="font-bold text-indigo-700">最大值 (Max 海拔)</span>；目标是寻找所有路径中等待时间的<span class="font-bold text-indigo-700">最小值 (Min 瓶颈)</span>。<br/>
        松弛方程：<code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">nextTime = max(curTime, grid[nr][nc])</code>。<br/>
        小根堆维护波前已发现但尚未淹没的边界格，每次弹出当前时间最小的格向前漫延。
      `,
      initialStateText: `起点 dist[0][0] = grid[0][0]，其余单元格初始时间置为 ∞。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '起点 (0, 0) 基准初始化：必须等待水位上涨到起点自身海拔',
        valuesStr: 'dist[0][0] = grid[0][0], PriorityQueue.push((0,0), time=grid[0][0])',
      },
      {
        prefix: '└───',
        label: `终点锁定 (${targetR}, ${targetC})：初始等待时间设为正无穷`,
        valuesStr: `dist[${targetR}][${targetC}] = ∞`,
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【波前推进 轮次 1】从优先队列弹出最小水位节点 (0, 0)',
        subtitle: 'Dijkstra 优先队列定向漫延',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '向右探测相邻格 (0, 1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">水位瓶颈</span>',
            detailLines: [
              `│  ① 读取目标格海拔：h = grid[0][1]`,
              `│  ② MiniMax 状态转移：<span class="font-bold text-indigo-700">nextTime = max(dist[0][0], h)</span>`,
              `│  ③ 满足 nextTime < dist[0][1] (∞)：松弛成功`,
            ],
            fillLine: `└── 更新 dist[0][1] 并压入优先队列 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '向下探测相邻格 (1, 0)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">水位瓶颈</span>',
            detailLines: [
              `│  ① 读取目标格海拔：h = grid[1][0]`,
              `│  ② MiniMax 状态转移：nextTime = max(dist[0][0], h)`,
              `│  ③ 满足 nextTime < dist[1][0] (∞)：松弛成功`,
            ],
            fillLine: `└── 更新 dist[1][0] 并压入优先队列 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【优先队列扩展 轮次 2】水漫金山：贪心选择当前水位最低的洼地向四周漫延',
        subtitle: '阻断高耸山峰扩散',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '小根堆堆顶节点出队',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-cyan-100 text-cyan-800 rounded font-bold">🌊 漫延波前</span>',
            detailLines: [
              `│  ① 总是沿当前海拔最低的通道漫延，如同水流自适应寻找阻力最小的缝隙`,
              `│  ② 若某邻格已被更低水位访问过，跳过（保证无冗余重算）`,
            ],
            fillLine: `└── 波前动态向前扩展 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: `终点出队锁定判定 (${targetR}, ${targetC})`,
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🏁 达到最优</span>',
            detailLines: [
              `│  ① Dijkstra 性质保证：当终点首次出堆时，其 dist 即为全局最小瓶颈水位`,
              `│  ② 算法立即提前退出，无需遍历剩余未淹没的高海拔山峰`,
            ],
            fillLine: `└── 搜索提前收敛，返回最终所需最少等待时间 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'Dijkstra 堆优化 · O(N² log N) 最优复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: `return dist[${targetR}][${targetC}];`,
      answerDescription: '已成功游抵右下角终点，返回最少需要等待的水位上涨时间 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}

