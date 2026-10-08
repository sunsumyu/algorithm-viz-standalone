/**
 * LeetCode 2290: 0-1 BFS 到达角落移除障碍物的最小数目 · 全景推演树渲染策略 (MinimumObstaclesDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MinimumObstaclesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'minimum-obstacles';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'minimum-obstacles' ||
      modelId === 'minimum-obstacles-062' ||
      modelId === 'obstacle-removal-2290' ||
      modelId === 'bfs-01-deque' ||
      modelId === 'class062-code03' ||
      modelId === 'leetcode-2290'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(5, options.m ?? 3));
    const cols = Math.max(3, Math.min(5, options.n ?? 3));
    const targetR = rows - 1;
    const targetC = cols - 1;

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 2290. 移除障碍物的最小数目 (0-1 BFS) · 全景推演树',
      badge: '双端队列 (Deque) · 0权插队头 / 1权插队尾 · O(MN) 线性最短路',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，从起点 (0,0) 前往终点 (${targetR},${targetC})。<br/>
        单元格 <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded">0</code> 为空地，<code class="font-mono bg-rose-50 text-rose-800 px-1 py-0.5 rounded">1</code> 为障碍物。<br/>
        <span class="font-bold text-slate-800">0-1 BFS 单调性维护</span>：<br/>
        ① 移动至空地（边权=0）：代价不增，<span class="font-bold text-emerald-700">插到双端队列队头 (addFirst)</span>，立即优先扩展；<br/>
        ② 移动至障碍（边权=1）：代价+1，<span class="font-bold text-blue-700">插到双端队列队尾 (addLast)</span>，排入后序轮次。<br/>
        队列始终维持严格单调递增，免除优先队列 $O(\\log N)$ 堆排序开销。
      `,
      initialStateText: `起点 dist[0][0] = 0 入队头，其余单元格距离初始化为 ∞。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '起点 (0, 0) 初始化：无障碍破坏，初始代价为 0',
        valuesStr: 'dist[0][0] = 0, deque.push_front((0, 0))',
      },
      {
        prefix: '└───',
        label: `终点 (${targetR}, ${targetC})：初始阻隔代价设为无穷大`,
        valuesStr: `dist[${targetR}][${targetC}] = ∞`,
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【0 权边松弛 零代价优先】探查相连空地格 (nr, nc)',
        subtitle: '代价不变 · 插队头',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '遇到空地：grid[nr][nc] == 0',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">0权 队头</span>',
            detailLines: [
              `│  ① 距离状态转移：<span class="font-bold text-indigo-700">dist[nr][nc] = dist[r][c] + 0 = dist[r][c]</span>`,
              `│  ② 双端队列插头：<span class="font-bold text-emerald-700">deque.addFirst((nr, nc))</span>`,
            ],
            fillLine: `└── 零代价优先插队头 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【1 权边松弛 穿透障碍】探查相连障碍格 (nr, nc)',
        subtitle: '代价加一 · 插队尾',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '遇到障碍：grid[nr][nc] == 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">1权 队尾</span>',
            detailLines: [
              `│  ① 距离状态转移：<span class="font-bold text-indigo-700">dist[nr][nc] = dist[r][c] + 1</span>`,
              `│  ② 双端队列插尾：<span class="font-bold text-blue-700">deque.addLast((nr, nc))</span>`,
            ],
            fillLine: `└── 破坏障碍代价+1，排入队尾 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: `终点首次自队头出队判定 (${targetR}, ${targetC})`,
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🏁 达到最优</span>',
            detailLines: [
              `│  ① BFS 单调性保证：终点首次弹出时，其 dist 必定为全局最少需要移除的障碍物数目`,
            ],
            fillLine: `└── 最短路径锁定，算法立即收敛退出 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '0-1 BFS 双端队列 · O(M × N) 线性时间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: `return dist[${targetR}][${targetC}];`,
      answerDescription: '已成功抵达右下角终点，返回移除障碍物的全局最小数目 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
