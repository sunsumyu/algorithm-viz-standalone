/**
 * 左神算法通关课 第 095 课 - 经典博弈论题目背景与题面内容
 */

export const GAME_095_PROBLEMS = {
  bashGame: {
    title: '巴什博弈 (Bash Game)',
    source: 'HDU 1846 / 经典博弈论',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目描述】</h4>
        <p>只有一堆由 <code>n</code> 个石子组成的堆。两个玩家轮流从中取石子，每次最少取 <code>1</code> 个，最多取 <code>m</code> 个。取走最后一个石子的人获胜。假设双方都采取最优策略，判断先手是必胜还是必败。</p>
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 14px;">【核心博弈结论】</h4>
        <p>若 <code>n % (m + 1) != 0</code>，则<strong>先手必胜</strong>；否则<strong>先手必败</strong>。</p>
        <p><strong>制胜策略</strong>：先手先取走 <code>n % (m + 1)</code> 个石子，将剩余石子数锁定为 <code>(m + 1)</code> 的整数倍；随后无论后手取 <code>k</code> 个（<code>1 <= k <= m</code>），先手只需取 <code>(m + 1 - k)</code> 个，始终保持每轮两人合计取走 <code>(m + 1)</code> 个，先手必胜！</p>
      </div>
    `,
  },
  primePowerStones: {
    title: '素数幂石子博弈 (Prime Power Game)',
    source: '经典博弈论 / 模6规律',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目描述】</h4>
        <p>有一堆 <code>n</code> 个石子。两个人轮流拿石子，每次允许拿取的数量必须是某个<strong>素数的非负整数次幂</strong>（即 <code>p^k</code>，其中 <code>p</code> 是质数，<code>k >= 0</code>）。因为 <code>p^0 = 1</code>，所以每次至少可以拿 1 个。拿到最后一个石子的人获胜。双方均采取最优策略，问先手胜负。</p>
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 14px;">【核心规律与证明】</h4>
        <p>任何素数幂 <code>p^k</code> 模 6 的结果绝不可能是 0：</p>
        <ul>
          <li>如果 <code>p = 2</code>：<code>2^1=2, 2^2=4, 2^3=8≡2 ...</code> 模 6 只可能是 2 或 4；</li>
          <li>如果 <code>p = 3</code>：<code>3^1=3, 3^2=9≡3 ...</code> 模 6 恒为 3；</li>
          <li>如果 <code>p >= 5</code>：所有大于 3 的质数均形如 <code>6k±1</code>，其幂次模 6 仍为 1 或 5；</li>
          <li>当 <code>k = 0</code> 时，<code>p^0 = 1</code>，模 6 为 1。</li>
        </ul>
        <p>因此单次拿取的石子数<strong>绝不可能是 6 的倍数</strong>！结论：<strong>若 <code>n % 6 != 0</code> 则先手必胜；若 <code>n % 6 == 0</code> 则先手必败</strong>。</p>
      </div>
    `,
  },
  nimGame: {
    title: '经典尼姆博弈 (Nim Game)',
    source: 'LeetCode 292 / HDU 1850 / 经典博弈论',
    timeComplexity: 'O(k)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目描述】</h4>
        <p>有 <code>k</code> 堆石子，数量分别为 <code>[a1, a2, ..., ak]</code>。两个玩家轮流操作，每次必须选择<strong>某一堆</strong>，并从中取走<strong>任意正整数个</strong>石子（可以取光整堆，但不能一粒不取，也不能跨堆拿）。取走最后一颗石子的人获胜。问先手胜负及第一步必胜决策。</p>
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 14px;">【Bouton 定理 (异或和)】</h4>
        <p>计算所有堆石子数的<strong>按位异或和（XOR sum）</strong>：<code>X = a1 ^ a2 ^ ... ^ ak</code>。</p>
        <ul>
          <li><strong>先手必败态 (P-position)</strong>：<code>X == 0</code>。此时无论先手怎么取，异或和必变为非 0；</li>
          <li><strong>先手必胜态 (N-position)</strong>：<code>X != 0</code>。先手必然可以找到某一堆 <code>ai</code>（满足 <code>ai ^ X < ai</code>），将其石子数减少至 <code>ai ^ X</code>，使得操作后全局异或和恢复为 0！</li>
        </ul>
      </div>
    `,
  },
  antiNimGame: {
    title: '反尼姆博弈 / SJ 定理 (Anti-Nim Game)',
    source: 'POJ 3480 / 贾志鹏 SJ 定理',
    timeComplexity: 'O(k)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目描述】</h4>
        <p>规则与尼姆博弈完全相同，唯一区别在于：<strong>取走最后一颗石子的人判负（输掉游戏）</strong>。这被称为反尼姆博弈（Misère Nim）。问先手是否必胜。</p>
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 14px;">【SJ 定理结论】</h4>
        <p>先手必胜当且仅当满足以下两个条件之一：</p>
        <ol>
          <li>所有堆的石子数<strong>全部等于 1</strong>，且石子堆数 <code>k</code> 为<strong>偶数</strong>（异或和为 0）；</li>
          <li>存在至少一堆石子数 <strong>> 1</strong>，且所有堆石子的<strong>异或和 <code>X != 0</code></strong>。</li>
        </ol>
      </div>
    `,
  },
  fibonacciGame: {
    title: '斐波那契博弈 (Fibonacci Game)',
    source: '齐肯多夫定理 (Zeckendorf Theorem)',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目描述】</h4>
        <p>只有一堆 <code>n</code> 个石子。两个人轮流拿石子：</p>
        <ul>
          <li>第一步：先手可以拿走 <code>1 ~ n-1</code> 个石子（<strong>不能一次性全部拿光</strong>）；</li>
          <li>后续步骤：每人拿取的石子数必须在 <code>1 ~ 2 * 前一人拿取的石子数</code> 之间。</li>
        </ul>
        <p>拿到最后一个石子的人获胜。问先手是否必胜。</p>
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 14px;">【齐肯多夫定理与必败结论】</h4>
        <p><strong>结论：先手必败当且仅当 <code>n</code> 是斐波那契数！</strong></p>
        <p>齐肯多夫定理指出：任何正整数都可以唯一分解为若干个不连续的斐波那契数之和。若 <code>n</code> 不是斐波那契数，先手只要先拿走分解项中最小的那一项，即可把斐波那契必败局势甩给后手！</p>
      </div>
    `,
  },
  wythoffGame: {
    title: '威佐夫博弈 (Wythoff Game)',
    source: 'POJ 1067 / 黄金分割比',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目描述】</h4>
        <p>有两堆石子，数量分别为 <code>a</code> 和 <code>b</code>（约定 <code>a <= b</code>）。两个玩家轮流操作：</p>
        <ul>
          <li>方案一：从某一堆中拿走任意正整数颗石子；</li>
          <li>方案二：同时从两堆中拿走<strong>相同数量</strong>的石子。</li>
        </ul>
        <p>最后取光所有石子的人获胜。问先手是否必胜。</p>
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 14px;">【奇异局势与黄金分割】</h4>
        <p>奇异局势（先手必败态）：<code>(0,0), (1,2), (3,5), (4,7), (6,10), (8,13) ...</code></p>
        <p>记两堆差值 <code>k = b - a</code>。第 <code>k</code> 个奇异局势满足：<code>ak = floor(k * (sqrt(5) + 1) / 2), bk = ak + k</code>。</p>
        <p>若 <code>a == floor((b - a) * 1.6180339887...)</code>，则为奇异局势，<strong>先手必败</strong>；否则<strong>先手必胜</strong>！</p>
      </div>
    `,
  },
};
