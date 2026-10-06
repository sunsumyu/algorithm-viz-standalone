/**
 * LeetCode 72: 编辑距离 · 全景推演树渲染策略 (EditDistanceDeductionRenderer)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class EditDistanceDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'edit-distance';

  public canHandle(modelId: string): boolean {
    return modelId === 'edit-distance';
  }

  public render(options: StaticDeductionRenderOptions): string {
    const word1 = options.word1 || 'horse';
    const word2 = options.word2 || 'ros';
    const m = word1.length;
    const n = word2.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Base Case
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    const col0Str = Array.from({ length: m + 1 }, (_, idx) => `dp[${idx}][0]=${idx}`).join(', ');
    const row0Str = Array.from({ length: n }, (_, idx) => `dp[0][${idx + 1}]=${idx + 1}`).join(', ');

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 72. 编辑距离 · 全景推演树',
      badge: `dp[${m + 1}][${n + 1}]`,
      descriptionHtml: `
        原单词 <code class="font-mono bg-white px-1.5 py-0.5 rounded text-blue-700 border border-blue-200 font-bold">word1 = "${word1}"</code> (长 ${m})，
        目标词 <code class="font-mono bg-white px-1.5 py-0.5 rounded text-amber-700 border border-amber-200 font-bold">word2 = "${word2}"</code> (长 ${n})。
        状态定义：<span class="font-bold text-slate-800">dp[i][j]</span> 表示将 <span class="font-mono">word1[0..i-1]</span> 转换为 <span class="font-mono">word2[0..j-1]</span> 所需的最少操作次数。
      `,
      initialStateText: `初始化二维数组 dp[${m + 1}][${n + 1}]，准备开始双重循环填表。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '填第一列 (j=0)：变为空字符串，需连续执行 i 次删除操作',
        valuesStr: col0Str,
      },
      {
        prefix: '└───',
        label: '填第一行 (i=0, j>0)：由空字符串转换，需连续执行 j 次插入操作',
        valuesStr: row0Str,
      },
    ]);

    const rounds = [];
    for (let i = 1; i <= m; i++) {
      const c1 = word1[i - 1];
      const stepLines = [];

      for (let j = 1; j <= n; j++) {
        const c2 = word2[j - 1];
        const isMatch = c1 === c2;
        const prevDiag = dp[i - 1][j - 1];
        const prevTop = dp[i - 1][j];
        const prevLeft = dp[i][j - 1];

        if (isMatch) {
          dp[i][j] = prevDiag;
        } else {
          dp[i][j] = Math.min(prevDiag, prevTop, prevLeft) + 1;
        }

        const isLast = j === n;
        const connector = isLast ? '└───' : '├───';

        stepLines.push(
          DeductionBoardPrimitives.renderInnerStep({
            connector,
            label: `内层 j=${j}：目标字符 word2[${j - 1}]='<span class="text-amber-600 font-extrabold">${c2}</span>'`,
            badgeHtml: isMatch
              ? '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">✔ 无需操作 (字符相同)</span>'
              : '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">🛠️ 需 1 次操作 (改/删/插)</span>',
            detailLines: [
              `│  ① 检查字符：word1[${i - 1}]=='${c1}', word2[${j - 1}]=='${c2}' ${isMatch ? '✔ 字符相等！' : '❌ 字符不同！'}`,
              `│  ② 状态转移：<span class="font-bold ${isMatch ? 'text-indigo-700' : 'text-slate-700'}">${
                isMatch
                  ? `dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${prevDiag}`
                  : `dp[${i}][${j}] = min(对角替换:${prevDiag}, 上方删除:${prevTop}, 左方插入:${prevLeft}) + 1 = ${dp[i][j]}`
              }</span>`,
            ],
            fillLine: `└── 填入表格：dp[${i}][${j}] = ${dp[i][j]} ✅`,
          })
        );
      }

      rounds.push(
        DeductionBoardPrimitives.renderOuterRound({
          title: `【外层循环 i=${i}】当前源字符 word1[${i - 1}]='<span class="text-blue-600 font-extrabold">${c1}</span>'`,
          subtitle: `前缀 "${word1.slice(0, i)}"`,
          stepLinesHtml: stepLines.join(''),
        })
      );
    }

    const loopSection = DeductionBoardPrimitives.renderLoopSection(rounds.join(''));

    const finalAnswer = dp[m][n];
    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: `return dp[${m}][${n}];`,
      answerDescription: `${finalAnswer} ✅ (将 "${word1}" 转化为 "${word2}" 最少需要 ${finalAnswer} 次操作)`,
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
