import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

export const TreeDiameterSpec: AlgorithmSpec = {
  id: 'tree-diameter',
  name: '二叉树的直径 (Diameter of Binary Tree)',
  category: '树型 DP',
  description: '经典树型动态规划。二叉树的直径是指树中任意两个节点之间最长路径的长度（边数）。这条路径可能穿过也可能不穿过根节点。',
  difficulty: 'easy',
  problem: {
    leetcodeId: 543,
    leetcodeUrl: 'https://leetcode.cn/problems/diameter-of-binary-tree/',
    difficulty: 'easy',
    tags: ['树', '深度优先搜索', '动态规划', '二叉树'],
    description: '给你一棵二叉树的根节点 <code>root</code> ，返回该树的 <strong>直径</strong> 。<br/><br/>二叉树的 <strong>直径</strong> 是指树中任意两个节点之间最长路径的 <strong>长度</strong> 。这条路径可能经过也可能不经过根节点 <code>root</code> 。<br/><br/>两节点之间路径的 <strong>长度</strong> 由它们之间边数表示。',
    examples: [
      {
        input: 'root = [1, 2, 3, 4, 5]',
        output: '3',
        explanation: '最长路径经过节点 [4, 2, 1, 3] 或 [5, 2, 1, 3]，边数为 3。',
      },
      {
        input: 'root = [1, 2]',
        output: '1',
        explanation: '连接 1 和 2 的边长为 1。',
      },
    ],
    constraints: [
      '树中节点数目在范围 [1, 10^4] 内 (演示推荐 <= 15)',
      '-100 <= Node.val <= 100',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 6, cpp: 7, python: 6, javascript: 5 },
    init: { java: 3, cpp: 4, python: 3, javascript: 2 },
    stateTransfer: { java: [7, 8, 9, 10], cpp: [8, 9, 10, 11], python: [7, 8, 9, 10], javascript: [6, 7, 8, 9] },
    returnResult: { java: 13, cpp: 14, python: 13, javascript: 12 },
  },
  code: {
    languages: {
      javascript: [
        'function diameterOfBinaryTree(root) {',
        '    let maxDiameter = 0;',
        '    function maxDepth(node) {',
        '        if (!node) return 0;',
        '        const leftDepth = maxDepth(node.left);',
        '        const rightDepth = maxDepth(node.right);',
        '        // 经过当前节点的最长路径边数为 leftDepth + rightDepth',
        '        maxDiameter = Math.max(maxDiameter, leftDepth + rightDepth);',
        '        // 向父节点返回当前节点的最大单侧深度',
        '        return Math.max(leftDepth, rightDepth) + 1;',
        '    }',
        '    maxDepth(root);',
        '    return maxDiameter;',
        '}',
      ],
      java: [
        'class Solution {',
        '    private int maxDiameter = 0;',
        '    public int diameterOfBinaryTree(TreeNode root) {',
        '        maxDepth(root);',
        '        return maxDiameter;',
        '    }',
        '    private int maxDepth(TreeNode node) {',
        '        if (node == null) return 0;',
        '        int leftDepth = maxDepth(node.left);',
        '        int rightDepth = maxDepth(node.right);',
        '        maxDiameter = Math.max(maxDiameter, leftDepth + rightDepth);',
        '        return Math.max(leftDepth, rightDepth) + 1;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        '    int maxDiameter = 0;',
        'public:',
        '    int diameterOfBinaryTree(TreeNode* root) {',
        '        maxDepth(root);',
        '        return maxDiameter;',
        '    }',
        '    int maxDepth(TreeNode* node) {',
        '        if (!node) return 0;',
        '        int leftDepth = maxDepth(node->left);',
        '        int rightDepth = maxDepth(node->right);',
        '        maxDiameter = max(maxDiameter, leftDepth + rightDepth);',
        '        return max(leftDepth, rightDepth) + 1;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:',
        '        max_diameter = 0',
        '        def max_depth(node):',
        '            nonlocal max_diameter',
        '            if not node:',
        '                return 0',
        '            left_depth = max_depth(node.left)',
        '            right_depth = max_depth(node.right)',
        '            max_diameter = max(max_diameter, left_depth + right_depth)',
        '            return max(left_depth, right_depth) + 1',
        '        max_depth(root)',
        '        return max_diameter',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '全局记录最大直径 maxDiameter。',
        3: '🎯 <strong>函数主入口</strong>。',
        7: '深度优先搜索计算节点深度。',
        8: '空节点深度为 0。',
        9: '递归计算左子树最大深度。',
        10: '递归计算右子树最大深度。',
        11: '💡 <strong>直径更新</strong>：经过当前节点作为最高拐点的路径边数 = 左深度 + 右深度。',
        12: '向父节点返回单侧最大深度 + 1。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        4: '空节点递归边界。',
        7: '计算左、右子树深度。',
        8: '结算拐点路径长度。',
        10: '返回单侧深度 + 1。',
        13: '返回全局最大直径。',
      },
      cpp: {
        1: '类定义 Solution。',
        3: '🎯 <strong>函数主入口</strong>。',
        9: '空节点判定。',
        11: '左右深度汇聚更新 maxDiameter。',
        12: '向上回溯返回深度。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>主函数</strong>。',
        7: '基准情况。',
        9: '更新全局 max_diameter。',
        10: '返回 max(left, right) + 1。',
      },
    },
    keyPoints: {
      thinking: '树的直径本质是找一个节点 u，使得其左子树最大深度与右子树最大深度之和最大。',
      state: 'depth(u) 表示以 u 为根的子树的最大深度。',
      equation: 'diameter(u) = depth(left) + depth(right)；depth(u) = \\max(depth(left), depth(right)) + 1',
      initAndBounds: '空节点深度为 0；全局直径初始化为 0。',
      complexity: '时间复杂度 $O(N)$，空间复杂度 $O(H)$。',
    },
    faqList: [
      {
        tag: '节点数与边数',
        question: '为什么直径等于 leftDepth + rightDepth 而不需要 + 1？',
        answer: '因为深度定义为节点到最深叶子的边数（或节点数）。如果深度代表边数，左侧最大深度边数加上右侧最大深度边数，正好等于穿过当前节点连接左右最深叶子的总边数。',
      },
    ],
  },
  generateSteps: (input: { root?: Array<number | null> }): DpTraceStep[] => {
    const rawArr = input?.root && input.root.length > 0 ? input.root : [1, 2, 3, 4, 5];
    const steps: DpTraceStep[] = [];

    interface RawTreeNode {
      id: string;
      val: number;
      left: RawTreeNode | null;
      right: RawTreeNode | null;
    }

    function buildTree(arr: Array<number | null>): RawTreeNode | null {
      if (!arr || arr.length === 0 || arr[0] === null) return null;
      const root: RawTreeNode = { id: '0', val: arr[0]!, left: null, right: null };
      const queue: RawTreeNode[] = [root];
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
    let maxDiameter = 0;
    const depthMap = new Map<string, number>();

    function toDpTree(node: RawTreeNode | null, activeId?: string): DpTreeNode | null {
      if (!node) return null;
      const d = depthMap.get(node.id);
      return {
        id: node.id,
        label: `节点#${node.id}(值=${node.val}${d !== undefined ? `, 深度=${d}` : ''})`,
        value: d ?? 0,
        state: node.id === activeId ? 'active' : d !== undefined ? 'computed' : 'default',
        children: [
          toDpTree(node.left, activeId),
          toDpTree(node.right, activeId),
        ].filter(Boolean) as DpTreeNode[],
      };
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `初始化二叉树，启动后序遍历计算各子树深度并更新最大直径`,
        log: '后序遍历启动，maxDiameter 初始化为 0',
        vars: [
          { name: 'maxDiameter', value: '0' },
        ],
        metrics: { diameter: 0 },
      })
    );

    function maxDepth(node: RawTreeNode | null): number {
      if (!node) return 0;

      const left = maxDepth(node.left);
      const right = maxDepth(node.right);
      const currentDiameter = left + right;

      const oldDiameter = maxDiameter;
      maxDiameter = Math.max(maxDiameter, currentDiameter);

      const d = Math.max(left, right) + 1;
      depthMap.set(node.id, d);

      steps.push(
        makeTraceStep({
          tree: toDpTree(treeRoot, node.id),
          message: `节点 #${node.id}: 左子深度=${left}, 右子深度=${right} -> 当前拐点路径长=${currentDiameter} (全局最大直径: ${oldDiameter} -> ${maxDiameter})，节点深度=${d}`,
          log: `节点 #${node.id}: left=${left}, right=${right}, currentDiameter=${currentDiameter}, depth=${d}, maxDiameter=${maxDiameter}`,
          formula: 'diameter = leftDepth + rightDepth',
          formulaSubstituted: `${currentDiameter} = ${left} + ${right}`,
          vars: [
            { name: '当前节点', value: `#${node.id}` },
            { name: '左深度', value: String(left) },
            { name: '右深度', value: String(right) },
            { name: '拐点直径', value: String(currentDiameter) },
            { name: '全局最大直径', value: String(maxDiameter) },
          ],
          metrics: { diameter: maxDiameter },
        })
      );

      return d;
    }

    maxDepth(treeRoot);

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🎉 遍历完成！整棵二叉树的最大直径为 ${maxDiameter}`,
        log: `最终全局最大直径 = ${maxDiameter}`,
        vars: [
          { name: '最大直径', value: String(maxDiameter) },
        ],
        metrics: { diameter: maxDiameter },
      })
    );

    return steps;
  },
};
