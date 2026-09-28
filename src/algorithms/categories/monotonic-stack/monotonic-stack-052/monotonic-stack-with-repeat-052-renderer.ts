/**
 * Class 052 Code02: 单调栈有重复值进阶模板 (链表压栈与批量清算)
 *
 * 核心原理：
 * 栈内每个位置存储一个列表 List<Integer>，用来存放数值相同的下标。
 * 相同值追加进当前栈顶列表；遇到更小值时，整个列表出栈批量结算！
 * 列表所有下标的右侧较小值统一为当前下标 i，左侧较小值为栈中正下方列表的最后一个下标。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../../core/input-primitives';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  MONOTONIC_WITH_REPEAT_CODES,
  MONOTONIC_WITH_REPEAT_LINES,
} from './stack-052-stage-codes';
import {
  renderMonotonicStackBoard,
  SettledItem,
} from './stack-052-shared';

export interface MonotonicWithRepeatStep {
  arr: number[];
  stack: number[][]; // 栈中每个槽位存放相同值的下标列表
  curI: number;
  popped: number[] | null;
  settled: SettledItem[];
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics: Record<string, string | number>;
}

export function buildMonotonicWithRepeatSteps(arr: number[]): MonotonicWithRepeatStep[] {
  const steps: MonotonicWithRepeatStep[] = [];
  const lines = MONOTONIC_WITH_REPEAT_LINES;
  const n = arr.length;

  if (n === 0) {
    steps.push({
      arr: [],
      stack: [],
      curI: 0,
      popped: null,
      settled: [],
      decision: '数组为空，直接返回。',
      message: '输入规模 N=0。',
      log: 'Array is empty',
      codeLine: lines.returnAns,
      metrics: { '规模 N': 0, '已结算': 0 },
    });
    return steps;
  }

  const stack: number[][] = [];
  const settledMap = new Map<number, SettledItem>();

  const getSettledList = (): SettledItem[] => {
    return Array.from(settledMap.values()).sort((a, b) => a.idx - b.idx);
  };

  const cloneStack = (): number[][] => {
    return stack.map((list) => [...list]);
  };

  // Step 0: 入口
  steps.push({
    arr: [...arr],
    stack: [],
    curI: -1,
    popped: null,
    settled: [],
    decision: `主函数入口：开始为含重复值的数组 [${arr.join(', ')}] 求解左右最近较小值。`,
    message: '栈内每个槽位维护一个下标列表 List，相同值合并在同一列表，共同进退。',
    log: `enter getNearLessWithRepeat: arr=[${arr.join(', ')}]`,
    codeLine: lines.entry,
    metrics: { '规模 N': n, '当前状态': '初始化', '栈深': 0, '已结算': 0 },
  });

  for (let i = 0; i < n; i++) {
    const curVal = arr[i];

    // 检查比对
    steps.push({
      arr: [...arr],
      stack: cloneStack(),
      curI: i,
      popped: null,
      settled: getSettledList(),
      decision: `遍历到下标 [${i}] (值=${curVal})：准备与栈顶列表比对。`,
      message: stack.length > 0
        ? `当前栈顶列表代表的值为 ${arr[stack[stack.length - 1][0]]}。比对当前值 ${curVal} 与栈顶值大小。`
        : '栈为空，当前元素直接生成单元素列表入栈。',
      log: `check i=${i} val=${curVal}`,
      codeLine: lines.whileCheck,
      metrics: { '考察下标': `[${i}]`, '考察值': curVal, '栈顶值': stack.length > 0 ? arr[stack[stack.length - 1][0]] : '空', '已结算': settledMap.size },
    });

    // 遇到更小值，弹出整个列表批量结算
    while (stack.length > 0 && arr[stack[stack.length - 1][0]] > curVal) {
      const popList = stack.pop()!;
      const popVal = arr[popList[0]];
      const left = stack.length > 0 ? stack[stack.length - 1][stack[stack.length - 1].length - 1] : -1;
      const right = i;

      for (const idx of popList) {
        settledMap.set(idx, {
          idx,
          val: popVal,
          left,
          right,
          detail: `相同值列表批量出栈，右侧更小为 [${right}](${curVal})`,
        });
      }

      steps.push({
        arr: [...arr],
        stack: cloneStack(),
        curI: i,
        popped: [...popList],
        settled: getSettledList(),
        decision: `🔥 弹出栈顶列表 [${popList.join(', ')}] (共同值=${popVal}) 批量结算！破坏者为当前 [${i}] (值=${curVal})。`,
        message: `列表内所有下标共 ${popList.length} 个：左侧最近较小值均为栈正下方列表末尾 ${left !== -1 ? `[${left}] (值=${arr[left]})` : '无 (-1)'}，右侧较小值均为当前 [${right}] (值=${curVal})！`,
        log: `batch pop list [${popList.join(', ')}]: left=${left}, right=${right}`,
        codeLine: lines.popResolveList,
        metrics: { '批量结算数': popList.length, '结算值': popVal, '左较小': left, '右较小': right, '已结算': settledMap.size },
      });
    }

    // 入栈或追加相同值
    if (stack.length > 0 && arr[stack[stack.length - 1][0]] === curVal) {
      stack[stack.length - 1].push(i);
      steps.push({
        arr: [...arr],
        stack: cloneStack(),
        curI: i,
        popped: null,
        settled: getSettledList(),
        decision: `🤝 下标 [${i}] 数值与栈顶相同 (${curVal})：直接追加到栈顶列表末尾！`,
        message: `当前栈顶列表更新为: [${stack[stack.length - 1].join(', ')}]，共享相同左右较小值判定。`,
        log: `append idx ${i} to stack top list`,
        codeLine: lines.pushOrAppend,
        metrics: { '相同值追加': `[${i}]`, '栈顶列表长度': stack[stack.length - 1].length, '已结算': settledMap.size },
      });
    } else {
      stack.push([i]);
      steps.push({
        arr: [...arr],
        stack: cloneStack(),
        curI: i,
        popped: null,
        settled: getSettledList(),
        decision: `📥 下标 [${i}] (值=${curVal}) 大于栈顶：新建单元素列表 [${i}] 压入栈顶。`,
        message: `栈深变为 ${stack.length}。单调递增性得以保持。`,
        log: `push new list [${i}] to stack`,
        codeLine: lines.pushOrAppend,
        metrics: { '新列表入栈': `[${i}]`, '栈深': stack.length, '已结算': settledMap.size },
      });
    }
  }

  // 清算阶段
  if (stack.length > 0) {
    steps.push({
      arr: [...arr],
      stack: cloneStack(),
      curI: n,
      popped: null,
      settled: getSettledList(),
      decision: '数组全部扫描完毕，进入清算阶段！批量清算栈内剩余列表。',
      message: '栈中剩余的所有列表右侧均无更小值，右侧统一记为 -1。',
      log: 'enter clear stack phase',
      codeLine: lines.clearStack,
      metrics: { '当前状态': '清算阶段', '剩余列表数': stack.length, '已结算': settledMap.size },
    });

    while (stack.length > 0) {
      const popList = stack.pop()!;
      const popVal = arr[popList[0]];
      const left = stack.length > 0 ? stack[stack.length - 1][stack[stack.length - 1].length - 1] : -1;
      const right = -1;

      for (const idx of popList) {
        settledMap.set(idx, {
          idx,
          val: popVal,
          left,
          right,
          detail: '清算阶段批量出栈，右侧无更小',
        });
      }

      steps.push({
        arr: [...arr],
        stack: cloneStack(),
        curI: n,
        popped: [...popList],
        settled: getSettledList(),
        decision: `🧹 清算弹出列表 [${popList.join(', ')}] (值=${popVal})：左侧更小为 ${left !== -1 ? `[${left}] (值=${arr[left]})` : '无 (-1)'}，右侧更小为 无 (-1)。`,
        message: `列表内 ${popList.length} 个元素全部完成结算。`,
        log: `clear pop list [${popList.join(', ')}]: left=${left}, right=-1`,
        codeLine: lines.clearPopList,
        metrics: { '批量结算数': popList.length, '左较小': left, '右较小': -1, '剩余栈深': stack.length },
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
    decision: '🎉 含重复值全量单调栈结算完毕！',
    message: '利用列表合并相同值，无论数组有多少重复元素，每个下标依然进出各一次，复杂度为严格的 O(N)。',
    log: 'all items with repeat settled successfully',
    codeLine: lines.returnAns,
    metrics: { '总规模': n, '已结算': n, '复杂度': 'O(N)' },
  });

  return steps;
}

export const monotonicStackWithRepeat052Visualizer = registerDeclarativeAlgorithm<MonotonicWithRepeatStep>({
  id: 'monotonic-stack-with-repeat-052',
  name: '单调栈有重复值进阶模板 (Class 052 Code02)',
  category: 'monotonic-stack',
  aliases: ['monotonic-stack-with-repeat', 'class052-code02'],
  difficulty: 'hard',
  learningGoal: '掌握重复元素单调栈的链表压入与批量清算技术，消除重复值引发的判断盲区。',
  problemContent: STACK_052_PROBLEMS.monotonicStackWithRepeat052,
  codeLanguages: MONOTONIC_WITH_REPEAT_CODES,
  inputs: [
    {
      id: 'arr',
      label: '输入数组(含重复值)',
      type: 'text',
      defaultValue: '3, 1, 3, 4, 3, 5, 3, 2, 2',
      placeholder: '逗号分隔的整数列表',
    },
  ],
  presets: [
    { label: '示例 1: 经典多重峰谷 [3,1,3,4,3,5,3,2,2]', values: { arr: '3, 1, 3, 4, 3, 5, 3, 2, 2' } },
    { label: '示例 2: 相邻重复波浪 [2,2,4,4,1,1,3,3]', values: { arr: '2, 2, 4, 4, 1, 1, 3, 3' } },
    { label: '示例 3: 全部相同 [5,5,5,5,5]', values: { arr: '5, 5, 5, 5, 5' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseNumberList(inputs.arr, '3, 1, 3, 4, 3, 5, 3, 2, 2');
    return buildMonotonicWithRepeatSteps(raw.length ? raw : [3, 1, 3, 4, 3, 5, 3, 2, 2]);
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
        titleBadge: '含重复值列表单调递增栈',
        ruleText: '🔺 相同值追加在列表末尾，遇更小值整表弹出结算',
      }
    );
  },
});
