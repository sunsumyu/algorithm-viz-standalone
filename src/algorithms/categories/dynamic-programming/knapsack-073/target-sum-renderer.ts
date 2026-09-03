/**
 * 目标和 (LeetCode 494) - 声明式 4-Card 沙盘渲染器
 * 核心：正负符号划分推导 -> 子集累加和为 (sum + target) / 2 的 01 背包计数问题
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  TARGET_SUM_PROBLEM_HTML,
  TARGET_SUM_ANALYSIS_HTML,
  TARGET_SUM_CODE_LANGUAGES,
} from './knapsack-073-problem-content';

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
  status: 'init' | 'check-valid' | 'dp-update' | 'done';
  message: string;
  log: string;
  codeLine: number;
  metrics?: Record<string, any>;
}

export function buildTargetSumSteps(nums: number[], target: number): TargetSumStep[] {
  const steps: TargetSumStep[] = [];
  const sum = nums.reduce((acc, x) => acc + Math.abs(x), 0);
  const isSumValid = sum >= Math.abs(target) && ((target + sum) % 2 === 0);
  const requiredSum = isSumValid ? Math.floor((target + sum) / 2) : -1;

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
      codeLine: 8,
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
        message: `❌ 奇偶性或界限不满足：sum < |target| (${sum} < ${Math.abs(target)}) 或 (target+sum) 为奇数，无法划分为整数子集，方案数恒为 0。`,
        log: `invalid: sum=${sum}, target=${target}`,
        codeLine: 10,
      })
    );
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
        status: 'done',
        message: '🏁 决策结束：无法构成目标和，返回方案数 0。',
        log: 'done: ways=0',
        codeLine: 10,
      })
    );
    return steps;
  }

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
      dp: [1],
      ways: 0,
      status: 'check-valid',
      message: `✅ 数学归约成功：sum(正集) = (target + sum) / 2 = (${target} + ${sum}) / 2 = ${requiredSum}。问题转化为容量为 ${requiredSum} 的 01 背包方案计数！`,
      log: `reduction: target sub-sum = ${requiredSum}`,
      codeLine: 11,
    })
  );

  // 3. 01背包计数 DP
  const dp = new Array(requiredSum + 1).fill(0);
  dp[0] = 1; // 凑成 0 的方案数为 1 (空集)

  for (let i = 0; i < nums.length; i++) {
    const num = Math.abs(nums[i]);
    for (let j = requiredSum; j >= num; j--) {
      const added = dp[j - num];
      if (added > 0) {
        dp[j] += added;
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
            message: `➕ 考虑数字 nums[${i}]=${num}：累加和 j=${j} 的方案数增加 dp[${j - num}](${added})，dp[${j}] 增至 ${dp[j]}。`,
            log: `update: dp[${j}] += dp[${j - num}] (${added}) = ${dp[j]}`,
            codeLine: 16,
          })
        );
      }
    }
  }

  // 4. 完成
  steps.push(
    makeStep({
      numIndex: nums.length - 1,
      currentNum: nums[nums.length - 1],
      j: requiredSum,
      nums: [...nums],
      target,
      sum,
      requiredSum,
      isValid: true,
      dp: [...dp],
      ways: dp[requiredSum],
      status: 'done',
      message: `🎉 计数完成！凑成目标和 ${target} 的不同表达式总数为 ${dp[requiredSum]} 种！`,
      log: `finished: total ways = ${dp[requiredSum]}`,
      codeLine: 19,
    })
  );

  return steps;
}

export const TargetSumVisualizer = createDeclarativeVisualizer<TargetSumStep>({
  id: 'target-sum-standard',
  name: '目标和 (01背包方案计数)',
  category: 'dynamic-programming',
  badge: {
    mode: '符号划分 · 背包计数',
    complexity: 'O(N · (S+T)) · O(S+T)',
  },
  card1Title: '📐 正负符号划分与数学归约透视',
  card2Title: '🧮 子序列和计数向量 dp[j] 监视器',
  card2Desc: '展示寻找子集累加和恰好等于 (target + sum)/2 的方案数推导历程',
  legend: [
    { label: '正数分配集合 A', color: '#10b981' },
    { label: '负数分配集合 B', color: '#f87171' },
    { label: '目标容量 t 单元格', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-target',
      label: '目标和 target',
      type: 'number',
      defaultValue: 3,
      width: '60px',
    },
    {
      id: 'input-nums',
      label: '数字数组 nums (逗号分隔)',
      type: 'text',
      defaultValue: '1, 1, 1, 1, 1',
      width: '140px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 经典案例 (nums=[1,1,1,1,1], target=3, Ans=5)',
      values: {
        'input-target': 3,
        'input-nums': '1, 1, 1, 1, 1',
      },
    },
    {
      label: '多样化数组用例 (nums=[1,2,3,4,5], target=3, Ans=3)',
      values: {
        'input-target': 3,
        'input-nums': '1, 2, 3, 4, 5',
      },
    },
  ],
  metrics: [
    { id: 'metric-array-sum', label: '数组总和 sum', color: '#38bdf8' },
    { id: 'metric-target-val', label: '目标和 target', color: '#f59e0b' },
    { id: 'metric-required-t', label: '等价正集容量 t', color: '#10b981' },
    { id: 'metric-total-ways', label: '当前方案数', color: '#a855f7' },
  ],
  codeLanguages: TARGET_SUM_CODE_LANGUAGES,
  problemHtml: TARGET_SUM_PROBLEM_HTML,
  analysisHtml: TARGET_SUM_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const target = parseInt(inputs['input-target'] || '3', 10);
    const nums = (inputs['input-nums'] || '1, 1, 1, 1, 1')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return buildTargetSumSteps(nums, target);
  },
  renderCanvas: (container, step) => {
    const numBadges = step.nums
      .map((num, i) => {
        const isCur = step.numIndex === i;
        const bg = isCur ? '#78350f' : '#1e293b';
        const border = isCur ? '#f59e0b' : '#334155';
        return `
          <span style="display:inline-block; background:${bg}; border:2px solid ${border}; border-radius:6px; padding:4px 10px; font-weight:800; color:#f8fafc; font-size:13px;">
            ${num}
          </span>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:center; align-items:center; background:#0f172a; padding:16px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">输入数字集合 (Input Elements)</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${numBadges}
        </div>
        <div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:10px 16px; margin-top:8px; max-width:420px; text-align:center;">
          <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">数学归约公式推导</div>
          <div style="font-size:13px; font-weight:700; color:#e2e8f0; font-family:monospace;">
            sum(P) = (target + sum) / 2 = (${step.target} + ${step.sum}) / 2 = <span style="color:#10b981;">${step.requiredSum >= 0 ? step.requiredSum : '无解'}</span>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const cells = step.dp.map((val, idx) => {
      const isCur = step.j === idx;
      const bg = isCur ? '#0284c7' : '#1e293b';
      const border = isCur ? '#38bdf8' : '#334155';
      const color = val > 0 ? '#10b981' : '#64748b';
      return `
        <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:36px; padding:4px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
          <span style="font-size:9px; color:#94a3b8;">${idx}</span>
          <span style="font-size:12px; font-weight:700; color:${color};">${val}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">凑出累加和方案数向量 dp[0..${step.dp.length - 1}]</div>
        <div style="display:flex; flex-wrap:wrap; max-height:110px; overflow-y:auto; gap:2px; background:#0b1329; padding:6px; border-radius:6px;">
          ${cells.join('')}
        </div>
      </div>
    `;
  },
});

registerAlgorithm(
  {
    id: 'target-sum-standard',
    name: '目标和 (01背包方案计数)',
    category: 'dynamic-programming',
    difficulty: 'medium',
    description: 'LeetCode 494 目标和：将正负符号选取严密推导归约为容量恰好装满的 01 背包计数问题',
    tags: ['动态规划', '01背包', '集合划分', '左程云073'],
  },
  TargetSumVisualizer
);
