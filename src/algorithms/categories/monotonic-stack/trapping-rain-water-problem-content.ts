/**
 * LeetCode 42: 接雨水 (Trapping Rain Water)
 * 领域知识与题解精讲配置声明
 */

export const TRAPPING_RAIN_WATER_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">LeetCode 42</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">Hard</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">接雨水 (Trapping Rain Water)</h2>
    </div>
    <p style="margin: 0;">给定 <code style="color: #fde047; font-family: monospace;">n</code> 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: height = [0,1,0,2,1,0,1,3,2,1,2,1]</div>
      <div>输出: 6</div>
      <div>解释: 上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水（蓝色部分）。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: height = [4,2,0,3,2,5]</div>
      <div>输出: 9</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• n == height.length</div>
      <div>• 1 &le; n &le; 2 * 10^4</div>
      <div>• 0 &le; height[i] &le; 10^5</div>
    </div>
  </div>
`;

export const TRAPPING_RAIN_WATER_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 单调栈解法：按行横向结算凹槽，凹槽底部出栈算面积
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 单调栈单调性选择</div>
        <p style="margin: 0; color: #94a3b8;">单调栈维护<strong>从栈底到栈顶单调递减</strong>（栈顶最小）。<br/>
        因为只有出现一个高于栈顶的柱子时，才会形成「左高 - 中低 - 右高」的<strong>凹槽</strong>！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 凹槽三元素解构</div>
        <p style="margin: 0; color: #94a3b8;">
        当 <code style="color: #f87171; font-family: monospace;">height[i] &gt; height[st.top()]</code> 时：<br/>
        • <strong>凹槽底（中）</strong>：<code style="color: #fbbf24; font-family: monospace;">mid = st.pop()</code>；<br/>
        • 若此时栈不为空，<strong>左边界（左壁）</strong>为新的栈顶 <code style="color: #7dd3fc; font-family: monospace;">left = st.peek()</code>；<br/>
        • <strong>右边界（右壁）</strong>为当前遍历到的柱子 <code style="color: #f87171; font-family: monospace;">right = i</code>。<br/>
        • 凹槽高度：<code style="color: #34d399; font-family: monospace;">h = Math.min(height[left], height[right]) - height[mid]</code>；<br/>
        • 凹槽宽度：<code style="color: #34d399; font-family: monospace;">w = right - left - 1</code>；<br/>
        • 本层雨水量：<code style="color: #34d399; font-family: monospace;">volume = h * w</code>！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 横向按层结算的精妙之处</div>
        <p style="margin: 0; color: #94a3b8;">相比双指针按列纵向累加，单调栈是<strong>自底向上按水平层横向切片累加</strong>。每个凹槽层计算后，底部就被填平，非常符合物理蓄水过程！</p>
      </div>
    </div>
  </div>
`;

export const TRAPPING_RAIN_WATER_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int trap(int[] height) {',
    '    int size = height.length;',
    '    if (size <= 2) return 0;',
    '    Stack<Integer> stack = new Stack<>();',
    '    int sum = 0;',
    '    for (int i = 0; i < size; i++) {',
    '        while (!stack.isEmpty() && height[i] > height[stack.peek()]) {',
    '            int mid = stack.pop(); // 凹槽底部',
    '            if (!stack.isEmpty()) {',
    '                int left = stack.peek(); // 左壁',
    '                int h = Math.min(height[left], height[i]) - height[mid];',
    '                int w = i - left - 1;',
    '                sum += h * w; // 横向累加雨水',
    '            }',
    '        }',
    '        stack.push(i);',
    '    }',
    '    return sum;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int trap(vector<int>& height) {',
    '        if (height.size() <= 2) return 0;',
    '        stack<int> st;',
    '        int sum = 0;',
    '        for (int i = 0; i < height.size(); i++) {',
    '            while (!st.empty() && height[i] > height[st.top()]) {',
    '                int mid = st.top();',
    '                st.pop();',
    '                if (!st.empty()) {',
    '                    int h = min(height[st.top()], height[i]) - height[mid];',
    '                    int w = i - st.top() - 1;',
    '                    sum += h * w;',
    '                }',
    '            }',
    '            st.push(i);',
    '        }',
    '        return sum;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def trap(self, height: List[int]) -> int:',
    '        if len(height) <= 2:',
    '            return 0',
    '        stack = []',
    '        ans = 0',
    '        for i, h in enumerate(height):',
    '            while stack and h > height[stack[-1]]:',
    '                mid = stack.pop()',
    '                if stack:',
    '                    left = stack[-1]',
    '                    h_diff = min(height[left], h) - height[mid]',
    '                    w = i - left - 1',
    '                    ans += h_diff * w',
    '            stack.append(i)',
    '        return ans',
  ],
  javascript: [
    'var trap = function(height) {',
    '    let sum = 0;',
    '    const stack = [];',
    '    for (let i = 0; i < height.length; i++) {',
    '        while (stack.length && height[i] > height[stack[stack.length - 1]]) {',
    '            const mid = stack.pop();',
    '            if (stack.length) {',
    '                const left = stack[stack.length - 1];',
    '                const h = Math.min(height[left], height[i]) - height[mid];',
    '                const w = i - left - 1;',
    '                sum += h * w;',
    '            }',
    '        }',
    '        stack.push(i);',
    '    }',
    '    return sum;',
    '};',
  ],
};
