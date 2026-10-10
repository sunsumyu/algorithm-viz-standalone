/**
 * 并查集理论基础 (Union-Find Theory) — 讲义与四语言代码
 */

export const UNION_FIND_THEORY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    '// === 并查集核心模板 (Java - 路径压缩 + 按秩合并) ===',
    'public class UnionFind {',
    '    private int[] parent, rank;',
    '    private int count;',
    '    public UnionFind(int n) {',
    '        parent = new int[n]; rank = new int[n]; count = n;',
    '        for (int i = 0; i < n; i++) parent[i] = i;',
    '    }',
    '    // 查找代表元 (路径压缩扁平化树高)',
    '    public int find(int x) {',
    '        if (parent[x] != x) {',
    '            parent[x] = find(parent[x]); // 路径压缩',
    '        }',
    '        return parent[x];',
    '    }',
    '    // 合并两个集合 (按秩合并: 小树挂大树)',
    '    public boolean union(int x, int y) {',
    '        int rootX = find(x), rootY = find(y);',
    '        if (rootX == rootY) return false;',
    '        if (rank[rootX] < rank[rootY]) {',
    '            parent[rootX] = rootY;',
    '        } else if (rank[rootX] > rank[rootY]) {',
    '            parent[rootY] = rootX;',
    '        } else {',
    '            parent[rootX] = rootY;',
    '            rank[rootY]++;',
    '        }',
    '        count--;',
    '        return true;',
    '    }',
    '}',
  ],
  cpp: [
    '// === 并查集核心模板 (C++ - 路径压缩 + 按秩合并) ===',
    'class UnionFind {',
    '    vector<int> parent, rank;',
    '    int count;',
    'public:',
    '    UnionFind(int n) : parent(n), rank(n, 0), count(n) {',
    '        iota(parent.begin(), parent.end(), 0);',
    '    }',
    '    // 查找代表元 (路径压缩)',
    '    int find(int x) {',
    '        if (parent[x] != x)',
    '            parent[x] = find(parent[x]);',
    '        return parent[x];',
    '    }',
    '    // 合并两个集合 (按秩合并)',
    '    bool unite(int x, int y) {',
    '        int rootX = find(x), rootY = find(y);',
    '        if (rootX == rootY) return false;',
    '        if (rank[rootX] < rank[rootY]) parent[rootX] = rootY;',
    '        else if (rank[rootX] > rank[rootY]) parent[rootY] = rootX;',
    '        else { parent[rootX] = rootY; rank[rootY]++; }',
    '        count--;',
    '        return true;',
    '    }',
    '};',
  ],
  python: [
    '# === 并查集核心模板 (Python - 路径压缩 + 按秩合并) ===',
    'class UnionFind:',
    '    def __init__(self, n: int):',
    '        self.parent = list(range(n))',
    '        self.rank = [0] * n',
    '        self.count = n',
    '    # 查找代表元 (路径压缩)',
    '    def find(self, x: int) -> int:',
    '        if self.parent[x] != x:',
    '            self.parent[x] = self.find(self.parent[x])',
    '        return self.parent[x]',
    '    # 合并两个集合 (按秩合并)',
    '    def union(self, x: int, y: int) -> bool:',
    '        root_x, root_y = self.find(x), self.find(y)',
    '        if root_x == root_y:',
    '            return False',
    '        if self.rank[root_x] < self.rank[root_y]:',
    '            self.parent[root_x] = root_y',
    '        elif self.rank[root_x] > self.rank[root_y]:',
    '            self.parent[root_y] = root_x',
    '        else:',
    '            self.parent[root_x] = root_y',
    '            self.rank[root_y] += 1',
    '        self.count -= 1',
    '        return True',
  ],
  javascript: [
    '// === 并查集核心模板 (JavaScript - 路径压缩 + 按秩合并) ===',
    'class UnionFind {',
    '  constructor(n) {',
    '    this.parent = Array.from({ length: n }, (_, i) => i);',
    '    this.rank = new Array(n).fill(0);',
    '    this.count = n;',
    '  }',
    '  // 查找代表元 (路径压缩)',
    '  find(x) {',
    '    if (this.parent[x] !== x) {',
    '      this.parent[x] = this.find(this.parent[x]);',
    '    }',
    '    return this.parent[x];',
    '  }',
    '  // 合并两个集合 (按秩合并)',
    '  union(x, y) {',
    '    const rootX = this.find(x), rootY = this.find(y);',
    '    if (rootX === rootY) return false;',
    '    if (this.rank[rootX] < this.rank[rootY]) {',
    '      this.parent[rootX] = rootY;',
    '    } else if (this.rank[rootX] > this.rank[rootY]) {',
    '      this.parent[rootY] = rootX;',
    '    } else {',
    '      this.parent[rootX] = rootY;',
    '      this.rank[rootY]++;',
    '    }',
    '    this.count--;',
    '    return true;',
    '  }',
    '}',
  ],
};

export const UNION_FIND_THEORY_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; font-size: 11px; border: 1px solid rgba(56, 189, 248, 0.3);">理论基石</span>
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700; font-size: 11px; border: 1px solid rgba(16, 185, 129, 0.3);">双重优化</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">并查集基础原理 (Union-Find Disjoint Set)</span>
    </div>
    <p style="margin: 0;">
      并查集是一种树型数据结构，用于处理集合的合并及查询问题。核心提供两大操作：
      <code style="color: #38bdf8; font-family: monospace;">find(x)</code> 返回元素所在集合代表元；
      <code style="color: #34d399; font-family: monospace;">union(x, y)</code> 合并两个集合。
    </p>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.3); border-left: 4px solid #38bdf8; padding: 10px 14px; border-radius: 6px;">
      <div style="font-weight: 700; color: #38bdf8; margin-bottom: 6px;">⚡ 两大核心优化原理</div>
      <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
        <div>1. <b>路径压缩 (Path Compression)</b>：在 <code>find</code> 递归向上查找根节点时，将沿途所有节点直接挂载到根节点下，下次查询变为 $O(1)$！</div>
        <div>2. <b>按秩合并 (Union by Rank)</b>：合并时将树高较小的小树挂载到树高较大的大树下，避免树退化为长链。</div>
        <div>3. <b>综合复杂度</b>：双优化下，单次操作时间复杂度为反阿克曼函数 $O(\\alpha(n))$，在全宇宙原子数量级输入下 $\\alpha(n) \\le 4$。</div>
      </div>
    </div>
  </div>
`;

export const UNION_FIND_THEORY_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(52, 211, 153, 0.15); color: #34d399; font-weight: 700; font-size: 11px; border: 1px solid rgba(52, 211, 153, 0.3);">应用场景指南</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">并查集典型题型矩阵</span>
    </div>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(16, 185, 129, 0.25); border-left: 4px solid #10b981; border-radius: 6px; padding: 10px 14px;">
      <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">🌲 工业级与高频面试应用</div>
      <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
        <div>• <b>动态图判环</b>：新加边 $(u, v)$ 前，若 <code>find(u) == find(v)</code>，则必然成环 (LeetCode 684)</div>
        <div>• <b>Kruskal 最小生成树</b>：贪心加边时，并查集高效杜绝生成树出现回路</div>
        <div>• <b>网格连通块合并</b>：岛屿数量、水流汇聚、移除多余边等连通性维护</div>
        <div>• <b>二分图染色检测</b>：带权并查集 (差分并查集) 维护奇偶冲突关系</div>
      </div>
    </div>
  </div>
`;
