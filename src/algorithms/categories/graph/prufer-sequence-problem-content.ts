/**
 * Prufer 序列与 Cayley 公式 (Prufer Sequence & Cayley's Formula)
 * 进阶图论: 树转 Prufer 序列 (度数-1 次数)、Prufer 序列逆向重构树、双射与 n^(n-2) Cayley 公式 (洛谷 P6086)
 */

export const PRUFER_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// Prufer 序列编码与解码 (洛谷 P6086)',
    '// 核心：度数统计，双指针/堆维护最小叶子，双射 Cayley 公式 n^(n-2)',
    'class PruferSequence {',
    'public:',
    '    int n;',
    '    vector<int> parent; // parent[u] = 父亲节点 (以 n 为根)',
    '    vector<int> deg, prufer;',
    '    ',
    '    PruferSequence(int n) : n(n), parent(n + 1, 0), deg(n + 1, 0) {}',
    '    ',
    '    // 1. 树转 Prufer 序列 (O(n) 线性双指针算法)',
    '    vector<int> treeToPrufer() {',
    '        for (int i = 1; i < n; ++i) deg[parent[i]]++;',
    '        prufer.clear();',
    '        for (int i = 1, ptr = 1; i <= n - 2; ++i) {',
    '            while (deg[ptr] > 0) ptr++;',
    '            int fa = parent[ptr];',
    '            prufer.push_back(fa);',
    '            while (i <= n - 2 && --deg[fa] == 0 && fa < ptr) {',
    '                prufer.push_back(parent[fa]);',
    '                fa = parent[fa];',
    '                ++i;',
    '            }',
    '            ptr++;',
    '        }',
    '        return prufer;',
    '    }',
    '    ',
    '    // 2. Prufer 序列转树 (还原 parent 数组)',
    '    vector<int> pruferToTree(const vector<int>& p) {',
    '        fill(deg.begin(), deg.end(), 0);',
    '        for (int x : p) deg[x]++;',
    '        for (int i = 1, ptr = 1; i <= n - 2; ++i) {',
    '            while (deg[ptr] > 0) ptr++;',
    '            int fa = p[i - 1];',
    '            parent[ptr] = fa;',
    '            while (i <= n - 2 && --deg[fa] == 0 && fa < ptr) {',
    '                parent[fa] = p[i];',
    '                fa = p[i];',
    '                ++i;',
    '            }',
    '            ptr++;',
    '        }',
    '        return parent;',
    '    }',
    '};',
  ],
  java: [
    'package advanced_tree;',
    '',
    'import java.util.*;',
    '',
    '// Prufer 序列标准实现与线性编解码',
    'public class Code01_PruferSequence {',
    '    public static int n;',
    '    public static int[] parent, deg, prufer;',
    '}',
  ],
  python: [
    'class PruferSequence:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.parent = [0] * (n + 1)',
    '        self.deg = [0] * (n + 1)',
    '        ',
    '    def tree_to_prufer(self, parent: list[int]) -> list[int]:',
    '        deg = [0] * (self.n + 1)',
    '        for i in range(1, self.n):',
    '            deg[parent[i]] += 1',
    '        prufer = []',
    '        for _ in range(self.n - 2):',
    '            # 找到度数为 0 的最小叶子',
    '            leaf = next(i for i in range(1, self.n + 1) if deg[i] == 0)',
    '            prufer.append(parent[leaf])',
    '            deg[leaf] = -1',
    '            deg[parent[leaf]] -= 1',
    '        return prufer',
  ],
  javascript: [
    '// Prufer 序列 (JavaScript 版)',
    'class PruferSequence {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.parent = Array(n + 1).fill(0);',
    '    this.deg = Array(n + 1).fill(0);',
    '  }',
    '}',
  ],
};

export const PRUFER_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">📼 Prufer 序列与 Cayley 公式 (Prufer Sequence)</h3>
    <p>
      <b>Prufer 序列</b>可以将一棵带标号的 $n$ 节点无根树唯一编码为一个长度为 $n-2$ 的整数序列，并在两者之间建立严格的<b>一一双射</b>关系（洛谷 P6086）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🌲 编码规则 (Tree → Prufer)</div>
      <div style="font-size: 11.5px; color: #334155;">
        每次挑选当前树中<b>编号最小的叶子节点</b>，将其相邻的唯一父亲/邻居节点写入序列末尾，然后将该叶子从树中删除。重复 $n-2$ 次即可获得唯一的 Prufer 序列。
      </div>
    </div>

    <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #065f46; margin-bottom: 4px;">✨ 关键性质与 Cayley 公式</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. 节点 $i$ 在 Prufer 序列中出现的次数恰好等于 $\\text{deg}[i] - 1$；<br/>
        2. 长度为 $n-2$ 的序列每个位置均可任取 $[1, n]$ 中任意整数，故 $n$ 个有标号节点的无根树总数恰为 <b>$n^{n-2}$ 种 (Cayley 公式)</b>！
      </div>
    </div>
  </div>
`;

export const PRUFER_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 线性 O(n) 双指针编解码技巧</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 摆脱堆的 O(n log n) 开销</div>
      <div style="font-size: 12px; color: #1e40af;">
        用单调递增指针 <code>ptr</code> 扫描最小叶子。当删除叶子导致其父亲 <code>fa</code> 的度数减为 0 时：若 <code>fa &lt; ptr</code>，则 <code>fa</code> 必然就是当前全局最小叶子，可直接继续剔除，避免重新从头查找，指针总移动次数为 $O(n)$！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 生成树计数与连通度统计</div>
      <div style="font-size: 12px; color: #15803d;">
        在满足各点度数限制 $d_i$ 下生成树数量为多项式系数 $\\frac{(n-2)!}{\\prod (d_i - 1)!}$，在化学分子式异构体计数、矩阵树定理证明中起核心桥梁作用！
      </div>
    </div>
  </div>
`;
