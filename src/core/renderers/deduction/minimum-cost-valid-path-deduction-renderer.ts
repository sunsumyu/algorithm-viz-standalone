/**
 * LeetCode 1368: 使网格图至少有一条有效路径的最小代价 · 全景推演树渲染策略 (MinimumCostValidPathDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MinimumCostValidPathDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'minimum-cost-valid-path';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'minimum-cost-valid-path' ||
      modelId === 'minimum-cost-valid-path-062' ||
      modelId === 'valid-path-1368' ||
      modelId === 'class062-code04' ||
      modelId === 'leetcode-1368'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(5, options.m ?? 3));
    const cols = Math.max(3, Math.min(5, options.n ?? 3));
    const targetR = rows - 1;
    const targetC = cols - 1;

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 1368. 有效路径的最小代价 (0-1 BFS) · 全景推演树',
      badge: '网格箭头规约 · 顺向0权插队头 / 逆向1权插队尾',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，从起点 (0,0) 前往终点 (${targetR},${targetC})。<br/>
        每个格子刻有箭头指示方向：1-东，2-西，3-南，4-北。修改任意格子箭头需花费 <span class="font-bold text-rose-700">代价 1</span>。<br/>
        <span class="font-bold text-slate-800">0-1 BFS 数学规约</span>：<br/>
        ① 沿着格子自带箭头前进：无需修改方向，<span class="font-bold text-emerald-700">边权 = 0 ➔ 插入双端队列队头 (addFirst)</span>；<br/>
        ② 转向其他三个方向：需要消耗 1 次修改，<span class="font-bold text-blue-700">边权 = 1 ➔ 插入双端队列队尾 (addLast)</span>。<br/>
        双端队列天然维持代价非降序，免去 Dijkstra 堆排开销，在线性 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">O(MN)</code> 时间内收敛。
      `,
      initialStateText: `起点 dist[0][0] = 0 入双端队列队头，其余单元格代价初始置为 ∞。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '起点 (0, 0) 初始化：初始位移修改代价为 0',
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
        title: '【0 权边顺向漂移】顺应当前格自带箭头前进',
        subtitle: '修改代价 0 · 插队头优先漫延',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '探测箭头自然指向的相邻格',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">0权 队头</span>',
            detailLines: [
              `│  ① 方向一致无需改变箭头：cost = 0`,
              `│  ② 距离松弛：<span class="font-bold text-indigo-700">dist[nr][nc] = dist[r][c] + 0 = dist[r][c]</span>`,
              `│  ③ 插入队头：<span class="font-bold text-emerald-700">deque.addFirst((nr, nc))</span>`,
            ],
            fillLine: `└── 顺水推舟零代价延展 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【1 权边改向惩罚】强行修改箭头走向其余三个方向',
        subtitle: '修改代价 1 · 插队尾下一轮探索',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '探测不同于箭头的另外三个分支',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">1权 队尾</span>',
            detailLines: [
              `│  ① 改变箭头朝向：cost = 1`,
              `│  ② 距离松弛：<span class="font-bold text-indigo-700">dist[nr][nc] = dist[r][c] + 1</span>`,
              `│  ③ 插入队尾：<span class="font-bold text-blue-700">deque.addLast((nr, nc))</span>`,
            ],
            fillLine: `└── 代价+1，排入队尾次序处理 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: `终点首次自队头出队 (${targetR}, ${targetC})`,
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🏁 达到最优</span>',
            detailLines: [
              `│  ① 0-1 BFS 单调性保证：终点首次从队头出队时，其 dist 必为使网格连通的全局最小修改代价`,
            ],
            fillLine: `└── 全局最少箭头修改次数确定，立即提前退出 ✅`,
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
      answerDescription: '已成功在右下角建立有效路径，返回修改箭头的全局最少代价 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
