/**
 * LeetCode 739: 每日温度 (Daily Temperatures)
 * 领域知识与题解精讲配置声明
 */

export const DAILY_TEMPERATURES_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 739</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">每日温度 (Daily Temperatures)</h2>
    </div>
    <p style="margin: 0;">给定一个整数数组 <code style="color: #fde047; font-family: monospace;">temperatures</code> ，表示每天的温度，返回一个数组 <code style="color: #fde047; font-family: monospace;">answer</code> ，其中 <code style="color: #fde047; font-family: monospace;">answer[i]</code> 是指对于第 <code style="color: #fde047; font-family: monospace;">i</code> 天，下一个更高温度出现在几天后。如果气温在这之后都不会升高，请在该位置用 <code style="color: #fde047; font-family: monospace;">0</code> 来代替。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: temperatures = [73,74,75,71,69,72,76,73]</div>
      <div>输出: [1,1,4,2,1,1,0,0]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: temperatures = [30,40,50,60]</div>
      <div>输出: [1,1,1,0]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 3:</div>
      <div>输入: temperatures = [30,60,90]</div>
      <div>输出: [1,1,0]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; temperatures.length &le; 10^5</div>
      <div>• 30 &le; temperatures[i] &le; 100</div>
    </div>
  </div>
`;

export const DAILY_TEMPERATURES_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 单调栈精髓：寻找任一元素右侧第一个更大元素，单调递减栈解构
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 什么时候用单调栈？</div>
        <p style="margin: 0; color: #94a3b8;">通常是一维数组，要寻找<strong>任一个元素的右边或者左边第一个比自己大或者小的元素的位置</strong>，此时单调栈是 <code style="color: #34d399; font-family: monospace;">O(N)</code> 时间复杂度的神器！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 栈内存储什么？单调顺序为何？</div>
        <p style="margin: 0; color: #94a3b8;">• <strong>栈内存储下标</strong>（方便计算跨度 <code style="color: #7dd3fc; font-family: monospace;">i - st.top()</code>）。<br/>
        • <strong>从栈头到栈底单调递增</strong>（即元素值从栈顶到栈底越来越大）。<br/>
        当遇到比栈顶元素更大的当前温度时，说明找到了栈顶元素的右侧第一个更高温度！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 三种情况判断</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <code style="color: #7dd3fc; font-family: monospace;">T[i] &lt; T[st.top()]</code>：直接入栈 <code style="color: #7dd3fc; font-family: monospace;">st.push(i)</code>。<br/>
        2. <code style="color: #7dd3fc; font-family: monospace;">T[i] == T[st.top()]</code>：入栈 <code style="color: #7dd3fc; font-family: monospace;">st.push(i)</code>。<br/>
        3. <code style="color: #f87171; font-family: monospace;">T[i] &gt; T[st.top()]</code>：触发结算！<br/>
        <code style="color: #34d399; font-family: monospace;">result[st.top()] = i - st.top()</code>，随后 <code style="color: #fbbf24; font-family: monospace;">st.pop()</code>，持续循环直至栈顶不小于当前值，最后将当前下标 <code style="color: #7dd3fc; font-family: monospace;">st.push(i)</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const DAILY_TEMPERATURES_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[] dailyTemperatures(int[] temperatures) {',
    '    int lens = temperatures.length;',
    '    int[] res = new int[lens];',
    '    Deque<Integer> stack = new LinkedList<>();',
    '    for (int i = 0; i < lens; i++) {',
    '        // 当前温度大于栈顶温度时，持续出栈结算',
    '        while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {',
    '            int prevIndex = stack.pop();',
    '            res[prevIndex] = i - prevIndex;',
    '        }',
    '        stack.push(i); // 将当前天数入栈',
    '    }',
    '    return res;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> dailyTemperatures(vector<int>& temperatures) {',
    '        vector<int> result(temperatures.size(), 0);',
    '        stack<int> st;',
    '        for (int i = 0; i < temperatures.size(); i++) {',
    '            while (!st.empty() && temperatures[i] > temperatures[st.top()]) {',
    '                result[st.top()] = i - st.top();',
    '                st.pop();',
    '            }',
    '            st.push(i);',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:',
    '        answer = [0] * len(temperatures)',
    '        stack = []',
    '        for i, t in enumerate(temperatures):',
    '            while stack and t > temperatures[stack[-1]]:',
    '                prev_index = stack.pop()',
    '                answer[prev_index] = i - prev_index',
    '            stack.append(i)',
    '        return answer',
  ],
  javascript: [
    'var dailyTemperatures = function(temperatures) {',
    '    const n = temperatures.length;',
    '    const res = new Array(n).fill(0);',
    '    const stack = [];',
    '    for (let i = 0; i < n; i++) {',
    '        while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {',
    '            const prevIndex = stack.pop();',
    '            res[prevIndex] = i - prevIndex;',
    '        }',
    '        stack.push(i);',
    '    }',
    '    return res;',
    '};',
  ],
};
