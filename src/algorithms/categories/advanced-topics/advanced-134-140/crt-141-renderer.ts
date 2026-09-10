/**
 * Class 141: 中国剩余定理 (Chinese Remainder Theorem - CRT)
 * 洛谷 P1495 【模板】中国剩余定理(CRT) / 孙子算经 "物不知数"
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
    codeLine: 1,
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
      codeLine: 18,
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
    codeLine: 24,
    statusBadge: { text: `最终解 x = ${finalAns}`, type: 'success' },
  });

  return steps;
}

export const crt141Visualizer = registerDeclarativeAlgorithm<Crt141Step>({
  id: 'crt-141',
  name: '中国剩余定理 (Class 141)',
  category: 'math',
  icon: '📜',
  difficulty: 3,
  levelOrder: 141,
  learningGoal: '掌握中国剩余定理 (CRT) 的构造性证明与逆元求解，秒杀孙子算经经典物不知数线性同余方程组',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述 (孙子算经·物不知数)</h3>
      <p>有物不知其数，三三数之剩二，五五数之剩三，七七数之剩二。问物几何？</p>
      <p>即求解一元线性同余方程组：<br/>
      <code>x ≡ 2 (mod 3)</code><br/>
      <code>x ≡ 3 (mod 5)</code><br/>
      <code>x ≡ 2 (mod 7)</code></p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>最小正整数解：</strong>23<br/>
        <strong>解释：</strong>23 % 3 = 2, 23 % 5 = 3, 23 % 7 = 2。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'moduli',
      label: '模数序列 (两两互质正整数)',
      type: 'text',
      defaultValue: '3, 5, 7',
      placeholder: '请输入模数 m_i',
    },
    {
      id: 'remainders',
      label: '余数序列 (对应方程余数 a_i)',
      type: 'text',
      defaultValue: '2, 3, 2',
      placeholder: '请输入余数 a_i',
    },
  ],
  codeLanguages: CRT_141_CODES,
  generateSteps: (inputs) => {
    const rawM = String(inputs.moduli || '3, 5, 7');
    const rawA = String(inputs.remainders || '2, 3, 2');
    const mList = rawM.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const aList = rawA.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildCrt141Steps(mList.length > 0 ? mList : [3, 5, 7], aList.length > 0 ? aList : [2, 3, 2]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 顶部核心指标 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">模数总积 M</div>
            <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">M = ${step.totalM}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前求解项</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.curIndex >= 0 && step.curIndex < step.items.length ? `第 ${step.curIndex + 1} 组` : '完成'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前累计和 (mod M)</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.accumulatedX}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">最小正整数解 x</div>
            <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.finalAns >= 0 ? step.finalAns : '求解中...'}</div>
          </div>
        </div>

        <!-- 同余方程构造表 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            📊 同余方程组与 CRT 分项构造表
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #e2e8f0; color: #334155; text-align: center;">
                <th style="padding: 8px; border: 1px solid #cbd5e1;">方程</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1;">模数 m_i</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1;">余数 a_i</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1;">除模积 M_i = M/m_i</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1;">逆元 t_i (mod m_i)</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1;">项加权 a_i·M_i·t_i</th>
              </tr>
            </thead>
            <tbody>
              ${step.items.map((it, idx) => {
                const isActive = idx === step.curIndex;
                return `
                  <tr style="text-align: center; background: ${isActive ? '#eff6ff' : '#ffffff'}; font-weight: ${isActive ? '700' : 'normal'};">
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">方程 ${idx + 1}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #0284c7;">${it.m}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #e11d48;">${it.a}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${it.Mi > 0 ? it.Mi : '-'}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; color: #8b5cf6;">${it.ti > 0 ? it.ti : '-'}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; color: #059669;">${it.term > 0 ? it.term : '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- 决策卡片 -->
        ${renderFormulaCard(
          'CRT 构造公式',
          `x = ∑ (a_i × M_i × t_i) mod M，其中 M_i × t_i ≡ 1 (mod m_i)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
