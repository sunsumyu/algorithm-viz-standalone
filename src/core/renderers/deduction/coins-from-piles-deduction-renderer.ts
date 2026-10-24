/**
 * LeetCode 2218: 从栈中取出K个硬币的最大面值和 · 全景推演树渲染策略 (CoinsFromPilesDeductionRenderer)
 * 左程云算法通关课 Class 074 Code02
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CoinsFromPilesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'coins-from-piles';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'coins-from-piles' ||
      modelId === 'coins-from-piles-074' ||
      modelId === 'class074-code02' ||
      modelId === 'maximum-value-of-k-coins-from-piles' ||
      modelId === 'leetcode-2218'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rawPiles = (options.params as any)?.piles;
    let piles: number[][] = [[1, 100, 3], [7, 8, 9]];
    if (Array.isArray(rawPiles) && rawPiles.length > 0) {
      piles = rawPiles;
    }

    const rawK = (options.params as any)?.k ?? (options.n !== undefined ? options.n - 1 : 2);
    const k = Math.max(1, Math.min(10, Number(rawK)));
    const n = piles.length;

    // dp[i][j] 代表前 i 个栈抽取至多 j 枚硬币的最大面值和
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(0));

    // 计算各栈前缀和
    const preSums: number[][] = [];
    for (let i = 0; i < n; i++) {
      const pile = piles[i];
      const t = Math.min(pile.length, k);
      const preSum = new Array(t + 1).fill(0);
      for (let p = 0; p < t; p++) preSum[p + 1] = preSum[p] + pile[p];
      preSums.push(preSum);
    }

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 2218. 从栈中取出K个硬币的最大面值和 · 全景推演树',
      badge: `dp[${n}][${k}]`,
      descriptionHtml: `
        硬币栈总数 <span class="font-bold text-slate-800">${n}</span>，抽取容量限制 <span class="font-bold text-slate-800">k = ${k}</span>。<br/>
        状态定义：<span class="font-bold text-slate-800">dp[i][j]</span> 表示前 i 个栈总共抽取 j 枚硬币能获得的最大面值和。<br/>
        状态转移方程：<code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">dp[i][j] = max(dp[i-1][j], max_{1&le;c&le;min(t, j)}(dp[i-1][j-c] + preSum[c]))</code>
      `,
      initialStateText: `初始化规格为 (N+1)×(K+1) 的 DP 矩阵，第 0 行空栈基底全为 0。`,
    });

    const row0 = Array.from({ length: k + 1 }, (_, j) => `dp[0][${j}]=0`).join(', ');
    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '└───',
        label: '基底行 (i=0)：未考察任何硬币栈时，无论容量多少，收益均为 0',
        valuesStr: row0,
      },
    ]);

    const rounds = [];
    for (let i = 1; i <= n; i++) {
      const pile = piles[i - 1];
      const preSum = preSums[i - 1];
      const t = Math.min(pile.length, k);
      const stepLines = [];

      for (let j = 0; j <= k; j++) {
        const isLast = j === k;
        const connector = isLast ? '└───' : '├───';

        // 拿 0 枚
        let bestVal = dp[i - 1][j];
        let bestC = 0;
        const choices = [`拿0枚: dp[${i - 1}][${j}] = ${bestVal}`];

        for (let c = 1; c <= Math.min(t, j); c++) {
          const cand = dp[i - 1][j - c] + preSum[c];
          choices.push(`拿${c}枚: dp[${i - 1}][${j - c}](${dp[i - 1][j - c]}) + preSum[${c}](${preSum[c]}) = ${cand}`);
          if (cand > bestVal) {
            bestVal = cand;
            bestC = c;
          }
        }
        dp[i][j] = bestVal;

        const choiceDetail = choices.map((cStr, idx) => `│  ${idx === 0 ? '①' : '②'} ${cStr}`).join('<br/>');

        stepLines.push(
          DeductionBoardPrimitives.renderInnerStep({
            connector,
            label: `容量状态 (i=${i}, j=${j})`,
            badgeHtml: `<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">${bestC === 0 ? '拿0枚' : `拿${bestC}枚`}</span>`,
            detailLines: [
              choiceDetail,
              `│  ③ 组内互斥择优：<span class="font-bold text-indigo-700">dp[${i}][${j}] = ${bestVal}</span>`,
            ],
            fillLine: `└── 填入表格：dp[${i}][${j}] = ${bestVal} ✅`,
          })
        );
      }

      rounds.push(
        DeductionBoardPrimitives.renderOuterRound({
          title: `【外层循环 第 ${i} 栈】栈面值 [${pile.join(', ')}]，前缀和 preSum=[${preSum.join(', ')}]`,
          subtitle: `栈索引 i=${i}`,
          stepLinesHtml: stepLines.join(''),
        })
      );
    }

    const loopSection = DeductionBoardPrimitives.renderLoopSection(rounds.join(''));

    const finalAnswer = dp[n][k];
    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: `return dp[${n}][${k}];`,
      answerDescription: `${finalAnswer} ✅ (在容量限制为 ${k} 下，前 ${n} 个硬币栈能获取的最大面值和为 ${finalAnswer})`,
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
