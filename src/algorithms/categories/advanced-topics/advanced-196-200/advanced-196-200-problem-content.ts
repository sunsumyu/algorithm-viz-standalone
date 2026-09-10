/**
 * 左神算法通关课 196 ~ 200 线段树优化建图、主席树优化建图、CDQ分治优化建图、基环树与仙人掌图 题目与解析
 */

export const ADVANCED_196_200_PROBLEMS = {
  segmentTreeGraph: {
    title: '线段树优化建图 (Class 196)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (CF 786B Legacy / 区间向区间连边)</h2>
        <p>在图论建模中，若需要执行<strong>点向区间 $[l, r]$ 连边</strong>或<strong>区间 $[l_1, r_1]$ 向区间 $[l_2, r_2]$ 连边</strong>，直接暴力的边数高达 $O(N^2)$。利用线段树的区间线段拆分，可以将边数压缩至 $O(M \\log N)$。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">出树 (Out-Tree) 与入树 (In-Tree) 双树架构</h3>
        <ul>
          <li>1. <strong>入树 (In-Tree)</strong>：自顶向下连边（父节点向子节点连 0 权边），用于处理“向区间连边”的操作；任何到达区间节点的信息都会自动流向该区间内的所有叶子原点。</li>
          <li>2. <strong>出树 (Out-Tree)</strong>：自底向上连边（子节点向父节点连 0 权边），用于处理“区间出发连边”的操作。</li>
          <li>3. <strong>叶子桥接</strong>：入树叶子向出树叶子连 0 权边对齐实体节点，区间向区间连边只需将出树上的 $O(\\log N)$ 个区间节点向入树上的 $O(\\log N)$ 个区间节点连边。</li>
        </ul>
      </div>
    `,
  },

  persistentSegmentTreeGraph: {
    title: '主席树与可持久化优化建图 (Class 197)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (前缀历史版本区间连边 / 洛谷 P3588 [POI2015] PUS)</h2>
        <p>普通线段树优化建图只能对静态序列的区间连边。当连边依赖<strong>时间维度</strong>或<strong>历史版本前缀</strong>（如当前点只能向前 $i-1$ 个时刻中权值在 $[l, r]$ 内的点连边）时，静态线段树无能为力。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">可持久化单点修改与版本继承</h3>
        <p>1. <strong>版本树继承</strong>：每个时刻复制根节点并动态开辟一条 $O(\\log V)$ 的链，未修改子树直接共用上一版本的指针。</p>
        <p>2. <strong>历史区间连边</strong>：当前节点直接连向对应历史版本根节点展开出的 $O(\\log V)$ 个区间节点，天然隔离未来时刻的节点，解决带有时间顺序的复杂图论依赖。</p>
      </div>
    `,
  },

  cdqGraphOptimization: {
    title: 'CDQ 分治优化建图 (Class 198)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (多维偏序动态连边 / CF 1198F)</h2>
        <p>当图中的边存在多维偏序限制（例如 $i$ 向 $j$ 连边要求 $A_i \\le A_j$ 且 $B_i \\le B_j$）时，数据结构优化建图可能需要多维高阶树套树，空间复杂度居高不下。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">分治递归与分块建边</h3>
        <p>1. <strong>左半区向右半区连边</strong>：CDQ 分治按第 1 维递归，分治跨区间只建立从左半区向右半区的有向边。</p>
        <p>2. <strong>结合前缀链中继</strong>：在右半区按第 2 维归并排序，设立前缀辅助点链，使得左区点只需连向前缀虚点，总边数控制在 $O(N \\log N)$ 以内，极大节省空间。</p>
      </div>
    `,
  },

  pseudotreeDP: {
    title: '基环树与基环树 DP (Class 199)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P1453 骑士 / 基环树最大独立集)</h2>
        <p><strong>基环树 (Pseudotree)</strong> 是包含 $N$ 个点与 $N$ 条边的连通无向图（有向图则为基环内向树/外向树），其拓扑结构为一个核心<strong>简单环</strong>，环上的每个节点挂载着若干棵互不相交的<strong>子树</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">两阶段解法：树形 DP + 环上破环成链</h3>
        <ul>
          <li>1. <strong>拓扑剥皮找环</strong>：通过拓扑排序剥除所有度数为 1 的叶子节点，剩余未被删除的节点即为环上节点。</li>
          <li>2. <strong>子树树形 DP</strong>：以环上各点作为各自外挂子树的根节点，独立运行树形 DP 计算子树贡献。</li>
          <li>3. <strong>破环成链或断边 DP</strong>：断开环上任意一条边 $(u, v)$，强制不选 $u$ 跑一遍树形 DP，再强制不选 $v$ 跑一遍，取两次最优值即为全局最优解。</li>
        </ul>
      </div>
    `,
  },

  cactusGraphDP: {
    title: '仙人掌图与仙人掌 DP (Class 200)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P4244 【模板】仙人掌直径 / BZOJ 1023)</h2>
        <p><strong>仙人掌图 (Cactus Graph)</strong> 是任意一条边至多属于一个简单环的无向连通图，是通用图与树之间最为精妙的过渡结构。左程云《算法通关课》第 200 讲压轴巨献！</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">仙人掌 DP 核心三步法</h3>
        <ul>
          <li>1. <strong>树边普通转移</strong>：在 DFS 树上遇到树枝边时，按标准树形 DP 向上汇报深度最长链。</li>
          <li>2. <strong>返祖边锁定简单环</strong>：当遇到后向返祖边时，判定发现简单环，沿父指针回溯提取整环节点序列。</li>
          <li>3. <strong>环上单调队列破环成倍增链</strong>：将长度为 $L$ 的环复制倍长为 $2L$，利用单调队列在 $O(L)$ 线性时间内求解环上两点最长距离，合并环上直径贡献后将环根向上汇报。</li>
        </ul>
      </div>
    `,
  },
};
