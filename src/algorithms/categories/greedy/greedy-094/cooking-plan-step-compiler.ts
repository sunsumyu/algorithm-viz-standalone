/**
 * 做菜顺序 (LeetCode 1402) - 步进推演编译器
 * 核心贪心：后缀累加和与喜爱时间放大效应
 */

import { COOKING_PLAN_LINES } from './greedy-094-stage-codes';
import { Greedy094Step } from './greedy-094-shared';

export interface DishInfo {
  idx: number;
  val: number;
  selected: boolean;
}

export interface CookingPlanStep extends Greedy094Step {
  line?: number;
  dishes: DishInfo[];
  curIdx: number;
  suffixSum: number;
  totalSum: number;
  stopped?: boolean;
}

export function parseCookingPlanInputs(inputs: Record<string, any>): number[] {
  const raw = String(inputs?.['input-sat'] || '-1, -8, 0, 5, -9');
  return raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
}

export function buildCookingPlanSteps(satisfaction: number[]): CookingPlanStep[] {
  const steps: CookingPlanStep[] = [];
  const lines = COOKING_PLAN_LINES;
  const n = satisfaction.length;

  // Step 0: 入口
  steps.push({
    line: lines.entry.java ?? 1,
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
    line: lines.sortSat.java ?? 2,
    dishes: dishList.map((d) => ({ ...d })),
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
        line: lines.addSuffix.java ?? 3,
        dishes: dishList.map((d) => ({ ...d })),
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
        line: lines.addSuffix.java ?? 3,
        dishes: dishList.map((d) => ({ ...d })),
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
    line: lines.done.java ?? 4,
    dishes: dishList.map((d) => ({ ...d })),
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
