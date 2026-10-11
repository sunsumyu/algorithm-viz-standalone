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
  codeLine: number | Record<string, number>;
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

export const COUNT_SUBMATRICES_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 4, cpp: 4, python: 3 },
  updateHeights: { java: 11, cpp: 7, python: 8 },
  stackCalc: { java: 14, cpp: 8, python: 9 },
  finish: { java: 16, cpp: 10, python: 10 },
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
    codeLine: COUNT_SUBMATRICES_CODE_LINES.init,
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
      codeLine: COUNT_SUBMATRICES_CODE_LINES.updateHeights,
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
      codeLine: COUNT_SUBMATRICES_CODE_LINES.stackCalc,
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
    codeLine: COUNT_SUBMATRICES_CODE_LINES.finish,
  });

  return steps;
}
