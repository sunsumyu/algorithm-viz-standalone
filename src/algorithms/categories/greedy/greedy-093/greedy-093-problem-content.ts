/**
 * 第 93 课：左神贪心算法专题 5 - 题目描述、原题信息与板书证明解析
 */

export const GREEDY_093_PROBLEMS = {
  jumpGameII: {
    title: '跳跃游戏 II (Jump Game II)',
    leetcode: 'LeetCode 45',
    difficulty: '中等',
    summary: '给你一个非负整数数组 nums，最初位于数组的第一个位置。每个元素代表你在该位置可以跳跃的最大长度。求到达最后一个位置的最少跳跃次数。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 45. 跳跃游戏 II)</h3>
        <p>给定一个长度为 $n$ 的 0 索引整数数组 <code>nums</code>。初始位置为 <code>nums[0]</code>。每个元素 <code>nums[i]</code> 表示从索引 $i$ 向前跳转的最大长度。返回到达 <code>nums[n - 1]</code> 的<b>最小跳跃次数</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：右边界分段推进</h4>
        <ul>
          <li>维护两个边界指针：当前这一步跳跃能达到的最远右边界 <code>curEnd</code>，以及在当前步范围内探索到的下一步最远可达位置 <code>nextReach</code>；</li>
          <li>遍历数组（直到 $n-2$），在每个位置 $i$ 动态更新下一步探测最远边界 <code>nextReach = max(nextReach, i + nums[i])</code>；</li>
          <li>当遍历索引到达当前边界 <code>i == curEnd</code> 时，说明必须再跳一步才能继续向前，此时 <code>step++</code>，并将当前边界推进为 <code>curEnd = nextReach</code>。</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N)$（单次线性扫描），空间复杂度 $O(1)$。
        </div>
      </div>
    `,
  },

  minTaps: {
    title: '灌溉花园的最少水龙头数目 (Minimum Number of Taps to Water a Garden)',
    leetcode: 'LeetCode 1326',
    difficulty: '困难',
    summary: '在[0, n]的一维花园中，分布着n+1个水龙头，第i个水龙头的覆盖半径为ranges[i]。求打开最少多少个水龙头可以灌溉整个花园[0, n]。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1326. 灌溉花园的最少水龙头数目)</h3>
        <p>在 $[0, n]$ 的花园中，第 $i$ 个水龙头的位置为 $i$，其灌溉范围为 $[i - ranges[i], i + ranges[i]]$。求能覆盖整个区间 $[0, n]$ 所需的<b>最少水龙头数</b>，若无法完全灌溉返回 -1。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：区间转换 + 跳跃游戏模型</h4>
        <ol>
          <li><b>区间预处理</b>：将每个水龙头转换为左端点 $l = \max(0, i - ranges[i])$，右端点 $r = \min(n, i + ranges[i])$。用数组 <code>rightReach[l]</code> 记录从位置 $l$ 出发能到达的最远右端点；</li>
          <li><b>转化为跳跃游戏 II</b>：从位置 0 开始，维护当前跳跃边界 <code>curEnd</code> 与下一步最远覆盖 <code>nextReach</code>；</li>
          <li>如果遍历过程中 <code>i == curEnd</code> 时发现 <code>nextReach &le; i</code>，说明区间断裂无法继续延伸，返回 -1；否则 <code>step++</code>，更新 <code>curEnd = nextReach</code>。</li>
        </ol>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N)$，空间复杂度 $O(N)$。
        </div>
      </div>
    `,
  },

  stringTransforms: {
    title: '转化字符串的最少操作次数 (String Transforms Into Another String)',
    leetcode: 'LeetCode 1153',
    difficulty: '困难',
    summary: '给出长度相同的两个字符串 str1 和 str2。每次可以选择 str1 中所有的某个字符同时转换为另一个字符。判断能否将 str1 转化为 str2。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1153. 转化字符串)</h3>
        <p>给出两个长度相同的字符串 <code>str1</code> 和 <code>str2</code>。每次操作可以选择 <code>str1</code> 中所有的某个字符将其全部替换为另一个小写字母。判断是否可以通过任意次操作将 <code>str1</code> 转化为 <code>str2</code>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：有向图映射与 26 字符满射死锁判定</h4>
        <ul>
          <li><b>一对多冲突检测</b>：如果 <code>str1[i] == str1[j]</code> 但 <code>str2[i] \ne str2[j]</code>，由于相同字符必须同时改变，必然无法一对多转换，直接返回 false；</li>
          <li><b>字符集满射死锁</b>：若 <code>str2</code> 包含了全部 26 个小写英文字母（满射），且 <code>str1 != str2</code>，此时有向图中必然存在环，且没有任何一个空闲的“中间临时字符”来作为桥梁打破循环依赖，必定陷入死锁无法转换，返回 false；</li>
          <li>只要 <code>str2</code> 中不同字符数 $&lt; 26$ 且无一对多冲突，必定存在至少一个空闲字符作为中转破环，返回 true。</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N)$，空间复杂度 $O(1)$（26个字母映射表）。
        </div>
      </div>
    `,
  },

  crossRiver: {
    title: '过河问题 (Cross River - 经典 POJ 1700)',
    leetcode: 'POJ 1700 / 经典贪心',
    difficulty: '中等',
    summary: '有 n 个人在夜间过河，只有一条小船，每次最多容纳 2 人，过河需要手电筒且只有 1 个。每对人过河的时间取决于较慢者的耗时。求所有人都过河的最短时间。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (POJ 1700. 经典过河问题)</h3>
        <p>有 $n$ 个人在夜间想要过河，只有一艘小船（最多坐 2 人）和一个手电筒。两人同舟过河的时间等于较慢者的耗时，每次船返回必须由一人划回手电筒。求将所有人送达对岸的<b>最短总时间</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：最慢两人双策略比对消解</h4>
        <p>将所有人按过河时间<b>升序排序</b> $T[0] \le T[1] \le \dots \le T[n-1]$。要将最慢的两个人 $T[n-1]$ 与 $T[n-2]$ 运送到对岸，有两种经典策略：</p>
        <ul>
          <li><b>策略 1（最快者当船夫）</b>：最快者 $T[0]$ 护送最慢者 $T[n-1]$，划回；再护送 $T[n-2]$，划回。总耗时为 $T[n-1] + T[n-2] + 2 \times T[0]$；</li>
          <li><b>策略 2（双快护航，慢者同行）</b>：最快的两人 $T[0], T[1]$ 先过去，$T[0]$ 送回手电筒；最慢的两人 $T[n-1], T[n-2]$ 一起过去，$T[1]$ 送回手电筒。总耗时为 $T[1] + T[0] + T[n-1] + T[1] = T[n-1] + 2 \times T[1] + T[0]$。</li>
        </ul>
        <p>每次贪心选择 $\min(\text{策略1}, \text{策略2})$ 即可运送最慢两人，规模递归缩减 $n \to n - 2$！</p>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log N)$（排序），空间复杂度 $O(1)$。
        </div>
      </div>
    `,
  },

  superWashingMachines: {
    title: '超级洗衣机 (Super Washing Machines)',
    leetcode: 'LeetCode 517',
    difficulty: '困难',
    summary: '有 n 台洗衣机排成一行，每台洗衣机有若干件衣服。每步可以选择任意台洗衣机向相邻的一台转移一件衣服。求使所有洗衣机衣服数量相等的最少移动步数。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 517. 超级洗衣机)</h3>
        <p>有 $n$ 台超级洗衣机排成一排，每台洗衣机内有 <code>machines[i]</code> 件衣服。每一步中，你可以同时选择任意台洗衣机，并将它们中的一件衣服传递给相邻的一台洗衣机。求使所有洗衣机中衣服数量相等的<b>最少操作步数</b>，若无法平均分配返回 -1。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：左右子区间净流量与单机流出瓶颈</h4>
        <p>若总衣服数不能被 $n$ 整除，直接返回 -1。设最终每台目标衣服数为 $avg$。对于第 $i$ 台洗衣机：</p>
        <ul>
          <li><b>左侧净需求</b>：$leftNeed = i \times avg - leftSum$（正数代表需要从右侧向左注入衣服，负数代表左侧向右输出）；</li>
          <li><b>右侧净需求</b>：$rightNeed = (n - 1 - i) \times avg - (totalSum - leftSum - machines[i])$；</li>
          <li><b>单机流出瓶颈</b>：若 $leftNeed &gt; 0$ 且 $rightNeed &gt; 0$，说明第 $i$ 台洗衣机必须同时向左和向右输出衣服，由于它每步只能输出 1 件，单机耗时至少为 $leftNeed + rightNeed$；</li>
          <li><b>区间流通瓶颈</b>：其他情况下，只需要承受跨越该分界线的最大单向净流量 $\max(|leftNeed|, |rightNeed|)$；</li>
          <li>全局最少步数为所有位置瓶颈的最大值 $\max_i (\text{bottleneck}_i)$！</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N)$（单次前缀和扫描），空间复杂度 $O(1)$。
        </div>
      </div>
    `,
  },
};
