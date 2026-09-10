/**
 * 左神算法通关课 142 ~ 148 差分约束、同余最短路、二项式反演、康托展开、卡特兰数与 AVL 树题目与解析
 */

export const ADVANCED_142_148_PROBLEMS = {
  diffConstraints: {
    title: '差分约束系统与负环判定 (Class 142)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P5960 【模板】差分约束 / P3385 负环)</h2>
        <p>给定 <code>N</code> 个变量和 <code>M</code> 个形如 <code>x_u - x_v <= w</code> 的不等式，求出一组满足所有约束的整数解，或判定存在矛盾（无解）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">图论最短路建图转化</h3>
        <p>1. <strong>不等式三角剖分</strong>：将 <code>x_u - x_v <= w</code> 移项得 <code>x_u <= x_v + w</code>。这与最短路松弛不等式 <code>dist[u] <= dist[v] + weight(v, u)</code> 完全一致！</p>
        <p>2. <strong>有向边建模</strong>：从变量 <code>v</code> 向变量 <code>u</code> 建立一条权值为 <code>w</code> 的有向边。</p>
        <p>3. <strong>超级源点与负环检测</strong>：建立超级源点 <code>0</code> 向每个变量连权值为 <code>0</code> 的边保证图连通。运行 SPFA 算法，若某个节点的松弛入队次数达到 <code>N</code> 次，说明图中存在<strong>负权环</strong>，对应不等式组产生矛盾、无解！</p>
      </div>
    `,
  },

  congruenceShortestPath: {
    title: '同余最短路 (Class 143)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3403 跳楼机 / P2371 墨墨的等式)</h2>
        <p>给定可走的步长 <code>x, y, z</code>，求在高度区间 <code>[1, H]</code> 内，能够通过 <code>a*x + b*y + c*z</code> 恰好达到的不同高度总数。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">模数取余与图上极小值转化</h3>
        <p>1. <strong>基准模数选取</strong>：选取最小的步长（例如 <code>x</code>）作为模数，将所有可能达到的高度按模 <code>x</code> 的余数分为 <code>0 ~ x-1</code> 共 <code>x</code> 类。</p>
        <p>2. <strong>状态设计</strong>：定义 <code>dist[i]</code> 为仅通过累加 <code>y</code> 和 <code>z</code> 所能达到的<strong>模 x 等于 i 的最小高度</strong>。</p>
        <p>3. <strong>建图与 Dijkstra</strong>：对每个余数 <code>u</code>，向 <code>(u + y) % x</code> 连权为 <code>y</code> 的边，向 <code>(u + z) % x</code> 连权为 <code>z</code> 的边。跑单源最短路求出全部 <code>dist[i]</code>。</p>
        <p>4. <strong>常数时间统计</strong>：一旦求出 <code>dist[i]</code>，所有 <code>dist[i] + k*x <= H</code> 均可合法达到！总方案数即为 <code>sum_{i=0}^{x-1} max(0, floor((H - dist[i]) / x) + 1)</code>。</p>
      </div>
    `,
  },

  binomialInversion: {
    title: '二项式反演 (Class 145)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P4071 排列计数 / 错排问题)</h2>
        <p>求长度为 <code>N</code> 的全排列中，恰好有 <code>M</code> 个位置满足 <code>P[i] == i</code>（不动点）的排列总数。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">二项式反演核心公式</h3>
        <p>设 <code>f(n)</code> 为恰好有 <code>n</code> 个满足条件的方案数，<code>g(n)</code> 为至多或至少 <code>n</code> 个的方案数：</p>
        <p style="text-align: center; font-weight: 700;"><code>f(n) = sum_{k=0}^n (-1)^{n-k} * C(n, k) * g(k)</code></p>
        <p>对于错排问题：先从 <code>N</code> 个位置中选 <code>M</code> 个作为不动点 <code>C(N, M)</code>，剩余 <code>N - M</code> 个位置必须全错排 <code>D(N - M)</code>，利用反演直接得到错排封闭通解：<code>D(k) = k! * sum_{j=0}^k ((-1)^j / j!)</code>。</p>
      </div>
    `,
  },

  cantorExpansion: {
    title: '康托展开与逆康托展开 (Class 146)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P5367 【模板】康托展开)</h2>
        <p>求一个 <code>1 ~ N</code> 的排列在所有 <code>N!</code> 个全排列中的字典序排名，以及已知排名求出对应的原排列。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">阶乘进制编码原理</h3>
        <p>1. <strong>康托展开公式</strong>：设排列为 <code>P[1..N]</code>，对于位置 <code>i</code>，统计在它右侧比它小的元素个数 <code>count_i</code>，排名为：</p>
        <p style="text-align: center; font-weight: 700;"><code>Rank = 1 + sum_{i=1}^N (count_i * (N - i)!)</code></p>
        <p>2. <strong>逆康托展开</strong>：令 <code>Rank - 1</code>，依次除以 <code>(N - i)!</code>，所得商即为右侧未选元素中比当前元素小的元素个数，逐位还原原排列。</p>
      </div>
    `,
  },

  catalanNumber: {
    title: '卡特兰数与格路计数 (Class 147)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P1044 栈 / 括号序列计数)</h2>
        <p>求解合法的出栈序列数、包含 <code>N</code> 对括号的有效匹配序列数、凸 <code>N+2</code> 边形的三角剖分数。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">折线法与通项公式</h3>
        <p>1. <strong>格路翻折原理</strong>：从 <code>(0, 0)</code> 走到 <code>(N, N)</code> 且不穿过对角线 <code>y = x</code> 的路径数。总路径数为 <code>C(2N, N)</code>，任何穿过对角线触碰到 <code>y = x + 1</code> 的非法路径，沿该线翻折后一一对应从 <code>(-1, 1)</code> 到 <code>(N, N)</code> 的路径（共 <code>C(2N, N-1)</code> 条）。</p>
        <p>2. <strong>卡特兰数公式</strong>：</p>
        <p style="text-align: center; font-weight: 700;"><code>C_N = C(2N, N) - C(2N, N-1) = (1 / (N + 1)) * C(2N, N)</code></p>
      </div>
    `,
  },

  avlTree: {
    title: 'AVL 平衡二叉搜索树 (Class 148)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3369 【模板】普通平衡树)</h2>
        <p>维持二叉搜索树的严格高度平衡，支持 <code>O(log N)</code> 时间内的插入、删除、查询数值排名及第 K 大元素。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">平衡因子与四种自旋操作</h3>
        <p>定义节点的平衡因子 <code>balance = height(left) - height(right)</code>。若 <code>|balance| > 1</code> 触发再平衡旋转：</p>
        <ul>
          <li><strong>LL 型 (左偏左重)</strong>：右单旋 (Rotate Right)</li>
          <li><strong>RR 型 (右偏右重)</strong>：左单旋 (Rotate Left)</li>
          <li><strong>LR 型 (左偏右重)</strong>：左子树先左旋转化为 LL，再整体右旋</li>
          <li><strong>RL 型 (右偏左重)</strong>：右子树先右旋转化为 RR，再整体左旋</li>
        </ul>
      </div>
    `,
  },
};
