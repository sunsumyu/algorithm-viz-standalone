import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { snapshotGrid2D } from './grid-snapshot';

/**
 * 奇怪的打印机 (Strange Printer, LC 664, 左程云 85 课)
 * 字符染色覆盖区间 DP：
 * 关键结论：
 * 1. 若 s[i] == s[j]，打印左端字符时可以一次性刷到右端 j，后续再在中间覆盖，因此 dp[i][j] = dp[i][j - 1]；
 * 2. 若 s[i] != s[j]，枚举分割点 k ∈ [i, j-1]，dp[i][j] = min(dp[i][k] + dp[k+1][j])。
 * 状态定义：dp[i][j] 表示打印子串 s[i..j] 的最少打印次数。
 */
export function compileStrangePrinter(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const s: string = (params.params?.s as string) || 'aaabbb';
  const n = s.length;
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineInitN = anchorMap?.init_n || 3;
  const lineGuardLess = anchorMap?.guard_less || 4;
  const lineInitDp = anchorMap?.init_dp || 5;
  const lineInitBase = anchorMap?.init_base || 6;
  const lineLoopLen = anchorMap?.loop_len || 7;
  const lineLoopI = anchorMap?.loop_i || 8;
  const lineCalcJ = anchorMap?.calc_j || 9;
  const lineCondSame = anchorMap?.cond_same || 10;
  const lineTransferSame = anchorMap?.transfer_same || 11;
  const lineCondDiff = anchorMap?.cond_diff || 12;
  const lineInitMin = anchorMap?.init_min || 13;
  const lineLoopK = anchorMap?.loop_k || 14;
  const lineCalcTurns = anchorMap?.calc_turns || 15;
  const lineUpdateMin = anchorMap?.update_min || 16;
  const lineTransferDiff = anchorMap?.transfer_diff || 18;
  const lineReturn = anchorMap?.return || 22;

  const steps: UniversalStep[] = [];

  // 二维表格：大小 n * n
  const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

  // Step 0: 函数入口帧
  steps.push({
    type: 'entry',
    flowPhase: 'forward',
    line: lineEntry,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: s.split('').map((c) => c.charCodeAt(0)),
    memo: {},
    activeSlot: 0,
    tag: `strangePrinter(s) 目标字符串: "${s}" (长度 ${n})`,
    log: `🎯 进入 strangePrinter：字符串 s="${s}"`,
    msg: `主函数入口：目标字符串为 <code>"${s}"</code>（长度 <code>${n}</code>）。每次只能打印由同一种字符组成的连续片段，但可以覆盖已有字符。`,
  });

  // Step 1: 长度特判
  if (n <= 1) {
    steps.push({
      type: 'return',
      flowPhase: 'backtrack',
      line: lineGuardLess,
      i: 0,
      j: 0,
      grid: snapshotGrid2D(grid),
      dp1d: [n],
      memo: {},
      activeSlot: 0,
      tag: `字符串长度 <= 1，直接返回 ${n}`,
      log: `| 长度 <= 1，最少打印次数 = ${n}`,
      msg: `长度特判：<code>n = ${n}</code>，最少打印次数为 <strong>${n}</strong>。`,
    });
    return steps;
  }

  // Step 2: 分配 DP 表格
  steps.push({
    type: 'init',
    flowPhase: 'forward',
    line: lineInitDp,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: s.split('').map((c) => c.charCodeAt(0)),
    memo: {},
    activeSlot: 0,
    tag: `分配 dp[${n}][${n}] 状态矩阵`,
    log: `| 📊 初始化上三角区间 DP 矩阵：dp[i][j] 表示打印 s[i..j] 最少次数`,
    msg: `创建状态表 <code>dp = new int[${n}][${n}]</code>。`,
  });

  // Step 3: 单字符基础边界初始化 (dp[i][i] = 1)
  for (let i = 0; i < n; i++) {
    grid[i]![i] = 1;
    steps.push({
      type: 'boundary',
      flowPhase: 'backtrack',
      line: lineInitBase,
      i,
      j: i,
      grid: snapshotGrid2D(grid),
      dp1d: s.split('').map((c) => c.charCodeAt(0)),
      memo: {},
      activeSlot: i,
      gridHighlight: { i, j: i },
      tag: `单字符基底: dp[${i}][${i}] = 1 ('${s[i]}')`,
      log: `| 🏁 单字符基底：s[${i}]='${s[i]}' 需 1 次打印`,
      msg: `初始化基底：单个字符 <code>s[${i}] = '${s[i]}'</code> 必须独立打印 1 次，<code>dp[${i}][${i}] = 1</code>。`,
    });
  }

  // Step 4: 按区间长度 len 从 2 到 n 递推
  for (let len = 2; len <= n; len++) {
    steps.push({
      type: 'loop_len',
      flowPhase: 'forward',
      line: lineLoopLen,
      i: 0,
      j: len - 1,
      grid: snapshotGrid2D(grid),
      dp1d: s.split('').map((c) => c.charCodeAt(0)),
      memo: {},
      activeSlot: len,
      tag: `--- 递推区间长度 len = ${len} ---`,
      log: `| 📏 计算所有长度为 ${len} 的子串打印`,
      msg: `外层递推推进：考察长度为 <code>len = ${len}</code> 的所有子串。`,
    });

    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      const charI = s[i]!;
      const charJ = s[j]!;

      if (charI === charJ) {
        // 首尾字符相同：直接顺带覆盖，无需增加打印次数！
        const inherited = grid[i]![j - 1] ?? 1;
        grid[i]![j] = inherited;

        steps.push({
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransferSame,
          i,
          j,
          grid: snapshotGrid2D(grid),
          dp1d: s.split('').map((c) => c.charCodeAt(0)),
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          deps: [{ r: i, c: j - 1, type: 'left', label: `dp[${i}][${j-1}]=${inherited}` }],
          tag: `首尾相同 s[${i}]==s[${j}]('${charI}'): dp[${i}][${j}] = dp[${i}][${j-1}] = ${inherited}`,
          log: `| ✨ 首尾字符相同 ('${charI}')：打印首字符时顺带覆盖到尾部，dp[${i}][${j}] = dp[${i}][${j-1}] = ${inherited}`,
          msg: `子串 <code>"${s.slice(i, j + 1)}"</code> 两端相同 <code>'${charI}' == '${charJ}'</code>：打印首端字符时可直接延伸打到底部，打印次数无需增加：<code>dp[${i}][${j}] = dp[${i}][${j - 1}] = <strong>${inherited}</strong></code>。`,
        });
      } else {
        // 首尾字符不同：枚举分割点 k ∈ [i, j-1]
        let minTurns = Infinity;
        let bestK = -1;

        for (let k = i; k < j; k++) {
          const leftTurns = grid[i]![k] ?? 1;
          const rightTurns = grid[k + 1]![j] ?? 1;
          const turns = leftTurns + rightTurns;
          if (turns < minTurns) {
            minTurns = turns;
            bestK = k;
          }
        }

        grid[i]![j] = minTurns;

        steps.push({
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransferDiff,
          i,
          j,
          grid: snapshotGrid2D(grid),
          dp1d: s.split('').map((c) => c.charCodeAt(0)),
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          deps: bestK !== -1 ? [
            { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
            { r: bestK + 1, c: j, type: 'bottom' as any, label: `dp[${bestK+1}][${j}]=${grid[bestK+1]![j]}` },
          ] : [],
          tag: `首尾不同 s[${i}]('${charI}')!=s[${j}]('${charJ}'): 最优分割 k=${bestK} ➔ 次数 ${minTurns}`,
          log: `| 🔀 首尾不同：在 k=${bestK} 分割为 "${s.slice(i, bestK + 1)}" 与 "${s.slice(bestK + 1, j + 1)}" ➔ dp[${i}][${j}] = ${grid[i]![bestK]}+${grid[bestK+1]![j]} = ${minTurns}`,
          msg: `子串 <code>"${s.slice(i, j + 1)}"</code> 首尾不同：在 <code>k = ${bestK}</code> 分割为两段独立打印最优，最少打印次数 <code>dp[${i}][${bestK}] + dp[${bestK+1}][${j}] = <strong>${minTurns}</strong></code>。`,
        });
      }
    }
  }

  // Step 5: 全局最优解收敛
  const ans = grid[0]![n - 1] ?? 1;
  steps.push({
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: s.split('').map((c) => c.charCodeAt(0)),
    memo: {},
    activeSlot: n - 1,
    gridHighlight: { i: 0, j: n - 1 },
    tag: `🎉 打印全部字符最少操作次数: ${ans}`,
    log: `| 🏆 推导收敛：打印 "${s}" 最少次数 dp[0][${n - 1}] = ${ans}`,
    msg: `🎉 推导完成！打印完整字符串 <code>"${s}"</code> 的最少操作次数为 <strong>${ans}</strong>。`,
  });

  return steps;
}
