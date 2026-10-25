import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  BIG_FISH_CODES,
} from './stack-053-stage-codes';
import {
  BIG_FISH_EAT_PROBLEM_HTML,
  BIG_FISH_EAT_EXPLANATION,
} from './stack-053-problem-content';
import { type Step053 } from './stack-053-shared';
import {
  buildBigFishEatSteps,
  type FishStackItem,
} from './big-fish-eat-small-fish-053-step-compiler';

export {
  buildBigFishEatSteps,
  type FishStackItem,
};

export const bigFishEatSmallFish053Visualizer = registerDeclarativeAlgorithm<Step053>({
  id: 'big-fish-eat-small-fish-053',
  name: '大鱼吃小鱼 (Class 053 Code02)',
  category: 'monotonic-stack',
  difficulty: 'hard',
  aliases: ['big-fish-eat-small-fish', '大鱼吃小鱼', 'class053-code02'],
  hasDeductionTree: true,
  learningGoal:
    '掌握单调递减栈维护轮数转移动态规划思想，理解左侧大鱼吃右侧小鱼的轮数级联模型。',
  problemContent: {
    title: '大鱼吃小鱼问题',
    source: '牛客网经典大题 / 算法通关课 Class 053 Code02',
    description: '每轮左侧大鱼同时吃掉右侧相邻小鱼，利用单调栈与轮数转移求鱼群达到稳定所需轮数。',
    problemHtml: BIG_FISH_EAT_PROBLEM_HTML,
    analysisHtml: BIG_FISH_EAT_EXPLANATION,
  },
  codeLanguages: BIG_FISH_CODES,
  inputs: [
    {
      id: 'fishes',
      label: '鱼群体重数组',
      type: 'text',
      defaultValue: '6, 2, 3, 5, 1, 4',
      placeholder: '逗号分隔的各鱼体重',
    },
  ],
  presets: [
    { label: '示例 1: 典型递减递增 (3轮)', values: { fishes: '6, 2, 3, 5, 1, 4' } },
    { label: '示例 2: 严格递减相邻同时吃 (1轮)', values: { fishes: '5, 4, 3, 2, 1' } },
    { label: '示例 3: 严格递增全员存活 (0轮)', values: { fishes: '1, 2, 3, 4, 5' } },
    { label: '示例 4: 单峰深坑用例', values: { fishes: '8, 3, 4, 5, 2, 7' } },
  ],
  generateSteps: (inputs) => {
    const raw = typeof inputs?.fishes === 'string' ? inputs.fishes : '6, 2, 3, 5, 1, 4';
    return buildBigFishEatSteps(raw);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = step.sandboxes[0]?.customHtml ?? '';
  },
});
