/**
 * 二叉搜索树中的搜索与插入 (Search & Insert in a Binary Search Tree · LeetCode 700 & 701)
 * 领域知识与题解精讲配置声明
 */

export const BST_SEARCH_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 700 / 701</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy / Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">二叉搜索树中的搜索与动态插入 (Search & Insert in BST)</h2>
    </div>
    <p style="margin: 0;">给定二叉搜索树（BST）的根节点 <code style="color: #38bdf8; font-family: monospace;">root</code> 和一个整数值 <code style="color: #fde047; font-family: monospace;">val</code>。 你需要在 BST 中找到节点值等于 <code style="color: #fde047; font-family: monospace;">val</code> 的节点并返回其子树。 如果节点不存在，则返回 <code style="color: #f87171; font-family: monospace;">null</code> 或将其作为叶子节点依序插入树中保持 BST 性质。</p>
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
      <span>💡</span> BST 有序性与三大演化阶段
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① Stage 1: 迭代单向剪枝查找 (Iterative BST Search)</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>循环推进：</strong> 从 root 开始，若 <code style="color: #38bdf8; font-family: monospace;">cur.val == val</code> 直接返回当前节点；<br/>
        2. <strong>单向剪枝：</strong> 若 <code style="color: #fbbf24; font-family: monospace;">val < cur.val</code> 则 <code style="color: #38bdf8; font-family: monospace;">cur = cur.left</code>；反之 <code style="color: #38bdf8; font-family: monospace;">cur = cur.right</code>；<br/>
        3. <strong>零栈开销：</strong> 空间复杂度降至绝对极限 <code style="color: #34d399; font-family: monospace;">O(1)</code>，无函数调用栈开销。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② Stage 2: 递归分支剪枝查找 (Recursive Divide & Conquer)</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>基底条件：</strong> <code style="color: #f87171; font-family: monospace;">root == null || root.val == val</code> 返回 root；<br/>
        2. <strong>分治递归：</strong> 由 BST 特性，只下探目标所属的那一侧分支，避免全树扫描；<br/>
        3. <strong>递归栈深度：</strong> 空间复杂度 <code style="color: #60a5fa; font-family: monospace;">O(H)</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">③ Stage 3: 搜索未命中定点动态插入 (BST Search & Insert)</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>查找空位：</strong> 沿搜索路径下探，若遇到待下潜方向为 null 时，说明该处即为新节点的正确归宿；<br/>
        2. <strong>动态挂载：</strong> 在该空槽位直接新建并挂载新叶子节点，保持全树中序严格单调递增；<br/>
        3. <strong>读写闭环：</strong> 从单纯的“只读查找”演化为“动态维护”，实现 BST 基础数据结构的完整读写闭环。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">④ 复杂度对比</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：平均 <code style="color: #34d399; font-family: monospace;">O(log N)</code>，最坏倾斜链退化为 <code style="color: #f87171; font-family: monospace;">O(N)</code>。<br/>
        • 空间复杂度：Stage 1 为 <code style="color: #34d399; font-family: monospace;">O(1)</code>，Stage 2 为 <code style="color: #60a5fa; font-family: monospace;">O(H)</code>，Stage 3 为 <code style="color: #34d399; font-family: monospace;">O(1)</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const BST_SEARCH_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public TreeNode searchBST(TreeNode root, int val) {',
    '        TreeNode cur = root;',
    '        while (cur != null) {',
    '            if (cur.val == val) return cur;',
    '            if (val < cur.val) {',
    '                cur = cur.left;',
    '            } else {',
    '                cur = cur.right;',
    '            }',
    '        }',
    '        return null;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    TreeNode* searchBST(TreeNode* root, int val) {',
    '        TreeNode* cur = root;',
    '        while (cur) {',
    '            if (cur->val == val) return cur;',
    '            if (val < cur->val) cur = cur->left;',
    '            else cur = cur->right;',
    '        }',
    '        return nullptr;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:',
    '        cur = root',
    '        while cur:',
    '            if cur.val == val:',
    '                return cur',
    '            if val < cur.val:',
    '                cur = cur.left',
    '            else:',
    '                cur = cur.right',
    '        return None',
  ],
  javascript: [
    'var searchBST = function(root, val) {',
    '    let cur = root;',
    '    while (cur !== null) {',
    '        if (cur.val === val) return cur;',
    '        if (val < cur.val) {',
    '            cur = cur.left;',
    '        } else {',
    '            cur = cur.right;',
    '        }',
    '    }',
    '    return null;',
    '};',
  ],
};
