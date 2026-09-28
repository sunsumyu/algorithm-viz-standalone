import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  BIG_FISH_CODES,
  BIG_FISH_EAT_LINES,
} from './stack-053-stage-codes';
import {
  BIG_FISH_EAT_PROBLEM_HTML,
  BIG_FISH_EAT_EXPLANATION,
} from './stack-053-problem-content';
import { renderFishEatBoard, type FishNode, type Step053 } from './stack-053-shared';

interface FishStackItem {
  idx: number;
  val: number;
  turns: number;
}

export function buildBigFishEatSteps(inputStr: string): Step053[] {
  const arr = inputStr
    .split(/[\s,]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));

  const steps: Step053[] = [];
  const n = arr.length;

  if (n === 0) {
    steps.push({
      stage: '初始化',
      title: '空鱼群输入',
      narrative: '请输入有效的鱼群体重数组（如 "6, 2, 3, 5, 1, 4"）。',
      codeLine: BIG_FISH_EAT_LINES.entry,
      sandboxes: [
        {
          id: 'fish-board',
          type: 'custom',
          title: '鱼群吃鱼演化沙盘',
          customHtml: renderFishEatBoard([], [], 0, 0),
        },
      ],
      variables: { 状态: '输入为空', 淘汰轮数: 0 },
    });
    return steps;
  }

  const fishes: FishNode[] = arr.map((val, idx) => ({
    idx,
    val,
    turns: 0,
    status: 'alive',
  }));

  const stack: FishStackItem[] = [];
  let maxTurns = 0;

  // Step 0: 入口帧
  steps.push({
    stage: '算法就绪',
    title: '准备启动单调栈吃鱼轮数递推',
    narrative: `共载入 ${n} 条鱼。我们将维护底到顶单调递减栈，每条鱼记录其作为左边大鱼的盘中餐时被消化所需的轮数。`,
    codeLine: BIG_FISH_EAT_LINES.entry,
    sandboxes: [
      {
        id: 'fish-board',
        type: 'custom',
        title: '鱼群吃鱼演化沙盘',
        customHtml: renderFishEatBoard(fishes, [], 0, 0),
      },
    ],
    variables: { 当前考察鱼: '未开始', 栈深度: 0, 最大轮数: 0 },
  });

  for (let i = 0; i < n; i++) {
    const curVal = arr[i];
    let curTurns = 0;

    // 观察阶段
    steps.push({
      stage: '扫描鱼群',
      title: `考察鱼 [${i}] (体重: ${curVal})`,
      narrative: `准备考察第 ${i} 条鱼（体重 ${curVal}）。检查单调栈栈顶是否有体重 <= ${curVal} 的鱼被它阻挡。`,
      codeLine: BIG_FISH_EAT_LINES.forLoop,
      sandboxes: [
        {
          id: 'fish-board',
          type: 'custom',
          title: '鱼群吃鱼演化沙盘',
          customHtml: renderFishEatBoard(
            fishes,
            stack.map((s) => s.idx),
            i,
            maxTurns
          ),
        },
      ],
      variables: {
        当前鱼下标: i,
        当前体重: curVal,
        当前累计轮数: curTurns,
        全局最大轮数: maxTurns,
      },
    });

    // 弹出吞噬阶段
    while (stack.length > 0 && stack[stack.length - 1].val <= curVal) {
      const top = stack.pop()!;
      curTurns = Math.max(curTurns, top.turns);
      steps.push({
        stage: '单调栈弹出',
        title: `栈顶鱼 [${top.idx}] (体重: ${top.val}) 体重小于等于当前鱼，被吞噬阻断`,
        narrative: `鱼 [${top.idx}] 体重为 ${top.val} <= ${curVal}。它在第 ${top.turns} 轮被吞噬，当前鱼吃完它需要耗费同等轮数，更新当前所需轮数为 max(curTurns, ${top.turns}) = ${curTurns}。`,
        codeLine: BIG_FISH_EAT_LINES.whileEat,
        sandboxes: [
          {
            id: 'fish-board',
            type: 'custom',
            title: '鱼群吃鱼演化沙盘',
            customHtml: renderFishEatBoard(
              fishes,
              stack.map((s) => s.idx),
              i,
              maxTurns
            ),
          },
        ],
        variables: {
          弹出鱼: `[${top.idx}]: ${top.val}`,
          弹出鱼轮数: top.turns,
          更新后轮数: curTurns,
        },
      });
    }

    // 计算被左侧更大鱼吃掉的轮数
    if (stack.length > 0) {
      curTurns = curTurns + 1;
      fishes[i].turns = curTurns;
      fishes[i].status = 'eaten';
    } else {
      curTurns = 0;
      fishes[i].turns = 0;
      fishes[i].status = 'alive';
    }

    maxTurns = Math.max(maxTurns, curTurns);
    stack.push({ idx: i, val: curVal, turns: curTurns });

    steps.push({
      stage: '压栈收敛',
      title: `鱼 [${i}] 轮数定格为 ${curTurns} 并压入单调栈`,
      narrative:
        curTurns > 0
          ? `栈左侧存在更大鱼 [${stack[stack.length - 2].idx}] (体重: ${stack[stack.length - 2].val})，因此当前鱼将在第 ${curTurns} 轮被吃掉。`
          : `栈为空，说明当前鱼左侧没有比它更大的鱼，它是当前的领头巨鲨，永远存活！`,
      codeLine: BIG_FISH_EAT_LINES.push,
      sandboxes: [
        {
          id: 'fish-board',
          type: 'custom',
          title: '鱼群吃鱼演化沙盘',
          customHtml: renderFishEatBoard(
            fishes,
            stack.map((s) => s.idx),
            i + 1,
            maxTurns
          ),
        },
      ],
      variables: {
        鱼下标: i,
        体重: curVal,
        存活状态: fishes[i].status === 'alive' ? '永远存活' : `第 ${curTurns} 轮被吃`,
        全局最大轮数: maxTurns,
      },
    });
  }

  // 终局帧
  steps.push({
    stage: '结算完成',
    title: `所有鱼考察完毕，鱼群淘汰终止于第 ${maxTurns} 轮`,
    narrative: `鱼群动态吃鱼彻底完成，所有弱小鱼均已被完全消化。系统最终在第 ${maxTurns} 轮后达到动态平衡。`,
    codeLine: BIG_FISH_EAT_LINES.returnAns,
    sandboxes: [
      {
        id: 'fish-board',
        type: 'custom',
        title: '鱼群吃鱼演化沙盘',
        customHtml: renderFishEatBoard(
          fishes,
          stack.map((s) => s.idx),
          n,
          maxTurns
        ),
      },
    ],
    variables: { 最终耗费总轮数: maxTurns, 最终存活鱼数量: stack.length },
  });

  return steps;
}

export const bigFishEatSmallFish053Visualizer = registerDeclarativeAlgorithm<Step053>({
  id: 'big-fish-eat-small-fish-053',
  name: '大鱼吃小鱼 (Class 053 Code02)',
  category: 'monotonic-stack',
  difficulty: 'hard',
  aliases: ['big-fish-eat-small-fish', '大鱼吃小鱼', 'class053-code02'],
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

