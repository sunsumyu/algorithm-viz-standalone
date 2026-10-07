/**
 * 做菜顺序 (LeetCode 1402) - 声明式教学级沙盘渲染器
 * 核心贪心：后缀累加和与喜爱时间放大效应
 * Thin Domain Adapter (< 60 LOC)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_094_PROBLEMS } from './greedy-094-problem-content';
import { COOKING_PLAN_CODES } from './greedy-094-stage-codes';
import {
  DishInfo,
  CookingPlanStep,
  buildCookingPlanSteps,
  parseCookingPlanInputs,
} from './cooking-plan-step-compiler';
import { renderCookingPlanCanvas } from './cooking-plan-canvas-adapter';

export type { DishInfo, CookingPlanStep };
export { buildCookingPlanSteps, renderCookingPlanCanvas };

export const cookingPlanVisualizer = registerDeclarativeAlgorithm<CookingPlanStep>({
  id: 'cooking-plan',
  name: '做菜顺序 (Cooking Plan / Reducing Dishes)',
  category: 'greedy',
  icon: '🍳',
  difficulty: 3,
  levelOrder: 946,
  aliases: ['class094-code06', 'reducing-dishes-1402', 'leetcode-1402', 'reducing-dishes'],
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
    const sat = parseCookingPlanInputs(inputs);
    return buildCookingPlanSteps(sat);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CookingPlanStep) => {
    renderCookingPlanCanvas(stageContainer, step);
  },
});
