/**
 * LeetCode 763: 划分字母区间 (Partition Labels)
 * 领域知识与题解精讲配置声明
 */

export const PARTITION_LABELS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 763</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">划分字母区间 (Partition Labels)</h2>
    </div>
    <p style="margin: 0;">给你一个字符串 <code style="color: #fde047; font-family: monospace;">s</code> 。我们要把这个字符串划分为尽可能多的片段，同一字母最多出现在一个片段中。</p>
    <p style="margin: 0;">注意，划分结果需要满足：将所有片段按顺序连接，可以得到原字符串。</p>
    <p style="margin: 0;">返回一个表示每个字符串片段的长度的列表。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = "ababcbacadefegdehijhklij"</div>
      <div>输出: [9,7,8]</div>
      <div>解释: 划分结果为 "ababcbaca"、"defegde"、"hijhklij" 。每个字母最多出现在一个片段中。像 "ababcbacadefegde", "hijhklij" 的划分是错误的，因为划分的片段数较少。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = "eccbbbbdec"</div>
      <div>输出: [10]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; s.length &le; 500</div>
      <div>• s 仅由小写英文字母组成</div>
    </div>
  </div>
`;

export const PARTITION_LABELS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：以字符最后出现位置为边界进行切割
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 统计每个字符最后出现的位置</div>
        <p style="margin: 0; color: #94a3b8;">先遍历一遍字符串，用哈希表或长度 26 的数组记录每个字母在字符串中最后出现的下标 <code style="color: #7dd3fc; font-family: monospace;">edge[s[i] - 'a'] = i</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 动态维护当前片段的最远右边界</div>
        <p style="margin: 0; color: #94a3b8;">再次从左到右遍历字符，不断更新当前片段所需覆盖的最远下标：<br/>
        <code style="color: #fbbf24; font-family: monospace;">right = Math.max(right, edge[s[i] - 'a'])</code>。<br/>
        这保证了当前片段内的所有字符，其后续出现点全部包含在该片段中！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 当 i == right 时即刻切割</div>
        <p style="margin: 0; color: #94a3b8;">当指针到达当前最远右边界时（<code style="color: #7dd3fc; font-family: monospace;">i == right</code>），说明此片段内所有字母在后续绝对不会再出现，可以贪心地在这里切一刀！记录长度 <code style="color: #34d399; font-family: monospace;">right - left + 1</code>，并重置 <code style="color: #7dd3fc; font-family: monospace;">left = i + 1</code>。</p>
      </div>
    </div>
  </div>
`;

export const PARTITION_LABELS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<Integer> partitionLabels(String s) {',
    '    List<Integer> list = new LinkedList<>();',
    '    int[] edge = new int[26];',
    '    char[] chars = s.toCharArray();',
    '    // 1. 统计每一个字符最后出现的位置',
    '    for (int i = 0; i < chars.length; i++) {',
    '        edge[chars[i] - \'a\'] = i;',
    '    }',
    '    int idx = 0, last = -1;',
    '    // 2. 从头遍历字符，更新最远边界',
    '    for (int i = 0; i < chars.length; i++) {',
    '        idx = Math.max(idx, edge[chars[i] - \'a\']);',
    '        if (i == idx) { // 到达最远边界，进行切割',
    '            list.add(i - last);',
    '            last = i;',
    '        }',
    '    }',
    '    return list;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> partitionLabels(string s) {',
    '        int hash[26] = {0};',
    '        for (int i = 0; i < s.size(); i++) {',
    '            hash[s[i] - \'a\'] = i;',
    '        }',
    '        vector<int> result;',
    '        int left = 0, right = 0;',
    '        for (int i = 0; i < s.size(); i++) {',
    '            right = max(right, hash[s[i] - \'a\']);',
    '            if (i == right) {',
    '                result.push_back(right - left + 1);',
    '                left = i + 1;',
    '            }',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def partitionLabels(self, s: str) -> List[int]:',
    '        last_pos = {c: i for i, c in enumerate(s)}',
    '        result = []',
    '        left = 0',
    '        right = 0',
    '        for i, c in enumerate(s):',
    '            right = max(right, last_pos[c])',
    '            if i == right:',
    '                result.append(right - left + 1)',
    '                left = i + 1',
    '        return result',
  ],
  javascript: [
    'var partitionLabels = function(s) {',
    '    const last = {};',
    '    for (let i = 0; i < s.length; i++) {',
    '        last[s[i]] = i;',
    '    }',
    '    const result = [];',
    '    let left = 0, right = 0;',
    '    for (let i = 0; i < s.length; i++) {',
    '        right = Math.max(right, last[s[i]]);',
    '        if (i === right) {',
    '            result.push(right - left + 1);',
    '            left = i + 1;',
    '        }',
    '    }',
    '    return result;',
    '};',
  ],
};
