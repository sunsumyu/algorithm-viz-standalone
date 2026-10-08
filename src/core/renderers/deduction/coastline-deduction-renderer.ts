/**
 * LeetCode 463: 岛屿的周长 · 全景推演树渲染策略 (CoastlineDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CoastlineDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'coastline';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'coastline' ||
      modelId === 'island-perimeter' ||
      modelId === '463' ||
      modelId === 'leetcode-463'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(5, options.m ?? 4));
    const cols = Math.max(3, Math.min(5, options.n ?? 4));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 463. 岛屿的周长 (Island Perimeter) · 全景推演树',
      badge: '边界与水域判定 · 4 邻域暴露边累加',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，求由格子完全相连构成的岛屿的总周长。<br/>
        <span class="font-bold text-slate-800">海岸线边界贡献模型</span>：<br/>
        从每个陆地格 (r, c) 向四个方向（上、下、左、右）探测：<br/>
        ① 触碰网格物理边界（越界）：必然暴露在外部空气/海洋中，<span class="font-bold text-rose-700">边长贡献 +1</span>；<br/>
        ② 遭遇水域格 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded">0</code>：构成岛屿海岸线，<span class="font-bold text-rose-700">边长贡献 +1</span>；<br/>
        ③ 遭遇相邻陆地格 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded">1</code>：内部陆地相互遮挡，<span class="font-bold text-slate-500">边长贡献 +0</span>。
      `,
      initialStateText: `初始总周长 perimeter = 0，扫描指针从 (0, 0) 开始逐格探查。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '越界物理边界准则：r < 0 || r >= rows || c < 0 || c >= cols',
        valuesStr: '跨出网格外围 ➔ 暴露为边界边，周长贡献 +1 ✅',
      },
      {
        prefix: '└───',
        label: '水域岸线准则：grid[r][c] == 0',
        valuesStr: '陆地与水面交界 ➔ 暴露为海岸线，周长贡献 +1 ✅',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【单格四向探查】对陆地格 (r, c) 独立计算 4 邻域暴露边',
        subtitle: '每个陆地自身最多贡献 4 条边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '探测上方/下方边界邻格',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">↕️ 纵向边</span>',
            detailLines: [
              `│  ① 若上方为水域或越界：暴露上边缘，perimeter += 1`,
              `│  ② 若下方为水域或越界：暴露下边缘，perimeter += 1`,
            ],
            fillLine: `└── 纵向暴露边累加完毕 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '探测左方/右方边界邻格',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">↔️ 横向边</span>',
            detailLines: [
              `│  ① 若左方为水域或越界：暴露左边缘，perimeter += 1`,
              `│  ② 若右方为水域或越界：暴露右边缘，perimeter += 1`,
            ],
            fillLine: `└── 横向暴露边累加完毕 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【全局相交去重 整体闭包】4 × 陆地数 - 2 × 相邻重合边',
        subtitle: '全局代数几何等价化简',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '每存在一对相邻陆地，内部抵消 2 条重叠边',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">等价公式</span>',
            detailLines: [
              `│  ① 等价公式：<span class="font-bold text-indigo-700">perimeter = 4 × lands - 2 × connectedEdges</span>`,
              `│  ② 扫描全图后自动收敛为唯一封闭周长`,
            ],
            fillLine: `└── 闭环周长锁定 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '网格单遍扫描 / DFS 遍历 · O(M × N) 线性时间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return perimeter;',
      answerDescription: '整座岛屿的所有海岸线与外围暴露边统计完毕，返回总周长 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
