import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

export const HouseRobberIiiSpec: AlgorithmSpec = {
  id: 'house-robber-iii',
  name: '打家劫舍 III (House Robber III)',
  category: '树形 DP',
  description: '小偷发现了一个新的可行窃的地区。这个地区的房屋排列类似于一棵二叉树。输入二叉树根节点 root，返回在不触动警报的情况下能够盗取的最高金额。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 337,
    leetcodeUrl: 'https://leetcode.cn/problems/house-robber-iii/',
    difficulty: 'medium',
    tags: ['树', '深度优先搜索', '动态规划', '二叉树', '树形DP'],
    description: '小偷又发现了一个新的可行窃的地区。这个地区的房屋排列类似于一棵二叉树。输入二叉树根节点 <code>root</code> ，如果两个直接相连的房子在同一天晚上被打劫，房屋将自动报警。<br/><br/>计算在不触动警报的情况下，小偷一晚能够盗取的最高金额。<br/><br/><strong>树形 DP 状态定义</strong>：每个节点返回长度为 2 的数组 <code>[不偷当前节点最大收益, 偷当前节点最大收益]</code>。<br/>• <strong>偷当前节点</strong>：<code>val + 左子不偷 + 右子不偷</code>。<br/>• <strong>不偷当前节点</strong>：<code>max(左偷, 左不偷) + max(右偷, 右不偷)</code>。',
    examples: [
      {
        input: 'root = [3,2,3,null,3,null,1]',
        output: '7',
        explanation: '小偷一晚能够盗取的最高金额 3 + 3 + 1 = 7 。',
      },
      {
        input: 'root = [3,4,5,1,3,null,1]',
        output: '9',
        explanation: '小偷一晚能够盗取的最高金额 4 + 5 = 9 。',
      },
    ],
    constraints: [
      '树的节点数在 [1, 10^4] 范围内',
      '0 <= Node.val <= 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: 6, cpp: 6, python: 5, javascript: 5 },
    stateTransfer: {
      java: { primary: [9, 10], context: [7, 8] },
      cpp: { primary: [9, 10], context: [7, 8] },
      python: { primary: [8, 9], context: [6, 7] },
      javascript: { primary: [8, 9], context: [6, 7] },
    },
    returnResult: { java: 12, cpp: 12, python: 11, javascript: 12 },
  },
  code: {
    languages: {
      javascript: [
        'function rob(root) {',
        '    const res = robTree(root);',
        '    return Math.max(res[0], res[1]); // [不偷当前, 偷当前] 取最大',
        '}',
        '',
        'function robTree(cur) {',
        '    if (!cur) return [0, 0]; // 空节点 [不偷=0, 偷=0]',
        '    const left = robTree(cur.left); // 后序遍历：递归左子树',
        '    const right = robTree(cur.right); // 后序遍历：递归右子树',
        '    // 1. 偷当前节点：左右子节点绝对不能偷',
        '    const val1 = cur.val + left[0] + right[0];',
        '    // 2. 不偷当前节点：左右子节点可以偷也可以不偷，各自取较大者',
        '    const val0 = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);',
        '    return [val0, val1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int rob(TreeNode root) {',
        '        int[] res = robTree(root);',
        '        return Math.max(res[0], res[1]);',
        '    }',
        '    private int[] robTree(TreeNode cur) {',
        '        if (cur == null) return new int[]{0, 0};',
        '        int[] left = robTree(cur.left);',
        '        int[] right = robTree(cur.right);',
        '        int val1 = cur.val + left[0] + right[0];',
        '        int val0 = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);',
        '        return new int[]{val0, val1};',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int rob(TreeNode* root) {',
        '        vector<int> res = robTree(root);',
        '        return max(res[0], res[1]);',
        '    }',
        '    vector<int> robTree(TreeNode* cur) {',
        '        if (!cur) return {0, 0};',
        '        vector<int> left = robTree(cur->left);',
        '        vector<int> right = robTree(cur->right);',
        '        int val1 = cur->val + left[0] + right[0];',
        '        int val0 = max(left[0], left[1]) + max(right[0], right[1]);',
        '        return {val0, val1};',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def rob(self, root: Optional[TreeNode]) -> int:',
        '        res = self.robTree(root)',
        '        return max(res[0], res[1])',
        '',
        '    def robTree(self, cur: Optional[TreeNode]) -> List[int]:',
        '        if not cur: return [0, 0]',
        '        left = self.robTree(cur.left)',
        '        right = self.robTree(cur.right)',
        '        val1 = cur.val + left[0] + right[0]',
        '        val0 = max(left[0], left[1]) + max(right[0], right[1])',
        '        return [val0, val1]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '主函数入口：返回树形房屋最大偷窃金额。',
        2: '后序遍历调用辅助函数 robTree(root)。',
        3: '返回根节点 [不偷, 偷] 的最大值。',
        6: '后序遍历 DP 核心：返回当前节点 [不偷价值, 偷价值]。',
        7: '终止基底：空节点收益均为 0，返回 [0, 0]。',
        8: '递归左子节点获得 left 状态。',
        9: '递归右子节点获得 right 状态。',
        11: '偷当前节点：获得当前房屋现金 cur.val，由于相邻限制，子节点必不能偷 (left[0] + right[0])。',
        13: '不偷当前节点：子节点不受限，自由选择各自最大收益 max(left[0], left[1]) + max(right[0], right[1])。',
        14: '向上层回溯返回 [val0, val1]。',
      },
      java: {
        2: '主函数入口。',
        3: '调用后序遍历。',
        4: '返回两者 max。',
        6: 'robTree 状态机。',
        7: '空节点特判。',
        8: '递归左子树。',
        9: '递归右子树。',
        10: '偷当前节点。',
        11: '不偷当前节点。',
        12: '返回结果。',
      },
      cpp: {
        3: '主入口。',
        4: 'robTree 调用。',
        5: 'max 返回。',
        7: '后序遍历。',
        8: '空节点返回。',
        9: '递归左右。',
        11: '偷当前节点。',
        12: '不偷当前节点。',
        13: '返回向量。',
      },
      python: {
        2: '主入口。',
        3: '递归调用。',
        4: '返回 max。',
        6: 'robTree 方法。',
        7: '空节点特判。',
        8: '递归左右子树。',
        10: '偷当前节点。',
        11: '不偷当前节点。',
        12: '返回元组。',
      },
    },
    keyPoints: {
      title: '🎯 打家劫舍 III (树形 DP) 5 步法系统精讲',
      summary: 'LeetCode 337。树形 DP 的经典代表。利用后序遍历自底向上回溯，每个节点维护一个长度为 2 的状态元组 [不偷当前, 偷当前]！',
      points: [
        { label: '一、树形状态定义', desc: '每个节点返回元组 <code>[val0, val1]</code>：<br>• <code>val0</code>：<strong>不偷</strong>当前节点所能得到的最大金额。<br>• <code>val1</code>：<strong>偷</strong>当前节点所能得到的最大金额。', icon: '🎯', badge: '二元状态元组' },
        { label: '二、后序状态转移', desc: '• <strong>偷当前</strong>：<code>val1 = cur.val + left[0] + right[0]</code>（子节点强制不偷）。<br>• <strong>不偷当前</strong>：<code>val0 = max(left[0], left[1]) + max(right[0], right[1])</code>（子节点自由决策）。', icon: '⚡', badge: '后序转移' },
        { label: '三、递归终止基底', desc: '空节点 <code>null</code> 返回 <code>[0, 0]</code>。', icon: '🎬', badge: '[0, 0]' },
        { label: '四、时空复杂度', desc: '• 时间复杂度：<code>O(n)</code>（每个节点仅访问一次）。<br>• 空间复杂度：<code>O(h)</code>（递归调用栈深度）。', icon: '⏱️', badge: 'O(n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    // Binary tree: 3 -> left(2, right=3), right(3, right=1)
    const treeData = {
      id: 'root',
      val: 3,
      left: {
        id: 'n2',
        val: 2,
        right: { id: 'n2_r', val: 3 },
      },
      right: {
        id: 'n3',
        val: 3,
        right: { id: 'n3_r', val: 1 },
      },
    };

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      node?: string;
      val?: number | string;
      notRob?: number | string;
      rob?: number | string;
      changed?: string[];
    }) => {
      const nd = opts.node ?? '-';
      const v = opts.val ?? '-';
      const nR = opts.notRob ?? '-';
      const r = opts.rob ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: '当前考察节点', value: nd, type: 'string' as const, changed: chSet.has('nd') },
        { name: '节点现金 val', value: String(v), type: (typeof v === 'number' ? 'number' : 'string') as any, changed: chSet.has('v') },
        { name: '不偷本节点收益 val0', value: String(nR), type: (typeof nR === 'number' ? 'number' : 'string') as any, changed: chSet.has('nr') },
        { name: '偷本节点收益 val1', value: String(r), type: (typeof r === 'number' ? 'number' : 'string') as any, changed: chSet.has('r') },
      ];
    };

    // Step 0: Entry
    push({
      tree: treeData,
      message: `🎯 函数入口：打家劫舍 III（树形 DP）。采用后序遍历（左右根）自底向上计算二元状态 [不偷, 偷]。`,
      log: `entry: tree rob`,
      vars: makeVars({ node: 'Root(3)', val: 3, changed: ['nd', 'v'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Leaf n2_r (3)
    push({
      tree: treeData,
      message: `🍃 访问叶子节点 (3)：左空右空 [0, 0] $\rightarrow$ 偷得 $3，不偷得 $0 $\rightarrow$ 返回 [0, 3]。`,
      log: `leaf (3) => [0, 3]`,
      vars: makeVars({ node: '叶子(3)', val: 3, notRob: 0, rob: 3, changed: ['nd', 'v', 'nr', 'r'] }),
      codeLine: { java: 10, cpp: 11, python: 10, javascript: 11 },
    });

    // Step 2: Leaf n3_r (1)
    push({
      tree: treeData,
      message: `🍃 访问叶子节点 (1)：左空右空 [0, 0] $\rightarrow$ 偷得 $1，不偷得 $0 $\rightarrow$ 返回 [0, 1]。`,
      log: `leaf (1) => [0, 1]`,
      vars: makeVars({ node: '叶子(1)', val: 1, notRob: 0, rob: 1, changed: ['nd', 'v', 'nr', 'r'] }),
      codeLine: { java: 10, cpp: 11, python: 10, javascript: 11 },
    });

    // Step 3: Node n2 (2)
    // Left: [0, 0], Right: [0, 3]
    // rob = 2 + 0 + 0 = 2
    // notRob = max(0,0) + max(0,3) = 3
    push({
      tree: treeData,
      message: `⚡ 回溯节点 (2)：左子[0, 0]，右子[0, 3]。\n• 偷本节点：2 + 0 + 0 = $2\n• 不偷本节点：0 + max(0, 3) = $3\n$\rightarrow$ 返回 [3, 2]。`,
      log: `node (2) => [3, 2]`,
      vars: makeVars({ node: '节点(2)', val: 2, notRob: 3, rob: 2, changed: ['nd', 'v', 'nr', 'r'] }),
      codeLine: { java: [10, 11], cpp: [11, 12], python: [10, 11], javascript: [11, 13] },
    });

    // Step 4: Node n3 (3)
    // Left: [0, 0], Right: [0, 1]
    // rob = 3 + 0 + 0 = 3
    // notRob = max(0,0) + max(0,1) = 1
    push({
      tree: treeData,
      message: `⚡ 回溯节点 (3)：左子[0, 0]，右子[0, 1]。\n• 偷本节点：3 + 0 + 0 = $3\n• 不偷本节点：0 + max(0, 1) = $1\n$\rightarrow$ 返回 [1, 3]。`,
      log: `node (3) => [1, 3]`,
      vars: makeVars({ node: '节点(3)', val: 3, notRob: 1, rob: 3, changed: ['nd', 'v', 'nr', 'r'] }),
      codeLine: { java: [10, 11], cpp: [11, 12], python: [10, 11], javascript: [11, 13] },
    });

    // Step 5: Root (3)
    // Left: [3, 2], Right: [1, 3]
    // rob = 3 + 3 (left[0]) + 1 (right[0]) = 7
    // notRob = max(3, 2) + max(1, 3) = 3 + 3 = 6
    const rootRob = 3 + 3 + 1;
    const rootNotRob = Math.max(3, 2) + Math.max(1, 3);
    const finalAns = Math.max(rootRob, rootNotRob);

    push({
      tree: treeData,
      message: `👑 汇聚根节点 (3)：左子[3, 2]，右子[1, 3]。\n• 偷根节点：3 + 3 + 1 = $7\n• 不偷根节点：max(3, 2) + max(1, 3) = 3 + 3 = $6\n$\rightarrow$ 根状态 [6, 7]。`,
      log: `root (3) => [6, 7], ans = 7`,
      vars: makeVars({ node: '根节点(3)', val: 3, notRob: rootNotRob, rob: rootRob, changed: ['nd', 'v', 'nr', 'r'] }),
      codeLine: { java: [10, 11], cpp: [11, 12], python: [10, 11], javascript: [11, 13] },
    });

    // Step 6: Return
    push({
      tree: treeData,
      message: `🏁 算法结束：全局最高偷窃金额为 Math.max(6, 7) = $${finalAns}。`,
      log: `return: max(6, 7) = 7`,
      vars: makeVars({ node: '计算完成', notRob: rootNotRob, rob: rootRob, changed: ['nd'] }),
      codeLine: { java: 4, cpp: 5, python: 4, javascript: 3 },
    });

    return steps;
  },
};
