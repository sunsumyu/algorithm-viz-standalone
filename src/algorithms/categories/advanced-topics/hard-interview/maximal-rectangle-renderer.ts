/**
 * 大厂高频真题 07: 柱状图与矩阵最大矩形 (Maximal Rectangle & Histogram)
 * LeetCode 84 & 85 / 单调栈压轴神题
 * 矩阵压缩为直方图 + 单调栈 O(N*M) 求解最大矩形面积
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

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

export function renderMaximalRectangleSandbox(step: MaximalRectStep): string {
  const maxH = Math.max(...step.heights, 1);
  const barsHtml = step.heights.map((h, j) => {
    const isCur = j === step.curCol;
    const inStack = step.stack.includes(j);
    const inRect = step.calculatedRect && j >= step.calculatedRect.left && j <= step.calculatedRect.right;

    let bg = 'rgba(255, 255, 255, 0.04)';
    let border = 'rgba(255, 255, 255, 0.1)';
    let textColor = 'var(--text-muted, #94a3b8)';

    if (inRect) {
      bg = 'rgba(34, 197, 94, 0.25)';
      border = '#22c55e';
      textColor = '#4ade80';
    } else if (inStack) {
      bg = 'rgba(99, 102, 241, 0.25)';
      border = '#6366f1';
      textColor = '#a5b4fc';
    }

    if (isCur) {
      border = '2px solid #f59e0b';
    }

    const heightPct = Math.max(10, (h / maxH) * 100);

    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; width:38px; margin:0 4px;">
        <div style="width:100%; height:130px; display:flex; align-items:flex-end; justify-content:center;">
          <div style="
            width:30px; height:${heightPct}%; background:${bg}; border:2px solid ${border};
            border-radius:6px 6px 0 0; display:flex; align-items:center; justify-content:center;
            font-weight:800; font-size:14px; color:${textColor}; transition:all 0.2s ease;
          ">
            ${h}
          </div>
        </div>
        <div style="font-size:11px; color:var(--text-muted, #94a3b8); margin-top:4px; font-weight:600;">列#${j}</div>
        <div style="font-size:10px; height:14px; margin-top:1px;">
          ${inStack ? '<span style="color:#818cf8; font-weight:700;">栈中</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:16px; width:100%; height:100%;">
      <!-- 二维矩阵与压缩直方图双并排容器 -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; flex:1;">
        <!-- 矩阵图 -->
        <div style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(255, 255, 255, 0.08); border-radius:8px; padding:16px; display:flex; flex-direction:column;">
          <div style="font-weight:700; color:var(--text-color, #f1f5f9); font-size:13px; margin-bottom:12px;">
            🔲 二维 01 矩阵 (当前考察行: #${step.rowIdx >= 0 ? step.rowIdx : 0})
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; align-items:center; justify-content:center; flex:1;">
            ${step.matrix.map((row, r) => `
              <div style="display:flex; gap:6px;">
                ${row.map((val) => {
                  const isCurRow = r === step.rowIdx;
                  return `
                    <div style="
                      width:32px; height:32px; display:flex; align-items:center; justify-content:center;
                      border-radius:6px; font-weight:800; font-size:14px; font-family:monospace;
                      background:${isCurRow ? (val === '1' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.03)') : (val === '1' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)')};
                      border:1px solid ${isCurRow ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'};
                      color:${val === '1' ? '#38bdf8' : 'var(--text-muted, #64748b)'};
                      box-shadow:${isCurRow && val === '1' ? '0 0 8px rgba(56, 189, 248, 0.3)' : 'none'};
                    ">
                      ${val}
                    </div>
                  `;
                }).join('')}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 当前直方图柱状图 -->
        <div style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(255, 255, 255, 0.08); border-radius:8px; padding:16px; display:flex; flex-direction:column;">
          <div style="font-weight:700; color:var(--text-color, #f1f5f9); font-size:13px; margin-bottom:12px;">
            📊 逐行压缩直方图高度 (Heights)
          </div>
          <div style="display:flex; justify-content:center; align-items:flex-end; flex:1; padding-bottom:8px;">
            ${barsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}

export const maximalRectangleVisualizer = registerDeclarativeAlgorithm<MaximalRectStep>({
  id: 'maximal-rectangle',
  name: '大厂高频真题: 柱状图与矩阵最大矩形 (Maximal Rectangle)',
  category: 'monotonic-stack',
  icon: '📊',
  difficulty: 3,
  levelOrder: 85,
  learningGoal: '掌握二维矩阵压缩为一维直方图高度，配合单调递增栈在 O(M*N) 极速求出最大全 1 矩形',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 84 & 85)</h3>
      <p>给定一个仅包含 <code>0</code> 和 <code>1</code> 的二维二进制矩阵，找出只包含 <code>1</code> 的最大矩形，并返回其面积。</p>
      <p><strong>降维打法：</strong>以每一行为地基，向上统计连续 <code>1</code> 的高度生成一维直方图，对每行直方图运用单调递增栈在 $O(N)$ 时间求出当前最大矩形，整体复杂度 $O(M \times N)$！</p>
    </div>
  `,
  codeLanguages: MAXIMAL_RECTANGLE_CODES,
  metrics: [
    { id: 'stackDepth', label: '单调栈深', color: '#6366f1' },
    { id: 'rectHeight', label: '结算柱高度', color: '#f59e0b' },
    { id: 'rectArea', label: '当前扩展面积', color: '#38bdf8' },
    { id: 'maxArea', label: '最大全 1 面积', color: '#10b981' },
  ],
  inputs: [],
  generateSteps: () => {
    return generateMaximalRectangleSteps();
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderMaximalRectangleSandbox(step);
  },
});
