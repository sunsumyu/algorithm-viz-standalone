/**
 * 二叉树的最近公共祖先 (Lowest Common Ancestor of a Binary Tree · LeetCode 236 / Class 037 Code04)
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
      <span>💡</span> 三大经典演化阶段剖析
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① Stage 1: 后序自底向上递归汇聚 (Divide & Conquer)</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>终止条件：</strong> 若 <code style="color: #f87171; font-family: monospace;">root == null || root == p || root == q</code>，直接返回 <code style="color: #38bdf8; font-family: monospace;">root</code>；<br/>
        2. <strong>左右递归：</strong> 分别获取左右子树的返回值 left 和 right；<br/>
        3. <strong>分支归并：</strong><br/>
        &nbsp;&nbsp;• <strong>左右均非空：</strong> 说明 p 和 q 分布在 root 两侧，<strong>当前 root 就是 LCA</strong>；<br/>
        &nbsp;&nbsp;• <strong>单侧非空：</strong> 说明两目标均在同一子树，向上传递非空返回值；<br/>
        &nbsp;&nbsp;• <strong>左右皆空：</strong> 返回 null。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② Stage 2: 父节点哈希表与回溯祖先集合 (Parent Map & Visited Set)</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>建立父指针：</strong> 使用 BFS/队列从根遍历，建立 <code style="color: #34d399; font-family: monospace;">parentMap[child] = parent</code>，直到 p 与 q 均被记录；<br/>
        2. <strong>收集 p 祖先链：</strong> 从 p 沿父指针向上回溯直至根节点，将经过的所有节点加入 <code style="color: #60a5fa; font-family: monospace;">visited</code> 集合；<br/>
        3. <strong>查找首个交汇点：</strong> 从 q 沿父指针向上回溯，遇到的<strong>第一个出现在 visited 集合中的节点</strong>即为最近公共祖先。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ Stage 3: 根至目标显式双路径交汇比对 (Root-to-Node Path Trace)</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>提取直达路径：</strong> 运用 DFS 回溯分别提取从 root 到 p 与从 root 到 q 的节点序列（如 <code style="color: #38bdf8; font-family: monospace;">pathP</code> 与 <code style="color: #fde047; font-family: monospace;">pathQ</code>）；<br/>
        2. <strong>双指针同步扫描：</strong> 从索引 0 开始向后逐一比对两路径元素，两序列分叉前夕的最后一个相同节点即为 LCA。<br/>
        • 视觉表现极具几何直观性，展现树上分叉点定位的物理本质。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">④ 复杂度对比</div>
        <p style="margin: 0; color: #94a3b8;">
        • Stage 1 (后序递归): 时间 <code style="color: #34d399; font-family: monospace;">O(N)</code>，空间 <code style="color: #60a5fa; font-family: monospace;">O(H)</code>，代码极致精炼。<br/>
        • Stage 2 (父节点哈希): 时间 <code style="color: #34d399; font-family: monospace;">O(N)</code>，空间 <code style="color: #60a5fa; font-family: monospace;">O(N)</code>，模拟树上带父指针跳跃。<br/>
        • Stage 3 (路径比对): 时间 <code style="color: #34d399; font-family: monospace;">O(N)</code>，空间 <code style="color: #60a5fa; font-family: monospace;">O(H)</code>，直观呈现分叉点收敛过程。
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
