/**
 * 从前序/后序与中序遍历构造二叉树 (Construct Binary Tree · LeetCode 105 & 106 / Zuoshen Class 036 Code07)
 * 多阶段演进领域知识与题解精讲
 */

export const BUILD_TREE_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 105 / 106</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">左神 Class 036</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">从前序/后序与中序遍历构造二叉树</h2>
    </div>
    <p style="margin: 0;">给定二叉树的两种遍历序列（前序+中序 或 后序+中序），每个序列元素互不相同，请构造二叉树并返回其根节点。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">经典示例:</div>
      <div>前序 preorder = [3, 9, 20, 15, 7]</div>
      <div>中序 inorder  = [9, 3, 15, 20, 7]</div>
      <div>后序 postorder = [9, 15, 7, 20, 3]</div>
      <div style="color: #38bdf8;">还原二叉树: [3, 9, 20, null, null, 15, 7]</div>
    </div>
  </div>
`;

export const BUILD_TREE_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 三阶段算法演进体系 (Three-Stage Evolution)
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">Stage 1: 前序+中序分治切分递归构造 (LC 105)</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>前序首元素定根：</strong> <code style="color: #38bdf8; font-family: monospace;">rootVal = preorder[pL]</code>；<br/>
        2. <strong>哈希表 O(1) 定位中序根位置：</strong> 在中序中找到下标 <code style="color: #fde047; font-family: monospace;">inRoot</code>；<br/>
        3. <strong>计算左子树跨度：</strong> <code style="color: #fbbf24; font-family: monospace;">leftLen = inRoot - iL</code>；<br/>
        4. <strong>精准切分递归：</strong> 左子树 <code style="color: #60a5fa; font-family: monospace;">pre[pL+1 .. pL+leftLen]</code> 与 <code style="color: #60a5fa; font-family: monospace;">in[iL .. inRoot-1]</code>；右子树 <code style="color: #a855f7; font-family: monospace;">pre[pL+leftLen+1 .. pR]</code> 与 <code style="color: #a855f7; font-family: monospace;">in[inRoot+1 .. iR]</code>。
        </p>
      </div>

      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">Stage 2: 后序+中序分治切分递归构造 (LC 106)</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>后序尾元素定根：</strong> <code style="color: #34d399; font-family: monospace;">rootVal = postorder[postR]</code>；<br/>
        2. <strong>同样通过 inMap 定位：</strong> <code style="color: #fde047; font-family: monospace;">leftLen = inRoot - inL</code>；<br/>
        3. <strong>后序区间切分对应：</strong> 左子树在后序中为 <code style="color: #60a5fa; font-family: monospace;">[postL .. postL+leftLen-1]</code>；右子树为 <code style="color: #a855f7; font-family: monospace;">[postL+leftLen .. postR-1]</code>。
        </p>
      </div>

      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #c084fc; margin-bottom: 4px;">Stage 3: 迭代显式栈模拟重构 ($O(N)$ 零哈希表 · LC 105 迭代法)</div>
        <p style="margin: 0; color: #94a3b8;">
        • 维护节点单调前序探索栈 <code style="color: #c084fc; font-family: monospace;">stack</code> 和中序指针 <code style="color: #38bdf8; font-family: monospace;">inIdx = 0</code>。<br/>
        • 遍历前序数组：若栈顶元素与中序指针不匹配，说明仍处于一路向左的分支，将新节点挂载为当前栈顶的<strong>左孩子</strong>并压栈；<br/>
        • 若栈顶与中序指针匹配，说明左边界已达，通过持续出栈回溯到拐点父节点，将新节点挂载为该节点的<strong>右孩子</strong>并压栈。
        </p>
      </div>
    </div>
  </div>
`;
