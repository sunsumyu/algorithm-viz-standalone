/**
 * 找出数组的第K大和 (LeetCode 2386) - 声明式 4-Card 沙盘渲染器
 * 核心：正负数分离基准 + 绝对值数组映射 + 归约为前 K 小和堆优化
 * 架构重构：引入四语言代码联动、小根堆分支状态机沙盘与第K大和对决舱
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  FIND_KTH_SUM_PROBLEM_HTML,
  FIND_KTH_SUM_ANALYSIS_HTML,
  FIND_KTH_SUM_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';

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
  codeLine?: HighlightTarget;
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

  const lines = {
    initSum: { java: 6, cpp: 4, python: 3, javascript: 2 },
    sortAbs: { java: 13, cpp: 9, python: 4, javascript: 8 },
    pushEmpty: { java: 15, cpp: 13, python: 6, javascript: 9 },
    loopStart: { java: 16, cpp: 14, python: 7, javascript: 10 },
    popHeap: { java: 17, cpp: 15, python: 8, javascript: 12 },
    branch: { java: 21, cpp: 18, python: 10, javascript: 14 },
    returnAns: { java: 27, cpp: 24, python: 13, javascript: 21 },
  };

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
      message: `✨ 绝对值归约初始化：累加所有正数得到全局第 1 大和 maxSum=${maxSum}。生成绝对值升序数组 absNums=[${absNums.join(', ')}]。空集和为 0 (对应第 1 小损失量)。`,
      log: `init: maxSum=${maxSum}, absNums=[${absNums.join(', ')}]`,
      codeLine: lines.sortAbs,
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
        message: `🏁 目标为第 1 大和，直接返回全局最大正数和 ${maxSum}。`,
        log: `done: ans=${maxSum}`,
        codeLine: lines.returnAns,
      })
    );
    return steps;
  }

  const heap: { idx: number; val: number }[] = [{ idx: -1, val: 0 }];

  for (let i = 1; i < targetK; i++) {
    heap.sort((a, b) => a.val - b.val);
    const cur = heap.shift()!;

    if (cur.idx + 1 < n) {
      const nextAbs = absNums[cur.idx + 1];
      heap.push({ idx: cur.idx + 1, val: cur.val + nextAbs });
      if (cur.idx >= 0) {
        heap.push({ idx: cur.idx + 1, val: cur.val - absNums[cur.idx] + nextAbs });
      }
    }

    heap.sort((a, b) => a.val - b.val);
    const topOfHeap = heap[0];
    const rank = i + 1;
    const ansKth = maxSum - topOfHeap.val;

    steps.push(
      makeStep({
        stepIndex: steps.length,
        nums: [...rawNums],
        absNums: [...absNums],
        maxSum,
        kTarget: targetK,
        heapSnapshot: [...heap],
        currentSmallestRank: rank,
        currentSmallestVal: topOfHeap.val,
        kthSum: ansKth,
        status: 'branch',
        message: `👑 小根堆第 ${rank} 小绝对值损失量为 ${topOfHeap.val} (右下标=${topOfHeap.idx})。\n对应原数组第 ${rank} 大子序列和 = maxSum(${maxSum}) - 损失(${topOfHeap.val}) = ${ansKth}！`,
        log: `step #${rank}: loss=${topOfHeap.val}, ans=${ansKth}`,
        codeLine: lines.branch,
      })
    );
  }

  const finalTop = heap[0] || { idx: -1, val: 0 };
  const finalAns = maxSum - finalTop.val;

  steps.push(
    makeStep({
      stepIndex: steps.length,
      nums: [...rawNums],
      absNums: [...absNums],
      maxSum,
      kTarget: targetK,
      heapSnapshot: [...heap],
      currentSmallestRank: targetK,
      currentSmallestVal: finalTop.val,
      kthSum: finalAns,
      status: 'done',
      message: `🎉 第 K 大和推演成功！原数组的第 ${targetK} 大子序列和为 ${finalAns}！`,
      log: `done: k=${targetK}, ans=${finalAns}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<FindKthStep>({
  id: 'find-kth-sum',
  name: '找出数组的第K大和 (LeetCode 2386)',
  category: 'dynamic-programming',
  badge: {
    mode: '绝对值归约 · 小根堆',
    complexity: 'O(N log N + K log K) · O(K)',
  },
  card1Title: '原数组/绝对值映射与小根堆状态机沙盘',
  card2Title: '绝对值损失量与第K大和对决监视器',
  card2Desc: '展示利用 maxSum 减去绝对值数组的第 K 小累加和，将负数处理彻底消解的数学归约过程',
  legend: [
    { label: '普通堆节点', color: '#334155' },
    { label: '👑 当前堆顶损失量', color: '#10b981' },
    { label: '绝对值映射项', color: '#38bdf8' },
  ],
  inputs: [
    {
      id: 'input-k',
      label: '目标 K',
      type: 'number',
      defaultValue: 5,
      width: '50px',
    },
    {
      id: 'input-nums',
      label: '含负数数组 nums',
      type: 'text',
      defaultValue: '2, 4, -2',
      width: '140px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 样例 (nums=[2,4,-2], K=5, Ans=2)',
      values: {
        'input-k': 5,
        'input-nums': '2, 4, -2',
      },
    },
    {
      label: '较大范围正负用例 (nums=[1,-2,3,4,-10,12], K=16)',
      values: {
        'input-k': 16,
        'input-nums': '1, -2, 3, 4, -10, 12',
      },
    },
  ],
  metrics: [
    { id: 'metric-max-sum', label: '全局最大和 maxSum', color: '#10b981' },
    { id: 'metric-cur-k', label: '当前推演顺位', color: '#38bdf8' },
    { id: 'metric-abs-val', label: '第K小绝对值损失', color: '#f59e0b' },
    { id: 'metric-ans-kth', label: '第 K 大子序列和', color: '#a855f7' },
  ],
  codeLanguages: FIND_KTH_SUM_CODE_LANGUAGES,
  problemHtml: FIND_KTH_SUM_PROBLEM_HTML,
  analysisHtml: FIND_KTH_SUM_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const k = parseInt(inputs['input-k'] || '5', 10);
    const nums = String(inputs['input-nums'] || '2, 4, -2')
      .split(',')
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !isNaN(n));
    return buildFindKthSumSteps(nums, k);
  },
  renderCanvas: (container, step) => {
    const absBadges = step.absNums
      .map((x, i) => `
        <div style="background:rgba(15, 23, 42, 0.6); border:1.5px solid #38bdf8; border-radius:6px; padding:5px 8px; min-width:40px; text-align:center;">
          <div style="font-size:8.5px; color:#94a3b8;">|#${i}|</div>
          <div style="font-size:12px; font-weight:800; color:#38bdf8;">${x}</div>
        </div>
      `)
      .join('');

    const heapList = step.heapSnapshot
      .map((node, idx) => {
        const isTop = idx === 0;
        return `
          <div style="background:${isTop ? 'rgba(6, 95, 70, 0.5)' : 'rgba(15, 23, 42, 0.6)'}; border:1.5px solid ${
          isTop ? '#10b981' : '#334155'
        }; border-radius:6px; padding:5px 8px; min-width:65px; text-align:center;">
            <div style="font-size:8.5px; color:${isTop ? '#4ade80' : '#94a3b8'};">${isTop ? '👑 堆顶' : `#${idx + 1}`} (idx=${node.idx})</div>
            <div style="font-size:12px; font-weight:800; color:#f8fafc;">损失: ${node.val}</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:8px;">
          <div style="font-size:12px; color:#94a3b8; font-weight:700;">绝对值数组 absNums (由原数组转化并升序排列)</div>
          <div style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
            全局最大和 maxSum: <b style="color:#10b981;">${step.maxSum}</b>
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
          ${absBadges}
        </div>

        <!-- 小根堆优先队列舱 -->
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">🌲 绝对值小根堆状态机 (寻找第 K 小损失)</span>
            <span style="font-size:10.5px; color:#38bdf8;">堆顶即当前最小损失</span>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            ${heapList}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    container.innerHTML = `
      <div style="width:100%; padding:8px 12px; box-sizing:border-box; display:flex; flex-direction:column; gap:8px;">
        <div style="font-size:11.5px; color:#cbd5e1; font-weight:700;">👑 第 K 大和最终对决推导</div>
        <div style="background:#0b1329; border:1px solid #334155; border-radius:6px; padding:10px 14px; display:flex; flex-direction:column; gap:6px;">
          <div style="font-size:12px; color:#94a3b8;">
            目标：第 <b style="color:#38bdf8;">${step.currentSmallestRank}</b> 大子序列和
          </div>
          <div style="font-size:14px; font-weight:800; color:#f8fafc; font-family:monospace;">
            ans = maxSum (${step.maxSum}) - 绝对值损失 (${step.currentSmallestVal}) = <span style="color:#a855f7;">${step.kthSum}</span>
          </div>
        </div>
      </div>
    `;
  },
});

export const FindKthSumVisualizer = Visualizer;

registerAlgorithm({
  id: 'find-kth-sum',
  name: '找出数组的第K大和 (LeetCode 2386)',
  viewId: 'algo-find-kth-sum-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code07：LeetCode 2386 找出数组的第K大和，正负数分离基准 + 绝对值数组映射 + 归约为前 K 小和堆优化',
  icon: '🔍',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 83,
  learningGoal: '深刻理解全局最大和作为基准的代数推导、损失量绝对值映射与小根堆极速求解',
});
