/**
 * 左程云算法通关课 Class 064: Dijkstra 算法及其扩展
 * 体系化名师讲义与深度解析 (包含题目详情、算法原理、时间复杂度与解题关键)
 */

export const GRAPH_064_PROBLEMS = {
  networkDelayTime064: {
    title: 'Code01: 网络延迟时间 (Network Delay Time · LeetCode 743)',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">📡 网络延迟时间 (LeetCode 743 / Class 064 Code01)</h3>
        <p>有 <code>n</code> 个网络节点，标记为 <code>1</code> 到 <code>n</code>。给你一个列表 <code>times</code>，表示信号经过有向边的传递时间。现在从某个节点 <code>k</code> 发出一个信号。需要多久才能使所有节点都收到信号？如果不能使所有节点收到信号，返回 <code>-1</code>。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>单源最短路经典模版</b>：从源点 <code>k</code> 出发计算到达全网所有节点的最短耗时 <code>dist[1..n]</code>。</li>
          <li><b>小根堆贪心波前</b>：每次从小根堆弹出全局距离最小的未锁定节点 <code>(u, d)</code>，其距离已被贪心性质锁定（非负权图无后效性）。</li>
          <li><b>全网覆盖时间</b>：所有节点都收到信号的时间等于全网最晚收到的节点时间，即 <code>max(dist[1..n])</code>。若存在 <code>dist[i] = ∞</code>，说明全网不可达，返回 <code>-1</code>。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #38bdf8; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：时间复杂度 <code>O(M log M)</code>（M 为边数），空间复杂度 <code>O(N + M)</code>。
        </div>
      </div>
    `,
  },

  pathMinEffort064: {
    title: 'Code02: 最小体力消耗路径 (Path With Minimum Effort · LeetCode 1631)',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🧗 最小体力消耗路径 (LeetCode 1631 / Class 064 Code02)</h3>
        <p>你准备参加一项远足活动。你位于网格左上角 <code>(0, 0)</code>，目标到达右下角 <code>(R-1, C-1)</code>。一条路径耗费的<b>体力</b>定义为路径上相邻两格之间的<b>绝对高度差的最大值</b>。求到达终点所需的<b>最小</b>体力消耗。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>瓶颈最短路模型 (MiniMax)</b>：传统最短路松弛是加法 <code>dist[u] + w</code>，而本题是瓶颈松弛 <code>max(dist[u], |h1 - h2|)</code>。</li>
          <li><b>Dijkstra 依然适用性</b>：因为瓶颈函数同样具有单调非递减性，小根堆弹出的当前全局瓶颈最小节点必然收敛。</li>
          <li><b>4 向网格图隐式建图</b>：每个格子向上下左右相邻格连边，无需显式存图，堆内存储 <code>(r, c, effort)</code>。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：网格大小 <code>R × C</code>，时间复杂度 <code>O(R × C log(R × C))</code>，空间复杂度 <code>O(R × C)</code>。
        </div>
      </div>
    `,
  },

  swimInRisingWater064: {
    title: 'Code03: 水位上升的泳池中游泳 (Swim In Rising Water · LeetCode 778)',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🏊 水位上升的泳池中游泳 (LeetCode 778 / Class 064 Code03)</h3>
        <p>在一个 <code>N × N</code> 的网格中，每个格子的高度 <code>grid[r][c]</code> 都不相同。现在下雨了，在时刻 <code>t</code>，整个网格的水位高度为 <code>t</code>。只有当水位不低于相邻格高度时才能游过去。求从 <code>(0, 0)</code> 到 <code>(N-1, N-1)</code> 所需的最少时间。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>定向淹没与最短路</b>：水从起点开始向四周漫延，到达相邻格子需要等待水位上升到该格高度与当前时刻的最大值：<code>max(t, grid[nr][nc])</code>。</li>
          <li><b>优先队列小根堆定向收敛</b>：每次弹出当前能接触到的水位最低的格子，就像水向低洼处流淌一样。</li>
          <li><b>首次到达终点即最优解</b>：一旦从堆顶弹出的节点为终点 <code>(N-1, N-1)</code>，其记录的时刻即为全局最优答案。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：时间复杂度 <code>O(N² log N)</code>，空间复杂度 <code>O(N²)</code>。
        </div>
      </div>
    `,
  },

  layeredDijkstra064: {
    title: 'Code04: 飞行路线 (Layered Graph / 洛谷 P4568)',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">✈️ 飞行路线 · 分层图最短路 (洛谷 P4568 / Class 064 Code04)</h3>
        <p>Alice 想乘飞机从城市 <code>s</code> 到 <code>t</code>。航空公司提供 <code>k</code> 次免费搭乘飞机的机会。求从 <code>s</code> 到 <code>t</code> 的最小花费。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>分层图建模 (扩维思想)</b>：单点状态无法记录已经用了几次免费票，扩维为二维状态 <code>(u, used)</code>，表示到达城市 <code>u</code> 且消耗了 <code>used</code> 次免票机会。</li>
          <li><b>双转移决策</b>：
            <ul>
              <li>同层正常买票转移：<code>(u, used) ➔ (v, used)</code>，权值为边权 <code>w</code>；</li>
              <li>跨层免费跳跃转移：<code>(u, used) ➔ (v, used + 1)</code>（若 <code>used < k</code>），权值为 <code>0</code>。</li>
            </ul>
          </li>
          <li><b>多层统一跑堆优化 Dijkstra</b>：二维距离数组 <code>dist[u][used]</code>，终点答案为 <code>min(dist[t][0..k])</code>。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：总状态数 <code>N × (K + 1)</code>，时间复杂度 <code>O((M × K) log(N × K))</code>。
        </div>
      </div>
    `,
  },

  evChargeDijkstra064: {
    title: 'Code05: 电动车游历城市最小费用 (LeetCode LCP 35)',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🔋 电动车游历城市最小费用 (LeetCode LCP 35 / Class 064 Code05)</h3>
        <p>小明驾驶一辆最大电池容量为 <code>cnt</code> 的电动车从城市 <code>start</code> 到 <code>end</code>。在每个城市 <code>u</code> 每充 1 格电耗时 <code>charge[u]</code>，在道路 <code>(u, v, w)</code> 行驶消耗 <code>w</code> 格电且耗时 <code>w</code>。求到达终点的最短总时间。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>状态扩维 <code>(city, power)</code></b>：当前在哪个城市以及剩余多少格电量。</li>
          <li><b>双动作状态分支</b>：
            <ul>
              <li><b>动作一（原地充 1 格电）</b>：若 <code>power < cnt</code>，转移到 <code>(city, power + 1)</code>，增加代价 <code>charge[city]</code>；</li>
              <li><b>动作二（沿道路行驶）</b>：对所有出边 <code>(to, w)</code>，若 <code>power >= w</code>，转移到 <code>(to, power - w)</code>，增加代价 <code>w</code>。</li>
            </ul>
          </li>
          <li><b>Dijkstra 最短路求解</b>：每一步代价均为正数，通过小根堆维护 <code>(cost, city, power)</code>，首次到达 <code>(end, any_power)</code> 即是最优解。</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #ec4899; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：状态空间 <code>N × cnt</code>，时间复杂度 <code>O((N × cnt + M × cnt) log(N × cnt))</code>。
        </div>
      </div>
    `,
  },

  stateCompressionBfs064: {
    title: 'Code06: 访问所有节点的最短路径 (LeetCode 847 / 864)',
    html: `
      <div style="font-size: 13.5px; line-height: 1.65; color: #1e293b;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🗝️ 访问所有节点的最短路径 (LeetCode 847 / Class 064 Code06)</h3>
        <p>存在一个由 <code>n</code> 个节点组成的无向连通图。返回能够访问所有节点的最短路径长度。你可以在任一节点开始和停止，也可以多次重访节点并重用边。</p>

        <h4 style="color: #0369a1; margin-bottom: 6px;">💡 左程云名师点拨与解题关键</h4>
        <ul style="padding-left: 20px; margin: 4px 0;">
          <li><b>位运算状态压缩 (Bitmask)</b>：用一个整数的低 <code>n</code> 位代表每个节点是否已被访问（第 <code>i</code> 位为 1 表示节点 <code>i</code> 已访问）。</li>
          <li><b>多源并发入队</b>：因为可以从任意起点出发，初始化时将所有 <code>(u, 1 << u)</code> 并发推入队列，步数为 0。</li>
          <li><b>状态转移与去重</b>：二维访问标记 <code>visited[u][mask]</code>。当转移到相邻节点 <code>v</code> 时，新状态掩码为 <code>mask | (1 << v)</code>。</li>
          <li><b>首次全满即终止</b>：当某一步出队的 <code>mask === (1 << n) - 1</code> 时，当前步数即为全局最短路径！</li>
        </ul>

        <div style="background: #f8fafc; border-left: 4px solid #8b5cf6; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0;">
          <b>复杂度分析</b>：总状态数 <code>N × 2^N</code>，边转移 <code>O(M × 2^N)</code>，多源广搜时间复杂度 <code>O(N² 2^N)</code>。
        </div>
      </div>
    `,
  },
};
