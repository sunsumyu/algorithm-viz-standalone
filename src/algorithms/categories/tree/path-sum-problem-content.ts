/**
 * 路径总和 (Path Sum · LeetCode 112)
 * 领域知识与题解精讲配置声明
 */

export const PATH_SUM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 112</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">路径总和 (Path Sum)</h2>
    </div>
    <p style="margin: 0;">给你二叉树的根节点 <code style="color: #38bdf8; font-family: monospace;">root</code> 和一个表示目标和的整数 <code style="color: #fde047; font-family: monospace;">targetSum</code> 。判断该树中是否存在 <strong>根节点到叶子节点</strong> 的路径，这条路径上所有节点值相加等于目标和 <code style="color: #fde047; font-family: monospace;">targetSum</code> 。如果存在，返回 <code style="color: #34d399; font-family: monospace;">true</code> ；否则，返回 <code style="color: #f87171; font-family: monospace;">false</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: root = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], targetSum = 22</div>
      <div>输出: true (路径 5 -> 4 -> 11 -> 2 的和为 22)</div>
    </div>
  </div>
`;

export const PATH_SUM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 减法计数器与叶子节点到达判断
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 递归回溯与减法计数</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>空节点返回 false：</strong> <code style="color: #f87171; font-family: monospace;">if (root == null) return false;</code>；<br/>
        2. <strong>叶子节点终止条件：</strong> 当且仅当当前节点是叶子节点（<code style="color: #38bdf8; font-family: monospace;">root.left == null && root.right == null</code>）时：<br/>
        &nbsp;&nbsp;• 若 <code style="color: #34d399; font-family: monospace;">root.val == targetSum</code>，说明找到了一条合法路径，直接返回 <code style="color: #34d399; font-family: monospace;">true</code>；<br/>
        3. <strong>递归左右子树：</strong> 沿路径深入时减去当前节点值：<br/>
        &nbsp;&nbsp;• <code style="color: #fbbf24; font-family: monospace;">hasPathSum(root.left, targetSum - root.val) || hasPathSum(root.right, targetSum - root.val)</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 易错点</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>必须是叶子节点：</strong> 如果某非叶子节点的累加和已经达到 targetSum，但它还有子节点，不能提前返回 true，必须完整延伸到叶子。
        </p>
      </div>
    </div>
  </div>
`;

export const PATH_SUM_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public boolean hasPathSum(TreeNode root, int targetSum) {',
    '        if (root == null) return false;',
    '        // 如果是叶子节点且剩余和恰好等于当前节点值',
    '        if (root.left == null && root.right == null) {',
    '            return root.val == targetSum;',
    '        }',
    '        // 递归检查左右子树',
    '        return hasPathSum(root.left, targetSum - root.val)',
    '            || hasPathSum(root.right, targetSum - root.val);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool hasPathSum(TreeNode* root, int targetSum) {',
    '        if (!root) return false;',
    '        if (!root->left && !root->right) {',
    '            return root->val == targetSum;',
    '        }',
    '        return hasPathSum(root->left, targetSum - root->val)',
    '            || hasPathSum(root->right, targetSum - root->val);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:',
    '        if not root:',
    '            return False',
    '        if not root.left and not root.right:',
    '            return root.val == targetSum',
    '        return (self.hasPathSum(root.left, targetSum - root.val) or',
    '                self.hasPathSum(root.right, targetSum - root.val))',
  ],
  javascript: [
    'var hasPathSum = function(root, targetSum) {',
    '    if (!root) return false;',
    '    if (!root.left && !root.right) {',
    '        return root.val === targetSum;',
    '    }',
    '    return hasPathSum(root.left, targetSum - root.val)',
    '        || hasPathSum(root.right, targetSum - root.val);',
    '    };',
  ],
};
