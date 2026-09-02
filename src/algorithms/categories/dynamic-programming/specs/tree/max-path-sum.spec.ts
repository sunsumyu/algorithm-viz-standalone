import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

export const MaxPathSumSpec: AlgorithmSpec = {
  id: 'max-path-sum',
  name: '二叉树中的最大路径和 (Binary Tree Max Path Sum)',
  category: '树型 DP',
  description: '经典树型动态规划。路径被定义为一条从树中任意节点出发，沿父节点-子节点连接到达任意节点的序列。求所有路径中最大路径和。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 124,
    leetcodeUrl: 'https://leetcode.cn/problems/binary-tree-maximum-path-sum/',
    difficulty: 'hard',
    tags: ['树', '动态规划', '深度优先搜索', '二叉树'],
    description: '二叉树中的 <strong>路径</strong> 被定义为一条节点序列，序列中每对相邻节点之间都存在一条边。同一个节点在一条路径序列中 <strong>至多出现一次</strong> 。该路径 <strong>至少包含一个</strong> 节点，且不一定经过根节点。<br/><br/><strong>路径和</strong> 是路径中各节点值的总和。<br/><br/>给你一个二叉树的根节点 <code>root</code> ，返回其 <strong>最大路径和</strong> 。',
    examples: [
      {
        input: 'root = [1, 2, 3]',
        output: '6',
        explanation: '最优路径是 2 -> 1 -> 3 ，路径和为 2 + 1 + 3 = 6 。',
      },
      {
        input: 'root = [-10, 9, 20, null, null, 15, 7]',
        output: '42',
        explanation: '最优路径是 15 -> 20 -> 7 ，路径和为 15 + 20 + 7 = 42 。',
      },
    ],
    constraints: [
      '树中节点数目范围是 [1, 3 * 10^4] (演示推荐 <= 15)',
      '-1000 <= Node.val <= 1000',
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
        'function maxPathSum(root) {',
        '    let maxSum = -Infinity;',
        '    function maxGain(node) {',
        '        if (!node) return 0;',
        '        // 递归计算左右子树向当前节点提供的最大单侧收益（负增益弃用取 0）',
        '        const leftGain = Math.max(maxGain(node.left), 0);',
        '        const rightGain = Math.max(maxGain(node.right), 0);',
        '        // 以当前节点为拐点的拱形路径和',
        '        const currentPathSum = node.val + leftGain + rightGain;',
        '        maxSum = Math.max(maxSum, currentPathSum);',
        '        // 向父节点返回只能延伸单侧分支的最大收益',
        '        return node.val + Math.max(leftGain, rightGain);',
        '    }',
        '    maxGain(root);',
        '    return maxSum;',
        '}',
      ],
      java: [
        'class Solution {',
        '    private int maxSum = Integer.MIN_VALUE;',
        '    public int maxPathSum(TreeNode root) {',
        '        maxGain(root);',
        '        return maxSum;',
        '    }',
        '    private int maxGain(TreeNode node) {',
        '        if (node == null) return 0;',
        '        int leftGain = Math.max(maxGain(node.left), 0);',
        '        int rightGain = Math.max(maxGain(node.right), 0);',
        '        int currentPathSum = node.val + leftGain + rightGain;',
        '        maxSum = Math.max(maxSum, currentPathSum);',
        '        return node.val + Math.max(leftGain, rightGain);',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        '    int maxSum = INT_MIN;',
        'public:',
        '    int maxPathSum(TreeNode* root) {',
        '        maxGain(root);',
        '        return maxSum;',
        '    }',
        '    int maxGain(TreeNode* node) {',
        '        if (!node) return 0;',
        '        int leftGain = max(maxGain(node->left), 0);',
        '        int rightGain = max(maxGain(node->right), 0);',
        '        int currentPathSum = node->val + leftGain + rightGain;',
        '        maxSum = max(maxSum, currentPathSum);',
        '        return node->val + max(leftGain, rightGain);',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxPathSum(self, root: Optional[TreeNode]) -> int:',
        '        max_sum = float("-inf")',
        '        def max_gain(node):',
        '            nonlocal max_sum',
        '            if not node:',
        '                return 0',
        '            left_gain = max(max_gain(node.left), 0)',
        '            right_gain = max(max_gain(node.right), 0)',
        '            current_sum = node.val + left_gain + right_gain',
        '            max_sum = max(max_sum, current_sum)',
        '            return node.val + max(left_gain, right_gain)',
        '        max_gain(root)',
        '        return max_sum',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '全局变量 `maxSum` 记录整棵树探索过程中的全局最大路径和。',
        3: '🎯 <strong>函数主入口</strong>。',
        7: '后序递归函数 `maxGain(node)`：计算 node 节点向其父节点所能贡献的【单侧最大延伸和】。',
        8: '空节点贡献收益为 0。',
        9: '递归左子树：如果左子树增益为负，则舍弃取 0。',
        10: '递归右子树：如果右子树增益为负，同样舍弃取 0。',
        11: '💡 <strong>拐点路径结算</strong>：以当前 node 为最高拱顶的完整闭合路径和为 $node.val + leftGain + rightGain$。',
        12: '全局比较更新 `maxSum`。',
        13: '向上回溯返回：父节点如果连入当前节点，只能选择走左支或右支之一，返回 $node.val + \\max(leftGain, rightGain)$。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        2: '初始化全局最大和 maxSum 为负无穷。',
        4: '空节点返回 0。',
        6: '计算左支向当前节点提供的最大收益，负值截断为 0。',
        7: '计算右支向当前节点提供的最大收益，负值截断为 0。',
        9: '计算以当前节点为顶点的最大拐点路径并更新全局 maxSum。',
        11: '向父节点返回单侧延伸最大值。',
        14: '返回最终全局最大和。',
      },
      cpp: {
        1: '类定义 Solution。',
        3: '🎯 <strong>函数主入口</strong>。',
        9: '空节点判定。',
        10: '左右子树单侧贡献计算。',
        12: '拐点路径和更新全局最优。',
        13: '向上回溯返回单侧最大值。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>。',
        6: '基准情况。',
        8: '左分支与右分支最大贡献。',
        10: '拱形路径更新 max_sum。',
        12: '向父节点传递单向路径最大值。',
      },
    },
    keyPoints: {
      thinking: '树型 DP 的经典“后序遍历汇聚信息”模型。每个节点面临两个维度的计算：1. 以当前节点作为顶点的完整路径（同时包含左子树+右子树）；2. 作为子树一部分，向父节点能够提供的单向延伸收益（只能选左或右一侧）。',
      state: '递归返回值 gain(u) 表示以 u 为起点向其子树延伸的单向最大路径和。',
      equation: 'gain(u) = val(u) + \\max(0, gain(left), gain(right))；拐点最大和 = val(u) + \\max(0, gain(left)) + \\max(0, gain(right))',
      initAndBounds: '叶子节点空指针返回 0；全局 maxSum 初始化为负无穷。',
      complexity: '时间复杂度 $O(N)$（每个节点仅访问一次），空间复杂度 $O(H)$（递归调用栈深度）。',
    },
    faqList: [
      {
        tag: '为什么不能把左+右都返回给父节点？',
        question: '为什么递归向父节点返回时只能选 max(leftGain, rightGain) 而不能两个都选？',
        answer: '因为根据题目定义，路径必须是一条不分叉的序列。如果父节点同时连接当前节点的左右子树，就会在当前节点处产生三叉分支（父、左子、右子），破坏了合法简单路径的定义。',
      },
      {
        tag: '负数截断',
        question: '为什么要使用 Math.max(gain, 0) 将收益与 0 取最大？',
        answer: '如果某子树延伸上来的最大路径和是负数，包含它只会让总和变小。路径随时可以在当前节点停止而不继续往下延伸，因此负收益子树直接舍弃不选。',
      },
    ],
  },
  generateSteps: (input: { root?: Array<number | null> }): DpTraceStep[] => {
    const rawArr = input?.root && input.root.length > 0 ? input.root : [-10, 9, 20, null, null, 15, 7];
    const steps: DpTraceStep[] = [];

    interface RawTreeNode {
      id: string;
      val: number;
      left: RawTreeNode | null;
      right: RawTreeNode | null;
    }

    function buildTree(arr: Array<number | null>): RawTreeNode | null {
      if (!arr || arr.length === 0 || arr[0] === null) return null;
      const root: RawTreeNode = { id: '0', val: arr[0], left: null, right: null };
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
    let globalMax = -Infinity;

    function toDpTree(node: RawTreeNode | null, activeId?: string, computedGains: Map<string, number> = new Map()): DpTreeNode | null {
      if (!node) return null;
      const gain = computedGains.get(node.id);
      return {
        id: node.id,
        label: `${node.val}`,
        value: gain !== undefined ? gain : node.val,
        state: node.id === activeId ? 'active' : gain !== undefined ? 'computed' : 'default',
        children: [
          toDpTree(node.left, activeId, computedGains),
          toDpTree(node.right, activeId, computedGains),
        ].filter(Boolean) as DpTreeNode[],
      };
    }

    const gainsMap = new Map<string, number>();

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `初始化二叉树，开始自底向上后序遍历计算单侧最大增益并结算拱形路径`,
        log: '后序遍历启动，全局 maxSum 初始化为 -Infinity',
        vars: [
          { name: 'globalMax', value: '-Infinity' },
        ],
        metrics: { maxPathSum: -Infinity },
      })
    );

    function postOrder(node: RawTreeNode | null): number {
      if (!node) return 0;

      const leftGain = Math.max(0, postOrder(node.left));
      const rightGain = Math.max(0, postOrder(node.right));

      const archSum = node.val + leftGain + rightGain;
      const oldMax = globalMax;
      globalMax = Math.max(globalMax, archSum);

      const returnGain = node.val + Math.max(leftGain, rightGain);
      gainsMap.set(node.id, returnGain);

      steps.push(
        makeTraceStep({
          tree: toDpTree(treeRoot, node.id, gainsMap),
          message: `访问节点 [val=${node.val}]: 左子单侧增益=${leftGain}, 右子单侧增益=${rightGain} -> 拐点闭合路径=${archSum}，向父返回单侧增益=${returnGain} (全局最大: ${oldMax} -> ${globalMax})`,
          log: `节点(${node.val}): leftGain=${leftGain}, rightGain=${rightGain}, archSum=${archSum}, returnGain=${returnGain}, globalMax=${globalMax}`,
          formula: 'archSum = val + max(0, leftGain) + max(0, rightGain)',
          formulaSubstituted: `${archSum} = ${node.val} + ${leftGain} + ${rightGain}`,
          vars: [
            { name: '当前节点', value: String(node.val) },
            { name: '左支收益', value: String(leftGain) },
            { name: '右支收益', value: String(rightGain) },
            { name: '拐点路径和', value: String(archSum) },
            { name: '单侧提供收益', value: String(returnGain) },
            { name: '全局最大和', value: String(globalMax) },
          ],
          metrics: { maxPathSum: globalMax },
        })
      );

      return returnGain;
    }

    postOrder(treeRoot);

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot, undefined, gainsMap),
        message: `🎉 树型 DP 遍历完成！整棵二叉树的最大路径和为 ${globalMax}`,
        log: `最终全局最大路径和 = ${globalMax}`,
        vars: [
          { name: '最终最大路径和', value: String(globalMax) },
        ],
        metrics: { maxPathSum: globalMax },
      })
    );

    return steps;
  },
};
