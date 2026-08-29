/**
 * 验证二叉搜索树 (Validate Binary Search Tree · LeetCode 98)
 * 领域知识与题解精讲配置声明
 */

export const VALID_BST_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 98</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">验证二叉搜索树 (Validate BST)</h2>
    </div>
    <p style="margin: 0;">给你一个二叉树的根节点 <code style="color: #38bdf8; font-family: monospace;">root</code> ，判断其是否是一个有效的二叉搜索树。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">有效 BST 定义:</div>
      <div>1. 节点的左子树只包含 <strong>小于</strong> 当前节点的数。</div>
      <div>2. 节点的右子树只包含 <strong>大于</strong> 当前节点的数。</div>
      <div>3. 所有左子树和右子树自身必须也是二叉搜索树。</div>
    </div>
  </div>
`;

export const VALID_BST_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 中序遍历严格递增法 vs 上下界约束区间法
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 中序遍历单调性</div>
        <p style="margin: 0; color: #94a3b8;">
        二叉搜索树的核心性质是：<strong>中序遍历序列严格单调递增</strong>。<br/>
        我们只需维护一个全局前驱节点指针 <code style="color: #38bdf8; font-family: monospace;">prev</code>：<br/>
        • 遍历左子树；<br/>
        • 检查当前节点值：若 <code style="color: #f87171; font-family: monospace;">prev != null && root.val <= prev.val</code>，则立刻判定为非法 BST 返回 <code style="color: #f87171; font-family: monospace;">false</code>；<br/>
        • 更新 <code style="color: #fde047; font-family: monospace;">prev = root</code>，并继续遍历右子树。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 易错陷阱</div>
        <p style="margin: 0; color: #94a3b8;">
        <strong>陷阱：</strong> 不能仅比较 <code style="color: #fbbf24; font-family: monospace;">root.val > root.left.val</code>，必须保证左子树的<strong>所有</strong>节点均小于当前根，右子树的所有节点均大于当前根。中序遍历完美覆盖了此全局约束。
        </p>
      </div>
    </div>
  </div>
`;

export const VALID_BST_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    private TreeNode prev = null;',
    '    public boolean isValidBST(TreeNode root) {',
    '        if (root == null) return true;',
    '        // 1. 递归验证左子树',
    '        if (!isValidBST(root.left)) return false;',
    '        // 2. 检查中序严格单调递增',
    '        if (prev != null && root.val <= prev.val) {',
    '            return false;',
    '        }',
    '        prev = root;',
    '        // 3. 递归验证右子树',
    '        return isValidBST(root.right);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    '    TreeNode* prev = nullptr;',
    'public:',
    '    bool isValidBST(TreeNode* root) {',
    '        if (!root) return true;',
    '        if (!isValidBST(root->left)) return false;',
    '        if (prev && root->val <= prev->val) return false;',
    '        prev = root;',
    '        return isValidBST(root->right);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def __init__(self):',
    '        self.prev = None',
    '',
    '    def isValidBST(self, root: Optional[TreeNode]) -> bool:',
    '        if not root:',
    '            return True',
    '        if not self.isValidBST(root.left):',
    '            return False',
    '        if self.prev is not None and root.val <= self.prev.val:',
    '            return False',
    '        self.prev = root',
    '        return self.isValidBST(root.right)',
  ],
  javascript: [
    'var isValidBST = function(root) {',
    '    let prev = null;',
    '    const inorder = (node) => {',
    '        if (!node) return true;',
    '        if (!inorder(node.left)) return false;',
    '        if (prev !== null && node.val <= prev.val) return false;',
    '        prev = node;',
    '        return inorder(node.right);',
    '    };',
    '    return inorder(root);',
    '};',
  ],
};
