/**
 * LeetCode 695: 岛屿的最大面积 · 全景推演树渲染策略 (MaxIslandAreaDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MaxIslandAreaDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'max-island-area';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'max-island-area' ||
      modelId === 'max-area-of-island-695' ||
      modelId === 'max-area-of-island' ||
      modelId === 'leetcode-695' ||
      modelId === 'class058-code02'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(6, options.m ?? 4));
    const cols = Math.max(3, Math.min(6, options.n ?? 5));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 695. 岛屿的最大面积 (Max Area of Island) · 全景推演树',
      badge: '连通块面积累加 · 后序归约 DFS · 全局极值动态维护',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，单元格 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">'1'</code> 代表陆地，<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">'0'</code> 代表水域。<br/>
        <span class="font-bold text-slate-800">面积累加方程</span>：对每块连通岛屿，其面积定义为该连通块内所有陆地格子的总数。<br/>
        <span class="font-bold text-slate-800">后序归约</span>：<code class="font-mono bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-bold">area = 1 + dfs(上) + dfs(下) + dfs(左) + dfs(右)</code>。<br/>
        将访问过的陆地就地置为 0（沉岛防重），并在顶层动态更新：<span class="font-bold text-indigo-700">maxArea = max(maxArea, area)</span>。
      `,
      initialStateText: `全局最大面积 maxArea 初始置为 0，扫描指针从 (0, 0) 开始逐格探查。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界阻断基准：越界判断',
        valuesStr: 'r < 0 || r >= rows || c < 0 || c >= cols ➔ 返回面积 0',
      },
      {
        prefix: '└───',
        label: '水域/已访问阻断：非陆地格',
        valuesStr: 'grid[r][c] != 1 ➔ 返回面积 0，终止该方向递归',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【全局扫描 发现陆地】在网格扫描中命中未访问陆地 (r, c)',
        subtitle: '启动该连通分量的面积探求',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '外层循环命中陆地：grid[r][c] == 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🌱 发现陆地</span>',
            detailLines: [
              `│  ① 调用 dfs(r, c) 探求整座岛屿的完整面积`,
              `│  ② 当前格子自身提供面积：<span class="font-bold text-indigo-700">base = 1</span>`,
            ],
            fillLine: `└── 启动四向后序归约递归树 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【四向后序归约推演树】展开并收集子分支面积贡献',
        subtitle: '1 + 上 + 下 + 左 + 右',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沉岛原位防重：grid[r][c] = 0',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">🚫 原位沉岛</span>',
            detailLines: [
              `│  ① 将当前格浸没为水域，防止相邻格反向调用造成死循环`,
            ],
            fillLine: `└── 防重标记完成 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '纵向子树归约：up = dfs(r-1, c), down = dfs(r+1, c)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">↕️ 纵向子树</span>',
            detailLines: [
              `│  ① 向上递归并累加上方连通陆地总数`,
              `│  ② 向下递归并累加下方连通陆地总数`,
            ],
            fillLine: `└── 纵向面积汇总完成 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '横向子树归约：left = dfs(r, c-1), right = dfs(r, c+1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">↔️ 横向子树</span>',
            detailLines: [
              `│  ① 向左递归并累加左侧连通陆地总数`,
              `│  ② 向右递归并累加右侧连通陆地总数`,
            ],
            fillLine: `└── 横向面积汇总完成 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '连通块面积闭包汇总：area = 1 + up + down + left + right',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">📊 归约汇总</span>',
            detailLines: [
              `│  ① 当前整座岛屿的最终面积完成聚合`,
              `│  ② 动态松弛全局极值：<span class="font-bold text-emerald-700">maxArea = max(maxArea, area)</span>`,
            ],
            fillLine: `└── 全局最大面积完成更新 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'DFS 后序归约 · O(M × N) 时间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return maxArea;',
      answerDescription: '网格全域扫描完毕，返回网格中所包含的最大岛屿面积值 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
