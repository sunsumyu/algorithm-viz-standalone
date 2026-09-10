/**
 * Class 145: 二项式反演与错排问题 (Binomial Inversion & Derangement)
 * 洛谷 P1595 信封问题 / HDU 1465 不容易系列之(一)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_142_148_PROBLEMS } from './advanced-142-148-problem-content';
import { BINOMIAL_INVERSION_CODES, BINOMIAL_INVERSION_LINES } from './advanced-142-148-stage-codes';
import { Advanced142Step, renderDerangementBoard } from './advanced-142-148-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface DerangementStep extends Advanced142Step {
  n: number;
  curI: number;
  d: number[];
}

export function buildDerangementSteps(n: number): DerangementStep[] {
  const steps: DerangementStep[] = [];
  const lines = BINOMIAL_INVERSION_LINES;

  const d = new Array(n + 1).fill(0);
  const cloneD = () => [...d];

  // Step 0: 入口
  steps.push({
    n,
    curI: -1,
    d: cloneD(),
    decision: `主函数入口：开始计算 ${n} 个元素的完全错排数 D(${n})`,
    message: `完全错排是指每一个元素均不放在自己原有位置上的排列方式，是二项式反演的基础原型`,
    log: `enter derangement(n=${n})`,
    codeLine: lines.entry,
    metrics: { '元素规模 N': n, '递推公式': 'D[i] = (i - 1) * (D[i-1] + D[i-2])' },
  });

  // Step 1: 边界基底初始化
  d[0] = 1;
  if (n >= 1) d[1] = 0;

  steps.push({
    n,
    curI: 1,
    d: cloneD(),
    decision: `边界基底初始化：D[0] = 1 (0 个元素错排定义为 1 种)，D[1] = 0 (1 个元素无法错排)`,
    message: `奠定递推基础，二项式反演边界由容斥原理定义 D[0]=1`,
    log: `baseInit: d[0]=1, d[1]=0`,
    codeLine: lines.baseInit,
    metrics: { 'D[0]': 1, 'D[1]': 0, '当前进度': '基底确立' },
  });

  // Step 2: 递推计算
  for (let i = 2; i <= n; i++) {
    d[i] = (i - 1) * (d[i - 1] + d[i - 2]);

    steps.push({
      n,
      curI: i,
      d: cloneD(),
      decision: `计算 D[${i}] = (${i} - 1) * (D[${i - 1}] + D[${i - 2}]) = ${i - 1} * (${d[i - 1]} + ${d[i - 2]}) = ${d[i]}`,
      message: `分两类情况讨论第 ${i} 个元素的位置交换：若与前一个配对互换贡献 (i-1)*D[i-2]，否则构成更大环贡献 (i-1)*D[i-1]`,
      log: `recurse: i=${i}, d[${i}]=${d[i]}`,
      codeLine: lines.recurse,
      metrics: { '规模 i': i, 'D[i-1]': d[i - 1], 'D[i-2]': d[i - 2], '新计算结果': d[i] },
    });
  }

  // Step 3: 返回终态
  steps.push({
    n,
    curI: n,
    d: cloneD(),
    decision: `🎉 计算完成：${n} 个元素的完全错排方案数为 D[${n}] = ${d[n]}`,
    message: `二项式反演形式：f(n) = sum_{i=0}^n (-1)^{n-i} * C(n, i) * g(i)，完全对应欧拉错排公式`,
    log: `returnAns: d[${n}]=${d[n]}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `D(${n}) = ${d[n]}`, type: 'success' },
    metrics: { '最终结果': d[n], '时间复杂度': `O(N) = O(${n})`, '空间复杂度': `O(N) = O(${n})` },
  });

  return steps;
}

export const binomialInversionVisualizer = registerDeclarativeAlgorithm<DerangementStep>({
  id: 'binomial-inversion-145',
  name: '二项式反演与错排问题 (Class 145)',
  category: 'math',
  icon: '🧮',
  difficulty: 2,
  levelOrder: 145,
  description: '左程云算法通关课 Class 145：二项式反演与经典错排。通过恰好与至多/至少的组合计数双向反演，系统推导错排问题的 O(N) 线性递推与通项闭式。',
  learningGoal: '掌握二项式反演对称形式与经典错排问题的线性递推及闭式解转化机制',
  problemHtml: ADVANCED_142_148_PROBLEMS.binomialInversion.html,
  analysisHtml: ADVANCED_142_148_PROBLEMS.binomialInversion.html,
  inputs: [
    {
      id: 'n',
      label: '错排元素个数 N (0 ~ 10)',
      type: 'number',
      defaultValue: 5,
    },
  ],
  codeLanguages: BINOMIAL_INVERSION_CODES,
  generateSteps: (input) => {
    const n = Math.max(0, Math.min(10, Number(input.n ?? 5)));
    return buildDerangementSteps(n);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderDerangementBoard(step.n, step.d, step.curI)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前求解规模</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">i = ${step.curI >= 0 ? step.curI : '初始化'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">对应错排数 D[i]</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.curI >= 0 ? step.d[step.curI] : '-'}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '二项式反演与容斥引擎',
          `全排列展开: N! = &sum; C(N, k) * D[k] <== 反演 ==&gt; D[N] = &sum; (-1)^{N-k} * C(N, k) * k!`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
