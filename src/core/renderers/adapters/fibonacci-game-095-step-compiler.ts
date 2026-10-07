/**
 * 斐波那契博弈 (Fibonacci Game) StepCompiler
 * 核心原理：齐肯多夫定理，n 为斐波那契数则先手必败；非斐波那契数则先手必胜（首步取最小分解项）
 */

import { FIBONACCI_GAME_LINES } from '../../../algorithms/categories/game/game-095/game-095-stage-codes';
import { Game095Step } from '../../../algorithms/categories/game/game-095/game-095-shared';

export interface FibonacciStep extends Game095Step {
  n: number;
  curA: number;
  curB: number;
  fibList: number[];
  zeckendorf: number[];
  isFibonacci: boolean;
}

export function buildFibonacciSteps(n: number): FibonacciStep[] {
  const steps: FibonacciStep[] = [];
  const lines = FIBONACCI_GAME_LINES;

  // 齐肯多夫分解辅助计算
  function getZeckendorf(num: number): { fibs: number[]; decomp: number[] } {
    const f = [1, 2];
    while (f[f.length - 1] < num) {
      f.push(f[f.length - 1] + f[f.length - 2]);
    }
    const decomp: number[] = [];
    let rem = num;
    for (let i = f.length - 1; i >= 0; i--) {
      if (f[i] <= rem) {
        decomp.push(f[i]);
        rem -= f[i];
      }
    }
    return { fibs: f, decomp: decomp.reverse() };
  }

  const { decomp } = getZeckendorf(n);

  // Step 0: 入口
  steps.push({
    n,
    curA: 1,
    curB: 2,
    fibList: [1, 2],
    zeckendorf: decomp,
    isFibonacci: false,
    piles: [n],
    decision: `主函数入口：接收参数 n=${n} 颗石子`,
    message: '首轮先手可拿 1~n-1 颗，之后每人最多拿前一人取量的 2 倍。齐肯多夫定理判定：n 是斐波那契数则先手必败',
    log: `enter canWin(n=${n})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '石子总数 n': `${n}`, '规则限制': '首轮不能全取，后续每次 <= 2*上一手' },
  });

  // Step 1: 边界特判
  if (n <= 1) {
    steps.push({
      n,
      curA: 1,
      curB: 2,
      fibList: [1],
      zeckendorf: [],
      isFibonacci: true,
      piles: [Math.max(0, n)],
      isFirstWin: false,
      decision: `边界特判：n=${n} <= 1，先手首轮不能取完（取 1~n-1），无合法招法，判负`,
      message: '返回 false',
      log: 'n <= 1, return false',
      line: lines.guard.javascript,
      codeLine: lines.guard,
      metrics: { '判定结果': '先手负' },
    });
    return steps;
  }

  // Step 2: 初始化斐波那契递推
  let a = 1;
  let b = 2;
  const fibList = [1, 2];

  steps.push({
    n,
    curA: a,
    curB: b,
    fibList: [...fibList],
    zeckendorf: decomp,
    isFibonacci: b === n,
    piles: [n],
    decision: `初始化斐波那契基底：a=1, b=2，当前序列 [${fibList.join(', ')}]`,
    message: '准备生成斐波那契数，直到项值大于等于 n',
    log: 'init a=1, b=2',
    line: lines.initFib.javascript,
    codeLine: lines.initFib,
    metrics: { '当前 b': '2', '对比 n': `${n}` },
  });

  // Step 3: while 循环推进
  while (b < n) {
    steps.push({
      n,
      curA: a,
      curB: b,
      fibList: [...fibList],
      zeckendorf: decomp,
      isFibonacci: false,
      piles: [n],
      decision: `检查循环条件：b=${b} < n=${n}，继续生成下一项`,
      message: `准备计算 c = a + b = ${a} + ${b} = ${a + b}`,
      log: `while b < n: b=${b}`,
      line: lines.whileLoop.javascript,
      codeLine: lines.whileLoop,
      metrics: { '当前项 b': `${b}` },
    });

    const c = a + b;
    a = b;
    b = c;
    fibList.push(b);

    steps.push({
      n,
      curA: a,
      curB: b,
      fibList: [...fibList],
      zeckendorf: decomp,
      isFibonacci: b === n,
      piles: [n],
      decision: `递推推进：新项 c=${b}，更新 (a=${a}, b=${b})，斐波那契序列: [${fibList.join(', ')}]`,
      message: b === n ? `当前项 b 恰好命中目标 n=${n}！` : b > n ? `当前项 b=${b} 已超过 n=${n}，循环将终止` : '尚未达到 n',
      log: `next fib c=${b}`,
      line: lines.nextFib.javascript,
      codeLine: lines.nextFib,
      metrics: { '当前最大项 b': `${b}`, '项数': `${fibList.length}` },
    });
  }

  // Step 4: 判定与返回
  const isFibonacci = b === n;
  const isFirstWin = !isFibonacci;

  steps.push({
    n,
    curA: a,
    curB: b,
    fibList: [...fibList],
    zeckendorf: decomp,
    isFibonacci,
    isFirstWin,
    piles: [n],
    decision: isFibonacci
      ? `💀 判定结论：n=${n} 恰好为斐波那契数！先手必败，返回 false (b != n)`
      : `🎉 判定结论：n=${n} 不是斐波那契数！先手必胜，返回 true (b != n)`,
    message: isFibonacci
      ? '齐肯多夫定理：n 是斐波那契数时，先手无论取多少都会使后手拥有取光剩下的主动权！'
      : `先手齐肯多夫制胜策略：先手第一步取走最小分解项 ${decomp[0]} 颗！后手最多取 2*${decomp[0]} 颗，绝无法取到下一个斐波那契分量，先手必胜！`,
    log: `return b != n => ${isFirstWin}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '是否为斐波那契数': isFibonacci ? '是' : '否', '终局判定': isFirstWin ? '先手胜 (true)' : '先手负 (false)' },
  });

  return steps;
}
