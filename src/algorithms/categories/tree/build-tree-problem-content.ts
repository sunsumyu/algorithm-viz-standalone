/**
 * 从前序与中序遍历序列构造二叉树 (Construct Binary Tree from Preorder and Inorder Traversal · LeetCode 105)
 * 领域知识与题解精讲配置声明
 */

export const BUILD_TREE_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 105</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">从前序与中序遍历序列构造二叉树</h2>
    </div>
    <p style="margin: 0;">给定两个整数数组 <code style="color: #38bdf8; font-family: monospace;">preorder</code> 和 <code style="color: #fde047; font-family: monospace;">inorder</code> ，其中 <code style="color: #38bdf8; font-family: monospace;">preorder</code> 是二叉树的先序遍历， <code style="color: #fde047; font-family: monospace;">inorder</code> 是同一棵树的中序遍历，请构造二叉树并返回其根节点。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]</div>
      <div>输出: [3, 9, 20, null, null, 15, 7]</div>
    </div>
  </div>
`;

export const BUILD_TREE_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 前序定根、中序切分子树区间
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 递归构造六步法</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>终止条件：</strong> 若前序或中序区间为空，返回 <code style="color: #f87171; font-family: monospace;">null</code>；<br/>
        2. <strong>前序首元素为根：</strong> <code style="color: #38bdf8; font-family: monospace;">rootVal = preorder[preStart]</code>；<br/>
        3. <strong>在中序中定位根位置：</strong> 找到 <code style="color: #fde047; font-family: monospace;">inRoot</code> 下标，将中序切分为左子树 <code style="color: #60a5fa; font-family: monospace;">[inStart..inRoot-1]</code> 和右子树 <code style="color: #a855f7; font-family: monospace;">[inRoot+1..inEnd]</code>；<br/>
        4. <strong>计算左子树长度：</strong> <code style="color: #fbbf24; font-family: monospace;">leftLen = inRoot - inStart</code>；<br/>
        5. <strong>切分前序区间：</strong> 左子树对应 <code style="color: #60a5fa; font-family: monospace;">[preStart+1 .. preStart+leftLen]</code>，右子树对应 <code style="color: #a855f7; font-family: monospace;">[preStart+leftLen+1 .. preEnd]</code>；<br/>
        6. <strong>递归组装左右孩子：</strong> <code style="color: #34d399; font-family: monospace;">root.left = build(...); root.right = build(...);</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：使用哈希表预存中序索引后为严格线性 <code style="color: #34d399; font-family: monospace;">O(n)</code>。<br/>
        • 空间复杂度：哈希表与递归栈占用 <code style="color: #60a5fa; font-family: monospace;">O(n)</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const BUILD_TREE_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    private Map<Integer, Integer> inMap = new HashMap<>();',
    '    public TreeNode buildTree(int[] preorder, int[] inorder) {',
    '        for (int i = 0; i < inorder.length; i++) inMap.put(inorder[i], i);',
    '        return build(preorder, 0, preorder.length - 1, 0, inorder.length - 1);',
    '    }',
    '    private TreeNode build(int[] pre, int pL, int pR, int iL, int iR) {',
    '        if (pL > pR || iL > iR) return null;',
    '        int rootVal = pre[pL];',
    '        TreeNode root = new TreeNode(rootVal);',
    '        int inRoot = inMap.get(rootVal);',
    '        int leftLen = inRoot - iL;',
    '        root.left = build(pre, pL + 1, pL + leftLen, iL, inRoot - 1);',
    '        root.right = build(pre, pL + leftLen + 1, pR, inRoot + 1, iR);',
    '        return root;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    '    unordered_map<int, int> inMap;',
    'public:',
    '    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {',
    '        for (int i = 0; i < inorder.size(); i++) inMap[inorder[i]] = i;',
    '        return build(preorder, 0, preorder.size() - 1, 0, inorder.size() - 1);',
    '    }',
    '    TreeNode* build(vector<int>& pre, int pL, int pR, int iL, int iR) {',
    '        if (pL > pR || iL > iR) return nullptr;',
    '        int rootVal = pre[pL];',
    '        TreeNode* root = new TreeNode(rootVal);',
    '        int inRoot = inMap[rootVal];',
    '        int leftLen = inRoot - iL;',
    '        root->left = build(pre, pL + 1, pL + leftLen, iL, inRoot - 1);',
    '        root->right = build(pre, pL + leftLen + 1, pR, inRoot + 1, iR);',
    '        return root;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def buildTree(self, preorder: list[int], inorder: list[int]) -> Optional[TreeNode]:',
    '        in_map = {val: idx for idx, val in enumerate(inorder)}',
    '        def build(pL, pR, iL, iR):',
    '            if pL > pR or iL > iR: return None',
    '            root_val = preorder[pL]',
    '            root = TreeNode(root_val)',
    '            in_root = in_map[root_val]',
    '            left_len = in_root - iL',
    '            root.left = build(pL + 1, pL + left_len, iL, in_root - 1)',
    '            root.right = build(pL + left_len + 1, pR, in_root + 1, iR)',
    '            return root',
    '        return build(0, len(preorder) - 1, 0, len(inorder) - 1)',
  ],
  javascript: [
    'var buildTree = function(preorder, inorder) {',
    '    const inMap = new Map();',
    '    inorder.forEach((val, idx) => inMap.set(val, idx));',
    '    const build = (pL, pR, iL, iR) => {',
    '        if (pL > pR || iL > iR) return null;',
    '        const rootVal = preorder[pL];',
    '        const root = new TreeNode(rootVal);',
    '        const inRoot = inMap.get(rootVal);',
    '        const leftLen = inRoot - iL;',
    '        root.left = build(pL + 1, pL + leftLen, iL, inRoot - 1);',
    '        root.right = build(pL + leftLen + 1, pR, inRoot + 1, iR);',
    '        return root;',
    '    };',
    '    return build(0, preorder.length - 1, 0, inorder.length - 1);',
    '};',
  ],
};
