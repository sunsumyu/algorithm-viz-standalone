/**
 * LeetCode 115: 不同的子序列 · 全景推演树渲染策略 (DistinctSubsequencesDeductionRenderer)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DistinctSubsequencesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'distinct-subsequences';

  public canHandle(modelId: string): boolean {
    return modelId === 'distinct-subsequences';
  }

  public render(options: StaticDeductionRenderOptions): string {
    const s = options.s || 'babgbag';
    const t = options.t || 'bag';
    const m = s.length;
    const n = t.length;

    // dp[m+1][n+1]
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Base Case
    for (let i = 0; i <= m; i++) dp[i][0] = 1;

    const customNotes: Record<string, string> = {
      '3,1': '此时表示 s 的前 3 个字符 "bab" 中有 2 种方式匹配 "b"',
      '3,2': '此时表示 s 的前 3 个字符 "bab" 中有 1 种方式匹配 "ba"',
      '4,2': '当前母串字符 g 与目标 a 不匹配，直接继承上方状态 dp[3][2]=1',
      '4,3': '第一次完整匹配出 "bag"！',
      '6,2': 's 的前 6 个字符 "babgba" 中有 4 种方式匹配 "ba"',
      '7,3': '最终全局匹配完成，共获得 5 种不同的子序列构成 "bag"！',
    };

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 115. 不同的子序列 · 全景推演树',
      badge: `dp[${m + 1}][${n + 1}]`,
      descriptionHtml: `
        母串 <code class="font-mono bg-white px-1.5 py-0.5 rounded text-blue-700 border border-blue-200 font-bold">s = "${s}"</code> (长 ${m})，
        目标串 <code class="font-mono bg-white px-1.5 py-0.5 rounded text-amber-700 border border-amber-200 font-bold">t = "${t}"</code> (长 ${n})。
        状态定义：<span class="font-bold text-slate-800">dp[i][j]</span> 表示在 <span class="font-mono">s[0..i-1]</span> 的子序列中 <span class="font-mono">t[0..j-1]</span> 出现的方案总数。
      `,
      initialStateText: `初始化二维数组 dp[${m + 1}][${n + 1}]，准备开始双重循环填表。`,
    });

    const col0Str = Array.from({ length: m + 1 }, (_, idx) => `dp[${idx}][0]=1`).join(', ');
    const row0Str = Array.from({ length: n }, (_, idx) => `dp[0][${idx + 1}]=0`).join(', ');

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '填第一列 (j=0)：目标串为空串时，任何母串前缀删除所有字符均可得到 1 种空序列',
        valuesStr: col0Str,
      },
      {
        prefix: '└───',
        label: '填第一行 (i=0, j>0)：母串为空串时，无法匹配非空的目标串，方案数为 0',
        valuesStr: row0Str,
      },
    ]);

    const rounds = [];
    for (let i = 1; i <= m; i++) {
      const sChar = s[i - 1];
      const stepLines = [];

      for (let j = 1; j <= n; j++) {
        const tChar = t[j - 1];
        const isMatch = sChar === tChar;
        const prevDiag = dp[i - 1][j - 1];
        const prevTop = dp[i - 1][j];

        if (isMatch) {
          dp[i][j] = prevDiag + prevTop;
        } else {
          dp[i][j] = prevTop;
        }

        const noteKey = `${i},${j}`;
        const note = customNotes[noteKey] || '';
        const isLast = j === n;
        const connector = isLast ? '└───' : '├───';

        const formula = isMatch
          ? `dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + dp[${i - 1}][${j}] = ${prevDiag} + ${prevTop} = ${dp[i][j]}`
          : `dp[${i}][${j}] = dp[${i - 1}][${j}] = ${prevTop}`;

        stepLines.push(
          DeductionBoardPrimitives.renderInnerStep({
            connector,
            label: `内层 j=${j}：目标字符 t[${j - 1}]='<span class="text-amber-600 font-extrabold">${tChar}</span>'`,
            badgeHtml: isMatch
              ? '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">✔ 匹配成功</span>'
              : '<span class="text-[9px] px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded">❌ 不匹配</span>',
            detailLines: [
              `│  ① 检查字符：s[${i - 1}]=='${sChar}', t[${j - 1}]=='${tChar}' ${isMatch ? '✔ 匹配成功！' : '❌ 不匹配！'}`,
              `│  ② 状态转移：<span class="font-bold ${isMatch ? 'text-indigo-700' : 'text-slate-700'}">${formula}</span>`,
            ],
            fillLine: `└── 填入表格：dp[${i}][${j}] = ${dp[i][j]} ✅ ${note ? `<span class="text-indigo-600 font-normal">(${note})</span>` : ''}`,
          })
        );
      }

      rounds.push(
        DeductionBoardPrimitives.renderOuterRound({
          title: `【外层循环 i=${i}】当前母串字符 s[${i - 1}]='<span class="text-blue-600 font-extrabold">${sChar}</span>'`,
          subtitle: `前缀 "${s.slice(0, i)}"`,
          stepLinesHtml: stepLines.join(''),
        })
      );
    }

    const loopSection = DeductionBoardPrimitives.renderLoopSection(rounds.join(''));

    const finalAnswer = dp[m][n];
    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: `return dp[${m}][${n}];`,
      answerDescription: `${finalAnswer} ✅ (即母串 "${s}" 中共有 ${finalAnswer} 种不同的子序列可以构成目标串 "${t}")`,
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
