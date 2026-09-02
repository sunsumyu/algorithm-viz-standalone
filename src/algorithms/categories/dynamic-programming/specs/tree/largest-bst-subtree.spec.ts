import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

/**
 * 最大BST子树节点数 (Largest BST Subtree)
 * LeetCode 333 / 左程云算法通关课 第078讲 树型DP上
 * 树型DP套路：每个节点向父节点汇报 [是否BST, 最小值, 最大值, 节点数] 四元组
 */
export const LargestBstSubtreeSpec: AlgorithmSpec = {
  id: 'largest-bst-subtree',
  name: '最大BST子树 (Largest BST Subtree)',
  category: '树型 DP',
  description:
    '树型DP经典套路。给定一棵二叉树，找到其中节点数最多的二叉搜索子树（BST）。每个节点向父节点汇报：当前子树是否为BST、最小值、最大值、节点数。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 333,
    leetcodeUrl: 'https://leetcode.cn/problems/largest-bst-subtree/',
    difficulty: 'medium',
    tags: ['树', '动态规划', '深度优先搜索', '二叉搜索树', '树型DP'],
    description:
      '给你一棵以 <code>root</code> 为根的二叉树，请你返回 <strong>任意</strong> 一棵结点数最多的子树，该子树需要是一棵 <strong>二叉搜索树（BST）</strong>。<br/><br/><strong>树型DP思路：</strong>每个节点向父节点汇报四元组 <code>[isBST, minVal, maxVal, size]</code>，后序遍历自底向上融合。',
    examples: [
      {
        input: 'root = [10, 5, 15, 1, 8, null, 7]',
        output: '3',
        explanation: '以 5 为根的子树 [5, 1, 8] 是最大BST，包含 3 个节点。',
      },
      {
        input: 'root = [4, 2, 7, 2, 3, 5, null, 2, null, null, null, null, null, 1]',
        output: '2',
        explanation: '以 2 为根（右节点）的子树 [2, 3] 是最大BST，包含 2 个节点。',
      },
    ],
    constraints: [
      '树中节点数目在范围 [0, 10000] 内（演示推荐 ≤ 15）',
      '-10^4 ≤ Node.val ≤ 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 7, cpp: 8, python: 7, javascript: 6 },
    init: { java: 3, cpp: 4, python: 3, javascript: 2 },
    stateTransfer: {
      java: [8, 9, 10, 11, 12, 13, 14, 15],
      cpp: [9, 10, 11, 12, 13, 14, 15, 16],
      python: [8, 9, 10, 11, 12, 13, 14, 15],
      javascript: [7, 8, 9, 10, 11, 12, 13, 14],
    },
    returnResult: { java: 19, cpp: 20, python: 18, javascript: 18 },
  },
  code: {
    languages: {
      javascript: [
        'function largestBSTSubtree(root) {',
        '    let maxSize = 0;',
        '    // 返回 [isBST, min, max, size]',
        '    function info(node) {',
        '        if (!node) return [true, Infinity, -Infinity, 0];',
        '        const [lBST, lMin, lMax, lSize] = info(node.left);',
        '        const [rBST, rMin, rMax, rSize] = info(node.right);',
        '        // 当前节点是BST: 左右均为BST 且 左最大值 < 当前值 < 右最小值',
        '        const isBST = lBST && rBST && lMax < node.val && node.val < rMin;',
        '        const size = isBST ? lSize + rSize + 1 : 0;',
        '        if (isBST) maxSize = Math.max(maxSize, size);',
        '        const minVal = Math.min(lMin, node.val);',
        '        const maxVal = Math.max(rMax, node.val);',
        '        return [isBST, minVal, maxVal, size];',
        '    }',
        '    info(root);',
        '    return maxSize;',
        '}',
      ],
      java: [
        'class Solution {',
        '    private int maxSize = 0;',
        '    public int largestBSTSubtree(TreeNode root) {',
        '        info(root);',
        '        return maxSize;',
        '    }',
        '    // 返回 int[] { isBST(0/1), min, max, size }',
        '    private int[] info(TreeNode node) {',
        '        if (node == null) return new int[]{ 1, Integer.MAX_VALUE, Integer.MIN_VALUE, 0 };',
        '        int[] L = info(node.left);',
        '        int[] R = info(node.right);',
        '        boolean isBST = L[0] == 1 && R[0] == 1 && L[2] < node.val && node.val < R[1];',
        '        int size = isBST ? L[3] + R[3] + 1 : 0;',
        '        if (isBST) maxSize = Math.max(maxSize, size);',
        '        int minVal = Math.min(L[1], node.val);',
        '        int maxVal = Math.max(R[2], node.val);',
        '        return new int[]{ isBST ? 1 : 0, minVal, maxVal, size };',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        '    int maxSize = 0;',
        'public:',
        '    int largestBSTSubtree(TreeNode* root) {',
        '        info(root);',
        '        return maxSize;',
        '    }',
        '    // 返回 {isBST, min, max, size}',
        '    array<int,4> info(TreeNode* node) {',
        '        if (!node) return {1, INT_MAX, INT_MIN, 0};',
        '        auto [lB,lMin,lMax,lSz] = info(node->left);',
        '        auto [rB,rMin,rMax,rSz] = info(node->right);',
        '        bool isBST = lB && rB && lMax < node->val && node->val < rMin;',
        '        int sz = isBST ? lSz + rSz + 1 : 0;',
        '        if (isBST) maxSize = max(maxSize, sz);',
        '        return {isBST?1:0, min(lMin, node->val), max(rMax, node->val), sz};',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def largestBSTSubtree(self, root: Optional[TreeNode]) -> int:',
        '        self.max_size = 0',
        '        def info(node):',
        '            if not node:',
        '                return True, float("inf"), float("-inf"), 0',
        '            l_bst, l_min, l_max, l_sz = info(node.left)',
        '            r_bst, r_min, r_max, r_sz = info(node.right)',
        '            is_bst = l_bst and r_bst and l_max < node.val < r_min',
        '            size = l_sz + r_sz + 1 if is_bst else 0',
        '            if is_bst:',
        '                self.max_size = max(self.max_size, size)',
        '            return is_bst, min(l_min, node.val), max(r_max, node.val), size',
        '        info(root)',
        '        return self.max_size',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '全局变量 maxSize 记录最大BST子树节点数。',
        3: '🎯 <strong>函数主入口</strong>。',
        8: 'info 函数返回四元组 [isBST, 最小值, 最大值, 节点数]。',
        9: '空节点：是BST，最小值=+∞，最大值=-∞，节点数=0。',
        10: '递归收集左子树信息。',
        11: '递归收集右子树信息。',
        12: '💡 <strong>BST判定</strong>：左子树是BST 且 右子树是BST 且 左最大 < 当前值 < 右最小。',
        13: '当前子树是BST时节点数 = 左节点数 + 右节点数 + 1。',
        14: '更新全局最大BST节点数。',
        15: '向父节点汇报当前子树的最小/最大值范围。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        2: '全局 maxSize 记录最大BST子树节点数。',
        5: '空节点返回 [true, +∞, -∞, 0]。',
        6: '递归左子树信息。',
        7: '递归右子树信息。',
        9: '💡 <strong>BST判定条件</strong>：左右均BST 且 左最大 < 当前值 < 右最小。',
        10: 'BST时累计节点数，否则为0（无效子树不参与全局比较）。',
        11: '更新全局答案。',
        17: '返回最终最大BST子树节点数。',
      },
      cpp: {
        1: '类定义 Solution。',
        4: '🎯 <strong>函数主入口</strong>。',
        9: '空节点返回。',
        13: '💡 BST判定：三个条件同时满足。',
        15: '更新 maxSize。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>主函数</strong>。',
        3: '初始化全局最大BST大小。',
        4: '定义后序递归函数 info。',
        5: '基准情况：空节点。',
        9: '💡 <strong>BST判定</strong>三条件。',
        12: '更新全局最优解。',
        15: '返回答案。',
      },
    },
    keyPoints: {
      thinking:
        '树型DP套路精髓：每个节点需要从子树收集哪些信息，才能在当前节点完成BST判断？答：左子树是否BST、左子树最大值；右子树是否BST、右子树最小值；两者节点数。封装成四元组 [isBST, min, max, size]，后序遍历一次搞定。',
      state:
        'info(u) 返回以 u 为根的子树的 [是否BST, 子树最小值, 子树最大值, 节点数]。',
      equation:
        'isBST(u) = isBST(left) ∧ isBST(right) ∧ max(left) < val(u) < min(right)；size(u) = isBST(u) ? size(left) + size(right) + 1 : 0',
      initAndBounds:
        '空节点返回 [true, +∞, -∞, 0]，代表空树是BST，值域为"任何数都能作为父节点的值"。',
      complexity: '时间复杂度 $O(N)$，空间复杂度 $O(H)$。',
    },
    faqList: [
      {
        tag: '空节点哨兵值',
        question: '为什么空节点的最小值是 +∞、最大值是 -∞？',
        answer:
          '空节点是合法的BST（空树是BST）。将最小值设为+∞、最大值设为-∞，是为了在父节点判断时不产生误判：任何父节点的值 val 都满足 lMax(-∞) < val 且 val < rMin(+∞)，即空子树方向不会成为BST判断的障碍。',
      },
      {
        tag: '树型DP套路',
        question: '如何系统性地想到树型DP的解题套路？',
        answer:
          '固定范式：1. 想清楚当前节点需要向子节点"索取"哪些信息（状态维度）。2. 确定如何用子树信息在当前节点完成计算（转移）。3. 确定自底向上的后序遍历顺序（先算子节点，再算当前节点）。',
      },
    ],
  },
  generateSteps: (input: { root?: Array<number | null> }): DpTraceStep[] => {
    const rawArr =
      input?.root && input.root.length > 0 ? input.root : [10, 5, 15, 1, 8, null, 7];
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
    let maxSize = 0;

    // 存储每个节点的 info 结果 {isBST, min, max, size}
    const infoMap = new Map<string, { isBST: boolean; min: number; max: number; size: number }>();

    function toDpTree(node: RawNode | null, activeId?: string): DpTreeNode | null {
      if (!node) return null;
      const nodeInfo = infoMap.get(node.id);
      const label = nodeInfo
        ? `${node.val}\n${nodeInfo.isBST ? `✅BST(${nodeInfo.size})` : '❌'}`
        : String(node.val);
      return {
        id: node.id,
        label,
        value: nodeInfo?.size ?? node.val,
        state: node.id === activeId ? 'active' : nodeInfo ? (nodeInfo.isBST ? 'computed' : 'default') : 'default',
        children: [
          toDpTree(node.left, activeId),
          toDpTree(node.right, activeId),
        ].filter(Boolean) as DpTreeNode[],
      };
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🌲 初始化二叉树，开始后序遍历收集 [是否BST, 最小值, 最大值, 节点数] 四元组信息`,
        log: '后序遍历启动，maxSize = 0',
        vars: [{ name: 'maxSize', value: '0' }],
        metrics: { maxBSTSize: 0 },
      })
    );

    function info(node: RawNode | null): { isBST: boolean; min: number; max: number; size: number } {
      if (!node) return { isBST: true, min: Infinity, max: -Infinity, size: 0 };

      const L = info(node.left);
      const R = info(node.right);

      const isBST = L.isBST && R.isBST && L.max < node.val && node.val < R.min;
      const size = isBST ? L.size + R.size + 1 : 0;
      if (isBST) maxSize = Math.max(maxSize, size);

      const minVal = Math.min(L.min === Infinity ? node.val : L.min, node.val);
      const maxVal = Math.max(R.max === -Infinity ? node.val : R.max, node.val);

      const result = { isBST, min: minVal, max: maxVal, size };
      infoMap.set(node.id, result);

      const lMaxStr = L.max === -Infinity ? '-∞' : String(L.max);
      const rMinStr = R.min === Infinity ? '+∞' : String(R.min);
      const bstJudge = isBST
        ? `✅ ${lMaxStr} < ${node.val} < ${rMinStr}，是BST(${size}节点)`
        : `❌ BST条件不满足`;

      steps.push(
        makeTraceStep({
          tree: toDpTree(treeRoot, node.id),
          message: `节点[${node.val}]: 左子树${L.isBST ? '✅BST' : '❌'}(最大=${lMaxStr}), 右子树${R.isBST ? '✅BST' : '❌'}(最小=${rMinStr}) → ${bstJudge} | 全局最大BST=${maxSize}`,
          log: `node=${node.val}: isBST=${isBST}, size=${size}, maxSize=${maxSize}`,
          formula: 'isBST = lBST ∧ rBST ∧ lMax < val < rMin',
          formulaSubstituted: `${isBST} = ${L.isBST} ∧ ${R.isBST} ∧ ${lMaxStr} < ${node.val} < ${rMinStr}`,
          vars: [
            { name: '当前节点值', value: String(node.val) },
            { name: '左子树BST', value: L.isBST ? '✅是' : '❌否' },
            { name: '左子树最大值', value: lMaxStr },
            { name: '右子树BST', value: R.isBST ? '✅是' : '❌否' },
            { name: '右子树最小值', value: rMinStr },
            { name: '当前是否BST', value: isBST ? `✅是(${size}个节点)` : '❌否' },
            { name: '全局最大BST', value: String(maxSize) },
          ],
          metrics: { maxBSTSize: maxSize },
        })
      );

      return result;
    }

    info(treeRoot);

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🎉 树型DP遍历完成！整棵二叉树中最大BST子树共有 ${maxSize} 个节点`,
        log: `最终最大BST子树节点数 = ${maxSize}`,
        vars: [{ name: '最大BST节点数', value: String(maxSize) }],
        metrics: { maxBSTSize: maxSize },
      })
    );

    return steps;
  },
};
