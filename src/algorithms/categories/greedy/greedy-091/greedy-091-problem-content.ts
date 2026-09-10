/**
 * 第 91 课：左神贪心算法专题 3 - 题目描述、原题信息与板书证明解析
 */

export const GREEDY_091_PROBLEMS = {
  shortestUnsortedSubarray: {
    title: '最短无序连续子数组 (Shortest Unsorted Continuous Subarray)',
    leetcode: 'LeetCode 581',
    difficulty: '中等',
    summary: '给你一个整数数组 nums，你需要找出一个连续子数组，如果对这个子数组进行升序排序，那么整个数组都会变为升序排序。找出符合题意的最短子数组长度。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 581. 最短无序连续子数组)</h3>
        <p>给你一个整数数组 <code>nums</code>，你需要找出一个<b>连续子数组</b>。如果对这个子数组进行升序排序，那么整个数组都会变为升序排序。请你找出符合题意的最短子数组，并输出它的长度。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：双向极值扫描</h4>
        <ul>
          <li><b>从左往右扫描</b>：维护历史最大值 <code>max</code>。若当前数 <code>nums[i] &lt; max</code>，说明当前数逆序（比左边最大值还小），必须被包含在待排序区间内，记录最右不达标位置 <code>right = i</code>；否则更新 <code>max = nums[i]</code>。</li>
          <li><b>从右往左扫描</b>：维护历史最小值 <code>min</code>。若当前数 <code>nums[i] &gt; min</code>，说明当前数逆序（比右边最小值还大），必须被包含在待排序区间内，记录最左不达标位置 <code>left = i</code>；否则更新 <code>min = nums[i]</code>。</li>
          <li>若 <code>right == -1</code>，说明数组已升序，返回 0；否则最短长度为 <code>right - left + 1</code>。</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N)$（单次双向线性扫描），空间复杂度 $O(1)$。
        </div>
      </div>
    `,
  },

  smallestRange: {
    title: '最小区间 (Smallest Range Covering Elements from K Lists)',
    leetcode: 'LeetCode 632',
    difficulty: '困难',
    summary: '你有 k 个非递减排列的整数列表。找到一个最小区间 [a, b]，使得 k 个列表中的每个列表至少有一个数包含在其中。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 632. 最小区间)</h3>
        <p>你有 $k$ 个非递减排列的整数列表。找到一个<b>最小区间</b> $[a, b]$，使得 $k$ 个列表中的每个列表至少有一个数被包含在区间内。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：小顶堆维护多路游标 + 动态最大值</h4>
        <ol>
          <li>将每个列表的首个元素 <code>(val, listIdx, elemIdx)</code> 压入<b>小顶堆</b>，并记录当前堆中所有元素的最大值 <code>maxVal</code>；</li>
          <li>每次从堆中弹出最小值 <code>minNode</code>，此时当前候选区间为 <code>[minNode.val, maxVal]</code>，尝试刷新全局最小区间；</li>
          <li>将 <code>minNode</code> 所属列表的下一个元素压入堆中，更新 <code>maxVal</code>；</li>
          <li>若某个列表的元素已经全部耗尽无法继续推进，算法立刻终止并返回当前全局最小区间。</li>
        </ol>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log K)$（$N$ 为所有元素总数），空间复杂度 $O(K)$（堆维护 $K$ 个游标）。
        </div>
      </div>
    `,
  },

  groupBuyTickets: {
    title: '组团买票 (Group Buy Tickets)',
    leetcode: '大厂笔试真题',
    difficulty: '困难',
    summary: '景区有 m 个游玩项目，第 i 个项目参数为 (Ki, Bi)。如果有 x 人买票，单价为 max(Bi - Ki * x, 0)，总花费为 x * (Bi - Ki * x)。单位共有 n 个人，每个人最多选 1 个项目或不选。求需要准备多少钱才能保证应付所有可能的选择组合。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (组团买票 - 边际收益递减贪心)</h3>
        <p>景区有 $m$ 个游玩项目，第 $i$ 个项目的单人门票折扣规则为：当有 $x$ 人选择该项目时，单张票价为 $B_i - K_i \times x$（若为负则为 0），总支出为 $x \times (B_i - K_i \times x)$。</p>
        <p>单位有 $n$ 个人自由选择，求所有可能分配方案中总门票花费的<b>最大可能值</b>（即最保险的准备金额）。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：大顶堆维护边际增益 $\\Delta$</h4>
        <p>若项目 $i$ 已有 $x$ 人，增加第 $x+1$ 个人带来的总费用增量为：</p>
        <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #1d4ed8;">
          \\Delta(x+1) = (x+1)(B_i - K_i(x+1)) - x(B_i - K_i x) = B_i - K_i(2x+1)
        </div>
        <p>由于二次函数具有凹性，增量 $\\Delta(x+1)$ 随着 $x$ 单调递减。使用大顶堆维护所有项目的当前最大边际增量，每次贪心选取 $\\Delta &gt; 0$ 的最大增量加入总额，最多进行 $n$ 次即可得到全局最大总花费！</p>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log M)$，空间复杂度 $O(M)$。
        </div>
      </div>
    `,
  },

  splitMinAvgSum: {
    title: '平均值最小累加和 (Split Minimum Average Sum)',
    leetcode: '大厂笔试真题',
    difficulty: '中等',
    summary: '给定一个长度为 n 的数组 arr 和数字 k，将 arr 划分成 k 个非空子集合，每个集合的平均值向下取整后累加。求所有集合平均值之和的最小值。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (平均值最小累加和)</h3>
        <p>给定长度为 $n$ 的数组 <code>arr</code>，划分成 $k$ 个非空子集合。返回每个集合的平均值（向下取整 $\\lfloor sum / count \\rfloor$）之和的<b>最小值</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：小值独占集合，大值稀释合并</h4>
        <p>将数组按<b>升序排序</b>：</p>
        <ul>
          <li>最小的 $k-1$ 个元素各自独占一个集合，由于大小为 1，每个元素贡献其自身数值；</li>
          <li>剩余的所有较大元素全部并入第 $k$ 个集合，集合大小为 $n - (k - 1)$，其总和被大分母除法极大稀释与向下取整；</li>
          <li>这种分配策略保证了大数值的权重降到最低，数学证明其平均值之和全局最小。</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log N)$（排序），空间复杂度 $O(1)$。
        </div>
      </div>
    `,
  },

  minimalBatteryPower: {
    title: '完成所有任务的最少初始能量 (Minimum Initial Energy to Finish Tasks)',
    leetcode: 'LeetCode 1665',
    difficulty: '困难',
    summary: '每一个任务有两个参数 [actual, minimum]，分别表示耗费能量与启动门槛。返回完成所有任务所需的最少初始能量。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1665. 最少初始能量)</h3>
        <p>每个任务有两个参数：<code>[actual, minimum]</code>，其中 <code>actual</code> 是消耗的能量，<code>minimum</code> 是开始该任务前必须具备的最低门槛能量（$minimum \\ge actual$）。求能够按某种顺序完成所有任务的<b>最少初始能量</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：门槛与消耗差值排序</h4>
        <p>完成任务后剩余的可用“冗余能量”为 $minimum - actual$。若冗余越大，越应当优先执行，以便其剩余能量为后续任务所复用！</p>
        <p><b>贪心规则：</b>按照 <code>(minimum - actual)</code> 从大到小降序排序（即 <code>(b[1] - b[0]) - (a[1] - a[0])</code>），依次模拟累加初始能量即可：<code>ans = max(ans + task.actual, task.minimum)</code>。</p>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log N)$，空间复杂度 $O(1)$。
        </div>
      </div>
    `,
  },

  longestSameZerosOnes: {
    title: '两个 0 和 1 数量相等区间的最大长度 (Longest Same Zeros and Ones Intervals)',
    leetcode: '大厂笔试真题 / 抽屉原理贪心',
    difficulty: '困难',
    summary: '给出一个长度为 n 的 01 串，找到两个不完全重叠的区间，使得这两个区间中 0 和 1 的个数分别相等。求满足要求的区间最大长度。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (两个 0/1 相等区间的最大长度)</h3>
        <p>给出一个长度为 $n$ 的 01 数组，寻找两个<b>不完全重叠</b>的子区间，满足：两个区间包含的 0 的个数相同，且 1 的个数也相同。求区间的<b>最大可能长度</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：抽屉原理与极值边界判定</h4>
        <ul>
          <li>考察长度为 $n-1$ 的区间：整个数组共有且仅有 2 个长度为 $n-1$ 的区间：$[0, n-2]$ 和 $[1, n-1]$；</li>
          <li>这两个区间分别去掉了 $arr[n-1]$ 和 $arr[0]$。如果 $arr[0] == arr[n-1]$，则这两个区间去掉的字符完全一致，所含 0 和 1 的数量必然完全相等！因此最大长度为 $n-1$；</li>
          <li>若 $arr[0] \ne arr[n-1]$，则考察长度为 $n-2$ 的 3 个区间，由抽屉原理必能找到 2 个统计相同的区间，因此最大长度为 $n-2$（需做 $n \le 2$ 的特判）。</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(1)$ 或 $O(N)$，空间复杂度 $O(1)$。
        </div>
      </div>
    `,
  },
};
