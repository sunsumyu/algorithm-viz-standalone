/**
 * 动态规划专题全部专栏与总结文章数据源 (DP Thematic Knowledge Base)
 */

export interface ArticleSection {
  title: string;
  html: string;
}

export interface ArticleDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: Array<[string, string]>;
  difficulty?: 1 | 2 | 3;
  levelOrder?: number;
  learningGoal?: string;
}

/**
 * 渲染极具现代感与玻璃拟态效果的 DP 文章 HTML 模板
 */
export function articleTemplate(def: ArticleDef): string {
  const sectionsHtml = def.sections
    .map(([title, html], index) => {
      const isWide =
        html.includes('<table') ||
        html.length > 400 ||
        title.includes('总结') ||
        title.includes('对比') ||
        title.includes('大表') ||
        title.includes('思维导图') ||
        title.includes('五部曲') ||
        title.includes('全景');

      return `
        <div class="card ${isWide ? 'wide' : ''}" style="animation-delay: ${index * 0.04}s">
          <h2><span class="section-indicator"></span>${title}</h2>
          <div class="card-content">${html}</div>
        </div>
      `;
    })
    .join('');

  return `
<style>
  .dp-article {
    height: 100%;
    overflow-y: auto;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background:
      radial-gradient(ellipse at 8% 6%, rgba(59, 130, 246, 0.22), transparent 55%),
      radial-gradient(ellipse at 92% 94%, rgba(147, 51, 234, 0.22), transparent 55%),
      linear-gradient(135deg, #0b1120 0%, #111827 50%, #0f172a 100%);
    padding: 1.5rem;
    box-sizing: border-box;
  }
  .dp-article .article-shell { max-width: 1140px; margin: 0 auto; }
  .dp-article .hero {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1.25rem;
    margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(18px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  }
  .dp-article .hero-left { display: flex; align-items: flex-start; gap: 16px; }
  .dp-article .icon-badge {
    width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 24px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: #ffffff;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.45);
  }
  .dp-article .eyebrow {
    color: #60a5fa; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 0.4rem; font-weight: 700;
  }
  .dp-article h1 { margin: 0 0 0.4rem; font-size: 22px; font-weight: 800; letter-spacing: -.02em; color: #f8fafc; line-height: 1.3; }
  .dp-article .lead { color: #94a3b8; line-height: 1.7; max-width: 900px; font-size: 14px; margin: 0; }
  .dp-article .grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px; margin: 1.2rem 0;
  }
  .dp-article .card {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px; padding: 1.3rem 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transition: transform 0.25s cubic-bezier(.4,0,.2,1), border-color 0.25s, box-shadow 0.25s;
  }
  .dp-article .card:hover {
    transform: translateY(-3px);
    border-color: rgba(96, 165, 250, 0.4);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(139, 92, 246, 0.2);
  }
  .dp-article .card.wide { grid-column: 1 / -1; }
  .dp-article .card h2 {
    color: #93c5fd; margin: 0 0 0.8rem; font-size: 16px; font-weight: 700; line-height: 1.4;
    display: flex; align-items: center; gap: 8px;
  }
  .dp-article .section-indicator {
    width: 6px; height: 16px; border-radius: 3px; background: linear-gradient(180deg, #3b82f6, #8b5cf6);
    display: inline-block; flex-shrink: 0;
  }
  .dp-article p, .dp-article li { color: #cbd5e1; line-height: 1.75; font-size: 13.5px; margin: 0.3rem 0; }
  .dp-article ul, .dp-article ol { padding-left: 1.25rem; margin: 0.3rem 0; }
  .dp-article li { margin-bottom: 0.4rem; list-style-type: circle; }
  .dp-article ol li { list-style-type: decimal; }
  .dp-article strong { color: #bfdbfe; font-weight: 600; }
  .dp-article code {
    color: #93c5fd; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px; padding: 0.1rem 0.4rem; font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace; font-size: 0.88em;
  }
  .dp-article pre {
    background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 0.85rem 1.1rem; overflow-x: auto;
    color: #e2e8f0; line-height: 1.55; font-size: 12.5px;
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
    margin: 0.5rem 0;
  }
  .dp-article table {
    width: 100%; border-collapse: separate; border-spacing: 0;
    overflow: hidden; border-radius: 10px;
    background: rgba(15, 23, 42, 0.5);
    margin-top: 0.6rem; font-size: 13px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .dp-article th, .dp-article td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 0.6rem 0.8rem; text-align: left; color: #cbd5e1; vertical-align: top;
  }
  .dp-article thead th {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.2));
    color: #93c5fd; font-weight: 700; letter-spacing: 0.02em;
  }
  .dp-article tbody tr:hover td { background: rgba(59, 130, 246, 0.08); }
  .dp-article tbody tr:last-child td { border-bottom: none; }
  .dp-article .tag {
    display: inline-block; padding: 0.15rem 0.55rem; border-radius: 9999px;
    font-size: 11.5px; font-weight: 600; margin-right: 0.35rem; margin-bottom: 0.35rem;
    background: rgba(59, 130, 246, 0.18); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3);
  }
  .dp-article .tag-purple {
    background: rgba(147, 51, 234, 0.18); color: #d8b4fe; border-color: rgba(147, 51, 234, 0.3);
  }
  .dp-article .tag-emerald {
    background: rgba(16, 185, 129, 0.18); color: #6ee7b7; border-color: rgba(16, 185, 129, 0.3);
  }
  .dp-article .tag-amber {
    background: rgba(245, 158, 11, 0.18); color: #fcd34d; border-color: rgba(245, 158, 11, 0.3);
  }
  .dp-article .highlight-box {
    background: rgba(59, 130, 246, 0.08); border-left: 3px solid #3b82f6;
    border-radius: 0 8px 8px 0; padding: 0.6rem 0.9rem; margin: 0.6rem 0;
  }
  .dp-article .highlight-box.warning {
    background: rgba(245, 158, 11, 0.08); border-left-color: #f59e0b;
  }
</style>
<div class="dp-article">
  <div class="article-shell">
    <div class="hero">
      <div class="hero-left">
        <div class="icon-badge">${def.icon}</div>
        <div>
          <div class="eyebrow">DYNAMIC PROGRAMMING · 动态规划专题知识库</div>
          <h1>${def.name}</h1>
          <p class="lead">${def.description}</p>
        </div>
      </div>
    </div>
    <div class="grid">
      ${sectionsHtml}
    </div>
  </div>
</div>
  `;
}

export const dpArticles: ArticleDef[] = [
  // 1. 动态规划理论基础
  {
    id: 'dp-theory',
    name: '动态规划理论基础',
    description: '动态规划五部曲、重叠子问题、最优子结构与状态转移金科玉律。',
    icon: '📘',
    sections: [
      [
        '动态规划五部曲 (核心心法)',
        `<p>解决任何动态规划问题，必须严格按照以下五步进行思考与自查：</p>
        <ol>
          <li><span class="tag">第 1 步</span> <strong>确定 dp 数组（dp table）以及下标的含义</strong>：明确 <code>dp[i]</code> 或 <code>dp[i][j]</code> 到底代表什么数值。</li>
          <li><span class="tag tag-purple">第 2 步</span> <strong>确定递推公式（状态转移方程）</strong>：分析当前状态如何由历史已知状态转移推导而来。</li>
          <li><span class="tag tag-emerald">第 3 步</span> <strong>dp 数组如何初始化</strong>：初始化是递推的地基，初始值错误会导致整个递推链条雪崩。</li>
          <li><span class="tag tag-amber">第 4 步</span> <strong>确定遍历顺序</strong>：从前向后、从后向前，还是先遍历物品后遍历背包？</li>
          <li><span class="tag">第 5 步</span> <strong>举例推导 dp 数组</strong>：手动推导前几个状态，打印 dp 数组与预期对齐。</li>
        </ol>`,
      ],
      [
        'DP 与贪心、分治的核心区别',
        `<table>
          <thead>
            <tr><th>算法范式</th><th>核心特征</th><th>子问题关系</th><th>决策时机</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>动态规划</strong></td><td>最优子结构 + 重叠子问题</td><td>子问题高度重叠，查表避免重复计算</td><td>综合历史多种选择取最优</td></tr>
            <tr><td><strong>贪心算法</strong></td><td>贪心选择性质 + 无后效性</td><td>每步只选局部最优，不依赖子问题全局</td><td>只做当前单向选择，不回退</td></tr>
            <tr><td><strong>分治算法</strong></td><td>子问题相互独立</td><td>子问题无重叠，直接分而治之</td><td>自顶向下分割后合并</td></tr>
          </tbody>
        </table>`,
      ],
      [
        '通用代码心法模板',
        `<pre><code>// 1. 确定状态数组
int[] dp = new int[n + 1];

// 2. 初始化初始地基
dp[0] = base0;
dp[1] = base1;

// 3. 按照确定的顺序进行状态递推
for (int i = 2; i <= n; i++) {
    dp[i] = /* 从历史 dp 状态转移 */;
}

// 4. 返回目标解
return dp[n];</code></pre>`,
      ],
      [
        '动规调试三原则',
        `<div class="highlight-box">
          <p><strong>代码写出来总是 WA (Wrong Answer)？</strong> 按以下 3 点自查：</p>
          <ul>
            <li><strong>这道题我举例推导 dp 数组了吗？</strong> 把推导日志打印出来，对比前 5 个数值。</li>
            <li><strong>打印出来的 dp 数组和自己手动推导的一样吗？</strong> 若不一样，说明代码实现（如初始化、遍历边界）有偏差。</li>
            <li><strong>如果一样还是错，说明递推公式或状态定义本身有误。</strong></li>
          </ul>
        </div>`,
      ],
    ],
  },

  // 2. 动规周总结（一）
  {
    id: 'dp-week-summary-1',
    name: '动规周总结（一）',
    description: '一维基础 DP：斐波那契数、爬楼梯、使用最小花费爬楼梯总结。',
    icon: '🧭',
    sections: [
      [
        '一维基础题型回顾',
        `<p>本周重点掌握最经典的基础线性递推模型，彻底吃透状态定义与滚动覆盖技巧：</p>
        <ul>
          <li><strong>509. 斐波那契数</strong>：最纯粹的二阶线性递推 <code>dp[i] = dp[i-1] + dp[i-2]</code>。</li>
          <li><strong>70. 爬楼梯</strong>：每次可爬 1 或 2 阶，到达第 i 阶方案数等于到达 i-1 与 i-2 方案数之和。</li>
          <li><strong>746. 使用最小花费爬楼梯</strong>：从第 0 或第 1 阶起跳，到达第 i 阶的最小花费递推。</li>
        </ul>`,
      ],
      [
        '三大基础题型横向对比',
        `<table>
          <thead>
            <tr><th>题目</th><th>dp[i] 含义</th><th>递推公式</th><th>初始化</th><th>空间优化后</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>斐波那契数</strong></td><td>第 i 个斐波那契值</td><td><code>dp[i] = dp[i-1] + dp[i-2]</code></td><td><code>dp[0]=0, dp[1]=1</code></td><td><code>O(1)</code> 双变量</td></tr>
            <tr><td><strong>爬楼梯</strong></td><td>爬到第 i 阶的方法数</td><td><code>dp[i] = dp[i-1] + dp[i-2]</code></td><td><code>dp[1]=1, dp[2]=2</code></td><td><code>O(1)</code> 双变量</td></tr>
            <tr><td><strong>最小花费爬楼梯</strong></td><td>到达第 i 阶的最小花费</td><td><code>min(dp[i-1]+c[i-1], dp[i-2]+c[i-2])</code></td><td><code>dp[0]=0, dp[1]=0</code></td><td><code>O(1)</code> 双变量</td></tr>
          </tbody>
        </table>`,
      ],
      [
        '空间优化：滚动变量精要',
        `<p>因为 <code>dp[i]</code> 仅依赖于前两个状态 <code>dp[i-1]</code> 和 <code>dp[i-2]</code>，我们可以用两个变量滚动覆盖，将空间复杂度从 <code>O(n)</code> 降至 <code>O(1)</code>：</p>
        <pre><code>int prev2 = 0; // 对应 dp[i-2]
int prev1 = 0; // 对应 dp[i-1]
for (int i = 2; i <= cost.length; i++) {
    int cur = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]);
    prev2 = prev1;
    prev1 = cur;
}
return prev1;</code></pre>`,
      ],
      [
        '易错点警示',
        `<div class="highlight-box warning">
          <p><strong>注意初始站位：</strong> 746 题中明确说明“可以选择从下标为 0 或下标为 1 的台阶开始爬”，意味着站在地面起跳到达 0 或 1 阶台阶本身是不需要花费的，因此 <code>dp[0] = 0, dp[1] = 0</code>，只有离开台阶向上跳时才支付该台阶的 cost！</p>
        </div>`,
      ],
    ],
  },

  // 3. 动规周总结（二）
  {
    id: 'dp-week-summary-2',
    name: '动规周总结（二）',
    description: '二维网格路径与数学拆分：不同路径 I/II、整数拆分、不同的二叉搜索树。',
    icon: '🧭',
    sections: [
      [
        '网格与结构型 DP 回顾',
        `<p>本周从一维线性跨越到二维网格与结构计数问题：</p>
        <ul>
          <li><strong>62. 不同路径</strong>：网格只能向下或向右，<code>dp[i][j] = dp[i-1][j] + dp[i][j-1]</code>。</li>
          <li><strong>63. 不同路径 II</strong>：增加障碍物，遇障碍物置 0 阻断路径传递。</li>
          <li><strong>343. 整数拆分</strong>：将正整数 n 拆分为至少两个正整数之和，求最大乘积。</li>
          <li><strong>96. 不同的二叉搜索树</strong>：以 1~n 分别为根节点，左右子树形态组合的笛卡尔积累加（卡特兰数）。</li>
        </ul>`,
      ],
      [
        '核心公式横向速查',
        `<table>
          <thead>
            <tr><th>题目</th><th>dp 定义</th><th>状态转移方程</th><th>关键技巧</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>不同路径</strong></td><td>到达 (i,j) 的路径总数</td><td><code>dp[i][j] = dp[i-1][j] + dp[i][j-1]</code></td><td>边缘初始化全为 1</td></tr>
            <tr><td><strong>不同路径 II</strong></td><td>到达 (i,j) 的无障碍路径数</td><td>遇障 0，否则同上</td><td>首行首列遇障碍后续全 0</td></tr>
            <tr><td><strong>整数拆分</strong></td><td>正整数 i 拆分后的最大乘积</td><td><code>max(j*(i-j), j*dp[i-j])</code></td><td>拆分成 2 个或拆分成更多</td></tr>
            <tr><td><strong>不同 BST</strong></td><td>1~i 组成的二叉搜索树种数</td><td><code>dp[i] += dp[j-1] * dp[i-j]</code></td><td>左右子树形态数相乘累加</td></tr>
          </tbody>
        </table>`,
      ],
      [
        '整数拆分的数学与 DP 洞察',
        `<p>对于整数拆分，将数字尽量拆分成大小为 <strong>3</strong> 的数乘积最大（均值不等式与导数极值）：</p>
        <pre><code>// DP 解法：双层循环探索所有拆分切点 j
for (int i = 3; i <= n; i++) {
    for (int j = 1; j <= i / 2; j++) {
        dp[i] = Math.max(dp[i], Math.max(j * (i - j), j * dp[i - j]));
    }
}</code></pre>`,
      ],
    ],
  },

  // 4. 0-1背包理论基础（一）
  {
    id: 'knapsack-01-theory-1',
    name: '0-1背包理论基础（一）',
    description: '二维 0/1 背包：物品和容量两维状态、状态转移方程推导与矩阵遍历。',
    icon: '🎒',
    sections: [
      [
        '0/1 背包问题定义',
        `<p>有 <code>N</code> 件物品和一个容量为 <code>W</code> 的背包。第 <code>i</code> 件物品的重量是 <code>weight[i]</code>，价值是 <code>value[i]</code>。<strong>每件物品只能使用一次</strong>，求解将哪些物品装入背包可使这些物品的总重量不超过背包容量，且总价值最大。</p>`,
      ],
      [
        '二维 dp[i][j] 状态定义与递推推导',
        `<p><strong>dp[i][j] 含义</strong>：从下标为 <code>[0..i]</code> 的物品中任意挑选，放入容量为 <code>j</code> 的背包中所能获得的最大价值。</p>
        <p>对于第 <code>i</code> 件物品，我们只有两种选择：</p>
        <ul>
          <li><strong>不放物品 i</strong>：容量不变，价值继承自前 i-1 件物品：<code>dp[i-1][j]</code>。</li>
          <li><strong>放物品 i</strong>：背包需腾出 <code>weight[i]</code> 的空间，总价值为 <code>dp[i-1][j - weight[i]] + value[i]</code>（前提是 <code>j >= weight[i]</code>）。</li>
        </ul>
        <div class="highlight-box">
          <code>dp[i][j] = Math.max(dp[i-1][j], dp[i-1][j - weight[i]] + value[i]);</code>
        </div>`,
      ],
      [
        '二维 DP 初始化规则',
        `<ul>
          <li><strong>容量为 0 的列</strong>：<code>dp[i][0] = 0</code>，背包容量为 0 时什么都装不下，价值为 0。</li>
          <li><strong>物品 0 的行</strong>：当容量 <code>j >= weight[0]</code> 时，<code>dp[0][j] = value[0]</code>；否则为 0。</li>
          <li><strong>其余单元格</strong>：初始化为 0 即可。</li>
        </ul>`,
      ],
      [
        '遍历顺序的自由度',
        `<p>在二维 0/1 背包中，<strong>先遍历物品还是先遍历背包容量都可以</strong>，因为 <code>dp[i][j]</code> 只依赖于正上方 <code>dp[i-1][j]</code> 和左上方 <code>dp[i-1][j-weight[i]]</code>，只要上一行的数据已经计算完成即可。</p>`,
      ],
    ],
  },

  // 5. 0-1背包理论基础（二）
  {
    id: 'knapsack-01-theory-2',
    name: '0-1背包理论基础（二）',
    description: '一维滚动数组空间压缩：为何容量必须倒序遍历？防重机制深度剖析。',
    icon: '🎒',
    sections: [
      [
        '一维滚动数组压缩原理',
        `<p>观察二维递推公式：<code>dp[i][j] = max(dp[i-1][j], dp[i-1][j - weight[i]] + value[i])</code>。</p>
        <p>我们发现第 <code>i</code> 层状态<strong>只依赖于第 <code>i-1</code> 层</strong>。因此可以直接复用一维数组 <code>dp[j]</code>，把上一层数据直接拷贝/滚动覆盖到当前层。</p>`,
      ],
      [
        '核心命门：为何容量必须倒序遍历？',
        `<div class="highlight-box warning">
          <p><strong>倒序遍历是为了保证物品 i 只被放入背包一次！</strong></p>
          <p>若正序遍历：计算 <code>dp[j]</code> 时依赖的 <code>dp[j - weight[i]]</code> 已经在<strong>当前轮次</strong>被物品 i 更新过了，导致物品 i 被重复累加（变成了完全背包！）。</p>
          <p>倒序遍历（从 <code>bagSize</code> 到 <code>weight[i]</code>）：计算 <code>dp[j]</code> 时，<code>dp[j - weight[i]]</code> 依然保存着<strong>上一轮物品（尚未加入物品 i）的状态</strong>，确保每个物品只加入一次！</p>
        </div>`,
      ],
      [
        '0/1 背包一维标准通用模板',
        `<pre><code>// 1. 定义一维 dp 数组，容量为 bagSize
int[] dp = new int[bagSize + 1];

// 2. 外层遍历所有物品
for (int i = 0; i < weight.length; i++) {
    // 3. 内层倒序遍历背包容量（必须倒序，且终点为 weight[i]）
    for (int j = bagSize; j >= weight[i]; j--) {
        dp[j] = Math.max(dp[j], dp[j - weight[i]] + value[i]);
    }
}
return dp[bagSize];</code></pre>`,
      ],
    ],
  },

  // 6. 动规周总结（三）
  {
    id: 'dp-week-summary-3',
    name: '动规周总结（三）',
    description: '0/1 背包应用题大总结：分割等和子集、最后一块石头的重量 II、目标和、一和零。',
    icon: '🧭',
    sections: [
      [
        '0/1 背包四大应用题型复盘',
        `<p>很多看似不是背包的问题，本质都可以转化为 0/1 背包模型：</p>
        <ul>
          <li><strong>416. 分割等和子集</strong>：能否选出若干元素装满容量为 <code>sum / 2</code> 的背包（判断能否装满）。</li>
          <li><strong>1049. 最后一块石头的重量 II</strong>：将石头尽量平分成两堆，求容量 <code>sum / 2</code> 背包能装的最大重量（最值问题）。</li>
          <li><strong>494. 目标和</strong>：将元素分成正数集合与负数集合，求装满容量 <code>(target + sum) / 2</code> 的方案数（组合计数问题）。</li>
          <li><strong>474. 一和零</strong>：背包容量有两个维度（0 的个数 m 和 1 的个数 n），多维费用 0/1 背包。</li>
        </ul>`,
      ],
      [
        '四大应用题模型对照矩阵',
        `<table>
          <thead>
            <tr><th>题目</th><th>背包容量 target</th><th>物品重量/价值</th><th>状态转移方程</th><th>初始化</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>416. 分割等和子集</strong></td><td><code>sum / 2</code></td><td><code>w=nums[i], v=nums[i]</code></td><td><code>dp[j] = max(dp[j], dp[j-w]+v)</code></td><td><code>dp 全 0</code></td></tr>
            <tr><td><strong>1049. 最后的石头 II</strong></td><td><code>sum / 2</code></td><td><code>w=stones[i], v=stones[i]</code></td><td><code>dp[j] = max(dp[j], dp[j-w]+v)</code></td><td><code>dp 全 0</code></td></tr>
            <tr><td><strong>494. 目标和</strong></td><td><code>(sum+target)/2</code></td><td><code>w=nums[i]</code></td><td><code>dp[j] += dp[j - w]</code> (累加方案)</td><td><code>dp[0] = 1</code></td></tr>
            <tr><td><strong>474. 一和零</strong></td><td><code>(m, n)</code> 二维</td><td><code>(count0, count1), v=1</code></td><td><code>dp[i][j] = max(dp[i][j], dp[i-c0][j-c1]+1)</code></td><td><code>dp 全 0</code></td></tr>
          </tbody>
        </table>`,
      ],
      [
        '装满背包的两种问题类型区分',
        `<div class="highlight-box">
          <ul>
            <li><strong>求装满背包的最大价值</strong>：<code>dp[j] = max(dp[j], dp[j - weight[i]] + value[i])</code>，初始化 <code>dp[0]=0</code>。</li>
            <li><strong>求装满背包有多少种方法</strong>：<code>dp[j] += dp[j - nums[i]]</code>，初始化 <code>dp[0]=1</code>（装满容量为 0 的背包只有 1 种方法，即什么都不装）。</li>
          </ul>
        </div>`,
      ],
    ],
  },

  // 7. 完全背包理论基础
  {
    id: 'complete-knapsack-theory',
    name: '完全背包理论基础',
    description: '完全背包：每件物品可以使用无限次，容量正序遍历的数学原理。',
    icon: '🧺',
    sections: [
      [
        '完全背包问题定义',
        `<p>有 <code>N</code> 种物品和一个容量为 <code>V</code> 的背包，每种物品都有<strong>无限件可用</strong>。求放入背包的所有物品总价值最大。</p>`,
      ],
      [
        '0/1 背包 vs 完全背包核心代码对比',
        `<table>
          <thead>
            <tr><th>背包类型</th><th>核心遍历循环</th><th>遍历方向</th><th>原因</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>0/1 背包</strong></td><td><code>for (int j = V; j >= weight[i]; j--)</code></td><td><span class="tag-amber">倒序遍历</span></td><td>防止同一件物品被多次添加</td></tr>
            <tr><td><strong>完全背包</strong></td><td><code>for (int j = weight[i]; j <= V; j++)</code></td><td><span class="tag-emerald">正序遍历</span></td><td>正需要利用同层已被更新的状态支持物品多次添加</td></tr>
          </tbody>
        </table>`,
      ],
      [
        '完全背包核心模板代码',
        `<pre><code>int[] dp = new int[bagWeight + 1];

// 先遍历物品，再正序遍历背包容量
for (int i = 0; i < weight.length; i++) {
    for (int j = weight[i]; j <= bagWeight; j++) {
        dp[j] = Math.max(dp[j], dp[j - weight[i]] + value[i]);
    }
}
return dp[bagWeight];</code></pre>`,
      ],
    ],
  },

  // 8. 动规周总结（四）
  {
    id: 'dp-week-summary-4',
    name: '动规周总结（四）',
    description: '完全背包之组合数 vs 排列数遍历顺序深度辨析。',
    icon: '🧭',
    sections: [
      [
        '组合数 vs 排列数的核心本质',
        `<div class="highlight-box">
          <p>在完全背包的方案数累加问题中，<strong>遍历顺序直接决定了求的是组合数还是排列数</strong>：</p>
          <ul>
            <li><strong>组合数（不强调顺序，如 {1,2} 和 {2,1} 视为同一种）</strong>：<strong>外层遍历物品，内层遍历背包容量</strong>。</li>
            <li><strong>排列数（强调顺序，如 (1,2) 和 (2,1) 视为不同方法）</strong>：<strong>外层遍历背包容量，内层遍历物品</strong>。</li>
          </ul>
        </div>`,
      ],
      [
        '典型题目对照表',
        `<table>
          <thead>
            <tr><th>题目</th><th>类型</th><th>外层循环</th><th>内层循环</th><th>递推公式</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>518. 零钱兑换 II</strong></td><td><span class="tag-emerald">组合数</span></td><td><code>for coin in coins</code> (物品)</td><td><code>for j from coin to amount</code> (容量)</td><td><code>dp[j] += dp[j - coin]</code></td></tr>
            <tr><td><strong>377. 组合总和 Ⅳ</strong></td><td><span class="tag-purple">排列数</span></td><td><code>for j from 1 to target</code> (容量)</td><td><code>for num in nums</code> (物品)</td><td><code>dp[j] += dp[j - num]</code></td></tr>
            <tr><td><strong>70. 爬楼梯进阶版</strong></td><td><span class="tag-purple">排列数</span></td><td><code>for j from 1 to n</code> (容量)</td><td><code>for step from 1 to m</code> (物品)</td><td><code>dp[j] += dp[j - step]</code></td></tr>
          </tbody>
        </table>`,
      ],
      [
        '为什么外层物品求的是组合数？',
        `<p>因为外层遍历物品时，物品 1 只会在第一轮所有背包中出现，之后再加入物品 2。永远是 1 先被考虑，2 后被考虑，绝不可能产生 <code>[2, 1]</code> 这种先 2 后 1 的排列，因此天然排除了顺序重排，得到的一定是纯粹的<strong>组合数</strong>！</p>`,
      ],
    ],
  },

  // 9. 动规周总结（五）
  {
    id: 'dp-week-summary-5',
    name: '动规周总结（五）',
    description: '完全背包之零钱兑换（最值）与单词拆分（逻辑判定）总结。',
    icon: '🧭',
    sections: [
      [
        '完全背包最值与逻辑题型回顾',
        `<ul>
          <li><strong>322. 零钱兑换</strong>：凑成总金额的最少硬币数，<code>dp[j] = min(dp[j], dp[j - coin] + 1)</code>。</li>
          <li><strong>279. 完全平方数</strong>：凑成整数 n 的最少完全平方数个数，物品为 <code>1, 4, 9, 16...</code>。</li>
          <li><strong>139. 单词拆分</strong>：字符串 s 能否被字典中单词组合而成，完全背包排列逻辑判定。</li>
        </ul>`,
      ],
      [
        '最少硬币/平方数的初始化与越界处理',
        `<p>由于递推公式采用 <code>min</code> 取最小值，如果初始化为 0 会导致结果全被 0 覆盖，因此除 <code>dp[0]=0</code> 外，其余必须初始化为极大值 <code>Integer.MAX_VALUE</code>（注意防加 1 溢出）：</p>
        <pre><code>int[] dp = new int[amount + 1];
Arrays.fill(dp, Integer.MAX_VALUE);
dp[0] = 0;

for (int coin : coins) {
    for (int j = coin; j <= amount; j++) {
        if (dp[j - coin] != Integer.MAX_VALUE) {
            dp[j] = Math.min(dp[j], dp[j - coin] + 1);
        }
    }
}
return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];</code></pre>`,
      ],
      [
        '单词拆分的排列性质',
        `<p>单词拆分必须外层遍历字符串长度（容量），内层遍历字典（物品），因为单词拼接强调前后出现次序，是典型的排列模型：</p>
        <pre><code>for (int i = 1; i <= s.length(); i++) { // 容量
    for (int j = 0; j < i; j++) {       // 分割点
        String word = s.substring(j, i);
        if (wordSet.contains(word) && dp[j]) {
            dp[i] = true;
            break;
        }
    }
}</code></pre>`,
      ],
    ],
  },

  // 10. 多重背包理论基础
  {
    id: 'multiple-knapsack-theory',
    name: '多重背包理论基础',
    description: '多重背包：有限件数背包模型、展开法与二进制拆分优化。',
    icon: '📦',
    sections: [
      [
        '多重背包问题定义',
        `<p>有 <code>N</code> 种物品和一个容量为 <code>V</code> 的背包。第 <code>i</code> 种物品最多有 <code>nums[i]</code> 件可用，每件重量是 <code>weight[i]</code>，价值是 <code>value[i]</code>。求解将哪些物品装入背包可使总价值最大。</p>`,
      ],
      [
        '核心思路一：扁平化展开为 0/1 背包',
        `<p>把数量为 <code>nums[i]</code> 的同类物品，在数组中直接平铺展开成 <code>nums[i]</code> 个独立的物品，直接套用 0/1 背包一维倒序模板：</p>
        <pre><code>for (int i = 0; i < weight.length; i++) { // 遍历物品
    for (int j = bagWeight; j >= weight[i]; j--) { // 倒序遍历容量
        for (int k = 1; k <= nums[i] && (j - k * weight[i] >= 0); k++) {
            dp[j] = Math.max(dp[j], dp[j - k * weight[i]] + k * value[i]);
        }
    }
}</code></pre>`,
      ],
      [
        '核心思路二：二进制拆分优化 (O(N·log C))',
        `<p>利用二进制的权值叠加原理，把数量为 <code>C</code> 的物品拆分成 <code>1, 2, 4, 8, ..., 2^k, R</code> 份。任何 <code>1~C</code> 之间的数字都可以由这些份数精确拼出，将复杂度由 <code>O(N·C)</code> 骤降为 <code>O(N·log C)</code>！</p>`,
      ],
    ],
  },

  // 11. 背包问题总结篇
  {
    id: 'knapsack-summary',
    name: '背包问题总结篇',
    description: '背包大满贯：0/1、完全、多重背包及组合/排列/最值公式全景终极对照表。',
    icon: '🏁',
    sections: [
      [
        '背包问题全景终极对照大表',
        `<table>
          <thead>
            <tr><th>问题类型</th><th>物品数量</th><th>容量遍历顺序</th><th>外层/内层顺序</th><th>核心递推公式</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>0/1 背包 (最值)</strong></td><td>每个 1 件</td><td><span class="tag-amber">倒序</span> <code>V -> w</code></td><td>先物品/先容量皆可</td><td><code>dp[j] = max(dp[j], dp[j-w]+v)</code></td></tr>
            <tr><td><strong>0/1 背包 (方案数)</strong></td><td>每个 1 件</td><td><span class="tag-amber">倒序</span> <code>V -> w</code></td><td>先物品/先容量皆可</td><td><code>dp[j] += dp[j-w]</code></td></tr>
            <tr><td><strong>完全背包 (最值)</strong></td><td>每个无限件</td><td><span class="tag-emerald">正序</span> <code>w -> V</code></td><td>先物品/先容量皆可</td><td><code>dp[j] = max(dp[j], dp[j-w]+v)</code></td></tr>
            <tr><td><strong>完全背包 (组合数)</strong></td><td>每个无限件</td><td><span class="tag-emerald">正序</span> <code>w -> V</code></td><td><span class="tag">先物品，后背包</span></td><td><code>dp[j] += dp[j-w]</code></td></tr>
            <tr><td><strong>完全背包 (排列数)</strong></td><td>每个无限件</td><td><span class="tag-emerald">正序</span> <code>w -> V</code></td><td><span class="tag-purple">先背包，后物品</span></td><td><code>dp[j] += dp[j-w]</code></td></tr>
            <tr><td><strong>多重背包</strong></td><td>每个 C[i] 件</td><td><span class="tag-amber">倒序</span></td><td>展开为 0/1 背包</td><td><code>dp[j] = max(dp[j], dp[j-k*w]+k*v)</code></td></tr>
          </tbody>
        </table>`,
      ],
      [
        '背包心法决策树',
        `<div class="highlight-box">
          <p>拿到背包题，灵魂三问：</p>
          <ol>
            <li><strong>物品能用几次？</strong> 1 次用 0/1 背包（倒序）；无限次用完全背包（正序）。</li>
            <li><strong>要求什么指标？</strong> 求最值用 <code>max/min</code>；求装满方案数用 <code>+=</code>。</li>
            <li><strong>如果是求方案数，讲究顺序吗？</strong> 讲究顺序（排列）先容量后物品；不讲顺序（组合）先物品后容量。</li>
          </ol>
        </div>`,
      ],
    ],
  },

  // 12. 动规周总结（六）
  {
    id: 'dp-week-summary-6',
    name: '动规周总结（六）',
    description: '打家劫舍全家桶（线性、环形、树形）与股票买卖入门总结。',
    icon: '🧭',
    sections: [
      [
        '打家劫舍三部曲形态复盘',
        `<ul>
          <li><strong>198. 打家劫舍 (线性)</strong>：<code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>。</li>
          <li><strong>213. 打家劫舍 II (环形)</strong>：首尾相连成环，拆解为两趟线性区间 <code>[0..n-2]</code> 和 <code>[1..n-1]</code> 取最大值。</li>
          <li><strong>337. 打家劫舍 III (树形)</strong>：树形 DP 后序遍历，每个节点返回 <code>int[2]</code>，<code>res[0]</code> 表示不偷当前节点的最大金额，<code>res[1]</code> 表示偷当前节点的最大金额。</li>
        </ul>`,
      ],
      [
        '树形打家劫舍的核心后序递归',
        `<pre><code>// 返回数组 [不偷当前节点最大金额, 偷当前节点最大金额]
public int[] robTree(TreeNode cur) {
    if (cur == null) return new int[]{0, 0};
    int[] left = robTree(cur.left);
    int[] right = robTree(cur.right);
    
    // 偷当前节点，则左右孩子都不能偷
    int val1 = cur.val + left[0] + right[0];
    // 不偷当前节点，左右孩子可偷可不偷，取各自较大者
    int val0 = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
    
    return new int[]{val0, val1};
}</code></pre>`,
      ],
      [
        '买卖股票入门（121 vs 122）',
        `<table>
          <thead>
            <tr><th>题目</th><th>买卖次数</th><th>持有状态 dp[i][0]</th><th>不持有状态 dp[i][1]</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>121. 买卖股票 I</strong></td><td>只买卖 1 次</td><td><code>max(dp[i-1][0], -prices[i])</code></td><td><code>max(dp[i-1][1], dp[i-1][0] + prices[i])</code></td></tr>
            <tr><td><strong>122. 买卖股票 II</strong></td><td>可买卖无数次</td><td><code>max(dp[i-1][0], dp[i-1][1] - prices[i])</code></td><td><code>max(dp[i-1][1], dp[i-1][0] + prices[i])</code></td></tr>
          </tbody>
        </table>`,
      ],
    ],
  },

  // 13. 动规周总结（七）
  {
    id: 'dp-week-summary-7',
    name: '动规周总结（七）',
    description: '股票买卖进阶：最多两次、最多K次、含冷冻期、含手续费状态机全析。',
    icon: '🧭',
    sections: [
      [
        '股票进阶状态机汇总',
        `<ul>
          <li><strong>123. 最多买卖两次</strong>：划分 5 个状态（无操作、第1次持有、第1次不持有、第2次持有、第2次不持有）。</li>
          <li><strong>188. 最多买卖 K 次</strong>：将 5 状态扩展为 <code>2k+1</code> 状态数组，奇数代表第 k 次持有，偶数代表第 k 次不持有。</li>
          <li><strong>309. 买卖股票含冷冻期</strong>：卖出股票后需冷冻 1 天才能买入，划分 4 大精细状态。</li>
          <li><strong>714. 买卖股票含手续费</strong>：在买入或卖出时扣除一次 fee 费用。</li>
        </ul>`,
      ],
      [
        '含冷冻期 (309) 四态转移图',
        `<div class="highlight-box">
          <ul>
            <li><strong>状态 0 (持有股票)</strong>：<code>dp[i][0] = max(dp[i-1][0], dp[i-1][3] - p[i], dp[i-1][1] - p[i])</code></li>
            <li><strong>状态 1 (保持卖出状态)</strong>：<code>dp[i][1] = max(dp[i-1][1], dp[i-1][3])</code></li>
            <li><strong>状态 2 (今天卖出股票)</strong>：<code>dp[i][2] = dp[i-1][0] + p[i]</code></li>
            <li><strong>状态 3 (冷冻期状态)</strong>：<code>dp[i][3] = dp[i-1][2]</code></li>
          </ul>
        </div>`,
      ],
    ],
  },

  // 14. 股票问题总结篇
  {
    id: 'stock-summary',
    name: '股票问题总结篇',
    description: '六大股票买卖专题横向大对比与通用状态转移推导大表。',
    icon: '📈',
    sections: [
      [
        '六大股票买卖问题全景横向对照大表',
        `<table>
          <thead>
            <tr><th>题目</th><th>交易限制</th><th>核心状态数</th><th>状态转移差异点</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>121. 买卖股票 I</strong></td><td>最多 1 次</td><td>2 (持有/不持有)</td><td>买入时本金始终为 0：<code>-prices[i]</code></td></tr>
            <tr><td><strong>122. 买卖股票 II</strong></td><td>无限制</td><td>2 (持有/不持有)</td><td>买入可继承前次收益：<code>dp[i-1][1] - prices[i]</code></td></tr>
            <tr><td><strong>123. 买卖股票 III</strong></td><td>最多 2 次</td><td>5 状态 (0..4)</td><td><code>dp[i][2k+1]</code> 与 <code>dp[i][2k+2]</code> 展开</td></tr>
            <tr><td><strong>188. 买卖股票 IV</strong></td><td>最多 K 次</td><td>2K + 1 状态</td><td>双层循环更新 <code>j=1,3..2k-1</code> 与 <code>j=2,4..2k</code></td></tr>
            <tr><td><strong>309. 含冷冻期</strong></td><td>卖出后冷冻 1 天</td><td>4 状态 (细分状态)</td><td>买入只能在冷冻期后或保持不持有之后</td></tr>
            <tr><td><strong>714. 含手续费</strong></td><td>每次交易扣手续费</td><td>2 (持有/不持有)</td><td>卖出时额外 <code>- fee</code></td></tr>
          </tbody>
        </table>`,
      ],
    ],
  },

  // 15. 编辑距离总结篇
  {
    id: 'edit-distance-summary',
    name: '编辑距离总结篇',
    description: '子序列匹配与增删改查四部曲：判断子序列、不同子序列、两个字符串的删除操作、编辑距离。',
    icon: '✍️',
    sections: [
      [
        '编辑距离与子序列四部曲进阶图',
        `<table>
          <thead>
            <tr><th>题目</th><th>核心问题</th><th>状态定义 dp[i][j]</th><th>字符相等时</th><th>字符不相等时</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>392. 判断子序列</strong></td><td>s 是否为 t 的子序列</td><td>以 i-1, j-1 结尾的匹配长度</td><td><code>dp[i-1][j-1] + 1</code></td><td><code>dp[i][j-1]</code> (t 模拟删除)</td></tr>
            <tr><td><strong>115. 不同的子序列</strong></td><td>t 在 s 中出现次数</td><td>s[0..i-1] 中出现 t[0..j-1] 方案数</td><td><code>dp[i-1][j-1] + dp[i-1][j]</code></td><td><code>dp[i-1][j]</code> (s 删除字符)</td></tr>
            <tr><td><strong>583. 两个字符串删除</strong></td><td>使两字符串相同的最少删除步数</td><td>使 s[0..i-1] 与 t[0..j-1] 相同的最少删除数</td><td><code>dp[i-1][j-1]</code></td><td><code>min(dp[i-1][j]+1, dp[i][j-1]+1)</code></td></tr>
            <tr><td><strong>72. 编辑距离</strong></td><td>转换 s 为 t 的最少操作（增删改）</td><td>s[0..i-1] 转换为 t[0..j-1] 最小操作数</td><td><code>dp[i-1][j-1]</code></td><td><code>min(增/删, 替换) + 1</code></td></tr>
          </tbody>
        </table>`,
      ],
      [
        '编辑距离 (72) 三大操作的几何转移',
        `<pre><code>if (s.charAt(i - 1) == t.charAt(j - 1)) {
    dp[i][j] = dp[i - 1][j - 1]; // 字符相等，不需任何操作
} else {
    dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // 操作一：s 删除一个字符（等价于 t 增加）
        Math.min(
            dp[i][j - 1] + 1,   // 操作二：t 删除一个字符（等价于 s 增加）
            dp[i - 1][j - 1] + 1 // 操作三：替换字符
        )
    );
}</code></pre>`,
      ],
    ],
  },

  // 16. 动态规划总结篇
  {
    id: 'dp-final-summary',
    name: '动态规划总结篇',
    description: '动态规划全景复盘：基础、背包、打家劫舍、股票、子序列各大流派题型地图。',
    icon: '🏁',
    sections: [
      [
        '动态规划全景知识图谱',
        `<p>动态规划的核心题型可划分为以下 6 大流派：</p>
        <ol>
          <li><strong>基础线性 & 网格 DP</strong>：斐波那契、爬楼梯、最小花费、不同路径 I/II、整数拆分、不同 BST。</li>
          <li><strong>背包问题家族</strong>：0/1 背包、完全背包（组合/排列/最值）、多重背包、二维费用背包。</li>
          <li><strong>打家劫舍家族</strong>：线性打家劫舍、环形打家劫舍、树形打家劫舍。</li>
          <li><strong>股票买卖家族</strong>：1次、多次、2次、K次、冷冻期、手续费。</li>
          <li><strong>连续/不连续子序列</strong>：最长递增子序列 (LIS)、最长连续递增序列、最长重复子数组、最长公共子序列 (LCS)、最大子数组和。</li>
          <li><strong>编辑距离与回文串</strong>：判断子序列、不同子序列、两个字符串删除、编辑距离、回文子串、最长回文子序列。</li>
        </ol>`,
      ],
      [
        '动规解题通关秘籍',
        `<div class="highlight-box">
          <p><strong>遇到任何动态规划问题，保持冷静，走完五部曲：</strong></p>
          <p>1. 状态定义清楚吗？每个维度是什么物理意义？<br/>
             2. 转移方程能从历史已知小状态闭环推导吗？<br/>
             3. 初始地基是否精准？首行首列有无漏洞？<br/>
             4. 遍历方向（正序/倒序）能否保证所需状态已计算？<br/>
             5. 打印 <code>dp</code> 数组核对！</p>
        </div>`,
      ],
    ],
  },
];
