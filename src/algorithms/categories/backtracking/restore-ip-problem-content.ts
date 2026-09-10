/**
 * LeetCode 93: 复原 IP 地址 (Restore IP Addresses)
 * 领域知识与题解精讲配置声明
 */

export const RESTORE_IP_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 93</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">复原 IP 地址 (Restore IP Addresses)</h2>
    </div>
    <p style="margin: 0;">有效 IP 地址 正好由四个整数（每个整数位于 <code style="color: #7dd3fc; font-family: monospace;">0</code> 到 <code style="color: #7dd3fc; font-family: monospace;">255</code> 之间组成，且不能含有前导 <code style="color: #fb7185; font-family: monospace;">0</code>），整数之间用 <code style="color: #fde047; font-family: monospace;">'.'</code> 分隔。</p>
    <p style="margin: 0;">给定一个只包含数字的字符串 <code style="color: #fde047; font-family: monospace;">s</code> ，用以表示一个 IP 地址，返回所有可能的<strong>有效 IP 地址</strong>，这些地址可以通过在 <code style="color: #fde047; font-family: monospace;">s</code> 中插入 <code style="color: #fde047; font-family: monospace;">'.'</code> 来形成。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: s = "25525511135"</div>
      <div>输出: ["255.255.11.135","255.255.111.35"]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: s = "0000"</div>
      <div>输出: ["0.0.0.0"]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 3:</div>
      <div>输入: s = "101023"</div>
      <div>输出: ["1.0.10.23","1.0.102.3","10.1.0.23","10.10.2.3","101.0.2.3"]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; s.length &le; 20</div>
      <div>• s 仅由数字组成</div>
    </div>
  </div>
`;

export const RESTORE_IP_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> IP 分段三原则与强剪枝
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 段长约束：每段 1 到 3 位数字</div>
        <p style="margin: 0; color: #94a3b8;">单层枚举长度 <code style="color: #7dd3fc; font-family: monospace;">len = 1, 2, 3</code>，截取子串 <code style="color: #fde047; font-family: monospace;">s.substring(start, start + len)</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 合法性判定 (三条件)</div>
        <p style="margin: 0; color: #94a3b8;">• 不能含前导 0：<code style="color: #fb7185; font-family: monospace;">seg.length > 1 && seg[0] == '0'</code></p>
        <p style="margin: 0; color: #94a3b8;">• 数值上限：<code style="color: #fb7185; font-family: monospace;">val <= 255</code></p>
        <p style="margin: 0; color: #94a3b8;">• 非法时直接 <code style="color: #fde047; font-family: monospace;">break</code>（后序更长数字必定超额）。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ 剩余字符数量剪枝</div>
        <p style="margin: 0; color: #94a3b8;">若剩余字符数 <code style="color: #fb7185; font-family: monospace;">remaining > (4 - segCount) * 3</code> 或 <code style="color: #fb7185; font-family: monospace;">remaining < 4 - segCount</code>，说明无法恰好凑成 4 段，直接剪枝跳过。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fb7185; margin-bottom: 4px;">④ 终止条件</div>
        <p style="margin: 0; color: #94a3b8;">当已切出 4 段且刚好耗尽全部字符时，用 <code style="color: #7dd3fc; font-family: monospace;">'.'</code> 连接并收集入解集。</p>
      </div>
    </div>
  </div>
`;

export const RESTORE_IP_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<String> restoreIpAddresses(String s) {',
    '    List<String> res = new ArrayList<>();',
    '    if (s.length() < 4 || s.length() > 12) return res; // 基础长度过滤',
    '    backtrack(s, 0, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(String s, int startIndex, List<String> segments, List<String> res) {',
    '    if (segments.size() == 4) {',
    '        if (startIndex == s.length()) res.add(String.join(".", segments));',
    '        return;',
    '    }',
    '    for (int len = 1; len <= 3; len++) {',
    '        if (startIndex + len > s.length()) break;',
    '        String seg = s.substring(startIndex, startIndex + len);',
    '        int val = Integer.parseInt(seg);',
    '        if (val > 255) break;',
    '        if (seg.length() > 1 && seg.charAt(0) == \'0\') break;',
    '        // 剪枝：剩余字符数不合法',
    '        int rem = s.length() - (startIndex + len);',
    '        int need = 3 - segments.size();',
    '        if (rem > need * 3 || rem < need) continue;',
    '        segments.add(seg);',
    '        backtrack(s, startIndex + len, segments, res);',
    '        segments.remove(segments.size() - 1);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<string> restoreIpAddresses(string s) {',
    '        vector<string> res;',
    '        if (s.size() < 4 || s.size() > 12) return res;',
    '        vector<string> segs;',
    '        backtrack(s, 0, segs, res);',
    '        return res;',
    '    }',
    '    void backtrack(const string& s, int startIndex, vector<string>& segs, vector<string>& res) {',
    '        if (segs.size() == 4) {',
    '            if (startIndex == s.size()) {',
    '                res.push_back(segs[0] + "." + segs[1] + "." + segs[2] + "." + segs[3]);',
    '            }',
    '            return;',
    '        }',
    '        for (int len = 1; len <= 3; len++) {',
    '            if (startIndex + len > s.size()) break;',
    '            string seg = s.substr(startIndex, len);',
    '            int val = stoi(seg);',
    '            if (val > 255) break;',
    '            if (seg.size() > 1 && seg[0] == \'0\') break;',
    '            int rem = s.size() - (startIndex + len);',
    '            int need = 3 - segs.size();',
    '            if (rem > need * 3 || rem < need) continue;',
    '            segs.push_back(seg);',
    '            backtrack(s, startIndex + len, segs, res);',
    '            segs.pop_back();',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def restoreIpAddresses(self, s: str) -> List[str]:',
    '        res = []',
    '        if len(s) < 4 or len(s) > 12:',
    '            return res',
    '        def backtrack(start: int, segs: List[str]):',
    '            if len(segs) == 4:',
    '                if start == len(s):',
    '                    res.append(".".join(segs))',
    '                return',
    '            for length in range(1, 4):',
    '                if start + length > len(s):',
    '                    break',
    '                seg = s[start:start+length]',
    '                val = int(seg)',
    '                if val > 255:',
    '                    break',
    '                if len(seg) > 1 and seg[0] == "0":',
    '                    break',
    '                rem = len(s) - (start + length)',
    '                need = 3 - len(segs)',
    '                if rem > need * 3 or rem < need:',
    '                    continue',
    '                segs.append(seg)',
    '                backtrack(start + length, segs)',
    '                segs.pop()',
    '        backtrack(0, [])',
    '        return res',
  ],
  javascript: [
    'var restoreIpAddresses = function(s) {',
    '    const res = [];',
    '    if (s.length < 4 || s.length > 12) return res;',
    '    function backtrack(start, segments) {',
    '        if (segments.length === 4) {',
    '            if (start === s.length) res.push(segments.join("."));',
    '            return;',
    '        }',
    '        for (let len = 1; len <= 3; len++) {',
    '            if (start + len > s.length) break;',
    '            const seg = s.slice(start, start + len);',
    '            const val = parseInt(seg, 10);',
    '            if (val > 255) break;',
    '            if (seg.length > 1 && seg[0] === "0") break;',
    '            const rem = s.length - (start + len);',
    '            const need = 3 - segments.length;',
    '            if (rem > need * 3 || rem < need) continue;',
    '            segments.push(seg);',
    '            backtrack(start + len, segments);',
    '            segments.pop();',
    '        }',
    '    }',
    '    backtrack(0, []);',
    '    return res;',
    '};',
  ],
};
