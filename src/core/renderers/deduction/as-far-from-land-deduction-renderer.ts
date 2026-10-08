/**
 * LeetCode 1162: 地图分析 (离陆地最远的水域) · 全景推演树渲染策略 (AsFarFromLandDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class AsFarFromLandDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'as-far-from-land';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'as-far-from-land' ||
      modelId === 'as-far-from-land-062' ||
      modelId === 'map-analysis-1162' ||
      modelId === 'leetcode-1162'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(5, options.m ?? 3));
    const cols = Math.max(3, Math.min(5, options.n ?? 3));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 1162. 地图分析 (离陆地最远的水域) · 全景推演树',
      badge: '逆向多源广搜 · 曼哈顿距离同心圆波前扩散 (Multi-Source BFS)',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，寻找距离陆地最远的水域格子的曼哈顿距离。<br/>
        <span class="font-bold text-slate-800">逆向多源 BFS</span>：若从每个水域独立搜索陆地，复杂度高达 <code class="font-mono bg-rose-50 text-rose-800 px-1 py-0.5 rounded">O(N⁴)</code>；<br/>
        反向思维：<span class="font-bold text-indigo-700">将所有陆地视作同一起跑线的初始源点</span>并发压入队列，如同水波同心圆一般向海洋同步漫延扩散。<br/>
        最后一批被水波触及的海洋格，其扩散轮数即为全局离陆地最远的最短距离，复杂度收敛至最优的 <code class="font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">O(N²)</code>。
      `,
      initialStateText: `初始检查全陆地或全海洋特判；将全部 grid[r][c] == 1 的陆地入队，dist 设为 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '全海洋特判：网格中无陆地',
        valuesStr: 'queue.isEmpty() ➔ 返回 -1（不存在陆地，无距离可言）',
      },
      {
        prefix: '├───',
        label: '全陆地特判：网格中无海洋',
        valuesStr: 'queue.size() == rows × cols ➔ 返回 -1（无海洋可言）',
      },
      {
        prefix: '└───',
        label: '多源并发入队初始化：所有陆地格并发作为第 0 层源点',
        valuesStr: 'for each land (r, c): queue.push((r, c)), dist[r][c] = 0',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【波前扩散 轮次 1】由陆地边沿向相邻水域推移第 1 层波前',
        subtitle: 'dist = 1 海洋格被浸润',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '陆地格出队，四向探查相邻格 (nr, nc)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">🌊 1级波前</span>',
            detailLines: [
              `│  ① 遭遇相邻海洋格 (dist == -1)`,
              `│  ② 松弛距离：<span class="font-bold text-indigo-700">dist[nr][nc] = dist[r][c] + 1 = 1</span>`,
              `│  ③ 将新浸润的海洋格压入队列末尾`,
            ],
            fillLine: `└── 海洋标记 dist=1 并入队 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【逐层推进 终极波前】持续扩散直至队列完全清空',
        subtitle: '锁定最后被波前触达的中心深海',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '多源同心圆环层层闭包推进',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">环形向心</span>',
            detailLines: [
              `│  ① 每一轮队列中保存当前波前的所有海洋格`,
              `│  ② 保证无任何后退和多余计算，每格仅被访问入队 1 次`,
            ],
            fillLine: `└── 波前层层向中心深海收缩 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '队列耗尽：最后一批出队格子的距离即为最大距离',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🏁 达到极限</span>',
            detailLines: [
              `│  ① BFS 层次性定理保证：最后出队格子的 dist 必为所有海洋中与最近陆地距离的最大值`,
            ],
            fillLine: `└── 捕获全局最大曼哈顿距离 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '多源 BFS 层级扩散 · O(N²) 最优时间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return maxDistance;',
      answerDescription: '已找到离所有陆地最深的水域格子，返回其最短曼哈顿距离最大值 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
