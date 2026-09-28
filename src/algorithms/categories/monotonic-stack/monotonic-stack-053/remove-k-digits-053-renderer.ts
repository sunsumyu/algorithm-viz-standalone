import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  REMOVE_K_DIGITS_CODES,
  REMOVE_K_DIGITS_LINES,
} from './stack-053-stage-codes';
import {
  REMOVE_K_DIGITS_PROBLEM_HTML,
  REMOVE_K_DIGITS_EXPLANATION,
} from './stack-053-problem-content';
import { renderStringStackBoard, type Step053 } from './stack-053-shared';

export function parseRemoveKDigitsInput(input: string): { num: string; k: number } {
  const parts = input.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const kVal = parseInt(parts[1], 10);
    return {
      num: parts[0],
      k: isNaN(kVal) || kVal < 0 ? 0 : kVal,
    };
  } else if (parts.length === 1) {
    return { num: parts[0], k: 3 };
  }
  return { num: '1432219', k: 3 };
}

export function buildRemoveKDigits053Steps(inputStr: string): Step053[] {
  const { num, k: initialK } = parseRemoveKDigitsInput(inputStr);
  const steps: Step053[] = [];
  const n = num.length;
  let remainingK = Math.min(initialK, n);
  const targetK = initialK;

  if (n <= initialK) {
    steps.push({
      stage: '边界直接返回',
      title: '移除位数超过或等于字符总长',
      narrative: `输入长度 ${n} <= 移除位数 ${initialK}，所有数字均被剔除，直接返回 "0"。`,
      codeLine: REMOVE_K_DIGITS_LINES.entry,
      sandboxes: [
        {
          id: 'string-board',
          type: 'custom',
          title: '数字单调栈演化沙盘',
          customHtml: renderStringStackBoard(num.split(''), [], 0, initialK, targetK),
        },
      ],
      variables: { 原始串: num, 待删k: initialK, 结果: '0' },
    });
    return steps;
  }

  const stack: string[] = [];
  let removedCount = 0;

  // Step 0: 入口帧
  steps.push({
    stage: '算法就绪',
    title: '准备启动高位贪心单调递增栈',
    narrative: `输入数字串 "${num}"，需移除 ${targetK} 位。贪心法则：高位数字越小整体越小，遇到逆序峰值立即弹出。`,
    codeLine: REMOVE_K_DIGITS_LINES.entry,
    sandboxes: [
      {
        id: 'string-board',
        type: 'custom',
        title: '数字单调栈演化沙盘',
        customHtml: renderStringStackBoard(num.split(''), [], 0, 0, targetK),
      },
    ],
    variables: { 剩余待删位数: remainingK, 栈中数字: '空' },
  });

  for (let i = 0; i < n; i++) {
    const c = num[i];

    // 观察阶段
    steps.push({
      stage: '扫描字符',
      title: `观察数字 num[${i}] = '${c}'`,
      narrative: `当前考察第 ${i} 个字符 '${c}'。若栈顶数字大于 '${c}' 且剩余配额 k > 0，说明遇到了逆序峰值，需要弹出栈顶以使更高位变小。`,
      codeLine: REMOVE_K_DIGITS_LINES.forLoop,
      sandboxes: [
        {
          id: 'string-board',
          type: 'custom',
          title: '数字单调栈演化沙盘',
          customHtml: renderStringStackBoard(
            num.split(''),
            [...stack],
            i,
            removedCount,
            targetK
          ),
        },
      ],
      variables: {
        当前数字: c,
        栈顶数字: stack.length > 0 ? stack[stack.length - 1] : '无',
        剩余待删k: remainingK,
      },
    });

    // 贪心剔除逆序
    while (remainingK > 0 && stack.length > 0 && stack[stack.length - 1] > c) {
      const popped = stack.pop()!;
      remainingK--;
      removedCount++;

      steps.push({
        stage: '贪心弹出',
        title: `弹出栈顶高位峰值 '${popped}' > 当前 '${c}'`,
        narrative: `高位逆序：'${popped}' 比当前 '${c}' 更大，移除它能使得该位变小为更小数值。消耗 1 位移除配额，剩余配额 k = ${remainingK}。`,
        codeLine: REMOVE_K_DIGITS_LINES.whilePop,
        sandboxes: [
          {
            id: 'string-board',
            type: 'custom',
            title: '数字单调栈演化沙盘',
            customHtml: renderStringStackBoard(
              num.split(''),
              [...stack],
              i,
              removedCount,
              targetK
            ),
          },
        ],
        variables: {
          弹出的较大数字: popped,
          当前新数字: c,
          剩余待删配额: remainingK,
          累计已删: removedCount,
        },
      });
    }

    stack.push(c);
    steps.push({
      stage: '压入单调栈',
      title: `数字 '${c}' 压入单调递增栈`,
      narrative: `数字 '${c}' 保持了栈底到栈顶的单调递增趋势，安全入栈。`,
      codeLine: REMOVE_K_DIGITS_LINES.push,
      sandboxes: [
        {
          id: 'string-board',
          type: 'custom',
          title: '数字单调栈演化沙盘',
          customHtml: renderStringStackBoard(
            num.split(''),
            [...stack],
            i + 1,
            removedCount,
            targetK
          ),
        },
      ],
      variables: {
        当前栈中字符串: stack.join(''),
        剩余待删k: remainingK,
      },
    });
  }

  // 若 k 仍有剩余，从栈顶末尾截断
  while (remainingK > 0 && stack.length > 0) {
    const popped = stack.pop()!;
    remainingK--;
    removedCount++;
    steps.push({
      stage: '末尾截断',
      title: `配额仍有剩余，剔除栈顶末尾最大数 '${popped}'`,
      narrative: `遍历已结束但仍需移除 ${remainingK + 1} 位，此时栈为单调非递减状态，末尾数值最大，从末尾削减。`,
      codeLine: REMOVE_K_DIGITS_LINES.trimK,
      sandboxes: [
        {
          id: 'string-board',
          type: 'custom',
          title: '数字单调栈演化沙盘',
          customHtml: renderStringStackBoard(
            num.split(''),
            [...stack],
            n,
            removedCount,
            targetK
          ),
        },
      ],
      variables: { 削减数字: popped, 剩余k: remainingK },
    });
  }

  // 去除前导 0
  let idx = 0;
  while (idx < stack.length && stack[idx] === '0') {
    idx++;
  }
  const finalStr = stack.slice(idx).join('') || '0';

  // 终局帧
  steps.push({
    stage: '前导零剥离与收敛',
    title: `处理前导零完毕，最终最小数字为 "${finalStr}"`,
    narrative: `剥离了前导零后，最终收敛得到的最小数字串为 "${finalStr}"。`,
    codeLine: REMOVE_K_DIGITS_LINES.returnAns,
    sandboxes: [
      {
        id: 'string-board',
        type: 'custom',
        title: '数字单调栈演化沙盘',
        customHtml: renderStringStackBoard(
          num.split(''),
          stack.slice(idx),
          n,
          removedCount,
          targetK
        ),
      },
    ],
    variables: { 最终最小数值: finalStr, 共计剔除位数: removedCount },
  });

  return steps;
}

export const removeKDigits053Visualizer = registerDeclarativeAlgorithm<Step053>({
  id: 'remove-k-digits-053',
  name: '移掉 K 位数字 (Class 053 Code03)',
  category: 'monotonic-stack',
  difficulty: 'medium',
  aliases: ['remove-k-digits-402', '402', '移掉K位数字', 'class053-code03'],
  learningGoal:
    '掌握高位贪心结合单调递增栈的剔除算法，深刻理解高位逆序削减与前导零剥离精髓。',
  problemContent: {
    title: '移掉 K 位数字',
    source: 'LeetCode 402 / 算法通关课 Class 053 Code03',
    description: '移除非负整数字符串中的 k 位数字使剩余最小。',
    problemHtml: REMOVE_K_DIGITS_PROBLEM_HTML,
    analysisHtml: REMOVE_K_DIGITS_EXPLANATION,
  },
  codeLanguages: REMOVE_K_DIGITS_CODES,
  inputs: [
    {
      id: 'input',
      label: '输入数字与k (格式: num, k)',
      type: 'text',
      defaultValue: '1432219, 3',
      placeholder: '例如: 1432219, 3',
    },
  ],
  presets: [
    { label: '示例 1: 典型高位剔除 (1432219, 3)', values: { input: '1432219, 3' } },
    { label: '示例 2: 前导零剥离 (10200, 1)', values: { input: '10200, 1' } },
    { label: '示例 3: 单调递增尾部削减 (123456, 2)', values: { input: '123456, 2' } },
    { label: '示例 4: 全部删完 (10, 2)', values: { input: '10, 2' } },
  ],
  generateSteps: (inputs) => {
    const raw = typeof inputs?.input === 'string' ? inputs.input : '1432219, 3';
    return buildRemoveKDigits053Steps(raw);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = step.sandboxes[0]?.customHtml ?? '';
  },
});

