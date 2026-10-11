import {
  LONGEST_WPI_LINES,
} from './stack-053-stage-codes';
import { renderPrefixSpanBoard, type Step053 } from './stack-053-shared';

export function buildLongestWPISteps(inputStr: string): Step053[] {
  const hours = inputStr
    .split(/[\s,]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));

  const steps: Step053[] = [];
  const n = hours.length;

  if (n === 0) {
    steps.push({
      stage: '初始化',
      title: '空输入数组',
      narrative: '请输入有效的工作时长数组（例如: "9, 9, 6, 0, 6, 6, 9"）。',
      codeLine: LONGEST_WPI_LINES.entry,
      sandboxes: [
        {
          id: 'prefix-board',
          type: 'custom',
          title: '前缀和最长跨度沙盘',
          customHtml: renderPrefixSpanBoard([], [0], [], 0, null, 0),
        },
      ],
      variables: { 状态: '输入为空' },
    });
    return steps;
  }

  // 1. 计算前缀和 (+1 / -1)
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + (hours[i] > 8 ? 1 : -1);
  }

  // Step 0: 入口帧
  steps.push({
    stage: '前缀和预处理',
    title: '工作日大于8小时化为+1，否则化为-1，构建前缀和',
    narrative: `输入 ${n} 天工作时长。前缀和构建完成，问题转化为：寻找最大的 (j - i) 使得 prefix[j] - prefix[i] > 0。`,
    codeLine: LONGEST_WPI_LINES.calcPrefix,
    sandboxes: [
      {
        id: 'prefix-board',
        type: 'custom',
        title: '前缀和最长跨度沙盘',
        customHtml: renderPrefixSpanBoard(hours, prefix, [], -1, null, 0),
      },
    ],
    variables: { 天数: n, 初始最大跨度: 0 },
  });

  // 2. 构建严格单调递减前缀栈
  const stack: number[] = [];
  for (let i = 0; i <= n; i++) {
    if (stack.length === 0 || prefix[stack[stack.length - 1]] > prefix[i]) {
      stack.push(i);
      steps.push({
        stage: '构建左端点候选栈',
        title: `下标 ${i} (前缀和 ${prefix[i]}) 压入严格递减栈`,
        narrative: `当前前缀和 ${prefix[i]} 小于此前栈顶前缀和，具有成为最优左端点的潜力（越靠左、前缀和越小越能形成超长正区间）。`,
        codeLine: LONGEST_WPI_LINES.buildStack,
        sandboxes: [
          {
            id: 'prefix-board',
            type: 'custom',
            title: '前缀和最长跨度沙盘',
            customHtml: renderPrefixSpanBoard(hours, prefix, [...stack], i, null, 0),
          },
        ],
        variables: { 入栈下标: i, 当前前缀和: prefix[i], 栈大小: stack.length },
      });
    }
  }

  let maxLen = 0;

  // 3. 倒序贪心寻找最大跨度
  for (let j = n; j >= 0; j--) {
    steps.push({
      stage: '倒序扫描右端点',
      title: `考察右端点 j = ${j} (前缀和 prefix[${j}] = ${prefix[j]})`,
      narrative: `从最右端向左扫描。如果 prefix[${j}] 大于栈顶前缀和，则找到了一个满足表现良好（sum > 0）的区间。`,
      codeLine: LONGEST_WPI_LINES.reverseLoop,
      sandboxes: [
        {
          id: 'prefix-board',
          type: 'custom',
          title: '前缀和最长跨度沙盘',
          customHtml: renderPrefixSpanBoard(hours, prefix, [...stack], j, null, maxLen),
        },
      ],
      variables: {
        当前右端点j: j,
        右端点前缀和: prefix[j],
        当前最长天数: maxLen,
      },
    });

    while (stack.length > 0 && prefix[j] > prefix[stack[stack.length - 1]]) {
      const leftIdx = stack.pop()!;
      const currentSpan = j - leftIdx;
      if (currentSpan > maxLen) {
        maxLen = currentSpan;
      }

      steps.push({
        stage: '贪心结算最大跨度',
        title: `匹配到左端点 i = ${leftIdx}，区间跨度 = ${j} - ${leftIdx} = ${currentSpan} 天`,
        narrative: `prefix[${j}] (${prefix[j]}) > prefix[${leftIdx}] (${prefix[leftIdx]})，对应工作天区间 [${leftIdx}..${j - 1}] 劳累天数过半！该左端点已达到其历史最长跨度，弹出栈！`,
        codeLine: LONGEST_WPI_LINES.updateMaxLen,
        sandboxes: [
          {
            id: 'prefix-board',
            type: 'custom',
            title: '前缀和最长跨度沙盘',
            customHtml: renderPrefixSpanBoard(hours, prefix, [...stack], j, leftIdx, maxLen),
          },
        ],
        variables: {
          匹配左端点: leftIdx,
          当前跨度: currentSpan,
          刷新全局最长跨度: maxLen,
        },
      });
    }
  }

  // 终局帧
  steps.push({
    stage: '求解完成',
    title: `扫描完毕，表现良好的最长时间段为 ${maxLen} 天`,
    narrative: `倒序双指针结合单调栈在 O(N) 复杂度内求出了最长表现良好区间，最长跨度为 ${maxLen} 天。`,
    codeLine: LONGEST_WPI_LINES.returnAns,
    sandboxes: [
      {
        id: 'prefix-board',
        type: 'custom',
        title: '前缀和最长跨度沙盘',
        customHtml: renderPrefixSpanBoard(hours, prefix, [], 0, null, maxLen),
      },
    ],
    variables: { 最终最长天数: maxLen },
  });

  return steps;
}
