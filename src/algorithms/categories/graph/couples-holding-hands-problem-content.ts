/**
 * 情侣牵手与并查集连通环置换 (Couples Holding Hands / Union-Find Permutation Cycles)
 * 参考左程云《算法通关课》【必备篇】class056: 置换环分解定理、最少交换次数 N - Sets (LeetCode 765)
 */

export const COUPLES_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <numeric>',
    'using namespace std;',
    '',
    '// 并查集结构',
    'struct UnionFind {',
    '    vector<int> parent;',
    '    int sets;',
    '    UnionFind(int n) : parent(n), sets(n) {',
    '        iota(parent.begin(), parent.end(), 0);',
    '    }',
    '    int find(int i) {',
    '        if (i != parent[i]) parent[i] = find(parent[i]);',
    '        return parent[i];',
    '    }',
    '    void unite(int a, int b) {',
    '        int ra = find(a), rb = find(b);',
    '        if (ra != rb) {',
    '            parent[ra] = rb;',
    '            sets--;',
    '        }',
    '    }',
    '};',
    '',
    '// 情侣牵手最少交换次数 = N - 连通分量数',
    'int minSwapsCouples(vector<int>& row) {',
    '    int m = row.size();',
    '    int n = m / 2;',
    '    UnionFind uf(n);',
    '    ',
    '    for (int i = 0; i < m; i += 2) {',
    '        uf.unite(row[i] / 2, row[i + 1] / 2);',
    '    }',
    '    ',
    '    return n - uf.sets;',
    '}',
  ],
  java: [
    'package class056;',
    '',
    '// 情侣牵手 (LeetCode 765) - 左程云标准并查集置换环实现',
    'public class Code03_CouplesHoldingHands {',
    '    public static int[] parent = new int[35];',
    '    public static int sets;',
    '    ',
    '    public static void build(int n) {',
    '        for (int i = 0; i < n; i++) parent[i] = i;',
    '        sets = n;',
    '    }',
    '    ',
    '    public static int find(int i) {',
    '        if (i != parent[i]) parent[i] = find(parent[i]);',
    '        return parent[i];',
    '    }',
    '    ',
    '    public static void union(int x, int y) {',
    '        int fx = find(x), fy = find(y);',
    '        if (fx != fy) {',
    '            parent[fx] = fy;',
    '            sets--;',
    '        }',
    '    }',
    '    ',
    '    public static int minSwapsCouples(int[] row) {',
    '        int n = row.length / 2;',
    '        build(n);',
    '        for (int i = 0; i < row.length; i += 2) {',
    '            union(row[i] / 2, row[i + 1] / 2);',
    '        }',
    '        return n - sets;',
    '    }',
    '}',
  ],
  python: [
    'class UnionFind:',
    '    def __init__(self, n: int):',
    '        self.parent = list(range(n))',
    '        self.sets = n',
    '        ',
    '    def find(self, i: int) -> int:',
    '        if self.parent[i] != i:',
    '            self.parent[i] = self.find(self.parent[i])',
    '        return self.parent[i]',
    '        ',
    '    def union(self, x: int, y: int):',
    '        fx, fy = self.find(x), self.find(y)',
    '        if fx != fy:',
    '            self.parent[fx] = fy',
    '            self.sets -= 1',
    '',
    'def min_swaps_couples(row: list[int]) -> int:',
    '    n = len(row) // 2',
    '    uf = UnionFind(n)',
    '    for i in range(0, len(row), 2):',
    '        uf.union(row[i] // 2, row[i + 1] // 2)',
    '    return n - uf.sets',
  ],
  javascript: [
    '// 情侣牵手并查集置换算法 (JavaScript 版)',
    'function minSwapsCouples(row) {',
    '  const n = row.length / 2;',
    '  const parent = Array.from({ length: n }, (_, i) => i);',
    '  let sets = n;',
    '  ',
    '  function find(i) {',
    '    if (parent[i] !== i) parent[i] = find(parent[i]);',
    '    return parent[i];',
    '  }',
    '  ',
    '  function union(x, y) {',
    '    const fx = find(x), fy = find(y);',
    '    if (fx !== fy) {',
    '      parent[fx] = fy;',
    '      sets--;',
    '    }',
    '  }',
    '  ',
    '  for (let i = 0; i < row.length; i += 2) {',
    '    union(Math.floor(row[i] / 2), Math.floor(row[i + 1] / 2));',
    '  }',
    '  ',
    '  return n - sets;',
    '}',
  ],
};

export const COUPLES_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💑 情侣牵手 (LeetCode 765 / 并查集置换环分解)</h3>
    <p>
      <code>n</code> 对情侣坐在连续排列的 <code>2n</code> 个座位上。情侣编号配对规则为：
      第 0 对是 <code>(0, 1)</code>，第 1 对是 <code>(2, 3)</code>，依此类推，每个人 <code>x</code> 属于第 <code>⌊x / 2⌋</code> 对情侣。
    </p>
    <p>
      座位以双人沙发两两相邻（即位置 <code>(0, 1)</code>, <code>(2, 3)</code>, ...）。每次你可以挑选任意两个人交换座位。请计算让<b>所有情侣都能并肩坐在一起</b>所需的<b>最少交换次数</b>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📥 输入示例</div>
      <div style="font-family: monospace; font-size: 12px; color: #0f172a;">
        row = [0, 2, 1, 3]  (共 2 对情侣: 0号对和1号对)
      </div>
      <div style="font-weight: 700; color: #15803d; margin-top: 6px;">📤 输出示例: <code>1</code></div>
      <div style="font-size: 11px; color: #64748b;">
        解释：只需交换 row[1] 和 row[2] (即 2 与 1)，座位变为 [0, 1, 2, 3]，两对情侣均并肩牵手成功！
      </div>
    </div>
  </div>
`;

export const COUPLES_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云置换环定理：最少交换次数 = N - Sets</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么把情侣对视作并查集节点？</div>
      <div style="font-size: 12px; color: #1e40af;">
        每个相邻沙发坐在 $(row[2i], row[2i+1])$ 的两人，代表情侣组 $u = \lfloor row[2i]/2 \rfloor$ 与 $v = \lfloor row[2i+1]/2 \rfloor$ 发生了关联。<br/>
        若 $u = v$，这对情侣天然坐在一起，无需任何交换；若 $u \ne v$，说明不同情侣被错误地绑在了一张双人座上，建立边 $u \leftrightarrow v$。
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 置换环大小与最少交换次数公式</div>
      <div style="font-size: 12px; color: #15803d;">
        在置换群论中，一个包含 $K$ 个节点的错位连通环，只需**严格 $K - 1$ 次精准交换**即可把该环完全拆解为 $K$ 个自环（全部复原）。<br/>
        因此，全部 $N$ 对情侣构成的连通分量总数为 $Sets$，全局最少交换次数为：<br/>
        $$\sum (K_i - 1) = \sum K_i - \sum 1 = N - Sets$$
      </div>
    </div>
  </div>
`;

export const COUPLES_HOLDING_HANDS_CODE_LANGUAGES = COUPLES_CODE_LANGUAGES;
export const COUPLES_HOLDING_HANDS_PROBLEM_HTML = COUPLES_PROBLEM_HTML;
export const COUPLES_HOLDING_HANDS_ANALYSIS_HTML = COUPLES_ANALYSIS_HTML;
