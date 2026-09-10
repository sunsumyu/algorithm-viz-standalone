/**
 * 左神算法通关课 049 ~ 055 前缀和、差分与单调栈队列专题 题目与深度解析
 */

export const ARRAY_049_055_PROBLEMS = {
  prefixSumBasic049: {
    title: '一维前缀和与哈希表结合 (Class 049)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 560 / 和为 K 的子数组)</h2>
        <p>前缀和 $preSum[i] = \\sum_{k=0}^i arr[k]$。子数组 $[j, i]$ 的和等于 $preSum[i] - preSum[j-1]$。若要求子数组和为 $K$，等价于寻找是否存在 $preSum[j-1] = preSum[i] - K$。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">哈希表加速</h3>
        <p>使用哈希表记录每个前缀和出现的频次，遍历过程中一边累加当前前缀和，一边查询 <code>preSum - K</code> 的频次，即可在 $O(N)$ 线性时间内解决任意子数组和问题。</p>
      </div>
    `,
  },

  prefixSum2D050: {
    title: '二维前缀和与区域检索 (Class 050)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 304 / 二维区域和检索)</h2>
        <p>利用二维几何容斥原理，将一个矩阵任意子矩形区域 $[r_1, c_1] \\dots [r_2, c_2]$ 的元素和，转化为 4 个顶点前缀矩形的加减法，查询复杂度为极致的 $O(1)$！</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">容斥计算公式</h3>
        <ul>
          <li>1. <strong>建表公式</strong>：<code>sum[i][j] = sum[i-1][j] + sum[i][j-1] - sum[i-1][j-1] + mat[i][j]</code>。</li>
          <li>2. <strong>查询公式</strong>：<code>query = sum[r2][c2] - sum[r1-1][c2] - sum[r2][c1-1] + sum[r1-1][c1-1]</code>。</li>
        </ul>
      </div>
    `,
  },

  arithmeticDiff051: {
    title: '等差数列差分与二阶差分 (Class 051)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P4231 三步必杀 / 区间等差数列加)</h2>
        <p>当需要在区间 $[l, r]$ 上累加首项为 $s$、末项为 $e$、公差为 $d$ 的等差数列时，普通一阶差分在区间内部每一点都在递增，无法 $O(1)$ 解决。必须使用<strong>二阶差分（两次差分）</strong>技术！</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">二阶差分打标 4 点法</h3>
        <ul>
          <li>1. <code>diff2[l] += s</code></li>
          <li>2. <code>diff2[l + 1] += (d - s)</code></li>
          <li>3. <code>diff2[r + 1] -= (e + d)</code></li>
          <li>4. <code>diff2[r + 2] += e</code></li>
          <li>5. 对 <code>diff2</code> 连续执行<strong>两次前缀和</strong>，即可在 $O(N)$ 内瞬间还原所有区间的等差数列叠加！</li>
        </ul>
      </div>
    `,
  },

  monotonicStackBasic052: {
    title: '单调栈原理与左右最近较小值 (Class 052)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (左神单调栈基础模版)</h2>
        <p>单调栈的核心功能：在 $O(N)$ 时间内求解数组中<strong>每一个元素左边和右边离它最近且比它小（或大）的元素位置</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">底到顶单调递增栈法则</h3>
        <ul>
          <li>1. <strong>压入规则</strong>：新数大于栈顶则直接压入。</li>
          <li>2. <strong>弹出结算</strong>：若新数小于等于栈顶，栈顶元素被弹出并立即产生结算：使其弹出的当前元素即为其<strong>右侧最近较小值</strong>；弹出后暴露的新栈顶即为其<strong>左侧最近较小值</strong>！</li>
        </ul>
      </div>
    `,
  },

  largestRectangle053: {
    title: '柱状图最大矩形 (Class 053)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 84 & LeetCode 85 最大矩形)</h2>
        <p>以每一个柱子作为矩形的<strong>瓶颈高度 $height$</strong>，向左向右能扩展的最大宽度由单调栈求出的左右最近较小值决定：<code>width = right_min - left_min - 1</code>。</p>
        <p>单次扫描计算所有柱子的最大承载面积，取全局最大值即为柱状图最大矩形。</p>
      </div>
    `,
  },

  monotonicQueueBasic054: {
    title: '单调队列与滑动窗口最大值 (Class 054)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 239 / 滑动窗口最大值)</h2>
        <p>滑动窗口大小为 $K$ 持续向右移动。利用双端队列（Deque）严格维持内部下标对应元素的单调递减性：</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">均摊 O(1) 维护双端</h3>
        <ul>
          <li>1. <strong>队尾淘汰</strong>：新元素入队前，弹出队尾所有小于等于新元素的过期项（比你小还比你年轻，永无出头之日）。</li>
          <li>2. <strong>队头过期</strong>：若队头下标滑出窗口范围，从队头弹出。</li>
          <li>3. <strong>瞬时取最值</strong>：当前窗口最大值恒在队头，单次查询 $O(1)$。</li>
        </ul>
      </div>
    `,
  },

  validSubarrayLimit055: {
    title: '双单调队列与绝对差限制子数组 (Class 055)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 1438 / 绝对差不超过限制的最长连续子数组)</h2>
        <p>同时维护一个单调递减队列（维护窗口内最大值）和一个单调递增队列（维护窗口内最小值）。当且仅当 <code>maxQueue.peek() - minQueue.peek() <= limit</code> 时窗口合法。</p>
        <p>双指针滑动配合双单调队列，在 $O(N)$ 严格时间内求得满足限制条件的最长连续子数组或统计所有达标子数组数量。</p>
      </div>
    `,
  },
};
