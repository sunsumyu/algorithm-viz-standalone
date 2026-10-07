/**
 * 线性递推求逆元 (Linear Inverses 1 to n) StepCompiler
 * 核心原理：inv[i] = (p - floor(p / i)) * inv[p % i] % p，O(n) 线性打表
 */

import { INVERSE_SERIAL_LINES } from '../../../algorithms/categories/math/math-099/math-099-stage-codes';
import { Math099Step } from '../../../algorithms/categories/math/math-099/math-099-shared';

export interface InverseSerialStep extends Math099Step {
  n: number;
  p: number;
}

export function buildInverseSerialSteps(n: number, p: number = 1000000007): InverseSerialStep[] {
  const steps: InverseSerialStep[] = [];
  const lines = INVERSE_SERIAL_LINES;

  const inv: number[] = new Array(n + 1).fill(0);
  const table: { num: number; inv: number }[] = [];

  // Step 0: 入口
  steps.push({
    n,
    p,
    decision: `主函数入口：准备在 O(n) 时间内递推求解 1 ~ ${n} 的全部逆元 (模 p=${p})`,
    message: '基于 p = k * i + r 的带余除法，可在常数步内由前序已求逆元转移至当前逆元',
    log: `enter buildInverses(n=${n}, p=${p})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '规模 n': `${n}`, '质数模数 p': `${p}` },
  });

  // Step 1: inv[1] = 1
  inv[1] = 1;
  table.push({ num: 1, inv: 1 });
  steps.push({
    n,
    p,
    inversesTable: [...table],
    activeNum: 1,
    decision: '设置基底初值：inv[1] = 1 (1 × 1 ≡ 1 mod p)',
    message: '从 i = 2 开始自小到大递推',
    log: 'inv[1] = 1',
    line: lines.initBase.javascript,
    codeLine: lines.initBase,
    metrics: { 'inv[1]': '1' },
  });

  // Step 2: 递推计算 2..n
  for (let i = 2; i <= n; i++) {
    const k = Math.floor(p / i);
    const r = p % i;

    steps.push({
      n,
      p,
      inversesTable: [...table],
      activeNum: i,
      decision: `循环递推 i=${i}：带余除法 p = ${p} = ${k} × ${i} + ${r}`,
      message: `依赖状态：inv[p % i] = inv[${r}] = ${inv[r]}`,
      log: `loop i=${i}, k=${k}, r=${r}`,
      line: lines.loopHeader.javascript,
      codeLine: lines.loopHeader,
      metrics: { '当前数值 i': `${i}`, '商 k': `${k}`, '余数 r': `${r}` },
    });

    const curInv = Number((BigInt(p - k) * BigInt(inv[r])) % BigInt(p));
    inv[i] = curInv;
    table.push({ num: i, inv: curInv });

    steps.push({
      n,
      p,
      inversesTable: [...table],
      activeNum: i,
      decision: `状态转移：inv[${i}] = (p - floor(p/${i})) × inv[${r}] % p = (${p - k} × ${inv[r]}) % ${p} = ${curInv}！`,
      message: `已写入 inv[${i}] = ${curInv}`,
      log: `inv[${i}] = ${curInv}`,
      line: lines.computeInv.javascript,
      codeLine: lines.computeInv,
      metrics: { [`inv[${i}]`]: `${curInv}` },
    });
  }

  // Step 3: 收敛返回
  steps.push({
    n,
    p,
    inversesTable: [...table],
    decision: `🎉 线性递推完成！1 ~ ${n} 的逆元全部求出，整个过程仅耗时 O(n)！`,
    message: '算法成功收敛',
    log: `done linear inverses`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '已求出逆元数': `${n}` },
  });

  return steps;
}
