/**
 * Class 144: 卢卡斯定理与大组合数求模 步进推演编译器
 * 核心：C(n, m) ≡ C(n/p, m/p) × C(n%p, m%p) (mod p) 递归分解与递归调用栈演进
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface LucasCallFrame {
  n: number;
  m: number;
  nDivP: number;
  mDivP: number;
  nModP: number;
  mModP: number;
  smallComb: number;
  returnedVal?: number;
}

export interface Lucas144Step extends StepBase {
  p: number;
  stack: LucasCallFrame[];
  curN: number;
  curM: number;
  ans: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const LUCAS_144_CODES = {
  java: `public class LucasTheorem {
    public static long power(long base, long exp, long p) {
        long res = 1;
        base %= p;
        while (exp > 0) {
            if ((exp & 1) == 1) res = (res * base) % p;
            base = (base * base) % p;
            exp >>= 1;
        }
        return res;
    }

    public static long combSmall(long n, long m, long p) {
        if (m > n) return 0;
        if (m == 0 || m == n) return 1;
        long num = 1, den = 1;
        for (int i = 0; i < m; i++) {
            num = (num * (n - i)) % p;
            den = (den * (i + 1)) % p;
        }
        return (num * power(den, p - 2, p)) % p;
    }

    public static long lucas(long n, long m, long p) {
        if (m == 0) return 1;
        return (combSmall(n % p, m % p, p) * lucas(n / p, m / p, p)) % p;
    }
}`,
  cpp: `long long power(long long base, long long exp, long long p) {
    long long res = 1;
    for (base %= p; exp; exp >>= 1, base = base * base % p)
        if (exp & 1) res = res * base % p;
    return res;
}

long long combSmall(long long n, long long m, long long p) {
    if (m > n) return 0;
    long long num = 1, den = 1;
    for (int i = 0; i < m; i++) {
        num = num * (n - i) % p;
        den = den * (i + 1) % p;
    }
    return num * power(den, p - 2, p) % p;
}

long long lucas(long long n, long long m, long long p) {
    if (!m) return 1;
    return combSmall(n % p, m % p, p) * lucas(n / p, m / p, p) % p;
}`,
  python: `def power(base, exp, p):
    return pow(base, exp, p)

def comb_small(n, m, p):
    if m > n: return 0
    num, den = 1, 1
    for i in range(m):
        num = (num * (n - i)) % p
        den = (den * (i + 1)) % p
    return (num * pow(den, p - 2, p)) % p

def lucas(n, m, p):
    if m == 0: return 1
    return (comb_small(n % p, m % p, p) * lucas(n // p, m // p, p)) % p`,
  typescript: `export function power(base: number, exp: number, p: number): number {
    let res = 1;
    base %= p;
    while (exp > 0) {
        if (exp % 2 === 1) res = (res * base) % p;
        base = (base * base) % p;
        exp = Math.floor(exp / 2);
    }
    return res;
}

export function combSmall(n: number, m: number, p: number): number {
    if (m > n) return 0;
    let num = 1, den = 1;
    for (let i = 0; i < m; i++) {
        num = (num * (n - i)) % p;
        den = (den * (i + 1)) % p;
    }
    return (num * power(den, p - 2, p)) % p;
}

export function lucas(n: number, m: number, p: number): number {
    if (m === 0) return 1;
    return (combSmall(n % p, m % p, p) * lucas(Math.floor(n / p), Math.floor(m / p), p)) % p;
}`
};

export const LUCAS_144_CODE_LINES = {
  entry: { java: 24, cpp: 18, python: 11, typescript: 22 },
  base: { java: 25, cpp: 19, python: 12, typescript: 23 },
  decompose: { java: 26, cpp: 20, python: 13, typescript: 24 },
  merge: { java: 26, cpp: 20, python: 13, typescript: 24 },
  finish: { java: 27, cpp: 21, python: 14, typescript: 25 },
};

function powerHelper(base: number, exp: number, p: number): number {
  let res = 1;
  base %= p;
  while (exp > 0) {
    if (exp % 2 === 1) res = (res * base) % p;
    base = (base * base) % p;
    exp = Math.floor(exp / 2);
  }
  return res;
}

function combSmallHelper(n: number, m: number, p: number): number {
  if (m > n) return 0;
  let num = 1, den = 1;
  for (let i = 0; i < m; i++) {
    num = (num * (n - i)) % p;
    den = (den * (i + 1)) % p;
  }
  return (num * powerHelper(den, p - 2, p)) % p;
}

export function buildLucas144Steps(n: number, m: number, p: number): Lucas144Step[] {
  const steps: Lucas144Step[] = [];
  const stack: LucasCallFrame[] = [];

  // 1. 入口
  steps.push({
    p,
    stack: [],
    curN: n,
    curM: m,
    ans: -1,
    decision: `主函数入口：准备计算组合数 C(${n}, ${m}) mod ${p}，启动卢卡斯定理递归分解`,
    message: '卢卡斯定理：C(n, m) ≡ C(n/p, m/p) × C(n%p, m%p) (mod p)，将超大参数降阶为 p 进制下各数位的组合数乘积',
    log: `lucas(n=${n}, m=${m}, p=${p})`,
    codeLine: LUCAS_144_CODE_LINES.entry,
    statusBadge: { text: '递归入口', type: 'info' },
  });

  function recurse(curN: number, curM: number): number {
    if (curM === 0) {
      steps.push({
        p,
        stack: JSON.parse(JSON.stringify(stack)),
        curN,
        curM,
        ans: 1,
        decision: `到达基准情形：m = 0，组合数 C(${curN}, 0) 恒等于 1，开始递归回溯`,
        message: '空集的选取方案唯一，直接返回 1',
        log: `comb(${curN}, 0) = 1`,
        codeLine: LUCAS_144_CODE_LINES.base,
        statusBadge: { text: '命中边界 m=0', type: 'success' },
      });
      return 1;
    }

    const nModP = curN % p;
    const mModP = curM % p;
    const nDivP = Math.floor(curN / p);
    const mDivP = Math.floor(curM / p);
    const cSmall = combSmallHelper(nModP, mModP, p);

    const frame: LucasCallFrame = {
      n: curN,
      m: curM,
      nDivP,
      mDivP,
      nModP,
      mModP,
      smallComb: cSmall,
    };
    stack.push(frame);

    steps.push({
      p,
      stack: JSON.parse(JSON.stringify(stack)),
      curN,
      curM,
      ans: -1,
      decision: `递归分解：C(${curN}, ${curM}) = C(${nDivP}, ${mDivP}) × C(${nModP}, ${mModP}) (mod ${p})`,
      message: `单项小模数组合数 C(${nModP}, ${mModP}) % ${p} = ${cSmall}。继续向下递归求解 C(${nDivP}, ${mDivP})`,
      log: `C(${curN},${curM}) -> div=(${nDivP},${mDivP}), mod=(${nModP},${mModP})[${cSmall}]`,
      codeLine: LUCAS_144_CODE_LINES.decompose,
      statusBadge: { text: `递归下潜`, type: 'warning' },
    });

    const higherComb = recurse(nDivP, mDivP);
    const result = (cSmall * higherComb) % p;
    frame.returnedVal = result;

    steps.push({
      p,
      stack: JSON.parse(JSON.stringify(stack)),
      curN,
      curM,
      ans: result,
      decision: `回溯合并：C(${curN}, ${curM}) = ${higherComb} × ${cSmall} % ${p} = ${result}`,
      message: `高阶项与本位小组合数乘积完成`,
      log: `return C(${curN},${curM}) = ${result}`,
      codeLine: LUCAS_144_CODE_LINES.merge,
      statusBadge: { text: `回溯得到 ${result}`, type: 'success' },
    });

    stack.pop();
    return result;
  }

  const finalAns = recurse(n, m);

  steps.push({
    p,
    stack: [],
    curN: n,
    curM: m,
    ans: finalAns,
    decision: `🎉 卢卡斯定理计算完毕！C(${n}, ${m}) mod ${p} = ${finalAns}`,
    message: `成功通过小质数 p 进制拆分完成大组合数求模计算`,
    log: `final answer: ${finalAns}`,
    codeLine: LUCAS_144_CODE_LINES.finish,
    statusBadge: { text: `最终结果 ${finalAns}`, type: 'success' },
  });

  return steps;
}
