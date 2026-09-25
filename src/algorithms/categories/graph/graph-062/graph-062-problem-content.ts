/**
 * 左程云算法通关课 Class 062: 宽度优先遍历及其扩展 (BFS and its Extensions)
 * 涵盖多源广搜、状态空间剪枝、0-1 BFS 双端队列、小根堆三维木桶收缩、双向与反向回溯全路径
 */

export const GRAPH_062_PROBLEMS = {
  asFarFromLand062: {
    title: '地图分析 (As Far from Land as Possible · LeetCode 1162)',
    html: `
      <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述 (LeetCode 1162)</h3>
        <p>你现在手里有一份大小为 <code>n x n</code> 的网格 <code>grid</code>，上面的每个单元格都用 <code>0</code> 和 <code>1</code> 标记好了。其中 <code>0</code> 代表海洋，<code>1</code> 代表陆地。</p>
        <p>请你找出一个海洋单元格，这个海洋单元格到离它最近的陆地单元格的距离是最大的，并返回该距离。如果网格上只有陆地或者只有海洋，请返回 <code>-1</code>。</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
          <strong>算法核心：多源 BFS (Multi-Source BFS)</strong><br/>
          常规 BFS 是从单一源点出发，而本题若对每个海洋做单源 BFS 会退化至 <code>O(N⁴)</code>。<br/>
          <strong>逆向破局思维</strong>：将<strong>所有陆地格子并发作为第 0 层源点同时入队</strong>！由陆地向海洋进行波前同心圆层层扩散，最后被波前访问到的海洋格子，其扩散层数即为全局最大曼哈顿距离！时间复杂度严格 <code>O(N²)</code>。
        </div>
      </div>
    `,
  },

  stickersToSpellWord062: {
    title: '贴纸拼词 (Stickers to Spell Word · LeetCode 691)',
    html: `
      <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述 (LeetCode 691)</h3>
        <p>我们有 <code>n</code> 种不同类型的贴纸。每个贴纸上都有一个小写的英文单词。你想要拼出目标字符串 <code>target</code>，方法是从贴纸中切割单个字母并重新排列它们。如果你愿意，你可以多次使用每种贴纸。</p>
        <p>返回你能拼出 <code>target</code> 的<strong>最少贴纸张数</strong>。如果任务不可能完成，则返回 <code>-1</code>。</p>
        <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 10px 14px; margin: 12px 0;">
          <strong>算法核心：BFS 最短步数探索 + 贪心首字符剪枝</strong><br/>
          将剩余待拼的目标字符串作为图中的“状态”，每使用一张贴纸即走一步转移到新状态。<br/>
          <strong>核心剪枝</strong>：状态转移时，如果任意贴纸都尝试，分支因子过大。<strong>必须贪心锚定当前剩余 target 的首个字符</strong>！只尝试包含该字符的贴纸，既保证拼出该字符，又彻底消除了贴纸选取次序产生的巨量重复置换，大幅剪枝！
        </div>
      </div>
    `,
  },

  minimumObstacles062: {
    title: '到达角落需要移除障碍物的最小数目 (LeetCode 2290)',
    html: `
      <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述 (LeetCode 2290)</h3>
        <p>给你一个下标从 <code>0</code> 开始的二维整数数组 <code>grid</code> ，数组大小为 <code>m x n</code>。每个单元格都是：<code>0</code> 表示空单元格，<code>1</code> 表示可以移除的障碍物。你想要从左上角 <code>(0, 0)</code> 移动到右下角 <code>(m - 1, n - 1)</code>。返回需要移除的<strong>最少障碍物数目</strong>。</p>
        <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 10px 14px; margin: 12px 0;">
          <strong>算法核心：0-1 BFS 双端队列 (Deque Shortest Path)</strong><br/>
          本题边权只有 0（进入空格）和 1（进入障碍物）。<br/>
          若使用优先队列 Dijkstra，复杂度为 <code>O(MN log(MN))</code>。<br/>
          而使用双端队列 <strong>Deque</strong>：
          <ul>
            <li>走 0 权边松弛成功：<strong>插在队头 (push_front)</strong>，与当前节点同批次贪心探索；</li>
            <li>走 1 权边松弛成功：<strong>插在队尾 (push_back)</strong>，作为下一批次探索。</li>
          </ul>
          队列内元素距离始终满足 <code>dist</code> 与 <code>dist + 1</code> 两段性与单调性，时间复杂度线性 <code>O(M × N)</code>！
        </div>
      </div>
    `,
  },

  minimumCostValidPath062: {
    title: '使网格图至少有一条有效路径的最小代价 (LeetCode 1368)',
    html: `
      <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述 (LeetCode 1368)</h3>
        <p>给你一个 <code>m x n</code> 的网格 <code>grid</code>。网格中的每个单元格都有一个数字，表示从该单元格出发的方向：<code>1: 右</code>、<code>2: 左</code>、<code>3: 下</code>、<code>4: 上</code>。你可以花费代价 <code>1</code> 修改任意单元格的箭头指向。求从左上角 <code>(0, 0)</code> 到右下角 <code>(m - 1, n - 1)</code> 的<strong>最小修改代价</strong>。</p>
        <div style="background: #f8fafc; border-left: 4px solid #8b5cf6; padding: 10px 14px; margin: 12px 0;">
          <strong>算法核心：0-1 BFS 边权规约</strong><br/>
          从 <code>(r, c)</code> 移向相邻格子 <code>(nr, nc)</code>：
          <ul>
            <li>若移动方向恰好与该格当前箭头一致：<strong>边权 = 0</strong>，转移代价为 0，插队头！</li>
            <li>若移动方向与当前箭头不一致：需花费代价 1 改箭头，<strong>边权 = 1</strong>，插队尾！</li>
          </ul>
          同样是纯正的 0-1 BFS 模型，天然保持单调性，在 <code>O(M × N)</code> 时间内求出全局最小花费。
        </div>
      </div>
    `,
  },

  trappingRainWaterII062: {
    title: '二维接雨水 II (Trapping Rain Water II · LeetCode 407)',
    html: `
      <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述 (LeetCode 407)</h3>
        <p>给你一个 <code>m x n</code> 的矩阵，其中的值均为非负整数，代表二维高度图，请计算下雨后该地形一共能接多少立方米的雨水。</p>
        <div style="background: #f8fafc; border-left: 4px solid #06b6d4; padding: 10px 14px; margin: 12px 0;">
          <strong>算法核心：小根堆外围收缩木桶短板 (3D Voxel Priority Queue)</strong><br/>
          水往低处流，一个区域能存多少水，取决于包围它的最外围墙壁中<strong>最矮的那块木桶短板</strong>。<br/>
          1. 初始时，将网格四周所有最外层边界格子加入小根堆；<br/>
          2. 每次从小根堆弹出高度最低的格子作为当前木桶短板 <code>(r, c, h)</code>；<br/>
          3. 探查其未访问的四周邻居 <code>(nr, nc)</code>：若邻居地面高度低于当前短板 <code>h</code>，则邻居格积水量为 <code>h - heightMap[nr][nc]</code>；同时该邻居被水注满后对外形成的挡水高度提升为 <code>max(h, heightMap[nr][nc])</code>，入堆；<br/>
          4. 持续收缩直至所有内部网格被探查完毕。时间复杂度 <code>O(MN log(MN))</code>。
        </div>
      </div>
    `,
  },

  wordLadderII062: {
    title: '单词接龙 II (Word Ladder II · LeetCode 126)',
    html: `
      <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述 (LeetCode 126)</h3>
        <p>按字典 <code>wordList</code> 完成从 <code>beginWord</code> 到 <code>endWord</code> 的转换序列，每次只能改变一个字母。求所有从 <code>beginWord</code> 到 <code>endWord</code> 的<strong>最短转换序列</strong>。</p>
        <div style="background: #f8fafc; border-left: 4px solid #ec4899; padding: 10px 14px; margin: 12px 0;">
          <strong>算法核心：BFS 最短路分层建图 + DFS 回溯输出全路径</strong><br/>
          直接在 BFS 中记录完整路径数组会导致巨量内存暴涨与复制开销。<br/>
          <strong>标准两阶段黄金解法</strong>：<br/>
          <strong>阶段 1 (BFS 建图)</strong>：使用 BFS 逐层计算出每个单词离 <code>beginWord</code> 的最短距离 <code>distance[word]</code>，并构建前驱关系图：仅当 <code>distance[next] == distance[cur] + 1</code> 时建立有向边 <code>cur -> next</code>。一旦找到 <code>endWord</code>，该层探索完即停止，确保绝对最短。<br/>
          <strong>阶段 2 (DFS 回溯)</strong>：沿构建好的有向无环图 (DAG)，从 <code>beginWord</code> 递归深度优先回溯到 <code>endWord</code>，无剪枝损耗地收集所有满足最短长度的路径！
        </div>
      </div>
    `,
  },
};
