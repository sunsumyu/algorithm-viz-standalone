/**
 * 二叉树的最近公共祖先 (Lowest Common Ancestor of a Binary Tree · LeetCode 236)
 * 领域知识与题解精讲配置声明
 */

export const LCA_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 236</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">二叉树的最近公共祖先 (Lowest Common Ancestor)</h2>
    </div>
    <p style="margin: 0;">给定一个二叉树, 找到该树中两个指定节点 <code style="color: #38bdf8; font-family: monospace;">p</code> 和 <code style="color: #fde047; font-family: monospace;">q</code> 的最近公共祖先（LCA）。百度百科中最近公共祖先的定义为：“对于有根树 T 的两个节点 p、q，最近公共祖先表示为一个节点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）。”</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 1</div>
      <div>输出: 3 (节点 5 和 1 的最近公共祖先是 3)</div>
    </div>
  </div>
`;

export const LCA_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 后序遍历自底向上回溯与四种分支归并情况
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 后序递归四象限状态合并</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>终止条件：</strong> 若 <code style="color: #f87171; font-family: monospace;">root == null || root == p || root == q</code>，直接返回 <code style="color: #38bdf8; font-family: monospace;">root</code>；<br/>
        2. <strong>递归左右子树：</strong> <code style="color: #38bdf8; font-family: monospace;">TreeNode left = lowestCommonAncestor(root.left, p, q);</code> 和 <code style="color: #fbbf24; font-family: monospace;">TreeNode right = lowestCommonAncestor(root.right, p, q);</code>；<br/>
        3. <strong>结果合并：</strong><br/>
        &nbsp;&nbsp;• <strong>左右均非空：</strong> 说明 p 和 q 分布在 root 的两侧，<strong>当前 root 就是 LCA</strong>，返回 <code style="color: #34d399; font-family: monospace;">root</code>；<br/>
        &nbsp;&nbsp;• <strong>左空右非空：</strong> 说明 p 和 q 都在右子树，返回 <code style="color: #fbbf24; font-family: monospace;">right</code>；<br/>
        &nbsp;&nbsp;• <strong>左非空右空：</strong> 说明 p 和 q 都在左子树，返回 <code style="color: #38bdf8; font-family: monospace;">left</code>；<br/>
        &nbsp;&nbsp;• <strong>左右皆空：</strong> 说明子树不包含 p 和 q，返回 <code style="color: #64748b; font-family: monospace;">null</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(n)</code>，二叉树每个节点至多被访问一次。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(h)</code>，递归深度取决于树高。
        </p>
      </div>
    </div>
  </div>
`;

export const LCA_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {',
    '        if (root == null || root == p || root == q) return root;',
    '        TreeNode left = lowestCommonAncestor(root.left, p, q);',
    '        TreeNode right = lowestCommonAncestor(root.right, p, q);',
    '        if (left != null && right != null) return root; // p, q 分属两侧',
    '        return left != null ? left : right;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {',
    '        if (!root || root == p || root == q) return root;',
    '        TreeNode* left = lowestCommonAncestor(root->left, p, q);',
    '        TreeNode* right = lowestCommonAncestor(root->right, p, q);',
    '        if (left && right) return root;',
    '        return left ? left : right;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:',
    '        if not root or root == p or root == q:',
    '            return root',
    '        left = self.lowestCommonAncestor(root.left, p, q)',
    '        right = self.lowestCommonAncestor(root.right, p, q)',
    '        if left and right:',
    '            return root',
    '        return left if left else right',
  ],
  javascript: [
    'var lowestCommonAncestor = function(root, p, q) {',
    '    if (!root || root === p || root === q) return root;',
    '    const left = lowestCommonAncestor(root.left, p, q);',
    '    const right = lowestCommonAncestor(root.right, p, q);',
    '    if (left && right) return root;',
    '    return left ? left : right;',
    '};',
  ],
};
