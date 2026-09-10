/**
 * 左神算法通关课 117 ~ 123 倍增与树上高阶问题专题题目描述与原理解析
 */

export const TREE_117_123_PROBLEMS = {
  sparseTable: {
    title: 'ST 表 (Sparse Table) RMQ (Class 117)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3865 【模板】ST 表)</h2>
        <p>给定一个长度为 <code>N</code> 的数列，和 <code>M</code> 次区间最大值询问，要求在 <code>O(1)</code> 常数时间内回答任意区间 <code>[l, r]</code> 的最值。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">倍增状态设计与可重复贡献性质</h3>
        <p>1. <strong>预处理 O(N log N)</strong>：<code>ST[i][j]</code> 表示从 <code>i</code> 开始连续 <code>2^j</code> 个数的最值。状态转移：<code>ST[i][j] = max(ST[i][j-1], ST[i + 2^(j-1)][j-1])</code>。</p>
        <p>2. <strong>常数查询 O(1)</strong>：对于查询 <code>[l, r]</code>，令 <code>k = log2(r - l + 1)</code>。由于最大值满足“重叠不影响结果”（Idempotent 可重复贡献），查询直接返回 <code>max(ST[l][k], ST[r - 2^k + 1][k])</code>。</p>
      </div>
    `,
  },

  treeLca: {
    title: '树上倍增 LCA (Class 118)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3379 【模板】最近公共祖先)</h2>
        <p>给定一棵有根多叉树，求任意两点 <code>u</code> 和 <code>v</code> 的最近公共祖先 (LCA)。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">二进制对齐与同步逼近</h3>
        <p>1. <strong>深度对齐</strong>：若 <code>depth[u] > depth[v]</code>，通过二进制倍增表 <code>up[u][k]</code> 将 <code>u</code> 瞬间拉升到与 <code>v</code> 同一深度。</p>
        <p>2. <strong>同步向上跳跃</strong>：两点同时向上跳 <code>2^k</code> 步，若跳跃后的祖先不同说明未到达 LCA 之上，则同步跳跃；最终 <code>up[u][0]</code> 即为 LCA。</p>
      </div>
    `,
  },

  treeCentroid: {
    title: '树的重心 (Class 120)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (POJ 1655 / 洛谷 P1395)</h2>
        <p>找到树的一个节点，删除该节点后，剩余的所有连通块中<strong>最大连通块的节点数最小</strong>。该节点即为树的重心。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">树形 DP 分支考量</h3>
        <p>对于节点 <code>u</code>，其分裂后的最大连通块来自两部分：</p>
        <ul>
          <li>下方子树：<code>max_{v} size[v]</code></li>
          <li>上方连通块：<code>n - size[u]</code></li>
        </ul>
        <p>树的重心最大连通块大小必定 <code><= n / 2</code>，是点分治算法的基石。</p>
      </div>
    `,
  },

  hld: {
    title: '重链剖分 / 树链剖分 (Class 121)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3384 【模板】重链剖分)</h2>
        <p>将树上任意两点路径上的点权求和/修改，转化为连续区间上的操作，从而接入线段树。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">重儿子与重链顶端 (Two-Pass DFS)</h3>
        <p>1. <strong>DFS 1</strong>：统计子树大小 <code>size</code>，将子树最大的子节点标记为<strong>重儿子 (heavyChild)</strong>。</p>
        <p>2. <strong>DFS 2</strong>：优先遍历重儿子分配连续的 DFS 序 <code>dfn</code>，并记录重链顶端 <code>top</code>。使得整条重链上的所有点在 DFS 序中连续，任意树上路径仅被切分为最多 <code>O(log N)</code> 条连续重链！</p>
      </div>
    `,
  },

  treeDifference: {
    title: '树上差分 (Class 122)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3128 [USACO15DEC] Max Flow P)</h2>
        <p>高频对多条树上路径 <code>(u, v)</code> 上的所有点点权进行 <code>+1</code> 操作，最后统计每个点的最终数值。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">点差分四点操作</h3>
        <p>令 <code>anc = lca(u, v)</code>，更新规则为：</p>
        <ul>
          <li><code>diff[u]++</code>, <code>diff[v]++</code></li>
          <li><code>diff[anc]--</code>, <code>diff[parent[anc]]--</code></li>
        </ul>
        <p>全部路径标记完成后，自底向上做一次子树和统计，即可恢复所有点的真实覆盖权值。</p>
      </div>
    `,
  },

  treeDiameter: {
    title: '树的直径 (Class 123)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (SP1437 / LeetCode 1245)</h2>
        <p>求一棵树中距离最远的两点之间的距离（即树的最长简单路径长度）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">两遍 BFS/DFS 定理证明</h3>
        <p>1. 从任意点 <code>root</code> 出发，找到距离其最远的点 <code>x</code>（点 <code>x</code> 必定是直径的一个端点）。</p>
        <p>2. 从点 <code>x</code> 出发再进行一次 BFS，找到距离 <code>x</code> 最远的点 <code>y</code>。此时 <code>x</code> 到 <code>y</code> 的距离即为树的直径！时间复杂度严格为 <code>O(N)</code>。</p>
      </div>
    `,
  },
};
