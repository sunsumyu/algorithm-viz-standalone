/**
 * 森林中的兔子 (LeetCode 781) - 声明式教学级沙盘渲染器
 * 核心贪心：同色合并与向上取整分组 ceil(cnt / (x + 1)) * (x + 1)
 */

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

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';

const template = `<div id="algo-rabbits-in-forest-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const rabbitsInForestRenderer = UniversalStageVisualizer;
export const rabbitsInForestVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'rabbits-in-forest',
  name: '森林中的兔子 (Rabbits in Forest)',
  viewId: 'algo-rabbits-in-forest-view',
  category: 'greedy',
  description: 'LeetCode 781：同色合并与向上取整分组 ceil(cnt / (x + 1)) * (x + 1)',
  icon: '🐇',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 922,
  learningGoal: '掌握同回答兔子尽力归入同组的向上取整分组贪心推导',
});

