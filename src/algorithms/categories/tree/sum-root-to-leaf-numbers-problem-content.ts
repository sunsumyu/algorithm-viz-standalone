/**
 * 求根节点到叶节点数字之和题目讲义与解析 (LeetCode 129 · Sum Root to Leaf Numbers)
 */

export const SUM_NUMBERS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 129</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">左神 Class 036</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">求根节点到叶节点数字之和</h2>
    </div>
    <p style="margin: 0;">给你一个二叉树的根节点 <code>root</code> ，树中每个节点都存放有一个 <code>0</code> 到 <code>9</code> 之间的数字。每条从根节点到叶节点的路径都代表一个数字：例如，从根到叶节点路径 <code>1 -> 2 -> 3</code> 表示数字 <code>123</code> 。计算从根节点到叶节点生成的 <strong>所有数字之和</strong> 。叶节点是指没有子节点的节点。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">经典示例:</div>
      <div>输入: root = [4, 9, 0, 5, 1]</div>
      <div>输出: 1026</div>
      <div style="color: #38bdf8;">解释:</div>
      <div>从根到叶子路径 4->9->5 代表数字 495</div>
      <div>从根到叶子路径 4->9->1 代表数字 491</div>
      <div>从根到叶子路径 4->0 代表数字 40</div>
      <div>数字总和 = 495 + 491 + 40 = 1026</div>
    </div>
  </div>
`;

export const SUM_NUMBERS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 根到叶数字累加三阶段演化架构
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">Stage 1: 前序遍历与自顶向下累加递归 (Preorder DFS)</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>状态下推转移：</strong> 递归函数传入参数 <code style="color: #38bdf8; font-family: monospace;">prevSum</code>，当前节点数值更新为 <code style="color: #38bdf8; font-family: monospace;">currSum = prevSum * 10 + node.val</code>；<br/>
        • <strong>叶节点结算：</strong> 若当前节点无左、右子树，直接返回该分支形成的数值；否则递归返回左子树和加右子树和；<br/>
        • 时间复杂度 $O(N)$，空间复杂度 $O(H)$。
        </p>
      </div>

      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">Stage 2: 广度优先搜索双队列同步 (BFS Dual Queues)</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>双队列同步：</strong> 维护节点队列 <code style="color: #fde047; font-family: monospace;">nodeQueue</code> 与数值队列 <code style="color: #fde047; font-family: monospace;">numQueue</code> 严格步调一致；<br/>
        • 层序推进时同步派生下一层数字 <code style="color: #34d399; font-family: monospace;">num * 10 + child.val</code>；<br/>
        • 彻底摆脱递归调用栈，在极深偏斜树下免疫堆栈溢出风险。
        </p>
      </div>

      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #c084fc; margin-bottom: 4px;">Stage 3: 显式迭代双栈与回溯模拟 (Iterative Dual Stacks DFS)</div>
        <p style="margin: 0; color: #94a3b8;">
        • 采用显式栈 <code style="color: #c084fc; font-family: monospace;">nodeStack</code> 与 <code style="color: #c084fc; font-family: monospace;">numStack</code> 模拟系统递归调用帧；<br/>
        • 先右后左入栈，保证出栈时保持标准的前序深度优先搜索顺序；<br/>
        • 运行时清晰展现回溯探索时各节点分支与累加和的状态演变。
        </p>
      </div>
    </div>
  </div>
`;
