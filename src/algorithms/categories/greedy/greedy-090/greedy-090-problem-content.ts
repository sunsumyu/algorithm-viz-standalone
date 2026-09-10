/**
 * 第 90 课：左神贪心算法专题 2 - 题目内容与深度题解 HTML 库
 */

export const GREEDY_090_PROBLEMS = {
  // Code01: 砍竹子 II (剪绳子 II / 整数拆分)
  cuttingBamboo: {
    id: 'cutting-bamboo',
    title: '砍竹子 II (剪绳子 II / 整数拆分)',
    source: 'LeetCode 343 / 剑指 Offer 14-II',
    difficulty: 'Medium',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">🎋 砍竹子 II (LeetCode 343 / 剑指 Offer 14-II)</h3>
        <p>现需要将一根长为正整数 <code>bamboo_len</code> 的竹子砍为若干段（每段长度均为正整数且段数 $\ge 2$）。请返回每段竹子长度的<b>最大乘积</b>是多少？答案需要对 $1000000007$ ($10^9+7$) 取模。</p>
        
        <h4 style="color: #0f172a; margin-bottom: 6px;">🎯 核心贪心策略：尽力拆 3</h4>
        <ul>
          <li>若余数为 <code>0</code>：直接返回 $3^m \pmod{10^9+7}$；</li>
          <li>若余数为 <code>2</code>：最后一段为 2，返回 $3^m \times 2 \pmod{10^9+7}$；</li>
          <li>若余数为 <code>1</code>：若留 1 则毫无增益，应借出一个 3 组成 $2 \times 2 = 4 > 3 \times 1$，返回 $3^{m-1} \times 4 \pmod{10^9+7}$。</li>
        </ul>
      </div>
    `,
  },

  // Code02: 分成 k 份的最大乘积
  maximumProductKParts: {
    id: 'maximum-product-k-parts',
    title: '分成 k 份的最大乘积',
    source: '大厂真实笔试真题',
    difficulty: 'Medium',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📦 分成 k 份的最大乘积 (大厂真实笔试)</h3>
        <p>一个正整数 <code>n</code> 必须精确分成 <code>k</code> 份正整数，使得这 <code>k</code> 个正整数的<b>乘积尽量大</b>。数字 <code>n</code> 和 <code>k</code> 规模可达 $10^{12}$，结果对 $1000000007$ 取模。</p>
        
        <h4 style="color: #0f172a; margin-bottom: 6px;">🎯 核心贪心策略：均分定理</h4>
        <p>由基本不等式可知：和为定值时，各数越接近，乘积越大。极差不能超过 1：</p>
        <ul>
          <li>基础份额：$a = \lfloor n / k \rfloor$</li>
          <li>余数多出的 1：$b = n \pmod k$</li>
          <li>结果：由 $b$ 个 $(a+1)$ 和 $(k-b)$ 个 $a$ 构成最优划分，乘积为 $(a+1)^b \times a^{k-b} \pmod{10^9+7}$。</li>
        </ul>
      </div>
    `,
  },

  // Code03: 会议独占时间段的最大会议数量
  meetingMonopoly: {
    id: 'meeting-monopoly',
    title: '会议独占时间段的最大会议数量',
    source: 'LeetCode 435 / 洛谷 P1803',
    difficulty: 'Medium',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📅 会议独占时间段的最大会议数量 (LeetCode 435 / 洛谷 P1803)</h3>
        <p>给定若干会议的 <code>[start, end]</code> 时间。你在参加某个会议期间，<b>不能同时参加其他会议</b>。请返回你能参加的最大不冲突会议数量。</p>
        
        <h4 style="color: #0f172a; margin-bottom: 6px;">🎯 核心贪心策略：优先选最早结束者</h4>
        <ul>
          <li><b>标准解法 ($O(N \log N)$)</b>：按会议结束时间升序排序，每次挑选不与上一会议冲突且结束最早的会议，为未来留出最充裕的可用时间。</li>
          <li><b>洛谷 P1803 数组桶优化 ($O(N)$)</b>：若时间范围有限，可用 <code>latest[end]</code> 记录在 <code>end</code> 结束的会议中最晚开始的时间，无需排序即可在线性时间内推演！</li>
        </ul>
      </div>
    `,
  },

  // Code04: 会议只占一天的最大会议数量
  meetingOneDay: {
    id: 'meeting-one-day',
    title: '最多可以参加的会议数目',
    source: 'LeetCode 1353',
    difficulty: 'Medium / Hard',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">🗓️ 最多可以参加的会议数目 (LeetCode 1353)</h3>
        <p>每个会议持续时间为 <code>[startDay, endDay]</code>。你只需要抽出其中的<b>任意 1 天</b>参加即可。但每天只能参加 1 场会议。返回最多能参加的会议数量。</p>
        
        <h4 style="color: #0f172a; margin-bottom: 6px;">🎯 核心贪心策略：时间推进 + 小根堆截止筛选</h4>
        <ul>
          <li>按天推进时间指针 <code>day</code>；</li>
          <li>每天将所有 <code>start == day</code> 的会议结束时间加入小根堆；</li>
          <li>移除堆中已经过期的会议（<code>end < day</code>）；</li>
          <li>贪心参加<b>堆顶结束时间最早</b>的一场会议并移出堆；</li>
          <li>若堆为空，可直接将 <code>day</code> 快速跳跃至下一个会议的开始日。</li>
        </ul>
      </div>
    `,
  },

  // Code05: IPO 项目最大化资本
  ipo: {
    id: 'ipo',
    title: 'IPO 项目最大化资本',
    source: 'LeetCode 502',
    difficulty: 'Hard',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💰 IPO 项目最大化资本 (LeetCode 502)</h3>
        <p>现有 $N$ 个项目，项目 $i$ 启动需要资本 $capital[i]$，完成后产生净利润 $profits[i]$。初始资本为 $w$。你最多只能选择 $k$ 个不同项目，求最终资本的最大值。</p>
        
        <h4 style="color: #0f172a; margin-bottom: 6px;">🎯 核心贪心策略：双堆协同</h4>
        <ul>
          <li><b>门槛小根堆</b>：存放尚未解锁的项目（按 $capital$ 升序）；</li>
          <li><b>利润大根堆</b>：存放当前本金足以启动的项目（按 $profit$ 降序）；</li>
          <li>每轮将所有 $capital \le w$ 的项目从小根堆转移到大根堆；</li>
          <li>从大根堆弹出净利润最大的项目落地，$w \leftarrow w + profit$；重复 $k$ 次。</li>
        </ul>
      </div>
    `,
  },

  // Code06: 加入差值绝对值直到长度固定
  absoluteValueAddToArray: {
    id: 'absolute-value-add-to-array',
    title: '加入差值绝对值直到长度固定',
    source: '大厂真实笔试真题 / 欧几里得 GCD',
    difficulty: 'Medium / 数论贪心',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">🔢 加入差值绝对值直到长度固定 (大厂真实笔试)</h3>
        <p>给定非负数组 <code>arr</code>。任选两个数计算其差值的绝对值 $|a - b|$，若数组中不存在则加入（只加一份）。重复此过程直到数组大小固定，返回最终数组长度。</p>
        
        <h4 style="color: #0f172a; margin-bottom: 6px;">🎯 核心数论贪心：欧几里得辗转相除闭包</h4>
        <ul>
          <li>任何数经过不断差值运算，必然收敛到全体非零数的<b>最大公约数 $g = \gcd(arr)$</b>；</li>
          <li>因此最终数组必然包含 $g$ 的所有倍数：$g, 2g, 3g, \dots, \max(arr)$，共计 $\max(arr) / g$ 个正整数；</li>
          <li>最后判断 $0$ 是否存在：如果初始数组包含 $0$，或者初始存在至少一对相同数使得差值为 $0$，则结果还要 $+1$。</li>
        </ul>
      </div>
    `,
  },
};
