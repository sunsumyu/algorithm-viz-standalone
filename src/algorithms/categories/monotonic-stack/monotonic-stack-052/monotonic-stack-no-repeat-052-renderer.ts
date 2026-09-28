/**
 * Class 052 Code01: 单调栈无重复值标准模板 (求解左右最近较小值)
 *
 * 核心原理：
 * 维持底到顶单调递增栈。遇到更小元素破坏单调性时，
 * 栈顶元素出栈结算：其左侧更小为栈中其正下方元素，右侧更小即为当前元素。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../../core/input-primitives';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  MONOTONIC_NO_REPEAT_CODES,
  MONOTONIC_NO_REPEAT_LINES,
} from './stack-052-stage-codes';
import {
  renderMonotonicStackBoard,
  SettledItem,
} from './stack-052-shared';

export interface MonotonicNoRepeatStep {
  arr: number[];
  stack: number[];
  curI: number;
  popped: number | null;
  settled: SettledItem[];
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics: Record<string, string | number>;
}

export function buildMonotonicNoRepeatSteps(arr: number[]): MonotonicNoRepeatStep[] {
  const steps: MonotonicNoRepeatStep[] = [];
  const lines = MONOTONIC_NO_REPEAT_LINES;
  const n = arr.length;

  if (n === 0) {
    steps.push({
      arr: [],
      stack: [],
      curI: 0,
      popped: null,
      settled: [],
      decision: '数组为空，直接返回空结果。',
      message: '输入规模 N=0，无需推演。',
      log: 'Array is empty',
      codeLine: lines.returnAns,
      metrics: { '规模 N': 0, '已结算': 0 },
    });
    return steps;
  }

  const stack: number[] = [];
  const settledMap = new Map<number, SettledItem>();

  const getSettledList = (): SettledItem[] => {
    return Array.from(settledMap.values()).sort((a, b) => a.idx - b.idx);
  };

  // Step 0: 入口
  steps.push({
    arr: [...arr],
    stack: [],
    curI: -1,
    popped: null,
    settled: [],
    decision: `主函数入口：开始为数组 [${arr.join(', ')}] 求解每个元素左右最近较小值。`,
    message: '初始化底到顶单调递增栈，用来存放数组下标。每个元素严格入栈一次、出栈一次。',
    log: `enter getNearLessNoRepeat: arr=[${arr.join(', ')}]`,
    codeLine: lines.entry,
    metrics: { '规模 N': n, '当前状态': '初始化', '栈深': 0, '已结算': 0 },
  });

  // 遍历阶段
  for (let i = 0; i < n; i++) {
    const curVal = arr[i];

    // 循环头比对
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: i,
      popped: null,
      settled: getSettledList(),
      decision: `遍历到下标 [${i}] (值=${curVal})：准备与栈顶比对。`,
      message: stack.length > 0
        ? `栈顶为 [${stack[stack.length - 1]}] (值=${arr[stack[stack.length - 1]]})。检查是否破坏单调递增性。`
        : '当前栈为空，无阻力，将直接入栈。',
      log: `check i=${i} val=${curVal}, stack top=${stack.length > 0 ? stack[stack.length - 1] : 'empty'}`,
      codeLine: lines.whileCheck,
      metrics: { '考察下标': `[${i}]`, '考察值': curVal, '栈顶值': stack.length > 0 ? arr[stack[stack.length - 1]] : '空', '已结算': settledMap.size },
    });

    // 破坏递增性，循环出栈结算
    while (stack.length > 0 && arr[stack[stack.length - 1]] > curVal) {
      const cur = stack.pop()!;
      const curPopVal = arr[cur];
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const right = i;

      const item: SettledItem = {
        idx: cur,
        val: curPopVal,
        left,
        right,
        detail: `出栈因遇到右侧更小 [${right}](${curVal})`,
      };
      settledMap.set(cur, item);

      steps.push({
        arr: [...arr],
        stack: [...stack],
        curI: i,
        popped: cur,
        settled: getSettledList(),
        decision: `🔥 弹出栈顶 [${cur}] (值=${curPopVal}) 结算！破坏者为当前 [${i}] (值=${curVal})。`,
        message: `下标 [${cur}] 结算完成：左侧更小为其正下方 ${left !== -1 ? `[${left}] (值=${arr[left]})` : '无 (-1)'}，右侧更小为当前 [${right}] (值=${curVal})！`,
        log: `pop idx ${cur} (val ${curPopVal}): left=${left}, right=${right}`,
        codeLine: lines.popResolve,
        metrics: { '结算下标': `[${cur}]`, '结算值': curPopVal, '左较小': left, '右较小': right, '已结算': settledMap.size },
      });
    }

    // 入栈
    stack.push(i);
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: i,
      popped: null,
      settled: getSettledList(),
      decision: `📥 将当前下标 [${i}] (值=${curVal}) 压入栈顶，维持底到顶单调递增。`,
      message: `当前栈内下标序列: [${stack.join(', ')}]，对应数值递增。`,
      log: `push idx ${i} (val ${curVal}) to stack`,
      codeLine: lines.push,
      metrics: { '刚入栈': `[${i}]`, '栈深': stack.length, '已结算': settledMap.size },
    });
  }

  // 清算阶段
  if (stack.length > 0) {
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: n,
      popped: null,
      settled: getSettledList(),
      decision: '数组全部扫描完毕，进入清算阶段！处理栈中剩余未破坏元素。',
      message: '栈中剩余元素满足单调递增，其右侧均没有更小值，右侧较小值统一记为 -1。',
      log: 'enter clear stack phase',
      codeLine: lines.clearStack,
      metrics: { '当前状态': '清算阶段', '剩余栈深': stack.length, '已结算': settledMap.size },
    });

    while (stack.length > 0) {
      const cur = stack.pop()!;
      const curPopVal = arr[cur];
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const right = -1;

      const item: SettledItem = {
        idx: cur,
        val: curPopVal,
        left,
        right,
        detail: '清算阶段出栈，右侧无更小',
      };
      settledMap.set(cur, item);

      steps.push({
        arr: [...arr],
        stack: [...stack],
        curI: n,
        popped: cur,
        settled: getSettledList(),
        decision: `🧹 清算弹出 [${cur}] (值=${curPopVal})：左侧更小为 ${left !== -1 ? `[${left}] (值=${arr[left]})` : '无 (-1)'}，右侧更小为 无 (-1)。`,
        message: `元素 [${cur}] 在后续数组中未被任何更小值破坏，安全清算出栈。`,
        log: `clear pop idx ${cur} (val ${curPopVal}): left=${left}, right=-1`,
        codeLine: lines.clearPop,
        metrics: { '结算下标': `[${cur}]`, '左较小': left, '右较小': -1, '剩余栈深': stack.length },
      });
    }
  }

  // 终结
  steps.push({
    arr: [...arr],
    stack: [],
    curI: n,
    popped: null,
    settled: getSettledList(),
    decision: '🎉 全量结算完成！所有元素左右最近较小值已全部确定。',
    message: `每个元素进栈一次、出栈一次，时间复杂度严格为 O(N)。`,
    log: 'all items settled successfully',
    codeLine: lines.returnAns,
    metrics: { '总规模': n, '已结算': n, '复杂度': 'O(N)' },
  });

  return steps;
}

export const monotonicStackNoRepeat052Visualizer = registerDeclarativeAlgorithm<MonotonicNoRepeatStep>({
  id: 'monotonic-stack-no-repeat-052',
  name: '单调栈无重复值标准模板 (Class 052 Code01)',
  category: 'monotonic-stack',
  aliases: ['monotonic-stack-no-repeat', 'class052-code01', 'luogu-p5788'],
  difficulty: 'medium',
  learningGoal: '掌握底到顶单调递增栈原理，理解破坏单调性时的出栈结算机制与清算阶段。',
  problemContent: STACK_052_PROBLEMS.monotonicStackNoRepeat052,
  codeLanguages: MONOTONIC_NO_REPEAT_CODES,
  inputs: [
    {
      id: 'arr',
      label: '输入数组',
      type: 'text',
      defaultValue: '3, 4, 1, 5, 2',
      placeholder: '逗号分隔的无重复整数',
    },
  ],
  presets: [
    { label: '示例 1: 经典乱序 [3,4,1,5,2]', values: { arr: '3, 4, 1, 5, 2' } },
    { label: '示例 2: 单调递增 [1,2,3,4,5]', values: { arr: '1, 2, 3, 4, 5' } },
    { label: '示例 3: 单调递减 [5,4,3,2,1]', values: { arr: '5, 4, 3, 2, 1' } },
    { label: '示例 4: 山峰与山谷 [4,7,2,8,1,6]', values: { arr: '4, 7, 2, 8, 1, 6' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseNumberList(inputs.arr, '3, 4, 1, 5, 2');
    return buildMonotonicNoRepeatSteps(raw.length ? raw : [3, 4, 1, 5, 2]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderMonotonicStackBoard(
      step.arr,
      step.stack,
      step.settled,
      step.curI,
      step.popped,
      {
        type: 'less',
        titleBadge: '无重复值标准单调递增栈',
        ruleText: '🔺 底到顶单调递增（遇小出栈结算）',
      }
    );
  },
});
