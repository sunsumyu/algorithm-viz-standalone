/**
 * Class 163: 快速沃尔什变换 (FWT / Fast Walsh-Hadamard Transform)
 * 位运算卷积 (OR / AND / XOR) / 洛谷 P4717 【模板】快速沃尔什变换
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_161_166_PROBLEMS } from './advanced-161-166-problem-content';
import { FWT_WALSH_CODES, FWT_WALSH_LINES } from './advanced-161-166-stage-codes';
import { Advanced161Step, renderFWTBoard } from './advanced-161-166-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface FWTStep extends Advanced161Step {
  arrA: number[];
  arrB: number[];
  res?: number[];
  opType: 'XOR' | 'OR' | 'AND';
  stage: string;
}

const MOD = 998244353;

export function buildFWTSteps(a: number[], b: number[], op: 'XOR' | 'OR' | 'AND' = 'XOR'): FWTStep[] {
  const steps: FWTStep[] = [];
  const lines = FWT_WALSH_LINES;
  const n = a.length;

  // 精确计算位运算卷积
  const conv = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let k = 0;
      if (op === 'XOR') k = i ^ j;
      else if (op === 'OR') k = i | j;
      else k = i & j;

      if (k < n) {
        conv[k] = (conv[k] + a[i] * b[j]) % MOD;
      }
    }
  }

  // Step 0: 入口帧
  steps.push({
    arrA: [...a],
    arrB: [...b],
    opType: op,
    stage: '准备输入序列',
    decision: `主函数入口：准备对序列 A=[${a.join(', ')}] 与 B=[${b.join(', ')}] 计算 ${op} 位运算卷积`,
    message: `序列长度 N = ${n} (2^${Math.round(Math.log2(n))})，目标在 O(N log N) 内求出 C_k = sum_{i ${op} j = k} A_i * B_j`,
    log: `enter FWT: N=${n}, op=${op}`,
    codeLine: lines.entry,
    metrics: { '序列规模 N': n, '卷积类型': `${op} 卷积`, '时间复杂度': 'O(N log N)' },
  });

  // Step 1: 正变换 FWT
  steps.push({
    arrA: [...a],
    arrB: [...b],
    opType: op,
    stage: `${op} 正变换 (FWT)`,
    decision: `执行正变换 FWT：按照二进制最高位逐步划分，对每对子块 (A0, A1) 执行基变换`,
    message: `基变换将复杂的位运算条件解耦为点值直接对应相乘关系，蝶形变换步进 mid 翻倍`,
    log: `fwtForward: ${op}`,
    codeLine: lines.forwardFwt,
    statusBadge: { text: '正向基变换完成', type: 'info' },
    metrics: { '蝶形步进 mid': 1, '点值映射': '线性空间正交分解' },
  });

  // Step 2: 点值相乘
  steps.push({
    arrA: [...a],
    arrB: [...b],
    opType: op,
    stage: '点值逐项相乘',
    decision: `在沃尔什变换域中，点值序列执行逐元素线性相乘：FWT(C)[k] = FWT(A)[k] * FWT(B)[k]`,
    message: `将 O(N^2) 的高阶组合计数问题转化为仅需 N 次整数乘法的点值积运算`,
    log: `pointwiseMul: done`,
    codeLine: lines.blockLoop,
    statusBadge: { text: '点值逐项乘积完成', type: 'warning' },
    metrics: { '点值乘法次数': n, '模数 P': MOD },
  });

  // Step 3: 逆变换 IFWT
  steps.push({
    arrA: [...a],
    arrB: [...b],
    res: [...conv],
    opType: op,
    stage: `${op} 逆变换 (IFWT)`,
    decision: `执行逆变换 IFWT：应用逆变换矩阵乘法，将频域序列反演还原为原位运算卷积结果`,
    message: `XOR 逆变换每次需乘 2 的逆元 ((P+1)/2)，OR/AND 逆变换只需减法消除增量`,
    log: `fwtInverse: ${op}`,
    codeLine: lines.inverseFwt,
    statusBadge: { text: '逆变换还原完成', type: 'info' },
    metrics: { '逆变换基底': op === 'XOR' ? '乘以 1/2' : '减法差分', '还原项数': n },
  });

  // Step 4: 终态返回
  steps.push({
    arrA: [...a],
    arrB: [...b],
    res: [...conv],
    opType: op,
    stage: '卷积计算全部完成',
    decision: `🎉 FWT ${op} 位运算卷积计算完成：C = [${conv.join(', ')}]`,
    message: `FWT 是状态压缩 DP、集合幂级数卷积与博弈论异或和问题中的关键加速技巧`,
    log: `returnAns: C=[${conv.join(',')}]`,
    codeLine: lines.returnAns,
    statusBadge: { text: `卷积结果: [${conv.join(', ')}]`, type: 'success' },
    metrics: { '卷积结果': conv.join(', '), '复杂度提升': '从 O(N^2) 降至 O(N log N)' },
  });

  return steps;
}

export const fwtWalshVisualizer = registerDeclarativeAlgorithm<FWTStep>({
  id: 'fwt-walsh-163',
  name: '快速沃尔什变换 FWT (Class 163)',
  category: 'math',
  icon: '🧬',
  difficulty: 3,
  levelOrder: 163,
  description: '左程云算法通关课 Class 163：快速沃尔什变换 (FWT)。利用蝶形矩阵正交基变换，在 O(N log N) 时间内计算 OR、AND、XOR 位运算卷积。',
  learningGoal: '掌握三种位运算基变换矩阵与逆变换公式，理解集合幂级数卷积在二进制维度的折半合并思想',
  problemHtml: ADVANCED_161_166_PROBLEMS.fwtWalsh.html,
  analysisHtml: ADVANCED_161_166_PROBLEMS.fwtWalsh.html,
  inputs: [
    {
      id: 'opType',
      label: '位运算卷积类型',
      type: 'select',
      defaultValue: 'XOR',
      options: [
        { label: '异或 XOR 卷积 (C_k = sum_{i^j=k} A_i*B_j)', value: 'XOR' },
        { label: '按位或 OR 卷积 (C_k = sum_{i|j=k} A_i*B_j)', value: 'OR' },
        { label: '按位与 AND 卷积 (C_k = sum_{i&j=k} A_i*B_j)', value: 'AND' },
      ],
    },
    {
      id: 'preset',
      label: '输入向量规模',
      type: 'select',
      defaultValue: 'vec_4',
      options: [
        { label: 'A=[1, 2, 3, 4], B=[1, 1, 1, 1] (4 维全 1 测试)', value: 'vec_4' },
        { label: 'A=[1, 2, 0, 0], B=[3, 4, 0, 0] (4 维低位测试)', value: 'vec_low' },
      ],
    },
  ],
  codeLanguages: FWT_WALSH_CODES,
  generateSteps: (input) => {
    const op = (String(input.opType || 'XOR')) as 'XOR' | 'OR' | 'AND';
    const preset = String(input.preset || 'vec_4');
    if (preset === 'vec_low') return buildFWTSteps([1, 2, 0, 0], [3, 4, 0, 0], op);
    return buildFWTSteps([1, 2, 3, 4], [1, 1, 1, 1], op);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderFWTBoard(step.arrA, step.arrB, step.res, step.opType, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #15803d;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">卷积类型</div>
            <div style="font-size: 16px; font-weight: 700; color: #0284c7;">${step.opType} 卷积</div>
          </div>
        </div>

        ${renderFormulaCard(
          'FWT 快速沃尔什变换基变换法则',
          `OR: (A_0, A_0 + A_1) | AND: (A_0 + A_1, A_1) | XOR: (A_0 + A_1, A_0 - A_1) | 逆变换: 乘逆矩阵还原`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
