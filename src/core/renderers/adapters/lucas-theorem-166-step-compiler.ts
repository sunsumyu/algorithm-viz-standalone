/**
 * Class 166: 卢卡斯定理 (Lucas Theorem) 步进推演编译器
 * 核心：C(n, m) = C(n/p, m/p) * C(n%p, m%p) mod p、p 进制数位独立乘积
 */

import { Advanced161Step, LucasDigitView } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { LUCAS_THEOREM_LINES } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-stage-codes';

export interface LucasStep extends Advanced161Step {
  n: number;
  m: number;
  p: number;
  digits: LucasDigitView[];
  ans?: number;
  stage: string;
}

function combSmall(n: number, m: number, p: number): number {
  if (n < m) return 0;
  if (m === 0 || n === m) return 1;

  let num = 1;
  let den = 1;
  for (let i = 0; i < m; i++) {
    num = (num * (n - i)) % p;
    den = (den * (i + 1)) % p;
  }

  // 费马小定理求逆元
  let invDen = 1;
  let exp = p - 2;
  let base = den;
  while (exp > 0) {
    if (exp & 1) invDen = (invDen * base) % p;
    base = (base * base) % p;
    exp >>= 1;
  }
  return (num * invDen) % p;
}

export function buildLucasSteps(n: number, m: number, p: number): LucasStep[] {
  const steps: LucasStep[] = [];
  const lines = LUCAS_THEOREM_LINES;

  // 拆分 p 进制位
  const digitsN: number[] = [];
  const digitsM: number[] = [];
  let tempN = n;
  let tempM = m;
  while (tempN > 0 || tempM > 0) {
    digitsN.push(tempN % p);
    digitsM.push(tempM % p);
    tempN = Math.floor(tempN / p);
    tempM = Math.floor(tempM / p);
  }

  // Step 0: 入口帧
  steps.push({
    n,
    m,
    p,
    digits: [],
    stage: '主函数入口',
    decision: `主函数入口：准备求解大组合数 C(${n}, ${m}) mod ${p}`,
    message: `利用卢卡斯定理将 n 和 m 按模素数 p=${p} 进制逐位展开递归求解`,
    log: `enter lucas: n=${n}, m=${m}, p=${p}`,
    codeLine: lines.entry,
    metrics: { '上标 n': n, '下标 m': m, '模素数 p': p, '定理': 'C(n, m) = C(n/p, m/p)*C(n%p, m%p)' },
  });

  // Step 1: 检查边界与拆分
  steps.push({
    n,
    m,
    p,
    digits: [],
    stage: '检查递归基准',
    decision: `检查边界条件：m=${m} > 0，启动 p 进制拆解，共需拆解 ${digitsN.length} 个 p 进制位`,
    message: `每位组合数规模均在 [0, p-1] 范围内，可利用预处理阶乘逆元或暴力乘法快速计算`,
    log: `baseCheck: m!=0`,
    codeLine: lines.baseCheck,
    statusBadge: { text: `进制展开: ${digitsN.length} 位`, type: 'info' },
    metrics: { 'p 进制位数': digitsN.length, '单次组合数耗时': 'O(p) 或 O(1)' },
  });

  // 逐位递归计算
  const digitViews: LucasDigitView[] = [];
  let currentProd = 1;

  for (let power = 0; power < digitsN.length; power++) {
    const ni = digitsN[power];
    const mi = digitsM[power];
    const cVal = combSmall(ni, mi, p);
    currentProd = (currentProd * cVal) % p;

    digitViews.push({
      power,
      ni,
      mi,
      combVal: cVal,
    });

    steps.push({
      n,
      m,
      p,
      digits: [...digitViews],
      stage: `计算第 ${power} 位 C(${ni}, ${mi})`,
      decision: `第 ${power} 位 (p^${power})：n_${power}=${ni}, m_${power}=${mi}，计算小组合数 C(${ni}, ${mi}) mod ${p} = ${cVal}`,
      message: `累乘当前项后剩余积为 (${currentProd / (cVal || 1)} * ${cVal}) mod ${p} = ${currentProd}`,
      log: `lucasRecur: power=${power}, ni=${ni}, mi=${mi}, cVal=${cVal}`,
      codeLine: lines.combSmall,
      statusBadge: { text: `第 ${power} 位: ${cVal}`, type: cVal === 0 ? 'danger' : 'info' },
      metrics: { '当前位 power': power, '小组合数 C(ni, mi)': cVal, '当前累乘积': currentProd },
    });

    if (cVal === 0) {
      break;
    }
  }

  // 终态返回
  steps.push({
    n,
    m,
    p,
    digits: [...digitViews],
    ans: currentProd,
    stage: '卢卡斯求解全部完成',
    decision: `🎉 卢卡斯定理计算完成：C(${n}, ${m}) mod ${p} = ${currentProd}`,
    message: `通过 p 进制拆解，大组合数求模时间复杂度降低为 O(p + log_p n)，成功攻克大组合数模小素数难题`,
    log: `returnAns: ans=${currentProd}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `C(${n}, ${m}) % ${p} = ${currentProd}`, type: 'success' },
    metrics: { '最终结果': currentProd, '时间复杂度': 'O(p + log_p n)' },
  });

  return steps;
}
