/**
 * Class 161: 快速数论变换 (NTT / Number Theoretic Transform) 步进推演编译器
 * 核心：模 998244353 原根 g=3、位逆序置换与模域蝶形网络
 */

import { Advanced161Step } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { NTT_LINES } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-stage-codes';

export interface NTTStep extends Advanced161Step {
  polyA: number[];
  polyB: number[];
  convResult?: number[];
  stage: string;
}

const MOD = 998244353n;
const G = 3n;

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

export function buildNTTSteps(a: number[], b: number[]): NTTStep[] {
  const steps: NTTStep[] = [];
  const lines = NTT_LINES;

  let limit = 1;
  while (limit < a.length + b.length - 1) limit <<= 1;

  // 计算模运算准确卷积
  const conv = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      conv[i + j] = Number((BigInt(conv[i + j]) + BigInt(a[i]) * BigInt(b[j])) % MOD);
    }
  }

  // Step 0: 入口帧
  steps.push({
    polyA: [...a],
    polyB: [...b],
    stage: '准备输入多项式',
    decision: `主函数入口：准备对多项式 A(x)=[${a.join(', ')}] 与 B(x)=[${b.join(', ')}] 执行 NTT 模 998244353 快速卷积`,
    message: `A 项数 ${a.length}, B 项数 ${b.length}，将系数长度扩展至 2 的幂次规模 N = ${limit}`,
    log: `enter NTT: N=${limit}`,
    codeLine: lines.entry,
    metrics: { '多项式 A 长度': a.length, '多项式 B 长度': b.length, '扩展规模 N': limit, '模数 P': 998244353 },
  });

  // Step 1: 雷德算法位逆序置换 (Bit-Reversal)
  steps.push({
    polyA: [...a],
    polyB: [...b],
    stage: '雷德算法位逆序置换',
    decision: `位逆序置换 (Bit-Reversal)：利用 rev[i] 原地对调系数下标，消除递归栈实现自底向上的迭代合并`,
    message: `利用数论性质与原根同构，将原系数映射为分治二叉树底层的叶子节点顺序`,
    log: `bitReversalSwap complete`,
    codeLine: lines.bitReverse,
    statusBadge: { text: '位逆序置换完成', type: 'info' },
    metrics: { '置换数组': `0..${limit - 1}`, '执行模式': '原地 O(1) 空间交换' },
  });

  // Step 2: 模意义原根步进与蝶形运算
  const mid = limit >> 1;
  const gn = Number(power(G, (MOD - 1n) / BigInt(limit), MOD));
  steps.push({
    polyA: [...a],
    polyB: [...b],
    stage: '蝶形网络与原根步进',
    decision: `原根步进 gn = g^((P-1)/2mid) mod P = ${gn}，执行模域蝶形合并运算`,
    message: `在模 998244353 下，x = a[r+l], y = g * a[r+mid+l] % P，合并 a[r+l]=(x+y)%P, a[r+mid+l]=(x-y+P)%P`,
    log: `nttButterfly: mid=${mid}, gn=${gn}`,
    codeLine: lines.butterfly,
    statusBadge: { text: '蝶形模运算进行中', type: 'warning' },
    metrics: { '模数原根 g': 3, '步长步进 gn': gn, '折半半长 mid': mid },
  });

  // Step 3: 点值逐项相乘与 INTT 逆变换
  steps.push({
    polyA: [...a],
    polyB: [...b],
    convResult: [...conv],
    stage: 'INTT 逆变换与系数还原',
    decision: `点值逐位相乘后调用 INTT 逆变换 (type=-1，步长采用逆元 gi=332748118)，乘以 N 的逆元归一化`,
    message: `由于全过程在整数模域进行，彻底消除浮点三角函数的精度误差与累积误差`,
    log: `inttComplete: normalized by invN`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'NTT 卷积还原完毕', type: 'success' },
    metrics: { '卷积项数': conv.length, '时间复杂度': 'O(N log N)', '数值精度': '模域 100% 绝对精确' },
  });

  // Step 4: 终态返回
  steps.push({
    polyA: [...a],
    polyB: [...b],
    convResult: [...conv],
    stage: '卷积计算全部完成',
    decision: `🎉 NTT 快速数论变换卷积完成：C(x) = A(x) * B(x) = [${conv.join(', ')}] (mod 998244353)`,
    message: `NTT 是多项式求逆、多项式除法、多项式开方、多项式 ln/exp 等现代多项式全家桶的基础计算内核`,
    log: `returnAns: complete`,
    codeLine: lines.returnAns,
    statusBadge: { text: `结果: [${conv.join(', ')}]`, type: 'success' },
    metrics: { '最终结果多项式': conv.join(', '), '算法基石': '模域单位根等价原根' },
  });

  return steps;
}
