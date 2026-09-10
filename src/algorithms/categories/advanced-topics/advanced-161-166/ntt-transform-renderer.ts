/**
 * Class 161: 快速数论变换 (NTT / Number Theoretic Transform)
 * 模 998244353 原根 g=3 / 洛谷 P3803 【模板】多项式乘法 NTT
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_161_166_PROBLEMS } from './advanced-161-166-problem-content';
import { NTT_CODES, NTT_LINES } from './advanced-161-166-stage-codes';
import { Advanced161Step, renderNTTBoard } from './advanced-161-166-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface NTTStep extends Advanced161Step {
  polyA: number[];
  polyB: number[];
  convResult?: number[];
  stage: string;
}

const MOD = 998244353n;
const G = 3n;
const GI = 332748118n; // 3 的模逆元

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

export const nttTransformVisualizer = registerDeclarativeAlgorithm<NTTStep>({
  id: 'ntt-transform-161',
  name: '快速数论变换 NTT (Class 161)',
  category: 'math',
  icon: '⚡',
  difficulty: 3,
  levelOrder: 161,
  description: '左程云算法通关课 Class 161：快速数论变换 (NTT)。基于特殊质数 P=998244353 与原根 g=3，在整数模域消除浮点误差，O(N log N) 极速完成多项式乘法。',
  learningGoal: '掌握原根同构复数单位根性质，理解位逆序置换与模运算蝶形网络结构，掌握 INTT 逆变换归一化流程',
  problemHtml: ADVANCED_161_166_PROBLEMS.nttTransform.html,
  analysisHtml: ADVANCED_161_166_PROBLEMS.nttTransform.html,
  inputs: [
    {
      id: 'preset',
      label: '多项式系数预设',
      type: 'select',
      defaultValue: 'poly_3x2',
      options: [
        { label: 'A=[1, 2, 3], B=[2, 1] (结果: [2, 5, 8, 3])', value: 'poly_3x2' },
        { label: 'A=[1, 1], B=[1, 1] (结果: [1, 2, 1])', value: 'poly_simple' },
        { label: 'A=[3, 4], B=[1, 2] (结果: [3, 10, 8])', value: 'poly_sample2' },
      ],
    },
  ],
  codeLanguages: NTT_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'poly_3x2');
    if (preset === 'poly_simple') return buildNTTSteps([1, 1], [1, 1]);
    if (preset === 'poly_sample2') return buildNTTSteps([3, 4], [1, 2]);
    return buildNTTSteps([1, 2, 3], [2, 1]);
  },
  renderCanvas: (container, step) => {
    let limit = 1;
    while (limit < step.polyA.length + step.polyB.length - 1) limit <<= 1;

    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderNTTBoard(step.polyA, step.polyB, step.convResult, step.stage, limit)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #4338ca;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">模域特性</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">100% 整数无精度截断</div>
          </div>
        </div>

        ${renderFormulaCard(
          'NTT 原根同构蝶形引擎',
          `单位根替换: &omega;_n &equiv; g^{(P-1)/n} (mod P) | 模数 P = 998244353, g = 3 | 蝶形递推: A(x) = A_even(x^2) + x &middot; A_odd(x^2)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
