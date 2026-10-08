/**
 * LeetCode 407: 二维接雨水 II · 全景推演树渲染策略 (TrappingWaterIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TrappingWaterIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'trapping-water-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'trapping-water-ii' ||
      modelId === 'trapping-rain-water-ii' ||
      modelId === 'trap-rain-water-407' ||
      modelId === 'trapping-rain-water-ii-062'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const is3x3 = options.inputs?.['input-preset'] === 'simple_3x3';
    const grid: number[][] = is3x3
      ? [
          [3, 3, 3],
          [3, 1, 3],
          [3, 3, 3],
        ]
      : [
          [1, 4, 3, 1, 3, 2],
          [3, 2, 1, 3, 2, 4],
          [2, 3, 3, 2, 3, 1],
        ];

    const m = grid.length;
    const n = grid[0].length;
    const borderCount = 2 * m + 2 * n - 4;
    const totalWater = is3x3 ? 2 : 4;

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 407. 二维接雨水 II · 全景推演树',
      badge: '小根堆木桶短板 · 由外向内收缩',
      descriptionHtml: `
        网格地形尺寸 <span class="font-bold text-slate-800">${m} × ${n}</span>。<br/>
        核心原理：<span class="font-bold text-slate-800">木桶短板效应</span> —— 外部最矮的木板决定了内部低洼单元格的水位上限。<br/>
        状态转移：从小根堆不断弹出当前最短板 <code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">(r, c, h)</code>，向内探测未访问邻格。
        若内部邻格高度低于木桶水线，产生积水 <span class="font-bold text-indigo-700">Δw = waterLevel - height</span>；
        新水线以 <code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">max(curWater, neighborH)</code> 重新压入小根堆。
      `,
      initialStateText: `将外围四周 ${borderCount} 个边界单元格打上锁定标记并压入小根堆，累计积水 ans = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: `四周边框木板初始化：网格边界 ${borderCount} 个单元格作为初始木桶围栏入堆`,
        valuesStr: `Heap.push(四周边界, 数量=${borderCount})`,
      },
      {
        prefix: '└───',
        label: '初始化已访问表 visited[][] 与累计蓄水量 totalWater',
        valuesStr: 'visited[border]=true, totalWater=0 滴',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【波前推进 轮次 1】提取全局木桶最短板出堆',
        subtitle: '小根堆优先队列弹出堆顶',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出堆当前最短木桶板',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">🪵 最短板</span>',
            detailLines: [
              `│  ① 弹出边界单元格，获得当前有效水位线 curBoardHeight`,
              `│  ② 木桶原理保证：全网其他未出堆边界的水位均 ≥ 当前短板高度`,
            ],
            fillLine: `└── 锁定当前外围水平面，开始向内部未访问邻格探测 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '向内层邻格探测与落差判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">💧 洼地蓄水</span>',
            detailLines: [
              `│  ① 发现内部邻格高度 < 当前木桶水线：形成低洼积水格！`,
              `│  ② 计算落差增量：<span class="font-bold text-indigo-700">totalWater += (curBoardHeight - neighborHeight)</span>`,
            ],
            fillLine: `└── 更新邻格水位为当前水线并重新压入小根堆 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【波前收缩 轮次 2】水线单调向内蔓延与更高山峰阻隔',
        subtitle: '由外向内波前闭包收缩',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '遇到更高内部山峰 (neighborHeight ≥ curBoardHeight)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">⛰️ 高地围栏</span>',
            detailLines: [
              `│  ① 该高地本身无法蓄水 (落差 ≤ 0)`,
              `│  ② 但高地构成内部新的更坚固围栏，以其自身高度 max(water, height) 入堆`,
            ],
            fillLine: `└── 新围栏入堆，提升局部木桶承水能力 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '堆内所有单元格完全处理完毕 (Heap.isEmpty)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🎉 灌满闭合</span>',
            detailLines: [
              `│  ① 所有内部低洼格均已从外向内被水线漫灌至理论最大容积`,
              `│  ② 木桶收缩单调性证明蓄水量无任何泄漏与高估`,
            ],
            fillLine: `└── 计算结束，返回累计总蓄水量 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(rounds.join(''), '小根堆贪心收缩 · 木桶短板效应向内推移');

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return totalWater;',
      answerDescription: `全地形最终总蓄水量 = ${totalWater} 滴水 ✅ (当前预设地形理论最大蓄水极限)`,
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
