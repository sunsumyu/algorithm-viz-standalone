/**
 * LeetCode 200: 岛屿数量 · 全景推演树渲染策略 (IslandsDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class IslandsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'islands';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'islands' ||
      modelId === 'islands-dfs' ||
      modelId === 'number-of-islands' ||
      modelId === 'leetcode-200' ||
      modelId === 'class029-code01'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(6, options.m ?? 4));
    const cols = Math.max(3, Math.min(6, options.n ?? 5));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 200. 岛屿数量 (Number of Islands) · 全景推演树',
      badge: '连通分量探索 · DFS/BFS 沉岛标记法 (Sinking Islands)',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，单元格 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">'1'</code> 代表陆地，<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">'0'</code> 代表水域。<br/>
        <span class="font-bold text-slate-800">沉岛遍历原理</span>：遍历网格每一个格子，当首次遭遇陆地 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">grid[r][c] == '1'</code> 时，说明探测到一座全新独立岛屿：<span class="font-bold text-indigo-700">count++</span>。<br/>
        随即以此为种子点展开 <span class="font-bold text-indigo-700">DFS 扩散染色</span>：顺着上、下、左、右四个连通分支，将该连通块内所有相连陆地<span class="font-bold text-rose-700">就地覆写为 '0'（沉没）</span>，杜绝重复计数。
      `,
      initialStateText: `初始岛屿计数器 count = 0，全局扫描指针自 (0, 0) 开始逐行推进。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界阻断基准：越界判断',
        valuesStr: 'r < 0 || r >= rows || c < 0 || c >= cols ➔ 直接 return',
      },
      {
        prefix: '└───',
        label: '水域/已沉没基准：非陆地阻断',
        valuesStr: "grid[r][c] != '1' ➔ 直接 return，阻断无效搜索",
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【全局扫描 触发新岛】在网格中首次遭遇陆地格 (r, c)',
        subtitle: '发现新独立连通块',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '外层循环命中陆地：grid[r][c] == 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🏝️ 计数递增</span>',
            detailLines: [
              `│  ① 独立连通块计数：<span class="font-bold text-emerald-700">count++</span>`,
              `│  ② 启动深度优先辐射：以 (r, c) 为根节点调用 dfs(r, c)`,
            ],
            fillLine: `└── count 增加，发起沉岛递归 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【DFS 沉岛连通树】四向辐射与就地沉没 (Flood Fill 递归展开)',
        subtitle: '连通分量闭包浸没',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '原位染色沉没：grid[r][c] = 0',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">🌊 就地沉岛</span>',
            detailLines: [
              `│  ① 将当前单元格就地置为 0，防止四向递归反向死循环`,
              `│  ② 省略额外的 visited[][] 空间开销，空间复杂度收敛至 O(递归深度)`,
            ],
            fillLine: `└── 陆地已沉没为水域 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '向上、下四向分支探针：dfs(r - 1, c) & dfs(r + 1, c)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">↕️ 纵向延伸</span>',
            detailLines: [
              `│  ① 递归探测上方格：若为陆地，深入其子树并将其沉没`,
              `│  ② 递归探测下方格：若为陆地，深入其子树并将其沉没`,
            ],
            fillLine: `└── 纵向相连陆地全数归零 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '向左、右四向分支探针：dfs(r, c - 1) & dfs(r, c + 1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">↔️ 横向延伸</span>',
            detailLines: [
              `│  ① 递归探测左侧格：将其所属陆地分枝全数沉没`,
              `│  ② 递归探测右侧格：将其所属陆地分枝全数沉没`,
            ],
            fillLine: `└── 横向连通全部浸没，整座岛屿化为水域 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【扫描闭环 最终结果】全局网格双重循环扫描结束',
        subtitle: '全部单元格已遍历完毕',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '所有连通块已完全被归一化',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">🏁 扫描完毕</span>',
            detailLines: [
              `│  ① 网格已无孤立未处理陆地`,
              `│  ② 每个独立连通块在首次遇到其入口时已被严格计数 1 次`,
            ],
            fillLine: `└── 最终独立连通岛屿总数确定 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'DFS 沉岛遍历 · O(M × N) 时间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return count;',
      answerDescription: '已完成整张网格图的连通块探查，返回独立岛屿总计数 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
