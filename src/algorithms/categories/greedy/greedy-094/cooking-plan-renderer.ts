/**
 * 做菜顺序 (LeetCode 1402) - 声明式教学级沙盘渲染器
 * 核心贪心：后缀累加和与喜爱时间放大效应
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_094_PROBLEMS } from './greedy-094-problem-content';
import {
  COOKING_PLAN_CODES,
  COOKING_PLAN_LINES,
} from './greedy-094-stage-codes';
import {
  Greedy094Step,
  renderDecisionBalance,
} from './greedy-094-shared';

export interface DishInfo {
  idx: number;
  val: number;
  selected: boolean;
}

export interface CookingPlanStep extends Greedy094Step {
  dishes: DishInfo[];
  curIdx: number;
  suffixSum: number;
  totalSum: number;
  stopped?: boolean;
}

export function buildCookingPlanSteps(satisfaction: number[]): CookingPlanStep[] {
  const steps: CookingPlanStep[] = [];
  const lines = COOKING_PLAN_LINES;
  const n = satisfaction.length;

  // Step 0: 入口
  steps.push({
    dishes: satisfaction.map((v, i) => ({ idx: i, val: v, selected: false })),
    curIdx: -1,
    suffixSum: 0,
    totalSum: 0,
    decision: `主函数入口：收到 ${n} 道菜的满意度数组 satisfaction = [${satisfaction.join(', ')}]`,
    message: '每道菜的贡献 = 满意度 × 制作时间序号 (从 1 开始)；多选一道新菜，所有后续好菜的满意度均会被额外累加一次',
    log: `enter maxSatisfaction(satisfaction=[${satisfaction.join(',')}])`,
    codeLine: lines.entry,
  });

  // Step 1: 升序排序
  const sortedSat = [...satisfaction].sort((a, b) => a - b);
  const dishList: DishInfo[] = sortedSat.map((v, i) => ({
    idx: i,
    val: v,
    selected: false,
  }));

  steps.push({
    dishes: dishList.map(d => ({ ...d })),
    curIdx: -1,
    suffixSum: 0,
    totalSum: 0,
    decision: `排序完成：满意度按升序排序后为 [${sortedSat.join(', ')}]`,
    message: '越令人满意的菜应当越靠后做，使其时间乘数尽可能大',
    log: `sorted satisfaction: [${sortedSat.join(', ')}]`,
    codeLine: lines.sortSat,
  });

  // Step 2: 从右至左维护后缀和
  let total = 0;
  let suffixSum = 0;

  for (let i = n - 1; i >= 0; i--) {
    const val = sortedSat[i];
    const nextSuffix = suffixSum + val;

    if (nextSuffix <= 0) {
      steps.push({
        dishes: dishList.map(d => ({ ...d })),
        curIdx: i,
        suffixSum: nextSuffix,
        totalSum: total,
        stopped: true,
        decision: `⚠️ 考察满意度为 ${val} 的菜肴：累加后后缀和 suffixSum = ${nextSuffix} ≤ 0！纳入此菜会导致总满意度缩水，贪心止步！`,
        message: '后缀和变为非正，继续添加负数菜品只会拉低全局得分',
        log: `dish at ${i} val=${val}, suffix=${nextSuffix} <= 0, break`,
        codeLine: lines.addSuffix,
      });
      break;
    } else {
      suffixSum = nextSuffix;
      total += suffixSum;
      dishList[i].selected = true;

      steps.push({
        dishes: dishList.map(d => ({ ...d })),
        curIdx: i,
        suffixSum,
        totalSum: total,
        decision: `✨ 纳入满意度为 ${val} 的菜肴：当前已选菜肴集合新增增量 suffixSum = ${suffixSum} > 0 ➔ 累计总喜爱时间得分 total 提升至 ${total}`,
        message: `成功纳入第 ${n - i} 道菜，后缀和累计净贡献 +${suffixSum}`,
        log: `dish at ${i} val=${val}, suffix=${suffixSum}, total=${total}`,
        codeLine: lines.addSuffix,
      });
    }
  }

  // Step 3: 收敛完成
  steps.push({
    dishes: dishList.map(d => ({ ...d })),
    curIdx: -1,
    suffixSum,
    totalSum: total,
    decision: `🎉 演练结束：可获得的最大总喜爱时间得分为 ${total}`,
    message: '后缀累加和贪心策略巧妙将连乘加权转化为增量判断',
    log: `done total=${total}`,
    codeLine: lines.done,
  });

  return steps;
}

export const cookingPlanVisualizer = registerDeclarativeAlgorithm<CookingPlanStep>({
  id: 'cooking-plan',
  name: '做菜顺序 (Cooking Plan / Reducing Dishes)',
  category: 'greedy',
  icon: '🍳',
  difficulty: 3,
  levelOrder: 946,
  learningGoal: '掌握后缀和贪心累加机制与时间加权效应',
  problemHtml: GREEDY_094_PROBLEMS.cookingPlan.html,
  analysisHtml: GREEDY_094_PROBLEMS.cookingPlan.html,
  inputs: [
    {
      id: 'input-sat',
      label: '满意度 satisfaction',
      type: 'text',
      defaultValue: '-1, -8, 0, 5, -9',
      placeholder: '-1, -8, 0, 5, -9',
    },
  ],
  codeLanguages: COOKING_PLAN_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-sat'] || '-1, -8, 0, 5, -9');
    const sat = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildCookingPlanSteps(sat);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CookingPlanStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">当前后缀累加和 suffixSum:</span>
          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; font-weight: 800;">${step.suffixSum}</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">累计总喜爱时间:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.totalSum} 分</span>
        </div>
      </div>
    `;

    // 菜肴卡片列表
    const dishBox = document.createElement('div');
    dishBox.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-y: auto;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size: 12px; font-weight: 700; color: #475569;';
    title.textContent = '🍳 菜肴序列 (升序排列后由右至左扫描贪心纳入)';
    dishBox.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center;';

    step.dishes.forEach((d) => {
      const isCur = step.curIdx === d.idx;
      const isSelected = d.selected;

      let border = '#cbd5e1';
      let bg = '#f8fafc';
      let color = '#334155';

      if (isCur && step.stopped) {
        border = '#ef4444';
        bg = '#fee2e2';
        color = '#b91c1c';
      } else if (isCur) {
        border = '#3b82f6';
        bg = '#eff6ff';
        color = '#1d4ed8';
      } else if (isSelected) {
        border = '#10b981';
        bg = '#ecfdf5';
        color = '#047857';
      }

      const item = document.createElement('div');
      item.style.cssText = `min-width: 60px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 800; position: relative;`;

      item.innerHTML = `
        <span style="font-size: 16px; color: ${color};">${d.val >= 0 ? `+${d.val}` : d.val}</span>
        <span style="font-size: 10px; color: #94a3b8; margin-top: 2px;">菜品 #${d.idx}</span>
      `;

      if (isSelected) {
        const tag = document.createElement('span');
        tag.style.cssText = 'position: absolute; top: -10px; background: #10b981; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
        tag.textContent = '选中';
        item.appendChild(tag);
      } else if (isCur && step.stopped) {
        const tag = document.createElement('span');
        tag.style.cssText = 'position: absolute; top: -10px; background: #ef4444; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
        tag.textContent = '放弃';
        item.appendChild(tag);
      }

      grid.appendChild(item);
    });
    dishBox.appendChild(grid);
    mainCard.appendChild(dishBox);

    // 决策天平
    const balanceBox = document.createElement('div');
    renderDecisionBalance(balanceBox, {
      leftTitle: '后缀累加和 suffixSum > 0 时纳入',
      leftVal: '为总和带来正向净收益 (total += suffixSum)',
      rightTitle: '后缀累加和 suffixSum <= 0 时停止',
      rightVal: '负满意度不仅自身扣分，还会侵蚀前序收益',
      winner: 'left',
      reason: '由右向左后缀累加，每多做一道前序菜肴，所有后续菜品的时间权重均+1，当且仅当 suffixSum > 0 时带来总分增量',
    });
    mainCard.appendChild(balanceBox);

    stageContainer.appendChild(mainCard);
  },
});
