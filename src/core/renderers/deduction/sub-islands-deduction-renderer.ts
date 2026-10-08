/**
 * LeetCode 1905: 统计子岛屿 · 全景推演树渲染策略 (SubIslandsDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SubIslandsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sub-islands';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sub-islands' ||
      modelId === 'count-sub-islands' ||
      modelId === 'leetcode-1905' ||
      modelId === '1905'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(6, options.m ?? 5));
    const cols = Math.max(3, Math.min(6, options.n ?? 5));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 1905. 统计子岛屿 (Count Sub Islands) · 全景推演树',
      badge: '双网格协同推演 · 逆向剪枝排除与合法子岛浸没 (Reverse Pruning Flood Fill)',
      descriptionHtml: `
        双矩阵地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，包含母图 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">grid1</code> 与子岛图 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">grid2</code>。<br/>
        <span class="font-bold text-slate-800">子岛屿判定契约</span>：若 grid2 中某个岛屿包含的<strong>每一个陆地格子</strong>在 grid1 中也全部为陆地，则为合法子岛。<br/>
        <span class="font-bold text-rose-700">逆向破局核心</span>：反向思考 —— 只要 grid2 中某个陆地在 grid1 中对应为水域 <code class="font-mono bg-rose-50 text-rose-800 px-1 py-0.5 rounded font-bold">grid2[r][c] == 1 && grid1[r][c] == 0</code>，则该整座连通岛屿<strong>绝不可能是子岛屿</strong>！<br/>
        因此，第一阶段发起逆向 DFS 将所有冒犯母图水域的连通块整岛淹没为 0；第二阶段剩下的所有陆地连通块，必然是 <span class="font-bold text-indigo-700">100% 合法的纯正子岛屿</span>！
      `,
      initialStateText: `初始子岛计数 count = 0，先遍历双网格执行逆向剪枝排除，再执行纯净子岛统计。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界与水域阻断基准：越界或已被淹没',
        valuesStr: 'r < 0 || r >= rows || c < 0 || c >= cols || grid2[r][c] == 0 ➔ 直接 return',
      },
      {
        prefix: '└───',
        label: '原位沉没基准：标记置零',
        valuesStr: 'grid2[r][c] = 0 ➔ 就地消除，防止连通块四向扩散反向死循环',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一：逆向剪枝排除】探测母图冲突点并整岛浸没',
        subtitle: '剔除所有包含母图水域的非子岛',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '命中冲突坐标：grid2[r][c] == 1 且 grid1[r][c] == 0',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">❌ 冲突命中</span>',
            detailLines: [
              `│  ① 当前点在子图中为陆地，但在母图中为水域！`,
              `│  ② 当前点所属整座连通岛屿丧失成为子岛屿的资格`,
              `│  ③ 立即启动逆向淹没：以 (r, c) 为根节点发起 dfs(grid2, r, c)`,
            ],
            fillLine: `└── 捕获冲突点，启动整岛剔除 DFS ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '逆向淹没连通块：四向递归全数置 0',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">🌊 整岛沉没</span>',
            detailLines: [
              `│  ① 将与该冲突点相连的所有陆地格子原地置为 0`,
              `│  ② 该整座非子岛在 grid2 中被完全清除，杜绝后续误判`,
            ],
            fillLine: `└── 当前非法岛屿已被彻底排除 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二：纯净子岛统计】扫描剩余合法陆地并归纳总数',
        subtitle: '锁定完全被母图包容的纯正子岛屿',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '扫描命中合法陆地种子点：grid2[r][c] == 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🏝️ 发现纯正子岛</span>',
            detailLines: [
              `│  ① 经历第一阶段筛选后，当前连通块所有格子在 grid1 中必全为陆地`,
              `│  ② 确认独立子岛屿：<span class="font-bold text-emerald-700">count++</span>`,
              `│  ③ 启动常规浸没：dfs(grid2, r, c) 将该子岛置零防止重复统计`,
            ],
            fillLine: `└── count 递增，发起合法子岛浸没 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '子岛闭合浸没：dfs(r ± 1, c) & dfs(r, c ± 1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">🔄 闭包归一</span>',
            detailLines: [
              `│  ① 四向扩散将当前子岛所有相连陆地覆写为 0`,
              `│  ② 当前子岛完整闭合，控制权返回双重循环继续扫描`,
            ],
            fillLine: `└── 当前子岛连通块已完全归一化 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【双阶段推演闭环 最终结果】全局网格双重循环扫描完成',
        subtitle: '子岛屿总数精准确定',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'grid2 中所有陆地已完全被判定与沉没',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">🏁 扫描完毕</span>',
            detailLines: [
              `│  ① 所有冒犯母图水域的连通块均在阶段一被剪枝排除`,
              `│  ② 所有纯净子岛屿均在阶段二被且仅被计数 1 次`,
            ],
            fillLine: `└── 最终合法子岛屿总数输出确定 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '双网格逆向剪枝 · O(M × N) 时间复杂度 / O(M × N) 空间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return count;',
      answerDescription: '双网格协同推演完毕，返回统计所得合法子岛屿总数 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
