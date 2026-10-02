/**
 * 二叉树中的最大路径和题目讲义与解析 (LeetCode 124 / Zuoshen Class 077)
 */

export const MAX_PATH_SUM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">LeetCode 124</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">Hard</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">左神 Class 077</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">二叉树中的最大路径和</h2>
    </div>
    <p style="margin: 0;">二叉树中的 <strong>路径</strong> 被定义为一条节点序列，序列中每对相邻节点之间都存在一条边。同一个节点在一条路径序列中 <strong>至多出现一次</strong> 。该路径 <strong>至少包含一个</strong> 节点，且不一定经过根节点。给你一个二叉树的根节点 <code>root</code> ，返回其 <strong>最大路径和</strong>。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">经典示例:</div>
      <div>输入: root = [-10, 9, 20, null, null, 15, 7]</div>
      <div>输出: 42</div>
      <div style="color: #38bdf8;">解释: 最优路径为 15 ➔ 20 ➔ 7，其和为 15 + 20 + 7 = 42。</div>
    </div>
  </div>
`;

export const MAX_PATH_SUM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 树形 DP 三阶段核心演化体系
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">Stage 1: 递归后序遍历与单边最大贡献分离 (经典树形 DP)</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>单边向上汇报：</strong> 向父节点汇报时只能选择一条分支（单边贡献为 <code style="color: #38bdf8; font-family: monospace;">node.val + max(0, max(left, right))</code>），因为一旦同时选择两条分支就无法向上继续连通！<br/>
        • <strong>拱形全路径汇合：</strong> 在以当前节点为最高拱顶转折点时，可以同时采纳左右两边的正收益，形成拱形路径 <code style="color: #34d399; font-family: monospace;">node.val + leftGain + rightGain</code> 挑战全局最大值！
        </p>
      </div>

      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">Stage 2: 树形 DP 二元信息汇聚模型 (左神 Class 077 套路)</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>定义 Info 结构体：</strong> <code style="color: #fde047; font-family: monospace;">Info { maxPathSum, maxGainFromRoot }</code>；<br/>
        • 向左树要信息，向右树要信息，整合出整棵树的信息向上返回；<br/>
        • 彻底解耦全局极值维护与递归局部变量，形成标准化树形 DP 模版。
        </p>
      </div>

      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #c084fc; margin-bottom: 4px;">Stage 3: 显式后序遍历与状态表映射 (零系统递归栈)</div>
        <p style="margin: 0; color: #94a3b8;">
        • 维护单显式栈模拟后序遍历调用帧展开；<br/>
        • 借助 <code style="color: #38bdf8; font-family: monospace;">gainMap</code> 哈希表在左右子节点完成出栈后即时回查单侧收益并结算拱顶路径；<br/>
        • 彻底消除递归深度导致的调用栈溢出风险。
        </p>
      </div>
    </div>
  </div>
`;
