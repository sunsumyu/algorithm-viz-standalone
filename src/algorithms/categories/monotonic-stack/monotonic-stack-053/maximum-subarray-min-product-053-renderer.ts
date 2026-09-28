import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  MAX_SUBARRAY_MIN_PROD_CODES,
  MAX_SUBARRAY_MIN_PROD_LINES,
} from './stack-053-stage-codes';
import {
  MAX_SUBARRAY_MIN_PROD_PROBLEM_HTML,
  MAX_SUBARRAY_MIN_PROD_EXPLANATION,
} from './stack-053-problem-content';
import { renderMinProductBoard, type Step053 } from './stack-053-shared';

export function buildMaxSubarrayMinProductSteps(inputStr: string): Step053[] {
  const nums = inputStr
    .split(/[\s,]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));

  const steps: Step053[] = [];
  const n = nums.length;

  if (n === 0) {
    steps.push({
      stage: '初始化',
      title: '空输入数组',
      narrative: '请输入正整数数组（例如: "1, 2, 3, 2"）。',
      codeLine: MAX_SUBARRAY_MIN_PROD_LINES.entry,
      sandboxes: [
        {
          id: 'prod-board',
          type: 'custom',
          title: '最小乘积辐射沙盘',
          customHtml: renderMinProductBoard([], [], 0, null, null, null, 0, 0),
        },
      ],
      variables: { 状态: '输入为空' },
    });
    return steps;
  }

  // 1. 构建前缀和 (BigInt)
  const prefix: bigint[] = new Array(n + 1).fill(0n);
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + BigInt(nums[i]);
  }

  const stack: number[] = [];
  let maxProd = 0n;

  // Step 0: 入口帧
  steps.push({
    stage: '前缀和预处理',
    title: '构建前缀和数组并准备单调递增栈',
    narrative: `输入 ${n} 个正整数。利用前缀和可以在 O(1) 内获取任意区间元素和；利用单调递增栈可以在 O(N) 内确定每个元素作为最小值的最大左右辐射边界。`,
    codeLine: MAX_SUBARRAY_MIN_PROD_LINES.calcPrefix,
    sandboxes: [
      {
        id: 'prod-board',
        type: 'custom',
        title: '最小乘积辐射沙盘',
        customHtml: renderMinProductBoard(nums, [], 0, null, null, null, 0, 0),
      },
    ],
    variables: { 元素个数: n, 全局最大乘积: '0' },
  });

  for (let i = 0; i < n; i++) {
    const curVal = nums[i];

    steps.push({
      stage: '遍历元素',
      title: `考察柱子 nums[${i}] = ${curVal}`,
      narrative: `准备入栈下标 ${i} (数值 ${curVal})。若栈顶元素 >= ${curVal}，则栈顶元素向右辐射到此为止，弹出结算。`,
      codeLine: MAX_SUBARRAY_MIN_PROD_LINES.forLoop,
      sandboxes: [
        {
          id: 'prod-board',
          type: 'custom',
          title: '最小乘积辐射沙盘',
          customHtml: renderMinProductBoard(
            nums,
            [...stack],
            i,
            null,
            null,
            null,
            0,
            maxProd.toString()
          ),
        },
      ],
      variables: { 当前考察下标: i, 当前数值: curVal, 当前最大乘积: maxProd.toString() },
    });

    while (stack.length > 0 && nums[stack[stack.length - 1]] >= curVal) {
      const cur = stack.pop()!;
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const leftBound = left + 1;
      const rightBound = i - 1;

      const sum = prefix[i] - prefix[leftBound];
      const prod = sum * BigInt(nums[cur]);

      if (prod > maxProd) {
        maxProd = prod;
      }

      steps.push({
        stage: '弹出结算',
        title: `以 nums[${cur}] = ${nums[cur]} 为最小值，结算最大辐射区间 [${leftBound}..${rightBound}]`,
        narrative: `nums[${cur}] 的左侧最近更小值下标为 ${left}，右侧更小值下标为 ${i}。其最大辐射区间为 [${leftBound}..${rightBound}]，区间元素累加和为 ${sum}，乘积为 ${sum} × ${nums[cur]} = ${prod}。`,
        codeLine: MAX_SUBARRAY_MIN_PROD_LINES.whilePop,
        sandboxes: [
          {
            id: 'prod-board',
            type: 'custom',
            title: '最小乘积辐射沙盘',
            customHtml: renderMinProductBoard(
              nums,
              [...stack],
              i,
              cur,
              leftBound,
              rightBound,
              prod.toString(),
              maxProd.toString()
            ),
          },
        ],
        variables: {
          最小值基准: `nums[${cur}]=${nums[cur]}`,
          辐射左端点: leftBound,
          辐射右端点: rightBound,
          区间元素和: sum.toString(),
          当前乘积: prod.toString(),
          全局最大乘积: maxProd.toString(),
        },
      });
    }

    stack.push(i);
    steps.push({
      stage: '压入单调栈',
      title: `下标 ${i} (数值 ${curVal}) 压入单调递增栈`,
      narrative: `下标 ${i} 满足单调递增性质，成功入栈，等待后续更小元素触发结算。`,
      codeLine: MAX_SUBARRAY_MIN_PROD_LINES.push,
      sandboxes: [
        {
          id: 'prod-board',
          type: 'custom',
          title: '最小乘积辐射沙盘',
          customHtml: renderMinProductBoard(
            nums,
            [...stack],
            i + 1,
            null,
            null,
            null,
            0,
            maxProd.toString()
          ),
        },
      ],
      variables: { 入栈下标: i, 当前栈大小: stack.length },
    });
  }

  // 清算阶段
  while (stack.length > 0) {
    const cur = stack.pop()!;
    const left = stack.length > 0 ? stack[stack.length - 1] : -1;
    const leftBound = left + 1;
    const rightBound = n - 1;

    const sum = prefix[n] - prefix[leftBound];
    const prod = sum * BigInt(nums[cur]);

    if (prod > maxProd) {
      maxProd = prod;
    }

    steps.push({
      stage: '清算阶段',
      title: `栈中残留元素 nums[${cur}] = ${nums[cur]}，向右辐射至末尾 [${leftBound}..${rightBound}]`,
      narrative: `右侧已无更小元素，nums[${cur}] 作为最小值可以向右一直辐射到数组末尾下标 ${rightBound}。区间元素累加和为 ${sum}，乘积为 ${prod}。`,
      codeLine: MAX_SUBARRAY_MIN_PROD_LINES.clearPop,
      sandboxes: [
        {
          id: 'prod-board',
          type: 'custom',
          title: '最小乘积辐射沙盘',
          customHtml: renderMinProductBoard(
            nums,
            [...stack],
            n,
            cur,
            leftBound,
            rightBound,
            prod.toString(),
            maxProd.toString()
          ),
        },
      ],
      variables: {
        清算下标: cur,
        辐射左端: leftBound,
        辐射右端: rightBound,
        当前乘积: prod.toString(),
        全局最大乘积: maxProd.toString(),
      },
    });
  }

  const ans = Number(maxProd % 1000000007n);

  // 终局帧
  steps.push({
    stage: '计算完成',
    title: `全部结算完成，最大最小乘积对 10^9+7 取模后为 ${ans}`,
    narrative: `全局最大乘积真实值为 ${maxProd.toString()}，对 1000000007 取模后最终答案为 ${ans}。`,
    codeLine: MAX_SUBARRAY_MIN_PROD_LINES.returnAns,
    sandboxes: [
      {
        id: 'prod-board',
        type: 'custom',
        title: '最小乘积辐射沙盘',
        customHtml: renderMinProductBoard(
          nums,
          [],
          n,
          null,
          null,
          null,
          ans,
          maxProd.toString()
        ),
      },
    ],
    variables: { 真实最大乘积: maxProd.toString(), 模后返回值: ans },
  });

  return steps;
}

export const maximumSubarrayMinProduct053Visualizer = registerDeclarativeAlgorithm<Step053>({
  id: 'maximum-subarray-min-product-053',
  name: '子数组最小乘积的最大值 (Class 053 Code06)',
  category: 'monotonic-stack',
  difficulty: 'medium',
  aliases: ['maximum-subarray-min-product', '1856', '子数组最小乘积的最大值', 'class053-code06'],
  learningGoal:
    '掌握单调递增栈求解每个柱子作为最小值所能延展的最远辐射区间，配合前缀和 O(1) 提取区间和。',
  problemContent: {
    title: '子数组最小乘积的最大值',
    source: 'LeetCode 1856 / 算法通关课 Class 053 Code06',
    description: '寻找非空子数组中最小值乘以子数组和的最大值对 10^9+7 取模。',
    problemHtml: MAX_SUBARRAY_MIN_PROD_PROBLEM_HTML,
    analysisHtml: MAX_SUBARRAY_MIN_PROD_EXPLANATION,
  },
  codeLanguages: MAX_SUBARRAY_MIN_PROD_CODES,
  inputs: [
    {
      id: 'nums',
      label: '正整数数组',
      type: 'text',
      defaultValue: '1, 2, 3, 2',
      placeholder: '逗号分隔的正整数',
    },
  ],
  presets: [
    { label: '示例 1: 官方经典 1 (1, 2, 3, 2 ➔ 14)', values: { nums: '1, 2, 3, 2' } },
    { label: '示例 2: 官方经典 2 (2, 3, 3, 1, 2 ➔ 18)', values: { nums: '2, 3, 3, 1, 2' } },
    { label: '示例 3: 官方经典 3 (3, 1, 5, 6, 4, 2 ➔ 60)', values: { nums: '3, 1, 5, 6, 4, 2' } },
    { label: '示例 4: 严格单调递增 (1, 2, 3, 4, 5)', values: { nums: '1, 2, 3, 4, 5' } },
  ],
  generateSteps: (inputs) => {
    const raw = typeof inputs?.nums === 'string' ? inputs.nums : '1, 2, 3, 2';
    return buildMaxSubarrayMinProductSteps(raw);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = step.sandboxes[0]?.customHtml ?? '';
  },
});

