/**
 * 非负数组前k个最小的子序列累加和 (Top K Subsequence Sum) - 声明式 4-Card 沙盘渲染器
 * 核心：大容量数据超越 01 背包限制，使用小根堆/优先队列 O(N log N + K log K) 状态机高效扩展
 * 架构重构：引入四语言代码联动、小根堆分支状态机沙盘与已收集榜单舱
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  TOP_K_SUBSEQUENCE_SUM_PROBLEM_HTML,
  TOP_K_SUBSEQUENCE_SUM_ANALYSIS_HTML,
  TOP_K_SUBSEQUENCE_SUM_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';

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
  codeLine?: HighlightTarget;
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

  const lines = {
    sort: { java: 7, cpp: 7, python: 5, javascript: 2 },
    pushFirst: { java: 10, cpp: 9, python: 7, javascript: 5 },
    loopStart: { java: 12, cpp: 11, python: 9, javascript: 6 },
    popHeap: { java: 13, cpp: 12, python: 10, javascript: 8 },
    branch: { java: 18, cpp: 17, python: 13, javascript: 12 },
    returnAns: { java: 22, cpp: 22, python: 15, javascript: 16 },
  };

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
      codeLine: lines.sort,
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
        codeLine: lines.returnAns,
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
      message: `📥 初始种子入堆：将第一个单元素子序列 (和=${sorted[0]}, 最右下标=0) 放入小根堆。`,
      log: `heap seed: sum=${sorted[0]}, right=0`,
      codeLine: lines.pushFirst,
    })
  );

  for (let i = 1; i < targetK; i++) {
    if (heap.length === 0) break;

    heap.sort((a, b) => a.sum - b.sum);
    const cur = heap.shift()!;
    ans.push(cur.sum);

    steps.push(
      makeStep({
        stepIndex: steps.length,
        kTarget: targetK,
        sortedNums: [...sorted],
        heapSnapshot: [...heap],
        ans: [...ans],
        poppedItem: cur,
        status: 'pop',
        message: `👑 堆顶弹出：当前全局最小和为 ${cur.sum} (右边界下标=${cur.right})，收录为第 ${ans.length} 小子序列和！`,
        log: `pop: sum=${cur.sum}, right=${cur.right}`,
        codeLine: lines.popHeap,
      })
    );

    if (cur.right + 1 < n) {
      const nextNum = sorted[cur.right + 1];
      const b1 = { right: cur.right + 1, sum: cur.sum - sorted[cur.right] + nextNum };
      const b2 = { right: cur.right + 1, sum: cur.sum + nextNum };

      heap.push(b1);
      heap.push(b2);

      steps.push(
        makeStep({
          stepIndex: steps.length,
          kTarget: targetK,
          sortedNums: [...sorted],
          heapSnapshot: [...heap],
          ans: [...ans],
          poppedItem: cur,
          branch1: b1,
          branch2: b2,
          status: 'branch',
          message: `🌱 状态机两路扩展：\n1️⃣ 替换最右项：(${cur.sum} - ${sorted[cur.right]} + ${nextNum} = ${b1.sum}, 下标 ${b1.right})\n2️⃣ 追加新项：(${cur.sum} + ${nextNum} = ${b2.sum}, 下标 ${b2.right})，均推入堆！`,
          log: `branch: b1=${b1.sum}, b2=${b2.sum}`,
          codeLine: lines.branch,
        })
      );
    }
  }

  steps.push(
    makeStep({
      stepIndex: steps.length,
      kTarget: targetK,
      sortedNums: [...sorted],
      heapSnapshot: [...heap],
      ans: [...ans],
      status: 'done',
      message: `🎉 收集完毕！前 ${targetK} 个最小子序列和已严格升序生成：[${ans.join(', ')}]！`,
      log: `done: ans=[${ans.join(', ')}]`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TopKStep>({
  id: 'top-k-subsequence-sum',
  name: '非负数组前k个最小子序列和',
  category: 'dynamic-programming',
  badge: {
    mode: '小根堆状态机 · O(NlogN+KlogK)',
    complexity: 'O(N log N + K log K) · O(K)',
  },
  card1Title: '排序数组与小根堆两路后继扩展沙盘',
  card2Title: '已生成的 Top-K 最小和单调队列监视器',
  card2Desc: '展示小根堆弹出最小和、分两路（替换当前/追加下一个）无遗漏不重复扩展状态',
  legend: [
    { label: '小根堆普通节点', color: '#334155' },
    { label: '👑 当前堆顶最小', color: '#10b981' },
    { label: '🌱 新推入分支', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-k',
      label: '目标 K',
      type: 'number',
      defaultValue: 6,
      width: '50px',
    },
    {
      id: 'input-nums',
      label: '非负数组 nums',
      type: 'text',
      defaultValue: '1, 3, 6, 8',
      width: '140px',
    },
  ],
  presets: [
    {
      label: '经典案例 (nums=[1,3,6,8], K=6)',
      values: {
        'input-k': 6,
        'input-nums': '1, 3, 6, 8',
      },
    },
    {
      label: '密集较小数值用例 (nums=[2,4,7], K=8)',
      values: {
        'input-k': 8,
        'input-nums': '2, 4, 7',
      },
    },
  ],
  metrics: [
    { id: 'metric-collected-count', label: '已收集数量', color: '#38bdf8' },
    { id: 'metric-heap-size', label: '堆内有效节点数', color: '#8b5cf6' },
    { id: 'metric-popped-item', label: '本步堆顶弹出', color: '#10b981' },
    { id: 'metric-latest-sum', label: '最新入榜累加和', color: '#f59e0b' },
  ],
  codeLanguages: TOP_K_SUBSEQUENCE_SUM_CODE_LANGUAGES,
  problemHtml: TOP_K_SUBSEQUENCE_SUM_PROBLEM_HTML,
  analysisHtml: TOP_K_SUBSEQUENCE_SUM_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const k = parseInt(inputs['input-k'] || '6', 10);
    const nums = (inputs['input-nums'] || '1, 3, 6, 8')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return buildTopKSubsequenceSumSteps(nums, k);
  },
  renderCanvas: (container, step) => {
    const numsHtml = step.sortedNums
      .map((n, i) => {
        const isPoppedRight = step.poppedItem && step.poppedItem.right === i;
        const bg = isPoppedRight ? '#065f46' : '#1e293b';
        const border = isPoppedRight ? '#10b981' : '#334155';
        return `
          <div style="background:${bg}; border:1.5px solid ${border}; border-radius:6px; padding:6px 10px; min-width:45px; text-align:center;">
            <div style="font-size:9px; color:#94a3b8;">#${i}</div>
            <div style="font-size:13px; font-weight:800; color:#f8fafc;">${n}</div>
          </div>
        `;
      })
      .join('');

    const heapListHtml = step.heapSnapshot.length > 0
      ? step.heapSnapshot
          .map((item, idx) => {
            const isTop = idx === 0;
            return `
              <div style="background:${isTop ? 'rgba(6, 95, 70, 0.5)' : 'rgba(15, 23, 42, 0.6)'}; border:1.5px solid ${
              isTop ? '#10b981' : '#334155'
            }; border-radius:6px; padding:6px 10px; min-width:70px; text-align:center;">
                <div style="font-size:9.5px; color:${isTop ? '#4ade80' : '#94a3b8'};">${isTop ? '👑 堆顶' : `#${idx + 1}`} (右=${item.right})</div>
                <div style="font-size:13px; font-weight:800; color:#f8fafc; margin-top:2px;">和: ${item.sum}</div>
              </div>
            `;
          })
          .join('')
      : `<span style="color:#64748b; font-size:11px;">(小根堆当前为空)</span>`;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:8px;">
          <div style="font-size:12px; color:#94a3b8; font-weight:700;">升序原数组 (作为状态机构建基石)</div>
          <div style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
            已收集: <b style="color:#10b981;">${step.ans.length}</b> / ${step.kTarget} 个
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
          ${numsHtml}
        </div>

        <!-- 小根堆优先队列舱 -->
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">🌲 小根堆状态机优先队列 (队首即全局当前最小和)</span>
            <span style="font-size:10.5px; color:#38bdf8;">两路分叉：替换最右项 / 追加下一项</span>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            ${heapListHtml}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const chips = step.ans.map((sum, i) => `
      <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:40px; padding:4px 6px; margin:2px; background:#064e3b; border:1px solid #10b981; border-radius:4px;">
        <span style="font-size:9px; color:#a7f3d0;">第 ${i + 1} 小</span>
        <span style="font-size:13px; font-weight:800; color:#ffffff;">${sum}</span>
      </div>
    `);

    container.innerHTML = `
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">已收录的 Top-K 最小子序列和榜单</div>
        <div style="display:flex; flex-wrap:wrap; max-height:100px; overflow-y:auto; gap:3px; background:#0b1329; padding:6px; border-radius:6px;">
          ${chips.join('')}
        </div>
      </div>
    `;
  },
});

export const TopKSubsequenceSumVisualizer = Visualizer;

registerAlgorithm({
  id: 'top-k-subsequence-sum',
  name: '非负数组前k个最小子序列和',
  viewId: 'algo-top-k-subsequence-sum-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code06：非负数组前k个最小子序列和，小根堆状态机 O(NlogN + KlogK) 两路扩展最优解',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 82,
  learningGoal: '掌握超越 01 背包容量限制的小根堆两路状态机生成模型',
});
