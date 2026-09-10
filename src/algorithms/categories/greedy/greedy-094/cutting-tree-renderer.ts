/**
 * 砍树问题 (Cutting Tree) - 声明式教学级沙盘渲染器
 * 核心贪心：增长率升序邻项交换律 + 0-1背包动态规划
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_094_PROBLEMS } from './greedy-094-problem-content';
import {
  CUTTING_TREE_CODES,
  CUTTING_TREE_LINES,
} from './greedy-094-stage-codes';
import {
  Greedy094Step,
  renderDecisionBalance,
} from './greedy-094-shared';

export interface TreeInfo {
  id: number;
  weight: number;
  growth: number;
}

export interface CuttingTreeStep extends Greedy094Step {
  trees: TreeInfo[];
  m: number;
  dp: number[];
  curTreeIdx?: number;
  curJ?: number;
}

export function buildCuttingTreeSteps(
  treesData: [number, number][],
  m: number
): CuttingTreeStep[] {
  const steps: CuttingTreeStep[] = [];
  const lines = CUTTING_TREE_LINES;
  const n = treesData.length;

  const initialTrees: TreeInfo[] = treesData.map(([w, g], i) => ({
    id: i,
    weight: w,
    growth: g,
  }));

  // Step 0: 入口
  steps.push({
    trees: initialTrees.map(t => ({ ...t })),
    m,
    dp: new Array(m + 1).fill(0),
    decision: `主函数入口：共有 ${n} 棵树，一共可砍 ${m} 天（每天最多砍 1 棵），目标收获最大总木材量`,
    message: '每棵树具有初始重量 weight 与每日自然生长量 growth',
    log: `enter maxTreeWeight(n=${n}, m=${m})`,
    codeLine: lines.entry,
  });

  // Step 1: 增长率贪心排序
  const sortedTrees = [...initialTrees].sort((a, b) => a.growth - b.growth);

  steps.push({
    trees: sortedTrees.map(t => ({ ...t })),
    m,
    dp: new Array(m + 1).fill(0),
    decision: `贪心排序完成：按日增长率 growth 升序排列！由邻项交换证明：生长速度越快的树应该越晚砍`,
    message: '若选定某几棵树，越晚砍生长量越多的树，获得的复利增量越大',
    log: `sorted trees by growth: ${sortedTrees.map(t => t.growth).join(', ')}`,
    codeLine: lines.sortGrowth,
  });

  // Step 2: 0-1 背包 DP
  const dp = new Array(m + 1).fill(0);

  for (let i = 0; i < n; i++) {
    const t = sortedTrees[i];
    for (let j = m; j >= 1; j--) {
      const candidate = dp[j - 1] + t.weight + t.growth * (j - 1);
      const prevVal = dp[j];
      if (candidate > dp[j]) {
        dp[j] = candidate;
        steps.push({
          trees: sortedTrees.map(x => ({ ...x })),
          m,
          dp: [...dp],
          curTreeIdx: i,
          curJ: j,
          decision: `考察树 #${t.id}（w=${t.weight}, g=${t.growth}）在第 ${j} 天砍：收益 = dp[${j - 1}] + ${t.weight} + ${t.growth}×${j - 1} = ${candidate} > 原 dp[${j}]=${prevVal} ➔ 更新 dp[${j}] = ${candidate}`,
          message: `更新 dp[${j}] 为最优收益`,
          log: `tree #${t.id}, j=${j}, dp[${j}]=${candidate}`,
          codeLine: lines.dpKnapsack,
        });
      }
    }
  }

  // Step 3: 收敛完成
  steps.push({
    trees: sortedTrees.map(x => ({ ...x })),
    m,
    dp: [...dp],
    decision: `🎉 演练结束：砍 ${m} 棵树可获得的最大木材总量为 dp[${m}] = ${dp[m]}`,
    message: '排序确定砍伐先后顺序消除后效性，动态规划从容选出最优子集',
    log: `done maxWeight=${dp[m]}`,
    codeLine: lines.done,
  });

  return steps;
}

export const cuttingTreeVisualizer = registerDeclarativeAlgorithm<CuttingTreeStep>({
  id: 'cutting-tree',
  name: '砍树问题 (Cutting Tree)',
  category: 'greedy',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 945,
  learningGoal: '掌握增长率升序邻项交换律确定砍伐序，结合0-1背包DP收敛全局最优',
  problemHtml: GREEDY_094_PROBLEMS.cuttingTree.html,
  analysisHtml: GREEDY_094_PROBLEMS.cuttingTree.html,
  inputs: [
    {
      id: 'input-trees',
      label: '树木 (weight,growth 分号隔开)',
      type: 'text',
      defaultValue: '10,2; 5,5; 20,1',
      placeholder: '10,2; 5,5; 20,1',
    },
    {
      id: 'input-m',
      label: '砍伐天数 m',
      type: 'text',
      defaultValue: '2',
      placeholder: '2',
    },
  ],
  codeLanguages: CUTTING_TREE_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const rawTrees = String(inputs?.['input-trees'] || '10,2; 5,5; 20,1');
    const m = Math.max(1, parseInt(String(inputs?.['input-m'] || '2'), 10) || 1);
    const trees = rawTrees.split(';').map((s) => {
      const parts = s.trim().split(',').map((x) => parseInt(x.trim(), 10));
      return [parts[0] || 0, parts[1] || 0] as [number, number];
    });
    return buildCuttingTreeSteps(trees, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CuttingTreeStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">砍树总天数 m:</span>
          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; font-weight: 800;">${step.m} 天</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">当前 dp[${step.m}] 最大木材:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.dp[step.m]}</span>
        </div>
      </div>
    `;

    // DP 状态表格
    const dpCard = document.createElement('div');
    dpCard.style.cssText = 'display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

    const dpTitle = document.createElement('div');
    dpTitle.style.cssText = 'font-size: 12px; font-weight: 700; color: #475569;';
    dpTitle.textContent = '📈 背包 DP 状态 (dp[j] 表示前几棵树中挑 j 棵砍的最大收益)';
    dpCard.appendChild(dpTitle);

    const dpRow = document.createElement('div');
    dpRow.style.cssText = 'display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;';

    step.dp.forEach((val, j) => {
      const isTarget = step.curJ === j;
      const border = isTarget ? '#10b981' : '#e2e8f0';
      const bg = isTarget ? '#ecfdf5' : '#f8fafc';

      const cell = document.createElement('div');
      cell.style.cssText = `min-width: 60px; padding: 8px; border-radius: 6px; border: 1.5px solid ${border}; background: ${bg}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace;`;
      cell.innerHTML = `
        <span style="font-size: 10px; color: #64748b;">j = ${j}</span>
        <span style="font-size: 14px; font-weight: 800; color: #1e293b; margin-top: 2px;">${val}</span>
      `;
      dpRow.appendChild(cell);
    });
    dpCard.appendChild(dpRow);
    mainCard.appendChild(dpCard);

    // 树木排序列表
    const treeCard = document.createElement('div');
    treeCard.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-y: auto;';

    const treeTitle = document.createElement('div');
    treeTitle.style.cssText = 'font-size: 12px; font-weight: 700; color: #475569;';
    treeTitle.textContent = '🌲 树木序列 (按日增长率 growth 升序排列，慢生长的先砍，快生长的后砍)';
    treeCard.appendChild(treeTitle);

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px;';

    step.trees.forEach((t, idx) => {
      const isCur = step.curTreeIdx === idx;
      const border = isCur ? '#3b82f6' : '#e2e8f0';
      const bg = isCur ? '#eff6ff' : '#f8fafc';

      const item = document.createElement('div');
      item.style.cssText = `padding: 8px; border-radius: 6px; border: 1.5px solid ${border}; background: ${bg}; display: flex; flex-direction: column; gap: 2px; font-family: 'JetBrains Mono', monospace; font-size: 11px;`;
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #1e293b;">树 #${t.id}</span>
          ${isCur ? '<span style="background: #3b82f6; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px;">当前考虑</span>' : ''}
        </div>
        <div style="color: #64748b; font-size: 10px;">初始重量: ${t.weight}</div>
        <div style="font-weight: 700; color: #059669; font-size: 11px;">日增长率: +${t.growth}/天</div>
      `;
      grid.appendChild(item);
    });
    treeCard.appendChild(grid);
    mainCard.appendChild(treeCard);

    // 决策天平
    const balanceBox = document.createElement('div');
    renderDecisionBalance(balanceBox, {
      leftTitle: '增长率小的树先砍 (g1 <= g2)',
      leftVal: '让高增长率树多成长一天 (收获 g2 额外增量)',
      rightTitle: '增长率大的树先砍',
      rightVal: '少收获 g2 - g1 的木材增量',
      winner: 'left',
      reason: '邻项交换律证明：任意被选中的树集合，按生长率升序砍伐必严格优于降序砍伐',
    });
    mainCard.appendChild(balanceBox);

    stageContainer.appendChild(mainCard);
  },
});
