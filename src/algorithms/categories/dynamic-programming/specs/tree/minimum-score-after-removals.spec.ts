import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

export interface MinimumScoreInput {
  nums?: number[];
  edges?: number[][];
}

/**
 * 从树中删除边的最小分数 (Minimum Score After Removals on a Tree)
 * LeetCode 2322 / 左程云算法通关课 第079讲 树型DP下 Code04
 *
 * 核心考点：
 * 树的先序 DFS 序（DFN 序）拓扑关系判断 + 子树异或前缀和。
 * 1. 定根以 0 为根建树，DFS 预处理每个节点的 DFN 序号、子树大小 size 以及子树节点异或总和 xor。
 * 2. 删两条边等价于切掉两棵分别以 a 和 b 为根的子树。
 * 3. 利用 DFN 区间 O(1) 判定 a 与 b 的树上包含关系（祖先-后代关系 vs 并列分支关系），
 *    瞬间推算出 3 个连通块各自的异或和并求极差更新全局最优解。
 */
export const MinimumScoreAfterRemovalsSpec: AlgorithmSpec = {
  id: 'minimum-score-after-removals',
  name: '从树中删除边的最小分数 (Minimum Score After Tree Edge Removals)',
  category: '树型 DP',
  description:
    '高阶树型DP与拓扑关系判定技巧。从无向带权树中删除两条边拆分成 3 个连通块，每个连通块的分数为其所有节点值的异或和，求最大与最小异或和差值的最小值。利用 DFN 序在 O(1) 内判定切除子树的包含与并列关系，O(n^2) 枚举完成求解。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 2322,
    leetcodeUrl: 'https://leetcode.cn/problems/minimum-score-after-removals-on-a-tree/',
    difficulty: 'hard',
    tags: ['树', '深度优先搜索', '位运算', '动态规划', '树型DP', 'DFN序'],
    description:
      '存在一棵无向连通树，树中有编号从 <code>0</code> 到 <code>n-1</code> 的 <code>n</code> 个节点，以及 <code>n-1</code> 条边。<br/><br/>给你一个下标从 0 开始的整数数组 <code>nums</code>，其中 <code>nums[i]</code> 表示第 <code>i</code> 个节点的值。另给你一个二维整数数组 <code>edges</code>，其中 <code>edges[i] = [ai, bi]</code> 表示树中一条边。<br/><br/>删除树中两条 <strong>不同</strong> 的边以形成三个连通块，定义每个连通块的分数为其节点值的 <strong>异或和</strong>。最大异或和与最小异或和的 <strong>差值</strong> 就是该删除方案的分数。<br/>请返回所有删除边方案中可能的 <strong>最小分数</strong>。',
    examples: [
      {
        input: 'nums = [1, 5, 5, 4, 11], edges = [[0, 1], [1, 2], [1, 3], [3, 4]]',
        output: '9',
        explanation: '删除边 [0, 1] 和 [1, 2]：3 个连通块分别为 {0}（异或和 1）、{2}（异或和 5）、{1, 3, 4}（异或和 5^4^11 = 10）。差值为 10 - 1 = 9。',
      },
      {
        input: 'nums = [5, 5, 2, 4, 4, 2], edges = [[0, 1], [1, 2], [5, 2], [4, 3], [1, 3]]',
        output: '0',
        explanation: '删除边 [0, 1] 和 [4, 3]：3 个连通块的异或和分别为 5, 5, 5，差值为 5 - 5 = 0。',
      },
    ],
    constraints: [
      'n == nums.length',
      '3 <= n <= 1000',
      '1 <= nums[i] <= 10^8',
      'edges.length == n - 1',
      'edges[i].length == 2',
      '0 <= ai, bi < n',
      '输入保证 edges 构成一棵有效的树',
    ],
  },
  semanticLines: {
    entry: { java: 3, cpp: 4, python: 2, javascript: 1 },
    guard: { java: 40, cpp: 16, python: 18, javascript: 17 },
    init: { java: 11, cpp: 11, python: 8, javascript: 8 },
    stateTransfer: {
      java: [23, 24, 25, 26, 27, 28, 29, 30],
      cpp: [27, 28, 29, 30, 31, 32, 33, 34],
      python: [27, 28, 29, 30, 31, 32, 33, 34],
      javascript: [27, 28, 29, 30, 31, 32, 33, 34],
    },
    returnResult: { java: 35, cpp: 39, python: 39, javascript: 40 },
  },
  code: {
    languages: {
      javascript: [
        'function minimumScore(nums, edges) {',
        '    const n = nums.length;',
        '    const tree = Array.from({ length: n }, () => []);',
        '    for (const [u, v] of edges) {',
        '        tree[u].push(v);',
        '        tree[v].push(u);',
        '    }',
        '    const dfn = new Array(n).fill(0);',
        '    const size = new Array(n).fill(0);',
        '    const xor = new Array(n).fill(0);',
        '    let dfnCnt = 0;',
        '    function dfs(u, p) {',
        '        dfn[u] = dfnCnt++;',
        '        size[u] = 1; xor[u] = nums[u];',
        '        for (const v of tree[u]) {',
        '            if (v !== p) {',
        '                dfs(v, u);',
        '                size[u] += size[v];',
        '                xor[u] ^= xor[v];',
        '            }',
        '        }',
        '    }',
        '    dfs(0, -1);',
        '    const allXor = xor[0], m = edges.length;',
        '    const edgeEnds = edges.map(([u, v]) => dfn[u] > dfn[v] ? u : v);',
        '    let ans = Infinity;',
        '    for (let i = 0; i < m; i++) {',
        '        const a = edgeEnds[i];',
        '        for (let j = i + 1; j < m; j++) {',
        '            const b = edgeEnds[j];',
        '            let x1, x2, x3;',
        '            if (dfn[a] <= dfn[b] && dfn[b] < dfn[a] + size[a]) {',
        '                x1 = xor[b]; x2 = xor[a] ^ xor[b]; x3 = allXor ^ xor[a];',
        '            } else if (dfn[b] <= dfn[a] && dfn[a] < dfn[b] + size[b]) {',
        '                x1 = xor[a]; x2 = xor[b] ^ xor[a]; x3 = allXor ^ xor[b];',
        '            } else {',
        '                x1 = xor[a]; x2 = xor[b]; x3 = allXor ^ xor[a] ^ xor[b];',
        '            }',
        '            ans = Math.min(ans, Math.max(x1, x2, x3) - Math.min(x1, x2, x3));',
        '        }',
        '    }',
        '    return ans;',
        '}',
      ],
      java: [
        'class Solution {',
        '    private int dfnCnt = 0;',
        '    public int minimumScore(int[] nums, int[][] edges) {',
        '        int n = nums.length;',
        '        List<Integer>[] tree = new ArrayList[n];',
        '        for (int i = 0; i < n; i++) tree[i] = new ArrayList<>();',
        '        for (int[] e : edges) {',
        '            tree[e[0]].add(e[1]); tree[e[1]].add(e[0]);',
        '        }',
        '        int[] dfn = new int[n], size = new int[n], xor = new int[n];',
        '        dfs(0, -1, tree, nums, dfn, size, xor);',
        '        int allXor = xor[0], m = edges.length;',
        '        int[] edgeEnds = new int[m];',
        '        for (int k = 0; k < m; k++) {',
        '            int u = edges[k][0], v = edges[k][1];',
        '            edgeEnds[k] = dfn[u] > dfn[v] ? u : v;',
        '        }',
        '        int ans = Integer.MAX_VALUE;',
        '        for (int i = 0; i < m; i++) {',
        '            int a = edgeEnds[i];',
        '            for (int j = i + 1; j < m; j++) {',
        '                int b = edgeEnds[j];',
        '                int x1, x2, x3;',
        '                if (dfn[a] <= dfn[b] && dfn[b] < dfn[a] + size[a]) {',
        '                    x1 = xor[b]; x2 = xor[a] ^ xor[b]; x3 = allXor ^ xor[a];',
        '                } else if (dfn[b] <= dfn[a] && dfn[a] < dfn[b] + size[b]) {',
        '                    x1 = xor[a]; x2 = xor[b] ^ xor[a]; x3 = allXor ^ xor[b];',
        '                } else {',
        '                    x1 = xor[a]; x2 = xor[b]; x3 = allXor ^ xor[a] ^ xor[b];',
        '                }',
        '                ans = Math.min(ans, Math.max(x1, Math.max(x2, x3)) - Math.min(x1, Math.min(x2, x3)));',
        '            }',
        '        }',
        '        return ans;',
        '    }',
        '    private void dfs(int u, int p, List<Integer>[] tree, int[] nums, int[] dfn, int[] size, int[] xor) {',
        '        dfn[u] = dfnCnt++; size[u] = 1; xor[u] = nums[u];',
        '        for (int v : tree[u]) {',
        '            if (v != p) {',
        '                dfs(v, u, tree, nums, dfn, size, xor);',
        '                size[u] += size[v]; xor[u] ^= xor[v];',
        '            }',
        '        }',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int dfnCnt = 0;',
        '    int minimumScore(vector<int>& nums, vector<vector<int>>& edges) {',
        '        int n = nums.size();',
        '        vector<vector<int>> tree(n);',
        '        for (auto& e : edges) {',
        '            tree[e[0]].push_back(e[1]); tree[e[1]].push_back(e[0]);',
        '        }',
        '        vector<int> dfn(n), sz(n), xr(n);',
        '        auto dfs = [&](auto& self, int u, int p) -> void {',
        '            dfn[u] = dfnCnt++; sz[u] = 1; xr[u] = nums[u];',
        '            for (int v : tree[u]) {',
        '                if (v != p) {',
        '                    self(self, v, u);',
        '                    sz[u] += sz[v]; xr[u] ^= xr[v];',
        '                }',
        '            }',
        '        };',
        '        dfs(dfs, 0, -1);',
        '        int allXor = xr[0], m = edges.size();',
        '        vector<int> edgeEnds(m);',
        '        for (int k = 0; k < m; k++) {',
        '            edgeEnds[k] = dfn[edges[k][0]] > dfn[edges[k][1]] ? edges[k][0] : edges[k][1];',
        '        }',
        '        int ans = INT_MAX;',
        '        for (int i = 0; i < m; i++) {',
        '            int a = edgeEnds[i];',
        '            for (int j = i + 1; j < m; j++) {',
        '                int b = edgeEnds[j];',
        '                int x1, x2, x3;',
        '                if (dfn[a] <= dfn[b] && dfn[b] < dfn[a] + sz[a]) {',
        '                    x1 = xr[b]; x2 = xr[a] ^ xr[b]; x3 = allXor ^ xr[a];',
        '                } else if (dfn[b] <= dfn[a] && dfn[a] < dfn[b] + sz[b]) {',
        '                    x1 = xr[a]; x2 = xr[b] ^ xr[a]; x3 = allXor ^ xr[b];',
        '                } else {',
        '                    x1 = xr[a]; x2 = xr[b]; x3 = allXor ^ xr[a] ^ xr[b];',
        '                }',
        '                ans = min(ans, max({x1, x2, x3}) - min({x1, x2, x3}));',
        '            }',
        '        }',
        '        return ans;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def minimumScore(self, nums: List[int], edges: List[List[int]]) -> int:',
        '        n = len(nums)',
        '        tree = [[] for _ in range(n)]',
        '        for u, v in edges:',
        '            tree[u].append(v); tree[v].append(u)',
        '        dfn = [0] * n',
        '        size = [0] * n',
        '        xr = [0] * n',
        '        dfn_cnt = 0',
        '        def dfs(u, p):',
        '            nonlocal dfn_cnt',
        '            dfn[u] = dfn_cnt; dfn_cnt += 1',
        '            size[u] = 1; xr[u] = nums[u]',
        '            for v in tree[u]:',
        '                if v != p:',
        '                    dfs(v, u)',
        '                    size[u] += size[v]; xr[u] ^= xr[v]',
        '        dfs(0, -1)',
        '        all_xor = xr[0]',
        '        m = len(edges)',
        '        edge_ends = [u if dfn[u] > dfn[v] else v for u, v in edges]',
        '        ans = float("inf")',
        '        for i in range(m):',
        '            a = edge_ends[i]',
        '            for j in range(i + 1, m):',
        '                b = edge_ends[j]',
        '                if dfn[a] <= dfn[b] < dfn[a] + size[a]:',
        '                    x1 = xr[b]',
        '                    x2 = xr[a] ^ xr[b]',
        '                    x3 = all_xor ^ xr[a]',
        '                elif dfn[b] <= dfn[a] < dfn[b] + size[b]:',
        '                    x1 = xr[a]',
        '                    x2 = xr[b] ^ xr[a]',
        '                    x3 = all_xor ^ xr[b]',
        '                else:',
        '                    x1 = xr[a]',
        '                    x2 = xr[b]',
        '                    x3 = all_xor ^ xr[a] ^ xr[b]',
        '                diff = max(x1, x2, x3) - min(x1, x2, x3)',
        '                ans = min(ans, diff)',
        '        return ans',
      ],
    },
    lineExplanations: {
      javascript: [
        '1: 主函数入口，接收节点值 nums 与边列表 edges',
        '3-7: 构建无向树邻接表 tree',
        '8-10: 分配 dfn 序、子树节点数 size、子树异或和 xor 数组',
        '12-22: dfs 后序遍历：计算每个节点的 DFN 时间戳，回溯合并子树规模与子树全部权值异或和',
        '23: 以 0 为根执行 DFS 遍历',
        '25: 定向边属性：每条无向边映射到其远离根节点的较深端点',
        '27-38: O(n^2) 枚举切断的两条边对应子树根 a 和 b，利用 DFN 区间包含判定拓扑关系并计算 3 块异或值',
        '39: 维护更新全局最小异或极差 ans',
        '40: 返回最终最小分数',
      ],
      java: [
        '1: Solution 类定义',
        '3-10: 建图并初始化辅助数据结构',
        '11: 后序 DFS 预处理 dfn, size, xor',
        '12-17: 边端点归一化，令 edgeEnds[k] 为子树较深节点',
        '18-34: 双重循环枚举边对，根据 DFN 序判定是否为包含关系或并列分支，计算 3 块异或差值',
        '35-46: dfs 递归定义与子树状态回溯合并',
      ],
      cpp: [
        '1: Solution 类定义',
        '4-10: 构建双向邻接表 tree',
        '11-23: lambda dfs 遍历统计子树异或值与 DFN 序',
        '24-27: 提取每条边的深层节点代号',
        '28-39: 双重枚举断边，根据拓扑包含关系 O(1) 求解 3 个组件异或值并更新极小值',
      ],
      python: [
        '1: Solution 类定义',
        '3-7: 初始化树图邻接列表',
        '8-20: 深度优先遍历 dfs，统计 dfn、size 与 xr',
        '21-25: 提取所有边对应的深层子树根节点',
        '26-38: 双重循环枚举所有边对组合，按 DFN 序判断子树包含与并列关系，计算三块异或差',
        '39: 返回最优解 ans',
      ],
    },
    keyPoints: {
      thinking:
        '树中删除一条边等价于切掉某个以子节点为根的完整子树。删除两条边后产生 3 个连通块，关键在于如何快速确定两棵被切子树 a 和 b 之间的位置关系：\n1. 若 b 在 a 的子树中（包含关系）：三个块分别为“子树 b”、“从子树 a 中挖掉 b 的部分”、“整棵树挖掉 a 的部分”。\n2. 若 a 和 b 互不包含（并列分支）：三个块分别为“子树 a”、“子树 b”、“整棵树同时挖掉 a 和 b 的部分”。\n如何 O(1) 判断包含？利用 DFS 序（DFN 序）！若 dfn[a] <= dfn[b] < dfn[a] + size[a]，则 b 必在 a 的子树中。异或具有自反律（x ^ x = 0），挖掉某块直接用全局/父级异或和与其异或即可！',
      state:
        'dfn[u]: 节点 u 的时间戳序号\nsize[u]: 节点 u 为根的子树节点数\nxor[u]: 节点 u 为根的子树所有节点值的异或和\nallXor = xor[0]: 整棵树所有节点的异或和',
      equation:
        '若 b 包含于 a: x1 = xor[b], x2 = xor[a] ^ xor[b], x3 = allXor ^ xor[a]\n若 a 与 b 并列: x1 = xor[a], x2 = xor[b], x3 = allXor ^ xor[a] ^ xor[b]\nscore = max(x1, x2, x3) - min(x1, x2, x3)',
      initAndBounds:
        '以 0 为根节点；当 n=3 时只有 2 条边，删掉仅有这 1 种方案；枚举边对保证 i < j。',
      complexity:
        '时间复杂度：DFS 遍历 O(n)，枚举边对共有 C(n-1, 2) 种组合，每次计算 O(1)，总时间复杂度 O(n^2)。空间复杂度 O(n)。',
    },
    faqList: [
      {
        tag: '异或差值原理',
        question: '为什么挖掘中间部分连通块时可以直接用异或操作？',
        answer:
          '因为异或满足结合律且自身异或为0（A ^ A = 0）。子树 a 包含了其所有后代节点；子树 b 是子树 a 的一部分。因此“子树 a 剔除子树 b 后的其余节点”的异或和就是 xor[a] ^ xor[b]，非常优雅且高效。',
      },
      {
        tag: 'DFN判定包含',
        question: '为什么 dfn[a] <= dfn[b] < dfn[a] + size[a] 能准确判定包含？',
        answer:
          '因为在先序遍历中，进入节点 a 时赋予 dfn[a]，接下来递归处理 a 的整棵子树（包含 size[a] 个节点），所有这些节点的编号都必须连续位于 [dfn[a], dfn[a] + size[a] - 1] 区间内。一旦超出此区间，说明访问已经离开 a 的子树。',
      },
    ],
  },
  generateSteps: (input: MinimumScoreInput): DpTraceStep[] => {
    const nums = input?.nums || [1, 5, 5, 4, 11];
    const edges = input?.edges || [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
    ];
    const n = nums.length;
    const steps: DpTraceStep[] = [];

    // Build tree
    const tree: number[][] = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
      tree[u].push(v);
      tree[v].push(u);
    }

    const dfn: number[] = new Array(n).fill(0);
    const size: number[] = new Array(n).fill(0);
    const xorVal: number[] = new Array(n).fill(0);
    const parent: number[] = new Array(n).fill(-1);
    const children: number[][] = Array.from({ length: n }, () => []);
    let dfnCnt = 0;

    function dfs(u: number, p: number) {
      dfn[u] = dfnCnt++;
      size[u] = 1;
      xorVal[u] = nums[u];
      parent[u] = p;
      for (const v of tree[u]) {
        if (v !== p) {
          children[u].push(v);
          dfs(v, u);
          size[u] += size[v];
          xorVal[u] ^= xorVal[v];
        }
      }
    }

    dfs(0, -1);
    const allXor = xorVal[0];
    const m = edges.length;
    const edgeEnds = edges.map(([u, v]) => (dfn[u] > dfn[v] ? u : v));

    function toDpTree(
      u: number,
      compMap: Map<number, { name: string; state: DpTreeNode['state'] }>
    ): DpTreeNode {
      const comp = compMap.get(u) || { name: '树体', state: 'normal' };
      return {
        id: `node-${u}`,
        label: `点#${u}(值:${nums[u]})\n子树异或:${xorVal[u]}\n[${comp.name}]`,
        value: xorVal[u],
        state: comp.state,
        children: children[u].map((child) => toDpTree(child, compMap)),
      };
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(0, new Map()),
        message: `🌲 预处理完成：以节点 0 为根建树，DFS 统计各节点 DFN 序、子树大小及子树异或和（整树总异或 allXor = ${allXor}）`,
        log: `DFS 完成：nums=[${nums.join(', ')}], 各子树 xor=[${xorVal.join(', ')}], allXor=${allXor}`,
        vars: [
          { name: '节点数 n', value: String(n) },
          { name: '边数 m', value: String(m) },
          { name: '整树全部异或和 allXor', value: String(allXor) },
        ],
        metrics: {
          minScore: Infinity,
          testedPairs: 0,
        },
      })
    );

    let globalMinScore = Infinity;
    let bestPair: [number, number] | null = null;
    let pairCount = 0;

    for (let i = 0; i < m; i++) {
      const a = edgeEnds[i];
      for (let j = i + 1; j < m; j++) {
        const b = edgeEnds[j];
        pairCount++;

        let x1: number, x2: number, x3: number;
        let relationDesc = '';
        const compMap = new Map<number, { name: string; state: DpTreeNode['state'] }>();

        // Helper to mark subtrees
        function getSubtreeNodes(rootNode: number): number[] {
          const res: number[] = [];
          function collect(curr: number) {
            res.push(curr);
            for (const c of children[curr]) collect(c);
          }
          collect(rootNode);
          return res;
        }

        const nodesA = new Set(getSubtreeNodes(a));
        const nodesB = new Set(getSubtreeNodes(b));

        if (dfn[a] <= dfn[b] && dfn[b] < dfn[a] + size[a]) {
          // b in a
          relationDesc = `节点 #${b} 在节点 #${a} 的子树内 (包含关系)`;
          x1 = xorVal[b];
          x2 = xorVal[a] ^ xorVal[b];
          x3 = allXor ^ xorVal[a];

          for (let node = 0; node < n; node++) {
            if (nodesB.has(node)) {
              compMap.set(node, { name: '深层子树(B)', state: 'active' });
            } else if (nodesA.has(node)) {
              compMap.set(node, { name: '中段子树(A-B)', state: 'computed' });
            } else {
              compMap.set(node, { name: '剩余树体', state: 'normal' });
            }
          }
        } else if (dfn[b] <= dfn[a] && dfn[a] < dfn[b] + size[b]) {
          // a in b
          relationDesc = `节点 #${a} 在节点 #${b} 的子树内 (包含关系)`;
          x1 = xorVal[a];
          x2 = xorVal[b] ^ xorVal[a];
          x3 = allXor ^ xorVal[b];

          for (let node = 0; node < n; node++) {
            if (nodesA.has(node)) {
              compMap.set(node, { name: '深层子树(A)', state: 'active' });
            } else if (nodesB.has(node)) {
              compMap.set(node, { name: '中段子树(B-A)', state: 'computed' });
            } else {
              compMap.set(node, { name: '剩余树体', state: 'normal' });
            }
          }
        } else {
          // disjoint
          relationDesc = `节点 #${a} 与节点 #${b} 互不包含 (并列分支)`;
          x1 = xorVal[a];
          x2 = xorVal[b];
          x3 = allXor ^ xorVal[a] ^ xorVal[b];

          for (let node = 0; node < n; node++) {
            if (nodesA.has(node)) {
              compMap.set(node, { name: '分支子树(A)', state: 'active' });
            } else if (nodesB.has(node)) {
              compMap.set(node, { name: '分支子树(B)', state: 'computed' });
            } else {
              compMap.set(node, { name: '剩余树体', state: 'normal' });
            }
          }
        }

        const maxX = Math.max(x1, x2, x3);
        const minX = Math.min(x1, x2, x3);
        const diff = maxX - minX;

        const isNewBest = diff < globalMinScore;
        if (isNewBest) {
          globalMinScore = diff;
          bestPair = [a, b];
        }

        steps.push(
          makeTraceStep({
            tree: toDpTree(0, compMap),
            message: `✂️ 尝试删除边对 (${edges[i][0]}-${edges[i][1]}) 与 (${edges[j][0]}-${edges[j][1]}) [对应子树根 #${a} 与 #${b}]。${relationDesc}。3 块异或值分别为 x1=${x1}, x2=${x2}, x3=${x3} → 极差差值=${diff}${isNewBest ? ` 🌟 (刷新全局最小分数: ${globalMinScore})` : ''}`,
            log: `测试边对: a=${a}, b=${b}, 关系=${relationDesc}, x1=${x1}, x2=${x2}, x3=${x3}, diff=${diff}, 全局最优=${globalMinScore}`,
            formula: 'score = max(x1, x2, x3) - min(x1, x2, x3)',
            formulaSubstituted: `${diff} = max(${x1}, ${x2}, ${x3}) - min(${x1}, ${x2}, ${x3})`,
            vars: [
              { name: '断边1对应子树根 a', value: `#${a}` },
              { name: '断边2对应子树根 b', value: `#${b}` },
              { name: '拓扑关系', value: relationDesc },
              { name: '连通块1异或值 x1', value: String(x1) },
              { name: '连通块2异或值 x2', value: String(x2) },
              { name: '连通块3异或值 x3', value: String(x3) },
              { name: '当前方案分数 (diff)', value: String(diff) },
              { name: '历史最小分数', value: String(globalMinScore) },
            ],
            metrics: {
              minScore: globalMinScore,
              testedPairs: pairCount,
            },
          })
        );
      }
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(0, new Map()),
        message: `🎉 枚举完成！全部 ${pairCount} 组断边方案已计算，切分所得的最小分数为 ${globalMinScore}（最优断边对应子树根 #${bestPair?.[0]} 与 #${bestPair?.[1]}）`,
        log: `最终最小异或分数 = ${globalMinScore}`,
        vars: [
          { name: '最终最小分数', value: String(globalMinScore) },
          { name: '枚举方案总数', value: String(pairCount) },
        ],
        metrics: {
          minScore: globalMinScore,
          testedPairs: pairCount,
        },
      })
    );

    return steps;
  },
};
