/**
 * LeetCode 404: 左叶子之和 (Sum of Left Leaves)
 * 名师精讲题解与核心考点解析 HTML
 */

export const LEFT_LEAVES_PROBLEM_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
  <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px; font-weight: 700;">LeetCode 404: 左叶子之和 (Sum of Left Leaves)</h2>
  <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 4px; margin-bottom: 14px;">
    <strong>难度与标签：</strong>
    <span style="display: inline-block; padding: 2px 8px; background: #dcfce7; color: #166534; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-right: 6px;">简单</span>
    <span style="display: inline-block; padding: 2px 8px; background: #e0f2fe; color: #075985; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-right: 6px;">二叉树</span>
    <span style="display: inline-block; padding: 2px 8px; background: #fef3c7; color: #92400e; border-radius: 9999px; font-size: 12px; font-weight: 600;">深度优先搜索 (DFS) / BFS</span>
  </div>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">题目描述</h3>
  <p>给定二叉树的根节点 <code>root</code>，返回所有<strong>左叶子</strong>的值之和。</p>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">核心概念：什么是左叶子？</h3>
  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px;">
    <p style="margin: 0; color: #166534; font-size: 13px;">
      <strong>⚠️ 避坑铁律：</strong>判断一个节点是否为「左叶子」，<strong>不能仅凭该节点自身判断！必须由其父节点向下探查确定！</strong><br/>
      满足左叶子的充要条件：
      <br/>1. 它是其父节点的<strong>左孩子</strong>（<code>parent.left == node</code>）；
      <br/>2. 它自身是<strong>叶子节点</strong>（<code>node.left == null && node.right == null</code>）。
      <br/>特别提示：如果整棵树仅有一个根节点 <code>root = [1]</code>，它虽是叶子，但它<strong>不是任何节点的左孩子</strong>，因此左叶子之和为 <code>0</code>！
    </p>
  </div>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">示例说明</h3>
  <ul>
    <li><strong>示例 1：</strong><code>root = [3, 9, 20, null, null, 15, 7]</code>
      <br/>节点 9 是根节点 3 的左孩子，且左右皆空（是叶子），贡献 9；节点 15 是 20 的左孩子且是叶子，贡献 15；节点 7 是 20 的右孩子，不是左叶子。左叶子之和为 <code>9 + 15 = 24</code>。
    </li>
    <li><strong>示例 2：</strong><code>root = [1]</code> ➔ 输出：<code>0</code>。
    </li>
  </ul>
</div>
`;

export const LEFT_LEAVES_ANALYSIS_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
  <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px; font-weight: 700;">名师深度解构：左叶子之和的三大演化形态</h2>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">1. Stage 1: 后序分治递归（父节点前瞻探查）</h3>
  <p>在递归后序分治中，遍历到节点 <code>node</code> 时，主动审视其左孩子 <code>node.left</code>：</p>
  <pre style="background: #1e293b; color: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 12px; overflow-x: auto;">
if (node.left != null && node.left.left == null && node.left.right == null) {
    leftSum = node.left.val; // 命中左叶子！直接取值
} else {
    leftSum = sumOfLeftLeaves(node.left); // 非叶子则继续下探
}
int rightSum = sumOfLeftLeaves(node.right);
return leftSum + rightSum;
  </pre>
  <p>通过父节点预先识别左叶子，逻辑最精炼直观，时间复杂度 $O(N)$，空间复杂度 $O(H)$。</p>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">2. Stage 2: BFS 层序队列广搜</h3>
  <p>借助标准先进先出队列 <code>Queue&lt;TreeNode&gt;</code>。每出队一个节点 <code>cur</code>：</p>
  <ul>
    <li>若 <code>cur.left</code> 为叶子，直接累加 <code>cur.left.val</code>，无需将该叶子推入队列；</li>
    <li>若 <code>cur.left</code> 还有子节点，将 <code>cur.left</code> 入队；</li>
    <li>若 <code>cur.right</code> 存在，将 <code>cur.right</code> 入队。</li>
  </ul>
  <p>BFS 从上到下逐层扫描，完全规避了系统栈深度越界的风险。</p>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">3. Stage 3: 显式迭代栈遍历（零系统栈开销）</h3>
  <p>在工程面试与性能严苛场景中，通过显式堆内存栈 <code>Deque&lt;TreeNode&gt;</code> 模拟 DFS 前序遍历，在遇到左孩子满足叶子特征时直接累加，实现完全等价的无递归实现。</p>
</div>
`;
