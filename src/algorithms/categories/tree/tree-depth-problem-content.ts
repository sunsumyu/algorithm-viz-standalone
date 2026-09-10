/**
 * 二叉树的最大深度 (Maximum Depth of Binary Tree · LeetCode 104)
 * 领域知识与题解精讲配置声明
 */

export const TREE_DEPTH_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 104</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">二叉树的最大深度 (Maximum Depth of Binary Tree)</h2>
    </div>
    <p style="margin: 0;">给定一个二叉树 <code style="color: #38bdf8; font-family: monospace;">root</code> ，返回其最大深度。二叉树的 <strong>最大深度</strong> 是指从根节点到最远叶子节点的最长路径上的节点数。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: root = [3, 9, 20, null, null, 15, 7]</div>
      <div>输出: 3</div>
      <div style="color: #94a3b8;">解释: 路径 3 -> 20 -> 15 或 3 -> 20 -> 7 的节点数为 3。</div>
    </div>
  </div>
`;

export const TREE_DEPTH_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 后序遍历（自底向上求高度）与前序遍历（自顶向下求深度）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 后序递归推导高度公式</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>终止条件：</strong> <code style="color: #f87171; font-family: monospace;">if (root == null) return 0;</code>；<br/>
        2. <strong>递归求左子树深度：</strong> <code style="color: #38bdf8; font-family: monospace;">int leftDepth = maxDepth(root.left);</code>；<br/>
        3. <strong>递归求右子树深度：</strong> <code style="color: #fbbf24; font-family: monospace;">int rightDepth = maxDepth(root.right);</code>；<br/>
        4. <strong>当前节点高度归约：</strong> <code style="color: #34d399; font-family: monospace;">return 1 + Math.max(leftDepth, rightDepth);</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(n)</code>，遍历每一个二叉树节点。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(h)</code>（h 为树的高度）。
        </p>
      </div>
    </div>
  </div>
`;

export const TREE_DEPTH_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int maxDepth(TreeNode root) {',
    '        if (root == null) return 0;',
    '        int leftDepth = maxDepth(root.left);',
    '        int rightDepth = maxDepth(root.right);',
    '        return 1 + Math.max(leftDepth, rightDepth);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    int maxDepth(TreeNode* root) {',
    '        if (!root) return 0;',
    '        int leftDepth = maxDepth(root->left);',
    '        int rightDepth = maxDepth(root->right);',
    '        return 1 + max(leftDepth, rightDepth);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def maxDepth(self, root: Optional[TreeNode]) -> int:',
    '        if not root:',
    '            return 0',
    '        left_depth = self.maxDepth(root.left)',
    '        right_depth = self.maxDepth(root.right)',
    '        return 1 + max(left_depth, right_depth)',
  ],
  javascript: [
    'var maxDepth = function(root) {',
    '    if (!root) return 0;',
    '    const leftDepth = maxDepth(root.left);',
    '    const rightDepth = maxDepth(root.right);',
    '    return 1 + Math.max(leftDepth, rightDepth);',
    '};',
  ],
};
