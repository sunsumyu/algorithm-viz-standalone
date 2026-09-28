/**
 * 左程云算法通关课 Class 061: 最短路全解专题
 * 体系化名师讲义与深度解析 (包含题目详情、算法原理、时间复杂度与解题关键)
 */

export const GRAPH_061_PROBLEMS = {
  dijkstraBasic061: {
    title: 'Code01: 朴素 Dijkstra 算法 (Dijkstra Naive · O(V²))',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">📍 朴素 Dijkstra 算法 (Class 061 Code01)</h3>
        <p>给定一个无负权边的有向带权图和源点 <code>s</code>，求从源点到所有其他顶点的最短路径长度。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>贪心选点本质</b>：每一轮从未访问集合中选出 <code>dist[u]</code> 最小的节点 <code>u</code>，其距离已被贪心性质锁定。</li>
          <li><b>稠密图最优选择</b>：当图为稠密图 (<code>E ≈ V²</code>) 时，朴素版时间复杂度 <code>O(V²)</code> 反而优于堆优化版的 <code>O(E log V) = O(V² log V)</code>，且无需额外优先队列开销。</li>
          <li><b>三角不等式松弛</b>：对 <code>u</code> 的所有出边 <code>(u, v, w)</code> 执行 <code>dist[v] = min(dist[v], dist[u] + w)</code>。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #38bdf8; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：时间复杂度 <code>O(V²)</code>，空间复杂度 <code>O(V)</code>。
        </div>
      </div>
    `,
  },

  dijkstraHeap061: {
    title: 'Code02: 堆优化 Dijkstra 算法 (Dijkstra Heap · O(E log V))',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">⛰️ 堆优化 Dijkstra 算法 (Class 061 Code02)</h3>
        <p>在稀疏图 (<code>E ≪ V²</code>) 中，朴素寻找最小节点需要 <code>O(V)</code>，改用优先队列（小根堆）维护波前可将寻优时间降至 <code>O(log V)</code>。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>惰性删除策略 (Lazy Deletion)</b>：由于堆中可能同时存在同一顶点的多个距离记录，出堆时若 <code>visited[u] === true</code> 则直接跳过。</li>
          <li><b>动态波前扩展</b>：每次出堆全局最小距离点，遍历出边并尝试更新更短距离，成功则推入新三元组 <code>(d, v)</code>。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：时间复杂度 <code>O(E log V)</code>，空间复杂度 <code>O(V + E)</code>。
        </div>
      </div>
    `,
  },

  bellmanFord061: {
    title: 'Code03: Bellman-Ford 算法 (支持负权边的单源最短路)',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🛡️ Bellman-Ford 算法 (Class 061 Code03)</h3>
        <p>Dijkstra 无法处理包含负权边的图。Bellman-Ford 基于动态规划思想，通过对全图所有边进行 <code>V - 1</code> 轮松弛求解最短路。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>边数限制定理</b>：在一个包含 <code>V</code> 个顶点的无负环图中，任意简单最短路最多只包含 <code>V - 1</code> 条边。</li>
          <li><b>轮次松弛含义</b>：第 <code>k</code> 轮松弛保证了至多经过 <code>k</code> 条边的最短路径全部收敛。</li>
          <li><b>提前早停优化</b>：若某轮松弛没有任何距离发生更新，说明所有最短路已提前收敛，可直接终止退出。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：时间复杂度 <code>O(V × E)</code>，空间复杂度 <code>O(V)</code>。
        </div>
      </div>
    `,
  },

  spfa061: {
    title: 'Code04: SPFA 算法 (队列优化的 Bellman-Ford)',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">⚡ SPFA 算法 (Class 061 Code04)</h3>
        <p>Bellman-Ford 每轮遍历所有边存在大量无效检查。SPFA 仅将<b>距离被成功更新的节点</b>推入队列，用其出边去松弛相邻点。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>在队标记 <code>inQueue</code></b>：防止同一节点被重复推入队列，出队时置为 false，入队时置为 true。</li>
          <li><b>常数级飞跃</b>：在常规随机图上，SPFA 平均时间复杂度接近 <code>O(k × E)</code> (<code>k ≈ 2</code>)，性能媲美甚至超越 Dijkstra。</li>
          <li><b>网格图卡常警惕</b>：精心构造的网格图或菊花图可能使 SPFA 退化至 <code>O(V × E)</code>。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #8b5cf6; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：平均时间复杂度 <code>O(k × E)</code>，最坏 <code>O(V × E)</code>，空间复杂度 <code>O(V)</code>。
        </div>
      </div>
    `,
  },

  floyd061: {
    title: 'Code05: Floyd-Warshall 算法 (全源最短路径 O(V³))',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌐 Floyd-Warshall 算法 (Class 061 Code05)</h3>
        <p>求解图中<b>任意两点之间的最短路径</b>。基于动态规划阶段推进，三重循环极为简练。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>最外层必须是中转点 <code>k</code></b>：<code>dp[k][i][j]</code> 代表只允许使用 <code>1..k</code> 作为中间顶点的最短路。</li>
          <li><b>状态转移方程</b>：<code>dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j])</code>。</li>
          <li><b>空间压缩自底向上</b>：由于更新只依赖第 <code>k-1</code> 阶段数据且同行同列不被破坏，可直接在二维矩阵原地更新。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #06b6d4; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：时间复杂度 <code>O(V³)</code>，空间复杂度 <code>O(V²)</code>。
        </div>
      </div>
    `,
  },

  negativeCycle061: {
    title: 'Code06: 负权环判定算法 (洛谷 P3385)',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">⚠️ 负权环判定 (洛谷 P3385 / Class 061 Code06)</h3>
        <p>若图中存在环路使得沿环走一圈总权值为负数，则最短路不存在（可无限循环绕圈获得负无穷代价）。检测图中是否存在负权环。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>第 <code>V</code> 轮松弛准则</b>：无负环图在 <code>V - 1</code> 轮松弛后必须完全收敛；若在第 <code>V</code> 轮依然存在边可被松弛，必然存在负环！</li>
          <li><b>SPFA 入队计数判定</b>：记录每个顶点入队的次数 <code>cnt[u]</code>，若某节点入队次数 <code>cnt[u] >= V</code>，判定图中存在负权回路。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #ef4444; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：时间复杂度 <code>O(V × E)</code>，空间复杂度 <code>O(V)</code>。
        </div>
      </div>
    `,
  },
};
