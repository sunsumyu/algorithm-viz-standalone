/**
 * 左神算法通关课 第 096 课 - SG 函数与综合博弈论题目背景与题面内容
 */

export const GAME_096_PROBLEMS = {
  bashGameSg: {
    title: '巴什博弈与 SG 函数打表 (Bash Game SG)',
    source: '左神算法通关课第96节 / SG函数基础',
    timeComplexity: 'O(n * m)',
    spaceComplexity: 'O(n)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目与 SG 定义】</h4>
        <p>石子总数 <code>n</code>，每次允许取 <code>1 ~ m</code> 颗。使用 <strong>SG (Sprague-Grundy) 函数</strong>与 <strong>mex 算子</strong>自底向上打表求解：</p>
        <ul>
          <li><strong>终局态</strong>：<code>SG(0) = 0</code>（无路可走，必败态）；</li>
          <li><strong>转移后继</strong>：从状态 <code>x</code> 拿走 <code>1 ~ m</code> 颗，后继状态集为 <code>{x - 1, x - 2, ..., x - m}</code>；</li>
          <li><strong>SG(x)</strong>：后继状态集合 SG 值的 <strong>mex</strong>（即未出现的最小非负整数）；</li>
          <li><strong>周期规律</strong>：打表可严格归纳出 <code>SG(x) = x % (m + 1)</code>！当 <code>SG(x) > 0</code> 时先手必胜，<code>SG(x) == 0</code> 时先手必败。</li>
        </ul>
      </div>
    `,
  },
  nimGameSg: {
    title: '尼姆博弈 SG 函数证明 (Nim Game SG)',
    source: 'Bouton 定理的数学证明 / SG 定理',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【数学原理】</h4>
        <p>在单堆石子中，数量为 <code>x</code> 的堆可以任意取走 <code>1 ~ x</code> 颗，因此其后继状态集合为 <code>{0, 1, 2, ..., x - 1}</code>。</p>
        <p>自底向上推导：</p>
        <ul>
          <li><code>SG(0) = 0</code></li>
          <li><code>SG(1) = mex{SG(0)} = mex{0} = 1</code></li>
          <li><code>SG(2) = mex{SG(0), SG(1)} = mex{0, 1} = 2</code></li>
          <li><code>... SG(x) = mex{0, 1, ..., x - 1} = x</code>！</li>
        </ul>
        <p>这数学化地证明了为什么<strong>每一堆石子的 SG 值恰好等于该堆石子数本身</strong>，因而多堆石子的复合博弈即为各堆大小的异或和！</p>
      </div>
    `,
  },
  twoStonesBashSg: {
    title: '双堆巴什博弈与 SG 矩阵 (Two Stones Bash Game)',
    source: '经典双独立游戏复合博弈',
    timeComplexity: 'O(n1 * m + n2 * m)',
    spaceComplexity: 'O(n1 + n2)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目描述】</h4>
        <p>有两堆石子分别为 <code>n1</code> 和 <code>n2</code> 颗。每人每次可以从任意<strong>某一堆</strong>中拿走 <code>1 ~ m</code> 颗石子。取走最后一颗石子的人获胜。</p>
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 14px;">【SG 独立复合定理】</h4>
        <p>两堆石子属于两个完全相互独立的子游戏。根据 SG 定理：</p>
        <p><code>SG(n1, n2) = SG(n1) ^ SG(n2) = (n1 % (m + 1)) ^ (n2 % (m + 1))</code></p>
        <p>先手必胜当且仅当 <code>SG(n1, n2) != 0</code>，即两堆石子模 <code>(m + 1)</code> 的余数不相等！</p>
      </div>
    `,
  },
  threeStonesFibonacciSg: {
    title: '三堆石子取斐波那契数 SG 博弈 (Three Stones Pick Fibonacci)',
    source: 'HDU 1847 变形 / 斐波那契转移集合',
    timeComplexity: 'O(maxN * |Fib|)',
    spaceComplexity: 'O(maxN)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目描述】</h4>
        <p>有三堆石子 <code>(n1, n2, n3)</code>。每人每次只能从任意某一堆中取走<strong>斐波那契数</strong>颗石子（即 <code>1, 2, 3, 5, 8, 13, 21 ...</code>）。最后取光者胜。</p>
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 14px;">【解法与 SG 复合】</h4>
        <ol>
          <li>先预处理斐波那契数列 <code>F = [1, 2, 3, 5, 8, ...]</code>；</li>
          <li>自底向上计算单堆 SG 函数：<code>SG(x) = mex{ SG(x - f) | f in F 且 f <= x }</code>；</li>
          <li>由 SG 定理，复合总局势的 SG 值为三堆的异或和：<code>SG(n1, n2, n3) = SG(n1) ^ SG(n2) ^ SG(n3)</code>；</li>
          <li>若异或和非 0 则先手必胜，否则先手必败。</li>
        </ol>
      </div>
    `,
  },
  coinFlipGameSg: {
    title: '欧几里得翻硬币博弈 (Coin Flip Game SG)',
    source: '经典翻硬币博弈 (Turning Turtles)',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目描述】</h4>
        <p>有一排编号为 <code>1 ~ n</code> 的硬币，部分正面朝上（1），部分反面朝上（0）。游戏规则：每次必须选择一枚<strong>正面朝上</strong>的硬币 <code>i</code> 将其翻为反面，并允许（或必须）同时翻转其左侧 <code>j < i</code> 的一枚或多枚硬币。无法操作者输。</p>
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 14px;">【翻硬币博弈分解定理】</h4>
        <p>硬币游戏满足<strong>独立可加性</strong>：任何一个多硬币局面的 SG 值，等于每一个正面朝上的硬币单独存在时的 SG 值的<strong>按位异或和</strong>！</p>
        <p><code>SG(全局) = ⨁_{i: coins[i] == 1} SG_single(i)</code></p>
      </div>
    `,
  },
  splitGameSg: {
    title: '分裂石子游戏 SG 函数复合 (Split Game SG)',
    source: 'POJ 2311 / 复合游戏分裂',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【题目描述】</h4>
        <p>初始有一堆数量为 <code>n</code> 的石子。每名玩家每次可以选择某一堆石子 <code>x (x >= 2)</code>，将其<strong>分裂为两堆更小的石子 <code>(y, z)</code></strong>，满足 <code>y + z = x</code> 且 <code>y > 0, z > 0</code>。无法再分裂（所有堆均为 1 颗）者输。</p>
        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 14px;">【SG 状态裂变与异或】</h4>
        <p>一个游戏状态裂变为了两个完全平行的子游戏，根据 SG 定理：分裂后后继状态的综合 SG 值为 <code>SG(y) ^ SG(z)</code>！</p>
        <p>原状态的 SG 值为所有分裂方案 SG 异或值的 mex：</p>
        <p><code>SG(x) = mex{ SG(y) ^ SG(z) | 1 <= y <= z 且 y + z = x }</code></p>
      </div>
    `,
  },
};
