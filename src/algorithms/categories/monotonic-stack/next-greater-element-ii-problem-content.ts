/**
 * LeetCode 503: 下一个更大元素 II (Next Greater Element II)
 * 领域知识与题解精讲配置声明
 */

export const NEXT_GREATER_ELEMENT_II_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 503</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">下一个更大元素 II (Next Greater Element II)</h2>
    </div>
    <p style="margin: 0;">给定一个循环数组 <code style="color: #fde047; font-family: monospace;">nums</code> （ <code style="color: #fde047; font-family: monospace;">nums[nums.length - 1]</code> 的下一个元素是 <code style="color: #fde047; font-family: monospace;">nums[0]</code> ），返回 <em><code style="color: #fde047; font-family: monospace;">nums</code> 中每个元素的 <strong>下一个更大元素</strong></em> 。</p>
    <p style="margin: 0;">数字 <code style="color: #fde047; font-family: monospace;">x</code> 的 <strong>下一个更大的元素</strong> 是按数组遍历顺序，这个数字之后第一个比它更大的数，这意味着你应该循环地搜索它的下一个更大的数。如果不存在，怎输出 <code style="color: #f87171; font-family: monospace;">-1</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [1,2,1]</div>
      <div>输出: [2,-1,2]</div>
      <div>解释: 第一个 1 的下一个更大的数是 2；数字 2 找不到下一个更大的数；第二个 1 的下一个最大的数需要循环搜索，结果也是 2。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [1,2,3,4,3]</div>
      <div>输出: [2,3,4,-1,4]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 10^4</div>
      <div>• -10^9 &le; nums[i] &le; 10^9</div>
    </div>
  </div>
`;

export const NEXT_GREATER_ELEMENT_II_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 循环数组单调栈技巧：模拟 2 轮遍历 (i % n)，无需拼接数组
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 循环数组如何展开？</div>
        <p style="margin: 0; color: #94a3b8;">处理循环数组有两个思路：<br/>
        • <strong>方法 A（拼接数组）</strong>：将两个 <code style="color: #7dd3fc; font-family: monospace;">nums</code> 拼接成长度为 <code style="color: #7dd3fc; font-family: monospace;">2n</code> 的新数组，需要额外的空间与复制开销。<br/>
        • <strong>方法 B（取模模拟 2 轮，推荐！）</strong>：保持原数组不变，循环遍历 <code style="color: #34d399; font-family: monospace;">i 从 0 到 2n - 1</code>，利用 <code style="color: #34d399; font-family: monospace;">i % n</code> 访问对应元素！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 单调栈工作流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 结果数组初始全部赋值为 <code style="color: #f87171; font-family: monospace;">-1</code>；<br/>
        2. 遍历 <code style="color: #7dd3fc; font-family: monospace;">0 &le; i &lt; 2n</code>，实际下标为 <code style="color: #fbbf24; font-family: monospace;">curIdx = i % n</code>；<br/>
        3. 若当前值 <code style="color: #f87171; font-family: monospace;">nums[curIdx] &gt; nums[st.top()]</code>，持续出栈并结算：<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<code style="color: #34d399; font-family: monospace;">res[st.pop()] = nums[curIdx]</code>；<br/>
        4. 将 <code style="color: #7dd3fc; font-family: monospace;">curIdx</code> 压入栈。第二轮遍历仅用于帮助第一轮未出栈的元素寻找循环后的右侧更大值。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度</div>
        <p style="margin: 0; color: #94a3b8;">• 时间复杂度: <code style="color: #7dd3fc; font-family: monospace;">O(N)</code>，每个元素最多进栈出栈 2 次。<br/>
        • 空间复杂度: <code style="color: #7dd3fc; font-family: monospace;">O(N)</code> 单调栈开销。</p>
      </div>
    </div>
  </div>
`;

export const NEXT_GREATER_ELEMENT_II_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[] nextGreaterElements(int[] nums) {',
    '    int n = nums.length;',
    '    int[] res = new int[n];',
    '    Arrays.fill(res, -1);',
    '    Stack<Integer> st = new Stack<>();',
    '    // 模拟遍历两遍数组',
    '    for (int i = 0; i < 2 * n; i++) {',
    '        while (!st.isEmpty() && nums[i % n] > nums[st.peek()]) {',
    '            res[st.pop()] = nums[i % n];',
    '        }',
    '        st.push(i % n);',
    '    }',
    '    return res;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> nextGreaterElements(vector<int>& nums) {',
    '        int n = nums.size();',
    '        vector<int> result(n, -1);',
    '        stack<int> st;',
    '        for (int i = 0; i < 2 * n; i++) {',
    '            while (!st.empty() && nums[i % n] > nums[st.top()]) {',
    '                result[st.top()] = nums[i % n];',
    '                st.pop();',
    '            }',
    '            st.push(i % n);',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def nextGreaterElements(self, nums: List[int]) -> List[int]:',
    '        n = len(nums)',
    '        res = [-1] * n',
    '        stack = []',
    '        for i in range(2 * n):',
    '            while stack and nums[i % n] > nums[stack[-1]]:',
    '                res[stack.pop()] = nums[i % n]',
    '            stack.append(i % n)',
    '        return res',
  ],
  javascript: [
    'var nextGreaterElements = function(nums) {',
    '    const n = nums.length;',
    '    const res = new Array(n).fill(-1);',
    '    const stack = [];',
    '    for (let i = 0; i < 2 * n; i++) {',
    '        while (stack.length && nums[i % n] > nums[stack[stack.length - 1]]) {',
    '            res[stack.pop()] = nums[i % n];',
    '        }',
    '        stack.push(i % n);',
    '    }',
    '    return res;',
    '};',
  ],
};
