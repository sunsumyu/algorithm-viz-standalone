/**
 * 左神算法通关课 173 ~ 178 网络流最大流、最小费用最大流、二分图匹配、KM 算法、弦图与圆方树 题目与解析
 */

export const ADVANCED_173_178_PROBLEMS = {
  dinicMaxFlow: {
    title: '网络流最大流 Dinic 算法 (Class 173)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3376 【模板】网络最大流)</h2>
        <p><strong>网络最大流</strong> 是图论与运筹优化的核心基石。在给定的有向网络 $G=(V, E)$ 中，每条边有非负容量 $c(u, v)$，求从源点 $S$ 到汇点 $T$ 的最大可行流。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">Dinic 三大加速核心机制</h3>
        <ul>
          <li>1. <strong>残量网络与反向边</strong>：每条正向边配套一条初值为 0 的反向边，支持后续增广流退流与反悔撤销。</li>
          <li>2. <strong>层次图分层 (BFS)</strong>：通过广搜为每个节点标注源点最短距离 $dep[u]$。增广流严格限制在 $dep[v] = dep[u] + 1$ 的分层边上，彻底避免零增广死循环。</li>
          <li>3. <strong>多路增广与当前弧优化 (DFS)</strong>：深搜一次性榨干多条增广路径；<code>cur[u]</code> 记录当前遍历到的边下标，避免重复探索已流满或阻塞的无效边，复杂度 $O(V^2 E)$（二分图上为 $O(E \sqrt{V})$）。</li>
        </ul>
      </div>
    `,
  },

  mcmfCostFlow: {
    title: '最小费用最大流 MCMF (Class 174)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3381 【模板】最小费用最大流)</h2>
        <p>在网络流中，每条边不仅有容量上限 $cap(u, v)$，还附带单位流量费用 $cost(u, v)$。反向边的单位费用为 $-cost(u, v)$。目标是在保证达到<strong>最大流</strong>的前提下，使得<strong>总费用最小</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">Edmonds-Karp / SPFA 增广路算法</h3>
        <p>1. <strong>费用最短路检索</strong>：在残量网络中以 $cost$ 为权值，运行 SPFA 寻找从源点 $S$ 到汇点 $T$ 的费用最短增广路。</p>
        <p>2. <strong>流量瓶颈推流</strong>：沿前驱路径记录瓶颈容量 $\Delta = \min_{(u, v)} res(u, v)$，推送流量并累加总费用 $\Delta \times dis[T]$。</p>
        <p>3. <strong>反向费用互为相反数</strong>：反向边费用为负，允许后续流以负费用退回先前较差决策，直到残量网络中不存在可行增广路径。</p>
      </div>
    `,
  },

  hungarianMatching: {
    title: '二分图最大匹配与匈牙利算法 (Class 175)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3386 【模板】二分图最大匹配)</h2>
        <p>给定二分图 $G=(X, Y, E)$，求包含边数最多的匹配 $M$（任意两条边没有公共顶点）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">增广路定理与匈牙利算法</h3>
        <p>1. <strong>交替轨与增广轨</strong>：从未匹配点出发，非匹配边与匹配边交替出现的路径称为交替路；若终点亦为未匹配点，则为增广路。翻转增广路边状态可使匹配数直接加 1。</p>
        <p>2. <strong>DFS 递归协商协商</strong>：左部点尝试与有意愿的右部点配对；若右部点已有伴侣，则递归要求其伴侣“挪窝”寻找其他备选，形成增广链。时间复杂度 $O(V \cdot E)$。</p>
        <p>3. <strong>König 定理</strong>：二分图最大匹配数 = 最小点覆盖数 = 顶点总数 - 最大独立集。</p>
      </div>
    `,
  },

  kmMatching: {
    title: '二分图最大权完美匹配 KM 算法 (Class 176)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P6577 【模板】二分图最大权完美匹配)</h2>
        <p>在带权二分图中，求一组完美匹配使得匹配边的权值总和最大。经典 Kuhn-Munkres (KM) 算法能够在 $O(N^3)$ 内求出全局最优解。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">顶标理论与相等子图</h3>
        <p>1. <strong>顶标合法性</strong>：为左部点分配顶标 $L_x$，右部点分配顶标 $L_y$，满足对任意边均有 $L_x + L_y \ge W(x, y)$。</p>
        <p>2. <strong>相等子图</strong>：仅保留满足 $L_x + L_y = W(x, y)$ 的边构成的子图。若相等子图存在完美匹配，则该匹配必为原图的最大权完美匹配！</p>
        <p>3. <strong>松弛量与顶标微调</strong>：未找到增广路时，计算交替树内外的最小顶标差值 $\Delta = \min (L_x + L_y - W)$；树内左部点减 $\Delta$，树内右部点加 $\Delta$，引入新的相等边扩大相等子图。</p>
      </div>
    `,
  },

  chordalGraphMCS: {
    title: '弦图与完美消除序列 MCS (Class 177)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3196 [HNOI2008] 神奇的国度)</h2>
        <p>若无向图中任意长度大于等于 4 的环均存在一条不属于环的连接环上顶点的边（弦），则称该图为 <strong>弦图 (Chordal Graph)</strong>。弦图是极具代数特性的完美图类。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">最大势算法 (MCS) 与 PEO</h3>
        <p>1. <strong>完美消除序列 (PEO)</strong>：顶点的一个排列 $v_1, \dots, v_n$，使得每个点 $v_i$ 在其后继邻居中诱导出的子图为完全图（团）。图是弦图当且仅当存在 PEO。</p>
        <p>2. <strong>MCS 最大势搜索</strong>：按标号递减顺序，每次贪心选取与已标号点相邻边数最多的未标号点，打上序号并更新邻居势能，在 $O(N + M)$ 线性时间内构造消除序列。</p>
        <p>3. <strong>色数与最大团</strong>：弦图的最大团数 $\omega(G)$、色数 $\chi(G)$、团数和最大独立集均可在 PEO 序列上通过贪心在 $O(N + M)$ 线性求出！</p>
      </div>
    `,
  },

  blockCutTree: {
    title: '圆方树 (Block-Cut Tree / Class 178)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P5236 【模板】静态仙人掌 / 洛谷 P4630 铁人两项)</h2>
        <p><strong>圆方树 (Block-Cut Tree)</strong> 是处理一般无向图与仙人掌图点双连通分量 (BCC) 的最强图论工具，将复杂的环结构优雅解耦为二分树结构。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">圆方树结构构建与路径映射</h3>
        <p>1. <strong>圆点与方点</strong>：原图中的所有顶点为<strong>圆点</strong>；每个极大点双连通分量 (BCC) 抽象为一个<strong>方点</strong>。</p>
        <p>2. <strong>二分相连</strong>：方点向其所属点双连通分量内的所有圆点连边，原图的割点会同时与多个方点相连，形成一棵树状结构的无环二分图。</p>
        <p>3. <strong>简单路径必经点交集</strong>：原图中两点 $u, v$ 之间所有简单路径的点集的交集，恰好是圆方树上 $u$ 到 $v$ 路径上的所有圆点！图上所有点双问题全部降维为树上倍增 LCA 与树剖。</p>
      </div>
    `,
  },
};
