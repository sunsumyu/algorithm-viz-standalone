/**
 * LeetCode 84: 柱状图中最大的矩形 (Largest Rectangle in Histogram)
 * 领域知识与题解精讲配置声明
 */

export const LARGEST_RECTANGLE_HISTOGRAM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">LeetCode 84</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">Hard</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">柱状图中最大的矩形 (Largest Rectangle in Histogram)</h2>
    </div>
    <p style="margin: 0;">给定 <code style="color: #fde047; font-family: monospace;">n</code> 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1 。</p>
    <p style="margin: 0;">求在该柱状图中，能够勾勒出来的矩形的最大面积。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: heights = [2,1,5,6,2,3]</div>
      <div>输出: 10</div>
      <div>解释: 最大的矩形为图中红色区域，面积为 10 单位 (高度 5, 宽度 2)。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: heights = [2,4]</div>
      <div>输出: 4</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; heights.length &le; 10^5</div>
      <div>• 0 &le; heights[i] &le; 10^4</div>
    </div>
  </div>
`;

export const LARGEST_RECTANGLE_HISTOGRAM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 单调递增栈（栈头到栈底递减）：寻找左右两侧首个更矮的柱子
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 寻找左右首个更矮柱子</div>
        <p style="margin: 0; color: #94a3b8;">如果我们要以第 <code style="color: #7dd3fc; font-family: monospace;">mid</code> 根柱子的高度作为矩形的高，矩形能够向左、向右延伸的最大宽度，取决于<strong>左边第一个比它矮的柱子</strong>与<strong>右边第一个比它矮的柱子</strong>！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 为什么要在首尾加哨兵 0？</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>尾部加 0</strong>：若原数组单调递增（如 <code style="color: #7dd3fc; font-family: monospace;">[2, 4, 6, 8]</code>），所有元素只会一直入栈不会触发弹出计算。尾部加 0 可强制清空栈内全部元素进行面积结算。<br/>
        • <strong>头部加 0</strong>：若原数组单调递减（如 <code style="color: #7dd3fc; font-family: monospace;">[8, 6, 4, 2]</code>），第一个元素弹出后栈为空，无法取左边界。头部加 0 作为永不出栈的基底，避免栈空判空。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 计算公式</div>
        <p style="margin: 0; color: #94a3b8;">
        当 <code style="color: #f87171; font-family: monospace;">heights[i] &lt; heights[st.top()]</code> 时：<br/>
        • <code style="color: #fbbf24; font-family: monospace;">mid = st.pop()</code>；<br/>
        • <code style="color: #7dd3fc; font-family: monospace;">left = st.peek()</code> (左边更矮下标)；<br/>
        • <code style="color: #f87171; font-family: monospace;">right = i</code> (右边更矮下标)；<br/>
        • <code style="color: #34d399; font-family: monospace;">width = right - left - 1</code>；<br/>
        • <code style="color: #34d399; font-family: monospace;">area = heights[mid] * width</code>；<br/>
        • <code style="color: #34d399; font-family: monospace;">maxArea = Math.max(maxArea, area)</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const LARGEST_RECTANGLE_HISTOGRAM_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int largestRectangleArea(int[] heights) {',
    '    int[] newHeights = new int[heights.length + 2];',
    '    newHeights[0] = 0; // 头部哨兵',
    '    System.arraycopy(heights, 0, newHeights, 1, heights.length);',
    '    newHeights[newHeights.length - 1] = 0; // 尾部哨兵',
    '    Stack<Integer> stack = new Stack<>();',
    '    stack.push(0);',
    '    int maxArea = 0;',
    '    for (int i = 1; i < newHeights.length; i++) {',
    '        while (newHeights[i] < newHeights[stack.peek()]) {',
    '            int mid = stack.pop();',
    '            int left = stack.peek();',
    '            int right = i;',
    '            int w = right - left - 1;',
    '            int h = newHeights[mid];',
    '            maxArea = Math.max(maxArea, w * h);',
    '        }',
    '        stack.push(i);',
    '    }',
    '    return maxArea;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int largestRectangleArea(vector<int>& heights) {',
    '        vector<int> newHeights(heights.size() + 2, 0);',
    '        for (int i = 0; i < heights.size(); i++) newHeights[i + 1] = heights[i];',
    '        stack<int> st;',
    '        st.push(0);',
    '        int result = 0;',
    '        for (int i = 1; i < newHeights.size(); i++) {',
    '            while (newHeights[i] < newHeights[st.top()]) {',
    '                int mid = st.top();',
    '                st.pop();',
    '                int w = i - st.top() - 1;',
    '                int h = newHeights[mid];',
    '                result = max(result, w * h);',
    '            }',
    '            st.push(i);',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def largestRectangleArea(self, heights: List[int]) -> int:',
    '        new_heights = [0] + heights + [0]',
    '        stack = [0]',
    '        max_area = 0',
    '        for i in range(1, len(new_heights)):',
    '            while new_heights[i] < new_heights[stack[-1]]:',
    '                mid = stack.pop()',
    '                w = i - stack[-1] - 1',
    '                h = new_heights[mid]',
    '                max_area = max(max_area, w * h)',
    '            stack.append(i)',
    '        return max_area',
  ],
  javascript: [
    'var largestRectangleArea = function(heights) {',
    '    const newHeights = [0, ...heights, 0];',
    '    const stack = [0];',
    '    let maxArea = 0;',
    '    for (let i = 1; i < newHeights.length; i++) {',
    '        while (newHeights[i] < newHeights[stack[stack.length - 1]]) {',
    '            const mid = stack.pop();',
    '            const w = i - stack[stack.length - 1] - 1;',
    '            const h = newHeights[mid];',
    '            maxArea = Math.max(maxArea, w * h);',
    '        }',
    '        stack.push(i);',
    '    }',
    '    return maxArea;',
    '};',
  ],
};
