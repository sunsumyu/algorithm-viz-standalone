/**
 * 二进制快速幂 (Quick Power) StepCompiler
 * 核心原理：将指数拆分为二进制权重，底数反复平方累乘，实现 O(log b) 极速幂运算
 */

import { QUICK_POWER_LINES } from '../../../algorithms/categories/math/math-098/math-098-stage-codes';
import { Math098Step } from '../../../algorithms/categories/math/math-098/math-098-shared';

export interface QuickPowerStep extends Math098Step {
  a?: number;
  b?: number;
  mod?: number;
  curA: number;
  curB: number;
  curAns: number;
  bitIndex?: number;
}

export function buildQuickPowerSteps(
  a: number,
  b: number,
  mod: number = 1000000007
): QuickPowerStep[] {
  const steps: QuickPowerStep[] = [];
  const lines = QUICK_POWER_LINES;

  let base = BigInt(a) % BigInt(mod);
  let exp = BigInt(b);
  const m = BigInt(mod);
  let ans = 1n;

  // Step 0: 入口
  steps.push({
    decision: `主函数入口：计算 (${a}^${b}) % ${mod}`,
    message: `指数 ${b} 的二进制表示为 ${b.toString(2)}，准备进行快速幂逐位求解`,
    log: `enter power(a=${a}, b=${b}, mod=${mod})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '底数 a': `${a}`, '指数 b': `${b}`, '模数 mod': `${mod}` },
    curA: Number(base),
    curB: Number(exp),
    curAns: Number(ans),
  });

  // Step 1: 初始化 ans
  steps.push({
    decision: '初始化答案累乘器：long ans = 1',
    message: '当指数二进制对应位为 1 时，将当前底数贡献乘入 ans',
    log: 'init ans = 1',
    line: lines.initAns.javascript,
    codeLine: lines.initAns,
    metrics: { '当前 ans': '1' },
    curA: Number(base),
    curB: Number(exp),
    curAns: 1,
  });

  // Step 2: 循环推演
  let bitIdx = 0;
  while (exp > 0n) {
    const isBitOne = (exp & 1n) === 1n;

    steps.push({
      decision: `检查指数最低位：b=${exp} (末位为 ${isBitOne ? '1' : '0'})`,
      message: isBitOne ? '末位为 1，当前底数权重有效，准备乘入 ans' : '末位为 0，当前底数权重跳过',
      log: `while loop: exp=${exp}, bit0=${isBitOne ? 1 : 0}`,
      line: lines.whileLoop.javascript,
      codeLine: lines.whileLoop,
      metrics: { '指数 b': `${exp}`, '末位二进制': isBitOne ? '1' : '0', '当前权重': `${base}` },
      curA: Number(base),
      curB: Number(exp),
      curAns: Number(ans),
      bitIndex: bitIdx,
    });

    if (isBitOne) {
      const prevAns = ans;
      ans = (ans * base) % m;
      steps.push({
        decision: `累乘生效：ans = (${prevAns} * ${base}) % ${mod} = ${ans}`,
        message: `将当前底数贡献并入答案，ans 变为 ${ans}`,
        log: `ans = (${prevAns} * ${base}) % ${mod} = ${ans}`,
        line: lines.accumulate.javascript,
        codeLine: lines.accumulate,
        metrics: { '累乘后 ans': `${ans}` },
        curA: Number(base),
        curB: Number(exp),
        curAns: Number(ans),
        bitIndex: bitIdx,
      });
    }

    const prevBase = base;
    base = (base * base) % m;
    steps.push({
      decision: `底数自乘翻倍：a = (${prevBase} * ${prevBase}) % ${mod} = ${base}`,
      message: '为指数的下一个更高二进制位做好底数准备',
      log: `base squared: ${prevBase}^2 => ${base}`,
      line: lines.squareBase.javascript,
      codeLine: lines.squareBase,
      metrics: { '新底数': `${base}` },
      curA: Number(base),
      curB: Number(exp),
      curAns: Number(ans),
      bitIndex: bitIdx,
    });

    exp >>= 1n;
    bitIdx++;

    steps.push({
      decision: `指数右移：b >>= 1 ➔ 新指数 b=${exp} (二进制 ${exp.toString(2) || '0'})`,
      message: '处理下一个二进制高位',
      log: `exp shift right to ${exp}`,
      line: lines.shiftExp.javascript,
      codeLine: lines.shiftExp,
      metrics: { '剩余指数 b': `${exp}` },
      curA: Number(base),
      curB: Number(exp),
      curAns: Number(ans),
      bitIndex: bitIdx,
    });
  }

  // Step 3: 收敛返回
  steps.push({
    decision: `🎉 快速幂推演完成！(${a}^${b}) % ${mod} = ${ans}`,
    message: '算法在 O(log b) 步内成功收敛',
    log: `return ${ans}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '最终结果': `${ans}` },
    curA: Number(base),
    curB: 0,
    curAns: Number(ans),
    finalValue: Number(ans),
  });

  return steps;
}
