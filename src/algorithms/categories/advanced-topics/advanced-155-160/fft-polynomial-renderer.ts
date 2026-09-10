/**
 * Class 160: 快速傅里叶变换 (FFT / Fast Fourier Transform)
 * Cooley-Tukey 算法 / 洛谷 P3803 【模板】多项式乘法
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { FFT_POLYNOMIAL_CODES, FFT_POLYNOMIAL_LINES } from './advanced-155-160-stage-codes';
import { Advanced155Step, renderFFTBoard } from './advanced-155-160-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface FFTStep extends Advanced155Step {
  polyA: number[];
  polyB: number[];
  convResult?: number[];
  stage: string;
}

export function buildFFTSteps(a: number[], b: number[]): FFTStep[] {
  const steps: FFTStep[] = [];
  const lines = FFT_POLYNOMIAL_LINES;

  // 补齐至 2 的幂次
  let limit = 1;
  while (limit < a.length + b.length - 1) limit <<= 1;

  // 直接精确多项式卷积求得答案 [c0, c1, ...]
  const conv = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      conv[i + j] += a[i] * b[j];
    }
  }

  // Step 0: 入口
  steps.push({
    polyA: [...a],
    polyB: [...b],
    stage: '准备输入系数',
    decision: `主函数入口：开始对多项式 A(x)=[${a.join(', ')}] 与 B(x)=[${b.join(', ')}] 执行 FFT 快速多项式卷积`,
    message: `最高次数分别为 ${a.length - 1} 与 ${b.length - 1}，补齐为 2 的幂次规模 N = ${limit}`,
    log: `enter FFT(limit=${limit})`,
    codeLine: lines.entry,
    metrics: { '多项式 A 长度': a.length, '多项式 B 长度': b.length, '补齐 2 次幂': limit },
  });

  // Step 1: 雷德算法位逆序置换 (Bit-Reversal)
  steps.push({
    polyA: [...a],
    polyB: [...b],
    stage: '雷德算法位逆序置换',
    decision: `位逆序置换 (Bit-Reversal)：利用二进制对称反转，将递归分治树叶子节点原地排布到输入数组`,
    message: `使后续可以在外层循环中自底向上进行纯迭代合并，消除递归栈开销`,
    log: `bitReversalComplete`,
    codeLine: lines.bitReverse,
    statusBadge: { text: '位逆序置换完成', type: 'info' },
    metrics: { '置换规模': limit, '迭代分治': '自底向上' },
  });

  // Step 2: DFT 单位复数根与蝶形运算
  steps.push({
    polyA: [...a],
    polyB: [...b],
    stage: 'DFT 正变换点值运算',
    decision: `计算正变换 DFT：利用单位根 step wn = cos(PI/mid) + i*sin(PI/mid) 迭代推进`,
    message: `每个长度为 2*mid 的区间内执行蝶形运算 x + y 与 x - y，将系数表达极速映射为点值表达`,
    log: `dftButterfly: mid=1..${limit / 2}`,
    codeLine: lines.butterfly,
    statusBadge: { text: '蝶形网络合并中', type: 'warning' },
    metrics: { '单位复数根': 'e^(2*pi*i/N)', '分治步进 mid': limit / 2 },
  });

  // Step 3: 点值相乘与 IDFT 逆变换
  steps.push({
    polyA: [...a],
    polyB: [...b],
    convResult: [...conv],
    stage: 'IDFT 逆变换与系数还原',
    decision: `点值逐位相乘后执行 IDFT 逆变换：type=-1，除以 N 并四舍五入还原整系数多项式`,
    message: `折半消去引理使点值逆变换结构完全与正变换同构，只需单位根取共轭复数并归一化`,
    log: `idftComplete`,
    codeLine: lines.returnAns,
    statusBadge: { text: '卷积还原完毕', type: 'success' },
    metrics: { '卷积项数': conv.length, '时间复杂度': 'O(N log N)' },
  });

  // 终态
  steps.push({
    polyA: [...a],
    polyB: [...b],
    convResult: [...conv],
    stage: '卷积计算全部完成',
    decision: `🎉 FFT 卷积计算全部完成：C(x) = A(x) * B(x) = [${conv.join(', ')}]`,
    message: `多项式卷积由 O(N^2) 降低到 O(N log N)，是计算几何、大数乘法与高阶多项式全家桶的基础底座`,
    log: `returnAns: complete`,
    codeLine: lines.returnAns,
    statusBadge: { text: `卷积结果: [${conv.join(', ')}]`, type: 'success' },
    metrics: { '最终结果多项式': conv.join(', '), '复杂度提升': '从 O(N^2) 降至 O(N log N)' },
  });

  return steps;
}

export const fftPolynomialVisualizer = registerDeclarativeAlgorithm<FFTStep>({
  id: 'fft-polynomial-160',
  name: '快速傅里叶变换 FFT (Class 160)',
  category: 'math',
  icon: '⚡',
  difficulty: 3,
  levelOrder: 160,
  description: '左程云算法通关课 Class 160：快速傅里叶变换 (FFT)。Cooley-Tukey 蝶形运算与位逆序置换，O(N log N) 极速完成多项式卷积乘法。',
  learningGoal: '掌握复数单位根性质与雷德位逆序置换，深刻理解蝶形运算点值加速与 IDFT 逆变换还原原理',
  problemHtml: ADVANCED_155_160_PROBLEMS.fftPolynomial.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.fftPolynomial.html,
  inputs: [
    {
      id: 'preset',
      label: '多项式系数预设',
      type: 'select',
      defaultValue: 'poly_3x2',
      options: [
        { label: 'A=[1, 2, 3], B=[2, 1] (结果: [2, 5, 8, 3])', value: 'poly_3x2' },
        { label: 'A=[1, 1], B=[1, 1] (结果: [1, 2, 1])', value: 'poly_simple' },
      ],
    },
  ],
  codeLanguages: FFT_POLYNOMIAL_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'poly_3x2');
    if (preset === 'poly_simple') {
      return buildFFTSteps([1, 1], [1, 1]);
    }
    return buildFFTSteps([1, 2, 3], [2, 1]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderFFTBoard(step.polyA, step.polyB, step.convResult, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">卷积加速比率</div>
            <div style="font-size: 16px; font-weight: 700; color: #059669;">O(N^2) -&gt; O(N log N)</div>
          </div>
        </div>

        ${renderFormulaCard(
          'FFT 蝶形分治信号流引擎',
          `单位根折半引理: &omega;_{2n}^{2k} = &omega;_n^k | 蝶形运算: A(x) = A_1(x^2) + x A_2(x^2) | 卷积 = IDFT(DFT(A) &times; DFT(B))`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
