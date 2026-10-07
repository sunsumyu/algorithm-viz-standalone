/**
 * 目标和 (LeetCode 494 / 左程云 Class 073 Code03)
 * Step Compiler: 正负符号划分数学归约为 01 背包方案计数状态推演
 */

import type { HighlightTarget } from '../../code-panel';

export interface TargetSumStep {
  numIndex: number;
  currentNum: number;
  j: number;
  nums: number[];
  target: number;
  sum: number;
  requiredSum: number;
  isValid: boolean;
  dp: number[];
  ways: number;
  status: 'init' | 'check-valid' | 'dp-update' | 'keep' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function buildTargetSumSteps(nums: number[], target: number): TargetSumStep[] {
  const steps: TargetSumStep[] = [];
  const sum = nums.reduce((acc, x) => acc + Math.abs(x), 0);
  const isSumValid = sum >= Math.abs(target) && ((target + sum) % 2 === 0);
  const requiredSum = isSumValid ? Math.floor((target + sum) / 2) : -1;

  const lines = {
    entry: { java: 5, cpp: 7, python: 1, javascript: 2 },
    check: { java: 8, cpp: 10, python: 4, javascript: 4 },
    initDp: { java: 11, cpp: 12, python: 7, javascript: 6 },
    numLoop: { java: 13, cpp: 14, python: 9, javascript: 8 },
    capLoop: { java: 14, cpp: 15, python: 10, javascript: 9 },
    updateDp: { java: 15, cpp: 16, python: 11, javascript: 10 },
    returnAns: { java: 18, cpp: 19, python: 12, javascript: 13 },
  };

  function makeStep(data: Omit<TargetSumStep, 'metrics'>): TargetSumStep {
    return {
      ...data,
      metrics: {
        'metric-array-sum': `${sum}`,
        'metric-target-val': `${target}`,
        'metric-required-t': requiredSum >= 0 ? `${requiredSum}` : '无解 (奇偶或越界)',
        'metric-total-ways': `${data.ways}`,
      },
    };
  }

  // 1. 初始化
  steps.push(
    makeStep({
      numIndex: -1,
      currentNum: 0,
      j: -1,
      nums: [...nums],
      target,
      sum,
      requiredSum,
      isValid: isSumValid,
      dp: [1],
      ways: 0,
      status: 'init',
      message: `🎯 表达式目标和分析：数组 nums=[${nums.join(', ')}]，总和 sum=${sum}，目标 target=${target}。`,
      log: `init: nums=[${nums.join(', ')}], target=${target}, sum=${sum}`,
      codeLine: lines.entry,
    })
  );

  // 2. 检查奇偶性与上下界
  if (!isSumValid || requiredSum < 0) {
    steps.push(
      makeStep({
        numIndex: -1,
        currentNum: 0,
        j: -1,
        nums: [...nums],
        target,
        sum,
        requiredSum,
        isValid: false,
        dp: [0],
        ways: 0,
        status: 'check-valid',
        message: `❌ 奇偶性或界限不满足：sum < |target| (${sum} < ${Math.abs(target)}) 或 (target+sum) 为奇数，无法划分为整数正子集，方案数恒为 0。`,
        log: `invalid: sum=${sum}, target=${target}`,
        codeLine: lines.check,
      })
    );
    steps.push(
      makeStep({
        numIndex: -1,
        currentNum: 0,
        j: 0,
        nums: [...nums],
        target,
        sum,
        requiredSum,
        isValid: false,
        dp: [0],
        ways: 0,
        status: 'done',
        message: '🏁 运算结束，无解返回 0。',
        log: 'done: ans=0',
        codeLine: lines.returnAns,
      })
    );
    return steps;
  }

  // 3. 构造 01 背包方案计数 DP
  const dp = new Array(requiredSum + 1).fill(0);
  dp[0] = 1;

  steps.push(
    makeStep({
      numIndex: -1,
      currentNum: 0,
      j: -1,
      nums: [...nums],
      target,
      sum,
      requiredSum,
      isValid: true,
      dp: [...dp],
      ways: dp[requiredSum],
      status: 'check-valid',
      message: `✅ 合法性验证通过！转化公式：sum(P) = (target + sum) / 2 = (${target} + ${sum}) / 2 = ${requiredSum}。目标求凑齐容量 ${requiredSum} 的方案数。`,
      log: `valid: targetSum=${requiredSum}`,
      codeLine: lines.initDp,
    })
  );

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];

    steps.push(
      makeStep({
        numIndex: i,
        currentNum: num,
        j: -1,
        nums: [...nums],
        target,
        sum,
        requiredSum,
        isValid: true,
        dp: [...dp],
        ways: dp[requiredSum],
        status: 'dp-update',
        message: `🔍 考察元素 #${i + 1} (数值=${num})：准备倒序累加转移方案数。`,
        log: `item #${i + 1}: num=${num}`,
        codeLine: lines.numLoop,
      })
    );

    for (let j = requiredSum; j >= num; j--) {
      steps.push(
        makeStep({
          numIndex: i,
          currentNum: num,
          j,
          nums: [...nums],
          target,
          sum,
          requiredSum,
          isValid: true,
          dp: [...dp],
          ways: dp[requiredSum],
          status: 'dp-update',
          message: `⏳ 倒序枚举目标和：当前和 j=${j} >= 数值 ${num}，准备累加转移。`,
          log: `cap loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      const addWays = dp[j - num];
      dp[j] += addWays;

      steps.push(
        makeStep({
          numIndex: i,
          currentNum: num,
          j,
          nums: [...nums],
          target,
          sum,
          requiredSum,
          isValid: true,
          dp: [...dp],
          ways: dp[requiredSum],
          status: addWays > 0 ? 'dp-update' : 'keep',
          message: addWays > 0
            ? `✨ 方案累加：若选取元素 #${i + 1} (${num})，从 dp[${j - num}]=${addWays} 转移，使得凑出和 ${j} 的方案数增至 dp[${j}]=${dp[j]}！`
            : `⏸️ 方案保持：dp[${j - num}]=0，凑出和 ${j} 的方案数保持为 ${dp[j]}。`,
          log: `dp[${j}] += dp[${j - num}] (${addWays}) => ${dp[j]}`,
          codeLine: lines.updateDp,
        })
      );
    }
  }

  steps.push(
    makeStep({
      numIndex: -1,
      currentNum: 0,
      j: requiredSum,
      nums: [...nums],
      target,
      sum,
      requiredSum,
      isValid: true,
      dp: [...dp],
      ways: dp[requiredSum],
      status: 'done',
      message: `🎉 目标和推演完毕！使用所给数字通过 +/- 运算符凑出目标 target=${target} 的方案总数为 ${dp[requiredSum]} 种！`,
      log: `done: totalWays=${dp[requiredSum]}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

export function parseTargetSumInputs(inputs: Record<string, any>) {
  const target = parseInt(inputs['input-target'] || '3', 10);
  const nums = String(inputs['input-nums'] || '1, 1, 1, 1, 1')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  return { target, nums };
}
