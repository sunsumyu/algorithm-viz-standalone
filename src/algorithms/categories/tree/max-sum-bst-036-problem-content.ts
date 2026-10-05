/**
 * 二叉搜索子树的最大键值和 (Max Sum BST Subtree · LeetCode 1373 / 333 / 左神 Class 036) 体系化讲义
 */

export const MAX_SUM_BST_PROBLEM_HTML = `
<div class="problem-intro">
  <div class="problem-badge" style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
    <span style="background: rgba(234, 179, 8, 0.2); color: #facc15; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">LeetCode 1373 (Hard)</span>
    <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">左程云 Class 036</span>
    <span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">二叉树树形 DP</span>
    <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">Info 结构体搜集套路</span>
  </div>

  <h3 style="font-size: 1.15rem; font-weight: 700; color: #f8fafc; margin-bottom: 10px;">题目描述</h3>
  <p style="color: #cbd5e1; line-height: 1.6; font-size: 0.92rem; margin-bottom: 12px;">
    给你一棵以 <code style="color: #38bdf8; background: rgba(56,189,248,0.1); padding: 1px 4px; border-radius: 3px;">root</code> 为根的二叉树，请你返回 <strong>任意</strong> 二叉搜索子树的最大键值和。
  </p>
  <p style="color: #94a3b8; line-height: 1.5; font-size: 0.88rem; margin-bottom: 14px;">
    二叉搜索树（BST）满足以下所有特征：
    <br>1. 节点的左子树只包含 <strong>键值小于</strong> 节点键值的节点；
    <br>2. 节点的右子树只包含 <strong>键值大于</strong> 节点键值的节点；
    <br>3. 左右子树也必须各自为严格二叉搜索树；
    <br>4. 任意一棵空子树也是合法的二叉搜索树，键值和为 0。
  </p>

  <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px; margin-bottom: 14px;">
    <div style="font-weight: 600; color: #f1f5f9; font-size: 0.85rem; margin-bottom: 6px;">示例 1 (LC 1373 经典官方破损树):</div>
    <div style="font-family: monospace; font-size: 0.82rem; color: #94a3b8; line-height: 1.5;">
      输入: root = [1,4,3,2,4,2,5,null,null,null,null,null,null,4,6]<br>
      输出: 20<br>
      解释: 键值为 3 的子树不是 BST（因为右子树节点 2 小于 3）；而以右侧节点 5 为根的子树（节点为 5, 4, 6）是 BST，其和为 15；但更优的是以节点 2 为根的右子树加上其叶子构成的 BST，最大键值和为 20。
    </div>
  </div>

  <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
    <div style="font-weight: 600; color: #f1f5f9; font-size: 0.85rem; margin-bottom: 6px;">数据约束:</div>
    <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; color: #94a3b8; line-height: 1.6;">
      <li>每棵树有 <code style="color: #cbd5e1;">[1, 4 * 10^4]</code> 个节点。</li>
      <li>节点的键值在 <code style="color: #cbd5e1;">[-4 * 10^4, 4 * 10^4]</code> 之间。</li>
    </ul>
  </div>
</div>
`;

export const MAX_SUM_BST_ANALYSIS_HTML = `
<div class="analysis-content" style="color: #cbd5e1; line-height: 1.65; font-size: 0.9rem;">
  <h4 style="font-size: 1rem; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">一、树形 DP 通用解题心法 (左神 Class 036)</h4>
  <p style="margin-bottom: 12px;">
    树形 DP（Tree DP）的核心思想是：<strong>假设整棵子树的信息均已向左子树和右子树递归索取完毕</strong>，当前节点只需思考——
    为了向上层汇报并完成全局决策，当前节点需要从左右子树分别索取哪些核心指标？
  </p>

  <h4 style="font-size: 1rem; font-weight: 700; color: #c084fc; margin-bottom: 8px;">二、Info 结构体四大核心指标</h4>
  <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px; margin-bottom: 14px; font-family: monospace; font-size: 0.84rem;">
    struct Info {<br>
    &nbsp;&nbsp;bool isBST;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// 1. 当前子树是否为合法 BST<br>
    &nbsp;&nbsp;int minVal, maxVal;// 2. 当前子树极小值与极大值（用于父节点单调性区间校验）<br>
    &nbsp;&nbsp;int sum;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// 3. 当前子树所有节点键值总和<br>
    };
  </div>

  <h4 style="font-size: 1rem; font-weight: 700; color: #facc15; margin-bottom: 8px;">三、BST 成立充要条件与后序信息整合</h4>
  <p style="margin-bottom: 10px;">
    以节点 <code style="color: #38bdf8;">node</code> 为根的整棵树成为合法 BST 的充要条件是：
    <br>1. <code style="color: #cbd5e1;">left.isBST == true</code> 且 <code style="color: #cbd5e1;">right.isBST == true</code>；
    <br>2. <code style="color: #cbd5e1;">left.maxVal &lt; node.val</code>（左子树所有节点都严格小于当前节点）；
    <br>3. <code style="color: #cbd5e1;">node.val &lt; right.minVal</code>（右子树所有节点都严格大于当前节点）。
  </p>
  <p style="margin-bottom: 12px;">
    若满足上述三项，则当前子树合法：
    <br>&bull; <code style="color: #4ade80;">curSum = left.sum + right.sum + node.val</code>
    <br>&bull; <code style="color: #4ade80;">maxSum = max(maxSum, curSum)</code>
    <br>&bull; <code style="color: #4ade80;">Info(true, min(left.minVal, node.val), max(right.maxVal, node.val), curSum)</code>
    <br>若不满足，则标记 <code style="color: #f87171;">isBST = false</code> 向上回传，后续所有祖先均不再可能构成合法 BST。
  </p>

  <h4 style="font-size: 1rem; font-weight: 700; color: #4ade80; margin-bottom: 8px;">四、三大阶段渐进演化架构</h4>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; padding: 8px 12px; border-radius: 0 6px 6px 0;">
      <strong style="color: #38bdf8;">Stage 1: 树形 DP 二叉树递归套路 (Info 汇聚模型)</strong>
      <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">
        纯正的自底向上后序遍历信息搜集，基底空节点返回 (isBST=true, min=INF, max=-INF, sum=0)，逻辑闭环而纯粹。
      </p>
    </div>
    <div style="background: rgba(168, 85, 247, 0.08); border-left: 3px solid #c084fc; padding: 8px 12px; border-radius: 0 6px 6px 0;">
      <strong style="color: #c084fc;">Stage 2: 快速失效剪枝优化 (Pruning Invalidation)</strong>
      <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">
        在已知左子树已破损为非 BST 时，当前层无需执行全量昂贵求和，快速向父层传导失效状态。
      </p>
    </div>
    <div style="background: rgba(34, 197, 94, 0.08); border-left: 3px solid #4ade80; padding: 8px 12px; border-radius: 0 6px 6px 0;">
      <strong style="color: #4ade80;">Stage 3: 显式后序遍历与单调栈迭代 (Explicit Stack Simulation)</strong>
      <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">
        利用后序双栈/显式单调栈消除深层树系统调用栈开销，工程化规避栈溢出风险。
      </p>
    </div>
  </div>
</div>
`;
