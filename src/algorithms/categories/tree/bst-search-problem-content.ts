/**
 * 二叉搜索树中的搜索 (Search in a Binary Search Tree · LeetCode 700)
 * 领域知识与题解精讲配置声明
 */

export const BST_SEARCH_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 700</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">二叉搜索树中的搜索 (Search in BST)</h2>
    </div>
    <p style="margin: 0;">给定二叉搜索树（BST）的根节点 <code style="color: #38bdf8; font-family: monospace;">root</code> 和一个整数值 <code style="color: #fde047; font-family: monospace;">val</code>。 你需要在 BST 中找到节点值等于 <code style="color: #fde047; font-family: monospace;">val</code> 的节点。 返回以该节点为根的子树。 如果节点不存在，则返回 <code style="color: #f87171; font-family: monospace;">null</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: root = [4, 2, 7, 1, 3], val = 2</div>
      <div>输出: [2, 1, 3] (返回以 2 为根的子树)</div>
    </div>
  </div>
`;

export const BST_SEARCH_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> BST 有序性与方向单向剪枝
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 搜索判断逻辑</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>终止条件：</strong> 若 <code style="color: #38bdf8; font-family: monospace;">root == null || root.val == val</code>，直接返回 <code style="color: #38bdf8; font-family: monospace;">root</code>；<br/>
        2. <strong>单向剪枝跳转：</strong><br/>
        &nbsp;&nbsp;• 若 <code style="color: #fbbf24; font-family: monospace;">val < root.val</code>：由 BST 性质知目标必定只可能在左子树，递归 <code style="color: #fbbf24; font-family: monospace;">searchBST(root.left, val)</code>；<br/>
        &nbsp;&nbsp;• 若 <code style="color: #fbbf24; font-family: monospace;">val > root.val</code>：目标只可能在右子树，递归 <code style="color: #fbbf24; font-family: monospace;">searchBST(root.right, val)</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与优势</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：平均 <code style="color: #34d399; font-family: monospace;">O(log n)</code>，最坏退化为链表时 <code style="color: #f87171; font-family: monospace;">O(n)</code>。<br/>
        • 空间复杂度：递归栈 <code style="color: #60a5fa; font-family: monospace;">O(h)</code>（迭代写法可降至 <code style="color: #34d399; font-family: monospace;">O(1)</code>）。
        </p>
      </div>
    </div>
  </div>
`;

export const BST_SEARCH_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public TreeNode searchBST(TreeNode root, int val) {',
    '        if (root == null || root.val == val) return root;',
    '        if (val < root.val) {',
    '            return searchBST(root.left, val);',
    '        } else {',
    '            return searchBST(root.right, val);',
    '        }',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    TreeNode* searchBST(TreeNode* root, int val) {',
    '        if (!root || root->val == val) return root;',
    '        if (val < root->val) return searchBST(root->left, val);',
    '        return searchBST(root->right, val);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:',
    '        if not root or root.val == val:',
    '            return root',
    '        if val < root.val:',
    '            return self.searchBST(root.left, val)',
    '        return self.searchBST(root.right, val)',
  ],
  javascript: [
    'var searchBST = function(root, val) {',
    '    if (!root || root.val === val) return root;',
    '    if (val < root.val) return searchBST(root.left, val);',
    '    return searchBST(root.right, val);',
    '};',
  ],
};
