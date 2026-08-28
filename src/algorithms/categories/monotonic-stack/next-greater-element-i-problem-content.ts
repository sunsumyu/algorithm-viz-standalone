/**
 * LeetCode 496: 下一个更大元素 I (Next Greater Element I)
 * 领域知识与题解精讲配置声明
 */

export const NEXT_GREATER_ELEMENT_I_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 496</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">下一个更大元素 I (Next Greater Element I)</h2>
    </div>
    <p style="margin: 0;"><code style="color: #fde047; font-family: monospace;">nums1</code> 中数字 <code style="color: #fde047; font-family: monospace;">x</code> 的 <strong>下一个更大元素</strong> 是指 <code style="color: #fde047; font-family: monospace;">x</code> 在 <code style="color: #fde047; font-family: monospace;">nums2</code> 中对应位置 <strong>右侧</strong> 的 <strong>第一个</strong> 比 <code style="color: #fde047; font-family: monospace;">x</code> 大的元素。</p>
    <p style="margin: 0;">给你两个 <strong>没有重复元素</strong> 的数组 <code style="color: #fde047; font-family: monospace;">nums1</code> 和 <code style="color: #fde047; font-family: monospace;">nums2</code> ，下标从 0 开始计数，其中 <code style="color: #fde047; font-family: monospace;">nums1</code> 是 <code style="color: #fde047; font-family: monospace;">nums2</code> 的子集。</p>
    <p style="margin: 0;">对于每个 <code style="color: #fde047; font-family: monospace;">0 &le; i &lt; nums1.length</code> ，找出满足 <code style="color: #fde047; font-family: monospace;">nums1[i] == nums2[j]</code> 的下标 <code style="color: #fde047; font-family: monospace;">j</code> ，并找出 <code style="color: #fde047; font-family: monospace;">nums2</code> 中 <code style="color: #fde047; font-family: monospace;">nums2[j]</code> 的 <strong>下一个更大元素</strong> 。如果不存在，对应位置输出 <code style="color: #f87171; font-family: monospace;">-1</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums1 = [4,1,2], nums2 = [1,3,4,2]</div>
      <div>输出: [-1,3,-1]</div>
      <div>解释: 对于 nums1 中的每个数：4 在 nums2 之后无更大元素(-1)；1 在 nums2 之后第一个更大元素是 3；2 在 nums2 之后无更大元素(-1)。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums1 = [2,4], nums2 = [1,2,3,4]</div>
      <div>输出: [3,-1]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums1.length &le; nums2.length &le; 1000</div>
      <div>• 0 &le; nums1[i], nums2[i] &le; 10^4</div>
      <div>• nums1 和 nums2 中所有整数 互不相同</div>
      <div>• nums1 中的所有整数同样出现在 nums2 中</div>
    </div>
  </div>
`;

export const NEXT_GREATER_ELEMENT_I_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 单调栈 + 哈希表：先在 nums2 中建立全量映射，再 O(1) 查表 nums1
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么先处理 nums2？</div>
        <p style="margin: 0; color: #94a3b8;">因为 <code style="color: #7dd3fc; font-family: monospace;">nums1</code> 是 <code style="color: #7dd3fc; font-family: monospace;">nums2</code> 的子集。如果我们先在母集 <code style="color: #fbbf24; font-family: monospace;">nums2</code> 上用单调栈找出<strong>所有元素的下一个更大元素</strong>并存入 <code style="color: #34d399; font-family: monospace;">HashMap&lt;元素, 下一个更大元素&gt;</code>，后续只需遍历 <code style="color: #7dd3fc; font-family: monospace;">nums1</code> 查表即可达到整体 <code style="color: #34d399; font-family: monospace;">O(N + M)</code> 的极致效率！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 单调栈工作流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 遍历 <code style="color: #7dd3fc; font-family: monospace;">nums2</code>，维护从栈底到栈顶单调递减的栈；<br/>
        2. 当 <code style="color: #f87171; font-family: monospace;">nums2[j] &gt; stack.peek()</code> 时：<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;弹出栈顶 <code style="color: #fbbf24; font-family: monospace;">top = stack.pop()</code>，记录映射 <code style="color: #34d399; font-family: monospace;">map.put(top, nums2[j])</code>；<br/>
        3. 将 <code style="color: #7dd3fc; font-family: monospace;">nums2[j]</code> 压入栈；<br/>
        4. 遍历结束后，栈中剩余元素说明右侧无更大元素，对应映射为 <code style="color: #f87171; font-family: monospace;">-1</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 查询 nums1</div>
        <p style="margin: 0; color: #94a3b8;">直接按顺序遍历 <code style="color: #7dd3fc; font-family: monospace;">nums1</code>，从哈希表中提取对应结果填充到答案数组。</p>
      </div>
    </div>
  </div>
`;

export const NEXT_GREATER_ELEMENT_I_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[] nextGreaterElement(int[] nums1, int[] nums2) {',
    '    Stack<Integer> stack = new Stack<>();',
    '    Map<Integer, Integer> map = new HashMap<>();',
    '    // 1. 遍历 nums2 构建下一个更大元素映射',
    '    for (int num : nums2) {',
    '        while (!stack.isEmpty() && num > stack.peek()) {',
    '            map.put(stack.pop(), num);',
    '        }',
    '        stack.push(num);',
    '    }',
    '    // 2. 根据 nums1 查表填入结果',
    '    int[] res = new int[nums1.length];',
    '    for (int i = 0; i < nums1.length; i++) {',
    '        res[i] = map.getOrDefault(nums1[i], -1);',
    '    }',
    '    return res;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {',
    '        stack<int> st;',
    '        unordered_map<int, int> umap;',
    '        for (int num : nums2) {',
    '            while (!st.empty() && num > st.top()) {',
    '                umap[st.top()] = num;',
    '                st.pop();',
    '            }',
    '            st.push(num);',
    '        }',
    '        vector<int> result(nums1.size(), -1);',
    '        for (int i = 0; i < nums1.size(); i++) {',
    '            if (umap.find(nums1[i]) != umap.end()) {',
    '                result[i] = umap[nums1[i]];',
    '            }',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:',
    '        stack = []',
    '        mapping = {}',
    '        for num in nums2:',
    '            while stack and num > stack[-1]:',
    '                mapping[stack.pop()] = num',
    '            stack.append(num)',
    '        return [mapping.get(x, -1) for x in nums1]',
  ],
  javascript: [
    'var nextGreaterElement = function(nums1, nums2) {',
    '    const stack = [];',
    '    const map = new Map();',
    '    for (const num of nums2) {',
    '        while (stack.length && num > stack[stack.length - 1]) {',
    '            map.set(stack.pop(), num);',
    '        }',
    '        stack.push(num);',
    '    }',
    '    return nums1.map(num => map.has(num) ? map.get(num) : -1);',
    '};',
  ],
};
