/**
 * 超级洗衣机 (LeetCode 517) - 声明式教学级沙盘渲染器
 * 核心贪心：左右净需求量与单机同时流出瓶颈 max(leftNeed + rightNeed, max(|leftNeed|, |rightNeed|))
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_093_PROBLEMS } from './greedy-093-problem-content';
import {
  SUPER_WASHING_MACHINES_CODES,
  SUPER_WASHING_MACHINES_LINES,
} from './greedy-093-stage-codes';
import {
  Greedy093Step,
  renderDecisionBalance,
} from './greedy-093-shared';

export interface MachineBottleneck {
  idx: number;
  clothes: number;
  leftNeed: number;
  rightNeed: number;
  bottleneck: number;
  isDualOutput: boolean;
}

export interface SuperWashingMachinesStep extends Greedy093Step {
  machines: number[];
  curIdx: number;
  avg: number;
  totalSum: number;
  maxMoves: number;
  bottlenecks: MachineBottleneck[];
  isImpossible?: boolean;
}

export function buildSuperWashingMachinesSteps(machines: number[]): SuperWashingMachinesStep[] {
  const steps: SuperWashingMachinesStep[] = [];
  const lines = SUPER_WASHING_MACHINES_LINES;
  const n = machines.length;
  const totalSum = machines.reduce((a, b) => a + b, 0);

  // Step 0: 入口
  steps.push({
    machines: [...machines],
    curIdx: -1,
    avg: 0,
    totalSum,
    maxMoves: 0,
    bottlenecks: [],
    decision: `主函数入口：洗衣机数量 n=${n}，当前衣物总量 totalSum=${totalSum}`,
    message: '核心目标：求使所有洗衣机内衣物数量相等的最少步数（每步每台机器最多移出1件）',
    log: `enter findMinMoves(machines=[${machines.join(',')}])`,
    codeLine: lines.entry,
  });

  // 整除性特判
  if (totalSum % n !== 0) {
    steps.push({
      machines: [...machines],
      curIdx: -1,
      avg: 0,
      totalSum,
      maxMoves: -1,
      bottlenecks: [],
      isImpossible: true,
      decision: `❌ 无法平均分配！衣物总数 ${totalSum} 无法被洗衣机台数 ${n} 整除 (余数 ${totalSum % n})，直接返回 -1`,
      message: '特判无法均分，返回 -1',
      log: `cannot divide evenly, totalSum=${totalSum}, n=${n}`,
      codeLine: lines.guardDiv,
    });
    return steps;
  }

  const avg = totalSum / n;
  let leftSum = 0;
  let maxMoves = 0;
  const bottlenecks: MachineBottleneck[] = [];

  for (let i = 0; i < n; i++) {
    const num = machines[i];
    const leftNeed = i * avg - leftSum;
    const rightNeed = (n - 1 - i) * avg - (totalSum - leftSum - num);

    let curBottleneck = 0;
    const isDualOutput = leftNeed > 0 && rightNeed > 0;
    if (isDualOutput) {
      curBottleneck = leftNeed + rightNeed;
    } else {
      curBottleneck = Math.max(Math.abs(leftNeed), Math.abs(rightNeed));
    }

    maxMoves = Math.max(maxMoves, curBottleneck);
    leftSum += num;

    const bItem: MachineBottleneck = {
      idx: i,
      clothes: num,
      leftNeed,
      rightNeed,
      bottleneck: curBottleneck,
      isDualOutput,
    };
    bottlenecks.push(bItem);

    steps.push({
      machines: [...machines],
      curIdx: i,
      avg,
      totalSum,
      maxMoves,
      bottlenecks: [...bottlenecks],
      decision: isDualOutput
        ? `考察洗衣机 #${i} (${num}件)：左侧净缺 ${leftNeed} 件，右侧净缺 ${rightNeed} 件 ➔ 机器 #${i} 必须【同时向左右两侧流出】！因每秒仅能移出一件，瓶颈为两端之和 ${leftNeed} + ${rightNeed} = ${curBottleneck} 步，全局最大步数更新为 ${maxMoves}`
        : `考察洗衣机 #${i} (${num}件)：左侧净需求 ${leftNeed}，右侧净需求 ${rightNeed} ➔ 单向穿透瓶颈 max(|${leftNeed}|, |${rightNeed}|) = ${curBottleneck} 步，全局最大步数更新为 ${maxMoves}`,
      message: `目标平均衣物数 avg = ${avg} 件，当前累计全局瓶颈 maxMoves = ${maxMoves}`,
      log: `machine #${i}: leftNeed=${leftNeed}, rightNeed=${rightNeed}, bottleneck=${curBottleneck}`,
      codeLine: lines.bottleneck,
    });
  }

  // 收敛
  steps.push({
    machines: [...machines],
    curIdx: -1,
    avg,
    totalSum,
    maxMoves,
    bottlenecks: [...bottlenecks],
    decision: `🎉 计算完毕！使所有洗衣机达到均分 (${avg} 件) 的最少移动步数为 ${maxMoves} 步`,
    message: '最大局部流量瓶颈决定全局最小操作步数',
    log: `done maxMoves=${maxMoves}`,
    codeLine: lines.done,
  });

  return steps;
}

export const superWashingMachinesVisualizer = registerDeclarativeAlgorithm<SuperWashingMachinesStep>({
  id: 'super-washing-machines',
  name: '超级洗衣机 (Super Washing Machines)',
  category: 'greedy',
  icon: '🧺',
  difficulty: 3,
  levelOrder: 935,
  learningGoal: '掌握前缀和与单机同时双向流出瓶颈 max(leftNeed + rightNeed, max(|leftNeed|, |rightNeed|)) 的贪心证明',
  problemHtml: GREEDY_093_PROBLEMS.superWashingMachines.html,
  analysisHtml: GREEDY_093_PROBLEMS.superWashingMachines.html,
  inputs: [
    {
      id: 'input-machines',
      label: '各洗衣机衣服数 machines',
      type: 'text',
      defaultValue: '1, 0, 5',
      placeholder: '1, 0, 5',
    },
  ],
  codeLanguages: SUPER_WASHING_MACHINES_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-machines'] || '1, 0, 5');
    const machines = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((x) => !isNaN(x));
    return buildSuperWashingMachinesSteps(machines);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SuperWashingMachinesStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">机器台数: <b>${step.machines.length}</b></span>
          <span style="color: #cbd5e1;">|</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">衣物总数: ${step.totalSum}</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #ecfdf5; color: #047857; font-weight: 600;">目标均值 avg: ${step.avg}</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">最少操作步数:</span>
          <span style="color: ${step.isImpossible ? '#dc2626' : '#059669'}; font-weight: 800; font-size: 16px;">${step.maxMoves} 步</span>
        </div>
      </div>
    `;

    // 中部洗衣机图例
    const machinesBox = document.createElement('div');
    machinesBox.style.cssText = 'flex: 1; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; align-items: center; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px;';

    step.machines.forEach((num, idx) => {
      const isCur = step.curIdx === idx;
      const diff = num - step.avg;

      let border = '#cbd5e1';
      let bg = '#f8fafc';
      if (isCur) {
        border = '#3b82f6';
        bg = '#eff6ff';
      } else if (diff > 0) {
        border = '#f59e0b';
        bg = '#fffbeb';
      } else if (diff < 0) {
        border = '#ef4444';
        bg = '#fee2e2';
      }

      const item = document.createElement('div');
      item.style.cssText = `min-width: 60px; height: 68px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; font-family: 'JetBrains Mono', monospace; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;

      item.innerHTML = `
        <span style="font-size: 16px;">🧺</span>
        <span style="font-weight: 800; font-size: 13px; color: #1e293b;">${num} 件</span>
        <span style="font-size: 10px; font-weight: 600; color: ${diff >= 0 ? '#059669' : '#dc2626'};">${diff >= 0 ? `+${diff}` : diff}</span>
      `;

      if (isCur) {
        const tag = document.createElement('span');
        tag.style.cssText = 'position: absolute; top: -11px; background: #3b82f6; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
        tag.textContent = '当前机器';
        item.appendChild(tag);
      }

      machinesBox.appendChild(item);
    });
    mainCard.appendChild(machinesBox);

    // 底部当前瓶颈详情卡片
    if (step.curIdx >= 0 && step.curIdx < step.bottlenecks.length) {
      const curB = step.bottlenecks[step.curIdx];
      const balanceBox = document.createElement('div');
      renderDecisionBalance(balanceBox, {
        leftTitle: '左侧净需求 (leftNeed)',
        leftVal: curB.leftNeed > 0 ? `需向左输出 ${curB.leftNeed} 件` : `需从左输入 ${Math.abs(curB.leftNeed)} 件`,
        rightTitle: '右侧净需求 (rightNeed)',
        rightVal: curB.rightNeed > 0 ? `需向右输出 ${curB.rightNeed} 件` : `需从右输入 ${Math.abs(curB.rightNeed)} 件`,
        winner: curB.isDualOutput ? 'left' : 'right',
        reason: curB.isDualOutput ? `同时双向输出，单机独占耗时 ${curB.bottleneck} 步` : `单向净流动瓶颈 ${curB.bottleneck} 步`,
      });
      mainCard.appendChild(balanceBox);
    }

    stageContainer.appendChild(mainCard);
  },
});

export function registerSuperWashingMachines(): void {
  // 保持向前兼容导出
}
