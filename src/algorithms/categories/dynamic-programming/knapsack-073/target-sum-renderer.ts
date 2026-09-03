/**
 * 目标和 (LeetCode 494) - 声明式 4-Card 沙盘渲染器
 * 核心：正负符号划分推导 -> 子集累加和为 (sum + target) / 2 的 01 背包计数问题
 * 架构重构：引入四语言代码联动、集合划分数学仓与实时方案数载荷舱
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  TARGET_SUM_PROBLEM_HTML,
  TARGET_SUM_ANALYSIS_HTML,
  TARGET_SUM_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import { renderKnapsackDpMatrix } from '../../../../core/renderers/knapsack-sandbox-stage';

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
    check: { java: 8, cpp: 8, python: 4, javascript: 4 },
    initDp: { java: 11, cpp: 10, python: 6, javascript: 6 },
    numLoop: { java: 13, cpp: 12, python: 8, javascript: 8 },
    capLoop: { java: 14, cpp: 13, python: 9, javascript: 9 },
    updateDp: { java: 15, cpp: 14, python: 10, javascript: 10 },
    returnAns: { java: 18, cpp: 17, python: 11, javascript: 13 },
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
      codeLine: lines.check,
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

const { template, Visualizer } = createDeclarativeVisualizer<TargetSumStep>({
  id: 'target-sum-standard',
  name: '目标和 (01背包方案计数)',
  category: 'dynamic-programming',
  badge: {
    mode: '01背包 · 方案数累加',
    complexity: 'O(N · T) · O(T)',
  },
  card1Title: '待分配符号数字与正集容量达成舱',
  card2Title: '凑出累加和方案数向量 dp[0..(target+sum)/2]',
  card2Desc: '展示利用正负集代数转化将添加符号问题变为 01 背包方案数累加的推演过程',
  legend: [
    { label: '方案数为 0', color: '#475569' },
    { label: '已有可行方案', color: '#10b981' },
    { label: '当前考察容量 j', color: '#38bdf8' },
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
        const bg = isCur ? 'rgba(30, 58, 138, 0.6)' : 'rgba(15, 23, 42, 0.6)';
        const border = isCur ? '#38bdf8' : '#334155';
        return `
          <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:6px 12px; min-width:60px; text-align:center;">
            <div style="font-size:10px; color:#94a3b8;">#${i + 1}</div>
            <div style="font-size:14px; font-weight:800; color:#f8fafc; margin-top:2px;">${num}</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:8px;">
          <div style="font-size:12px; color:#94a3b8; font-weight:700;">待分配符号数字集合 (目标 target=${step.target}，数组总和 sum=${step.sum})</div>
          <div style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
            当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.requiredSum >= 0 ? step.requiredSum : '—'}
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${numBadges}
        </div>

        <!-- 数学归约公式卡片与实时方案仓 -->
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">🎯 代数归约与实时方案仓</span>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>等价正集目标和 t: <b style="color:#10b981;">${step.requiredSum >= 0 ? step.requiredSum : '无解'}</b></span>
              <span>累计方案数: <b style="color:#a855f7;">${step.ways}</b> 种</span>
            </div>
          </div>

          <div style="background:#1e293b; border:1px solid #334155; border-radius:6px; padding:8px 12px; font-size:11.5px; color:#cbd5e1; display:flex; flex-direction:column; gap:3px;">
            <div>式一：<code>sum(P) - sum(N) = target</code> （正集与负集符号差）</div>
            <div>式二：<code>sum(P) + sum(N) = sum</code> （全集总和）</div>
            <div style="color:#34d399; font-weight:700; margin-top:2px;">
              两式相加：2·sum(P) = target + sum &rArr; sum(P) = (${step.target} + ${step.sum}) / 2 = ${step.requiredSum >= 0 ? step.requiredSum : '无解'}
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    renderKnapsackDpMatrix(container, {
      ...step,
      items: [],
      currentGroupItems: [],
      selectedItems: [],
      groupIndex: -1,
      maxVal: step.ways,
    }, `凑出累加和方案数向量 dp[0..${step.dp.length - 1}]`);
  },
});

export const TargetSumVisualizer = Visualizer;

registerAlgorithm({
  id: 'target-sum-standard',
  name: '目标和 (01背包方案计数)',
  viewId: 'algo-target-sum-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code03：LeetCode 494 目标和，正负号划分数学推导转化为恰好凑出容量的方案计数 DP',
  icon: '🎯',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 79,
  learningGoal: '掌握表达式符号分配向正负子集和的严谨代数化简、奇偶性守恒判定与方案数累加转移',
});
