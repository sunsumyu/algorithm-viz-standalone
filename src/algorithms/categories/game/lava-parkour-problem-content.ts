/**
 * 熔岩跑酷·单调栈跳跃者 (Monotonic Stack Lava Parkour)
 * 经典单调栈（Monotonic Stack）、下一个更大元素（Next Greater Element）与柱状图最大矩形深度题解
 */

export const LAVA_PARKOUR_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <stack>',
    'using namespace std;',
    '',
    '// 单调递减栈：求每个柱子右侧第一个更高柱子的索引（下一个更大元素 NGE）',
    'vector<int> nextGreaterElement(const vector<int>& heights) {',
    '    int n = heights.size();',
    '    vector<int> result(n, -1);',
    '    stack<int> st; // 存储柱子下标，栈内对应高度单调递减',
    '',
    '    for (int i = 0; i < n; i++) {',
    '        // 当发现更高柱子时，持续弹出栈顶较矮柱子并记录答案',
    '        while (!st.empty() && heights[i] > heights[st.top()]) {',
    '            result[st.top()] = i; // 栈顶柱子的跳跃目标就是 i',
    '            st.pop();',
    '        }',
    '        st.push(i);',
    '    }',
    '    return result;',
    '}',
    '',
    '// 单调栈求解柱状图中最大的矩形 (Largest Rectangle in Histogram)',
    'int largestRectangleArea(vector<int>& heights) {',
    '    heights.push_back(0); // 哨兵元素',
    '    stack<int> st;',
    '    int maxArea = 0;',
    '    for (int i = 0; i < heights.size(); i++) {',
    '        while (!st.empty() && heights[i] < heights[st.top()]) {',
    '            int h = heights[st.top()]; st.pop();',
    '            int w = st.empty() ? i : i - st.top() - 1;',
    '            maxArea = max(maxArea, h * w);',
    '        }',
    '        st.push(i);',
    '    }',
    '    return maxArea;',
    '}',
  ],
  java: [
    'import java.util.*;',
    '',
    'public class MonotonicStackSolver {',
    '    // 单调栈求解下一个更大元素',
    '    public static int[] nextGreaterElements(int[] heights) {',
    '        int n = heights.length;',
    '        int[] res = new int[n];',
    '        Arrays.fill(res, -1);',
    '        Deque<Integer> stack = new ArrayDeque<>();',
    '',
    '        for (int i = 0; i < n; i++) {',
    '            while (!stack.isEmpty() && heights[i] > heights[stack.peek()]) {',
    '                res[stack.pop()] = i;',
    '            }',
    '            stack.push(i);',
    '        }',
    '        return res;',
    '    }',
    '}',
  ],
  python: [
    'def next_greater_elements(heights: list[int]) -> list[int]:',
    '    """单调递减栈：O(N) 线性时间求每个石柱右侧下一个更高跳跃点"""',
    '    n = len(heights)',
    '    res = [-1] * n',
    '    stack = []  # 栈底到栈顶单调递减',
    '',
    '    for i in range(n):',
    '        while stack and heights[i] > heights[stack[-1]]:',
    '            prev_idx = stack.pop()',
    '            res[prev_idx] = i',
    '        stack.append(i)',
    '',
    '    return res',
  ],
  javascript: [
    '// 单调栈实时跳跃路径求解',
    'function solveLavaJumpTargets(heights) {',
    '  const res = new Array(heights.length).fill(-1);',
    '  const stack = [];',
    '  for (let i = 0; i < heights.length; i++) {',
    '    while (stack.length > 0 && heights[i] > heights[stack[stack.length - 1]]) {',
    '      res[stack.pop()] = i;',
    '    }',
    '    stack.push(i);',
    '  }',
    '  return res;',
    '}',
  ],
};

export const LAVA_PARKOUR_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">🌋</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">熔岩跑酷·单调栈跳跃者 (Monotonic Stack Lava Escape)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">单调栈核心</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      脚下的地牢正被滚烫的熔岩逐渐淹没！勇士站在参差不齐的玄武岩石柱阵前。由于岩浆不断上升，勇士只能借助<b>单调栈（Monotonic Stack）</b>精准锁定前方<b>「下一个更高石柱（Next Greater Pillar）」</b>或<b>「最大连通安全平台」</b>完成致命飞跃！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 跑酷与弹跳玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🏃‍♂️ 60 FPS 物理跳跃</b>：按空格键沿单调栈指示弧线腾空飞跃；</li>
          <li><b>🌋 动态上升熔岩</b>：较矮的石柱会随时间被岩浆吞噬淘汰；</li>
          <li><b>✨ 单调栈透视</b>：实时观察栈内元素的入栈、弹栈与对齐。</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 核心算法原理</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>单调递减栈</b>：保证每个元素在入栈时，栈顶元素都严格大于当前元素；</li>
          <li><b>$O(N)$ 线性时间</b>：每个石柱最多入栈 1 次、出栈 1 次；</li>
          <li><b>经典拓展</b>：每日温度、接雨水、柱状图中最大的矩形。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const LAVA_PARKOUR_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">单调栈维护与跳跃关系解析</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 为什么暴力查找是 $O(N^2)$ 而单调栈只需 $O(N)$？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        暴力做法为每个石柱向后线性扫描，最坏需要比对 $N(N-1)/2$ 次；单调栈利用了「及时排除不可能选项」的贪心性质：当遇到更高的石柱时，前面所有比它矮的石柱的下一个更大元素必然就是当前石柱，直接弹栈记录，均摊复杂度仅为 $O(1)$！
      </p>
    </div>
  </div>
`;
