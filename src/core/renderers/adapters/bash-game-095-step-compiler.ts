/**
 * 巴什博弈 (Bash Game) StepCompiler
 * 核心原理：n % (m + 1) != 0 则先手必胜
 */

import { BASH_GAME_LINES } from '../../../algorithms/categories/game/game-095/game-095-stage-codes';
import { Game095Step } from '../../../algorithms/categories/game/game-095/game-095-shared';

export interface BashGameStep extends Game095Step {
  n: number;
  m: number;
  r: number;
  firstTake: number;
}

export function buildBashGameSteps(n: number, m: number): BashGameStep[] {
  const steps: BashGameStep[] = [];
  const lines = BASH_GAME_LINES;

  // Step 0: 入口
  steps.push({
    n,
    m,
    r: 0,
    firstTake: 0,
    piles: [n],
    decision: `主函数入口：接收参数 n=${n} 颗石子，每次最多取 m=${m} 颗`,
    message: '双方轮流取 1~m 颗，取光者胜。准备分析模 (m+1) 周期',
    log: `enter bash(n=${n}, m=${m})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '石子总数 n': `${n}`, '单次上限 m': `${m}` },
  });

  // Step 1: 边界合法性校验
  if (n <= 0 || m <= 0) {
    steps.push({
      n,
      m,
      r: 0,
      firstTake: 0,
      piles: [Math.max(0, n)],
      isFirstWin: false,
      decision: `边界特判：n=${n}, m=${m} 非法参数，先手判负`,
      message: '参数必须大于 0',
      log: 'invalid parameters, return false',
      line: lines.guard.javascript,
      codeLine: lines.guard,
      metrics: { '判定结果': '参数非法 / 先手负' },
    });
    return steps;
  }

  // Step 2: 计算余数
  const r = n % (m + 1);
  const isFirstWin = r !== 0;
  const firstTake = isFirstWin ? r : 1;

  steps.push({
    n,
    m,
    r,
    firstTake,
    piles: [n],
    decision: `计算模周期余数：r = n % (m + 1) = ${n} % (${m} + 1) = ${r}`,
    message: `周期长度为 m+1=${m + 1}。若余数不为 0，先手可以拿走余数 ${r} 颗，将 (m+1) 的倍数留给对手`,
    log: `compute r = ${n} % ${m + 1} = ${r}`,
    line: lines.computeMod.javascript,
    codeLine: lines.computeMod,
    metrics: { '周期 m+1': `${m + 1}`, '余数 r': `${r}` },
  });

  // Step 3: 博弈推演与策略解说
  if (isFirstWin) {
    steps.push({
      n,
      m,
      r,
      firstTake: r,
      piles: [n - r],
      activePileIdx: 0,
      isFirstWin: true,
      decision: `先手制胜策略：先手首轮取走 r=${r} 颗石子，剩余 ${n - r} 颗（刚好为 ${m + 1} 的 ${(n - r) / (m + 1)} 倍）`,
      message: `后续无论后手拿 k 颗 (1 <= k <= ${m})，先手只需拿 ${m + 1} - k 颗，确保每轮二人合计拿走 ${m + 1} 颗，先手必胜！`,
      log: `first player takes ${r} stones, leaves ${n - r}`,
      line: lines.computeMod.javascript,
      codeLine: lines.computeMod,
      metrics: { '首轮取走': `${r} 颗`, '剩余石子': `${n - r} 颗` },
    });
  } else {
    steps.push({
      n,
      m,
      r,
      firstTake: 0,
      piles: [n],
      activePileIdx: 0,
      isFirstWin: false,
      decision: `先手必败态 (P-position)：n=${n} 刚好是 m+1=${m + 1} 的整数倍！`,
      message: `无论先手首轮拿走 k 颗 (1 <= k <= ${m})，后手只需对应拿走 ${m + 1} - k 颗，后手将永远掌控局势并取走最后一颗石子`,
      log: `n is multiple of m+1, first player is in P-position`,
      line: lines.computeMod.javascript,
      codeLine: lines.computeMod,
      metrics: { '局势分析': '先手无论取几颗均会被后手凑成 m+1' },
    });
  }

  // Step 4: 返回终局结论
  steps.push({
    n,
    m,
    r,
    firstTake,
    piles: [isFirstWin ? Math.max(0, n - r) : n],
    isFirstWin,
    decision: isFirstWin
      ? `🎉 结论：r=${r} != 0 ➔ 先手必胜！返回 true`
      : `💀 结论：r=0 ➔ 先手必败（后手必胜）！返回 false`,
    message: isFirstWin ? '先手拥有完美必胜策略' : '后手拥有完美必胜策略',
    log: `return ${isFirstWin}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '终局判定': isFirstWin ? '先手必胜 (true)' : '先手必败 (false)' },
  });

  return steps;
}
