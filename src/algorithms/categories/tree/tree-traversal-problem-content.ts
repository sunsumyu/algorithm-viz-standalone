/**
 * 二叉树的前序、中序、后序遍历 (LeetCode 144 / 94 / 145)
 * 领域知识与题解精讲配置声明
 */

export const TREE_TRAVERSAL_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LC 144/94/145</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">二叉树的前序、中序与后序遍历</h2>
    </div>
    <p style="margin: 0;">二叉树深度优先遍历（DFS）根据访问<strong>根节点</strong>的时机分为三种经典方式：</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div>• <span style="color: #60a5fa; font-weight: 700;">前序遍历 (Preorder):</span> <strong>根</strong> &rarr; 左 &rarr; 右 (LeetCode 144)</div>
      <div>• <span style="color: #fbbf24; font-weight: 700;">中序遍历 (Inorder):</span> 左 &rarr; <strong>根</strong> &rarr; 右 (LeetCode 94)</div>
      <div>• <span style="color: #34d399; font-weight: 700;">后序遍历 (Postorder):</span> 左 &rarr; 右 &rarr; <strong>根</strong> (LeetCode 145)</div>
    </div>
  </div>
`;

export const TREE_TRAVERSAL_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 递归三要素与遍历本质
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 递归三要素</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>递归参数与返回值：</strong> 传入当前节点 <code style="color: #38bdf8; font-family: monospace;">TreeNode root</code> 与结果列表 <code style="color: #38bdf8; font-family: monospace;">res</code>，无返回值；<br/>
        2. <strong>终止条件：</strong> 当遇到空节点时直接返回：<code style="color: #f87171; font-family: monospace;">if (root == null) return;</code>；<br/>
        3. <strong>单层递归逻辑：</strong> 调整访问根节点 <code style="color: #fde047; font-family: monospace;">res.add(root.val)</code> 发生在遍历左、右子树之前、之中或之后。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(n)</code>，其中 n 为二叉树的节点总数，每个节点恰好被访问常数次。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(h)</code>，其中 h 为树的高度（平均 <code style="color: #60a5fa; font-family: monospace;">O(log n)</code>，最坏链状 <code style="color: #f87171; font-family: monospace;">O(n)</code>），由递归系统调用栈占用。
        </p>
      </div>
    </div>
  </div>
`;

export const TREE_TRAVERSAL_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    // 前序遍历: 根 -> 左 -> 右',
    '    public void preorder(TreeNode root, List<Integer> res) {',
    '        if (root == null) return;',
    '        res.add(root.val);',
    '        preorder(root.left, res);',
    '        preorder(root.right, res);',
    '    }',
    '    // 中序遍历: 左 -> 根 -> 右',
    '    public void inorder(TreeNode root, List<Integer> res) {',
    '        if (root == null) return;',
    '        inorder(root.left, res);',
    '        res.add(root.val);',
    '        inorder(root.right, res);',
    '    }',
    '    // 后序遍历: 左 -> 右 -> 根',
    '    public void postorder(TreeNode root, List<Integer> res) {',
    '        if (root == null) return;',
    '        postorder(root.left, res);',
    '        postorder(root.right, res);',
    '        res.add(root.val);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    void preorder(TreeNode* root, vector<int>& res) {',
    '        if (!root) return;',
    '        res.push_back(root->val);',
    '        preorder(root->left, res);',
    '        preorder(root->right, res);',
    '    }',
    '    void inorder(TreeNode* root, vector<int>& res) {',
    '        if (!root) return;',
    '        inorder(root->left, res);',
    '        res.push_back(root->val);',
    '        inorder(root->right, res);',
    '    }',
    '    void postorder(TreeNode* root, vector<int>& res) {',
    '        if (!root) return;',
    '        postorder(root->left, res);',
    '        postorder(root->right, res);',
    '        res.push_back(root->val);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def preorder(self, root: Optional[TreeNode], res: list[int]) -> None:',
    '        if not root: return',
    '        res.append(root.val)',
    '        self.preorder(root.left, res)',
    '        self.preorder(root.right, res)',
    '',
    '    def inorder(self, root: Optional[TreeNode], res: list[int]) -> None:',
    '        if not root: return',
    '        self.inorder(root.left, res)',
    '        res.append(root.val)',
    '        self.inorder(root.right, res)',
    '',
    '    def postorder(self, root: Optional[TreeNode], res: list[int]) -> None:',
    '        if not root: return',
    '        self.postorder(root.left, res)',
    '        self.postorder(root.right, res)',
    '        res.append(root.val)',
  ],
  javascript: [
    'function preorder(root, res = []) {',
    '    if (!root) return res;',
    '    res.push(root.val);',
    '    preorder(root.left, res);',
    '    preorder(root.right, res);',
    '    return res;',
    '}',
    'function inorder(root, res = []) {',
    '    if (!root) return res;',
    '    inorder(root.left, res);',
    '    res.push(root.val);',
    '    inorder(root.right, res);',
    '    return res;',
    '}',
    'function postorder(root, res = []) {',
    '    if (!root) return res;',
    '    postorder(root.left, res);',
    '    postorder(root.right, res);',
    '    res.push(root.val);',
    '    return res;',
    '}',
  ],
};
