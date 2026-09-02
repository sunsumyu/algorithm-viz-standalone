import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

/**
 * 相邻字符不同的最长路径 (Longest Path With Different Adjacent Characters)
 * LeetCode 2246 / 左程云算法通关课 第079讲 树型DP下 Code02
 * 树型DP套路：后序遍历向父节点汇报【单侧合法最长链长】，每个节点收集子节点中字符不同且最长的两条链 max1 与 max2，
 * 拱顶拐点路径 = 1 + max1 + max2
 */
export const LongestPathDifferentCharactersSpec: AlgorithmSpec = {
  id: 'longest-path-different-characters',
  name: '相邻字符不同的最长路径 (Longest Path with Different Chars)',
  category: '树型 DP',
  description:
    '树型DP多叉树拐点模型。给你一棵树，每个节点分配一个字符。求一条路径，相邻节点字符不同，求满足条件的最长路径包含的节点数。每个节点向父节点汇报【单侧有效最长链】，当前节点融合最长与次长子链。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 2246,
    leetcodeUrl: 'https://leetcode.cn/problems/longest-path-with-different-adjacent-characters/',
    difficulty: 'hard',
    tags: ['树', '深度优先搜索', '图', '拓扑排序', '动态规划', '树型DP'],
    description:
      '给你一棵 <strong>树</strong>（即一个连通、无向、无环图），根节点为 <code>0</code>。节点编号 <code>0..n-1</code>。给你一个长度为 <code>n</code> 的字符串 <code>s</code>，其中 <code>s[i]</code> 表示分配给节点 <code>i</code> 的字符。<br/><br/>找出路径上 <strong>任意相邻节点字符均不相同</strong> 的 <strong>最长路径</strong> 的长度（路径上的节点数目）。',
    examples: [
      {
        input: 'parent = [-1,0,0,1,1,2], s = "abacbe"',
        output: '3',
        explanation: '最长合法路径为 0 -> 1 -> 3（字符分别为 a -> b -> c），或 0 -> 2 -> 5，路径包含 3 个节点。',
      },
      {
        input: 'parent = [-1,0,0,0], s = "aabc"',
        output: '3',
        explanation: '路径 1 -> 0 -> 2（字符 b -> a -> c），相邻字符均不同，长度为 3。',
      },
    ],
    constraints: [
      'n == parent.length == s.length',
      '1 <= n <= 10^5 (演示推荐 5~10 节点)',
      's 仅由小写英文字母组成',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 8, cpp: 9, python: 7, javascript: 6 },
    init: { java: 3, cpp: 4, python: 3, javascript: 2 },
    stateTransfer: {
      java: [9, 10, 11, 12, 13, 14],
      cpp: [10, 11, 12, 13, 14, 15],
      python: [8, 9, 10, 11, 12, 13],
      javascript: [7, 8, 9, 10, 11, 12],
    },
    returnResult: { java: 18, cpp: 19, python: 16, javascript: 16 },
  },
  code: {
    languages: {
      javascript: [
        'function longestPath(parent, s) {',
        '    const n = parent.length;',
        '    const tree = Array.from({ length: n }, () => []);',
        '    for (let i = 1; i < n; i++) tree[parent[i]].push(i);',
        '    let maxPath = 1;',
        '    function dfs(u) {',
        '        let max1 = 0, max2 = 0; // 最长与次长有效子链',
        '        for (const v of tree[u]) {',
        '            const len = dfs(v);',
        '            if (s[u] !== s[v]) { // 相邻字符不同才可拼接',
        '                if (len > max1) { max2 = max1; max1 = len; }',
        '                else if (len > max2) { max2 = len; }',
        '            }',
        '        }',
        '        maxPath = Math.max(maxPath, 1 + max1 + max2); // 拐点融合',
        '        return 1 + max1; // 向父节点返回单侧最长链',
        '    }',
        '    dfs(0);',
        '    return maxPath;',
        '}',
      ],
      java: [
        'class Solution {',
        '    private int maxPath = 1;',
        '    public int longestPath(int[] parent, String s) {',
        '        int n = parent.length;',
        '        List<Integer>[] tree = new ArrayList[n];',
        '        for (int i = 0; i < n; i++) tree[i] = new ArrayList<>();',
        '        for (int i = 1; i < n; i++) tree[parent[i]].add(i);',
        '        dfs(0, tree, s);',
        '        return maxPath;',
        '    }',
        '    private int dfs(int u, List<Integer>[] tree, String s) {',
        '        int max1 = 0, max2 = 0;',
        '        for (int v : tree[u]) {',
        '            int len = dfs(v, tree, s);',
        '            if (s.charAt(u) != s.charAt(v)) {',
        '                if (len > max1) { max2 = max1; max1 = len; }',
        '                else if (len > max2) { max2 = len; }',
        '            }',
        '        }',
        '        maxPath = Math.max(maxPath, 1 + max1 + max2);',
        '        return 1 + max1;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        '    int maxPath = 1;',
        'public:',
        '    int longestPath(vector<int>& parent, string s) {',
        '        int n = parent.size();',
        '        vector<vector<int>> tree(n);',
        '        for (int i = 1; i < n; i++) tree[parent[i]].push_back(i);',
        '        dfs(0, tree, s);',
        '        return maxPath;',
        '    }',
        '    int dfs(int u, vector<vector<int>>& tree, const string& s) {',
        '        int max1 = 0, max2 = 0;',
        '        for (int v : tree[u]) {',
        '            int len = dfs(v, tree, s);',
        '            if (s[u] != s[v]) {',
        '                if (len > max1) { max2 = max1; max1 = len; }',
        '                else if (len > max2) { max2 = len; }',
        '            }',
        '        }',
        '        maxPath = max(maxPath, 1 + max1 + max2);',
        '        return 1 + max1;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def longestPath(self, parent: List[int], s: string) -> int:',
        '        n = len(parent)',
        '        tree = defaultdict(list)',
        '        for i in range(1, n): tree[parent[i]].append(i)',
        '        self.max_path = 1',
        '        def dfs(u):',
        '            max1, max2 = 0, 0',
        '            for v in tree[u]:',
        '                length = dfs(v)',
        '                if s[u] != s[v]:',
        '                    if length > max1: max2, max1 = max1, length',
        '                    elif length > max2: max2 = length',
        '            self.max_path = max(self.max_path, 1 + max1 + max2)',
        '            return 1 + max1',
        '        dfs(0)',
        '        return self.max_path',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '全局变量 maxPath 记录最长合法路径节点数。',
        3: '🎯 <strong>函数主入口</strong>。',
        11: '后序遍历 dfs(u)：返回以 u 为起点向子树延伸的最长字符不同有效单链长度。',
        12: '初始化最长子链 max1 与次长子链 max2 为 0。',
        14: '递归计算子节点 v 的最长单链。',
        15: '💡 <strong>字符约束校验</strong>：仅当 s[u] != s[v] 时两点才可连接成合法路径。',
        16: '贪心维护子节点中最长和次长的两条有效延伸链。',
        20: '💡 <strong>拐点路径结算</strong>：穿过当前节点 u 拼接左右两条最长链，路径节点数 = 1 + max1 + max2。',
        21: '向父节点汇报以 u 为起点的单侧最长链 1 + max1。',
      },
      javascript: {
        1: '🎯 <strong>主函数入口</strong>。',
        5: '初始化全局 maxPath 为 1。',
        7: '维护最长与次长子分支。',
        10: '校验相邻字符是否不同。',
        15: '更新全局拐点路径长度。',
        16: '向上回溯返回 1 + max1。',
      },
      cpp: {
        1: '类定义。',
        4: '主函数。',
        12: '维护 max1 与 max2。',
        16: '拐点路径长度全局结算。',
        17: '返回单侧最长链。',
      },
      python: {
        1: '类定义。',
        2: '主函数。',
        7: 'dfs 返回单侧最长链。',
        13: '更新 max_path。',
      },
    },
    keyPoints: {
      thinking:
        '树型DP拐点模型的经典变体：路径只能在某一个"最高拐点"处完成左上右下的拼接。每个节点只需要向子树挑选【字符不同且最长】的两条链 max1 和 max2，拼接得到的最大路径为 1 + max1 + max2；向父节点回溯时只能走单侧，返回 1 + max1。',
      state: 'dfs(u) 返回以 u 为起点向下延伸的单侧字符互异最长路径长度（节点数）。',
      equation: 'crossPath(u) = 1 + max1 + max2；dfs(u) = 1 + max1',
      initAndBounds: '叶子节点 max1=0, max2=0，向父节点返回 1；全局 maxPath 初始化为 1。',
      complexity: '时间复杂度 $O(N)$，空间复杂度 $O(N)$。',
    },
    faqList: [
      {
        tag: '为什么需要次长链 max2？',
        question: '为什么需要维护次长链 max2？',
        answer:
          '因为一条完整的拱形路径可以同时经过当前节点的两条不同子分支（一左一右）。为了使拱形路径最长，必须挑出最长和次长两条合法子分支拼接起来。',
      },
      {
        tag: '相同字符的处理',
        question: '如果子节点字符和当前节点字符相同怎么处理？',
        answer:
          '如果 s[u] == s[v]，说明跨过 (u, v) 的连接是非法的，该子节点的链长不能被拼接到当前节点的拱形路径或向上传递，直接忽略（不参与 max1 / max2 的比较）。',
      },
    ],
  },
  generateSteps: (input: { parent?: number[]; s?: string }): DpTraceStep[] => {
    const parent = input?.parent || [-1, 0, 0, 1, 1, 2];
    const s = input?.s || 'abacbe';
    const n = parent.length;
    const steps: DpTraceStep[] = [];

    const tree: number[][] = Array.from({ length: n }, () => []);
    for (let i = 1; i < n; i++) {
      tree[parent[i]].push(i);
    }

    let globalMaxPath = 1;
    const chainMap = new Map<number, number>();
    const crossMap = new Map<number, number>();

    interface DpNode {
      id: string;
      val: number;
      char: string;
      children: DpNode[];
    }

    function buildHierarchy(u: number): DpNode {
      const children = tree[u].map((v) => buildHierarchy(v));
      return { id: String(u), val: u, char: s[u] || '?', children };
    }

    const treeRoot = buildHierarchy(0);

    function toDpTree(node: DpNode | null, activeId?: string): DpTreeNode | null {
      if (!node) return null;
      const chain = chainMap.get(node.val);
      const cross = crossMap.get(node.val);
      const label = chain !== undefined
        ? `点#${node.val}('${node.char}')\n单链:${chain}|拐点:${cross}`
        : `点#${node.val}('${node.char}')`;

      return {
        id: node.id,
        label,
        value: chain ?? 1,
        state: node.id === activeId ? 'active' : chain !== undefined ? 'computed' : 'default',
        children: node.children.map((c) => toDpTree(c, activeId)).filter(Boolean) as DpTreeNode[],
      };
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🌲 初始化多叉树与字符标注 s="${s}"，开始后序遍历寻找相邻字符不同的最长路径`,
        log: `初始化完成：s = "${s}", 全局 maxPath = 1`,
        vars: [
          { name: '字符串 s', value: s },
          { name: '全局最长路径', value: '1' },
        ],
        metrics: { maxPath: 1 },
      })
    );

    function dfs(u: number): number {
      let max1 = 0;
      let max2 = 0;

      for (const v of tree[u]) {
        const len = dfs(v);
        if (s[u] !== s[v]) {
          if (len > max1) {
            max2 = max1;
            max1 = len;
          } else if (len > max2) {
            max2 = len;
          }
        }
      }

      const cross = 1 + max1 + max2;
      const oldPath = globalMaxPath;
      globalMaxPath = Math.max(globalMaxPath, cross);

      const chain = 1 + max1;
      chainMap.set(u, chain);
      crossMap.set(u, cross);

      steps.push(
        makeTraceStep({
          tree: toDpTree(treeRoot, String(u)),
          message: `节点 #${u}('${s[u]}'): 最长有效子链 max1=${max1}, 次长 max2=${max2} → 拐点路径长 1+${max1}+${max2}=${cross}，向父返回单链 ${chain} (全局最优: ${oldPath} → ${globalMaxPath})`,
          log: `节点 #${u}('${s[u]}'): max1=${max1}, max2=${max2}, cross=${cross}, returnChain=${chain}, maxPath=${globalMaxPath}`,
          formula: 'crossPath = 1 + max1 + max2 (仅拼接 s[v] ≠ s[u] 的子分支)',
          formulaSubstituted: `${cross} = 1 + ${max1} + ${max2}`,
          vars: [
            { name: '当前节点', value: `#${u} ('${s[u]}')` },
            { name: '最长子链 max1', value: String(max1) },
            { name: '次长子链 max2', value: String(max2) },
            { name: '拐点路径长', value: String(cross) },
            { name: '向父汇报单链', value: String(chain) },
            { name: '全局最长路径', value: String(globalMaxPath) },
          ],
          metrics: { maxPath: globalMaxPath },
        })
      );

      return chain;
    }

    dfs(0);

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🎉 遍历完成！整棵树中相邻字符不同的最长路径长度为 ${globalMaxPath}`,
        log: `最终全局最长路径 = ${globalMaxPath}`,
        vars: [{ name: '最终最长路径', value: String(globalMaxPath) }],
        metrics: { maxPath: globalMaxPath },
      })
    );

    return steps;
  },
};
