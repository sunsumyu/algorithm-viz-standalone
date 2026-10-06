/**
 * LeetCode 62: 不同路径 · 全景推演树渲染策略 (UniquePathsDeductionRenderer)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class UniquePathsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'unique-paths';

  public canHandle(modelId: string): boolean {
    return modelId === 'unique-paths';
  }

  public render(options: StaticDeductionRenderOptions): string {
    const m = Math.max(1, Math.min(8, options.m ?? 3));
    const n = Math.max(1, Math.min(8, options.n ?? 4));

    const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(1));
    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      }
    }

    const row0 = Array.from({ length: n }, (_, j) => `dp[0][${j}]=1`).join(', ');
    const col0 = Array.from({ length: m }, (_, i) => `dp[${i}][0]=1`).join(', ');

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 62. 不同路径 · 全景推演树',
      badge: `dp[${m}][${n}]`,
      descriptionHtml: `
        网格尺寸 <span class="font-bold text-slate-800">${m} × ${n}</span>。
        状态定义：<span class="font-bold text-slate-800">dp[i][j]</span> 表示从起点 (0,0) 到达网格点 (i,j) 的不同路径总数。
        状态转移方程：<code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">dp[i][j] = dp[i-1][j] + dp[i][j-1]</code>
      `,
      initialStateText: `初始化网格空间 dp[${m}][${n}]，准备开始自底向上递推填表。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '填第一行 (i=0)：由于只能向右走，到达第一行任意格子的路径仅有 1 条',
        valuesStr: row0,
      },
      {
        prefix: '└───',
        label: '填第一列 (j=0)：由于只能向下走，到达第一列任意格子的路径仅有 1 条',
        valuesStr: col0,
      },
    ]);

    const rounds = [];
    for (let i = 1; i < m; i++) {
      const stepLines = [];
      for (let j = 1; j < n; j++) {
        const isLast = j === n - 1;
        const connector = isLast ? '└───' : '├───';
        const topVal = dp[i - 1][j];
        const leftVal = dp[i][j - 1];
        const curVal = dp[i][j];

        stepLines.push(
          DeductionBoardPrimitives.renderInnerStep({
            connector,
            label: `内层格子 (i=${i}, j=${j})`,
            badgeHtml: `<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">上 + 左</span>`,
            detailLines: [
              `│  ① 来源状态：上方格子 dp[${i - 1}][${j}] = ${topVal}，左方格子 dp[${i}][${j - 1}] = ${leftVal}`,
              `│  ② 状态转移：<span class="font-bold text-indigo-700">dp[${i}][${j}] = dp[${i - 1}][${j}] + dp[${i}][${j - 1}] = ${topVal} + ${leftVal} = ${curVal}</span>`,
            ],
            fillLine: `└── 填入表格：dp[${i}][${j}] = ${curVal} ✅`,
          })
        );
      }

      rounds.push(
        DeductionBoardPrimitives.renderOuterRound({
          title: `【外层循环 第 ${i} 行 (i=${i})】遍历列 j=1..${n - 1}`,
          subtitle: `行索引 i=${i}`,
          stepLinesHtml: stepLines.join(''),
        })
      );
    }

    const loopSection = DeductionBoardPrimitives.renderLoopSection(rounds.join(''));

    const finalAnswer = dp[m - 1][n - 1];
    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: `return dp[${m - 1}][${n - 1}];`,
      answerDescription: `${finalAnswer} ✅ (从左上角到达右下角共有 ${finalAnswer} 种唯一路径)`,
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
