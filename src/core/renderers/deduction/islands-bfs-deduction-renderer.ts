/**
 * LeetCode 200: 岛屿数量 (BFS 队列波浪扩散) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class IslandsBfsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'islands-bfs';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'islands-bfs' ||
      modelId === 'number-of-islands-bfs' ||
      modelId === 'leetcode-200-bfs'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(6, options.m ?? 4));
    const cols = Math.max(3, Math.min(6, options.n ?? 5));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 200. 岛屿数量 (BFS 队列扩散) · 全景推演树',
      badge: '广度优先搜索 · FIFO 队列波浪式浸润沉岛 (Queue Wave Diffusion)',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，单元格 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">'1'</code> 代表陆地，<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">'0'</code> 代表水域。<br/>
        <span class="font-bold text-slate-800">入队即染色原则（内存与防重核心）</span>：遍历网格遭遇陆地 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">grid[r][c] == '1'</code> 时，触发新岛 <span class="font-bold text-emerald-700">count++</span>。<br/>
        种子格立即就地置零 <code class="font-mono bg-rose-50 text-rose-800 px-1 py-0.5 rounded font-bold">grid[r][c] = '0'</code> 并入队 <span class="font-bold text-indigo-700">queue.offer([r, c])</span>。<br/>
        在出队扫描四周时，凡是邻居陆地均必须在<span class="font-bold text-rose-700">入队那一瞬间立即沉没</span>，杜绝多个相邻节点重复入队引发的队列膨胀。
      `,
      initialStateText: `初始岛屿计数 count = 0，辅助队列 Queue 为空，全局指针从 (0, 0) 开始逐行推进。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '四邻入队前阻断基准：边界与水域校验',
        valuesStr: 'nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] != \'1\' ➔ 阻断入队',
      },
      {
        prefix: '└───',
        label: '单岛扩散终止基准：队列排空',
        valuesStr: 'queue.isEmpty() ➔ 当前连通块波浪扩散彻底闭合，岛屿全数沉没',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【全局扫描 触发新岛】在双重循环中首次遭遇陆地种子点 (r, c)',
        subtitle: '发现新独立连通块并初始化 BFS 队列',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '外层循环命中陆地：grid[r][c] == 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🏝️ 计数递增</span>',
            detailLines: [
              `│  ① 独立连通块计数：<span class="font-bold text-emerald-700">count++</span>`,
              `│  ② 入队即沉没：<span class="font-bold text-rose-700">grid[r][c] = 0</span>，防止后续其他邻居重复入队`,
              `│  ③ 种子入队：<span class="font-bold text-indigo-700">queue.offer([r, c])</span>，开启 BFS 波浪扩散`,
            ],
            fillLine: `└── count 增加，种子入队启动 BFS 队列 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【BFS 队列波浪扩散】队首出队与四向邻居即时沉没 (FIFO 逐层推进)',
        subtitle: '层级水波式漫延与连通块闭包',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '队首出队：cur = queue.poll()',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">📤 出队扫描</span>',
            detailLines: [
              `│  ① 获取当前中心格坐标 (curR, curC)`,
              `│  ② 准备向四周 [0,1], [1,0], [0,-1], [-1,0] 发起四向探测`,
            ],
            fillLine: `└── 队首出队完成，准备探测四邻 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '四向邻居探测：命中陆地 grid[nr][nc] == 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">🌊 即时沉没</span>',
            detailLines: [
              `│  ① 关键动作：在加入队列前立即将邻居置为 0（grid[nr][nc] = 0）`,
              `│  ② 将邻居推入队尾：queue.offer([nr, nc])`,
              `│  ③ 杜绝重复入队：保证同一单元格在全生命周期内最多入队 1 次`,
            ],
            fillLine: `└── 邻居入队并就地沉没，波浪扩散一层 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '队列排空：queue.isEmpty() == true',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">⏹️ 连通块闭合</span>',
            detailLines: [
              `│  ① 当前连通块内所有相连陆地已完全浸没`,
              `│  ② BFS 循环结束，控制权交回外层双重循环继续扫描`,
            ],
            fillLine: `└── 当前岛屿完全沉没，闭合当前连通块 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【双重扫描闭环 最终结果】全局网格所有单元格扫描完毕',
        subtitle: '全域水域化与总计数归纳',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '全图陆地已完全被波浪浸润',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">🏁 扫描完毕</span>',
            detailLines: [
              `│  ① 每一个独立连通岛屿在其首个种子点处均且仅被计数 1 次`,
              `│  ② 网格内已无任何未被发现的孤立陆地`,
            ],
            fillLine: `└── 最终独立连通岛屿总数确定 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'BFS 队列波浪扩散 · O(M × N) 时间复杂度 / O(min(M, N)) 空间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return count;',
      answerDescription: '网格连通分量探索完毕，返回 BFS 统计所得岛屿总数 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
