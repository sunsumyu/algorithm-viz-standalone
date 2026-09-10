/**
 * Class 164: 杜教筛 (Dujiao Sieve)
 * 亚线性 O(n^(2/3)) 计算积性函数前缀和 / 洛谷 P4213 【模板】杜教筛
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_161_166_PROBLEMS } from './advanced-161-166-problem-content';
import { DUJIAO_SIEVE_CODES, DUJIAO_SIEVE_LINES } from './advanced-161-166-stage-codes';
import { Advanced161Step, DujiaoBlockInfo, renderDujiaoBoard } from './advanced-161-166-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface DujiaoStep extends Advanced161Step {
  n: number;
  preLimit: number;
  blocks: DujiaoBlockInfo[];
  memoCount: number;
  finalAns?: number;
  stage: string;
}

// 预处理线性筛 mu 前缀和
const MAX_PRE = 1000;
const isPrime = new Uint8Array(MAX_PRE + 1).fill(1);
const primes: number[] = [];
const mu = new Int32Array(MAX_PRE + 1);
const sumMu = new Int32Array(MAX_PRE + 1);

isPrime[0] = isPrime[1] = 0;
mu[1] = 1;
for (let i = 2; i <= MAX_PRE; i++) {
  if (isPrime[i]) {
    primes.push(i);
    mu[i] = -1;
  }
  for (let j = 0; j < primes.length && i * primes[j] <= MAX_PRE; j++) {
    isPrime[i * primes[j]] = 0;
    if (i % primes[j] === 0) {
      mu[i * primes[j]] = 0;
      break;
    } else {
      mu[i * primes[j]] = -mu[i];
    }
  }
}
for (let i = 1; i <= MAX_PRE; i++) {
  sumMu[i] = sumMu[i - 1] + mu[i];
}

export function buildDujiaoSteps(targetN: number): DujiaoStep[] {
  const steps: DujiaoStep[] = [];
  const lines = DUJIAO_SIEVE_LINES;
  const memo = new Map<number, number>();

  const preLimit = Math.min(20, targetN);

  function getSum(n: number): number {
    if (n <= preLimit) return sumMu[n];
    if (memo.has(n)) return memo.get(n)!;

    let ans = 1; // (mu * 1) 前缀和恒为 1
    for (let l = 2, r = 0; l <= n; l = r + 1) {
      const q = Math.floor(n / l);
      r = Math.floor(n / q);
      ans -= (r - l + 1) * getSum(q);
    }
    memo.set(n, ans);
    return ans;
  }

  // Step 0: 入口帧
  steps.push({
    n: targetN,
    preLimit,
    blocks: [],
    memoCount: 0,
    stage: '主函数入口',
    decision: `主函数入口：准备使用杜教筛亚线性求莫比乌斯函数前缀和 S(${targetN}) = sum_{i=1}^${targetN} mu(i)`,
    message: `线性筛预处理边界为 ${preLimit}，对于超出部分采用数论分块与哈希记忆化递归`,
    log: `enter getSumMu: n=${targetN}`,
    codeLine: lines.entry,
    metrics: { '询问规模 N': targetN, '线性筛预处理项数': preLimit, '狄利克雷卷积方程': 'mu * 1 = e' },
  });

  // Step 1: 检查预处理边界
  steps.push({
    n: targetN,
    preLimit,
    blocks: [],
    memoCount: 0,
    stage: '检查预处理边界',
    decision: `前 ${preLimit} 项直接查表 O(1) 命中：sumMu[${preLimit}] = ${sumMu[preLimit]}`,
    message: `利用狄利克雷卷积恒等式：g(1)*S(n) = sum_{i=1}^n (f*g)(i) - sum_{d=2}^n g(d)*S(floor(n/d))`,
    log: `preCheck: limit=${preLimit}`,
    codeLine: lines.preCheck,
    statusBadge: { text: `前缀预处理边界: ${preLimit}`, type: 'info' },
    metrics: { '预处理 sumMu[20]': sumMu[preLimit], '预处理时间': 'O(n^(2/3))' },
  });

  // Step 2: 顶层数论分块枚举
  const blocks: DujiaoBlockInfo[] = [];
  let currentAns = 1;

  for (let l = 2, r = 0; l <= targetN; l = r + 1) {
    const q = Math.floor(targetN / l);
    r = Math.floor(targetN / q);
    const subSum = getSum(q);
    const contribution = (r - l + 1) * subSum;
    currentAns -= contribution;

    blocks.push({
      l,
      r,
      nDiv: q,
      subSum,
      contribution,
    });

    steps.push({
      n: targetN,
      preLimit,
      blocks: [...blocks],
      memoCount: memo.size,
      stage: `数论分块区间 [${l}, ${r}]`,
      decision: `整除分块 [${l}, ${r}]：floor(N/d) 恒为 ${q}，区间长度 ${r - l + 1}`,
      message: `递归计算子问题 S(${q}) = ${subSum}，抵消项贡献减去 ${(r - l + 1)} * ${subSum} = ${contribution}`,
      log: `divBlock: [${l}, ${r}], q=${q}, subSum=${subSum}`,
      codeLine: lines.divBlock,
      statusBadge: { text: `分块区间 [${l}, ${r}]`, type: 'warning' },
      metrics: { '当前分块': `[${l}, ${r}]`, '商 floor(N/d)': q, '子问题答案': subSum, '当前累减值': currentAns },
    });
  }

  // Step 3: 终态返回
  memo.set(targetN, currentAns);
  steps.push({
    n: targetN,
    preLimit,
    blocks: [...blocks],
    memoCount: memo.size,
    finalAns: currentAns,
    stage: '前缀和计算全部完成',
    decision: `🎉 杜教筛计算完成：莫比乌斯函数前缀和 S(${targetN}) = ${currentAns}`,
    message: `哈希表共缓存 ${memo.size} 个关键商状态，总计算量严格保证在 O(n^(2/3)) 亚线性级别`,
    log: `returnAns: S(${targetN})=${currentAns}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `S(${targetN}) = ${currentAns}`, type: 'success' },
    metrics: { '最终结果 S(N)': currentAns, '缓存状态数': memo.size, '理论时间复杂度': 'O(n^(2/3))' },
  });

  return steps;
}

export const dujiaoSieveVisualizer = registerDeclarativeAlgorithm<DujiaoStep>({
  id: 'dujiao-sieve-164',
  name: '杜教筛 (Class 164)',
  category: 'math',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 164,
  description: '左程云算法通关课 Class 164：杜教筛。构造狄利克雷卷积方程 mu * 1 = e，配合数论分块与哈希记忆化，亚线性 O(n^(2/3)) 求解积性函数前缀和。',
  learningGoal: '掌握狄利克雷卷积恒等式构造技巧，理解数论分块在商不变区间的加速机制与哈希记忆化剪枝',
  problemHtml: ADVANCED_161_166_PROBLEMS.dujiaoSieve.html,
  analysisHtml: ADVANCED_161_166_PROBLEMS.dujiaoSieve.html,
  inputs: [
    {
      id: 'targetN',
      label: '前缀和询问规模 N',
      type: 'select',
      defaultValue: '50',
      options: [
        { label: 'N = 50 (标准亚线性分块示例)', value: '50' },
        { label: 'N = 100 (中等规模分块示例)', value: '100' },
        { label: 'N = 25 (小规模演示示例)', value: '25' },
      ],
    },
  ],
  codeLanguages: DUJIAO_SIEVE_CODES,
  generateSteps: (input) => {
    const n = Math.max(1, parseInt(String(input.targetN || '50'), 10));
    return buildDujiaoSteps(n);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderDujiaoBoard(step.n, step.preLimit, step.blocks, step.memoCount, step.finalAns, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #7e22ce;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">复杂度突破</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">O(N) -> O(N<sup>2/3</sup>) 亚线性</div>
          </div>
        </div>

        ${renderFormulaCard(
          '杜教筛狄利克雷卷积恒等式',
          `恒等式: g(1) S(n) = &sum;_{i=1}^n (f * g)(i) - &sum;_{d=2}^n g(d) S(&lfloor;n/d&rfloor;) | &mu; * 1 = e &rArr; S_&mu;(n) = 1 - &sum;_{d=2}^n S_&mu;(&lfloor;n/d&rfloor;)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
