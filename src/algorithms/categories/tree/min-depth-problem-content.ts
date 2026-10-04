/**
 * 二叉树的最小深度题目讲义与解析 (LeetCode 111 / Zuoshen Class 036)
 */

export const MIN_DEPTH_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 111</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Easy</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(168,85,247,0.2); color: #c084fc; font-weight: 700; border: 1px solid rgba(168,85,247,0.3);">左神 Class 036</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">二叉树的最小深度</h2>
    </div>
    <p style="margin: 0;">给定一个二叉树，找出其 <strong>最小深度</strong> 。最小深度是从根节点到最近 <strong>叶子节点</strong> 的最短路径上的节点数量。<strong>叶子节点</strong> 是指没有子节点的节点（左右子树均为空）。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">经典示例:</div>
      <div>输入: root = [3, 9, 20, null, null, 15, 7]</div>
      <div>输出: 2</div>
      <div style="color: #38bdf8;">解释: 根节点 3 到最近叶子节点 9 的路径包含 2 个节点 [3, 9]，因此最小深度为 2。</div>
      <div style="color: #f59e0b; margin-top: 4px;">⚠️ 致命陷阱案例:</div>
      <div>输入: root = [1, 2]</div>
      <div>输出: 2 (而非 1！因为根节点 1 拥有右或左子树，不是叶子节点，必须走到节点 2)</div>
      <div style="color: #a78bfa; margin-top: 4px;">📜 典型四节点递归推演案例:</div>
      <div>输入: root = [1, 2, 3, null, 4]</div>
      <div>输出: 2 (节点 2 仅有右孩子 4，不是叶节点；右子树节点 3 是叶节点，故最小深度为 2)</div>
    </div>
  </div>
`;

export const MIN_DEPTH_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 最小深度三阶段架构演进分析
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">Stage 1: 后序递归分治与叶节点特判 (Recursive DFS)</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>叶节点定义避坑：</strong> 若左子树为空且右子树非空，必须返回右子树最小深度 + 1；同理右子树为空时必须返回左子树最小深度 + 1；<br/>
        • 仅当左右子树均非空时，才使用 <code style="color: #38bdf8; font-family: monospace;">min(left, right) + 1</code>。<br/>
        • 时间复杂度 $O(N)$，空间复杂度 $O(H)$。
        </p>

        <div style="margin-top: 10px; background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; line-height: 1.5; overflow-x: auto;">
          <div style="color: #38bdf8; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>📜 经典用例 [1, 2, 3, null, 4] 递归调用推演执行全景 (手抄本)</span>
            <span style="font-size: 10px; background: rgba(56,189,248,0.15); color: #38bdf8; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">Call-Tree Trace</span>
          </div>
          <pre style="margin: 0; font-family: inherit; color: #cbd5e1;"><span style="color: #38bdf8; font-weight: 700;">minDepth(1)</span>                                    <span style="color: #64748b;">&lt;- 最终要算这个</span>
|
| <span style="color: #94a3b8;">① root=1, 非空</span>
| <span style="color: #64748b;">② 不是叶子 (有左右孩子)</span>
| <span style="color: #64748b;">③ left != null (是2), 跳过</span>
| <span style="color: #64748b;">④ right != null (是3), 跳过</span>
| <span style="color: #a78bfa;">⑤ 走最后一行: Math.min(minDepth(左), minDepth(右)) + 1</span>
|
|--- <span style="color: #38bdf8; font-weight: 700;">minDepth(2)</span>                               <span style="color: #64748b;">&lt;- 先算左边</span>
|    |
|    | <span style="color: #94a3b8;">① root=2, 非空</span>
|    | <span style="color: #64748b;">② 不是叶子 (右孩子是4)</span>
|    | <span style="color: #34d399; font-weight: 700;">③ root.left == null √ 命中!</span>
|    |    <span style="color: #a78bfa;">-&gt; return minDepth(root.right) + 1</span>
|    |    <span style="color: #a78bfa;">-&gt; return minDepth(4) + 1</span>
|    |
|    |--- <span style="color: #38bdf8; font-weight: 700;">minDepth(4)</span>                          <span style="color: #64748b;">&lt;- 算2的右孩子</span>
|         |
|         | <span style="color: #94a3b8;">① root=4, 非空</span>
|         | <span style="color: #34d399; font-weight: 700;">② left==null &amp;&amp; right==null √ 命中!</span>
|         |    <span style="color: #34d399;">-&gt; return 1</span>
|         |
|         |--- <span style="color: #fbbf24; font-weight: 700;">返回 1 ---</span>
|
|    <span style="color: #38bdf8;">回到 minDepth(2): return 1 + 1 = 2</span>
|    <span style="color: #fbbf24; font-weight: 700;">返回 2 ---</span>
|
|--- <span style="color: #38bdf8; font-weight: 700;">minDepth(3)</span>                               <span style="color: #64748b;">&lt;- 再算右边</span>
|    |
|    | <span style="color: #94a3b8;">① root=3, 非空</span>
|    | <span style="color: #34d399; font-weight: 700;">② left==null &amp;&amp; right==null √ 命中!</span>
|    |    <span style="color: #34d399;">-&gt; return 1</span>
|    |
|    |--- <span style="color: #fbbf24; font-weight: 700;">返回 1 ---</span>
|
<span style="color: #38bdf8; font-weight: 700;">回到 minDepth(1): return Math.min(2, 1) + 1 = 1 + 1 = 2</span>
<span style="color: #10b981; font-weight: 700;">最终返回 2 ✅</span></pre>
        </div>
      </div>

      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">Stage 2: 广度优先搜索层序最短路提前终止 (BFS Early Exit)</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>BFS 最短路第一原理：</strong> 在无权图中寻找最短路径，层序遍历是数学上最优策略；<br/>
        • 逐层入队，一旦在当前层发现首个叶子节点（<code style="color: #34d399; font-family: monospace;">!node.left && !node.right</code>），立即返回当前层深度！<br/>
        • 避免了递归对右侧深子树的无效深搜，极大缩减常数时间。
        </p>
      </div>

      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #c084fc; margin-bottom: 4px;">Stage 3: 静态数组模拟队列 (Static Array Queue BFS · Zuoshen Class 036)</div>
        <p style="margin: 0; color: #94a3b8;">
        • 采用连续内存数组 <code style="color: #c084fc; font-family: monospace;">queueArr[]</code> 与双指针 <code style="color: #c084fc; font-family: monospace;">l, r</code> 代替链表动态对象开辟；<br/>
        • 杜绝 JVM/V8 垃圾回收频繁介入，在海量层序节点场景下保持极高局部性与吞吐。
        </p>
      </div>
    </div>
  </div>
`;
