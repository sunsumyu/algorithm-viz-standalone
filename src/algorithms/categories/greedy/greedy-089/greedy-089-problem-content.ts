/**
 * 第 89 课：左神贪心算法专题 1 - 题目描述、原题信息与板书证明内容
 */

export const GREEDY_089_PROBLEMS = {
  largestNumber: {
    title: '最大数 (Largest Number)',
    leetcode: 'LeetCode 179',
    difficulty: '中等',
    summary: '给定一组非负整数 nums，重新排列每个数的顺序使之组成一个最大的整数。输出结果可能很大，需返回字符串表示。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 179. 最大数)</h3>
        <p>给定一组非负整数 <code>nums</code>，重新排列每个数的顺序（每个数不可拆分）使之组成一个最大的整数。</p>
        <p><b>注意：</b>输出结果可能非常大，所以你需要返回一个字符串而不是整数。若拼接结果全是 0，只需返回 <code>"0"</code>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：自定义拼接字典序</h4>
        <p>对于任意两个数字字符串 $a$ 和 $b$：</p>
        <ul>
          <li>若 <code>b + a &gt; a + b</code>，则 $b$ 应当排在 $a$ 的前面；</li>
          <li>若 <code>a + b &gt; b + a</code>，则 $a$ 应当排在 $b$ 的前面。</li>
        </ul>

        <h4 style="color: #0f172a; margin-bottom: 6px;">⚖️ 数学证明：传递性与邻项交换法 (Exchange Argument)</h4>
        <p>假设最优序列中存在相邻项 $x, y$ 使得 $x + y &lt; y + x$（即逆序对）。若将它们交换，由于其他部分相对位置完全不变，$x$ 和 $y$ 占据的总高位权重不变，交换后拼接值严格增加，这与“最优”假设矛盾！因此按拼接比较规则排序必能收敛至全局最大数。</p>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log N \cdot K)$（$K$ 为字符串平均长度），空间复杂度 $O(N)$。
        </div>
      </div>
    `,
  },

  twoCityScheduling: {
    title: '两地调度 (Two City Scheduling)',
    leetcode: 'LeetCode 1029',
    difficulty: '中等',
    summary: '公司计划面试 2N 个人，去 A 市的费用为 costs[i][0]，去 B 市的费用为 costs[i][1]。求安排恰好 N 个人去 A 市，N 个人去 B 市的最低总费用。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1029. 两地调度)</h3>
        <p>公司计划面试 $2N$ 个人。给定一个数组 <code>costs</code>，其中 <code>costs[i] = [aCost_i, bCost_i]</code> 表示第 $i$ 人飞往 A 市的费用为 $aCost_i$，飞往 B 市的费用为 $bCost_i$。</p>
        <p>返回将每个人都飞到某座城市的最低总费用，要求每个城市刚好有 $N$ 人抵达。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：差额排序贪心</h4>
        <p>假设先把所有 $2N$ 个人<b>全部派往 A 市</b>，此时总开销为 $\\sum aCost_i$。如果我们将第 $i$ 个人改派去 B 市，总费用的增量变化为：</p>
        <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #1d4ed8;">
          \\Delta_i = bCost_i - aCost_i
        </div>
        <p>为了让总费用最低，改派带来的增量 $\\Delta_i$ 必须尽可能小（甚至为负收益大），因此我们按照 $\\Delta_i$ 升序排序，挑选增量最小的前 $N$ 个人改派去 B 市即可！</p>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log N)$（排序），空间复杂度 $O(1)$ 或 $O(N)$。
        </div>
      </div>
    `,
  },

  minimumEatOranges: {
    title: '吃掉 N 个橘子的最少天数 (Minimum Days to Eat N Oranges)',
    leetcode: 'LeetCode 1553',
    difficulty: '困难',
    summary: '每天有3种吃橘子方式：吃1个；若N能被2整除吃掉N/2；若N能被3整除吃掉2*(N/3)。求吃掉所有橘子的最少天数。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1553. 吃掉 N 个橘子的最少天数)</h3>
        <p>厨房里总共有 $N$ 个橘子，每天你可以选择以下三种方式之一吃橘子：</p>
        <ol>
          <li>吃掉 1 个橘子；</li>
          <li>如果剩余橘子数 $n$ 能被 2 整除，吃掉 $n/2$ 个橘子（剩 $n/2$ 个）；</li>
          <li>如果剩余橘子数 $n$ 能被 3 整除，吃掉 $2 \\times (n/3)$ 个橘子（剩 $n/3$ 个）。</li>
        </ol>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：跨步除法与绝不连续-1</h4>
        <p>普通动态规划会因 $N \\le 2 \\times 10^9$ 超出内存与时间限制。左神证明关键贪心不变性：</p>
        <ul>
          <li>连续吃 1 个橘子的唯一目的，是为了将数量调整为 2 或 3 的倍数以便使用整除飞跃！</li>
          <li>达到 2 的倍数需花费 <code>(n % 2)</code> 天吃 1 个，加 1 天除以 2，转入子问题 <code>f(n / 2)</code>；</li>
          <li>达到 3 的倍数需花费 <code>(n % 3)</code> 天吃 1 个，加 1 天除以 3，转入子问题 <code>f(n / 3)</code>。</li>
        </ul>
        <p>转移方程：<code>f(n) = 1 + min(n % 2 + f(n / 2), n % 3 + f(n / 3))</code>，配合哈希记忆化剪枝，递归树节点数仅 $O((\\log N)^2)$！</p>
      </div>
    `,
  },

  meetingRoomsII: {
    title: '会议室 II (Meeting Rooms II)',
    leetcode: 'LeetCode 253 / LintCode 919',
    difficulty: '中等',
    summary: '给你一个会议时间安排的数组 intervals，每个会议都有开始和结束时间。求最少需要多少间会议室才能满足所有会议需求。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 253. 会议室 II)</h3>
        <p>给定一个会议时间区间的数组 <code>intervals</code>，每个区间 <code>intervals[i] = [start_i, end_i]</code>，表示第 $i$ 场会议的开始与结束时间。求所需会议室的<b>最小数量</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：排序 + 小根堆维护最早结束时间</h4>
        <ol>
          <li><b>会议按开始时间升序排序</b>：依次安排各个会议；</li>
          <li><b>小根堆维护正在进行中各会议室的结束时间</b>：堆顶即为当前最早空出来的会议室；</li>
          <li>对于当前会议 <code>[start, end]</code>：
            <ul>
              <li>若 <code>start &gt;= heap.peek()</code>：堆顶会议已结束，该会议室可被<b>复用</b>，弹出旧结束时间，将当前会议的 <code>end</code> 压入；</li>
              <li>若 <code>start &lt; heap.peek()</code>：连最早结束的会议室都没腾出来，必须<b>增开一间新会议室</b>，将 <code>end</code> 压入堆。</li>
            </ul>
          </li>
        </ol>
        <p>最终小根堆中的元素数量即为峰值同时占用的会议室数，即最少所需会议室！</p>
      </div>
    `,
  },

  courseScheduleIII: {
    title: '课程表 III (Course Schedule III)',
    leetcode: 'LeetCode 630',
    difficulty: '困难',
    summary: '有 n 门课程，courses[i] = [duration_i, lastDay_i]。修读必须连续且在 lastDay_i 当天或之前完成。求最多能修多少门课程。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 630. 课程表 III)</h3>
        <p>有 $n$ 门不同的在线课程，按从 $1$ 到 $n$ 编号。给你一个数组 <code>courses</code>，其中 <code>courses[i] = [duration_i, lastDay_i]</code> 表示第 $i$ 门课程将持续修读 <code>duration_i</code> 天，且必须在 <code>lastDay_i</code> 当天或之前完成。</p>
        <p>你从第 1 天开始，不能同时修读两门或更多课程。求<b>最多可以修读</b>多少门课程。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：反悔贪心 (Regret Greedy) 与大根堆</h4>
        <ol>
          <li><b>按截止时间 lastDay 升序排序</b>：越早截止的课程越早考察；</li>
          <li><b>维护已选课程时长的大根堆与当前累加总时间 time</b>：
            <ul>
              <li>若 <code>time + duration &lt;= lastDay</code>：可以直接选修，<code>time += duration</code>，入堆；</li>
              <li>若 <code>time + duration &gt; lastDay</code>：发生超时！但如果当前课程的 <code>duration</code> 小于已选集合中最耗时的课程（大根堆堆顶 <code>heap.peek()</code>），我们可以<b>果断反悔</b>：剔除堆顶的最长课程，换入当前更短的课程！</li>
            </ul>
          </li>
        </ol>
        <p><b>反悔证明：</b>用短课置换长课，已修课程总门数不变，但总累计时间 <code>time</code> 净减少了，为后续课程留出了更大的安全裕度，绝不劣于原选择！</p>
      </div>
    `,
  },

  minimumCostConnectSticks: {
    title: '连接棒材的最低费用 (Minimum Cost to Connect Sticks)',
    leetcode: 'LeetCode 1167 / 洛谷 P1090 合并果子',
    difficulty: '中等',
    summary: '你有若干根长度各异的木棒。每次连接任意两根木棒 x 和 y 的费用为 x + y，连接后合并成一根新棒。求将所有木棒连成一根的最低总费用。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1167 / 洛谷 P1090 合并果子)</h3>
        <p>你有若干根长度各异的木棒，记录在数组 <code>sticks</code> 中。每次你可以连接任意两根长度为 $x$ 和 $y$ 的木棒，所需支付的费用是 $x + y$。连接后，这两根木棒会融合成一根长度为 $x + y$ 的新木棒。</p>
        <p>请返回将所有木棒连接成一根所需的<b>最低总费用</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：小根堆与经典哈夫曼编码 (Huffman Tree)</h4>
        <p>设合并后的二叉树中，第 $i$ 根初始木棒在树中的深度为 $d_i$，则它对总费用的贡献为 $sticks[i] \\times d_i$。总费用为：</p>
        <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #1d4ed8;">
          Total Cost = \\sum (sticks[i] \\times d_i)
        </div>
        <p>为了让乘积和最小，<b>越长的木棒必须处于越浅的层（$d_i$ 越小），越短的木棒必须处于越深的层（$d_i$ 越大）</b>。</p>
        <p>贪心执行法：将所有长度入小根堆，每次弹出当前全局最小的两个数 $a, b$，合并花费 $a + b$，将新长度 $a + b$ 重新压入堆，重复直至只剩一根木棒！</p>
      </div>
    `,
  },
};
