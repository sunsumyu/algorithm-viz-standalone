/**
 * 寻找重复的子树 (Find Duplicate Subtrees · LeetCode 652) 体系化讲义
 */

export const FIND_DUPLICATE_SUBTREES_PROBLEM_HTML = `
<div class="problem-intro">
  <div class="problem-badge" style="display: flex; gap: 8px; margin-bottom: 12px;">
    <span style="background: rgba(234, 179, 8, 0.2); color: #facc15; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">LeetCode 652</span>
    <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">二叉树后序遍历</span>
    <span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">子树序列化与哈希查重</span>
    <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">三元组 UID 极速压缩</span>
  </div>

  <h3 style="font-size: 1.15rem; font-weight: 700; color: #f8fafc; margin-bottom: 10px;">题目描述</h3>
  <p style="color: #cbd5e1; line-height: 1.6; font-size: 0.92rem; margin-bottom: 12px;">
    给你一棵二叉树的根节点 <code style="color: #38bdf8; background: rgba(56,189,248,0.1); padding: 1px 4px; border-radius: 3px;">root</code>，返回所有 <strong>重复的子树</strong>。
    对于同一类重复子树，你只需要返回其中任意 <strong>一棵</strong> 的根结点即可。
  </p>
  <p style="color: #94a3b8; line-height: 1.5; font-size: 0.88rem; margin-bottom: 14px;">
    如果两棵树具有 <strong>相同的结构</strong> 且 <strong>相同的对应结点值</strong>，则称这两棵树是重复的。
  </p>

  <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px; margin-bottom: 14px;">
    <div style="font-weight: 600; color: #f1f5f9; font-size: 0.85rem; margin-bottom: 6px;">示例 1:</div>
    <div style="font-family: monospace; font-size: 0.82rem; color: #94a3b8; line-height: 1.5;">
      输入: root = [1,2,3,4,null,2,4,null,null,4]<br>
      输出: [[2,4],[4]]<br>
      解释: 根为 2 (左孩子为 4) 的子树在左右两侧各出现了一次；叶子节点 4 在整棵树中一共出现了三次（其中前两次被各自所属的子树 [2,4] 和独立叶子覆盖）。
    </div>
  </div>

  <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
    <div style="font-weight: 600; color: #f1f5f9; font-size: 0.85rem; margin-bottom: 6px;">数据约束:</div>
    <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; color: #94a3b8; line-height: 1.6;">
      <li>树中的结点数在 <code style="color: #cbd5e1;">[1, 10^4]</code> 范围内。</li>
      <li><code style="color: #cbd5e1;">-200 &lt;= Node.val &lt;= 200</code></li>
    </ul>
  </div>
</div>
`;

export const FIND_DUPLICATE_SUBTREES_ANALYSIS_HTML = `
<div class="analysis-content" style="color: #cbd5e1; line-height: 1.65; font-size: 0.9rem;">
  <h4 style="font-size: 1rem; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">一、核心难点：子树唯一性的形式化定义</h4>
  <p style="margin-bottom: 12px;">
    判断两棵子树是否相同，本质上是<strong>图同构</strong>问题。而在二叉树中，只要确定了遍历顺序并显式包含空节点标记（例如用 <code style="color: #38bdf8;">#</code> 表示 null），即可建立二叉树形态与序列之间的<strong>一一双向双射映射</strong>。
  </p>

  <h4 style="font-size: 1rem; font-weight: 700; color: #c084fc; margin-bottom: 8px;">二、三大阶段渐进演化架构</h4>
  <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;">
    <div style="background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; padding: 8px 12px; border-radius: 0 6px 6px 0;">
      <strong style="color: #38bdf8;">Stage 1: 经典后序序列化哈希查重 (Postorder Serialization)</strong>
      <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">
        自底向上执行后序遍历（左-右-根），递归拼接序列串 <code style="color: #cbd5e1;">leftSerial + "," + rightSerial + "," + node.val</code>。
        用哈希表记录频次，恰在频次到达 <strong>2</strong> 时将节点加入答案集（避免大于 2 时重复添加）。时间复杂度 $O(N^2)$。
      </p>
    </div>

    <div style="background: rgba(168, 85, 247, 0.08); border-left: 3px solid #c084fc; padding: 8px 12px; border-radius: 0 6px 6px 0;">
      <strong style="color: #c084fc;">Stage 2: 唯一三元组 UID 编码极速哈希 (Triplet ID Compression)</strong>
      <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">
        针对 Stage 1 字符串拼接和哈希比对耗时达 $O(N^2)$ 的退化痛点，将每棵子树抽象为<strong>三元组 (val, leftUID, rightUID)</strong>。
        通过哈希映射为其分配递增的唯一整数 ID，将子树判定降维到 $O(1)$，全树处理时间严格为 $O(N)$。
      </p>
    </div>

    <div style="background: rgba(34, 197, 94, 0.08); border-left: 3px solid #4ade80; padding: 8px 12px; border-radius: 0 6px 6px 0;">
      <strong style="color: #4ade80;">Stage 3: 显式后序遍历与单调栈迭代 (Explicit Stack Iteration)</strong>
      <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">
        将自底向上的递归转为双栈/显式后序迭代，消灭深层链状树递归系统栈溢出风险，体现工业级健壮性。
      </p>
    </div>
  </div>

  <h4 style="font-size: 1rem; font-weight: 700; color: #facc15; margin-bottom: 8px;">三、复杂度对比</h4>
  <table style="width: 100%; border-collapse: collapse; font-size: 0.83rem; text-align: left; margin-bottom: 10px;">
    <thead>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #f1f5f9;">
        <th style="padding: 6px 8px;">阶段策略</th>
        <th style="padding: 6px 8px;">时间复杂度</th>
        <th style="padding: 6px 8px;">空间复杂度</th>
        <th style="padding: 6px 8px;">优势与适用场景</th>
      </tr>
    </thead>
    <tbody style="color: #94a3b8;">
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 6px 8px; color: #38bdf8;">Stage 1: 递归字符串序列化</td>
        <td style="padding: 6px 8px;">$O(N^2)$</td>
        <td style="padding: 6px 8px;">$O(N^2)$</td>
        <td style="padding: 6px 8px;">代码极简直观，教学推演首选</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 6px 8px; color: #c084fc;">Stage 2: 三元组 UID 编码</td>
        <td style="padding: 6px 8px;">$O(N)$</td>
        <td style="padding: 6px 8px;">$O(N)$</td>
        <td style="padding: 6px 8px;">理论最优，消灭字符串开销，适合海量节点</td>
      </tr>
      <tr>
        <td style="padding: 6px 8px; color: #4ade80;">Stage 3: 显式后序单调栈迭代</td>
        <td style="padding: 6px 8px;">$O(N^2)$</td>
        <td style="padding: 6px 8px;">$O(N)$ 栈深度</td>
        <td style="padding: 6px 8px;">零递归系统调用栈，防止爆栈</td>
      </tr>
    </tbody>
  </table>
</div>
`;
