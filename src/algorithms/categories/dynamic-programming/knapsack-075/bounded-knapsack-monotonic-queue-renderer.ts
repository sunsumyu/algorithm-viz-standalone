import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';

export interface BoundedKnapsackMonoQueueStep {
  itemIndex: number;
  mod: number;
  j: number;
  queue: number[];
  queueMetrics: number[];
  dp: number[];
  maxVal: number;
  totalCapacity: number;
  vList: number[];
  wList: number[];
  cList: number[];
  status: 'init' | 'mod-chain' | 'queue-push' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number;
}

export function buildBoundedKnapsackMonoQueueSteps(inputs: Record<string, any>): BoundedKnapsackMonoQueueStep[] {
  const t = Math.max(0, parseInt(inputs['input-t'], 10) || 0);
  const parseList = (str: string) =>
    (str || '')
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

  const vList = parseList(inputs['input-v']);
  const wList = parseList(inputs['input-w']);
  const cList = parseList(inputs['input-c']);

  const n = Math.min(vList.length, wList.length, cList.length);
  const steps: BoundedKnapsackMonoQueueStep[] = [];

  const dp = new Array(t + 1).fill(0);

  const makeStep = (p: Partial<BoundedKnapsackMonoQueueStep>): BoundedKnapsackMonoQueueStep => ({
    itemIndex: p.itemIndex ?? -1,
    mod: p.mod ?? -1,
    j: p.j ?? 0,
    queue: [...(p.queue ?? [])],
    queueMetrics: [...(p.queueMetrics ?? [])],
    dp: [...(p.dp ?? dp)],
    maxVal: p.maxVal ?? dp[t],
    totalCapacity: t,
    vList: [...vList],
    wList: [...wList],
    cList: [...cList],
    status: p.status ?? 'update',
    message: p.message ?? '',
    log: p.log ?? '',
    codeLine: p.codeLine ?? 4,
  });

  steps.push(
    makeStep({
      status: 'init',
      message: `⚡ 初始化单调队列多重背包沙盘：背包容量 t=${t}，共有 ${n} 种宝物。复杂度严格压缩至极限 O(N·W)！`,
      log: `init: t=${t}, n=${n}`,
      codeLine: 4,
    })
  );

  if (n === 0 || t === 0) {
    steps.push(
      makeStep({
        status: 'done',
        message: '🏁 容量为 0 或无可用宝物，最大价值为 0。',
        log: 'done: ans=0',
        codeLine: 35,
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const weight = wList[i];
    const val = vList[i];
    const cnt = cList[i];

    steps.push(
      makeStep({
        itemIndex: i,
        status: 'init',
        message: `📦 开始处理宝物 #${i + 1} (v=${val}, w=${weight}, c=${cnt})：按余数 mod ∈ [0, ${Math.min(t, weight - 1)}] 进行 ${Math.min(t + 1, weight)} 条独立同余链划分。`,
        log: `item #${i + 1}: w=${weight}, v=${val}, c=${cnt}`,
        codeLine: 7,
      })
    );

    const getVal = (pos: number) => dp[pos] - Math.floor(pos / weight) * val;

    for (let mod = 0; mod < Math.min(t + 1, weight); mod++) {
      let l = 0, r = 0;
      const queue: number[] = new Array(t + 1);

      steps.push(
        makeStep({
          itemIndex: i,
          mod,
          status: 'mod-chain',
          message: `🔗 进入同余链 mod=${mod}：包含容量集合 {${Array.from(
            { length: Math.floor((t - mod) / weight) + 1 },
            (_, idx) => mod + idx * weight
          ).join(', ')}}。`,
          log: `mod chain: ${mod}`,
          codeLine: 8,
        })
      );

      // 预先将前 c 个指标推入队列
      for (let j = t - mod, cCount = 1; j >= 0 && cCount <= cnt; j -= weight, cCount++) {
        while (l < r && getVal(queue[r - 1]) <= getVal(j)) {
          r--;
        }
        queue[r++] = j;
      }

      // 滑窗推导
      for (let j = t - mod, enter = j - weight * cnt; j >= 0; j -= weight, enter -= weight) {
        if (enter >= 0) {
          while (l < r && getVal(queue[r - 1]) <= getVal(enter)) {
            r--;
          }
          queue[r++] = enter;
        }

        const activeQ = queue.slice(l, r);
        const activeQMetrics = activeQ.map(getVal);

        const bestQ = queue[l];
        const newDpVal = getVal(bestQ) + Math.floor(j / weight) * val;

        if (newDpVal > dp[j]) {
          dp[j] = newDpVal;
          steps.push(
            makeStep({
              itemIndex: i,
              mod,
              j,
              queue: activeQ,
              queueMetrics: activeQMetrics,
              dp: [...dp],
              maxVal: dp[t],
              status: 'update',
              message: `✨ 容量 j=${j}：单调队列队头最优决策点为 ${bestQ}，指标值 ${getVal(bestQ)}，将 dp[${j}] 更新为 ${dp[j]}！`,
              log: `dp[${j}]=${dp[j]} from qHead=${bestQ}`,
              codeLine: 23,
            })
          );
        }

        if (queue[l] === j) {
          l++;
        }
      }
    }
  }

  steps.push(
    makeStep({
      itemIndex: -1,
      mod: -1,
      j: t,
      status: 'done',
      message: `🎉 单调队列极速求解完成！在 O(N·W) 时间内得到全局最大价值 ${dp[t]}！`,
      log: `done: ans=${dp[t]}`,
      codeLine: 31,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BoundedKnapsackMonoQueueStep>({
  id: 'bounded-knapsack-monotonic-queue',
  name: '多重背包单调队列优化 (洛谷 P1776 极速最优解)',
  category: 'dynamic-programming',
  badge: {
    mode: '多重背包 · 单调队列 O(NW)',
    complexity: 'O(N · W) · O(W)',
  },
  card1Title: '🔗 同余分组滑窗视口 (余数链切分 & 队列单调性维护)',
  card2Title: '📈 单调队列最值指标与 DP 收益向量',
  inputs: [
    { id: 'input-t', label: '容量 t:', type: 'number', defaultValue: 15, width: '55px' },
    { id: 'input-v', label: '价值 v:', type: 'text', defaultValue: '3, 4, 7, 8', width: '110px' },
    { id: 'input-w', label: '重量 w:', type: 'text', defaultValue: '2, 3, 5, 6', width: '110px' },
    { id: 'input-c', label: '数量 c:', type: 'text', defaultValue: '2, 3, 2, 2', width: '110px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (t=15, 4种宝物, Ans=21)',
      values: { 'input-t': 15, 'input-v': '3, 4, 7, 8', 'input-w': '2, 3, 5, 6', 'input-c': '2, 3, 2, 2' },
    },
    {
      label: '大步长同余链案例 (t=20, w=[4,5], v=[8,10], c=[3,2], Ans=40)',
      values: { 'input-t': 20, 'input-v': '8, 10', 'input-w': '4, 5', 'input-c': '3, 2' },
    },
  ],
  metrics: [
    { id: 'metric-cur-mod', label: '当前同余链 mod', color: '#8b5cf6' },
    { id: 'metric-cur-j', label: '当前考察容量 j', color: '#38bdf8' },
    { id: 'metric-queue-head', label: '队头最优容量点', color: '#f59e0b' },
    { id: 'metric-max-val', label: '最大总价值', color: '#10b981' },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].analysisHtml,
  buildSteps: buildBoundedKnapsackMonoQueueSteps,
  renderCustomStep: (step, { container, updateMetric }) => {
    updateMetric('metric-cur-mod', step.mod >= 0 ? `mod = ${step.mod}` : '—');
    updateMetric('metric-cur-j', step.j > 0 ? `${step.j}` : '—');
    updateMetric('metric-queue-head', step.queue.length > 0 ? `${step.queue[0]}` : '—');
    updateMetric('metric-max-val', `${step.maxVal}`);

    const queueHtml = step.queue.length > 0
      ? step.queue
          .map((pos, idx) => {
            const isHead = idx === 0;
            const mVal = step.queueMetrics[idx];
            return `
              <div style="background:${isHead ? '#166534' : '#1e293b'}; border:1px solid ${
              isHead ? '#22c55e' : '#475569'
            }; border-radius:4px; padding:4px 8px; text-align:center; min-width:60px;">
                <div style="font-size:10px; color:${isHead ? '#4ade80' : '#94a3b8'}; font-weight:700;">${isHead ? '👑 队头' : `#${idx + 1}`} pos=${pos}</div>
                <div style="font-size:11px; color:#f8fafc;">指标: <b>${mVal}</b></div>
              </div>
            `;
          })
          .join('<span style="color:#64748b; font-size:14px; align-self:center;">←</span>')
      : '<span style="color:#64748b; font-size:11px;">(队列为空)</span>';

    const dpCells = step.dp
      .map((val, j) => {
        const isTarget = j === step.j;
        const inQueue = step.queue.includes(j);
        return `
          <div style="flex:1; min-width:30px; background:${isTarget ? '#2563eb' : inQueue ? '#065f46' : '#1e293b'};
                      border:1px solid ${isTarget ? '#60a5fa' : inQueue ? '#34d399' : '#334155'}; border-radius:4px;
                      padding:4px 2px; text-align:center;">
            <div style="font-size:9px; color:#94a3b8;">${j}</div>
            <div style="font-size:11px; font-weight:700; color:#f8fafc;">${val}</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width:100%; display:flex; flex-direction:column; gap:8px; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">双端单调队列滑动窗口 (维护 val(q) = dp[q] - (q/w)*v 最大值)</div>
        <div style="display:flex; gap:6px; overflow-x:auto; background:#0b1329; padding:6px; border-radius:6px; align-items:center;">
          ${queueHtml}
        </div>
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">DP 容量矩阵向量 (绿色代表当前位于滑窗内的容量点)</div>
        <div style="display:flex; gap:3px; overflow-x:auto; background:#0b1329; padding:6px; border-radius:6px;">
          ${dpCells}
        </div>
      </div>
    `;
  },
});

export const BoundedKnapsackMonoQueueVisualizer = Visualizer;

registerAlgorithm({
  id: 'bounded-knapsack-monotonic-queue',
  name: '多重背包单调队列优化 (洛谷 P1776 极速最优解)',
  viewId: 'algo-bounded-knapsack-monotonic-queue-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code04：洛谷 P1776 宝物筛选，按余数分组同余链，使用单调双端队列滑动窗口最值达到理论 O(NW) 极限复杂度',
  icon: '⚡',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 93,
  learningGoal: '深刻掌握同余分组模型、指标函数提取与单调队列优化多重背包的严谨代数推导',
});
