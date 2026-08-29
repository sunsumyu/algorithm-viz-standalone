/**
 * 对称二叉树 (Symmetric Tree · LeetCode 101)
 * 领域知识与题解精讲配置声明
 */

export const TREE_SYMMETRIC_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 101</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">对称二叉树 (Symmetric Tree)</h2>
    </div>
    <p style="margin: 0;">给你一个二叉树的根节点 <code style="color: #38bdf8; font-family: monospace;">root</code> ，检查它是否轴对称。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: root = [1, 2, 2, 3, 4, 4, 3]</div>
      <div>输出: true (左右子树完全镜像对称)</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: root = [1, 2, 2, null, 3, null, 3]</div>
      <div>输出: false</div>
    </div>
  </div>
`;

export const TREE_SYMMETRIC_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 双指针镜像递归对比（内外侧同时比对）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 镜像递归终止条件</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 左右两节点均为空：<code style="color: #34d399; font-family: monospace;">left == null && right == null</code> &rarr; 返回 <code style="color: #34d399; font-family: monospace;">true</code>；<br/>
        2. 左右其一为空另一不为空：<code style="color: #f87171; font-family: monospace;">left == null || right == null</code> &rarr; 返回 <code style="color: #f87171; font-family: monospace;">false</code>；<br/>
        3. 左右节点值不相等：<code style="color: #f87171; font-family: monospace;">left.val != right.val</code> &rarr; 返回 <code style="color: #f87171; font-family: monospace;">false</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">② 内外侧同时递归</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>外侧对比：</strong> <code style="color: #60a5fa; font-family: monospace;">check(left.left, right.right)</code>；<br/>
        • <strong>内侧对比：</strong> <code style="color: #a855f7; font-family: monospace;">check(left.right, right.left)</code>；<br/>
        • 最终结果为外侧与内侧的逻辑与：<code style="color: #34d399; font-family: monospace;">outside && inside</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const TREE_SYMMETRIC_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public boolean isSymmetric(TreeNode root) {',
    '        if (root == null) return true;',
    '        return check(root.left, root.right);',
    '    }',
    '    private boolean check(TreeNode left, TreeNode right) {',
    '        if (left == null && right == null) return true;',
    '        if (left == null || right == null) return false;',
    '        if (left.val != right.val) return false;',
    '        // 比较外侧节点 与 内侧节点',
    '        boolean outside = check(left.left, right.right);',
    '        boolean inside = check(left.right, right.left);',
    '        return outside && inside;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool isSymmetric(TreeNode* root) {',
    '        if (!root) return true;',
    '        return check(root->left, root->right);',
    '    }',
    '    bool check(TreeNode* left, TreeNode* right) {',
    '        if (!left && !right) return true;',
    '        if (!left || !right) return false;',
    '        if (left->val != right->val) return false;',
    '        return check(left->left, right->right) && check(left->right, right->left);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def isSymmetric(self, root: Optional[TreeNode]) -> bool:',
    '        if not root: return True',
    '        def check(left: Optional[TreeNode], right: Optional[TreeNode]) -> bool:',
    '            if not left and not right: return True',
    '            if not left or not right: return False',
    '            if left.val != right.val: return False',
    '            return check(left.left, right.right) and check(left.right, right.left)',
    '        return check(root.left, root.right)',
  ],
  javascript: [
    'var isSymmetric = function(root) {',
    '    if (!root) return true;',
    '    const check = (left, right) => {',
    '        if (!left && !right) return true;',
    '        if (!left || !right) return false;',
    '        if (left.val !== right.val) return false;',
    '        return check(left.left, right.right) && check(left.right, right.left);',
    '    };',
    '    return check(root.left, root.right);',
    '};',
  ],
};
