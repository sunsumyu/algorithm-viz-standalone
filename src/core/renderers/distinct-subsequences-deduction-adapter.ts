/**
 * LeetCode 115 不同的子序列 · 全景静态填表推演展板适配器 (Deep Module)
 * 纯静态渲染双重循环状态转移推导全过程（无需代码步进联动）
 */

export interface DistinctSubsequencesDeductionOptions {
  s?: string;
  t?: string;
}

export class DistinctSubsequencesDeductionAdapter {
  /**
   * 生成推演步骤数据模型
   */
  public static generateDeductionData(sInput?: string, tInput?: string) {
    const s = sInput || 'babgbag';
    const t = tInput || 'bag';
    const m = s.length;
    const n = t.length;

    // dp[m+1][n+1]
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Base Case
    for (let i = 0; i <= m; i++) dp[i][0] = 1;

    // 特殊注解（与经典教学案例对齐）
    const customNotes: Record<string, string> = {
      '3,1': '此时表示 s 的前 3 个字符 "bab" 中有 2 种方式匹配 "b"',
      '3,2': '此时表示 s 的前 3 个字符 "bab" 中有 1 种方式匹配 "ba"',
      '4,2': '当前母串字符 g 与目标 a 不匹配，直接继承上方状态 dp[3][2]=1',
      '4,3': '第一次完整匹配出 "bag"！',
      '6,2': 's 的前 6 个字符 "babgba" 中有 4 种方式匹配 "ba"',
      '7,3': '最终全局匹配完成，共获得 5 种不同的子序列构成 "bag"！',
    };

    const loopRounds = [];

    for (let i = 1; i <= m; i++) {
      const sChar = s[i - 1];
      const innerSteps = [];

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
        innerSteps.push({
          j,
          tChar,
          isMatch,
          prevDiag,
          prevTop,
          val: dp[i][j],
          formula: isMatch
            ? `dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + dp[${i - 1}][${j}] = ${prevDiag} + ${prevTop} = ${dp[i][j]}`
            : `dp[${i}][${j}] = dp[${i - 1}][${j}] = ${prevTop}`,
          note: customNotes[noteKey] || '',
        });
      }

      loopRounds.push({
        i,
        sChar,
        prefixS: s.slice(0, i),
        innerSteps,
      });
    }

    return { s, t, m, n, dp, loopRounds };
  }

  /**
   * 渲染全景静态推演展板到指定 DOM 容器
   */
  public static renderDeduction(container: HTMLElement, options?: DistinctSubsequencesDeductionOptions): void {
    if (!container) return;

    const data = this.generateDeductionData(options?.s, options?.t);
    const { s, t, m, n, dp, loopRounds } = data;

    // 格式化 Base Case 字符
    const col0Str = Array.from({ length: m + 1 }, (_, idx) => `dp[${idx}][0]=1`).join(', ');
    const row0Str = Array.from({ length: n }, (_, idx) => `dp[0][${idx + 1}]=0`).join(', ');

    const html = `
      <div class="deduction-board flex flex-col gap-3 font-sans text-xs text-slate-700 select-text pb-6">
        <!-- 头部概述与状态定义 -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3 shadow-2xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-extrabold text-blue-900 flex items-center gap-1.5 text-xs">
              <i class="fa-solid fa-tree text-blue-600"></i>
              二维 DP 全景推演树 (静态全局展开)
            </span>
            <span class="font-mono text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
              dp[${m + 1}][${n + 1}]
            </span>
          </div>
          <p class="text-[11px] text-slate-600 mb-2">
            母串 <code class="font-mono bg-white px-1.5 py-0.5 rounded text-blue-700 border border-blue-200 font-bold">s = "${s}"</code> (长 ${m})，
            目标串 <code class="font-mono bg-white px-1.5 py-0.5 rounded text-amber-700 border border-amber-200 font-bold">t = "${t}"</code> (长 ${n})。
            状态定义：<span class="font-bold text-slate-800">dp[i][j]</span> 表示在 <span class="font-mono">s[0..i-1]</span> 的子序列中 <span class="font-mono">t[0..j-1]</span> 出现的方案总数。
          </p>
          <div class="font-mono text-[10px] bg-slate-900 text-slate-200 rounded-lg p-2 leading-relaxed">
            <span class="text-emerald-400">初始状态</span>：初始化二维数组 dp[${m + 1}][${n + 1}]，准备开始双重循环填表。
          </div>
        </div>

        <!-- 第一阶段：Base Case -->
        <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div class="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs mb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            第一阶段：填 Base Case（边界条件）
          </div>
          <div class="font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
            <div>
              <div class="text-slate-600 font-bold flex items-center gap-1">
                <span class="text-emerald-600">├───</span> 填第一列 (j=0)：空字符串 t 是任何字符串的子序列，方案数为 1
              </div>
              <div class="pl-5 text-emerald-700 font-extrabold text-[10.5px]">
                └── ${col0Str} ✅
              </div>
            </div>
            <div>
              <div class="text-slate-600 font-bold flex items-center gap-1">
                <span class="text-amber-600">└───</span> 填第一行 (i=0, j>0)：空字符串 s 无法匹配非空字符串 t，方案数为 0
              </div>
              <div class="pl-5 text-slate-500 text-[10.5px]">
                └── ${row0Str} ✅
              </div>
            </div>
          </div>
        </div>

        <!-- 第二阶段：核心双重循环推演 -->
        <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div class="font-extrabold text-slate-800 flex items-center justify-between text-xs mb-2">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              第二阶段：核心双重循环推演
            </span>
            <span class="text-[10px] text-slate-400 font-mono">外层 i=1..${m} · 内层 j=1..${n}</span>
          </div>

          <div class="space-y-3">
            ${loopRounds
              .map((round) => {
                const isLastRound = round.i === m;
                return `
                  <div class="border border-slate-200/90 rounded-lg overflow-hidden bg-slate-50/50">
                    <div class="bg-slate-100/90 px-2.5 py-1.5 border-b border-slate-200 flex items-center justify-between">
                      <span class="font-bold text-slate-800 text-[11px] font-mono">
                        【外层循环 i=${round.i}】当前母串字符 s[${round.i - 1}]='<span class="text-blue-600 font-extrabold">${round.sChar}</span>'
                      </span>
                      <span class="text-[10px] text-slate-500 font-mono">前缀 "${round.prefixS}"</span>
                    </div>

                    <div class="p-2 space-y-2 font-mono text-[11px]">
                      ${round.innerSteps
                        .map((step, idx) => {
                          const isLast = idx === round.innerSteps.length - 1;
                          const connector = isLast ? '└───' : '├───';
                          return `
                            <div class="border-b border-slate-100 last:border-b-0 pb-1.5 last:pb-0">
                              <div class="font-bold text-slate-700 flex items-center gap-1.5">
                                <span class="text-slate-400">${connector}</span>
                                <span>内层 j=${step.j}：目标字符 t[${step.j - 1}]='<span class="text-amber-600 font-extrabold">${step.tChar}</span>'</span>
                                ${
                                  step.isMatch
                                    ? '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">✔ 匹配成功</span>'
                                    : '<span class="text-[9px] px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded">❌ 不匹配</span>'
                                }
                              </div>
                              <div class="pl-6 space-y-0.5 text-[10.5px] mt-1 text-slate-600">
                                <div>│  ① 检查字符：s[${round.i - 1}]=='${round.sChar}', t[${step.j - 1}]=='${step.tChar}' ${step.isMatch ? '✔ 匹配成功！' : '❌ 不匹配！'}</div>
                                <div>│  ② 状态转移：<span class="font-bold ${step.isMatch ? 'text-indigo-700' : 'text-slate-700'}">${step.formula}</span></div>
                                <div class="text-emerald-700 font-bold">
                                  └── 填入表格：dp[${round.i}][${step.j}] = ${step.val} ✅
                                  ${step.note ? `<span class="text-amber-700 font-sans ml-1 text-[10px]">(${step.note})</span>` : ''}
                                </div>
                              </div>
                            </div>
                          `;
                        })
                        .join('')}
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>

        <!-- 第三阶段：返回结果 -->
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl p-3 shadow-2xs">
          <div class="font-extrabold text-emerald-900 flex items-center gap-1.5 text-xs mb-1.5">
            <i class="fa-solid fa-flag-checkered text-emerald-600"></i>
            第三阶段：返回结果
          </div>
          <div class="font-mono text-[11px] text-emerald-800 space-y-1">
            <div>回到代码最后一行：<code class="bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold text-emerald-900">return dp[${m}][${n}]</code></div>
            <div class="text-sm font-extrabold text-emerald-900 mt-1">
              最终返回 <span class="text-lg text-emerald-600 font-mono underline">${dp[m][n]}</span> ✅
              <span class="font-sans text-xs text-emerald-800 font-normal ml-1">
                (即 "${s}" 中有 ${dp[m][n]} 种不同的子序列可以构成 "${t}")
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}
