/**
 * 左神算法通关课 179 ~ 184 点分治、点分树、线段树分治、可撤销并查集、CDQ 分治与整体二分 题目与解析
 */

export const ADVANCED_179_184_PROBLEMS = {
  centroidDecomposition: {
    title: '点分治 (Centroid Decomposition / Class 179)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3806 【模板】点分治 1)</h2>
        <p><strong>树上点分治</strong> 是解决树上路径统计问题（如统计树上是否存在距离恰为 $K$ 的点对）的高效分治算法。通过每次选取子树<strong>重心 (Centroid)</strong> 作为分治中心，保证递归树高不超过 $O(\log N)$，整体时间复杂度为 $O(N \log N)$。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">分治三步曲与容斥技巧</h3>
        <ul>
          <li>1. <strong>寻找子树重心</strong>：通过树形 DP 找出最大子树大小不超过 $\lfloor size / 2 \rfloor$ 的重心节点 $rt$。</li>
          <li>2. <strong>统计跨重心路径</strong>：计算当前子树内各点到重心的距离 $dis[u]$。双指针或桶维护判断是否存在 $dis[u] + dis[v] = K$。</li>
          <li>3. <strong>子树容斥与分治递归</strong>：对于来自同一颗子树内的路径，其距离和不能直接跨过重心，需扣除子树内的非法重合组合，随后标记重心并向各子连通块递归。</li>
        </ul>
      </div>
    `,
  },

  dynamicCentroidTree: {
    title: '动态点分治 / 点分树 (Class 180)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P6329 【模板】点分树 / 震波)</h2>
        <p>静态点分治不支持带修改操作。<strong>动态点分治（点分树）</strong>将点分治的递归过程显式构建为一棵树高严格为 $O(\log N)$ 的重构树。通过在点分树上维护原图距离信息，实现单点修改点权、查询原图中距离点 $u$ 不超过 $K$ 的点权和。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">点分树向上容斥检索</h3>
        <p>1. <strong>树高保证</strong>：每次重心的父节点指向上一层的分治重心，点分树高度严格限制在 $O(\log N)$ 以内。</p>
        <p>2. <strong>两层动态开点数据结构</strong>：每个点维护两个动态线段树/树状数组：$T_1$ 统计自己点分树子树内各点到自己的距离贡献；$T_2$ 统计自己子树内各点到点分树父亲节点的距离贡献（用于消除子树重复贡献）。</p>
        <p>3. <strong>单次操作 $O(\log^2 N)$</strong>：从当前节点沿点分树父指针逐层上跳，每次用 $T_1(fa) - T_2(cur)$ 准确累计跨树贡献。</p>
      </div>
    `,
  },

  segmentTreeDivide: {
    title: '线段树分治 (Segment Tree Divide / Class 181)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P5787 【模板】二分图 / 线段树分治)</h2>
        <p><strong>线段树分治</strong> 用于离线解决包含<strong>存在时间区间</strong>的动态增删问题（如边的动态加入与删除、判断每个时刻图是否为二分图）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">时间轴区间覆盖与可撤销数据结构</h3>
        <p>1. <strong>时间轴线段树打标记</strong>：每条边存在时间区间为 $[L, R]$，拆分打在线段树 $O(\log T)$ 个区间节点中。</p>
        <p>2. <strong>前序遍历与下推</strong>：深搜遍历时间线段树，进入节点时将当前节点挂载的所有边加入<strong>可撤销并查集</strong>。</p>
        <p>3. <strong>回溯撤销历史状态</strong>：遍历完左右子树回溯时，撤销当前节点所做的加边操作，单次撤销仅需 $O(1)$，完美支持“只增不减”的结构离线化。</p>
      </div>
    `,
  },

  rollbackDSU: {
    title: '可撤销并查集 (Rollback DSU / Class 182)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (离线回退与历史状态快照)</h2>
        <p>标准并查集的路径压缩操作会破坏树形拓扑结构，导致历史状态无法恢复。<strong>可撤销并查集</strong> 放弃路径压缩，严格采用<strong>按秩合并 (Union by Rank)</strong>，树高严格维持在 $O(\log N)$。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">操作栈与轻量回滚</h3>
        <p>1. <strong>历史操作栈</strong>：每次合并操作记录元组 <code>(u, v, addRank)</code> 压入栈中。</p>
        <p>2. <strong>单步精确回滚</strong>：撤销时弹出栈顶，将父节点指针重置 $fa[u] = u$ 并扣减增量 $rank[v] -= addRank$，耗时 $O(1)$。</p>
        <p>3. <strong>核心支撑底座</strong>：是线段树分治、CDQ 分治处理连通性与二分图奇环检测的核心基石。</p>
      </div>
    `,
  },

  cdqDivide: {
    title: 'CDQ 分治 (CDQ Divide and Conquer / Class 183)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (陈丹琦发明 / 洛谷 P3810 【模板】三维偏序 陌上花开)</h2>
        <p><strong>CDQ 分治</strong> 是一种强大的离线分治算法，用于解决多维偏序问题（如三维偏序：求满足 $a_i \le a_j, b_i \le b_j, c_i \le c_j$ 的点对数）与将离线动态问题降维为静态前缀统计。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">双半区归并贡献计算</h3>
        <p>1. <strong>第一维快排</strong>：全局按第一维坐标 $a$ 排序，消除 $a$ 的大小约束。</p>
        <p>2. <strong>分治二分划分</strong>：递归划分 $[l, mid]$ 与 $[mid + 1, r]$，左半区所有点的 $a$ 坐标天然小于等于右半区。</p>
        <p>3. <strong>第二维归并排序与第三维树状数组</strong>：双指针归并按 $b$ 排序，左半区指针移动时将 $c$ 插入树状数组，右半区指针移动时查询树状数组前缀和，单层 $O(N \log N)$，总复杂度 $O(N \log^2 N)$。</p>
      </div>
    `,
  },

  parallelBinarySearch: {
    title: '整体二分 (Parallel Binary Search / Class 184)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (许昊然发明 / 洛谷 P3527 [POI2011] MET-Meteors)</h2>
        <p>当面对 $Q$ 个具备单调性的二分询问时，单次二分往往需要 $O(T \log V)$，总复杂度 $O(Q T \log V)$ 会超时。<strong>整体二分</strong> 将所有询问与操作集中批量分治处理，总复杂度降为 $O((Q + T) \log V)$。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">分治递归结构</h3>
        <p>1. <strong>值域区间划分 $[L, R]$</strong>：取中点 $mid = \lfloor (L + R) / 2 \rfloor$。</p>
        <p>2. <strong>批量应用中点前操作</strong>：在树状数组上执行前 $mid$ 个修改操作，批量核算当前询问集合是否已满足目标。</p>
        <p>3. <strong>分流询问序列</strong>：已满足阈值的询问划分入左侧队列递归 $[L, mid]$；未满足的扣除已有贡献后划分入右侧队列递归 $[mid + 1, R]$。</p>
      </div>
    `,
  },
};
