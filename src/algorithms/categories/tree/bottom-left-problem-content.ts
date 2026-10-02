/**
 * LeetCode 513: 找树左下角的值 (Find Bottom Left Tree Value)
 * 名师精讲题解与核心考点解析 HTML
 */

export const BOTTOM_LEFT_PROBLEM_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
  <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px; font-weight: 700;">LeetCode 513: 找树左下角的值 (Find Bottom Left Tree Value)</h2>
  <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 4px; margin-bottom: 14px;">
    <strong>难度与标签：</strong>
    <span style="display: inline-block; padding: 2px 8px; background: #fef3c7; color: #92400e; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-right: 6px;">中等</span>
    <span style="display: inline-block; padding: 2px 8px; background: #e0f2fe; color: #075985; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-right: 6px;">二叉树</span>
    <span style="display: inline-block; padding: 2px 8px; background: #ede9fe; color: #5b21b6; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-right: 6px;">深度优先搜索 (DFS)</span>
    <span style="display: inline-block; padding: 2px 8px; background: #dcfce7; color: #166534; border-radius: 9999px; font-size: 12px; font-weight: 600;">广度优先搜索 (BFS)</span>
  </div>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">题目描述</h3>
  <p>给定一个二叉树的根节点 <code>root</code>，请找出该二叉树的<strong>最底层 最左边</strong>节点的值。</p>
  <p>假设二叉树中至少有一个节点。</p>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">核心概念：什么是“树左下角的值”？</h3>
  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px;">
    <p style="margin: 0; color: #166534; font-size: 13px;">
      <strong>⚠️ 避坑铁律：左下角节点不一定是左孩子！</strong><br/>
      定义中的“左下角”包含两层刚性约束：<br/>
      1. <strong>最底层</strong>：在整棵树所有节点中具有<strong>最大的深度（Max Depth）</strong>；<br/>
      2. <strong>最左边</strong>：在该最大深度对应的同一层中，<strong>几何位置最靠左</strong>的节点。<br/>
      即使该节点是其父节点的右孩子（例如其左兄弟为空），只要它在最底层且位于该层最左侧，它就是答案！
    </p>
  </div>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">示例说明</h3>
  <ul>
    <li><strong>示例 1：</strong><code>root = [2, 1, 3]</code> ➔ 输出：<code>1</code>
      <br/>第 0 层节点 2，第 1 层节点 1 和 3。最底层为第 1 层，最左侧节点为 1。
    </li>
    <li><strong>示例 2：</strong><code>root = [1, 2, 3, 4, null, 5, 6, null, null, 7]</code> ➔ 输出：<code>7</code>
      <br/>最底层深度为 3，且该层仅有节点 7（7 是节点 5 的左孩子）。故输出 7。
    </li>
  </ul>
</div>
`;

export const BOTTOM_LEFT_ANALYSIS_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
  <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px; font-weight: 700;">名师深度解构：找树左下角值的演化跃迁</h2>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">1. Stage 1: 先序递归 DFS（最深层先登者锁定）</h3>
  <p>先序遍历遵循<strong>根 ➔ 左 ➔ 右</strong>。由于左子树总是优先于右子树被访问，因此在遍历同一深度的所有节点时，<strong>第一个被触达的叶子必然是该层最左侧的节点</strong>！</p>
  <pre style="background: #1e293b; color: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 12px; overflow-x: auto;">
if (node.left == null && node.right == null) {
    if (depth > maxDepth) { // 首次攻入更深的一层！
        maxDepth = depth;
        bottomLeft = node.val; // 锁定该层最左侧先登者
    }
}
  </pre>
  <p>利用严格大于 <code>depth > maxDepth</code>，同层后续节点自然被屏蔽，时间复杂度 $O(N)$，空间复杂度 $O(H)$。</p>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">2. Stage 2: 标准层序 BFS 队列（层首节点捕获）</h3>
  <p>使用先进先出队列 <code>Queue&lt;TreeNode&gt;</code>，按层分批处理（<code>size = queue.size()</code>）。每层的首个出队节点（<code>i == 0</code>）即为该层最左边节点：</p>
  <pre style="background: #1e293b; color: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 12px; overflow-x: auto;">
for (int i = 0; i < size; i++) {
    TreeNode cur = queue.poll();
    if (i == 0) bottomLeft = cur.val; // 每层层首捕获
    if (cur.left != null) queue.offer(cur.left);
    if (cur.right != null) queue.offer(cur.right);
}
  </pre>
  <p>遍历结束后，<code>bottomLeft</code> 保留的就是最后一层的层首节点，直观稳健。</p>

  <h3 style="color: #0f172a; font-size: 14px; margin-top: 16px; margin-bottom: 8px; font-weight: 600;">3. Stage 3: 逆向右先层序 BFS（最后出队即答案 · 最优神级解法）</h3>
  <p>常规 BFS 是从左到右入队，如果我们将入队顺序反转——<strong>先入右孩子，再入左孩子</strong>：</p>
  <pre style="background: #1e293b; color: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 12px; overflow-x: auto;">
while (!queue.isEmpty()) {
    cur = queue.poll();
    if (cur.right != null) queue.offer(cur.right); // 先入右
    if (cur.left != null) queue.offer(cur.left);   // 后入左
}
return cur.val; // 队列排空时，最后弹出的就是最左下角的节点！
  </pre>
  <p>整个树的遍历顺序变为“从上到下、从右到左”。<strong>最后一个被弹出的节点在几何上必然是最底层最左边的节点！</strong>完全免去层深统计与分层循环，极致优雅！</p>
</div>
`;
