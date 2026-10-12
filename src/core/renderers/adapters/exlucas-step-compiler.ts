import { EXLUCAS_LINES } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-stage-codes';
import { Advanced167Step, EXLucasFactorItem } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';

export interface EXLucasStep extends Advanced167Step {
  n: number;
  m: number;
  p: number;
  factors: EXLucasFactorItem[];
  ans?: number;
  stage: string;
}

function exgcd(a: bigint, b: bigint): { gcd: bigint; x: bigint; y: bigint } {
  if (b === 0n) return { gcd: a, x: 1n, y: 0n };
  const { gcd, x: x1, y: y1 } = exgcd(b, a % b);
  return { gcd, x: y1, y: x1 - (a / b) * y1 };
}

function invMod(a: bigint, m: bigint): bigint {
  const { x } = exgcd(a, m);
  return (x % m + m) % m;
}

function power(base: bigint, exp: bigint, mod: bigint): bigint {
  let res = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp & 1n) res = (res * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return res;
}

// 递归求 n! 中除去 p 的乘积模 pk
function factCoprime(n: bigint, p: bigint, pk: bigint): bigint {
  if (n === 0n) return 1n;
  let ans = 1n;
  for (let i = 1n; i <= pk; i++) {
    if (i % p !== 0n) ans = (ans * i) % pk;
  }
  ans = power(ans, n / pk, pk);
  for (let i = 1n; i <= (n % pk); i++) {
    if (i % p !== 0n) ans = (ans * i) % pk;
  }
  return (ans * factCoprime(n / p, p, pk)) % pk;
}

// 统计 n! 中含有 p 质因子的幂次
function countP(n: bigint, p: bigint): bigint {
  let cnt = 0n;
  while (n > 0n) {
    cnt += n / p;
    n /= p;
  }
  return cnt;
}

function solveSubLucas(n: bigint, m: bigint, p: bigint, pk: bigint): bigint {
  if (m > n) return 0n;
  const cnt = countP(n, p) - countP(m, p) - countP(n - m, p);
  const a = factCoprime(n, p, pk);
  const b = (factCoprime(m, p, pk) * factCoprime(n - m, p, pk)) % pk;
  const res = (a * invMod(b, pk)) % pk;
  return (res * power(p, cnt, pk)) % pk;
}

export function buildEXLucasSteps(n: number, m: number, p: number): EXLucasStep[] {
  const steps: EXLucasStep[] = [];
  const lines = EXLUCAS_LINES;

  // Step 0: 入口帧
  steps.push({
    n,
    m,
    p,
    factors: [],
    stage: '主函数入口',
    decision: `主函数入口：计算任意模数下大组合数 C(${n}, ${m}) mod ${p}`,
    message: `由于模数 ${p} 可能是合数且含重素因子，经典 Lucas 失效，需分解质因数并借助 CRT 合并`,
    log: `enter exLucas: n=${n}, m=${m}, P=${p}`,
    codeLine: lines.entry,
    metrics: { '上标 n': n, '下标 m': m, '模数 P': p, '算法': 'EXLucas 模合数组合数' },
  });

  // Step 1: 质因数分解
  const bn = BigInt(n);
  const bm = BigInt(m);
  const bp = BigInt(p);
  let tempP = bp;
  const factorList: EXLucasFactorItem[] = [];

  for (let d = 2n; d * d <= tempP; d++) {
    if (tempP % d === 0n) {
      let pk = 1n;
      while (tempP % d === 0n) {
        pk *= d;
        tempP /= d;
      }
      const ai = Number(solveSubLucas(bn, bm, d, pk));
      factorList.push({ p: Number(d), pk: Number(pk), ai });
    }
  }
  if (tempP > 1n) {
    const ai = Number(solveSubLucas(bn, bm, tempP, tempP));
    factorList.push({ p: Number(tempP), pk: Number(tempP), ai });
  }

  steps.push({
    n,
    m,
    p,
    factors: [...factorList],
    stage: '质因数分解与子同余求解',
    decision: `质因数分解 P=${p}：拆解为 ${factorList.map(f => `${f.p}^${Math.round(Math.log(f.pk)/Math.log(f.p))}`).join(' * ')}`,
    message: `分别在每个素数幂模数 p^k 下通过阶乘剥离质因子与扩展欧几里得求得同余分量`,
    log: `factorP: ${factorList.map(f => `pk=${f.pk}, a=${f.ai}`).join('; ')}`,
    codeLine: lines.subSolve,
    statusBadge: { text: `分解为 ${factorList.length} 个互质分量`, type: 'info' },
    metrics: { '分量个数': factorList.length, '剥离因子方式': '循环节分段 + 递归' },
  });

  // Step 2: CRT 合并
  let ans = 0n;
  for (const f of factorList) {
    const pk = BigInt(f.pk);
    const ai = BigInt(f.ai);
    const Mi = bp / pk;
    const invMi = invMod(Mi, pk);
    ans = (ans + ((ai * Mi) % bp) * invMi) % bp;
  }
  const finalAns = Number((ans % bp + bp) % bp);

  steps.push({
    n,
    m,
    p,
    factors: [...factorList],
    ans: finalAns,
    stage: 'CRT 模数合并完成',
    decision: `中国剩余定理 (CRT) 合并：将各个模 p^k 同余解唯一融合成最终模 ${p} 的解`,
    message: `ans = sum (ai * (P/pk) * inv(P/pk, pk)) mod P = ${finalAns}`,
    log: `crtMerge: ans=${finalAns}`,
    codeLine: lines.crtMerge,
    statusBadge: { text: 'CRT 合并完成', type: 'warning' },
    metrics: { '合并解': finalAns, '模数规模': p },
  });

  // Step 3: 终态返回
  steps.push({
    n,
    m,
    p,
    factors: [...factorList],
    ans: finalAns,
    stage: '求解全部完成',
    decision: `🎉 扩展卢卡斯定理计算完成：C(${n}, ${m}) mod ${p} = ${finalAns}`,
    message: `成功攻克大组合数模任意合数难题，时间复杂度 O(P log P)，是数论高阶组合计数的终极武器`,
    log: `returnAns: complete`,
    codeLine: lines.returnAns,
    statusBadge: { text: `C(${n}, ${m}) % ${p} = ${finalAns}`, type: 'success' },
    metrics: { '最终组合数': finalAns, '模合数特性': '任意合数完全通用' },
  });

  return steps;
}
