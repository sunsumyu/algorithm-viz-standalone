/**
 * 柱状图与矩阵最大矩形 (LeetCode 85 / 单调栈)
 * Step Compiler: 01 矩阵逐行压缩为直方图 + 单调栈 O(M*N) 矩形面积推演编译器
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface MaximalRectStep extends StepBase {
  matrix: string[][];
  rowIdx: number;
  heights: number[];
  stack: number[];
  curCol: number;
  poppedCol?: number;
  calculatedRect?: { left: number; right: number; h: number; area: number };
  maxArea: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const MAXIMAL_RECTANGLE_CODES = {
  java: `public class MaximalRectangle {
    public int maximalRectangle(char[][] matrix) {
        if (matrix.length == 0) return 0;
        int m = matrix.length, n = matrix[0].length;
        int[] heights = new int[n];
        int maxArea = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                heights[j] = matrix[i][j] == '1' ? heights[j] + 1 : 0;
            }
            maxArea = Math.max(maxArea, maxHistogram(heights));
        }
        return maxArea;
    }
    int maxHistogram(int[] heights) {
        int n = heights.length, maxArea = 0;
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i <= n; i++) {
            int curH = i == n ? 0 : heights[i];
            while (!stack.isEmpty() && curH < heights[stack.peek()]) {
                int h = heights[stack.pop()];
                int w = stack.isEmpty() ? i : (i - stack.peek() - 1);
                maxArea = Math.max(maxArea, h * w);
            }
            stack.push(i);
        }
        return maxArea;
    }
}`,
  cpp: `class Solution {
public:
    int maximalRectangle(vector<vector<char>>& matrix) {
        if (matrix.empty()) return 0;
        int m = matrix.size(), n = matrix[0].size();
        vector<int> heights(n, 0);
        int maxArea = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                heights[j] = matrix[i][j] == '1' ? heights[j] + 1 : 0;
            }
            maxArea = max(maxArea, maxHistogram(heights));
        }
        return maxArea;
    }
    int maxHistogram(vector<int>& heights) {
        int n = heights.size(), maxArea = 0;
        stack<int> st;
        for (int i = 0; i <= n; i++) {
            int curH = i == n ? 0 : heights[i];
            while (!st.empty() && curH < heights[st.top()]) {
                int h = heights[st.top()]; st.pop();
                int w = st.empty() ? i : (i - st.top() - 1);
                maxArea = max(maxArea, h * w);
            }
            st.push(i);
        }
        return maxArea;
    }
};`,
  python: `class Solution:
    def maximalRectangle(self, matrix: List[List[str]]) -> int:
        if not matrix or not matrix[0]: return 0
        m, n = len(matrix), len(matrix[0])
        heights = [0] * n
        max_area = 0

        for row in matrix:
            for j in range(n):
                heights[j] = heights[j] + 1 if row[j] == '1' else 0
            
            # 单调栈计算直方图
            stack = []
            for i in range(n + 1):
                cur_h = 0 if i == n else heights[i]
                while stack and cur_h < heights[stack[-1]]:
                    h = heights[stack.pop()]
                    w = i if not stack else (i - stack[-1] - 1)
                    max_area = max(max_area, h * w)
                stack.append(i)
        return max_area`,
  typescript: `export function maximalRectangle(matrix: string[][]): number {
  if (matrix.length === 0) return 0;
  const m = matrix.length, n = matrix[0].length;
  const heights: number[] = new Array(n).fill(0);
  let maxArea = 0;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      heights[j] = matrix[i][j] === '1' ? heights[j] + 1 : 0;
    }
    const stack: number[] = [];
    for (let j = 0; j <= n; j++) {
      const curH = j === n ? 0 : heights[j];
      while (stack.length > 0 && curH < heights[stack[stack.length - 1]]) {
        const h = heights[stack.pop()!];
        const w = stack.length === 0 ? j : (j - stack[stack.length - 1] - 1);
        maxArea = Math.max(maxArea, h * w);
      }
      stack.push(j);
    }
  }
  return maxArea;
}`
};

export const MAXIMAL_RECTANGLE_CODE_LINES = {
  init: { java: 4, cpp: 4, python: 3, typescript: 3 },
  rowUpdate: { java: 9, cpp: 9, python: 8, typescript: 8 },
  popCalc: { java: 20, cpp: 20, python: 15, typescript: 16 },
  push: { java: 24, cpp: 24, python: 18, typescript: 19 },
  finish: { java: 28, cpp: 28, python: 19, typescript: 22 },
};

export function generateMaximalRectangleSteps(
  matrix: string[][] = [
    ['1', '0', '1', '0', '0'],
    ['1', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '1'],
    ['1', '0', '0', '1', '0'],
  ]
): MaximalRectStep[] {
  const steps: MaximalRectStep[] = [];
  const m = matrix.length, n = matrix[0].length;
  const heights = new Array(n).fill(0);
  let maxArea = 0;

  steps.push({
    matrix,
    rowIdx: -1,
    heights: [...heights],
    stack: [],
    curCol: -1,
    maxArea: 0,
    decision: '初始化最大矩形求解器',
    message: `输入 ${m}x${n} 的 01 矩阵。算法将逐行压缩累加柱状图高度并调用单调栈求解。`,
    log: `Init maximal rectangle (${m}x${n})`,
    codeLine: MAXIMAL_RECTANGLE_CODE_LINES.init,
    statusBadge: { text: '就绪', type: 'info' },
    metrics: {
      stackDepth: '0 个',
      rectHeight: '-',
      rectArea: '-',
      maxArea: 0,
    },
    ans: '0',
  });

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      heights[j] = matrix[i][j] === '1' ? heights[j] + 1 : 0;
    }

    steps.push({
      matrix,
      rowIdx: i,
      heights: [...heights],
      stack: [],
      curCol: -1,
      maxArea,
      decision: `处理第 #${i} 行：直方图高度更新为 [${heights.join(', ')}]`,
      message: `当 matrix[${i}][j] == '1' 时高度累加，遇到 '0' 则柱状图在该列归零打断。`,
      log: `Row ${i} heights: [${heights.join(', ')}]`,
      codeLine: MAXIMAL_RECTANGLE_CODE_LINES.rowUpdate,
      statusBadge: { text: `考察第 ${i} 行`, type: 'info' },
      metrics: {
        stackDepth: '0 个',
        rectHeight: `考察行 ${i}`,
        rectArea: '-',
        maxArea,
      },
      ans: String(maxArea),
    });

    // 单调递增栈
    const stack: number[] = [];
    for (let j = 0; j <= n; j++) {
      const curH = j === n ? 0 : heights[j];

      while (stack.length > 0 && curH < heights[stack[stack.length - 1]]) {
        const popIdx = stack.pop()!;
        const h = heights[popIdx];
        const left = stack.length === 0 ? -1 : stack[stack.length - 1];
        const right = j;
        const w = right - left - 1;
        const area = h * w;

        const isBest = area > maxArea;
        if (isBest) maxArea = area;

        steps.push({
          matrix,
          rowIdx: i,
          heights: [...heights],
          stack: [...stack],
          curCol: j,
          poppedCol: popIdx,
          calculatedRect: { left: left + 1, right: right - 1, h, area },
          maxArea,
          decision: `单调栈弹栈结算柱子 #${popIdx}(高度=${h})：向左延展至 #${left + 1}，向右延展至 #${right - 1}，宽度=${w}，面积 = ${area}`,
          message: `当前柱子以高度 ${h} 向两边扩展的最大矩形面积为 ${area}。${isBest ? '🎉 刷新全局最大全 1 矩形面积！' : ''}`,
          log: `Pop #${popIdx} h=${h} w=${w} -> area=${area}`,
          codeLine: MAXIMAL_RECTANGLE_CODE_LINES.popCalc,
          statusBadge: isBest ? { text: `新纪录: ${area}`, type: 'success' } : { text: `面积: ${area}`, type: 'warning' },
          metrics: {
            stackDepth: `${stack.length} 个`,
            rectHeight: `${h} (宽=${w})`,
            rectArea: area,
            maxArea,
          },
          ans: String(maxArea),
        });
      }

      stack.push(j);
      steps.push({
        matrix,
        rowIdx: i,
        heights: [...heights],
        stack: [...stack],
        curCol: j,
        maxArea,
        decision: j < n ? `列 #${j}(高度=${curH}) 入单调栈` : '末尾虚拟 0 高度柱子触发清栈',
        message: `保持栈内对应柱子高度严格单调递增。`,
        log: `Push #${j} to stack`,
        codeLine: MAXIMAL_RECTANGLE_CODE_LINES.push,
        statusBadge: { text: `入栈 #${j}`, type: 'info' },
        metrics: {
          stackDepth: `${stack.length} 个`,
          rectHeight: curH,
          rectArea: '入栈比对',
          maxArea,
        },
        ans: String(maxArea),
      });
    }
  }

  steps.push({
    matrix,
    rowIdx: m - 1,
    heights: [...heights],
    stack: [],
    curCol: n,
    maxArea,
    decision: `全矩阵扫描完毕！全局最大矩形面积 = ${maxArea}`,
    message: `通过单调栈将二维搜索压缩为 O(M*N) 线性时间，最优解为 ${maxArea}。`,
    log: `Finished. maxArea = ${maxArea}`,
    codeLine: MAXIMAL_RECTANGLE_CODE_LINES.finish,
    statusBadge: { text: `最终面积: ${maxArea}`, type: 'success' },
    metrics: {
      stackDepth: '结算完成',
      rectHeight: '完成',
      rectArea: maxArea,
      maxArea,
    },
    ans: String(maxArea),
  });

  return steps;
}
