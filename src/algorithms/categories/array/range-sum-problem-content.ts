/**
 * KamaCoder 58: 区间和 (Range Sum / 一维前缀和)
 * 领域知识与题解精讲配置声明
 */

export const RANGE_SUM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">KamaCoder 58</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">区间和 (Range Sum)</h2>
    </div>
    <p style="margin: 0;">给定一个整数数组 <code style="color: #fde047; font-family: monospace;">arr</code> 和若干组区间查询 <code style="color: #fde047; font-family: monospace;">[L, R]</code> 。</p>
    <p style="margin: 0;">对于每次查询，要求计算并输出闭区间 <code style="color: #60a5fa; font-family: monospace;">[L, R]</code> 内所有元素的总和。面对可能高达数十万次的高频查询，如何做到 <code style="color: #34d399; font-family: monospace;">O(1)</code> 的极致响应？</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: arr = [1, 2, 3, 4, 5], queries = [[0, 2], [1, 3], [2, 4]]</div>
      <div>输出: [6, 9, 12]</div>
      <div style="color: #94a3b8;">解释:
• 区间 [0, 2] 之和: 1 + 2 + 3 = 6
• 区间 [1, 3] 之和: 2 + 3 + 4 = 9
• 区间 [2, 4] 之和: 3 + 4 + 5 = 12</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; arr.length &le; 10<sup>5</sup></div>
      <div>• 1 &le; queries.length &le; 10<sup>5</sup></div>
    </div>
  </div>
`;

export const RANGE_SUM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 一维前缀和：O(n) 预处理，O(1) 瞬时响应区间和查询
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 前缀和数组定义</div>
        <p style="margin: 0; color: #94a3b8;">
        定义数组 <code style="color: #38bdf8; font-family: monospace;">prefix[i]</code> 表示原数组前 <code style="color: #fde047; font-family: monospace;">i</code> 个元素的累加和：<br/>
        • <code style="color: #a78bfa; font-family: monospace;">prefix[0] = 0</code>（虚拟边界，极大简化代码并避免特判）<br/>
        • <code style="color: #38bdf8; font-family: monospace;">prefix[i + 1] = prefix[i] + arr[i]</code>
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② O(1) 差分求区间和公式</div>
        <p style="margin: 0; color: #94a3b8;">
        对于任意闭区间 <code style="color: #fbbf24; font-family: monospace;">[L, R]</code>：<br/>
        <code style="color: #34d399; font-family: monospace; font-size: 13px; font-weight: 700;">sum(arr[L..R]) = prefix[R + 1] - prefix[L]</code><br/>
        原理解释：<code style="color: #38bdf8; font-family: monospace;">prefix[R + 1]</code> 是从下标 <code style="color: #fde047; font-family: monospace;">0</code> 到 <code style="color: #fde047; font-family: monospace;">R</code> 的总和，减去下标 <code style="color: #fde047; font-family: monospace;">0</code> 到 <code style="color: #fde047; font-family: monospace;">L-1</code> 的总和（即 <code style="color: #fbbf24; font-family: monospace;">prefix[L]</code>），剩余的就是区间 <code style="color: #34d399; font-family: monospace;">[L..R]</code> 的和！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 复杂度对比</div>
        <p style="margin: 0; color: #94a3b8;">
        • 暴力法（每次 for 循环求和）：每次查询 <code style="color: #f87171; font-family: monospace;">O(n)</code>，m 次查询总计 <code style="color: #f87171; font-family: monospace;">O(m &times; n)</code>（超时）。<br/>
        • 前缀和法：预处理 <code style="color: #60a5fa; font-family: monospace;">O(n)</code>，每次查询 <code style="color: #34d399; font-family: monospace;">O(1)</code>，总耗时仅 <code style="color: #34d399; font-family: monospace;">O(n + m)</code>！
        </p>
      </div>
    </div>
  </div>
`;

export const RANGE_SUM_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[] rangeSum(int[] arr, int[][] queries) {',
    '    int n = arr.length;',
    '    int[] prefix = new int[n + 1];',
    '    prefix[0] = 0;',
    '    for (int i = 0; i < n; i++) {',
    '        prefix[i + 1] = prefix[i] + arr[i];',
    '    }',
    '    int[] results = new int[queries.length];',
    '    for (int q = 0; q < queries.length; q++) {',
    '        int L = queries[q][0], R = queries[q][1];',
    '        results[q] = prefix[R + 1] - prefix[L];',
    '    }',
    '    return results;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> rangeSum(vector<int>& arr, vector<pair<int, int>>& queries) {',
    '        int n = arr.size();',
    '        vector<int> prefix(n + 1, 0);',
    '        for (int i = 0; i < n; i++) {',
    '            prefix[i + 1] = prefix[i] + arr[i];',
    '        }',
    '        vector<int> results;',
    '        for (auto& q : queries) {',
    '            int L = q.first, R = q.second;',
    '            results.push_back(prefix[R + 1] - prefix[L]);',
    '        }',
    '        return results;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def rangeSum(self, arr: List[int], queries: List[List[int]]) -> List[int]:',
    '        n = len(arr)',
    '        prefix = [0] * (n + 1)',
    '        for i in range(n):',
    '            prefix[i + 1] = prefix[i] + arr[i]',
    '        results = []',
    '        for L, R in queries:',
    '            results.append(prefix[R + 1] - prefix[L])',
    '        return results',
  ],
  javascript: [
    'var rangeSum = function(arr, queries) {',
    '    const n = arr.length;',
    '    const prefix = new Array(n + 1).fill(0);',
    '    for (let i = 0; i < n; i++) {',
    '        prefix[i + 1] = prefix[i] + arr[i];',
    '    }',
    '    return queries.map(([L, R]) => prefix[R + 1] - prefix[L]);',
    '};',
  ],
};
