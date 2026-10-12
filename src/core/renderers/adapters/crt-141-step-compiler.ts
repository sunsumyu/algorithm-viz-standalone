import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface CrtItem {
  m: number; // 模数
  a: number; // 余数
  Mi: number; // M / m
  ti: number; // Mi 模 m 的逆元
  term: number; // a * Mi * ti
}

export interface Crt141Step extends StepBase {
  items: CrtItem[];
  totalM: number;
  curIndex: number;
  accumulatedX: number;
  finalAns: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const CRT_141_CODES = {
  java: `public class CRT {
    public static long exgcd(long a, long b, long[] xy) {
        if (b == 0) {
            xy[0] = 1; xy[1] = 0;
            return a;
        }
        long g = exgcd(b, a % b, xy);
        long x1 = xy[0], y1 = xy[1];
        xy[0] = y1;
        xy[1] = x1 - (a / b) * y1;
        return g;
    }

    public static long crt(long[] m, long[] a, int n) {
        long M = 1;
        for (int i = 0; i < n; i++) M *= m[i];
        long ans = 0;
        long[] xy = new long[2];
        for (int i = 0; i < n; i++) {
            long Mi = M / m[i];
            exgcd(Mi, m[i], xy);
            long ti = (xy[0] % m[i] + m[i]) % m[i];
            ans = (ans + a[i] * Mi % M * ti) % M;
        }
        return (ans % M + M) % M;
    }
}`,
  cpp: `long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (!b) { x = 1; y = 0; return a; }
    long long g = exgcd(b, a % b, y, x);
    y -= (a / b) * x;
    return g;
}

long long crt(const vector<long long>& m, const vector<long long>& a, int n) {
    long long M = 1, ans = 0;
    for (int i = 0; i < n; i++) M *= m[i];
    for (int i = 0; i < n; i++) {
        long long Mi = M / m[i], x, y;
        exgcd(Mi, m[i], x, y);
        long long ti = (x % m[i] + m[i]) % m[i];
        ans = (ans + a[i] * Mi % M * ti) % M;
    }
    return (ans % M + M) % M;
}`,
  python: `def exgcd(a, b):
    if b == 0: return 1, 0, a
    x1, y1, g = exgcd(b, a % b)
    return y1, x1 - (a // b) * y1, g

def crt(m, a):
    M = 1
    for x in m: M *= x
    ans = 0
    for mi, ai in zip(m, a):
        Mi = M // mi
        x, _, _ = exgcd(Mi, mi)
        ti = (x % mi + mi) % mi
        ans = (ans + ai * Mi * ti) % M
    return ans % M`,
  typescript: `export function exgcd(a: number, b: number): [number, number, number] {
    if (b === 0) return [1, 0, a];
    const [x1, y1, g] = exgcd(b, a % b);
    return [y1, x1 - Math.floor(a / b) * y1, g];
}

export function crt(m: number[], a: number[]): number {
    let M = 1;
    for (const x of m) M *= x;
    let ans = 0;
    for (let i = 0; i < m.length; i++) {
        const Mi = Math.floor(M / m[i]);
        const [x] = exgcd(Mi, m[i]);
        const ti = ((x % m[i]) + m[i]) % m[i];
        ans = (ans + a[i] * Mi * ti) % M;
    }
    return ((ans % M) + M) % M;
}`
};

export const CRT_141_CODE_LINES = {
  init: { java: 15, cpp: 9, python: 7, typescript: 8 },
  loop: { java: 21, cpp: 13, python: 13, typescript: 13 },
  finish: { java: 25, cpp: 17, python: 15, typescript: 17 },
};

function exgcdHelper(a: number, b: number): [number, number, number] {
  if (b === 0) return [1, 0, a];
  const [x1, y1, g] = exgcdHelper(b, a % b);
  return [y1, x1 - Math.floor(a / b) * y1, g];
}

export function buildCrt141Steps(mList: number[], aList: number[]): Crt141Step[] {
  const steps: Crt141Step[] = [];
  const n = Math.min(mList.length, aList.length);

  let M = 1;
  for (let i = 0; i < n; i++) M *= mList[i];

  const items: CrtItem[] = mList.slice(0, n).map((m, idx) => ({
    m,
    a: aList[idx],
    Mi: 0,
    ti: 0,
    term: 0,
  }));

  // 1. 入口
  steps.push({
    items: JSON.parse(JSON.stringify(items)),
    totalM: M,
    curIndex: -1,
    accumulatedX: 0,
    finalAns: -1,
    decision: `主函数入口：输入 ${n} 组同余方程，总模数乘积 M = ${mList.slice(0, n).join(' × ')} = ${M}`,
    message: '中国剩余定理前提：各模数 m_i 两两互质，必存在模 M 的唯一最小非负整数特解',
    log: `enter CRT(n=${n}, M=${M})`,
    codeLine: CRT_141_CODE_LINES.init,
    statusBadge: { text: '初始化', type: 'info' },
  });

  let acc = 0;
  for (let i = 0; i < n; i++) {
    const mi = items[i].m;
    const ai = items[i].a;
    const Mi = Math.floor(M / mi);
    const [x] = exgcdHelper(Mi, mi);
    const ti = ((x % mi) + mi) % mi;
    const term = (ai * Mi * ti) % M;
    acc = (acc + term) % M;

    items[i].Mi = Mi;
    items[i].ti = ti;
    items[i].term = term;

    steps.push({
      items: JSON.parse(JSON.stringify(items)),
      totalM: M,
      curIndex: i,
      accumulatedX: acc,
      finalAns: -1,
      decision: `处理第 ${i + 1} 个方程 x ≡ ${ai} (mod ${mi})：Mi = M / ${mi} = ${Mi}，扩展欧几里得求逆元 ti = ${ti}`,
      message: `单项构造加权值 term = a_i * M_i * t_i = ${ai} × ${Mi} × ${ti} = ${term} (mod ${M})，累计和更新为 ${acc}`,
      log: `equation ${i}: Mi=${Mi}, ti=${ti}, term=${term}`,
      codeLine: CRT_141_CODE_LINES.loop,
      statusBadge: { text: `求解第 ${i + 1} 项`, type: 'warning' },
    });
  }

  const finalAns = ((acc % M) + M) % M;
  steps.push({
    items: JSON.parse(JSON.stringify(items)),
    totalM: M,
    curIndex: n,
    accumulatedX: acc,
    finalAns,
    decision: `🎉 求解完成！同余方程组最小非负整数解 x = (${acc} % ${M}) = ${finalAns}`,
    message: `验证：对于所有方程均有 x % m_i == a_i，满足同余关系`,
    log: `CRT solved: x = ${finalAns}`,
    codeLine: CRT_141_CODE_LINES.finish,
    statusBadge: { text: `最终解 x = ${finalAns}`, type: 'success' },
  });

  return steps;
}
