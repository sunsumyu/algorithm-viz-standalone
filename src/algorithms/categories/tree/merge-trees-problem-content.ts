/**
 * LeetCode 617: 合并二叉树 (Merge Two Binary Trees)
 * 名师精讲题解与核心考点解析 HTML
 */

export const MERGE_TREES_PROBLEM_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="background: rgba(14, 165, 233, 0.2); color: #38bdf8; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(14, 165, 233, 0.4);">
      LeetCode 617
    </span>
    <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(34, 197, 94, 0.4);">
      简单 Easy
    </span>
    <span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(168, 85, 247, 0.4);">
      双树同步遍历 (Dual Tree Traversal)
    </span>
  </div>

  <h3 style="color: #f8fafc; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">题目描述</h3>
  <p style="margin: 0 0 10px 0; font-size: 13px;">
    给你两棵二叉树：<code>root1</code> 和 <code>root2</code>。
  </p>
  <p style="margin: 0 0 10px 0; font-size: 13px;">
    想象一下，当你将其中一棵覆盖到另一棵之上时，两棵树上的一些节点将会重叠（而另一些不会）。你需要将这两棵树合并成一棵新二叉树。合并的规则是：
  </p>
  <ul style="margin: 0 0 12px 18px; padding: 0; font-size: 13px; color: #94a3b8;">
    <li>如果两个节点重叠，那么将这两个节点的值相加作为合并后节点的新值；</li>
    <li>否则，<strong>不为 null 的节点</strong> 将直接作为新二叉树的对应子树节点。</li>
  </ul>
  <p style="margin: 0 0 12px 0; font-size: 13px;">
    返回合并后的二叉树。注意：合并过程可以复用已有节点，也可以创建一棵全新的深拷贝合并二叉树。
  </p>

  <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;">
    <div style="font-weight: 600; color: #e2e8f0; font-size: 12px; margin-bottom: 4px;">示例 1：</div>
    <div style="font-family: monospace; font-size: 12px; color: #38bdf8;">输入：root1 = [1,3,2,5], root2 = [2,1,3,null,4,null,7]</div>
    <div style="font-family: monospace; font-size: 12px; color: #4ade80;">输出：[3,4,5,5,4,null,7]</div>
    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
      解释：根节点 1 + 2 = 3；左孩子 3 + 1 = 4；右孩子 2 + 3 = 5；左叶子 5 + null = 5；右叶子 null + 4 = 4；最右叶子 null + 7 = 7。
    </div>
  </div>

  <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;">
    <div style="font-weight: 600; color: #e2e8f0; font-size: 12px; margin-bottom: 4px;">示例 2：</div>
    <div style="font-family: monospace; font-size: 12px; color: #38bdf8;">输入：root1 = [1], root2 = [1,2]</div>
    <div style="font-family: monospace; font-size: 12px; color: #4ade80;">输出：[2,2]</div>
  </div>
</div>
`;

export const MERGE_TREES_ANALYSIS_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #cbd5e1;">
  <h3 style="color: #f8fafc; font-size: 15px; margin: 0 0 10px 0; font-weight: 700;">核心考点与多阶段演化解析</h3>

  <div style="margin-bottom: 12px; background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 6px; border-left: 3px solid #38bdf8;">
    <div style="font-weight: 700; color: #38bdf8; font-size: 13px; margin-bottom: 4px;">Stage 1: 递归 DFS 同步下潜 (Simultaneous DFS)</div>
    <div style="font-size: 12px; color: #94a3b8;">
      • <strong>基底条件判定 (Base Cases)</strong>：<br>
      &nbsp;&nbsp;1. 若 <code>root1 == null</code>，则合并结果直接为 <code>root2</code>（即便 root2 也为 null 同样自洽成立）；<br>
      &nbsp;&nbsp;2. 若 <code>root2 == null</code>，则合并结果直接为 <code>root1</code>；<br>
      • <strong>值相加与递归分支</strong>：<br>
      &nbsp;&nbsp;当两节点均非空时，当前合并节点的值为 <code>root1.val + root2.val</code>；随后同步递归合并左右子树：<br>
      &nbsp;&nbsp;<code>merged.left = mergeTrees(root1.left, root2.left)</code><br>
      &nbsp;&nbsp;<code>merged.right = mergeTrees(root1.right, root2.right)</code><br>
      • <strong>时空复杂度</strong>：时间复杂度为 <code>O(min(M, N))</code>，其中 M 和 N 分别为两棵树的节点数；递归调用栈深度最坏为 <code>O(min(M, N))</code>，平均为 <code>O(log min(M, N))</code>。
    </div>
  </div>

  <div style="margin-bottom: 12px; background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 6px; border-left: 3px solid #a855f7;">
    <div style="font-weight: 700; color: #c084fc; font-size: 13px; margin-bottom: 4px;">Stage 2: 迭代 BFS 队列同步合并 (Iterative BFS Queue)</div>
    <div style="font-size: 12px; color: #94a3b8;">
      • <strong>队列三元组/节点对</strong>：维护一个队列，存放两棵树中需要同步合并的节点对 <code>[node1, node2]</code>（或以 root1 作为主树进行原地嫁接）。<br>
      • <strong>分支处理逻辑</strong>：<br>
      &nbsp;&nbsp;1. 若 <code>node1.left != null && node2.left != null</code>，将其入队；若 <code>node1.left == null</code>，直接将 <code>node2.left</code> 嫁接到 <code>node1.left</code>；<br>
      &nbsp;&nbsp;2. 类似地处理右孩子：若两边都存在则入队等待下一层累加，若主树为空则直接嫁接副树右孩子；<br>
      • <strong>工业意义</strong>：将递归转化为迭代，避免系统调用栈溢出（StackOverflow），状态演化更加扁平透明。
    </div>
  </div>
</div>
`;
