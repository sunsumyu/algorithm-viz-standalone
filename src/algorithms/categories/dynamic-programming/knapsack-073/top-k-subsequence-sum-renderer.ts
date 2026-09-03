/**
 * 非负数组前k个最小的子序列累加和 (Top K Subsequence Sum) - 声明式 4-Card 沙盘渲染器
 * 核心：大容量数据超越 01 背包限制，使用小根堆/优先队列 O(N log N + K log K) 状态机高效扩展
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  TOP_K_SUBSEQUENCE_SUM_PROBLEM_HTML,
  TOP_K_SUBSEQUENCE_SUM_ANALYSIS_HTML,
  TOP_K_SUBSEQUENCE_SUM_CODE_LANGUAGES,
} from './knapsack-073-problem-content';

export interface TopKStep {
  stepIndex: number;
  kTarget: number;
  sortedNums: number[];
  heapSnapshot: { right: number; sum: number }[];
  ans: number[];
  poppedItem?: { right: number; sum: number };
  branch1?: { right: number; sum: number };
  branch2?: { right: number; sum: number };
  status: 'init' | 'pop' | 'branch' | 'done';
  message: string;
  log: string;
  codeLine: number;
  metrics?: Record<string, any>;
}

export function buildTopKSubsequenceSumSteps(
  nums: number[],
  k: number
): TopKStep[] {
  const steps: TopKStep[] = [];
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const targetK = Math.min(k, 1 << Math.min(n, 20)); // 安全上限

  const ans: number[] = [0]; // 空集累加和为 0 (第 1 小)
  const heap: { right: number; sum: number }[] = [];

  function makeStep(data: Omit<TopKStep, 'metrics'>): TopKStep {
    const popStr = data.poppedItem ? `(${data.poppedItem.sum}, 下标${data.poppedItem.right})` : '—';
    return {
      ...data,
      metrics: {
        'metric-collected-count': `${data.ans.length} / ${targetK}`,
        'metric-heap-size': `${data.heapSnapshot.length}`,
        'metric-popped-item': popStr,
        'metric-latest-sum': `${data.ans[data.ans.length - 1]}`,
      },
    };
  }

  // 1. 初始化
  steps.push(
    makeStep({
      stepIndex: 0,
      kTarget: targetK,
      sortedNums: [...sorted],
      heapSnapshot: [],
      ans: [...ans],
      status: 'init',
      message: `🚀 初始化算法：数组升序排序为 [${sorted.join(', ')}]。空集和 0 默认作为第 1 小子序列和！`,
      log: `init: sorted=[${sorted.join(', ')}], ans=[0]`,
      codeLine: 8,
    })
  );

  if (n === 0 || targetK <= 1) {
    steps.push(
      makeStep({
        stepIndex: 1,
        kTarget: targetK,
        sortedNums: [...sorted],
        heapSnapshot: [],
        ans: [...ans],
        status: 'done',
        message: `🏁 收集完成！前 ${targetK} 个最小和已就绪。`,
        log: `done: ans=[${ans.join(', ')}]`,
        codeLine: 20,
      })
    );
    return steps;
  }

  // 首个状态入堆
  heap.push({ right: 0, sum: sorted[0] });

  steps.push(
    makeStep({
      stepIndex: 1,
      kTarget: targetK,
      sortedNums: [...sorted],
      heapSnapshot: [...heap],
      ans: [...ans],
      status: 'init',
      message: `🌱 将最小单元素子序列 [${sorted[0]}] (和:${sorted[0]}, 右下标:0) 压入小根堆，开始分支扩展。`,
      log: `push initial node: sum=${sorted[0]}, right=0`,
      codeLine: 11,
    })
  );

  for (let i = 1; i < targetK; i++) {
    if (heap.length === 0) break;

    // 弹出最小
    heap.sort((a, b) => a.sum - b.sum);
    const cur = heap.shift()!;
    ans.push(cur.sum);

    steps.push(
      makeStep({
        stepIndex: i + 1,
        kTarget: targetK,
        sortedNums: [...sorted],
        heapSnapshot: [...heap],
        ans: [...ans],
        poppedItem: cur,
        status: 'pop',
        message: `📥 [第 ${i + 1} 小和] 从小根堆弹出堆顶：累加和为 ${cur.sum} (右边界下标 ${cur.right})，收录至答案！`,
        log: `pop: k=${i + 1}, sum=${cur.sum}, right=${cur.right}`,
        codeLine: 14,
      })
    );

    // 分裂扩展
    if (cur.right + 1 < n) {
      const nextIdx = cur.right + 1;
      const nextVal = sorted[nextIdx];

      // 分支1: 替换最右侧元素
      const b1 = { right: nextIdx, sum: cur.sum - sorted[cur.right] + nextVal };
      heap.push(b1);

      // 分支2: 追加新元素
      const b2 = { right: nextIdx, sum: cur.sum + nextVal };
      heap.push(b2);

      steps.push(
        makeStep({
          stepIndex: i + 1,
          kTarget: targetK,
          sortedNums: [...sorted],
          heapSnapshot: [...heap],
          ans: [...ans],
          poppedItem: cur,
          branch1: b1,
          branch2: b2,
          status: 'branch',
          message: `🌿 状态零冗余分裂：产生分支1(替换末位为 ${nextVal} &rarr; 和 ${b1.sum}) 与 分支2(追加 ${nextVal} &rarr; 和 ${b2.sum}) 入堆。`,
          log: `branch: b1=(idx=${b1.right}, sum=${b1.sum}), b2=(idx=${b2.right}, sum=${b2.sum})`,
          codeLine: 17,
        })
      );
    }
  }

  // 完成
  steps.push(
    makeStep({
      stepIndex: targetK + 1,
      kTarget: targetK,
      sortedNums: [...sorted],
      heapSnapshot: [...heap],
      ans: [...ans],
      status: 'done',
      message: `🎉 前 ${targetK} 个最小子序列累加和全部生成：[${ans.join(', ')}]！`,
      log: `done: ans=[${ans.join(', ')}]`,
      codeLine: 20,
    })
  );

  return steps;
}

export const TopKSubsequenceSumVisualizer = createDeclarativeVisualizer<TopKStep>({
  id: 'top-k-subsequence-sum',
  name: '非负数组前K个最小子序列和',
  category: 'dynamic-programming',
  badge: {
    mode: '堆状态机 · 超越01背包',
    complexity: 'O(N log N + K log K) · O(K)',
  },
  card1Title: '🌳 优先队列小根堆状态机与分裂沙盘',
  card2Title: '📋 前 K 个最小子序列和有序收集列表',
  card2Desc: '展示小根堆在海量数据下，无需 01 背包巨大数组而实现毫秒级有序扩展的过程',
  legend: [
    { label: '小根堆堆顶 (最新出堆)', color: '#10b981' },
    { label: '分支1: 替换最右数', color: '#38bdf8' },
    { label: '分支2: 追加新数', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-k',
      label: '目标 K',
      type: 'number',
      defaultValue: 6,
      width: '60px',
    },
    {
      id: 'input-nums',
      label: '非负数组 nums (逗号分隔)',
      type: 'text',
      defaultValue: '3, 1, 4, 2',
      width: '150px',
    },
  ],
  presets: [
    {
      label: '精简基础案例 (nums=[3,1,4], K=5)',
      values: {
        'input-k': 5,
        'input-nums': '3, 1, 4',
      },
    },
    {
      label: '4元素多样案例 (nums=[3,1,4,2], K=8)',
      values: {
        'input-k': 8,
        'input-nums': '3, 1, 4, 2',
      },
    },
  ],
  metrics: [
    { id: 'metric-collected-count', label: '当前已收集数', color: '#38bdf8' },
    { id: 'metric-heap-size', label: '堆中候选项数', color: '#f59e0b' },
    { id: 'metric-popped-item', label: '最新出堆状态', color: '#10b981' },
    { id: 'metric-latest-sum', label: '最新最小和', color: '#a855f7' },
  ],
  codeLanguages: TOP_K_SUBSEQUENCE_SUM_CODE_LANGUAGES,
  problemHtml: TOP_K_SUBSEQUENCE_SUM_PROBLEM_HTML,
  analysisHtml: TOP_K_SUBSEQUENCE_SUM_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const k = parseInt(inputs['input-k'] || '6', 10);
    const nums = (inputs['input-nums'] || '3, 1, 4, 2')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return buildTopKSubsequenceSumSteps(nums, k);
  },
  renderCanvas: (container, step) => {
    const sortedBadges = step.sortedNums
      .map((x, i) => {
        const isRight = step.poppedItem && step.poppedItem.right === i;
        const bg = isRight ? '#78350f' : '#1e293b';
        const border = isRight ? '#f59e0b' : '#334155';
        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:6px; padding:4px 8px; text-align:center;">
            <span style="font-size:9px; color:#94a3b8;">[${i}]</span>
            <div style="font-size:13px; font-weight:800; color:#f8fafc;">${x}</div>
          </div>
        `;
      })
      .join('');

    const heapItems = step.heapSnapshot
      .map((h) => {
        return `
          <div style="background:#1e293b; border:1px solid #38bdf8; border-radius:6px; padding:4px 8px; font-size:11px; text-align:center;">
            <span style="color:#94a3b8;">下标 ${h.right} &rarr; </span>
            <span style="color:#38bdf8; font-weight:800;">和: ${h.sum}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:center; align-items:center; background:#0f172a; padding:12px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">排序后基准数组 (Sorted Array)</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
          ${sortedBadges}
        </div>
        <div style="font-size:12px; color:#94a3b8; font-weight:700; margin-top:6px;">优先队列小根堆池 (Priority Queue Candidates)</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-height:85px; overflow-y:auto;">
          ${heapItems || '<span style="color:#64748b; font-size:11px;">堆为空</span>'}
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const listItems = step.ans
      .map((val, idx) => {
        return `
          <div style="display:inline-flex; align-items:center; gap:4px; padding:4px 8px; background:#1e293b; border:1px solid #10b981; border-radius:4px; margin:2px;">
            <span style="font-size:10px; color:#94a3b8;">#${idx + 1}:</span>
            <span style="font-size:13px; font-weight:800; color:#10b981;">${val}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">已收集的 Top K 最小子序列累加和序列</div>
        <div style="display:flex; flex-wrap:wrap; gap:4px; background:#0b1329; padding:6px; border-radius:6px; max-height:100px; overflow-y:auto;">
          ${listItems}
        </div>
      </div>
    `;
  },
});

registerAlgorithm(
  {
    id: 'top-k-subsequence-sum',
    name: '非负数组前K个最小子序列和',
    category: 'dynamic-programming',
    difficulty: 'hard',
    description: '数据量超越 01 背包承受极限时，使用小根堆/优先队列状态机分裂实现 O(N log N + K log K) 最优解',
    tags: ['堆', '优先队列', '状态机', '超越01背包', '左程云073'],
  },
  TopKSubsequenceSumVisualizer
);
