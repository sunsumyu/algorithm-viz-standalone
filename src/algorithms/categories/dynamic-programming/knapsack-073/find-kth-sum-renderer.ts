/**
 * 找出数组的第K大和 (LeetCode 2386) - 声明式 4-Card 沙盘渲染器
 * 核心：正负数分离基准 + 绝对值数组映射 + 归约为前 K 小和堆优化
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  FIND_KTH_SUM_PROBLEM_HTML,
  FIND_KTH_SUM_ANALYSIS_HTML,
  FIND_KTH_SUM_CODE_LANGUAGES,
} from './knapsack-073-problem-content';

export interface FindKthStep {
  stepIndex: number;
  nums: number[];
  absNums: number[];
  maxSum: number;
  kTarget: number;
  heapSnapshot: { idx: number; val: number }[];
  currentSmallestRank: number;
  currentSmallestVal: number;
  kthSum: number;
  status: 'init' | 'pop' | 'branch' | 'done';
  message: string;
  log: string;
  codeLine: number;
  metrics?: Record<string, any>;
}

export function buildFindKthSumSteps(
  rawNums: number[],
  k: number
): FindKthStep[] {
  const steps: FindKthStep[] = [];
  const n = rawNums.length;

  let maxSum = 0;
  const absNums: number[] = [];
  for (const x of rawNums) {
    if (x > 0) maxSum += x;
    absNums.push(Math.abs(x));
  }
  absNums.sort((a, b) => a - b);

  const targetK = Math.min(k, 1 << Math.min(n, 20));

  function makeStep(data: Omit<FindKthStep, 'metrics'>): FindKthStep {
    return {
      ...data,
      metrics: {
        'metric-max-sum': `${maxSum}`,
        'metric-cur-k': `${data.currentSmallestRank} / ${targetK}`,
        'metric-abs-val': `${data.currentSmallestVal}`,
        'metric-ans-kth': `${data.kthSum}`,
      },
    };
  }

  // 1. 初始化
  steps.push(
    makeStep({
      stepIndex: 0,
      nums: [...rawNums],
      absNums: [...absNums],
      maxSum,
      kTarget: targetK,
      heapSnapshot: [{ idx: -1, val: 0 }],
      currentSmallestRank: 1,
      currentSmallestVal: 0,
      kthSum: maxSum,
      status: 'init',
      message: `✨ 绝对值归约初始化：累加所有正数得到全局第 1 大和 maxSum=${maxSum}。生成绝对值排序数组 absNums=[${absNums.join(', ')}]。第 1 小绝对值子序列为空集 (和为 0)。`,
      log: `init: maxSum=${maxSum}, absNums=[${absNums.join(', ')}]`,
      codeLine: 8,
    })
  );

  if (targetK <= 1 || n === 0) {
    steps.push(
      makeStep({
        stepIndex: 1,
        nums: [...rawNums],
        absNums: [...absNums],
        maxSum,
        kTarget: targetK,
        heapSnapshot: [{ idx: -1, val: 0 }],
        currentSmallestRank: 1,
        currentSmallestVal: 0,
        kthSum: maxSum,
        status: 'done',
        message: `🎉 第 1 大子序列和即为所有正数全选的和：${maxSum}。`,
        log: `done: kthSum=${maxSum}`,
        codeLine: 24,
      })
    );
    return steps;
  }

  // 小根堆模拟
  const heap: { idx: number; val: number }[] = [{ idx: -1, val: 0 }];
  let lastPoppedVal = 0;

  for (let i = 1; i < targetK; i++) {
    heap.sort((a, b) => a.val - b.val);
    const cur = heap.shift()!;
    lastPoppedVal = cur.val;

    if (cur.idx + 1 < n) {
      // 分支1: 追加下一个绝对值
      heap.push({ idx: cur.idx + 1, val: cur.val + absNums[cur.idx + 1] });
      // 分支2: 替换
      if (cur.idx >= 0) {
        heap.push({
          idx: cur.idx + 1,
          val: cur.val - absNums[cur.idx] + absNums[cur.idx + 1],
        });
      }
    }

    steps.push(
      makeStep({
        stepIndex: i,
        nums: [...rawNums],
        absNums: [...absNums],
        maxSum,
        kTarget: targetK,
        heapSnapshot: [...heap],
        currentSmallestRank: i + 1,
        currentSmallestVal: heap[0]?.val ?? cur.val,
        kthSum: maxSum - (heap[0]?.val ?? cur.val),
        status: 'pop',
        message: `🔍 弹出 absNums 第 ${i} 小子序列和 ${cur.val}，并将后继分支压入小根堆。`,
        log: `step ${i}: pop val=${cur.val}, heapSize=${heap.length}`,
        codeLine: 16,
      })
    );
  }

  heap.sort((a, b) => a.val - b.val);
  const kthSmallestAbsSum = heap[0]?.val ?? lastPoppedVal;
  const finalAns = maxSum - kthSmallestAbsSum;

  steps.push(
    makeStep({
      stepIndex: targetK,
      nums: [...rawNums],
      absNums: [...absNums],
      maxSum,
      kTarget: targetK,
      heapSnapshot: [...heap],
      currentSmallestRank: targetK,
      currentSmallestVal: kthSmallestAbsSum,
      kthSum: finalAns,
      status: 'done',
      message: `🎉 运算达成！absNums 的第 ${targetK} 小子序列和为 ${kthSmallestAbsSum}。因此原数组第 ${targetK} 大和 = maxSum (${maxSum}) - ${kthSmallestAbsSum} = ${finalAns}！`,
      log: `done: kthSum=${finalAns}`,
      codeLine: 24,
    })
  );

  return steps;
}

export const FindKthSumVisualizer = createDeclarativeVisualizer<FindKthStep>({
  id: 'find-kth-sum',
  name: '找出数组的第K大和',
  category: 'dynamic-programming',
  badge: {
    mode: '绝对值映射 · 对偶归约',
    complexity: 'O(N log N + K log K) · O(K)',
  },
  card1Title: '🪞 原数组正负分离与绝对值映射沙盘',
  card2Title: '📉 差值对偶转换与第 K 大值推导监视器',
  card2Desc: '展示原数组第 K 大和双射归约至 absNums 第 K 小和的逆向相消过程',
  legend: [
    { label: '正数 (贡献 maxSum)', color: '#10b981' },
    { label: '负数/零 (纳入绝对值吸收池)', color: '#f87171' },
    { label: '小根堆最优候选', color: '#38bdf8' },
  ],
  inputs: [
    {
      id: 'input-k',
      label: '目标排名 K',
      type: 'number',
      defaultValue: 5,
      width: '60px',
    },
    {
      id: 'input-nums',
      label: '原始数组 nums (可含正负数)',
      type: 'text',
      defaultValue: '2, 4, -2',
      width: '160px',
    },
  ],
  presets: [
    {
      label: '经典三元素含负数 (nums=[2, 4, -2], K=5, Ans=2)',
      values: {
        'input-k': 5,
        'input-nums': '2, 4, -2',
      },
    },
    {
      label: '对称正负测试 (nums=[1, -2, 3, -4], K=6, Ans=0)',
      values: {
        'input-k': 6,
        'input-nums': '1, -2, 3, -4',
      },
    },
  ],
  metrics: [
    { id: 'metric-max-sum', label: '所有正数全选基准', color: '#10b981' },
    { id: 'metric-cur-k', label: '当前分析名次', color: '#f59e0b' },
    { id: 'metric-abs-val', label: '绝对值第K小减扣项', color: '#f87171' },
    { id: 'metric-ans-kth', label: '原数组第K大和', color: '#a855f7' },
  ],
  codeLanguages: FIND_KTH_SUM_CODE_LANGUAGES,
  problemHtml: FIND_KTH_SUM_PROBLEM_HTML,
  analysisHtml: FIND_KTH_SUM_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const k = parseInt(inputs['input-k'] || '5', 10);
    const nums = (inputs['input-nums'] || '2, 4, -2')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return buildFindKthSumSteps(nums, k);
  },
  renderCanvas: (container, step) => {
    const origBadges = step.nums
      .map((x) => {
        const isPos = x > 0;
        const color = isPos ? '#10b981' : '#f87171';
        return `
          <div style="background:#1e293b; border:1px solid ${color}; border-radius:6px; padding:4px 8px; text-align:center;">
            <div style="font-size:12px; font-weight:800; color:${color};">${x}</div>
          </div>
        `;
      })
      .join('');

    const absBadges = step.absNums
      .map((x, idx) => {
        return `
          <div style="background:#1e293b; border:1px solid #38bdf8; border-radius:6px; padding:4px 8px; text-align:center;">
            <span style="font-size:8px; color:#94a3b8;">[${idx}]</span>
            <div style="font-size:12px; font-weight:800; color:#38bdf8;">${x}</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; width:100%; height:100%; justify-content:center; align-items:center; background:#0f172a; padding:12px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">原始数组 (原正负数分布)</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
          ${origBadges}
        </div>
        <div style="font-size:11px; color:#94a3b8; font-weight:700; margin-top:4px;">绝对值排序后数组 absNums</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
          ${absBadges}
        </div>
        <div style="margin-top:8px; padding:6px 14px; background:#1e293b; border-radius:6px; border:1px solid #334155; font-size:12px; color:#e2e8f0; font-family:monospace;">
          第 ${step.currentSmallestRank} 大和 = maxSum(${step.maxSum}) - 扣减项(${step.currentSmallestVal}) = <span style="color:#a855f7; font-weight:800;">${step.kthSum}</span>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    container.innerHTML = `
      <div style="display:flex; gap:8px; width:100%; padding:6px; box-sizing:border-box; background:#0b1329; border-radius:6px;">
        <div style="flex:1; padding:6px 10px; background:#1e293b; border-radius:6px; border:1px solid #334155;">
          <div style="font-size:10px; color:#94a3b8;">基准正数全选和 maxSum</div>
          <div style="font-size:16px; font-weight:800; color:#10b981;">${step.maxSum}</div>
        </div>
        <div style="flex:1; padding:6px 10px; background:#1e293b; border-radius:6px; border:1px solid #334155;">
          <div style="font-size:10px; color:#94a3b8;">当前堆顶扣减绝对值和</div>
          <div style="font-size:16px; font-weight:800; color:#f87171;">-${step.currentSmallestVal}</div>
        </div>
        <div style="flex:1; padding:6px 10px; background:#1e293b; border-radius:6px; border:1px solid #a855f7;">
          <div style="font-size:10px; color:#a855f7;">当前得出第 K 大和</div>
          <div style="font-size:16px; font-weight:800; color:#a855f7;">${step.kthSum}</div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm(
  {
    id: 'find-kth-sum',
    name: '找出数组的第K大和',
    category: 'dynamic-programming',
    difficulty: 'hard',
    description: 'LeetCode 2386：将全正数和作为基准，取绝对值数组求前 K 小和进行逆向双射映射',
    tags: ['堆', '优先队列', '数学转化', '超越01背包', '左程云073'],
  },
  FindKthSumVisualizer
);
