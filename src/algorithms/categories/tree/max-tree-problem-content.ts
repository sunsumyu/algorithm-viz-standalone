/**
 * LeetCode 654: 最大二叉树 (Maximum Binary Tree)
 * 名师精讲题解与核心考点解析 HTML
 */

export const MAX_TREE_PROBLEM_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="background: rgba(14, 165, 233, 0.2); color: #38bdf8; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(14, 165, 233, 0.4);">
      LeetCode 654
    </span>
    <span style="background: rgba(234, 179, 8, 0.2); color: #facc15; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(234, 179, 8, 0.4);">
      中等 Difficulty
    </span>
    <span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(168, 85, 247, 0.4);">
      笛卡尔树 (Cartesian Tree)
    </span>
  </div>

  <h3 style="color: #f8fafc; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">题目描述</h3>
  <p style="margin: 0 0 10px 0; font-size: 13px;">
    给定一个不重复的整数数组 <code>nums</code> 。最大二叉树可以用下面的算法从 <code>nums</code> 递归地构建：
  </p>
  <ol style="margin: 0 0 12px 18px; padding: 0; font-size: 13px; color: #94a3b8;">
    <li>创建一个根节点，其值为 <code>nums</code> 中的最大值。</li>
    <li>递归地在最大值 <strong>左边</strong> 的子数组前缀上构建左子树。</li>
    <li>递归地在最大值 <strong>右边</strong> 的子数组后缀上构建右子树。</li>
  </ol>
  <p style="margin: 0 0 12px 0; font-size: 13px;">
    返回 <code>nums</code> 构建的 <strong>最大二叉树</strong> 的根节点。
  </p>

  <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;">
    <div style="font-weight: 600; color: #e2e8f0; font-size: 12px; margin-bottom: 4px;">示例 1：</div>
    <div style="font-family: monospace; font-size: 12px; color: #38bdf8;">输入：nums = [3,2,1,6,0,5]</div>
    <div style="font-family: monospace; font-size: 12px; color: #4ade80;">输出：[6,3,5,null,2,0,null,null,1]</div>
    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
      解释：最大值是 6，左边子数组是 [3,2,1]，构建左子树；右边子数组是 [0,5]，构建右子树。
    </div>
  </div>

  <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;">
    <div style="font-weight: 600; color: #e2e8f0; font-size: 12px; margin-bottom: 4px;">示例 2：</div>
    <div style="font-family: monospace; font-size: 12px; color: #38bdf8;">输入：nums = [1,2,3]</div>
    <div style="font-family: monospace; font-size: 12px; color: #4ade80;">输出：[3,null,2,null,1]</div>
    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
      解释：最大值是 3，左边子数组是 [1,2]，右边为空。树退化为单支树。
    </div>
  </div>
</div>
`;

export const MAX_TREE_ANALYSIS_HTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #cbd5e1;">
  <h3 style="color: #f8fafc; font-size: 15px; margin: 0 0 10px 0; font-weight: 700;">核心考点与三大阶段演化解析</h3>

  <div style="margin-bottom: 12px; background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 6px; border-left: 3px solid #38bdf8;">
    <div style="font-weight: 700; color: #38bdf8; font-size: 13px; margin-bottom: 4px;">Stage 1: 经典分治与区间扫描 (D&C Baseline)</div>
    <div style="font-size: 12px; color: #94a3b8;">
      • <strong>原理</strong>：每次在当前子数组 <code>[left, right]</code> 内线性遍历寻找最大值 <code>nums[maxIdx]</code>，以其建立根节点，然后分治递归构建左区间 <code>[left, maxIdx - 1]</code> 与右区间 <code>[maxIdx + 1, right]</code>。<br>
      • <strong>复杂度</strong>：平均时间复杂度为 <code>O(N log N)</code>；若数组单调（如完全升序或降序），树退化为斜链，递归深度为 <code>N</code>，最坏时间复杂度为 <code>O(N²)</code>，递归栈空间 <code>O(N)</code>。
    </div>
  </div>

  <div style="margin-bottom: 12px; background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 6px; border-left: 3px solid #a855f7;">
    <div style="font-weight: 700; color: #c084fc; font-size: 13px; margin-bottom: 4px;">Stage 2: 单调栈 O(N) 笛卡尔树 (Cartesian Tree Monotonic Stack)</div>
    <div style="font-size: 12px; color: #94a3b8;">
      • <strong>笛卡尔树性质</strong>：最大二叉树本质上是数组的<strong>笛卡尔树</strong>（满足中序遍历还原原数组，且满足大顶堆性质）。<br>
      • <strong>单调栈机制</strong>：维护一个从栈底到栈顶<strong>严格单调递减</strong>的节点栈。<br>
      &nbsp;&nbsp;1. 扫描元素 <code>curr</code>：所有在栈顶且值小于 <code>curr.val</code> 的节点必然位于 <code>curr</code> 的左侧且比它小，因此弹出节点，并将<strong>最后一个弹出的节点</strong>挂载为 <code>curr.left</code>！<br>
      &nbsp;&nbsp;2. 栈中剩余节点值均大于 <code>curr</code>，其中当前栈顶节点是 <code>curr</code> 左侧离它最近且大于它的节点，因此将 <code>curr</code> 挂载为栈顶节点的 <code>right</code>！<br>
      &nbsp;&nbsp;3. 将 <code>curr</code> 压入栈中。<br>
      • <strong>复杂度</strong>：每个节点最多进栈出栈各一次，时间复杂度严格 <strong>O(N)</strong>，空间复杂度 <code>O(N)</code>。
    </div>
  </div>

  <div style="margin-bottom: 12px; background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 6px; border-left: 3px solid #10b981;">
    <div style="font-weight: 700; color: #34d399; font-size: 13px; margin-bottom: 4px;">Stage 3: 显式任务栈迭代模拟 (Explicit Construction Stack)</div>
    <div style="font-size: 12px; color: #94a3b8;">
      • <strong>防爆栈工业工程实践</strong>：当输入规模极大或极端斜向退化时，系统调用栈可能发生 StackOverflow。<br>
      • <strong>显式模拟</strong>：将子区间构建任务 <code>(parent, isLeft, l, r)</code> 封装入堆内存栈，用显式循环取代系统隐式栈帧，消除深度限制并便于细粒度调试。
    </div>
  </div>
</div>
`;
