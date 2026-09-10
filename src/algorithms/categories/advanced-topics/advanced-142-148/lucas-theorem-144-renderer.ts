/**
 * Class 144: 卢卡斯定理与大组合数求模 (Lucas Theorem)
 * 洛谷 P3807 【模板】卢卡斯定理 / Lucas Theorem
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
    codeLine: 1,
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
        codeLine: 24,
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
      codeLine: 25,
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
      codeLine: 26,
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
    codeLine: 27,
    statusBadge: { text: `最终结果 ${finalAns}`, type: 'success' },
  });

  return steps;
}

export const lucas144Visualizer = registerDeclarativeAlgorithm<Lucas144Step>({
  id: 'lucas-theorem-144',
  name: '卢卡斯定理 (Class 144)',
  category: 'math',
  icon: '⚛️',
  difficulty: 3,
  levelOrder: 144,
  learningGoal: '掌握卢卡斯定理对大组合数进行 p 进制分解、快速幂与费马小定理求逆元，解决大数模小素数难题',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>给定三个正整数 <code>n, m, p</code>，其中 <code>p</code> 为素数，计算组合数 <code>C(n + m, n) mod p</code> 或 <code>C(n, m) mod p</code> 的值。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>样例输入：</strong>n = 10, m = 3, p = 7<br/>
        <strong>输出样例：</strong>1<br/>
        <strong>解释：</strong>C(10, 3) = 120，120 mod 7 = 1。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'n',
      label: '总数 (n)',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 1000,
    },
    {
      id: 'm',
      label: '选取数 (m)',
      type: 'number',
      defaultValue: 3,
      min: 0,
      max: 1000,
    },
    {
      id: 'p',
      label: '素数模数 (p)',
      type: 'number',
      defaultValue: 7,
      min: 2,
      max: 100,
    },
  ],
  codeLanguages: LUCAS_144_CODES,
  generateSteps: (inputs) => {
    const n = Math.max(1, parseInt(String(inputs.n || 10), 10));
    const m = Math.max(0, parseInt(String(inputs.m || 3), 10));
    const p = Math.max(2, parseInt(String(inputs.p || 7), 10));
    return buildLucas144Steps(n, m, p);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 顶部指标卡 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">素数模数 p</div>
            <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">p = ${step.p}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前帧参数 (n, m)</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">(${step.curN}, ${step.curM})</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前调用栈深度</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.stack.length} 层</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">当前结果 (mod p)</div>
            <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.ans >= 0 ? step.ans : '计算中...'}</div>
          </div>
        </div>

        <!-- 递归调用栈与 p 进制拆解展板 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            📚 卢卡斯递归调用栈与 p 进制数位分解
          </div>
          ${step.stack.length === 0 ? `
            <div style="color: #94a3b8; font-size: 12px; padding: 8px; text-align: center;">调用栈处于初始/已清空状态</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${step.stack.map((frame, idx) => `
                <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                  <div>
                    <span style="font-weight: 700; color: #1e293b;">第 ${idx + 1} 层: C(${frame.n}, ${frame.m})</span>
                    <span style="color: #64748b; margin-left: 12px;">高位: C(${frame.nDivP}, ${frame.mDivP})</span>
                  </div>
                  <div style="font-family: monospace;">
                    <span style="color: #8b5cf6;">低位: C(${frame.nModP}, ${frame.mModP}) = ${frame.smallComb}</span>
                    ${frame.returnedVal !== undefined ? `<span style="margin-left: 12px; color: #059669; font-weight: 700;">➜ 返回 ${frame.returnedVal}</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- 决策卡片 -->
        ${renderFormulaCard(
          '卢卡斯定理核心状态转移',
          `C(n, m) ≡ C(⌊n/p⌋, ⌊m/p⌋) × C(n mod p, m mod p) (mod p)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
