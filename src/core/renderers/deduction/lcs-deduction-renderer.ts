/**
 * LeetCode 1143: 最长公共子序列 · 全景推演树渲染策略 (LcsDeductionRenderer)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LcsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'longest-common-subsequence';

  public canHandle(modelId: string): boolean {
    return modelId === 'longest-common-subsequence';
  }

  public render(options: StaticDeductionRenderOptions): string {
    const text1 = options.text1 || 'abcde';
    const text2 = options.text2 || 'ace';
    const m = text1.length;
    const n = text2.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 1143. 最长公共子序列 · 全景推演树',
      badge: `dp[${m + 1}][${n + 1}]`,
      descriptionHtml: `
        母串 1 <code class="font-mono bg-white px-1.5 py-0.5 rounded text-blue-700 border border-blue-200 font-bold">text1 = "${text1}"</code> (长 ${m})，
        母串 2 <code class="font-mono bg-white px-1.5 py-0.5 rounded text-amber-700 border border-amber-200 font-bold">text2 = "${text2}"</code> (长 ${n})。
        状态定义：<span class="font-bold text-slate-800">dp[i][j]</span> 表示 <span class="font-mono">text1[0..i-1]</span> 与 <span class="font-mono">text2[0..j-1]</span> 的最长公共子序列长度。
      `,
      initialStateText: `初始化二维矩阵 dp[${m + 1}][${n + 1}]，准备开始双重循环逐格推导。`,
    });

    const col0Str = Array.from({ length: m + 1 }, (_, idx) => `dp[${idx}][0]=0`).join(', ');
    const row0Str = Array.from({ length: n }, (_, idx) => `dp[0][${idx + 1}]=0`).join(', ');

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '填第一列 (j=0)：text2 为空串时，与 text1 的任何前缀的公共子序列长度均为 0',
        valuesStr: col0Str,
      },
      {
        prefix: '└───',
        label: '填第一行 (i=0, j>0)：text1 为空串时，与 text2 的任何前缀的公共子序列长度均为 0',
        valuesStr: row0Str,
      },
    ]);

    const rounds = [];
    for (let i = 1; i <= m; i++) {
      const c1 = text1[i - 1];
      const stepLines = [];

      for (let j = 1; j <= n; j++) {
        const c2 = text2[j - 1];
        const isMatch = c1 === c2;
        const prevDiag = dp[i - 1][j - 1];
        const prevTop = dp[i - 1][j];
        const prevLeft = dp[i][j - 1];

        if (isMatch) {
          dp[i][j] = prevDiag + 1;
        } else {
          dp[i][j] = Math.max(prevTop, prevLeft);
        }

        const isLast = j === n;
        const connector = isLast ? '└───' : '├───';

        stepLines.push(
          DeductionBoardPrimitives.renderInnerStep({
            connector,
            label: `内层 j=${j}：目标字符 text2[${j - 1}]='<span class="text-amber-600 font-extrabold">${c2}</span>'`,
            badgeHtml: isMatch
              ? '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">✔ 字符相同 (+1)</span>'
              : '<span class="text-[9px] px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded">❌ 字符不同 (继承最大)</span>',
            detailLines: [
              `│  ① 检查字符：text1[${i - 1}]=='${c1}', text2[${j - 1}]=='${c2}' ${isMatch ? '✔ 字符相等！' : '❌ 字符不同！'}`,
              `│  ② 状态转移：<span class="font-bold ${isMatch ? 'text-indigo-700' : 'text-slate-700'}">${
                isMatch
                  ? `dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${prevDiag} + 1 = ${dp[i][j]}`
                  : `dp[${i}][${j}] = max(上方:${prevTop}, 左方:${prevLeft}) = ${dp[i][j]}`
              }</span>`,
            ],
            fillLine: `└── 填入表格：dp[${i}][${j}] = ${dp[i][j]} ✅`,
          })
        );
      }

      rounds.push(
        DeductionBoardPrimitives.renderOuterRound({
          title: `【外层循环 i=${i}】当前字符 text1[${i - 1}]='<span class="text-blue-600 font-extrabold">${c1}</span>'`,
          subtitle: `前缀 "${text1.slice(0, i)}"`,
          stepLinesHtml: stepLines.join(''),
        })
      );
    }

    const loopSection = DeductionBoardPrimitives.renderLoopSection(rounds.join(''));

    const finalAnswer = dp[m][n];
    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: `return dp[${m}][${n}];`,
      answerDescription: `${finalAnswer} ✅ (即 "${text1}" 与 "${text2}" 的最长公共子序列长度为 ${finalAnswer})`,
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
