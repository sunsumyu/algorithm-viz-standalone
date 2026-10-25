/**
 * 路径总和 (Path Sum · LeetCode 112)
 * 领域知识与题解精讲配置声明
 */

export const PATH_SUM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 112</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">路径总和 (Path Sum)</h2>
    </div>
    <p style="margin: 0;">给你二叉树的根节点 <code style="color: #38bdf8; font-family: monospace;">root</code> 和一个表示目标和的整数 <code style="color: #fde047; font-family: monospace;">targetSum</code> 。判断该树中是否存在 <strong>根节点到叶子节点</strong> 的路径，这条路径上所有节点值相加等于目标和 <code style="color: #fde047; font-family: monospace;">targetSum</code> 。如果存在，返回 <code style="color: #34d399; font-family: monospace;">true</code> ；否则，返回 <code style="color: #f87171; font-family: monospace;">false</code> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: root = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], targetSum = 22</div>
      <div>输出: true (路径 5 -> 4 -> 11 -> 2 的和为 22)</div>
    </div>
  </div>
`;

export const PATH_SUM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 《代码随想录》核心教学脉络与认知进阶
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 递归函数究竟什么时候需要返回值？</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>搜索整棵二叉树且不用处理返回值：</strong> 递归函数不需要返回值（如 <strong>113. 路径总和 II</strong>，必须穷尽整棵树并收集所有满足条件的路径）；<br/>
        • <strong>搜索整棵二叉树且需要处理返回值：</strong> 递归函数需要返回值（如 <strong>236. 二叉树的最近公共祖先</strong>）；<br/>
        • <strong>搜索其中一条符合条件的路径：</strong> 递归函数<strong>一定需要返回值</strong>，因为一旦找到符合条件的路径就要立刻 <code style="color: #34d399; font-family: monospace;">return true</code> 截断搜索（本题 <strong>112. 路径总和</strong>）。
        </p>
      </div>

      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #38bdf8; margin-bottom: 4px;">② 从最基础的显式回溯到精简代码</div>
        <p style="margin: 0; color: #94a3b8;">
        很多题解直接给出单函数 3 行精简代码，初学者根本看不出回溯过程！《代码随想录》先从<strong>最基础的显式回溯</strong>讲起：<br/>
        1. <strong>定义辅助函数：</strong> <code style="color: #fbbf24; font-family: monospace;">traversal(cur, count)</code>，初始传入 <code style="color: #fbbf24; font-family: monospace;">count = targetSum - root.val</code>；<br/>
        2. <strong>叶子节点终止条件：</strong><br/>
        &nbsp;&nbsp;• <code style="color: #34d399; font-family: monospace;">if (!cur.left && !cur.right && count == 0) return true;</code>（找到目标路径）<br/>
        &nbsp;&nbsp;• <code style="color: #f87171; font-family: monospace;">if (!cur.left && !cur.right) return false;</code>（叶子但未达成目标）<br/>
        3. <strong>对称回溯展开：</strong><br/>
        &nbsp;&nbsp;• <code style="color: #fbbf24; font-family: monospace;">count -= cur.left.val;</code> ➔ 递归深入处理<br/>
        &nbsp;&nbsp;• <code style="color: #fbbf24; font-family: monospace;">if (traversal(cur.left, count)) return true;</code> ➔ 命中立即向上返回<br/>
        &nbsp;&nbsp;• <code style="color: #fbbf24; font-family: monospace;">count += cur.left.val;</code> ➔ <strong>回溯恢复现场</strong>，撤销当前选择，避免污染右子树！
        </p>
      </div>

      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">③ 阶段演化四级台阶</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>阶段 1 (最基础)：</strong> 代码随想录·辅助函数与显式回溯（展开 <code style="color: #fbbf24; font-family: monospace;">count -= val</code> 与 <code style="color: #fbbf24; font-family: monospace;">count += val</code>，理解回溯本质）；<br/>
        • <strong>阶段 2 (进阶精简)：</strong> 参数隐藏回溯与单函数递归（将差额计算作为参数直接压栈传递）；<br/>
        • <strong>阶段 3 (全解收集)：</strong> 113. 路径总和 II（全局收集全解，共享路径栈显式 <code style="color: #fbbf24; font-family: monospace;">path.pop()</code> 恢复现场）；<br/>
        • <strong>阶段 4 (迭代演化)：</strong> 迭代法 BFS 双队列管道（节点队列与求和队列同步出入队，杜绝递归栈溢出）。
        </p>
      </div>
    </div>
  </div>
`;

export const PATH_SUM_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public boolean hasPathSum(TreeNode root, int targetSum) {',
    '        if (root == null) return false;',
    '        // 如果是叶子节点且剩余和恰好等于当前节点值',
    '        if (root.left == null && root.right == null) {',
    '            return root.val == targetSum;',
    '        }',
    '        // 递归检查左右子树',
    '        return hasPathSum(root.left, targetSum - root.val)',
    '            || hasPathSum(root.right, targetSum - root.val);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool hasPathSum(TreeNode* root, int targetSum) {',
    '        if (!root) return false;',
    '        if (!root->left && !root->right) {',
    '            return root->val == targetSum;',
    '        }',
    '        return hasPathSum(root->left, targetSum - root->val)',
    '            || hasPathSum(root->right, targetSum - root->val);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:',
    '        if not root:',
    '            return False',
    '        if not root.left and not root.right:',
    '            return root.val == targetSum',
    '        left = self.hasPathSum(root.left, targetSum - root.val)',
    '        right = self.hasPathSum(root.right, targetSum - root.val)',
    '        return left or right',
  ],
  javascript: [
    'var hasPathSum = function(root, targetSum) {',
    '    if (!root) return false;',
    '    if (!root.left && !root.right) {',
    '        return root.val === targetSum;',
    '    }',
    '    const left = hasPathSum(root.left, targetSum - root.val);',
    '    const right = hasPathSum(root.right, targetSum - root.val);',
    '    return left || right;',
    '};',
  ],
};
