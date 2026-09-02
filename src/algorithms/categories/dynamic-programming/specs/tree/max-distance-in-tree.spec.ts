import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

/**
 * 树的最大距离 (Maximum Distance in Tree)
 * 左程云算法通关课 第078讲 树型DP上
 * 树型DP套路：每个节点向父节点汇报 [最大深度, 最大直径（经过当前节点）]，
 * 全局最大直径 = max(左最大深度 + 右最大深度, 左最大直径, 右最大直径)
 */
export const MaxDistanceInTreeSpec: AlgorithmSpec = {
  id: 'max-distance-in-tree',
  name: '树的最大距离 (Max Distance in Tree)',
  category: '树型 DP',
  description:
    '树型DP套路。树中任意两节点间的最大距离（边数）。每个节点向父节点汇报 [子树最大深度, 子树内最大距离]，后序遍历自底向上融合。与 LeetCode 543 类似，但在任意树上推广。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 543,
    leetcodeUrl: 'https://leetcode.cn/problems/diameter-of-binary-tree/',
    difficulty: 'easy',
    tags: ['树', '动态规划', '深度优先搜索', '树型DP'],
    description:
      '给定一棵二叉树，求树中任意两节点之间的最大距离（两节点间路径上的边数）。<br/><br/><strong>树型DP思路：</strong>每个节点向父节点汇报二元组 <code>[maxDepth, maxDist]</code>，其中 maxDepth 是该节点到最深叶子的距离，maxDist 是该子树内部任意两节点间最大距离。<br/><br/>最大距离可能来自：①经过当前节点的路径（左深度+右深度）；②完全在左子树内；③完全在右子树内。',
    examples: [
      {
        input: 'root = [1, 2, 3, 4, 5]',
        output: '3',
        explanation: '最长路径经过节点 [4, 2, 1, 3] 或 [5, 2, 1, 3]，共 3 条边。',
      },
      {
        input: 'root = [1, 2, 3, 4, null, null, null, 5]',
        output: '4',
        explanation: '路径 5→4→2→1→3，共 4 条边。',
      },
    ],
    constraints: [
      '树中节点数目在范围 [1, 10^4] 内（演示推荐 ≤ 15）',
      '-100 ≤ Node.val ≤ 100',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 6, cpp: 7, python: 6, javascript: 5 },
    init: { java: 3, cpp: 4, python: 3, javascript: 2 },
    stateTransfer: {
      java: [7, 8, 9, 10, 11],
      cpp: [8, 9, 10, 11, 12],
      python: [7, 8, 9, 10, 11],
      javascript: [6, 7, 8, 9, 10],
    },
    returnResult: { java: 14, cpp: 15, python: 14, javascript: 13 },
  },
  code: {
    languages: {
      javascript: [
        'function maxDistance(root) {',
        '    let ans = 0;',
        '    // 返回 [maxDepth, maxDist]',
        '    function info(node) {',
        '        if (!node) return [0, 0];',
        '        const [lDepth, lDist] = info(node.left);',
        '        const [rDepth, rDist] = info(node.right);',
        '        // 经过当前节点的最长路径',
        '        const crossDist = lDepth + rDepth;',
        '        // 当前子树内最大距离',
        '        const maxDist = Math.max(crossDist, lDist, rDist);',
        '        ans = Math.max(ans, maxDist);',
        '        return [Math.max(lDepth, rDepth) + 1, maxDist];',
        '    }',
        '    info(root);',
        '    return ans;',
        '}',
      ],
      java: [
        'class Solution {',
        '    private int ans = 0;',
        '    public int maxDistance(TreeNode root) {',
        '        info(root);',
        '        return ans;',
        '    }',
        '    // 返回 int[] { maxDepth, maxDist }',
        '    private int[] info(TreeNode node) {',
        '        if (node == null) return new int[]{ 0, 0 };',
        '        int[] L = info(node.left);',
        '        int[] R = info(node.right);',
        '        int crossDist = L[0] + R[0];',
        '        int maxDist = Math.max(crossDist, Math.max(L[1], R[1]));',
        '        ans = Math.max(ans, maxDist);',
        '        return new int[]{ Math.max(L[0], R[0]) + 1, maxDist };',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        '    int ans = 0;',
        'public:',
        '    int maxDistance(TreeNode* root) {',
        '        info(root);',
        '        return ans;',
        '    }',
        '    // 返回 {maxDepth, maxDist}',
        '    pair<int,int> info(TreeNode* node) {',
        '        if (!node) return {0, 0};',
        '        auto [lD, lDist] = info(node->left);',
        '        auto [rD, rDist] = info(node->right);',
        '        int crossDist = lD + rD;',
        '        int maxDist = max({crossDist, lDist, rDist});',
        '        ans = max(ans, maxDist);',
        '        return {max(lD, rD) + 1, maxDist};',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxDistance(self, root: Optional[TreeNode]) -> int:',
        '        self.ans = 0',
        '        def info(node):',
        '            if not node:',
        '                return 0, 0',
        '            l_depth, l_dist = info(node.left)',
        '            r_depth, r_dist = info(node.right)',
        '            cross_dist = l_depth + r_depth',
        '            max_dist = max(cross_dist, l_dist, r_dist)',
        '            self.ans = max(self.ans, max_dist)',
        '            return max(l_depth, r_depth) + 1, max_dist',
        '        info(root)',
        '        return self.ans',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '全局 ans 记录整棵树的最大距离。',
        3: '🎯 <strong>函数主入口</strong>。',
        8: 'info 函数返回二元组 [maxDepth, maxDist]。',
        9: '空节点深度和距离均为 0。',
        10: '递归收集左子树 [深度, 最大内部距离]。',
        11: '递归收集右子树 [深度, 最大内部距离]。',
        12: '💡 经过当前节点的路径长度 = 左深度 + 右深度。',
        13: '当前子树最大距离 = max(穿越当前节点, 左子树内, 右子树内)。',
        14: '更新全局答案。',
        15: '向父节点汇报：深度为较大侧 + 1，内部最大距离不变。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        2: '全局答案 ans。',
        5: '空节点：深度0，距离0。',
        6: '递归左右子树。',
        9: '💡 <strong>核心计算</strong>：穿越当前节点的路径。',
        11: '当前子树内三方向取最大。',
        12: '更新全局答案。',
        16: '返回最终答案。',
      },
      cpp: {
        1: '类定义。',
        4: '🎯 <strong>主入口</strong>。',
        9: '空节点。',
        12: '穿越路径计算。',
        13: '三路最大距离。',
        15: '向父节点汇报深度和最大距离。',
      },
      python: {
        1: '类定义。',
        2: '🎯 <strong>主函数</strong>。',
        4: '内部 info 函数。',
        5: '基准情况。',
        9: '💡 穿越当前节点路径。',
        10: '三方向最大距离。',
        13: '返回答案。',
      },
    },
    keyPoints: {
      thinking:
        '树的最大距离体现了树型DP"二元组汇报"范式：每个节点既需要向父节点提供"深度"信息（让父节点计算更长路径），又需要维护"子树内最大距离"（防止答案只在子树内部而不经过父节点）。这是与单纯递归深度不同的关键。',
      state:
        'info(u) 返回 [maxDepth(u), maxDist(u)]：maxDepth(u) = u 到子树最深叶子的距离（边数）；maxDist(u) = u 子树内任意两节点的最大距离。',
      equation:
        'maxDist(u) = max(maxDepth(left) + maxDepth(right), maxDist(left), maxDist(right))；maxDepth(u) = max(maxDepth(left), maxDepth(right)) + 1',
      initAndBounds: '空节点 maxDepth = 0，maxDist = 0。',
      complexity: '时间复杂度 $O(N)$，空间复杂度 $O(H)$。',
    },
    faqList: [
      {
        tag: '二元组汇报',
        question: '为什么需要同时返回 maxDepth 和 maxDist？',
        answer:
          'maxDepth 是给父节点用的：父节点需要用左右子树深度之和计算"穿越自己"的路径长。maxDist 是当前子树内部的答案，万一最长路径完全在子树内部（不经过父节点），也需要记录下来。',
      },
      {
        tag: '与二叉树直径的关系',
        question: '这道题和 LeetCode 543 二叉树的直径有什么区别？',
        answer:
          '本质上是同一道题。543 仅用了 maxDepth 返回值，通过全局变量记录 maxDist。本题将两者合并成二元组显式返回，是更通用的树型DP信息汇聚模式，方便在更复杂的树题中扩展。',
      },
    ],
  },
  generateSteps: (input: { root?: Array<number | null> }): DpTraceStep[] => {
    const rawArr =
      input?.root && input.root.length > 0 ? input.root : [1, 2, 3, 4, 5];
    const steps: DpTraceStep[] = [];

    interface RawNode {
      id: string;
      val: number;
      left: RawNode | null;
      right: RawNode | null;
    }

    function buildTree(arr: Array<number | null>): RawNode | null {
      if (!arr || arr.length === 0 || arr[0] === null) return null;
      const root: RawNode = { id: '0', val: arr[0]!, left: null, right: null };
      const queue: RawNode[] = [root];
      let i = 1;
      while (queue.length > 0 && i < arr.length) {
        const curr = queue.shift()!;
        if (i < arr.length && arr[i] !== null) {
          curr.left = { id: String(i), val: arr[i]!, left: null, right: null };
          queue.push(curr.left);
        }
        i++;
        if (i < arr.length && arr[i] !== null) {
          curr.right = { id: String(i), val: arr[i]!, left: null, right: null };
          queue.push(curr.right);
        }
        i++;
      }
      return root;
    }

    const treeRoot = buildTree(rawArr);
    let globalAns = 0;

    const infoMap = new Map<string, { depth: number; dist: number }>();

    function toDpTree(node: RawNode | null, activeId?: string): DpTreeNode | null {
      if (!node) return null;
      const nodeInfo = infoMap.get(node.id);
      const label = nodeInfo
        ? `${node.val}\n深${nodeInfo.depth}|距${nodeInfo.dist}`
        : String(node.val);
      return {
        id: node.id,
        label,
        value: nodeInfo?.depth ?? 0,
        state: node.id === activeId ? 'active' : nodeInfo ? 'computed' : 'default',
        children: [
          toDpTree(node.left, activeId),
          toDpTree(node.right, activeId),
        ].filter(Boolean) as DpTreeNode[],
      };
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🌲 初始化二叉树，开始后序遍历收集 [最大深度, 子树内最大距离] 二元组`,
        log: '后序遍历启动，globalAns = 0',
        vars: [{ name: 'globalAns', value: '0' }],
        metrics: { maxDistance: 0 },
      })
    );

    function info(node: RawNode | null): { depth: number; dist: number } {
      if (!node) return { depth: 0, dist: 0 };

      const L = info(node.left);
      const R = info(node.right);

      const crossDist = L.depth + R.depth;
      const dist = Math.max(crossDist, L.dist, R.dist);
      const depth = Math.max(L.depth, R.depth) + 1;
      const oldAns = globalAns;
      globalAns = Math.max(globalAns, dist);

      infoMap.set(node.id, { depth, dist });

      steps.push(
        makeTraceStep({
          tree: toDpTree(treeRoot, node.id),
          message: `节点[${node.val}]: 左子深度=${L.depth}(内部最大距离=${L.dist}), 右子深度=${R.depth}(内部最大距离=${R.dist}) → 穿越路径=${crossDist}, 当前子树最大距离=${dist}, 节点深度=${depth} (全局答案: ${oldAns}→${globalAns})`,
          log: `node=${node.val}: lDepth=${L.depth}, rDepth=${R.depth}, crossDist=${crossDist}, dist=${dist}, depth=${depth}, ans=${globalAns}`,
          formula: 'maxDist = max(lDepth+rDepth, lDist, rDist)',
          formulaSubstituted: `${dist} = max(${crossDist}, ${L.dist}, ${R.dist})`,
          vars: [
            { name: '当前节点', value: String(node.val) },
            { name: '左子深度', value: String(L.depth) },
            { name: '右子深度', value: String(R.depth) },
            { name: '穿越路径长度', value: String(crossDist) },
            { name: '左子最大距离', value: String(L.dist) },
            { name: '右子最大距离', value: String(R.dist) },
            { name: '当前子树最大距离', value: String(dist) },
            { name: '全局最大距离', value: String(globalAns) },
          ],
          metrics: { maxDistance: globalAns },
        })
      );

      return { depth, dist };
    }

    info(treeRoot);

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🎉 树型DP遍历完成！树中任意两节点间的最大距离为 ${globalAns}`,
        log: `最终最大距离 = ${globalAns}`,
        vars: [{ name: '最大距离', value: String(globalAns) }],
        metrics: { maxDistance: globalAns },
      })
    );

    return steps;
  },
};
