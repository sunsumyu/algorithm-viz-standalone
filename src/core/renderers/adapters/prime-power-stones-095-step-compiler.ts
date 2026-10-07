/**
 * 素数幂石子博弈 (Prime Power Stones) StepCompiler
 * 核心原理：任何素数幂 p^k % 6 != 0，因而 n % 6 != 0 先手必胜，n % 6 == 0 先手必败
 */

import { PRIME_POWER_LINES } from '../../../algorithms/categories/game/game-095/game-095-stage-codes';
import { Game095Step } from '../../../algorithms/categories/game/game-095/game-095-shared';

export interface PrimePowerStep extends Game095Step {
  n: number;
  mod: number;
  primePowersUnderN: number[];
}

export function buildPrimePowerSteps(n: number): PrimePowerStep[] {
  const steps: PrimePowerStep[] = [];
  const lines = PRIME_POWER_LINES;

  // Step 0: 入口
  steps.push({
    n,
    mod: 0,
    primePowersUnderN: [],
    piles: [n],
    decision: `主函数入口：接收参数 n=${n} 颗石子，每次必须取素数幂 p^k 颗`,
    message: '因为 p^0 = 1，所以每次可以拿 1, 2, 3, 4(2^2), 5, 7, 8(2^3), 9(3^2) ...',
    log: `enter canWin(n=${n})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '石子总数 n': `${n}`, '规则限制': '每次取 p^k 颗 (p为素数, k>=0)' },
  });

  // Step 1: 边界特判
  if (n <= 0) {
    steps.push({
      n,
      mod: 0,
      primePowersUnderN: [],
      piles: [0],
      isFirstWin: false,
      decision: `边界特判：n=${n} <= 0，先手无石子可取，判负`,
      message: '参数必须大于 0',
      log: 'n <= 0, return false',
      line: lines.guard.javascript,
      codeLine: lines.guard,
      metrics: { '判定结果': '参数非法 / 先手负' },
    });
    return steps;
  }

  // 计算 n 以内合法素数幂
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
  const powersSet = new Set<number>([1]); // p^0 = 1
  for (const p of primes) {
    let cur = p;
    while (cur <= n) {
      powersSet.add(cur);
      cur *= p;
    }
  }
  const primePowersUnderN = Array.from(powersSet).sort((a, b) => a - b);

  // Step 2: 模 6 计算
  const mod = n % 6;
  const isFirstWin = mod !== 0;

  steps.push({
    n,
    mod,
    primePowersUnderN,
    piles: [n],
    decision: `计算模 6 周期：mod = n % 6 = ${n} % 6 = ${mod}`,
    message: '数学定理：任何素数幂 p^k % 6 必然在 {1, 2, 3, 4, 5} 中，绝不可能等于 0！',
    log: `compute mod = ${n} % 6 = ${mod}`,
    line: lines.computeMod.javascript,
    codeLine: lines.computeMod,
    metrics: { '模 6 余数': `${mod}`, '合法素数幂候选': `${primePowersUnderN.slice(0, 8).join(', ')}...` },
  });

  // Step 3: 博弈转移推导
  if (isFirstWin) {
    steps.push({
      n,
      mod,
      primePowersUnderN,
      piles: [n - mod],
      activePileIdx: 0,
      isFirstWin: true,
      decision: `先手必胜策略：因为余数 mod=${mod} 本身就是一个合法素数幂（${mod === 1 ? '任意 p^0=1' : mod === 4 ? '2^2=4' : `${mod} 为质数`}）！`,
      message: `先手首步直接拿走 ${mod} 颗，剩余 ${n - mod} 颗（6 的倍数）留给对手。随后对手无论拿任何素数幂，剩余石子模 6 必不为 0，先手总能再次补齐使对手面对 6 的倍数！`,
      log: `first player takes mod=${mod} stones, leaving multiple of 6`,
      line: lines.computeMod.javascript,
      codeLine: lines.computeMod,
      metrics: { '先手拿取': `${mod} 颗`, '留给后手': `${n - mod} 颗 (6的倍数)` },
    });
  } else {
    steps.push({
      n,
      mod,
      primePowersUnderN,
      piles: [n],
      activePileIdx: 0,
      isFirstWin: false,
      decision: `先手必败态 (P-position)：当前 n=${n} 刚好是 6 的倍数！`,
      message: `无论先手拿取任何素数幂 p^k (模 6 绝不为 0)，后手都必然可以根据剩余余数对应拿取一个素数幂，再次将石子总数压缩回 6 的倍数，先手必败！`,
      log: `n is multiple of 6, first player cannot win`,
      line: lines.computeMod.javascript,
      codeLine: lines.computeMod,
      metrics: { '局势分析': '先手面对 6 的倍数，无论走哪步都必转移到非 6 倍数' },
    });
  }

  // Step 4: 返回
  steps.push({
    n,
    mod,
    primePowersUnderN,
    piles: [isFirstWin ? n - mod : n],
    isFirstWin,
    decision: isFirstWin
      ? `🎉 结论：n % 6 = ${mod} != 0 ➔ 先手必胜！返回 true`
      : `💀 结论：n % 6 = 0 ➔ 先手必败（后手必胜）！返回 false`,
    message: isFirstWin ? '先手可以通过模 6 策略稳赢' : '后手可以通过模 6 策略稳赢',
    log: `return ${isFirstWin}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '终局判定': isFirstWin ? '先手必胜 (true)' : '先手必败 (false)' },
  });

  return steps;
}
