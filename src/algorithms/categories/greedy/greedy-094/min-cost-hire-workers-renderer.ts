/**
 * 雇佣 K 名工人的最低成本 (LeetCode 857) - 声明式教学级沙盘渲染器
 * 核心贪心：性价比基准升序排序 + 大根堆维护最小工作量和
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
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

export const minCostHireWorkersVisualizer = registerDeclarativeAlgorithm<MinCostHireWorkersStep>({
  id: 'min-cost-hire-workers',
  name: '雇佣 K 名工人的最低成本 (Minimum Cost to Hire K Workers)',
  category: 'greedy',
  icon: '👷',
  difficulty: 3,
  levelOrder: 944,
  learningGoal: '掌握基准单价升序外层贪心与大根堆最小化质量和内层贪心的双重贪心架构',
  problemHtml: GREEDY_094_PROBLEMS.minCostHireWorkers.html,
  analysisHtml: GREEDY_094_PROBLEMS.minCostHireWorkers.html,
  inputs: [
    {
      id: 'input-quality',
      label: '质量 quality',
      type: 'text',
      defaultValue: '10, 20, 5',
      placeholder: '10, 20, 5',
    },
    {
      id: 'input-wage',
      label: '期望最低薪酬 wage',
      type: 'text',
      defaultValue: '70, 50, 30',
      placeholder: '70, 50, 30',
    },
    {
      id: 'input-k',
      label: '目标人数 k',
      type: 'text',
      defaultValue: '2',
      placeholder: '2',
    },
  ],
  codeLanguages: MIN_COST_HIRE_WORKERS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const rawQ = String(inputs?.['input-quality'] || '10, 20, 5');
    const rawW = String(inputs?.['input-wage'] || '70, 50, 30');
    const k = Math.max(1, parseInt(String(inputs?.['input-k'] || '2'), 10) || 1);
    const quality = rawQ.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
    const wage = rawW.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
    return buildMinCostHireWorkersSteps(quality, wage, k);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MinCostHireWorkersStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    const costStr = isFinite(step.bestCost) ? step.bestCost.toFixed(2) : '计算中...';
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">堆内质量总和 sumQ:</span>
          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; font-weight: 800;">${step.sumQuality}</span>
          <span style="color: #cbd5e1;">|</span>
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">大根堆选拔人数:</span>
          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #fdf2f8; color: #db2777; font-family: 'JetBrains Mono', monospace; font-weight: 800;">${step.heapQualities.length} / ${step.k}</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">历史最低成本:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">¥ ${costStr}</span>
        </div>
      </div>
    `;

    // 工人序列展示
    const listCard = document.createElement('div');
    listCard.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-y: auto;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size: 12px; font-weight: 700; color: #475569;';
    title.textContent = '👷 工人性价比序列 (按期望单价 ratio=wage/quality 升序排序)';
    listCard.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;';

    step.workers.forEach((w, idx) => {
      const isCur = step.curWorkerIdx === idx;
      const inHeap = step.heapQualities.includes(w.quality);

      let border = '#e2e8f0';
      let bg = '#f8fafc';

      if (isCur) {
        border = '#3b82f6';
        bg = '#eff6ff';
      } else if (inHeap && idx <= step.curWorkerIdx) {
        border = '#10b981';
        bg = '#ecfdf5';
      }

      const item = document.createElement('div');
      item.style.cssText = `padding: 8px; border-radius: 6px; border: 1.5px solid ${border}; background: ${bg}; display: flex; flex-direction: column; gap: 2px; font-family: 'JetBrains Mono', monospace; font-size: 11px;`;

      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #1e293b;">工人 #${w.id}</span>
          ${isCur ? '<span style="background: #3b82f6; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px;">当前基准</span>' : ''}
        </div>
        <div style="color: #64748b; font-size: 10px;">质量: ${w.quality} | 期望: ${w.wage}</div>
        <div style="font-weight: 700; color: #d97706; margin-top: 2px;">单位单价: ${w.ratio.toFixed(2)}</div>
      `;
      grid.appendChild(item);
    });
    listCard.appendChild(grid);
    mainCard.appendChild(listCard);

    // 决策天平
    const balanceBox = document.createElement('div');
    renderDecisionBalance(balanceBox, {
      leftTitle: '大根堆踢出最大 quality 工人',
      leftVal: '让总质量 sumQ 尽可能缩小',
      rightTitle: '保留高 quality 工人',
      rightVal: '总支付 = sumQ * ratio 发生剧烈膨胀',
      winner: 'left',
      reason: '因所有入选工人均按当前基准 ratio 发放薪水，最小化质量和 sumQ 即等价于最小化总支出',
    });
    mainCard.appendChild(balanceBox);

    stageContainer.appendChild(mainCard);
  },
});
