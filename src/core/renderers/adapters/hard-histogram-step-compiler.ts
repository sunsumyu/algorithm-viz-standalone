/**
 * 柱状图中最大的矩形 (LeetCode 84 / 单调递增栈)
 * Step Compiler: 首尾哨兵单调递增栈 O(N) 矩形面积推演编译器
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface HistogramStep extends StepBase {
  stepIndex?: number;
  heights: number[];
  currentIndex: number;
  stack: number[]; // 存储下标
  poppedIndex: number | null;
  rectHighlight?: { left: number; right: number; height: number; area: number };
  maxArea: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const HISTOGRAM_CODES = {
  java: `public class LargestRectangle {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length;
        // 首尾添加高度为 0 的哨兵
        int[] h = new int[n + 2];
        System.arraycopy(heights, 0, h, 1, n);

        int[] stack = new int[n + 2];
        int top = 0; // stack[0] = 0 (左哨兵)
        int maxArea = 0;

        for (int i = 1; i < h.length; i++) {
            while (top > 0 && h[i] < h[stack[top]]) {
                int height = h[stack[top--]]; // 弹出栈顶作为高
                int width = i - stack[top] - 1; // 左右更小柱子界定宽
                maxArea = Math.max(maxArea, height * width);
            }
            stack[++top] = i; // 当前柱子压栈
        }
        return maxArea;
    }
}`,
  cpp: `class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<int> h = {0};
        h.insert(h.end(), heights.begin(), heights.end());
        h.push_back(0); // 首尾哨兵

        vector<int> st = {0};
        int maxArea = 0;
        for (int i = 1; i < h.size(); ++i) {
            while (h[i] < h[st.back()]) {
                int height = h[st.back()];
                st.pop_back();
                int width = i - st.back() - 1;
                maxArea = max(maxArea, height * width);
            }
            st.push_back(i);
        }
        return maxArea;
    }
};`,
  python: `class Solution:
    def largestRectangleArea(self, heights: list[int]) -> int:
        h = [0] + heights + [0] # 首尾哨兵
        stack = [0]
        max_area = 0

        for i in range(1, len(h)):
            while h[i] < h[stack[-1]]:
                height = h[stack.pop()]
                width = i - stack[-1] - 1
                max_area = max(max_area, height * width)
            stack.append(i)

        return max_area`,
  typescript: `function largestRectangleArea(heights: number[]): number {
    const h = [0, ...heights, 0]; // 首尾哨兵
    const stack: number[] = [0];
    let maxArea = 0;

    for (let i = 1; i < h.length; i++) {
        while (h[i] < h[stack[stack.length - 1]]) {
            const height = h[stack.pop()!];
            const width = i - stack[stack.length - 1] - 1;
            maxArea = Math.max(maxArea, height * width);
        }
        stack.push(i);
    }
    return maxArea;
}`
};

export const HISTOGRAM_CODE_LINES = {
  entry: { java: 3, cpp: 4, python: 2, typescript: 1 },
  initSentinels: { java: 5, cpp: 6, python: 3, typescript: 2 },
  loop: { java: 11, cpp: 11, python: 7, typescript: 6 },
  whilePop: { java: 12, cpp: 12, python: 8, typescript: 7 },
  calcArea: { java: 14, cpp: 14, python: 11, typescript: 10 },
  push: { java: 17, cpp: 17, python: 12, typescript: 12 },
  returnAns: { java: 19, cpp: 19, python: 14, typescript: 14 },
};

export function generateHistogramSteps(inputHeights: number[]): HistogramStep[] {
  const steps: HistogramStep[] = [];
  const h = [0, ...inputHeights, 0];
  const stack: number[] = [0];
  let maxArea = 0;

  const lines = HISTOGRAM_CODE_LINES;

  // Step 0: 入口
  steps.push({
    heights: h,
    currentIndex: 0,
    stack: [0],
    poppedIndex: null,
    maxArea: 0,
    decision: '启动单调栈母题：首尾拼接高度为 0 的哨兵柱子',
    message: '首尾哨兵技巧：左哨兵防栈空越界，右哨兵在循环终结时强制弹空所有残留元素',
    log: `Init histogram with sentinels: [${h.join(', ')}]`,
    codeLine: lines.initSentinels,
    statusBadge: { text: '哨兵就绪', type: 'info' },
    metrics: {
      scanIdx: '#0 (h=0 哨兵)',
      popped: '无出栈',
      curRect: '等待结算',
      maxArea: 0,
    },
    ans: '0',
  });

  for (let i = 1; i < h.length; i++) {
    steps.push({
      heights: h,
      currentIndex: i,
      stack: [...stack],
      poppedIndex: null,
      maxArea: maxArea,
      decision: `扫描柱子 [${i}] (高度 = ${h[i]})，检验单调递增性`,
      message: `若当前高度 ${h[i]} < 栈顶高度 ${h[stack[stack.length - 1]]}，触发连续出栈结算`,
      log: `Examining i=${i}, h=${h[i]}, top=${stack[stack.length - 1]}`,
      codeLine: lines.loop,
      statusBadge: { text: '单调性比对', type: 'info' },
      metrics: {
        scanIdx: `#${i} (h=${h[i]})`,
        popped: '无出栈',
        curRect: '等待结算',
        maxArea: maxArea,
      },
      ans: String(maxArea),
    });

    while (stack.length > 1 && h[i] < h[stack[stack.length - 1]]) {
      const popped = stack.pop()!;
      const height = h[popped];
      const leftBound = stack[stack.length - 1];
      const width = i - leftBound - 1;
      const area = height * width;
      maxArea = Math.max(maxArea, area);

      steps.push({
        heights: h,
        currentIndex: i,
        stack: [...stack],
        poppedIndex: popped,
        rectHighlight: { left: leftBound + 1, right: i - 1, height, area },
        maxArea: maxArea,
        decision: `弹出栈顶柱 [${popped}] (高=${height})：左边界=[${leftBound}], 右边界=[${i}] ➔ 矩形宽=${width}, 面积=${area}`,
        message: `此柱子作为矩形高度的最大扩张区间已锁定！当前更新最大面积: ${maxArea}`,
        log: `Popped ${popped}: h=${height}, w=${width}, area=${area}, maxArea=${maxArea}`,
        codeLine: lines.calcArea,
        statusBadge: { text: `面积: ${area}`, type: 'success' },
        metrics: {
          scanIdx: `#${i} (h=${h[i]})`,
          popped: `#${popped} (h=${height})`,
          curRect: `${height}×${width}=${area}`,
          maxArea: maxArea,
        },
        ans: String(maxArea),
      });
    }

    stack.push(i);
    steps.push({
      heights: h,
      currentIndex: i,
      stack: [...stack],
      poppedIndex: null,
      maxArea: maxArea,
      decision: `柱子 [${i}] 压入单调栈，保持栈内高度严格单调递增`,
      message: `当前栈内柱子序列: [${stack.map(idx => `${idx}(h=${h[idx]})`).join(', ')}]`,
      log: `Push stack: index ${i}`,
      codeLine: lines.push,
      statusBadge: { text: '压入单调栈', type: 'info' },
      metrics: {
        scanIdx: `#${i} (h=${h[i]})`,
        popped: '无出栈',
        curRect: '等待结算',
        maxArea: maxArea,
      },
      ans: String(maxArea),
    });
  }

  // 终结
  steps.push({
    heights: h,
    currentIndex: h.length - 1,
    stack: [...stack],
    poppedIndex: null,
    maxArea: maxArea,
    decision: `🎉 算法执行完毕！全局最大矩形面积 = ${maxArea}`,
    message: '单调栈仅需单次 O(N) 扫描，每个柱子仅进栈出栈各一次',
    log: `Done. Final max area = ${maxArea}`,
    codeLine: lines.returnAns,
    statusBadge: { text: '求解成功', type: 'success' },
    metrics: {
      scanIdx: '扫描完成',
      popped: '出栈完成',
      curRect: `最终最大面积: ${maxArea}`,
      maxArea: maxArea,
    },
    ans: String(maxArea),
  });

  return steps;
}
