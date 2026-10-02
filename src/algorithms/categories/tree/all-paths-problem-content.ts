/**
 * LeetCode 257: 二叉树的所有路径 (Binary Tree Paths)
 * 名师精讲题解与核心考点解析 HTML
 */

export const ALL_PATHS_PROBLEM_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
  <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px; font-weight: 700;">LeetCode 257: 二叉树的所有路径 (Binary Tree Paths)</h2>
  <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 4px; margin-bottom: 14px;">
    <strong>难度与标签：</strong>
    <span style="display: inline-block; padding: 2px 8px; background: #dcfce7; color: #166534; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-right: 6px;">简单</span>
    <span style="display: inline-block; padding: 2px 8px; background: #e0f2fe; color: #075985; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-right: 6px;">二叉树</span>
    <span style="display: inline-block; padding: 2px 8px; background: #fef3c7; color: #92400e; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-right: 6px;">回溯算法</span>
    <span style="display: inline-block; padding: 2px 8px; background: #ede9fe; color: #5b21b6; border-radius: 9999px; font-size: 12px; font-weight: 600;">深度优先搜索 (DFS) / BFS</span>
  </div>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">题目描述</h3>
  <p>给你一个二叉树的根节点 <code>root</code>，按<strong>任意顺序</strong>，返回所有从根节点到叶子节点的路径。</p>
  <p><strong>叶子节点</strong>是指没有子节点的节点。</p>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">核心考点：路径构建与回溯本质</h3>
  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px;">
    <p style="margin: 0; color: #166534; font-size: 13px;">
      <strong>🎯 回溯与递归的孪生关系：</strong><br/>
      从根节点出发深入子树时，路径列表不断吸收沿途节点（<code>path.add(node.val)</code>）。当遇到叶子节点（<code>node.left == null && node.right == null</code>）时，将当前路径格式化并收入结果集。<br/>
      <strong>⚠️ 关键回溯点：</strong>当左右子树递归探索完毕准备返回父节点时，必须执行 <code>path.remove(path.size() - 1)</code> 弹出当前节点，恢复现场！如果不回溯，上一分支的节点将污染后续分支。
    </p>
  </div>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">示例说明</h3>
  <ul>
    <li><strong>示例 1：</strong><code>root = [1, 2, 3, null, 5]</code> ➔ 输出：<code>["1->2->5", "1->3"]</code>
      <br/>从根 1 出发到叶子 5 构成 <code>1->2->5</code>；到叶子 3 构成 <code>1->3</code>。
    </li>
    <li><strong>示例 2：</strong><code>root = [1]</code> ➔ 输出：<code>["1"]</code>（单节点自身即为根到叶子路径）。
    </li>
  </ul>
</div>
`;

export const ALL_PATHS_ANALYSIS_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
  <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px; font-weight: 700;">名师深度解构：二叉树所有路径的三大演化形态</h2>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">1. Stage 1: 经典显式回溯 DFS (Explicit Path Stack & Backtracking)</h3>
  <p>维护一个动态列表 <code>path</code> 作为共享状态。深入节点时 <code>push</code>，回退时 <code>pop</code>：</p>
  <pre style="background: #1e293b; color: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 12px; overflow-x: auto;">
path.add(node.val);
if (node.left == null && node.right == null) {
    paths.add(buildPathString(path)); // 叶子收获完整路径
}
if (node.left != null) dfs(node.left, path, paths);
if (node.right != null) dfs(node.right, path, paths);
path.remove(path.size() - 1); // 撤销选择，恢复现场
  </pre>
  <p>这是回溯法最纯粹的标准模板，空间效率高（共享单条路径栈），时间复杂度 $O(N)$，空间复杂度 $O(H)$。</p>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">2. Stage 2: 纯函数式递归 (Immutable String Passing)</h3>
  <p>利用不可变字符串（如 Java 的 <code>String</code> 或 Python 的 <code>str</code>）作为递归参数传递。每次递归调用时拼接 <code>path + "->" + child.val</code>，由函数调用栈自动维护状态复制，完全免除显式 <code>remove</code> 回溯操作。</p>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">3. Stage 3: BFS 双队列层序遍历 (Double Queue Synchronization)</h3>
  <p>使用两个并行队列：</p>
  <ul>
    <li><code>nodeQueue</code>：记录当前待访问的二叉树节点；</li>
    <li><code>pathQueue</code>：记录从根节点到达该节点的路径字符串。</li>
  </ul>
  <p>每次同步出队一对 <code>(node, path)</code>，若为叶子则收获路径；否则将左右非空子节点连同新前缀字符串推入对应队列。完全杜绝递归深度溢出风险！</p>
</div>
`;
