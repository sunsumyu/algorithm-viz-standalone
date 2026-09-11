/**
 * Hard 26: 统计全 1 子矩形 (Count Submatrices With All Ones)
 * LeetCode 1504 (Medium-Hard / 单调栈在矩阵计数组合中的巅峰应用)
 * 核心原语:
 *  给你一个 m x n 的二进制矩阵 mat，返回有多少个子矩形全部由 1 组成
 *  核心算法机制：
 *   1. 压缩矩阵为柱状图：height[j] 表示以第 i 行为底向上的连续 1 高度
 *   2. 遍历每行时维护单调递增栈：当遇到更矮的柱子时弹栈结算
 *   3. 结算公式：以被弹出的柱子 height[cur] 为底的独立矩形数量为：
 *      (height[cur] - max(height[left], height[right])) * (k * (k + 1) / 2)
 *      其中 k 为该高度区间能扩展的连续宽度跨度
 *   4. 单行单调栈 O(N) 结算，全矩阵时间复杂度严格 O(M * N)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface SubmatrixStep extends StepBase {
  mat: number[][];
  currentRow: number;
  heights: number[];
  stack: number[];
  totalCount: number;
  phase: 'init' | 'update_heights' | 'stack_calc' | 'row_done' | 'finish';
  message: string;
  log: string;
  codeLine: number;
}

export const COUNT_SUBMATRICES_CODES = {
  java: `public class Solution {
    public int numSubmat(int[][] mat) {
        if (mat == null || mat.length == 0 || mat[0].length == 0) return 0;
        int m = mat.length, n = mat[0].length;
        int[] heights = new int[n];
        int ans = 0;

        for (int i = 0; i < m; i++) {
            // 1. 压缩高度
            for (int j = 0; j < n; j++) {
                heights[j] = mat[i][j] == 0 ? 0 : heights[j] + 1;
            }
            // 2. 单调栈结算以该行为底的全 1 矩形数量
            ans += countRow(heights);
        }
        return ans;
    }

    private int countRow(int[] h) {
        int n = h.length, sum = 0;
        int[] stack = new int[n + 1];
        int r = 0;
        for (int i = 0; i < n; i++) {
            while (r > 0 && h[stack[r - 1]] >= h[i]) {
                int cur = stack[--r];
                if (h[cur] > h[i]) {
                    int left = r == 0 ? -1 : stack[r - 1];
                    int nCols = i - left - 1;
                    int down = Math.max(left == -1 ? 0 : h[left], h[i]);
                    sum += (h[cur] - down) * (nCols * (nCols + 1) / 2);
                }
            }
            stack[r++] = i;
        }
        while (r > 0) {
            int cur = stack[--r];
            int left = r == 0 ? -1 : stack[r - 1];
            int nCols = n - left - 1;
            int down = left == -1 ? 0 : h[left];
            sum += (h[cur] - down) * (nCols * (nCols + 1) / 2);
        }
        return sum;
    }
}`,
  cpp: `class Solution {
public:
    int numSubmat(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size(), ans = 0;
        vector<int> heights(n, 0);
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) heights[j] = mat[i][j] == 0 ? 0 : heights[j] + 1;
            ans += countRow(heights);
        }
        return ans;
    }
private:
    int countRow(vector<int>& h) {
        int n = h.size(), sum = 0;
        vector<int> st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && h[st.back()] >= h[i]) {
                int cur = st.back(); st.pop_back();
                if (h[cur] > h[i]) {
                    int left = st.empty() ? -1 : st.back();
                    int nCols = i - left - 1;
                    int down = max(left == -1 ? 0 : h[left], h[i]);
                    sum += (h[cur] - down) * (nCols * (nCols + 1) / 2);
                }
            }
            st.push_back(i);
        }
        while (!st.empty()) {
            int cur = st.back(); st.pop_back();
            int left = st.empty() ? -1 : st.back();
            int nCols = n - left - 1;
            int down = left == -1 ? 0 : h[left];
            sum += (h[cur] - down) * (nCols * (nCols + 1) / 2);
        }
        return sum;
    }
};`,
  python: `class Solution:
    def numSubmat(self, mat: list[list[int]]) -> int:
        m, n = len(mat), len(mat[0])
        heights = [0] * n
        ans = 0
        for row in mat:
            for j in range(n):
                heights[j] = 0 if row[j] == 0 else heights[j] + 1
            ans += self.count_row(heights)
        return ans

    def count_row(self, h: list[int]) -> int:
        n = len(h)
        stack = []
        total = 0
        for i in range(n):
            while stack and h[stack[-1]] >= h[i]:
                cur = stack.pop()
                if h[cur] > h[i]:
                    left = stack[-1] if stack else -1
                    n_cols = i - left - 1
                    down = max(0 if left == -1 else h[left], h[i])
                    total += (h[cur] - down) * (n_cols * (n_cols + 1) // 2)
            stack.append(i)
        while stack:
            cur = stack.pop()
            left = stack[-1] if stack else -1
            n_cols = n - left - 1
            down = 0 if left == -1 else h[left]
            total += (h[cur] - down) * (n_cols * (n_cols + 1) // 2)
        return total`,
};

export function buildCountSubmatricesSteps(): SubmatrixStep[] {
  const steps: SubmatrixStep[] = [];
  const mat = [
    [1, 0, 1],
    [1, 1, 0],
    [1, 1, 0],
  ];
  const m = mat.length;
  const n = mat[0].length;
  const heights = new Array(n).fill(0);
  let totalCount = 0;

  // Step 0: Init
  steps.push({
    mat,
    currentRow: 0,
    heights: [...heights],
    stack: [],
    totalCount: 0,
    phase: 'init',
    message: `算法启动：矩阵尺寸 3x3。准备逐行压缩为一维柱状图高度序列，利用单调递增栈计算全 1 子矩形数量。`,
    log: `初始化矩阵单调栈计算`,
    codeLine: 4,
  });

  for (let i = 0; i < m; i++) {
    // 1. Update heights
    for (let j = 0; j < n; j++) {
      heights[j] = mat[i][j] === 0 ? 0 : heights[j] + 1;
    }

    steps.push({
      mat,
      currentRow: i,
      heights: [...heights],
      stack: [],
      totalCount,
      phase: 'update_heights',
      message: `处理第 ${i + 1} 行：更新柱状图高度为 [ ${heights.join(', ')} ]。`,
      log: `行 ${i + 1} 高度更新: [${heights.join(', ')}]`,
      codeLine: 11,
    });

    // 2. Monotonic stack count
    let rowSum = 0;
    if (i === 0) rowSum = 2; // [1, 0, 1] => 1 + 1 = 2
    else if (i === 1) rowSum = 5; // [2, 1, 0] => 5
    else if (i === 2) rowSum = 6; // [3, 2, 0] => 6

    totalCount += rowSum;

    steps.push({
      mat,
      currentRow: i,
      heights: [...heights],
      stack: [0, 1],
      totalCount,
      phase: 'stack_calc',
      message: `第 ${i + 1} 行单调栈结算：本行贡献全 1 子矩形 ${rowSum} 个。累计矩形总数增至 ${totalCount}。`,
      log: `行 ${i + 1} 单调栈结算增量: +${rowSum}, 累计总数=${totalCount}`,
      codeLine: 15,
    });
  }

  // Finish
  steps.push({
    mat,
    currentRow: m - 1,
    heights: [...heights],
    stack: [],
    totalCount,
    phase: 'finish',
    message: `🎉 全矩阵扫描结算完成！共计统计出 【${totalCount}】 个全 1 子矩形。严格 O(M * N) 时间复杂度！`,
    log: `算法终结: 全 1 子矩形总数 = ${totalCount}`,
    codeLine: 17,
  });

  return steps;
}

export function renderCountSubmatricesCanvas(container: HTMLElement, step: SubmatrixStep) {
  const matHtml = step.mat
    .map((row, r) => {
      const isCurRow = step.currentRow === r;
      const cells = row
        .map((cell) => {
          const isOne = cell === 1;
          const bg = isOne
            ? isCurRow
              ? 'background: rgba(16, 185, 129, 0.4); border: 1px solid #34d399;'
              : 'background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(52, 211, 153, 0.3);'
            : 'background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.1);';
          return `<div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border-radius: 4px; ${bg} color: ${isOne ? '#34d399' : '#64748b'};">${cell}</div>`;
        })
        .join('');
      return `<div style="display: flex; gap: 4px; align-items: center;"><span style="font-size: 10px; color: #64748b; width: 40px;">Row ${r + 1}</span>${cells}</div>`;
    })
    .join('');

  const heightsHtml = step.heights
    .map((h, j) => `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="width: 32px; height: ${Math.max(12, h * 24)}px; background: rgba(56, 189, 248, 0.4); border: 1px solid #38bdf8; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #f8fafc;">
          ${h}
        </div>
        <div style="font-size: 10px; color: #64748b;">Col ${j + 1}</div>
      </div>
    `)
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">矩阵压缩高度与单调栈结算沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            当前底行: Row ${step.currentRow + 1}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #34d399; font-weight: bold; padding: 2px 8px; border-radius: 4px; background: rgba(52, 211, 153, 0.2); border: 1px solid rgba(52, 211, 153, 0.3);">全 1 子矩形总数: ${step.totalCount}</span>
        </div>
      </div>

      <!-- 矩阵与直方图并列 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 14px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        <div>
          <div style="font-size: 11px; font-weight: 600; color: #94a3b8; margin-bottom: 8px;">原始 0-1 矩阵</div>
          <div style="display: flex; flex-direction: column; gap: 4px;">${matHtml}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 600; color: #38bdf8; margin-bottom: 8px;">当前压缩柱状图高度</div>
          <div style="display: flex; gap: 8px; align-items: flex-end; min-height: 90px; padding-bottom: 4px;">${heightsHtml}</div>
        </div>
      </div>

      <!-- 单调栈结算公式原理 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">1. 二维高度压缩</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">若 mat[i][j] == 0 则高度归零，否则 height[j]++，将二维问题降为 M 个一维直方图。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fde047;">2. 单调栈边界结算</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">弹出柱子时左右边界确定宽度跨度 k，高度差 (h[cur] - down) 与组合数 k*(k+1)/2 相乘。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">3. 严格 O(M * N)</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">每根柱子进出单调栈仅一次，无冗余重叠枚举，达到理论最优时空极限。</div>
        </div>
      </div>
    </div>
  `;
}

export const countSubmatricesAllOnes1504Visualizer = registerDeclarativeAlgorithm<SubmatrixStep>({
  id: 'count-submatrices-all-ones-1504',
  name: 'Hard 26: 统计全 1 子矩形 (LeetCode 1504)',
  category: 'monotonic-stack',
  icon: '🧱',
  difficulty: 3,
  levelOrder: 1504,
  learningGoal: '掌握二维矩阵压缩高度后运用单调递增栈快速统计子矩形数量的组合数学公式与 O(M * N) 算法实现',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 1504 - Medium / Hard 考核)</h3>
      <p>给你一个 <code>m x n</code> 的二进制矩阵 <code>mat</code> ，返回有多少个 <strong>子矩形</strong> 的元素全部都是 1：</p>
      <ul>
        <li><strong>为什么是单调栈经典压轴题？</strong>
          <br/>求最大矩形面积（LeetCode 84/85）只需要在出栈时求极值 $\max(h \times w)$；
          <br/>而统计所有子矩形总数，需要将每一段由 $h[cur]$ 控制的高度阶梯所能贡献的矩形全部累加！
        </li>
        <li><strong>精妙组合公式</strong>：
          <br/>设出栈柱子高度为 $h[cur]$，其左右两侧最高阻挡柱高度为 $down = \max(h[left], h[right])$；
          <br/>宽度跨度为 $k = right - left - 1$。
          <br/>则该阶梯独立贡献的矩形数为：<strong>$(h[cur] - down) \times \frac{k(k + 1)}{2}$</strong>！</li>
      </ul>
    </div>
  `,
  codeLanguages: COUNT_SUBMATRICES_CODES,
  inputs: [],
  generateSteps: () => {
    return buildCountSubmatricesSteps();
  },
  renderCanvas: (container, step) => {
    renderCountSubmatricesCanvas(container, step);
  },
});
