/**
 * 子集 GCD 为 K 的方案数 (Subset GCD K) - 声明式教学级沙盘渲染器
 * 核心原理：倍数计数 + 容斥原理倒序消除，dp[x] = (2^cnt[x] - 1) - sum(dp[2x, 3x, ...])
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { SUBSET_GCD_K_CODES, SUBSET_GCD_K_LINES } from './math-099-stage-codes';
import { Math099Step } from './math-099-shared';

export interface SubsetGcdStep extends Math099Step {
  nums: number[];
  k: number;
}

export function buildSubsetGcdSteps(nums: number[], k: number): SubsetGcdStep[] {
  const steps: SubsetGcdStep[] = [];
  const lines = SUBSET_GCD_K_LINES;
  const MOD = 1000000007n;

  const maxVal = Math.max(...nums);
  const dp = new Array(maxVal + 1).fill(0n);

  // Step 0: 入口
  steps.push({
    nums: [...nums],
    k,
    decision: `主函数入口：计算数组 [${nums.join(', ')}] 中有多少个子集的最大公约数恰好为 k=${k}`,
    message: '最大值 maxVal=' + maxVal + '，采用倒序容斥消除倍数重叠',
    log: `enter countSubsetGcdK(nums, k=${k})`,
    codeLine: lines.entry,
    metrics: { '目标 gcd': `${k}`, '数组元素数': `${nums.length}`, '最大元素': `${maxVal}` },
  });

  // Step 1: 内存分配
  steps.push({
    nums: [...nums],
    k,
    decision: `分配 dp 数组空间：long[] dp = new long[${maxVal + 1}]`,
    message: '准备从 maxVal 倒序循环至 1 进行容斥计算',
    log: 'allocate dp array',
    codeLine: lines.initDp,
    metrics: { 'dp 长度': `${maxVal + 1}` },
  });

  // 快速幂辅助
  function power2(exp: number): bigint {
    let res = 1n;
    let b = 2n;
    let e = BigInt(exp);
    while (e > 0n) {
      if (e % 2n === 1n) res = (res * b) % MOD;
      b = (b * b) % MOD;
      e /= 2n;
    }
    return res;
  }

  // Step 2: 倒序容斥递推
  for (let x = maxVal; x >= 1; x--) {
    let cnt = 0;
    for (const num of nums) {
      if (num % x === 0) cnt++;
    }

    steps.push({
      nums: [...nums],
      k,
      decision: `外层扫描 x=${x}：数组中有 ${cnt} 个数为 ${x} 的倍数`,
      message: `这 ${cnt} 个数可构成 (2^${cnt} - 1) 个倍数子集`,
      log: `scan x=${x}, count multiples=${cnt}`,
      codeLine: lines.outerLoop,
      metrics: { '当前数值 x': `${x}`, '倍数个数 cnt': `${cnt}` },
    });

    let subsets = (power2(cnt) - 1n + MOD) % MOD;
    for (let mult = 2 * x; mult <= maxVal; mult += x) {
      subsets = (subsets - dp[mult] + MOD) % MOD;
    }

    dp[x] = subsets;

    steps.push({
      nums: [...nums],
      k,
      decision: `容斥消除：dp[${x}] 扣除所有严格倍数 ${2 * x}, ${3 * x}... 的贡献后，最终恰好 GCD=${x} 的子集数为 ${dp[x]}`,
      message: `记录 dp[${x}] = ${dp[x]}`,
      log: `dp[${x}] = ${dp[x]}`,
      codeLine: lines.saveDp,
      metrics: { [`dp[${x}]`]: `${dp[x]}` },
    });
  }

  // Step 3: 返回
  const ans = Number(k <= maxVal ? dp[k] : 0n);
  steps.push({
    nums: [...nums],
    k,
    decision: `🎉 计算完毕！最大公约数恰好等于 ${k} 的非空子集共有 dp[${k}] = ${ans} 个！`,
    message: '收敛返回',
    log: `return dp[${k}] = ${ans}`,
    codeLine: lines.returnAns,
    metrics: { [`最终答案 (GCD=${k})`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}

export const subsetGcdKVisualizer = registerDeclarativeAlgorithm<SubsetGcdStep>({
  id: 'subset-gcd-k-099',
  name: '子集 GCD 为 K 方案数 (Subset GCD K)',
  category: 'math',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 994,
  learningGoal: '掌握倍数计数向公约数计数的倒序容斥转化与多项式去重',
  problemHtml: MATH_099_PROBLEMS.subsetGcdK.html,
  analysisHtml: MATH_099_PROBLEMS.subsetGcdK.html,
  inputs: [
    {
      id: 'input-nums',
      label: '数组元素 (逗号隔开)',
      type: 'text',
      defaultValue: '2, 4, 6, 8, 10',
      placeholder: '例如 2, 4, 6, 8, 10',
    },
    {
      id: 'input-k',
      label: '目标最大公约数 k',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 100,
      step: 1,
      placeholder: '例如 2',
    },
  ],
  codeLanguages: SUBSET_GCD_K_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-nums'] ?? '2, 4, 6, 8, 10');
    const nums = raw
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);
    const k = Math.max(1, parseInt(String(inputs?.['input-k'] ?? '2'), 10) || 2);
    return buildSubsetGcdSteps(nums.length > 0 ? nums : [2, 4, 6, 8, 10], k);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SubsetGcdStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部状态
    const statusBox = document.createElement('div');
    statusBox.style.cssText = 'padding: 10px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;';
    statusBox.innerHTML = `
      <div style="font-weight: 700; color: #1e293b;">
        🎯 目标 GCD = <span style="color: #2563eb; font-size: 16px; font-family: monospace;">${step.k}</span>
      </div>
      <div style="font-family: monospace; font-size: 12px; color: #64748b;">
        输入集合: [${step.nums.join(', ')}]
      </div>
    `;
    root.appendChild(statusBox);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
