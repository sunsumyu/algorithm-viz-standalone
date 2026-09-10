/**
 * 大厂高频真题 07: 柱状图与矩阵最大矩形 (Maximal Rectangle & Histogram)
 * LeetCode 84 & 85 / 单调栈压轴神题
 * 矩阵压缩为直方图 + 单调栈 O(N*M) 求解最大矩形面积
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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
    codeLine: 4,
    statusBadge: { text: '就绪', type: 'info' }
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
      codeLine: 8,
      statusBadge: { text: `考察第 ${i} 行`, type: 'info' }
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
          codeLine: 19,
          statusBadge: isBest ? { text: `新纪录: ${area}`, type: 'success' } : { text: `面积: ${area}`, type: 'warning' }
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
        codeLine: 23,
        statusBadge: { text: `入栈 #${j}`, type: 'info' }
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
    codeLine: 25,
    statusBadge: { text: `最终面积: ${maxArea}`, type: 'success' }
  });

  return steps;
}

export function renderMaximalRectangleSandbox(step: MaximalRectStep): string {
  const maxH = Math.max(...step.heights, 1);
  const barsHtml = step.heights.map((h, j) => {
    const isCur = j === step.curCol;
    const inStack = step.stack.includes(j);
    const inRect = step.calculatedRect && j >= step.calculatedRect.left && j <= step.calculatedRect.right;

    let bg = '#ffffff';
    let border = '#cbd5e1';
    let textColor = '#475569';

    if (inRect) {
      bg = '#dcfce7';
      border = '#22c55e';
      textColor = '#15803d';
    } else if (inStack) {
      bg = '#e0e7ff';
      border = '#6366f1';
      textColor = '#3730a3';
    }

    if (isCur) {
      border = '2px solid #f59e0b';
    }

    const heightPct = Math.max(10, (h / maxH) * 100);

    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; width:36px; margin:0 3px;">
        <div style="width:100%; height:110px; display:flex; align-items:flex-end; justify-content:center;">
          <div style="width:28px; height:${heightPct}%; background:${bg}; border:2px solid ${border}; border-radius:6px 6px 0 0; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; color:${textColor};">
            ${h}
          </div>
        </div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">列#${j}</div>
        <div style="font-size:9px; height:12px; margin-top:1px;">
          ${inStack ? '<span style="color:#6366f1;">栈中</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 二维矩阵与压缩直方图看板 -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <!-- 矩阵图 -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
          <div style="font-weight:700; color:#0f172a; font-size:12px; margin-bottom:8px;">
            🔲 二维 01 矩阵 (当前考察第 #${step.rowIdx >= 0 ? step.rowIdx : 0} 行)
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
            ${step.matrix.map((row, r) => `
              <div style="display:flex; gap:4px;">
                ${row.map((val) => `
                  <div style="width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-weight:700; font-size:12px; font-family:monospace; background:${r === step.rowIdx ? (val === '1' ? '#dbeafe' : '#f1f5f9') : (val === '1' ? '#ffffff' : '#f8fafc')}; border:1px solid ${r === step.rowIdx ? '#3b82f6' : '#cbd5e1'}; color:${val === '1' ? '#1d4ed8' : '#94a3b8'};">
                    ${val}
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 当前直方图柱状图 -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
          <div style="font-weight:700; color:#0f172a; font-size:12px; margin-bottom:8px;">
            📊 逐行累加压缩直方图高度 (Heights)
          </div>
          <div style="display:flex; justify-content:center; align-items:flex-end;">
            ${barsHtml}
          </div>
        </div>
      </div>

      <!-- 运算看板 -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">单调栈深</div>
          <div style="font-size:16px; font-weight:800; color:#4338ca;">${step.stack.length} 个</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">结算柱高度 (h)</div>
          <div style="font-size:16px; font-weight:800; color:#d97706;">${step.calculatedRect ? step.calculatedRect.h : '-'}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">本次扩展面积</div>
          <div style="font-size:16px; font-weight:800; color:#0284c7;">${step.calculatedRect ? step.calculatedRect.area : '-'}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">全局最大全 1 面积</div>
          <div style="font-size:18px; font-weight:800; color:#15803d;">${step.maxArea}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '单调栈求直方图最大矩形法则',
        '向右遇到更矮柱子触发弹栈，当前弹出柱的高度 h 以其左边栈顶索引和当前触发索引为左右边界，宽度 w = right - left - 1，面积 = h * w！',
        step.decision,
        step.statusBadge
      )}
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
  inputs: [],
  generateSteps: () => {
    return generateMaximalRectangleSteps();
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderMaximalRectangleSandbox(step)}
      </div>
    `;
  },
});
