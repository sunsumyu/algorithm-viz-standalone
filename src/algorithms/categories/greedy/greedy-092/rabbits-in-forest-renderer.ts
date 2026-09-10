/**
 * 森林中的兔子 (LeetCode 781) - 声明式教学级沙盘渲染器
 * 核心贪心：同色合并与向上取整分组 ceil(cnt / (x + 1)) * (x + 1)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import {
  RABBITS_IN_FOREST_CODES,
  RABBITS_IN_FOREST_LINES,
} from './greedy-092-stage-codes';
import {
  Greedy092Step,
  renderDecisionBalance,
} from './greedy-092-shared';

export interface RabbitGroupItem {
  answer: number;
  count: number;
  groupCapacity: number;
  groupNum: number;
  groupTotal: number;
}

export interface RabbitsInForestStep extends Greedy092Step {
  answers: number[];
  freqMap: Record<number, number>;
  curAnswer?: number;
  groupsList: RabbitGroupItem[];
  totalRabbits: number;
}

export function buildRabbitsInForestSteps(answers: number[]): RabbitsInForestStep[] {
  const steps: RabbitsInForestStep[] = [];
  const lines = RABBITS_IN_FOREST_LINES;

  // Step 0: 入口
  steps.push({
    answers: [...answers],
    freqMap: {},
    groupsList: [],
    totalRabbits: 0,
    decision: `主函数入口：接收兔子回答列表 answers=[${answers.join(', ')}]，共 ${answers.length} 只兔子发言`,
    message: '每只兔子回答还有 x 只兔子同色，说明其所在颜色组理论容量为 x + 1',
    log: `enter numRabbits(answers=[${answers.join(',')}])`,
    codeLine: lines.entry,
  });

  // Step 1: 统计回答词频
  const freqMap: Record<number, number> = {};
  for (const ans of answers) {
    freqMap[ans] = (freqMap[ans] || 0) + 1;
  }

  steps.push({
    answers: [...answers],
    freqMap: { ...freqMap },
    groupsList: [],
    totalRabbits: 0,
    decision: `词频统计完成：${Object.entries(freqMap).map(([ans, cnt]) => `回答「${ans}」共有 ${cnt} 只`).join('；')}`,
    message: '相同回答的兔子尽可能塞满同一颜色组，以使森林中兔子总数最少',
    log: 'calculated freq map',
    codeLine: lines.countFreq,
  });

  // Step 2: 逐个回答计算组数与总兔子数
  let totalRabbits = 0;
  const groupsList: RabbitGroupItem[] = [];

  for (const [ansStr, cnt] of Object.entries(freqMap)) {
    const x = parseInt(ansStr, 10);
    const groupCapacity = x + 1;
    const groupNum = Math.floor((cnt + x) / groupCapacity);
    const groupTotal = groupNum * groupCapacity;
    totalRabbits += groupTotal;

    const item: RabbitGroupItem = {
      answer: x,
      count: cnt,
      groupCapacity,
      groupNum,
      groupTotal,
    };
    groupsList.push(item);

    steps.push({
      answers: [...answers],
      freqMap: { ...freqMap },
      curAnswer: x,
      groupsList: [...groupsList],
      totalRabbits,
      decision: `处理回答「${x}」：共有 ${cnt} 只兔子发言，单组容量 ${groupCapacity} ➔ 需贪心划分 ⌈${cnt}/${groupCapacity}⌉ = ${groupNum} 个颜色组，该回答对应最少兔子数 = ${groupNum} * ${groupCapacity} = ${groupTotal} 只`,
      message: `森林累计兔子最少数量累加至 ${totalRabbits} 只`,
      log: `ans=${x}, cnt=${cnt} -> groups=${groupNum}, subtotal=${groupTotal}, total=${totalRabbits}`,
      codeLine: lines.calcGroup,
    });
  }

  // Step 3: 收敛
  steps.push({
    answers: [...answers],
    freqMap: { ...freqMap },
    groupsList: [...groupsList],
    totalRabbits,
    decision: `🎉 计算完毕！森林中最少可能有 ${totalRabbits} 只兔子`,
    message: '各颜色分组贪心方案全部收敛',
    log: `done totalRabbits=${totalRabbits}`,
    codeLine: lines.done,
  });

  return steps;
}

export const rabbitsInForestVisualizer = registerDeclarativeAlgorithm<RabbitsInForestStep>({
  id: 'rabbits-in-forest',
  name: '森林中的兔子 (Rabbits in Forest)',
  category: 'greedy',
  icon: '🐇',
  difficulty: 2,
  levelOrder: 922,
  learningGoal: '掌握同回答兔子尽力归入同组的向上取整分组贪心推导',
  problemHtml: GREEDY_092_PROBLEMS.rabbitsInForest.html,
  analysisHtml: GREEDY_092_PROBLEMS.rabbitsInForest.html,
  inputs: [
    {
      id: 'input-answers',
      label: '兔子回答列表 answers',
      type: 'text',
      defaultValue: '1, 1, 2',
      placeholder: '1, 1, 2',
    },
  ],
  codeLanguages: RABBITS_IN_FOREST_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-answers'] || '1, 1, 2');
    const answers = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildRabbitsInForestSteps(answers);
  },
  renderCanvas: (stageContainer: HTMLElement, step: RabbitsInForestStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">发言兔子数: <b>${step.answers.length}</b></span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">不同回答类型: ${Object.keys(step.freqMap).length} 种</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">最少兔子总数:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.totalRabbits} 只</span>
        </div>
      </div>
    `;

    // 中部各颜色组卡片
    const groupsBox = document.createElement('div');
    groupsBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

    if (step.groupsList.length === 0) {
      groupsBox.innerHTML = '<div style="color: #94a3b8; font-size: 12px; font-style: italic; display: flex; align-items: center; justify-content: center; width: 100%;">等待统计与分组...</div>';
    } else {
      step.groupsList.forEach((g) => {
        const isCur = step.curAnswer === g.answer;
        const card = document.createElement('div');
        card.style.cssText = `display: flex; flex-direction: column; gap: 6px; background: ${isCur ? '#eff6ff' : '#f8fafc'}; border: 1.5px solid ${isCur ? '#3b82f6' : '#cbd5e1'}; border-radius: 8px; padding: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
            <span style="font-weight: 700; font-size: 12px; color: #1e293b;">回答「还有 ${g.answer} 只同色」</span>
            <span style="font-size: 10px; font-weight: 700; color: #3b82f6; background: #eff6ff; padding: 1px 6px; border-radius: 4px;">单组容量: ${g.groupCapacity}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: #64748b;">发言兔子数:</span>
            <span style="font-weight: 700; color: #334155; font-family: 'JetBrains Mono', monospace;">${g.count} 只</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: #64748b;">贪心划分组数:</span>
            <span style="font-weight: 700; color: #8b5cf6; font-family: 'JetBrains Mono', monospace;">${g.groupNum} 组</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; background: #ffffff; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0; margin-top: 4px;">
            <span style="color: #64748b; font-weight: 600;">该类总兔子数:</span>
            <span style="font-weight: 800; color: #059669; font-family: 'JetBrains Mono', monospace;">+${g.groupTotal} 只</span>
          </div>
        `;
        groupsBox.appendChild(card);
      });
    }
    mainCard.appendChild(groupsBox);

    stageContainer.appendChild(mainCard);
  },
});
