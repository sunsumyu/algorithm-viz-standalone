/**
 * LeetCode 130: 被围绕的区域 / 沉没孤岛 · 全景推演树渲染策略 (SinkIslandsDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SinkIslandsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sink-islands';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sink-islands' ||
      modelId === 'surrounded-regions-130' ||
      modelId === 'surrounded-regions' ||
      modelId === '130' ||
      modelId === 'leetcode-130' ||
      modelId === 'class058-code03'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(5, options.m ?? 4));
    const cols = Math.max(3, Math.min(5, options.n ?? 4));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 130. 被围绕的区域 / 沉没孤岛 · 全景推演树',
      badge: '逆向思维 · 边界洪水浸润保护与内陆孤岛就地淹没',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，将所有被水域（或 'X'）完全围绕的孤立陆地（或 'O'）沉没。<br/>
        任何边界上的陆地都不会被沉没，且与边界陆地相连的陆地同样免于沉没（边缘保护区）。<br/>
        <span class="font-bold text-slate-800">逆向思维两阶段解法</span>：<br/>
        ① <span class="font-bold text-indigo-700">第一阶段 (边界保护染色)</span>：从四条外围边界上的陆地出发做 DFS，将所有连通边界的陆地临时标记为 <code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">2 (保护态)</code>；<br/>
        ② <span class="font-bold text-rose-700">第二阶段 (全局规约重置)</span>：全图遍历，未被保护的残留陆地必然为内陆孤岛，<span class="font-bold text-rose-700">就地淹没为 0</span>；保护态 2 恢复为普通陆地 1。
      `,
      initialStateText: `识别边界四条边，准备从所有处于边缘的陆地发起保护性 DFS 染色。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界四边定位准则：r == 0 || r == rows - 1 || c == 0 || c == cols - 1',
        valuesStr: '若处于边界且 grid[r][c] == 1 ➔ 作为安全种子发起保护性 DFS',
      },
      {
        prefix: '└───',
        label: '内陆未知准则：非边界陆地初始状态未知',
        valuesStr: '若无法被边界波前触及，最终必然被全面包围淹没',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一：边界保护染色】四向递归漫延所有连通边界的安全陆地',
        subtitle: 'grid[r][c] = 1 ➔ 2 (安全闭包)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '边界种子点入栈并置为保护态 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">🛡️ 保护态</span>',
            detailLines: [
              `│  ① 标记当前边界陆地：grid[r][c] = 2`,
              `│  ② 向内陆四向相连陆地递归推进：dfs(nr, nc)`,
            ],
            fillLine: `└── 边界安全闭包建立完毕 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二：全局扫描判定】内陆孤岛就地淹没，边界保护态复原',
        subtitle: '双状态解封与沉没',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '扫描遇保护态：grid[r][c] == 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">复原陆地</span>',
            detailLines: [
              `│  ① 成功连接至外层边界，免于淹没`,
              `│  ② 状态还原：<span class="font-bold text-emerald-700">grid[r][c] = 1</span>`,
            ],
            fillLine: `└── 安全陆地成功保全 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '扫描遇内陆孤岛：grid[r][c] == 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">🌊 孤岛沉没</span>',
            detailLines: [
              `│  ① 未被任何边界波前触达，证明已被水域彻底环绕阻断`,
              `│  ② 就地沉没：<span class="font-bold text-rose-700">grid[r][c] = 0</span>`,
            ],
            fillLine: `└── 被围绕孤岛彻底淹没 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '两阶段扫描 · O(M × N) 线性时间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return grid;',
      answerDescription: '网格内陆孤岛已全数沉没，边界陆地已恢复，输出最终浸润后网格 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
