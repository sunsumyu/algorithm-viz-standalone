/**
 * 前缀优化建图与线性边数压缩 (Prefix Optimization Graph Building)
 * 进阶图论: 至多选一限制、朴素 O(k^2) 边数爆炸、前缀链辅助点、O(k) 线性边数极致压缩 (洛谷 P6378 [PA2010] Riddle)
 */

export const PREFIX_OPT_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 前缀优化建图 (洛谷 P6378 [PA2010] Riddle / 2-SAT 建图优化)',
    '// 核心：将区间至多选一的 O(k^2) 条边压缩为前缀辅助链的 O(k) 条边',
    'class PrefixOptGraph {',
    'public:',
    '    int n;',
    '    vector<vector<int>> adj;',
    '    ',
    '    PrefixOptGraph(int totalNodes) : n(totalNodes), adj(totalNodes + 1) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '    }',
    '    ',
    '    // 对变量序列 u[0..k-1] 建立至多选一约束 (O(k) 边数)',
    '    // pre[i] 表示前缀中是否有选，suf[i] 表示后缀中是否有选',
    '    void buildAtMostOnePrefix(const vector<int>& vars, const vector<int>& pre) {',
    '        int k = vars.size();',
    '        for (int i = 0; i < k; ++i) {',
    '            int u = vars[i];',
    '            // 1. u_i -> pre_i',
    '            addEdge(u, pre[i]);',
    '            // 2. pre_{i-1} -> pre_i',
    '            if (i > 0) addEdge(pre[i - 1], pre[i]);',
    '            // 3. u_i -> ~pre_{i-1} (选了 u_i，则前 i-1 个都不能选)',
    '            if (i > 0) addEdge(u, pre[i - 1] ^ 1);',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package advanced_graph;',
    '',
    'import java.util.*;',
    '',
    '// 前缀优化建图',
    'public class Code02_PrefixOptimizationGraph {',
    '    public static List<Integer>[] adj;',
    '    public static void buildAtMostOne(int[] vars, int[] pre) {}',
    '}',
  ],
  python: [
    '# 前缀优化建图 (Python 版)',
    'def build_at_most_one(vars, pre, add_edge):',
    '    k = len(vars)',
    '    for i in range(k):',
    '        add_edge(vars[i], pre[i])',
    '        if i > 0:',
    '            add_edge(pre[i-1], pre[i])',
    '            add_edge(vars[i], pre[i-1] ^ 1)',
  ],
  javascript: [
    '// 前缀优化建图 (JavaScript 版)',
    'function buildAtMostOne(vars, pre, addEdge) {',
    '  const k = vars.length;',
    '  for (let i = 0; i < k; i++) {',
    '    addEdge(vars[i], pre[i]);',
    '    if (i > 0) {',
    '      addEdge(pre[i - 1], pre[i]);',
    '      addEdge(vars[i], pre[i - 1] ^ 1);',
    '    }',
    '  }',
    '}',
  ],
};

export const PREFIX_OPT_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌐 前缀优化建图 (Prefix Optimization Graph Building)</h3>
    <p>
      在图论与 2-SAT 建模中，经常遇到约束条件：<b>“某集合中的 $k$ 个元素至多只能选一个”</b>。若使用朴素两两连边，边数将达到 $O(k^2)$，当 $k = 10^5$ 时图将彻底爆炸。通过引入<b>前缀辅助点链</b>，可以将边数压缩至严格 $O(k)$（洛谷 P6378 [PA2010] Riddle）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">⚡ 前缀链三原则</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>当前激活前缀</b>：$u_i \\to Pre_i$；<br/>
        2. <b>前缀继承链</b>：$Pre_{i-1} \\to Pre_i$；<br/>
        3. <b>逆向禁止</b>：$u_i \\to \\neg Pre_{i-1}$（若选 $u_i$，则前缀中不允许有任何节点被选）。
      </div>
    </div>
  </div>
`;

export const PREFIX_OPT_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 线性边数压缩的数学本质</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 边数从 O(k²) 降为 3k 条</div>
      <div style="font-size: 12px; color: #1e40af;">
        每个实体变量仅产生 3 条有向边，总边数严格为 $3k - 2$ 条！即使 $k = 10^5$，边数也仅有约 $3 \\times 10^5$ 条，内存占用极低。
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 树状数组 / 线段树优化建图拓展</div>
      <div style="font-size: 12px; color: #15803d;">
        前缀优化建图是一维区间的特例。若要求任意区间 $[l, r]$ 连边，可用线段树节点作为虚拟中继，将边数压缩至 $O(m \\log n)$！
      </div>
    </div>
  </div>
`;
