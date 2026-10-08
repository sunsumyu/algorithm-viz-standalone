/**
 * 孤岛总面积 (Total Island Area) · 全景推演树渲染策略 (TotalIslandAreaDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TotalIslandAreaDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'total-island-area';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'total-island-area' ||
      modelId === 'isolated-islands-sum' ||
      modelId === 'island-total-area'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(5, options.m ?? 4));
    const cols = Math.max(3, Math.min(5, options.n ?? 5));

    const header = DeductionBoardPrimitives.renderHeader({
      title: '孤岛总面积 (Total Island Area) · 全景推演树',
      badge: '网格连通分量 DFS · 多连通块面积累加与状态归一化',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，统计所有陆地连通块的总面积与分布特征。<br/>
        由水平或垂直方向相连的陆地组成独立岛屿，所有岛屿面积总和即为网格中所有陆地格子总数。<br/>
        <span class="font-bold text-slate-800">推演核心机制</span>：<br/>
        ① <span class="font-bold text-indigo-700">双重循环扫描</span>：逐行逐列探测网格单元，遇未访问陆地 <code>1</code> 时启动新连通块探索；<br/>
        ② <span class="font-bold text-emerald-700">四向递归漫延</span>：深度优先搜索向上下左右扩展，每探访一个有效陆地单元 <code>currentArea++</code>；<br/>
        ③ <span class="font-bold text-sky-700">全局面积归约</span>：连通块探索完毕后汇总累加 <code>totalArea += currentArea</code>。
      `,
      initialStateText: `网格大小 ${rows}×${cols}，totalArea = 0, islandCount = 0，准备开启网格逐格扫描。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '水域过滤基底：grid[r][c] == 0',
        valuesStr: '非陆地单元，直接跳过不作处理',
      },
      {
        prefix: '├───',
        label: '访问去重基底：visited[r][c] == true',
        valuesStr: '已被既有连通块归集，防止死循环与重复计数',
      },
      {
        prefix: '└───',
        label: '越界阻断基底：r < 0 || r >= rows || c < 0 || c >= cols',
        valuesStr: '超出地形网格边界，递归安全终止并返回 0',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【扫描探测】双重循环逐行逐列扫描发现全新岛屿种子',
        subtitle: 'grid[r][c] == 1 && !visited[r][c]',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '捕获新连通块起始点 (r, c)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">🌱 新连通块</span>',
            detailLines: [
              `│  ① 递增岛屿计数器：islandCount++`,
              `│  ② 初始化单岛面积：currentArea = 0`,
              `│  ③ 压入递归栈发起深搜：dfs(r, c)`,
            ],
            fillLine: `└── 启动连通分量探索 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【四向深搜】递归推进与单岛面积累加',
        subtitle: 'visited[r][c] = true, area++',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '标记当前陆地并四向扩散',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">➕ 面积累计</span>',
            detailLines: [
              `│  ① 标记当前单元：visited[r][c] = true`,
              `│  ② 单岛面积累加：area = 1 + dfs(上) + dfs(下) + dfs(左) + dfs(右)`,
              `│  ③ 规避反向回溯与环形走访`,
            ],
            fillLine: `└── 单岛连通分支完全闭合 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '连通块结算与总面积累加',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">📊 全局归纳</span>',
            detailLines: [
              `│  ① 结算当前岛屿面积：currentArea`,
              `│  ② 累加至全图总面积：totalArea += currentArea`,
            ],
            fillLine: `└── 连通分量归纳完成 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '全图线性扫描 · O(M × N) 复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return totalArea;',
      answerDescription: '全图连通分量探索完毕，输出所有独立岛屿的总面积 totalArea ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
