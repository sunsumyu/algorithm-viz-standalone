/**
 * Class 054: 单调队列·上 体系化名师讲义与题目深度解析
 * 涵盖：
 * Code01: 滑动窗口最大值 (LeetCode 239)
 * Code02: 绝对差不超过限制的最长连续子数组 (LeetCode 1438)
 * Code03: 接取落水的最小花盆 (洛谷 P2698 / USACO 2012 Mar Silver)
 */

export const QUEUE_054_PROBLEMS = {
  slidingWindowMax054: {
    title: '滑动窗口最大值 (Class 054 / LeetCode 239)',
    difficulty: 'Hard',
    tag: '单调队列模版 · 双端淘汰',
    badge: '【必备】单调队列-上 Code01',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          给你一个整数数组 <code>nums</code>，有一个大小为 <code>k</code> 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 <code>k</code> 个数字。滑动窗口每次只向右移动一位。
        </p>
        <p style="margin-bottom: 8px;">
          返回 <strong>滑动窗口中的最大值</strong>。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 4px;">
          <strong style="color: #1e40af;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>优胜劣汰准则：</strong>如果后面的数 <code>nums[r]</code> 比前面还在队内的数 <code>nums[t-1]</code> 大或相等，由于 <code>nums[r]</code> 更晚离开窗口且数值更大，前面的数“永远不可能再成为窗口最大值”，必须果断从队尾弹出（<code>t--</code>）！</li>
            <li><strong>队头严格保真：</strong>双端队列中存储的是<strong>数组下标</strong>，队头到队尾对应的数值严格<strong>单调递减</strong>。队头下标 <code>deque[h]</code> 恒为当前窗口最大值；每当窗口右滑导致队头过期（<code>deque[h] == l</code>），队头右移（<code>h++</code>）。</li>
            <li><strong>均摊复杂度 O(N)：</strong>每个元素至多进队一次、出队一次，总操作步数严格为 $O(N)$。</li>
          </ul>
        </div>
      </div>
    `,
  },

  longestSubarrayLimit054: {
    title: '绝对差不超过限制的最长连续子数组 (Class 054 / LeetCode 1438)',
    difficulty: 'Medium',
    tag: '双单调队列协同 · 极差滑动窗口',
    badge: '【必备】单调队列-上 Code02',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          给你一个整数数组 <code>nums</code> ，和一个表示限制的整数 <code>limit</code>。
          请你返回最长连续子数组的长度，该子数组中的任意两个元素之间的绝对差必须小于或者等于 <code>limit</code>。
          如果不存在满足条件的子数组，则返回 0。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #8b5cf6; border-radius: 4px;">
          <strong style="color: #6b21a8;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>任意两数绝对差 ≤ limit $\iff$ $\max(window) - \min(window) \le limit$：</strong>无需两两比较，只要窗口极值之差达标，所有其他数对必然达标！</li>
            <li><strong>双单调队列协同维护：</strong>使用一个递减单调队列 <code>maxDeque</code> 维护当前窗口最大值，使用一个递增单调队列 <code>minDeque</code> 维护当前窗口最小值，均为 $O(1)$ 获知窗口极差。</li>
            <li><strong>双指针贪心扩张：</strong>固定左端点 $l$，右端点 $r$ 尽可能向右扩展，直到加入新数会导致极差超过 limit。此时以 $l$ 开头的最长合法长度为 $r - l$。接着左端点右移一步，双队列弹出过期下标，继续扩张。</li>
          </ul>
        </div>
      </div>
    `,
  },

  fallingWaterFlowerPot054: {
    title: '接取落水的最小花盆 (Class 054 / 洛谷 P2698 / USACO 2012 Mar Silver)',
    difficulty: 'Hard',
    tag: '几何排序 + 双指针 + 双单调队列维护极差',
    badge: '【必备】单调队列-上 Code03',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          给出 $N$ 滴水的坐标 $(x, y)$，$y$ 表示水滴的高度（也是落地所需时间），$x$ 表示下落位置。
          每滴水以每秒 1 个单位的速度下落。你需要把花盆放在 $x$ 轴上的某个位置，花盆宽度为 $W$，即覆盖 $[x, x+W]$。
          要求花盆接到的第一滴水和最后一滴水的时间差至少为 $D$（即 $\max(y) - \min(y) \ge D$）。
          请算出满足条件的<strong>最小花盆宽度 $W$</strong>。若无解返回 -1。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px;">
          <strong style="color: #065f46;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>第一步：按横坐标升序排序：</strong>花盆接水是在 $x$ 轴的一段连续区间 $[x_l, x_r]$。因此先将所有水滴按 $x$ 排序，连续子数组即对应空间上的一段花盆。</li>
            <li><strong>双指针滑窗判定：</strong>花盆宽度为 $x_r - x_l$。固定左边界水滴 $l$，右边界 $r$ 不断右移进入窗口，维护当前接到的水滴的最大高度 $\max(y)$ 与最小高度 $\min(y)$。</li>
            <li><strong>极差满足时紧缩结算：</strong>一旦 $\max(y) - \min(y) \ge D$，说明当前花盆有效！用 $x_{r-1} - x_l$ 更新全局最小宽度；然后尝试右移左指针 $l$ 缩小花盆，直到极差再次小于 $D$。</li>
          </ul>
        </div>
      </div>
    `,
  },
};
