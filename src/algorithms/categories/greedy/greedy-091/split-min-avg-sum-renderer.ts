/**
 * 平均值最小累加和 (Split Minimum Average Sum) - 声明式教学级沙盘渲染器
 * 核心贪心：升序排序后，最小 k-1 个元素各自独占一个集合，剩余大元素全部合入最后一个集合稀释
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import {
  SPLIT_MIN_AVG_SUM_CODES,
  SPLIT_MIN_AVG_SUM_LINES,
} from './greedy-091-stage-codes';
import {
  Greedy091Step,
  renderDecisionBalance,
} from './greedy-091-shared';

export interface SetGroup {
  id: number;
  elements: number[];
  sum: number;
  count: number;
  avg: number;
}

export interface SplitMinAvgSumStep extends Greedy091Step {
  originalArr: number[];
  sortedArr: number[];
  k: number;
  groups: SetGroup[];
  totalAvgSum: number;
}

export function buildSplitMinAvgSumSteps(arr: number[], k: number): SplitMinAvgSumStep[] {
  const steps: SplitMinAvgSumStep[] = [];
  const lines = SPLIT_MIN_AVG_SUM_LINES;
  const n = arr.length;

  // Step 0: 入口
  steps.push({
    originalArr: [...arr],
    sortedArr: [...arr],
    k,
    groups: [],
    totalAvgSum: 0,
    decision: `主函数入口：接收数组 arr=[${arr.join(', ')}]，划分组数 k=${k}`,
    message: '为了使总平均值最小，需要尽可能减少大数值对平均值的贡献权重',
    log: `enter minAverageSum(arr=[${arr.join(',')}], k=${k})`,
    codeLine: lines.entry,
  });

  // Step 1: 升序排序
  const sorted = [...arr].sort((a, b) => a - b);
  steps.push({
    originalArr: [...arr],
    sortedArr: [...sorted],
    k,
    groups: [],
    totalAvgSum: 0,
    decision: `贪心预处理：将数组按升序排序 ➔ [${sorted.join(', ')}]`,
    message: '最小的 k-1 个数放入独立集合（大小为1），剩余元素并入大集合稀释',
    log: `sorted arr: [${sorted.join(',')}]`,
    codeLine: lines.sortArr,
  });

  // Step 2: 分配前 k-1 个单元素集合
  const groups: SetGroup[] = [];
  let totalAvgSum = 0;

  for (let i = 0; i < k - 1; i++) {
    const val = sorted[i];
    groups.push({
      id: i + 1,
      elements: [val],
      sum: val,
      count: 1,
      avg: val,
    });
    totalAvgSum += val;

    steps.push({
      originalArr: [...arr],
      sortedArr: [...sorted],
      k,
      groups: groups.map(g => ({ ...g, elements: [...g.elements] })),
      totalAvgSum,
      decision: `构造集合 #${i + 1}：独占分配单元素 [${val}]，平均值 = ${val}/1 = ${val}，累计平均和 = ${totalAvgSum}`,
      message: `小元素自身平均值低，单元素独占不会造成浪费`,
      log: `group #${i + 1} = [${val}] avg=${val}`,
      codeLine: lines.singleSets,
    });
  }

  // Step 3: 剩余元素全部并入第 k 个集合
  const lastElements = sorted.slice(k - 1);
  const lastSum = lastElements.reduce((a, b) => a + b, 0);
  const lastCount = lastElements.length;
  const lastAvg = Math.floor(lastSum / lastCount);
  totalAvgSum += lastAvg;

  groups.push({
    id: k,
    elements: [...lastElements],
    sum: lastSum,
    count: lastCount,
    avg: lastAvg,
  });

  steps.push({
    originalArr: [...arr],
    sortedArr: [...sorted],
    k,
    groups: groups.map(g => ({ ...g, elements: [...g.elements] })),
    totalAvgSum,
    decision: `构造最后一个集合 #${k}：合并剩余 ${lastCount} 个较大元素 [${lastElements.join(', ')}]，总和 sum=${lastSum}，平均值 = ⌊${lastSum}/${lastCount}⌋ = ${lastAvg}`,
    message: `大数值被 ${lastCount} 的大分母充分稀释！`,
    log: `group #${k} = [${lastElements.join(',')}] avg=${lastAvg}`,
    codeLine: lines.diluteSet,
  });

  // Step 4: 最终收敛
  steps.push({
    originalArr: [...arr],
    sortedArr: [...sorted],
    k,
    groups: groups.map(g => ({ ...g, elements: [...g.elements] })),
    totalAvgSum,
    decision: `🎉 计算完毕！划分成 ${k} 个集合的最小平均值累加和为 ${totalAvgSum}`,
    message: '贪心划分策略全局最优',
    log: `done totalAvgSum=${totalAvgSum}`,
    codeLine: lines.done,
  });

  return steps;
}

export const splitMinAvgSumVisualizer = registerDeclarativeAlgorithm<SplitMinAvgSumStep>({
  id: 'split-min-avg-sum',
  name: '平均值最小累加和 (Split Minimum Average Sum)',
  category: 'greedy',
  icon: '➗',
  difficulty: 2,
  levelOrder: 914,
  learningGoal: '掌握前k-1小值独占集合与其余大数合并稀释的贪心不等式证明',
  problemHtml: GREEDY_091_PROBLEMS.splitMinAvgSum.html,
  analysisHtml: GREEDY_091_PROBLEMS.splitMinAvgSum.html,
  inputs: [
    {
      id: 'input-arr',
      label: '输入数组 arr',
      type: 'text',
      defaultValue: '9, 1, 8, 2, 7, 3, 6',
      placeholder: '9, 1, 8, 2, 7, 3, 6',
    },
    {
      id: 'input-k',
      label: '划分集合数 k',
      type: 'text',
      defaultValue: '3',
      placeholder: '如 3',
    },
  ],
  codeLanguages: SPLIT_MIN_AVG_SUM_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const rawArr = String(inputs?.['input-arr'] || '9, 1, 8, 2, 7, 3, 6');
    const k = Math.max(1, parseInt(String(inputs?.['input-k'] || '3'), 10) || 1);
    const arr = rawArr.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildSplitMinAvgSumSteps(arr, k);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SplitMinAvgSumStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部指标栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">升序序列:</span>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">[${step.sortedArr.join(', ')}]</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">累计平均值之和:</span>
          <span style="color: #059669; font-weight: 800; font-size: 15px;">${step.totalAvgSum}</span>
        </div>
      </div>
    `;

    // 中部各集合展示卡片
    const groupsBox = document.createElement('div');
    groupsBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

    if (step.groups.length === 0) {
      groupsBox.innerHTML = '<div style="color: #94a3b8; font-size: 12px; font-style: italic; display: flex; align-items: center; justify-content: center; width: 100%;">集合待划分...</div>';
    } else {
      step.groups.forEach((g) => {
        const isDiluted = g.count > 1;
        const card = document.createElement('div');
        card.style.cssText = `display: flex; flex-direction: column; gap: 6px; background: ${isDiluted ? '#fdf4ff' : '#f8fafc'}; border: 1.5px solid ${isDiluted ? '#c084fc' : '#cbd5e1'}; border-radius: 8px; padding: 10px;`;

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
            <span style="font-weight: 700; font-size: 12px; color: #1e293b;">集合 #${g.id} ${isDiluted ? '(大集合稀释)' : '(小值独占)'}</span>
            <span style="font-size: 11px; font-weight: 600; color: #64748b;">容量: ${g.count}</span>
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin: 4px 0;">
            ${g.elements.map(e => `
              <span style="padding: 2px 6px; border-radius: 4px; background: #ffffff; border: 1px solid #cbd5e1; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #334155;">${e}</span>
            `).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: auto; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
            <span style="color: #64748b;">计算算式:</span>
            <span style="font-family: 'JetBrains Mono', monospace; color: #475569;">⌊${g.sum}/${g.count}⌋</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; background: #ffffff; padding: 3px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 600;">平均值 Contribution:</span>
            <span style="font-weight: 800; color: #059669; font-family: 'JetBrains Mono', monospace;">+${g.avg}</span>
          </div>
        `;
        groupsBox.appendChild(card);
      });
    }
    mainCard.appendChild(groupsBox);

    stageContainer.appendChild(mainCard);
  },
});
