/**
 * 左程云算法通关课 Class 066: 从递归入手一维动态规划
 * 包含题目讲义、解题思路与四语言代码
 * 
 * 1. 最低票价 (LeetCode 983 · Minimum Cost For Tickets)
 * 2. 解码方法 II (LeetCode 639 · Decode Ways II)
 * 3. 丑数 II (LeetCode 264 · Ugly Number II)
 * 4. 环绕字符串中唯一的子字符串 (LeetCode 467 · Unique Substrings in Wraparound String)
 */

export interface ProblemInfo066 {
  title: string;
  source: string;
  difficulty: '简单' | '中等' | '困难';
  summary: string;
  problemHtml: string;
  complexityHtml: string;
}

export const DP_066_PROBLEMS: Record<string, ProblemInfo066> = {
  'min-cost-tickets-066': {
    title: '最低票价 (Minimum Cost For Tickets)',
    source: 'LeetCode 983 / 左程云 Class 066 Code02',
    difficulty: '中等',
    summary: '旅行日一维动态规划，针对 1天/7天/30天 通行证进行跳跃转移，贪心+记忆化搜索向自底向上递推。',
    problemHtml: `
      <div style="font-family: inherit; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">📜 题目描述</h4>
        <p>在一个火车旅行很受欢迎的国度，你提前一年计划了一些火车旅行。在给定的天数数组 <code>days</code> 中，每个元素都是一个 1 到 365 之间的整数。</p>
        <p>火车票有三种不同的销售方式：</p>
        <ul>
          <li><b>1 天通行证</b>：售价为 <code>costs[0]</code> 美元；</li>
          <li><b>7 天通行证</b>：售价为 <code>costs[1]</code> 美元；</li>
          <li><b>30 天通行证</b>：售价为 <code>costs[2]</code> 美元。</li>
        </ul>
        <p>通行证允许你在购买当天以及接下来的 $d-1$ 天内进行无限次旅行。请返回完成旅行计划所需的最低总花费。</p>
        
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 15px;">💡 左神核心点拨：下标跳转一维 DP</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
          <li><b>状态定义</b>：<code>dp[i]</code> 表示从第 $i$ 个旅行日 <code>days[i]</code> 开始，完成后续所有旅行所需的最低花费。</li>
          <li><b>三种决策分支</b>：
            <ul>
              <li>买 1 天票：花费 <code>costs[0]</code>，下一次需要购票的日期为下一个旅行日，状态转移为 <code>costs[0] + dp[i + 1]</code>；</li>
              <li>买 7 天票：花费 <code>costs[1]</code>，找到第一个旅行日满足 <code>days[j] >= days[i] + 7</code>，状态转移为 <code>costs[1] + dp[j]</code>；</li>
              <li>买 30 天票：花费 <code>costs[2]</code>，找到第一个旅行日满足 <code>days[k] >= days[i] + 30</code>，状态转移为 <code>costs[2] + dp[k]</code>；</li>
            </ul>
          </li>
          <li><b>决策归约</b>：<code>dp[i] = min(分支1, 分支2, 分支3)</code>，从右往左单向递推（逆向推导），基准条件 <code>dp[n] = 0</code>。</li>
        </ul>
      </div>
    `,
    complexityHtml: `
      <div style="font-size: 12.5px; color: #475569; line-height: 1.5;">
        <div><b>时间复杂度：</b>$O(N)$，其中 $N$ 为旅行日总数。双指针或二分跳跃查找下次旅行日。</div>
        <div><b>空间复杂度：</b>$O(N)$，一维 DP 表存储各旅行日的最优累计花费。</div>
      </div>
    `,
  },

  'decode-ways-ii-066': {
    title: '解码方法 II (Decode Ways II)',
    source: 'LeetCode 639 / 左程云 Class 066 Code04',
    difficulty: '困难',
    summary: '含通配符 "*" 的字符串一维线性 DP，详尽枚举单字符与双字符各种匹配分支，对 10^9+7 取模。',
    problemHtml: `
      <div style="font-family: inherit; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">📜 题目描述</h4>
        <p>一条包含字母 A-Z 的消息通过以下映射进行了编码：'A' -> "1", 'B' -> "2", ..., 'Z' -> "26"。</p>
        <p>除了数字外，编码消息中可能包含 <code>'*'</code> 字符，它可以表示 '1' 到 '9' 的任何单一数字（不能表示 '0'）。</p>
        <p>给你一个包含数字和 <code>'*'</code> 的字符串 <code>s</code>，请返回解码该编码消息的方法总数。由于答案很大，答案对 $10^9 + 7$ 取模。</p>
        
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 15px;">💡 分类讨论一维 DP 状态机</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
          <li><b>单字符转移（以 s[i] 独立解码为 1 个字母）</b>：
            <ul>
              <li>若 <code>s[i] == '*'</code>：可解码为 1~9，贡献 $9 \\times dp[i+1]$；</li>
              <li>若 <code>s[i] != '0'</code>：可解码为自身，贡献 $1 \\times dp[i+1]$；</li>
              <li>若 <code>s[i] == '0'</code>：无法独立成词，贡献 0。</li>
            </ul>
          </li>
          <li><b>双字符转移（以 s[i..i+1] 联合解码为 1 个字母 10~26）</b>：
            <ul>
              <li>若 <code>s[i] == '*'</code> 且 <code>s[i+1] == '*'</code>：11~19 (9种) + 21~26 (6种) = 15 种；</li>
              <li>若 <code>s[i] == '*'</code> 且 <code>s[i+1] != '*'</code>：若 $s[i+1] \\le 6$ 可作为 1x, 2x（2种），若 $>6$ 只能作为 1x（1种）；</li>
              <li>若 <code>s[i] == '1'</code> 且 <code>s[i+1] == '*'</code>：11~19 共 9 种；</li>
              <li>若 <code>s[i] == '2'</code> 且 <code>s[i+1] == '*'</code>：21~26 共 6 种；</li>
              <li>若两者皆为普通数字：数值在 10~26 之间贡献 1 种，否则 0 种。</li>
            </ul>
          </li>
          <li><b>空间滚动优化</b>：状态只依赖后两项 $dp[i+1]$ 和 $dp[i+2]$，空间可压缩至 $O(1)$。</li>
        </ul>
      </div>
    `,
    complexityHtml: `
      <div style="font-size: 12.5px; color: #475569; line-height: 1.5;">
        <div><b>时间复杂度：</b>$O(N)$，线性单趟扫描。</div>
        <div><b>空间复杂度：</b>$O(1)$，仅需常数个滚动变量维护状态。</div>
      </div>
    `,
  },

  'ugly-number-ii-066': {
    title: '丑数 II (Ugly Number II)',
    source: 'LeetCode 264 / 左程云 Class 066 Code05',
    difficulty: '中等',
    summary: '只包含质因数 2, 3, 5 的正整数，三指针步进动态规划，每次挑选最小候选者并推进对应指针去重。',
    problemHtml: `
      <div style="font-family: inherit; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">📜 题目描述</h4>
        <p>给你一个整数 $n$，请你找出并返回第 $n$ 个<b>丑数</b>。丑数就是只包含质因数 2、3 和 5 的正整数。初始丑数为 1。</p>
        
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 15px;">💡 三指针合并多路有序流</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
          <li><b>丑数的生成规律</b>：任何一个丑数都是由之前某个已知丑数乘以 2、3 或 5 得到的！</li>
          <li><b>三路虚拟有序队列</b>：
            <ul>
              <li>2 的倍数序列：$dp[i_2] \\times 2$</li>
              <li>3 的倍数序列：$dp[i_3] \\times 3$</li>
              <li>5 的倍数序列：$dp[i_5] \\times 5$</li>
            </ul>
          </li>
          <li><b>动态归并</b>：下一个丑数 $dp[i] = \\min(dp[i_2] \\times 2, dp[i_3] \\times 3, dp[i_5] \\times 5)$。</li>
          <li><b>自动去重</b>：所有产生当前最小值的指针（可能同时存在，如 $2 \\times 3 = 6$ 和 $3 \\times 2 = 6$）<b>均同时向前推进一步</b>，天生杜绝重复！</li>
        </ul>
      </div>
    `,
    complexityHtml: `
      <div style="font-size: 12.5px; color: #475569; line-height: 1.5;">
        <div><b>时间复杂度：</b>$O(n)$，计算每个丑数仅耗费 $O(1)$ 比较。</div>
        <div><b>空间复杂度：</b>$O(n)$，使用长度为 $n$ 的一维数组记录递推求得的丑数。</div>
      </div>
    `,
  },

  'unique-substrings-wraparound-066': {
    title: '环绕字符串中唯一的子字符串',
    source: 'LeetCode 467 / 左程云 Class 066 Code07',
    difficulty: '中等',
    summary: '无限循环环绕字符串 base，统计以 26 个小写字母各自结尾的最长连续递增长度，消除重复子串。',
    problemHtml: `
      <div style="font-family: inherit; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">📜 题目描述</h4>
        <p>定义字符串 <code>base</code> 为无限环绕的 <code>"abcdefghijklmnopqrstuvwxyz"</code>（即 'z' 的后面紧接着 'a'）。</p>
        <p>给你一个字符串 <code>s</code>，请你统计并返回 <code>s</code> 中有多少个<b>不同且非空</b>的子串也在 <code>base</code> 中出现。</p>
        
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 15px;">💡 结尾字符锚定一维 DP</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
          <li><b>传统统计的死穴</b>：若暴力穷举子串存入 HashSet，时间复杂度 $O(N^2)$ 必定超时且产生大量重复。</li>
          <li><b>核心等价数学性质</b>：如果一个以字符 $c$ 结尾的连续子串长度为 $L$，那么它必然包含了长度为 $1, 2, ..., L$ 的全部以 $c$ 结尾的子串！</li>
          <li><b>状态定义</b>：<code>dp[c]</code> 表示在字符串 $s$ 中，以字符 $c$ 结尾的在 <code>base</code> 中出现的最长连续子串长度。</li>
          <li><b>转移与累计</b>：
            <ul>
              <li>维护当前连续递增长度 <code>curLen</code>：若 <code>s[i]</code> 是 <code>s[i-1]</code> 的后继（即 <code>(s[i]-s[i-1]+26)%26 == 1</code>），则 <code>curLen++</code>；否则重置为 <code>curLen = 1</code>；</li>
              <li>更新：<code>dp[s[i]] = max(dp[s[i]], curLen)</code>；</li>
              <li>最终结果就是 <code>sum(dp[a..z])</code>！彻底化解子串去重难题。</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    complexityHtml: `
      <div style="font-size: 12.5px; color: #475569; line-height: 1.5;">
        <div><b>时间复杂度：</b>$O(N)$，单次遍历字符串 $s$。</div>
        <div><b>空间复杂度：</b>$O(1)$，仅需大小为 26 的固定哈希槽位。</div>
      </div>
    `,
  },
};
