/**
 * 第 92 课：左神贪心算法专题 4 - 题目描述、原题信息与板书证明解析
 */

export const GREEDY_092_PROBLEMS = {
  minimizeDeviation: {
    title: '数组的最小偏移量 (Minimize Deviation in Array)',
    leetcode: 'LeetCode 1675',
    difficulty: '困难',
    summary: '你可以对数组中奇数乘2（只能乘一次），对偶数除以2（可以除多次）。数组偏移量定义为数组中任意两个元素的最大差值。求数组能达到的最小偏移量。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1675. 数组的最小偏移量)</h3>
        <p>给你一个由 $n$ 个正整数组成的数组 <code>nums</code>。你可以对数组中的任意元素执行以下操作：</p>
        <ul>
          <li>如果元素是<b>奇数</b>，乘以 2（乘完变偶数后不能再乘）；</li>
          <li>如果元素是<b>偶数</b>，除以 2（可以多次除以 2 直到变为奇数）。</li>
        </ul>
        <p>数组的<b>偏移量</b>是数组中任意两个元素之间的<b>最大差值</b>。返回数组可以达到的<b>最小偏移量</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：奇数翻倍归一化 + 大顶堆贪心除2</h4>
        <ol>
          <li><b>单向化单调处理</b>：先把数组中所有的奇数全部乘以 2，使得所有数字达到其能够达到的<b>最大上限</b>，此时所有数字只能执行“除以 2”缩减操作，消除双向操作的混乱；</li>
          <li><b>大顶堆维护当前最大值</b>，同时记录当前所有元素中的全局最小值 <code>minVal</code>；</li>
          <li>每次从堆中弹出当前最大值 <code>cur = maxHeap.poll()</code>，用 <code>cur - minVal</code> 刷新最小偏移量；</li>
          <li>若 <code>cur</code> 是偶数，则将其除以 2 变成 <code>cur / 2</code>，更新 <code>minVal = min(minVal, cur / 2)</code> 并重新压入堆中；若 <code>cur</code> 是奇数，说明最大值已无法再缩小，贪心收敛终止！</li>
        </ol>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log M \log N)$（$M$ 为数字最大值），空间复杂度 $O(N)$。
        </div>
      </div>
    `,
  },

  rabbitsInForest: {
    title: '森林中的兔子 (Rabbits in Forest)',
    leetcode: 'LeetCode 781',
    difficulty: '中等',
    summary: '森林中有未知数量的兔子。部分兔子回答了“还有多少只兔子和自己颜色相同”。求森林中兔子的最少可能数量。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 781. 森林中的兔子)</h3>
        <p>森林中有未知数量的兔子。提问其中若干只兔子“还有多少只兔子和自己颜色相同”，兔子回答的数组为 <code>answers</code>。返回森林中兔子的<b>最少可能数量</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：相同回答尽可能归入同一颜色组</h4>
        <p>若某只兔子回答 $x$，说明该颜色的兔子总共有 $x + 1$ 只：</p>
        <ul>
          <li>统计回答 $x$ 的兔子出现频次 $cnt$；</li>
          <li>每个颜色组最多容纳 $x + 1$ 只回答 $x$ 的兔子，为了使总数最少，应贪心地将回答 $x$ 的兔子塞满每一个组；</li>
          <li>需要的最少颜色组数为 $\\lceil cnt / (x + 1) \\rceil = \\lfloor \\frac{cnt + x}{x + 1} \\rfloor$；</li>
          <li>该回答对应的最少兔子数为 $\\lceil cnt / (x + 1) \\rceil \\times (x + 1)$。</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N)$，空间复杂度 $O(N)$。
        </div>
      </div>
    `,
  },

  minOperationsSimilar: {
    title: '使数组相似的最少操作次数 (Minimum Operations to Make Similar)',
    leetcode: 'LeetCode 2449',
    difficulty: '困难',
    summary: '每次操作选两个数，一个加2，另一个减2。求使 nums 重新排列后与 target 相同的最少操作次数。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 2449. 使数组相似的最少操作次数)</h3>
        <p>给你两个正整数数组 <code>nums</code> 和 <code>target</code>。每次操作你可以选择两个下标 $i, j$，将 <code>nums[i] += 2</code> 且 <code>nums[j] -= 2</code>。求使 <code>nums</code> 与 <code>target</code> 相似（元素及频次完全一致）的<b>最少操作次数</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：奇偶分类独立排序 + 顺位对齐</h4>
        <ul>
          <li>因为每次只能 $+2$ 或 $-2$，数字的<b>奇偶性永远不变</b>，奇数只能变成奇数，偶数只能变成偶数；</li>
          <li>将 <code>nums</code> 与 <code>target</code> 各自分离为奇数数组和偶数数组，并分别进行<b>升序排序</b>；</li>
          <li>由排序不等式与邻项对齐贪心，最优方案必然是对应排位一一配对；</li>
          <li>累加所有 <code>nums[i] &gt; target[i]</code> 的正差值之和，由于一次操作可同时消化 1 个 $+2$ 与 1 个 $-2$，因此最少操作次数为 $\\sum \\max(0, nums[i] - target[i]) / 2$。</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log N)$（排序），空间复杂度 $O(N)$。
        </div>
      </div>
    `,
  },

  quizScore: {
    title: '知识竞赛得分最大化 (Quiz Score Maximization)',
    leetcode: '大厂笔试真题',
    difficulty: '中等',
    summary: '有 n 道题目，每道题选 A 策略得 a[i] 分，选 B 策略得 b[i] 分。要求恰好选择 k 道题使用 A 策略，其余 n-k 道题使用 B 策略。求最大总得分。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (知识竞赛得分最大化)</h3>
        <p>有 $n$ 道题目，每道题选 A 策略得 $a_i$ 分，选 B 策略得 $b_i$ 分。必须恰好有 $k$ 道题目选 A 策略，其余 $n-k$ 道题选 B 策略。求总得分的<b>最大值</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：基础分全选 B + 差值贡献最大化</h4>
        <p>假设先把所有题目<b>全选 B 策略</b>，获得基准分 $\\sum b_i$。如果将第 $i$ 题改为选 A 策略，总得分的增量为：</p>
        <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #1d4ed8;">
          \\Delta_i = a_i - b_i
        </div>
        <p>按 $\\Delta_i$ 从大到小降序排序，贪心选取前 $k$ 个增量最大的题目改为 A 策略即可！</p>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log N)$，空间复杂度 $O(N)$。
        </div>
      </div>
    `,
  },

  divideArraySeq: {
    title: '将数组分成几个递增序列 (Divide Array into Increasing Sequences)',
    leetcode: 'LeetCode 1121',
    difficulty: '困难',
    summary: '给定一个非递减正整数数组 nums 和整数 k，判断能否将 nums 分成一个或多个长度至少为 k 的不相交严格递增子序列。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1121. 将数组分成几个递增序列)</h3>
        <p>给定一个<b>非递减</b>正整数数组 <code>nums</code> 和一个整数 $k$。判断是否能将该数组划分为若干个不相交子序列，满足：</p>
        <ol>
          <li>每个子序列都必须是<b>严格递增</b>的；</li>
          <li>每个子序列的长度至少为 $k$。</li>
        </ol>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：最高众数瓶颈判定</h4>
        <p>由于子序列必须<b>严格递增</b>，相同的数字绝对不能出现在同一个子序列中：</p>
        <ul>
          <li>统计数组中出现频次最高的值，其频次为 $maxFreq$；</li>
          <li>由于这 $maxFreq$ 个相同数字必须分配到互不相同的子序列中，因此<b>至少必须划分出 $maxFreq$ 个子序列</b>；</li>
          <li>每个子序列长度至少为 $k$，因此总元素个数至少需要 $maxFreq \\times k$；</li>
          <li>由于数组已非递减排列，只要总长度 $nums.length \\ge maxFreq \\times k$，必能通过轮流分发（轮询贪心）构造出合法划分！</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N)$，空间复杂度 $O(1)$。
        </div>
      </div>
    `,
  },

  minRefuelingStops: {
    title: '最低加油次数 (Minimum Number of Refueling Stops)',
    leetcode: 'LeetCode 871',
    difficulty: '困难',
    summary: '汽车从起点出发前往目标位置 target，初始油量 startFuel。沿途有若干加油站 [position, fuel]。求到达目标所需的最少加油次数，若无法到达返回 -1。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 871. 最低加油次数)</h3>
        <p>汽车从位置 0 出发驶向目的地 <code>target</code>，初始油量为 <code>startFuel</code>。每行驶 1 单位距离消耗 1 升汽油。沿途分布着加油站 <code>stations[i] = [position_i, fuel_i]</code>。求抵达目的地所需的<b>最少加油次数</b>，无法到达则返回 -1。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：行进探测 + 大顶堆后悔加油</h4>
        <ol>
          <li><b>“能不加就不加，没油了加最大的”</b>：汽车一路向前行驶，经过加油站时不立即加油，而是将该加油站的汽油量 <code>fuel</code> 存入<b>大顶堆</b>（备用油桶）；</li>
          <li>当油量不足以支撑开到下一个加油站（或终点 <code>target</code>）时，从大顶堆中贪心取出油量最大的油桶加进去（后悔式加油），加油次数 $+1$；</li>
          <li>若大顶堆已空仍然无法抵达下一目标，说明无论如何也到不了，直接返回 -1。</li>
        </ol>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log N)$，空间复杂度 $O(N)$。
        </div>
      </div>
    `,
  },
};
