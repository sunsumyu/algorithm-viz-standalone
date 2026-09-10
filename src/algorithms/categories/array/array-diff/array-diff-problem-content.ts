/**
 * 左神算法通关课 第 047 & 048 课 - 一维差分与二维差分/前缀和题目背景与理论
 */

export const ARRAY_DIFF_PROBLEMS = {
  diff1D: {
    title: '一维差分数组 (1D Difference Array / 航班预订统计)',
    source: 'LeetCode 1109 / 洛谷 P2367',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(n)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【差分原理】</h4>
        <p>若需要对序列的多个区间 <code>[L, R]</code> 频繁执行增减 <code>+val</code> 操作，朴素暴力单次区间修改为 <code>O(n)</code>。而利用<strong>差分数组 <code>diff[i] = arr[i] - arr[i-1]</code></strong>：</p>
        <pre style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-family: monospace;">
diff[L] += val;
if (R + 1 <= n) diff[R + 1] -= val;</pre>
        <p>单次区间更新仅需 <code>O(1)</code>！所有操作结束后，只需对差分数组进行一次前缀和扫描，即可在 <code>O(n)</code> 时间内还原出最终数组！</p>
      </div>
    `,
  },
  diff2D: {
    title: '二维差分与二维前缀和 (2D Difference Array & Prefix Sum)',
    source: 'LeetCode 2132 / 洛谷 P3397',
    timeComplexity: '单次更新 O(1)，还原 O(rows * cols)',
    spaceComplexity: 'O(rows * cols)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【二维容斥原理】</h4>
        <p>对子矩阵 <code>(x1, y1) ~ (x2, y2)</code> 统一增加 <code>val</code>：</p>
        <pre style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-family: monospace;">
diff[x1][y1]         += val;
diff[x2 + 1][y1]     -= val;
diff[x1][y2 + 1]     -= val;
diff[x2 + 1][y2 + 1] += val;</pre>
        <p>通过四个角点的增减平衡，实现 <code>O(1)</code> 范围修改；最终前缀和还原：<code>arr[i][j] = arr[i-1][j] + arr[i][j-1] - arr[i-1][j-1] + diff[i][j]</code>。</p>
      </div>
    `,
  },
};
