/**
 * 左程云算法通关课 Class 063: 双向广搜与双向搜索（折半搜索 Meet in the Middle）
 * 包含题目讲义、解题思路与四语言代码
 * 
 * 1. 单词接龙 (LeetCode 127 · Word Ladder) - 双向广搜经典
 * 2. 牛牛的背包问题 / 世界冰球锦标赛 (洛谷 P4799 · Buy Tickets / Snacks) - 折半搜索基石
 * 3. 最接近目标值的子序列和 (LeetCode 1755 · Closest Subsequence Sum) - 折半搜索 + 双指针
 * 4. 分割数组使数组差最小 (LeetCode 2035 · Partition Array to Minimize Difference) - 折半搜索 + 计数分组 + 二分
 */

export interface ProblemInfo063 {
  title: string;
  source: string;
  difficulty: '简单' | '中等' | '困难';
  summary: string;
  problemHtml: string;
  complexityHtml: string;
}

export const GRAPH_063_PROBLEMS: Record<string, ProblemInfo063> = {
  'word-ladder-063': {
    title: '单词接龙 (Word Ladder)',
    source: 'LeetCode 127 / 左程云 Class 063 Code01',
    difficulty: '困难',
    summary: '双端波前交替扩展，每次选取规模较小的集合向对向扩散，将搜索空间从 b^d 降低到 2*b^(d/2)。',
    problemHtml: `
      <div style="font-family: inherit; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">📜 题目描述</h4>
        <p>字典 <code>wordList</code> 中从单词 <code>beginWord</code> 到 <code>endWord</code> 的转换序列是一个相邻单词仅相差一个字母的序列：</p>
        <p style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-family: monospace;">
          beginWord -> s1 -> s2 -> ... -> sk (其中 sk == endWord)
        </p>
        <p>给你两个单词 <code>beginWord</code> 和 <code>endWord</code> 和一个字典 <code>wordList</code>，返回最短转换序列中的单词数目；若不存在则返回 0。</p>
        
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 15px;">💡 左神核心点拨：双向广搜精髓</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
          <li><b>传统单向 BFS 的痛点</b>：若分支因子为 $b$，深度为 $d$，单向搜索空间呈指数膨胀 $O(b^d)$，状态极其容易爆炸。</li>
          <li><b>双向交替扩展机制</b>：起点集合 <code>smallLevel</code> 与终点集合 <code>bigLevel</code>。每轮<b>永远挑选元素数量较小的一侧</b>进行单层扩散！</li>
          <li><b>相遇即最短</b>：当较小集合尝试扩展的新单词在对向集合中出现时，两军瞬间会师，直接返回当前累计步数，实现极致剪枝。</li>
        </ul>
      </div>
    `,
    complexityHtml: `
      <div style="font-size: 12.5px; color: #475569; line-height: 1.5;">
        <div><b>时间复杂度：</b>$O(N \\times 26 \\times L)$，其中 $N$ 为词表长度，$L$ 为单词长度。相比单向大幅削减指数分支。</div>
        <div><b>空间复杂度：</b>$O(N \\times L)$，用于存储双端 Hash 集合与已访问标记。</div>
      </div>
    `,
  },

  'snacks-ways-buy-tickets-063': {
    title: '牛牛的背包问题 / 世界冰球锦标赛',
    source: '洛谷 P4799 / 牛客网 / 左程云 Class 063 Code02',
    difficulty: '中等',
    summary: '容量超大 (2*10^9) 导致传统 01 背包失效，折半搜索 Meet in the Middle 将 2^40 降维至 2*2^20。',
    problemHtml: `
      <div style="font-family: inherit; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">📜 题目描述</h4>
        <p>有 $n$ 袋零食（$1 \\le n \\le 40$），第 $i$ 袋零食体积为 $v[i]$。背包容量为 $w$（$1 \\le w \\le 2 \\times 10^9$）。</p>
        <p>在总体积不超过背包容量的情况下，一共有多少种零食放法（体积为 0 算 1 种放法）？</p>
        
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 15px;">💡 折半搜索 (Meet in the Middle) 破局思路</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
          <li><b>为什么 DP 失效</b>：$w \\le 2 \\times 10^9$，无论时间还是空间，一维 DP 表都会直接 OOM/TLE。</li>
          <li><b>为什么暴力递归失效</b>：$2^{40} \\approx 1.1 \\times 10^{12}$，远超单秒 $10^8$ 次运算极限。</li>
          <li><b>折半两路生成</b>：
            <ul>
              <li>前半段 $n/2 \\le 20$ 个数，递归生成全部 $2^{20} \\approx 10^6$ 种子序列累加和，存入 <code>lsum</code>；</li>
              <li>后半段生成全部子序列累加和，存入 <code>rsum</code> 并升序排序；</li>
            </ul>
          </li>
          <li><b>二分快速求和</b>：遍历 <code>lsum</code> 中每个和 $s$，在已排序的 <code>rsum</code> 中二分查找 $\\le w - s$ 的元素个数，高效累加！</li>
        </ul>
      </div>
    `,
    complexityHtml: `
      <div style="font-size: 12.5px; color: #475569; line-height: 1.5;">
        <div><b>时间复杂度：</b>$O(2^{n/2} \\log(2^{n/2}))$，即 $20 \\times 2^{20} \\approx 2 \\times 10^7$ 次运算，1秒内轻松秒杀。</div>
        <div><b>空间复杂度：</b>$O(2^{n/2})$，数组存储约 $10^6$ 个 long 整数，占用内存不足 10MB。</div>
      </div>
    `,
  },

  'closest-subsequence-sum-063': {
    title: '最接近目标值的子序列和',
    source: 'LeetCode 1755 · Closest Subsequence Sum / 左程云 Class 063 Code03',
    difficulty: '困难',
    summary: '数组长度 40 无法全量搜索，折半生成两侧所有子序列和后，双指针相向逼近目标值 goal。',
    problemHtml: `
      <div style="font-family: inherit; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">📜 题目描述</h4>
        <p>给你一个整数数组 <code>nums</code> 和一个目标值 <code>goal</code>（$1 \\le nums.length \\le 40, -10^7 \\le nums[i] \\le 10^7$）。</p>
        <p>请你从 <code>nums</code> 中选出一个子序列，使子序列元素总和 <code>sum</code> 最接近 <code>goal</code>，即最小化绝对差 <code>|sum - goal|</code>。</p>
        
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 15px;">💡 折半搜索 + 双指针精准逼近</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
          <li><b>剪枝预处理</b>：若 <code>goal >= 全部正数之和</code> 或 <code>goal <= 全部负数之和</code>，直接常数时间特判返回。</li>
          <li><b>折半收集</b>：将数组均分为左右两半，分别 DFS 递归生成左半部全部累加和 <code>lsum</code> 与右半部全部累加和 <code>rsum</code>。</li>
          <li><b>双指针相向扫描</b>：
            <ul>
              <li><code>lsum</code> 升序排序，<code>rsum</code> 升序排序；</li>
              <li>左指针 <code>i = 0</code> 从小到大，右指针 <code>j = rsize - 1</code> 从大到小；</li>
              <li>当前组合和为 <code>cur = lsum[i] + rsum[j]</code>，更新全局最小差 <code>ans = min(ans, |cur - goal|)</code>；</li>
              <li>若 <code>cur > goal</code>，说明数值偏大，必须减小，执行 <code>j--</code>；若 <code>cur < goal</code>，执行 <code>i++</code>；若相等直接得 0 退出！</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    complexityHtml: `
      <div style="font-size: 12.5px; color: #475569; line-height: 1.5;">
        <div><b>时间复杂度：</b>$O(2^{n/2} \\log(2^{n/2}))$，排序耗时为主导，双指针扫描仅需线性 $O(2^{n/2})$。</div>
        <div><b>空间复杂度：</b>$O(2^{n/2})$，双向数组各分配 $2^{20}$ 槽位。</div>
      </div>
    `,
  },

  'partition-minimize-difference-063': {
    title: '分割数组使两个数组和的差值最小',
    source: 'LeetCode 2035 · Partition Array to Minimize Difference / 左程云 Class 063 Code04',
    difficulty: '困难',
    summary: '长度 2N 拆分成两个大小各为 N 的子集使和差最小，折半搜索并按选取的元素个数 k 分桶二分。',
    problemHtml: `
      <div style="font-family: inherit; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">📜 题目描述</h4>
        <p>给你一个长度为 $2n$ 的整数数组 <code>nums</code>（$1 \\le n \\le 15$）。你需要将 <code>nums</code> 分成两个长度都为 $n$ 的数组，使得两个数组的和的绝对差最小。</p>
        
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 15px;">💡 选数约束下的折半搜索 (Meet in the Middle with Count Bucket)</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
          <li><b>等长约束的特殊性</b>：与题目3不同，本题<b>强制要求子集大小精确为 n</b>！</li>
          <li><b>按选数个数分桶</b>：
            <ul>
              <li>左侧 $n$ 个数中选 $k$ 个数（$0 \\le k \\le n$），将其累加和存入 <code>lsum[k]</code>；</li>
              <li>右侧 $n$ 个数中选 $n - k$ 个数，将其累加和存入 <code>rsum[n - k]</code>；</li>
            </ul>
          </li>
          <li><b>二分查找最优配对</b>：
            <ul>
              <li>设原数组总和为 $S$，若子集 1 的累加和为 $x$，则两子集差值为 $|S - 2x|$；</li>
              <li>最理想的目标是 $x \\approx S / 2$；</li>
              <li>遍历 <code>lsum[k]</code> 中的每个数 $a$，目标是在 <code>rsum[n - k]</code> 中寻找最接近 $(S/2 - a)$ 的数值 $b$；</li>
              <li>对每个桶二分查找下界与前驱，在所有可能配对中取最小差！</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    complexityHtml: `
      <div style="font-size: 12.5px; color: #475569; line-height: 1.5;">
        <div><b>时间复杂度：</b>$O(n \\times \\binom{n}{n/2} \\log \\binom{n}{n/2})$，当 $n=15$ 时组合数最大仅 6435，毫秒级得出答案。</div>
        <div><b>空间复杂度：</b>$O(2^n)$，分桶存储各层选数的累加和。</div>
      </div>
    `,
  },
};
