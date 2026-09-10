/**
 * 使数组相似的最少操作次数 (LeetCode 2449) - 声明式教学级沙盘渲染器
 * 核心贪心：奇偶分离独立排序 + 顺位对齐累加正差值之和 / 2
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import {
  MIN_OPERATIONS_SIMILAR_CODES,
  MIN_OPERATIONS_SIMILAR_LINES,
} from './greedy-092-stage-codes';
import {
  Greedy092Step,
  renderDecisionBalance,
} from './greedy-092-shared';

export interface PairMatch {
  type: 'odd' | 'even';
  idx: number;
  num: number;
  target: number;
  diff: number;
  ops: number;
}

export interface MinOperationsSimilarStep extends Greedy092Step {
  originalNums: number[];
  originalTarget: number[];
  oddNums: number[];
  oddTarget: number[];
  evenNums: number[];
  evenTarget: number[];
  pairs: PairMatch[];
  totalOps: number;
}

export function buildMinOperationsSimilarSteps(nums: number[], target: number[]): MinOperationsSimilarStep[] {
  const steps: MinOperationsSimilarStep[] = [];
  const lines = MIN_OPERATIONS_SIMILAR_LINES;

  // Step 0: 入口
  steps.push({
    originalNums: [...nums],
    originalTarget: [...target],
    oddNums: [],
    oddTarget: [],
    evenNums: [],
    evenTarget: [],
    pairs: [],
    totalOps: 0,
    decision: `主函数入口：接收 nums=[${nums.join(', ')}]，target=[${target.join(', ')}]`,
    message: '由于每次操作只能对数字 +2 或 -2，奇偶性不变，奇数只能对齐奇数，偶数只能对齐偶数',
    log: `enter makeSimilar(nums=[${nums.join(',')}], target=[${target.join(',')}])`,
    codeLine: lines.entry,
  });

  // Step 1: 奇偶分离并排序
  const sortedNums = [...nums].sort((a, b) => a - b);
  const sortedTarget = [...target].sort((a, b) => a - b);

  const oddNums = sortedNums.filter(x => x % 2 !== 0);
  const evenNums = sortedNums.filter(x => x % 2 === 0);
  const oddTarget = sortedTarget.filter(x => x % 2 !== 0);
  const evenTarget = sortedTarget.filter(x => x % 2 === 0);

  steps.push({
    originalNums: [...nums],
    originalTarget: [...target],
    oddNums: [...oddNums],
    oddTarget: [...oddTarget],
    evenNums: [...evenNums],
    evenTarget: [...evenTarget],
    pairs: [],
    totalOps: 0,
    decision: `奇偶分离与升序排序：\n奇数: nums=[${oddNums.join(', ')}] ➔ target=[${oddTarget.join(', ')}]\n偶数: nums=[${evenNums.join(', ')}] ➔ target=[${evenTarget.join(', ')}]`,
    message: '根据排序不等式与贪心对齐原则，同类排位顺位对应配对可达到最少总操作',
    log: 'split and sorted odd/even sets',
    codeLine: lines.sortSplit,
  });

  // Step 2: 奇数对齐
  const pairs: PairMatch[] = [];
  let totalOps = 0;

  for (let i = 0; i < oddNums.length; i++) {
    const a = oddNums[i];
    const b = oddTarget[i];
    const diff = a - b;
    const ops = diff > 0 ? diff / 2 : 0;
    totalOps += ops;

    pairs.push({
      type: 'odd',
      idx: i,
      num: a,
      target: b,
      diff,
      ops,
    });

    steps.push({
      originalNums: [...nums],
      originalTarget: [...target],
      oddNums: [...oddNums],
      oddTarget: [...oddTarget],
      evenNums: [...evenNums],
      evenTarget: [...evenTarget],
      pairs: [...pairs],
      totalOps,
      decision: `奇数配对 #${i}: nums[${i}]=${a} ➔ target[${i}]=${b} (差值 ${diff >= 0 ? '+' : ''}${diff}) ➔ ${diff > 0 ? `贡献正向操作 ${ops} 次` : '差值 <= 0，由其他正差值抵消'}，累计操作 = ${totalOps}`,
      message: '正差值累计即为实际需要的独立操作对次数',
      log: `odd pair #${i} (${a} -> ${b}) diff=${diff} ops=${ops}`,
      codeLine: lines.oddPairs,
    });
  }

  // Step 3: 偶数对齐
  for (let i = 0; i < evenNums.length; i++) {
    const a = evenNums[i];
    const b = evenTarget[i];
    const diff = a - b;
    const ops = diff > 0 ? diff / 2 : 0;
    totalOps += ops;

    pairs.push({
      type: 'even',
      idx: i,
      num: a,
      target: b,
      diff,
      ops,
    });

    steps.push({
      originalNums: [...nums],
      originalTarget: [...target],
      oddNums: [...oddNums],
      oddTarget: [...oddTarget],
      evenNums: [...evenNums],
      evenTarget: [...evenTarget],
      pairs: [...pairs],
      totalOps,
      decision: `偶数配对 #${i}: nums[${i}]=${a} ➔ target[${i}]=${b} (差值 ${diff >= 0 ? '+' : ''}${diff}) ➔ ${diff > 0 ? `贡献正向操作 ${ops} 次` : '差值 <= 0，由其他正差值抵消'}，累计操作 = ${totalOps}`,
      message: '正差值累计即为实际需要的独立操作对次数',
      log: `even pair #${i} (${a} -> ${b}) diff=${diff} ops=${ops}`,
      codeLine: lines.evenPairs,
    });
  }

  // Step 4: 收敛
  steps.push({
    originalNums: [...nums],
    originalTarget: [...target],
    oddNums: [...oddNums],
    oddTarget: [...oddTarget],
    evenNums: [...evenNums],
    evenTarget: [...evenTarget],
    pairs: [...pairs],
    totalOps,
    decision: `🎉 计算完毕！使数组完全相似的最少操作次数为 ${totalOps} 次`,
    message: '奇偶顺位贪心对齐达到全局最优',
    log: `done totalOps=${totalOps}`,
    codeLine: lines.done,
  });

  return steps;
}

export const minOperationsSimilarVisualizer = registerDeclarativeAlgorithm<MinOperationsSimilarStep>({
  id: 'minimum-operations-to-make-similar',
  name: '使数组相似的最少操作次数',
  category: 'greedy',
  icon: '🔄',
  difficulty: 3,
  levelOrder: 923,
  learningGoal: '掌握奇偶分类独立排序与排序不等式顺位对齐的正差值累加贪心法',
  problemHtml: GREEDY_092_PROBLEMS.minOperationsSimilar.html,
  analysisHtml: GREEDY_092_PROBLEMS.minOperationsSimilar.html,
  inputs: [
    {
      id: 'input-nums',
      label: '原数组 nums',
      type: 'text',
      defaultValue: '8, 12, 6',
      placeholder: '8, 12, 6',
    },
    {
      id: 'input-target',
      label: '目标数组 target',
      type: 'text',
      defaultValue: '2, 14, 10',
      placeholder: '2, 14, 10',
    },
  ],
  codeLanguages: MIN_OPERATIONS_SIMILAR_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const rawNums = String(inputs?.['input-nums'] || '8, 12, 6');
    const rawTarget = String(inputs?.['input-target'] || '2, 14, 10');
    const nums = rawNums.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const target = rawTarget.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildMinOperationsSimilarSteps(nums, target);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MinOperationsSimilarStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">奇数组: <b>${step.oddNums.length}</b> 对</span>
          <span style="color: #cbd5e1;">|</span>
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">偶数组: <b>${step.evenNums.length}</b> 对</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">最少操作次数:</span>
          <span style="color: #2563eb; font-weight: 800; font-size: 16px;">${step.totalOps} 次</span>
        </div>
      </div>
    `;

    // 中部配对看板
    const pairsBox = document.createElement('div');
    pairsBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

    if (step.pairs.length === 0) {
      pairsBox.innerHTML = '<div style="color: #94a3b8; font-size: 12px; font-style: italic; display: flex; align-items: center; justify-content: center; width: 100%;">等待奇偶配对计算...</div>';
    } else {
      step.pairs.forEach((p) => {
        const isOdd = p.type === 'odd';
        const card = document.createElement('div');
        card.style.cssText = `display: flex; flex-direction: column; gap: 6px; background: ${isOdd ? '#fdf4ff' : '#f0fdf4'}; border: 1.5px solid ${isOdd ? '#c084fc' : '#86efac'}; border-radius: 8px; padding: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
            <span style="font-weight: 700; font-size: 12px; color: #1e293b;">${isOdd ? '🟣 奇数对' : '🟢 偶数对'} #${p.idx}</span>
            <span style="font-size: 10px; font-weight: 700; color: ${p.diff > 0 ? '#ef4444' : '#64748b'};">差值: ${p.diff >= 0 ? `+${p.diff}` : p.diff}</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-around; margin: 4px 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700;">
            <span style="color: #1d4ed8; background: #eff6ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">${p.num}</span>
            <span style="color: #94a3b8;">➔</span>
            <span style="color: #059669; background: #ecfdf5; padding: 2px 8px; border-radius: 4px; border: 1px solid #a7f3d0;">${p.target}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; background: #ffffff; padding: 3px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-weight: 600;">操作次数:</span>
            <span style="font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">+${p.ops} 次</span>
          </div>
        `;
        pairsBox.appendChild(card);
      });
    }
    mainCard.appendChild(pairsBox);

    stageContainer.appendChild(mainCard);
  },
});
