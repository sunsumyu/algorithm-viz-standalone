/**
 * 萌宠餐厅·饼干大派送 (Cookie Pets: Greedy Two-Pointer Feeder)
 * 经典贪心算法（Greedy Matching）、双排序与双指针最优分配多语言题解
 */

export const COOKIE_FEEDER_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 经典贪心算法：双排序 + 双指针求解最大萌宠喂养数量 (LeetCode 455)',
    'int findContentChildren(vector<int>& g, vector<int>& s) {',
    '    sort(g.begin(), g.end()); // 胃口值升序排序',
    '    sort(s.begin(), s.end()); // 饼干尺寸升序排序',
    '',
    '    int childPtr = 0;  // 萌宠指针 (优先满足胃口最小的萌宠)',
    '    int cookiePtr = 0; // 饼干指针 (优先使用尺寸刚好够用的最小饼干)',
    '',
    '    while (childPtr < g.size() && cookiePtr < s.size()) {',
    '        // 贪心策略：若当前饼干能够满足当前萌宠胃口',
    '        if (s[cookiePtr] >= g[childPtr]) {',
    '            childPtr++; // 满足该萌宠，移向下一个萌宠',
    '        }',
    '        cookiePtr++; // 无论是否满足，该饼干均已消耗或过小，移向下一块更大饼干',
    '    }',
    '',
    '    return childPtr; // 成功喂饱的萌宠总数',
    '}',
  ],
  java: [
    'import java.util.Arrays;',
    '',
    'public class CookieFeederGreedy {',
    '    public static int findContentChildren(int[] g, int[] s) {',
    '        Arrays.sort(g);',
    '        Arrays.sort(s);',
    '        int child = 0, cookie = 0;',
    '        while (child < g.length && cookie < s.length) {',
    '            if (s[cookie] >= g[child]) {',
    '                child++;',
    '            }',
    '            cookie++;',
    '        }',
    '        return child;',
    '    }',
    '}',
  ],
  python: [
    'def find_content_children(g: list[int], s: list[int]) -> int:',
    '    """双指针贪心：小饼干优先喂给小胃口萌宠"""',
    '    g.sort()',
    '    s.sort()',
    '    child_ptr = 0',
    '    cookie_ptr = 0',
    '    while child_ptr < len(g) and cookie_ptr < len(s):',
    '        if s[cookie_ptr] >= g[child_ptr]:',
    '            child_ptr += 1',
    '        cookie_ptr += 1',
    '    return child_ptr',
  ],
  javascript: [
    'function findContentChildren(g, s) {',
    '  g.sort((a, b) => a - b);',
    '  s.sort((a, b) => a - b);',
    '  let child = 0, cookie = 0;',
    '  while (child < g.length && cookie < s.length) {',
    '    if (s[cookie] >= g[child]) child++;',
    '    cookie++;',
    '  }',
    '  return child;',
    '}',
  ],
};

export const COOKIE_FEEDER_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🍪</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">萌宠餐厅·饼干大派送 (Cookie Pets Feeder)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">双指针贪心经典 LeetCode 455</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      你经营着一家温馨的萌宠餐厅，排队的小动物（仓鼠、猫咪、柴犬、熊猫、棕熊）各自拥有不同的胃口需求 $g[i]$。托盘里烘焙了不同尺寸的香脆饼干 $s[j]$。如何利用<b>双排序 + 双指针贪心匹配</b>喂饱尽可能多的萌宠？
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 餐厅投喂玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🍪 60 FPS 投喂动画</b>：饼干飞入口中，萌宠冒爱心咀嚼；</li>
          <li><b>👉 双指针高亮</b>：实时观察萌宠指针与饼干指针的步进；</li>
          <li><b>✨ 贪心启示之眼</b>：一键全自动最优投喂并结算满意度。</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 核心贪心证明</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>最小饼干配小胃口</b>：切勿大材小用，将大饼干浪费在小胃口萌宠上；</li>
          <li><b>时间复杂度</b>：排序 $O(N \\log N + M \\log M)$，双指针扫描 $O(N + M)$。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const COOKIE_FEEDER_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">双指针贪心分配证明</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 为什么必须将萌宠和饼干分别排序？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        通过升序排序后，两个序列都具备了单调性。对于当前胃口最小的萌宠 $g[i]$，我们寻找满足 $s[j] \\ge g[i]$ 的<b>最小饼干</b> $s[j]$。这样既满足了当前萌宠，又将更大的饼干留给后续胃口更大的萌宠，从而达到全局最大满意数！
      </p>
    </div>
  </div>
`;
