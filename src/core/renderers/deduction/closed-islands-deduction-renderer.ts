/**
 * LeetCode 1254: 统计封闭岛屿的数目 · 全景推演树渲染策略 (ClosedIslandsDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ClosedIslandsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'closed-islands';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'closed-islands' ||
      modelId === 'number-of-closed-islands' ||
      modelId === 'leetcode-1254' ||
      modelId === '1254'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(6, options.m ?? 5));
    const cols = Math.max(3, Math.min(8, options.n ?? 8));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 1254. 统计封闭岛屿的数目 (Closed Islands) · 全景推演树',
      badge: '双阶段泛洪浸没 · 边界逆向消除与内陆闭包计数 (Two-Phase Flood Fill)',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，单元格 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">'0'</code> 代表陆地，<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">'1'</code> 代表水域。<br/>
        <span class="font-bold text-slate-800">封闭岛屿定义</span>：被水域 1 完全包围的 0 连通块，其任何陆地单元格均<strong>不能接触网格四周边框</strong>。<br/>
        <span class="font-bold text-slate-800">破局核心</span>：接触边界的连通陆地绝对无法封闭。因此第一阶段先沿网格四周四条边界发起 DFS，将所有靠边连通块<span class="font-bold text-rose-700">就地淹没为 1</span>；第二阶段遍历网格内部，剩下的陆地连通块必然都是 <span class="font-bold text-indigo-700">100% 封闭的纯净孤岛</span>！
      `,
      initialStateText: `初始封闭计数 count = 0，先遍历 4 条边界清理伪孤岛，再遍历内陆闭包统计。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界阻断基准：越界判断',
        valuesStr: 'r < 0 || r >= rows || c < 0 || c >= cols ➔ 直接 return',
      },
      {
        prefix: '└───',
        label: '水域/已淹没阻断基准：非陆地阻断',
        valuesStr: 'grid[r][c] == 1 ➔ 水域或已沉没，直接 return，阻断无效搜索',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一：边界泛洪淹没】沿网格 4 条外边界定向排除伪孤岛',
        subtitle: '四周边框连通陆地原位淹没为 1',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '左右边界扫描：第 0 列与第 cols-1 列',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">🌊 边界清淤</span>',
            detailLines: [
              `│  ① 若 grid[r][0] == 0 或 grid[r][cols-1] == 0：发起 dfs(r, c)`,
              `│  ② 递归沿上下左右连通陆地，全部原位覆写为 1（水域）`,
              `│  ③ 消除所有与左右边界接壤的非封闭连通块`,
            ],
            fillLine: `└── 左右外侧暴露陆地全数淹没 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '上下边界扫描：第 0 行与第 rows-1 行',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">🌊 边界清淤</span>',
            detailLines: [
              `│  ① 若 grid[0][c] == 0 或 grid[rows-1][c] == 0：发起 dfs(r, c)`,
              `│  ② 递归淹没与上下边框相连的所有陆地`,
              `│  ③ 此时整张网格图接触外框的连通块已 100% 被消除！`,
            ],
            fillLine: `└── 外围 4 条边界全部排查完毕，网格边缘已全水域化 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二：内陆封闭岛统计】双重循环扫描内部单元格 [1..m-2][1..n-2]',
        subtitle: '锁定真正被水域环绕的封闭孤岛',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '内陆命中陆地种子点：grid[r][c] == 0',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🏝️ 发现封闭岛</span>',
            detailLines: [
              `│  ① 因外围已被清理，当前陆地不可能触及外框：<span class="font-bold text-emerald-700">count++</span>`,
              `│  ② 以 (r, c) 为根节点发起 dfs(r, c)，将其整座封闭岛全部浸没为 1`,
              `│  ③ 防止同一座封闭岛内的其他陆地格子被后续双重循环重复计算`,
            ],
            fillLine: `└── count 递增，发起内陆封闭岛连通沉没 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '内陆 DFS 浸没四邻：dfs(r ± 1, c) & dfs(r, c ± 1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">🔄 闭合归一</span>',
            detailLines: [
              `│  ① 四向探测将当前封闭岛的所有陆地单元格原地置为 1`,
              `│  ② 该封闭连通块完全闭合，控制权返回双重循环继续内陆扫描`,
            ],
            fillLine: `└── 当前封闭岛屿已完全闭合沉没 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【双重扫描闭环 最终结果】全局网格内部所有单元格扫描完毕',
        subtitle: '封闭岛屿总数精准归约',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '全网格陆地已被清空',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">🏁 扫描完毕</span>',
            detailLines: [
              `│  ① 排除边界伪岛，所有内陆独立封闭岛均已严格计数 1 次`,
              `│  ② 最终封闭岛屿总数 count 确定`,
            ],
            fillLine: `└── 最终独立封闭岛屿总数输出确定 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '两阶段泛洪算法 · O(M × N) 时间复杂度 / O(M × N) 空间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return count;',
      answerDescription: '网格推演完毕，返回统计所得封闭岛屿总数 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
