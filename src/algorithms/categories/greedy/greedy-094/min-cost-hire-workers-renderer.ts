/**
 * 雇佣 K 名工人的最低成本 (LeetCode 857) - 声明式教学级沙盘渲染器
 * 核心贪心：性价比基准升序排序 + 大根堆维护最小工作量和
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_094_PROBLEMS } from './greedy-094-problem-content';
import {
  MIN_COST_HIRE_WORKERS_CODES,
  MIN_COST_HIRE_WORKERS_LINES,
} from './greedy-094-stage-codes';
import {
  Greedy094Step,
  renderDecisionBalance,
} from './greedy-094-shared';

export interface WorkerInfo {
  id: number;
  quality: number;
  wage: number;
  ratio: number;
}

export interface MinCostHireWorkersStep extends Greedy094Step {
  workers: WorkerInfo[];
  k: number;
  curWorkerIdx: number;
  heapQualities: number[];
  sumQuality: number;
  curCost?: number;
  bestCost: number;
}

export function buildMinCostHireWorkersSteps(
  quality: number[],
  wage: number[],
  k: number
): MinCostHireWorkersStep[] {
  const steps: MinCostHireWorkersStep[] = [];
  const lines = MIN_COST_HIRE_WORKERS_LINES;
  const n = Math.min(quality.length, wage.length);

  // Step 0: 入口
  const workers: WorkerInfo[] = [];
  for (let i = 0; i < n; i++) {
    workers.push({
      id: i,
      quality: quality[i],
      wage: wage[i],
      ratio: wage[i] / quality[i],
    });
  }

  steps.push({
    workers: workers.map(w => ({ ...w })),
    k,
    curWorkerIdx: -1,
    heapQualities: [],
    sumQuality: 0,
    bestCost: Infinity,
    decision: `主函数入口：共 ${n} 名工人候选，目标选拔 k=${k} 名工人，使总雇佣成本最低`,
    message: '每名工人的薪酬必须按组内最高单位质量价格(ratio)乘以其质量 quality 进行支付',
    log: `enter mincostToHireWorkers(k=${k})`,
    codeLine: lines.entry,
  });

  // Step 1: 按性价比 ratio 升序排序
  workers.sort((a, b) => a.ratio - b.ratio);

  steps.push({
    workers: workers.map(w => ({ ...w })),
    k,
    curWorkerIdx: -1,
    heapQualities: [],
    sumQuality: 0,
    bestCost: Infinity,
    decision: `排序完成：按期望单价 ratio (wage/quality) 升序排列。当前基准比例单调递增，后续工人可作为薪酬基准`,
    message: '固定当前工人为组内最高 ratio，前序工人均能被满足期望',
    log: `sorted workers by ratio: ${workers.map(w => w.ratio.toFixed(3)).join(', ')}`,
    codeLine: lines.sortRatio,
  });

  // Step 2: 维护大根堆
  const heap: number[] = [];
  let sumQ = 0;
  let minCost = Infinity;

  for (let i = 0; i < n; i++) {
    const w = workers[i];
    heap.push(w.quality);
    sumQ += w.quality;
    heap.sort((a, b) => b - a); // 大根堆模拟

    let popped: number | undefined;
    if (heap.length > k) {
      popped = heap.shift();
      if (popped !== undefined) {
        sumQ -= popped;
      }
    }

    if (heap.length === k) {
      const curCost = sumQ * w.ratio;
      const updated = curCost < minCost;
      minCost = Math.min(minCost, curCost);

      steps.push({
        workers: workers.map(x => ({ ...x })),
        k,
        curWorkerIdx: i,
        heapQualities: [...heap],
        sumQuality: sumQ,
        curCost,
        bestCost: minCost,
        decision: `考察工人 #${w.id}（单价 ratio=${w.ratio.toFixed(3)}, 质量 q=${w.quality}）：${popped !== undefined ? `踢出过大质量 ${popped}，` : ''}堆内保留最小 ${k} 个质量，总工作量 sumQ = ${sumQ} ➔ 当前方案成本 = ${sumQ} × ${w.ratio.toFixed(3)} = ${curCost.toFixed(2)}${updated ? '（刷新历史最低！🎉）' : ''}`,
        message: `当前最佳最低成本: ${minCost.toFixed(2)}`,
        log: `worker idx ${i}, ratio=${w.ratio.toFixed(3)}, sumQ=${sumQ}, curCost=${curCost.toFixed(2)}`,
        codeLine: lines.updateAns,
      });
    } else {
      steps.push({
        workers: workers.map(x => ({ ...x })),
        k,
        curWorkerIdx: i,
        heapQualities: [...heap],
        sumQuality: sumQ,
        bestCost: minCost,
        decision: `纳入工人 #${w.id}（质量 q=${w.quality}）：当前堆内人数 ${heap.length} < k=${k}，继续积累候选工人`,
        message: `积累阶段：sumQuality = ${sumQ}`,
        log: `worker idx ${i} added, heap size ${heap.length}`,
        codeLine: lines.maintainQ,
      });
    }
  }

  // Step 3: 演练结束
  steps.push({
    workers: workers.map(x => ({ ...x })),
    k,
    curWorkerIdx: n - 1,
    heapQualities: [...heap],
    sumQuality: sumQ,
    bestCost: minCost,
    decision: `🎉 演练结束：雇佣 ${k} 名工人的全局最低总成本为 ${minCost.toFixed(5)}`,
    message: '外层单价递增贪心 + 内层大根堆质量收敛贪心完美结合',
    log: `done minCost=${minCost}`,
    codeLine: lines.done,
  });

  return steps;
}

const template = `<div id="algo-min-cost-hire-workers-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const minCostHireWorkersRenderer = UniversalStageVisualizer;
export const minCostHireWorkersVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'min-cost-hire-workers',
  name: '雇佣 K 名工人的最低成本 (Minimum Cost to Hire K Workers)',
  viewId: 'algo-min-cost-hire-workers-view',
  category: 'greedy',
  description: 'LeetCode 857：基准单价升序外层贪心与大根堆最小化质量和内层贪心的双重贪心架构',
  icon: '👷',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 944,
  learningGoal: '掌握基准单价升序外层贪心与大根堆最小化质量和内层贪心的双重贪心架构',
});

export function registerMinCostHireWorkers(): void {
  // 保持向前兼容导出
}
