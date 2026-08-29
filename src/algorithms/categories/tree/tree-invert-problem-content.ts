/**
 * 翻转二叉树 (Invert Binary Tree · LeetCode 226)
 * 领域知识与题解精讲配置声明
 */

export const TREE_INVERT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 226</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">翻转二叉树 (Invert Binary Tree)</h2>
    </div>
    <p style="margin: 0;">给你一棵二叉树的根节点 <code style="color: #38bdf8; font-family: monospace;">root</code> ，翻转这棵二叉树，并返回其根节点（即让每一个节点的左孩子与右孩子互换）。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: root = [4, 2, 7, 1, 3, 6, 9]</div>
      <div>输出: [4, 7, 2, 9, 6, 3, 1]</div>
      <div style="color: #94a3b8;">解释: 节点 4 的左右子树交换，节点 2 和 7 各自的左右子树也对应交换。</div>
    </div>
  </div>
`;

export const TREE_INVERT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 前序 / 后序递归左右子节点交换
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 递归三步走</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>终止条件：</strong> <code style="color: #f87171; font-family: monospace;">if (root == null) return null;</code>；<br/>
        2. <strong>左右指针交换：</strong> 临时暂存并互换：<code style="color: #fbbf24; font-family: monospace;">TreeNode temp = root.left; root.left = root.right; root.right = temp;</code>；<br/>
        3. <strong>向下递归：</strong> 对新的左右子树递归调用 <code style="color: #38bdf8; font-family: monospace;">invertTree(root.left); invertTree(root.right);</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(n)</code>，每个二叉树节点恰好访问并交换一次。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(h)</code>（h 为树的高度，递归调用栈）。
        </p>
      </div>
    </div>
  </div>
`;

export const TREE_INVERT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public TreeNode invertTree(TreeNode root) {',
    '        if (root == null) return null;',
    '        // 1. 交换当前节点的左右子节点',
    '        TreeNode temp = root.left;',
    '        root.left = root.right;',
    '        root.right = temp;',
    '        // 2. 递归翻转左右子树',
    '        invertTree(root.left);',
    '        invertTree(root.right);',
    '        return root;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    TreeNode* invertTree(TreeNode* root) {',
    '        if (!root) return nullptr;',
    '        swap(root->left, root->right);',
    '        invertTree(root->left);',
    '        invertTree(root->right);',
    '        return root;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:',
    '        if not root:',
    '            return None',
    '        root.left, root.right = root.right, root.left',
    '        self.invertTree(root.left)',
    '        self.invertTree(root.right)',
    '        return root',
  ],
  javascript: [
    'var invertTree = function(root) {',
    '    if (!root) return null;',
    '    const temp = root.left;',
    '    root.left = root.right;',
    '    root.right = temp;',
    '    invertTree(root.left);',
    '    invertTree(root.right);',
    '    return root;',
    '};',
  ],
};
