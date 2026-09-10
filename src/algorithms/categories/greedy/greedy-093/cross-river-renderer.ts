/**
 * 经典过河问题 (POJ 1700) - 声明式教学级沙盘渲染器
 * 核心贪心：每次运送最慢两人，比较策略 1 (最快者当船夫) 与策略 2 (双快护航，慢者同行)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_093_PROBLEMS } from './greedy-093-problem-content';
import {
  CROSS_RIVER_CODES,
  CROSS_RIVER_LINES,
} from './greedy-093-stage-codes';
import {
  Greedy093Step,
  renderDecisionBalance,
} from './greedy-093-shared';

export interface RoundCrossingDef {
  slow1: number;
  slow2: number;
  cost1: number; // T[i] + T[0] + T[i-1] + T[0]
  cost2: number; // T[1] + T[0] + T[i] + T[1]
  winner: 'strategy1' | 'strategy2';
  chosenCost: number;
}

export interface CrossRiverStep extends Greedy093Step {
  times: number[];
  leftBank: number[];
  rightBank: number[];
  rounds: RoundCrossingDef[];
  totalTime: number;
  curRound?: RoundCrossingDef;
}

export function buildCrossRiverSteps(rawTimes: number[]): CrossRiverStep[] {
  const steps: CrossRiverStep[] = [];
  const lines = CROSS_RIVER_LINES;
  const times = [...rawTimes].sort((a, b) => a - b);
  const n = times.length;

  // Step 0: 入口
  steps.push({
    times: [...times],
    leftBank: [...times],
    rightBank: [],
    rounds: [],
    totalTime: 0,
    decision: `主函数入口：共有 n=${n} 个人在夜间等待过河，耗时数组为 [${times.join(', ')}]`,
    message: '核心目标：用最少时间将所有人运送到对岸，每次运送最慢的两个人',
    log: `enter minCrossingTime(times=[${times.join(',')}])`,
    codeLine: lines.entry,
  });

  // Step 1: 升序排序
  steps.push({
    times: [...times],
    leftBank: [...times],
    rightBank: [],
    rounds: [],
    totalTime: 0,
    decision: `贪心排序：按过河耗时升序排序 ➔ [${times.join(', ')}]，最快者 T[0]=${times[0]}，次快者 T[1]=${n > 1 ? times[1] : times[0]}`,
    message: '由最快的一两个人负责将手电筒划回',
    log: `sorted times=[${times.join(',')}]`,
    codeLine: lines.sortTimes,
  });

  let totalTime = 0;
  const leftBank = [...times];
  const rightBank: number[] = [];
  const rounds: RoundCrossingDef[] = [];

  let i = n - 1;
  while (i >= 3) {
    const s1 = times[i] + times[0] + times[i - 1] + times[0];
    const s2 = times[1] + times[0] + times[i] + times[1];
    const isS1Better = s1 < s2;
    const chosenCost = Math.min(s1, s2);
    totalTime += chosenCost;

    const roundDef: RoundCrossingDef = {
      slow1: times[i - 1],
      slow2: times[i],
      cost1: s1,
      cost2: s2,
      winner: isS1Better ? 'strategy1' : 'strategy2',
      chosenCost,
    };
    rounds.push(roundDef);

    // 移出最慢两人
    const moved1 = leftBank.pop()!;
    const moved2 = leftBank.pop()!;
    rightBank.push(moved2, moved1);

    steps.push({
      times: [...times],
      leftBank: [...leftBank],
      rightBank: [...rightBank],
      rounds: [...rounds],
      curRound: roundDef,
      totalTime,
      decision: `运送最慢两人 (${times[i - 1]}, ${times[i]})：\n• 策略1 (快者护送): ${times[i]} + ${times[0]} + ${times[i - 1]} + ${times[0]} = ${s1} 分钟\n• 策略2 (双快护航): ${times[1]} + ${times[0]} + ${times[i]} + ${times[1]} = ${s2} 分钟\n➔ 贪心选择【${isS1Better ? '策略1 (快者护送)' : '策略2 (双快护航)'}】，增加耗时 ${chosenCost} 分钟，累计耗时 ${totalTime} 分钟`,
      message: `左岸剩余人数: ${leftBank.length}，右岸已达人数: ${rightBank.length}`,
      log: `round slow=(${times[i - 1]},${times[i]}), s1=${s1}, s2=${s2}, chose=${chosenCost}`,
      codeLine: lines.compareS1S2,
    });

    i -= 2;
  }

  // 基底边界处理
  if (i === 2) {
    const baseCost = times[0] + times[1] + times[2];
    totalTime += baseCost;
    rightBank.push(...leftBank);
    leftBank.length = 0;

    steps.push({
      times: [...times],
      leftBank: [],
      rightBank: [...rightBank],
      rounds: [...rounds],
      totalTime,
      decision: `基底情况：左岸剩余 3 人 [${times[0]}, ${times[1]}, ${times[2]}] ➔ 耗时 T[0]+T[1]+T[2] = ${times[0]}+${times[1]}+${times[2]} = ${baseCost} 分钟，全部人员抵达对岸`,
      message: '基底计算完成',
      log: `base case 3 persons cost=${baseCost}`,
      codeLine: lines.baseCase,
    });
  } else if (i === 1) {
    const baseCost = times[1];
    totalTime += baseCost;
    rightBank.push(...leftBank);
    leftBank.length = 0;

    steps.push({
      times: [...times],
      leftBank: [],
      rightBank: [...rightBank],
      rounds: [...rounds],
      totalTime,
      decision: `基底情况：左岸剩余 2 人 [${times[0]}, ${times[1]}] ➔ 两人一同划过耗时 T[1] = ${baseCost} 分钟，全部人员抵达对岸`,
      message: '基底计算完成',
      log: `base case 2 persons cost=${baseCost}`,
      codeLine: lines.baseCase,
    });
  } else if (i === 0) {
    const baseCost = times[0];
    totalTime += baseCost;
    rightBank.push(...leftBank);
    leftBank.length = 0;

    steps.push({
      times: [...times],
      leftBank: [],
      rightBank: [...rightBank],
      rounds: [...rounds],
      totalTime,
      decision: `基底情况：左岸仅剩 1 人 [${times[0]}] ➔ 单独划过耗时 T[0] = ${baseCost} 分钟`,
      message: '基底计算完成',
      log: `base case 1 person cost=${baseCost}`,
      codeLine: lines.baseCase,
    });
  }

  // 收敛
  steps.push({
    times: [...times],
    leftBank: [],
    rightBank: [...times],
    rounds: [...rounds],
    totalTime,
    decision: `🎉 全员安全过河完毕！最少总耗时为 ${totalTime} 分钟`,
    message: '双策略贪心消减证明全局最优',
    log: `done totalTime=${totalTime}`,
    codeLine: lines.done,
  });

  return steps;
}

export const crossRiverVisualizer = registerDeclarativeAlgorithm<CrossRiverStep>({
  id: 'cross-river-classic',
  name: '经典过河问题 (Cross River)',
  category: 'greedy',
  icon: '🛶',
  difficulty: 2,
  levelOrder: 934,
  learningGoal: '掌握过河问题中策略一（最快者当船夫）与策略二（双快护航最慢同行）的贪心比对',
  problemHtml: GREEDY_093_PROBLEMS.crossRiver.html,
  analysisHtml: GREEDY_093_PROBLEMS.crossRiver.html,
  inputs: [
    {
      id: 'input-times',
      label: '各人员耗时 times',
      type: 'text',
      defaultValue: '1, 2, 5, 10',
      placeholder: '1, 2, 5, 10',
    },
  ],
  codeLanguages: CROSS_RIVER_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-times'] || '1, 2, 5, 10');
    const times = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((x) => !isNaN(x));
    return buildCrossRiverSteps(times);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CrossRiverStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态指标
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">总人数: <b>${step.times.length}</b> 人</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">左岸: ${step.leftBank.length}人 | 右岸: ${step.rightBank.length}人</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">累计最短总耗时:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.totalTime} 分钟</span>
        </div>
      </div>
    `;

    // 中部两岸人员分布沙盘
    const riverBox = document.createElement('div');
    riverBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px;';

    // 左岸
    const leftCard = document.createElement('div');
    leftCard.style.cssText = 'display: flex; flex-direction: column; gap: 6px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px; height: 100%; box-sizing: border-box;';
    leftCard.innerHTML = `
      <span style="font-size: 12px; font-weight: 700; color: #1e293b; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">🏞️ 左岸 (起点)</span>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
        ${step.leftBank.length === 0 ? '<span style="color: #94a3b8; font-size: 11px;">已全部渡河</span>' : step.leftBank.map(t => `
          <div style="padding: 4px 8px; border-radius: 6px; background: #eff6ff; border: 1px solid #bfdbfe; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #1d4ed8;">
            ⏱️ ${t}m
          </div>
        `).join('')}
      </div>
    `;
    riverBox.appendChild(leftCard);

    // 河流与小船
    const streamCard = document.createElement('div');
    streamCard.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 0 10px;';
    streamCard.innerHTML = `
      <span style="font-size: 24px;">🛶</span>
      <span style="font-size: 10px; font-weight: 600; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">限载2人·手电筒</span>
    `;
    riverBox.appendChild(streamCard);

    // 右岸
    const rightCard = document.createElement('div');
    rightCard.style.cssText = 'display: flex; flex-direction: column; gap: 6px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 10px; height: 100%; box-sizing: border-box;';
    rightCard.innerHTML = `
      <span style="font-size: 12px; font-weight: 700; color: #065f46; border-bottom: 1px dashed #86efac; padding-bottom: 4px;">🏝️ 右岸 (对岸)</span>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
        ${step.rightBank.length === 0 ? '<span style="color: #94a3b8; font-size: 11px;">尚无人抵达</span>' : step.rightBank.map(t => `
          <div style="padding: 4px 8px; border-radius: 6px; background: #ffffff; border: 1px solid #86efac; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #047857;">
            ✓ ${t}m
          </div>
        `).join('')}
      </div>
    `;
    riverBox.appendChild(rightCard);

    mainCard.appendChild(riverBox);

    // 底部当前轮次双策略天平卡片
    if (step.curRound) {
      const balanceBox = document.createElement('div');
      renderDecisionBalance(balanceBox, {
        leftTitle: `策略 1 (最快者当船夫)`,
        leftVal: `${step.curRound.cost1} 分钟`,
        rightTitle: `策略 2 (双快护航，慢者同行)`,
        rightVal: `${step.curRound.cost2} 分钟`,
        winner: step.curRound.winner === 'strategy1' ? 'left' : 'right',
        reason: step.curRound.winner === 'strategy1' ? `策略1更优 (${step.curRound.cost1} < ${step.curRound.cost2})` : `策略2更优 (${step.curRound.cost2} <= ${step.curRound.cost1})`,
      });
      mainCard.appendChild(balanceBox);
    }

    stageContainer.appendChild(mainCard);
  },
});

export function registerCrossRiver(): void {
  // 保持向前兼容导出
}
